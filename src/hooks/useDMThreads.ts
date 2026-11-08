import { useCallback, useEffect, useState } from 'react';
import { fetchDMThreads } from '@/lib/api/dms';
import { errorMessage } from '@/lib/errors';
import { supabase } from '@/lib/supabase';
import type { DMThread } from '@/lib/types';

export function useDMThreads(memberId: string) {
  const [threads, setThreads] = useState<DMThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setThreads(await fetchDMThreads(memberId));
      setError(null);
    } catch (err) {
      setError(errorMessage(err, 'Could not load direct messages.'));
    } finally {
      setLoading(false);
    }
  }, [memberId]);

  useEffect(() => {
    void refresh();

    const realtime = supabase
      .channel(`dm-threads-${memberId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'dm_threads' }, () => {
        void refresh();
      })
      .subscribe();

    return () => {
      void supabase.removeChannel(realtime);
    };
  }, [memberId, refresh]);

  return { threads, loading, error, refresh };
}
