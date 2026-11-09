import { useState, type FormEvent } from 'react';
import Modal from '@/components/Modal';
import { createChannel } from '@/lib/api/servers';
import { errorMessage } from '@/lib/errors';
import { toChannelSlug } from '@/lib/slug';
import { errorTextClass, inputClass, labelClass, primaryButtonClass } from '@/lib/ui';
import type { Channel, ChannelCategory } from '@/lib/types';

interface CreateChannelModalProps {
  serverId: string;
  categories: ChannelCategory[];
  onClose: () => void;
  onCreated: (channel: Channel) => void;
}

export default function CreateChannelModal({ serverId, categories, onClose, onCreated }: CreateChannelModalProps) {
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const slug = toChannelSlug(name);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!slug || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      onCreated(await createChannel(serverId, slug, categoryId || null));
    } catch (err) {
      setError(errorMessage(err, 'Could not create the channel. Please try again.'));
      setSubmitting(false);
    }
  };

  return (
    <Modal title="Create channel" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="channel-name" className={labelClass}>
            Channel name
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-zinc-500">#</span>
            <input
              id="channel-name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={32}
              placeholder="new-channel"
              className={`${inputClass} pl-7`}
              autoFocus
            />
          </div>
        </div>
        <div>
          <label htmlFor="channel-category" className={labelClass}>
            Category
          </label>
          <select
            id="channel-category"
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
            className={inputClass}
          >
            <option value="">No category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        {error && <p className={errorTextClass}>{error}</p>}
        <button type="submit" disabled={!slug || submitting} className={`${primaryButtonClass} w-full py-2.5`}>
          {submitting ? 'Creating...' : 'Create channel'}
        </button>
      </form>
    </Modal>
  );
}
