import { Check, MessagesSquare, Smile, Sparkles, Users } from 'lucide-react';
import { useState, type CSSProperties, type FormEvent } from 'react';
import Avatar from '@/components/Avatar';
import { createMember } from '@/lib/api/members';
import { errorMessage } from '@/lib/errors';
import { storeMemberId } from '@/lib/identity';
import { PROFILE_COLORS } from '@/lib/palette';
import { errorTextClass, inputClass, labelClass } from '@/lib/ui';
import type { Member } from '@/lib/types';

interface OnboardingProps {
  onCreated: (member: Member) => void;
}

const FEATURES = [
  { icon: Users, text: 'Servers and channels for every group you run with' },
  { icon: MessagesSquare, text: 'Direct messages with anyone in the lounge' },
  { icon: Smile, text: 'Reactions, stickers, and GIFs your server can share' },
  { icon: Sparkles, text: 'A profile with your own picture, banner, and style' },
];

function stagger(index: number): CSSProperties {
  return { animationDelay: `${120 + index * 90}ms` };
}

export default function Onboarding({ onCreated }: OnboardingProps) {
  const [displayName, setDisplayName] = useState('');
  const [color, setColor] = useState(PROFILE_COLORS[0]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trimmedName = displayName.trim();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!trimmedName || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const member = await createMember({ display_name: trimmedName, color, status: '' });
      storeMemberId(member.id);
      onCreated(member);
    } catch (err) {
      setError(errorMessage(err, 'Could not create your profile. Please try again.'));
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-zinc-950 p-6">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="animate-gradient absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-zinc-950 to-sky-500/10 bg-[length:200%_200%]" />
        <div className="animate-float absolute -left-24 top-16 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl" />
        <div
          className="animate-float absolute -right-20 bottom-10 h-96 w-96 rounded-full bg-sky-500/15 blur-3xl"
          style={{ animationDelay: '-4s' }}
        />
        <div
          className="animate-float absolute left-1/3 top-1/2 h-64 w-64 rounded-full bg-teal-400/10 blur-3xl"
          style={{ animationDelay: '-7s' }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[length:24px_24px]" />
      </div>

      <div className="relative grid w-full max-w-5xl items-center gap-12 lg:grid-cols-2">
        <div className="hidden lg:block">
          <div
            className="animate-slide-up mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500 text-zinc-950 shadow-lg shadow-emerald-500/30"
            style={stagger(0)}
          >
            <MessagesSquare size={28} />
          </div>
          <h1 className="animate-slide-up text-5xl font-bold leading-[1.1] text-zinc-50" style={stagger(1)}>
            Your people,
            <br />
            <span className="bg-gradient-to-r from-emerald-300 to-sky-300 bg-clip-text text-transparent">
              all in one lounge.
            </span>
          </h1>
          <ul className="mt-8 space-y-4">
            {FEATURES.map(({ icon: Icon, text }, index) => (
              <li key={text} className="animate-slide-up flex items-center gap-3 text-zinc-300" style={stagger(index + 2)}>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/80 text-emerald-400">
                  <Icon size={18} />
                </span>
                <span className="text-[15px]">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="animate-slide-up w-full rounded-3xl border border-zinc-800/80 bg-zinc-900/70 p-8 shadow-2xl backdrop-blur-xl sm:p-10">
          <div className="mb-8 text-center lg:text-left">
            <div className="mb-4 flex justify-center lg:hidden">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500 text-zinc-950">
                <MessagesSquare size={28} />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-zinc-100">Welcome to Lounge</h2>
            <p className="mt-2 text-sm text-zinc-400">Pick a name and color to get started. You can personalize everything later.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5">
              <div className="animate-pop" key={color}>
                <Avatar name={trimmedName || '?'} color={color} size="lg" />
              </div>
              <p className="text-sm font-medium text-zinc-200">{trimmedName || 'Your name here'}</p>
            </div>

            <div>
              <label htmlFor="display-name" className={labelClass}>
                Display name
              </label>
              <input
                id="display-name"
                type="text"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                maxLength={32}
                placeholder="How should people see you?"
                className={`${inputClass} py-2.5`}
                autoFocus
              />
            </div>

            <div>
              <span className={labelClass}>Profile color</span>
              <div className="flex flex-wrap gap-2.5">
                {PROFILE_COLORS.map((swatch) => {
                  const selected = color === swatch;
                  return (
                    <button
                      key={swatch}
                      type="button"
                      onClick={() => setColor(swatch)}
                      aria-label={`Choose color ${swatch}`}
                      aria-pressed={selected}
                      className={`flex h-9 w-9 items-center justify-center rounded-full transition duration-200 hover:scale-110 active:scale-95 ${
                        selected ? 'ring-2 ring-zinc-100 ring-offset-2 ring-offset-zinc-900' : ''
                      }`}
                      style={{ backgroundColor: swatch }}
                    >
                      {selected && <Check size={16} className="animate-pop text-zinc-950" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {error && <p className={`${errorTextClass} animate-shake`}>{error}</p>}

            <button
              type="submit"
              disabled={!trimmedName || submitting}
              className="group relative w-full overflow-hidden rounded-xl bg-emerald-500 py-3 text-sm font-semibold text-zinc-950 shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400 hover:shadow-emerald-500/40 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
            >
              <span className="relative z-10">{submitting ? 'Creating your profile...' : 'Enter Lounge'}</span>
              {!submitting && trimmedName && (
                <span
                  className="animate-sheen absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-0 group-hover:opacity-100"
                  aria-hidden="true"
                />
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
