# Design Document: Server-Side PDF Processing & Learning Progress Tracking

## 1. System Architecture

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (Browser)                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ HTML/CSS/JavaScript SPA                                  │   │
│  │ - PDF Upload Interface                                   │   │
│  │ - Progress Modal                                         │   │
│  │ - Flashcard Study (Keyboard Navigation)                  │   │
│  │ - Dictation Exercise                                     │   │
│  │ - Reading & Grammar Views                                │   │
│  │ - Learning Statistics Dashboard                          │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ↕ HTTP/REST API
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (Python FastAPI)                      │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ PDF Processing Service                                   │   │
│  │ - PDF Upload Handler                                     │   │
│  │ - Text Extraction (Native + OCR)                         │   │
│  │ - Chapter Detection                                      │   │
│  │ - Content Section Detection                              │   │
│  │ - On-Demand AI Processing                                │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Learning Progress Service                                │   │
│  │ - Session Management                                     │   │
│  │ - Progress Persistence                                   │   │
│  │ - SM2 Algorithm Implementation                           │   │
│  │ - Statistics Calculation                                 │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ External API Integration                                 │   │
│  │ - RapidOCR (Local)                                       │   │
│  │ - Gemini Vision API                                      │   │
│  │ - MyMemory Translation API                               │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ↕ SQL
┌─────────────────────────────────────────────────────────────────┐
│                    DATABASE (SQLite)                             │
│  - Books, Chapters, Content Sections                             │
│  - Vocabulary, Grammar, Exercises                                │
│  - Processing Jobs                                               │
│  - Progress Sessions & Learning Data                             │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 Component Breakdown

**Frontend Components:**
- `PDFUploadModal` - File upload and progress tracking
- `FlashcardStudy` - Card navigation with keyboard shortcuts
- `DictationExercise` - Audio playback with progress tracking
- `ReadingView` - Lesson content with vocabulary lookup
- `GrammarView` - Grammar explanations and examples
- `ExerciseView` - Practice questions
- `LearningDashboard` - Statistics and progress overview

**Backend Services:**
- `PDFProcessingService` - Orchestrates PDF extraction pipeline
- `TextExtractionService` - Native text + OCR extraction
- `ChapterDetectionService` - Identifies chapter boundaries
- `ContentSectionService` - Detects vocabulary, lesson, grammar, exercises
- `AIProcessingService` - Handles Gemini and MyMemory API calls
- `ProgressTrackingService` - Manages learning sessions
- `SM2Service` - Spaced repetition algorithm
- `StatisticsService` - Calculates learning metrics

---

## 2. Database Schema

### 2.1 Core Tables

```sql
-- Books
CREATE TABLE books (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  total_pages INTEGER,
  import_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  processing_time INTEGER,  -- seconds
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Chapters
CREATE TABLE chapters (
  id TEXT PRIMARY KEY,
  book_id TEXT NOT NULL,
  title TEXT NOT NULL,
  page_range TEXT,  -- "1-10"
  vocabulary_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
);

-- Content Sections (Raw extracted text)
CREATE TABLE content_sections (
  id TEXT PRIMARY KEY,
  chapter_id TEXT NOT NULL,
  section_type TEXT NOT NULL,  -- vocabulary, lesson, grammar, exercise
  raw_text TEXT,
  processed_text TEXT,
  extraction_confidence REAL,  -- 0-1
  processing_status TEXT DEFAULT 'pending',  -- pending, extracted, processed, error
  extracted_at TIMESTAMP,
  processed_at TIMESTAMP,
  metadata JSON,  -- section-specific metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE,
  INDEX idx_chapter_section (chapter_id, section_type)
);

-- Vocabulary Items
CREATE TABLE vocabulary_items (
  id TEXT PRIMARY KEY,
  chapter_id TEXT NOT NULL,
  chinese TEXT NOT NULL,
  pinyin TEXT,
  vietnamese TEXT,
  example_sentence TEXT,
  processing_status TEXT DEFAULT 'pending',  -- pending, processed, error
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE,
  INDEX idx_chapter_vocab (chapter_id)
);

-- Grammar Items
CREATE TABLE grammar_items (
  id TEXT PRIMARY KEY,
  chapter_id TEXT NOT NULL,
  grammar_rule TEXT NOT NULL,
  explanation TEXT,
  examples JSON,  -- array of examples
  grammar_type TEXT,  -- verb tense, sentence structure, particle, etc.
  difficulty_level TEXT,  -- beginner, intermediate, advanced
  processing_status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE,
  INDEX idx_chapter_grammar (chapter_id)
);

-- Exercise Items
CREATE TABLE exercise_items (
  id TEXT PRIMARY KEY,
  chapter_id TEXT NOT NULL,
  exercise_type TEXT NOT NULL,  -- multiple_choice, fill_blank, true_false, etc.
  question TEXT NOT NULL,
  options JSON,  -- array of options
  answer_key TEXT,
  explanation TEXT,
  difficulty_level TEXT,
  processing_status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE,
  INDEX idx_chapter_exercise (chapter_id)
);

-- Processing Jobs
CREATE TABLE processing_jobs (
  id TEXT PRIMARY KEY,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  status TEXT DEFAULT 'pending',  -- pending, extracting_text, sections_detected, extraction_complete, error, complete
  progress_percentage INTEGER DEFAULT 0,
  current_step TEXT,
  error_message TEXT,
  start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  end_time TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_status (status)
);
```

### 2.2 Learning Progress Tables

```sql
-- Progress Sessions
CREATE TABLE progress_sessions (
  id TEXT PRIMARY KEY,
  activity_type TEXT NOT NULL,  -- dictation, flashcard, exercise, reading
  resource_id TEXT NOT NULL,  -- chapter_id, exercise_id, etc.
  current_position TEXT,  -- activity-specific position
  status TEXT DEFAULT 'in_progress',  -- in_progress, paused, completed
  start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_updated_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  end_time TIMESTAMP,
  metadata JSON,  -- activity-specific data
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_activity_resource (activity_type, resource_id),
  INDEX idx_status (status)
);

-- Dictation Progress
CREATE TABLE dictation_progress (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  chapter_id TEXT NOT NULL,
  youtube_url TEXT,
  current_sentence_index INTEGER DEFAULT 0,
  current_timestamp REAL DEFAULT 0,  -- seconds
  sentences_completed JSON,  -- array of indices
  user_answers JSON,  -- array of transcriptions
  accuracy_scores JSON,  -- array of scores 0-1
  completion_percentage INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES progress_sessions(id) ON DELETE CASCADE,
  FOREIGN KEY (chapter_id) REFERENCES chapters(id)
);

-- Flashcard Progress
CREATE TABLE flashcard_progress (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  chapter_id TEXT NOT NULL,
  current_card_index INTEGER DEFAULT 0,
  cards_studied JSON,  -- array of card indices
  card_responses JSON,  -- array of responses: correct, incorrect, skip
  study_time_per_card JSON,  -- array of seconds
  sm2_data JSON,  -- {card_id: {interval, ease_factor, next_review_date}}
  completion_percentage INTEGER DEFAULT 0,
  accuracy_rate REAL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES progress_sessions(id) ON DELETE CASCADE,
  FOREIGN KEY (chapter_id) REFERENCES chapters(id)
);

-- Exercise Progress
CREATE TABLE exercise_progress (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  exercise_id TEXT NOT NULL,
  chapter_id TEXT NOT NULL,
  current_question_index INTEGER DEFAULT 0,
  questions_answered JSON,  -- array of question indices
  user_answers JSON,  -- array of user answers
  correct_answers JSON,  -- array of correct answers
  accuracy_scores JSON,  -- array of scores 0-1
  time_per_question JSON,  -- array of seconds
  completion_percentage INTEGER DEFAULT 0,
  overall_accuracy_rate REAL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES progress_sessions(id) ON DELETE CASCADE,
  FOREIGN KEY (exercise_id) REFERENCES exercise_items(id),
  FOREIGN KEY (chapter_id) REFERENCES chapters(id)
);

-- Reading Progress
CREATE TABLE reading_progress (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  chapter_id TEXT NOT NULL,
  current_paragraph_index INTEGER DEFAULT 0,
  current_scroll_position INTEGER DEFAULT 0,  -- pixels
  paragraphs_read JSON,  -- array of indices
  vocabulary_lookups JSON,  -- array of {vocab_id, timestamp}
  notes TEXT,
  completion_percentage INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES progress_sessions(id) ON DELETE CASCADE,
  FOREIGN KEY (chapter_id) REFERENCES chapters(id)
);

-- Learning Statistics
CREATE TABLE learning_statistics (
  id TEXT PRIMARY KEY,
  activity_type TEXT NOT NULL,
  resource_id TEXT,
  total_sessions INTEGER DEFAULT 0,
  total_study_time INTEGER DEFAULT 0,  -- seconds
  average_accuracy REAL DEFAULT 0,
  completion_rate REAL DEFAULT 0,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_activity (activity_type)
);
```

---

## 3. API Design

### 3.1 PDF Processing Endpoints

**POST /api/pdf/upload**
```
Request:
{
  "file": <binary PDF data>,
  "page_range": "1-50" (optional)
}

Response (200):
{
  "status": "success",
  "data": {
    "job_id": "job_abc123",
    "message": "PDF upload started"
  }
}
```

**GET /api/pdf/status/{job_id}**
```
Response (200):
{
  "status": "success",
  "data": {
    "job_id": "job_abc123",
    "status": "extracting_text",
    "progress_percentage": 45,
    "current_step": "Extracting text from page 45/100",
    "estimated_time_remaining": 120,
    "sections": [
      {
        "type": "vocabulary",
        "status": "extracted",
        "item_count": 25
      },
      {
        "type": "lesson",
        "status": "pending",
        "item_count": 0
      }
    ]
  }
}
```

**GET /api/books**
```
Response (200):
{
  "status": "success",
  "data": [
    {
      "id": "book_1",
      "title": "HSK 1 Textbook",
      "total_pages": 150,
      "import_date": "2024-01-15T10:30:00Z",
      "chapter_count": 10
    }
  ]
}
```

**GET /api/chapters/{chapter_id}/sections**
```
Response (200):
{
  "status": "success",
  "data": {
    "chapter_id": "ch_1",
    "sections": [
      {
        "type": "vocabulary",
        "status": "processed",
        "item_count": 25,
        "extracted_at": "2024-01-15T10:35:00Z",
        "processed_at": "2024-01-15T10:40:00Z"
      },
      {
        "type": "lesson",
        "status": "extracted",
        "item_count": 1,
        "extracted_at": "2024-01-15T10:35:00Z"
      }
    ]
  }
}
```

**POST /api/chapters/{chapter_id}/process/{section_type}**
```
Request:
{
  "section_type": "vocabulary"
}

Response (200):
{
  "status": "success",
  "data": {
    "message": "Processing started",
    "estimated_time": 120
  }
}
```

### 3.2 Learning Progress Endpoints

**POST /api/progress/flashcard/save**
```
Request:
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

Response (200):
{
  "status": "success",
  "data": {
    "message": "Progress saved",
    "session_id": "sess_123"
  }
}
```

**GET /api/progress/flashcard/{session_id}**
```
Response (200):
{
  "status": "success",
  "data": {
    "session_id": "sess_123",
    "chapter_id": "ch_1",
    "current_card_index": 5,
    "cards_studied": [0, 1, 2, 3, 4, 5],
    "card_responses": ["correct", "correct", "incorrect", "skip", "correct", "correct"],
    "sm2_data": {...}
  }
}
```

**GET /api/progress/statistics**
```
Response (200):
{
  "status": "success",
  "data": {
    "total_study_time": 3600,
    "sessions_completed": 15,
    "average_accuracy": 0.88,
    "vocabulary_learned": 150,
    "flashcards_due_today": 10,
    "recent_activity": [...]
  }
}
```

---

## 4. PDF Processing Pipeline

### 4.1 Extraction Phase (Fast)

```
1. Receive PDF
   ↓
2. Validate PDF format
   ↓
3. Try native text extraction
   ├─ If sufficient text (>30 chars/page) → Use native text
   └─ If insufficient → Convert to images + OCR
   ↓
4. Extract text from all pages
   ↓
5. Detect chapters (TOC → Headers → Single chapter)
   ↓
6. For each chapter:
   ├─ Detect vocabulary section (生词)
   ├─ Detect lesson section (课文)
   ├─ Detect grammar section (语法)
   └─ Detect exercise section (练习)
   ↓
7. Store raw_text for all sections
   ↓
8. Update status: "extraction_complete"
```

### 4.2 On-Demand Processing Phase (API-Independent)

```
User requests vocabulary processing
   ↓
Check cache (already processed?)
   ├─ Yes → Return cached result
   └─ No → Continue
   ↓
Extract vocabulary items from raw_text
   ↓
Clean OCR errors using local regex patterns
   ↓
Batch vocabulary items (5-10 per batch)
   ↓
For each batch:
   ├─ Validate Chinese characters (Unicode U+4E00-U+9FFF)
   ├─ Standardize pinyin format (local processing)
   ├─ Call LibreTranslate API (free, no key required)
   └─ If LibreTranslate fails → Mark as "translation_pending"
   ↓
Store processed vocabulary
   ↓
Cache result
   ↓
Update status: "processed"
```

### 4.3 Caching Strategy

- **Translation Cache**: Store {chinese_word: vietnamese_translation}
- **Section Cache**: Store {chapter_id + section_type: processed_data}
- **TTL**: 30 days (or until user deletes chapter)
- **Invalidation**: Clear cache when user re-processes section

---

## 5. Learning Progress Tracking

### 5.1 Flashcard Study Flow

```
User starts flashcard study
   ↓
Create progress_session (activity_type: "flashcard")
   ↓
Fetch last session (if exists)
   ├─ Yes → Restore to current_card_index
   └─ No → Start from card 0
   ↓
Display card
   ↓
User presses arrow key or clicks button
   ├─ RIGHT/D → Next card
   ├─ LEFT/A → Previous card
   ├─ SPACE/ENTER → Mark correct
   ├─ X/DELETE → Mark incorrect
   └─ S → Skip
   ↓
Update SM2 algorithm:
   ├─ If correct: interval *= ease_factor
   ├─ If incorrect: interval = 1
   └─ Update next_review_date
   ↓
Save progress every 30 seconds (auto-save)
   ↓
User exits
   ↓
Save final progress
   ↓
Calculate statistics
```

### 5.2 SM2 Algorithm Implementation

```python
def update_sm2(card, response):
    """
    response: 0 (incorrect), 1 (skip), 2 (correct)
    """
    if response == 0:  # incorrect
        card.interval = 1
        card.ease_factor = max(1.3, card.ease_factor - 0.2)
    elif response == 1:  # skip
        pass  # no change
    else:  # correct (response == 2)
        if card.interval == 0:
            card.interval = 1
        elif card.interval == 1:
            card.interval = 3
        else:
            card.interval = round(card.interval * card.ease_factor)
        
        card.ease_factor = max(1.3, card.ease_factor + 0.1)
    
    card.next_review_date = today + timedelta(days=card.interval)
    return card
```

### 5.3 Dictation Progress Flow

```
User starts dictation
   ↓
Fetch last session (if exists)
   ├─ Yes → Restore to current_sentence_index + timestamp
   └─ No → Start from sentence 0
   ↓
Play audio from timestamp
   ↓
User listens and types transcription
   ↓
User submits answer
   ↓
Calculate accuracy (Levenshtein distance)
   ↓
Save user_answer + accuracy_score
   ↓
Move to next sentence
   ↓
Auto-save progress every 30 seconds
   ↓
User exits
   ↓
Save final progress
```

---

## 6. Flashcard Example Analysis (Local, No Gemini API)

### 6.1 Example Analysis Flow

```
User enters example sentence
   ↓
Check cache (already analyzed?)
   ├─ Yes → Return cached analysis
   └─ No → Continue
   ↓
Local Analysis:
   ├─ Check keyword presence
   ├─ Analyze structure (complete/fragment/list)
   ├─ Count Chinese characters
   ├─ Identify punctuation marks
   └─ Validate character encoding
   ↓
Translation (LibreTranslate):
   ├─ Translate sentence to Vietnamese
   └─ If fails → Skip translation, keep local analysis
   ↓
Cache result
   ↓
Return analysis + feedback
```

### 6.2 Example Generation (Template-Based)

```
User requests example generation
   ↓
Get word type (verb, noun, adjective, adverb)
   ↓
Select template for word type
   ↓
Generate 3-5 examples using keyword
   ↓
Translate each example to Vietnamese (LibreTranslate)
   ↓
Return examples with translations
```

### 6.3 Local Analysis Components

**Keyword Presence Check:**
- Simple string matching
- Case-insensitive for pinyin
- Exact match for Chinese characters

**Structure Analysis:**
- Complete: Contains 。or ！or ？
- List: Contains 、
- Fragment: No punctuation

**Character Validation:**
- Count Chinese characters (U+4E00-U+9FFF)
- Identify mixed Chinese/English/numbers
- Detect common OCR errors (similar-looking characters)

**Common OCR Error Corrections:**
- 0 → O (zero vs letter O)
- 1 → I (one vs letter I)
- 8 → B (eight vs letter B)
- 人 → 八 (similar shapes)
- 口 → 日 (similar shapes)

---

## 7. Session Persistence and Resume Functionality

### 7.1 Session Management Flow

```
User starts flashcard study
   ↓
Check for existing session
   ├─ Yes → Display "Resume from card X" option
   └─ No → Create new session
   ↓
User chooses: Resume or Start Fresh
   ↓
Load session data (card_index, SM2 data, responses)
   ↓
Display current card
   ↓
User studies (30 seconds auto-save interval)
   ↓
Auto-save progress:
   ├─ Update current_card_index
   ├─ Update card_responses
   ├─ Update SM2 data
   └─ Update last_updated_time
   ↓
User exits
   ↓
Save final progress
   ↓
Update session status: "completed" or "paused"
```

### 7.2 Auto-Save Mechanism

- **Interval**: Every 30 seconds during active study
- **Data Saved**: current_card_index, card_responses, SM2 data, study_time_per_card
- **Endpoint**: POST /api/progress/flashcard/save
- **Fallback**: If save fails, retry on next interval
- **Notification**: Silent save (no UI interruption)

### 7.3 Resume Workflow

```
User returns to flashcard study
   ↓
Fetch last session: GET /api/progress/flashcard/{session_id}
   ↓
Display options:
   ├─ "Resume from card 5" (last position)
   ├─ "Start from beginning"
   └─ "Start new session"
   ↓
User selects option
   ↓
Load session data
   ↓
Restore UI state (card_index, SM2 data)
   ↓
Continue study
```

### 7.4 Session Data Structure

```json
{
  "session_id": "sess_123",
  "activity_type": "flashcard",
  "chapter_id": "ch_1",
  "status": "in_progress",
  "current_card_index": 5,
  "cards_studied": [0, 1, 2, 3, 4, 5],
  "card_responses": ["correct", "correct", "incorrect", "skip", "correct", "correct"],
  "study_time_per_card": [30, 25, 45, 10, 35, 40],
  "sm2_data": {
    "0": {"interval": 1, "ease_factor": 2.5, "next_review_date": "2024-01-16"},
    "1": {"interval": 3, "ease_factor": 2.6, "next_review_date": "2024-01-18"}
  },
  "start_time": "2024-01-15T10:00:00Z",
  "last_updated_time": "2024-01-15T10:15:30Z",
  "end_time": null
}
```

---

## 8. Keyboard Navigation for Flashcards

### 8.1 Keyboard Shortcuts

| Key | Action |
|-----|--------|
| RIGHT ARROW or D | Next card |
| LEFT ARROW or A | Previous card |
| SPACE or ENTER | Mark as correct |
| X or DELETE | Mark as incorrect |
| S | Skip card |
| H or ? | Toggle help panel |

### 8.2 Keyboard Navigation Flow

```
User presses key
   ↓
Check if in text input field
   ├─ Yes → Allow typing, disable shortcuts
   └─ No → Process shortcut
   ↓
Execute action:
   ├─ Navigation: Move to next/previous card
   ├─ Response: Record response, update SM2, move to next
   └─ Help: Toggle shortcuts display
   ↓
Auto-save progress
   ↓
Update UI
```

### 8.3 UI Components

**Keyboard Shortcuts Help Panel:**
```
┌─────────────────────────────────┐
│  ⌨️ Keyboard Shortcuts           │
├─────────────────────────────────┤
│ → or D    Next card             │
│ ← or A    Previous card         │
│ SPACE     Mark correct          │
│ X         Mark incorrect        │
│ S         Skip                  │
│ H or ?    Toggle this help      │
└─────────────────────────────────┘
```

---

## 9. Frontend Integration

### 9.1 State Management Updates

```javascript
// New state properties
state.books = [
  {
    id: "book_1",
    title: "HSK 1",
    chapters: [...]
  }
];

state.currentProcessingJob = {
  job_id: "job_123",
  status: "extracting_text",
  progress: 45,
  sections: [...]
};

state.progressSessions = {
  "flashcard_ch_1": {
    session_id: "sess_123",
    current_card_index: 5,
    sm2_data: {...}
  }
};

state.learningStatistics = {
  total_study_time: 3600,
  sessions_completed: 15,
  average_accuracy: 0.88
};
```

### 9.2 UI Components

**PDFUploadModal**
- File input
- Progress bar
- Section status display
- Cancel button

**FlashcardStudy**
- Card display
- Navigation arrows (clickable + keyboard)
- Mark correct/incorrect buttons
- Progress indicator
- Keyboard shortcuts display

**DictationExercise**
- Audio player with timestamp
- Transcription input
- Submit button
- Accuracy feedback
- Sentence counter

**LearningDashboard**
- Total study time
- Sessions completed
- Average accuracy
- Vocabulary learned
- Flashcards due today
- Recent activity timeline

---

## 10. Performance Considerations

### 10.1 Parallel Processing

- Use `concurrent.futures.ThreadPoolExecutor` for OCR
- Process 4-8 pages simultaneously
- Limit to prevent memory overflow

### 10.2 Caching

- Redis or in-memory cache for translations
- SQLite indexes on frequently queried columns
- Cache invalidation on user action

### 10.3 Database Optimization

```sql
-- Key indexes
CREATE INDEX idx_chapter_section ON content_sections(chapter_id, section_type);
CREATE INDEX idx_chapter_vocab ON vocabulary_items(chapter_id);
CREATE INDEX idx_progress_activity ON progress_sessions(activity_type, resource_id);
CREATE INDEX idx_processing_status ON processing_jobs(status);
```

### 10.4 API Batching

- Batch vocabulary items: 5-10 per request
- Rate limit: 300ms between requests
- Timeout: 30 seconds per API call

---

## 11. Error Handling & Fallbacks

### 11.1 Error Scenarios

| Scenario | Fallback |
|----------|----------|
| LibreTranslate unavailable | Use local analysis only (no translation) |
| RapidOCR unavailable | Return error, allow retry |
| PDF corrupted | Return 400 error |
| Section not found | Mark as "not_found", continue |

### 11.2 Retry Logic

```python
def retry_with_backoff(func, max_retries=3, backoff_factor=2):
    for attempt in range(max_retries):
        try:
            return func()
        except Exception as e:
            if attempt == max_retries - 1:
                raise
            wait_time = backoff_factor ** attempt
            time.sleep(wait_time)
```

---

## 12. Implementation Phases

### Phase 1: Core PDF Processing (Week 1-2)
- PDF upload endpoint
- Text extraction (native + OCR)
- Chapter detection
- Content section detection
- Database schema
- Basic API endpoints

### Phase 2: On-Demand AI Processing (Week 3)
- LibreTranslate integration
- Local text cleaning
- Caching system
- Process endpoints

### Phase 3: Learning Progress Tracking (Week 4)
- Progress session management
- SM2 algorithm
- Flashcard keyboard navigation
- Dictation progress tracking
- Exercise progress tracking

### Phase 4: Flashcard Example Analysis (Week 5)
- Local example analysis
- Template-based example generation
- Session persistence and resume
- Keyboard shortcuts

### Phase 5: Learning Analytics (Week 6)
- Statistics calculation
- Dashboard UI
- Timeline view
- Performance optimization

---

## 13. Security & Data Privacy

### 13.1 File Handling

- Validate PDF MIME type
- Store in secure temp directory
- Delete after processing
- Max file size: 50MB

### 13.2 API Keys

- Store in environment variables
- Never log API keys
- Use .env file (not in git)

### 13.3 Data Privacy

- Only send necessary data to external APIs
- Don't share personal data
- Implement rate limiting
- Encrypt sensitive data in DB

---

## 14. Testing Strategy

### 14.1 Unit Tests

- Text extraction functions
- Chapter detection algorithms
- SM2 algorithm
- Statistics calculations
- Local example analysis

### 14.2 Integration Tests

- End-to-end PDF processing
- API endpoint functionality
- Database persistence
- Progress tracking workflow
- Session resume functionality

### 14.3 Property-Based Tests

- **Round-trip property**: Extract → Store → Retrieve = Original + Translations
- **Idempotence property**: Process same PDF twice = Identical results
- **Invariant property**: Total vocab = Sum of chapter vocab counts
- **SM2 property**: Correct answers increase interval, incorrect answers reset to 1
- **Session persistence property**: Save session → Exit → Resume = Same state

