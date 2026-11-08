import { Plus } from 'lucide-react';
import { useState } from 'react';
import ChannelSidebar from '@/components/ChannelSidebar';
import ChatArea from '@/components/ChatArea';
import CreateChannelModal from '@/components/CreateChannelModal';
import DMSidebar from '@/components/DMSidebar';
import NewDMModal from '@/components/NewDMModal';
import ServerModal from '@/components/ServerModal';
import ServerSettingsModal from '@/components/ServerSettingsModal';
import ServerRail from '@/components/ServerRail';
import SettingsModal from '@/components/SettingsModal';
import { useChannels } from '@/hooks/useChannels';
import { useDMThreads } from '@/hooks/useDMThreads';
import { useServers } from '@/hooks/useServers';
import { openDMThread } from '@/lib/api/dms';
import { primaryButtonClass, secondaryButtonClass } from '@/lib/ui';
import type { ChatScope, Channel, Member, Server } from '@/lib/types';

type Mode = 'servers' | 'dms';
type OpenModal = 'server' | 'serverSettings' | 'channel' | 'settings' | 'newDM' | null;

interface ChatShellProps {
  member: Member;
  onMemberChange: (member: Member) => void;
  onSignOut: () => void;
}

export default function ChatShell({ member, onMemberChange, onSignOut }: ChatShellProps) {
  const { servers, loading, error, refresh: refreshServers } = useServers(member.id);
  const { threads, loading: threadsLoading, error: threadsError, refresh: refreshThreads } = useDMThreads(member.id);
  const [mode, setMode] = useState<Mode>('servers');
  const [activeServerId, setActiveServerId] = useState<string | null>(null);
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [openModal, setOpenModal] = useState<OpenModal>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const activeServer: Server | null = servers.find((s) => s.id === activeServerId) ?? servers[0] ?? null;
  const { channels, refresh: refreshChannels } = useChannels(activeServer?.id ?? null);
  const activeChannel: Channel | null = channels.find((c) => c.id === activeChannelId) ?? channels[0] ?? null;
  const activeThread = threads.find((thread) => thread.id === activeThreadId) ?? null;

  const scope: ChatScope | null =
    mode === 'dms'
      ? activeThread ? { kind: 'dm', id: activeThread.id } : null
      : activeChannel ? { kind: 'channel', id: activeChannel.id } : null;
  const title = mode === 'dms' ? activeThread?.other.display_name ?? null : activeChannel?.name ?? null;

  const selectServer = (serverId: string) => {
    setMode('servers');
    setActiveServerId(serverId);
    setActiveChannelId(null);
  };

  const handleServerReady = async (server: Server) => {
    setOpenModal(null);
    await refreshServers();
    selectServer(server.id);
  };

  const handleChannelCreated = async (channel: Channel) => {
    setOpenModal(null);
    await refreshChannels();
    setActiveChannelId(channel.id);
    setSidebarOpen(false);
  };

  const startDM = async (otherId: string) => {
    const threadId = await openDMThread(member.id, otherId, threads);
    await refreshThreads();
    setMode('dms');
    setActiveThreadId(threadId);
    setOpenModal(null);
    setSidebarOpen(false);
  };

  if (loading && servers.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <p className="text-sm text-zinc-400">Loading Lounge...</p>
      </div>
    );
  }

  const showServerEmpty = mode === 'servers' && !error && !activeServer && !loading;

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-950 text-zinc-100">
      <ServerRail
        servers={servers}
        activeServerId={activeServer?.id ?? null}
        dmActive={mode === 'dms'}
        onSelect={selectServer}
        onOpenDMs={() => setMode('dms')}
        onAddServer={() => setOpenModal('server')}
      />

      {error && mode === 'servers' && (
        <div className="flex flex-1 items-center justify-center p-6">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {mode === 'dms' && (
        <div className={`${sidebarOpen ? 'fixed inset-y-0 left-[72px] z-30 flex' : 'hidden'} md:flex`}>
          <DMSidebar
            member={member}
            threads={threads}
            loading={threadsLoading}
            error={threadsError}
            activeThreadId={activeThread?.id ?? null}
            onSelectThread={(threadId) => {
              setActiveThreadId(threadId);
              setSidebarOpen(false);
            }}
            onNewMessage={() => setOpenModal('newDM')}
            onOpenSettings={() => setOpenModal('settings')}
          />
        </div>
      )}

      {mode === 'servers' && !error && activeServer && (
        <div className={`${sidebarOpen ? 'fixed inset-y-0 left-[72px] z-30 flex' : 'hidden'} md:flex`}>
          <ChannelSidebar
            server={activeServer}
            channels={channels}
            activeChannelId={activeChannel?.id ?? null}
            member={member}
            onSelectChannel={(channelId) => {
              setActiveChannelId(channelId);
              setSidebarOpen(false);
            }}
            onCreateChannel={() => setOpenModal('channel')}
            onOpenServerSettings={() => setOpenModal('serverSettings')}
            onOpenSettings={() => setOpenModal('settings')}
          />
        </div>
      )}

      {(mode === 'dms' || (!error && activeServer)) && (
        <ChatArea
          scope={scope}
          title={title}
          serverId={activeServer?.id ?? null}
          member={member}
          onToggleSidebar={() => setSidebarOpen((open) => !open)}
          onStartDM={(memberId) => void startDM(memberId)}
        />
      )}

      {showServerEmpty && (
        <main className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-400">
            <Plus size={28} />
          </div>
          <h2 className="text-xl font-semibold text-zinc-100">You are not in any servers yet</h2>
          <p className="max-w-sm text-sm text-zinc-400">
            Create a server for your friends, or join one with an invite code.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <button type="button" onClick={() => setOpenModal('server')} className={primaryButtonClass}>
              Create or join a server
            </button>
            <button type="button" onClick={() => setMode('dms')} className={secondaryButtonClass}>
              Open direct messages
            </button>
          </div>
        </main>
      )}

      {openModal === 'server' && (
        <ServerModal memberId={member.id} onClose={() => setOpenModal(null)} onReady={handleServerReady} />
      )}
      {openModal === 'channel' && activeServer && (
        <CreateChannelModal
          serverId={activeServer.id}
          onClose={() => setOpenModal(null)}
          onCreated={handleChannelCreated}
        />
      )}
      {openModal === 'serverSettings' && activeServer && (
        <ServerSettingsModal
          server={activeServer}
          channels={channels}
          isOwner={activeServer.owner_id === member.id}
          onClose={() => setOpenModal(null)}
          onServerChange={() => void refreshServers()}
          onChannelsChange={() => void refreshChannels()}
          onDeleted={async () => {
            setOpenModal(null);
            setActiveServerId(null);
            setActiveChannelId(null);
            await refreshServers();
          }}
        />
      )}
      {openModal === 'newDM' && (
        <NewDMModal member={member} onClose={() => setOpenModal(null)} onPick={startDM} />
      )}
      {openModal === 'settings' && (
        <SettingsModal
          member={member}
          onClose={() => setOpenModal(null)}
          onSaved={(updated) => {
            onMemberChange(updated);
            setOpenModal(null);
          }}
          onSignOut={onSignOut}
          onMemberUpdated={onMemberChange}
        />
      )}
    </div>
  );
}
