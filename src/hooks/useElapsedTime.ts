import { useState, useEffect } from 'react';
import { formatElapsedTime } from '@/lib/utils';

export function useElapsedTime(requestedAt: string | null | undefined) {
  const [elapsed, setElapsed] = useState<string>('00:00');
  const [seconds, setSeconds] = useState<number>(0);

  useEffect(() => {
    if (!requestedAt) {
      setElapsed('00:00');
      setSeconds(0);
      return;
    }

    const update = () => {
      const diffMs = Math.max(0, Date.now() - new Date(requestedAt).getTime());
      const s = Math.floor(diffMs / 1000);
      setSeconds(s);
      setElapsed(formatElapsedTime(requestedAt));
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [requestedAt]);

  const isUrgent = seconds > 120; // Mais de 2 minutos aguardando

  return { elapsed, seconds, isUrgent };
}
