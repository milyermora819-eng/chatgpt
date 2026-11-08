/*
# Create chat schema (servers, channels, messages, reactions)

Plain-English summary: adds everything needed for a Discord-style chat app. People pick a display name and color, create or join servers by invite code, post messages in channels, and react to messages with emoji. Updates are pushed live to everyone viewing the same channel.

1. New Tables
- `members`: a person using the app (display name, color, custom status, Nitro-style perks).
- `servers`: a chat community with a name and a shareable invite code.
- `server_members`: which members belong to which server.
- `channels`: text channels inside a server.
- `messages`: posts in a channel (max 4000 characters).
- `reactions`: emoji reactions a member added to a message (one per emoji per member).

2. Security
- Row level security is enabled on every table.
- No sign-in exists in this app, so every policy targets `anon` and `authenticated`.
- Data is intentionally shared between members of the app, so policies are open for reads and writes.

3. Realtime
- Messages, reactions, channels and server membership are published to realtime so open screens update live.

4. Notes
- Indexes are added on the columns used for lookups by channel, server and message.
- Writes are validated by check constraints for lengths and formats.
*/

CREATE TABLE IF NOT EXISTS members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  display_name text NOT NULL CHECK (char_length(display_name) BETWEEN 1 AND 32),
  color text NOT NULL DEFAULT '#22c55e' CHECK (color ~ '^#[0-9a-fA-F]{6}$'),
  status text NOT NULL DEFAULT '' CHECK (char_length(status) <= 128),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS servers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 64),
  invite_code text NOT NULL UNIQUE CHECK (invite_code ~ '^[a-z0-9]{6,16}$'),
  owner_id uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS server_members (
  server_id uuid NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
  member_id uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  joined_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (server_id, member_id)
);

CREATE INDEX IF NOT EXISTS server_members_member_idx ON server_members (member_id);

CREATE TABLE IF NOT EXISTS channels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  server_id uuid NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 32),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS channels_server_idx ON channels (server_id);

CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id uuid NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  content text NOT NULL CHECK (char_length(content) BETWEEN 1 AND 4000),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS messages_channel_created_idx ON messages (channel_id, created_at);

CREATE TABLE IF NOT EXISTS reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  member_id uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  emoji text NOT NULL CHECK (char_length(emoji) BETWEEN 1 AND 32),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (message_id, member_id, emoji)
);

CREATE INDEX IF NOT EXISTS reactions_message_idx ON reactions (message_id);

ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE servers ENABLE ROW LEVEL SECURITY;
ALTER TABLE server_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON members, servers, server_members, channels, messages, reactions TO anon, authenticated;

DROP POLICY IF EXISTS "anon_select_members" ON members;
CREATE POLICY "anon_select_members" ON members FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_members" ON members;
CREATE POLICY "anon_insert_members" ON members FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_members" ON members;
CREATE POLICY "anon_update_members" ON members FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_members" ON members;
CREATE POLICY "anon_delete_members" ON members FOR DELETE TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_select_servers" ON servers;
CREATE POLICY "anon_select_servers" ON servers FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_servers" ON servers;
CREATE POLICY "anon_insert_servers" ON servers FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_servers" ON servers;
CREATE POLICY "anon_update_servers" ON servers FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_servers" ON servers;
CREATE POLICY "anon_delete_servers" ON servers FOR DELETE TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_select_server_members" ON server_members;
CREATE POLICY "anon_select_server_members" ON server_members FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_server_members" ON server_members;
CREATE POLICY "anon_insert_server_members" ON server_members FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_server_members" ON server_members;
CREATE POLICY "anon_update_server_members" ON server_members FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_server_members" ON server_members;
CREATE POLICY "anon_delete_server_members" ON server_members FOR DELETE TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_select_channels" ON channels;
CREATE POLICY "anon_select_channels" ON channels FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_channels" ON channels;
CREATE POLICY "anon_insert_channels" ON channels FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_channels" ON channels;
CREATE POLICY "anon_update_channels" ON channels FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_channels" ON channels;
CREATE POLICY "anon_delete_channels" ON channels FOR DELETE TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_select_messages" ON messages;
CREATE POLICY "anon_select_messages" ON messages FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_messages" ON messages;
CREATE POLICY "anon_insert_messages" ON messages FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_messages" ON messages;
CREATE POLICY "anon_update_messages" ON messages FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_messages" ON messages;
CREATE POLICY "anon_delete_messages" ON messages FOR DELETE TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_select_reactions" ON reactions;
CREATE POLICY "anon_select_reactions" ON reactions FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_reactions" ON reactions;
CREATE POLICY "anon_insert_reactions" ON reactions FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_reactions" ON reactions;
CREATE POLICY "anon_update_reactions" ON reactions FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_reactions" ON reactions;
CREATE POLICY "anon_delete_reactions" ON reactions FOR DELETE TO anon, authenticated USING (true);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'messages') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE messages;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'reactions') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE reactions;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'channels') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE channels;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'server_members') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE server_members;
  END IF;
END $$;
