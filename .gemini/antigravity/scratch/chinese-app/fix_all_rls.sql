-- Chạy đoạn mã này trong Supabase > SQL Editor để mở quyền ghi/sửa cho tất cả 5 bảng

-- 1. Bảng users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON public.users;
CREATE POLICY "Enable all for authenticated users" ON public.users FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 2. Bảng user_settings
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON public.user_settings;
CREATE POLICY "Enable all for authenticated users" ON public.user_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 3. Bảng user_progress
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON public.user_progress;
CREATE POLICY "Enable all for authenticated users" ON public.user_progress FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 4. Bảng activity_log
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON public.activity_log;
CREATE POLICY "Enable all for authenticated users" ON public.activity_log FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 5. Bảng chapters (đã làm, làm lại cho chắc)
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON public.chapters;
CREATE POLICY "Enable all for authenticated users" ON public.chapters FOR ALL TO authenticated USING (true) WITH CHECK (true);
