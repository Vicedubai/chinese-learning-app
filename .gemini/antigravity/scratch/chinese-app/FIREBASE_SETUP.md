# 🔥 SETUP FIREBASE - ĐỒNG BỘ REAL-TIME

## Bước 1: Tạo Firebase project (2 phút)

1. Truy cập: https://console.firebase.google.com
2. **Add project**:
   - Name: `chinese-learning-app`
   - Disable Google Analytics (không cần)
3. Click **Create project**

## Bước 2: Thêm Web App

1. Click icon **</>** (Web)
2. App nickname: `Chinese Learning Web`
3. **Register app**
4. Copy **Firebase config** (giữ lại để dùng sau)

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "xxx.firebaseapp.com",
  projectId: "xxx",
  storageBucket: "xxx.appspot.com",
  messagingSenderId: "123",
  appId: "1:123:web:abc"
};
```

## Bước 3: Enable Firestore Database

1. Vào **Build → Firestore Database**
2. **Create database**
3. Chọn **Start in test mode** (cho phép read/write tự do)
4. Location: **asia-southeast1** (Singapore)

## Bước 4: Enable Authentication (Optional)

1. Vào **Build → Authentication**
2. **Get started**
3. Enable **Google** sign-in
4. Thêm email support

## Bước 5: Cài đặt trong app

Thêm vào `index.html` (trước `</body>`):

```html
<!-- Firebase SDK -->
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-auth-compat.js"></script>

<script>
// Firebase config
const firebaseConfig = {
  // Dán config từ bước 2
};
firebase.initializeApp(firebaseConfig);
</script>
```

---

## ✨ Tính năng

- ✅ **Đồng bộ tức thì**: Thay đổi trên máy A → hiện ngay trên máy B
- ✅ **Offline mode**: Vẫn dùng được khi mất mạng
- ✅ **Google login**: Đăng nhập 1 click
- ✅ **1GB storage**: Đủ cho hàng chục nghìn flashcards
- ✅ **Không giới hạn thiết bị**

---

## 🎯 Cách dùng

1. **Lần đầu**: Đăng nhập bằng Google
2. **Tự động**: Mọi thay đổi được sync ngay lập tức
3. **Thiết bị mới**: Đăng nhập cùng tài khoản Google → dữ liệu tự động tải về
