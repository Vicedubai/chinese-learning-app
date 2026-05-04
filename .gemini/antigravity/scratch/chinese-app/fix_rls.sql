-- Chạy đoạn mã này trong Supabase > SQL Editor để sửa lỗi RLS
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.chapters;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.chapters;
DROP POLICY IF EXISTS "Enable read for authenticated users" ON public.chapters;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.chapters;

CREATE POLICY "Enable read for authenticated users" ON public.chapters FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable insert for authenticated users" ON public.chapters FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON public.chapters FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Enable delete for authenticated users" ON public.chapters FOR DELETE TO authenticated USING (true);
