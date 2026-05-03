# 💾 HƯỚNG DẪN BACKUP BẰNG FILE

## ⚠️ Tại sao dùng File Backup?

Do Railway backend gặp vấn đề kết nối, chúng ta tạm thời dùng **File Backup** để đồng bộ dữ liệu giữa các thiết bị.

**Ưu điểm:**
- ✅ Đơn giản, dễ dùng
- ✅ Không cần internet
- ✅ Không phụ thuộc server
- ✅ An toàn 100%

---

## 📤 CÁCH XUẤT DỮ LIỆU

### Trên máy tính/điện thoại hiện tại:

1. **Mở app** → Sidebar
2. **Click "💾 Xuất file"**
3. File `.json` sẽ được tải về (tên: `tiengtrung-backup-2024-XX-XX.json`)
4. **Lưu file vào:**
   - Google Drive
   - Dropbox
   - OneDrive
   - Email cho chính mình
   - USB

---

## 📥 CÁCH NHẬP DỮ LIỆU

### Trên máy tính/điện thoại mới:

**Cách 1: Kéo thả**
1. Mở app
2. Kéo file `.json` vào cửa sổ trình duyệt
3. Xong!

**Cách 2: Click nút**
1. Mở app → Sidebar
2. Click **"📥 Nhập file"**
3. Chọn file `.json`
4. Xong!

---

## 🔄 ĐỒNG BỘ GIỮA CÁC THIẾT BỘ

### Ví dụ: Từ máy tính → điện thoại

**Bước 1: Trên máy tính**
1. Xuất file backup
2. Gửi file qua:
   - Email
   - Telegram/Zalo (gửi cho chính mình)
   - Google Drive
   - AirDrop (iPhone/Mac)

**Bước 2: Trên điện thoại**
1. Tải file về
2. Mở app
3. Nhập file backup
4. Xong!

---

## 📅 LỊCH BACKUP KHUYẾN NGHỊ

### Hàng ngày (nếu học nhiều)
- Xuất file sau mỗi buổi học
- Lưu vào Google Drive

### Hàng tuần (nếu học ít)
- Xuất file cuối tuần
- Lưu vào nhiều nơi (Drive + Email)

### Trước khi xóa cache/app
- **BẮT BUỘC** xuất file trước
- Nếu không sẽ **MẤT HẾT DỮ LIỆU**

---

## 🗂️ TỔ CHỨC FILE BACKUP

### Đặt tên file rõ ràng

Ví dụ:
```
tiengtrung-backup-2024-05-03.json
tiengtrung-backup-tuan-18.json
tiengtrung-backup-truoc-thi.json
```

### Cấu trúc thư mục Google Drive

```
📁 Học Tiếng Trung/
  📁 Backups/
    📄 2024-05-03.json
    📄 2024-04-26.json
    📄 2024-04-19.json
  📁 PDF Giáo trình/
  📁 Ghi chú/
```

---

## ⚠️ LƯU Ý QUAN TRỌNG

### ✅ NÊN:
- Xuất file thường xuyên
- Lưu ở nhiều nơi (Drive + Email)
- Đặt tên file có ngày tháng
- Giữ 3-5 file backup gần nhất

### ❌ KHÔNG NÊN:
- Chỉ lưu 1 file duy nhất
- Lưu trên máy không backup
- Quên xuất file trước khi xóa cache
- Chia sẻ file backup (có thể chứa thông tin cá nhân)

---

## 🔍 KIỂM TRA DỮ LIỆU TRONG FILE

File backup là JSON, có thể mở bằng:
- Notepad
- VS Code
- Trình duyệt

**Cấu trúc:**
```json
{
  "version": 2,
  "exportedAt": "2024-05-03T10:30:00.000Z",
  "chapters": [...],  // Các chương đã nhập
  "cards": [...],     // Flashcards
  "progress": {       // Tiến độ học
    "xp": 1250,
    "streak": 7,
    "results": [...]
  }
}
```

---

## 🆘 XỬ LÝ LỖI

### Lỗi: "File không hợp lệ"

**Nguyên nhân:**
- File bị hỏng
- Không phải file backup của app

**Cách sửa:**
- Thử file backup khác
- Kiểm tra file có đúng định dạng JSON không

### Lỗi: "Không thể import"

**Nguyên nhân:**
- File quá lớn
- Trình duyệt hết bộ nhớ

**Cách sửa:**
- Đóng các tab khác
- Restart trình duyệt
- Thử trên máy khác

---

## 💡 MẸO HAY

### 1. Tự động backup với Google Drive

**Trên máy tính:**
- Cài Google Drive Desktop
- Xuất file vào thư mục Google Drive
- Tự động sync lên cloud

### 2. Backup nhanh qua Email

- Xuất file
- Gửi email cho chính mình
- Có thể truy cập từ mọi thiết bị

### 3. Backup định kỳ

Đặt lịch nhắc nhở:
- Thứ 7 hàng tuần: Xuất backup
- Cuối tháng: Kiểm tra và dọn dẹp file cũ

---

## 🔮 TƯƠNG LAI

Khi Railway backend hoạt động trở lại:
- Sẽ bật auto-sync
- Vẫn giữ tính năng file backup
- Có thể dùng cả 2 phương pháp

---

## ✅ CHECKLIST

Trước khi đóng app:
- [ ] Đã xuất file backup?
- [ ] Đã lưu vào Google Drive?
- [ ] Đã kiểm tra file có mở được không?

Trước khi xóa cache/app:
- [ ] **BẮT BUỘC** xuất file backup
- [ ] Lưu ở 2 nơi khác nhau
- [ ] Test import trên thiết bị khác

---

**Lưu ý:** Dữ liệu học tập rất quý giá! Hãy backup thường xuyên! 💪
