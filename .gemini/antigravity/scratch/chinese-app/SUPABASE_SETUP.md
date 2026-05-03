# 🚀 SETUP SUPABASE - ĐỒNG BỘ TỰ ĐỘNG

## Bước 1: Tạo project Supabase (2 phút)

1. Truy cập: https://supabase.com
2. Sign up (dùng GitHub hoặc email)
3. **New Project**:
   - Name: `chinese-learning-app`
   - Database Password: (tạo password mạnh)
   - Region: **Southeast Asia (Singapore)** (gần VN nhất)
4. Đợi 2 phút để project khởi tạo

## Bước 2: Tạo bảng database (1 phút)

Vào **SQL Editor** → chạy script này:

```sql
-- Bảng lưu dữ liệu người dùng
CREATE TABLE user_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL,
  chapters JSONB DEFAULT '[]'::jsonb,
  cards JSONB DEFAULT '[]'::jsonb,
  progress JSONB DEFAULT '{}'::jsonb,
  settings JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index để tìm kiếm nhanh
CREATE INDEX idx_user_id ON user_data(user_id);

-- Tự động cập nhật updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
BEFORE UPDATE ON user_data
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();
```

## Bước 3: Lấy API credentials

1. Vào **Settings → API**
2. Copy 2 thông tin này:
   - **Project URL**: `https://xxx.supabase.co`
   - **anon public key**: `eyJhbGc...`

## Bước 4: Cấu hình trong app

Thêm vào file `js/core.js`:

```javascript
// Supabase config
window.SUPABASE_URL = 'https://xxx.supabase.co';
window.SUPABASE_KEY = 'eyJhbGc...';
```

---

## ✨ Tính năng

- ✅ **Tự động sync** mỗi 10 giây khi có thay đổi
- ✅ **Offline-first**: Vẫn dùng được khi mất mạng
- ✅ **Conflict resolution**: Tự động merge khi có xung đột
- ✅ **Unlimited devices**: Dùng trên bao nhiêu thiết bị cũng được
- ✅ **500MB storage**: Đủ cho hàng nghìn flashcards

---

## 🎯 Cách dùng

**Không cần làm gì!** App sẽ tự động:
1. Tạo user ID duy nhất cho bạn (lưu trong localStorage)
2. Sync dữ liệu mỗi khi bạn thêm/sửa flashcard
3. Tải dữ liệu khi mở app trên thiết bị mới

**Trên thiết bị mới:**
- Mở app → Vào Settings → Nhập **User ID** (copy từ thiết bị cũ)
- Hoặc scan QR code để sync nhanh
