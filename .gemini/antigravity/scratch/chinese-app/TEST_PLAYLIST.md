# 🧪 Test Playlist - Hướng Dẫn Kiểm Tra

## 🎯 Mục Đích
Kiểm tra xem dữ liệu từ Supabase có được load và hiển thị đúng không.

## 📋 Các Bước Test

### Bước 1: Kiểm Tra Dữ Liệu Đã Load
1. Mở app
2. Đăng nhập vào tài khoản
3. Vào **Cài Đặt** → Click **☁️ Tải từ Server**
4. Xem thông báo "Đã tải dữ liệu từ Supabase thành công!"
5. Mở Console (F12) và tìm dòng:
   ```
   ☁️ Loaded from Supabase: { books: X, chapters: Y, cards: Z, dictationPlaylist: N }
   ```
6. **Ghi lại số lượng dictationPlaylist:** ___

### Bước 2: Kiểm Tra Hiển Thị
1. Vào trang **Nghe Chép**
2. Xem phần **Playlist** bên phải
3. Kiểm tra:
   - [ ] Có hiển thị số lượng video không? (badge số)
   - [ ] Có hiển thị danh sách video không?
   - [ ] Có hiển thị "Chưa có bài luyện nào" không?

### Bước 3: Debug Trong Console
1. Mở Console (F12)
2. Tìm dòng "=== RENDER PLAYLIST DEBUG ==="
3. Ghi lại thông tin:
   ```
   Total items from checkAndRecoverPlaylistData: ___
   After filtering markers: ___
   ```
4. Nếu thấy "⚠️ Playlist is empty after filtering!":
   - Xem "Original allItems" có dữ liệu không
   - Chụp ảnh Console

### Bước 4: Dùng Nút Debug
1. Trong phần Playlist, click nút **🐛** (màu vàng)
2. Xem popup hiển thị:
   - Tổng items
   - Có VideoID
   - Thiếu VideoID
   - Markers
   - Có Playlist
3. Chụp ảnh popup
4. Xem Console để biết chi tiết từng item

### Bước 5: Test Các Tính Năng

#### 5.1. Tìm Kiếm Video
- [ ] Gõ tên video vào ô tìm kiếm 🔍
- [ ] Kết quả có hiển thị đúng không?

#### 5.2. Click Vào Video
- [ ] Click vào thumbnail video
- [ ] Video có load lên player không?
- [ ] Transcript có hiển thị không?

#### 5.3. Đổi Tên Video
- [ ] Click nút ✏️ trên video
- [ ] Đổi tên
- [ ] Tên có thay đổi không?

#### 5.4. Thêm Vào Playlist
- [ ] Click nút 📁 trên video chưa có playlist
- [ ] Nhập tên playlist
- [ ] Video có chuyển vào playlist không?

#### 5.5. Tạo Playlist Mới
- [ ] Click nút ➕ ở góc trên
- [ ] Nhập tên playlist
- [ ] Playlist mới có xuất hiện không?

#### 5.6. Import YouTube Playlist
- [ ] Click nút 📺
- [ ] Dán link playlist YouTube
- [ ] Videos có được thêm vào không?

#### 5.7. Quản Lý Playlist
- [ ] Click nút ⚙️
- [ ] Modal có mở không?
- [ ] Danh sách video có hiển thị không?

#### 5.8. Gộp Playlist
- [ ] Click nút 🔗
- [ ] Chọn 2 playlist
- [ ] Nhập tên mới
- [ ] Có gộp thành công không?

#### 5.9. Sắp Xếp
- [ ] Click nút 🔄
- [ ] Kéo thả video
- [ ] Thứ tự có thay đổi không?

#### 5.10. Recovery
- [ ] Click nút 🔧
- [ ] Xem thông báo
- [ ] Có sửa được lỗi không?

## 🐛 Các Lỗi Thường Gặp

### Lỗi 1: "Chưa có bài luyện nào"
**Nguyên nhân:**
- Dữ liệu bị filter nhầm
- Thiếu VideoID
- isPlaylistMarker = true cho tất cả items

**Cách fix:**
1. Click nút 🐛 để xem debug info
2. Nếu "Total items" > 0 nhưng "After filtering" = 0:
   - Có thể tất cả items đều là markers
   - Hoặc thiếu VideoID
3. Click nút 🔧 Recovery để sửa

### Lỗi 2: Video Không Load
**Nguyên nhân:**
- Thiếu videoId
- URL không hợp lệ

**Cách fix:**
1. Mở Console (F12)
2. Xem lỗi khi click video
3. Kiểm tra item có videoId không

### Lỗi 3: Tính Năng Không Hoạt Động
**Nguyên nhân:**
- Lỗi JavaScript
- Thiếu function

**Cách fix:**
1. Mở Console (F12)
2. Xem lỗi màu đỏ
3. Chụp ảnh và báo developer

## 📊 Kết Quả Test

### Dữ Liệu
- [ ] ✅ Load từ Supabase thành công
- [ ] ✅ Hiển thị đúng số lượng
- [ ] ✅ Hiển thị danh sách video

### Tính Năng Cơ Bản
- [ ] ✅ Tìm kiếm video
- [ ] ✅ Click vào video
- [ ] ✅ Đổi tên video

### Tính Năng Playlist
- [ ] ✅ Tạo playlist mới
- [ ] ✅ Thêm video vào playlist
- [ ] ✅ Rời khỏi playlist
- [ ] ✅ Đổi tên playlist
- [ ] ✅ Xóa playlist

### Tính Năng Nâng Cao
- [ ] ✅ Import YouTube playlist
- [ ] ✅ Quản lý playlist
- [ ] ✅ Gộp playlist
- [ ] ✅ Sắp xếp video
- [ ] ✅ Drag & drop

### Debug Tools
- [ ] ✅ Nút 🐛 Debug hoạt động
- [ ] ✅ Nút 🔧 Recovery hoạt động
- [ ] ✅ Console log đầy đủ

## 📝 Ghi Chú

### Console Logs Quan Trọng
```
☁️ Loaded from Supabase: { dictationPlaylist: X }
=== RENDER PLAYLIST DEBUG ===
Total items from checkAndRecoverPlaylistData: X
After filtering markers: Y
```

### Cấu Trúc Dữ Liệu Đúng
```javascript
{
  id: 1234567890,
  videoId: "abc123",        // BẮT BUỘC để hiển thị
  url: "https://...",
  title: "Tên video",
  transcript: "...",
  totalCount: 50,
  completedCount: 10,
  lastIndex: 9,
  playlist: "Tên Playlist", // Optional
  isPlaylistMarker: false   // Phải là false hoặc undefined
}
```

## 🚨 Báo Lỗi

Nếu gặp lỗi, hãy cung cấp:
1. ✅ Ảnh chụp popup Debug (nút 🐛)
2. ✅ Ảnh chụp Console (F12)
3. ✅ Mô tả chi tiết lỗi
4. ✅ Các bước tái hiện lỗi

---

**Cập nhật:** 2025-05-07
**Phiên bản:** 1.0
