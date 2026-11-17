const QUALITY = 0.8;

/** Shrinks to at most `maxEdge` px (1280 by default) on the long edge and re-encodes as JPEG, so uploads are a few hundred KB. */
async function compress(file: File, maxEdge: number): Promise<string | null> {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, 'image/jpeg', QUALITY));
    return blob ? URL.createObjectURL(blob) : null;
  } catch {
    return null; // not a decodable image
  }
}

/**
 * Web version: a file input. Browsers only open it from inside a tap, so call this straight from the press
 * handler with no `await` first. Resolves to a blob: URL of the compressed JPEG, or null.
 */
export function pickSamplePhoto(maxEdge = 1280): Promise<string | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.style.display = 'none';
    document.body.appendChild(input);
    const finish = async (file: File | null | undefined) => {
      input.remove();
      resolve(file ? await compress(file, maxEdge) : null);
    };
    input.addEventListener('change', () => void finish(input.files?.[0]));
    input.addEventListener('cancel', () => void finish(null));
    input.click();
  });
}
