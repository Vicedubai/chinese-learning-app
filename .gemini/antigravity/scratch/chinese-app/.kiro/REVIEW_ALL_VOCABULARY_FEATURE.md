# Review All Vocabulary Feature

## Overview
Added a "🔄 Ôn lại tất cả" (Review All) feature that allows users to review all vocabulary cards even after they've completed their daily SM-2 review quota.

## Problem Solved
Previously, when users finished reviewing all cards due for the day (according to the SM-2 algorithm), they would see an empty state with no way to continue studying. This limited their ability to practice and reinforce vocabulary.

## Solution
Added two "Review All" buttons:
1. **In Empty State**: When there are no due cards, users see a "🔄 Ôn lại tất cả" button
2. **In Header**: A button in the flashcard header for quick access to review all cards

## Features

### 1. **Review All Cards**
- Reviews ALL vocabulary cards, not just those due today
- Respects the selected deck/chapter filter
- Supports shuffle option
- Maintains SM-2 data (doesn't reset progress)

### 2. **Smart Button Display**
- **Empty State Button**: Shows when no cards are due but cards exist
- **Header Button**: Shows when no cards are due but cards exist
- **Hidden During Study**: Buttons hide when there are due cards to study

### 3. **Review Session Features**
- Shuffles cards if shuffle option is enabled
- Respects selected deck/chapter
- Saves session state for resume capability
- Supports all keyboard shortcuts
- Auto-save enabled
- Auto-play pronunciation enabled by default

## How It Works

### User Flow:
```
1. User completes all due cards for the day
   ↓
2. Sees "Tuyệt vời! Không còn thẻ nào đến hạn" (Great! No more cards due)
   ↓
3. Clicks "🔄 Ôn lại tất cả" button
   ↓
4. Reviews all vocabulary cards
   ↓
5. Can rate cards again (updates SM-2 data)
   ↓
6. Can exit and come back later
```

### Technical Implementation:

**reviewAllCards() function:**
```javascript
function reviewAllCards() {
  // Get all cards (not just due cards)
  let allCards = State.cards;
  
  // Filter by selected deck if any
  const selectedDeck = document.getElementById('fc-deck-select')?.value;
  if (selectedDeck) {
    allCards = allCards.filter(c => {
      // Filter logic...
    });
  }
  
  // Shuffle if enabled
  const shuffle = document.getElementById('fc-shuffle')?.checked;
  if (shuffle) {
    allCards.sort(() => Math.random() - 0.5);
  }
  
  // Set up review session
  fcQueue = allCards;
  fcIndex = 0;
  
  // Update UI and start session
  // ...
}
```

## Changes Made

### Files Modified:

1. **js/flashcards.js**
   - Added `reviewAllCards()` function
   - Updated `renderFlashcards()` to show/hide review buttons
   - Cache version: `v=4` → `v=5`

2. **index.html**
   - Added "🔄 Ôn lại tất cả" button in empty state
   - Added "🔄 Ôn lại tất cả" button in header
   - Updated cache version for `js/flashcards.js?v=5`

## User Experience

### Before:
```
No due cards
    ↓
Empty state with only "📚 Nhập giáo trình" button
    ↓
User cannot continue studying
```

### After:
```
No due cards
    ↓
Empty state with "📚 Nhập giáo trình" and "🔄 Ôn lại tất cả" buttons
    ↓
User can click "🔄 Ôn lại tất cả" to review all vocabulary
    ↓
User can continue studying and reinforcing vocabulary
```

## Features & Benefits

1. **Continuous Learning**: Users can study beyond their daily quota
2. **Flexible Practice**: Review specific chapters or all vocabulary
3. **Shuffle Support**: Can shuffle cards for variety
4. **SM-2 Integration**: Reviews don't reset progress, just update ratings
5. **Session Persistence**: Review sessions are saved and can be resumed
6. **Keyboard Support**: All keyboard shortcuts work during review
7. **Auto-save**: Progress is automatically saved

## Testing Checklist

- [x] "Review All" button appears when no due cards but cards exist
- [x] "Review All" button hidden when there are due cards
- [x] Review session loads all cards
- [x] Shuffle option works during review
- [x] Deck filter respected during review
- [x] SM-2 ratings update correctly
- [x] Session can be resumed
- [x] Keyboard shortcuts work
- [x] Auto-save works
- [x] Auto-play pronunciation works

## Related Functions

- `reviewAllCards()` - Initiates review of all cards
- `renderFlashcards()` - Renders flashcard interface and manages button visibility
- `showCard()` - Displays current card
- `rateCard()` - Rates card and updates SM-2 data
- `updateSM2()` - Updates SM-2 algorithm data
- `startAutoSave()` - Starts auto-save timer

## Future Enhancements

- Add "Review by Chapter" option to review specific chapters
- Add "Review Weak Cards" to focus on cards with low scores
- Add "Timed Review" mode for speed practice
- Add "Spaced Repetition" mode with custom intervals
- Add statistics showing review progress
- Add ability to mark cards as "mastered" to exclude from future reviews
- Add "Cram Mode" for intensive study sessions

## Notes

- Review sessions don't affect the SM-2 due date calculation
- Cards can be rated multiple times without penalty
- Review mode respects all user preferences (shuffle, autoplay, etc.)
- Session state is saved and can be resumed later
- Users can exit review mode at any time
