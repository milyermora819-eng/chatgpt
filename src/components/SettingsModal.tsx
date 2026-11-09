import { ArrowLeftRight } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import Avatar from '@/components/Avatar';
import Modal from '@/components/Modal';
import MediaUploader from '@/components/MediaUploader';
import ProfileStyleEditor from '@/components/ProfileStyleEditor';
import { updateMember, updateMemberMedia, type MemberFields } from '@/lib/api/members';
import { uploadProfileImage } from '@/lib/api/media';
import { errorMessage } from '@/lib/errors';
import { AVATAR_RING_CLASSES } from '@/lib/nitro';
import { PROFILE_COLORS } from '@/lib/palette';
import { errorTextClass, inputClass, labelClass, primaryButtonClass, secondaryButtonClass } from '@/lib/ui';
import type { Member } from '@/lib/types';

type Tab = 'profile' | 'style';

interface SettingsModalProps {
  member: Member;
  onClose: () => void;
  onSaved: (member: Member) => void;
  onSwitchAccount: () => void;
  onMemberUpdated: (member: Member) => void;
}

export default function SettingsModal({ member, onClose, onSaved, onSwitchAccount, onMemberUpdated }: SettingsModalProps) {
  const [tab, setTab] = useState<Tab>('profile');
  const [form, setForm] = useState<MemberFields>({
    display_name: member.display_name,
    status: member.status,
    pronouns: member.pronouns,
    bio: member.bio,
    color: member.color,
    banner_color: member.banner_color,
    name_effect: member.name_effect,
    avatar_ring: member.avatar_ring,
    nitro_tag: member.nitro_tag,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trimmedName = form.display_name.trim();

  const patch = (changes: Partial<MemberFields>) => setForm((current) => ({ ...current, ...changes }));

  const saveMedia = async (media: Partial<Pick<Member, 'avatar_url' | 'banner_url'>>) => {
    onMemberUpdated(await updateMemberMedia(member.id, media));
  };

  const handleAvatarFile = async (file: File) => {
    await saveMedia({ avatar_url: await uploadProfileImage(member.id, 'avatar', file) });
  };

  const handleBannerFile = async (file: File) => {
    await saveMedia({ banner_url: await uploadProfileImage(member.id, 'banner', file) });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!trimmedName || saving) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await updateMember(member.id, {
        ...form,
        display_name: trimmedName,
        status: form.status.trim(),
        pronouns: form.pronouns.trim(),
        bio: form.bio.trim(),
        nitro_tag: form.nitro_tag.trim() || 'Plus',
      });
      onSaved(updated);
    } catch (err) {
      setError(errorMessage(err, 'Could not save your profile. Please try again.'));
      setSaving(false);
    }
  };

  return (
    <Modal title="Settings" onClose={onClose}>
      <div className="mb-5 grid grid-cols-2 rounded-lg bg-zinc-950 p-1">
        {(['profile', 'style'] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setTab(option)}
            className={`rounded-md py-1.5 text-sm font-medium transition ${
              tab === option ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {option === 'profile' ? 'Profile' : 'Style'}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center gap-4">
          <MediaUploader
            label="Upload profile picture"
            hasImage={Boolean(member.avatar_url)}
            shape="circle"
            onFile={handleAvatarFile}
            onRemove={() => saveMedia({ avatar_url: null })}
          >
            <Avatar
              name={trimmedName || '?'}
              color={form.color}
              imageUrl={member.avatar_url}
              size="lg"
              ringClassName={AVATAR_RING_CLASSES[form.avatar_ring]}
            />
          </MediaUploader>
          <p className="text-sm text-zinc-400">Hover your picture to upload one. Animated GIFs work too.</p>
        </div>

        {tab === 'profile' ? (
          <>
            <div>
              <label htmlFor="settings-name" className={labelClass}>
                Display name
              </label>
              <input
                id="settings-name"
                type="text"
                value={form.display_name}
                onChange={(event) => patch({ display_name: event.target.value })}
                maxLength={32}
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="settings-pronouns" className={labelClass}>
                Pronouns
              </label>
              <input
                id="settings-pronouns"
                type="text"
                value={form.pronouns}
                onChange={(event) => patch({ pronouns: event.target.value })}
                maxLength={40}
                placeholder="they/them"
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="settings-status" className={labelClass}>
                Custom status
              </label>
              <input
                id="settings-status"
                type="text"
                value={form.status}
                onChange={(event) => patch({ status: event.target.value })}
                maxLength={128}
                placeholder="What are you up to?"
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="settings-bio" className={labelClass}>
                About me
              </label>
              <textarea
                id="settings-bio"
                value={form.bio}
                onChange={(event) => patch({ bio: event.target.value })}
                maxLength={190}
                rows={3}
                placeholder="Tell people a little about yourself"
                className={`${inputClass} resize-none`}
              />
              <p className="mt-1 text-right text-xs text-zinc-500">{form.bio.length}/190</p>
            </div>

            <div>
              <span className={labelClass}>Profile color</span>
              <div className="flex flex-wrap items-center gap-2">
                {PROFILE_COLORS.map((swatch) => (
                  <button
                    key={swatch}
                    type="button"
                    onClick={() => patch({ color: swatch })}
                    aria-label={`Choose color ${swatch}`}
                    aria-pressed={form.color === swatch}
                    className={`h-7 w-7 rounded-full transition hover:scale-110 ${
                      form.color === swatch ? 'ring-2 ring-zinc-100 ring-offset-2 ring-offset-zinc-900' : ''
                    }`}
                    style={{ backgroundColor: swatch }}
                  />
                ))}
                <input
                  type="color"
                  value={form.color}
                  onChange={(event) => patch({ color: event.target.value })}
                  aria-label="Custom profile color"
                  className="h-7 w-9 cursor-pointer rounded-md border border-zinc-700 bg-transparent"
                />
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-6">
            <MediaUploader
              label="Upload banner image"
              hasImage={Boolean(member.banner_url)}
              shape="rect"
              className="w-full"
              onFile={handleBannerFile}
              onRemove={() => saveMedia({ banner_url: null })}
            >
              <div className="relative h-24 w-full overflow-hidden rounded-xl" style={{ backgroundColor: form.banner_color }}>
                {member.banner_url && (
                  <img src={member.banner_url} alt="" className="absolute inset-0 h-full w-full object-cover" />
                )}
              </div>
            </MediaUploader>
          <ProfileStyleEditor
            value={{
              banner_color: form.banner_color,
              name_effect: form.name_effect,
              avatar_ring: form.avatar_ring,
              nitro_tag: form.nitro_tag,
            }}
            onChange={patch}
          />
          </div>
        )}

        {error && <p className={errorTextClass}>{error}</p>}

        <div className="flex flex-col gap-3 border-t border-zinc-800 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <button type="button" onClick={onSwitchAccount} className={secondaryButtonClass}>
            <ArrowLeftRight size={16} />
            Switch profile
          </button>
          <button type="submit" disabled={!trimmedName || saving} className={primaryButtonClass}>
            {saving ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
