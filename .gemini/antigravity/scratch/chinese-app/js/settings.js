// ===== SETTINGS PAGE =====

const Settings = {
  // Khởi tạo
  init() {
    this.loadSettings();
    this.updateUI();
  },

  // Load settings từ localStorage hoặc Supabase
  async loadSettings() {
    // Nếu đã đăng nhập, load từ Supabase
    if (Auth.currentUser) {
      await this.loadFromSupabase();
    } else {
      // Guest mode, load từ localStorage
      this.loadFromLocalStorage();
    }
  },

  // Load từ Supabase
  async loadFromSupabase() {
    const client = SupabaseClient.getClient();
    if (!client) return;

    try {
      const { data, error } = await client
        .from('user_settings')
        .select('*')
        .eq('user_id', Auth.currentUser.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        // Apply settings
        if (data.theme) this.applyTheme(data.theme);
        if (data.settings) {
          // Apply other settings
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  },

  // Load từ localStorage
  loadFromLocalStorage() {
    const theme = localStorage.getItem('theme') || 'dark';
    this.applyTheme(theme);
  },

  // Save settings
  async saveSettings(settings) {
    if (Auth.currentUser) {
      await this.saveToSupabase(settings);
    } else {
      this.saveToLocalStorage(settings);
    }
  },

  // Save to Supabase
  async saveToSupabase(settings) {
    const client = SupabaseClient.getClient();
    if (!client) return;

    try {
      const { error } = await client
        .from('user_settings')
        .upsert({
          user_id: Auth.currentUser.id,
          ...settings,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      
      if (typeof toast === 'function') {
        toast('✅ Đã lưu cài đặt', 'success');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      if (typeof toast === 'function') {
        toast('❌ Lỗi lưu cài đặt', 'error');
      }
    }
  },

  // Save to localStorage
  saveToLocalStorage(settings) {
    Object.keys(settings).forEach(key => {
      localStorage.setItem(key, settings[key]);
    });
    
    if (typeof toast === 'function') {
      toast('✅ Đã lưu cài đặt', 'success');
    }
  },

  // Apply theme
  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  },

  // Update UI
  updateUI() {
    const settingsPage = document.getElementById('page-settings');
    if (!settingsPage) return;

    // Update account section
    const accountSection = document.getElementById('settings-account');
    if (accountSection) {
      if (Auth.currentUser) {
        accountSection.innerHTML = `
          <div style="background:var(--bg-2);padding:16px;border-radius:8px;margin-bottom:16px">
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">
              <div style="width:50px;height:50px;border-radius:50%;background:var(--gold);display:flex;align-items:center;justify-content:center;font-size:24px">👤</div>
              <div style="flex:1">
                <div style="font-weight:600;margin-bottom:4px">${Auth.currentUser.user_metadata?.name || 'User'}</div>
                <div style="font-size:13px;color:var(--text-3)">${Auth.currentUser.email}</div>
              </div>
            </div>
            <button class="btn btn-ghost w-full" onclick="Auth.logout()">🚪 Đăng xuất</button>
          </div>
        `;
      } else {
        accountSection.innerHTML = `
          <div style="background:var(--bg-2);padding:16px;border-radius:8px;text-align:center">
            <p style="margin-bottom:12px;color:var(--text-2)">Bạn đang dùng chế độ Guest</p>
            <button class="btn btn-primary w-full" onclick="openModal('modal-login')">🔐 Đăng nhập để lưu tiến độ</button>
          </div>
        `;
      }
    }
  }
};

// Export
window.Settings = Settings;
