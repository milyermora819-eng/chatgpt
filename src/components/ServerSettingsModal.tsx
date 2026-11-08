import { useState, type FormEvent } from 'react';
import Modal from '@/components/Modal';
import ServerChannelsPanel from '@/components/ServerChannelsPanel';
import ServerInvitePanel from '@/components/ServerInvitePanel';
import { deleteServer, updateServer, type ServerFields } from '@/lib/api/servers';
import { errorMessage } from '@/lib/errors';
import { PROFILE_COLORS } from '@/lib/palette';
import { readableTextColor } from '@/lib/color';
import { errorTextClass, inputClass, labelClass, primaryButtonClass, secondaryButtonClass } from '@/lib/ui';
import type { Channel, Server } from '@/lib/types';

type Tab = 'overview' | 'channels' | 'invites' | 'danger';

const TABS: { value: Tab; label: string }[] = [
  { value: 'overview', label: 'Overview' },
  { value: 'channels', label: 'Channels' },
  { value: 'invites', label: 'Invites' },
  { value: 'danger', label: 'Delete' },
];

interface ServerSettingsModalProps {
  server: Server;
  channels: Channel[];
  isOwner: boolean;
  onClose: () => void;
  onServerChange: () => void;
  onChannelsChange: () => void;
  onDeleted: () => void;
}

export default function ServerSettingsModal({
  server,
  channels,
  isOwner,
  onClose,
  onServerChange,
  onChannelsChange,
  onDeleted,
}: ServerSettingsModalProps) {
  const [tab, setTab] = useState<Tab>('overview');

  return (
    <Modal title="Server settings" onClose={onClose}>
      <div className="mb-5 grid grid-cols-4 rounded-lg bg-zinc-950 p-1">
        {TABS.filter((option) => isOwner || option.value !== 'danger').map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setTab(option.value)}
            className={`rounded-md py-1.5 text-sm font-medium transition ${
              tab === option.value ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {!isOwner && (
        <p className="mb-5 rounded-lg border border-zinc-800 bg-zinc-950/60 p-3 text-xs text-zinc-400">
          Only the server owner can change these settings.
        </p>
      )}

      {tab === 'overview' && <OverviewForm server={server} disabled={!isOwner} onSaved={onServerChange} />}
      {tab === 'channels' && (
        <ServerChannelsPanel channels={channels} disabled={!isOwner} onChanged={onChannelsChange} />
      )}
      {tab === 'invites' && <ServerInvitePanel server={server} disabled={!isOwner} onChanged={onServerChange} />}
      {tab === 'danger' && isOwner && <DeleteServerPanel server={server} onDeleted={onDeleted} />}
    </Modal>
  );
}

function OverviewForm({ server, disabled, onSaved }: { server: Server; disabled: boolean; onSaved: () => void }) {
  const [form, setForm] = useState<ServerFields>({
    name: server.name,
    description: server.description,
    icon_color: server.icon_color,
    banner_color: server.banner_color,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const trimmedName = form.name.trim();
  const patch = (changes: Partial<ServerFields>) => {
    setSaved(false);
    setForm((current) => ({ ...current, ...changes }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!trimmedName || saving || disabled) return;
    setSaving(true);
    setError(null);
    try {
      await updateServer(server.id, { ...form, name: trimmedName, description: form.description.trim() });
      setSaved(true);
      onSaved();
    } catch (err) {
      setError(errorMessage(err, 'Could not save the server. Please try again.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="overflow-hidden rounded-xl border border-zinc-800">
        <div className="h-20" style={{ backgroundColor: form.banner_color }} />
        <div className="-mt-7 flex items-end gap-3 px-4 pb-4">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-2xl border-4 border-zinc-900 text-xl font-bold"
            style={{ backgroundColor: form.icon_color, color: readableTextColor(form.icon_color) }}
          >
            {(trimmedName || '?').charAt(0).toUpperCase()}
          </div>
          <p className="truncate pb-1 text-sm font-semibold text-zinc-100">{trimmedName || 'Server name'}</p>
        </div>
      </div>

      <div>
        <label htmlFor="server-name" className={labelClass}>
          Server name
        </label>
        <input
          id="server-name"
          type="text"
          value={form.name}
          onChange={(event) => patch({ name: event.target.value })}
          maxLength={64}
          disabled={disabled}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="server-description" className={labelClass}>
          Description
        </label>
        <textarea
          id="server-description"
          value={form.description}
          onChange={(event) => patch({ description: event.target.value })}
          maxLength={256}
          rows={3}
          disabled={disabled}
          placeholder="What is this server about?"
          className={`${inputClass} resize-none`}
        />
      </div>

      <ColorPicker
        label="Icon color"
        value={form.icon_color}
        disabled={disabled}
        onChange={(icon_color) => patch({ icon_color })}
      />
      <ColorPicker
        label="Banner color"
        value={form.banner_color}
        disabled={disabled}
        onChange={(banner_color) => patch({ banner_color })}
      />

      {error && <p className={errorTextClass}>{error}</p>}
      {saved && !error && <p className="text-sm text-emerald-400">Server updated.</p>}

      {!disabled && (
        <div className="flex justify-end border-t border-zinc-800 pt-5">
          <button type="submit" disabled={!trimmedName || saving} className={primaryButtonClass}>
            {saving ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      )}
    </form>
  );
}

function ColorPicker({
  label,
  value,
  disabled,
  onChange,
}: {
  label: string;
  value: string;
  disabled: boolean;
  onChange: (color: string) => void;
}) {
  return (
    <div>
      <span className={labelClass}>{label}</span>
      <div className="flex flex-wrap items-center gap-2">
        {PROFILE_COLORS.map((swatch) => (
          <button
            key={swatch}
            type="button"
            disabled={disabled}
            onClick={() => onChange(swatch)}
            aria-label={`${label} ${swatch}`}
            aria-pressed={value === swatch}
            className={`h-7 w-7 rounded-md transition hover:scale-110 disabled:hover:scale-100 ${
              value === swatch ? 'ring-2 ring-zinc-100 ring-offset-2 ring-offset-zinc-900' : ''
            }`}
            style={{ backgroundColor: swatch }}
          />
        ))}
        <input
          type="color"
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          aria-label={`Custom ${label.toLowerCase()}`}
          className="h-7 w-9 cursor-pointer rounded-md border border-zinc-700 bg-transparent disabled:cursor-not-allowed"
        />
      </div>
    </div>
  );
}

function DeleteServerPanel({ server, onDeleted }: { server: Server; onDeleted: () => void }) {
  const [confirmText, setConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const confirmed = confirmText.trim() === server.name;

  const handleDelete = async () => {
    if (!confirmed || deleting) return;
    setDeleting(true);
    setError(null);
    try {
      await deleteServer(server.id);
      onDeleted();
    } catch (err) {
      setError(errorMessage(err, 'Could not delete the server. Please try again.'));
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4">
        <p className="font-semibold text-red-300">Delete this server</p>
        <p className="mt-1 text-sm text-zinc-400">
          All channels and messages in the server will be removed for everyone. This cannot be undone.
        </p>
      </div>
      <div>
        <label htmlFor="delete-server-confirm" className={labelClass}>
          Type <span className="text-zinc-200">{server.name}</span> to confirm
        </label>
        <input
          id="delete-server-confirm"
          type="text"
          value={confirmText}
          onChange={(event) => setConfirmText(event.target.value)}
          className={inputClass}
        />
      </div>
      {error && <p className={errorTextClass}>{error}</p>}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleDelete}
          disabled={!confirmed || deleting}
          className={`${secondaryButtonClass} border-red-500/40 text-red-300 hover:bg-red-500/15 disabled:opacity-40`}
        >
          {deleting ? 'Deleting...' : 'Delete server'}
        </button>
      </div>
    </div>
  );
}
