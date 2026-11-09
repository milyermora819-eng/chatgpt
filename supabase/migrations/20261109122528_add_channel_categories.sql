/*
# Add channel categories

1. New Tables
- `channel_categories`: named groups that organize a server's channels.
  - `id` (uuid, primary key)
  - `server_id` (uuid, references servers, cascades on server delete)
  - `name` (text, 1 to 32 characters)
  - `created_at` (timestamp)

2. Modified Tables
- `channels`: new nullable column `category_id` pointing at `channel_categories`.
  Deleting a category leaves its channels in place as uncategorized channels.

3. Security
- Enable RLS on `channel_categories`.
- Grant SELECT, INSERT, UPDATE, DELETE to `anon` and `authenticated`, matching how channels are accessed.
- Policies are public because the app has no sign-in and servers are shared by invite code.

4. Notes
- Existing channels keep working: their category is empty until assigned.
- Realtime is enabled for the new table so category changes appear live.
*/

CREATE TABLE IF NOT EXISTS channel_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  server_id uuid NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 32),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS channel_categories_server_created_idx ON channel_categories (server_id, created_at);

ALTER TABLE channels ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES channel_categories(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS channels_category_id_idx ON channels (category_id);

ALTER TABLE channel_categories ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON channel_categories TO anon, authenticated;

DROP POLICY IF EXISTS "anon_select_channel_categories" ON channel_categories;
CREATE POLICY "anon_select_channel_categories" ON channel_categories FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_channel_categories" ON channel_categories;
CREATE POLICY "anon_insert_channel_categories" ON channel_categories FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_channel_categories" ON channel_categories;
CREATE POLICY "anon_update_channel_categories" ON channel_categories FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_channel_categories" ON channel_categories;
CREATE POLICY "anon_delete_channel_categories" ON channel_categories FOR DELETE
  TO anon, authenticated USING (true);

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime')
    AND NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime' AND tablename = 'channel_categories'
    )
  THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE channel_categories;
  END IF;
END $$;
