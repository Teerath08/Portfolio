/**
 * Crops an image in the browser using react-easy-crop pixel coordinates, and
 * returns a compact JPEG data URL.
 *
 * The output is deliberately capped at 400×400: the result is stored in
 * localStorage, so an uncapped export from a modern phone camera is enough to
 * blow past the quota and silently lose the avatar.
 */

export interface PixelCrop {
  x: number;
  y: number;
  width: number;
  height: number;
}

const MAX_OUTPUT_SIZE = 400;

export function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => {
      console.error("Failed to load image for crop", error);
      reject(error);
    });
    // Never set crossOrigin on data:/blob: URIs — it makes the load fail.
    if (!url.startsWith("data:") && !url.startsWith("blob:")) {
      image.setAttribute("crossOrigin", "anonymous");
    }
    image.src = url;
  });
}

export async function getCroppedImg(imageSrc: string, pixelCrop: PixelCrop): Promise<string> {
  const image = await loadImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) throw new Error("Canvas 2D context not available");

  // Fall back to the whole image if the crop is missing or degenerate.
  const cropX = Math.max(0, Math.round(pixelCrop?.x || 0));
  const cropY = Math.max(0, Math.round(pixelCrop?.y || 0));
  const cropWidth = Math.max(
    1,
    Math.round(pixelCrop?.width || image.naturalWidth || MAX_OUTPUT_SIZE),
  );
  const cropHeight = Math.max(
    1,
    Math.round(pixelCrop?.height || image.naturalHeight || MAX_OUTPUT_SIZE),
  );

  const targetSize = Math.min(
    Math.max(cropWidth, cropHeight),
    MAX_OUTPUT_SIZE,
  );

  canvas.width = targetSize;
  canvas.height = targetSize;

  ctx.fillStyle = "#05080b";
  ctx.fillRect(0, 0, targetSize, targetSize);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  ctx.drawImage(
    image,
    cropX,
    cropY,
    cropWidth,
    cropHeight,
    0,
    0,
    targetSize,
    targetSize,
  );

  return canvas.toDataURL("image/jpeg", 0.9);
}

/** Renders a crop to a small data URL for the live preview thumbnail. */
export function renderThumbnail(
  image: HTMLImageElement,
  crop: PixelCrop,
  size = 120,
): string | null {
  if (!image || !crop) return null;
  try {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    canvas.width = size;
    canvas.height = size;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(image, crop.x, crop.y, crop.width, crop.height, 0, 0, size, size);
    return canvas.toDataURL("image/jpeg", 0.85);
  } catch {
    return null;
  }
}