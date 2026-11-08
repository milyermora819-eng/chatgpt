import { Check, Copy, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { regenerateInviteCode } from '@/lib/api/servers';
import { errorMessage } from '@/lib/errors';
import { errorTextClass, labelClass, secondaryButtonClass } from '@/lib/ui';
import type { Server } from '@/lib/types';

interface ServerInvitePanelProps {
  server: Server;
  disabled: boolean;
  onChanged: () => void;
}

export default function ServerInvitePanel({ server, disabled, onChanged }: ServerInvitePanelProps) {
  const [copied, setCopied] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(server.invite_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const regenerate = async () => {
    if (regenerating) return;
    setRegenerating(true);
    setError(null);
    try {
      await regenerateInviteCode(server.id);
      onChanged();
    } catch (err) {
      setError(errorMessage(err, 'Could not create a new invite code.'));
    } finally {
      setRegenerating(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <span className={labelClass}>Invite code</span>
        <div className="flex items-center gap-2">
          <code className="flex-1 truncate rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 font-mono text-sm text-emerald-300">
            {server.invite_code}
          </code>
          <button
            type="button"
            onClick={copyCode}
            className={`${secondaryButtonClass} px-3 py-2.5`}
            aria-label="Copy invite code"
          >
            {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
        <p className="mt-2 text-xs text-zinc-500">Share this code so friends can join the server.</p>
      </div>

      {!disabled && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
          <p className="text-sm font-medium text-zinc-200">Reset invite code</p>
          <p className="mt-1 text-xs text-zinc-500">The current code stops working once you create a new one.</p>
          <button
            type="button"
            onClick={regenerate}
            disabled={regenerating}
            className={`${secondaryButtonClass} mt-3`}
          >
            <RefreshCw size={16} className={regenerating ? 'animate-spin' : undefined} />
            {regenerating ? 'Creating...' : 'Create new code'}
          </button>
        </div>
      )}

      {error && <p className={errorTextClass}>{error}</p>}
    </div>
  );
}
