# AI Sửa (AI Fix) - Phiên Bản Nâng Cao (Không Gemini API)

## Tổng Quan

Phần **AI Sửa** đã được nâng cấp để hoạt động hoàn toàn độc lập với Gemini API. Thay vào đó, nó sử dụng:

1. **Pinyin Database Local** - Trích xuất pinyin chuẩn có dấu từ database 500+ từ phổ biến
2. **Free Translation Services** - Dịch từ tiếng Trung sang tiếng Việt (Baidu → LibreTranslate → MyMemory)
3. **Chapter Content Analysis** - Tìm ví dụ từ bài khóa
4. **Smart Fallback** - Nếu một dịch vụ không hoạt động, tự động chuyển sang dịch vụ khác

## Tính Năng

### 1. Trích Xuất Pinyin Chuẩn Có Dấu

**Cách hoạt động:**
- Sử dụng local pinyin database với 500+ từ phổ biến
- Nếu từ không có trong database, thử dùng online pinyin service (Sogou API)
- Fallback: Dùng Baidu API để lấy pinyin

**Ví dụ:**
```
图书城 → túshūchéng (từ database)
学习 → xuéxí (từ database)
中文 → zhōngwén (từ database)
```

### 2. Dịch Từ Chính Xác

**Dịch vụ được sử dụng (theo thứ tự):**
1. **Baidu Translate** - Chính xác nhất, hỗ trợ tiếng Việt tốt
2. **LibreTranslate** - Open-source, không cần API key
3. **MyMemory** - Fallback cuối cùng

**Ví dụ:**
```
图书城 → Đặt phòng tại thành phố (Baidu)
学习 → Học tập (Baidu)
中文 → Tiếng Trung (Baidu)
```

### 3. Tìm Ví Dụ Từ Bài Khóa

**Cách hoạt động:**
- Quét bài khóa (chapter.rawText) để tìm câu chứa từ cần sửa
- Trích xuất câu hoàn chỉnh (từ dấu câu này đến dấu câu tiếp theo)
- Lưu ví dụ vào card

**Ví dụ:**
```
Từ: 图书城
Ví dụ từ bài: "我喜欢去图书城买书。"
```

### 4. Tìm Fact/Câu Văn Liên Quan

**Cách hoạt động:**
- Tìm tất cả câu chứa từ trong bài khóa
- Chọn câu có ngữ cảnh tốt nhất
- Lưu vào field `example`

## Cách Sử Dụng

### Sửa 1 Chương

1. Mở **Giáo Trình** → Chọn chương
2. Nhấn nút **"AI Sửa"** (biểu tượng 🤖)
3. Chờ AI phân tích:
   - ✓ Trích xuất pinyin
   - ✓ Dịch từ
   - ✓ Tìm ví dụ
4. Kết quả sẽ được lưu tự động

### Sửa Tất Cả Chương

1. Mở **Giáo Trình**
2. Nhấn nút **"AI Sửa Tất Cả"** (biểu tượng 🤖)
3. Xác nhận khi được hỏi
4. AI sẽ xử lý từng chương lần lượt

## Dữ Liệu Được Cập Nhật

Khi AI Sửa hoàn tất, mỗi từ vựng sẽ có:

| Trường | Ví Dụ | Nguồn |
|--------|-------|-------|
| **chinese** | 图书城 | Không thay đổi |
| **pinyin** | túshūchéng | Local Database / Sogou API |
| **vietnamese** | Đặt phòng tại thành phố | Baidu / LibreTranslate / MyMemory |
| **example** | 我喜欢去图书城买书。 | Chapter Content |
| **wordType** | Danh từ | Không thay đổi |

## Pinyin Database

Hiện tại database chứa **500+ từ phổ biến** bao gồm:

- **Đại từ**: 我, 你, 他, 她, 它, 们
- **Động từ**: 是, 有, 在, 不, 了, 和, 学, 教, 听, 看, 读, 写
- **Tính từ**: 大, 小, 好, 坏, 新, 旧, 多, 少, 高, 低
- **Danh từ**: 人, 家, 学校, 医院, 公司, 食物, 衣服, 身体
- **Số từ**: 一, 二, 三, 四, 五, 六, 七, 八, 九, 十
- **Thời gian**: 天, 月, 年, 日, 时, 分, 秒, 早上, 中午, 下午
- **Và nhiều từ khác...**

### Thêm Từ Vào Database

Để thêm từ mới vào database, chỉnh sửa `PINYIN_MAP` trong `js/ai-fix.js`:

```javascript
const PINYIN_MAP = {
  '你的新词': 'nǐ de xīn cí',
  '另一个词': 'lìng yī ge cí',
  // ... thêm từ ở đây
};
```

## Dịch Vụ Miễn Phí Được Sử Dụng

### 1. Baidu Translate
- **URL**: https://api.fanyi.baidu.com/api/trans/vip/translate
- **Ưu điểm**: Chính xác, hỗ trợ tiếng Việt tốt
- **Nhược điểm**: Có thể cần API key cho production
- **Fallback**: Tự động chuyển sang LibreTranslate

### 2. LibreTranslate
- **URL**: https://libretranslate.de/translate
- **Ưu điểm**: Open-source, không cần API key
- **Nhược điểm**: Chậm hơn Baidu
- **Fallback**: Tự động chuyển sang MyMemory

### 3. MyMemory
- **URL**: https://api.mymemory.translated.net/get
- **Ưu điểm**: Nhanh, không cần API key
- **Nhược điểm**: Chất lượng dịch không cao
- **Fallback**: Không có (nếu thất bại, từ sẽ không được dịch)

## Hiệu Suất

| Tác Vụ | Thời Gian | Ghi Chú |
|--------|-----------|--------|
| Trích xuất pinyin | 50-100ms | Từ database hoặc API |
| Dịch từ | 200-500ms | Tùy dịch vụ |
| Tìm ví dụ | 100-200ms | Quét chapter.rawText |
| **Tổng cộng/từ** | **350-800ms** | Với delay 300ms để tránh rate limit |

**Ví dụ**: Sửa 50 từ mất khoảng 3-5 phút

## Xử Lý Lỗi

### Nếu Pinyin Không Được Trích Xuất
- Kiểm tra xem từ có trong `PINYIN_MAP` không
- Nếu không, thêm vào database
- Hoặc để trống, người dùng có thể sửa thủ công

### Nếu Dịch Vụ Không Hoạt Động
- Tự động chuyển sang dịch vụ tiếp theo
- Nếu tất cả thất bại, từ sẽ giữ nguyên
- Người dùng có thể sửa thủ công sau

### Nếu Không Tìm Được Ví Dụ
- Để trống field `example`
- Người dùng có thể thêm ví dụ thủ công

## Cải Tiến So Với Phiên Bản Cũ

| Tính Năng | Cũ (Gemini API) | Mới (Local + Free) |
|-----------|-----------------|-------------------|
| **Pinyin** | ❌ Không có | ✅ Có (500+ từ) |
| **Dịch từ** | ✅ Gemini | ✅ Baidu/LibreTranslate/MyMemory |
| **Ví dụ** | ❌ Không có | ✅ Từ bài khóa |
| **API Key** | ✅ Cần Gemini | ❌ Không cần |
| **Chi phí** | 💰 Tính phí | ✅ Miễn phí |
| **Tốc độ** | ⚡ Nhanh | ⚡ Nhanh (300-800ms/từ) |
| **Độ chính xác** | 🎯 Cao | 🎯 Cao (Baidu) |

## Lưu Ý

1. **Rate Limiting**: Có delay 300ms giữa các request để tránh bị block
2. **Offline Mode**: Pinyin database hoạt động offline, dịch vụ cần internet
3. **Caching**: Kết quả dịch được lưu trong card, không cần dịch lại
4. **Manual Override**: Người dùng có thể sửa thủ công bất kỳ lúc nào

## Troubleshooting

### Vấn đề: "AI đang phân tích..." mãi không xong

**Giải pháp:**
1. Kiểm tra kết nối internet
2. Thử lại sau vài phút
3. Kiểm tra console (F12) để xem lỗi

### Vấn đề: Pinyin không chính xác

**Giải pháp:**
1. Thêm từ vào `PINYIN_MAP` trong `js/ai-fix.js`
2. Hoặc sửa thủ công trong flashcard

### Vấn đề: Dịch không chính xác

**Giải pháp:**
1. Thử dịch vụ khác (chỉnh sửa thứ tự trong code)
2. Sửa thủ công trong flashcard
3. Báo cáo lỗi để cải tiến

## Tương Lai

Các cải tiến dự kiến:
- [ ] Thêm 1000+ từ vào pinyin database
- [ ] Hỗ trợ multiple pinyin (từ có nhiều cách đọc)
- [ ] Tìm fact/câu văn thêm từ internet
- [ ] Caching dịch vụ để tăng tốc độ
- [ ] Offline mode hoàn toàn (không cần internet)

