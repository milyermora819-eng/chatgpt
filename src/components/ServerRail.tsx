import { MessageCircle, Plus } from 'lucide-react';
import type { ReactNode } from 'react';
import { readableTextColor } from '@/lib/color';
import type { Server } from '@/lib/types';

interface ServerRailProps {
  servers: Server[];
  activeServerId: string | null;
  dmActive: boolean;
  onSelect: (serverId: string) => void;
  onOpenDMs: () => void;
  onAddServer: () => void;
}

export default function ServerRail({
  servers,
  activeServerId,
  dmActive,
  onSelect,
  onOpenDMs,
  onAddServer,
}: ServerRailProps) {
  return (
    <nav className="flex w-[72px] shrink-0 flex-col items-center gap-3 overflow-y-auto bg-zinc-950 py-3" aria-label="Servers">
      <RailButton active={dmActive} label="Direct messages" onClick={onOpenDMs}>
        <MessageCircle size={22} />
      </RailButton>
      <div className="h-px w-8 bg-zinc-800" />
      {servers.map((server) => (
        <RailButton
          key={server.id}
          active={!dmActive && server.id === activeServerId}
          label={server.name}
          color={server.icon_color}
          onClick={() => onSelect(server.id)}
        >
          <span className="text-base font-semibold">{server.name.charAt(0).toUpperCase()}</span>
        </RailButton>
      ))}
      <button
        type="button"
        onClick={onAddServer}
        title="Create or join a server"
        aria-label="Create or join a server"
        className="flex h-12 w-12 items-center justify-center rounded-3xl bg-zinc-800 text-emerald-400 transition-all duration-200 hover:rounded-2xl hover:bg-emerald-500 hover:text-zinc-950"
      >
        <Plus size={22} />
      </button>
    </nav>
  );
}

function RailButton({
  active,
  label,
  color,
  onClick,
  children,
}: {
  active: boolean;
  label: string;
  color?: string;
  onClick: () => void;
  children: ReactNode;
}) {
  const colorStyle = color ? { backgroundColor: color, color: readableTextColor(color) } : undefined;
  return (
    <div className="group relative flex w-full items-center justify-center">
      <span
        className={`absolute left-0 w-1 rounded-r-full bg-zinc-100 transition-all duration-200 ${
          active ? 'h-10' : 'h-0 group-hover:h-5'
        }`}
      />
      <button
        type="button"
        onClick={onClick}
        title={label}
        aria-label={label}
        aria-current={active ? 'true' : undefined}
        style={colorStyle}
        className={`flex h-12 w-12 items-center justify-center transition-all duration-200 ${
          active
            ? 'rounded-2xl bg-emerald-500 text-zinc-950'
            : 'rounded-3xl bg-zinc-800 text-zinc-200 hover:rounded-2xl hover:bg-emerald-600 hover:text-white'
        } ${color && !active ? 'hover:brightness-110' : ''}`}
      >
        {children}
      </button>
    </div>
  );
}
