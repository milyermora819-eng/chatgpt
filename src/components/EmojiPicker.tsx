import { EMOJI_CATEGORIES } from '@/lib/palette';

interface EmojiPickerProps {
  onPick: (emoji: string) => void;
  onClose: () => void;
}

export default function EmojiPicker({ onPick, onClose }: EmojiPickerProps) {
  return (
    <>
      <div className="fixed inset-0 z-40" onMouseDown={onClose} aria-hidden="true" />
      <div className="animate-scale-in absolute bottom-full right-0 z-50 mb-2 h-80 w-80 overflow-y-auto rounded-xl border border-zinc-700 bg-zinc-900 p-3 shadow-2xl">
        {EMOJI_CATEGORIES.map((category) => (
          <div key={category.name} className="mb-3">
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-zinc-500">{category.name}</p>
            <div className="grid grid-cols-8 gap-0.5">
              {category.emojis.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => onPick(emoji)}
                  aria-label={`Pick ${emoji}`}
                  className="flex h-8 w-8 items-center justify-center rounded-md text-lg transition hover:scale-110 hover:bg-zinc-800"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
