# ✅ Checklist Test Nhanh - Trang Nghe Chép Mobile

## 📱 Cách test nhanh trên Chrome

1. Nhấn `F12` (mở DevTools)
2. Nhấn `Ctrl + Shift + M` (chế độ mobile)
3. Chọn "iPhone 12 Pro" (390px)
4. Vào trang **Nghe chép** (🎧)

## ✅ Checklist (5 phút)

### 1. Layout Tổng thể
- [ ] Playlist hiển thị ở đầu trang
- [ ] Setup card ở giữa
- [ ] Video player ở dưới
- [ ] Không có scroll ngang
- [ ] Không có text bị tràn

### 2. Setup Card
- [ ] Input YouTube link: Full width
- [ ] Button "Tải video": Full width, dễ bấm
- [ ] Button "🤖 AI": Full width, dễ bấm
- [ ] Button "✏️ Manual": Full width, dễ bấm
- [ ] Button "🔑 API": Full width, dễ bấm
- [ ] Textarea transcript: Dễ nhập, font 14px
- [ ] Button "▶ Bắt đầu": Full width, dễ bấm
- [ ] Button "↺ Làm lại": Full width, dễ bấm

### 3. YouTube Player
- [ ] Tỷ lệ 16:9
- [ ] Full width
- [ ] Min height 200px
- [ ] Không bị méo

### 4. Exercise Panel
- [ ] Play button: 44x44px, dễ bấm
- [ ] Navigation buttons: Dễ bấm
- [ ] Textarea: Font 16px, padding 16px
- [ ] Button "Kiểm tra": Dễ bấm
- [ ] Feedback: Rõ ràng, dễ đọc

### 5. Playlist
- [ ] Header wrap xuống dòng
- [ ] Buttons ➕ và 📺: Dễ bấm
- [ ] Items: Layout dọc
- [ ] Thumbnail: Full width, 16:9
- [ ] Title: Hiển thị đầy đủ (không cắt)
- [ ] Buttons ✏️ và 🗑️: Dễ bấm

### 6. Interactions
- [ ] Click collapse playlist: Hoạt động
- [ ] Click vào video: Load đúng
- [ ] Edit title: Inline edit hoạt động
- [ ] Delete video: Confirm dialog hiện
- [ ] Play video: Hoạt động
- [ ] Nhập câu trả lời: Keyboard không che
- [ ] Kiểm tra đáp án: Feedback rõ ràng

### 7. Typography
- [ ] Font size: 13-16px (dễ đọc)
- [ ] Line height: Thoải mái
- [ ] Contrast: Tốt
- [ ] Text: Không bị cắt

### 8. Touch Targets
- [ ] Tất cả buttons: Min 44x44px
- [ ] Input fields: Padding lớn
- [ ] Tap targets: Rõ ràng
- [ ] Không có elements quá nhỏ

## 🎯 Test Workflow Hoàn chỉnh

### Scenario: Luyện nghe một video YouTube

1. **Mở trang Nghe chép**
   - [ ] Layout hiển thị đúng

2. **Nhập link YouTube**
   - [ ] Input dễ nhập
   - [ ] Button "Tải video" dễ bấm

3. **Tải video**
   - [ ] Video hiển thị đúng tỷ lệ 16:9
   - [ ] Không bị méo

4. **Trích transcript (AI hoặc Manual)**
   - [ ] Button AI dễ bấm
   - [ ] Status message rõ ràng
   - [ ] Textarea dễ nhập

5. **Bắt đầu luyện**
   - [ ] Button dễ bấm
   - [ ] Exercise panel hiển thị đúng

6. **Nghe và nhập câu trả lời**
   - [ ] Play button dễ bấm
   - [ ] Textarea font 16px (không zoom iOS)
   - [ ] Keyboard không che nội dung

7. **Kiểm tra đáp án**
   - [ ] Button dễ bấm
   - [ ] Feedback rõ ràng

8. **Lưu vào playlist**
   - [ ] Video tự động lưu
   - [ ] Hiển thị trong playlist

9. **Quản lý playlist**
   - [ ] Click vào video: Load đúng
   - [ ] Edit title: Hoạt động
   - [ ] Delete: Có confirm

## 📊 Kết quả

### ✅ Pass (Tất cả hoạt động tốt)
- Tất cả checklist items đều pass
- Không có lỗi
- UX mượt mà

### ⚠️ Warning (Có vấn đề nhỏ)
- Ghi chú vấn đề:
  - [ ] _______________________
  - [ ] _______________________

### ❌ Fail (Có lỗi nghiêm trọng)
- Ghi chú lỗi:
  - [ ] _______________________
  - [ ] _______________________

## 🚀 Kết luận

- [ ] **PASS** - Sẵn sàng sử dụng trên mobile
- [ ] **NEED FIX** - Cần sửa một số vấn đề
- [ ] **FAIL** - Cần làm lại

---

**Tested by:** _____________  
**Date:** _____________  
**Device:** _____________  
**Status:** _____________
