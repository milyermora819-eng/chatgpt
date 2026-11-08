import { Loader2, Plus } from 'lucide-react';
import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { validateImageFile } from '@/lib/api/media';
import { errorMessage } from '@/lib/errors';
import { STICKERS, type Sticker } from '@/lib/stickers';
import type { ServerSticker } from '@/lib/types';

const ACCEPT = 'image/png,image/jpeg,image/gif,image/webp';

export interface StickerLibrary {
  customStickers: ServerSticker[];
  error: string | null;
  onAddSticker: (file: File) => Promise<void>;
}

interface StickerPickerProps {
  library: StickerLibrary;
  onPickBuiltIn: (sticker: Sticker) => void;
  onPickCustom: (sticker: ServerSticker) => void;
  onClose: () => void;
}

export default function StickerPicker({ library, onPickBuiltIn, onPickCustom, onClose }: StickerPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    const problem = validateImageFile(file);
    if (problem) {
      setUploadError(problem);
      return;
    }
    setUploading(true);
    setUploadError(null);
    try {
      await library.onAddSticker(file);
    } catch (err) {
      setUploadError(errorMessage(err, 'That sticker could not be added. Please try again.'));
    } finally {
      setUploading(false);
    }
  };

  const errorText = uploadError ?? library.error;

  return (
    <>
      <div className="fixed inset-0 z-40" onMouseDown={onClose} aria-hidden="true" />
      <div className="animate-scale-in absolute bottom-full right-0 z-50 mb-2 max-h-96 w-80 overflow-y-auto rounded-2xl border border-zinc-700 bg-zinc-900 p-3 shadow-2xl">
        <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-zinc-500">Server stickers</p>
        <div className="grid grid-cols-4 gap-2">
          {library.customStickers.map((sticker, index) => (
            <button
              key={sticker.id}
              type="button"
              onClick={() => onPickCustom(sticker)}
              aria-label={`Send ${sticker.name} sticker`}
              title={sticker.name}
              className="animate-slide-up flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-zinc-800 transition hover:scale-110 hover:brightness-110 active:scale-95"
              style={{ animationDelay: `${Math.min(index, 12) * 25}ms` }}
            >
              <img src={sticker.image_url} alt="" loading="lazy" className="h-full w-full object-contain" />
            </button>
          ))}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            aria-label="Add a sticker"
            title="Add a sticker (image or GIF)"
            className="flex aspect-square items-center justify-center rounded-xl border-2 border-dashed border-zinc-700 text-zinc-400 transition hover:border-emerald-500/70 hover:text-emerald-400 disabled:opacity-50"
          >
            {uploading ? <Loader2 size={20} className="animate-spin" /> : <Plus size={22} />}
          </button>
          <input ref={inputRef} type="file" accept={ACCEPT} onChange={handleFile} className="hidden" />
        </div>
        {errorText && <p className="mt-2 px-1 text-xs text-red-400">{errorText}</p>}

        <p className="mb-2 mt-4 px-1 text-xs font-semibold uppercase tracking-wide text-zinc-500">Classic</p>
        <div className="grid grid-cols-4 gap-2">
          {STICKERS.map((sticker, index) => (
            <button
              key={sticker.id}
              type="button"
              onClick={() => onPickBuiltIn(sticker)}
              aria-label={`Send ${sticker.label} sticker`}
              title={sticker.label}
              className="animate-slide-up flex aspect-square items-center justify-center rounded-xl text-3xl transition hover:scale-110 hover:brightness-110 active:scale-95"
              style={{ backgroundColor: `${sticker.color}33`, animationDelay: `${index * 20}ms` }}
            >
              {sticker.emoji}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
