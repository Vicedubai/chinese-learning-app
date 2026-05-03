// ===== FLASHCARDS =====
let fcIndex = 0;
let fcQueue = [];
let fcFlipped = false;
let fcAutoAdvanceTimer = null;
let fcAutoAdvanceEnabled = false;
let fcSessionId = null;
let fcAutoSaveTimer = null;
// filterChapterId is now a global window variable set by library.js
let fcSessionData = {
  cardsStudied: [],
  cardResponses: [],
  studyTimePerCard: [],
  sm2Data: {}
};

// Initialize session on page load
async function initFlashcardSession() {
  fcSessionId = localStorage.getItem('fc-session-id') || `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  localStorage.setItem('fc-session-id', fcSessionId);
  
  // Try to load existing session
  try {
    const response = await fetch(`/api/progress/flashcard/${fcSessionId}`);
    const result = await response.json();
    
    if (result.status === 'success') {
      // Session exists - show resume dialog
      showResumeDialog(result.data);
      return true;
    }
  } catch (e) {
    console.log('No existing session found');
  }
  
  return false;
}

function showResumeDialog(sessionData) {
  const dialog = document.createElement('div');
  dialog.className = 'resume-dialog-overlay';
  dialog.innerHTML = `
    <div class="resume-dialog">
      <h2>📚 Tiếp tục học?</h2>
      <p>Bạn đã học đến thẻ <strong>${sessionData.current_card_index + 1}</strong></p>
      <p>Tiến độ: <strong>${sessionData.completion_percentage}%</strong></p>
      <div class="resume-buttons">
        <button class="btn btn-primary" onclick="resumeFlashcardSession(${JSON.stringify(sessionData)})">
          ▶️ Tiếp tục từ thẻ ${sessionData.current_card_index + 1}
        </button>
        <button class="btn btn-secondary" onclick="startNewFlashcardSession()">
          🔄 Bắt đầu từ đầu
        </button>
        <button class="btn btn-secondary" onclick="createNewFlashcardSession()">
          ✨ Phiên học mới
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(dialog);
  
  // Add styles
  const style = document.createElement('style');
  style.textContent = `
    .resume-dialog-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }
    .resume-dialog {
      background: white;
      border-radius: 12px;
      padding: 30px;
      max-width: 400px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.2);
      text-align: center;
    }
    .resume-dialog h2 {
      margin: 0 0 15px 0;
      color: #333;
    }
    .resume-dialog p {
      margin: 10px 0;
      color: #666;
    }
    .resume-buttons {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-top: 20px;
    }
    .resume-buttons button {
      padding: 10px 15px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
    }
    .btn-primary {
      background: #0066cc;
      color: white;
    }
    .btn-primary:hover {
      background: #0052a3;
    }
    .btn-secondary {
      background: #f0f0f0;
      color: #333;
    }
    .btn-secondary:hover {
      background: #e0e0e0;
    }
  `;
  document.head.appendChild(style);
}

function resumeFlashcardSession(sessionData) {
  fcSessionData = {
    cardsStudied: sessionData.cards_studied,
    cardResponses: sessionData.card_responses,
    studyTimePerCard: sessionData.study_time_per_card,
    sm2Data: sessionData.sm2_data
  };
  
  fcIndex = sessionData.current_card_index;
  
  // Remove dialog
  const dialog = document.querySelector('.resume-dialog-overlay');
  if (dialog) dialog.remove();
  
  // Continue with existing queue
  showCard();
  startAutoSave();
}

function startNewFlashcardSession() {
  fcSessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  localStorage.setItem('fc-session-id', fcSessionId);
  fcSessionData = {
    cardsStudied: [],
    cardResponses: [],
    studyTimePerCard: [],
    sm2Data: {}
  };
  
  const dialog = document.querySelector('.resume-dialog-overlay');
  if (dialog) dialog.remove();
  
  renderFlashcards();
}

function createNewFlashcardSession() {
  startNewFlashcardSession();
}

function startAutoSave() {
  // Save every 30 seconds
  if (fcAutoSaveTimer) clearInterval(fcAutoSaveTimer);
  
  fcAutoSaveTimer = setInterval(() => {
    saveFlashcardProgress();
  }, 30000);
}

function stopAutoSave() {
  if (fcAutoSaveTimer) {
    clearInterval(fcAutoSaveTimer);
    fcAutoSaveTimer = null;
  }
}

async function saveFlashcardProgress() {
  if (!fcSessionId || !fcQueue.length) return;
  
  const chapterId = fcQueue[0].chapterId || 'manual';
  
  const payload = {
    session_id: fcSessionId,
    chapter_id: chapterId,
    current_card_index: fcIndex,
    cards_studied: fcSessionData.cardsStudied,
    card_responses: fcSessionData.cardResponses,
    study_time_per_card: fcSessionData.studyTimePerCard,
    sm2_data: fcSessionData.sm2Data
  };
  
  try {
    const response = await fetch('/api/progress/flashcard/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    const result = await response.json();
    if (result.status === 'success') {
      console.log('Progress saved:', result);
    }
  } catch (error) {
    console.error('Save failed:', error);
  }
}

// Save on exit
window.addEventListener('beforeunload', () => {
  saveFlashcardProgress();
  stopAutoSave();
});

function populateDeckSelect() {
  const sel = document.getElementById('fc-deck-select');
  if (!sel) return;
  const decks = new Map(); // Map: id -> title
  
  // First, add all chapters (even if they have no cards yet)
  if (State.chapters && State.chapters.length > 0) {
    State.chapters.forEach(ch => {
      if (ch && ch.id && ch.title) {
        decks.set(ch.id, ch.title);
      }
    });
  }
  
  // Then, add any cards that might have a deck property
  if (State.cards && State.cards.length > 0) {
    State.cards.forEach(c => {
      if (c.deck && c.chapterId) {
        // Use chapterId if available, otherwise use deck name
        decks.set(c.chapterId, c.deck);
      }
    });
  }
  
  const currentVal = window.filterChapterId || sel.value;
  sel.innerHTML = '<option value="">Tất cả bộ từ vựng</option>';
  
  // Sort chapters by title for better UX
  const sortedDecks = Array.from(decks.entries()).sort((a, b) => a[1].localeCompare(b[1]));
  
  sortedDecks.forEach(([id, title]) => {
    sel.innerHTML += `<option value="${id}" ${id === currentVal ? 'selected' : ''}>${title}</option>`;
  });
  
  // Debug: log if no chapters found
  if (decks.size === 0) {
    console.warn('⚠️ No chapters found in populateDeckSelect. State.chapters:', State.chapters);
  }
}

// Refresh dropdown from anywhere
function refreshDeckSelect() {
  populateDeckSelect();
}

function renderFlashcards() {
  // Auto-merge books with same title
  autoMergeBooksByTitle();
  
  populateDeckSelect();
  
  // Nếu filterChapterId đã được đặt (từ studyChapter), dùng nó
  // Nếu không, lấy từ dropdown
  let selectedDeck = window.filterChapterId || document.getElementById('fc-deck-select').value;
  
  // Cập nhật dropdown nếu filterChapterId được đặt
  if (window.filterChapterId) {
    const sel = document.getElementById('fc-deck-select');
    if (sel) sel.value = window.filterChapterId;
  }
  
  let queue = State.getDueCards();
  if (selectedDeck) {
    // Nếu selectedDeck là ID chương, lọc theo chapterId
    queue = queue.filter(c => {
      if (c.chapterId === selectedDeck) return true;
      // Nếu selectedDeck là tên chương, lọc theo tên
      if (c.deck === selectedDeck) return true;
      if (c.chapterId) {
        const ch = State.chapters.find(x => x.id === c.chapterId);
        if (ch && ch.title === selectedDeck) return true;
      }
      return false;
    });
  }

  const shuffle = document.getElementById('fc-shuffle')?.checked;
  if (shuffle) {
    queue.sort(() => Math.random() - 0.5);
  }
  fcQueue = queue;

  const countEl = document.getElementById('fc-count');
  const emptyEl = document.getElementById('fc-empty');
  const sessionEl = document.getElementById('fc-session');

  if (!fcQueue.length) {
    if (countEl) countEl.textContent = '0';
    if (emptyEl) {
      emptyEl.style.display = 'block';
      
      // Update empty state message based on whether cards exist
      const allCards = State.cards;
      const emptyTitle = emptyEl.querySelector('h3');
      const emptyText = emptyEl.querySelector('p');
      
      if (allCards.length === 0) {
        // No cards at all
        if (emptyTitle) emptyTitle.textContent = 'Chưa có từ vựng nào';
        if (emptyText) emptyText.textContent = 'Hãy nhập giáo trình PDF hoặc thêm từ vựng thủ công để bắt đầu';
      } else {
        // Cards exist but none are due
        if (emptyTitle) emptyTitle.textContent = 'Tuyệt vời! Không còn thẻ nào đến hạn';
        if (emptyText) emptyText.textContent = `Bạn đã hoàn thành ${allCards.length} thẻ hôm nay. Hãy quay lại sau hoặc ôn lại tất cả.`;
      }
    }
    if (sessionEl) sessionEl.style.display = 'none';
    stopAutoSave();
    
    // Show "Review All" buttons if there are cards available
    const reviewBtn = document.getElementById('fc-review-all-btn');
    const reviewHeaderBtn = document.getElementById('fc-review-all-header-btn');
    const allCards = State.cards;
    if (reviewBtn) reviewBtn.style.display = allCards.length > 0 ? 'inline-block' : 'none';
    if (reviewHeaderBtn) reviewHeaderBtn.style.display = allCards.length > 0 ? 'inline-block' : 'none';
    return;
  }
  
  // Hide review buttons when there are due cards
  const reviewBtn = document.getElementById('fc-review-all-btn');
  const reviewHeaderBtn = document.getElementById('fc-review-all-header-btn');
  if (reviewBtn) reviewBtn.style.display = 'none';
  if (reviewHeaderBtn) reviewHeaderBtn.style.display = 'none';
  if (emptyEl) emptyEl.style.display = 'none';
  if (sessionEl) sessionEl.style.display = 'block';
  if (countEl) countEl.textContent = fcQueue.length;
  fcIndex = 0;
  State.saveSession({ currentTask: 'flashcard', flashcardQueue: fcQueue, flashcardIndex: 0 });
  
  fcAutoAdvanceEnabled = false;
  
  // Set autoplay to checked by default
  const autoplayCheckbox = document.getElementById('fc-autoplay');
  if (autoplayCheckbox && !autoplayCheckbox.checked) {
    autoplayCheckbox.checked = true;
  }
  
  document.getElementById('fc-autoadvance').checked = false;
  setupFlashcardKeyboard();
  
  // Start auto-save
  startAutoSave();
  
  showCard();
}

function setupFlashcardKeyboard() {
  document.removeEventListener('keydown', handleFlashcardKey);
  document.addEventListener('keydown', handleFlashcardKey);
}

function handleFlashcardKey(e) {
  if (document.getElementById('fc-session').style.display === 'none') return;
  
  // Don't trigger shortcuts if user is typing in input field
  if (isInTextInput(e.target)) {
    return;
  }
  
  const key = e.key.toLowerCase();
  
  switch (key) {
    case 'enter':
    case ' ':
      e.preventDefault();
      flipCard();
      break;
    case 'arrowleft':
    case 'a':
      e.preventDefault();
      prevFlashcard();
      break;
    case 'arrowright':
    case 'd':
      e.preventDefault();
      nextFlashcard();
      break;
    case 'x':
    case 'delete':
      e.preventDefault();
      if (fcFlipped) markIncorrect();
      break;
    case 's':
      e.preventDefault();
      if (fcFlipped) skipCard();
      break;
    case 'h':
    case '?':
      e.preventDefault();
      toggleKeyboardHelp();
      break;
  }
}

function isInTextInput(element) {
  return element.tagName === 'INPUT' || 
         element.tagName === 'TEXTAREA' ||
         element.contentEditable === 'true';
}

function toggleKeyboardHelp() {
  let helpPanel = document.getElementById('keyboard-help-panel');
  if (helpPanel) {
    helpPanel.style.display = helpPanel.style.display === 'none' ? 'block' : 'none';
  } else {
    showKeyboardHelp();
  }
}

function showKeyboardHelp() {
  const helpHTML = `
    <div id="keyboard-help-panel" class="keyboard-help-panel">
      <h3>⌨️ Phím tắt</h3>
      <table>
        <tr><td>→ hoặc D</td><td>Thẻ tiếp theo</td></tr>
        <tr><td>← hoặc A</td><td>Thẻ trước</td></tr>
        <tr><td>SPACE hoặc ENTER</td><td>Lật thẻ</td></tr>
        <tr><td>X hoặc DELETE</td><td>Sai</td></tr>
        <tr><td>S</td><td>Bỏ qua</td></tr>
        <tr><td>H hoặc ?</td><td>Ẩn/Hiện trợ giúp</td></tr>
      </table>
      <button onclick="document.getElementById('keyboard-help-panel').style.display='none'" class="btn-close">Đóng</button>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', helpHTML);
  
  // Add styles
  const style = document.createElement('style');
  style.textContent = `
    .keyboard-help-panel {
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: white;
      border: 2px solid #333;
      border-radius: 8px;
      padding: 15px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      z-index: 999;
      font-family: monospace;
      font-size: 12px;
      max-width: 250px;
    }
    .keyboard-help-panel h3 {
      margin: 0 0 10px 0;
      font-size: 14px;
    }
    .keyboard-help-panel table {
      margin: 10px 0;
      border-collapse: collapse;
      width: 100%;
    }
    .keyboard-help-panel td {
      padding: 4px 8px;
      border-bottom: 1px solid #eee;
      text-align: left;
    }
    .keyboard-help-panel td:first-child {
      font-weight: bold;
      color: #0066cc;
      width: 40%;
    }
    .keyboard-help-panel .btn-close {
      margin-top: 10px;
      padding: 6px 12px;
      background: #f0f0f0;
      border: 1px solid #ccc;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
    }
    .keyboard-help-panel .btn-close:hover {
      background: #e0e0e0;
    }
  `;
  document.head.appendChild(style);
}

function showCard() {
  if (fcIndex >= fcQueue.length) { endFlashcardSession(); return; }
  const card = fcQueue[fcIndex];
  fcFlipped = false;
  const fc = document.getElementById('flashcard');
  if (fc) fc.classList.remove('flipped');

  document.getElementById('fc-front-chinese').textContent = card.chinese || card.front || '';
  document.getElementById('fc-front-pinyin').textContent = card.pinyin || '';
  document.getElementById('fc-back-meaning').textContent = card.vietnamese || card.back || '';
  document.getElementById('fc-back-example').textContent = card.example || '';
  document.getElementById('fc-back-pinyin').textContent = card.pinyin || '';
  document.getElementById('fc-progress-text').textContent = `${fcIndex + 1} / ${fcQueue.length}`;
  const pct = (fcIndex / fcQueue.length) * 100;
  document.getElementById('fc-progress-bar').style.width = pct + '%';
  document.getElementById('fc-rating-btns').style.display = 'none';
  
  // Save current position
  State.saveSession({ currentTask: 'flashcard', flashcardIndex: fcIndex, flashcardQueue: fcQueue });
  
  // Show/hide navigation buttons
  const prevBtn = document.getElementById('fc-btn-prev');
  const nextBtn = document.getElementById('fc-btn-next');
  const navLeft = document.getElementById('fc-nav-left');
  const navRight = document.getElementById('fc-nav-right');
  
  if (fcIndex > 0) {
    if (prevBtn) prevBtn.style.display = 'inline-block';
    if (navLeft) navLeft.style.display = 'block';
  } else {
    if (prevBtn) prevBtn.style.display = 'none';
    if (navLeft) navLeft.style.display = 'none';
  }
  
  if (fcIndex < fcQueue.length - 1) {
    if (nextBtn) nextBtn.style.display = 'inline-block';
    if (navRight) navRight.style.display = 'block';
  } else {
    if (nextBtn) nextBtn.style.display = 'none';
    if (navRight) navRight.style.display = 'none';
  }
  
  let deckName = card.deck || '';
  if (!deckName && card.chapterId) {
    const ch = State.chapters.find(x => x.id === card.chapterId);
    if (ch) deckName = ch.title;
  }
  const badgeEl = document.getElementById('fc-deck-badge');
  if (badgeEl) {
    badgeEl.textContent = deckName;
    badgeEl.style.display = deckName ? 'block' : 'none';
  }
  
  document.getElementById('fc-sentence-practice').style.display = 'none';
  document.getElementById('fc-sentence-input').value = '';
  document.getElementById('fc-sentence-feedback').style.display = 'none';

  const autoPlay = document.getElementById('fc-autoplay')?.checked;
  if (autoPlay) {
    speakChinese(card.chinese || card.front || '');
  }
  
  // Start auto-advance timer if enabled
  if (fcAutoAdvanceEnabled) {
    startAutoAdvanceTimer(card);
  }
}

function flipCard(autoFlipped = false) {
  fcFlipped = !fcFlipped;
  const fc = document.getElementById('flashcard');
  if (fc) fc.classList.toggle('flipped', fcFlipped);
  if (fcFlipped) {
    document.getElementById('fc-rating-btns').style.display = 'flex';
    document.getElementById('fc-sentence-practice').style.display = 'block';
    // Stop auto-advance when flipped manually
    if (!autoFlipped && fcAutoAdvanceTimer) clearTimeout(fcAutoAdvanceTimer);
  }
}

function prevFlashcard(e) {
  if (e) {
    e.stopPropagation();
    e.preventDefault();
  }
  if (fcIndex > 0) {
    fcIndex--;
    showCard();
  }
}

function nextFlashcard(e) {
  if (e) {
    e.stopPropagation();
    e.preventDefault();
  }
  if (fcIndex < fcQueue.length - 1) {
    fcIndex++;
    showCard();
  }
}

function updateAutoAdvance() {
  fcAutoAdvanceEnabled = document.getElementById('fc-autoadvance').checked;
  if (fcAutoAdvanceEnabled && !fcFlipped) {
    startAutoAdvanceTimer(fcQueue[fcIndex]);
  } else if (fcAutoAdvanceTimer) {
    clearTimeout(fcAutoAdvanceTimer);
  }
}

function startAutoAdvanceTimer(card) {
  if (fcAutoAdvanceTimer) clearTimeout(fcAutoAdvanceTimer);
  
  // Calculate delay based on card content length (2-5 seconds)
  const contentLength = (card.chinese || card.front || '').length + (card.vietnamese || card.back || '').length;
  let delay = Math.min(5000, Math.max(2000, contentLength * 100));
  
  const speed = document.getElementById('fc-auto-speed')?.value || 'normal';
  if (speed === 'slow') delay *= 1.5;
  if (speed === 'fast') delay *= 0.6;
  
  fcAutoAdvanceTimer = setTimeout(() => {
    if (!fcAutoAdvanceEnabled) return;
    
    if (!fcFlipped) {
      flipCard(true); // Flip automatically
      startAutoAdvanceTimer(card); // Start timer for the next step (auto advance to next card)
    } else if (fcIndex < fcQueue.length - 1) {
      nextFlashcard(); // Advance to next card automatically
    } else if (fcIndex >= fcQueue.length - 1) {
      endFlashcardSession(); // End session if last card
    }
  }, delay);
}

function rateCard(q) {
  const card = fcQueue[fcIndex];
  
  // Record response
  recordFlashcardResponse(q);
  
  // Update SM2
  updateSM2(q);
  
  // Update card in State
  State.reviewCard(card.id, q);
  State.logResult('flashcard', q >= 3, card.id);
  State.addXP(q >= 3 ? 5 : 1);
  
  fcIndex++;
  showCard();
}

function markCorrect() {
  rateCard(4); // 4 = correct
}

function markIncorrect() {
  rateCard(1); // 1 = incorrect
}

function skipCard() {
  recordFlashcardResponse('skip');
  fcIndex++;
  showCard();
}

function recordFlashcardResponse(response) {
  const cardIndex = fcIndex;
  
  if (!fcSessionData.cardsStudied.includes(cardIndex)) {
    fcSessionData.cardsStudied.push(cardIndex);
  }
  
  fcSessionData.cardResponses[cardIndex] = response;
  
  // Record study time (~30 seconds per card)
  if (!fcSessionData.studyTimePerCard[cardIndex]) {
    fcSessionData.studyTimePerCard[cardIndex] = 0;
  }
  fcSessionData.studyTimePerCard[cardIndex] += 30;
}

function updateSM2(response) {
  const cardIndex = fcIndex;
  const sm2 = fcSessionData.sm2Data;
  
  if (!sm2[cardIndex]) {
    sm2[cardIndex] = {
      interval: 0,
      ease_factor: 2.5,
      next_review_date: new Date().toISOString().split('T')[0]
    };
  }
  
  const card = sm2[cardIndex];
  
  if (response === 1 || response === 'incorrect') {
    // Incorrect: reset interval
    card.interval = 1;
    card.ease_factor = Math.max(1.3, card.ease_factor - 0.2);
  } else if (response === 'skip') {
    // Skip: no change
  } else if (response >= 3 || response === 'correct') {
    // Correct: increase interval
    if (card.interval === 0) {
      card.interval = 1;
    } else if (card.interval === 1) {
      card.interval = 3;
    } else {
      card.interval = Math.round(card.interval * card.ease_factor);
    }
    card.ease_factor = Math.max(1.3, card.ease_factor + 0.1);
  }
  
  // Calculate next review date
  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + card.interval);
  card.next_review_date = nextDate.toISOString().split('T')[0];
}

function endFlashcardSession() {
  stopAutoSave();
  saveFlashcardProgress(); // Final save
  
  const sessionEl = document.getElementById('fc-session');
  const doneEl = document.getElementById('fc-done');
  if (sessionEl) sessionEl.style.display = 'none';
  if (doneEl) {
    doneEl.style.display = 'block';
    document.getElementById('fc-done-count').textContent = fcQueue.length;
  }
  window.filterChapterId = null;
  State.clearSession(); // Clear session when completed
  toast('Hoàn thành phiên học!', 'success', '🎉');
}

function speakChinese(text) {
  if (!text) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'zh-CN';
  u.rate = 0.8;
  window.speechSynthesis.speak(u);
}

async function checkFlashcardSentence() {
  const input = document.getElementById('fc-sentence-input').value.trim();
  if (!input) { toast('Hãy viết một câu trước!', 'error'); return; }
  
  const card = fcQueue[fcIndex];
  const word = card.chinese || card.front || '';
  
  const btn = document.getElementById('fc-sentence-btn');
  const fb = document.getElementById('fc-sentence-feedback');
  
  btn.disabled = true;
  btn.textContent = 'Đang kiểm tra...';
  fb.style.display = 'block';
  fb.textContent = '⏳ Đang phân tích câu của bạn...';
  
  let success = false;
  
  // Try local server first (no API key needed)
  try {
    const res = await fetch(`${window.API_BASE_URL}/ai/analyze-sentence`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sentence: input,
        keyword: word
      })
    });
    
    if (res.ok) {
      const data = await res.json();
      if (data.status === 'success') {
        let analysis = `<div style="line-height:1.6;color:var(--text-2);font-size:13px">`;
        
        // Show keyword check
        if (data.analysis.has_keyword) {
          analysis += `<p>✅ <strong>Câu có chứa từ "${word}"</strong></p>`;
        } else {
          analysis += `<p>❌ <strong>Câu không chứa từ "${word}"</strong></p>`;
        }
        
        // Show Vietnamese translation
        if (data.vietnamese) {
          analysis += `<p>🇻🇳 <strong>Dịch:</strong> ${data.vietnamese}</p>`;
        }
        
        // Show analysis
        analysis += `<p>📊 <strong>Phân tích:</strong></p>`;
        analysis += `<ul style="margin:8px 0;padding-left:20px">`;
        analysis += `<li>Độ dài: ${data.analysis.length} ký tự</li>`;
        analysis += `<li>Ký tự Hán: ${data.analysis.chinese_chars}</li>`;
        analysis += `<li>Cấu trúc: ${data.analysis.structure}</li>`;
        analysis += `</ul>`;
        
        // Show OCR errors if any
        if (data.ocr_errors && data.ocr_errors.length > 0) {
          analysis += `<p>⚠️ <strong>Lỗi OCR có thể:</strong></p>`;
          analysis += `<ul style="margin:8px 0;padding-left:20px">`;
          data.ocr_errors.slice(0, 3).forEach(err => {
            analysis += `<li>'${err.error}' → '${err.suggestion}'</li>`;
          });
          analysis += `</ul>`;
        }
        
        // Show feedback
        if (data.feedback) {
          analysis += `<p>💡 <strong>Nhận xét:</strong></p>`;
          analysis += `<pre style="background:#f5f5f5;padding:10px;border-radius:4px;overflow-x:auto;font-size:12px">${data.feedback}</pre>`;
        }
        
        analysis += `</div>`;
        fb.innerHTML = analysis;
        success = true;
      }
    }
  } catch (e) {
    console.log('Server error:', e.message);
  }
  
  // Fallback: Use free translation API + basic analysis
  if (!success) {
    try {
      // Basic Chinese text analysis
      const hasWord = input.includes(word);
      const chineseChars = (input.match(/[\u4e00-\u9fff]/g) || []).length;
      const totalChars = input.length;
      const punctuation = (input.match(/[，。！？、；：""''（）]/g) || []).length;
      
      let analysis = `<div style="line-height:1.6;color:var(--text-2);font-size:13px">`;
      
      // Keyword check
      if (hasWord) {
        analysis += `<p>✅ <strong>Câu có chứa từ "${word}"</strong></p>`;
      } else {
        analysis += `<p>❌ <strong>Câu không chứa từ "${word}"</strong></p>`;
        analysis += `<p style="color:var(--red-light)">💡 Hãy thử viết lại câu có sử dụng từ "${word}"</p>`;
      }
      
      // Try to get translation from LibreTranslate (free API)
      let translation = '';
      try {
        const translateRes = await fetch('https://libretranslate.com/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            q: input,
            source: 'zh',
            target: 'vi',
            format: 'text'
          })
        });
        
        if (translateRes.ok) {
          const translateData = await translateRes.json();
          translation = translateData.translatedText;
          if (translation && translation !== input) {
            analysis += `<p>🇻🇳 <strong>Dịch:</strong> ${translation}</p>`;
          }
        }
      } catch (e) {
        console.log('Translation error:', e.message);
        // Try MyMemory as backup
        try {
          const myMemoryRes = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(input)}&langpair=zh|vi`);
          if (myMemoryRes.ok) {
            const myMemoryData = await myMemoryRes.json();
            translation = myMemoryData.responseData.translatedText;
            if (translation && translation !== input) {
              analysis += `<p>🇻🇳 <strong>Dịch:</strong> ${translation}</p>`;
            }
          }
        } catch (e2) {
          console.log('MyMemory error:', e2.message);
        }
      }
      
      // Basic analysis
      analysis += `<p>📊 <strong>Phân tích:</strong></p>`;
      analysis += `<ul style="margin:8px 0;padding-left:20px">`;
      analysis += `<li>Độ dài: ${totalChars} ký tự</li>`;
      analysis += `<li>Ký tự Hán: ${chineseChars}</li>`;
      analysis += `<li>Dấu câu: ${punctuation}</li>`;
      
      // Structure analysis
      if (chineseChars === 0) {
        analysis += `<li style="color:var(--red-light)">⚠️ Câu không có ký tự tiếng Trung</li>`;
      } else if (chineseChars < 3) {
        analysis += `<li style="color:var(--gold)">💡 Câu hơi ngắn, thử viết dài hơn</li>`;
      } else if (chineseChars >= 10) {
        analysis += `<li style="color:var(--green)">✅ Câu có độ dài tốt</li>`;
      }
      
      if (punctuation === 0 && chineseChars > 5) {
        analysis += `<li style="color:var(--gold)">💡 Nên thêm dấu câu (。！？)</li>`;
      }
      
      analysis += `</ul>`;
      
      // Grammar tips based on common patterns
      analysis += `<p>💡 <strong>Gợi ý:</strong></p>`;
      analysis += `<ul style="margin:8px 0;padding-left:20px">`;
      
      if (hasWord) {
        analysis += `<li>Tốt! Bạn đã sử dụng từ "${word}" trong câu</li>`;
      }
      
      // Check for common sentence patterns
      if (input.includes('我') || input.includes('你') || input.includes('他') || input.includes('她')) {
        analysis += `<li>✅ Câu có chủ ngữ rõ ràng</li>`;
      }
      
      if (input.includes('吗') || input.includes('呢')) {
        analysis += `<li>❓ Đây là câu hỏi</li>`;
      }
      
      if (input.includes('不') || input.includes('没')) {
        analysis += `<li>🚫 Câu phủ định</li>`;
      }
      
      if (input.includes('了') || input.includes('过')) {
        analysis += `<li>⏰ Câu có trợ từ thời gian</li>`;
      }
      
      analysis += `<li>📚 Để có phân tích chi tiết hơn, hãy bật Server Python</li>`;
      analysis += `</ul>`;
      
      // Example sentence with the word
      if (card.example) {
        analysis += `<p>📝 <strong>Ví dụ mẫu:</strong></p>`;
        analysis += `<pre style="background:#f5f5f5;padding:10px;border-radius:4px;font-size:12px">${card.example}</pre>`;
      }
      
      analysis += `</div>`;
      fb.innerHTML = analysis;
      success = true;
      
    } catch (e) {
      console.log('Fallback error:', e.message);
    }
  }
  
  // Final fallback: Very basic analysis
  if (!success) {
    const hasWord = input.includes(word);
    const analysis = `
<div style="line-height:1.6;color:var(--text-2);font-size:13px">
  <p><strong>📝 Phân tích cơ bản:</strong></p>
  <ul style="margin:8px 0;padding-left:20px">
    <li>${hasWord ? '✅ Câu có chứa từ "' + word + '"' : '❌ Câu không chứa từ "' + word + '"'}</li>
    <li>📊 Độ dài câu: ${input.length} ký tự</li>
    <li>💡 Gợi ý: Hãy bật Server Python để có phân tích chi tiết hơn</li>
  </ul>
</div>`;
    fb.innerHTML = analysis;
  }
  
  btn.disabled = false;
  btn.textContent = '🤖 Nhờ AI kiểm tra';
}

// ===== MANUAL VOCAB ADD =====
function addManualCard() {
  const ch = document.getElementById('add-chinese').value.trim();
  const py = document.getElementById('add-pinyin').value.trim();
  const wt = document.getElementById('add-wordtype')?.value.trim() || '';
  const vn = document.getElementById('add-vietnamese').value.trim();
  const ex = document.getElementById('add-example').value.trim();
  const chId = document.getElementById('add-chapter').value;
  if (!ch || !vn) { toast('Vui lòng nhập tiếng Trung và nghĩa tiếng Việt', 'error'); return; }
  State.cards.push({ id: uid(), chapterId: chId || null, chinese: ch, pinyin: py, wordType: wt, vietnamese: vn, example: ex, ef: 2.5, interval: 1, reps: 0, nextReview: 0 });
  State.save();
  ['add-chinese','add-pinyin','add-wordtype','add-vietnamese','add-example'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  toast('Đã thêm từ mới!', 'success', '✅');
  closeModal('modal-add-card');
  renderFlashcards();
}

function populateChapterSelect() {
  const sel = document.getElementById('add-chapter');
  if (!sel) return;
  sel.innerHTML = '<option value="">-- Không có chương --</option>' +
    State.chapters.map(c => `<option value="${c.id}">${c.title}</option>`).join('');
}


// ===== REVIEW ALL CARDS =====
function reviewAllCards() {
  // Get all cards (not just due cards)
  let allCards = State.cards;
  
  // Filter by selected deck if any
  const selectedDeck = document.getElementById('fc-deck-select')?.value;
  if (selectedDeck) {
    allCards = allCards.filter(c => {
      if (c.chapterId === selectedDeck) return true;
      if (c.deck === selectedDeck) return true;
      if (c.chapterId) {
        const ch = State.chapters.find(x => x.id === c.chapterId);
        if (ch && ch.title === selectedDeck) return true;
      }
      return false;
    });
  }
  
  if (allCards.length === 0) {
    toast('Không có từ vựng nào để ôn lại', 'info');
    return;
  }
  
  // Shuffle if enabled
  const shuffle = document.getElementById('fc-shuffle')?.checked;
  if (shuffle) {
    allCards.sort(() => Math.random() - 0.5);
  }
  
  // Set up review session
  fcQueue = allCards;
  fcIndex = 0;
  
  // Update UI
  const countEl = document.getElementById('fc-count');
  const emptyEl = document.getElementById('fc-empty');
  const sessionEl = document.getElementById('fc-session');
  
  if (countEl) countEl.textContent = fcQueue.length;
  if (emptyEl) emptyEl.style.display = 'none';
  if (sessionEl) sessionEl.style.display = 'block';
  
  // Save session
  State.saveSession({ currentTask: 'flashcard', flashcardQueue: fcQueue, flashcardIndex: 0, isReviewMode: true });
  
  fcAutoAdvanceEnabled = false;
  
  // Set autoplay to checked by default
  const autoplayCheckbox = document.getElementById('fc-autoplay');
  if (autoplayCheckbox && !autoplayCheckbox.checked) {
    autoplayCheckbox.checked = true;
  }
  
  document.getElementById('fc-autoadvance').checked = false;
  setupFlashcardKeyboard();
  
  // Start auto-save
  startAutoSave();
  
  // Show first card
  showCard();
  
  toast(`📚 Ôn lại ${fcQueue.length} từ vựng`, 'info');
}
