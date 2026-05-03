# 🔍 Hướng Dẫn Khắc Phục Lỗi

## 🎯 Vấn Đề: Từ Vựng Không Hiển Thị

### Triệu Chứng
- Sau khi nhập từ vựng, danh sách từ vựng không hiển thị
- Chương hiển thị "0 từ mới"
- Nhấn vào chương, thấy "Chưa có chương nào"

### Nguyên Nhân Có Thể
1. Từ vựng không được lưu vào `State.cards`
2. `chapterId` không khớp giữa chương và từ vựng
3. UI không được cập nhật sau khi lưu
4. Trình duyệt cache file cũ

### Cách Khắc Phục

#### Bước 1: Kiểm Tra Dữ Liệu Được Lưu
1. Mở DevTools (F12)
2. Vào tab "Application" → "Local Storage"
3. Tìm khóa "cards"
4. Kiểm tra xem có từ vựng không

**Hoặc trong Console**:
```javascript
console.log('Tổng từ vựng:', State.cards.length)
console.log('Danh sách từ vựng:', State.cards)
```

#### Bước 2: Kiểm Tra `chapterId`
```javascript
// Xem tất cả chương
console.log('Danh sách chương:', State.chapters)

// Xem từ vựng của chương cụ thể
const chapterId = 'chapter-id'; // Thay bằng ID thực tế
console.log(State.cards.filter(c => c.chapterId === chapterId))
```

#### Bước 3: Làm Mới Trang
1. Nhấn F5 để làm mới trang
2. Kiểm tra xem từ vựng có hiển thị không

#### Bước 4: Xóa Cache Trình Duyệt
1. Mở DevTools (F12)
2. Vào tab "Application"
3. Nhấn chuột phải → "Clear site data"
4. Làm mới trang (F5)

#### Bước 5: Kiểm Tra Console Có Lỗi
1. Mở DevTools (F12)
2. Vào tab "Console"
3. Kiểm tra xem có lỗi đỏ không
4. Nếu có, ghi lại lỗi

---

## 🎯 Vấn Đề: Chương Không Được Lưu

### Triệu Chứng
- Sau khi tạo chương, làm mới trang, chương biến mất
- Danh sách chương trống

### Nguyên Nhân Có Thể
1. `State.save()` không được gọi
2. `localStorage` bị vô hiệu hóa
3. Trình duyệt cache file cũ

### Cách Khắc Phục

#### Bước 1: Kiểm Tra `localStorage`
```javascript
// Trong Console:
console.log('Danh sách chương:', State.chapters)
console.log('localStorage chapters:', localStorage.getItem('chapters'))
```

#### Bước 2: Kiểm Tra `State.save()`
```javascript
// Trong Console:
State.save()
console.log('Đã lưu')
```

#### Bước 3: Làm Mới Trang
1. Nhấn F5
2. Kiểm tra xem chương có hiển thị không

#### Bước 4: Xóa Cache Trình Duyệt
1. Mở DevTools (F12)
2. Vào tab "Application"
3. Nhấn chuột phải → "Clear site data"
4. Làm mới trang (F5)

---

## 🎯 Vấn Đề: 4 Nút Không Clickable

### Triệu Chứng
- Nhấn vào nút không có phản ứng
- Không có thông báo lỗi

### Nguyên Nhân Có Thể
1. Hàm không được định nghĩa
2. Trình duyệt cache file cũ
3. JavaScript không tải đúng

### Cách Khắc Phục

#### Bước 1: Kiểm Tra Hàm Được Định Nghĩa
```javascript
// Trong Console:
console.log(typeof aiFixAllChapters)  // Phải là 'function'
console.log(typeof showCreateChapterForm)  // Phải là 'function'
console.log(typeof downloadSampleCSV)  // Phải là 'function'
console.log(typeof downloadSamplePrompt)  // Phải là 'function'
```

#### Bước 2: Xóa Cache Trình Duyệt
1. Mở DevTools (F12)
2. Vào tab "Application"
3. Nhấn chuột phải → "Clear site data"
4. Làm mới trang (F5)

#### Bước 3: Kiểm Tra Console Có Lỗi
1. Mở DevTools (F12)
2. Vào tab "Console"
3. Kiểm tra xem có lỗi đỏ không

---

## 🎯 Vấn Đề: Import CSV Không Hoạt Động

### Triệu Chứng
- Nhấn "📥 Import" không có phản ứng
- Thông báo lỗi "Không tìm thấy từ nào hợp lệ"

### Nguyên Nhân Có Thể
1. Định dạng CSV sai
2. Không có dòng nào hợp lệ
3. Dấu phân tách không phải `|` (pipe)

### Cách Khắc Phục

#### Bước 1: Kiểm Tra Định Dạng CSV
**Đúng**:
```
图书城|túshūchéng|圖書城|thành phố sách|我喜欢去图书城看书。
钥匙|yàoshi|鑰匙|chìa khóa|我忘记拔下钥匙了。
```

**Sai**:
```
图书城, túshūchéng, 圖書城, thành phố sách, 我喜欢去图书城看书。
图书城	túshūchéng	圖書城	thành phố sách	我喜欢去图书城看书。
```

#### Bước 2: Kiểm Tra Dấu Phân Tách
- Phải dùng `|` (pipe), không phải `,` (comma) hoặc `\t` (tab)

#### Bước 3: Kiểm Tra Số Trường
- Mỗi dòng phải có ít nhất 4 trường (Từ Trung, Pinyin, Hán-Việt, Nghĩa Việt)
- Trường thứ 5 (Ví dụ) là tùy chọn

#### Bước 4: Tải Sample CSV
1. Nhấn **📥 Tải Sample CSV**
2. Mở file, xem định dạng đúng
3. Chỉnh sửa dữ liệu của bạn theo định dạng này

---

## 🎯 Vấn Đề: Pinyin Không Có Dấu

### Triệu Chứng
- Pinyin hiển thị không có dấu (tone marks)
- Ví dụ: "tushucheng" thay vì "túshūchéng"

### Nguyên Nhân Có Thể
1. Nhập pinyin sai
2. Công cụ pinyin không chính xác

### Cách Khắc Phục

#### Bước 1: Sử Dụng Công Cụ Pinyin Online
- Google Translate: https://translate.google.com/
- Pinyin Converter: https://www.mdbg.net/chinese/dictionary
- Pleco: https://www.pleco.com/

#### Bước 2: Kiểm Tra Pinyin Đúng
**Đúng**:
- túshūchéng (có dấu)
- wàngjì (có dấu)
- yàoshi (có dấu)

**Sai**:
- tushucheng (không có dấu)
- wangji (không có dấu)
- yaoshi (không có dấu)

#### Bước 3: Tải Sample CSV
1. Nhấn **📥 Tải Sample CSV**
2. Xem ví dụ pinyin đúng
3. Sao chép pinyin từ file sample

---

## 🔧 Công Cụ Gỡ Lỗi

### DevTools Console
```javascript
// Xem tất cả dữ liệu
console.log('State:', State)

// Xem chương
console.log('Chapters:', State.chapters)

// Xem từ vựng
console.log('Cards:', State.cards)

// Xem tiến độ
console.log('Progress:', State.progress)

// Xem phiên học
console.log('Session:', State.session)

// Lưu dữ liệu
State.save()

// Đồng bộ lên server
State.sync()

// Xem từ vựng của chương cụ thể
const chapterId = 'chapter-id';
console.log(State.cards.filter(c => c.chapterId === chapterId))

// Xem số lượng từ theo chương
State.chapters.forEach(ch => {
  const count = State.cards.filter(c => c.chapterId === ch.id).length;
  console.log(`${ch.title}: ${count} từ`);
});
```

### Kiểm Tra localStorage
```javascript
// Xem tất cả khóa
console.log(Object.keys(localStorage))

// Xem dữ liệu cụ thể
console.log(JSON.parse(localStorage.getItem('chapters')))
console.log(JSON.parse(localStorage.getItem('cards')))

// Xóa dữ liệu (cẩn thận!)
localStorage.clear()
```

---

## 📞 Liên Hệ & Hỗ Trợ

### Nếu Vẫn Có Lỗi
1. Ghi lại lỗi từ Console
2. Kiểm tra DevTools → Network (xem có lỗi tải file không)
3. Thử trình duyệt khác
4. Thử xóa cache hoàn toàn

### Tài Liệu Liên Quan
- 📊 [Cấu Trúc Dữ Liệu](./DATA_STRUCTURE.md)
- 📚 [Hướng Dẫn Nhập Từ Vựng](./VOCABULARY_INPUT_GUIDE.md)
- 🔄 [Sửa Lỗi: Chương Không Được Lưu](./CHAPTER_PERSISTENCE_FIX.md)
- ✅ [Sửa Lỗi: Từ Vựng Không Hiển Thị](./VOCABULARY_DISPLAY_FIX.md)
