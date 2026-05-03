// ===== EXPORT MODULE - Xuất từ vựng sang các định dạng khác =====
// Hỗ trợ: CSV, JSON, Anki, Quizlet

// ── Xuất từ vựng của chương ──
function exportChapterVocabulary(chapterId, format = 'csv') {
  const ch = State.chapters.find(c => c.id === chapterId);
  if (!ch) {
    toast('Không tìm thấy chương', 'error');
    return;
  }

  const cards = State.cards.filter(c => c.chapterId === chapterId);
  if (!cards.length) {
    toast('Chương này không có từ vựng', 'error');
    return;
  }

  let content = '';
  let filename = `${ch.title.replace(/[^a-z0-9]/gi, '_')}_vocabulary`;
  let mimeType = 'text/plain';

  switch (format) {
    case 'csv':
      content = exportAsCSV(cards);
      filename += '.csv';
      mimeType = 'text/csv;charset=utf-8';
      break;
    case 'json':
      content = exportAsJSON(cards);
      filename += '.json';
      mimeType = 'application/json;charset=utf-8';
      break;
    case 'anki':
      content = exportAsAnki(cards);
      filename += '.txt';
      mimeType = 'text/plain;charset=utf-8';
      break;
    case 'quizlet':
      content = exportAsQuizlet(cards);
      filename += '.txt';
      mimeType = 'text/plain;charset=utf-8';
      break;
    default:
      toast('Định dạng không hỗ trợ', 'error');
      return;
  }

  downloadFile(content, filename, mimeType);
  toast(`✅ Đã xuất ${cards.length} từ vựng (${format.toUpperCase()})`, 'success');
}

// ── Xuất tất cả từ vựng ──
function exportAllVocabulary(format = 'csv') {
  if (!State.cards.length) {
    toast('Không có từ vựng nào để xuất', 'error');
    return;
  }

  let content = '';
  let filename = `all_vocabulary`;
  let mimeType = 'text/plain';

  switch (format) {
    case 'csv':
      content = exportAsCSV(State.cards);
      filename += '.csv';
      mimeType = 'text/csv;charset=utf-8';
      break;
    case 'json':
      content = exportAsJSON(State.cards);
      filename += '.json';
      mimeType = 'application/json;charset=utf-8';
      break;
    case 'anki':
      content = exportAsAnki(State.cards);
      filename += '.txt';
      mimeType = 'text/plain;charset=utf-8';
      break;
    case 'quizlet':
      content = exportAsQuizlet(State.cards);
      filename += '.txt';
      mimeType = 'text/plain;charset=utf-8';
      break;
    default:
      toast('Định dạng không hỗ trợ', 'error');
      return;
  }

  downloadFile(content, filename, mimeType);
  toast(`✅ Đã xuất ${State.cards.length} từ vựng (${format.toUpperCase()})`, 'success');
}

// ── Xuất sang CSV ──
function exportAsCSV(cards) {
  const header = 'Từ Trung,Pinyin,Hán-Việt,Nghĩa Việt,Ví dụ\n';
  const rows = cards.map(c => {
    const chinese = `"${c.chinese}"`;
    const pinyin = `"${c.pinyin || ''}"`;
    const hanviet = `"${c.wordType || ''}"`;
    const vietnamese = `"${c.vietnamese || ''}"`;
    const example = `"${c.example || ''}"`;
    return `${chinese},${pinyin},${hanviet},${vietnamese},${example}`;
  }).join('\n');
  return header + rows;
}

// ── Xuất sang JSON ──
function exportAsJSON(cards) {
  const data = cards.map(c => ({
    chinese: c.chinese,
    pinyin: c.pinyin,
    wordType: c.wordType,
    vietnamese: c.vietnamese,
    example: c.example
  }));
  return JSON.stringify(data, null, 2);
}

// ── Xuất sang Anki (TSV format) ──
function exportAsAnki(cards) {
  // Anki format: Front\tBack\tTags
  // Front: Từ Trung + Pinyin
  // Back: Nghĩa Việt + Ví dụ
  const rows = cards.map(c => {
    const front = `${c.chinese} (${c.pinyin || ''})`;
    const back = `${c.vietnamese}${c.example ? '\n\nVí dụ: ' + c.example : ''}`;
    const tags = 'chinese vocabulary';
    return `${front}\t${back}\t${tags}`;
  }).join('\n');
  return rows;
}

// ── Xuất sang Quizlet ──
function exportAsQuizlet(cards) {
  // Quizlet format: Term\tDefinition
  // Term: Từ Trung + Pinyin
  // Definition: Nghĩa Việt + Ví dụ
  const rows = cards.map(c => {
    const term = `${c.chinese} (${c.pinyin || ''})`;
    const definition = `${c.vietnamese}${c.example ? ' - ' + c.example : ''}`;
    return `${term}\t${definition}`;
  }).join('\n');
  return rows;
}

// ── Tải file ──
function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Hiện modal xuất ──
function showExportModal(chapterId) {
  const ch = State.chapters.find(c => c.id === chapterId);
  if (!ch) {
    toast('Không tìm thấy chương', 'error');
    return;
  }

  const cards = State.cards.filter(c => c.chapterId === chapterId);
  if (!cards.length) {
    toast('Chương này không có từ vựng', 'error');
    return;
  }

  const modal = document.getElementById('modal-ch-body');
  modal.innerHTML = `
    <div style="background:rgba(52,152,219,0.1);border:1px solid rgba(52,152,219,0.3);border-radius:10px;padding:20px">
      <div class="flex items-center gap-12 mb-16">
        <span style="font-size:24px">📤</span>
        <div>
          <h3 style="margin:0;font-weight:600">Xuất từ vựng</h3>
          <p style="margin:4px 0 0 0;font-size:12px;color:var(--text-2)">Chọn định dạng để xuất ${cards.length} từ vựng</p>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px">
        <button onclick="exportChapterVocabulary('${chapterId}', 'csv')" style="padding:12px;background:var(--blue);color:white;border:none;border-radius:6px;cursor:pointer;font-weight:600;text-align:left">
          📊 CSV
          <div style="font-size:11px;font-weight:400;margin-top:4px">Cho Excel, Google Sheets</div>
        </button>
        <button onclick="exportChapterVocabulary('${chapterId}', 'json')" style="padding:12px;background:var(--blue);color:white;border:none;border-radius:6px;cursor:pointer;font-weight:600;text-align:left">
          {} JSON
          <div style="font-size:11px;font-weight:400;margin-top:4px">Cho lập trình viên</div>
        </button>
        <button onclick="exportChapterVocabulary('${chapterId}', 'anki')" style="padding:12px;background:var(--green);color:white;border:none;border-radius:6px;cursor:pointer;font-weight:600;text-align:left">
          🎴 Anki
          <div style="font-size:11px;font-weight:400;margin-top:4px">Flashcard app</div>
        </button>
        <button onclick="exportChapterVocabulary('${chapterId}', 'quizlet')" style="padding:12px;background:var(--green);color:white;border:none;border-radius:6px;cursor:pointer;font-weight:600;text-align:left">
          📚 Quizlet
          <div style="font-size:11px;font-weight:400;margin-top:4px">Learning platform</div>
        </button>
      </div>

      <div style="margin-top:16px;padding:12px;background:rgba(0,0,0,0.2);border-radius:6px;font-size:12px;color:var(--text-2)">
        <strong>Hướng dẫn:</strong>
        <ul style="margin:8px 0 0 0;padding-left:20px">
          <li><strong>CSV:</strong> Mở trong Excel, Google Sheets, hoặc import vào Anki</li>
          <li><strong>JSON:</strong> Dùng cho lập trình hoặc ứng dụng tùy chỉnh</li>
          <li><strong>Anki:</strong> Import trực tiếp vào Anki Desktop</li>
          <li><strong>Quizlet:</strong> Copy-paste vào Quizlet.com</li>
        </ul>
      </div>

      <div style="margin-top:16px;display:flex;gap:8px">
        <button onclick="closeModal('modal-chapter')" style="flex:1;padding:10px;background:var(--bg-3);color:var(--text-2);border:1px solid var(--border);border-radius:4px;cursor:pointer;font-weight:600">
          ❌ Đóng
        </button>
      </div>
    </div>
  `;

  openModal('modal-chapter');
}

// ── Hiện modal xuất tất cả ──
function showExportAllModal() {
  if (!State.cards.length) {
    toast('Không có từ vựng nào để xuất', 'error');
    return;
  }

  const modal = document.getElementById('modal-ch-body');
  modal.innerHTML = `
    <div style="background:rgba(52,152,219,0.1);border:1px solid rgba(52,152,219,0.3);border-radius:10px;padding:20px">
      <div class="flex items-center gap-12 mb-16">
        <span style="font-size:24px">📤</span>
        <div>
          <h3 style="margin:0;font-weight:600">Xuất tất cả từ vựng</h3>
          <p style="margin:4px 0 0 0;font-size:12px;color:var(--text-2)">Chọn định dạng để xuất ${State.cards.length} từ vựng</p>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px">
        <button onclick="exportAllVocabulary('csv')" style="padding:12px;background:var(--blue);color:white;border:none;border-radius:6px;cursor:pointer;font-weight:600;text-align:left">
          📊 CSV
          <div style="font-size:11px;font-weight:400;margin-top:4px">Cho Excel, Google Sheets</div>
        </button>
        <button onclick="exportAllVocabulary('json')" style="padding:12px;background:var(--blue);color:white;border:none;border-radius:6px;cursor:pointer;font-weight:600;text-align:left">
          {} JSON
          <div style="font-size:11px;font-weight:400;margin-top:4px">Cho lập trình viên</div>
        </button>
        <button onclick="exportAllVocabulary('anki')" style="padding:12px;background:var(--green);color:white;border:none;border-radius:6px;cursor:pointer;font-weight:600;text-align:left">
          🎴 Anki
          <div style="font-size:11px;font-weight:400;margin-top:4px">Flashcard app</div>
        </button>
        <button onclick="exportAllVocabulary('quizlet')" style="padding:12px;background:var(--green);color:white;border:none;border-radius:6px;cursor:pointer;font-weight:600;text-align:left">
          📚 Quizlet
          <div style="font-size:11px;font-weight:400;margin-top:4px">Learning platform</div>
        </button>
      </div>

      <div style="margin-top:16px;padding:12px;background:rgba(0,0,0,0.2);border-radius:6px;font-size:12px;color:var(--text-2)">
        <strong>Hướng dẫn:</strong>
        <ul style="margin:8px 0 0 0;padding-left:20px">
          <li><strong>CSV:</strong> Mở trong Excel, Google Sheets, hoặc import vào Anki</li>
          <li><strong>JSON:</strong> Dùng cho lập trình hoặc ứng dụng tùy chỉnh</li>
          <li><strong>Anki:</strong> Import trực tiếp vào Anki Desktop</li>
          <li><strong>Quizlet:</strong> Copy-paste vào Quizlet.com</li>
        </ul>
      </div>

      <div style="margin-top:16px;display:flex;gap:8px">
        <button onclick="closeModal('modal-chapter')" style="flex:1;padding:10px;background:var(--bg-3);color:var(--text-2);border:1px solid var(--border);border-radius:4px;cursor:pointer;font-weight:600">
          ❌ Đóng
        </button>
      </div>
    </div>
  `;

  openModal('modal-chapter');
}
