import { useEffect, useRef } from 'react';
import MessageItem from '@/components/MessageItem';
import type { Message, MemberSummary } from '@/lib/types';

const GROUP_WINDOW_MS = 5 * 60 * 1000;

interface MessageListProps {
  emptyTitle: string;
  emptyHint: string;
  messages: Message[];
  currentMemberId: string;
  loading: boolean;
  error: string | null;
  onToggleReaction: (message: Message, emoji: string) => void;
  onDelete: (message: Message) => void;
  onOpenProfile: (member: MemberSummary) => void;
}

export default function MessageList({
  emptyTitle,
  emptyHint,
  messages,
  currentMemberId,
  loading,
  error,
  onToggleReaction,
  onDelete,
  onOpenProfile,
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <p className="text-sm text-red-400">{error}</p>
      </div>
    );
  }

  if (!loading && messages.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
        <p className="text-lg font-semibold text-zinc-200">{emptyTitle}</p>
        <p className="mt-1 text-sm text-zinc-500">{emptyHint}</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto py-4">
      <ul className="flex flex-col">
        {messages.map((message, index) => {
          const previous = messages[index - 1];
          const showHeader =
            !previous ||
            previous.author_id !== message.author_id ||
            new Date(message.created_at).getTime() - new Date(previous.created_at).getTime() > GROUP_WINDOW_MS;
          return (
            <MessageItem
              key={message.id}
              message={message}
              currentMemberId={currentMemberId}
              showHeader={showHeader}
              onToggleReaction={(emoji) => onToggleReaction(message, emoji)}
              onDelete={() => onDelete(message)}
              onOpenProfile={onOpenProfile}
            />
          );
        })}
      </ul>
      <div ref={bottomRef} />
    </div>
  );
}
