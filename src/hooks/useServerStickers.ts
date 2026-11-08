import { useCallback, useEffect, useState } from 'react';
import { createServerSticker, fetchServerStickers } from '@/lib/api/stickers';
import { errorMessage } from '@/lib/errors';
import type { ServerSticker } from '@/lib/types';

export function useServerStickers(serverId: string | null, memberId: string) {
  const [stickers, setStickers] = useState<ServerSticker[]>([]);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!serverId) return;
    try {
      setStickers(await fetchServerStickers(serverId));
      setError(null);
    } catch (err) {
      setError(errorMessage(err, 'Could not load server stickers.'));
    }
  }, [serverId]);

  useEffect(() => {
    setStickers([]);
    void refresh();
  }, [refresh]);

  const addSticker = useCallback(
    async (file: File) => {
      if (!serverId) return;
      const sticker = await createServerSticker(serverId, memberId, file);
      setStickers((current) => [...current, sticker]);
    },
    [serverId, memberId],
  );

  return { stickers, error, addSticker };
}
