import { Check, ChevronDown, Copy, Hash, Plus, Settings, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';
import Avatar from '@/components/Avatar';
import { readableTextColor } from '@/lib/color';
import type { Channel, ChannelCategory, Member, Server } from '@/lib/types';

interface ChannelSidebarProps {
  server: Server;
  channels: Channel[];
  categories: ChannelCategory[];
  activeChannelId: string | null;
  member: Member;
  onSelectChannel: (channelId: string) => void;
  onCreateChannel: () => void;
  onOpenServerSettings: () => void;
  onOpenSettings: () => void;
}

export default function ChannelSidebar({
  server,
  channels,
  categories,
  activeChannelId,
  member,
  onSelectChannel,
  onCreateChannel,
  onOpenServerSettings,
  onOpenSettings,
}: ChannelSidebarProps) {
  const [copied, setCopied] = useState(false);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const copyInvite = async () => {
    try {
      await navigator.clipboard.writeText(server.invite_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const toggleCategory = (categoryId: string) => {
    setCollapsed((current) => ({ ...current, [categoryId]: !current[categoryId] }));
  };

  const uncategorized = channels.filter((channel) => channel.category_id === null);
  let rowIndex = 0;
  const renderChannel = (channel: Channel) => {
    const delay = rowIndex * 40;
    rowIndex += 1;
    const isActive = channel.id === activeChannelId;
    return (
      <li key={channel.id} className="animate-slide-up" style={{ animationDelay: `${delay}ms` }}>
        <button
          type="button"
          onClick={() => onSelectChannel(channel.id)}
          aria-current={isActive ? 'true' : undefined}
          className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition duration-200 hover:translate-x-0.5 ${
            isActive ? 'bg-zinc-700/70 text-zinc-100' : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
          }`}
        >
          <Hash size={16} className="shrink-0 text-zinc-500" />
          <span className="truncate">{channel.name}</span>
        </button>
      </li>
    );
  };

  return (
    <aside className="flex w-60 shrink-0 flex-col bg-zinc-900">
      <div
        className="relative flex h-20 shrink-0 items-end border-b border-zinc-800 px-4 pb-2.5"
        style={{ backgroundColor: server.banner_color }}
      >
        <div className="min-w-0 flex-1">
          <h2 className="truncate font-semibold drop-shadow" style={{ color: readableTextColor(server.banner_color) }}>
            {server.name}
          </h2>
        </div>
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={copyInvite}
            title="Copy invite code"
            aria-label="Copy invite code"
            className="rounded-md bg-black/20 p-1.5 text-white transition hover:bg-black/40"
          >
            {copied ? <Check size={16} className="text-emerald-300" /> : <Copy size={16} />}
          </button>
          <button
            type="button"
            onClick={onOpenServerSettings}
            title="Server settings"
            aria-label="Server settings"
            className="rounded-md bg-black/20 p-1.5 text-white transition hover:bg-black/40"
          >
            <SlidersHorizontal size={16} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-4">
        <div className="mb-1 flex items-center justify-between px-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Channels</span>
          <button
            type="button"
            onClick={onCreateChannel}
            aria-label="Create channel"
            className="rounded-md p-1 text-zinc-500 transition hover:bg-zinc-800 hover:text-zinc-100"
          >
            <Plus size={16} />
          </button>
        </div>

        {uncategorized.length > 0 && <ul className="space-y-0.5">{uncategorized.map(renderChannel)}</ul>}

        {categories.map((category) => {
          const categoryChannels = channels.filter((channel) => channel.category_id === category.id);
          const isCollapsed = Boolean(collapsed[category.id]);
          return (
            <div key={category.id} className="mt-4">
              <button
                type="button"
                onClick={() => toggleCategory(category.id)}
                aria-expanded={!isCollapsed}
                className="group mb-1 flex w-full items-center gap-1 rounded-md px-1 py-1 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500 transition hover:text-zinc-200"
              >
                <ChevronDown
                  size={14}
                  className={`shrink-0 transition-transform duration-200 ${isCollapsed ? '-rotate-90' : ''}`}
                />
                <span className="truncate">{category.name}</span>
              </button>
              {!isCollapsed && (
                <ul className="space-y-0.5 animate-slide-up">
                  {categoryChannels.length > 0 ? (
                    categoryChannels.map(renderChannel)
                  ) : (
                    <li className="px-2 py-1 text-xs text-zinc-600">No channels yet</li>
                  )}
                </ul>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-3 border-t border-zinc-800 bg-zinc-950/60 px-3 py-3">
        <Avatar name={member.display_name} color={member.color} imageUrl={member.avatar_url} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-zinc-100">{member.display_name}</p>
          <p className="truncate text-xs text-zinc-500">{member.status || 'Online'}</p>
        </div>
        <button
          type="button"
          onClick={onOpenSettings}
          aria-label="Open settings"
          className="rounded-md p-1.5 text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-100"
        >
          <Settings size={18} />
        </button>
      </div>
    </aside>
  );
}
