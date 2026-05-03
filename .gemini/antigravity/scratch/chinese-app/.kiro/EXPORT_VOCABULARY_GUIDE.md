# 📤 Hướng Dẫn Xuất Từ Vựng

## Tính Năng Mới
Xuất từ vựng sang các định dạng phổ biến để sử dụng trong các ứng dụng khác như Quizlet, Anki, Excel, Google Sheets.

## Các Định Dạng Hỗ Trợ

### 1. CSV (Comma-Separated Values)
**Dùng cho**: Excel, Google Sheets, Anki, hoặc bất kỳ ứng dụng nào hỗ trợ CSV

**Định dạng**:
```
Từ Trung,Pinyin,Hán-Việt,Nghĩa Việt,Ví dụ
"图书城","túshūchéng","圖書城","thành phố sách","我喜欢去图书城看书。"
"钥匙","yàoshi","鑰匙","chìa khóa","我忘记拔下钥匙了。"
```

**Cách sử dụng**:
- Mở trong Excel: File → Open → Chọn file CSV
- Mở trong Google Sheets: File → Open → Upload → Chọn file CSV
- Import vào Anki: File → Import → Chọn file CSV

### 2. JSON (JavaScript Object Notation)
**Dùng cho**: Lập trình viên, ứng dụng tùy chỉnh, API

**Định dạng**:
```json
[
  {
    "chinese": "图书城",
    "pinyin": "túshūchéng",
    "wordType": "圖書城",
    "vietnamese": "thành phố sách",
    "example": "我喜欢去图书城看书。"
  },
  {
    "chinese": "钥匙",
    "pinyin": "yàoshi",
    "wordType": "鑰匙",
    "vietnamese": "chìa khóa",
    "example": "我忘记拔下钥匙了。"
  }
]
```

**Cách sử dụng**:
- Dùng trong lập trình (JavaScript, Python, etc.)
- Import vào database
- Sử dụng với API

### 3. Anki (TSV Format)
**Dùng cho**: Anki Desktop, AnkiWeb, AnkiDroid

**Định dạng**:
```
图书城 (túshūchéng)	thành phố sách

Ví dụ: 我喜欢去图书城看书。	chinese vocabulary
钥匙 (yàoshi)	chìa khóa - 我忘记拔下钥匙了。	chinese vocabulary
```

**Cách sử dụng**:
1. Mở Anki Desktop
2. File → Import
3. Chọn file được xuất
4. Chọn deck để import
5. Nhấn Import

### 4. Quizlet (Tab-Separated Format)
**Dùng cho**: Quizlet.com

**Định dạng**:
```
图书城 (túshūchéng)	thành phố sách - 我喜欢去图书城看书。
钥匙 (yàoshi)	chìa khóa - 我忘记拔下钥匙了。
```

**Cách sử dụng**:
1. Vào Quizlet.com
2. Tạo set mới
3. Nhấn "Import from file" hoặc "Paste"
4. Copy-paste nội dung file được xuất
5. Nhấn Import

---

## Cách Xuất Từ Vựng

### Xuất Từ Vựng Của 1 Chương

1. Vào trang **📚 Giáo Trình**
2. Nhấn vào chương
3. Nhấn nút **📤 Xuất từ vựng**
4. Chọn định dạng (CSV, JSON, Anki, Quizlet)
5. File sẽ được tải về

### Xuất Tất Cả Từ Vựng

1. Vào trang **📚 Giáo Trình**
2. Nhấn nút **📤 Xuất tất cả** (ở phần "Danh sách chương")
3. Chọn định dạng (CSV, JSON, Anki, Quizlet)
4. File sẽ được tải về

---

## Hướng Dẫn Chi Tiết Cho Từng Ứng Dụng

### Anki Desktop

**Bước 1: Xuất từ vựng**
1. Vào **📚 Giáo Trình**
2. Nhấn vào chương
3. Nhấn **📤 Xuất từ vựng**
4. Chọn **🎴 Anki**
5. File sẽ được tải về (ví dụ: `chapter_name.txt`)

**Bước 2: Import vào Anki**
1. Mở Anki Desktop
2. Vào File → Import
3. Chọn file vừa tải về
4. Chọn deck để import
5. Nhấn Import

**Bước 3: Kiểm tra**
1. Vào deck vừa import
2. Xem các thẻ flashcard
3. Bắt đầu học

### Quizlet

**Bước 1: Xuất từ vựng**
1. Vào **📚 Giáo Trình**
2. Nhấn vào chương
3. Nhấn **📤 Xuất từ vựng**
4. Chọn **📚 Quizlet**
5. File sẽ được tải về

**Bước 2: Import vào Quizlet**
1. Vào Quizlet.com
2. Đăng nhập hoặc tạo tài khoản
3. Nhấn "Create" → "Study set"
4. Nhấn "Import from file" hoặc "Paste"
5. Copy-paste nội dung file được xuất
6. Nhấn Import

**Bước 3: Kiểm tra**
1. Xem các thẻ flashcard
2. Bắt đầu học

### Excel / Google Sheets

**Bước 1: Xuất từ vựng**
1. Vào **📚 Giáo Trình**
2. Nhấn vào chương
3. Nhấn **📤 Xuất từ vựng**
4. Chọn **📊 CSV**
5. File sẽ được tải về

**Bước 2: Mở trong Excel**
1. Mở Excel
2. File → Open
3. Chọn file CSV vừa tải về
4. Nhấn Open

**Bước 3: Mở trong Google Sheets**
1. Vào Google Drive
2. Nhấn "New" → "File upload"
3. Chọn file CSV vừa tải về
4. Nhấn Open with → Google Sheets

---

## Định Dạng File

### Tên File
- **Chương**: `chapter_name_vocabulary.csv` (hoặc `.json`, `.txt`)
- **Tất cả**: `all_vocabulary.csv` (hoặc `.json`, `.txt`)

### Ký Tự Đặc Biệt
- Tên file được tạo từ tên chương
- Ký tự đặc biệt được thay thế bằng `_`
- Ví dụ: "Chương 1: Giới thiệu" → `Chương_1__Giới_thiệu_vocabulary.csv`

---

## Lỗi Thường Gặp

### ❌ "File không tải được"
**Nguyên nhân**: Trình duyệt chặn tải file
**Cách khắc phục**:
- Kiểm tra cài đặt trình duyệt
- Thử trình duyệt khác
- Kiểm tra thư mục Downloads

### ❌ "Anki không nhận diện file"
**Nguyên nhân**: Định dạng file sai
**Cách khắc phục**:
- Đảm bảo file có đuôi `.txt`
- Thử import lại
- Kiểm tra encoding (UTF-8)

### ❌ "Quizlet không import được"
**Nguyên nhân**: Định dạng không đúng
**Cách khắc phục**:
- Copy-paste nội dung thay vì upload file
- Kiểm tra định dạng (Tab-separated)
- Thử import từng dòng

### ❌ "Excel hiển thị ký tự lạ"
**Nguyên nhân**: Encoding không phải UTF-8
**Cách khắc phục**:
- Mở file trong Google Sheets (tự động xử lý UTF-8)
- Hoặc mở Excel → Data → Text to Columns → Chọn UTF-8

---

## Mẹo & Thủ Thuật

### 💡 Xuất Định Kỳ
- Xuất từ vựng mỗi tuần để sao lưu
- Lưu file vào Google Drive hoặc Dropbox

### 💡 Sử Dụng Nhiều Ứng Dụng
- Xuất sang Anki để học flashcard
- Xuất sang Quizlet để học với bạn
- Xuất sang Excel để phân tích

### 💡 Tùy Chỉnh Dữ Liệu
- Mở file CSV trong Excel
- Chỉnh sửa dữ liệu
- Import lại vào Anki hoặc Quizlet

### 💡 Chia Sẻ Từ Vựng
- Xuất sang CSV
- Chia sẻ file với bạn
- Bạn có thể import vào ứng dụng của họ

---

## Tài Liệu Liên Quan

- 📚 [Hướng Dẫn Nhập Từ Vựng](./VOCABULARY_INPUT_GUIDE.md)
- 📊 [Cấu Trúc Dữ Liệu](./DATA_STRUCTURE.md)
- 🎓 [Tổng Quan Hệ Thống](./SYSTEM_OVERVIEW.md)

---

## Liên Kết Hữu Ích

- **Anki**: https://apps.ankiweb.net/
- **Quizlet**: https://quizlet.com/
- **Google Sheets**: https://sheets.google.com/
- **Excel**: https://www.microsoft.com/excel/

---

**Phiên bản**: 1.0.0  
**Cập nhật lần cuối**: 30/04/2026  
**Trạng thái**: ✅ Hoàn thành
