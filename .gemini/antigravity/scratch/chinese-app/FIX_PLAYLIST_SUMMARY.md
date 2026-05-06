# 🔧 Tóm Tắt: Sửa Lỗi Mất Playlist

## ❗ Vấn Đề
Sau khi thêm tính năng tìm kiếm video và cải tiến playlist, tất cả playlist của bạn đã biến mất.

## 🔍 Nguyên Nhân
Hàm `checkAndRecoverPlaylistData()` trong file `js/dictation.js` có lỗi logic:
- **Lỗi:** Hàm này xóa tất cả video không có `videoId` hợp lệ
- **Hậu quả:** Nhiều video bị xóa nhầm vì không có `videoId` nhưng vẫn có dữ liệu hợp lệ

## ✅ Giải Pháp Đã Áp Dụng

### 1. Sửa Hàm Recovery (js/dictation.js)
**Thay đổi:**
```javascript
// CŨ - XÓA DỮ LIỆU
const validPlaylist = playlist.filter(item => {
  if (!item.videoId) return false; // ❌ Xóa luôn!
});

// MỚI - SỬA CHỮA
playlist.forEach(item => {
  if (!item.videoId && item.url) {
    item.videoId = extractYTId(item.url); // ✅ Sửa chữa!
  }
});
```

**Kết quả:**
- ✅ Không xóa dữ liệu nữa
- ✅ Chỉ sửa chữa và bổ sung thông tin thiếu
- ✅ Giữ nguyên tất cả video có `id` hợp lệ

### 2. Cải Thiện Hàm recoverPlaylistData()
- Bỏ thông báo "đã loại bỏ X mục" (gây hoang mang)
- Thêm log chi tiết trong Console
- Hiển thị số lượng video tìm thấy

## 🛠️ Cách Khôi Phục Dữ Liệu

### Phương Án 1: Dùng Nút Recovery (Khuyến Nghị)
1. Mở trang **Nghe Chép**
2. Tìm phần **Playlist** bên phải
3. Click nút **🔧** (màu đỏ) ở góc trên bên phải
4. Xác nhận khi được hỏi
5. Hệ thống sẽ tự động kiểm tra và sửa lỗi

### Phương Án 2: Kiểm Tra Dữ Liệu Thủ Công
1. Mở file `check-playlist-data.html` trong trình duyệt
2. Xem thống kê và danh sách video
3. Nếu có dữ liệu, click **💾 Export Dữ Liệu** để backup
4. Quay lại app chính và chạy Recovery

### Phương Án 3: Khôi Phục Từ Cloud
Nếu bạn đã đăng nhập và bật đồng bộ:
1. Vào trang **Cài Đặt**
2. Click **☁️ Tải từ Server**
3. Dữ liệu sẽ được đồng bộ từ cloud về

### Phương Án 4: Import Lại Từ YouTube
Nếu các phương án trên không hiệu quả:
1. Vào trang **Nghe Chép**
2. Click nút **📺** (Import YouTube Playlist)
3. Dán link playlist YouTube gốc
4. Hệ thống sẽ tự động tải lại tất cả video

## 📋 Checklist Sau Khi Sửa

- [ ] Mở trang Nghe Chép
- [ ] Click nút 🔧 Recovery
- [ ] Kiểm tra playlist có hiển thị lại không
- [ ] Thử click vào video để load
- [ ] Nếu OK, export backup để phòng ngừa
- [ ] Bật đồng bộ cloud để không lo mất dữ liệu

## 🔍 Debug Tools

### 1. Nút 🐛 Debug
- **Vị trí:** Góc trên bên phải phần Playlist (màu vàng)
- **Chức năng:** Hiển thị thông tin chi tiết về playlist
- **Cách dùng:** Click → Xem popup → Mở Console (F12) để xem chi tiết

### 2. File check-playlist-data.html
- **Chức năng:** Kiểm tra dữ liệu localStorage chi tiết
- **Cách dùng:** Mở file trong trình duyệt
- **Tính năng:**
  - 📊 Thống kê tổng quan
  - 🎬 Danh sách video chi tiết
  - 📁 Playlist groups
  - 💾 Export backup
  - 📋 Copy JSON
  - 🔍 Xem raw data

### 3. Console Commands
Mở Console (F12) và chạy:

```javascript
// Xem dữ liệu playlist
console.log(JSON.parse(localStorage.getItem('dictationPlaylist')))

// Đếm số video
JSON.parse(localStorage.getItem('dictationPlaylist')).length

// Xem video đầu tiên
JSON.parse(localStorage.getItem('dictationPlaylist'))[0]

// Lọc video có playlist
JSON.parse(localStorage.getItem('dictationPlaylist')).filter(v => v.playlist)

// Lọc video chưa có playlist
JSON.parse(localStorage.getItem('dictationPlaylist')).filter(v => !v.playlist && !v.isPlaylistMarker)
```

## 📚 Tài Liệu Liên Quan

1. **KHOI_PHUC_PLAYLIST.md** - Hướng dẫn chi tiết khôi phục
2. **check-playlist-data.html** - Tool kiểm tra dữ liệu
3. **js/dictation.js** - File code đã được sửa

## 🛡️ Phòng Ngừa Sau Này

### 1. Bật Auto Sync
- Đăng nhập vào tài khoản
- Dữ liệu sẽ tự động lưu lên cloud
- Không lo mất dữ liệu nữa

### 2. Export Backup Định Kỳ
- Vào Cài Đặt → Backup & Restore
- Click "💾 Tải xuống Backup"
- Lưu file JSON vào máy tính
- Nên backup 1 tuần 1 lần

### 3. Sử Dụng Browser Sync
- Bật đồng bộ trình duyệt (Chrome Sync, Firefox Sync)
- Dữ liệu localStorage sẽ được backup tự động

## 📞 Nếu Vẫn Gặp Vấn Đề

1. Chụp ảnh màn hình Console (F12)
2. Chụp ảnh màn hình popup Debug (nút 🐛)
3. Mở file `check-playlist-data.html` và chụp ảnh
4. Gửi cho developer kèm mô tả chi tiết

## ✨ Tính Năng Mới (Vẫn Hoạt Động Bình Thường)

1. ✅ **Tìm Kiếm Video:** Ô tìm kiếm 🔍 trong playlist
2. ✅ **Drag & Drop:** Kéo thả video vào playlist
3. ✅ **Đổi Tên Inline:** Click ✏️ để đổi tên trực tiếp
4. ✅ **Quản Lý Playlist:** Nút ⚙️ để mở Playlist Manager
5. ✅ **Gộp Playlist:** Nút 🔗 để gộp nhiều playlist
6. ✅ **Sắp Xếp:** Nút 🔄 để sắp xếp thứ tự video

---

## 📝 Ghi Chú Kỹ Thuật

### Cấu Trúc Dữ Liệu
```javascript
{
  id: 1234567890,           // Timestamp (bắt buộc)
  videoId: "abc123",        // YouTube Video ID (có thể tự động trích xuất từ URL)
  url: "https://...",       // YouTube URL (bắt buộc)
  title: "Tên video",       // Tiêu đề (tự động tạo nếu thiếu)
  transcript: "...",        // Transcript
  totalCount: 50,           // Tổng số câu (mặc định 0)
  completedCount: 10,       // Số câu đã hoàn thành (mặc định 0)
  lastIndex: 9,             // Vị trí câu cuối
  playlist: "Tên Playlist"  // Tên playlist (folder) - có thể null
}
```

### Playlist Marker (Không Bắt Buộc)
```javascript
{
  id: "playlist_1234567890",
  videoId: "playlist_marker",
  isPlaylistMarker: true,
  playlist: "Tên Playlist"
}
```

---

**Cập nhật:** 2025-05-06 23:45 (Giờ VN)
**Phiên bản:** 2.1
**Trạng thái:** ✅ Đã sửa xong
