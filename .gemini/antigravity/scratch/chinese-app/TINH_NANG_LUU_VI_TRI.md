# 💾 TÍNH NĂNG LƯU VỊ TRÍ TRANG

## ✨ TÍNH NĂNG MỚI

Khi refresh trang (F5), app sẽ:
- ✅ **Giữ nguyên trang hiện tại** (không quay về Dashboard)
- ✅ **Giữ nguyên vị trí scroll** (không quay về đầu trang)
- ✅ **Khôi phục session** (flashcard, bài tập đang làm...)

---

## 🎯 CÁCH HOẠT ĐỘNG

### 1. Lưu vị trí khi chuyển trang
```javascript
// Khi user click vào trang khác
navigate('flashcards')
  ↓
Lưu scroll position của trang hiện tại
  ↓
Lưu tên trang mới vào sessionStorage
  ↓
Chuyển sang trang mới
```

### 2. Khôi phục khi reload
```javascript
// Khi user nhấn F5
Page reload
  ↓
Đọc trang đã lưu từ sessionStorage
  ↓
Navigate đến trang đó
  ↓
Khôi phục scroll position
```

---

## 📊 DỮ LIỆU LƯU TRỮ

### SessionStorage:
```javascript
{
  "currentPage": "dictation",           // Trang hiện tại
  "scroll-dashboard": "0",              // Vị trí scroll của Dashboard
  "scroll-library": "450",              // Vị trí scroll của Library
  "scroll-flashcards": "0",             // Vị trí scroll của Flashcards
  "scroll-dictation": "1200",           // Vị trí scroll của Dictation
  "scroll-mini-tests": "300",           // Vị trí scroll của Bài tập
  "scroll-writing": "0",                // Vị trí scroll của Thi viết
  "scroll-chat": "800",                 // Vị trí scroll của Chat
  "scroll-diagnostic": "0",             // Vị trí scroll của Chẩn đoán
  "scroll-settings": "0"                // Vị trí scroll của Settings
}
```

### LocalStorage (Session data):
```javascript
{
  "session": {
    "currentTask": "flashcard",         // Task đang làm
    "flashcardIndex": 5,                // Thẻ thứ 5
    "flashcardQueue": [...],            // Danh sách thẻ
    "exerciseIndex": 3,                 // Câu hỏi thứ 3
    "exerciseQueue": [...],             // Danh sách câu hỏi
    ...
  }
}
```

---

## 🔄 FLOW HOÀN CHỈNH

### Scenario 1: User đang học Flashcard
```
1. User vào trang Flashcards
2. Đang ở thẻ thứ 5/10
3. Scroll xuống xem thông tin
4. Nhấn F5 (reload)
   ↓
5. App khôi phục:
   - Trang Flashcards
   - Thẻ thứ 5/10
   - Vị trí scroll
6. User tiếp tục học từ thẻ thứ 5
```

### Scenario 2: User đang tìm video YouTube
```
1. User vào trang Nghe chép
2. Tìm kiếm "học tiếng trung"
3. Scroll xuống xem video thứ 8
4. Nhấn F5 (reload)
   ↓
5. App khôi phục:
   - Trang Nghe chép
   - Vị trí scroll (video thứ 8)
   - Kết quả tìm kiếm (nếu có cache)
6. User tiếp tục xem video
```

### Scenario 3: User đang làm bài tập
```
1. User vào trang Bài tập
2. Đang làm câu 7/10
3. Nhấn F5 (reload)
   ↓
4. App khôi phục:
   - Trang Bài tập
   - Câu hỏi thứ 7/10
   - Đáp án đã chọn
5. User tiếp tục làm từ câu 7
```

---

## 💡 ƯU ĐIỂM

### 1. UX tốt hơn
- ✅ Không mất tiến độ khi reload
- ✅ Không phải scroll lại từ đầu
- ✅ Không phải tìm lại trang

### 2. Tiết kiệm thời gian
- ✅ Không phải navigate lại
- ✅ Không phải tìm lại vị trí
- ✅ Tiếp tục ngay từ chỗ dừng

### 3. Tránh mất dữ liệu
- ✅ Session được lưu
- ✅ Tiến độ được lưu
- ✅ Input được lưu

---

## 🔧 KỸ THUẬT

### SessionStorage vs LocalStorage

| Feature | SessionStorage | LocalStorage |
|---------|---------------|--------------|
| **Thời gian** | Đóng tab = mất | Vĩnh viễn |
| **Dùng cho** | Trang hiện tại, scroll | Session, tiến độ |
| **Kích thước** | ~5MB | ~10MB |
| **API** | Giống nhau | Giống nhau |

### Tại sao dùng SessionStorage cho scroll?
- ✅ Mỗi tab độc lập
- ✅ Đóng tab = reset (đúng behavior)
- ✅ Không lưu vĩnh viễn (không cần thiết)

### Tại sao dùng LocalStorage cho session?
- ✅ Giữ tiến độ khi đóng tab
- ✅ Tiếp tục học sau khi tắt browser
- ✅ Đồng bộ giữa các tab (nếu cần)

---

## 🐛 XỬ LÝ EDGE CASES

### Case 1: User mở tab mới
```
Tab 1: Đang ở trang Flashcards
User mở Tab 2 (Ctrl + T)
  ↓
Tab 2: Bắt đầu từ Dashboard (đúng)
SessionStorage của Tab 2 = rỗng
```

### Case 2: User đóng tab rồi mở lại
```
User đóng tab
  ↓
SessionStorage = mất
LocalStorage = còn
  ↓
Mở lại: Bắt đầu từ Dashboard
Nhưng session (flashcard, bài tập) vẫn còn
```

### Case 3: User clear cache
```
User clear cache
  ↓
SessionStorage = mất
LocalStorage = mất
  ↓
Mở lại: Bắt đầu từ đầu (đúng)
```

---

## 📈 TƯƠNG LAI

### Cải tiến tiếp theo:
- [ ] Lưu kết quả tìm kiếm YouTube (cache)
- [ ] Lưu input đang nhập (draft)
- [ ] Lưu filter/sort settings
- [ ] Sync scroll position giữa các tab
- [ ] Undo/Redo navigation

### Đề xuất:
- [ ] Thêm nút "Quay về vị trí trước"
- [ ] Hiển thị breadcrumb navigation
- [ ] Keyboard shortcuts (Alt + ←/→)

---

## 🎉 KẾT QUẢ

Bây giờ users có thể:
- ✅ Reload trang bất cứ lúc nào
- ✅ Không mất tiến độ
- ✅ Không mất vị trí scroll
- ✅ Tiếp tục ngay từ chỗ dừng

**UX cải thiện đáng kể!** 🚀

---

_Cập nhật: 2025-01-XX_
_Phiên bản: 3.1_
_Tác giả: Kiro AI Assistant_
