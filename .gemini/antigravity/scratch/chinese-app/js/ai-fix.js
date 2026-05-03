// ===== AI FIX MODULE - Manual Input + Excel/CSV Import =====
// Nh?p th? công ho?c import t? Excel/CSV
// Không quét PDF (dã luu t? d?ng)

// -- S?a 1 chuong b?ng nh?p th? công --
function aiFixChapter(chapterId) {
  const ch = State.chapters.find(c => c.id === chapterId);
  if (!ch) {
    toast('Không tìm th?y chuong', 'error');
    return;
  }

  // C?p nh?t tiêu d? modal
  const titleEl = document.getElementById('modal-ch-title');
  if (titleEl) titleEl.textContent = `Nh?p t? v?ng - ${ch.title}`;

  const bodyEl = document.getElementById('modal-ch-body');
  bodyEl.innerHTML = `
    <div style="background:rgba(52,152,219,0.1);border:1px solid rgba(52,152,219,0.3);border-radius:10px;padding:20px">
      <div class="flex items-center gap-12 mb-16">
        <span style="font-size:24px">??</span>
        <div>
          <h3 style="margin:0;font-weight:600">Nh?p t? v?ng cho ${ch.title}</h3>
          <p style="margin:4px 0 0 0;font-size:12px;color:var(--text-2)">Ch?n cách nh?p: Th? công ho?c Import Excel/CSV</p>
        </div>
      </div>

      <div class="flex gap-12 mb-16">
        <button onclick="showManualInput('${chapterId}')" style="flex:1;padding:12px;background:var(--blue);color:white;border:none;border-radius:6px;cursor:pointer;font-weight:600">
          ?? Nh?p Th? Công
        </button>
        <button onclick="showImportForm('${chapterId}')" style="flex:1;padding:12px;background:var(--green);color:white;border:none;border-radius:6px;cursor:pointer;font-weight:600">
          ?? Import Excel/CSV
        </button>
        <button onclick="downloadSamplePrompt()" style="flex:1;padding:12px;background:var(--orange);color:white;border:none;border-radius:6px;cursor:pointer;font-weight:600">
          ?? T?i Sample
        </button>
      </div>

      <div id="input-container"></div>
    </div>
  `;
}

// -- Hi?n form nh?p th? công --
function showManualInput(chapterId) {
  const container = document.getElementById('input-container');
  container.innerHTML = `
    <div style="background:rgba(0,0,0,0.2);padding:16px;border-radius:8px">
      <h4 style="margin-top:0">Nh?p t? v?ng m?i</h4>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px">
        <input id="input-chinese" type="text" placeholder="T? ti?ng Trung (e.g., ???)" style="padding:8px;border:1px solid var(--border);border-radius:4px">
        <input id="input-pinyin" type="text" placeholder="Pinyin (e.g., túshuchéng)" style="padding:8px;border:1px solid var(--border);border-radius:4px">
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px">
        <input id="input-hanviet" type="text" placeholder="Hán-Vi?t (e.g., ???)" style="padding:8px;border:1px solid var(--border);border-radius:4px">
        <input id="input-vietnamese" type="text" placeholder="Nghia Vi?t (e.g., thành ph? sách)" style="padding:8px;border:1px solid var(--border);border-radius:4px">
      </div>
      <textarea id="input-example" placeholder="Ví d? ti?ng Trung (e.g., ??????????)" style="width:100%;padding:8px;border:1px solid var(--border);border-radius:4px;min-height:60px;font-family:monospace;font-size:12px"></textarea>
      <div style="margin-top:12px;display:flex;gap:8px">
        <button onclick="addManualCard('${chapterId}')" style="flex:1;padding:10px;background:var(--green);color:white;border:none;border-radius:4px;cursor:pointer;font-weight:600">
          ? Thêm T?
        </button>
        <button onclick="addAnotherCard('${chapterId}')" style="flex:1;padding:10px;background:var(--blue);color:white;border:none;border-radius:4px;cursor:pointer;font-weight:600">
          ? Thêm Ti?p
        </button>
      </div>
    </div>
  `;
}

// -- Thêm t? th? công --
function addManualCard(chapterId) {
  const chinese = document.getElementById('input-chinese').value.trim();
  const pinyin = document.getElementById('input-pinyin').value.trim();
  const hanviet = document.getElementById('input-hanviet').value.trim();
  const vietnamese = document.getElementById('input-vietnamese').value.trim();
  const example = document.getElementById('input-example').value.trim();

  if (!chinese || !pinyin || !vietnamese) {
    toast('Vui lòng nh?p: T? Trung, Pinyin, Nghia Vi?t', 'error');
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
  toast('? Ðã thêm t?: ' + chinese, 'success');
  
  document.getElementById('input-chinese').value = '';
  document.getElementById('input-pinyin').value = '';
  document.getElementById('input-hanviet').value = '';
  document.getElementById('input-vietnamese').value = '';
  document.getElementById('input-example').value = '';
  document.getElementById('input-chinese').focus();
  
  // C?p nh?t UI
  renderLibrary();
  renderDashboard();
  
  // C?p nh?t flashcard deck selector d? d?ng b? chuong th? công
  if (typeof refreshDeckSelect === 'function') {
    refreshDeckSelect();
  }
}

// -- Thêm t? ti?p theo --
function addAnotherCard(chapterId) {
  addManualCard(chapterId);
  showManualInput(chapterId);
}

// -- Hi?n form import Excel/CSV --
function showImportForm(chapterId) {
  const container = document.getElementById('input-container');
  container.innerHTML = `
    <div style="background:rgba(0,0,0,0.2);padding:16px;border-radius:8px">
      <h4 style="margin-top:0">Import t? Excel/CSV</h4>
      <p style="font-size:12px;color:var(--text-2);margin:0 0 12px 0">
        Ð?nh d?ng: T? Trung | Pinyin | Hán-Vi?t | Nghia Vi?t | Ví d?
      </p>
      <textarea id="import-text" placeholder="Dán n?i dung CSV/Excel ? dây (m?i dòng 1 t?)" style="width:100%;padding:8px;border:1px solid var(--border);border-radius:4px;min-height:120px;font-family:monospace;font-size:12px"></textarea>
      <div style="margin-top:12px;display:flex;gap:8px">
        <button onclick="importFromText('${chapterId}')" style="flex:1;padding:10px;background:var(--green);color:white;border:none;border-radius:4px;cursor:pointer;font-weight:600">
          ?? Import
        </button>
        <button onclick="downloadSampleCSV()" style="flex:1;padding:10px;background:var(--orange);color:white;border:none;border-radius:4px;cursor:pointer;font-weight:600">
          ?? T?i Sample CSV
        </button>
      </div>
    </div>
  `;
}

// -- Import t? text --
function importFromText(chapterId) {
  const text = document.getElementById('import-text').value.trim();
  if (!text) {
    toast('Vui lòng dán n?i dung', 'error');
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
    toast('? Không tìm th?y t? nào h?p l?', 'error');
    return;
  }

  State.save();
  renderLibrary();
  renderDashboard();
  toast(`? Ðã import ${added} t?!`, 'success', '??');
  
  // C?p nh?t flashcard deck selector d? d?ng b? chuong th? công
  if (typeof refreshDeckSelect === 'function') {
    refreshDeckSelect();
  }
  
  // Ðóng modal và m? chi ti?t chuong
  closeModal('modal-chapter');
  setTimeout(() => openChapter(chapterId), 300);
}

// -- T?i sample CSV --
function downloadSampleCSV() {
  const sample = `???|túshuchéng|???|thành ph? sách|??????????
??|yàoshi|??|chìa khóa|?????????
??|wàngjì|??|quên|?????????
?|báo|?|kéo ra|??????
??|xiàlai|??|xu?ng|??????
??|xuéxiào|??|tru?ng h?c|???????
?|shu|?|sách|???????
?|chéng|?|thành ph?|????????
?|kàn|?|nhìn|??????
?|qù|?|di|???????`;

  const blob = new Blob([sample], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'sample-vocabulary.csv';
  a.click();
  URL.revokeObjectURL(url);
  toast('? Ðã t?i sample CSV!', 'success');
}

// -- T?i sample prompt --
function downloadSamplePrompt() {
  const sample = `?? SAMPLE PROMPT - Ð?nh d?ng nh?p t? v?ng

Ð?nh d?ng: T? Trung | Pinyin | Hán-Vi?t | Nghia Vi?t | Ví d?

Hu?ng d?n:
1. T? Trung: Vi?t ch? Hán g?c (e.g., ???)
2. Pinyin: Vi?t pinyin có d?u (e.g., túshuchéng)
3. Hán-Vi?t: Vi?t ch? Hán tuong ?ng (e.g., ???)
4. Nghia Vi?t: D?ch nghia d?a trên bài khóa (e.g., thành ph? sách)
5. Ví d?: Câu ti?ng Trung s? d?ng t? này (e.g., ??????????)

Ví d? m?u:
???|túshuchéng|???|thành ph? sách|??????????
??|yàoshi|??|chìa khóa|?????????
??|wàngjì|??|quên|?????????
?|báo|?|kéo ra|??????
??|xiàlai|??|xu?ng|??????

Luu ý:
- M?i dòng 1 t?
- Dùng d?u | d? phân tách các tru?ng
- Không d? tr?ng các tru?ng b?t bu?c (T? Trung, Pinyin, Nghia Vi?t)
- Ví d? nên là câu th?c t? ho?c t? van chuong`;

  const blob = new Blob([sample], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'sample-prompt.txt';
  a.click();
  URL.revokeObjectURL(url);
  toast('? Ðã t?i sample prompt!', 'success');
}

// -- T?o chuong m?i --
function showCreateChapterForm() {
  const modal = document.getElementById('modal-ch-body');
  if (!modal) {
    toast('L?i: Không tìm th?y modal', 'error');
    return;
  }

  modal.innerHTML = `
    <div style="background:rgba(46,204,113,0.1);border:1px solid rgba(46,204,113,0.3);border-radius:10px;padding:20px">
      <h3 style="margin-top:0;margin-bottom:16px">? T?o chuong m?i</h3>
      <div style="display:flex;flex-direction:column;gap:12px">
        <div>
          <label style="font-size:12px;color:var(--text-2);display:block;margin-bottom:6px">Tên chuong:</label>
          <input id="new-chapter-name" type="text" placeholder="e.g., Chuong 1: Gi?i thi?u" style="width:100%;padding:10px;border:1px solid var(--border);border-radius:4px;font-size:14px">
        </div>
        <div style="display:flex;gap:8px">
          <button onclick="createNewChapter()" style="flex:1;padding:10px;background:var(--green);color:white;border:none;border-radius:4px;cursor:pointer;font-weight:600">
            ? T?o chuong
          </button>
          <button onclick="closeModal('modal-chapter')" style="flex:1;padding:10px;background:var(--bg-3);color:var(--text-2);border:1px solid var(--border);border-radius:4px;cursor:pointer;font-weight:600">
            ? H?y
          </button>
        </div>
      </div>
    </div>
  `;

  openModal('modal-chapter');
}

// -- T?o chuong m?i và nh?p t? v?ng --
function createNewChapter() {
  const name = document.getElementById('new-chapter-name').value.trim();
  
  if (!name) {
    toast('Vui lòng nh?p tên chuong', 'error');
    return;
  }

  // T?o chuong m?i
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
  
  // C?p nh?t UI
  renderLibrary();
  renderDashboard();
  
  // C?p nh?t flashcard deck selector
  if (typeof refreshDeckSelect === 'function') {
    refreshDeckSelect();
  }
  
  toast(`? Ðã t?o chuong: ${name}`, 'success');
  
  // Ðóng modal hi?n t?i
  closeModal('modal-chapter');
  
  // M? form nh?p t? v?ng cho chuong m?i
  setTimeout(() => {
    aiFixChapter(chapterId);
    openModal('modal-chapter');
  }, 300);
}

// -- Ch?n chuong d? nh?p t? v?ng --
function aiFixAllChapters() {
  const chapters = State.chapters;
  if (!chapters || chapters.length === 0) {
    toast('Chua có chuong nào. Vui lòng t?i PDF tru?c.', 'info');
    return;
  }

  // M? modal d? ch?n chuong
  const modal = document.getElementById('modal-ch-body');
  if (!modal) {
    toast('L?i: Không tìm th?y modal', 'error');
    return;
  }

  const list = chapters.map(ch => `
    <div style="padding:12px;margin:8px 0;background:rgba(52,152,219,0.1);border:1px solid rgba(52,152,219,0.3);border-radius:6px;cursor:pointer;transition:all 0.2s" onmouseover="this.style.background='rgba(52,152,219,0.2)'" onmouseout="this.style.background='rgba(52,152,219,0.1)'" onclick="aiFixChapter('${ch.id}')">
      <strong>${ch.title}</strong> <span style="color:var(--text-2);font-size:12px">(${State.cards.filter(c => c.chapterId === ch.id).length} t?)</span>
    </div>
  `).join('');

  modal.innerHTML = `
    <div style="background:rgba(52,152,219,0.1);border:1px solid rgba(52,152,219,0.3);border-radius:10px;padding:20px">
      <h3 style="margin-top:0;margin-bottom:16px">?? Ch?n chuong d? nh?p t? v?ng</h3>
      ${list}
    </div>
  `;

  // M? modal
  openModal('modal-chapter');
}
