// ===== ADMIN PANEL =====

const Admin = {
  users: [],
  stats: {},

  // Khởi tạo
  async init() {
    if (!Auth.isAdmin) {
      console.log('Not admin, skipping admin init');
      return;
    }

    await this.loadStats();
    await this.loadUsers();
    this.renderDashboard();
  },

  // Load thống kê
  async loadStats() {
    const client = DBClient.getClient();
    if (!client) return;

    try {
      // Đếm users
      const { count: userCount } = await client
        .from('users')
        .select('*', { count: 'exact', head: true });

      // Đếm chapters
      const { count: chapterCount } = await client
        .from('chapters')
        .select('*', { count: 'exact', head: true });

      // Đếm total flashcards
      const totalCards = State.cards.length;

      // Active users (7 ngày)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { count: activeUsers } = await client
        .from('users')
        .select('*', { count: 'exact', head: true })
        .gte('last_login', sevenDaysAgo.toISOString());

      this.stats = {
        totalUsers: userCount || 0,
        totalChapters: chapterCount || 0,
        totalCards: totalCards,
        activeUsers: activeUsers || 0
      };
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  },

  // Load danh sách users
  async loadUsers() {
    const client = DBClient.getClient();
    if (!client) return;

    try {
      const { data, error } = await client
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      this.users = data || [];
    } catch (error) {
      console.error('Error loading users:', error);
    }
  },

  // Render dashboard
  renderDashboard() {
    const statsEl = document.getElementById('admin-stats');
    if (statsEl) {
      statsEl.innerHTML = `
        <div class="grid-4" style="margin-bottom:24px">
          <div class="stat-card" style="--accent:var(--blue)">
            <div class="stat-icon">👥</div>
            <div class="stat-value">${this.stats.totalUsers}</div>
            <div class="stat-label">Tổng users</div>
          </div>
          <div class="stat-card" style="--accent:var(--green)">
            <div class="stat-icon">📚</div>
            <div class="stat-value">${this.stats.totalChapters}</div>
            <div class="stat-label">Tổng chapters</div>
          </div>
          <div class="stat-card" style="--accent:var(--gold)">
            <div class="stat-icon">🃏</div>
            <div class="stat-value">${this.stats.totalCards}</div>
            <div class="stat-label">Tổng flashcards</div>
          </div>
          <div class="stat-card" style="--accent:var(--purple)">
            <div class="stat-icon">📈</div>
            <div class="stat-value">${this.stats.activeUsers}</div>
            <div class="stat-label">Active (7 ngày)</div>
          </div>
        </div>
      `;
    }

    this.renderUserList();
    this.renderActivityLog();
  },

  // Render danh sách users
  renderUserList() {
    const listEl = document.getElementById('admin-user-list');
    if (!listEl) return;

    if (this.users.length === 0) {
      listEl.innerHTML = '<p class="text-muted text-center">Chưa có user nào</p>';
      return;
    }

    listEl.innerHTML = this.users.map(user => `
      <div class="card" style="padding:12px;margin-bottom:8px">
        <div style="display:flex;align-items:center;gap:12px">
          <div style="width:40px;height:40px;border-radius:50%;background:${user.role === 'admin' ? 'var(--gold)' : 'var(--blue)'};display:flex;align-items:center;justify-content:center">
            ${user.role === 'admin' ? '👑' : '👤'}
          </div>
          <div style="flex:1;min-width:0">
            <div style="font-weight:600;font-size:14px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">
              ${user.name || 'User'}
              ${user.role === 'admin' ? '<span style="color:var(--gold);font-size:12px;margin-left:8px">ADMIN</span>' : ''}
            </div>
            <div style="font-size:12px;color:var(--text-3);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${user.email}</div>
            <div style="font-size:11px;color:var(--text-3);margin-top:4px">
              Tham gia: ${new Date(user.created_at).toLocaleDateString('vi-VN')}
              ${user.last_login ? ` • Đăng nhập: ${new Date(user.last_login).toLocaleDateString('vi-VN')}` : ''}
            </div>
          </div>
          <div style="display:flex;gap:8px">
            <button class="btn btn-ghost btn-sm" onclick="Admin.viewUserProgress('${user.id}')" title="Xem tiến độ">👁️</button>
            ${user.role !== 'admin' ? `<button class="btn btn-ghost btn-sm" onclick="Admin.deleteUser('${user.id}')" title="Xóa user" style="color:var(--red)">🗑️</button>` : ''}
          </div>
        </div>
      </div>
    `).join('');
  },

  // Render activity log
  async renderActivityLog() {
    const logEl = document.getElementById('admin-activity-log');
    if (!logEl) return;

    const client = DBClient.getClient();
    if (!client) return;

    try {
      const { data, error } = await client
        .from('activity_log')
        .select(`
          *,
          users (email, name)
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      if (!data || data.length === 0) {
        logEl.innerHTML = '<p class="text-muted text-center">Chưa có hoạt động nào</p>';
        return;
      }

      logEl.innerHTML = data.map(log => {
        const time = new Date(log.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        const userName = log.users?.name || log.users?.email || 'Unknown';
        return `
          <div style="padding:8px 0;border-bottom:1px solid var(--border);font-size:13px">
            <span style="color:var(--text-3)">${time}</span> - 
            <span style="color:var(--text-2)">${userName}</span> 
            <span>${this.getActionText(log.action)}</span>
          </div>
        `;
      }).join('');
    } catch (error) {
      console.error('Error loading activity log:', error);
      logEl.innerHTML = '<p class="text-muted text-center">Lỗi tải activity log</p>';
    }
  },

  // Get action text
  getActionText(action) {
    const actionMap = {
      'login': 'đăng nhập',
      'logout': 'đăng xuất',
      'signup': 'đăng ký',
      'study_flashcard': 'học flashcard',
      'complete_exercise': 'hoàn thành bài tập',
      'add_chapter': 'thêm chương mới'
    };
    return actionMap[action] || action;
  },

  // Xem tiến độ user
  async viewUserProgress(userId) {
    const client = DBClient.getClient();
    if (!client) return;

    try {
      const { data, error } = await client
        .from('user_progress')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;

      // Hiển thị trong modal
      const user = this.users.find(u => u.id === userId);
      const modalBody = document.getElementById('admin-user-progress-body');
      if (modalBody) {
        modalBody.innerHTML = `
          <h3 style="margin-bottom:16px">${user?.name || 'User'}</h3>
          ${data && data.length > 0 ? `
            <div style="max-height:400px;overflow-y:auto">
              ${data.map(progress => `
                <div class="card" style="padding:12px;margin-bottom:8px">
                  <div style="font-weight:600;margin-bottom:4px">Chapter: ${progress.chapter_id}</div>
                  <div style="font-size:13px;color:var(--text-2)">
                    XP: ${progress.xp || 0} • 
                    Streak: ${progress.streak || 0} • 
                    Cards: ${progress.cards_studied?.length || 0}
                  </div>
                </div>
              `).join('')}
            </div>
          ` : '<p class="text-muted text-center">Chưa có tiến độ học</p>'}
        `;
        openModal('modal-admin-user-progress');
      }
    } catch (error) {
      console.error('Error viewing user progress:', error);
      if (typeof toast === 'function') {
        toast('❌ Lỗi tải tiến độ user', 'error');
      }
    }
  },

  // Xóa user
  async deleteUser(userId) {
    if (!confirm('Bạn có chắc muốn xóa user này? Hành động này không thể hoàn tác!')) {
      return;
    }

    const client = DBClient.getClient();
    if (!client) return;

    try {
      const { error } = await client
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      if (typeof toast === 'function') {
        toast('✅ Đã xóa user', 'success');
      }

      // Reload users
      await this.loadUsers();
      this.renderUserList();
    } catch (error) {
      console.error('Error deleting user:', error);
      if (typeof toast === 'function') {
        toast('❌ Lỗi xóa user', 'error');
      }
    }
  },

  // Sync chapters to Supabase
  async syncChaptersToSupabase() {
    const client = DBClient.getClient();
    if (!client) return;

    try {
      // Lấy chapters từ State
      const chapters = State.chapters.map(ch => ({
        id: ch.id,
        name: ch.name,
        book_name: ch.bookName || '',
        page_range: ch.pageRange || '',
        vocab: ch.vocab || [],
        created_by: Auth.currentUser?.id
      }));

      // Upsert vào Supabase
      const { error } = await client
        .from('chapters')
        .upsert(chapters);

      if (error) throw error;

      if (typeof toast === 'function') {
        toast(`✅ Đã đồng bộ ${chapters.length} chapters lên Supabase`, 'success');
      }
    } catch (error) {
      console.error('Error syncing chapters:', error);
      if (typeof toast === 'function') {
        toast('❌ Lỗi đồng bộ chapters', 'error');
      }
    }
  }
};

// Export
window.Admin = Admin;
