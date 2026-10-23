import type { PagePreviewState } from '@/lib/types';

const PREVIEW_STATES: PagePreviewState[] = ['loading', 'error', 'empty'];

/**
 * Reads the `?state=` query parameter used by the workspace pages so a screen
 * can be previewed as loading, error or empty without touching real data.
 */
export function parsePreviewState(
  value: string | string[] | undefined,
): PagePreviewState | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return undefined;

  const normalized = raw.trim().toLowerCase() as PagePreviewState;
  return PREVIEW_STATES.includes(normalized) ? normalized : undefined;
}
