# 🔧 SYNC DIAGNOSTIC SCRIPT

## 📋 HƯỚNG DẪN SỬ DỤNG

Sao chép toàn bộ code dưới đây vào Console (F12) để chạy diagnostic test.

---

## 🧪 DIAGNOSTIC SCRIPT

```javascript
// ===== SYNC DIAGNOSTIC SCRIPT =====
// Chạy toàn bộ test để kiểm tra khả năng đồng bộ dữ liệu

console.log('🧪 Starting Sync Diagnostic...\n');

const Diagnostic = {
  results: [],
  
  log(test, status, message) {
    const icon = status === 'PASS' ? '✅' : status === 'WARN' ? '⚠️' : '❌';
    console.log(`${icon} ${test}: ${message}`);
    this.results.push({ test, status, message });
  },
  
  async run() {
    console.log('═══════════════════════════════════════\n');
    
    // TEST 1: LocalStorage
    console.log('📦 TEST 1: LocalStorage\n');
    await this.testLocalStorage();
    
    // TEST 2: Supabase Connection
    console.log('\n🔗 TEST 2: Supabase Connection\n');
    await this.testSupabaseConnection();
    
    // TEST 3: User Authentication
    console.log('\n🔐 TEST 3: User Authentication\n');
    await this.testAuthentication();
    
    // TEST 4: State Sync
    console.log('\n☁️ TEST 4: State Sync\n');
    await this.testStateSync();
    
    // TEST 5: Data Integrity
    console.log('\n🔍 TEST 5: Data Integrity\n');
    await this.testDataIntegrity();
    
    // TEST 6: CloudSync
    console.log('\n🌐 TEST 6: CloudSync\n');
    await this.testCloudSync();
    
    // TEST 7: AutoSync
    console.log('\n🔄 TEST 7: AutoSync\n');
    await this.testAutoSync();
    
    // Summary
    console.log('\n═══════════════════════════════════════\n');
    this.printSummary();
  },
  
  // TEST 1: LocalStorage
  async testLocalStorage() {
    try {
      // Check books
      const books = JSON.parse(localStorage.getItem('books') || '[]');
      if (books.length > 0) {
        this.log('LocalStorage Books', 'PASS', `${books.length} books found`);
      } else {
        this.log('LocalStorage Books', 'WARN', 'No books in localStorage');
      }
      
      // Check chapters
      const chapters = JSON.parse(localStorage.getItem('chapters') || '[]');
      if (chapters.length > 0) {
        this.log('LocalStorage Chapters', 'PASS', `${chapters.length} chapters found`);
      } else {
        this.log('LocalStorage Chapters', 'WARN', 'No chapters in localStorage');
      }
      
      // Check cards
      const cards = JSON.parse(localStorage.getItem('cards') || '[]');
      if (cards.length > 0) {
        this.log('LocalStorage Cards', 'PASS', `${cards.length} cards found`);
      } else {
        this.log('LocalStorage Cards', 'WARN', 'No cards in localStorage');
      }
      
      // Check progress
      const progress = JSON.parse(localStorage.getItem('progress') || '{}');
      if (progress.xp !== undefined) {
        this.log('LocalStorage Progress', 'PASS', `XP: ${progress.xp}`);
      } else {
        this.log('LocalStorage Progress', 'WARN', 'No progress in localStorage');
      }
      
      // Check timestamp
      const timestamp = localStorage.getItem('local_saved_at');
      if (timestamp) {
        const date = new Date(parseInt(timestamp));
        this.log('LocalStorage Timestamp', 'PASS', `Last saved: ${date.toLocaleString()}`);
      } else {
        this.log('LocalStorage Timestamp', 'WARN', 'No timestamp found');
      }
      
    } catch (error) {
      this.log('LocalStorage', 'FAIL', error.message);
    }
  },
  
  // TEST 2: Supabase Connection
  async testSupabaseConnection() {
    try {
      // Check client
      const client = DBClient.getClient();
      if (client) {
        this.log('Supabase Client', 'PASS', 'Client initialized');
      } else {
        this.log('Supabase Client', 'FAIL', 'Client not initialized');
        return;
      }
      
      // Check configuration
      if (DBClient.isConfigured()) {
        this.log('Supabase Config', 'PASS', 'Configured');
      } else {
        this.log('Supabase Config', 'FAIL', 'Not configured');
        return;
      }
      
      // Test connection
      try {
        const { data, error } = await client.from('chapters').select('count', { count: 'exact' }).limit(1);
        if (!error) {
          this.log('Supabase Connection', 'PASS', 'Connected successfully');
        } else {
          this.log('Supabase Connection', 'FAIL', error.message);
        }
      } catch (err) {
        this.log('Supabase Connection', 'FAIL', err.message);
      }
      
    } catch (error) {
      this.log('Supabase Connection', 'FAIL', error.message);
    }
  },
  
  // TEST 3: User Authentication
  async testAuthentication() {
    try {
      const user = await DBClient.getCurrentUser();
      if (user) {
        this.log('User Authentication', 'PASS', `Logged in as: ${user.email}`);
        
        // Check admin status
        const isAdmin = await DBClient.isAdmin();
        if (isAdmin) {
          this.log('Admin Status', 'PASS', 'User is admin');
        } else {
          this.log('Admin Status', 'WARN', 'User is not admin');
        }
      } else {
        this.log('User Authentication', 'WARN', 'Not logged in (guest mode)');
      }
    } catch (error) {
      this.log('User Authentication', 'FAIL', error.message);
    }
  },
  
  // TEST 4: State Sync
  async testStateSync() {
    try {
      const user = await DBClient.getCurrentUser();
      if (!user) {
        this.log('State Sync', 'WARN', 'Not logged in - skipping');
        return;
      }
      
      // Check State object
      if (State && State.sync) {
        this.log('State Object', 'PASS', 'State object exists');
      } else {
        this.log('State Object', 'FAIL', 'State object not found');
        return;
      }
      
      // Check State data
      console.log(`  - Books: ${State.books.length}`);
      console.log(`  - Chapters: ${State.chapters.length}`);
      console.log(`  - Cards: ${State.cards.length}`);
      console.log(`  - Progress XP: ${State.progress.xp}`);
      
      this.log('State Data', 'PASS', 'State data loaded');
      
    } catch (error) {
      this.log('State Sync', 'FAIL', error.message);
    }
  },
  
  // TEST 5: Data Integrity
  async testDataIntegrity() {
    try {
      // Check for orphaned chapters
      const orphanedChapters = State.chapters.filter(ch => 
        !State.books.find(b => b.id === ch.bookId) && ch.bookId
      );
      if (orphanedChapters.length === 0) {
        this.log('Data Integrity - Chapters', 'PASS', 'No orphaned chapters');
      } else {
        this.log('Data Integrity - Chapters', 'WARN', `${orphanedChapters.length} orphaned chapters`);
      }
      
      // Check for orphaned cards
      const orphanedCards = State.cards.filter(c => 
        !State.chapters.find(ch => ch.id === c.chapterId) && c.chapterId
      );
      if (orphanedCards.length === 0) {
        this.log('Data Integrity - Cards', 'PASS', 'No orphaned cards');
      } else {
        this.log('Data Integrity - Cards', 'WARN', `${orphanedCards.length} orphaned cards`);
      }
      
      // Check for duplicate IDs
      const bookIds = new Set();
      const duplicateBooks = State.books.filter(b => {
        if (bookIds.has(b.id)) return true;
        bookIds.add(b.id);
        return false;
      });
      if (duplicateBooks.length === 0) {
        this.log('Data Integrity - Duplicates', 'PASS', 'No duplicate IDs');
      } else {
        this.log('Data Integrity - Duplicates', 'WARN', `${duplicateBooks.length} duplicate book IDs`);
      }
      
    } catch (error) {
      this.log('Data Integrity', 'FAIL', error.message);
    }
  },
  
  // TEST 6: CloudSync
  async testCloudSync() {
    try {
      if (!window.CloudSync) {
        this.log('CloudSync', 'FAIL', 'CloudSync module not found');
        return;
      }
      
      this.log('CloudSync Module', 'PASS', 'CloudSync module loaded');
      
      // Check if user is admin
      const isAdmin = await DBClient.isAdmin();
      if (!isAdmin) {
        this.log('CloudSync Admin Check', 'WARN', 'Not admin - cannot test push');
        return;
      }
      
      // Check global data on Supabase
      const client = DBClient.getClient();
      const { data, error } = await client
        .from('chapters')
        .select('vocab')
        .eq('id', CloudSync.GLOBAL_ROW_ID)
        .single();
      
      if (!error && data && data.vocab) {
        const vocab = data.vocab;
        console.log(`  - Books: ${vocab.books?.length || 0}`);
        console.log(`  - Chapters: ${vocab.chapters?.length || 0}`);
        console.log(`  - Cards: ${vocab.cards?.length || 0}`);
        console.log(`  - Pushed at: ${new Date(vocab.pushedAt).toLocaleString()}`);
        this.log('CloudSync Global Data', 'PASS', 'Global data found on Supabase');
      } else {
        this.log('CloudSync Global Data', 'WARN', 'No global data on Supabase');
      }
      
    } catch (error) {
      this.log('CloudSync', 'FAIL', error.message);
    }
  },
  
  // TEST 7: AutoSync
  async testAutoSync() {
    try {
      if (!window.AutoSync) {
        this.log('AutoSync', 'FAIL', 'AutoSync module not found');
        return;
      }
      
      this.log('AutoSync Module', 'PASS', 'AutoSync module loaded');
      
      // Check status
      console.log(`  - Enabled: ${AutoSync.enabled}`);
      console.log(`  - Has changes: ${AutoSync.hasChanges}`);
      console.log(`  - Is syncing: ${AutoSync.isSyncing}`);
      console.log(`  - Last sync: ${new Date(AutoSync.lastSyncTime).toLocaleString()}`);
      
      this.log('AutoSync Status', 'PASS', 'AutoSync status checked');
      
    } catch (error) {
      this.log('AutoSync', 'FAIL', error.message);
    }
  },
  
  // Print summary
  printSummary() {
    const passed = this.results.filter(r => r.status === 'PASS').length;
    const warned = this.results.filter(r => r.status === 'WARN').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    
    console.log(`📊 SUMMARY\n`);
    console.log(`✅ PASS:  ${passed}`);
    console.log(`⚠️  WARN:  ${warned}`);
    console.log(`❌ FAIL:  ${failed}`);
    console.log(`\n📈 Total: ${this.results.length} tests\n`);
    
    if (failed === 0) {
      console.log('🎉 All tests passed!\n');
    } else {
      console.log(`⚠️  ${failed} test(s) failed. Please check the errors above.\n`);
    }
    
    // Print detailed results
    console.log('═══════════════════════════════════════\n');
    console.log('📋 DETAILED RESULTS\n');
    this.results.forEach(r => {
      const icon = r.status === 'PASS' ? '✅' : r.status === 'WARN' ? '⚠️' : '❌';
      console.log(`${icon} ${r.test}`);
      console.log(`   ${r.message}\n`);
    });
  }
};

// Run diagnostic
await Diagnostic.run();
```

---

## 🚀 CÁCH CHẠY

1. **Mở Console**: Nhấn F12 → Tab "Console"
2. **Sao chép code**: Sao chép toàn bộ script trên
3. **Dán vào Console**: Chuột phải → Paste
4. **Nhấn Enter**: Chạy script

---

## 📊 EXPECTED OUTPUT

```
🧪 Starting Sync Diagnostic...

═══════════════════════════════════════

📦 TEST 1: LocalStorage

✅ LocalStorage Books: 5 books found
✅ LocalStorage Chapters: 20 chapters found
✅ LocalStorage Cards: 100 cards found
✅ LocalStorage Progress: XP: 500
✅ LocalStorage Timestamp: Last saved: 2025-01-XX 14:30:45

🔗 TEST 2: Supabase Connection

✅ Supabase Client: Client initialized
✅ Supabase Config: Configured
✅ Supabase Connection: Connected successfully

🔐 TEST 3: User Authentication

✅ User Authentication: Logged in as: user@example.com
✅ Admin Status: User is not admin

☁️ TEST 4: State Sync

✅ State Object: State object exists
  - Books: 5
  - Chapters: 20
  - Cards: 100
  - Progress XP: 500
✅ State Data: State data loaded

🔍 TEST 5: Data Integrity

✅ Data Integrity - Chapters: No orphaned chapters
✅ Data Integrity - Cards: No orphaned cards
✅ Data Integrity - Duplicates: No duplicate IDs

🌐 TEST 6: CloudSync

✅ CloudSync Module: CloudSync module loaded
⚠️  CloudSync Admin Check: Not admin - cannot test push

🔄 TEST 7: AutoSync

✅ AutoSync Module: AutoSync module loaded
  - Enabled: true
  - Has changes: false
  - Is syncing: false
  - Last sync: 2025-01-XX 14:30:45
✅ AutoSync Status: AutoSync status checked

═══════════════════════════════════════

📊 SUMMARY

✅ PASS:  18
⚠️  WARN:  1
❌ FAIL:  0

📈 Total: 19 tests

🎉 All tests passed!
```

---

## 🐛 TROUBLESHOOTING

### ❌ FAIL: Supabase Client
**Nguyên nhân**: Supabase chưa được khởi tạo
**Giải pháp**: Kiểm tra file `js/db-connect.js`

### ❌ FAIL: User Authentication
**Nguyên nhân**: Chưa đăng nhập
**Giải pháp**: Đăng nhập vào app trước

### ❌ FAIL: State Sync
**Nguyên nhân**: State object không tồn tại
**Giải pháp**: Kiểm tra file `js/core.js`

### ⚠️ WARN: Orphaned Chapters/Cards
**Nguyên nhân**: Dữ liệu không nhất quán
**Giải pháp**: Chạy cleanup script

### ⚠️ WARN: CloudSync Admin Check
**Nguyên nhân**: Người dùng không phải admin
**Giải pháp**: Đăng nhập với tài khoản admin

---

## 🔧 CLEANUP SCRIPT

Nếu có orphaned data, chạy script này:

```javascript
// Remove orphaned chapters
const orphanedChapters = State.chapters.filter(ch => 
  !State.books.find(b => b.id === ch.bookId) && ch.bookId
);
console.log(`Removing ${orphanedChapters.length} orphaned chapters...`);
State.chapters = State.chapters.filter(ch => 
  State.books.find(b => b.id === ch.bookId) || !ch.bookId
);

// Remove orphaned cards
const orphanedCards = State.cards.filter(c => 
  !State.chapters.find(ch => ch.id === c.chapterId) && c.chapterId
);
console.log(`Removing ${orphanedCards.length} orphaned cards...`);
State.cards = State.cards.filter(c => 
  State.chapters.find(ch => ch.id === c.chapterId) || !c.chapterId
);

// Save
State.save();
console.log('✅ Cleanup complete!');
```

---

_Last Updated: 2025-01-XX_
_Version: 1.0_
_Status: Ready for Testing_
