import { MEMBER_SUMMARY_COLUMNS } from '@/lib/api/members';
import { supabase } from '@/lib/supabase';
import type { DMThread, MemberSummary } from '@/lib/types';

interface ParticipantRow {
  thread_id: string;
  member: MemberSummary | null;
}

export async function fetchDMThreads(memberId: string): Promise<DMThread[]> {
  const { data: mine, error: mineError } = await supabase
    .from('dm_participants')
    .select('thread_id')
    .eq('member_id', memberId);
  if (mineError) throw new Error(mineError.message);

  const threadIds = (mine ?? []).map((row: { thread_id: string }) => row.thread_id);
  if (threadIds.length === 0) return [];

  const { data, error } = await supabase
    .from('dm_participants')
    .select(`thread_id, member:members(${MEMBER_SUMMARY_COLUMNS})`)
    .in('thread_id', threadIds)
    .neq('member_id', memberId);
  if (error) throw new Error(error.message);

  const rows = (data ?? []) as unknown as ParticipantRow[];
  return rows
    .filter((row): row is ParticipantRow & { member: MemberSummary } => row.member !== null)
    .map((row) => ({ id: row.thread_id, other: row.member }))
    .sort((a, b) => a.other.display_name.localeCompare(b.other.display_name));
}

export async function openDMThread(memberId: string, otherId: string, existing: DMThread[]): Promise<string> {
  const found = existing.find((thread) => thread.other.id === otherId);
  if (found) return found.id;

  const { data: thread, error } = await supabase.from('dm_threads').insert({}).select('id').single();
  if (error) throw new Error(error.message);

  const { error: participantsError } = await supabase.from('dm_participants').insert([
    { thread_id: thread.id, member_id: memberId },
    { thread_id: thread.id, member_id: otherId },
  ]);
  if (participantsError) throw new Error(participantsError.message);

  return thread.id;
}
