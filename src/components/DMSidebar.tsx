import { MessageCirclePlus, Settings } from 'lucide-react';
import Avatar from '@/components/Avatar';
import MemberName from '@/components/MemberName';
import { AVATAR_RING_CLASSES } from '@/lib/nitro';
import type { DMThread, Member } from '@/lib/types';

interface DMSidebarProps {
  member: Member;
  threads: DMThread[];
  loading: boolean;
  error: string | null;
  activeThreadId: string | null;
  onSelectThread: (threadId: string) => void;
  onNewMessage: () => void;
  onOpenSettings: () => void;
}

export default function DMSidebar({
  member,
  threads,
  loading,
  error,
  activeThreadId,
  onSelectThread,
  onNewMessage,
  onOpenSettings,
}: DMSidebarProps) {
  return (
    <aside className="flex w-60 shrink-0 flex-col bg-zinc-900">
      <div className="flex h-14 items-center justify-between border-b border-zinc-800 px-4">
        <h2 className="font-semibold text-zinc-100">Direct messages</h2>
        <button
          type="button"
          onClick={onNewMessage}
          aria-label="New direct message"
          title="New direct message"
          className="rounded-md p-1.5 text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-100"
        >
          <MessageCirclePlus size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-4">
        {error && <p className="px-2 text-sm text-red-400">{error}</p>}
        {!error && !loading && threads.length === 0 && (
          <p className="px-2 text-sm text-zinc-500">No conversations yet. Start one with the button above.</p>
        )}
        <ul className="space-y-0.5">
          {threads.map((thread) => {
            const isActive = thread.id === activeThreadId;
            return (
              <li key={thread.id}>
                <button
                  type="button"
                  onClick={() => onSelectThread(thread.id)}
                  aria-current={isActive ? 'true' : undefined}
                  className={`flex w-full items-center gap-3 rounded-md px-2 py-1.5 text-left transition ${
                    isActive ? 'bg-zinc-700/70 text-zinc-100' : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
                  }`}
                >
                  <Avatar
                    name={thread.other.display_name}
                    color={thread.other.color}
                    imageUrl={thread.other.avatar_url}
                    size="sm"
                    ringClassName={AVATAR_RING_CLASSES[thread.other.avatar_ring]}
                  />
                  <span className="min-w-0 flex-1 truncate text-sm">
                    <MemberName member={thread.other} />
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="flex items-center gap-3 border-t border-zinc-800 bg-zinc-950/60 px-3 py-3">
        <Avatar
          name={member.display_name}
          color={member.color}
          imageUrl={member.avatar_url}
          size="sm"
          ringClassName={AVATAR_RING_CLASSES[member.avatar_ring]}
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-zinc-100">{member.display_name}</p>
          <p className="truncate text-xs text-zinc-500">{member.status || 'Online'}</p>
        </div>
        <button
          type="button"
          onClick={onOpenSettings}
          aria-label="Open settings"
          className="rounded-md p-1.5 text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-100"
        >
          <Settings size={18} />
        </button>
      </div>
    </aside>
  );
}
