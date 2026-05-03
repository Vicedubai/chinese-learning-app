# 📊 Cấu Trúc Dữ Liệu - Sách, Chương, Từ Vựng

## Phân Cấp Dữ Liệu

```
📚 SÁCH (Books)
├── 📖 CHƯƠNG (Chapters)
│   ├── 📝 TỪ VỰNG (Cards)
│   ├── 📝 TỪ VỰNG
│   └── 📝 TỪ VỰNG
├── 📖 CHƯƠNG
│   ├── 📝 TỪ VỰNG
│   └── 📝 TỪ VỰNG
└── 📖 CHƯƠNG
    └── 📝 TỪ VỰNG
```

## Chi Tiết Cấu Trúc

### 1. SÁCH (Books)
**Nguồn**: File PDF bạn tải lên
**Lưu trữ**: `State.books[]`

```javascript
{
  id: "unique-id",
  title: "Tên sách",
  fileName: "file.pdf",
  pages: 150,
  uploadedAt: 1234567890,
  cached: true
}
```

### 2. CHƯƠNG (Chapters)
**Nguồn**: Được tách từ sách hoặc tạo thủ công
**Lưu trữ**: `State.chapters[]`

```javascript
{
  id: "unique-id",
  bookId: "sách-id" hoặc "manual" (nếu tạo thủ công),
  title: "Chương 1: Giới thiệu",
  num: 1,
  pages: 10,
  startPage: 1,
  endPage: 10,
  rawText: "Nội dung chương...",
  studied: false
}
```

**Quan hệ**:
- Mỗi chương thuộc 1 sách (qua `bookId`)
- 1 sách có nhiều chương

### 3. TỪ VỰNG (Cards)
**Nguồn**: Nhập thủ công hoặc import CSV
**Lưu trữ**: `State.cards[]`

```javascript
{
  id: "unique-id",
  chapterId: "chương-id",
  chinese: "图书城",
  pinyin: "túshūchéng",
  wordType: "圖書城" (Hán-Việt, tùy chọn),
  vietnamese: "thành phố sách",
  example: "我喜欢去图书城看书。",
  
  // SM-2 Algorithm (Spaced Repetition)
  ef: 2.5,           // Ease Factor
  interval: 1,       // Ngày giữa các lần ôn tập
  reps: 0,           // Số lần ôn tập
  nextReview: 0      // Timestamp lần ôn tập tiếp theo
}
```

**Quan hệ**:
- Mỗi từ vựng thuộc 1 chương (qua `chapterId`)
- 1 chương có nhiều từ vựng

## Lưu Trữ Dữ Liệu

### Nơi Lưu Trữ
- **Chính**: `localStorage` (trình duyệt)
- **Sao lưu**: SQLite Server (Python backend)

### Cách Lưu
```javascript
State.save()  // Lưu tất cả vào localStorage
State.sync()  // Đồng bộ lên Server
```

### Các Khóa localStorage
```
"books"                 → State.books[]
"chapters"              → State.chapters[]
"cards"                 → State.cards[]
"dictationPlaylist"     → State.dictationPlaylist[]
"progress"              → State.progress{}
"session"               → State.session{}
```

## Quy Trình Tạo Chương Mới

### 1. Tạo Chương Thủ Công
```
Nhấn "➕ Tạo chương mới"
  ↓
Nhập tên chương
  ↓
Nhấn "✅ Tạo chương"
  ↓
createNewChapter()
  ├─ Tạo object chương mới
  ├─ State.chapters.push(newChapter)
  ├─ State.save()  ← LƯU VÀO localStorage
  ├─ renderLibrary()
  ├─ renderDashboard()
  └─ Mở form nhập từ vựng
```

### 2. Nhập Từ Vựng
```
Chọn cách nhập:
  ├─ ✍️ Nhập Thủ Công
  │   ├─ Nhập từng từ
  │   ├─ addManualCard()
  │   ├─ State.cards.push(newCard)
  │   ├─ State.save()  ← LƯU VÀO localStorage
  │   └─ Lặp lại
  │
  └─ 📊 Import Excel/CSV
      ├─ Dán nội dung CSV
      ├─ importFromText()
      ├─ State.cards.push(newCard) × N
      ├─ State.save()  ← LƯU VÀO localStorage
      └─ Hiển thị chi tiết chương
```

## Kiểm Tra Dữ Liệu Được Lưu

### Trong Trình Duyệt
1. Mở DevTools (F12)
2. Vào tab "Application" → "Local Storage"
3. Tìm khóa "chapters" hoặc "cards"
4. Kiểm tra dữ liệu JSON

### Trong Console
```javascript
// Xem tất cả chương
console.log(State.chapters)

// Xem tất cả từ vựng
console.log(State.cards)

// Xem từ vựng của chương cụ thể
console.log(State.cards.filter(c => c.chapterId === 'chapter-id'))

// Xem dữ liệu trong localStorage
console.log(JSON.parse(localStorage.getItem('chapters')))
```

## Đồng Bộ Dữ Liệu

### Tự Động
- Mỗi 50 XP → Tự động gọi `State.sync()`

### Thủ Công
- Nhấn "☁️ Đồng bộ Server" trên trang Giáo Trình

### Kết Quả
- Dữ liệu được gửi lên SQLite Server
- Có thể tải lại từ Server bất kỳ lúc nào

## Lưu Ý Quan Trọng

✅ **Luôn gọi `State.save()` sau khi thay đổi dữ liệu**
```javascript
State.chapters.push(newChapter);
State.save();  // ← KHÔNG QUÊN!
```

✅ **Cập nhật UI sau khi lưu**
```javascript
State.save();
renderLibrary();      // Cập nhật danh sách chương
renderDashboard();    // Cập nhật trang chủ
```

✅ **Kiểm tra dữ liệu tồn tại trước khi sử dụng**
```javascript
const ch = State.chapters.find(c => c.id === chapterId);
if (!ch) {
  toast('Không tìm thấy chương', 'error');
  return;
}
```

✅ **Đóng modal trước khi mở modal khác**
```javascript
closeModal('modal-chapter');
setTimeout(() => {
  aiFixChapter(chapterId);
  openModal('modal-chapter');
}, 300);
```
