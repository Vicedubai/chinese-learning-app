// ===== CLOUD SYNC MODULE =====
// Quản lý đồng bộ dữ liệu giữa LocalStorage và Supabase

const CloudSync = {
  GLOBAL_ROW_ID: 'global_content_v1',

  // ===== PUSH: Đẩy dữ liệu từ Local lên Supabase (Admin only) =====
  async pushGlobalData() {
    const client = DBClient.getClient();
    if (!client) { toast('❌ Supabase chưa kết nối', 'error'); return false; }
    if (!Auth.isAdmin) { toast('❌ Chỉ Admin mới có thể đồng bộ dữ liệu', 'error'); return false; }

    const btn = document.getElementById('btn-sync-global');
    if (btn) { btn.innerText = '⏳ Đang đồng bộ...'; btn.disabled = true; }

    try {
      // Chuẩn hoá chapters: dùng ch.title (field chuẩn của library.js)
      const chapters = State.chapters.map(ch => ({
        id: ch.id,
        title: ch.title || ch.name || 'Chưa đặt tên',   // library dùng .title
        name: ch.title || ch.name || 'Chưa đặt tên',    // giữ .name để tương thích
        bookId: ch.bookId || null,
        bookName: ch.bookName || '',
        pageRange: ch.pageRange || '',
        startPage: ch.startPage || 0,
        endPage: ch.endPage || 0,
        num: ch.num || 0,
        order: ch.order ?? 0,
        vocab: (ch.vocab || []).map(v => ({
          id: v.id,
          chinese: v.chinese || '',
          pinyin: v.pinyin || '',
          vietnamese: v.vietnamese || '',
          example: v.example || '',
          audio: v.audio || ''
        }))
      }));

      // Chuẩn hoá dictation playlist
      const dictationPlaylist = (State.dictationPlaylist || []).map(p => ({
        id: p.id,
        videoId: p.videoId || '',
        url: p.url || '',
        title: p.title || 'Chưa đặt tên',
        transcript: p.transcript || '',
        totalCount: p.totalCount || 0,
        order: p.order ?? 0
      }));

      // Chuẩn hoá flashcards
      const cards = (State.cards || []).map(c => ({
        id: c.id,
        front: c.front || '',
        back: c.back || '',
        pinyin: c.pinyin || '',
        example: c.example || '',
        deck: c.deck || 'General',
        chapterId: c.chapterId || null,
        ef: c.ef || 2.5,
        interval: c.interval || 1,
        reps: c.reps || 0,
        nextReview: c.nextReview || Date.now()
      }));

      const payload = {
        id: this.GLOBAL_ROW_ID,
        name: '__global_data__',
        book_name: 'System',
        page_range: '0',
        vocab: { chapters, cards, dictationPlaylist, updatedAt: Date.now() }
      };

      const { error } = await client.from('chapters').upsert(payload);
      if (error) throw error;

      toast(`✅ Đồng bộ thành công: ${chapters.length} chương, ${cards.length} flashcards, ${dictationPlaylist.length} bài nghe`, 'success');
      return true;
    } catch (err) {
      console.error('CloudSync.pushGlobalData error:', err);
      toast('❌ Lỗi đồng bộ: ' + (err.message || JSON.stringify(err)), 'error');
      return false;
    } finally {
      if (btn) { btn.innerText = '☁️ Đồng bộ toàn bộ Kiến Thức lên Supabase'; btn.disabled = false; }
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
        if (!silent) toast('ℹ️ Chưa có dữ liệu trên cloud', 'info');
        return false;
      }

      const { chapters = [], cards = [], dictationPlaylist = [] } = data.vocab;

      // Cập nhật State
      if (chapters.length > 0) State.chapters = chapters;
      if (cards.length > 0) State.cards = cards;
      if (dictationPlaylist.length > 0) State.dictationPlaylist = dictationPlaylist;

      State.save();

      // Re-render UI
      if (typeof renderLibrary === 'function') renderLibrary();
      if (typeof renderDashboard === 'function') renderDashboard();
      if (typeof renderDictationPlaylist === 'function') renderDictationPlaylist();
      if (typeof updateXPBar === 'function') updateXPBar();

      if (!silent) toast(`☁️ Đã tải: ${chapters.length} chương, ${cards.length} flashcards, ${dictationPlaylist.length} bài nghe`, 'success');
      return true;
    } catch (err) {
      console.error('CloudSync.pullGlobalData error:', err);
      if (!silent) toast('❌ Lỗi tải dữ liệu: ' + err.message, 'error');
      return false;
    }
  },

  // ===== Tự động tải dữ liệu khi user đăng nhập =====
  async onLogin() {
    // Kéo dữ liệu cloud về (silent)
    await this.pullGlobalData(true);
  }
};

window.CloudSync = CloudSync;
