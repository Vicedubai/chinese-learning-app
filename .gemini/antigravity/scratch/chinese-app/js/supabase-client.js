// ===== SUPABASE CLIENT =====
// File này sẽ kết nối với Supabase

// ⚠️ SAU KHI SETUP SUPABASE, THAY ĐỔI 2 DÒNG DƯỚI ĐÂY:
const SUPABASE_URL = 'YOUR_SUPABASE_URL'; // Thay bằng URL từ Supabase
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY'; // Thay bằng anon key từ Supabase

// Khởi tạo Supabase client
let supabase = null;

function initSupabase() {
  if (typeof supabase !== 'undefined' && supabase !== null) {
    return supabase;
  }
  
  // Kiểm tra xem đã cấu hình chưa
  if (SUPABASE_URL === 'YOUR_SUPABASE_URL' || SUPABASE_ANON_KEY === 'YOUR_SUPABASE_ANON_KEY') {
    console.warn('⚠️ Supabase chưa được cấu hình. Vui lòng cập nhật SUPABASE_URL và SUPABASE_ANON_KEY trong js/supabase-client.js');
    return null;
  }
  
  try {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('✅ Supabase client initialized');
    return supabase;
  } catch (error) {
    console.error('❌ Lỗi khởi tạo Supabase:', error);
    return null;
  }
}

// Helper functions
const SupabaseClient = {
  // Lấy client
  getClient() {
    if (!supabase) {
      supabase = initSupabase();
    }
    return supabase;
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
window.SupabaseClient = SupabaseClient;
