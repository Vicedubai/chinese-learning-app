// ===== AUTHENTICATION SYSTEM =====

const Auth = {
  currentUser: null,
  isAdmin: false,

  // Khởi tạo
  async init() {
    const client = DBClient.getClient();
    if (!client) {
      console.log('ℹ️ Supabase not configured, using guest mode');
      this.updateUI();
      return;
    }

    // Kiểm tra session hiện tại
    const user = await DBClient.getCurrentUser();
    if (user) {
      await this.handleUserLogin(user);
    }

    // Lắng nghe thay đổi auth state
    client.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event);
      if (event === 'SIGNED_IN' && session?.user) {
        await this.handleUserLogin(session.user);
      } else if (event === 'SIGNED_OUT') {
        this.handleUserLogout();
      }
    });

    this.updateUI();
  },

  // Xử lý khi user đăng nhập
  async handleUserLogin(user) {
    this.currentUser = user;
    
    // Kiểm tra xem user đã có trong database chưa
    const client = DBClient.getClient();
    const { data: userData, error } = await client
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error && error.code === 'PGRST116') {
      // User chưa có trong database, tạo mới
      await this.createUserRecord(user);
      // Hardcode admin for specific email
      if (user.email === 'vuducanh1628@gmail.com') {
        this.isAdmin = true;
      }
    } else if (userData) {
      this.isAdmin = userData.role === 'admin' || user.email === 'vuducanh1628@gmail.com';
      
      // Cập nhật last_login
      await client
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', user.id);
    }

    // Log activity
    await this.logActivity('login', { email: user.email });

    this.updateUI();
    
    // Phát event để các module khác lắng nghe
    document.dispatchEvent(new CustomEvent('auth:loggedin', { detail: { user } }));
    
    if (typeof toast === 'function') {
      toast(`👋 Chào ${user.email}!`, 'success');
    }

    // Khởi tạo Settings và Admin
    if (typeof Settings !== 'undefined') {
      Settings.init();
    }
    if (this.isAdmin && typeof Admin !== 'undefined') {
      Admin.init();
    }
  },

  // Tạo user record mới
  async createUserRecord(user) {
    const client = DBClient.getClient();
    const { error } = await client
      .from('users')
      .insert({
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name || user.email.split('@')[0],
        role: 'user',
        avatar_url: user.user_metadata?.avatar_url
      });

    if (error) {
      console.error('Error creating user record:', error);
    }
  },

  // Xử lý khi user đăng xuất
  handleUserLogout() {
    this.currentUser = null;
    this.isAdmin = false;
    this.updateUI();
    
    // Phát event để các module khác lắng nghe
    document.dispatchEvent(new CustomEvent('auth:loggedout'));
    
    if (typeof toast === 'function') {
      toast('👋 Đã đăng xuất', 'info');
    }
  },

  // Đăng nhập bằng email/password
  async loginWithEmail(email, password) {
    const client = DBClient.getClient();
    if (!client) {
      if (typeof toast === 'function') {
        toast('❌ Supabase chưa được cấu hình', 'error');
      }
      return { error: 'Supabase not configured' };
    }

    try {
      const { data, error } = await client.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      return { data };
    } catch (error) {
      console.error('Login error:', error);
      if (typeof toast === 'function') {
        toast(`❌ Lỗi đăng nhập: ${error.message}`, 'error');
      }
      return { error };
    }
  },

  // Đăng ký bằng email/password
  async signupWithEmail(email, password, name) {
    const client = DBClient.getClient();
    if (!client) {
      console.error('Supabase client not available');
      if (typeof toast === 'function') {
        toast('❌ Supabase chưa được cấu hình', 'error');
      }
      return { error: 'Supabase not configured' };
    }

    console.log('Attempting signup with:', { email, name });

    try {
      const { data, error } = await client.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name || email.split('@')[0]
          },
          emailRedirectTo: window.location.origin
        }
      });

      if (error) {
        console.error('Signup error from Supabase:', error);
        throw error;
      }
      
      console.log('Signup response:', data);
      
      if (typeof toast === 'function') {
        if (data.user && data.user.identities && data.user.identities.length === 0) {
          toast('⚠️ Email này đã được đăng ký. Vui lòng đăng nhập.', 'error');
        } else {
          toast('✅ Đăng ký thành công! Bạn có thể đăng nhập ngay.', 'success');
        }
      }
      
      return { data };
    } catch (error) {
      console.error('Signup exception:', error);
      if (typeof toast === 'function') {
        toast(`❌ Lỗi đăng ký: ${error.message}`, 'error');
      }
      return { error };
    }
  },

  // Đăng xuất
  async logout() {
    const client = DBClient.getClient();
    if (!client) return;

    try {
      // Ép giao diện phản hồi ngay lập tức để user không phải chờ
      this.handleUserLogout();
      
      const { error } = await client.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Logout error:', error);
      if (typeof toast === 'function') {
        toast(`❌ Lỗi đăng xuất: ${error.message}`, 'error');
      }
    }
  },

  // Log activity
  async logActivity(action, details = {}) {
    if (!this.currentUser) return;

    const client = DBClient.getClient();
    if (!client) return;

    try {
      await client
        .from('activity_log')
        .insert({
          user_id: this.currentUser.id,
          action,
          details
        });
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  },

  // Cập nhật UI
  updateUI() {
    const userInfoEl = document.getElementById('user-info');
    const loginBtnEl = document.getElementById('login-btn');
    const adminPanelEl = document.getElementById('admin-panel-nav');

    if (!userInfoEl || !loginBtnEl) return;

    if (this.currentUser) {
      // Đã đăng nhập
      userInfoEl.style.display = 'block';
      loginBtnEl.style.display = 'none';
      
      const emailEl = document.getElementById('user-email');
      const nameEl = document.getElementById('user-name');
      
      if (emailEl) emailEl.textContent = this.currentUser.email;
      if (nameEl) nameEl.textContent = this.currentUser.user_metadata?.name || 'User';

      // Hiện admin panel nếu là admin
      if (adminPanelEl) {
        adminPanelEl.style.display = this.isAdmin ? 'block' : 'none';
      }
    } else {
      // Chưa đăng nhập (Guest)
      userInfoEl.style.display = 'none';
      loginBtnEl.style.display = 'block';
      
      if (adminPanelEl) {
        adminPanelEl.style.display = 'none';
      }
    }
  }
};

// Khởi tạo khi load trang
document.addEventListener('DOMContentLoaded', () => {
  Auth.init();
});

// Export
window.Auth = Auth;
