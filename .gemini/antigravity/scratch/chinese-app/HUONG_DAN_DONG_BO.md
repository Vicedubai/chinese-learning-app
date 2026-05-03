# ☁️ HƯỚNG DẪN ĐỒNG BỘ DỮ LIỆU

## Tại sao cần đồng bộ?

- 📱 Học trên nhiều thiết bị (máy tính, điện thoại, tablet)
- 🔄 Không mất dữ liệu khi xóa cache trình duyệt
- 💾 Backup an toàn tiến độ học tập

---

## 🚀 CÁCH 1: Đồng bộ Online (Khuyến nghị)

### Bước 1: Lấy API Key miễn phí

1. Truy cập: **https://jsonbin.io**
2. Đăng ký tài khoản miễn phí
3. Vào **Dashboard → API Keys**
4. Copy **Master Key** (dạng: `$2a$10...`)

### Bước 2: Cài đặt trong ứng dụng

1. Click nút **⚙️** (bên cạnh "☁️ Lưu cloud") ở sidebar
2. Dán **API Key** vào ô "JSONBin Master Key"
3. **Để trống** ô "Bin ID" (sẽ tự động tạo khi lưu lần đầu)
4. Click **Lưu**

### Bước 3: Lưu dữ liệu lên cloud

1. Click nút **"☁️ Lưu cloud"** ở sidebar
2. Đợi thông báo "☁️ Đã lưu online thành công!"
3. **Bin ID** sẽ hiển thị trong cài đặt (lưu lại để dùng trên thiết bị khác)

### Bước 4: Tải dữ liệu trên thiết bị khác

1. Mở ứng dụng trên thiết bị mới
2. Click **⚙️** → Nhập **API Key** và **Bin ID** (giống máy cũ)
3. Click **"⬇️ Tải cloud"**
4. Tất cả dữ liệu sẽ được đồng bộ!

---

## 💾 CÁCH 2: Backup File (Dự phòng)

### Xuất file backup

1. Click **"💾 Xuất file backup"** ở sidebar
2. File `.json` sẽ được tải về máy
3. Lưu vào Google Drive/Dropbox để an toàn

### Nhập file backup

1. Kéo thả file `.json` vào ứng dụng
2. Hoặc click vào vùng upload và chọn file
3. Dữ liệu sẽ được khôi phục

---

## 📊 Dữ liệu được đồng bộ

✅ Tất cả flashcards và tiến độ ôn tập  
✅ Các chương đã nhập (từ vựng, pinyin, nghĩa)  
✅ Link YouTube đã luyện nghe  
✅ Điểm XP và cấp độ  
✅ Lịch sử làm bài tập  
✅ Cài đặt cá nhân  

❌ **KHÔNG** đồng bộ: File PDF gốc (để tiết kiệm dung lượng)

---

## ⚠️ Lưu ý quan trọng

- **API Key và Bin ID**: Giữ bí mật, không chia sẻ
- **Miễn phí**: 10,000 requests/tháng (đủ dùng)
- **Dung lượng**: Mỗi bin tối đa 100KB (đủ cho ~500 flashcards)
- **Merge thông minh**: Không ghi đè dữ liệu cũ, chỉ thêm mới

---

## 🐛 Xử lý lỗi

**"❌ Lỗi lưu online: HTTP 401"**
→ API Key sai, kiểm tra lại

**"❌ Lỗi lưu online: HTTP 404"**
→ Bin ID không tồn tại, xóa Bin ID và lưu lại để tạo mới

**"⚠️ Bộ nhớ gần đầy!"**
→ Click **"♻️ Nén dữ liệu"** để giải phóng bộ nhớ

---

## 💡 Mẹo sử dụng

- Lưu cloud **sau mỗi buổi học** để không mất dữ liệu
- Xuất file backup **hàng tuần** để dự phòng
- Dùng cùng API Key trên tất cả thiết bị để đồng bộ tự động
