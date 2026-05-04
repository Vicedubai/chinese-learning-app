// ===== AUTO SYNC - Tự động đồng bộ với Railway Backend =====

const AutoSync = {
  enabled: false,
  interval: null,
  syncIntervalMs: 10000, // 10 giây
  lastSyncTime: 0,
  isSyncing: false,
  hasChanges: false,

  // Khởi động auto sync
  start() {
    this.enabled = true;
    this.loadFromServer(); // Tải dữ liệu khi mở app
    
    // Sync định kỳ
    this.interval = setInterval(() => {
      if (this.hasChanges && !this.isSyncing) {
        this.syncToServer();
      }
    }, this.syncIntervalMs);

    // Sync khi đóng tab
    window.addEventListener('beforeunload', () => {
      if (this.hasChanges) {
        this.syncToServer(true); // Sync đồng bộ
      }
    });

    // Sync khi có thay đổi
    this.watchChanges();
    
    console.log('✅ Auto-sync enabled');
  },

  stop() {
    this.enabled = false;
    if (this.interval) clearInterval(this.interval);
  },

  // Theo dõi thay đổi
  watchChanges() {
    const originalSave = State.save;
    State.save = function() {
      originalSave.call(State);
      AutoSync.hasChanges = true;
      AutoSync.updateSyncStatus('pending');
    };
  },

  // Đồng bộ lên server (cá nhân)
  async syncToServer(isSync = false) {
    if (this.isSyncing) return;
    
    this.isSyncing = true;
    this.updateSyncStatus('syncing');
    const client = DBClient.getClient();

    try {
      if (!client) throw new Error("Supabase client not initialized");
      
      const user = await DBClient.getCurrentUser();
      if (!user) {
        throw new Error("Người dùng chưa đăng nhập");
      }

      const fullState = {
        books: State.books || [],
        chapters: State.chapters || [],
        cards: State.cards || [],
        dictationPlaylist: State.dictationPlaylist || [],
        writingTopics: State.writingTopics || [],
        progress: State.progress,
        timestamp: Date.now()
      };

      const { error } = await client
        .from('user_settings')
        .upsert({ 
          user_id: user.id,
          settings: fullState
        });

      if (error) throw error;

      this.hasChanges = false;
      this.lastSyncTime = Date.now();
      this.updateSyncStatus('synced');
      
      if (typeof toast === 'function') {
        toast('✅ Đã đồng bộ tiến trình học lên Supabase', 'success');
      }
    } catch (error) {
      console.error('❌ Sync failed:', error);
      this.updateSyncStatus('error');
      
      if (typeof toast === 'function') {
        toast(`❌ Lỗi đồng bộ: ${error.message}`, 'error');
      }
    } finally {
      this.isSyncing = false;
    }
  },

  // Tải dữ liệu từ server
  async loadFromServer() {
    this.updateSyncStatus('loading');
    const client = DBClient.getClient();
    if (!client) return;

    try {
      // 1. Tải toàn bộ chapters
      const { data: chaptersData, error: chError } = await client
        .from('chapters')
        .select('*');

      if (chError) throw chError;

      // Phân loại data
      let normalChapters = [];
      let globalData = null;

      if (chaptersData) {
        normalChapters = chaptersData.filter(ch => ch.id !== 'global_data');
        const globalRow = chaptersData.find(ch => ch.id === 'global_data');
        if (globalRow && globalRow.vocab) {
          globalData = globalRow.vocab;
        }
      }

      const serverData = {
        chapters: normalChapters,
        cards: globalData?.cards || [],
        dictationPlaylist: globalData?.dictationPlaylist || [],
        writingTopics: globalData?.writingTopics || []
      };

      // Tải settings và progress của user hiện tại
      const user = await DBClient.getCurrentUser();
      if (user) {
        const { data: userData } = await client
          .from('user_settings')
          .select('settings')
          .eq('user_id', user.id)
          .single();
          
        if (userData && userData.settings && userData.settings.progress) {
          serverData.progress = userData.settings.progress;
        }
      }
      
      // Merge dữ liệu thông minh
      this.mergeData(serverData);
      
      this.lastSyncTime = Date.now();
      this.updateSyncStatus('synced');
      
      console.log('✅ Loaded from Supabase');
    } catch (error) {
      console.error('❌ Load failed:', error);
      this.updateSyncStatus('error');
    }
  },

  // Merge dữ liệu từ server với local
  mergeData(serverData) {
    let hasUpdates = false;

    // Merge chapters
    if (serverData.chapters && Array.isArray(serverData.chapters)) {
      const localIds = new Set(State.chapters.map(c => c.id));
      serverData.chapters.forEach(ch => {
        if (!localIds.has(ch.id)) {
          State.chapters.push(ch);
          hasUpdates = true;
        }
      });
    }

    // Merge cards
    if (serverData.cards && Array.isArray(serverData.cards)) {
      const localIds = new Set(State.cards.map(c => c.id));
      serverData.cards.forEach(card => {
        const localCard = State.cards.find(c => c.id === card.id);
        if (!localCard) {
          State.cards.push(card);
          hasUpdates = true;
        } else {
          // Giữ dữ liệu mới nhất (dựa vào nextReview)
          if (card.nextReview && (!localCard.nextReview || card.nextReview > localCard.nextReview)) {
            Object.assign(localCard, card);
            hasUpdates = true;
          }
        }
      });
    }

    // Merge progress
    if (serverData.progress) {
      State.progress.xp = Math.max(State.progress.xp || 0, serverData.progress.xp || 0);
      State.progress.streak = Math.max(State.progress.streak || 0, serverData.progress.streak || 0);
      
      // Merge results
      if (serverData.progress.results) {
        const localTs = new Set((State.progress.results || []).map(r => r.t));
        serverData.progress.results.forEach(r => {
          if (!localTs.has(r.t)) {
            State.progress.results.push(r);
            hasUpdates = true;
          }
        });
      }
    }

    if (hasUpdates) {
      State.save();
      renderLibrary();
      renderDashboard();
      updateXPBar();
      toast('🔄 Đã đồng bộ dữ liệu từ server', 'success');
    }
  },

  // Cập nhật trạng thái sync
  updateSyncStatus(status) {
    const statusEl = document.getElementById('auto-sync-status');
    if (!statusEl) return;

    const statusMap = {
      synced: { icon: '✅', text: 'Đã đồng bộ', color: 'var(--green-light)' },
      syncing: { icon: '🔄', text: 'Đang đồng bộ...', color: 'var(--blue)' },
      loading: { icon: '⬇️', text: 'Đang tải...', color: 'var(--blue)' },
      pending: { icon: '⏳', text: 'Chờ đồng bộ...', color: 'var(--gold)' },
      error: { icon: '❌', text: 'Lỗi đồng bộ', color: 'var(--red-light)' },
      disabled: { icon: '⚪', text: 'Tắt', color: 'var(--text-3)' }
    };

    const s = statusMap[status] || statusMap.disabled;
    statusEl.innerHTML = `<span style="color:${s.color}">${s.icon} ${s.text}</span>`;

    // Hiển thị thời gian sync cuối
    if (status === 'synced' && this.lastSyncTime) {
      const timeAgo = this.getTimeAgo(this.lastSyncTime);
      statusEl.innerHTML += ` <span style="color:var(--text-3);font-size:11px">(${timeAgo})</span>`;
    }
  },

  // Tính thời gian đã qua
  getTimeAgo(timestamp) {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'vừa xong';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} phút trước`;
    return `${Math.floor(seconds / 3600)} giờ trước`;
  },

  // Toggle auto sync
  toggle() {
    if (this.enabled) {
      this.stop();
      this.updateSyncStatus('disabled');
      if (typeof toast === 'function') {
        toast('⏸️ Đã tắt tự động đồng bộ', 'info');
      }
    } else {
      this.start();
      if (typeof toast === 'function') {
        toast('▶️ Đã bật tự động đồng bộ', 'success');
      }
    }
  },

  // Debug: Kiểm tra kết nối
  async testConnection() {
    try {
      const url = `${window.API_BASE_URL}/`;
      console.log('🧪 Testing connection to:', url);
      
      const response = await fetch(url);
      if (response.ok) {
        if (typeof toast === 'function') {
          toast('✅ Kết nối backend thành công!', 'success');
        }
        console.log('✅ Backend is online');
        return true;
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Connection test failed:', error);
      if (typeof toast === 'function') {
        toast(`❌ Không thể kết nối backend: ${error.message}`, 'error');
      }
      return false;
    }
  }
};

// Khởi động và quản lý sidebar sync theo auth state
document.addEventListener('DOMContentLoaded', () => {
  // Cập nhật sidebar dựa theo trạng thái đăng nhập
  function updateSidebarSync() {
    const guestEl = document.getElementById('sidebar-guest-sync');
    const userEl = document.getElementById('sidebar-user-sync');
    const isLoggedIn = !!(window.Auth && Auth.currentUser);

    if (guestEl) guestEl.style.display = isLoggedIn ? 'none' : 'block';
    if (userEl) userEl.style.display = isLoggedIn ? 'block' : 'none';

    // Cập nhật status text
    const statusEl = document.getElementById('auto-sync-status');
    if (statusEl) {
      if (isLoggedIn) {
        const name = Auth.currentUser.email?.split('@')[0] || 'Đã đăng nhập';
        statusEl.innerHTML = `<span style="color:var(--green-light)">✅ ${name}</span>`;
      } else {
        statusEl.innerHTML = `<span style="color:var(--text-3)">☁️ Chưa đăng nhập</span>`;
      }
    }
  }

  // Gọi ngay khi load
  updateSidebarSync();

  // Cập nhật khi auth thay đổi
  document.addEventListener('auth:loggedin', updateSidebarSync);
  document.addEventListener('auth:loggedout', () => {
    updateSidebarSync();
    AutoSync.updateSyncStatus('disabled');
  });

  // KHÔNG gọi AutoSync.start() hay loadFromServer() nữa
  // CloudSync.pullGlobalData() là cơ chế đồng bộ duy nhất
});

