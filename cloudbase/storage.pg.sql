-- CloudBase PostgreSQL 模式日记图片存储配置。
-- 公开页面可读取图片，仅唯一管理员可在自己的 UID 目录内写入。

INSERT INTO storage.buckets (
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types,
    created_at,
    updated_at
)
VALUES (
    'diary-images',
    'diary-images',
    true,
    8388608,
    ARRAY['image/jpeg', 'image/png', 'image/webp']::text[],
    now(),
    now()
)
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types,
    updated_at = now();

DROP POLICY IF EXISTS diary_images_bucket_select ON storage.buckets;
CREATE POLICY diary_images_bucket_select ON storage.buckets
    FOR SELECT TO anon, authenticated
    USING (id = 'diary-images');

DROP POLICY IF EXISTS diary_images_public_read ON storage.objects;
CREATE POLICY diary_images_public_read ON storage.objects
    FOR SELECT TO anon, authenticated
    USING (bucket_id = 'diary-images');

DROP POLICY IF EXISTS diary_images_admin_insert ON storage.objects;
CREATE POLICY diary_images_admin_insert ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (
        bucket_id = 'diary-images'
        AND auth.uid() = '2087809843698028545'
        AND (storage.foldername(name))[1] = auth.uid()
    );

DROP POLICY IF EXISTS diary_images_admin_update ON storage.objects;
CREATE POLICY diary_images_admin_update ON storage.objects
    FOR UPDATE TO authenticated
    USING (
        bucket_id = 'diary-images'
        AND auth.uid() = '2087809843698028545'
        AND (storage.foldername(name))[1] = auth.uid()
    )
    WITH CHECK (
        bucket_id = 'diary-images'
        AND auth.uid() = '2087809843698028545'
        AND (storage.foldername(name))[1] = auth.uid()
    );

DROP POLICY IF EXISTS diary_images_admin_delete ON storage.objects;
CREATE POLICY diary_images_admin_delete ON storage.objects
    FOR DELETE TO authenticated
    USING (
        bucket_id = 'diary-images'
        AND auth.uid() = '2087809843698028545'
        AND (storage.foldername(name))[1] = auth.uid()
    );
