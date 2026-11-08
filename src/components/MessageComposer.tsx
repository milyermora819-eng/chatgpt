import { Smile, Send, Sticker as StickerIcon } from 'lucide-react';
import { useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import EmojiPicker from '@/components/EmojiPicker';
import StickerPicker, { type StickerLibrary } from '@/components/StickerPicker';
import { errorMessage } from '@/lib/errors';
import { customStickerContent, stickerContent, type Sticker } from '@/lib/stickers';
import { errorTextClass, primaryButtonClass } from '@/lib/ui';
import type { ServerSticker } from '@/lib/types';

const MAX_LENGTH = 4000;
const COUNTER_THRESHOLD = 3500;

interface MessageComposerProps {
  placeholder: string;
  stickerLibrary: StickerLibrary | null;
  onSend: (content: string) => Promise<void>;
}

export default function MessageComposer({ placeholder, stickerLibrary, onSend }: MessageComposerProps) {
  const [value, setValue] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [stickerOpen, setStickerOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const trimmed = value.trim();
  const canSend = trimmed.length > 0 && !sending;

  const submit = async () => {
    if (!canSend) return;
    setSending(true);
    setError(null);
    try {
      await onSend(trimmed);
      setValue('');
    } catch (err) {
      setError(errorMessage(err, 'Message could not be sent. Please try again.'));
    } finally {
      setSending(false);
    }
  };

  const sendContent = async (content: string) => {
    setStickerOpen(false);
    setError(null);
    try {
      await onSend(content);
    } catch (err) {
      setError(errorMessage(err, 'Sticker could not be sent. Please try again.'));
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void submit();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void submit();
    }
  };

  const insertEmoji = (emoji: string) => {
    const textarea = textareaRef.current;
    const start = textarea?.selectionStart ?? value.length;
    const end = textarea?.selectionEnd ?? value.length;
    const next = value.slice(0, start) + emoji + value.slice(end);
    setValue(next.slice(0, MAX_LENGTH));
    setPickerOpen(false);
    requestAnimationFrame(() => {
      textarea?.focus();
      const caret = start + emoji.length;
      textarea?.setSelectionRange(caret, caret);
    });
  };

  return (
    <div className="border-t border-zinc-800 bg-zinc-900 px-4 pb-4 pt-3">
      <form
        onSubmit={handleSubmit}
        className="flex items-end gap-2 rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2 transition focus-within:border-emerald-500/70 focus-within:shadow-[0_0_0_3px_rgba(16,185,129,0.12)]"
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={handleKeyDown}
          maxLength={MAX_LENGTH}
          rows={1}
          placeholder={placeholder}
          aria-label={placeholder}
          className="max-h-40 min-h-[32px] flex-1 resize-none bg-transparent py-1 text-[15px] text-zinc-100 placeholder:text-zinc-500 outline-none"
        />
        {stickerLibrary && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setStickerOpen((open) => !open)}
              aria-label="Send a sticker"
              className="rounded-md p-1.5 text-zinc-400 transition hover:scale-110 hover:bg-zinc-700 hover:text-zinc-100 active:scale-95"
            >
              <StickerIcon size={20} />
            </button>
            {stickerOpen && (
              <StickerPicker
                library={stickerLibrary}
                onPickBuiltIn={(sticker: Sticker) => void sendContent(stickerContent(sticker))}
                onPickCustom={(sticker: ServerSticker) => void sendContent(customStickerContent(sticker.image_url))}
                onClose={() => setStickerOpen(false)}
              />
            )}
          </div>
        )}
        <div className="relative">
          <button
            type="button"
            onClick={() => setPickerOpen((open) => !open)}
            aria-label="Insert emoji"
            className="rounded-md p-1.5 text-zinc-400 transition hover:scale-110 hover:bg-zinc-700 hover:text-zinc-100 active:scale-95"
          >
            <Smile size={20} />
          </button>
          {pickerOpen && <EmojiPicker onPick={insertEmoji} onClose={() => setPickerOpen(false)} />}
        </div>
        <button type="submit" disabled={!canSend} aria-label="Send message" className={`${primaryButtonClass} p-2`}>
          <Send size={18} />
        </button>
      </form>
      <div className="mt-1.5 flex items-center justify-between px-1 text-xs">
        {error ? <p className={errorTextClass}>{error}</p> : <span />}
        {value.length >= COUNTER_THRESHOLD && (
          <span className={value.length >= MAX_LENGTH ? 'text-red-400' : 'text-zinc-500'}>
            {value.length}/{MAX_LENGTH}
          </span>
        )}
      </div>
    </div>
  );
}
