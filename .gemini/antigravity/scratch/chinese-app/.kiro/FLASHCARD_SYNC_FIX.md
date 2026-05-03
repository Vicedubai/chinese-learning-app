# ✅ Sửa Lỗi: Từ Mới Không Đồng Bộ Với Flashcard

## Vấn Đề
Số từ vựng hiển thị trong trang Giáo Trình không khớp với số từ trong Flashcard.

**Ví dụ**:
- Giáo Trình: "Chuong Thi Cong - 1 chương - 53 từ mới"
- Flashcard: "79 thẻ cần ôn" (từ chương khác)

## Nguyên Nhân
Hàm `populateDeckSelect()` sử dụng tên chương (`ch.title`) làm giá trị option, nhưng hàm `renderFlashcards()` so sánh với ID chương (`chapterId`). Điều này gây ra sự không khớp.

## Giải Pháp

### 1. Sửa Hàm `populateDeckSelect()` (Line 217)
**File**: `js/flashcards.js`

**Thay đổi**:
- Sử dụng `chapterId` làm giá trị option (thay vì `ch.title`)
- Hiển thị `ch.title` làm text (để người dùng thấy tên chương)
- Dùng `Map` thay vì `Set` để lưu cả ID và tên

**Trước**:
```javascript
const decks = new Set();
State.cards.forEach(c => {
  if (c.deck) decks.add(c.deck);
  else if (c.chapterId) {
    const ch = State.chapters.find(x => x.id === c.chapterId);
    if (ch) decks.add(ch.title);  // ← Dùng tên chương
  }
});

sel.innerHTML = '<option value="">Tất cả bộ từ vựng</option>';
Array.from(decks).forEach(d => {
  sel.innerHTML += `<option value="${d}" ${d === currentVal ? 'selected' : ''}>${d}</option>`;
});
```

**Sau**:
```javascript
const decks = new Map(); // Map: id -> title
State.cards.forEach(c => {
  if (c.deck) {
    decks.set(c.deck, c.deck);
  } else if (c.chapterId) {
    const ch = State.chapters.find(x => x.id === c.chapterId);
    if (ch) {
      decks.set(c.chapterId, ch.title);  // ← Dùng ID chương
    }
  }
});

sel.innerHTML = '<option value="">Tất cả bộ từ vựng</option>';
Array.from(decks.entries()).forEach(([id, title]) => {
  sel.innerHTML += `<option value="${id}" ${id === currentVal ? 'selected' : ''}>${title}</option>`;
});
```

### 2. Sửa Hàm `renderFlashcards()` (Line 236)
**File**: `js/flashcards.js`

**Thay đổi**:
- Thêm kiểm tra `c.chapterId === selectedDeck` trước
- Giữ kiểm tra `c.deck === selectedDeck` cho tương thích ngược
- Giữ kiểm tra `ch.title === selectedDeck` cho tương thích ngược

**Trước**:
```javascript
if (selectedDeck) {
  queue = queue.filter(c => {
    if (c.deck === selectedDeck) return true;
    if (c.chapterId) {
      const ch = State.chapters.find(x => x.id === c.chapterId);
      if (ch && ch.title === selectedDeck) return true;
    }
    return false;
  });
}
```

**Sau**:
```javascript
if (selectedDeck) {
  queue = queue.filter(c => {
    if (c.chapterId === selectedDeck) return true;  // ← Kiểm tra ID trước
    if (c.deck === selectedDeck) return true;
    if (c.chapterId) {
      const ch = State.chapters.find(x => x.id === c.chapterId);
      if (ch && ch.title === selectedDeck) return true;
    }
    return false;
  });
}
```

### 3. Cập Nhật Cache Version
**File**: `index.html` (Line 684)

**Thay đổi**:
- Tăng version từ `v=2` → `v=3`

**Trước**:
```html
<script src="js/flashcards.js?v=2"></script>
```

**Sau**:
```html
<script src="js/flashcards.js?v=3"></script>
```

---

## Quy Trình Đồng Bộ

### Trước Sửa
```
1. Nhấn "🃏 Học flashcard" trong Giáo Trình
   ↓
2. studyChapter(id)
   ├─ filterChapterId = id  (ID chương)
   └─ navigate('flashcards')
   ↓
3. renderFlashcards()
   ├─ selectedDeck = filterChapterId (ID chương)
   ├─ Lọc: ch.title === selectedDeck  ← KHÔNG KHỚP!
   └─ Hiển thị từ chương khác
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
   ├─ selectedDeck = filterChapterId (ID chương)
   ├─ Lọc: c.chapterId === selectedDeck  ← KHỚP!
   └─ Hiển thị từ chương đúng
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
console.log(State.chapters)  // Xem ID chương
console.log(State.cards)  // Xem chapterId của từ vựng

// Xem từ vựng của chương cụ thể
const chapterId = 'chapter-id';
console.log(State.cards.filter(c => c.chapterId === chapterId))
```

---

## Xác Minh Sửa Lỗi

✅ Hàm `populateDeckSelect()` sử dụng ID chương
✅ Hàm `renderFlashcards()` so sánh với ID chương
✅ Số từ trong Giáo Trình khớp với số thẻ trong Flashcard
✅ Cache version được cập nhật (v=3)
✅ Không có lỗi syntax

---

## Tài Liệu Liên Quan

- 📊 [Cấu Trúc Dữ Liệu](./DATA_STRUCTURE.md)
- 🃏 [Flashcard & Session Persistence](./SESSION_PERSISTENCE.md)
- 🎓 [Tổng Quan Hệ Thống](./SYSTEM_OVERVIEW.md)
