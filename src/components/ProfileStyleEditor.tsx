import type { ReactNode } from 'react';
import { AVATAR_RINGS, NAME_EFFECTS, type NitroFields } from '@/lib/nitro';
import { PROFILE_COLORS } from '@/lib/palette';
import { inputClass, labelClass } from '@/lib/ui';

interface ProfileStyleEditorProps {
  value: NitroFields;
  onChange: (patch: Partial<NitroFields>) => void;
}

function OptionButtons<T extends string>({
  options,
  selected,
  onSelect,
}: {
  options: { value: T; label: string }[];
  selected: T;
  onSelect: (value: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onSelect(option.value)}
          aria-pressed={selected === option.value}
          className={`rounded-lg border px-3 py-1.5 text-sm transition ${
            selected === option.value
              ? 'border-emerald-500 bg-emerald-500/15 text-emerald-300'
              : 'border-zinc-700 bg-zinc-800 text-zinc-300 hover:border-zinc-600'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <span className={labelClass}>{label}</span>
      {children}
    </div>
  );
}

export default function ProfileStyleEditor({ value, onChange }: ProfileStyleEditorProps) {
  return (
    <div className="space-y-6">
      <Field label="Banner color">
        <div className="flex flex-wrap items-center gap-2">
          {PROFILE_COLORS.map((swatch) => (
            <button
              key={swatch}
              type="button"
              onClick={() => onChange({ banner_color: swatch })}
              aria-label={`Banner color ${swatch}`}
              aria-pressed={value.banner_color === swatch}
              className={`h-7 w-7 rounded-md transition hover:scale-110 ${
                value.banner_color === swatch ? 'ring-2 ring-zinc-100 ring-offset-2 ring-offset-zinc-900' : ''
              }`}
              style={{ backgroundColor: swatch }}
            />
          ))}
          <input
            type="color"
            value={value.banner_color}
            onChange={(event) => onChange({ banner_color: event.target.value })}
            aria-label="Custom banner color"
            className="h-7 w-9 cursor-pointer rounded-md border border-zinc-700 bg-transparent"
          />
        </div>
      </Field>

      <Field label="Name effect">
        <OptionButtons
          options={NAME_EFFECTS}
          selected={value.name_effect}
          onSelect={(name_effect) => onChange({ name_effect })}
        />
      </Field>

      <Field label="Avatar ring">
        <OptionButtons
          options={AVATAR_RINGS}
          selected={value.avatar_ring}
          onSelect={(avatar_ring) => onChange({ avatar_ring })}
        />
      </Field>

      <div>
        <label htmlFor="badge-text" className={labelClass}>
          Badge text
        </label>
        <input
          id="badge-text"
          type="text"
          value={value.nitro_tag}
          onChange={(event) => onChange({ nitro_tag: event.target.value })}
          maxLength={12}
          placeholder="Plus"
          className={inputClass}
        />
        <p className="mt-1.5 text-xs text-zinc-500">Shown as a small badge beside your name on your messages.</p>
      </div>
    </div>
  );
}
