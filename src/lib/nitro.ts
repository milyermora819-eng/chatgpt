import type { Member, NameEffect, AvatarRing } from '@/lib/types';

export const NAME_EFFECTS: { value: NameEffect; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'shimmer', label: 'Shimmer' },
  { value: 'rainbow', label: 'Rainbow' },
  { value: 'glow', label: 'Glow' },
];

export const AVATAR_RINGS: { value: AvatarRing; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'pulse', label: 'Pulse' },
  { value: 'spin', label: 'Spin' },
];

export const NAME_EFFECT_CLASSES: Record<NameEffect, string> = {
  none: '',
  shimmer: 'nitro-name-shimmer',
  rainbow: 'nitro-name-rainbow',
  glow: 'nitro-name-glow',
};

export const AVATAR_RING_CLASSES: Record<AvatarRing, string> = {
  none: '',
  pulse: 'nitro-ring-pulse',
  spin: 'nitro-ring-spin',
};

export type NitroFields = Pick<Member, 'banner_color' | 'name_effect' | 'avatar_ring' | 'nitro_tag'>;
