import { useState, type FormEvent } from 'react';
import Modal from '@/components/Modal';
import { createServer, joinServerByInvite } from '@/lib/api/servers';
import { errorMessage } from '@/lib/errors';
import { errorTextClass, inputClass, labelClass, primaryButtonClass } from '@/lib/ui';
import type { Server } from '@/lib/types';

type Tab = 'create' | 'join';

interface ServerModalProps {
  memberId: string;
  onClose: () => void;
  onReady: (server: Server) => void;
}

export default function ServerModal({ memberId, onClose, onReady }: ServerModalProps) {
  const [tab, setTab] = useState<Tab>('create');
  const [value, setValue] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trimmed = value.trim();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!trimmed || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const server =
        tab === 'create'
          ? await createServer(trimmed, memberId)
          : await joinServerByInvite(trimmed, memberId);
      onReady(server);
    } catch (err) {
      setError(errorMessage(err, 'Something went wrong. Please try again.'));
      setSubmitting(false);
    }
  };

  const switchTab = (next: Tab) => {
    setTab(next);
    setValue('');
    setError(null);
  };

  return (
    <Modal title="Add a server" onClose={onClose}>
      <div className="mb-5 grid grid-cols-2 rounded-lg bg-zinc-950 p-1">
        {(['create', 'join'] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => switchTab(option)}
            className={`rounded-md py-1.5 text-sm font-medium transition ${
              tab === option ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {option === 'create' ? 'Create a server' : 'Join with invite'}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="server-input" className={labelClass}>
            {tab === 'create' ? 'Server name' : 'Invite code'}
          </label>
          <input
            id="server-input"
            type="text"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            maxLength={tab === 'create' ? 64 : 16}
            placeholder={tab === 'create' ? 'My awesome server' : 'e.g. k3j9x0ab'}
            className={inputClass}
            autoFocus
          />
        </div>
        {error && <p className={errorTextClass}>{error}</p>}
        <button type="submit" disabled={!trimmed || submitting} className={`${primaryButtonClass} w-full py-2.5`}>
          {submitting ? 'Working...' : tab === 'create' ? 'Create server' : 'Join server'}
        </button>
      </form>
    </Modal>
  );
}
