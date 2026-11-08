/*
# Add profile and server customization

1. Modified tables
- `members`: adds `bio` (up to 190 characters) and `pronouns` (up to 40 characters), both optional.
- `members.nitro_tag`: default changes from the old label to "Plus". Existing members still using the old label are switched to "Plus".
- `servers`: adds `description` (up to 256 characters), `icon_color` and `banner_color` (hex colors).

2. Security
- No new tables. Existing per-verb anon and authenticated policies and table grants already cover the new columns.

3. Notes
- Column values are validated by check constraints so invalid data is rejected by the database.
*/

ALTER TABLE members ADD COLUMN IF NOT EXISTS bio text NOT NULL DEFAULT '';
ALTER TABLE members ADD COLUMN IF NOT EXISTS pronouns text NOT NULL DEFAULT '';

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'members_bio_length_check') THEN
    ALTER TABLE members ADD CONSTRAINT members_bio_length_check CHECK (char_length(bio) <= 190);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'members_pronouns_length_check') THEN
    ALTER TABLE members ADD CONSTRAINT members_pronouns_length_check CHECK (char_length(pronouns) <= 40);
  END IF;
END $$;

ALTER TABLE members ALTER COLUMN nitro_tag SET DEFAULT 'Plus';
UPDATE members SET nitro_tag = 'Plus' WHERE nitro_tag = 'Nitro';

ALTER TABLE servers ADD COLUMN IF NOT EXISTS description text NOT NULL DEFAULT '';
ALTER TABLE servers ADD COLUMN IF NOT EXISTS icon_color text NOT NULL DEFAULT '#10b981';
ALTER TABLE servers ADD COLUMN IF NOT EXISTS banner_color text NOT NULL DEFAULT '#0f766e';

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'servers_description_length_check') THEN
    ALTER TABLE servers ADD CONSTRAINT servers_description_length_check CHECK (char_length(description) <= 256);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'servers_icon_color_check') THEN
    ALTER TABLE servers ADD CONSTRAINT servers_icon_color_check CHECK (icon_color ~ '^#[0-9a-fA-F]{6}$');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'servers_banner_color_check') THEN
    ALTER TABLE servers ADD CONSTRAINT servers_banner_color_check CHECK (banner_color ~ '^#[0-9a-fA-F]{6}$');
  END IF;
END $$;
