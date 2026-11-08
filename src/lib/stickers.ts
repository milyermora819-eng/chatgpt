export const STICKER_PREFIX = 'sticker:';
export const CUSTOM_STICKER_PREFIX = 'sticker-image:';

export interface Sticker {
  id: string;
  label: string;
  emoji: string;
  color: string;
}

export const STICKERS: Sticker[] = [
  { id: 'wave', label: 'Hello', emoji: '👋', color: '#0ea5e9' },
  { id: 'party', label: 'Party', emoji: '🥳', color: '#a855f7' },
  { id: 'fire', label: 'Fire', emoji: '🔥', color: '#f97316' },
  { id: 'laugh', label: 'Laughing', emoji: '😂', color: '#eab308' },
  { id: 'cool', label: 'Cool', emoji: '😎', color: '#14b8a6' },
  { id: 'heart', label: 'Love', emoji: '❤️', color: '#e11d48' },
  { id: 'clap', label: 'Applause', emoji: '👏', color: '#22c55e' },
  { id: 'think', label: 'Thinking', emoji: '🤔', color: '#64748b' },
  { id: 'cry', label: 'Crying', emoji: '😭', color: '#3b82f6' },
  { id: 'rocket', label: 'Launch', emoji: '🚀', color: '#6366f1' },
  { id: 'coffee', label: 'Coffee', emoji: '☕', color: '#92400e' },
  { id: 'pizza', label: 'Pizza', emoji: '🍕', color: '#ea580c' },
  { id: 'gg', label: 'GG', emoji: '🏆', color: '#ca8a04' },
  { id: 'sleep', label: 'Sleepy', emoji: '😴', color: '#475569' },
  { id: 'skull', label: 'Dead', emoji: '💀', color: '#525252' },
  { id: 'eyes', label: 'Watching', emoji: '👀', color: '#059669' },
];

export function stickerContent(sticker: Sticker): string {
  return `${STICKER_PREFIX}${sticker.id}`;
}

export function customStickerContent(imageUrl: string): string {
  return `${CUSTOM_STICKER_PREFIX}${imageUrl}`;
}

export function findStickerByContent(content: string): Sticker | null {
  if (!content.startsWith(STICKER_PREFIX)) return null;
  const id = content.slice(STICKER_PREFIX.length);
  return STICKERS.find((sticker) => sticker.id === id) ?? null;
}

export function findCustomStickerUrl(content: string): string | null {
  if (!content.startsWith(CUSTOM_STICKER_PREFIX)) return null;
  const url = content.slice(CUSTOM_STICKER_PREFIX.length);
  return /^https:\/\/\S+$/.test(url) ? url : null;
}
