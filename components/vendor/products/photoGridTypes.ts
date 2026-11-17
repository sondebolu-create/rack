import type { PhotoItem } from '@/lib/products';

export type PhotoGridProps = {
  photos: PhotoItem[];
  max: number;
  disabled?: boolean;
  onChange: (photos: PhotoItem[]) => void;
  /** Opens the picker. Called straight from the press handler (web file inputs need a direct tap). */
  onAdd: () => void;
  /** Re-runs the save so a failed upload is tried again. */
  onRetry: () => void;
};

/** Moves one item to a new position. */
export function move<T>(list: T[], from: number, to: number): T[] {
  if (from === to || from < 0 || to < 0 || from >= list.length || to >= list.length) return list;
  const next = [...list];
  next.splice(to, 0, next.splice(from, 1)[0]);
  return next;
}
