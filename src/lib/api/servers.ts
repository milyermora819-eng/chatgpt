import { supabase } from '@/lib/supabase';
import type { Channel, Server } from '@/lib/types';

const INVITE_ALPHABET = 'abcdefghijklmnopqrstuvwxyz0123456789';

function createInviteCode(length = 8): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => INVITE_ALPHABET[byte % INVITE_ALPHABET.length]).join('');
}

export async function fetchServersForMember(memberId: string): Promise<Server[]> {
  const { data, error } = await supabase
    .from('server_members')
    .select('servers(*)')
    .eq('member_id', memberId)
    .order('joined_at', { ascending: true });
  if (error) throw new Error(error.message);
  const rows = (data ?? []) as unknown as { servers: Server | null }[];
  return rows.map((row) => row.servers).filter((server): server is Server => server !== null);
}

export async function createServer(name: string, ownerId: string): Promise<Server> {
  const { data: server, error } = await supabase
    .from('servers')
    .insert({ name, invite_code: createInviteCode(), owner_id: ownerId })
    .select()
    .single();
  if (error) throw new Error(error.message);

  const { error: membershipError } = await supabase
    .from('server_members')
    .insert({ server_id: server.id, member_id: ownerId });
  if (membershipError) throw new Error(membershipError.message);

  const { error: channelError } = await supabase
    .from('channels')
    .insert({ server_id: server.id, name: 'general' });
  if (channelError) throw new Error(channelError.message);

  return server;
}

export async function joinServerByInvite(code: string, memberId: string): Promise<Server> {
  const { data: server, error } = await supabase
    .from('servers')
    .select('*')
    .eq('invite_code', code.trim().toLowerCase())
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!server) throw new Error('No server matches that invite code.');

  const { error: joinError } = await supabase
    .from('server_members')
    .upsert(
      { server_id: server.id, member_id: memberId },
      { onConflict: 'server_id,member_id', ignoreDuplicates: true },
    );
  if (joinError) throw new Error(joinError.message);

  return server;
}

export async function fetchChannels(serverId: string): Promise<Channel[]> {
  const { data, error } = await supabase
    .from('channels')
    .select('*')
    .eq('server_id', serverId)
    .order('created_at', { ascending: true });
  if (error) throw new Error(error.message);
  return data;
}

export async function createChannel(serverId: string, name: string): Promise<Channel> {
  const { data, error } = await supabase
    .from('channels')
    .insert({ server_id: serverId, name })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export type ServerFields = Pick<Server, 'name' | 'description' | 'icon_color' | 'banner_color'>;

export async function updateServer(serverId: string, fields: ServerFields): Promise<Server> {
  const { data, error } = await supabase.from('servers').update(fields).eq('id', serverId).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function regenerateInviteCode(serverId: string): Promise<Server> {
  const { data, error } = await supabase
    .from('servers')
    .update({ invite_code: createInviteCode() })
    .eq('id', serverId)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteServer(serverId: string): Promise<void> {
  const { error } = await supabase.from('servers').delete().eq('id', serverId);
  if (error) throw new Error(error.message);
}

export async function renameChannel(channelId: string, name: string): Promise<Channel> {
  const { data, error } = await supabase.from('channels').update({ name }).eq('id', channelId).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteChannel(channelId: string): Promise<void> {
  const { error } = await supabase.from('channels').delete().eq('id', channelId);
  if (error) throw new Error(error.message);
}
