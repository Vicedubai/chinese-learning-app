# Session Persistence & Keyboard Navigation Implementation Guide

## Overview

This guide explains how to implement session persistence and keyboard navigation for the flashcard study component. The backend now supports auto-saving progress every 30 seconds, allowing users to resume from exactly where they left off.

---

## Backend API Endpoints

### Flashcard Progress

**Save Progress**
```
POST /api/progress/flashcard/save
Content-Type: application/json

{
  "session_id": "sess_123",
  "chapter_id": "ch_1",
  "current_card_index": 5,
  "cards_studied": [0, 1, 2, 3, 4, 5],
  "card_responses": ["correct", "correct", "incorrect", "skip", "correct", "correct"],
  "study_time_per_card": [30, 25, 45, 10, 35, 40],
  "sm2_data": {
    "0": {"interval": 1, "ease_factor": 2.5, "next_review_date": "2024-01-16"},
    "1": {"interval": 3, "ease_factor": 2.6, "next_review_date": "2024-01-18"}
  }
}

Response:
{
  "status": "success",
  "message": "Flashcard progress saved",
  "session_id": "sess_123",
  "current_card_index": 5
}
```

**Get Progress**
```
GET /api/progress/flashcard/{session_id}

Response:
{
  "status": "success",
  "data": {
    "session_id": "sess_123",
    "chapter_id": "ch_1",
    "current_card_index": 5,
    "cards_studied": [0, 1, 2, 3, 4, 5],
    "card_responses": ["correct", "correct", "incorrect", "skip", "correct", "correct"],
    "study_time_per_card": [30, 25, 45, 10, 35, 40],
    "sm2_data": {...},
    "completion_percentage": 50
  }
}
```

### Dictation Progress

**Save Progress**
```
POST /api/progress/dictation/save
Content-Type: application/json

{
  "session_id": "sess_456",
  "chapter_id": "ch_1",
  "youtube_url": "https://youtube.com/...",
  "current_sentence_index": 5,
  "current_timestamp": 125.5,
  "sentences_completed": [0, 1, 2, 3, 4, 5],
  "user_answers": ["...", "...", "..."],
  "accuracy_scores": [0.95, 0.88, 0.92, 0.85, 0.90, 0.93]
}

Response:
{
  "status": "success",
  "message": "Dictation progress saved",
  "session_id": "sess_456",
  "current_sentence_index": 5
}
```

**Get Progress**
```
GET /api/progress/dictation/{session_id}

Response:
{
  "status": "success",
  "data": {
    "session_id": "sess_456",
    "chapter_id": "ch_1",
    "youtube_url": "https://youtube.com/...",
    "current_sentence_index": 5,
    "current_timestamp": 125.5,
    "sentences_completed": [0, 1, 2, 3, 4, 5],
    "user_answers": ["...", "...", "..."],
    "accuracy_scores": [0.95, 0.88, 0.92, 0.85, 0.90, 0.93],
    "completion_percentage": 50
  }
}
```

### Exercise Progress

**Save Progress**
```
POST /api/progress/exercise/save
Content-Type: application/json

{
  "session_id": "sess_789",
  "exercise_id": "ex_1",
  "chapter_id": "ch_1",
  "current_question_index": 3,
  "questions_answered": [0, 1, 2, 3],
  "user_answers": ["A", "B", "C", "D"],
  "correct_answers": ["A", "B", "C", "D"],
  "accuracy_scores": [1.0, 1.0, 0.5, 1.0],
  "time_per_question": [30, 25, 45, 35]
}

Response:
{
  "status": "success",
  "message": "Exercise progress saved",
  "session_id": "sess_789",
  "current_question_index": 3
}
```

### Reading Progress

**Save Progress**
```
POST /api/progress/reading/save
Content-Type: application/json

{
  "session_id": "sess_101",
  "chapter_id": "ch_1",
  "current_paragraph_index": 5,
  "current_scroll_position": 250,
  "paragraphs_read": [0, 1, 2, 3, 4, 5],
  "vocabulary_lookups": [
    {"vocab_id": "v_1", "timestamp": "2024-01-15T10:00:00Z"},
    {"vocab_id": "v_2", "timestamp": "2024-01-15T10:05:00Z"}
  ],
  "notes": "User notes here"
}

Response:
{
  "status": "success",
  "message": "Reading progress saved",
  "session_id": "sess_101",
  "current_paragraph_index": 5
}
```

### Statistics

**Get Overall Statistics**
```
GET /api/progress/statistics

Response:
{
  "status": "success",
  "data": {
    "total_study_time": 3600,
    "sessions_completed": 15,
    "average_accuracy": 0.88,
    "recent_activity": [
      {
        "activity_type": "flashcard",
        "resource_id": "ch_1",
        "last_updated": "2024-01-15T10:15:30Z",
        "status": "in_progress"
      }
    ]
  }
}
```

**Get Activity Statistics**
```
GET /api/progress/statistics/{activity_type}

Response:
{
  "status": "success",
  "data": {
    "activity_type": "flashcard",
    "sessions_completed": 10,
    "average_completion_rate": 85.5
  }
}
```

**Get Timeline**
```
GET /api/progress/timeline

Response:
{
  "status": "success",
  "data": [
    {
      "session_id": "sess_123",
      "activity_type": "flashcard",
      "resource_id": "ch_1",
      "status": "completed",
      "start_time": "2024-01-15T10:00:00Z",
      "last_updated": "2024-01-15T10:15:30Z",
      "end_time": "2024-01-15T10:15:30Z"
    }
  ]
}
```

---

## Frontend Implementation

### 1. Session Management

**Initialize Session**
```javascript
// When user starts flashcard study
async function startFlashcardSession(chapterId) {
  const sessionId = generateSessionId(); // or fetch from backend
  
  // Try to load existing session
  const existingSession = await fetch(`/api/progress/flashcard/${sessionId}`)
    .then(r => r.json());
  
  if (existingSession.status === "success") {
    // Session exists - show resume option
    return showResumeDialog(existingSession.data);
  } else {
    // New session
    return createNewSession(sessionId, chapterId);
  }
}

function generateSessionId() {
  return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
```

**Resume Session**
```javascript
async function resumeSession(sessionData) {
  state.currentSession = {
    sessionId: sessionData.session_id,
    chapterId: sessionData.chapter_id,
    currentCardIndex: sessionData.current_card_index,
    cardsStudied: sessionData.cards_studied,
    cardResponses: sessionData.card_responses,
    studyTimePerCard: sessionData.study_time_per_card,
    sm2Data: sessionData.sm2_data
  };
  
  // Load cards for this chapter
  const cards = state.cards[state.currentSession.chapterId];
  
  // Display card at current index
  displayCard(cards[state.currentSession.currentCardIndex]);
  
  // Start auto-save timer
  startAutoSave();
}
```

### 2. Auto-Save Mechanism

**Auto-Save Every 30 Seconds**
```javascript
let autoSaveTimer = null;

function startAutoSave() {
  // Save every 30 seconds
  autoSaveTimer = setInterval(() => {
    saveProgress();
  }, 30000);
}

function stopAutoSave() {
  if (autoSaveTimer) {
    clearInterval(autoSaveTimer);
    autoSaveTimer = null;
  }
}

async function saveProgress() {
  if (!state.currentSession) return;
  
  const payload = {
    session_id: state.currentSession.sessionId,
    chapter_id: state.currentSession.chapterId,
    current_card_index: state.currentSession.currentCardIndex,
    cards_studied: state.currentSession.cardsStudied,
    card_responses: state.currentSession.cardResponses,
    study_time_per_card: state.currentSession.studyTimePerCard,
    sm2_data: state.currentSession.sm2Data
  };
  
  try {
    const response = await fetch('/api/progress/flashcard/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    const result = await response.json();
    if (result.status === "success") {
      console.log("Progress saved:", result);
    }
  } catch (error) {
    console.error("Save failed:", error);
    // Retry on next interval
  }
}

// Save on exit
window.addEventListener('beforeunload', () => {
  saveProgress();
  stopAutoSave();
});
```

### 3. Keyboard Navigation

**Keyboard Event Listener**
```javascript
function setupKeyboardNavigation() {
  document.addEventListener('keydown', (event) => {
    // Don't trigger shortcuts if user is typing in input field
    if (isInTextInput(event.target)) {
      return;
    }
    
    const key = event.key.toLowerCase();
    
    switch (key) {
      case 'arrowright':
      case 'd':
        nextCard();
        event.preventDefault();
        break;
      case 'arrowleft':
      case 'a':
        previousCard();
        event.preventDefault();
        break;
      case ' ':
      case 'enter':
        markCorrect();
        event.preventDefault();
        break;
      case 'x':
      case 'delete':
        markIncorrect();
        event.preventDefault();
        break;
      case 's':
        skipCard();
        event.preventDefault();
        break;
      case 'h':
      case '?':
        toggleKeyboardHelp();
        event.preventDefault();
        break;
    }
  });
}

function isInTextInput(element) {
  return element.tagName === 'INPUT' || 
         element.tagName === 'TEXTAREA' ||
         element.contentEditable === 'true';
}
```

**Navigation Functions**
```javascript
function nextCard() {
  const cards = state.cards[state.currentSession.chapterId];
  if (state.currentSession.currentCardIndex < cards.length - 1) {
    state.currentSession.currentCardIndex++;
    displayCard(cards[state.currentSession.currentCardIndex]);
  }
}

function previousCard() {
  if (state.currentSession.currentCardIndex > 0) {
    state.currentSession.currentCardIndex--;
    const cards = state.cards[state.currentSession.chapterId];
    displayCard(cards[state.currentSession.currentCardIndex]);
  }
}

function markCorrect() {
  recordResponse('correct');
  updateSM2('correct');
  nextCard();
}

function markIncorrect() {
  recordResponse('incorrect');
  updateSM2('incorrect');
  nextCard();
}

function skipCard() {
  recordResponse('skip');
  updateSM2('skip');
  nextCard();
}

function recordResponse(response) {
  const cardIndex = state.currentSession.currentCardIndex;
  
  if (!state.currentSession.cardsStudied.includes(cardIndex)) {
    state.currentSession.cardsStudied.push(cardIndex);
  }
  
  state.currentSession.cardResponses[cardIndex] = response;
  
  // Record study time
  if (!state.currentSession.studyTimePerCard[cardIndex]) {
    state.currentSession.studyTimePerCard[cardIndex] = 0;
  }
  state.currentSession.studyTimePerCard[cardIndex] += 30; // ~30 seconds per card
}
```

### 4. SM2 Algorithm Update

**Update SM2 Data**
```javascript
function updateSM2(response) {
  const cardIndex = state.currentSession.currentCardIndex;
  const sm2 = state.currentSession.sm2Data;
  
  if (!sm2[cardIndex]) {
    sm2[cardIndex] = {
      interval: 0,
      ease_factor: 2.5,
      next_review_date: new Date().toISOString().split('T')[0]
    };
  }
  
  const card = sm2[cardIndex];
  
  if (response === 'incorrect') {
    // Incorrect: reset interval
    card.interval = 1;
    card.ease_factor = Math.max(1.3, card.ease_factor - 0.2);
  } else if (response === 'skip') {
    // Skip: no change
  } else if (response === 'correct') {
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
```

### 5. Keyboard Shortcuts Help Panel

**Display Help**
```javascript
function toggleKeyboardHelp() {
  const helpPanel = document.getElementById('keyboard-help');
  if (helpPanel) {
    helpPanel.style.display = helpPanel.style.display === 'none' ? 'block' : 'none';
  } else {
    showKeyboardHelp();
  }
}

function showKeyboardHelp() {
  const helpHTML = `
    <div id="keyboard-help" class="keyboard-help-panel">
      <h3>⌨️ Keyboard Shortcuts</h3>
      <table>
        <tr><td>→ or D</td><td>Next card</td></tr>
        <tr><td>← or A</td><td>Previous card</td></tr>
        <tr><td>SPACE or ENTER</td><td>Mark correct</td></tr>
        <tr><td>X or DELETE</td><td>Mark incorrect</td></tr>
        <tr><td>S</td><td>Skip</td></tr>
        <tr><td>H or ?</td><td>Toggle this help</td></tr>
      </table>
      <button onclick="this.parentElement.style.display='none'">Close</button>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', helpHTML);
  
  // Style the panel
  const style = document.createElement('style');
  style.textContent = `
    .keyboard-help-panel {
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: white;
      border: 2px solid #333;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      z-index: 1000;
      font-family: monospace;
    }
    .keyboard-help-panel table {
      margin: 10px 0;
      border-collapse: collapse;
    }
    .keyboard-help-panel td {
      padding: 5px 10px;
      border-bottom: 1px solid #eee;
    }
    .keyboard-help-panel td:first-child {
      font-weight: bold;
      color: #0066cc;
    }
  `;
  document.head.appendChild(style);
}
```

### 6. Resume Dialog

**Show Resume Option**
```javascript
function showResumeDialog(sessionData) {
  const dialog = document.createElement('div');
  dialog.className = 'resume-dialog';
  dialog.innerHTML = `
    <div class="resume-content">
      <h2>📚 Continue Learning?</h2>
      <p>You were on card <strong>${sessionData.current_card_index + 1}</strong></p>
      <p>Completion: <strong>${sessionData.completion_percentage}%</strong></p>
      <div class="resume-buttons">
        <button class="btn-primary" onclick="resumeSession(${JSON.stringify(sessionData)})">
          ▶️ Resume from card ${sessionData.current_card_index + 1}
        </button>
        <button class="btn-secondary" onclick="startNewSession()">
          🔄 Start from beginning
        </button>
        <button class="btn-secondary" onclick="createNewSession()">
          ✨ New session
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(dialog);
}
```

---

## Example Analysis Endpoints

### Analyze Sentence

**Request**
```
POST /ai/analyze-sentence
Content-Type: application/json

{
  "sentence": "我喜欢学习中文。",
  "keyword": "学习"
}

Response:
{
  "status": "success",
  "sentence": "我喜欢学习中文。",
  "keyword": "学习",
  "analysis": {
    "has_keyword": true,
    "length": 8,
    "structure": "complete",
    "chinese_chars": 5
  },
  "ocr_errors": [],
  "vietnamese": "Tôi thích học tiếng Trung.",
  "feedback": "✓ Từ khóa 'học tập' có trong câu\n✓ Câu hoàn chỉnh (có dấu câu)\n• Số ký tự Hán: 5",
  "source": "local_analysis"
}
```

### Generate Examples

**Request**
```
POST /ai/generate-example
Content-Type: application/json

{
  "keyword": "学习",
  "word_type": "动"
}

Response:
{
  "status": "success",
  "keyword": "学习",
  "word_type": "动",
  "examples": [
    {
      "chinese": "我学习了一个好主意。",
      "vietnamese": "Tôi đã học một ý tưởng tốt."
    },
    {
      "chinese": "他们学习了很多时间。",
      "vietnamese": "Họ đã học rất nhiều thời gian."
    },
    {
      "chinese": "请学习这个问题。",
      "vietnamese": "Vui lòng học vấn đề này."
    }
  ],
  "source": "template"
}
```

---

## Testing Checklist

- [ ] Session saves every 30 seconds
- [ ] Session resumes from correct card index
- [ ] SM2 data persists across sessions
- [ ] Keyboard navigation works (all 6 shortcuts)
- [ ] Keyboard shortcuts disabled in text input
- [ ] Help panel displays correctly
- [ ] Example analysis works without Gemini API
- [ ] Example generation provides Vietnamese translations
- [ ] Statistics endpoints return correct data
- [ ] Timeline shows recent sessions
- [ ] No data loss on browser crash
- [ ] Multiple sessions can be tracked independently

---

## Notes

- Session IDs should be unique and persistent (store in localStorage)
- Auto-save should be silent (no UI interruption)
- Keyboard shortcuts should work on all browsers
- LibreTranslate may have rate limits - implement caching
- All progress data is stored locally in SQLite
- No cloud sync required (can be added later)
