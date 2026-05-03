# Exercise "Tiếp →" (Next) Button Fix

## Problem
The "Tiếp →" (Next) button in the exercises section was not working. Users could not advance to the next question after answering.

## Root Cause
The `nextExercise()` function had a guard clause that prevented it from being called when `exState.answered` was already `true`:

```javascript
function nextExercise(correct) {
  if (exState.answered) return;  // ← This guard prevented the button from working!
  exState.answered = true;
  // ... rest of function
}
```

**Flow of the bug:**
1. User answers a question
2. `checkMC()` (or other check function) calls `nextExercise(correct)` to show feedback
3. This sets `exState.answered = true`
4. User clicks "Tiếp →" button which calls `nextExercise(true)` again
5. But `nextExercise()` immediately returns because `exState.answered` is already `true`
6. Nothing happens - button appears broken!

## Solution
Separated the answer checking logic from the question advancement logic into two functions:

### 1. **nextExercise(correct)** - Answer Checking & Feedback
```javascript
function nextExercise(correct) {
  if (exState.answered) return;  // Guard prevents duplicate checking
  exState.answered = true;
  exState.total++;
  if (correct) { exState.score++; State.addXP(10); }
  State.logResult(exState.type, correct);
  
  // Show feedback
  showFeedback(correct, correct ? '🎉 Bạn trả lời chính xác!' : '💡 Hãy xem lại lý thuyết và thử lại!');
}
```

### 2. **moveToNextQuestion()** - Question Advancement
```javascript
function moveToNextQuestion() {
  // Move to next question after feedback is shown
  exState.idx++;
  showExercise();
}
```

## Changes Made

### Files Modified:
1. **js/exercises.js**
   - Split `nextExercise()` into two functions
   - Updated `handleExerciseKey()` to call `moveToNextQuestion()` instead of `nextExercise(true)`
   - Cache version: `v=4` → `v=5`

2. **index.html**
   - Updated "Tiếp →" button to call `moveToNextQuestion()` instead of `nextExercise(true)`
   - Updated cache version for `js/exercises.js?v=5`

## How It Works Now

### Answer Submission Flow:
```
User answers question
    ↓
checkMC() / checkTranslate() / etc.
    ↓
nextExercise(correct)  ← Shows feedback
    ↓
exState.answered = true
    ↓
showFeedback() displays explanation
```

### Question Advancement Flow:
```
User clicks "Tiếp →" or presses Enter (2nd time)
    ↓
moveToNextQuestion()  ← No guard, always works!
    ↓
exState.idx++
    ↓
showExercise()  ← Display next question
```

## User Experience

### Before Fix:
1. Answer question
2. See feedback
3. Click "Tiếp →" → Nothing happens ❌

### After Fix:
1. Answer question
2. See feedback
3. Click "Tiếp →" → Move to next question ✅
4. Or press Enter (2nd time) → Move to next question ✅
5. Or press → / D → Move to next question ✅

## Testing Checklist

- [x] "Tiếp →" button works after answering
- [x] Enter key (2nd press) advances to next question
- [x] Arrow keys (→ / D) advance to next question
- [x] "← Lùi" button works to go back
- [x] Feedback displays correctly
- [x] Score updates correctly
- [x] All exercise types work (MC, Translate, Complete, Rearrange, Error, Position)
- [x] Last question shows result screen

## Benefits

1. **Fixed Critical Bug**: Users can now advance through exercises
2. **Better Code Structure**: Separated concerns (checking vs advancing)
3. **More Reliable**: No more guard clause conflicts
4. **Flexible Navigation**: Multiple ways to advance (button, Enter, arrow keys)
5. **Consistent Behavior**: All navigation methods work the same way

## Related Functions

- `nextExercise(correct)` - Checks answer and shows feedback
- `moveToNextQuestion()` - Advances to next question
- `prevExercise()` - Goes to previous question
- `handleExerciseKey()` - Keyboard navigation handler
- `showFeedback()` - Displays feedback and navigation buttons
- `showExercise()` - Renders current exercise
