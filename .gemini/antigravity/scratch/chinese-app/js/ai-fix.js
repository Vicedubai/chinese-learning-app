// ===== AI FIX MODULE - Manual Input + Excel/CSV Import =====
// Nhập thủ công hoặc import từ Excel/CSV
// Không quét PDF (đã lưu tự động)

// ── Sửa 1 chương bằng nhập thủ công ──
function aiFixChapter(chapterId) {
  const ch = State.chapters.find(c => c.id === chapterId);
  if (!ch) {
    toast('Không tìm thấy chương', 'error');
    return;
  }

  // Cập nhật tiêu đề modal
  const titleEl = document.getElementById('modal-ch-title');
  if (titleEl) titleEl.textContent = `Nhập từ vựng - ${ch.title}`;

  const bodyEl = document.getElementById('modal-ch-body');
  bodyEl.innerHTML = `
    <div style="background:rgba(52,152,219,0.1);border:1px solid rgba(52,152,219,0.3);border-radius:10px;padding:20px">
      <div class="flex items-center gap-12 mb-16">
        <span style="font-size:24px">✏️</span>
        <div>
          <h3 style="margin:0;font-weight:600">Nhập từ vựng cho ${ch.title}</h3>
          <p style="margin:4px 0 0 0;font-size:12px;color:var(--text-2)">Chọn cách nhập: Thủ công hoặc Import Excel/CSV</p>
        </div>
      </div>

      <div class="flex gap-12 mb-16">
        <button onclick="showManualInput('${chapterId}')" style="flex:1;padding:12px;background:var(--blue);color:white;border:none;border-radius:6px;cursor:pointer;font-weight:600">
          ✍️ Nhập Thủ Công
        </button>
        <button onclick="showImportForm('${chapterId}')" style="flex:1;padding:12px;background:var(--green);color:white;border:none;border-radius:6px;cursor:pointer;font-weight:600">
          📊 Import Excel/CSV
        </button>
        <button onclick="downloadSamplePrompt()" style="flex:1;padding:12px;background:var(--orange);color:white;border:none;border-radius:6px;cursor:pointer;font-weight:600">
          📥 Tải Sample
        </button>
      </div>

      <div id="input-container"></div>
    </div>
  `;
}

// ── Hiện form nhập thủ công ──
function showManualInput(chapterId) {
  const container = document.getElementById('input-container');
  container.innerHTML = `
    <div style="background:rgba(0,0,0,0.2);padding:16px;border-radius:8px">
      <h4 style="margin-top:0">Nhập từ vựng mới</h4>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px">
        <input id="input-chinese" type="text" placeholder="Từ tiếng Trung (e.g., 图书城)" style="padding:8px;border:1px solid var(--border);border-radius:4px">
        <input id="input-pinyin" type="text" placeholder="Pinyin (e.g., túshūchéng)" style="padding:8px;border:1px solid var(--border);border-radius:4px">
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px">
        <input id="input-hanviet" type="text" placeholder="Hán-Việt (e.g., 圖書城)" style="padding:8px;border:1px solid var(--border);border-radius:4px">
        <input id="input-vietnamese" type="text" placeholder="Nghĩa Việt (e.g., thành phố sách)" style="padding:8px;border:1px solid var(--border);border-radius:4px">
      </div>
      <textarea id="input-example" placeholder="Ví dụ tiếng Trung (e.g., 我喜欢去图书城看书。)" style="width:100%;padding:8px;border:1px solid var(--border);border-radius:4px;min-height:60px;font-family:monospace;font-size:12px"></textarea>
      <div style="margin-top:12px;display:flex;gap:8px">
        <button onclick="addManualCard('${chapterId}')" style="flex:1;padding:10px;background:var(--green);color:white;border:none;border-radius:4px;cursor:pointer;font-weight:600">
          ✅ Thêm Từ
        </button>
        <button onclick="addAnotherCard('${chapterId}')" style="flex:1;padding:10px;background:var(--blue);color:white;border:none;border-radius:4px;cursor:pointer;font-weight:600">
          ➕ Thêm Tiếp
        </button>
      </div>
    </div>
  `;
}

// ── Thêm từ thủ công ──
function addManualCard(chapterId) {
  const chinese = document.getElementById('input-chinese').value.trim();
  const pinyin = document.getElementById('input-pinyin').value.trim();
  const hanviet = document.getElementById('input-hanviet').value.trim();
  const vietnamese = document.getElementById('input-vietnamese').value.trim();
  const example = document.getElementById('input-example').value.trim();

  if (!chinese || !pinyin || !vietnamese) {
    toast('Vui lòng nhập: Từ Trung, Pinyin, Nghĩa Việt', 'error');
    return;
  }

  State.cards.push({
    id: uid(),
    chapterId: chapterId,
    chinese: chinese,
    pinyin: pinyin,
    wordType: hanviet || '',
    vietnamese: vietnamese,
    example: example,
    ef: 2.5,
    interval: 1,
    reps: 0,
    nextReview: 0
  });

  State.save();
  toast('✅ Đã thêm từ: ' + chinese, 'success');
  
  document.getElementById('input-chinese').value = '';
  document.getElementById('input-pinyin').value = '';
  document.getElementById('input-hanviet').value = '';
  document.getElementById('input-vietnamese').value = '';
  document.getElementById('input-example').value = '';
  document.getElementById('input-chinese').focus();
  
  // Cập nhật UI
  renderLibrary();
  renderDashboard();
  
  // Cập nhật flashcard deck selector để đồng bộ chương thủ công
  if (typeof refreshDeckSelect === 'function') {
    refreshDeckSelect();
  }
}

// ── Thêm từ tiếp theo ──
function addAnotherCard(chapterId) {
  addManualCard(chapterId);
  showManualInput(chapterId);
}

// ── Hiện form import Excel/CSV ──
function showImportForm(chapterId) {
  const container = document.getElementById('input-container');
  container.innerHTML = `
    <div style="background:rgba(0,0,0,0.2);padding:16px;border-radius:8px">
      <h4 style="margin-top:0">Import từ Excel/CSV</h4>
      <p style="font-size:12px;color:var(--text-2);margin:0 0 12px 0">
        Định dạng: Từ Trung | Pinyin | Hán-Việt | Nghĩa Việt | Ví dụ
      </p>
      <textarea id="import-text" placeholder="Dán nội dung CSV/Excel ở đây (mỗi dòng 1 từ)" style="width:100%;padding:8px;border:1px solid var(--border);border-radius:4px;min-height:120px;font-family:monospace;font-size:12px"></textarea>
      <div style="margin-top:12px;display:flex;gap:8px">
        <button onclick="importFromText('${chapterId}')" style="flex:1;padding:10px;background:var(--green);color:white;border:none;border-radius:4px;cursor:pointer;font-weight:600">
          📥 Import
        </button>
        <button onclick="downloadSampleCSV()" style="flex:1;padding:10px;background:var(--orange);color:white;border:none;border-radius:4px;cursor:pointer;font-weight:600">
          📥 Tải Sample CSV
        </button>
      </div>
    </div>
  `;
}

// ── Import từ text ──
function importFromText(chapterId) {
  const text = document.getElementById('import-text').value.trim();
  if (!text) {
    toast('Vui lòng dán nội dung', 'error');
    return;
  }

  const lines = text.split('\n');
  let added = 0;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const parts = trimmed.split('|').map(p => p.trim());
    if (parts.length < 4) continue;

    const [chinese, pinyin, hanviet, vietnamese, example] = parts;

    if (!chinese || !pinyin || !vietnamese) continue;

    State.cards.push({
      id: uid(),
      chapterId: chapterId,
      chinese: chinese,
      pinyin: pinyin,
      wordType: hanviet || '',
      vietnamese: vietnamese,
      example: example || '',
      ef: 2.5,
      interval: 1,
      reps: 0,
      nextReview: 0
    });

    added++;
  }

  if (added === 0) {
    toast('❌ Không tìm thấy từ nào hợp lệ', 'error');
    return;
  }

  State.save();
  renderLibrary();
  renderDashboard();
  toast(`✅ Đã import ${added} từ!`, 'success', '🎉');
  
  // Cập nhật flashcard deck selector để đồng bộ chương thủ công
  if (typeof refreshDeckSelect === 'function') {
    refreshDeckSelect();
  }
  
  // Đóng modal và mở chi tiết chương
  closeModal('modal-chapter');
  setTimeout(() => openChapter(chapterId), 300);
}

// ── Tải sample CSV ──
function downloadSampleCSV() {
  const sample = `图书城|túshūchéng|圖書城|thành phố sách|我喜欢去图书城看书。
钥匙|yàoshi|鑰匙|chìa khóa|我忘记拔下钥匙了。
忘记|wàngjì|忘記|quên|我忘记了你的名字。
拔|báo|拔|kéo ra|请拔下钥匙。
下来|xiàlai|下來|xuống|请下来帮我。
学校|xuéxiào|學校|trường học|我每天去学校。
书|shū|書|sách|这是一本好书。
城|chéng|城|thành phố|北京是一个大城。
看|kàn|看|nhìn|我喜欢看书。
去|qù|去|đi|我想去图书城。`;

  const blob = new Blob([sample], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'sample-vocabulary.csv';
  a.click();
  URL.revokeObjectURL(url);
  toast('✅ Đã tải sample CSV!', 'success');
}

// ── Tải sample prompt ──
function downloadSamplePrompt() {
  const sample = `📋 SAMPLE PROMPT - Định dạng nhập từ vựng

Định dạng: Từ Trung | Pinyin | Hán-Việt | Nghĩa Việt | Ví dụ

Hướng dẫn:
1. Từ Trung: Viết chữ Hán gốc (e.g., 图书城)
2. Pinyin: Viết pinyin có dấu (e.g., túshūchéng)
3. Hán-Việt: Viết chữ Hán tương ứng (e.g., 圖書城)
4. Nghĩa Việt: Dịch nghĩa dựa trên bài khóa (e.g., thành phố sách)
5. Ví dụ: Câu tiếng Trung sử dụng từ này (e.g., 我喜欢去图书城看书。)

Ví dụ mẫu:
图书城|túshūchéng|圖書城|thành phố sách|我喜欢去图书城看书。
钥匙|yàoshi|鑰匙|chìa khóa|我忘记拔下钥匙了。
忘记|wàngjì|忘記|quên|我忘记了你的名字。
拔|báo|拔|kéo ra|请拔下钥匙。
下来|xiàlai|下來|xuống|请下来帮我。

Lưu ý:
- Mỗi dòng 1 từ
- Dùng dấu | để phân tách các trường
- Không để trống các trường bắt buộc (Từ Trung, Pinyin, Nghĩa Việt)
- Ví dụ nên là câu thực tế hoặc từ văn chương`;

  const blob = new Blob([sample], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'sample-prompt.txt';
  a.click();
  URL.revokeObjectURL(url);
  toast('✅ Đã tải sample prompt!', 'success');
}

// ── Tạo chương mới ──
function showCreateChapterForm() {
  const modal = document.getElementById('modal-ch-body');
  if (!modal) {
    toast('Lỗi: Không tìm thấy modal', 'error');
    return;
  }

  modal.innerHTML = `
    <div style="background:rgba(46,204,113,0.1);border:1px solid rgba(46,204,113,0.3);border-radius:10px;padding:20px">
      <h3 style="margin-top:0;margin-bottom:16px">➕ Tạo chương mới</h3>
      <div style="display:flex;flex-direction:column;gap:12px">
        <div>
          <label style="font-size:12px;color:var(--text-2);display:block;margin-bottom:6px">Tên chương:</label>
          <input id="new-chapter-name" type="text" placeholder="e.g., Chương 1: Giới thiệu" style="width:100%;padding:10px;border:1px solid var(--border);border-radius:4px;font-size:14px">
        </div>
        <div style="display:flex;gap:8px">
          <button onclick="createNewChapter()" style="flex:1;padding:10px;background:var(--green);color:white;border:none;border-radius:4px;cursor:pointer;font-weight:600">
            ✅ Tạo chương
          </button>
          <button onclick="closeModal('modal-chapter')" style="flex:1;padding:10px;background:var(--bg-3);color:var(--text-2);border:1px solid var(--border);border-radius:4px;cursor:pointer;font-weight:600">
            ❌ Hủy
          </button>
        </div>
      </div>
    </div>
  `;

  openModal('modal-chapter');
}

// ── Tạo chương mới và nhập từ vựng ──
function createNewChapter() {
  const name = document.getElementById('new-chapter-name').value.trim();
  
  if (!name) {
    toast('Vui lòng nhập tên chương', 'error');
    return;
  }

  // Tạo chương mới
  const chapterId = uid();
  const newChapter = {
    id: chapterId,
    bookId: 'manual',
    title: name,
    num: State.chapters.length + 1,
    pages: 0,
    startPage: 0,
    endPage: 0,
    rawText: '',
    studied: false
  };
  
  State.chapters.push(newChapter);
  State.save();
  
  // Cập nhật UI
  renderLibrary();
  renderDashboard();
  
  // Cập nhật flashcard deck selector
  if (typeof refreshDeckSelect === 'function') {
    refreshDeckSelect();
  }
  
  toast(`✅ Đã tạo chương: ${name}`, 'success');
  
  // Đóng modal hiện tại
  closeModal('modal-chapter');
  
  // Mở form nhập từ vựng cho chương mới
  setTimeout(() => {
    aiFixChapter(chapterId);
    openModal('modal-chapter');
  }, 300);
}

// ── Chọn chương để nhập từ vựng ──
function aiFixAllChapters() {
  const chapters = State.chapters;
  if (!chapters || chapters.length === 0) {
    toast('Chưa có chương nào. Vui lòng tải PDF trước.', 'info');
    return;
  }

  // Mở modal để chọn chương
  const modal = document.getElementById('modal-ch-body');
  if (!modal) {
    toast('Lỗi: Không tìm thấy modal', 'error');
    return;
  }

  const list = chapters.map(ch => `
    <div style="padding:12px;margin:8px 0;background:rgba(52,152,219,0.1);border:1px solid rgba(52,152,219,0.3);border-radius:6px;cursor:pointer;transition:all 0.2s" onmouseover="this.style.background='rgba(52,152,219,0.2)'" onmouseout="this.style.background='rgba(52,152,219,0.1)'" onclick="aiFixChapter('${ch.id}')">
      <strong>${ch.title}</strong> <span style="color:var(--text-2);font-size:12px">(${State.cards.filter(c => c.chapterId === ch.id).length} từ)</span>
    </div>
  `).join('');

  modal.innerHTML = `
    <div style="background:rgba(52,152,219,0.1);border:1px solid rgba(52,152,219,0.3);border-radius:10px;padding:20px">
      <h3 style="margin-top:0;margin-bottom:16px">📚 Chọn chương để nhập từ vựng</h3>
      ${list}
    </div>
  `;

  // Mở modal
  openModal('modal-chapter');
}
