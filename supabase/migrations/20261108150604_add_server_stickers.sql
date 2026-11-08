/*
# Add custom server stickers

1. New tables
- `server_stickers`: images and animated GIFs that members add to a server's sticker picker.
  - `id` (uuid, primary key)
  - `server_id` (uuid, required): the server the sticker belongs to. Deleted with the server.
  - `created_by` (uuid, optional): the member who added it. Cleared if that member is removed.
  - `name` (text, 1 to 32 characters): shown as the sticker's tooltip.
  - `image_url` (text, required): public https link to the uploaded image in file storage.
  - `created_at` (timestamp)

2. Security
- Row level security is enabled. The app has no sign-in, so anonymous and signed-in clients both have access.
- Anyone can read stickers and add new ones. There is no update or delete access.
- Only https image links can be stored, enforced by a check constraint.

3. Notes
- Image files themselves are stored in the existing `profile-media` bucket under a per-server folder.
*/

CREATE TABLE IF NOT EXISTS server_stickers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  server_id uuid NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
  created_by uuid REFERENCES members(id) ON DELETE SET NULL,
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 32),
  image_url text NOT NULL CHECK (image_url LIKE 'https://%'),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS server_stickers_server_id_idx ON server_stickers (server_id, created_at);

ALTER TABLE server_stickers ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT ON server_stickers TO anon, authenticated;

DROP POLICY IF EXISTS "anon_select_server_stickers" ON server_stickers;
CREATE POLICY "anon_select_server_stickers" ON server_stickers FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_server_stickers" ON server_stickers;
CREATE POLICY "anon_insert_server_stickers" ON server_stickers FOR INSERT
  TO anon, authenticated WITH CHECK (true);
