# 🔧 Hướng Dẫn Khôi Phục Playlist

## ❗ Vấn Đề
Playlist bị mất sau khi cập nhật tính năng mới.

## ✅ Giải Pháp Đã Áp Dụng

### 1. Sửa Lỗi Hàm Recovery
**Vấn đề cũ:** Hàm `checkAndRecoverPlaylistData()` quá nghiêm ngặt, xóa luôn các video hợp lệ.

**Giải pháp mới:** 
- Không xóa dữ liệu nữa
- Chỉ sửa chữa và bổ sung thông tin thiếu
- Giữ nguyên tất cả video có `id` hợp lệ

### 2. Các Nút Khôi Phục Trong Playlist

Trong phần Playlist, bạn sẽ thấy 2 nút mới:

#### 🔧 Nút Recovery (Màu đỏ)
- **Chức năng:** Kiểm tra và sửa lỗi dữ liệu playlist
- **Cách dùng:** Click vào nút 🔧 → Xác nhận → Hệ thống sẽ tự động sửa
- **An toàn:** Không xóa dữ liệu, chỉ sửa chữa

#### 🐛 Nút Debug (Màu vàng)
- **Chức năng:** Xem thông tin chi tiết về playlist trong Console
- **Cách dùng:** 
  1. Click vào nút 🐛
  2. Mở Console (F12 → Tab Console)
  3. Xem thông tin chi tiết về từng video

## 📋 Các Bước Khôi Phục

### Bước 1: Kiểm Tra Dữ Liệu
1. Mở trang Nghe Chép
2. Click nút **🐛 Debug** (màu vàng)
3. Xem popup hiển thị số lượng video
4. Mở Console (F12) để xem chi tiết

### Bước 2: Chạy Recovery
1. Click nút **🔧 Recovery** (màu đỏ)
2. Xác nhận khi được hỏi
3. Hệ thống sẽ tự động sửa lỗi
4. Playlist sẽ hiển thị lại

### Bước 3: Kiểm Tra Lại
1. Xem lại danh sách playlist
2. Kiểm tra các video có hiển thị đúng không
3. Thử click vào video để load

## 🆘 Nếu Vẫn Mất Dữ Liệu

### Phương Án 1: Kiểm Tra Browser Storage
1. Mở Console (F12)
2. Chạy lệnh:
```javascript
console.log(JSON.parse(localStorage.getItem('dictationPlaylist')))
```
3. Xem có dữ liệu không
4. Nếu có, copy dữ liệu ra file text để backup

### Phương Án 2: Khôi Phục Từ Cloud (Nếu Đã Đăng Nhập)
1. Đăng nhập vào tài khoản
2. Vào trang Cài Đặt
3. Click "☁️ Tải từ Server"
4. Dữ liệu sẽ được đồng bộ từ cloud về

### Phương Án 3: Import Lại Từ YouTube
1. Vào trang Nghe Chép
2. Click nút **📺** (Import YouTube Playlist)
3. Dán link playlist YouTube
4. Hệ thống sẽ tự động tải lại tất cả video

## 🛡️ Phòng Ngừa Sau Này

### 1. Bật Auto Sync
- Đăng nhập vào tài khoản
- Dữ liệu sẽ tự động lưu lên cloud
- Không lo mất dữ liệu nữa

### 2. Export Backup Định Kỳ
- Vào Cài Đặt → Backup & Restore
- Click "💾 Tải xuống Backup"
- Lưu file JSON vào máy tính

### 3. Sử Dụng Browser Sync
- Bật đồng bộ trình duyệt (Chrome Sync, Firefox Sync)
- Dữ liệu localStorage sẽ được backup tự động

## 📞 Liên Hệ Hỗ Trợ

Nếu vẫn gặp vấn đề:
1. Chụp ảnh màn hình Console (F12)
2. Chụp ảnh màn hình popup Debug
3. Gửi cho developer để được hỗ trợ

## 🔍 Thông Tin Kỹ Thuật

### Nguyên Nhân Gốc Rễ
Hàm `checkAndRecoverPlaylistData()` cũ có logic:
```javascript
// CŨ - XÓA DỮ LIỆU
const validPlaylist = playlist.filter(item => {
  if (!item.videoId) return false; // ❌ Xóa luôn!
});
```

Hàm mới:
```javascript
// MỚI - SỬA CHỮA
playlist.forEach(item => {
  if (!item.videoId && item.url) {
    item.videoId = extractYTId(item.url); // ✅ Sửa chữa!
  }
});
```

### Cấu Trúc Dữ Liệu Playlist
```javascript
{
  id: 1234567890,           // Timestamp
  videoId: "abc123",        // YouTube Video ID
  url: "https://...",       // YouTube URL
  title: "Tên video",       // Tiêu đề
  transcript: "...",        // Transcript
  totalCount: 50,           // Tổng số câu
  completedCount: 10,       // Số câu đã hoàn thành
  lastIndex: 9,             // Vị trí câu cuối
  playlist: "Tên Playlist"  // Tên playlist (folder)
}
```

## ✨ Tính Năng Mới Đã Thêm

1. **Tìm Kiếm Video:** Ô tìm kiếm 🔍 trong playlist
2. **Drag & Drop:** Kéo thả video vào playlist
3. **Đổi Tên Inline:** Click ✏️ để đổi tên trực tiếp
4. **Quản Lý Playlist:** Nút ⚙️ để mở Playlist Manager
5. **Gộp Playlist:** Nút 🔗 để gộp nhiều playlist
6. **Sắp Xếp:** Nút 🔄 để sắp xếp thứ tự video

---

**Cập nhật:** 2025-05-06
**Phiên bản:** 2.0
