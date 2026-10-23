'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import type { PagePreviewState } from '@/lib/types';

export type ResourceStatus = 'loading' | 'ready' | 'error';

/**
 * Tiny local data loader used by the workspace pages.
 *
 * Every page owns its own data and state — this hook only owns the
 * loading / ready / error lifecycle so the screens behave the same way.
 */
export function useResource(options: { preview?: PagePreviewState; delay?: number } = {}) {
  const { preview, delay = 320 } = options;
  const [status, setStatus] = useState<ResourceStatus>('loading');
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const failedRef = useRef(false);

  useEffect(() => {
    failedRef.current = false;
  }, [preview]);

  useEffect(() => {
    let active = true;
    setStatus('loading');
    setError(null);

    const timer = setTimeout(() => {
      if (!active) return;

      if (preview === 'error' && !failedRef.current) {
        failedRef.current = true;
        setStatus('error');
        setError('The workspace service did not respond. Check your connection and try again.');
        return;
      }

      setStatus('ready');
    }, delay);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [attempt, delay, preview]);

  const retry = useCallback(() => setAttempt((value) => value + 1), []);

  return { status, error, retry };
}
