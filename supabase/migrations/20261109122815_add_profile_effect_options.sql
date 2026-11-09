/*
# Add richer profile effect options

1. Modified Tables
- `members.name_effect`: now also accepts `aurora` (flowing green and blue gradient) and `sunset` (warm orange and amber gradient).
- `members.avatar_ring`: now also accepts `halo` (soft breathing glow) and `ember` (flickering warm glow).
- `members.banner_effect` (new text column, default `none`): banner overlay animation. Accepts `none`, `sheen` (light sweep), `stars` (drifting sparkles), or `waves` (moving stripes).

2. Security
- No changes to row level security or grants. Existing members columns keep their policies.

3. Notes
- Existing members keep their current effects and get `none` for the new banner effect.
- Constraints are replaced by name, so this migration can be re-run safely.
*/

ALTER TABLE members ADD COLUMN IF NOT EXISTS banner_effect text NOT NULL DEFAULT 'none';

ALTER TABLE members DROP CONSTRAINT IF EXISTS members_name_effect_check;
ALTER TABLE members ADD CONSTRAINT members_name_effect_check
  CHECK (name_effect = ANY (ARRAY['none', 'shimmer', 'rainbow', 'glow', 'aurora', 'sunset']));

ALTER TABLE members DROP CONSTRAINT IF EXISTS members_avatar_ring_check;
ALTER TABLE members ADD CONSTRAINT members_avatar_ring_check
  CHECK (avatar_ring = ANY (ARRAY['none', 'pulse', 'spin', 'halo', 'ember']));

ALTER TABLE members DROP CONSTRAINT IF EXISTS members_banner_effect_check;
ALTER TABLE members ADD CONSTRAINT members_banner_effect_check
  CHECK (banner_effect = ANY (ARRAY['none', 'sheen', 'stars', 'waves']));
