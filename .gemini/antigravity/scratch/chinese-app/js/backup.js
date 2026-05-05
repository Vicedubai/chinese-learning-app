// ===== BACKUP & RESTORE (Local + Online via JSONBin.io) =====
// JSONBin.io: miễn phí, 10,000 requests/tháng, không cần server
// Đăng ký tại https://jsonbin.io → lấy Master Key → dán vào ô cài đặt

const BACKUP_KEY = 'chinese-app-backup-ts';
const JSONBIN_KEY_STORE = 'jsonbin-master-key';
const JSONBIN_BIN_STORE = 'jsonbin-bin-id';
const AUTO_BACKUP_INTERVAL = 5 * 60 * 1000;

// ── BUILD PAYLOAD ──
function buildPayload() {
  return {
    version: 2,
    exportedAt: new Date().toISOString(),
    chapters: State.chapters.map(ch => { const c = {...ch}; delete c.rawText; return c; }), // bỏ rawText để nhỏ gọn
    cards: State.cards,
    progress: { xp: State.progress.xp, streak: State.progress.streak, results: (State.progress.results || []).slice(-300) },
  };
}

// ══════════════════════════════════════════════
//  LOCAL BACKUP (JSON file download/upload)
// ══════════════════════════════════════════════
function exportBackup() {
  const data = buildPayload();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `tiengtrung-backup-${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  DB.set(BACKUP_KEY, Date.now());
  toast('✅ Đã lưu file backup!', 'success', '💾');
}

function importBackup(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      mergeData(JSON.parse(e.target.result));
    } catch (err) {
      toast('❌ File không hợp lệ: ' + err.message, 'error');
    }
  };
  reader.readAsText(file);
}

// ══════════════════════════════════════════════
//  ONLINE BACKUP — JSONBin.io
// ══════════════════════════════════════════════
function getJSONBinKey() { return localStorage.getItem(JSONBIN_KEY_STORE) || ''; }
function getJSONBinId()  { return localStorage.getItem(JSONBIN_BIN_STORE) || ''; }

async function onlineSave() {
  const key = getJSONBinKey();
  if (!key) { openModal('modal-backup-settings'); toast('Hãy nhập JSONBin API Key trước', 'info', '🔑'); return; }

  setOnlineStatus('saving');
  try {
    const payload = buildPayload();
    const binId = getJSONBinId();

    let res;
    if (binId) {
      // Cập nhật bin hiện có (PUT)
      res = await fetch(`https://api.jsonbin.io/v3/b/${binId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'X-Master-Key': key },
        body: JSON.stringify(payload),
      });
    } else {
      // Tạo bin mới (POST)
      res = await fetch('https://api.jsonbin.io/v3/b', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Master-Key': key, 'X-Bin-Name': 'TiengTrung-Backup', 'X-Bin-Private': 'true' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const json = await res.json();
        localStorage.setItem(JSONBIN_BIN_STORE, json.metadata.id);
        document.getElementById('jsonbin-bin-id-display').textContent = json.metadata.id;
      }
    }

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    DB.set(BACKUP_KEY, Date.now());
    setOnlineStatus('saved');
    toast('☁️ Đã lưu online thành công!', 'success', '☁️');
    updateLastBackupTime();
  } catch (e) {
    setOnlineStatus('error');
    toast('❌ Lỗi lưu online: ' + e.message, 'error');
  }
}

async function onlineLoad() {
  const key = getJSONBinKey();
  const binId = getJSONBinId();
  if (!key || !binId) { openModal('modal-backup-settings'); toast('Hãy nhập API Key và Bin ID', 'info', '🔑'); return; }

  setOnlineStatus('loading');
  try {
    const res = await fetch(`https://api.jsonbin.io/v3/b/${binId}/latest`, {
      headers: { 'X-Master-Key': key },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    mergeData(json.record);
    setOnlineStatus('saved');
    toast('☁️ Đã tải dữ liệu từ cloud!', 'success', '🎉');
  } catch (e) {
    setOnlineStatus('error');
    toast('❌ Lỗi tải dữ liệu: ' + e.message, 'error');
  }
}

function setOnlineStatus(status) {
  const el = document.getElementById('online-status');
  if (!el) return;
  const map = {
    saved:   { icon: '☁️', text: 'Đã lưu online', color: 'var(--green-light)' },
    saving:  { icon: '⏳', text: 'Đang lưu...', color: 'var(--gold)' },
    loading: { icon: '⏳', text: 'Đang tải...', color: 'var(--gold)' },
    error:   { icon: '❌', text: 'Lỗi kết nối', color: 'var(--red-light)' },
    none:    { icon: '⚪', text: 'Chưa lưu online', color: 'var(--text-3)' },
  };
  const s = map[status] || map.none;
  el.innerHTML = `<span style="color:${s.color}">${s.icon} ${s.text}</span>`;
}

function updateLastBackupTime() {
  const el = document.getElementById('last-backup-time');
  if (!el) return;
  const ts = DB.get(BACKUP_KEY, 0);
  el.textContent = ts ? '🕐 ' + formatVietnamDate(new Date(ts)) + ' ' + formatVietnamTime(new Date(ts), 'HH:mm') : 'Chưa có';
}

// ── SETTINGS MODAL ──
function saveBackupSettings() {
  const key = document.getElementById('input-jsonbin-key').value.trim();
  const binId = document.getElementById('input-jsonbin-bin').value.trim();
  if (key) localStorage.setItem(JSONBIN_KEY_STORE, key);
  if (binId) localStorage.setItem(JSONBIN_BIN_STORE, binId);
  closeModal('modal-backup-settings');
  toast('✅ Đã lưu cài đặt!', 'success');
  if (key) setOnlineStatus('none');
}

function openBackupSettings() {
  document.getElementById('input-jsonbin-key').value = getJSONBinKey();
  document.getElementById('input-jsonbin-bin').value = getJSONBinId();
  const binId = getJSONBinId();
  document.getElementById('jsonbin-bin-id-display').textContent = binId || '(chưa có - sẽ tạo tự động khi lưu lần đầu)';
  openModal('modal-backup-settings');
}

// ── MERGE DATA (dùng cho cả local và online restore) ──
function mergeData(data) {
  if (!data || !data.version) throw new Error('Định dạng không hợp lệ');
  const existingChIds = new Set(State.chapters.map(c => c.id));
  const existingCardIds = new Set(State.cards.map(c => c.id));
  let addedCh = 0, addedCards = 0;
  (data.chapters || []).forEach(ch => { if (!existingChIds.has(ch.id)) { State.chapters.push(ch); addedCh++; } });
  (data.cards || []).forEach(c => { if (!existingCardIds.has(c.id)) { State.cards.push(c); addedCards++; } });
  const existingTs = new Set((State.progress.results || []).map(r => r.t));
  (data.progress?.results || []).forEach(r => { if (!existingTs.has(r.t)) State.progress.results.push(r); });
  State.progress.xp = Math.max(State.progress.xp || 0, data.progress?.xp || 0);
  State.save();
  renderLibrary(); renderDashboard(); updateXPBar();
  checkStorageUsage();
  toast(`✅ Khôi phục: +${addedCh} chương, +${addedCards} thẻ!`, 'success', '🎉');
}

// ── STORAGE MONITOR ──
function checkStorageUsage() {
  try {
    let total = 0;
    for (const k of Object.keys(localStorage)) total += (localStorage.getItem(k) || '').length * 2;
    const pct = Math.round(total / (5 * 1024 * 1024) * 100);
    const mb = (total / 1024 / 1024).toFixed(2);
    const bar = document.getElementById('storage-bar');
    const txt = document.getElementById('storage-text');
    if (bar) { bar.style.width = Math.min(100, pct) + '%'; bar.style.background = pct > 80 ? 'var(--red)' : pct > 55 ? 'var(--gold)' : 'var(--green)'; }
    if (txt) txt.textContent = `${mb} MB / ~5 MB (${pct}%)`;
    if (pct > 85) toast('⚠️ Bộ nhớ gần đầy! Hãy lưu online và nén dữ liệu.', 'error', '⚠️');
  } catch {}
}

function compressChapterData() {
  if (!confirm('Xóa nội dung trang PDF đã scan (rawText) để giải phóng bộ nhớ?\nTừ vựng và tiến độ học sẽ được GIỮ NGUYÊN.')) return;
  let freed = 0;
  State.chapters.forEach(ch => { if (ch.rawText) { freed += ch.rawText.length; delete ch.rawText; } });
  State.save();
  toast(`♻️ Đã giải phóng ~${(freed * 2 / 1024 / 1024).toFixed(2)} MB!`, 'success', '♻️');
  checkStorageUsage();
}

// ── AUTO BACKUP REMINDER ──
function startAutoBackupReminder() {
  setInterval(() => {
    const last = DB.get(BACKUP_KEY, 0);
    if (State.cards.length > 5 && (Date.now() - last) > 30 * 60 * 1000) showBackupReminder();
  }, AUTO_BACKUP_INTERVAL);
}

function showBackupReminder() { const b = document.getElementById('backup-banner'); if (b) b.style.display = 'flex'; }
function hideBackupBanner() { const b = document.getElementById('backup-banner'); if (b) b.style.display = 'none'; DB.set(BACKUP_KEY, Date.now()); }

// ── INIT ──
function setupBackup() {
  document.getElementById('backup-import-input').addEventListener('change', e => { importBackup(e.target.files[0]); e.target.value = ''; });
  const binId = getJSONBinId();
  const key = getJSONBinKey();
  setOnlineStatus(binId && key ? 'none' : 'none');
  updateLastBackupTime();
  checkStorageUsage();
  startAutoBackupReminder();
  if (State.cards.length > 10 && !DB.get(BACKUP_KEY, 0)) setTimeout(showBackupReminder, 3000);
}
