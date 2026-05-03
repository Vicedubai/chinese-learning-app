# 🎓 Tổng Quan Hệ Thống Học Tiếng Trung

## 📊 Cấu Trúc Dữ Liệu

```
📚 SÁCH (Books)
├── Từ file PDF bạn tải lên
├── Lưu trữ: State.books[]
└── Ví dụ: "Tiếng Trung Cơ Bản"

  📖 CHƯƠNG (Chapters)
  ├── Tách từ sách hoặc tạo thủ công
  ├── Lưu trữ: State.chapters[]
  └── Ví dụ: "Chương 1: Giới thiệu"

    📝 TỪ VỰNG (Cards)
    ├── Nhập thủ công hoặc import CSV
    ├── Lưu trữ: State.cards[]
    └── Ví dụ: "图书城 (túshūchéng) - thành phố sách"
```

## 🔄 Quy Trình Học

### 1️⃣ Nhập Tài Liệu
```
Tải PDF
  ↓
Quét OCR (tự động)
  ↓
Tách chương
  ↓
Danh sách chương
```

### 2️⃣ Nhập Từ Vựng
```
Chọn chương
  ↓
Chọn cách nhập:
  ├─ Nhập thủ công (từng từ)
  ├─ Import CSV (hàng loạt)
  └─ Tải sample template
  ↓
Lưu từ vựng
```

### 3️⃣ Học Flashcard
```
Chọn chương
  ↓
Học flashcard (SM-2 algorithm)
  ↓
Đánh giá: Quên / Khó / Bình thường / Tốt / Rất tốt
  ↓
Tự động lên lịch ôn tập
```

### 4️⃣ Luyện Tập
```
Bài tập tổng hợp (5 loại)
  ├─ Trắc nghiệm
  ├─ Điền từ
  ├─ Dịch
  ├─ Sắp xếp
  └─ Tìm lỗi
  ↓
Nghe chép (dictation)
  ↓
Kiểm tra kết quả
```

## 💾 Lưu Trữ Dữ Liệu

### Nơi Lưu
- **Chính**: `localStorage` (trình duyệt)
- **Sao lưu**: SQLite Server (Python backend)

### Cách Lưu
```javascript
State.save()  // Lưu tất cả vào localStorage
State.sync()  // Đồng bộ lên Server
```

### Các Khóa localStorage
```
"books"              → Danh sách sách
"chapters"           → Danh sách chương
"cards"              → Danh sách từ vựng
"dictationPlaylist"  → Danh sách bài nghe chép
"progress"           → Tiến độ học (XP, streak, kết quả)
"session"            → Phiên học hiện tại
```

## 🎯 Các Tính Năng Chính

### 📚 Giáo Trình
- ✅ Tải file PDF
- ✅ Quét OCR tự động
- ✅ Tách chương tự động
- ✅ Tạo chương thủ công
- ✅ Nhập từ vựng (thủ công / CSV)
- ✅ Quản lý chương (sửa tên, xóa, gộp)
- ✅ Xem danh sách từ vựng

### 🃏 Flashcard
- ✅ Học flashcard với SM-2 algorithm
- ✅ Tự động lên lịch ôn tập
- ✅ Lưu phiên học (resume)
- ✅ 6 phím tắt (→/D, ←/A, SPACE, X, S, H)
- ✅ Xem thống kê

### ✏️ Bài Tập
- ✅ Bài tập tổng hợp (5 loại)
- ✅ Bài tập theo chương
- ✅ Tạo bài tập từ từ vựng
- ✅ Xem kết quả

### 🎧 Nghe Chép
- ✅ Nghe câu tiếng Trung
- ✅ Chép lại
- ✅ Kiểm tra kết quả
- ✅ Lưu phiên học

### 📊 Chẩn Đoán
- ✅ Xem thống kê học tập
- ✅ Biểu đồ radar (5 kỹ năng)
- ✅ Lịch sử kết quả

### 🤖 Trợ Lý AI
- ✅ Chat với AI
- ✅ Hỏi về từ vựng
- ✅ Hỏi về ngữ pháp

## 🔑 Phím Tắt Flashcard

| Phím | Chức Năng |
|------|-----------|
| → hoặc D | Tiếp theo |
| ← hoặc A | Quay lại |
| SPACE | Lật thẻ |
| X | Quên (0 sao) |
| S | Khó (1 sao) |
| H | Tốt (4 sao) |

## 📈 SM-2 Algorithm (Spaced Repetition)

Ứng dụng sử dụng SM-2 algorithm để tối ưu hóa việc ôn tập:

```
Lần 1: 1 ngày sau
Lần 2: 6 ngày sau
Lần 3+: interval × ease factor
```

**Ease Factor** (độ khó):
- Quên (0 sao): EF = 1.3 (dễ nhất)
- Khó (1 sao): EF = 1.5
- Bình thường (2 sao): EF = 1.8
- Tốt (4 sao): EF = 2.5
- Rất tốt (5 sao): EF = 2.6 (khó nhất)

## 🎮 Hệ Thống XP & Cấp Độ

- **XP**: Điểm kinh nghiệm
- **Cấp độ**: Mỗi 100 XP = 1 cấp
- **Streak**: Số ngày liên tiếp học

**Cách kiếm XP**:
- Học flashcard: +10 XP/từ
- Làm bài tập: +5 XP/câu
- Nghe chép: +15 XP/câu

## 📱 Giao Diện

### Sidebar (Trái)
- 🏠 Trang chủ
- 📚 Giáo trình
- 🃏 Flashcard
- 🎧 Nghe chép
- ✏️ Bài tập
- 📊 Chẩn đoán
- 🤖 Trợ lý AI

### Trang Chủ
- Thống kê tổng quan
- Từ cần ôn tập
- Tiến độ học
- Gợi ý bài học

### Giáo Trình
- Tải PDF
- Danh sách chương
- Nhập từ vựng
- Quản lý chương

## 🔧 Cài Đặt & Cấu Hình

### Tệp Cấu Hình
- `index.html` - Giao diện chính
- `css/style.css` - Kiểu dáng
- `js/core.js` - Lõi ứng dụng
- `js/library.js` - Quản lý giáo trình
- `js/flashcards.js` - Flashcard
- `js/exercises.js` - Bài tập
- `js/dictation.js` - Nghe chép
- `js/ai-fix.js` - Nhập từ vựng
- `js/chat.js` - Trợ lý AI
- `ocr_server.py` - Server Python (OCR)

### Biến Môi Trường
- `State.books` - Danh sách sách
- `State.chapters` - Danh sách chương
- `State.cards` - Danh sách từ vựng
- `State.progress` - Tiến độ học
- `State.session` - Phiên học

## 🚀 Bắt Đầu Nhanh

### 1. Tải PDF
1. Vào **📚 Giáo Trình**
2. Kéo thả file PDF
3. Chờ OCR hoàn thành

### 2. Nhập Từ Vựng
1. Nhấn **✏️ Nhập từ vựng**
2. Chọn chương
3. Chọn cách nhập (thủ công / CSV)
4. Nhập dữ liệu

### 3. Học Flashcard
1. Vào **🃏 Flashcard**
2. Chọn chương
3. Bắt đầu học
4. Đánh giá từng thẻ

### 4. Làm Bài Tập
1. Vào **✏️ Bài tập**
2. Chọn loại bài tập
3. Chọn chương
4. Làm bài

## 📚 Tài Liệu Liên Quan

- 📊 [Cấu Trúc Dữ Liệu](./DATA_STRUCTURE.md)
- 📚 [Hướng Dẫn Nhập Từ Vựng](./VOCABULARY_INPUT_GUIDE.md)
- 🔄 [Sửa Lỗi: Chương Không Được Lưu](./CHAPTER_PERSISTENCE_FIX.md)
- 🃏 [Flashcard & Session Persistence](./SESSION_PERSISTENCE.md)
- 🎮 [Bài Tập Tổng Hợp](./COMPREHENSIVE_EXERCISES.md)
- 🤖 [AI Sửa Module](./AI_FIX_ENHANCED.md)

## 💡 Mẹo & Thủ Thuật

### Nhập Nhanh
- Sử dụng CSV import thay vì nhập từng từ
- Chuẩn bị dữ liệu trước khi import

### Học Hiệu Quả
- Học flashcard mỗi ngày
- Làm bài tập để ôn tập
- Nghe chép để cải thiện kỹ năng nghe

### Sao Lưu Dữ Liệu
- Nhấn **☁️ Đồng bộ Server** thường xuyên
- Hoặc export dữ liệu từ DevTools

### Khắc Phục Lỗi
- Làm mới trang (F5)
- Xóa cache trình duyệt
- Kiểm tra DevTools → Console

## 🆘 Hỗ Trợ

### Lỗi Thường Gặp
- Chương không được lưu → Xem [CHAPTER_PERSISTENCE_FIX.md](./CHAPTER_PERSISTENCE_FIX.md)
- Import CSV không hoạt động → Xem [VOCABULARY_INPUT_GUIDE.md](./VOCABULARY_INPUT_GUIDE.md)
- Flashcard không lưu phiên → Xem [SESSION_PERSISTENCE.md](./SESSION_PERSISTENCE.md)

### Liên Hệ
- Kiểm tra DevTools (F12) → Console
- Xem thông báo lỗi
- Thử làm mới trang (F5)
