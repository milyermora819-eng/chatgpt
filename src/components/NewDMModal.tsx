import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import Avatar from '@/components/Avatar';
import MemberName from '@/components/MemberName';
import Modal from '@/components/Modal';
import { fetchMemberDirectory } from '@/lib/api/members';
import { errorMessage } from '@/lib/errors';
import { AVATAR_RING_CLASSES } from '@/lib/nitro';
import { inputClass } from '@/lib/ui';
import type { Member } from '@/lib/types';

interface NewDMModalProps {
  member: Member;
  onClose: () => void;
  onPick: (otherId: string) => Promise<void>;
}

export default function NewDMModal({ member, onClose, onPick }: NewDMModalProps) {
  const [directory, setDirectory] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [pendingId, setPendingId] = useState<string | null>(null);

  useEffect(() => {
    fetchMemberDirectory(member.id)
      .then(setDirectory)
      .catch((err: unknown) => setError(errorMessage(err, 'Could not load members.')))
      .finally(() => setLoading(false));
  }, [member.id]);

  const visible = directory.filter((candidate) =>
    candidate.display_name.toLowerCase().includes(query.trim().toLowerCase()),
  );

  const pick = async (otherId: string) => {
    setPendingId(otherId);
    setError(null);
    try {
      await onPick(otherId);
    } catch (err) {
      setError(errorMessage(err, 'Could not open that conversation.'));
      setPendingId(null);
    }
  };

  return (
    <Modal title="New message" onClose={onClose}>
      <div className="relative mb-4">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Find a member"
          aria-label="Find a member"
          className={`${inputClass} pl-9`}
          autoFocus
        />
      </div>

      {error && <p className="mb-3 text-sm text-red-400">{error}</p>}
      {loading && <p className="text-sm text-zinc-500">Loading members...</p>}
      {!loading && visible.length === 0 && (
        <p className="text-sm text-zinc-500">No members match that name yet.</p>
      )}

      <ul className="space-y-1">
        {visible.map((candidate) => (
          <li key={candidate.id}>
            <button
              type="button"
              onClick={() => void pick(candidate.id)}
              disabled={pendingId !== null}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition hover:bg-zinc-800 disabled:opacity-50"
            >
              <Avatar
                name={candidate.display_name}
                color={candidate.color}
                imageUrl={candidate.avatar_url}
                ringClassName={AVATAR_RING_CLASSES[candidate.avatar_ring]}
              />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">
                  <MemberName member={candidate} />
                </span>
                <span className="block truncate text-xs text-zinc-500">{candidate.status || 'No status set'}</span>
              </span>
              {pendingId === candidate.id && <span className="text-xs text-zinc-400">Opening...</span>}
            </button>
          </li>
        ))}
      </ul>
    </Modal>
  );
}
