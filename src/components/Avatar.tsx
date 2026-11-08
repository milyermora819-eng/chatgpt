const SIZE_CLASSES = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-20 w-20 text-2xl',
} as const;

interface AvatarProps {
  name: string;
  color: string;
  imageUrl?: string | null;
  size?: keyof typeof SIZE_CLASSES;
  ringClassName?: string;
}

export default function Avatar({ name, color, imageUrl = null, size = 'md', ringClassName = '' }: AvatarProps) {
  const initial = name.trim().charAt(0).toUpperCase() || '?';
  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full font-semibold text-zinc-950 ${SIZE_CLASSES[size]} ${ringClassName}`}
      style={{ backgroundColor: color, ['--nitro-color' as string]: color }}
      aria-hidden="true"
    >
      {imageUrl ? <img src={imageUrl} alt="" className="h-full w-full object-cover" /> : initial}
    </div>
  );
}
