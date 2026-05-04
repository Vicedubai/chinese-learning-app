# 🔄 DATA SYNC TESTING - COMPLETE GUIDE

## 📋 OVERVIEW

Hệ thống đồng bộ dữ liệu của app có 3 cấp độ:

1. **LocalStorage** - Lưu trữ cục bộ (tất cả người dùng)
2. **User Settings** - Lưu trữ cá nhân (người dùng đã đăng nhập)
3. **CloudSync** - Lưu trữ toàn cục (Admin only)

---

## 📚 DOCUMENTATION

### 1. **TEST_DATA_SYNC.md** - Comprehensive Test Guide
- 10 test cases chi tiết
- Cách test từng tính năng
- Expected output
- Troubleshooting

### 2. **SYNC_DIAGNOSTIC_SCRIPT.md** - Automated Testing
- Script tự động kiểm tra
- 7 test categories
- Summary report
- Cleanup script

### 3. **SYNC_ISSUES_AND_SOLUTIONS.md** - Problem Solving
- 8 common issues
- Root causes
- Debug steps
- Quick fixes

### 4. **SYNC_TEST_SUMMARY.md** - Quick Reference
- Test checklist
- How to run tests
- Expected results
- Performance metrics

---

## 🚀 QUICK START

### Step 1: Run Diagnostic Script
```javascript
// Mở Console (F12)
// Sao chép script từ SYNC_DIAGNOSTIC_SCRIPT.md
// Dán vào Console
// Nhấn Enter
```

### Step 2: Check Results
- ✅ PASS: Tính năng hoạt động
- ⚠️ WARN: Cần chú ý
- ❌ FAIL: Có vấn đề

### Step 3: Fix Issues
- Xem `SYNC_ISSUES_AND_SOLUTIONS.md`
- Chạy quick fix script
- Thử lại

---

## 🧪 TEST CATEGORIES

### 1. LocalStorage Tests
```javascript
// Kiểm tra dữ liệu lưu cục bộ
console.log('Books:', JSON.parse(localStorage.getItem('books')));
console.log('Chapters:', JSON.parse(localStorage.getItem('chapters')));
console.log('Cards:', JSON.parse(localStorage.getItem('cards')));
```

### 2. Supabase Connection Tests
```javascript
// Kiểm tra kết nối Supabase
const client = DBClient.getClient();
console.log('Client:', client ? '✅' : '❌');
```

### 3. User Sync Tests
```javascript
// Kiểm tra đồng bộ cá nhân
const user = await DBClient.getCurrentUser();
console.log('User:', user?.email);
await State.sync();
```

### 4. CloudSync Tests (Admin)
```javascript
// Kiểm tra đồng bộ toàn cục
const isAdmin = await DBClient.isAdmin();
if (isAdmin) await CloudSync.pushGlobalData();
```

### 5. Data Integrity Tests
```javascript
// Kiểm tra tính nhất quán dữ liệu
const orphaned = State.chapters.filter(ch => 
  !State.books.find(b => b.id === ch.bookId)
);
console.log('Orphaned chapters:', orphaned.length);
```

### 6. Error Handling Tests
```javascript
// Kiểm tra xử lý lỗi
await AutoSync.testConnection();
```

### 7. AutoSync Tests
```javascript
// Kiểm tra tự động đồng bộ
console.log('AutoSync enabled:', AutoSync.enabled);
console.log('Last sync:', new Date(AutoSync.lastSyncTime));
```

---

## 🔍 COMMON ISSUES

### ❌ Data Not Syncing
**Solution**: Check user login, auto-sync enabled
```javascript
const user = await DBClient.getCurrentUser();
console.log('User:', user);
console.log('AutoSync:', AutoSync.enabled);
```

### ❌ Data Lost
**Solution**: Wait for sync before logout
```javascript
console.log('Is syncing:', AutoSync.isSyncing);
// Chờ cho đến khi isSyncing = false
```

### ❌ Orphaned Data
**Solution**: Run cleanup script
```javascript
State.chapters = State.chapters.filter(ch => 
  State.books.find(b => b.id === ch.bookId) || !ch.bookId
);
State.save();
```

### ❌ Duplicate Data
**Solution**: Remove duplicates
```javascript
State.books = Array.from(new Map(
  State.books.map(b => [b.id, b])
).values());
State.save();
```

### ❌ Sync Timeout
**Solution**: Check payload size
```javascript
const size = CloudSync.calcSize(State);
console.log('Payload size:', size);
```

---

## ✅ VERIFICATION CHECKLIST

- [ ] LocalStorage working
- [ ] Supabase connected
- [ ] User sync working
- [ ] CloudSync working (Admin)
- [ ] Auto-sync working
- [ ] Merge data working
- [ ] Error handling working
- [ ] No data loss
- [ ] No orphaned data
- [ ] No duplicate data

---

## 📊 EXPECTED RESULTS

### ✅ PASS
```
✅ LocalStorage Books: 5 books found
✅ Supabase Client: Client initialized
✅ User Authentication: Logged in as user@example.com
✅ State Sync: State data loaded
✅ Data Integrity: No orphaned chapters
✅ CloudSync Module: CloudSync module loaded
✅ AutoSync Module: AutoSync module loaded

📊 SUMMARY
✅ PASS:  18
⚠️  WARN:  1
❌ FAIL:  0
```

### ❌ FAIL
```
❌ Supabase Client: Client not initialized
❌ User Authentication: Not logged in
❌ State Sync: State object not found
❌ Data Integrity: 5 orphaned chapters
```

---

## 🔧 QUICK FIXES

### Fix 1: Force Sync
```javascript
AutoSync.hasChanges = true;
await AutoSync.syncToServer();
```

### Fix 2: Clear Cache
```javascript
localStorage.clear();
location.reload();
```

### Fix 3: Cleanup Orphaned Data
```javascript
State.chapters = State.chapters.filter(ch => 
  State.books.find(b => b.id === ch.bookId) || !ch.bookId
);
State.cards = State.cards.filter(c => 
  State.chapters.find(ch => ch.id === c.chapterId) || !c.chapterId
);
State.save();
```

### Fix 4: Remove Duplicates
```javascript
State.books = Array.from(new Map(State.books.map(b => [b.id, b])).values());
State.chapters = Array.from(new Map(State.chapters.map(ch => [ch.id, ch])).values());
State.cards = Array.from(new Map(State.cards.map(c => [c.id, c])).values());
State.save();
```

### Fix 5: Reload from Cloud
```javascript
await CloudSync.pullGlobalData(true);
```

---

## 📈 PERFORMANCE METRICS

| Operation | Expected Time | Max Time |
|-----------|---------------|----------|
| LocalStorage save | < 100ms | 500ms |
| Supabase sync | < 5s | 15s |
| CloudSync push | < 15s | 30s |
| CloudSync pull | < 10s | 20s |
| Merge data | < 1s | 5s |

---

## 🎯 TESTING WORKFLOW

1. **Prepare**
   - Mở app
   - Đăng nhập (nếu cần)
   - Thêm dữ liệu

2. **Test**
   - Mở Console (F12)
   - Chạy diagnostic script
   - Kiểm tra results

3. **Verify**
   - Kiểm tra localStorage
   - Kiểm tra Supabase
   - Kiểm tra sync status

4. **Fix**
   - Nếu có issue, xem SYNC_ISSUES_AND_SOLUTIONS.md
   - Chạy quick fix script
   - Thử lại

5. **Report**
   - Ghi lại results
   - Báo cáo issues
   - Cung cấp chi tiết

---

## 📞 SUPPORT

### If Tests Fail
1. Check `SYNC_ISSUES_AND_SOLUTIONS.md`
2. Run diagnostic script again
3. Check console errors (F12)
4. Check Supabase logs
5. Report with details

### Information to Provide
- Browser and OS
- Steps to reproduce
- Console errors
- Diagnostic results
- Screenshots

---

## 🔐 SECURITY NOTES

- ✅ User data isolated by user_id
- ✅ Admin-only operations protected
- ✅ RLS policies enforced
- ✅ Sensitive data not logged

---

## 📝 FILES REFERENCE

| File | Purpose |
|------|---------|
| TEST_DATA_SYNC.md | Comprehensive test guide |
| SYNC_DIAGNOSTIC_SCRIPT.md | Automated diagnostic |
| SYNC_ISSUES_AND_SOLUTIONS.md | Problem solving |
| SYNC_TEST_SUMMARY.md | Quick reference |
| DATA_SYNC_README.md | This file |

---

## 🎉 SUCCESS CRITERIA

✅ All tests pass
✅ No data loss
✅ No orphaned data
✅ No duplicate data
✅ Sync working smoothly
✅ Error handling working
✅ Performance acceptable

---

_Last Updated: 2025-01-XX_
_Version: 1.0_
_Status: Ready for Testing_
