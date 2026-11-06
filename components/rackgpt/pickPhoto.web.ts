import type { ImageSource } from '@/lib/types';

export type PhotoSource = 'library' | 'camera';

/**
 * Web version: a hidden file input. `capture` makes mobile browsers open the camera instead of the gallery;
 * desktop browsers ignore it and show the file chooser. Browsers only open the chooser from inside a tap,
 * so call this straight from the press handler, with no `await` before it.
 * Resolves to null when the shopper cancels. The uri is a blob: URL that lives until the tab closes.
 */
export function pickPhoto(from: PhotoSource): Promise<ImageSource | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    if (from === 'camera') input.setAttribute('capture', 'environment');
    input.style.display = 'none';
    document.body.appendChild(input);

    const finish = (file: File | null | undefined) => {
      input.remove();
      resolve(file ? { uri: URL.createObjectURL(file) } : null);
    };
    input.addEventListener('change', () => finish(input.files?.[0]));
    input.addEventListener('cancel', () => finish(null));
    input.click();
  });
}
