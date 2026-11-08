import { Camera, Loader2, Trash2 } from 'lucide-react';
import { useRef, useState, type ChangeEvent, type ReactNode } from 'react';
import { errorMessage } from '@/lib/errors';
import { validateImageFile } from '@/lib/api/media';

const ACCEPT = 'image/png,image/jpeg,image/gif,image/webp';

interface MediaUploaderProps {
  label: string;
  hasImage: boolean;
  className?: string;
  shape: 'circle' | 'rect';
  onFile: (file: File) => Promise<void>;
  onRemove: () => Promise<void>;
  children: ReactNode;
}

export default function MediaUploader({ label, hasImage, className = '', shape, onFile, onRemove, children }: MediaUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async (action: () => Promise<void>) => {
    setBusy(true);
    setError(null);
    try {
      await action();
    } catch (err) {
      setError(errorMessage(err, 'That image could not be saved. Please try again.'));
    } finally {
      setBusy(false);
    }
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    const problem = validateImageFile(file);
    if (problem) {
      setError(problem);
      return;
    }
    void run(() => onFile(file));
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="group relative">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          aria-label={label}
          className={`relative block ${shape === 'circle' ? 'rounded-full' : 'rounded-xl'}`}
        >
          {children}
          <span
            className={`absolute inset-0 flex items-center justify-center rounded-[inherit] bg-black/55 text-white transition-opacity duration-200 ${
              busy ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 group-focus-within:opacity-100'
            }`}
          >
            {busy ? <Loader2 size={22} className="animate-spin" /> : <Camera size={22} />}
          </span>
        </button>
        <input ref={inputRef} type="file" accept={ACCEPT} onChange={handleChange} className="hidden" />
      </div>

      <div className="flex items-center gap-3 text-xs">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="text-emerald-400 transition hover:text-emerald-300 disabled:opacity-50"
        >
          {hasImage ? 'Change image' : 'Upload image'}
        </button>
        {hasImage && (
          <button
            type="button"
            onClick={() => void run(onRemove)}
            disabled={busy}
            className="inline-flex items-center gap-1 text-zinc-400 transition hover:text-red-400 disabled:opacity-50"
          >
            <Trash2 size={12} />
            Remove
          </button>
        )}
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
