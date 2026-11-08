import { useCallback, useEffect, useState } from 'react';
import { fetchChannels } from '@/lib/api/servers';
import { supabase } from '@/lib/supabase';
import { errorMessage } from '@/lib/errors';
import type { Channel } from '@/lib/types';

export function useChannels(serverId: string | null) {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!serverId) return;
    try {
      setChannels(await fetchChannels(serverId));
      setError(null);
    } catch (err) {
      setError(errorMessage(err, 'Could not load channels.'));
    } finally {
      setLoading(false);
    }
  }, [serverId]);

  useEffect(() => {
    if (!serverId) {
      setChannels([]);
      return;
    }
    setLoading(true);
    void refresh();

    const realtime = supabase
      .channel(`channels-${serverId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'channels' }, () => {
        void refresh();
      })
      .subscribe();

    return () => {
      void supabase.removeChannel(realtime);
    };
  }, [serverId, refresh]);

  return { channels, loading, error, refresh };
}
