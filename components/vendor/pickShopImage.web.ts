import type { ShopImageKind } from '@/lib/shop';

export const ASPECT: Record<ShopImageKind, [number, number]> = { logo: [1, 1], banner: [8, 3] };
/** Output size in pixels: a 512 square logo, a 1600 x 600 banner. Plenty for a phone screen. */
const OUT: Record<ShopImageKind, [number, number]> = { logo: [512, 512], banner: [1600, 600] };
const QUALITY = 0.8;

/** Centre-crops to the target shape, scales down to the output size and re-encodes as JPEG. */
async function cropAndCompress(file: File, kind: ShopImageKind): Promise<string | null> {
  try {
    const bitmap = await createImageBitmap(file);
    const [w, h] = OUT[kind];
    const scale = Math.max(w / bitmap.width, h / bitmap.height); // cover
    const sw = w / scale;
    const sh = h / scale;
    const canvas = document.createElement('canvas');
    // Never upscale a small image past its own pixels.
    const k = Math.min(1, scale);
    canvas.width = Math.round(w * k);
    canvas.height = Math.round(h * k);
    canvas.getContext('2d')?.drawImage(bitmap, (bitmap.width - sw) / 2, (bitmap.height - sh) / 2, sw, sh, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, 'image/jpeg', QUALITY));
    return blob ? URL.createObjectURL(blob) : null;
  } catch {
    return null; // not a decodable image
  }
}

/**
 * Web version: a file input. Browsers only open it from inside a tap, so call this straight from the press
 * handler with no `await` first. Resolves to a blob: URL of the cropped JPEG, or null.
 */
export function pickShopImage(kind: ShopImageKind): Promise<string | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.style.display = 'none';
    document.body.appendChild(input);
    const finish = async (file: File | null | undefined) => {
      input.remove();
      resolve(file ? await cropAndCompress(file, kind) : null);
    };
    input.addEventListener('change', () => void finish(input.files?.[0]));
    input.addEventListener('cancel', () => void finish(null));
    input.click();
  });
}
