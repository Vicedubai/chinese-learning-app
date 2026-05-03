# Hướng Dẫn Khắc Phục Sự Cố - AI Sửa

## Vấn Đề: Pinyin Không Được Trích Xuất

### Nguyên Nhân
- Từ không có trong PINYIN_MAP (database local)
- Online pinyin service không hoạt động

### Giải Pháp

#### 1. Thêm Từ Vào PINYIN_MAP
Mở file `js/ai-fix.js` và tìm `const PINYIN_MAP = {`

Thêm từ mới vào:
```javascript
const PINYIN_MAP = {
  '图书城': 'túshūchéng',  // Thêm từ mới ở đây
  '钥匙': 'yàoshi',
  // ... các từ khác
};
```

#### 2. Cách Thêm Từ Ghép
Nếu từ là từ ghép (2+ ký tự), hãy thêm cả từ ghép và từng ký tự:
```javascript
'图书城': 'túshūchéng',  // Từ ghép
'图': 'tú',              // Ký tự 1
'书': 'shū',             // Ký tự 2
'城': 'chéng',           // Ký tự 3
```

#### 3. Định Dạng Pinyin Chuẩn
- Luôn sử dụng pinyin có dấu (tone marks)
- Ví dụ: `wǒ` (không phải `wo`), `nǐ` (không phải `ni`)
- Các dấu: ā á ǎ à (tone 1-4), ē é ě è, ī í ǐ ì, ō ó ǒ ò, ū ú ǔ ù, ǖ ǘ ǚ ǜ

#### 4. Kiểm Tra Pinyin
Sau khi thêm từ, reload trang (F5) và thử lại.

---

## Vấn Đề: Ví Dụ Không Được Tìm Thấy

### Nguyên Nhân
- `chapter.rawText` quá ngắn hoặc không chứa từ
- Từ không xuất hiện trong bài khóa

### Giải Pháp

#### 1. Kiểm Tra rawText
Mở DevTools (F12) → Console, chạy:
```javascript
const ch = State.chapters.find(c => c.title === 'Tên chương');
console.log(ch.rawText);
console.log(ch.rawText.length);
```

Nếu `rawText` quá ngắn (<100 ký tự), vấn đề là OCR không trích xuất đầy đủ.

#### 2. Quét Lại Từ
1. Mở chương
2. Nhấn nút **"🔄 Quét lại từ"**
3. Chọn file PDF gốc
4. Chờ quét xong

#### 3. Thêm Ví Dụ Thủ Công
1. Mở chương
2. Nhấn nút **"✏️"** (sửa) trên từ vựng
3. Nhập ví dụ vào field "Ví dụ"
4. Lưu

---

## Vấn Đề: Dịch Không Chính Xác

### Nguyên Nhân
- Dịch vụ Baidu/LibreTranslate/MyMemory không hoạt động
- Từ quá phức tạp hoặc không phổ biến

### Giải Pháp

#### 1. Kiểm Tra Kết Nối Internet
- Đảm bảo kết nối internet ổn định
- Thử lại sau vài phút

#### 2. Thử Dịch Vụ Khác
Mở DevTools (F12) → Console, chạy:
```javascript
// Thử Baidu
const result1 = await translateWithBaidu('图书城');
console.log('Baidu:', result1);

// Thử LibreTranslate
const result2 = await translateWithLibreTranslate('图书城');
console.log('LibreTranslate:', result2);

// Thử MyMemory
const result3 = await translateWithMyMemory('图书城');
console.log('MyMemory:', result3);
```

#### 3. Sửa Thủ Công
1. Mở chương
2. Nhấn nút **"✏️"** (sửa) trên từ vựng
3. Nhập dịch chính xác vào field "Hán Việt"
4. Lưu

---

## Vấn Đề: AI Sửa Mãi Không Xong

### Nguyên Nhân
- Dịch vụ bị block hoặc quá chậm
- Quá nhiều từ cần xử lý

### Giải Pháp

#### 1. Kiểm Tra Console
Mở DevTools (F12) → Console để xem lỗi

#### 2. Thử Lại Sau Vài Phút
Dịch vụ có thể bị rate limit tạm thời

#### 3. Sửa Từng Từ Thủ Công
Nếu AI Sửa không hoạt động, sửa từng từ:
1. Mở chương
2. Nhấn nút **"✏️"** (sửa) trên từ vựng
3. Nhập pinyin, dịch, ví dụ
4. Lưu

---

## Vấn Đề: Pinyin Sai Tông

### Nguyên Nhân
- Từ có nhiều cách đọc (polyphonic)
- Database chỉ lưu 1 cách đọc

### Giải Pháp

#### 1. Sửa Thủ Công
1. Mở chương
2. Nhấn nút **"✏️"** (sửa) trên từ vựng
3. Nhập pinyin đúng
4. Lưu

#### 2. Thêm Vào Database
Nếu từ này xuất hiện nhiều lần, thêm vào PINYIN_MAP:
```javascript
'长': 'cháng',  // Dài (tính từ)
// hoặc
'长': 'zhǎng',  // Trưởng (danh từ)
```

---

## Vấn Đề: Dịch Vụ Không Hoạt Động

### Kiểm Tra Dịch Vụ

#### Baidu Translate
```javascript
const res = await fetch('https://api.fanyi.baidu.com/api/trans/vip/translate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({
    q: '你好',
    from: 'zh',
    to: 'vi',
    appid: '20230101001234567',
    salt: Math.random().toString().slice(2),
    sign: 'dummy'
  })
});
console.log(await res.json());
```

#### LibreTranslate
```javascript
const res = await fetch('https://libretranslate.de/translate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    q: '你好',
    source: 'zh',
    target: 'vi'
  })
});
console.log(await res.json());
```

#### MyMemory
```javascript
const res = await fetch('https://api.mymemory.translated.net/get?q=你好&langpair=zh-CN|vi');
console.log(await res.json());
```

---

## Danh Sách Từ Phổ Biến Cần Thêm

Nếu bạn thường xuyên gặp từ không có pinyin, hãy thêm vào PINYIN_MAP:

```javascript
// Từ liên quan đến sách/thư viện
'图书': 'túshū',
'图书城': 'túshūchéng',
'图书馆': 'túshūguǎn',
'书店': 'shūdiàn',
'书架': 'shūjià',

// Từ liên quan đến nhà/phòng
'钥匙': 'yàoshi',
'门': 'mén',
'窗': 'chuāng',
'房间': 'fángjiān',

// Từ liên quan đến hành động
'拔': 'báo',
'下来': 'xiàlai',
'忘': 'wàng',
'拉': 'lā',
'推': 'tuī',

// Thêm các từ khác theo nhu cầu
```

---

## Liên Hệ Hỗ Trợ

Nếu vấn đề vẫn không giải quyết được:
1. Kiểm tra console (F12) để xem lỗi chi tiết
2. Thử sửa thủ công từng từ
3. Báo cáo lỗi với thông tin chi tiết

