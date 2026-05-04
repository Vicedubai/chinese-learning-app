# 🎬 HƯỚNG DẪN TÌM KIẾM VIDEO YOUTUBE

## ✨ TÍNH NĂNG MỚI

Tính năng tìm kiếm YouTube đã được **nâng cấp hoàn toàn**:

### ✅ Cải tiến chính:

1. **Video nhúng trực tiếp** 
   - Hiển thị video YouTube ngay trong kết quả tìm kiếm
   - Xem trước video trước khi chọn
   - Không cần mở tab mới

2. **Tự động load vào Dictation**
   - Click nút "✅ Chọn video này để luyện"
   - Video tự động load vào player bên phải
   - Tự động scroll đến video player
   - Tự động focus vào ô transcript

3. **Không cần API Key**
   - Sử dụng Invidious API (miễn phí)
   - Fallback sang YouTube embed nếu API không khả dụng
   - Luôn hoạt động, không giới hạn

---

## 🚀 CÁCH SỬ DỤNG

### Bước 1: Vào trang Nghe chép
1. Click vào **🎧 Nghe chép** ở sidebar
2. Bạn sẽ thấy 3 cột:
   - **Trái**: Tìm kiếm YouTube
   - **Giữa**: Video player & Transcript
   - **Phải**: Playlist

### Bước 2: Tìm kiếm video
1. Nhập từ khóa vào ô tìm kiếm (vd: "học tiếng trung")
2. Nhấn **Enter** hoặc click nút **🔍**
3. Đợi 2-3 giây để tải kết quả

### Bước 3: Xem trước video
- Kết quả hiển thị **video nhúng trực tiếp**
- Bạn có thể **play video ngay** để xem trước
- Xem thông tin: tiêu đề, kênh, thời lượng, lượt xem

### Bước 4: Chọn video để luyện
1. Click nút **"✅ Chọn video này để luyện"**
2. Video tự động load vào player bên phải
3. Màn hình tự động scroll đến video
4. Cursor tự động focus vào ô transcript

### Bước 5: Luyện nghe chép
1. Dán transcript vào ô (hoặc dùng AI trích tự động)
2. Click **"▶ Bắt đầu luyện"**
3. Nghe và gõ lại từng câu

---

## 🎯 VÍ DỤ TÌM KIẾM

### Từ khóa gợi ý:

**Học tiếng Trung cơ bản:**
- `học tiếng trung cơ bản`
- `chinese for beginners`
- `学中文`

**Luyện nghe:**
- `chinese listening practice`
- `中文听力练习`
- `tiếng trung giao tiếp`

**HSK:**
- `HSK 1 listening`
- `HSK 2 vocabulary`
- `HSK 3 practice`

**Văn hóa:**
- `chinese culture`
- `中国文化`
- `văn hóa trung quốc`

**Phim/Nhạc:**
- `chinese drama with subtitles`
- `chinese songs with pinyin`
- `中文歌曲`

---

## 🔧 KỸ THUẬT

### API được sử dụng:

1. **Invidious API** (Ưu tiên)
   - API miễn phí, không cần key
   - Trả về thông tin video chi tiết
   - Có nhiều instance backup

2. **YouTube Embed** (Fallback)
   - Nhúng trực tiếp từ YouTube
   - Luôn hoạt động
   - Không cần API

### Instances Invidious:
```javascript
const invidiousInstances = [
  'https://invidious.snopyta.org',
  'https://yewtu.be',
  'https://invidious.kavin.rocks'
];
```

Nếu instance đầu tiên không hoạt động, tự động thử instance tiếp theo.

---

## 📊 THÔNG TIN HIỂN THỊ

Mỗi kết quả tìm kiếm hiển thị:

- ✅ **Video nhúng** (có thể play ngay)
- 📝 **Tiêu đề** (tối đa 2 dòng)
- 👤 **Tên kênh**
- ⏱️ **Thời lượng** (MM:SS)
- 👁️ **Lượt xem** (K/M format)
- 🎯 **Nút chọn video**

---

## 🎨 GIAO DIỆN

### Màu sắc:
- **Border**: Xám nhạt
- **Hover**: Đỏ sáng + shadow
- **Background**: Tối (dark mode)

### Animation:
- **Hover**: Nâng lên 2px + shadow
- **Click**: Quay về vị trí ban đầu
- **Loading**: Pulse animation

### Responsive:
- Desktop: 3 cột (Search | Player | Playlist)
- Mobile: 1 cột (stacked)

---

## 🐛 XỬ LÝ LỖI

### Nếu không tìm thấy kết quả:
- Hiển thị video embed từ YouTube
- Nút "Mở trang tìm kiếm YouTube"

### Nếu API lỗi:
- Tự động thử instance khác
- Fallback sang YouTube embed
- Luôn có kết quả hiển thị

### Nếu video không load:
- Kiểm tra link YouTube
- Thử refresh trang
- Chọn video khác

---

## 💡 MẸO SỬ DỤNG

### 1. Tìm kiếm hiệu quả:
- Dùng từ khóa tiếng Anh hoặc tiếng Trung
- Thêm "listening practice" để tìm video luyện nghe
- Thêm "with subtitles" để tìm video có phụ đề

### 2. Chọn video phù hợp:
- Xem trước video trước khi chọn
- Chọn video có độ dài vừa phải (5-15 phút)
- Chọn video có phụ đề tiếng Trung

### 3. Luyện hiệu quả:
- Dùng AI trích transcript tự động
- Nghe từng câu nhiều lần
- Gõ lại chính xác từng từ

---

## 🔄 SO SÁNH TRƯỚC/SAU

### ❌ Trước (Cũ):
- Chỉ hiển thị thumbnail
- Phải click để mở YouTube
- Cần copy link thủ công
- Cần API Key (giới hạn)

### ✅ Sau (Mới):
- Hiển thị video nhúng trực tiếp
- Xem trước ngay trong app
- Tự động load vào dictation
- Không cần API Key (không giới hạn)

---

## 📱 TƯƠNG THÍCH

### Desktop:
- ✅ Chrome/Edge
- ✅ Firefox
- ✅ Safari

### Mobile:
- ✅ Chrome Mobile
- ✅ Safari iOS
- ✅ Samsung Internet

### Yêu cầu:
- Kết nối internet
- JavaScript enabled
- Cookies enabled (cho YouTube embed)

---

## 🚀 TÍNH NĂNG TIẾP THEO

### Đang phát triển:
- [ ] Lưu lịch sử tìm kiếm
- [ ] Gợi ý video dựa trên level
- [ ] Filter theo độ dài video
- [ ] Filter theo kênh
- [ ] Tải transcript tự động từ YouTube

### Đề xuất:
- [ ] Tích hợp với Playlist
- [ ] Đánh dấu video đã học
- [ ] Thống kê thời gian học
- [ ] Chia sẻ video với bạn bè

---

## 📞 HỖ TRỢ

### Nếu gặp vấn đề:

1. **Video không hiển thị:**
   - Kiểm tra kết nối internet
   - Refresh trang (Ctrl + F5)
   - Thử video khác

2. **Tìm kiếm không hoạt động:**
   - Kiểm tra từ khóa
   - Thử từ khóa khác
   - Mở Console (F12) xem lỗi

3. **Video không load vào dictation:**
   - Kiểm tra link YouTube
   - Click nút "Tải video" thủ công
   - Refresh trang

### Báo lỗi:
- Chụp ảnh màn hình
- Mở Console (F12)
- Gửi thông tin lỗi

---

## 🎉 KẾT LUẬN

Tính năng tìm kiếm YouTube mới:
- ✅ **Dễ sử dụng** - Chỉ cần nhập từ khóa
- ✅ **Nhanh chóng** - Kết quả trong 2-3 giây
- ✅ **Trực quan** - Video nhúng trực tiếp
- ✅ **Tiện lợi** - Tự động load vào dictation
- ✅ **Miễn phí** - Không cần API Key

**Hãy thử ngay và trải nghiệm!** 🚀

---

**Cập nhật:** 2025-01-XX
**Phiên bản:** 2.0
**Tác giả:** Kiro AI Assistant
