import { NAME_EFFECT_CLASSES } from '@/lib/nitro';
import type { MemberSummary } from '@/lib/types';

interface MemberNameProps {
  member: MemberSummary;
  className?: string;
}

export default function MemberName({ member, className = '' }: MemberNameProps) {
  const isGradient = member.name_effect === 'shimmer' || member.name_effect === 'rainbow';
  return (
    <span
      className={`${NAME_EFFECT_CLASSES[member.name_effect]} ${className}`}
      style={{ color: isGradient ? undefined : member.color, ['--nitro-color' as string]: member.color }}
    >
      {member.display_name}
    </span>
  );
}
