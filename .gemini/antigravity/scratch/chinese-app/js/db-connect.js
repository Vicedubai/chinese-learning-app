// ===== SUPABASE CLIENT =====
// File này sẽ kết nối với Supabase

const SUPABASE_URL = 'https://kangjlimeanujfpjissp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImthbmdqbGltZWFudWpmcGppc3NwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4MjA5NTQsImV4cCI6MjA5MzM5Njk1NH0.B1H8hrN3HklEovKvm0p8zWWcQmmcuBrVtgl2osXAC7Q';

// Khởi tạo Supabase client
let supabaseInstance = null;

function initSupabase() {
  if (typeof supabaseInstance !== 'undefined' && supabaseInstance !== null) {
    return supabaseInstance;
  }
  
  // Kiểm tra xem đã cấu hình chưa
  if (SUPABASE_URL === 'YOUR_SUPABASE_URL' || SUPABASE_ANON_KEY === 'YOUR_SUPABASE_ANON_KEY') {
    console.warn('⚠️ Supabase chưa được cấu hình. Vui lòng cập nhật SUPABASE_URL và SUPABASE_ANON_KEY trong js/supabase-client.js');
    return null;
  }
  
  try {
    supabaseInstance = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('✅ Supabase client initialized');
    return supabaseInstance;
  } catch (error) {
    console.error('❌ Lỗi khởi tạo Supabase:', error);
    return null;
  }
}

// Helper functions
const DBClient = {
  // Lấy client
  getClient() {
    if (!supabaseInstance) {
      supabaseInstance = initSupabase();
    }
    return supabaseInstance;
  },
  
  // Kiểm tra đã cấu hình chưa
  isConfigured() {
    return SUPABASE_URL !== 'YOUR_SUPABASE_URL' && 
           SUPABASE_ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY';
  },
  
  // Kiểm tra user đã đăng nhập chưa
  async getCurrentUser() {
    const client = this.getClient();
    if (!client) return null;
    
    try {
      const { data: { user }, error } = await client.auth.getUser();
      if (error) throw error;
      return user;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },
  
  // Kiểm tra user có phải admin không
  async isAdmin() {
    const user = await this.getCurrentUser();
    if (!user) return false;
    
    const client = this.getClient();
    try {
      const { data, error } = await client
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      return data?.role === 'admin';
    } catch (error) {
      console.error('Error checking admin:', error);
      return false;
    }
  }
};

// Export
window.DBClient = DBClient;
