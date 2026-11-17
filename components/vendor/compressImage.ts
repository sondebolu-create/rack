import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

/**
 * Native compression: shrink so the long edge is at most `maxEdge` (never upscales), then re-encode as JPEG.
 * Web does the same with a canvas in the .web pickers, so this file is native-only.
 */
export async function compressImage(uri: string, width: number, height: number, maxEdge: number, quality = 0.8): Promise<string> {
  const ctx = ImageManipulator.manipulate(uri);
  if (Math.max(width, height) > maxEdge) {
    ctx.resize(width >= height ? { width: maxEdge } : { height: maxEdge });
  }
  const image = await ctx.renderAsync();
  const result = await image.saveAsync({ format: SaveFormat.JPEG, compress: quality });
  return result.uri;
}
