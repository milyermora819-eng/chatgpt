import { MEMBER_SUMMARY_COLUMNS } from '@/lib/api/members';
import { supabase } from '@/lib/supabase';
import type { ChatScope, Message } from '@/lib/types';

const MESSAGE_PAGE_SIZE = 200;

function scopeColumn(scope: ChatScope): 'channel_id' | 'dm_thread_id' {
  return scope.kind === 'channel' ? 'channel_id' : 'dm_thread_id';
}

export async function fetchMessages(scope: ChatScope): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select(`*, author:members(${MEMBER_SUMMARY_COLUMNS}), reactions(id, message_id, member_id, emoji)`)
    .eq(scopeColumn(scope), scope.id)
    .order('created_at', { ascending: false })
    .limit(MESSAGE_PAGE_SIZE);
  if (error) throw new Error(error.message);
  return (data as Message[]).reverse();
}

export async function sendMessage(scope: ChatScope, authorId: string, content: string): Promise<void> {
  const target = scope.kind === 'channel' ? { channel_id: scope.id } : { dm_thread_id: scope.id };
  const { error } = await supabase.from('messages').insert({ ...target, author_id: authorId, content });
  if (error) throw new Error(error.message);
}

export async function deleteMessage(messageId: string): Promise<void> {
  const { error } = await supabase.from('messages').delete().eq('id', messageId);
  if (error) throw new Error(error.message);
}

export async function addReaction(messageId: string, memberId: string, emoji: string): Promise<void> {
  const { error } = await supabase
    .from('reactions')
    .insert({ message_id: messageId, member_id: memberId, emoji });
  if (error) throw new Error(error.message);
}

export async function removeReaction(reactionId: string): Promise<void> {
  const { error } = await supabase.from('reactions').delete().eq('id', reactionId);
  if (error) throw new Error(error.message);
}
