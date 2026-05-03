# Error Exercise Input Fix ✅

## Issue
Bài tập "Tìm lỗi sai" chỉ hiển thị câu đúng mà không yêu cầu user nhập lại câu đúng để kiểm tra.

## Solution
Thay đổi flow bài tập "Tìm lỗi sai":
1. User click vào từ sai
2. Hiển thị câu sai và yêu cầu nhập câu đúng
3. User nhập câu đúng
4. Kiểm tra câu user nhập có khớp với câu đúng không
5. Nếu đúng → Cho điểm, nếu sai → Yêu cầu thử lại

## Changes Made

### File: js/exercises.js

**1. selectError() - Line 478**
- ✅ Bỏ tự động cho điểm
- ✅ Hiển thị textarea để user nhập câu đúng
- ✅ Hiển thị nút "Kiểm tra"
- ✅ Hiển thị giải thích

**2. checkErrorAnswer() - NEW Function**
- ✅ Hàm mới để kiểm tra câu user nhập
- ✅ So sánh câu user với câu đúng (bỏ qua khoảng trắng)
- ✅ Nếu đúng → Cho điểm
- ✅ Nếu sai → Hiển thị lỗi, yêu cầu thử lại

### File: index.html
- **Line 691**: js/exercises.js v=8 → v=9

## How It Works

### Before
```
1. User click vào từ sai
2. Hiển thị: "Câu đúng: 他昨天去了北京。"
3. Tự động cho điểm
4. Chuyển sang câu tiếp theo
```

### After
```
1. User click vào từ sai
2. Hiển thị:
   - Câu sai: 他去了北京昨天。
   - Textarea: "Hãy nhập lại câu đúng..."
   - Nút: "Kiểm tra"
   - Giải thích: "Trạng từ chỉ thời gian phải đứng trước động từ"
3. User nhập: 他昨天去了北京。
4. Ấn "Kiểm tra"
5. Nếu đúng → Cho điểm, nếu sai → "Câu bạn nhập không đúng"
```

## Code Changes

### selectError() Function
```javascript
window.selectError = function(el, original, correct) {
  if (exState.answered) return;
  const item = exState.pool[exState.idx];
  
  // Highlight the selected word
  document.querySelectorAll('#ex-body .word-chip').forEach(c => c.style.borderColor = '');
  el.style.borderColor = 'var(--red)';
  
  // Show the correct sentence and ask user to type it
  document.getElementById('error-feedback').innerHTML = `
    <div class="mt-8">
      <p>Câu sai: <span class="chinese" style="color:var(--red)">${original}</span></p>
      <p>Hãy nhập lại câu đúng:</p>
      <textarea id="error-input" class="transcript-input" placeholder="Nhập câu đúng..."></textarea>
      <button class="btn btn-primary" onclick="checkErrorAnswer('${correct}')">Kiểm tra</button>
    </div>
    <div class="text-sm text-muted mt-8">
      <strong>Giải thích:</strong> ${item.explanation}
    </div>`;
};
```

### checkErrorAnswer() Function
```javascript
window.checkErrorAnswer = function(correctAnswer) {
  if (exState.answered) return;
  
  const userInput = document.getElementById('error-input').value.trim();
  const item = exState.pool[exState.idx];
  
  // Normalize both strings for comparison (remove spaces)
  const userNormalized = userInput.replace(/\s+/g, '');
  const correctNormalized = correctAnswer.replace(/\s+/g, '');
  
  if (userNormalized === correctNormalized) {
    // Correct answer
    exState.answered = true;
    exState.total++;
    exState.score++;
    State.addXP(10);
    State.logResult(exState.type, true);
    
    showFeedback(true, `✅ Chính xác!<br><strong>Câu đúng:</strong> ${correctAnswer}`);
  } else {
    // Wrong answer
    toast('❌ Câu bạn nhập không đúng. Hãy thử lại!', 'error');
    document.getElementById('error-input').focus();
  }
};
```

## User Experience Flow

### Scenario: Error Exercise
```
1. Hiển thị câu sai với các từ có thể click:
   他 | 去 | 了 | 北京 | 昨天 | 。

2. User click vào "昨天" (từ sai)
   ↓
   Hiển thị:
   - Câu sai: 他去了北京昨天。
   - Textarea: [Nhập câu đúng...]
   - Nút: [Kiểm tra]
   - Giải thích: "Trạng từ chỉ thời gian phải đứng trước động từ"

3. User nhập: 他昨天去了北京。
   ↓
   Ấn [Kiểm tra]

4. Nếu đúng:
   ✅ Chính xác!
   Câu đúng: 他昨天去了北京。
   Giải thích: ...
   → Cho 10 XP
   → Chuyển sang câu tiếp theo

5. Nếu sai:
   ❌ Câu bạn nhập không đúng. Hãy thử lại!
   → Textarea vẫn hiển thị
   → User có thể thử lại
```

## Comparison Logic

### Normalization
```javascript
// Bỏ qua khoảng trắng khi so sánh
"他 昨天 去 了 北京 。" → "他昨天去了北京。"
"他昨天去了北京。" → "他昨天去了北京。"
// Kết quả: Khớp ✅
```

### Flexible Matching
- ✅ Bỏ qua khoảng trắng
- ✅ Bỏ qua dấu cách
- ✅ So sánh chính xác từng ký tự

## Benefits

### For Students
- ✅ Phải suy nghĩ để sửa lỗi
- ✅ Không chỉ tìm lỗi mà còn phải sửa
- ✅ Tăng khả năng viết câu đúng
- ✅ Hiểu rõ hơn về ngữ pháp

### For Teachers
- ✅ Kiểm tra khả năng sửa lỗi của học sinh
- ✅ Không chỉ kiểm tra nhận biết mà còn kiểm tra sản xuất
- ✅ Phù hợp với chuẩn HSK
- ✅ Tăng độ khó của bài tập

## Testing

### Test Case 1: Correct Answer
1. Click vào từ sai
2. Nhập câu đúng chính xác
3. Ấn "Kiểm tra"
4. ✅ Hiển thị "✅ Chính xác!"
5. ✅ Cho 10 XP
6. ✅ Chuyển sang câu tiếp theo

### Test Case 2: Wrong Answer
1. Click vào từ sai
2. Nhập câu sai
3. Ấn "Kiểm tra"
4. ✅ Hiển thị "❌ Câu bạn nhập không đúng"
5. ✅ Textarea vẫn hiển thị
6. ✅ User có thể thử lại

### Test Case 3: Whitespace Handling
1. Click vào từ sai
2. Nhập: "他 昨天 去 了 北京 。" (có khoảng trắng)
3. Ấn "Kiểm tra"
4. ✅ Hiển thị "✅ Chính xác!" (bỏ qua khoảng trắng)

### Test Case 4: Multiple Attempts
1. Click vào từ sai
2. Nhập sai lần 1 → "❌ Câu bạn nhập không đúng"
3. Nhập sai lần 2 → "❌ Câu bạn nhập không đúng"
4. Nhập đúng lần 3 → "✅ Chính xác!"
5. ✅ Cho 10 XP (chỉ 1 lần)

## Files Modified

| File | Change | Version |
|------|--------|---------|
| js/exercises.js | Thêm input check cho error exercises | v=9 |
| index.html | Cập nhật cache version | - |

## Related Functions

- `selectError()` - Handle error word selection
- `checkErrorAnswer()` - Check user's corrected sentence
- `renderError()` - Render error exercise
- `showFeedback()` - Show feedback after answer
- `toast()` - Show error message

## Cache Invalidation

Updated cache version ensures:
- ✅ Old cached version is invalidated
- ✅ Browser loads new version
- ✅ New error exercise flow is applied immediately
- ✅ No stale code issues

---

**Status**: ✅ IMPLEMENTED

**Deployed**: Yes

**Testing**: Verified

**Impact**: High (improves exercise quality)

**Breaking Changes**: None (backward compatible)

**User Experience**: Significantly improved - students must correct errors, not just find them
