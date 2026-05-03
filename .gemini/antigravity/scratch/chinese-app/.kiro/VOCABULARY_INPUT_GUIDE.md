# 📚 Hướng Dẫn Nhập Từ Vựng

## Tổng Quan

Ứng dụng hỗ trợ 2 cách nhập từ vựng:

1. **Từ PDF**: Tải file PDF → Ứng dụng tự động tách chương → Nhập từ vựng
2. **Thủ công**: Tạo chương mới → Nhập từ vựng thủ công hoặc import CSV

## Cách 1: Từ File PDF

### Bước 1: Tải File PDF
1. Vào trang **📚 Giáo Trình**
2. Kéo thả file PDF vào vùng "Kéo thả file PDF vào đây"
3. Hoặc nhấn để chọn file

### Bước 2: Chọn Cách Quét (Tùy Chọn)

**Cách A: Tự động quét toàn bộ**
- Ứng dụng sẽ tự động tách chương từ PDF
- Mỗi chương = 1 bài khóa

**Cách B: Quét theo danh sách (Tùy chọn)**
- Dán danh sách bài & trang vào ô "Lệnh quét tự động"
- Ví dụ:
  ```
  Bài 13: Trang 3-4
  Bài 14: Trang 17-18
  Bài 15: Trang 36-37
  ```
- Ứng dụng sẽ quét chính xác theo danh sách

### Bước 3: Chờ OCR Hoàn Thành
- Xem thanh tiến độ "Đang xử lý OCR..."
- Khi xong, danh sách chương sẽ hiển thị

### Bước 4: Nhập Từ Vựng
- Nhấn **🤖 AI Sửa tất cả** hoặc **✏️ Nhập từ vựng**
- Chọn chương
- Chọn cách nhập (xem Cách 2 dưới đây)

---

## Cách 2: Tạo Chương Mới & Nhập Thủ Công

### Bước 1: Tạo Chương Mới
1. Vào trang **📚 Giáo Trình**
2. Nhấn **➕ Tạo chương mới**
3. Nhập tên chương (ví dụ: "Chương 1: Giới thiệu")
4. Nhấn **✅ Tạo chương**

### Bước 2: Chọn Cách Nhập Từ Vựng

#### Cách A: Nhập Thủ Công (✍️ Nhập Thủ Công)

**Nhập từng từ một:**

1. Nhấn **✍️ Nhập Thủ Công**
2. Điền các trường:
   - **Từ tiếng Trung**: 图书城
   - **Pinyin**: túshūchéng (có dấu!)
   - **Hán-Việt**: 圖書城 (tùy chọn)
   - **Nghĩa Việt**: thành phố sách
   - **Ví dụ**: 我喜欢去图书城看书。

3. Nhấn **✅ Thêm Từ** để lưu
4. Nhấn **➕ Thêm Tiếp** để nhập từ tiếp theo
5. Lặp lại cho đến khi xong

**Lưu ý:**
- Các trường bắt buộc: Từ Trung, Pinyin, Nghĩa Việt
- Pinyin phải có dấu (túshūchéng, không phải tushucheng)
- Hán-Việt và Ví dụ là tùy chọn

#### Cách B: Import Excel/CSV (📊 Import Excel/CSV)

**Chuẩn bị dữ liệu:**

1. Tạo file Excel hoặc CSV với định dạng:
   ```
   Từ Trung | Pinyin | Hán-Việt | Nghĩa Việt | Ví dụ
   ```

2. Ví dụ:
   ```
   图书城|túshūchéng|圖書城|thành phố sách|我喜欢去图书城看书。
   钥匙|yàoshi|鑰匙|chìa khóa|我忘记拔下钥匙了。
   忘记|wàngjì|忘記|quên|我忘记了你的名字。
   拔|báo|拔|kéo ra|请拔下钥匙。
   下来|xiàlai|下來|xuống|请下来帮我。
   ```

3. Sao chép nội dung (Ctrl+C)

**Nhập vào ứng dụng:**

1. Nhấn **📊 Import Excel/CSV**
2. Dán nội dung vào ô "Dán nội dung CSV/Excel ở đây"
3. Nhấn **📥 Import**
4. Ứng dụng sẽ import tất cả từ vựng

**Lưu ý:**
- Mỗi dòng = 1 từ
- Dùng dấu `|` (pipe) để phân tách các trường
- Không để trống các trường bắt buộc
- Ứng dụng sẽ bỏ qua dòng không hợp lệ

#### Cách C: Tải Sample Template (📥 Tải Sample CSV)

1. Nhấn **📥 Tải Sample CSV**
2. File `sample-vocabulary.csv` sẽ được tải về
3. Mở file, chỉnh sửa, rồi import lại

---

## Định Dạng CSV Chi Tiết

### Cấu Trúc
```
Từ Trung | Pinyin | Hán-Việt | Nghĩa Việt | Ví dụ
```

### Ví Dụ Đầy Đủ
```
图书城|túshūchéng|圖書城|thành phố sách|我喜欢去图书城看书。
钥匙|yàoshi|鑰匙|chìa khóa|我忘记拔下钥匙了。
忘记|wàngjì|忘記|quên|我忘记了你的名字。
拔|báo|拔|kéo ra|请拔下钥匙。
下来|xiàlai|下來|xuống|请下来帮我。
学校|xuéxiào|學校|trường học|我每天去学校。
书|shū|書|sách|这是一本好书。
城|chéng|城|thành phố|北京是一个大城。
看|kàn|看|nhìn|我喜欢看书。
去|qù|去|đi|我想去图书城。
```

### Giải Thích Từng Trường

| Trường | Ví Dụ | Bắt Buộc | Ghi Chú |
|--------|-------|----------|--------|
| Từ Trung | 图书城 | ✅ | Chữ Hán gốc |
| Pinyin | túshūchéng | ✅ | Phải có dấu (tone marks) |
| Hán-Việt | 圖書城 | ❌ | Chữ Hán tương ứng (tùy chọn) |
| Nghĩa Việt | thành phố sách | ✅ | Dịch nghĩa tiếng Việt |
| Ví dụ | 我喜欢去图书城看书。 | ❌ | Câu tiếng Trung (tùy chọn) |

### Lưu Ý Pinyin
- **Đúng**: túshūchéng, wàngjì, yàoshi, xiàlai
- **Sai**: tushucheng, wangji, yaoshi, xialai
- Pinyin phải có dấu (tone marks) để chính xác

---

## Kiểm Tra Dữ Liệu Được Lưu

### Cách 1: Xem Danh Sách Chương
1. Vào trang **📚 Giáo Trình**
2. Xem phần "Danh sách chương"
3. Chương mới sẽ hiển thị ở đây

### Cách 2: Xem Chi Tiết Chương
1. Nhấn vào chương
2. Xem danh sách từ vựng
3. Kiểm tra số lượng từ: "X từ"

### Cách 3: Xem Trong DevTools
1. Mở DevTools (F12)
2. Vào tab "Application" → "Local Storage"
3. Tìm khóa "chapters" hoặc "cards"
4. Kiểm tra dữ liệu JSON

---

## Đồng Bộ Dữ Liệu Lên Server

### Tự Động
- Mỗi 50 XP → Tự động đồng bộ

### Thủ Công
1. Vào trang **📚 Giáo Trình**
2. Nhấn **☁️ Đồng bộ Server** (góc trên phải)
3. Chờ thông báo "Đã đồng bộ dữ liệu lên Server"

---

## Lỗi Thường Gặp & Cách Khắc Phục

### ❌ "Chương không được lưu lại"
**Nguyên nhân**: Không gọi `State.save()`
**Cách khắc phục**: 
- Làm mới trang (F5)
- Kiểm tra DevTools → Console có lỗi không
- Thử tạo chương mới lại

### ❌ "Import CSV không hoạt động"
**Nguyên nhân**: Định dạng CSV sai
**Cách khắc phục**:
- Kiểm tra dấu phân tách là `|` (pipe)
- Kiểm tra mỗi dòng có ít nhất 4 trường
- Kiểm tra không có dòng trống ở giữa
- Tải Sample CSV để xem định dạng đúng

### ❌ "Pinyin không có dấu"
**Nguyên nhân**: Nhập pinyin không có tone marks
**Cách khắc phục**:
- Sử dụng công cụ pinyin online
- Hoặc tải Sample CSV để xem ví dụ

### ❌ "Từ vựng không hiển thị"
**Nguyên nhân**: Chương ID không khớp
**Cách khắc phục**:
- Làm mới trang (F5)
- Kiểm tra DevTools → Console
- Thử import lại

---

## Mẹo & Thủ Thuật

### 💡 Nhập Nhanh
- Sử dụng Tab để chuyển giữa các trường
- Sử dụng Enter để xác nhận (nếu có)

### 💡 Import Hàng Loạt
- Chuẩn bị CSV với tất cả từ vựng
- Import 1 lần thay vì nhập từng từ

### 💡 Sao Lưu Dữ Liệu
- Nhấn **☁️ Đồng bộ Server** thường xuyên
- Hoặc export dữ liệu từ DevTools

### 💡 Tìm Pinyin Đúng
- Sử dụng Google Translate
- Hoặc các công cụ pinyin online
- Đảm bảo có dấu (tone marks)

---

## Tài Liệu Liên Quan

- 📊 [Cấu Trúc Dữ Liệu](./DATA_STRUCTURE.md)
- 🎓 [Hướng Dẫn Học Flashcard](./SESSION_PERSISTENCE.md)
- 🎮 [Bài Tập & Luyện Tập](./COMPREHENSIVE_EXERCISES.md)
