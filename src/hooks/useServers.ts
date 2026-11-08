import { useCallback, useEffect, useState } from 'react';
import { fetchServersForMember } from '@/lib/api/servers';
import { errorMessage } from '@/lib/errors';
import type { Server } from '@/lib/types';

export function useServers(memberId: string) {
  const [servers, setServers] = useState<Server[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setServers(await fetchServersForMember(memberId));
      setError(null);
    } catch (err) {
      setError(errorMessage(err, 'Could not load your servers.'));
    } finally {
      setLoading(false);
    }
  }, [memberId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { servers, loading, error, refresh };
}
