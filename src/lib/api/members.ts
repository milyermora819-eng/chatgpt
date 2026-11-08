import { supabase } from '@/lib/supabase';
import type { Member } from '@/lib/types';

export type MemberFields = Pick<
  Member,
  | 'display_name'
  | 'color'
  | 'status'
  | 'pronouns'
  | 'bio'
  | 'banner_color'
  | 'name_effect'
  | 'avatar_ring'
  | 'nitro_tag'
>;

export const MEMBER_SUMMARY_COLUMNS =
  'id, display_name, color, status, pronouns, bio, banner_color, name_effect, avatar_ring, nitro_tag, avatar_url, banner_url';

export async function fetchMember(id: string): Promise<Member | null> {
  const { data, error } = await supabase.from('members').select('*').eq('id', id).maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

export async function fetchMemberDirectory(excludeId: string): Promise<Member[]> {
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .neq('id', excludeId)
    .order('display_name', { ascending: true })
    .limit(500);
  if (error) throw new Error(error.message);
  return data;
}

export async function createMember(fields: Pick<MemberFields, 'display_name' | 'color' | 'status'>): Promise<Member> {
  const { data, error } = await supabase.from('members').insert(fields).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateMemberMedia(
  id: string,
  fields: Partial<Pick<Member, 'avatar_url' | 'banner_url'>>,
): Promise<Member> {
  const { data, error } = await supabase.from('members').update(fields).eq('id', id).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateMember(id: string, fields: MemberFields): Promise<Member> {
  const { data, error } = await supabase.from('members').update(fields).eq('id', id).select().single();
  if (error) throw new Error(error.message);
  return data;
}
