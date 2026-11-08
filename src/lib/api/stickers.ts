import { uploadMediaFile } from '@/lib/api/media';
import { supabase } from '@/lib/supabase';
import type { ServerSticker } from '@/lib/types';

export async function fetchServerStickers(serverId: string): Promise<ServerSticker[]> {
  const { data, error } = await supabase
    .from('server_stickers')
    .select('*')
    .eq('server_id', serverId)
    .order('created_at', { ascending: true });
  if (error) throw new Error(error.message);
  return data;
}

export async function createServerSticker(serverId: string, memberId: string, file: File): Promise<ServerSticker> {
  const imageUrl = await uploadMediaFile(`stickers/${serverId}`, file);
  const name = file.name.replace(/\.[^.]+$/, '').trim().slice(0, 32) || 'Sticker';
  const { data, error } = await supabase
    .from('server_stickers')
    .insert({ server_id: serverId, created_by: memberId, name, image_url: imageUrl })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}
