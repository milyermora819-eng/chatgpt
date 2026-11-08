import { Hash, Menu, MessageCircle } from 'lucide-react';
import { useState } from 'react';
import ChatProfileCard from '@/components/ProfileCard';
import MessageComposer from '@/components/MessageComposer';
import MessageList from '@/components/MessageList';
import { addReaction, deleteMessage, removeReaction, sendMessage } from '@/lib/api/chat';
import { errorMessage } from '@/lib/errors';
import { useMessages } from '@/hooks/useMessages';
import { useServerStickers } from '@/hooks/useServerStickers';
import type { ChatScope, Member, MemberSummary, Message } from '@/lib/types';

interface ChatAreaProps {
  scope: ChatScope | null;
  title: string | null;
  serverId: string | null;
  member: Member;
  onToggleSidebar: () => void;
  onStartDM: (memberId: string) => void;
}

export default function ChatArea({ scope, title, serverId, member, onToggleSidebar, onStartDM }: ChatAreaProps) {
  const { messages, loading, error, refresh } = useMessages(scope);
  const { stickers, error: stickerError, addSticker } = useServerStickers(
    scope?.kind === 'channel' ? serverId : null,
    member.id,
  );
  const [actionError, setActionError] = useState<string | null>(null);
  const [profile, setProfile] = useState<MemberSummary | null>(null);

  if (!scope || !title) {
    return (
      <main className="flex flex-1 items-center justify-center bg-zinc-800/40 p-6 text-center">
        <p className="text-sm text-zinc-400">Pick a conversation to start chatting.</p>
      </main>
    );
  }

  const isDM = scope.kind === 'dm';
  const stickerLibrary =
    !isDM && serverId ? { customStickers: stickers, error: stickerError, onAddSticker: addSticker } : null;

  const handleSend = async (content: string) => {
    await sendMessage(scope, member.id, content);
    await refresh();
  };

  const runAction = async (action: () => Promise<void>, fallback: string) => {
    setActionError(null);
    try {
      await action();
      await refresh();
    } catch (err) {
      setActionError(errorMessage(err, fallback));
    }
  };

  const handleToggleReaction = (message: Message, emoji: string) => {
    const existing = message.reactions.find((r) => r.member_id === member.id && r.emoji === emoji);
    void runAction(
      () => (existing ? removeReaction(existing.id) : addReaction(message.id, member.id, emoji)),
      'Reaction could not be updated.',
    );
  };

  const handleDelete = (message: Message) => {
    void runAction(() => deleteMessage(message.id), 'Message could not be deleted.');
  };

  return (
    <main className="flex min-w-0 flex-1 flex-col bg-zinc-800/40">
      <header className="flex h-14 items-center gap-3 border-b border-zinc-800 bg-zinc-900/60 px-4">
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
          className="rounded-md p-1.5 text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-100 md:hidden"
        >
          <Menu size={20} />
        </button>
        {isDM ? (
          <MessageCircle size={20} className="shrink-0 text-zinc-500" />
        ) : (
          <Hash size={20} className="shrink-0 text-zinc-500" />
        )}
        <h1 className="truncate font-semibold text-zinc-100">{title}</h1>
      </header>

      {actionError && (
        <div className="animate-shake border-b border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-300">
          {actionError}
        </div>
      )}

      <MessageList
        emptyTitle={isDM ? `This is the start of your conversation with ${title}` : `Welcome to #${title}`}
        emptyHint="Say something to get started."
        messages={messages}
        currentMemberId={member.id}
        loading={loading}
        error={error}
        onToggleReaction={handleToggleReaction}
        onDelete={handleDelete}
        onOpenProfile={setProfile}
      />

      <MessageComposer
        placeholder={isDM ? `Message @${title}` : `Message #${title}`}
        stickerLibrary={stickerLibrary}
        onSend={handleSend}
      />

      {profile && (
        <ChatProfileCard
          member={profile}
          isSelf={profile.id === member.id}
          onClose={() => setProfile(null)}
          onMessage={() => {
            setProfile(null);
            onStartDM(profile.id);
          }}
        />
      )}
    </main>
  );
}
