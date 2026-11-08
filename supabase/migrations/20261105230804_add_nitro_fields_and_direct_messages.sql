/*
# Add Nitro profile fields and direct messages

Plain-English summary: adds the extra profile options every member now gets for free (banner color, name effects, avatar rings, a custom Nitro tag), and adds direct messages between members. Direct messages reuse the same message table as channels, so reactions and live updates work the same way in both places.

1. Modified Tables
- `members`: new columns `banner_color` (profile banner color), `name_effect` (none, shimmer, rainbow, glow), `avatar_ring` (none, pulse, spin) and `nitro_tag` (short label shown on messages). Existing members receive the defaults.
- `messages`: `channel_id` is now optional, and a new optional `dm_thread_id` points to a direct message conversation. Each message must belong to exactly one of the two. Existing messages keep their channel.

2. New Tables
- `dm_threads`: one row per direct message conversation.
- `dm_participants`: which members are part of each conversation.

3. Security
- Row level security is enabled on the new tables.
- No sign-in exists, so policies target `anon` and `authenticated`, matching the rest of the app.

4. Realtime
- `dm_threads` is published to realtime. Messages are already published.

5. Notes
- All statements are idempotent and safe to run again.
- No data is removed or changed in type.
*/

ALTER TABLE members ADD COLUMN IF NOT EXISTS banner_color text NOT NULL DEFAULT '#0ea5e9';

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'members_banner_color_check') THEN
    ALTER TABLE members ADD CONSTRAINT members_banner_color_check CHECK (banner_color ~ '^#[0-9a-fA-F]{6}$');
  END IF;
END $$;

ALTER TABLE members ADD COLUMN IF NOT EXISTS name_effect text NOT NULL DEFAULT 'none';

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'members_name_effect_check') THEN
    ALTER TABLE members ADD CONSTRAINT members_name_effect_check CHECK (name_effect IN ('none', 'shimmer', 'rainbow', 'glow'));
  END IF;
END $$;

ALTER TABLE members ADD COLUMN IF NOT EXISTS avatar_ring text NOT NULL DEFAULT 'none';

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'members_avatar_ring_check') THEN
    ALTER TABLE members ADD CONSTRAINT members_avatar_ring_check CHECK (avatar_ring IN ('none', 'pulse', 'spin'));
  END IF;
END $$;

ALTER TABLE members ADD COLUMN IF NOT EXISTS nitro_tag text NOT NULL DEFAULT 'Nitro';

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'members_nitro_tag_check') THEN
    ALTER TABLE members ADD CONSTRAINT members_nitro_tag_check CHECK (char_length(nitro_tag) BETWEEN 1 AND 12);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS dm_threads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS dm_participants (
  thread_id uuid NOT NULL REFERENCES dm_threads(id) ON DELETE CASCADE,
  member_id uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  PRIMARY KEY (thread_id, member_id)
);

CREATE INDEX IF NOT EXISTS dm_participants_member_idx ON dm_participants (member_id);

ALTER TABLE messages ALTER COLUMN channel_id DROP NOT NULL;

ALTER TABLE messages ADD COLUMN IF NOT EXISTS dm_thread_id uuid REFERENCES dm_threads(id) ON DELETE CASCADE;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'messages_single_target_check') THEN
    ALTER TABLE messages ADD CONSTRAINT messages_single_target_check CHECK ((channel_id IS NULL) <> (dm_thread_id IS NULL));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS messages_dm_thread_created_idx ON messages (dm_thread_id, created_at);

ALTER TABLE dm_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE dm_participants ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON dm_threads, dm_participants TO anon, authenticated;

DROP POLICY IF EXISTS "anon_select_dm_threads" ON dm_threads;
CREATE POLICY "anon_select_dm_threads" ON dm_threads FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_dm_threads" ON dm_threads;
CREATE POLICY "anon_insert_dm_threads" ON dm_threads FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_dm_threads" ON dm_threads;
CREATE POLICY "anon_update_dm_threads" ON dm_threads FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_dm_threads" ON dm_threads;
CREATE POLICY "anon_delete_dm_threads" ON dm_threads FOR DELETE TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_select_dm_participants" ON dm_participants;
CREATE POLICY "anon_select_dm_participants" ON dm_participants FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_dm_participants" ON dm_participants;
CREATE POLICY "anon_insert_dm_participants" ON dm_participants FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_dm_participants" ON dm_participants;
CREATE POLICY "anon_update_dm_participants" ON dm_participants FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_dm_participants" ON dm_participants;
CREATE POLICY "anon_delete_dm_participants" ON dm_participants FOR DELETE TO anon, authenticated USING (true);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'dm_threads') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE dm_threads;
  END IF;
END $$;
