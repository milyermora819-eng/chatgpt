export type NameEffect = 'none' | 'shimmer' | 'rainbow' | 'glow';
export type AvatarRing = 'none' | 'pulse' | 'spin';

export interface Member {
  id: string;
  display_name: string;
  color: string;
  status: string;
  pronouns: string;
  bio: string;
  banner_color: string;
  name_effect: NameEffect;
  avatar_ring: AvatarRing;
  nitro_tag: string;
  avatar_url: string | null;
  banner_url: string | null;
  created_at: string;
}

export type MemberSummary = Pick<
  Member,
  | 'id'
  | 'display_name'
  | 'color'
  | 'status'
  | 'pronouns'
  | 'bio'
  | 'banner_color'
  | 'name_effect'
  | 'avatar_ring'
  | 'nitro_tag'
  | 'avatar_url'
  | 'banner_url'
>;

export interface Server {
  id: string;
  name: string;
  description: string;
  icon_color: string;
  banner_color: string;
  invite_code: string;
  owner_id: string;
  created_at: string;
}

export interface Channel {
  id: string;
  server_id: string;
  name: string;
  created_at: string;
}

export interface DMThread {
  id: string;
  other: MemberSummary;
}

export interface ServerSticker {
  id: string;
  server_id: string;
  created_by: string | null;
  name: string;
  image_url: string;
  created_at: string;
}

export type ChatScope = { kind: 'channel'; id: string } | { kind: 'dm'; id: string };

export interface Reaction {
  id: string;
  message_id: string;
  member_id: string;
  emoji: string;
}

export interface Message {
  id: string;
  channel_id: string | null;
  dm_thread_id: string | null;
  author_id: string;
  content: string;
  created_at: string;
  author: MemberSummary | null;
  reactions: Reaction[];
}
