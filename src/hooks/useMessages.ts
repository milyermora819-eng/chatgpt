import { useCallback, useEffect, useState } from 'react';
import { fetchMessages } from '@/lib/api/chat';
import { errorMessage } from '@/lib/errors';
import { supabase } from '@/lib/supabase';
import type { ChatScope, Message } from '@/lib/types';

export function useMessages(scope: ChatScope | null) {
  const scopeKind = scope?.kind ?? null;
  const scopeId = scope?.id ?? null;
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!scopeKind || !scopeId) return;
    try {
      setMessages(await fetchMessages({ kind: scopeKind, id: scopeId }));
      setError(null);
    } catch (err) {
      setError(errorMessage(err, 'Could not load messages.'));
    } finally {
      setLoading(false);
    }
  }, [scopeKind, scopeId]);

  useEffect(() => {
    if (!scopeKind || !scopeId) {
      setMessages([]);
      return;
    }
    setLoading(true);
    void refresh();

    const realtime = supabase
      .channel(`messages-${scopeKind}-${scopeId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => {
        void refresh();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reactions' }, () => {
        void refresh();
      })
      .subscribe();

    return () => {
      void supabase.removeChannel(realtime);
    };
  }, [scopeKind, scopeId, refresh]);

  return { messages, loading, error, refresh };
}
