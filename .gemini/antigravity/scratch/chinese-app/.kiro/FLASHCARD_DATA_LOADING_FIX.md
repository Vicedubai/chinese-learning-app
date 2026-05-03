# ✅ Sửa Lỗi: Flashcard Không Lấy Dữ Liệu Từ Giáo Trình

## Vấn Đề
Khi nhấn "🃏 Học flashcard" trong Giáo Trình, Flashcard không lấy dữ liệu từ chương được chọn.

**Triệu Chứng**:
- Giáo Trình: "B13: 34 từ mới" hoặc "Bài 14: 53 từ mới"
- Flashcard: Không hiển thị từ vựng (hoặc hiển thị từ chương khác)

## Nguyên Nhân
1. Biến `filterChapterId` không được khai báo (chỉ được gán)
2. Hàm `renderFlashcards()` gán `filterChapterId` từ dropdown, nhưng dropdown chưa được populate
3. Khi `renderFlashcards()` được gọi lần đầu, `filterChapterId` bị ghi đè bằng giá trị rỗng từ dropdown

## Giải Pháp

### 1. Khai Báo `filterChapterId` (Line 8)
**File**: `js/flashcards.js`

**Thay đổi**:
- Thêm khai báo `let filterChapterId = null;` ở đầu file

**Trước**:
```javascript
let fcIndex = 0;
let fcQueue = [];
let fcFlipped = false;
let fcAutoAdvanceTimer = null;
let fcAutoAdvanceEnabled = false;
let fcSessionId = null;
let fcAutoSaveTimer = null;
let fcSessionData = {
  // ...
};
```

**Sau**:
```javascript
let fcIndex = 0;
let fcQueue = [];
let fcFlipped = false;
let fcAutoAdvanceTimer = null;
let fcAutoAdvanceEnabled = false;
let fcSessionId = null;
let fcAutoSaveTimer = null;
let filterChapterId = null;  // ← THÊM
let fcSessionData = {
  // ...
};
```

### 2. Sửa Hàm `renderFlashcards()` (Line 236)
**File**: `js/flashcards.js`

**Thay đổi**:
- Kiểm tra `filterChapterId` trước khi gán từ dropdown
- Nếu `filterChapterId` đã được đặt, dùng nó
- Nếu không, lấy từ dropdown
- Cập nhật dropdown nếu `filterChapterId` được đặt

**Trước**:
```javascript
populateDeckSelect();
const selectedDeck = document.getElementById('fc-deck-select').value;
filterChapterId = selectedDeck;  // ← Ghi đè filterChapterId
```

**Sau**:
```javascript
populateDeckSelect();

// Nếu filterChapterId đã được đặt (từ studyChapter), dùng nó
// Nếu không, lấy từ dropdown
let selectedDeck = filterChapterId || document.getElementById('fc-deck-select').value;

// Cập nhật dropdown nếu filterChapterId được đặt
if (filterChapterId) {
  const sel = document.getElementById('fc-deck-select');
  if (sel) sel.value = filterChapterId;
}
```

### 3. Cập Nhật Cache Version
**File**: `index.html` (Line 684)

**Thay đổi**:
- Tăng version từ `v=3` → `v=4`

**Trước**:
```html
<script src="js/flashcards.js?v=3"></script>
```

**Sau**:
```html
<script src="js/flashcards.js?v=4"></script>
```

---

## Quy Trình Lấy Dữ Liệu

### Trước Sửa
```
1. Nhấn "🃏 Học flashcard" trong Giáo Trình
   ↓
2. studyChapter(id)
   ├─ filterChapterId = id  (ID chương)
   └─ navigate('flashcards')
   ↓
3. renderFlashcards()
   ├─ populateDeckSelect()
   ├─ selectedDeck = dropdown.value  (rỗng)
   ├─ filterChapterId = selectedDeck  ← GHI ĐÈ!
   └─ Không lấy được dữ liệu
```

### Sau Sửa
```
1. Nhấn "🃏 Học flashcard" trong Giáo Trình
   ↓
2. studyChapter(id)
   ├─ filterChapterId = id  (ID chương)
   └─ navigate('flashcards')
   ↓
3. renderFlashcards()
   ├─ populateDeckSelect()
   ├─ selectedDeck = filterChapterId || dropdown.value  ← GIỮ filterChapterId
   ├─ Cập nhật dropdown.value = filterChapterId
   └─ Lấy dữ liệu từ chương đúng
```

---

## Kiểm Tra Dữ Liệu

### Cách 1: Xem Trong Ứng Dụng
1. Vào **📚 Giáo Trình**
2. Nhấn vào chương
3. Xem số từ: "X từ mới"
4. Nhấn **🃏 Học flashcard**
5. Xem số thẻ: "X thẻ cần ôn"
6. Số từ phải khớp với số thẻ

### Cách 2: Xem Trong DevTools
```javascript
// Mở DevTools (F12) → Console
console.log('filterChapterId:', filterChapterId)
console.log('fcQueue.length:', fcQueue.length)
console.log('fcQueue:', fcQueue)
```

---

## Xác Minh Sửa Lỗi

✅ Biến `filterChapterId` được khai báo
✅ Hàm `renderFlashcards()` giữ `filterChapterId` từ `studyChapter()`
✅ Dropdown được cập nhật với giá trị `filterChapterId`
✅ Flashcard lấy dữ liệu từ chương đúng
✅ Cache version được cập nhật (v=4)
✅ Không có lỗi syntax

---

## Tài Liệu Liên Quan

- 📊 [Cấu Trúc Dữ Liệu](./DATA_STRUCTURE.md)
- 🃏 [Flashcard & Session Persistence](./SESSION_PERSISTENCE.md)
- ✅ [Sửa Lỗi: Từ Mới Không Đồng Bộ](./FLASHCARD_SYNC_FIX.md)
