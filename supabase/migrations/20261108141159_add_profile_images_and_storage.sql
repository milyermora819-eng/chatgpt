/*
# Add profile avatar and banner images

1. Modified tables
- `members`: adds `avatar_url` and `banner_url` (optional text links to an uploaded image). Empty means no image is set and the color is shown instead.

2. New storage
- Public bucket `profile-media` for avatar and banner images.
- Accepts PNG, JPEG, GIF, and WebP files up to 8 MB. Animated GIFs are kept as-is.

3. Security
- Bucket file types and size are enforced by the storage service, not only in the app.
- Anonymous and signed-in clients can read and upload objects in `profile-media` only. No update or delete is granted, so uploaded files cannot be overwritten or removed by other visitors.
- Existing grants on `members` already cover the new columns.
*/

ALTER TABLE members ADD COLUMN IF NOT EXISTS avatar_url text;
ALTER TABLE members ADD COLUMN IF NOT EXISTS banner_url text;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-media',
  'profile-media',
  true,
  8388608,
  ARRAY['image/png', 'image/jpeg', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "anon_select_profile_media" ON storage.objects;
CREATE POLICY "anon_select_profile_media" ON storage.objects FOR SELECT
  TO anon, authenticated USING (bucket_id = 'profile-media');

DROP POLICY IF EXISTS "anon_insert_profile_media" ON storage.objects;
CREATE POLICY "anon_insert_profile_media" ON storage.objects FOR INSERT
  TO anon, authenticated WITH CHECK (bucket_id = 'profile-media');
