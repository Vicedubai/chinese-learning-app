# 🈶 Ứng Dụng Học Tiếng Trung Tương Tác

Ứng dụng web toàn diện để học tiếng Trung với OCR, flashcard, bài tập, và nghe chép.

## 🎯 Tính Năng Chính

### 📚 Giáo Trình
- ✅ Tải file PDF sách giáo khoa
- ✅ Quét OCR tự động (Python backend)
- ✅ Tách chương tự động
- ✅ Tạo chương thủ công
- ✅ Nhập từ vựng (thủ công / CSV)
- ✅ Quản lý chương (sửa tên, xóa, gộp)

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

## 🚀 Bắt Đầu Nhanh

### 1. Cài Đặt
```bash
# Clone repository
git clone <repo-url>
cd <repo-folder>

# Cài đặt Python dependencies
pip install flask flask-cors pdfplumber pytesseract pillow

# Cài đặt Tesseract OCR (Windows)
# Tải từ: https://github.com/UB-Mannheim/tesseract/wiki

# Hoặc macOS
brew install tesseract

# Hoặc Linux
sudo apt-get install tesseract-ocr
```

### 2. Chạy Server
```bash
# Chạy Python server
python ocr_server.py

# Server sẽ chạy tại http://127.0.0.1:8000
```

### 3. Mở Ứng Dụng
```bash
# Mở file index.html trong trình duyệt
# Hoặc chạy local server
python -m http.server 8080
# Truy cập http://localhost:8080
```

## 📊 Cấu Trúc Dữ Liệu

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

## 💾 Lưu Trữ Dữ Liệu

- **Chính**: `localStorage` (trình duyệt)
- **Sao lưu**: SQLite Server (Python backend)

## 📚 Tài Liệu

### Hướng Dẫn Sử Dụng
- 📊 [Cấu Trúc Dữ Liệu](./DATA_STRUCTURE.md)
- 📚 [Hướng Dẫn Nhập Từ Vựng](./VOCABULARY_INPUT_GUIDE.md)
- 🎓 [Tổng Quan Hệ Thống](./SYSTEM_OVERVIEW.md)

### Tài Liệu Kỹ Thuật
- 🔄 [Sửa Lỗi: Chương Không Được Lưu](./CHAPTER_PERSISTENCE_FIX.md)
- 🃏 [Flashcard & Session Persistence](./SESSION_PERSISTENCE.md)
- 🎮 [Bài Tập Tổng Hợp](./COMPREHENSIVE_EXERCISES.md)
- 🤖 [AI Sửa Module](./AI_FIX_ENHANCED.md)

### Cập Nhật
- 📝 [Các Thay Đổi Gần Đây](./LATEST_CHANGES.md)

## 🔧 Cấu Hình

### Tệp Chính
```
index.html              # Giao diện chính
css/style.css           # Kiểu dáng
js/core.js              # Lõi ứng dụng
js/library.js           # Quản lý giáo trình
js/flashcards.js        # Flashcard
js/exercises.js         # Bài tập
js/dictation.js         # Nghe chép
js/ai-fix.js            # Nhập từ vựng
js/chat.js              # Trợ lý AI
ocr_server.py           # Server Python (OCR)
```

### Biến Môi Trường
```javascript
State.books              // Danh sách sách
State.chapters           // Danh sách chương
State.cards              // Danh sách từ vựng
State.progress           // Tiến độ học
State.session            // Phiên học
```

## 🎮 Phím Tắt Flashcard

| Phím | Chức Năng |
|------|-----------|
| → hoặc D | Tiếp theo |
| ← hoặc A | Quay lại |
| SPACE | Lật thẻ |
| X | Quên (0 sao) |
| S | Khó (1 sao) |
| H | Tốt (4 sao) |

## 📈 SM-2 Algorithm

Ứng dụng sử dụng SM-2 algorithm để tối ưu hóa việc ôn tập:

```
Lần 1: 1 ngày sau
Lần 2: 6 ngày sau
Lần 3+: interval × ease factor
```

## 🎯 Định Dạng CSV

```
Từ Trung | Pinyin | Hán-Việt | Nghĩa Việt | Ví dụ
图书城|túshūchéng|圖書城|thành phố sách|我喜欢去图书城看书。
钥匙|yàoshi|鑰匙|chìa khóa|我忘记拔下钥匙了。
```

## 🆘 Khắc Phục Lỗi

### Chương không được lưu
- Xem [CHAPTER_PERSISTENCE_FIX.md](./CHAPTER_PERSISTENCE_FIX.md)

### Import CSV không hoạt động
- Xem [VOCABULARY_INPUT_GUIDE.md](./VOCABULARY_INPUT_GUIDE.md)

### Flashcard không lưu phiên
- Xem [SESSION_PERSISTENCE.md](./SESSION_PERSISTENCE.md)

### Lỗi chung
1. Làm mới trang (F5)
2. Xóa cache trình duyệt
3. Kiểm tra DevTools → Console
4. Thử lại

## 📊 Thống Kê

| Mục | Số Lượng |
|-----|----------|
| Tệp JavaScript | 8 |
| Tệp CSS | 1 |
| Tệp HTML | 1 |
| Tệp Python | 2 |
| Tài Liệu | 7 |
| Hàm JavaScript | 100+ |
| Dòng Code | 5000+ |

## 🤝 Đóng Góp

Chúng tôi hoan nghênh các đóng góp! Vui lòng:

1. Fork repository
2. Tạo branch mới (`git checkout -b feature/AmazingFeature`)
3. Commit thay đổi (`git commit -m 'Add some AmazingFeature'`)
4. Push lên branch (`git push origin feature/AmazingFeature`)
5. Mở Pull Request

## 📄 Giấy Phép

Dự án này được cấp phép dưới MIT License - xem tệp [LICENSE](LICENSE) để biết chi tiết.

## 📞 Liên Hệ

- 📧 Email: [your-email@example.com]
- 🐛 Issues: [GitHub Issues]
- 💬 Discussions: [GitHub Discussions]

## 🙏 Cảm Ơn

Cảm ơn tất cả những người đã đóng góp cho dự án này!

---

**Phiên bản**: 1.0.0  
**Cập nhật lần cuối**: 30/04/2026  
**Trạng thái**: ✅ Hoạt động tốt
