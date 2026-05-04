# 🚨 SYNC ISSUES & SOLUTIONS

## 📋 COMMON ISSUES

---

## ❌ ISSUE 1: Data Not Syncing to Supabase

### Symptoms
- Thêm dữ liệu nhưng không thấy trên Supabase
- Toast notification không hiển thị
- Console không có error

### Root Causes
1. **User chưa đăng nhập**
   - Solution: Đăng nhập trước khi thêm dữ liệu

2. **Supabase client không khởi tạo**
   - Solution: Kiểm tra `js/db-connect.js`
   - Check: `DBClient.getClient()` có return client không

3. **Auto-sync bị tắt**
   - Solution: Bật auto-sync
   - Check: `AutoSync.enabled === true`

4. **Network error**
   - Solution: Kiểm tra kết nối internet
   - Check: `await AutoSync.testConnection()`

### Debug Steps
```javascript
// 1. Kiểm tra user
const user = await DBClient.getCurrentUser();
console.log('User:', user);

// 2. Kiểm tra client
const client = DBClient.getClient();
console.log('Client:', client ? '✅' : '❌');

// 3. Kiểm tra auto-sync
console.log('AutoSync enabled:', AutoSync.enabled);
console.log('Has changes:', AutoSync.hasChanges);

// 4. Thực hiện sync thủ công
await State.sync();

// 5. Kiểm tra dữ liệu trên Supabase
const { data } = await client
  .from('user_settings')
  .select('*')
  .eq('user_id', user.id)
  .single();
console.log('Data on Supabase:', data);
```

---

## ❌ ISSUE 2: Data Lost After Logout/Login

### Symptoms
- Đăng xuất rồi đăng nhập lại, dữ liệu mất
- Chỉ có dữ liệu cũ từ Supabase
- Dữ liệu mới không được lưu

### Root Causes
1. **Dữ liệu chưa được sync trước khi logout**
   - Solution: Chờ sync hoàn tất trước logout
   - Check: `AutoSync.isSyncing === false`

2. **Merge logic không hoạt động**
   - Solution: Kiểm tra `AutoSync.mergeData()`
   - Check: Dữ liệu local có được giữ không

3. **Timestamp không chính xác**
   - Solution: Kiểm tra `local_saved_at` vs `pushedAt`
   - Check: `DB.get('local_saved_at')`

### Debug Steps
```javascript
// 1. Kiểm tra timestamp trước logout
const localSavedAt = DB.get('local_saved_at');
console.log('Local saved at:', new Date(localSavedAt));

// 2. Kiểm tra dữ liệu trước logout
console.log('Books before logout:', State.books.length);
console.log('Cards before logout:', State.cards.length);

// 3. Logout
await Auth.logout();

// 4. Login lại
await Auth.login(email, password);

// 5. Kiểm tra dữ liệu sau login
console.log('Books after login:', State.books.length);
console.log('Cards after login:', State.cards.length);

// 6. Nếu mất dữ liệu, kiểm tra merge
console.log('Merge logic:', AutoSync.mergeData);
```

---

## ❌ ISSUE 3: Orphaned Data (Dữ liệu mồ côi)

### Symptoms
- Chapters không có book
- Cards không có chapter
- Dữ liệu không nhất quán

### Root Causes
1. **Xóa book nhưng chapters vẫn tồn tại**
   - Solution: Xóa chapters khi xóa book
   - Check: `deleteBook()` function

2. **Xóa chapter nhưng cards vẫn tồn tại**
   - Solution: Xóa cards khi xóa chapter
   - Check: `deleteChapter()` function

3. **Merge data không xử lý đúng**
   - Solution: Kiểm tra `AutoSync.mergeData()`
   - Check: Có filter orphaned data không

### Debug Steps
```javascript
// 1. Tìm orphaned chapters
const orphanedChapters = State.chapters.filter(ch => 
  !State.books.find(b => b.id === ch.bookId) && ch.bookId
);
console.log('Orphaned chapters:', orphanedChapters);

// 2. Tìm orphaned cards
const orphanedCards = State.cards.filter(c => 
  !State.chapters.find(ch => ch.id === c.chapterId) && c.chapterId
);
console.log('Orphaned cards:', orphanedCards);

// 3. Xóa orphaned data
State.chapters = State.chapters.filter(ch => 
  State.books.find(b => b.id === ch.bookId) || !ch.bookId
);
State.cards = State.cards.filter(c => 
  State.chapters.find(ch => ch.id === c.chapterId) || !c.chapterId
);
State.save();
console.log('✅ Cleanup complete');
```

---

## ❌ ISSUE 4: Duplicate Data

### Symptoms
- Cùng một sách/chapter/card xuất hiện nhiều lần
- Dữ liệu bị nhân đôi sau merge
- Số lượng tăng bất thường

### Root Causes
1. **Merge logic không kiểm tra duplicate**
   - Solution: Kiểm tra ID trước khi merge
   - Check: `AutoSync.mergeData()` có filter không

2. **Push/Pull nhiều lần**
   - Solution: Kiểm tra timestamp
   - Check: `CloudSync.pushGlobalData()` được gọi bao nhiêu lần

3. **Manual data manipulation**
   - Solution: Không sửa dữ liệu trực tiếp
   - Check: Sử dụng API functions

### Debug Steps
```javascript
// 1. Tìm duplicate books
const bookIds = new Set();
const duplicateBooks = State.books.filter(b => {
  if (bookIds.has(b.id)) return true;
  bookIds.add(b.id);
  return false;
});
console.log('Duplicate books:', duplicateBooks);

// 2. Tìm duplicate chapters
const chapterIds = new Set();
const duplicateChapters = State.chapters.filter(ch => {
  if (chapterIds.has(ch.id)) return true;
  chapterIds.add(ch.id);
  return false;
});
console.log('Duplicate chapters:', duplicateChapters);

// 3. Xóa duplicates
State.books = Array.from(new Map(State.books.map(b => [b.id, b])).values());
State.chapters = Array.from(new Map(State.chapters.map(ch => [ch.id, ch])).values());
State.cards = Array.from(new Map(State.cards.map(c => [c.id, c])).values());
State.save();
console.log('✅ Duplicates removed');
```

---

## ❌ ISSUE 5: Sync Timeout

### Symptoms
- Sync mất quá lâu (>15 giây)
- Toast notification "Timeout"
- Dữ liệu không được sync

### Root Causes
1. **Payload quá lớn**
   - Solution: Giảm số lượng dữ liệu
   - Check: `CloudSync.calcSize(payload)`

2. **Network chậm**
   - Solution: Kiểm tra kết nối internet
   - Check: `await AutoSync.testConnection()`

3. **Supabase server chậm**
   - Solution: Thử lại sau
   - Check: Kiểm tra Supabase status

### Debug Steps
```javascript
// 1. Kiểm tra payload size
const payload = {
  books: State.books,
  chapters: State.chapters,
  cards: State.cards,
  dictationPlaylist: State.dictationPlaylist
};
const size = CloudSync.calcSize(payload);
console.log('Payload size:', size);

// 2. Kiểm tra network
const connectionOk = await AutoSync.testConnection();
console.log('Connection:', connectionOk ? '✅' : '❌');

// 3. Kiểm tra timeout setting
console.log('Timeout:', CloudSync.TIMEOUT_MS, 'ms');

// 4. Thử sync với timeout dài hơn
CloudSync.TIMEOUT_MS = 30000; // 30 giây
await CloudSync.pushGlobalData();
```

---

## ❌ ISSUE 6: Conflict Between Local and Cloud

### Symptoms
- Dialog xác nhận xuất hiện
- Không biết nên chọn local hay cloud
- Dữ liệu bị ghi đè

### Root Causes
1. **Local mới hơn cloud**
   - Solution: Giữ local (chọn Cancel)
   - Check: `local_saved_at > cloudPushedAt`

2. **Cloud mới hơn local**
   - Solution: Lấy cloud (chọn OK)
   - Check: `cloudPushedAt > local_saved_at`

3. **Timestamp không chính xác**
   - Solution: Kiểm tra timestamp
   - Check: `DB.get('local_saved_at')`

### Debug Steps
```javascript
// 1. Kiểm tra timestamp
const localSavedAt = DB.get('local_saved_at', 0);
const cloudPushedAt = 1234567890; // Từ server
console.log('Local:', new Date(localSavedAt));
console.log('Cloud:', new Date(cloudPushedAt));
console.log('Local is newer:', localSavedAt > cloudPushedAt);

// 2. Kiểm tra conflict resolution logic
console.log('CloudSync.pullGlobalData logic:');
console.log('- If local newer → keep local');
console.log('- If cloud newer → ask confirmation');
console.log('- If manual pull → always take cloud');

// 3. Thực hiện pull
const result = await CloudSync.pullGlobalData(false);
console.log('Pull result:', result);
```

---

## ❌ ISSUE 7: Admin Cannot Push Data

### Symptoms
- Nút "☁️ Đẩy toàn bộ lên Supabase" bị disable
- Toast notification "Chỉ Admin mới có thể đồng bộ dữ liệu"
- Không thể push dữ liệu

### Root Causes
1. **User không phải admin**
   - Solution: Đăng nhập với tài khoản admin
   - Check: `await DBClient.isAdmin()`

2. **Admin check logic sai**
   - Solution: Kiểm tra `DBClient.isAdmin()`
   - Check: Email có trong whitelist không

3. **Supabase RLS policy**
   - Solution: Kiểm tra RLS policy
   - Check: User có quyền write không

### Debug Steps
```javascript
// 1. Kiểm tra user
const user = await DBClient.getCurrentUser();
console.log('User:', user.email);

// 2. Kiểm tra admin status
const isAdmin = await DBClient.isAdmin();
console.log('Is admin:', isAdmin);

// 3. Kiểm tra admin logic
console.log('Admin check logic:');
console.log('- Email:', user.email);
console.log('- Whitelist:', 'vuducanh1628@gmail.com');
console.log('- Match:', user.email === 'vuducanh1628@gmail.com');

// 4. Thử push
if (isAdmin) {
  await CloudSync.pushGlobalData();
} else {
  console.log('❌ Not admin');
}
```

---

## ❌ ISSUE 8: Supabase Connection Error

### Symptoms
- Toast notification "Supabase chưa kết nối"
- Console error "Supabase client not initialized"
- Không thể sync

### Root Causes
1. **Supabase URL/Key sai**
   - Solution: Kiểm tra `js/db-connect.js`
   - Check: URL và key có đúng không

2. **Supabase server down**
   - Solution: Kiểm tra Supabase status
   - Check: https://status.supabase.com

3. **Network error**
   - Solution: Kiểm tra kết nối internet
   - Check: `await AutoSync.testConnection()`

### Debug Steps
```javascript
// 1. Kiểm tra Supabase config
console.log('Supabase URL:', SUPABASE_URL);
console.log('Supabase Key:', SUPABASE_ANON_KEY.substring(0, 20) + '...');

// 2. Kiểm tra client
const client = DBClient.getClient();
console.log('Client:', client ? '✅' : '❌');

// 3. Thử kết nối
try {
  const { data, error } = await client.from('chapters').select('count', { count: 'exact' }).limit(1);
  if (error) throw error;
  console.log('✅ Connected');
} catch (err) {
  console.error('❌ Connection error:', err);
}

// 4. Kiểm tra network
const connectionOk = await AutoSync.testConnection();
console.log('Network:', connectionOk ? '✅' : '❌');
```

---

## ✅ SOLUTIONS SUMMARY

| Issue | Solution |
|-------|----------|
| Data not syncing | Check user login, auto-sync enabled |
| Data lost | Wait for sync before logout |
| Orphaned data | Run cleanup script |
| Duplicate data | Remove duplicates by ID |
| Sync timeout | Check payload size, network |
| Conflict | Check timestamp, choose wisely |
| Admin cannot push | Check admin status, RLS policy |
| Connection error | Check Supabase config, network |

---

## 🔧 QUICK FIXES

### Fix 1: Force Sync
```javascript
// Buộc đồng bộ ngay
AutoSync.hasChanges = true;
await AutoSync.syncToServer();
```

### Fix 2: Clear Cache
```javascript
// Xóa cache và reload
localStorage.clear();
location.reload();
```

### Fix 3: Reset Sync Status
```javascript
// Reset trạng thái sync
AutoSync.hasChanges = false;
AutoSync.isSyncing = false;
AutoSync.updateSyncStatus('synced');
```

### Fix 4: Reload from Cloud
```javascript
// Tải lại từ cloud
await CloudSync.pullGlobalData(true);
```

### Fix 5: Cleanup Orphaned Data
```javascript
// Xóa dữ liệu mồ côi
State.chapters = State.chapters.filter(ch => 
  State.books.find(b => b.id === ch.bookId) || !ch.bookId
);
State.cards = State.cards.filter(c => 
  State.chapters.find(ch => ch.id === c.chapterId) || !c.chapterId
);
State.save();
```

---

## 📞 SUPPORT

Nếu vấn đề vẫn không giải quyết:
1. Chạy diagnostic script
2. Kiểm tra console errors
3. Kiểm tra Supabase logs
4. Report với chi tiết

---

_Last Updated: 2025-01-XX_
_Version: 1.0_
_Status: Ready for Reference_
