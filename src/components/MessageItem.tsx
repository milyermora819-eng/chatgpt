import { Smile, Sparkles, Trash2 } from 'lucide-react';
import { useState } from 'react';
import Avatar from '@/components/Avatar';
import EmojiPicker from '@/components/EmojiPicker';
import MemberName from '@/components/MemberName';
import { AVATAR_RING_CLASSES } from '@/lib/nitro';
import { findCustomStickerUrl, findStickerByContent } from '@/lib/stickers';
import type { Message, MemberSummary } from '@/lib/types';

interface MessageItemProps {
  message: Message;
  currentMemberId: string;
  showHeader: boolean;
  onToggleReaction: (emoji: string) => void;
  onDelete: () => void;
  onOpenProfile: (member: MemberSummary) => void;
}

interface ReactionSummary {
  emoji: string;
  count: number;
  mine: boolean;
}

const EMOJI_ONLY = /^(\p{Extended_Pictographic}|\u200d|\ufe0f|\s){1,12}$/u;

function summarizeReactions(message: Message, currentMemberId: string): ReactionSummary[] {
  const summaries = new Map<string, ReactionSummary>();
  for (const reaction of message.reactions) {
    const existing = summaries.get(reaction.emoji) ?? { emoji: reaction.emoji, count: 0, mine: false };
    existing.count += 1;
    existing.mine = existing.mine || reaction.member_id === currentMemberId;
    summaries.set(reaction.emoji, existing);
  }
  return Array.from(summaries.values());
}

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function MessageItem({
  message,
  currentMemberId,
  showHeader,
  onToggleReaction,
  onDelete,
  onOpenProfile,
}: MessageItemProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const author = message.author;
  const isOwn = message.author_id === currentMemberId;
  const reactions = summarizeReactions(message, currentMemberId);
  const isJumbo = EMOJI_ONLY.test(message.content) && message.content.trim().length <= 16;
  const sticker = findStickerByContent(message.content);
  const customStickerUrl = findCustomStickerUrl(message.content);

  return (
    <li className="animate-slide-up group relative flex gap-4 rounded-md px-4 py-0.5 transition hover:bg-zinc-900/60">
      <div className="w-10 shrink-0 pt-1">
        {showHeader && author ? (
          <button
            type="button"
            onClick={() => onOpenProfile(author)}
            aria-label={`View ${author.display_name}'s profile`}
            className="rounded-full transition hover:scale-105 hover:opacity-90 active:scale-95"
          >
            <Avatar
              name={author.display_name}
              color={author.color}
              imageUrl={author.avatar_url}
              ringClassName={AVATAR_RING_CLASSES[author.avatar_ring]}
            />
          </button>
        ) : (
          <span className="block text-right text-[10px] leading-6 text-zinc-600 opacity-0 group-hover:opacity-100">
            {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1 py-1">
        {showHeader && (
          <div className="flex flex-wrap items-baseline gap-2">
            {author ? (
              <button type="button" onClick={() => onOpenProfile(author)} className="text-left font-semibold hover:underline">
                <MemberName member={author} />
              </button>
            ) : (
              <span className="font-semibold text-zinc-400">Unknown member</span>
            )}
            {author && (
              <span
                className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-400"
                title="Profile badge"
              >
                <Sparkles size={10} />
                {author.nitro_tag}
              </span>
            )}
            {author?.status && <span className="truncate text-xs text-zinc-500">{author.status}</span>}
            <span className="text-xs text-zinc-500">{formatTimestamp(message.created_at)}</span>
          </div>
        )}

        {sticker && (
          <div className="mt-1 inline-flex flex-col items-start gap-1">
            <div
              className="animate-pop flex h-28 w-28 items-center justify-center rounded-2xl text-6xl transition hover:-rotate-3 hover:scale-105"
              style={{ backgroundColor: `${sticker.color}33`, boxShadow: `inset 0 0 0 1px ${sticker.color}66` }}
              role="img"
              aria-label={`${sticker.label} sticker`}
            >
              {sticker.emoji}
            </div>
            <span className="text-xs text-zinc-500">{sticker.label}</span>
          </div>
        )}

        {customStickerUrl && (
          <img
            src={customStickerUrl}
            alt="Sticker"
            loading="lazy"
            className="animate-pop mt-1 h-32 w-32 rounded-2xl object-contain transition hover:-rotate-3 hover:scale-105"
          />
        )}

        {!sticker && !customStickerUrl && (
          <p
            className={`whitespace-pre-wrap break-words leading-relaxed text-zinc-200 ${
              isJumbo ? 'text-4xl leading-snug' : 'text-[15px]'
            }`}
          >
            {message.content}
          </p>
        )}

        {reactions.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {reactions.map((reaction) => (
              <button
                key={reaction.emoji}
                type="button"
                onClick={() => onToggleReaction(reaction.emoji)}
                className={`animate-pop flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-sm transition hover:scale-105 active:scale-95 ${
                  reaction.mine
                    ? 'border-emerald-500/60 bg-emerald-500/15 text-emerald-300'
                    : 'border-zinc-700 bg-zinc-800 text-zinc-300 hover:border-zinc-600'
                }`}
              >
                <span>{reaction.emoji}</span>
                <span className="text-xs font-medium">{reaction.count}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="absolute -top-3 right-4 hidden items-center gap-0.5 rounded-lg border border-zinc-700 bg-zinc-900 p-0.5 shadow-lg group-hover:flex animate-scale-in">
        <div className="relative">
          <button
            type="button"
            onClick={() => setPickerOpen((open) => !open)}
            aria-label="Add reaction"
            className="rounded-md p-1.5 text-zinc-400 transition hover:scale-110 hover:bg-zinc-800 hover:text-zinc-100 active:scale-95"
          >
            <Smile size={16} />
          </button>
          {pickerOpen && (
            <EmojiPicker
              onPick={(emoji) => {
                setPickerOpen(false);
                onToggleReaction(emoji);
              }}
              onClose={() => setPickerOpen(false)}
            />
          )}
        </div>
        {isOwn && (
          <button
            type="button"
            onClick={onDelete}
            aria-label="Delete message"
            className="rounded-md p-1.5 text-zinc-400 transition hover:scale-110 hover:bg-red-500/15 hover:text-red-400 active:scale-95"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
    </li>
  );
}
