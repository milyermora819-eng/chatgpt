import { Check, Pencil, Plus, Trash2, X } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { createCategory, deleteCategory, renameCategory } from '@/lib/api/categories';
import { errorMessage } from '@/lib/errors';
import { errorTextClass, inputClass, primaryButtonClass } from '@/lib/ui';
import type { ChannelCategory } from '@/lib/types';

interface ServerCategoriesPanelProps {
  serverId: string;
  categories: ChannelCategory[];
  disabled: boolean;
  onChanged: () => void;
}

export default function ServerCategoriesPanel({ serverId, categories, disabled, onChanged }: ServerCategoriesPanelProps) {
  const [newName, setNewName] = useState('');
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const trimmedNew = newName.trim();
  const trimmedDraft = draft.trim();

  const runAction = async (categoryId: string, action: () => Promise<unknown>, fallback: string) => {
    setBusyId(categoryId);
    setError(null);
    try {
      await action();
      onChanged();
      return true;
    } catch (err) {
      setError(errorMessage(err, fallback));
      return false;
    } finally {
      setBusyId(null);
    }
  };

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!trimmedNew || adding || disabled) return;
    setAdding(true);
    setError(null);
    try {
      await createCategory(serverId, trimmedNew);
      setNewName('');
      onChanged();
    } catch (err) {
      setError(errorMessage(err, 'Could not create the category.'));
    } finally {
      setAdding(false);
    }
  };

  const saveRename = async (category: ChannelCategory) => {
    if (!trimmedDraft) return;
    const ok = await runAction(
      category.id,
      () => renameCategory(category.id, trimmedDraft),
      'Could not rename the category.',
    );
    if (ok) setEditingId(null);
  };

  return (
    <div className="space-y-5">
      <p className="text-sm text-zinc-400">
        Categories group channels in the sidebar. Deleting a category keeps its channels and moves them out of the group.
      </p>

      {!disabled && (
        <form onSubmit={handleCreate} className="flex gap-2">
          <input
            type="text"
            value={newName}
            onChange={(event) => setNewName(event.target.value)}
            maxLength={32}
            placeholder="New category name"
            aria-label="New category name"
            className={`${inputClass} py-2`}
          />
          <button type="submit" disabled={!trimmedNew || adding} className={`${primaryButtonClass} shrink-0 gap-1.5 px-3`}>
            <Plus size={16} />
            Add
          </button>
        </form>
      )}

      {categories.length === 0 ? (
        <p className="rounded-xl border border-dashed border-zinc-700 p-4 text-center text-sm text-zinc-500">
          No categories yet.
        </p>
      ) : (
        <ul className="space-y-2">
          {categories.map((category) => {
            const isEditing = editingId === category.id;
            const isBusy = busyId === category.id;
            return (
              <li
                key={category.id}
                className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-950/60 px-3 py-2 animate-slide-up"
              >
                {isEditing ? (
                  <input
                    type="text"
                    value={draft}
                    autoFocus
                    maxLength={32}
                    onChange={(event) => setDraft(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') void saveRename(category);
                      if (event.key === 'Escape') setEditingId(null);
                    }}
                    aria-label="Category name"
                    className={`${inputClass} py-1.5`}
                  />
                ) : (
                  <span className="min-w-0 flex-1 truncate text-sm font-semibold uppercase tracking-wide text-zinc-200">
                    {category.name}
                  </span>
                )}

                {!disabled && isEditing && (
                  <>
                    <button
                      type="button"
                      onClick={() => void saveRename(category)}
                      disabled={!trimmedDraft || isBusy}
                      aria-label="Save category name"
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

                {!disabled && !isEditing && confirmDeleteId !== category.id && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(category.id);
                        setDraft(category.name);
                      }}
                      aria-label={`Rename ${category.name}`}
                      className="rounded-md p-1.5 text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-100"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(category.id)}
                      aria-label={`Delete ${category.name}`}
                      className="rounded-md p-1.5 text-zinc-400 transition hover:bg-red-500/15 hover:text-red-400"
                    >
                      <Trash2 size={16} />
                    </button>
                  </>
                )}

                {!disabled && confirmDeleteId === category.id && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-400">Delete?</span>
                    <button
                      type="button"
                      onClick={() => {
                        setConfirmDeleteId(null);
                        void runAction(category.id, () => deleteCategory(category.id), 'Could not delete the category.');
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
      )}

      {error && <p className={errorTextClass}>{error}</p>}
    </div>
  );
}
