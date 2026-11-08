export function toChannelSlug(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, '-');
}
