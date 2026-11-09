import { supabase } from '@/lib/supabase';
import type { Channel, ChannelCategory } from '@/lib/types';

export async function fetchCategories(serverId: string): Promise<ChannelCategory[]> {
  const { data, error } = await supabase
    .from('channel_categories')
    .select('*')
    .eq('server_id', serverId)
    .order('created_at', { ascending: true });
  if (error) throw new Error(error.message);
  return data;
}

export async function createCategory(serverId: string, name: string): Promise<ChannelCategory> {
  const { data, error } = await supabase
    .from('channel_categories')
    .insert({ server_id: serverId, name })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function renameCategory(categoryId: string, name: string): Promise<ChannelCategory> {
  const { data, error } = await supabase
    .from('channel_categories')
    .update({ name })
    .eq('id', categoryId)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteCategory(categoryId: string): Promise<void> {
  const { error } = await supabase.from('channel_categories').delete().eq('id', categoryId);
  if (error) throw new Error(error.message);
}

export async function setChannelCategory(channelId: string, categoryId: string | null): Promise<Channel> {
  const { data, error } = await supabase
    .from('channels')
    .update({ category_id: categoryId })
    .eq('id', channelId)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}
