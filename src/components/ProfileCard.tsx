import { Crown, MessageCircle, X } from 'lucide-react';
import { useEffect } from 'react';
import Avatar from '@/components/Avatar';
import MemberName from '@/components/MemberName';
import { AVATAR_RING_CLASSES } from '@/lib/nitro';
import type { MemberSummary } from '@/lib/types';
import { primaryButtonClass } from '@/lib/ui';

interface ProfileCardProps {
  member: MemberSummary;
  isSelf: boolean;
  onClose: () => void;
  onMessage: () => void;
}

export default function ProfileCard({ member, isSelf, onClose, onMessage }: ProfileCardProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="animate-scale-in w-full max-w-sm overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl">
        <div className="relative h-24 overflow-hidden" style={{ backgroundColor: member.banner_color }}>
          {member.banner_url && <img src={member.banner_url} alt="" className="absolute inset-0 h-full w-full object-cover" />}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close profile"
            className="absolute right-3 top-3 rounded-lg bg-black/30 p-1.5 text-white transition hover:bg-black/50"
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-6 pb-6">
          <div className="-mt-10 flex items-end justify-between gap-4">
            <Avatar
              name={member.display_name}
              color={member.color}
              imageUrl={member.avatar_url}
              size="lg"
              ringClassName={`ring-4 ring-zinc-900 ${AVATAR_RING_CLASSES[member.avatar_ring]}`}
            />
            {!isSelf && (
              <button type="button" onClick={onMessage} className={`${primaryButtonClass} mb-1`}>
                <MessageCircle size={16} />
                Message
              </button>
            )}
          </div>

          <div className="mt-4 space-y-3">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <MemberName member={member} className="text-xl font-bold" />
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-emerald-400">
                  <Crown size={11} />
                  {member.nitro_tag}
                </span>
              </div>
              {member.pronouns && <p className="mt-0.5 text-xs text-zinc-500">{member.pronouns}</p>}
              <p className="mt-1 text-sm text-zinc-400">{member.status || 'No status set'}</p>
            </div>

            {member.bio && (
              <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3">
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-zinc-500">About me</p>
                <p className="whitespace-pre-wrap break-words text-sm text-zinc-300">{member.bio}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
