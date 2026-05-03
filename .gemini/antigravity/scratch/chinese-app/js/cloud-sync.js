// ===== CLOUD SYNC MODULE =====
// Quản lý đồng bộ dữ liệu giữa LocalStorage và Supabase

const CloudSync = {
  GLOBAL_ROW_ID: 'global_content_v1',

  // Helper: đảm bảo giá trị luôn là array
  safeArr(v) {
    if (Array.isArray(v)) return v;
    if (v && typeof v === 'object') return Object.values(v);
    return [];
  },

  // ===== PUSH: Đẩy dữ liệu từ Local lên Supabase (Admin only) =====
  async pushGlobalData() {
    const client = DBClient.getClient();
    if (!client) { toast('❌ Supabase chưa kết nối', 'error'); return false; }
    if (!Auth.isAdmin) { toast('❌ Chỉ Admin mới có thể đồng bộ dữ liệu', 'error'); return false; }

    const btn = document.getElementById('btn-sync-global');
    if (btn) { btn.innerText = '⏳ Đang đồng bộ...'; btn.disabled = true; }

    try {
      // Chuẩn hoá books
      const books = this.safeArr(State.books).map(b => ({
        id: b.id,
        title: b.title || b.name || 'Sách chưa đặt tên',
        numPages: b.numPages || 0
      }));

      // Chuẩn hoá chapters - GIỮ NGUYÊN TẤT CẢ TRƯỜNG QUAN TRỌNG
      const chapters = this.safeArr(State.chapters).map(ch => ({
        id: ch.id,
        title: ch.title || ch.name || '',   // library.js dùng .title
        bookId: ch.bookId || null,
        num: ch.num || 0,
        pages: ch.pages || 0,
        startPage: ch.startPage || 0,
        endPage: ch.endPage || 0,
        studied: ch.studied || false,
        order: ch.order ?? 0
        // Không lưu rawText (quá lớn), không lưu vocab ở đây (cards đã có chapterId)
      }));

      // Chuẩn hoá flashcards - GIỮ NGUYÊN CẤU TRÚC CỦA LIBRARY
      const cards = this.safeArr(State.cards).map(c => ({
        id: c.id,
        chapterId: c.chapterId || null,
        chinese: c.chinese || '',
        pinyin: c.pinyin || '',
        wordType: c.wordType || '',
        vietnamese: c.vietnamese || '',
        example: c.example || '',
        // Flashcard riêng (không từ chapter)
        front: c.front || c.chinese || '',
        back: c.back || c.vietnamese || '',
        deck: c.deck || null,
        // SM-2 data
        ef: c.ef || 2.5,
        interval: c.interval || 1,
        reps: c.reps || 0,
        nextReview: c.nextReview || Date.now()
      }));

      // Chuẩn hoá dictation playlist
      const dictationPlaylist = this.safeArr(State.dictationPlaylist).map(p => ({
        id: p.id,
        videoId: p.videoId || '',
        url: p.url || '',
        title: p.title || 'Bài nghe chưa đặt tên',
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
          version: 2
        }
      };

      const { error } = await client.from('chapters').upsert(payload);
      if (error) throw error;

      toast(`✅ Đồng bộ: ${books.length} sách, ${chapters.length} bài, ${cards.length} flashcards, ${dictationPlaylist.length} bài nghe`, 'success');
      return true;
    } catch (err) {
      console.error('CloudSync.pushGlobalData error:', err);
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
      const { data, error } = await client
        .from('chapters')
        .select('vocab')
        .eq('id', this.GLOBAL_ROW_ID)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      if (!data || !data.vocab) {
        if (!silent) toast('ℹ️ Chưa có dữ liệu trên cloud. Hãy Push trước!', 'info');
        return false;
      }

      const d = data.vocab;

      // Lấy và validate books
      const books = this.safeArr(d.books).map(b => ({
        ...b,
        title: b.title || b.name || 'Sách'
      }));

      // Lấy và validate chapters - ĐẢM BẢO title luôn có
      const chapters = this.safeArr(d.chapters).map(ch => ({
        ...ch,
        title: ch.title || ch.name || 'Bài học',
        vocab: [] // chapters không lưu vocab nữa (cards đã có chapterId)
      }));

      // Lấy và validate cards
      const cards = this.safeArr(d.cards);

      // Lấy và validate dictation playlist
      const dictationPlaylist = this.safeArr(d.dictationPlaylist);

      // Cập nhật State - MERGE books, không ghi đè hoàn toàn
      if (books.length > 0) State.books = books;
      if (chapters.length > 0) State.chapters = chapters;
      if (cards.length > 0) State.cards = cards;
      if (dictationPlaylist.length > 0) State.dictationPlaylist = dictationPlaylist;

      State.save();

      // Re-render UI
      if (typeof renderLibrary === 'function') renderLibrary();
      if (typeof renderDashboard === 'function') renderDashboard();
      if (typeof renderDictationPlaylist === 'function') renderDictationPlaylist();

      if (!silent) {
        toast(`☁️ Đã tải: ${books.length} sách, ${chapters.length} bài, ${cards.length} từ vựng, ${dictationPlaylist.length} bài nghe`, 'success');
      }
      return true;
    } catch (err) {
      console.error('CloudSync.pullGlobalData error:', err);
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
