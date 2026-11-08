import { supabase } from '@/lib/supabase';

const BUCKET = 'profile-media';
const MAX_BYTES = 8 * 1024 * 1024;
const EXTENSIONS: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/gif': 'gif',
  'image/webp': 'webp',
};

export type ProfileImageKind = 'avatar' | 'banner';

export function validateImageFile(file: File): string | null {
  if (!EXTENSIONS[file.type]) return 'Please choose a PNG, JPEG, GIF, or WebP image.';
  if (file.size > MAX_BYTES) return 'Images must be 8 MB or smaller.';
  return null;
}

export async function uploadMediaFile(folder: string, file: File): Promise<string> {
  const problem = validateImageFile(file);
  if (problem) throw new Error(problem);

  const path = `${folder}/${crypto.randomUUID()}.${EXTENSIONS[file.type]}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType: file.type,
    cacheControl: '3600',
  });
  if (error) throw new Error(error.message);

  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

export function uploadProfileImage(memberId: string, kind: ProfileImageKind, file: File): Promise<string> {
  return uploadMediaFile(`${memberId}/${kind}`, file);
}
