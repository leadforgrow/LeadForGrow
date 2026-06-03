'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { getAuthToken } from '@/lib/apiClient';
import { REALTIME_EVENTS } from '@/lib/realtime/constants';

/**
 * SSE subscription for tenant-scoped realtime events.
 */
export function useRealtime({ onEvent, enabled = true } = {}) {
  const [connected, setConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState(null);
  const sourceRef = useRef(null);
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  const disconnect = useCallback(() => {
    if (sourceRef.current) {
      sourceRef.current.close();
      sourceRef.current = null;
    }
    setConnected(false);
  }, []);

  const connect = useCallback(() => {
    const token = getAuthToken();
    if (!token || !enabled) return;

    disconnect();

    const url = `/api/realtime/stream?token=${encodeURIComponent(token)}`;
    const es = new EventSource(url);
    sourceRef.current = es;

    es.onopen = () => setConnected(true);
    es.onerror = () => {
      setConnected(false);
      es.close();
      sourceRef.current = null;
      setTimeout(connect, 3000);
    };

    es.onmessage = (msg) => {
      try {
        const event = JSON.parse(msg.data);
        setLastEvent(event);
        onEventRef.current?.(event);
      } catch {
        /* ignore */
      }
    };
  }, [disconnect, enabled]);

  useEffect(() => {
    connect();
    return disconnect;
  }, [connect, disconnect]);

  return { connected, lastEvent, reconnect: connect, disconnect };
}

export { REALTIME_EVENTS };
