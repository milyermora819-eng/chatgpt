import { Check, Pencil, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { setChannelCategory } from '@/lib/api/categories';
import { deleteChannel, renameChannel } from '@/lib/api/servers';
import { errorMessage } from '@/lib/errors';
import { toChannelSlug } from '@/lib/slug';
import { errorTextClass, inputClass } from '@/lib/ui';
import type { Channel, ChannelCategory } from '@/lib/types';

interface ServerChannelsPanelProps {
  channels: Channel[];
  categories: ChannelCategory[];
  disabled: boolean;
  onChanged: () => void;
}

export default function ServerChannelsPanel({ channels, categories, disabled, onChanged }: ServerChannelsPanelProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const draftSlug = toChannelSlug(draft);

  const runChannelAction = async (channelId: string, action: () => Promise<unknown>, fallback: string) => {
    setBusyId(channelId);
    setError(null);
    try {
      await action();
      onChanged();
    } catch (err) {
      setError(errorMessage(err, fallback));
    } finally {
      setBusyId(null);
    }
  };

  const saveRename = async (channel: Channel) => {
    if (!draftSlug || draftSlug.length > 32) return;
    await runChannelAction(channel.id, () => renameChannel(channel.id, draftSlug), 'Could not rename the channel.');
    setEditingId(null);
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-zinc-400">Rename, move, or remove channels. Removing a channel also removes its messages.</p>
      <ul className="space-y-2">
        {channels.map((channel) => {
          const isEditing = editingId === channel.id;
          const isBusy = busyId === channel.id;
          return (
            <li
              key={channel.id}
              className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-950/60 px-3 py-2"
            >
              {isEditing ? (
                <input
                  type="text"
                  value={draft}
                  autoFocus
                  maxLength={32}
                  onChange={(event) => setDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') void saveRename(channel);
                    if (event.key === 'Escape') setEditingId(null);
                  }}
                  aria-label="Channel name"
                  className={`${inputClass} py-1.5`}
                />
              ) : (
                <span className="min-w-0 flex-1 truncate text-sm text-zinc-200">#{channel.name}</span>
              )}

              {!disabled && !isEditing && (
                <select
                  value={channel.category_id ?? ''}
                  onChange={(event) =>
                    void runChannelAction(
                      channel.id,
                      () => setChannelCategory(channel.id, event.target.value || null),
                      'Could not move the channel.',
                    )
                  }
                  disabled={isBusy}
                  aria-label={`Category for #${channel.name}`}
                  className="max-w-[9rem] rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-zinc-200"
                >
                  <option value="">No category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              )}

              {!disabled && isEditing && (
                <>
                  <button
                    type="button"
                    onClick={() => void saveRename(channel)}
                    disabled={!draftSlug || isBusy}
                    aria-label="Save channel name"
                    className="rounded-md p-1.5 text-emerald-400 transition hover:bg-zinc-800 disabled:opacity-40"
                  >
                    <Check size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    aria-label="Cancel rename"
                    className="rounded-md p-1.5 text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-100"
                  >
                    <X size={16} />
                  </button>
                </>
              )}

              {!disabled && !isEditing && confirmDeleteId !== channel.id && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(channel.id);
                      setDraft(channel.name);
                    }}
                    aria-label={`Rename #${channel.name}`}
                    className="rounded-md p-1.5 text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-100"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteId(channel.id)}
                    aria-label={`Delete #${channel.name}`}
                    className="rounded-md p-1.5 text-zinc-400 transition hover:bg-red-500/15 hover:text-red-400"
                  >
                    <Trash2 size={16} />
                  </button>
                </>
              )}

              {!disabled && confirmDeleteId === channel.id && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-400">Delete?</span>
                  <button
                    type="button"
                    onClick={() => {
                      setConfirmDeleteId(null);
                      void runChannelAction(channel.id, () => deleteChannel(channel.id), 'Could not delete the channel.');
                    }}
                    disabled={isBusy}
                    className="rounded-md bg-red-500/20 px-2 py-1 text-xs font-semibold text-red-300 transition hover:bg-red-500/30"
                  >
                    Delete
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteId(null)}
                    className="rounded-md px-2 py-1 text-xs text-zinc-400 transition hover:text-zinc-100"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ul>
      {error && <p className={errorTextClass}>{error}</p>}
    </div>
  );
}
