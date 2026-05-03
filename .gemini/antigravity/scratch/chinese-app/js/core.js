// ===== CONFIGURATION =====
window.API_BASE_URL = window.API_BASE_URL || 'https://chinese-learning-app-production.up.railway.app'; // URL Server Railway

// ===== STORAGE =====
const DB = {
  get: (key, def = null) => { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : def; } catch { return def; } },
  set: (key, val) => { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} },
  merge: (key, patch) => { DB.set(key, { ...DB.get(key, {}), ...patch }); }
};

// ===== SM-2 ALGORITHM =====
const SM2 = {
  // q: 0-5 quality rating
  review(card, q) {
    let { ef = 2.5, interval = 1, reps = 0 } = card;
    if (q < 3) { reps = 0; interval = 1; }
    else {
      if (reps === 0) interval = 1;
      else if (reps === 1) interval = 6;
      else interval = Math.round(interval * ef);
      reps++;
    }
    ef = Math.max(1.3, ef + 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
    const nextReview = Date.now() + interval * 86400000;
    return { ef, interval, reps, nextReview };
  },
  isDue(card) { return !card.nextReview || Date.now() >= card.nextReview; }
};

// ===== APP STATE =====
const State = {
  books: DB.get('books', []),
  chapters: DB.get('chapters', []),
  cards: DB.get('cards', []),
  dictationPlaylist: DB.get('dictationPlaylist', []),
  progress: DB.get('progress', { xp: 0, streak: 0, lastStudy: null, results: [] }),
  session: DB.get('session', { 
    currentTask: null,
    flashcardIndex: 0,
    flashcardQueue: [],
    dictationIndex: 0,
    dictationQueue: [],
    exerciseIndex: 0,
    exerciseQueue: [],
    exerciseAnswers: {},
    dictationInput: '',
    exerciseInput: ''
  }),
  save() {
    DB.set('books', this.books);
    DB.set('chapters', this.chapters);
    DB.set('cards', this.cards);
    DB.set('dictationPlaylist', this.dictationPlaylist);
    DB.set('progress', this.progress);
    DB.set('session', this.session);
  },
  saveSession(data) {
    this.session = { ...this.session, ...data };
    DB.set('session', this.session);
  },
  clearSession() {
    this.session = { 
      currentTask: null,
      flashcardIndex: 0,
      flashcardQueue: [],
      dictationIndex: 0,
      dictationQueue: [],
      exerciseIndex: 0,
      exerciseQueue: [],
      exerciseAnswers: {},
      dictationInput: '',
      exerciseInput: ''
    };
    DB.set('session', this.session);
  },
  async sync() {
    try {
      const res = await fetch(`${window.API_BASE_URL}/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ books: this.books, chapters: this.chapters, cards: this.cards, dictationPlaylist: this.dictationPlaylist, progress: this.progress })
      });
      if (res.ok) toast('☁️ Đã đồng bộ dữ liệu lên Server (SQLite)', 'success');
    } catch (e) {
      toast('Cần bật Server Python để đồng bộ dữ liệu!', 'error');
    }
  },
  async loadFromCloud() {
    try {
      const res = await fetch(`${window.API_BASE_URL}/load`);
      if (res.ok) {
        const data = await res.json();
        if (Object.keys(data).length === 0) return;
        this.books = data.books || [];
        this.chapters = data.chapters || [];
        this.cards = data.cards || [];
        this.dictationPlaylist = data.dictationPlaylist || [];
        this.progress = data.progress || this.progress;
        this.save();
        toast('☁️ Đã tải dữ liệu từ Server thành công!', 'success');
        if (typeof renderLibrary === 'function') renderLibrary();
        if (typeof renderDashboard === 'function') renderDashboard();
        if (typeof renderDictationPlaylist === 'function') renderDictationPlaylist();
      }
    } catch (e) { console.log('Backend not available for auto-load'); }
  },
  addXP(n) {
    this.progress.xp = (this.progress.xp || 0) + n;
    this.save();
    updateXPBar();
    if (this.progress.xp % 50 === 0) this.sync(); // Auto-sync mỗi 50 XP
  },
  logResult(type, correct, cardId = null) {
    this.progress.results.push({ type, correct, cardId, t: Date.now() });
    if (this.progress.results.length > 500) this.progress.results.shift();
    this.save();
  },
  getDueCards() { return this.cards.filter(c => SM2.isDue(c)); },
  reviewCard(id, q) {
    const c = this.cards.find(c => c.id === id);
    if (!c) return;
    Object.assign(c, SM2.review(c, q));
    this.save();
  }
};

// ===== TOAST =====
function toast(msg, type = 'info', icon = '💬') {
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<span>${icon}</span><span>${msg}</span>`;
  document.getElementById('toast-container').appendChild(el);
  setTimeout(() => el.remove(), 3000);
}

// ===== NAVIGATION =====
function navigate(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const pg = document.getElementById(`page-${page}`);
  if (pg) pg.classList.add('active');
  const nav = document.querySelector(`[data-page="${page}"]`);
  if (nav) nav.classList.add('active');
  currentPage = page;
  
  // Restore session if available
  const session = State.session;
  if (session.currentTask === 'flashcard' && page === 'flashcards' && session.flashcardQueue.length > 0) {
    fcQueue = session.flashcardQueue;
    fcIndex = session.flashcardIndex;
    const countEl = document.getElementById('fc-count');
    const emptyEl = document.getElementById('fc-empty');
    const sessionEl = document.getElementById('fc-session');
    if (countEl) countEl.textContent = fcQueue.length;
    if (emptyEl) emptyEl.style.display = 'none';
    if (sessionEl) sessionEl.style.display = 'block';
    fcAutoAdvanceEnabled = false;
    const autoplayCheckbox = document.getElementById('fc-autoplay');
    if (autoplayCheckbox && !autoplayCheckbox.checked) {
      autoplayCheckbox.checked = true;
    }
    document.getElementById('fc-autoadvance').checked = false;
    setupFlashcardKeyboard();
    showCard();
    toast('📚 Tiếp tục phiên học trước đó', 'info', '🔄');
  } else if (session.currentTask === 'exercise' && page === 'mini-tests' && session.exerciseQueue.length > 0) {
    exState = { 
      type: session.exerciseType, 
      idx: session.exerciseIndex, 
      score: session.exerciseScore, 
      total: session.exerciseTotal, 
      pool: session.exerciseQueue, 
      answered: false 
    };
    document.getElementById('ex-type-select').style.display = 'none';
    document.getElementById('ex-session').style.display = 'block';
    document.getElementById('ex-result').style.display = 'none';
    showExercise();
    toast('📝 Tiếp tục bài tập trước đó', 'info', '🔄');
  } else if (session.currentTask === 'dictation' && page === 'dictation' && session.dictationQueue.length > 0) {
    dictSentences = session.dictationQueue;
    dictIdx = session.dictationIndex;
    dictScores = [];
    const setupCard = document.getElementById('dict-setup-card');
    const reopenBtn = document.getElementById('dict-reopen-setup');
    if (setupCard && reopenBtn) {
      setupCard.style.display = 'none';
      reopenBtn.style.display = 'flex';
    }
    renderDictationQuestion();
    if (session.dictationInput) {
      const input = document.getElementById('dict-user-input');
      if (input) input.value = session.dictationInput;
    }
    toast('🎧 Tiếp tục bài nghe chép trước đó', 'info', '🔄');
  } else {
    if (page === 'flashcards') renderFlashcards();
    if (page === 'diagnostic') renderDiagnostic();
    if (page === 'library') renderLibrary();
    if (page === 'dashboard') renderDashboard();
  }
}
let currentPage = 'dashboard';

function updateXPBar() {
  const xp = State.progress.xp || 0;
  const level = Math.floor(xp / 100) + 1;
  const pct = (xp % 100);
  const bar = document.getElementById('xp-bar');
  const lvl = document.getElementById('xp-level');
  const xpTxt = document.getElementById('xp-text');
  if (bar) bar.style.width = pct + '%';
  if (lvl) lvl.textContent = `Cấp ${level}`;
  if (xpTxt) xpTxt.textContent = `${xp % 100}/100 XP`;
}

// ===== UNIQUE ID =====
function uid() { return Math.random().toString(36).slice(2) + Date.now().toString(36); }

// ===== MOBILE MENU =====
function initMobileMenu() {
  // Create mobile menu button if not exists
  if (!document.querySelector('.mobile-menu-btn')) {
    const menuBtn = document.createElement('button');
    menuBtn.className = 'mobile-menu-btn';
    menuBtn.innerHTML = '☰';
    menuBtn.style.display = window.innerWidth <= 600 ? 'flex' : 'none';
    document.body.appendChild(menuBtn);
    
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'mobile-overlay';
    document.body.appendChild(overlay);
    
    // Toggle sidebar
    menuBtn.addEventListener('click', () => {
      const sidebar = document.getElementById('sidebar');
      sidebar.classList.toggle('mobile-open');
      overlay.classList.toggle('active');
    });
    
    // Close on overlay click
    overlay.addEventListener('click', () => {
      const sidebar = document.getElementById('sidebar');
      sidebar.classList.remove('mobile-open');
      overlay.classList.remove('active');
    });
    
    // Close sidebar when nav item clicked on mobile
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', () => {
        if (window.innerWidth <= 600) {
          const sidebar = document.getElementById('sidebar');
          sidebar.classList.remove('mobile-open');
          overlay.classList.remove('active');
        }
      });
    });
    
    // Handle window resize
    window.addEventListener('resize', () => {
      menuBtn.style.display = window.innerWidth <= 600 ? 'flex' : 'none';
      if (window.innerWidth > 600) {
        const sidebar = document.getElementById('sidebar');
        sidebar.classList.remove('mobile-open');
        overlay.classList.remove('active');
      }
    });
  }
}

// Initialize mobile menu when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMobileMenu);
} else {
  initMobileMenu();
}
