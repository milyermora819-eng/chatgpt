import { useCallback, useEffect, useState } from 'react';
import { fetchCategories } from '@/lib/api/categories';
import { fetchChannels } from '@/lib/api/servers';
import { supabase } from '@/lib/supabase';
import { errorMessage } from '@/lib/errors';
import type { Channel, ChannelCategory } from '@/lib/types';

export function useChannels(serverId: string | null) {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [categories, setCategories] = useState<ChannelCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!serverId) return;
    try {
      const [nextChannels, nextCategories] = await Promise.all([fetchChannels(serverId), fetchCategories(serverId)]);
      setChannels(nextChannels);
      setCategories(nextCategories);
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
      setCategories([]);
      return;
    }
    setLoading(true);
    void refresh();

    const realtime = supabase
      .channel(`channels-${serverId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'channels' }, () => {
        void refresh();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'channel_categories' }, () => {
        void refresh();
      })
      .subscribe();

    return () => {
      void supabase.removeChannel(realtime);
    };
  }, [serverId, refresh]);

  return { channels, categories, loading, error, refresh };
}
