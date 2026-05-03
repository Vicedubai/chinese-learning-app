# Exercise Navigation Buttons Fix - "← Lùi" and "Tiếp →"

## Problem
The navigation buttons ("← Lùi" for back and "Tiếp →" for next) were not visible after answering exercise questions, even though they were defined in the HTML.

## Root Cause
The `showFeedback()` function had two issues:

1. **Container Not Visible**: The button container had `display: none` in the inline style, but `showFeedback()` was not making it visible
2. **Incorrect Button Visibility Logic**: The next button was only shown when `idx < pool.length - 1`, which meant it wouldn't show on the last question

## Solution

### 1. **Make Navigation Container Visible**
Added code to ensure the button container is displayed:

```javascript
const navContainer = document.querySelector('[id="ex-btn-prev"]')?.parentElement;

// Always show the navigation container
if (navContainer) {
  navContainer.style.display = 'flex';
}
```

### 2. **Show Buttons on All Questions**
Updated button visibility logic:

```javascript
// Show/hide individual buttons
if (prevBtn) {
  prevBtn.style.display = idx > 0 ? 'inline-block' : 'none';  // Hide on first question
}
if (nextBtn) {
  // Show next button on all questions (including last one, which will end the exercise)
  nextBtn.style.display = 'inline-block';
}
```

### 3. **Handle Last Question Properly**
Updated `moveToNextQuestion()` to end the exercise when reaching the last question:

```javascript
function moveToNextQuestion() {
  // Move to next question after feedback is shown
  exState.idx++;
  
  // Check if we've reached the end
  if (exState.idx >= exState.pool.length) {
    endExercise();
  } else {
    showExercise();
  }
}
```

## Changes Made

### Files Modified:
1. **js/exercises.js**
   - Updated `showFeedback()` to make navigation container visible
   - Updated button visibility logic to show buttons on all questions
   - Updated `moveToNextQuestion()` to handle end of exercise
   - Cache version: `v=5` → `v=6`

2. **index.html**
   - Updated cache version for `js/exercises.js?v=6`

## How It Works Now

### Navigation Button Flow:

```
User answers question
    ↓
checkMC() / checkTranslate() / etc.
    ↓
nextExercise(correct)
    ↓
showFeedback()
    ├─ Make navigation container visible
    ├─ Show "← Lùi" button (if not first question)
    └─ Show "Tiếp →" button (always)
    ↓
User sees feedback with navigation buttons
    ↓
User clicks "Tiếp →" or presses Enter
    ↓
moveToNextQuestion()
    ├─ Increment question index
    ├─ Check if end of exercise
    ├─ If yes: endExercise() → Show results
    └─ If no: showExercise() → Show next question
```

## User Experience

### Before Fix:
1. Answer question
2. See feedback
3. No navigation buttons visible ❌
4. Can only use keyboard shortcuts (Enter, arrow keys)

### After Fix:
1. Answer question
2. See feedback with navigation buttons ✅
3. Click "← Lùi" to go back (if not first question)
4. Click "Tiếp →" to go to next question
5. Or use keyboard shortcuts (Enter, arrow keys)

## Testing Checklist

- [x] Navigation buttons appear after answering
- [x] "← Lùi" button appears on questions 2-40
- [x] "← Lùi" button hidden on question 1
- [x] "Tiếp →" button appears on all questions
- [x] "Tiếp →" button works on last question (ends exercise)
- [x] Enter key (2nd press) advances to next question
- [x] Arrow keys (→ / D) advance to next question
- [x] Results screen shows after last question
- [x] All exercise types work (MC, Translate, Complete, Rearrange, Error, Position)

## Benefits

1. **Visible Navigation**: Users can see and click navigation buttons
2. **Flexible Navigation**: Multiple ways to navigate (buttons, keyboard)
3. **Proper End Handling**: Last question properly transitions to results
4. **Better UX**: Clear visual feedback on available actions
5. **Accessibility**: Keyboard shortcuts still work for power users

## Related Functions

- `showFeedback(correct, explanation)` - Displays feedback and navigation buttons
- `moveToNextQuestion()` - Advances to next question or ends exercise
- `prevExercise()` - Goes to previous question
- `nextExercise(correct)` - Checks answer and shows feedback
- `handleExerciseKey()` - Keyboard navigation handler
- `endExercise()` - Shows results screen

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| **Enter** (1st press) | Submit answer |
| **Enter** (2nd press) | Move to next question |
| **← / A** | Previous question (when answered) |
| **→ / D** | Next question (when answered) |

## Future Enhancements

- Add keyboard shortcut to go back (e.g., Backspace)
- Add progress indicator showing current question number
- Add ability to skip questions
- Add review mode to see all answers at the end
- Add difficulty adjustment based on performance
