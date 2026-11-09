import type { AvatarRing, BannerEffect, Member, NameEffect } from '@/lib/types';

export const NAME_EFFECTS: { value: NameEffect; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'shimmer', label: 'Shimmer' },
  { value: 'rainbow', label: 'Rainbow' },
  { value: 'glow', label: 'Glow' },
  { value: 'aurora', label: 'Aurora' },
  { value: 'sunset', label: 'Sunset' },
];

export const AVATAR_RINGS: { value: AvatarRing; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'pulse', label: 'Pulse' },
  { value: 'spin', label: 'Spin' },
  { value: 'halo', label: 'Halo' },
  { value: 'ember', label: 'Ember' },
];

export const BANNER_EFFECTS: { value: BannerEffect; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'sheen', label: 'Sheen' },
  { value: 'stars', label: 'Stars' },
  { value: 'waves', label: 'Waves' },
];

export const NAME_EFFECT_CLASSES: Record<NameEffect, string> = {
  none: '',
  shimmer: 'nitro-name-shimmer',
  rainbow: 'nitro-name-rainbow',
  glow: 'nitro-name-glow',
  aurora: 'nitro-name-aurora',
  sunset: 'nitro-name-sunset',
};

export const GRADIENT_NAME_EFFECTS: ReadonlySet<NameEffect> = new Set<NameEffect>([
  'shimmer',
  'rainbow',
  'aurora',
  'sunset',
]);

export const AVATAR_RING_CLASSES: Record<AvatarRing, string> = {
  none: '',
  pulse: 'nitro-ring-pulse',
  spin: 'nitro-ring-spin',
  halo: 'nitro-ring-halo',
  ember: 'nitro-ring-ember',
};

export const BANNER_EFFECT_CLASSES: Record<BannerEffect, string> = {
  none: '',
  sheen: 'nitro-banner-sheen',
  stars: 'nitro-banner-stars',
  waves: 'nitro-banner-waves',
};

export type NitroFields = Pick<Member, 'banner_color' | 'name_effect' | 'avatar_ring' | 'banner_effect' | 'nitro_tag'>;
