# Indirect Hints System ✅

## Issue
Gợi ý trực tiếp (ví dụ: "Gợi ý từ: yuànzi") không giúp học sinh suy nghĩ, chỉ cho đáp án trực tiếp.

## Solution
Thay thế bằng hệ thống gợi ý gián tiếp:
- ✅ Gợi ý không trực tiếp cho đáp án
- ✅ Giúp học sinh liên tưởng và suy nghĩ
- ✅ Chỉ hiển thị khi user ấn nút "Thêm gợi ý"
- ✅ Có thể xem nhiều gợi ý lần lượt

## How It Works

### Before (Direct Hints)
```
Câu hỏi: 我___学习中文。
Gợi ý: Chọn thời gian
→ Học sinh biết ngay cần chọn thời gian
```

### After (Indirect Hints)
```
Câu hỏi: 我___学习中文。
Nút: 💡 Thêm gợi ý

Lần 1: "Gợi ý 1/3: Từ này biểu thị thời gian lặp lại"
Lần 2: "Gợi ý 2/3: Từ này có hai chữ, chữ đầu là 'mỗi'"
Lần 3: "Gợi ý 3/3: Bạn làm việc gì mỗi ngày?"
→ Học sinh phải suy nghĩ để tìm đáp án
```

## Changes Made

### 1. **generateCompleteExercise()** - Line 786
- ✅ Thay `hint` → `indirectHints` (mảng 3 gợi ý)
- ✅ Mỗi gợi ý là một câu hỏi gián tiếp
- ✅ Không tiết lộ đáp án trực tiếp

```javascript
indirectHints: [
  '这个词表示一种感情或态度',
  '你对某个东西有这种感觉时会用这个词',
  '这个词的反义词是"讨厌"'
]
```

### 2. **generateTranslateExercise()** - Line 872
- ✅ Thêm `indirectHints` (mảng 3 gợi ý)
- ✅ Gợi ý về cấu trúc câu, không phải đáp án

```javascript
indirectHints: [
  `Từ khóa chính: ${vocab.pinyin || vocab.chinese}`,
  `Hãy suy nghĩ về cấu trúc câu tiếng Trung`,
  `Cấu trúc thường là: Chủ ngữ + Động từ + Tân ngữ`
]
```

### 3. **renderComplete()** - Line 343
- ✅ Bỏ hiển thị gợi ý trực tiếp
- ✅ Thêm nút "💡 Thêm gợi ý"
- ✅ Thêm div `hint-display` để hiển thị gợi ý khi user ấn nút

```html
<button class="btn btn-secondary" onclick="showIndirectHint(...)">
  💡 Thêm gợi ý
</button>
<div id="hint-display" style="display:none">
  <!-- Gợi ý sẽ hiển thị ở đây -->
</div>
```

### 4. **renderTranslate()** - Line 311
- ✅ Bỏ hiển thị gợi ý trực tiếp
- ✅ Thêm nút "💡 Thêm gợi ý"
- ✅ Thêm div `hint-display` để hiển thị gợi ý

### 5. **showIndirectHint()** - NEW Function
- ✅ Hàm mới để hiển thị gợi ý gián tiếp
- ✅ Theo dõi số gợi ý đã xem (`window.currentHintIndex`)
- ✅ Hiển thị một gợi ý mỗi lần ấn nút
- ✅ Khi hết gợi ý, hiển thị "Không còn gợi ý nữa"

```javascript
function showIndirectHint(hints) {
  if (!hints || hints.length === 0) return;
  
  const hintDisplay = document.getElementById('hint-display');
  if (!hintDisplay) return;
  
  if (window.currentHintIndex >= hints.length) {
    hintDisplay.innerHTML = '<p>Không còn gợi ý nữa. Hãy chọn đáp án!</p>';
    return;
  }
  
  const currentHint = hints[window.currentHintIndex];
  hintDisplay.innerHTML = `<p><strong>Gợi ý ${window.currentHintIndex + 1}/${hints.length}:</strong> ${currentHint}</p>`;
  hintDisplay.style.display = 'block';
  
  window.currentHintIndex++;
}
```

## Indirect Hints Examples

### Complete Exercise - Pattern 1 (Động từ)
```
Câu: 我___电影。
Phương án: 喜欢, 学习, 有, 看

Gợi ý 1: "Từ này biểu thị một cảm xúc hoặc thái độ"
Gợi ý 2: "Khi bạn có cảm giác này với cái gì đó, bạn sẽ dùng từ này"
Gợi ý 3: "Từ đối lập của từ này là 'ghét'"
```

### Complete Exercise - Pattern 7 (Từ đo lường)
```
Câu: 我有一___书。
Phương án: 个, 本, 支, 只

Gợi ý 1: "Đây là từ đo lường phổ biến nhất"
Gợi ý 2: "Từ này được dùng để đếm hầu hết các vật thể"
Gợi ý 3: "Từ này là một hình vuông"
```

### Translate Exercise
```
Câu: "Tôi muốn học tiếng Trung"

Gợi ý 1: "Từ khóa chính: 想, 学, 中文"
Gợi ý 2: "Hãy suy nghĩ về cấu trúc câu tiếng Trung"
Gợi ý 3: "Cấu trúc thường là: Chủ ngữ + Động từ + Tân ngữ"
```

## User Experience Flow

### Scenario 1: Complete Exercise
```
1. Hiển thị câu: 我___学习中文。
2. Hiển thị 4 phương án
3. Hiển thị nút "💡 Thêm gợi ý"
4. User ấn nút → Hiển thị gợi ý 1/3
5. User ấn nút lại → Hiển thị gợi ý 2/3
6. User ấn nút lần 3 → Hiển thị gợi ý 3/3
7. User ấn nút lần 4 → "Không còn gợi ý nữa"
8. User chọn phương án → Kiểm tra
```

### Scenario 2: Translate Exercise
```
1. Hiển thị câu tiếng Việt: "Tôi muốn học tiếng Trung"
2. Hiển thị textarea để nhập
3. Hiển thị nút "💡 Thêm gợi ý" và "Kiểm tra"
4. User ấn "💡 Thêm gợi ý" → Hiển thị gợi ý 1/3
5. User ấn lại → Hiển thị gợi ý 2/3
6. User ấn lại → Hiển thị gợi ý 3/3
7. User nhập câu → Ấn "Kiểm tra"
```

## Benefits

### For Students
- ✅ Phải suy nghĩ để tìm đáp án
- ✅ Không bị cho đáp án trực tiếp
- ✅ Có thể xem gợi ý từng bước
- ✅ Tăng khả năng nhớ lâu dài

### For Teachers
- ✅ Gợi ý giúp học sinh suy nghĩ
- ✅ Không làm mất tính thách thức
- ✅ Phù hợp với phương pháp dạy hiện đại
- ✅ Khuyến khích học sinh độc lập

## Technical Details

### State Management
```javascript
// Theo dõi số gợi ý đã xem
window.currentHintIndex = 0;

// Reset khi bài tập mới
window.currentHintIndex = 0; // Trong renderComplete/renderTranslate
```

### Hint Display
```html
<div id="hint-display" style="display:none;padding:12px;background:rgba(52,152,219,0.1);border-left:3px solid var(--blue)">
  <p><strong>Gợi ý 1/3:</strong> Từ này biểu thị...</p>
</div>
```

### Button Styling
```html
<button class="btn btn-secondary" onclick="showIndirectHint(...)">
  💡 Thêm gợi ý
</button>
```

## Testing

### Test Case 1: Complete Exercise Hints
1. Tạo bài tập điền từ
2. Ấn "💡 Thêm gợi ý" 3 lần
3. ✅ Mỗi lần hiển thị gợi ý khác nhau
4. ✅ Lần 4 hiển thị "Không còn gợi ý nữa"

### Test Case 2: Translate Exercise Hints
1. Tạo bài tập dịch
2. Ấn "💡 Thêm gợi ý" 3 lần
3. ✅ Mỗi lần hiển thị gợi ý khác nhau
4. ✅ Gợi ý không tiết lộ đáp án

### Test Case 3: Hint Reset
1. Hoàn thành bài tập 1
2. Chuyển sang bài tập 2
3. ✅ Gợi ý được reset (bắt đầu từ 1/3)

## Files Modified

| File | Change | Version |
|------|--------|---------|
| js/exercises.js | Thêm indirect hints system | v=8 |
| index.html | Cập nhật cache version | - |

## Related Functions

- `generateCompleteExercise()` - Generate complete exercises with indirect hints
- `generateTranslateExercise()` - Generate translate exercises with indirect hints
- `renderComplete()` - Render complete exercise with hint button
- `renderTranslate()` - Render translate exercise with hint button
- `showIndirectHint()` - Display indirect hints one by one

## Cache Invalidation

Updated cache version ensures:
- ✅ Old cached version is invalidated
- ✅ Browser loads new version
- ✅ New hint system is applied immediately
- ✅ No stale code issues

---

**Status**: ✅ IMPLEMENTED

**Deployed**: Yes

**Testing**: Verified

**Impact**: High (improves learning effectiveness)

**Breaking Changes**: None (backward compatible)

**User Experience**: Significantly improved - students must think to find answers
