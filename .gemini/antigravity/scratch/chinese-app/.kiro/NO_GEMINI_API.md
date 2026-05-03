# API-Independent Learning System - Design Update

## Summary of Changes

Based on user feedback about reducing API dependency (especially Gemini API), the spec has been updated to use **free, local, and open-source alternatives** for all processing tasks.

---

## Key Changes

### 1. **Translation & Text Processing**
- **Before**: Relied on Gemini Vision API for text correction and translation
- **After**: Uses **LibreTranslate** (free, no API key required) for Vietnamese translation
- **Fallback**: If LibreTranslate fails, system still provides local analysis without translation

### 2. **Flashcard Example Analysis**
- **Before**: Required Gemini API to analyze and provide feedback on user-entered example sentences
- **After**: Uses **local pattern matching** and **template-based generation**
  - Keyword presence checking (simple string matching)
  - Sentence structure analysis (complete/fragment/list)
  - Chinese character validation (Unicode ranges)
  - Common OCR error detection and correction
  - Template-based example generation for different word types

### 3. **Session Persistence & Resume**
- **New Feature**: Auto-save progress every 30 seconds
- Users can exit and resume from exactly where they left off
- All session data (cards studied, responses, SM2 data) is preserved
- No data loss on browser crash or accidental exit

### 4. **Keyboard Navigation**
- **New Feature**: Efficient keyboard shortcuts for flashcard study
  - RIGHT/D → Next card
  - LEFT/A → Previous card
  - SPACE/ENTER → Mark correct
  - X/DELETE → Mark incorrect
  - S → Skip
  - H/? → Show help

---

## API Dependencies (Minimal)

### Required APIs
1. **LibreTranslate** (Free, no key)
   - Used for: Chinese → Vietnamese translation
   - Fallback: Local analysis only (no translation)
   - Rate limit: 300ms between requests

### Optional APIs
- None required for core functionality

### Removed Dependencies
- ❌ Gemini Vision API (no longer needed)
- ❌ MyMemory API (replaced with LibreTranslate)

---

## Local Processing Components

### Text Cleaning
- Regex-based OCR error correction
- Chinese character validation (U+4E00-U+9FFF)
- Pinyin standardization
- Punctuation detection

### Example Analysis
- Keyword presence checking
- Sentence structure analysis
- Character counting
- Common OCR error detection

### Example Generation
- Template-based examples for:
  - Verbs (动词)
  - Nouns (名词)
  - Adjectives (形容词)
  - Adverbs (副词)

### SM2 Algorithm
- Fully local implementation
- No external dependencies
- Interval and ease_factor calculations
- Next review date computation

---

## Database Schema Updates

### New Tables for Session Persistence
```sql
-- Progress Sessions
CREATE TABLE progress_sessions (
  id TEXT PRIMARY KEY,
  activity_type TEXT,  -- flashcard, dictation, exercise, reading
  resource_id TEXT,
  status TEXT,  -- in_progress, paused, completed
  start_time TIMESTAMP,
  last_updated_time TIMESTAMP,
  end_time TIMESTAMP,
  metadata JSON
);

-- Flashcard Progress
CREATE TABLE flashcard_progress (
  id TEXT PRIMARY KEY,
  session_id TEXT,
  chapter_id TEXT,
  current_card_index INTEGER,
  cards_studied JSON,
  card_responses JSON,
  study_time_per_card JSON,
  sm2_data JSON,
  completion_percentage INTEGER
);
```

---

## API Endpoints (New)

### Session Management
- `POST /api/progress/flashcard/save` - Save flashcard progress
- `GET /api/progress/flashcard/{session_id}` - Get flashcard session
- `POST /api/progress/dictation/save` - Save dictation progress
- `GET /api/progress/dictation/{session_id}` - Get dictation session
- `POST /api/progress/exercise/save` - Save exercise progress
- `GET /api/progress/exercise/{session_id}` - Get exercise session
- `POST /api/progress/reading/save` - Save reading progress
- `GET /api/progress/reading/{session_id}` - Get reading session

### Example Analysis
- `POST /api/ai/analyze-sentence` - Analyze user example sentence (local)
- `POST /api/ai/generate-example` - Generate example sentences (template-based)

### Statistics
- `GET /api/progress/statistics` - Overall learning statistics
- `GET /api/progress/statistics/{activity_type}` - Activity-specific stats
- `GET /api/progress/timeline` - Learning history timeline
- `GET /api/progress/vocabulary/learned` - List of learned vocabulary

---

## Frontend Updates

### Flashcard Study Component
- Keyboard navigation support
- Auto-save every 30 seconds
- Resume from last position
- Display keyboard shortcuts help

### Session Management
- "Resume from card X" option on entry
- Auto-save indicator
- Session history view
- Progress statistics dashboard

### Example Analysis UI
- Input field for user example sentences
- Real-time analysis feedback
- Keyword presence indicator
- Sentence structure display
- Generated examples with translations

---

## Benefits

✅ **No Gemini API dependency** - Eliminates unreliable API calls
✅ **Free translation** - LibreTranslate is free and open-source
✅ **Session persistence** - Never lose progress
✅ **Keyboard efficiency** - Fast flashcard study
✅ **Local processing** - Faster, more reliable
✅ **Offline capable** - Most features work without internet
✅ **Cost-effective** - No API costs

---

## Implementation Priority

### Phase 1 (Core)
- Session persistence tables
- Auto-save mechanism
- Resume functionality
- Keyboard navigation

### Phase 2 (Enhancement)
- Local example analysis
- Template-based generation
- LibreTranslate integration
- Statistics calculation

### Phase 3 (Polish)
- UI improvements
- Performance optimization
- Error handling
- Testing

---

## Testing Strategy

### Unit Tests
- Local text cleaning functions
- Example analysis logic
- SM2 algorithm
- Session persistence

### Integration Tests
- End-to-end session save/resume
- Keyboard navigation
- Example analysis workflow
- Statistics calculation

### Property-Based Tests
- Session persistence invariant: Save → Exit → Resume = Same state
- Example analysis consistency: Same input → Same output
- SM2 correctness: Correct answers increase interval

---

## Migration Path

For existing users with Gemini API integration:
1. Keep existing Gemini endpoints as optional
2. Add new LibreTranslate endpoints as default
3. Allow users to choose translation source in settings
4. Gradually deprecate Gemini endpoints

---

## Notes

- LibreTranslate has rate limits (~5 requests/second)
- Caching reduces API calls significantly
- Local analysis works even if LibreTranslate is down
- All session data is stored locally in SQLite
- No cloud sync required (can be added later)
