# 📚 Hướng Dẫn Nhập Từ Vựng Thủ Công & Import Excel/CSV

## 🎯 Tính Năng Mới

Phần **Nhập từ vựng** đã được cập nhật với 3 cách nhập:

### 1️⃣ **Nhập Thủ Công** (✍️ Nhập Từ vựng)
- Nhập từng từ một cách thủ công
- Điền đầy đủ: Từ Trung, Pinyin, Hán-Việt, Nghĩa Việt, Ví dụ
- Nút **✅ Thêm Từ** để lưu
- Nút **➕ Thêm Tiếp** để tiếp tục nhập từ khác

### 2️⃣ **Import Excel/CSV** (📊 Import Excel/CSV)
- Dán nội dung từ Excel hoặc CSV
- Định dạng: Từ Trung | Pinyin | Hán-Việt | Nghĩa Việt | Ví dụ
- Mỗi dòng 1 từ
- Nút **📥 Import** để nhập hàng loạt

### 3️⃣ **Tải Sample Template** (📥 Tải Sample CSV / 📋 Tải Sample Prompt)
- **Tải Sample CSV**: File mẫu CSV với 10 từ ví dụ
- **Tải Sample Prompt**: Hướng dẫn chi tiết định dạng nhập

---

## �� Định Dạng Chuẩn

### Các Trường Bắt Buộc:
1. **Từ Trung** (Chinese): Chữ Hán gốc
   - Ví dụ: 图书城, 钥匙, 忘记

2. **Pinyin** (Romanization): Pinyin có dấu thanh
   - Ví dụ: túshūchéng, yàoshi, wàngjì
   - **Lưu ý**: Phải có dấu (ā á ǎ à, ē é ě è, v.v.)

3. **Hán-Việt** (Traditional): Chữ Hán truyền thống (tùy chọn)
   - Ví dụ: 圖書城, 鑰匙, 忘記

4. **Nghĩa Việt** (Vietnamese): Dịch nghĩa tiếng Việt
   - Ví dụ: thành phố sách, chìa khóa, quên
   - **Lưu ý**: Dựa trên ngữ cảnh bài khóa

5. **Ví Dụ** (Example): Câu tiếng Trung sử dụng từ
   - Ví dụ: 我喜欢去图书城看书。
   - Có thể là: câu thực tế, từ văn chương, hoặc một fact

---

## 📥 Ví Dụ Mẫu

### CSV Format:
\\\
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
\\\

---

## 🚀 Cách Sử Dụng

### Nhập Thủ Công:
1. Nhấn nút **✏️ Nhập từ vựng**
2. Chọn chương
3. Nhấn **✍️ Nhập Thủ Công**
4. Điền các trường: Từ Trung, Pinyin, Hán-Việt, Nghĩa Việt, Ví dụ
5. Nhấn **✅ Thêm Từ** hoặc **➕ Thêm Tiếp**

### Import Excel/CSV:
1. Nhấn nút **✏️ Nhập từ vựng**
2. Chọn chương
3. Nhấn **📊 Import Excel/CSV**
4. Dán nội dung CSV (từ Excel hoặc file text)
5. Nhấn **📥 Import**

### Tải Sample:
1. Nhấn **📥 Tải Sample CSV** để tải file mẫu
2. Hoặc nhấn **📋 Tải Sample Prompt** để xem hướng dẫn chi tiết

---

## ⚠️ Lưu Ý Quan Trọng

- ✅ Mỗi dòng 1 từ (khi import)
- ✅ Dùng dấu **|** để phân tách các trường
- ✅ Không để trống: Từ Trung, Pinyin, Nghĩa Việt
- ✅ Pinyin phải có dấu thanh (túshūchéng, không phải tushucheng)
- ✅ Ví dụ nên là câu thực tế hoặc từ văn chương
- ❌ Không quét PDF/ảnh nữa (đã bỏ)
- ❌ Không dùng Gemini API nữa (nhập thủ công)

---

## 📊 Cấu Trúc Dữ Liệu

Mỗi từ vựng được lưu với các thông tin:
- **id**: Mã định danh duy nhất
- **chapterId**: Mã chương
- **chinese**: Từ tiếng Trung
- **pinyin**: Pinyin có dấu
- **wordType**: Hán-Việt (tùy chọn)
- **vietnamese**: Nghĩa tiếng Việt
- **example**: Ví dụ tiếng Trung
- **ef, interval, reps, nextReview**: Dữ liệu SM2 (spaced repetition)

---

## 🎓 Ví Dụ Thực Tế

### Từ: 图书城 (thành phố sách)
- **Từ Trung**: 图书城
- **Pinyin**: túshūchéng
- **Hán-Việt**: 圖書城
- **Nghĩa Việt**: thành phố sách (một trung tâm bán sách lớn)
- **Ví dụ**: 我喜欢去图书城看书。(Tôi thích đi thành phố sách để xem sách)

### Từ: 钥匙 (chìa khóa)
- **Từ Trung**: 钥匙
- **Pinyin**: yàoshi
- **Hán-Việt**: 鑰匙
- **Nghĩa Việt**: chìa khóa
- **Ví dụ**: 我忘记拔下钥匙了。(Tôi quên kéo ra chìa khóa)

---

## 💡 Mẹo

1. **Tải sample trước**: Nhấn **📥 Tải Sample CSV** để xem định dạng
2. **Sử dụng Excel**: Tạo file Excel với 5 cột, sau đó copy-paste vào
3. **Batch import**: Import nhiều từ cùng lúc thay vì nhập từng cái
4. **Kiểm tra pinyin**: Đảm bảo pinyin có dấu thanh chính xác

---

## ❓ Câu Hỏi Thường Gặp

**Q: Tôi có thể import từ Excel không?**
A: Có! Tạo file Excel với 5 cột (Từ Trung, Pinyin, Hán-Việt, Nghĩa Việt, Ví dụ), sau đó copy-paste vào form import.

**Q: Pinyin phải có dấu không?**
A: Có, pinyin phải có dấu thanh (túshūchéng, không phải tushucheng).

**Q: Ví dụ có bắt buộc không?**
A: Không bắt buộc, nhưng nên có để giúp nhớ từ tốt hơn.

**Q: Tôi có thể sửa từ sau khi nhập không?**
A: Có, nhấn nút sửa (✏️) trên từ vựng để chỉnh sửa.

---

## 📞 Hỗ Trợ

Nếu gặp vấn đề:
1. Kiểm tra định dạng CSV (dấu | phân tách)
2. Đảm bảo pinyin có dấu thanh
3. Tải sample prompt để xem hướng dẫn chi tiết
4. Thử nhập thủ công để kiểm tra
