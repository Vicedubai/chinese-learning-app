# 🧪 TEST KHẢ NĂNG ĐỒNG BỘ DỮ LIỆU

## 📋 OVERVIEW

Hệ thống có 3 cơ chế đồng bộ dữ liệu:

1. **LocalStorage** - Lưu trữ cục bộ (tất cả người dùng)
2. **User Settings (Supabase)** - Lưu trữ cá nhân (người dùng đã đăng nhập)
3. **CloudSync (Supabase)** - Đồng bộ toàn cục (Admin only)

---

## 🔍 TEST 1: LOCALSTORAGE SYNC

### Mục đích
Kiểm tra xem dữ liệu có được lưu vào localStorage không

### Cách test
```
1. Mở app (không cần đăng nhập)
2. Thêm một cuốn sách (PDF hoặc tạo thủ công)
3. Mở Console (F12)
4. Chạy: localStorage.getItem('books')
5. ✅ Nên thấy JSON array với sách vừa thêm
```

### Kiểm tra chi tiết
```javascript
// Mở Console (F12) và chạy:

// 1. Kiểm tra books
console.log('Books:', JSON.parse(localStorage.getItem('books')));

// 2. Kiểm tra chapters
console.log('Chapters:', JSON.parse(localStorage.getItem('chapters')));

// 3. Kiểm tra cards
console.log('Cards:', JSON.parse(localStorage.getItem('cards')));

// 4. Kiểm tra dictation playlist
console.log('Dictation:', JSON.parse(localStorage.getItem('dictationPlaylist')));

// 5. Kiểm tra progress
console.log('Progress:', JSON.parse(localStorage.getItem('progress')));

// 6. Kiểm tra session
console.log('Session:', JSON.parse(localStorage.getItem('session')));

// 7. Kiểm tra timestamp
console.log('Local saved at:', new Date(JSON.parse(localStorage.getItem('local_saved_at'))));
```

### Expected Output
```
Books: [
  { id: "abc123", title: "Tiếng Trung Cơ Bản", numPages: 50 }
]
Chapters: [
  { id: "def456", bookId: "abc123", title: "Bài 1", ... }
]
Cards: [
  { id: "ghi789", chapterId: "def456", chinese: "你好", ... }
]
Progress: { xp: 100, streak: 5, ... }
```

---

## 🔐 TEST 2: USER SETTINGS SYNC (Đã đăng nhập)

### Mục đích
Kiểm tra xem dữ liệu có được đồng bộ lên Supabase không

### Cách test
```
1. Đăng nhập vào app
2. Thêm một cuốn sách
3. Mở Console (F12)
4. Chạy: State.sync()
5. ✅ Nên thấy toast "✅ Đã đồng bộ tiến trình học lên Supabase"
```

### Kiểm tra chi tiết
```javascript
// Mở Console (F12) và chạy:

// 1. Kiểm tra user hiện tại
const user = await DBClient.getCurrentUser();
console.log('Current user:', user);

// 2. Kiểm tra Supabase client
const client = DBClient.getClient();
console.log('Supabase client:', client ? '✅ Connected' : '❌ Not connected');

// 3. Thực hiện sync
await State.sync();

// 4. Kiểm tra dữ liệu trên Supabase
const { data, error } = await client
  .from('user_settings')
  .select('*')
  .eq('user_id', user.id)
  .single();
console.log('User settings on Supabase:', data);
```

### Expected Output
```
Current user: { id: "user123", email: "user@example.com", ... }
Supabase client: ✅ Connected
User settings on Supabase: {
  user_id: "user123",
  settings: {
    books: [...],
    chapters: [...],
    cards: [...],
    progress: {...}
  }
}
```

---

## ☁️ TEST 3: CLOUDSYNC (Admin only)

### Mục đích
Kiểm tra xem Admin có thể đồng bộ dữ liệu toàn cục không

### Cách test
```
1. Đăng nhập với tài khoản Admin
2. Vào 📚 Giáo trình
3. Tìm nút "☁️ Đẩy toàn bộ lên Supabase"
4. Click nút
5. ✅ Nên thấy toast "✅ Đồng bộ xong! X sách · Y bài · Z từ vựng"
```

### Kiểm tra chi tiết
```javascript
// Mở Console (F12) và chạy:

// 1. Kiểm tra xem có phải Admin không
const isAdmin = await DBClient.isAdmin();
console.log('Is admin:', isAdmin);

// 2. Thực hiện push global data
const result = await CloudSync.pushGlobalData();
console.log('Push result:', result);

// 3. Kiểm tra dữ liệu trên Supabase
const { data, error } = await DBClient.getClient()
  .from('chapters')
  .select('vocab')
  .eq('id', 'global_content_v1')
  .single();
console.log('Global data on Supabase:', data?.vocab);
```

### Expected Output
```
Is admin: true
Push result: true
Global data on Supabase: {
  books: [...],
  chapters: [...],
  cards: [...],
  version: 3,
  pushedAt: 1234567890
}
```

---

## 🔄 TEST 4: AUTO-SYNC

### Mục đích
Kiểm tra xem tự động đồng bộ có hoạt động không

### Cách test
```
1. Đăng nhập vào app
2. Thêm một cuốn sách
3. Chờ 10 giây
4. ✅ Nên thấy toast "✅ Đã đồng bộ tiến trình học lên Supabase"
```

### Kiểm tra chi tiết
```javascript
// Mở Console (F12) và chạy:

// 1. Kiểm tra trạng thái auto-sync
console.log('AutoSync enabled:', AutoSync.enabled);
console.log('AutoSync has changes:', AutoSync.hasChanges);

// 2. Kiểm tra lần sync cuối
console.log('Last sync time:', new Date(AutoSync.lastSyncTime));

// 3. Thực hiện sync thủ công
await AutoSync.syncToServer();

// 4. Kiểm tra trạng thái
console.log('Is syncing:', AutoSync.isSyncing);
```

### Expected Output
```
AutoSync enabled: true
AutoSync has changes: false (sau khi sync)
Last sync time: 2025-01-XX 14:30:45
Is syncing: false
```

---

## 🔀 TEST 5: MERGE DATA

### Mục đích
Kiểm tra xem merge dữ liệu từ server có hoạt động đúng không

### Cách test
```
1. Đăng nhập vào app
2. Thêm một cuốn sách (Local)
3. Mở tab khác, thêm cuốn sách khác (Server)
4. Quay lại tab đầu
5. ✅ Nên thấy cả 2 cuốn sách
```

### Kiểm tra chi tiết
```javascript
// Mở Console (F12) và chạy:

// 1. Kiểm tra số lượng books trước merge
console.log('Books before merge:', State.books.length);

// 2. Thực hiện merge
await AutoSync.loadFromServer();

// 3. Kiểm tra số lượng books sau merge
console.log('Books after merge:', State.books.length);

// 4. Kiểm tra chi tiết
console.log('All books:', State.books);
```

### Expected Output
```
Books before merge: 1
Books after merge: 2
All books: [
  { id: "abc123", title: "Sách 1", ... },
  { id: "def456", title: "Sách 2", ... }
]
```

---

## 🧪 TEST 6: PULL GLOBAL DATA

### Mục đích
Kiểm tra xem có thể tải dữ liệu toàn cục từ Supabase không

### Cách test
```
1. Đăng nhập vào app
2. Vào 📚 Giáo trình
3. Tìm nút "⬇️ Tải từ Supabase"
4. Click nút
5. ✅ Nên thấy toast "☁️ Đã tải: X sách · Y bài · Z từ vựng"
```

### Kiểm tra chi tiết
```javascript
// Mở Console (F12) và chạy:

// 1. Kiểm tra số lượng books trước pull
console.log('Books before pull:', State.books.length);

// 2. Thực hiện pull
const result = await CloudSync.pullGlobalData();
console.log('Pull result:', result);

// 3. Kiểm tra số lượng books sau pull
console.log('Books after pull:', State.books.length);

// 4. Kiểm tra chi tiết
console.log('All books:', State.books);
```

### Expected Output
```
Books before pull: 0
Pull result: true
Books after pull: 5
All books: [
  { id: "abc123", title: "Sách 1", ... },
  ...
]
```

---

## ⚠️ TEST 7: CONFLICT RESOLUTION

### Mục đích
Kiểm tra xem hệ thống xử lý xung đột dữ liệu như thế nào

### Cách test
```
1. Đăng nhập vào app
2. Thêm một cuốn sách (Local)
3. Mở tab khác, xóa cuốn sách đó (Server)
4. Quay lại tab đầu
5. ✅ Nên hỏi xác nhận trước khi ghi đè
```

### Kiểm tra chi tiết
```javascript
// Mở Console (F12) và chạy:

// 1. Kiểm tra timestamp
const localSavedAt = DB.get('local_saved_at', 0);
const cloudPushedAt = 1234567890; // Từ server
console.log('Local saved at:', new Date(localSavedAt));
console.log('Cloud pushed at:', new Date(cloudPushedAt));

// 2. Kiểm tra xem local có mới hơn không
console.log('Local is newer:', localSavedAt > cloudPushedAt);

// 3. Thực hiện pull (nên hỏi xác nhận)
const result = await CloudSync.pullGlobalData(false);
```

### Expected Output
```
Local saved at: 2025-01-XX 14:30:45
Cloud pushed at: 2025-01-XX 14:20:00
Local is newer: true
(Nên hiển thị dialog xác nhận)
```

---

## 🔗 TEST 8: CONNECTION TEST

### Mục đích
Kiểm tra xem kết nối Supabase có hoạt động không

### Cách test
```
1. Mở Console (F12)
2. Chạy: AutoSync.testConnection()
3. ✅ Nên thấy toast "✅ Kết nối backend thành công!"
```

### Kiểm tra chi tiết
```javascript
// Mở Console (F12) và chạy:

// 1. Kiểm tra Supabase client
const client = DBClient.getClient();
console.log('Supabase client:', client ? '✅ Connected' : '❌ Not connected');

// 2. Kiểm tra URL
console.log('Supabase URL:', SUPABASE_URL);

// 3. Thực hiện test connection
const result = await AutoSync.testConnection();
console.log('Connection test result:', result);

// 4. Kiểm tra backend
const backendUrl = window.API_BASE_URL;
console.log('Backend URL:', backendUrl);
```

### Expected Output
```
Supabase client: ✅ Connected
Supabase URL: https://kangjlimeanujfpjissp.supabase.co
Connection test result: true
Backend URL: https://chinese-learning-app-production.up.railway.app
```

---

## 📊 TEST 9: DATA INTEGRITY

### Mục đích
Kiểm tra xem dữ liệu có bị mất hoặc hỏng không

### Cách test
```
1. Thêm 10 cuốn sách
2. Thêm 50 từ vựng
3. Đăng nhập
4. Chờ đồng bộ
5. Đăng xuất
6. Đăng nhập lại
7. ✅ Nên thấy tất cả 10 sách và 50 từ vựng
```

### Kiểm tra chi tiết
```javascript
// Mở Console (F12) và chạy:

// 1. Kiểm tra số lượng trước
console.log('Books:', State.books.length);
console.log('Chapters:', State.chapters.length);
console.log('Cards:', State.cards.length);

// 2. Đăng xuất
await Auth.logout();

// 3. Đăng nhập lại
await Auth.login(email, password);

// 4. Kiểm tra số lượng sau
console.log('Books after relogin:', State.books.length);
console.log('Chapters after relogin:', State.chapters.length);
console.log('Cards after relogin:', State.cards.length);

// 5. Kiểm tra xem có bị mất dữ liệu không
console.log('Data integrity:', 
  State.books.length === 10 && 
  State.cards.length === 50 ? '✅ OK' : '❌ FAILED'
);
```

### Expected Output
```
Books: 10
Chapters: 20
Cards: 50
Books after relogin: 10
Chapters after relogin: 20
Cards after relogin: 50
Data integrity: ✅ OK
```

---

## 🚨 TEST 10: ERROR HANDLING

### Mục đích
Kiểm tra xem hệ thống xử lý lỗi như thế nào

### Cách test
```
1. Tắt internet
2. Thêm một cuốn sách
3. Bật internet lại
4. ✅ Nên tự động đồng bộ
```

### Kiểm tra chi tiết
```javascript
// Mở Console (F12) và chạy:

// 1. Kiểm tra error handling
try {
  await State.sync();
} catch (error) {
  console.error('Sync error:', error);
}

// 2. Kiểm tra retry logic
console.log('Has changes:', AutoSync.hasChanges);
console.log('Is syncing:', AutoSync.isSyncing);

// 3. Thực hiện retry
await AutoSync.syncToServer();
```

### Expected Output
```
Sync error: (nếu có lỗi)
Has changes: false (sau khi sync thành công)
Is syncing: false
```

---

## ✅ CHECKLIST

### LocalStorage
- [ ] Books lưu vào localStorage
- [ ] Chapters lưu vào localStorage
- [ ] Cards lưu vào localStorage
- [ ] Progress lưu vào localStorage
- [ ] Session lưu vào localStorage

### User Settings (Supabase)
- [ ] Dữ liệu đồng bộ lên Supabase
- [ ] Dữ liệu tải từ Supabase
- [ ] Merge dữ liệu hoạt động
- [ ] Conflict resolution hoạt động
- [ ] Auto-sync hoạt động

### CloudSync (Admin)
- [ ] Admin có thể push dữ liệu
- [ ] Admin có thể pull dữ liệu
- [ ] Dữ liệu toàn cục lưu đúng
- [ ] Payload size hợp lý

### Data Integrity
- [ ] Không mất dữ liệu
- [ ] Không hỏng dữ liệu
- [ ] Timestamp chính xác
- [ ] Version control hoạt động

### Error Handling
- [ ] Xử lý lỗi kết nối
- [ ] Xử lý timeout
- [ ] Retry logic hoạt động
- [ ] Toast notification hiển thị

---

## 🎯 EXPECTED RESULTS

### ✅ PASS
- Tất cả dữ liệu được lưu vào localStorage
- Dữ liệu đồng bộ lên Supabase thành công
- Dữ liệu tải từ Supabase thành công
- Merge dữ liệu hoạt động đúng
- Không mất dữ liệu
- Error handling hoạt động

### ❌ FAIL
- Dữ liệu không được lưu
- Đồng bộ thất bại
- Dữ liệu bị mất
- Merge không hoạt động
- Error không được xử lý

---

## 📝 NOTES

### Cơ chế đồng bộ
1. **LocalStorage**: Lưu trữ cục bộ (tất cả)
2. **User Settings**: Lưu trữ cá nhân (đã đăng nhập)
3. **CloudSync**: Lưu trữ toàn cục (Admin)

### Timestamp
- `local_saved_at`: Lần lưu cuối cùng vào localStorage
- `pushedAt`: Lần push cuối cùng lên Supabase
- `timestamp`: Lần sync cuối cùng

### Conflict Resolution
- Nếu local mới hơn cloud → giữ local
- Nếu cloud mới hơn local → hỏi xác nhận
- Nếu user pull thủ công → luôn lấy cloud

---

_Last Updated: 2025-01-XX_
_Version: 1.0_
_Status: Ready for Testing_
