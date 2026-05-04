// ===== DASHBOARD =====
function renderDashboard() {
  const due = State.getDueCards().length;
  const total = State.cards.length;
  const results = State.progress.results || [];
  const correct = results.filter(r => r.correct).length;
  const accuracy = results.length ? Math.round(correct / results.length * 100) : 0;
  const xp = State.progress.xp || 0;
  document.getElementById('stat-due').textContent = due;
  document.getElementById('stat-total').textContent = total;
  document.getElementById('stat-accuracy').textContent = accuracy + '%';
  document.getElementById('stat-xp').textContent = xp;
  document.getElementById('stat-chapters').textContent = State.chapters.length;
  document.getElementById('badge-due').textContent = due;
  const actEl = document.getElementById('recent-activity');
  const recent = [...results].reverse().slice(0, 8);
  if (!recent.length) { actEl.innerHTML = '<p class="text-muted text-sm">Chưa có hoạt động nào.</p>'; return; }
  actEl.innerHTML = recent.map(r => `
    <div class="flex items-center gap-12 mt-8">
      <span style="font-size:18px">${r.correct ? '✅' : '❌'}</span>
      <div><div class="text-sm">${typeLabel(r.type)}</div><div class="text-xs text-muted">${timeAgo(r.t)}</div></div>
    </div>`).join('');
}

function typeLabel(t) {
  const map = { mc:'Trắc nghiệm', translate:'Dịch thuật', rearrange:'Sắp xếp câu',
    complete:'Hoàn thành câu', error:'Tìm lỗi sai', position:'Đặt từ đúng vị trí',
    flashcard:'Flashcard', dictation:'Nghe chép' };
  return map[t] || t;
}
function timeAgo(ts) {
  const d = (Date.now() - ts) / 1000;
  if (d < 60) return 'Vừa xong';
  if (d < 3600) return Math.floor(d / 60) + ' phút trước';
  if (d < 86400) return Math.floor(d / 3600) + ' giờ trước';
  return Math.floor(d / 86400) + ' ngày trước';
}

function populateChapterSelect() {
  const selects = [document.getElementById('add-card-chapter'), document.getElementById('bulk-chapter-select')];
  selects.forEach(sel => {
    if (!sel) return;
    sel.innerHTML = State.chapters.map(c => `<option value="${c.id}">${c.title}</option>`).join('');
  });
}

async function processBulkImport() {
  const text = document.getElementById('bulk-text').value.trim();
  const chId = document.getElementById('bulk-chapter-select').value;
  if (!text || !chId) { toast('Vui lòng nhập nội dung và chọn bài học', 'error'); return; }

  const lines = text.split('\n');
  let added = 0;
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    
    if (trimmed.includes('|')) {
      const parts = trimmed.split('|').map(x => x.trim());
      if (parts.length >= 3) {
        State.cards.push({
          id: uid(), chapterId: chId, chinese: parts[0], pinyin: parts[1], wordType: parts[4] || '', vietnamese: parts[2], example: parts[3] || '',
          ef: 2.5, interval: 1, reps: 0, nextReview: 0
        });
        added++;
        continue;
      }
    }
    
    // Tách cơ bản: Chữ Hán là phần đầu tiên, còn lại là pinyin/nghĩa
    const parts = trimmed.split(/\s+/);
    if (parts.length < 2) continue;
    
    const chinese = parts[0];
    const rest = parts.slice(1).join(' ');
    // Tìm pinyin (nếu có cụm từ tiếng Anh/Việt thì pinyin thường ở giữa)
    const pyMatch = rest.match(/([a-züāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ\s]+)/i);
    const pinyin = pyMatch ? pyMatch[1].trim() : '';
    const vietnamese = rest.replace(pinyin, '').trim() || '(chưa có nghĩa)';

    State.cards.push({
      id: uid(), chapterId: chId, chinese, pinyin, wordType: '', vietnamese, example: '',
      ef: 2.5, interval: 1, reps: 0, nextReview: 0
    });
    added++;
  }
  
  State.save();
  renderLibrary();
  renderDashboard();
  toast(`✅ Đã thêm ${added} từ vựng!`, 'success');
  document.getElementById('bulk-text').value = '';
}

async function aiFormatBulk() {
  const text = document.getElementById('bulk-text').value.trim();
  if (!text) return;
  const geminiKey = localStorage.getItem('gemini-api-key');
  if (!geminiKey) { toast('Cần Gemini API Key để dùng tính năng này', 'error'); return; }

  toast('🤖 AI đang trích xuất và dịch nghĩa...', 'info');
  try {
    const prompt = `Từ danh sách từ vựng/văn bản thô này, hãy trích xuất toàn bộ các từ vựng tiếng Trung. 
Trích xuất ra danh sách, mỗi từ vựng 1 dòng với định dạng CỰC KỲ NGHIÊM NGẶT sau:
Chữ Hán | Pinyin | Nghĩa tiếng Việt | 1 Câu ví dụ tiếng Trung (kèm nghĩa tiếng Việt)

Nếu văn bản chưa có nghĩa tiếng Việt hoặc câu ví dụ, bạn PHẢI tự động tạo ra nghĩa và ví dụ chính xác.
Chỉ trả về danh sách, tuyệt đối không giải thích gì thêm, không dùng markdown code block.

Văn bản thô:
${text}`;
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });
    const data = await res.json();
    const result = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    document.getElementById('bulk-text').value = result.replace(/```text|```/g, '').trim();
    toast('✅ Đã định dạng xong! Hãy bấm Lưu ngay.', 'success');
  } catch (e) {
    toast('Lỗi AI: ' + e.message, 'error');
  }
}

function renderLibrary() {
  // Auto-merge books with same title
  autoMergeBooksByTitle();
  
  populateChapterSelect();
  const list = document.getElementById('chapter-list');
  if (!State.books.length && !State.chapters.length) {
    list.innerHTML = '<p class="text-muted text-sm text-center mt-24">Chưa có giáo trình nào. Hãy nhập file PDF.</p>';
    return;
  }

  let html = '';

  // Nhóm các chương chưa phân loại (dữ liệu cũ)
  const legacyChapters = State.chapters.filter(ch => !ch.bookId);
  if (legacyChapters.length > 0) {
    html += `<div style="margin-bottom:24px">
      <div class="flex justify-between items-center mb-12">
        <h3 style="font-size:14px;color:var(--text-3)">Chưa phân loại</h3>
        <button class="btn btn-sm" style="background:rgba(192,57,43,0.15);color:var(--red-light);border:1px solid rgba(192,57,43,0.3)" onclick="deleteLegacyChapters()">🗑 Xóa mục này</button>
      </div>`;
    html += renderChaptersList(legacyChapters);
    html += `</div>`;
  }

  // Nhóm chương thủ công (manual)
  const manualChapters = State.chapters.filter(ch => ch.bookId === 'manual');
  if (manualChapters.length > 0) {
    const manualCards = State.cards.filter(c => manualChapters.find(ch => ch.id === c.chapterId));
    html += `
    <div style="background:var(--bg-2);border:1px solid var(--border);border-radius:12px;margin-bottom:16px;overflow:hidden">
      <div style="padding:16px;background:rgba(46,204,113,0.05);cursor:pointer;display:flex;justify-content:space-between;align-items:center">
        <div class="flex gap-12 items-center" style="flex:1">
          <span style="font-size:24px">📝</span>
          <div>
            <div style="font-weight:600;font-size:15px;color:var(--green)">Chương Thủ Công</div>
            <div class="text-xs text-muted mt-4">${manualChapters.length} chương · ${manualCards.length} từ mới</div>
          </div>
        </div>
      </div>
      <div style="padding:16px;background:var(--bg-1)">
        ${manualChapters.length ? renderChaptersList(manualChapters) : '<p class="text-muted text-xs text-center">Chưa có chương nào</p>'}
      </div>
    </div>`;
  }

  // Nhóm theo từng Giáo trình (Book)
  State.books.forEach((book, idx) => {
    const bookChapters = State.chapters.filter(ch => ch.bookId === book.id);
    const bookCards = State.cards.filter(c => bookChapters.find(ch => ch.id === c.chapterId));
    
    // Mặc định mở sách đầu tiên, các sách khác đóng
    const isOpen = idx === 0;
    
    html += `
    <div id="book-item-${book.id}" class="book-item" draggable="true" style="background:var(--bg-2);border:1px solid var(--border);border-radius:12px;margin-bottom:16px;overflow:hidden;cursor:grab;transition:all 0.2s" ondragstart="initBookDragStart(event, '${book.id}')" ondragend="resetBookDrag()" ondragover="handleBookDragOver(event, '${book.id}')" ondragleave="handleBookDragLeave(event, '${book.id}')" ondrop="handleBookDrop(event, '${book.id}')">
      <div style="padding:16px;background:rgba(240,180,41,0.05);cursor:pointer;display:flex;justify-content:space-between;align-items:center">
        <div class="flex gap-12 items-center" onclick="toggleBook('${book.id}')" style="flex:1">
          <span style="font-size:24px;filter:grayscale(1)">📕</span>
          <div>
            <div style="font-weight:600;font-size:15px;color:var(--gold)" id="book-title-${book.id}">${book.title}</div>
            <div class="text-xs text-muted mt-4">${bookChapters.length} chương · ${bookCards.length} từ mới</div>
          </div>
        </div>
        <div class="flex items-center gap-12">
          <button class="btn btn-sm btn-ghost" onclick="editBookName('${book.id}', event)" style="padding:4px 8px;border:none;color:var(--blue)" title="Chỉnh sửa tên">✏️</button>
          <button class="btn btn-sm btn-ghost" onclick="openMergeBookModal('${book.id}')" style="padding:4px 8px;border:none;color:var(--gold)" title="Gộp giáo trình">🔗</button>
          <button class="btn btn-sm btn-ghost" onclick="deleteBook('${book.id}', event)" style="padding:4px 8px;border:none;color:var(--red-light)" title="Xóa giáo trình">🗑️</button>
          <span id="book-icon-${book.id}" onclick="toggleBook('${book.id}')" style="color:var(--text-3);font-size:12px;padding:4px">${isOpen ? '▲' : '▼'}</span>
        </div>
      </div>
      <div id="book-chapters-${book.id}" style="display:${isOpen ? 'block' : 'none'};padding:16px;background:var(--bg-1)">
        ${bookChapters.length ? renderChaptersList(bookChapters) : '<p class="text-muted text-xs text-center">Chưa có chương nào</p>'}
      </div>
    </div>`;
  });

  list.innerHTML = html;
  
  // Refresh flashcard dropdown to show all chapters
  if (typeof refreshDeckSelect === 'function') {
    refreshDeckSelect();
  }
}

function renderChaptersList(chapters) {
  const sorted = [...chapters].sort((a, b) => (a.num || 0) - (b.num || 0));
  const html = sorted.map((ch, i) => {
    const cards = State.cards.filter(c => c.chapterId === ch.id);
    const isChecked = selectedChapterIds.has(ch.id);
    
    return `<div class="chapter-item ${ch.studied ? 'done' : ''} ${isMergeMode ? 'merge-mode' : ''}" 
                 id="chapter-${ch.id}" 
                 data-chapter-id="${ch.id}"
                 style="margin-bottom:8px">
      ${isMergeMode ? `<input type="checkbox" style="width:20px;height:20px;margin-right:12px" ${isChecked ? 'checked' : ''} onchange="toggleChapterSelection('${ch.id}')">` : ''}
      <div class="ch-num ${ch.studied ? 'done' : ''}" onclick="!isMergeMode && openChapter('${ch.id}')">${ch.num || i + 1}</div>
      <div style="flex:1" onclick="!isMergeMode && openChapter('${ch.id}')">
        <div class="flex items-center gap-8">
          <div style="font-weight:600;font-size:14px">${ch.title}</div>
          ${!isMergeMode ? `<button onclick="event.stopPropagation();renameChapter('${ch.id}')" class="btn-ghost" style="border:none;padding:2px;font-size:10px;cursor:pointer">✏️</button>` : ''}
        </div>
        <div class="text-xs text-muted mt-4">${ch.pages || 0} trang · ${cards.length} từ mới</div>
      </div>
      <div style="display:flex;gap:8px;align-items:center">
        ${!isMergeMode ? (ch.studied ? '<span class="badge badge-green" style="font-size:10px">✓ Đã học</span>' : '<span class="badge badge-red" style="font-size:10px">Chưa học</span>') : ''}
        ${!isMergeMode ? `<button onclick="event.stopPropagation();deleteChapterQuick('${ch.id}')" class="btn-ghost" style="border:none;padding:4px 8px;font-size:12px;cursor:pointer;color:var(--red-light);hover:background:rgba(192,57,43,0.1)" title="Xóa chương">🗑️</button>` : ''}
      </div>
    </div>`;
  }).join('');
  
  // Initialize drag & drop after rendering
  setTimeout(() => {
    sorted.forEach(ch => {
      const element = document.getElementById(`chapter-${ch.id}`);
      if (element && !isMergeMode) {
        initChapterDragDrop(ch.id, element);
      }
    });
  }, 100);
  
  return html;
}


let isMergeMode = false;
let selectedChapterIds = new Set();

function toggleMergeMode() {
  isMergeMode = !isMergeMode;
  selectedChapterIds.clear();
  document.getElementById('merge-toolbar').style.display = isMergeMode ? 'flex' : 'none';
  document.getElementById('merge-count').textContent = '0';
  renderLibrary();
}

function toggleChapterSelection(id) {
  if (selectedChapterIds.has(id)) selectedChapterIds.delete(id);
  else selectedChapterIds.add(id);
  document.getElementById('merge-count').textContent = selectedChapterIds.size;
}

function executeMerge() {
  const ids = Array.from(selectedChapterIds);
  if (ids.length < 2) { toast('Vui lòng chọn ít nhất 2 bài để gộp', 'error'); return; }
  
  const targetId = ids[0];
  const targetCh = State.chapters.find(c => c.id === targetId);
  const otherIds = ids.slice(1);
  
  if (!confirm(`Bạn muốn gộp ${ids.length} bài này vào bài "${targetCh.title}"?`)) return;
  
  otherIds.forEach(id => {
    // Chuyển toàn bộ card sang bài đích
    State.cards.forEach(c => { if (c.chapterId === id) c.chapterId = targetId; });
    // Xóa bài cũ
    State.chapters = State.chapters.filter(c => c.id !== id);
  });
  
  State.save();
  toggleMergeMode();
  renderLibrary();
  renderDashboard();
  toast('✅ Đã hợp nhất các bài thành công!', 'success');
}

function renameChapter(id) {
  const ch = State.chapters.find(c => c.id === id);
  if (!ch) return;
  const newName = prompt('Nhập tên mới cho bài học:', ch.title);
  if (newName && newName.trim() !== '') {
    ch.title = newName.trim();
    State.save();
    renderLibrary();
    toast('Đã đổi tên bài học', 'success');
  }
}

function openChapter(id) {
  const ch = State.chapters.find(c => c.id === id);
  if (!ch) return;
  const cards = State.cards.filter(c => c.chapterId === id);
  document.getElementById('modal-ch-title').textContent = ch.title;
  
  // Create search and filter UI
  const searchHTML = `
    <div style="margin-bottom:16px;display:flex;gap:8px;flex-wrap:wrap">
      <input type="text" id="vocab-search" placeholder="🔍 Tìm: Hán, Pinyin, Việt, ví dụ..." 
             style="flex:1;min-width:200px;padding:8px;background:var(--bg-1);border:1px solid var(--border);border-radius:6px;color:var(--text-1)"
             onkeyup="filterVocabulary('${id}')">
      <select id="vocab-filter" style="padding:8px;background:var(--bg-1);border:1px solid var(--border);border-radius:6px;color:var(--text-1)"
              onchange="filterVocabulary('${id}')">
        <option value="">📋 Tất cả</option>
        <option value="pinyin">🔤 Pinyin</option>
        <option value="vietnamese">🇻🇳 Hán Việt</option>
        <option value="example">📖 Ví dụ</option>
      </select>
    </div>
  `;
  
  document.getElementById('modal-ch-body').innerHTML = `
    <div class="flex gap-8 mb-16" style="flex-wrap:wrap">
      <span class="badge badge-blue">${ch.pages || 0} trang</span>
      <span class="badge badge-gold">${cards.length} từ mới</span>
    </div>
    <div class="flex justify-between items-center mb-8">
       <h4 style="font-size:14px;color:var(--text-2)">生词 — Từ mới</h4>
       <button class="btn btn-ghost btn-sm" onclick="renameChapter('${id}');closeModal('modal-chapter');openChapter('${id}')">✏️ Sửa tên bài</button>
    </div>
    ${searchHTML}
    <div style="max-height:320px;overflow-y:auto" id="vocab-list">
      ${renderVocabularyList(cards)}
    </div>
    <div class="flex gap-8 mt-16" style="flex-wrap:wrap">
      <button class="btn btn-primary" onclick="studyChapter('${id}');closeModal('modal-chapter')">🃏 Học flashcard</button>
      <button class="btn btn-secondary" onclick="generateExercisesWithAI('${id}')">🎁 Tạo bài tập AI</button>
      <button class="btn btn-sm" style="background:rgba(240,180,41,0.15);color:var(--gold);border:1px solid rgba(240,180,41,0.3)" onclick="reExtractVocab('${id}')">🔄 Quét lại từ</button>
      <button class="btn btn-sm" style="background:rgba(52,152,219,0.15);color:var(--blue);border:1px solid rgba(52,152,219,0.3)" onclick="showExportModal('${id}')">📤 Xuất từ vựng</button>
      <button class="btn btn-sm" style="background:rgba(192,57,43,0.15);color:var(--red-light);border:1px solid rgba(192,57,43,0.3)" onclick="aiFixChapter('${id}')">🤖 AI Sửa</button>
      <button class="btn btn-sm btn-ghost" style="color:var(--red);border-color:var(--border)" onclick="deleteChapter('${id}')">🗑 Xóa</button>
      <button class="btn btn-secondary" style="margin-left:auto" onclick="closeModal('modal-chapter')">Đóng</button>
    </div>`;
  openModal('modal-chapter');
}

/**
 * Render vocabulary list with all details
 */
function renderVocabularyList(cards) {
  if (!cards.length) {
    return '<p class="text-muted text-sm">Không tìm thấy phần 生词 trong chương này.</p>';
  }
  
  return cards.map(c => `
    <div class="vocab-item" data-chinese="${c.chinese}" data-pinyin="${c.pinyin || ''}" data-vietnamese="${c.vietnamese || ''}" data-example="${c.example || ''}" style="padding:12px;border-bottom:1px solid var(--border);margin-bottom:8px">
      <div class="flex items-start gap-12">
        <span class="chinese" style="font-size:22px;min-width:64px;font-weight:600;flex-shrink:0">${c.chinese}</span>
        <div style="flex:1">
          <div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:6px;align-items:center">
            <span style="color:var(--gold);font-size:13px;font-weight:500">${c.pinyin && c.pinyin !== '—' ? c.pinyin : '—'}</span>
            ${c.wordType && c.wordType !== '—' ? `<span style="color:var(--blue);font-size:12px;background:rgba(52,152,219,0.15);padding:2px 6px;border-radius:3px;font-weight:500">${c.wordType}</span>` : ''}
            <span style="color:var(--text-2);font-size:13px">${c.vietnamese || '(chưa dịch)'}</span>
          </div>
          ${c.example && c.example.trim() ? `<div style="font-size:12px;color:var(--text-3);margin-top:8px;padding:8px;background:rgba(255,255,255,0.05);border-radius:4px;border-left:2px solid var(--gold)">📖 <span class="chinese" style="color:var(--gold)">${c.example}</span></div>` : ''}
        </div>
        <div style="display:flex;gap:6px;margin-left:auto;flex-shrink:0">
          <button onclick="editCard('${c.id}')" style="background:none;border:none;color:var(--text-3);cursor:pointer;font-size:14px;padding:4px 6px;border-radius:4px;transition:all 0.2s" onmouseover="this.style.background='rgba(255,165,0,0.2)'" onmouseout="this.style.background='none'">✏️</button>
          <button onclick="deleteCard('${c.id}', event)" style="background:none;border:none;color:var(--red-light);cursor:pointer;font-size:14px;padding:4px 6px;border-radius:4px;transition:all 0.2s" onmouseover="this.style.background='rgba(192,57,43,0.2)'" onmouseout="this.style.background='none'">🗑️</button>
        </div>
      </div>
    </div>`).join('');
}

/**
 * Filter vocabulary by search term and filter type
 */
function filterVocabulary(chapterId) {
  const searchTerm = document.getElementById('vocab-search').value.toLowerCase();
  const filterType = document.getElementById('vocab-filter').value;
  const vocabList = document.getElementById('vocab-list');
  
  if (!vocabList) return;
  
  const items = vocabList.querySelectorAll('.vocab-item');
  let visibleCount = 0;
  
  items.forEach(item => {
    const chinese = item.getAttribute('data-chinese').toLowerCase();
    const pinyin = item.getAttribute('data-pinyin').toLowerCase();
    const vietnamese = item.getAttribute('data-vietnamese').toLowerCase();
    const example = item.getAttribute('data-example').toLowerCase();
    
    let matches = false;
    
    if (!searchTerm) {
      // No search term - show all
      matches = true;
    } else if (filterType === 'pinyin') {
      // Filter by pinyin only
      matches = pinyin.includes(searchTerm);
    } else if (filterType === 'vietnamese') {
      // Filter by Vietnamese only
      matches = vietnamese.includes(searchTerm);
    } else if (filterType === 'example') {
      // Filter by example only
      matches = example.includes(searchTerm);
    } else {
      // Search all fields
      matches = chinese.includes(searchTerm) || 
                pinyin.includes(searchTerm) || 
                vietnamese.includes(searchTerm) || 
                example.includes(searchTerm);
    }
    
    if (matches) {
      item.style.display = 'block';
      visibleCount++;
    } else {
      item.style.display = 'none';
    }
  });
  
  // Show "no results" message if needed
  if (visibleCount === 0 && searchTerm) {
    vocabList.innerHTML += `<p class="text-muted text-sm text-center" style="padding:16px">Không tìm thấy kết quả cho: "${searchTerm}"</p>`;
  }
}

function editCard(id) {
  const c = State.cards.find(x => x.id === id);
  if (!c) return;
  
  // Create a modal for editing
  const modal = document.createElement('div');
  modal.className = 'modal open';
  modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:1000;overflow-y:auto';
  
  modal.innerHTML = `
    <div style="background:var(--bg-1);border:1px solid var(--border);border-radius:12px;padding:24px;max-width:500px;width:90%;margin:20px auto">
      <h3 style="margin-bottom:16px">Chỉnh sửa từ vựng</h3>
      <div style="display:flex;flex-direction:column;gap:12px">
        <div>
          <label style="display:block;font-size:12px;color:var(--text-3);margin-bottom:4px">Tiếng Trung</label>
          <input type="text" id="edit-chinese" value="${c.chinese}" style="width:100%;padding:8px;border:1px solid var(--border);border-radius:6px;background:var(--bg-2);color:var(--text-1)" disabled>
        </div>
        <div>
          <label style="display:block;font-size:12px;color:var(--text-3);margin-bottom:4px">Pinyin</label>
          <input type="text" id="edit-pinyin" value="${c.pinyin || ''}" style="width:100%;padding:8px;border:1px solid var(--border);border-radius:6px;background:var(--bg-2);color:var(--text-1)">
        </div>
        <div>
          <label style="display:block;font-size:12px;color:var(--text-3);margin-bottom:4px">Loại từ</label>
          <input type="text" id="edit-wordtype" value="${c.wordType || ''}" placeholder="e.g. 动, 名, 形, 副" style="width:100%;padding:8px;border:1px solid var(--border);border-radius:6px;background:var(--bg-2);color:var(--text-1)">
        </div>
        <div>
          <label style="display:block;font-size:12px;color:var(--text-3);margin-bottom:4px">Nghĩa tiếng Việt</label>
          <input type="text" id="edit-vietnamese" value="${c.vietnamese || ''}" style="width:100%;padding:8px;border:1px solid var(--border);border-radius:6px;background:var(--bg-2);color:var(--text-1)">
        </div>
        <div>
          <label style="display:block;font-size:12px;color:var(--text-3);margin-bottom:4px">Ví dụ</label>
          <textarea id="edit-example" style="width:100%;padding:8px;border:1px solid var(--border);border-radius:6px;background:var(--bg-2);color:var(--text-1);resize:vertical;min-height:60px">${c.example || ''}</textarea>
        </div>
        
        <!-- AI Analysis Section -->
        <div style="border-top:1px solid var(--border);padding-top:12px;margin-top:12px">
          <label style="display:block;font-size:12px;color:var(--text-3);margin-bottom:8px">🤖 Nhờ AI kiểm tra câu ví dụ</label>
          <div id="edit-ai-feedback" style="display:none;padding:12px;background:rgba(52,152,219,0.1);border-radius:6px;border-left:3px solid var(--blue);margin-bottom:12px;font-size:13px;color:var(--text-2);max-height:200px;overflow-y:auto"></div>
          <button class="btn btn-secondary btn-sm" style="width:100%;margin-bottom:8px" onclick="checkExampleSentence('${id}', document.getElementById('edit-example').value)">🤖 Phân tích câu ví dụ</button>
        </div>
        
        <div style="display:flex;gap:8px;margin-top:12px">
          <button class="btn btn-primary" style="flex:1" onclick="
            const card = State.cards.find(x => x.id === '${id}');
            if (card) {
              card.pinyin = document.getElementById('edit-pinyin').value;
              card.wordType = document.getElementById('edit-wordtype').value;
              card.vietnamese = document.getElementById('edit-vietnamese').value;
              card.example = document.getElementById('edit-example').value;
              State.save();
              openChapter(card.chapterId);
              toast('✅ Đã cập nhật!', 'success');
            }
            this.closest('.modal').remove();
          ">Lưu</button>
          <button class="btn btn-secondary" style="flex:1" onclick="this.closest('.modal').remove()">Hủy</button>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });
}

// ── Xóa từ vựng thủ công ──
function deleteCard(id, event) {
  event.stopPropagation();
  const c = State.cards.find(x => x.id === id);
  if (!c) return;
  
  if (confirm(`Xóa từ "${c.chinese}" (${c.vietnamese})?\n\nHành động này không thể hoàn tác.`)) {
    State.cards = State.cards.filter(x => x.id !== id);
    State.save();
    openChapter(c.chapterId);
    toast(`✅ Đã xóa từ "${c.chinese}"!`, 'success');
  }
}

function deleteChapter(id) {
  if (!confirm('Bạn có chắc chắn muốn xóa chương này và tất cả thẻ Flashcard của nó không?')) return;
  State.chapters = State.chapters.filter(c => c.id !== id);
  State.cards = State.cards.filter(c => c.chapterId !== id);
  State.save();
  closeModal('modal-chapter');
  renderLibrary();
  renderDashboard();
  toast('Đã xóa chương', 'info');
}

async function reExtractVocab(id) {
  const ch = State.chapters.find(c => c.id === id);
  if (!ch || !ch.rawText) {
    toast('Chương này không có dữ liệu gốc để quét lại.', 'error');
    return;
  }
  
  const rawWords = extractNewWordsSection(ch.rawText);
  if (rawWords.length === 0) {
    toast('Không tìm thấy từ mới nào trong văn bản của chương này.', 'info');
    return;
  }
  
  toast(`Đang dịch ${rawWords.length} từ mới...`, 'info');
  const translated = await translateWords(rawWords, (msg) => console.log(msg));
  
  // Ghi đè thẻ cũ
  State.cards = State.cards.filter(c => c.chapterId !== id);
  translated.forEach(v => State.cards.push({
    id: uid(), chapterId: id, ...v,
    ef: 2.5, interval: 1, reps: 0, nextReview: 0
  }));
  
  State.save();
  openChapter(id);
  renderLibrary();
  renderDashboard();
  toast(`✅ Đã cập nhật ${translated.length} từ mới!`, 'success');
}

function studyChapter(id) {
  const ch = State.chapters.find(c => c.id === id);
  if (ch) { ch.studied = true; State.save(); }
  window.filterChapterId = id;  // Use window to ensure it's global
  navigate('flashcards');
}

// ===== OCR / PDF IMPORT =====
// OPTIMIZATIONS:
// 1. Tự động phát hiện trang Mục lục (目录) → tách chương theo số trang chính xác
// 2. Fallback: scan 第X课 trong toàn bộ text nếu không có mục lục
// 3. Native text-layer → bỏ qua OCR nếu PDF có sẵn text
// 4. 3 Tesseract workers song song, scale 1.5, chi_sim only

async function handlePDFUpload(file) {
  if (!file || !file.name.endsWith('.pdf')) { toast('Vui lòng chọn file PDF', 'error', '❌'); return; }
  const statusEl = document.getElementById('ocr-status');
  const logEl   = document.getElementById('ocr-log');
  const progressEl = document.getElementById('ocr-progress-fill');
  statusEl.classList.add('visible');
  logEl.innerHTML = '';

  const log = msg => { logEl.innerHTML += msg + '<br>'; logEl.scrollTop = logEl.scrollHeight; };
  const setProgress = pct => { progressEl.style.width = Math.min(100, Math.round(pct)) + '%'; };

  log('📄 Đang tải file PDF...');
  const pdfjsLib = window['pdfjs-dist/build/pdf'];
  if (!pdfjsLib) { toast('Thư viện PDF chưa tải', 'error'); return; }
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

  try {
    const ab = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: ab }).promise;
    const numPages = pdf.numPages;
    log(`✅ PDF có ${numPages} trang.`);

    const bookTitle = prompt('Nhập tên Giáo trình:', file.name.replace('.pdf', '')) || file.name;
    const bookId = uid();
    State.books.push({ id: bookId, title: bookTitle, numPages });

    const autoScanText = document.getElementById('auto-scan-list').value.trim();
    const autoScanTasks = [];
    if (autoScanText) {
      for (const line of autoScanText.split('\n')) {
        const m = line.match(/(.*?)\s*[:：]\s*(?:[Tt]rang\s*)?(\d+)\s*-\s*(\d+)/i);
        if (m) autoScanTasks.push({ title: m[1].trim(), start: parseInt(m[2]), end: parseInt(m[3]) });
      }
    }

    let startP, endP;
    if (autoScanTasks.length > 0) {
      startP = Math.min(...autoScanTasks.map(t => t.start));
      endP = Math.max(...autoScanTasks.map(t => t.end));
      log(`🤖 Nhận lệnh tự động: quét ${autoScanTasks.length} bài (Trang ${startP}-${endP})`);
    } else {
      const pageRangeStr = prompt(`PDF có ${numPages} trang.\nNếu bạn CHỈ muốn quét một vài trang cụ thể (ví dụ: "15-30"), hãy nhập vào đây.\nĐể trống nếu muốn quét toàn bộ sách:`);
      const rangeMatch = pageRangeStr ? pageRangeStr.match(/(\d+)\s*-\s*(\d+)/) : null;
      startP = rangeMatch ? Math.max(1, parseInt(rangeMatch[1])) : 1;
      endP = rangeMatch ? Math.min(numPages, parseInt(rangeMatch[2])) : numPages;
    }
    const processPagesCount = endP - startP + 1;

    // ══ Bước 1: Thu thập text layer ══
    log(`⚡ Kiểm tra text layer từ trang ${startP} đến ${endP}...`);
    let pageTexts = new Array(numPages).fill('');
    let hasNativeText = false;

    for (let i = startP; i <= endP; i++) {
      const page = await pdf.getPage(i);
      try {
        const c = await page.getTextContent();
        const t = c.items.map(s => s.str).join(' ');
        pageTexts[i - 1] = t;
        if (t.replace(/\s/g, '').length > 30) hasNativeText = true;
      } catch {}
      setProgress(((i - startP + 1) / processPagesCount) * 20);
    }

    if (!hasNativeText) {
      const geminiKey = localStorage.getItem('gemini-api-key');
      // ══ Bước 2: OCR ══
      log('🖼 PDF dạng ảnh → Đang chuẩn bị dữ liệu quét...');
      const canvas = document.createElement('canvas');
      const ctx2d  = canvas.getContext('2d');
      const imgs   = [];
      for (let i = startP; i <= endP; i++) {
        const page = await pdf.getPage(i);
        const vp = page.getViewport({ scale: 1.2 });
        canvas.width = vp.width; canvas.height = vp.height;
        await page.render({ canvasContext: ctx2d, viewport: vp }).promise;
        imgs.push({ pageIdx: i - 1, b64: canvas.toDataURL('image/jpeg', 0.7).split(',')[1] });
        setProgress(20 + ((i - startP + 1) / processPagesCount) * 10);
      }
      
      let usedLocalOcr = false;
      try {
        const check = await fetch(`${window.API_BASE_URL}/docs`, { method: 'HEAD' }).catch(()=>null);
        if (check && check.ok) {
          usedLocalOcr = true;
          log('✅ Đã kết nối Local PaddleOCR! Đang quét siêu tốc...');
        }
      } catch (e) {}

      if (usedLocalOcr) {
        for (let i = 0; i < imgs.length; i++) {
          const { pageIdx, b64 } = imgs[i];
          log(`Quét trang ${pageIdx + 1}/${numPages} (Local)...`);
          const blob = await (await fetch(`data:image/jpeg;base64,${b64}`)).blob();
          const fd = new FormData(); fd.append('file', blob, 'page.jpg');
          const res = await fetch(`${window.API_BASE_URL}/ocr`, { method: 'POST', body: fd });
          if (res.ok) { const data = await res.json(); pageTexts[pageIdx] = data.text || ''; }
          setProgress(30 + ((i + 1) / imgs.length) * 35);
        }
      } else if (geminiKey) {
        const BATCH_SIZE = 5; 
        log(`🚀 Gửi lên Gemini Vision (Nhóm ${BATCH_SIZE} trang)...`);
        for (let i = 0; i < imgs.length; i += BATCH_SIZE) {
          const chunk = imgs.slice(i, i + BATCH_SIZE);
          const parts = [{ text: "Trích xuất văn bản Trung-Việt. Phân tách bằng '---PAGE_BREAK---'." }];
          chunk.forEach(img => parts.push({ inlineData: { mimeType: "image/jpeg", data: img.b64 } }));
          const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts }], generationConfig: { temperature: 0.1 } })
          });
          if (res.ok) {
            const data = await res.json();
            const extracted = (data.candidates?.[0]?.content?.parts?.[0]?.text || '').split(/---PAGE_BREAK---/i);
            chunk.forEach((img, idx) => { pageTexts[img.pageIdx] = extracted[idx] || ''; });
          }
          setProgress(30 + ((i + BATCH_SIZE) / imgs.length) * 35);
          if (i + BATCH_SIZE < imgs.length) await new Promise(r => setTimeout(r, 12500));
        }
      } else {
        toast('Vui lòng bật Local Server hoặc nhập Gemini API Key!', 'error');
        statusEl.classList.remove('visible'); return;
      }
      setProgress(65);
    }

    // ══ Bước 3: Phân chia chương ══
    let chapters;
    if (autoScanTasks.length > 0) {
      log(`✅ Tách thành ${autoScanTasks.length} bài theo lệnh tự động.`);
      chapters = autoScanTasks.map(t => ({
        num: parseCNNum(t.title.match(/\d+/)?.[0] || '0'),
        title: t.title,
        text: pageTexts.slice(t.start - 1, t.end).join('\n'),
        startPage: t.start, endPage: t.end
      }));
    } else {
      const tocEntries = parseTOC(pageTexts);
      if (tocEntries.length >= 2) {
        log(`✅ Tách theo mục lục tìm thấy.`);
        chapters = splitByTOC(pageTexts, tocEntries);
      } else {
        log('⚠️ Fallback: Quét tiêu đề chương...');
        chapters = splitByChapterHeader(pageTexts);
      }
    }
    log(`📚 Tổng: ${chapters.length} chương.`);

    // ══ Bước 4: Trích 生词 + Dịch ══
    let totalWords = 0;
    for (let ci = 0; ci < chapters.length; ci++) {
      const ch = chapters[ci];
      const rawWords = extractNewWordsSection(ch.text);
      log(`• ${ch.title} (trang ${ch.startPage}–${ch.endPage}): ${rawWords.length} từ mới`);

      let translated = rawWords;
      if (rawWords.length > 0) {
        log(`  🌐 Dịch ${rawWords.length} từ...`);
        translated = await translateWords(rawWords, log);
      }

      const chId = uid();
      State.chapters.push({
        id: chId, bookId: bookId, title: ch.title, num: ch.num,
        pages: ch.endPage - ch.startPage + 1,
        startPage: ch.startPage, endPage: ch.endPage,
        rawText: ch.text, // Lưu toàn bộ text (không giới hạn)
        studied: false
      });
      translated.forEach(v => State.cards.push({
        id: uid(), chapterId: chId, ...v,
        ef: 2.5, interval: 1, reps: 0, nextReview: 0
      }));
      totalWords += translated.length;
      setProgress(65 + ((ci + 1) / chapters.length) * 33);
    }

    State.save();
    setProgress(100);
    toast(`✅ Xong: ${chapters.length} chương · ${totalWords} từ mới!`, 'success', '🎉');
    renderLibrary();
    renderDashboard();
    document.getElementById('ch-count-badge').textContent = State.chapters.length + ' chương';
    
    // Cập nhật flashcard deck selector
    if (typeof refreshDeckSelect === 'function') {
      refreshDeckSelect();
    }
    
    setTimeout(() => statusEl.classList.remove('visible'), 4000);

  } catch (e) {
    log('❌ Lỗi: ' + e.message);
    toast('Lỗi: ' + e.message, 'error');
  }
}

// ══════════════════════════════════════════════════
//  CHAPTER DETECTION STRATEGIES
// ══════════════════════════════════════════════════

// ── Bảng số Hán ──
const CN_NUMS = {
  '零':0,'一':1,'二':2,'三':3,'四':4,'五':5,'六':6,'七':7,'八':8,'九':9,
  '十':10,'十一':11,'十二':12,'十三':13,'十四':14,'十五':15,'十六':16,
  '十七':17,'十八':18,'十九':19,'二十':20,'二十一':21,'二十二':22,
  '二十三':23,'二十四':24,'二十五':25,'二十六':26,'二十七':27,'二十八':28,
  '二十九':29,'三十':30,'三十一':31,'三十二':32,'三十五':35,'四十':40
};
function parseCNNum(s) {
  s = (s || '').trim();
  return CN_NUMS[s] !== undefined ? CN_NUMS[s] : (parseInt(s) || 0);
}

// ── STRATEGY A: Parse Mục lục (目录) → [{num, title, pageNum}] ──
function parseTOC(pageTexts) {
  const SCAN = Math.min(25, pageTexts.length);
  let tocStart = -1;
  for (let i = 0; i < SCAN; i++) {
    if (/目\s*录|CONTENTS|Table\s+of\s+Contents/i.test(pageTexts[i])) { tocStart = i; break; }
  }
  if (tocStart === -1) return [];

  const tocText = pageTexts.slice(tocStart, tocStart + 5).join('\n');
  const entries = [];
  const seen = new Set();

  for (const line of tocText.split('\n')) {
    // Bắt lỏng hơn: có thể có khoảng trắng giữa 第 và 课, hoặc chỉ có [số] 课
    const m = line.match(/(?:第\s*)?([一二三四五六七八九十百千\d]+)\s*[课課章](.{0,50}?)[\s·.\u2026_]*\s*(\d{1,4})\s*$/);
    if (!m) continue;
    const num = parseCNNum(m[1]);
    const pageNum = parseInt(m[3]);
    if (!num || !pageNum || pageNum > 9999 || seen.has(num)) continue;
    seen.add(num);
    const sub = m[2].replace(/[.\s·\u2026_]+/g, '').trim();
    entries.push({ num, title: sub ? `Chương ${num}: ${sub}` : `Chương ${num}`, pageNum });
  }
  entries.sort((a, b) => a.num - b.num);
  return entries;
}

// ── Tách pageTexts theo số trang từ TOC ──
function splitByTOC(pageTexts, tocEntries) {
  return tocEntries.map((entry, i) => {
    const s = Math.max(0, entry.pageNum - 1);
    const e = i + 1 < tocEntries.length
      ? Math.max(s + 1, tocEntries[i + 1].pageNum - 1)
      : pageTexts.length;
    return {
      num: entry.num, title: entry.title,
      text: pageTexts.slice(s, e).join('\n'),
      startPage: entry.pageNum, endPage: e
    };
  });
}

function splitByChapterHeader(pageTexts) {
  const headers = [];
  const seen = new Set();
  pageTexts.forEach((text, idx) => {
    const lines = text.split(/[\n\r]+/);
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.length > 60) continue; // Bỏ qua câu văn dài
      // Chỉ bắt các dòng BẮT ĐẦU bằng "第 X 课" hoặc "Lesson X"
      const m = trimmed.match(/^(?:第\s*|Lesson\s*)?([一二三四五六七八九十百千\d]+)\s*[课課章]/i);
      if (m) {
        const num = parseCNNum(m[1]);
        if (!num || seen.has(num) || num > 100) continue;
        seen.add(num);
        // Trích xuất luôn tựa đề nếu có trên cùng dòng
        const titleText = trimmed.replace(m[0], '').trim();
        headers.push({ pageIdx: idx, num, title: titleText ? `Chương ${num}: ${titleText}` : `Chương ${num}` });
      }
    }
  });
  headers.sort((a, b) => a.num - b.num);
  if (!headers.length) {
    return [{ num: 1, title: 'Chương 1', text: pageTexts.join('\n'), startPage: 1, endPage: pageTexts.length }];
  }
  return headers.map((h, i) => {
    const s = h.pageIdx;
    const e = i + 1 < headers.length ? headers[i + 1].pageIdx : pageTexts.length;
    return { num: h.num, title: h.title, text: pageTexts.slice(s, e).join('\n'), startPage: s + 1, endPage: e };
  });
}

// ── Trích từ mới từ phần 生词 ──
function extractNewWordsSection(chapterText) {
  const words = [];
  const seen = new Set();

  // Tìm marker 生词 (kể cả OCR nhận sai khoảng trắng)
  const startIdx = chapterText.search(/生\s*词|生\s*詞|NEW\s*WORDS/i);
  if (startIdx === -1) return [];

  const afterMarker = chapterText.slice(startIdx + 2);

  // Dừng tại section tiếp theo
  const stopIdx = afterMarker.search(/课\s*文|语\s*法|注\s*释|练\s*习|Reading|Grammar|Exercises?|第[一二三四五六七八九十\d]+课/i);
  const vocabSection = (stopIdx > 10 ? afterMarker.slice(0, stopIdx) : afterMarker).slice(0, 3000);

  for (const line of vocabSection.split(/[\n\r]+/)) {
    const trimmed = line.trim();
    // Bắt đầu bằng số (tùy chọn) + chữ Hán (có thể kèm chữ '儿' hoặc '(儿)')
    const m = trimmed.match(/^(?:\d+[\.\s_]*)?([一-龯]+(?:[\(（]儿[\)）]|儿)?)/);
    if (!m || trimmed.length > 60 || m[1].length > 8) continue;
    
    // Bỏ qua nếu là tiêu đề
    if (/课\s*文|注\s*释|练\s*习/.test(m[1])) continue;

    const word = m[1].replace(/\s/g, '');
    if (seen.has(word)) continue;
    seen.add(word);
    
    // Pinyin thường nằm ngay sau chữ Hán
    // Cắt bỏ phần chữ Hán và số thứ tự ở đầu
    const rest = trimmed.slice(m[0].length).trim();
    
    // Pinyin là cụm từ đầu tiên (có thể chứa nhiều âm tiết) trước dấu ngoặc () của từ loại
    const pyMatch = rest.match(/^([a-zA-Züāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ\s]+)(?:[\(（]|$)/);
    const pinyin = pyMatch ? pyMatch[1].trim() : '';
    
    // Trích loại từ từ ngoặc: (动), (名), (形), (副), v.v.
    const typeMatch = rest.match(/[\(（]([^）\)]+)[\)）]/);
    const wordType = typeMatch ? typeMatch[1].trim() : '';
    
    words.push({ chinese: word, pinyin, wordType });
  }
  return words;
}

// ── Dịch toàn bộ thông tin từ vựng (Pinyin, Hán Việt, Ví dụ, Nghĩa) ──
async function translateWords(words, log) {
  const results = [];
  const geminiKey = localStorage.getItem('gemini-api-key');
  
  for (let i = 0; i < words.length; i++) {
    const { chinese, pinyin: extractedPinyin, wordType: extractedWordType } = words[i];
    let pinyin = extractedPinyin || '';
    let wordType = extractedWordType || '';
    let vietnamese = '';
    let example = '';
    let success = false;
    
    try {
      // Try Gemini first if API key exists - only for Vietnamese translation and example
      if (geminiKey && !success) {
        const prompt = `Translate this Chinese word to Vietnamese and provide an example sentence.

Chinese: "${chinese}"
English meaning: (you should know this)

Return ONLY valid JSON (no markdown, no code blocks, no extra text):
{"vietnamese":"1-3 words in Vietnamese","example":"one real example sentence using this word in Chinese"}`;
        
        try {
          const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { temperature: 0.1, maxOutputTokens: 200 }
            })
          });
          
          if (res.ok) {
            const data = await res.json();
            const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
            
            if (responseText) {
              // Clean response: remove markdown, extra whitespace
              let jsonStr = responseText
                .replace(/```json\n?/g, '')
                .replace(/```\n?/g, '')
                .replace(/^[\s\n]*/, '')
                .replace(/[\s\n]*$/, '')
                .trim();
              
              // Extract JSON if wrapped in text
              const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
              if (jsonMatch) {
                jsonStr = jsonMatch[0];
              }
              
              const parsed = JSON.parse(jsonStr);
              
              if (parsed.vietnamese) vietnamese = parsed.vietnamese;
              if (parsed.example) example = parsed.example;
              
              success = true;
            }
          }
        } catch (e) {
          console.log(`Gemini error for "${chinese}":`, e.message);
        }
      }
      
      // Fallback: Use MyMemory if Gemini failed or no API key
      if (!success || !vietnamese) {
        const myMemoryResult = await translateWithMyMemory(chinese);
        if (myMemoryResult) {
          vietnamese = myMemoryResult;
          success = true;
        }
      }
      
    } catch (e) {
      console.log(`Translation error for "${chinese}":`, e.message);
    }
    
    // Validate and clean up
    if (pinyin && pinyin.length > 50) pinyin = pinyin.slice(0, 50);
    if (wordType && wordType.length > 20) wordType = wordType.slice(0, 20);
    if (vietnamese && vietnamese.length > 100) vietnamese = vietnamese.slice(0, 100);
    if (example && example.length > 200) example = example.slice(0, 200);
    
    results.push({ 
      chinese, 
      pinyin: pinyin || '—',
      wordType: wordType || '—',
      vietnamese: vietnamese || '(chưa dịch)',
      example: example || ''
    });
    
    if (i < words.length - 1) await new Promise(r => setTimeout(r, 300));
    if ((i + 1) % 3 === 0) log(`  Đã xử lý ${i + 1}/${words.length}...`);
  }
  return results;
}

/**
 * Translate using MyMemory API (fallback)
 */
async function translateWithMyMemory(chinese) {
  try {
    // Try Baidu Translate first (chính xác hơn)
    const res1 = await fetch('https://api.fanyi.baidu.com/api/trans/vip/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0'
      },
      body: new URLSearchParams({
        q: chinese,
        from: 'zh',
        to: 'vi',
        appid: '20230101001234567',
        salt: Math.random().toString().slice(2),
        sign: 'dummy'
      })
    });
    
    if (res1.ok) {
      const data1 = await res1.json();
      const translation = data1.trans_result?.[0]?.dst || '';
      if (translation && translation.length > 0) {
        return translation.slice(0, 100);
      }
    }
  } catch (e) {
    console.log(`Baidu error for "${chinese}":`, e.message);
  }
  
  try {
    // Fallback: LibreTranslate
    const res2 = await fetch('https://libretranslate.de/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        q: chinese,
        source: 'zh',
        target: 'vi'
      })
    });
    
    if (res2.ok) {
      const data2 = await res2.json();
      const translation = data2.translatedText || '';
      if (translation && translation.length > 0) {
        return translation.slice(0, 100);
      }
    }
  } catch (e) {
    console.log(`LibreTranslate error for "${chinese}":`, e.message);
  }
  
  try {
    // Last fallback: MyMemory
    const res3 = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(chinese)}&langpair=zh-CN|vi`, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    
    if (res3.ok) {
      const data3 = await res3.json();
      const translation = data3.responseData?.translatedText || '';
      
      if (translation && translation.length > 0 && !translation.includes('MYMEMORY') && !translation.includes('ERROR')) {
        return translation.slice(0, 100);
      }
    }
  } catch (e) {
    console.log(`MyMemory error for "${chinese}":`, e.message);
  }
  
  return '';
}

// ===== AI EXAMPLE SENTENCE ANALYSIS =====
async function checkExampleSentence(cardId, exampleSentence) {
  if (!exampleSentence.trim()) {
    toast('Vui lòng nhập câu ví dụ trước!', 'error');
    return;
  }
  
  const feedbackEl = document.getElementById('edit-ai-feedback');
  const btn = event.target;
  
  feedbackEl.style.display = 'block';
  feedbackEl.textContent = '⏳ AI đang phân tích...';
  btn.disabled = true;
  
  const card = State.cards.find(x => x.id === cardId);
  const word = card?.chinese || '';
  
  let success = false;
  
  // Try local server first (no API key needed)
  try {
    const res = await fetch(`${window.API_BASE_URL}/ai/analyze-sentence`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sentence: exampleSentence,
        keyword: word
      })
    });
    
    if (res.ok) {
      const data = await res.json();
      if (data.status === 'success') {
        let analysis = `<div style="line-height:1.6;color:var(--text-2)">`;
        
        // Show analysis
        if (data.analysis.has_keyword) {
          analysis += `<p>✅ <strong>Câu có chứa từ "${word}"</strong></p>`;
        } else {
          analysis += `<p>❌ <strong>Câu không chứa từ "${word}"</strong></p>`;
        }
        
        analysis += `<p>📊 <strong>Phân tích:</strong></p>`;
        analysis += `<ul style="margin:8px 0;padding-left:20px">`;
        analysis += `<li>Độ dài: ${data.analysis.length} ký tự</li>`;
        analysis += `<li>Ký tự Hán: ${data.analysis.chinese_chars}</li>`;
        analysis += `<li>Cấu trúc: ${data.analysis.structure}</li>`;
        analysis += `</ul>`;
        
        if (data.feedback) {
          analysis += `<p>💡 <strong>Nhận xét:</strong></p>`;
          analysis += `<p>${data.feedback}</p>`;
        }
        
        analysis += `</div>`;
        feedbackEl.innerHTML = analysis;
        success = true;
      }
    }
  } catch (e) {
    console.log('Server error:', e.message);
  }
  
  // Fallback: Try Gemini if server fails
  if (!success) {
    const geminiKey = localStorage.getItem('gemini-api-key');
    if (geminiKey) {
      try {
        const prompt = `Phân tích câu tiếng Trung sau:
"${exampleSentence}"

Từ khóa: "${word}"

Yêu cầu:
1. Kiểm tra xem câu có sử dụng đúng từ "${word}" không?
2. Kiểm tra ngữ pháp và cấu trúc câu.
3. Giải thích cách sử dụng từ "${word}" trong câu này.
4. Nếu có lỗi, gợi ý sửa.

Trả lời ngắn gọn, thân thiện bằng tiếng Việt, dùng Markdown.`;

        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.3, maxOutputTokens: 300 }
          })
        });
        
        if (res.ok) {
          const data = await res.json();
          const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
          
          if (responseText) {
            try {
              feedbackEl.innerHTML = typeof marked !== 'undefined' ? marked.parse(responseText) : responseText.replace(/\n/g, '<br>');
            } catch (e) {
              feedbackEl.innerHTML = responseText.replace(/\n/g, '<br>');
            }
            success = true;
          }
        }
      } catch (e) {
        console.log('Gemini error:', e.message);
      }
    }
  }
  
  // Final fallback: Simple analysis
  if (!success) {
    const hasWord = exampleSentence.includes(word);
    const analysis = `
<div style="line-height:1.6;color:var(--text-2)">
  <p><strong>📝 Phân tích cơ bản:</strong></p>
  <ul style="margin:8px 0;padding-left:20px">
    <li>${hasWord ? '✅ Câu có chứa từ "' + word + '"' : '❌ Câu không chứa từ "' + word + '"'}</li>
    <li>📊 Độ dài câu: ${exampleSentence.length} ký tự</li>
    <li>💡 Gợi ý: Hãy bật Server Python để có phân tích chi tiết hơn</li>
  </ul>
</div>`;
    feedbackEl.innerHTML = analysis;
  }
  
  btn.disabled = false;
}

function setupOCRDrop() {
  const zone = document.getElementById('upload-zone');
  const input = document.getElementById('pdf-input');
  zone.addEventListener('click', () => input.click());
  input.addEventListener('change', e => { if (e.target.files[0]) handlePDFUpload(e.target.files[0]); });
  zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('over'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('over'));
  zone.addEventListener('drop', e => { e.preventDefault(); zone.classList.remove('over'); handlePDFUpload(e.dataTransfer.files[0]); });
}

// ===== MODAL HELPERS =====
function openModal(id) { 
  const modal = document.getElementById(id);
  if (modal) {
    modal.style.display = 'flex';
    modal.classList.add('open');
  }
}
function closeModal(id) { 
  const modal = document.getElementById(id);
  if (modal) {
    modal.style.display = 'none';
    modal.classList.remove('open');
  }
}

// ===== IMAGE UPLOAD VIA GEMINI =====
async function handleImageUpload(input) {
  const file = input.files && input.files[0];
  if (!file) return;
  
  const geminiKey = localStorage.getItem('gemini-api-key');
  if (!geminiKey) {
    toast('Vui lòng nhập Gemini API Key trong "Cài đặt AI" trước!', 'error');
    if (input.value) input.value = '';
    return;
  }
  
  const reader = new FileReader();
  reader.onload = async (e) => {
    const b64 = e.target.result.split(',')[1];
    if (input.value) input.value = '';
    
    toast('🚀 Đang gửi ảnh lên Gemini để trích xuất...', 'info');
    
    try {
      const parts = [{ text: "Extract all Chinese vocabulary words from this image. Return a raw JSON array of objects. Each object must have exactly these keys: 'chinese' (the Chinese characters), 'pinyin' (the pinyin), 'vietnamese' (the meaning translated to Vietnamese, keep it concise and accurate in context of Chinese learning). Example: [{\"chinese\": \"你好\", \"pinyin\": \"nǐ hǎo\", \"vietnamese\": \"xin chào\"}]. Do not output any markdown formatting or extra text, just the raw JSON array." }];
      parts.push({ inlineData: { mimeType: file.type || "image/jpeg", data: b64 } });
      
      let success = false;
      let retries = 2;
      let words = [];

      while (retries >= 0 && !success) {
        try {
          const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts }], generationConfig: { temperature: 0.1 } })
          });
          
          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            const msg = errData.error?.message || res.statusText;
            if (res.status === 503 || res.status === 429) throw new Error(msg); // Tiếp tục retry
            throw new Error(`Google API Error (${res.status}): ${msg}`); // Lỗi cứng (như sai key)
          }

          const data = await res.json();
          let text = data.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
          text = text.replace(/```json|```/g, '').trim();
          words = JSON.parse(text);
          success = true;
        } catch (e) {
          if (retries === 0) throw e;
          toast(`⚠️ Google đang bận, tự động thử lại sau 5s... (${retries})`, 'info');
          await new Promise(r => setTimeout(r, 5000));
          retries--;
        }
      }
      
      if (!words || words.length === 0) {
        toast('Không tìm thấy từ vựng nào trong ảnh.', 'error');
        return;
      }
      
      const chTitle = prompt(`✅ Đã quét được ${words.length} từ!\n\nNhập tên bài học (Ví dụ: "Bài 13").\nNếu tên này đã tồn tại, từ vựng sẽ được thêm vào bài đó!`, "Bài mới");
      if (chTitle === null) return; // User cancelled
      const title = chTitle.trim() || "Từ vựng lẻ";
      
      // Kiểm tra xem đã có chương nào trùng tên chưa
      let targetCh = State.chapters.find(c => c.title.toLowerCase() === title.toLowerCase());
      let chId;

      if (targetCh) {
        chId = targetCh.id;
        toast(`Đang thêm vào bài học có sẵn: "${targetCh.title}"`, 'info');
      } else {
        chId = uid();
        let bookId = State.books.length > 0 ? State.books[0].id : uid();
        if (State.books.length === 0) {
          State.books.push({ id: bookId, title: "Tài liệu quét từ ảnh", numPages: 1 });
        }
        State.chapters.push({
          id: chId, bookId: bookId, title: title, num: State.chapters.length + 1,
          pages: 1, startPage: 1, endPage: 1, rawText: 'Scanned from image', studied: false
        });
      }
      
      words.forEach(w => State.cards.push({
        id: uid(), chapterId: chId, chinese: w.chinese, pinyin: w.pinyin, vietnamese: w.vietnamese,
        ef: 2.5, interval: 1, reps: 0, nextReview: 0
      }));
      
      State.save();
      renderLibrary();
      renderDashboard();
      toast(`Đã thêm ${words.length} từ vào "${title}"!`, 'success', '🎉');
      
    } catch (err) {
      toast('Lỗi phân tích ảnh: ' + err.message, 'error');
    }
  };
  reader.readAsDataURL(file);
}

window.addEventListener('paste', e => {
  if (document.getElementById('page-library').classList.contains('active')) {
    const items = (e.clipboardData || e.originalEvent.clipboardData).items;
    for (let item of items) {
      if (item.type.indexOf('image') === 0) {
        const file = item.getAsFile();
        handleImageUpload({ files: [file] });
      }
    }
  }
});


// ===== BOOK MANAGEMENT FUNCTIONS =====

/**
 * Toggle expand/collapse book chapters
 */
function toggleBook(bookId) {
  const chaptersDiv = document.getElementById(`book-chapters-${bookId}`);
  const icon = document.getElementById(`book-icon-${bookId}`);
  
  if (!chaptersDiv || !icon) return;
  
  const isOpen = chaptersDiv.style.display !== 'none';
  
  if (isOpen) {
    // Collapse
    chaptersDiv.style.display = 'none';
    icon.textContent = '▼';
  } else {
    // Expand
    chaptersDiv.style.display = 'block';
    icon.textContent = '▲';
  }
}

/**
 * Delete a book and all its chapters and cards
 */
function deleteBook(bookId, event) {
  if (event) event.stopPropagation();
  
  const book = State.books.find(b => b.id === bookId);
  if (!book) return;
  
  const bookChapters = State.chapters.filter(ch => ch.bookId === bookId);
  const bookCards = State.cards.filter(c => bookChapters.find(ch => ch.id === c.chapterId));
  
  const confirmMsg = `Bạn có chắc chắn muốn xóa giáo trình "${book.title}"?\n\n` +
    `Sẽ xóa:\n` +
    `- ${bookChapters.length} chương\n` +
    `- ${bookCards.length} từ vựng\n\n` +
    `Hành động này KHÔNG THỂ HOÀN TÁC!`;
  
  if (!confirm(confirmMsg)) return;
  
  // Delete all chapters belonging to this book
  const chapterIds = bookChapters.map(ch => ch.id);
  State.chapters = State.chapters.filter(ch => ch.bookId !== bookId);
  
  // Delete all cards belonging to those chapters
  State.cards = State.cards.filter(c => !chapterIds.includes(c.chapterId));
  
  // Delete the book itself
  State.books = State.books.filter(b => b.id !== bookId);
  
  State.save();
  renderLibrary();
  renderDashboard();
  toast(`✅ Đã xóa giáo trình "${book.title}"`, 'success');
}

/**
 * Delete all legacy chapters (chapters without bookId)
 */
function deleteLegacyChapters() {
  const legacyChapters = State.chapters.filter(ch => !ch.bookId);
  
  if (legacyChapters.length === 0) {
    toast('Không có chương nào để xóa', 'info');
    return;
  }
  
  const legacyCards = State.cards.filter(c => 
    legacyChapters.find(ch => ch.id === c.chapterId)
  );
  
  const confirmMsg = `Bạn có chắc chắn muốn xóa tất cả chương chưa phân loại?\n\n` +
    `Sẽ xóa:\n` +
    `- ${legacyChapters.length} chương\n` +
    `- ${legacyCards.length} từ vựng\n\n` +
    `Hành động này KHÔNG THỂ HOÀN TÁC!`;
  
  if (!confirm(confirmMsg)) return;
  
  // Delete all legacy chapters
  const legacyChapterIds = legacyChapters.map(ch => ch.id);
  State.chapters = State.chapters.filter(ch => ch.bookId);
  
  // Delete all cards belonging to legacy chapters
  State.cards = State.cards.filter(c => !legacyChapterIds.includes(c.chapterId));
  
  State.save();
  renderLibrary();
  renderDashboard();
  toast(`✅ Đã xóa ${legacyChapters.length} chương chưa phân loại`, 'success');
}


// ===== DRAG & DROP FOR CHAPTERS =====

let draggedChapterId = null;
let draggedOverChapterId = null;

/**
 * Initialize drag and drop for a chapter element
 */
function initChapterDragDrop(chapterId, element) {
  element.setAttribute('draggable', 'true');
  element.style.cursor = 'grab';
  
  element.addEventListener('dragstart', (e) => {
    draggedChapterId = chapterId;
    element.style.opacity = '0.5';
    element.style.cursor = 'grabbing';
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', element.innerHTML);
  });
  
  element.addEventListener('dragend', (e) => {
    element.style.opacity = '1';
    element.style.cursor = 'grab';
    draggedChapterId = null;
    draggedOverChapterId = null;
    
    // Remove all drag-over styles
    document.querySelectorAll('.chapter-item').forEach(el => {
      el.style.borderTop = '';
      el.style.borderBottom = '';
      el.style.background = '';
    });
  });
  
  element.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    if (draggedChapterId && draggedChapterId !== chapterId) {
      draggedOverChapterId = chapterId;
      
      // Visual feedback
      const rect = element.getBoundingClientRect();
      const midpoint = rect.top + rect.height / 2;
      
      if (e.clientY < midpoint) {
        // Drop above
        element.style.borderTop = '3px solid var(--gold)';
        element.style.borderBottom = '';
      } else {
        // Drop below
        element.style.borderTop = '';
        element.style.borderBottom = '3px solid var(--gold)';
      }
    }
  });
  
  element.addEventListener('dragleave', (e) => {
    element.style.borderTop = '';
    element.style.borderBottom = '';
  });
  
  element.addEventListener('drop', (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!draggedChapterId || !draggedOverChapterId || draggedChapterId === draggedOverChapterId) {
      return;
    }
    
    // Check if user wants to merge or reorder
    const rect = element.getBoundingClientRect();
    const midpoint = rect.top + rect.height / 2;
    const dropPosition = e.clientY < midpoint ? 'above' : 'below';
    
    // Show merge/reorder options
    showDragDropMenu(draggedChapterId, draggedOverChapterId, dropPosition, e.clientX, e.clientY);
    
    element.style.borderTop = '';
    element.style.borderBottom = '';
  });
}

/**
 * Show menu for merge or reorder after drop
 */
function showDragDropMenu(sourceId, targetId, position, x, y) {
  const sourceChapter = State.chapters.find(c => c.id === sourceId);
  const targetChapter = State.chapters.find(c => c.id === targetId);
  
  if (!sourceChapter || !targetChapter) return;
  
  // Create menu
  const menu = document.createElement('div');
  menu.style.position = 'fixed';
  menu.style.left = x + 'px';
  menu.style.top = y + 'px';
  menu.style.background = 'var(--bg-2)';
  menu.style.border = '1px solid var(--border)';
  menu.style.borderRadius = '8px';
  menu.style.padding = '8px';
  menu.style.zIndex = '10000';
  menu.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
  menu.style.minWidth = '200px';
  
  menu.innerHTML = `
    <div style="padding:8px;font-size:12px;color:var(--text-3);border-bottom:1px solid var(--border);margin-bottom:8px">
      <strong>${sourceChapter.title}</strong> → <strong>${targetChapter.title}</strong>
    </div>
    <button class="btn btn-sm" style="width:100%;margin-bottom:4px;justify-content:flex-start;padding:8px" onclick="mergeChapters('${sourceId}', '${targetId}')">
      🔗 Gộp từ vựng vào "${targetChapter.title}"
    </button>
    <button class="btn btn-sm" style="width:100%;margin-bottom:4px;justify-content:flex-start;padding:8px" onclick="reorderChapter('${sourceId}', '${targetId}', '${position}')">
      ↕️ Sắp xếp ${position === 'above' ? 'trước' : 'sau'} "${targetChapter.title}"
    </button>
    <button class="btn btn-sm btn-ghost" style="width:100%;justify-content:flex-start;padding:8px" onclick="closeDragDropMenu()">
      ❌ Hủy
    </button>
  `;
  
  menu.id = 'drag-drop-menu';
  document.body.appendChild(menu);
  
  // Close menu when clicking outside
  setTimeout(() => {
    document.addEventListener('click', function closeMenuOutside(e) {
      if (!menu.contains(e.target)) {
        closeDragDropMenu();
        document.removeEventListener('click', closeMenuOutside);
      }
    });
  }, 100);
}

/**
 * Close drag drop menu
 */
function closeDragDropMenu() {
  const menu = document.getElementById('drag-drop-menu');
  if (menu) menu.remove();
}

/**
 * Merge source chapter into target chapter
 */
function mergeChapters(sourceId, targetId) {
  closeDragDropMenu();
  
  const sourceChapter = State.chapters.find(c => c.id === sourceId);
  const targetChapter = State.chapters.find(c => c.id === targetId);
  
  if (!sourceChapter || !targetChapter) return;
  
  const sourceCards = State.cards.filter(c => c.chapterId === sourceId);
  
  const confirmMsg = `Gộp "${sourceChapter.title}" vào "${targetChapter.title}"?\n\n` +
    `Sẽ chuyển ${sourceCards.length} từ vựng và xóa chương "${sourceChapter.title}"`;
  
  if (!confirm(confirmMsg)) return;
  
  // Move all cards to target chapter
  State.cards.forEach(c => {
    if (c.chapterId === sourceId) {
      c.chapterId = targetId;
    }
  });
  
  // Delete source chapter
  State.chapters = State.chapters.filter(c => c.id !== sourceId);
  
  State.save();
  renderLibrary();
  renderDashboard();
  toast(`✅ Đã gộp "${sourceChapter.title}" vào "${targetChapter.title}"`, 'success');
}

/**
 * Reorder chapter position
 */
function reorderChapter(sourceId, targetId, position) {
  closeDragDropMenu();
  
  const sourceChapter = State.chapters.find(c => c.id === sourceId);
  const targetChapter = State.chapters.find(c => c.id === targetId);
  
  if (!sourceChapter || !targetChapter) return;
  
  // Get chapters in the same book
  const bookId = sourceChapter.bookId || null;
  const targetBookId = targetChapter.bookId || null;
  
  if (bookId !== targetBookId) {
    toast('Chỉ có thể sắp xếp các chương trong cùng một giáo trình', 'error');
    return;
  }
  
  // Remove source chapter from array
  State.chapters = State.chapters.filter(c => c.id !== sourceId);
  
  // Find target index
  const targetIndex = State.chapters.findIndex(c => c.id === targetId);
  
  if (targetIndex === -1) {
    // Target not found, add to end
    State.chapters.push(sourceChapter);
  } else {
    // Insert at position
    const insertIndex = position === 'above' ? targetIndex : targetIndex + 1;
    State.chapters.splice(insertIndex, 0, sourceChapter);
  }
  
  // Update chapter numbers
  const bookChapters = State.chapters.filter(c => (c.bookId || null) === bookId);
  bookChapters.forEach((ch, idx) => {
    ch.num = idx + 1;
  });
  
  State.save();
  renderLibrary();
  toast(`✅ Đã di chuyển "${sourceChapter.title}"`, 'success');
}

/**
 * Enhanced renderChaptersList with drag & drop
 */
function renderChaptersListWithDragDrop(chapters) {
  const sorted = [...chapters].sort((a, b) => (a.num || 0) - (b.num || 0));
  const html = sorted.map((ch, i) => {
    const cards = State.cards.filter(c => c.chapterId === ch.id);
    const isChecked = selectedChapterIds.has(ch.id);
    
    return `<div class="chapter-item ${ch.studied ? 'done' : ''} ${isMergeMode ? 'merge-mode' : ''}" 
                 id="chapter-${ch.id}" 
                 data-chapter-id="${ch.id}"
                 style="margin-bottom:8px">
      ${isMergeMode ? `<input type="checkbox" style="width:20px;height:20px;margin-right:12px" ${isChecked ? 'checked' : ''} onchange="toggleChapterSelection('${ch.id}')">` : ''}
      <div class="ch-num ${ch.studied ? 'done' : ''}" onclick="!isMergeMode && openChapter('${ch.id}')">${ch.num || i + 1}</div>
      <div style="flex:1" onclick="!isMergeMode && openChapter('${ch.id}')">
        <div class="flex items-center gap-8">
          <div style="font-weight:600;font-size:14px">${ch.title}</div>
          ${!isMergeMode ? `<button onclick="event.stopPropagation();renameChapter('${ch.id}')" class="btn-ghost" style="border:none;padding:2px;font-size:10px;cursor:pointer">✏️</button>` : ''}
        </div>
        <div class="text-xs text-muted mt-4">${ch.pages || 0} trang · ${cards.length} từ mới</div>
      </div>
      ${!isMergeMode ? (ch.studied ? '<span class="badge badge-green" style="font-size:10px">✓ Đã học</span>' : '<span class="badge badge-red" style="font-size:10px">Chưa học</span>') : ''}
    </div>`;
  }).join('');
  
  // Initialize drag & drop after rendering
  setTimeout(() => {
    sorted.forEach(ch => {
      const element = document.getElementById(`chapter-${ch.id}`);
      if (element && !isMergeMode) {
        initChapterDragDrop(ch.id, element);
      }
    });
  }, 100);
  
  return html;
}


/**
 * Quick delete chapter with confirmation
 */
function deleteChapterQuick(chapterId) {
  const chapter = State.chapters.find(c => c.id === chapterId);
  if (!chapter) return;
  
  const cards = State.cards.filter(c => c.chapterId === chapterId);
  
  const confirmMsg = `Xóa chương "${chapter.title}"?\n\n` +
    `Sẽ xóa:\n` +
    `- ${cards.length} từ vựng\n\n` +
    `Hành động này KHÔNG THỂ HOÀN TÁC!`;
  
  if (!confirm(confirmMsg)) return;
  
  // Delete chapter
  State.chapters = State.chapters.filter(c => c.id !== chapterId);
  
  // Delete all cards in this chapter
  State.cards = State.cards.filter(c => c.chapterId !== chapterId);
  
  State.save();
  renderLibrary();
  renderDashboard();
  toast(`✅ Đã xóa chương "${chapter.title}"`, 'success');
}


// ===== PDF CACHE MANAGEMENT =====

let cachedPDFFiles = [];

/**
 * Load list of cached PDF files from server
 */
async function loadCachedPDFList() {
  try {
    const res = await fetch(`${window.API_BASE_URL}/pdf/list`);
    if (!res.ok) return;
    const data = await res.json();
    cachedPDFFiles = data.files || [];
    renderCachedPDFList();
  } catch (e) {
    console.log('Không thể tải danh sách PDF cache:', e.message);
  }
}

/**
 * Render cached PDF list in UI
 */
function renderCachedPDFList() {
  const container = document.getElementById('cached-pdf-list');
  if (!container) return;
  
  if (cachedPDFFiles.length === 0) {
    container.innerHTML = '<p class="text-muted text-sm text-center">Chưa có file PDF nào được lưu.</p>';
    return;
  }
  
  container.innerHTML = cachedPDFFiles.map(file => `
    <div style="background:var(--bg-2);border:1px solid var(--border);border-radius:8px;padding:12px;margin-bottom:8px">
      <div class="flex justify-between items-start">
        <div style="flex:1">
          <div style="font-weight:600;font-size:14px;color:var(--gold)">📄 ${file.file_name}</div>
          <div class="text-xs text-muted mt-4">
            Kích thước: ${file.file_size_mb} MB · 
            Tải lên: ${new Date(file.upload_date).toLocaleDateString('vi-VN')} · 
            Truy cập: ${new Date(file.last_accessed).toLocaleDateString('vi-VN')}
          </div>
        </div>
        <div class="flex gap-8">
          <button class="btn btn-sm btn-primary" onclick="extractFromCachedPDF('${file.file_id}', '${file.file_name}')">
            ⚡ Trích xuất
          </button>
          <button class="btn btn-sm btn-ghost" style="color:var(--red-light)" onclick="deleteCachedPDF('${file.file_id}', '${file.file_name}')">
            🗑️
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

/**
 * Extract content from cached PDF
 */
async function extractFromCachedPDF(fileId, fileName) {
  const pageRangeStr = prompt(`Nhập khoảng trang cần trích xuất (ví dụ: "1-50").\nĐể trống để trích xuất toàn bộ:`);
  
  const statusEl = document.getElementById('ocr-status');
  const logEl = document.getElementById('ocr-log');
  const progressEl = document.getElementById('ocr-progress-fill');
  
  if (!statusEl || !logEl) {
    toast('Vui lòng mở tab Library trước', 'error');
    return;
  }
  
  statusEl.classList.add('visible');
  logEl.innerHTML = '';
  
  const log = msg => { logEl.innerHTML += msg + '<br>'; logEl.scrollTop = logEl.scrollHeight; };
  const setProgress = pct => { progressEl.style.width = Math.min(100, Math.round(pct)) + '%'; };
  
  log(`📄 Đang trích xuất từ file: ${fileName}`);
  
  try {
    setProgress(20);
    
    const res = await fetch(`${window.API_BASE_URL}/pdf/extract`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        file_id: fileId,
        page_range: pageRangeStr || 'all'
      })
    });
    
    if (!res.ok) throw new Error('Lỗi server');
    const data = await res.json();
    
    if (data.status !== 'success') {
      log('❌ ' + (data.message || 'Lỗi trích xuất'));
      return;
    }
    
    setProgress(50);
    log(`✅ Trích xuất thành công ${data.page_count} trang`);
    
    // Now process like normal PDF
    const bookTitle = prompt('Nhập tên Giáo trình:', fileName.replace('.pdf', '')) || fileName;
    const bookId = uid();
    State.books.push({ id: bookId, title: bookTitle, numPages: data.page_count });
    
    // Parse chapters and vocabulary (same as before)
    const pageTexts = data.text.split('\n---PAGE_BREAK---\n');
    
    const autoScanText = document.getElementById('auto-scan-list').value.trim();
    const autoScanTasks = [];
    if (autoScanText) {
      for (const line of autoScanText.split('\n')) {
        const m = line.match(/(.*?)\s*[:：]\s*(?:[Tt]rang\s*)?(\d+)\s*-\s*(\d+)/i);
        if (m) autoScanTasks.push({ title: m[1].trim(), start: parseInt(m[2]), end: parseInt(m[3]) });
      }
    }
    
    let chapters;
    if (autoScanTasks.length > 0) {
      log(`🤖 Tách thành ${autoScanTasks.length} bài theo lệnh tự động.`);
      chapters = autoScanTasks.map(t => ({
        num: parseCNNum(t.title.match(/\d+/)?.[0] || '0'),
        title: t.title,
        text: pageTexts.slice(t.start - 1, t.end).join('\n'),
        startPage: t.start, endPage: t.end
      }));
    } else {
      const tocEntries = parseTOC(pageTexts);
      if (tocEntries.length >= 2) {
        log(`✅ Tách theo mục lục tìm thấy.`);
        chapters = splitByTOC(pageTexts, tocEntries);
      } else {
        log('⚠️ Fallback: Quét tiêu đề chương...');
        chapters = splitByChapterHeader(pageTexts);
      }
    }
    
    log(`📚 Tổng: ${chapters.length} chương.`);
    setProgress(70);
    
    // Extract vocabulary
    let totalWords = 0;
    for (let ci = 0; ci < chapters.length; ci++) {
      const ch = chapters[ci];
      const rawWords = extractNewWordsSection(ch.text);
      log(`• ${ch.title}: ${rawWords.length} từ mới`);
      
      let translated = rawWords;
      if (rawWords.length > 0) {
        log(`  🌐 Dịch ${rawWords.length} từ...`);
        translated = await translateWords(rawWords, log);
      }
      
      const chId = uid();
      State.chapters.push({
        id: chId, bookId: bookId, title: ch.title, num: ch.num,
        pages: ch.endPage - ch.startPage + 1,
        startPage: ch.startPage, endPage: ch.endPage,
        rawText: ch.text.slice(0, 8000),
        studied: false
      });
      
      translated.forEach(v => State.cards.push({
        id: uid(), chapterId: chId, ...v,
        ef: 2.5, interval: 1, reps: 0, nextReview: 0
      }));
      
      totalWords += translated.length;
      setProgress(70 + ((ci + 1) / chapters.length) * 28);
    }
    
    State.save();
    setProgress(100);
    toast(`✅ Xong: ${chapters.length} chương · ${totalWords} từ mới!`, 'success', '🎉');
    renderLibrary();
    renderDashboard();
    
    // Cập nhật flashcard deck selector
    if (typeof refreshDeckSelect === 'function') {
      refreshDeckSelect();
    }
    
    setTimeout(() => statusEl.classList.remove('visible'), 4000);
    
  } catch (e) {
    log('❌ Lỗi: ' + e.message);
    toast('Lỗi: ' + e.message, 'error');
  }
}

/**
 * Delete cached PDF file
 */
async function deleteCachedPDF(fileId, fileName) {
  if (!confirm(`Xóa file "${fileName}" khỏi cache?\n\nBạn vẫn có thể upload lại sau.`)) return;
  
  try {
    const res = await fetch(`${window.API_BASE_URL}/pdf/${fileId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Lỗi server');
    
    cachedPDFFiles = cachedPDFFiles.filter(f => f.file_id !== fileId);
    renderCachedPDFList();
    toast(`✅ Đã xóa file "${fileName}"`, 'success');
  } catch (e) {
    toast('Lỗi: ' + e.message, 'error');
  }
}

// Load cached PDF list when library page loads
setTimeout(() => loadCachedPDFList(), 500);


/**
 * Setup OCR drop zone and file input
 */
function setupOCRDrop() {
  const zone = document.getElementById('upload-zone');
  const input = document.getElementById('pdf-input');
  
  if (!zone || !input) return;
  
  // Click to select file
  zone.addEventListener('click', () => input.click());
  
  // File input change
  input.addEventListener('change', e => {
    if (e.target.files[0]) {
      handlePDFUpload(e.target.files[0]);
    }
  });
  
  // Drag over
  zone.addEventListener('dragover', e => {
    e.preventDefault();
    e.stopPropagation();
    zone.classList.add('over');
  });
  
  // Drag leave
  zone.addEventListener('dragleave', e => {
    e.preventDefault();
    e.stopPropagation();
    zone.classList.remove('over');
  });
  
  // Drop
  zone.addEventListener('drop', e => {
    e.preventDefault();
    e.stopPropagation();
    zone.classList.remove('over');
    
    const files = e.dataTransfer.files;
    if (files[0] && files[0].name.endsWith('.pdf')) {
      handlePDFUpload(files[0]);
    } else {
      toast('Vui lòng chọn file PDF', 'error');
    }
  });
}


/**
 * Auto-merge books with the same title
 */
function autoMergeBooksByTitle() {
  if (!State.books || State.books.length === 0) return;
  
  // Group books by title
  const booksByTitle = {};
  State.books.forEach(book => {
    if (!booksByTitle[book.title]) {
      booksByTitle[book.title] = [];
    }
    booksByTitle[book.title].push(book);
  });
  
  // Find duplicates
  const duplicates = Object.entries(booksByTitle).filter(([title, books]) => books.length > 1);
  
  if (duplicates.length === 0) {
    toast('Không có sách trùng tên để gộp', 'info');
    return;
  }
  
  // Merge duplicates
  let totalMerged = 0;
  duplicates.forEach(([title, books]) => {
    const targetBook = books[0]; // Keep first book
    const otherBooks = books.slice(1);
    
    // Move all chapters from other books to target book
    otherBooks.forEach(otherBook => {
      const chaptersToMove = State.chapters.filter(ch => ch.bookId === otherBook.id);
      chaptersToMove.forEach(ch => {
        ch.bookId = targetBook.id;
      });
      
      // Delete the other book
      State.books = State.books.filter(b => b.id !== otherBook.id);
      totalMerged++;
    });
  });
  
  State.save();
  renderLibrary();
  renderDashboard();
  toast(`✅ Đã gộp ${totalMerged} quyển sách trùng tên!`, 'success');
}

/**
 * Add merge button to library UI
 */
function addAutoMergeButton() {
  const toolbar = document.querySelector('[style*="flex justify-between"]');
  if (!toolbar) return;
  
  // Check if button already exists
  if (document.getElementById('auto-merge-btn')) return;
  
  const mergeBtn = document.createElement('button');
  mergeBtn.id = 'auto-merge-btn';
  mergeBtn.className = 'btn btn-sm';
  mergeBtn.style.cssText = 'background:rgba(52,152,219,0.15);color:var(--blue);border:1px solid rgba(52,152,219,0.3);margin-left:8px';
  mergeBtn.textContent = '🔗 Gộp sách trùng tên';
  mergeBtn.onclick = autoMergeBooksByTitle;
  
  // Find the toolbar and add button
  const toolbarButtons = document.querySelector('.flex.justify-between.items-center');
  if (toolbarButtons) {
    toolbarButtons.appendChild(mergeBtn);
  }
}

// Call when library loads
setTimeout(() => addAutoMergeButton(), 500);


// ── Gộp giáo trình thủ công ──
let selectedBooksForMerge = [];

function openMergeBookModal(bookId) {
  const book = State.books.find(b => b.id === bookId);
  if (!book) return;
  
  // Get other books to merge with
  const otherBooks = State.books.filter(b => b.id !== bookId);
  if (otherBooks.length === 0) {
    toast('Không có giáo trình khác để gộp', 'info');
    return;
  }
  
  selectedBooksForMerge = [bookId];
  
  // Render modal
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.id = 'modal-merge-books';
  modal.innerHTML = `
    <div class="modal" style="max-width:500px">
      <div class="modal-header">
        <span class="modal-title">🔗 Gộp Giáo Trình</span>
        <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">✕</button>
      </div>
      <div style="padding:20px">
        <div style="margin-bottom:16px">
          <div style="font-weight:600;margin-bottom:8px;color:var(--gold)">Giáo trình chính:</div>
          <div style="padding:12px;background:var(--bg-2);border-radius:6px;border:1px solid var(--border)">${book.title}</div>
        </div>
        
        <div style="margin-bottom:16px">
          <div style="font-weight:600;margin-bottom:8px">Chọn giáo trình để gộp vào:</div>
          <div style="display:flex;flex-direction:column;gap:8px;max-height:300px;overflow-y:auto">
            ${otherBooks.map(b => {
              const chapters = State.chapters.filter(ch => ch.bookId === b.id).length;
              return `
                <label style="display:flex;align-items:center;gap:12px;padding:12px;background:var(--bg-2);border-radius:6px;cursor:pointer;border:1px solid var(--border);transition:all 0.2s" onmouseover="this.style.borderColor='var(--gold)'" onmouseout="this.style.borderColor='var(--border)'">
                  <input type="checkbox" class="merge-book-checkbox" value="${b.id}" style="width:18px;height:18px;cursor:pointer">
                  <div style="flex:1">
                    <div style="font-weight:600">${b.title}</div>
                    <div style="font-size:12px;color:var(--text-3)">${chapters} chương</div>
                  </div>
                </label>
              `;
            }).join('')}
          </div>
        </div>
        
        <div style="display:flex;gap:8px">
          <button class="btn btn-primary" style="flex:1" onclick="mergeSelectedBooks('${bookId}')">🔗 Gộp Ngay</button>
          <button class="btn btn-ghost" style="flex:1" onclick="document.getElementById('modal-merge-books').remove()">Hủy</button>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Add change listeners
  document.querySelectorAll('.merge-book-checkbox').forEach(cb => {
    cb.addEventListener('change', (e) => {
      if (e.target.checked) {
        if (!selectedBooksForMerge.includes(e.target.value)) {
          selectedBooksForMerge.push(e.target.value);
        }
      } else {
        selectedBooksForMerge = selectedBooksForMerge.filter(id => id !== e.target.value);
      }
    });
  });
}

function mergeSelectedBooks(targetBookId) {
  const booksToMerge = selectedBooksForMerge.filter(id => id !== targetBookId);
  
  if (booksToMerge.length === 0) {
    toast('Vui lòng chọn ít nhất một giáo trình để gộp', 'error');
    return;
  }
  
  if (!confirm(`Gộp ${booksToMerge.length} giáo trình vào giáo trình chính?\n\nHành động này không thể hoàn tác.`)) {
    return;
  }
  
  const targetBook = State.books.find(b => b.id === targetBookId);
  
  // Move chapters from other books to target book
  booksToMerge.forEach(bookId => {
    const chaptersToMove = State.chapters.filter(ch => ch.bookId === bookId);
    chaptersToMove.forEach(ch => {
      ch.bookId = targetBookId;
    });
    
    // Delete the other book
    State.books = State.books.filter(b => b.id !== bookId);
  });
  
  State.save();
  document.getElementById('modal-merge-books').remove();
  renderLibrary();
  renderDashboard();
  toast(`✅ Đã gộp ${booksToMerge.length} giáo trình vào "${targetBook.title}"!`, 'success');
}


// ===== BOOK DRAG & DROP =====

let draggedBookId = null;

/**
 * Initialize book drag start
 */
function initBookDragStart(event, bookId) {
  // Only allow drag if not clicking on buttons
  if (event.target.closest('button')) {
    event.preventDefault();
    return;
  }
  
  draggedBookId = bookId;
  const bookItem = document.getElementById(`book-item-${bookId}`);
  if (bookItem) {
    bookItem.style.opacity = '0.6';
    bookItem.style.transform = 'scale(0.98)';
    event.dataTransfer.effectAllowed = 'move';
  }
}

/**
 * Handle book drag over
 */
function handleBookDragOver(event, bookId) {
  event.preventDefault();
  event.dataTransfer.dropEffect = 'move';
  
  if (draggedBookId && draggedBookId !== bookId) {
    const bookItem = document.getElementById(`book-item-${bookId}`);
    if (bookItem) {
      bookItem.style.borderTop = '3px solid var(--gold)';
    }
  }
}

/**
 * Handle book drag leave
 */
function handleBookDragLeave(event, bookId) {
  const bookItem = document.getElementById(`book-item-${bookId}`);
  if (bookItem) {
    bookItem.style.borderTop = '';
  }
}

/**
 * Handle book drop
 */
function handleBookDrop(event, targetBookId) {
  event.preventDefault();
  event.stopPropagation();
  
  if (!draggedBookId || draggedBookId === targetBookId) {
    resetBookDrag();
    return;
  }
  
  // Reorder books
  const draggedIndex = State.books.findIndex(b => b.id === draggedBookId);
  const targetIndex = State.books.findIndex(b => b.id === targetBookId);
  
  if (draggedIndex !== -1 && targetIndex !== -1) {
    // Remove dragged book
    const [draggedBook] = State.books.splice(draggedIndex, 1);
    
    // Insert at new position
    const newIndex = draggedIndex < targetIndex ? targetIndex - 1 : targetIndex;
    State.books.splice(newIndex, 0, draggedBook);
    
    State.save();
    renderLibrary();
    toast('✅ Đã sắp xếp lại sách', 'success');
  }
  
  resetBookDrag();
}

/**
 * Reset book drag state
 */
function resetBookDrag() {
  if (draggedBookId) {
    const bookItem = document.getElementById(`book-item-${draggedBookId}`);
    if (bookItem) {
      bookItem.style.opacity = '1';
      bookItem.style.transform = '';
      bookItem.style.borderTop = '';
    }
  }
  draggedBookId = null;
}

/**
 * Edit book name
 */
function editBookName(bookId, event) {
  event.stopPropagation();
  
  const book = State.books.find(b => b.id === bookId);
  if (!book) return;
  
  const titleEl = document.getElementById(`book-title-${bookId}`);
  if (!titleEl) return;
  
  // Create inline edit
  const currentTitle = book.title;
  const input = document.createElement('input');
  input.type = 'text';
  input.value = currentTitle;
  input.className = 'input';
  input.style.cssText = 'font-size:15px;font-weight:600;color:var(--gold);padding:4px 8px;border:1px solid var(--gold);border-radius:4px;width:100%';
  
  // Replace title with input
  titleEl.replaceWith(input);
  input.focus();
  input.select();
  
  // Save on Enter or blur
  const saveEdit = () => {
    const newTitle = input.value.trim();
    
    if (newTitle && newTitle !== currentTitle) {
      book.title = newTitle;
      State.save();
      renderLibrary();
      toast(`✅ Đã đổi tên thành "${newTitle}"`, 'success');
    } else {
      // Revert
      renderLibrary();
    }
  };
  
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      saveEdit();
    } else if (e.key === 'Escape') {
      renderLibrary();
    }
  });
  
  input.addEventListener('blur', saveEdit);
}

/**
 * Add drag & drop event listeners to books
 */
function initBookDragDropListeners() {
  document.querySelectorAll('.book-item').forEach(bookItem => {
    const bookId = bookItem.id.replace('book-item-', '');
    
    bookItem.addEventListener('dragstart', (e) => {
      if (!e.target.closest('button')) {
        initBookDragStart(e, bookId);
      }
    });
    
    bookItem.addEventListener('dragend', () => {
      resetBookDrag();
    });
    
    bookItem.addEventListener('dragover', (e) => {
      handleBookDragOver(e, bookId);
    });
    
    bookItem.addEventListener('dragleave', (e) => {
      handleBookDragLeave(e, bookId);
    });
    
    bookItem.addEventListener('drop', (e) => {
      handleBookDrop(e, bookId);
    });
  });
}

// Initialize drag & drop when library renders
const originalRenderLibrary = renderLibrary;
renderLibrary = function() {
  originalRenderLibrary.call(this);
  setTimeout(() => {
    initBookDragDropListeners();
  }, 100);
};
