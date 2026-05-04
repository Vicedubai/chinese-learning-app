// ===== CLOUD SYNC MODULE =====
// Quản lý đồng bộ dữ liệu giữa LocalStorage và Supabase

const CloudSync = {
  GLOBAL_ROW_ID: 'global_content_v1',
  TIMEOUT_MS: 30000, // 30 giây timeout (tăng từ 15s)

  // Helper: đảm bảo giá trị luôn là array
  safeArr(v) {
    if (Array.isArray(v)) return v;
    if (v && typeof v === 'object') return Object.values(v);
    return [];
  },

  // Helper: tính size của JSON payload
  calcSize(obj) {
    const bytes = new TextEncoder().encode(JSON.stringify(obj)).length;
    return bytes < 1024 ? `${bytes}B` : bytes < 1048576 ? `${(bytes/1024).toFixed(1)}KB` : `${(bytes/1048576).toFixed(2)}MB`;
  },

  // ===== PUSH: Đẩy dữ liệu từ Local lên Supabase (Admin only) =====
  async pushGlobalData() {
    const client = DBClient.getClient();
    if (!client) { toast('❌ Supabase chưa kết nối', 'error'); return false; }
    if (!Auth.isAdmin) { toast('❌ Chỉ Admin mới có thể đồng bộ dữ liệu', 'error'); return false; }

    const btn = document.getElementById('btn-sync-global');
    if (btn) { btn.innerText = '⏳ Đang chuẩn bị...'; btn.disabled = true; }

    try {
      // ── Bước 1: Chuẩn hoá books (nhỏ) ──
      if (btn) btn.innerText = '⏳ Gói dữ liệu... (1/3)';
      const books = this.safeArr(State.books).map(b => ({
        id: b.id,
        title: b.title || b.name || 'Sách',
        numPages: b.numPages || 0
      }));

      // ── Bước 2: Chuẩn hoá chapters (nhỏ, không có rawText) ──
      const chapters = this.safeArr(State.chapters).map(ch => ({
        id: ch.id,
        title: ch.title || ch.name || '',
        bookId: ch.bookId || null,
        num: ch.num || 0,
        pages: ch.pages || 0,
        startPage: ch.startPage || 0,
        endPage: ch.endPage || 0,
        studied: ch.studied || false,
        order: ch.order ?? 0
        // rawText bị loại bỏ - nguyên nhân chính gây payload lớn
      }));

      // ── Bước 3: Chuẩn hoá cards - CHỈ GIỮ TRƯỜNG CẦN THIẾT ──
      if (btn) btn.innerText = '⏳ Gói flashcards... (2/3)';
      const cards = this.safeArr(State.cards)
        .filter(c => c.id && c.chinese) // Lọc bỏ cards không hợp lệ
        .map(c => ({
          id: c.id,
          chapterId: c.chapterId || null,
          // Từ vựng (library.js fields)
          chinese: c.chinese || '',
          pinyin: c.pinyin || '',
          wordType: c.wordType || '',
          vietnamese: c.vietnamese || '',
          // SM-2 spaced repetition (chỉ giữ essential fields)
          ef: c.ef || 2.5,
          interval: c.interval || 1,
          reps: c.reps || 0,
          nextReview: c.nextReview || 0
          // LOẠI BỎ: example, front/back, deck, và các field không cần thiết
        }));

      // ── Bước 4: Chuẩn hoá dictation ──
      const dictationPlaylist = this.safeArr(State.dictationPlaylist).map(p => ({
        id: p.id,
        videoId: p.videoId || '',
        url: p.url || '',
        title: p.title || 'Bài nghe',
        transcript: p.transcript || '',
        totalCount: p.totalCount || 0,
        completedCount: p.completedCount || 0,
        order: p.order ?? 0
      }));

      const payload = {
        id: this.GLOBAL_ROW_ID,
        name: '__global_data__',
        book_name: 'System',
        page_range: '0',
        vocab: {
          books,
          chapters,
          cards,
          dictationPlaylist,
          pushedAt: Date.now(),
          version: 3
        }
      };

      // Log payload size để debug
      const size = this.calcSize(payload.vocab);
      console.log(`📦 CloudSync payload: ${size} (${books.length} sách, ${chapters.length} bài, ${cards.length} cards)`);

      // ── Bước 5: Upload với timeout và retry ──
      if (btn) btn.innerText = `⏳ Đang upload... (3/3)`;

      let lastError = null;
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          if (attempt > 1) {
            if (btn) btn.innerText = `⏳ Đang upload... (3/3) - Lần ${attempt}/3`;
            await new Promise(r => setTimeout(r, 1000 * attempt)); // Exponential backoff
          }

          // Dùng Promise.race với timeout để tránh treo vô hạn
          const uploadPromise = client.from('chapters').upsert(payload, { returning: 'minimal' });
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error(`Timeout sau ${this.TIMEOUT_MS/1000}s - dữ liệu quá lớn hoặc mạng chậm`)), this.TIMEOUT_MS)
          );

          const { error } = await Promise.race([uploadPromise, timeoutPromise]);
          if (error) throw error;

          toast(`✅ Đồng bộ xong! ${books.length} sách · ${chapters.length} bài · ${cards.length} từ vựng · ${dictationPlaylist.length} bài nghe (${size})`, 'success');
          console.log('✅ CloudSync push thành công, payload size:', size);
          
          // ✅ Cập nhật giao diện sau khi đồng bộ thành công
          if (typeof renderFlashcards === 'function') renderFlashcards();
          if (typeof renderLibrary === 'function') renderLibrary();
          if (typeof renderDashboard === 'function') renderDashboard();
          if (typeof renderDictationPlaylist === 'function') renderDictationPlaylist();
          
          return true;
        } catch (err) {
          lastError = err;
          console.warn(`⚠️ Attempt ${attempt}/3 failed:`, err.message);
          if (attempt === 3) throw lastError;
        }
      }

    } catch (err) {
      console.error('❌ CloudSync.pushGlobalData error:', err);
      toast('❌ Lỗi đồng bộ: ' + (err.message || JSON.stringify(err)), 'error');
      return false;
    } finally {
      if (btn) { btn.innerText = '☁️ Đẩy toàn bộ lên Supabase'; btn.disabled = false; }
    }
  },

  // ===== PULL: Tải dữ liệu từ Supabase về Local =====
  async pullGlobalData(silent = false) {
    const client = DBClient.getClient();
    if (!client) return false;

    try {
      const pullPromise = client
        .from('chapters')
        .select('vocab')
        .eq('id', this.GLOBAL_ROW_ID)
        .single();

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout khi tải dữ liệu')), this.TIMEOUT_MS)
      );

      const { data, error } = await Promise.race([pullPromise, timeoutPromise]);

      if (error && error.code !== 'PGRST116') throw error;
      if (!data || !data.vocab) {
        if (!silent) toast('ℹ️ Chưa có dữ liệu trên cloud. Admin cần Push trước!', 'info');
        return false;
      }

      const d = data.vocab;
      const cloudPushedAt = d.pushedAt || 0;
      const localSavedAt = DB.get('local_saved_at', 0);

      // ── SMART MERGE: Chỉ ghi đè nếu cloud MỚI HƠN local ──
      // Nếu local có dữ liệu MỚI HƠN cloud → không ghi đè (tránh mất data)
      const localHasContent = State.chapters.length > 0 || State.cards.length > 0;
      const cloudIsNewer = cloudPushedAt > localSavedAt;
      const forcePull = !silent; // Khi user chủ động nhấn pull → luôn lấy cloud

      if (localHasContent && !cloudIsNewer && !forcePull) {
        console.log(`ℹ️ Local data (${new Date(localSavedAt).toLocaleTimeString()}) mới hơn cloud (${new Date(cloudPushedAt).toLocaleTimeString()}) → giữ nguyên local`);
        return false;
      }

      // Nếu local có data mới hơn nhưng user đang pull thủ công → hỏi xác nhận
      if (localHasContent && !cloudIsNewer && forcePull) {
        const ok = confirm(
          `⚠️ Dữ liệu LOCAL của bạn MỚI HƠN dữ liệu Cloud!\n\n` +
          `Local lưu lúc: ${new Date(localSavedAt).toLocaleString()}\n` +
          `Cloud push lúc: ${new Date(cloudPushedAt).toLocaleString()}\n\n` +
          `Bạn có chắc muốn GHI ĐÈ local bằng dữ liệu cloud cũ hơn không?\n` +
          `(Nhấn OK = mất dữ liệu local mới hơn, Cancel = giữ nguyên local)`
        );
        if (!ok) return false;
      }

      const books = this.safeArr(d.books).map(b => ({
        ...b,
        title: b.title || b.name || 'Sách'
      }));

      const chapters = this.safeArr(d.chapters).map(ch => ({
        ...ch,
        title: ch.title || ch.name || 'Bài học',
        vocab: []
      }));

      const cards = this.safeArr(d.cards).map(c => ({
        ...c,
        chinese: c.chinese || c.front || '',
        vietnamese: c.vietnamese || c.back || ''
      }));

      const dictationPlaylist = this.safeArr(d.dictationPlaylist);

      if (books.length > 0) State.books = books;
      if (chapters.length > 0) State.chapters = chapters;
      if (cards.length > 0) State.cards = cards;
      if (dictationPlaylist.length > 0) State.dictationPlaylist = dictationPlaylist;

      State.save();
      // Cập nhật local_saved_at để tránh pull lại không cần thiết
      DB.set('local_saved_at', cloudPushedAt);

      if (typeof renderLibrary === 'function') renderLibrary();
      if (typeof renderDashboard === 'function') renderDashboard();
      if (typeof renderDictationPlaylist === 'function') renderDictationPlaylist();
      if (typeof renderFlashcards === 'function') renderFlashcards();

      if (!silent) {
        toast(`☁️ Đã tải: ${books.length} sách · ${chapters.length} bài · ${cards.length} từ vựng`, 'success');
      }
      return true;

    } catch (err) {
      console.error('❌ CloudSync.pullGlobalData error:', err);
      if (!silent) toast('❌ Lỗi tải dữ liệu: ' + err.message, 'error');
      return false;
    }
  },

  // ===== Tự động tải dữ liệu khi user đăng nhập =====
  async onLogin() {
    await this.pullGlobalData(true);
  }
};

window.CloudSync = CloudSync;
