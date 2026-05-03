# Manual Chapters & Flashcard Synchronization Fix

## Problem
Manual chapters (chương thủ công) created through the "➕ Tạo chương mới" button were not appearing in the Flashcard deck selector dropdown, even though the vocabulary cards were being added correctly.

## Root Cause
When vocabulary cards were added to manual chapters via:
- ✏️ Nhập từ vựng (Manual input)
- 📥 Import Excel/CSV

The `populateDeckSelect()` function in `js/flashcards.js` was not being called to refresh the deck selector dropdown. This meant the dropdown didn't know about the newly added cards.

## Solution
Added `populateDeckSelect()` calls to the vocabulary import functions to refresh the flashcard deck selector whenever cards are added to a manual chapter.

### Changes Made

#### 1. **addManualCard()** function in `js/ai-fix.js`
- **Before**: Only called `renderLibrary()` and `renderDashboard()`
- **After**: Also calls `populateDeckSelect()` to update flashcard deck selector
- **Location**: Line ~95

```javascript
// Cập nhật flashcard deck selector để đồng bộ chương thủ công
if (document.getElementById('fc-deck-select')) {
  populateDeckSelect();
}
```

#### 2. **importFromText()** function in `js/ai-fix.js`
- **Before**: Only called `renderLibrary()` and `renderDashboard()`
- **After**: Also calls `populateDeckSelect()` to update flashcard deck selector
- **Location**: Line ~180

```javascript
// Cập nhật flashcard deck selector để đồng bộ chương thủ công
if (document.getElementById('fc-deck-select')) {
  populateDeckSelect();
}
```

## How It Works

### Data Flow for Manual Chapters:

1. **Create Manual Chapter**
   ```
   showCreateChapterForm() 
   → createNewChapter() 
   → State.chapters.push(newChapter with bookId: 'manual')
   → renderLibrary() displays "📝 Chương Thủ Công" section
   ```

2. **Add Vocabulary to Manual Chapter**
   ```
   aiFixChapter(chapterId)
   → showManualInput(chapterId)
   → addManualCard(chapterId)
   → State.cards.push({chapterId: chapterId, ...})
   → renderLibrary() + renderDashboard() + populateDeckSelect()
   ```

3. **Flashcard Deck Selector Update**
   ```
   populateDeckSelect()
   → Iterates through State.cards
   → For each card with chapterId, finds the chapter title
   → Adds option to dropdown: <option value="chapterId">Chapter Title</option>
   ```

4. **Flashcard Filtering**
   ```
   renderFlashcards()
   → Gets selected deck from dropdown
   → Filters State.getDueCards() by chapterId
   → Displays only cards from selected manual chapter
   ```

## Testing Checklist

- [x] Create manual chapter via "➕ Tạo chương mới"
- [x] Add vocabulary manually via "✏️ Nhập từ vựng"
- [x] Verify chapter appears in Flashcard deck selector
- [x] Select manual chapter from dropdown
- [x] Verify flashcards display correctly
- [x] Import vocabulary via "📥 Import Excel/CSV"
- [x] Verify imported cards appear in flashcard selector
- [x] Verify SM2 algorithm works with manual chapter cards

## Files Modified

1. **js/ai-fix.js**
   - Added `populateDeckSelect()` call in `addManualCard()` function
   - Added `populateDeckSelect()` call in `importFromText()` function
   - Cache version: `v=5` → `v=6`

2. **index.html**
   - Updated cache version for `js/ai-fix.js?v=6`

## Benefits

1. **Real-time Synchronization**: Flashcard deck selector updates immediately when cards are added
2. **Seamless Workflow**: Users can create chapters and add vocabulary without manual refresh
3. **Consistent Data**: Manual chapters are treated the same as PDF-imported chapters
4. **Better UX**: No confusion about where vocabulary went

## Related Functions

- `populateDeckSelect()` - Updates the flashcard deck selector dropdown
- `renderFlashcards()` - Filters and displays flashcards by selected deck
- `addManualCard()` - Adds a single vocabulary card manually
- `importFromText()` - Imports multiple vocabulary cards from CSV/text
- `createNewChapter()` - Creates a new manual chapter
- `aiFixChapter()` - Opens the vocabulary input interface for a chapter

## Future Enhancements

- Add batch import from file upload
- Add vocabulary editing interface
- Add vocabulary deletion with confirmation
- Add chapter merging for manual chapters
- Add export of manual chapters to CSV/Excel
