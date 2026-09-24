export const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => {
      console.error("Failed to load image for crop", error);
      reject(error);
    });
    // Do NOT set crossOrigin on data: or blob: URIs to prevent browser load failures
    if (typeof url === "string" && !url.startsWith("data:") && !url.startsWith("blob:")) {
      image.setAttribute("crossOrigin", "anonymous");
    }
    image.src = url;
  });

/**
 * Crops an image based on react-easy-crop pixel crop coordinates.
 * Generates an optimized Base64 JPEG string capped at 400x400 to ensure fast load times
 * and eliminate browser localStorage quota limits.
 */
export async function getCroppedImg(imageSrc, pixelCrop) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Canvas 2D context not available");
  }

  // Safety fallbacks if pixelCrop is missing or zero
  const cropX = Math.max(0, Math.round(pixelCrop?.x || 0));
  const cropY = Math.max(0, Math.round(pixelCrop?.y || 0));
  const cropWidth = Math.max(1, Math.round(pixelCrop?.width || image.naturalWidth || 300));
  const cropHeight = Math.max(1, Math.round(pixelCrop?.height || image.naturalHeight || 300));

  // Limit output resolution to 400x400 max for crisp avatar without storage blowup
  const maxOutputSize = 400;
  const targetSize = Math.min(Math.max(cropWidth, cropHeight), maxOutputSize);

  canvas.width = targetSize;
  canvas.height = targetSize;

  // Background
  ctx.fillStyle = "#030303";
  ctx.fillRect(0, 0, targetSize, targetSize);

  // High quality interpolation
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
    targetSize
  );

  return canvas.toDataURL("image/jpeg", 0.9);
}
