"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Cropper from "react-easy-crop";
import {
  AlertCircle,
  Check,
  Crop as CropIcon,
  Eye,
  RotateCcw,
  Trash2,
  Upload,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import {
  getCroppedImg,
  renderThumbnail,
  type PixelCrop,
} from "@/lib/cropImage";

interface ProfileImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentImage: string | null;
  onSave: (dataUrl: string) => void;
  onRemove: () => void;
}

const ACCEPTED = "image/png,image/jpeg,image/webp,image/jpg,image/gif";

/**
 * Avatar editor.
 *
 * Cropping happens entirely in the browser — no upload endpoint, no storage.
 * The result is capped at 400×400 before it is written to localStorage, which
 * is what keeps it inside the storage quota.
 *
 * Preserved from the previous site; only the surface was restyled.
 */
export default function ProfileImageModal({
  isOpen,
  onClose,
  currentImage,
  onSave,
  onRemove,
}: ProfileImageModalProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState<PixelCrop | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");

  const fileInput = useRef<HTMLInputElement>(null);
  const loadedImage = useRef<HTMLImageElement | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const reset = useCallback(() => {
    setImageSrc(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedArea(null);
    setPreview(null);
    setError("");
    setDragOver(false);
  }, []);

  const close = useCallback(() => {
    reset();
    onClose();
  }, [onClose, reset]);

  // Escape closes, and focus moves to the dialog so the keyboard is not left
  // pointing at whatever was behind the overlay.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    dialogRef.current?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, close]);

  const acceptFile = (file: File | undefined | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("That file is not an image. PNG, JPG and WEBP work.");
      return;
    }
    setError("");

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") return;
      setImageSrc(result);
      setZoom(1);
      setCrop({ x: 0, y: 0 });

      const image = new Image();
      image.onload = () => {
        loadedImage.current = image;
        const side = Math.min(image.naturalWidth, image.naturalHeight);
        const initial: PixelCrop = {
          x: Math.round((image.naturalWidth - side) / 2),
          y: Math.round((image.naturalHeight - side) / 2),
          width: side,
          height: side,
        };
        setCroppedArea(initial);
        setPreview(renderThumbnail(image, initial));
      };
      image.src = result;
    };
    reader.onerror = () => setError("That file could not be read. Try another one.");
    reader.readAsDataURL(file);
  };

  const onCropComplete = useCallback((_area: unknown, pixels: PixelCrop) => {
    setCroppedArea(pixels);
    if (loadedImage.current) setPreview(renderThumbnail(loadedImage.current, pixels));
  }, []);

  const save = async () => {
    if (!imageSrc) return;
    setBusy(true);
    setError("");
    try {
      const fallback: PixelCrop = {
        x: 0,
        y: 0,
        width: loadedImage.current?.naturalWidth ?? 400,
        height: loadedImage.current?.naturalHeight ?? 400,
      };
      const result = await getCroppedImg(imageSrc, croppedArea ?? fallback);
      onSave(result);
      close();
    } catch (error) {
      console.error("Crop failed", error);
      setError("That crop could not be saved. Try a different image.");
    } finally {
      setBusy(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-canvas/85 p-4 backdrop-blur-md"
      style={{ animation: "backdrop-in 200ms ease-out" }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Profile photo editor"
        tabIndex={-1}
        className="panel flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden"
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between gap-4 border-b border-line/10 px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-lg border border-accent/25 bg-accent/10 text-accent">
              <CropIcon size={17} strokeWidth={1.75} />
            </span>
            <div>
              <h2 className="text-sm font-semibold text-ink">Profile photo</h2>
              <p className="font-mono text-[10px] text-dim">
                Cropped in your browser · never uploaded
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Close the photo editor"
            className="grid h-9 w-9 place-items-center rounded-lg text-muted transition-colors hover:bg-surface2 hover:text-ink"
          >
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-5">
          {error && (
            <p
              role="alert"
              className="mb-4 flex items-start gap-2 rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2.5 text-xs text-red-300"
            >
              <AlertCircle size={15} className="mt-0.5 shrink-0" />
              {error}
            </p>
          )}

          {!imageSrc ? (
            /* ── Picker ── */
            <div
              onDragOver={(event) => {
                event.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={(event) => {
                event.preventDefault();
                setDragOver(false);
              }}
              onDrop={(event) => {
                event.preventDefault();
                setDragOver(false);
                acceptFile(event.dataTransfer.files?.[0]);
              }}
              className={`flex flex-col items-center rounded-2xl border border-dashed p-8 text-center transition-colors duration-300 ${
                dragOver
                  ? "border-accent/60 bg-accent/[0.06]"
                  : "border-line/20 bg-surface/40 hover:border-accent/40"
              }`}
            >
              {currentImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={currentImage}
                  alt="The photo currently set on this device"
                  className="mb-5 h-28 w-28 rounded-full border-2 border-accent/40 object-cover"
                />
              ) : (
                <div className="dots mb-5 grid h-28 w-28 place-items-center rounded-full border border-dashed border-accent/40 font-mono text-xl text-accent">
                  TJ
                </div>
              )}

              <h3 className="text-sm font-semibold text-ink">Add a photo</h3>
              <p className="mt-1.5 max-w-[22rem] text-xs leading-relaxed text-muted">
                Drag one in, or choose a file. You can zoom and reposition before
                anything is saved, and it stays on this device.
              </p>

              <input
                ref={fileInput}
                type="file"
                accept={ACCEPTED}
                className="sr-only"
                onChange={(event) => {
                  acceptFile(event.target.files?.[0]);
                  event.target.value = "";
                }}
              />

              <div className="mt-6 flex flex-wrap justify-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInput.current?.click()}
                  className="btn-primary px-4 py-2.5 text-xs"
                >
                  <Upload size={15} />
                  {currentImage ? "Choose a new photo" : "Choose a file"}
                </button>
                {currentImage && (
                  <button
                    type="button"
                    onClick={() => {
                      onRemove();
                      close();
                    }}
                    className="btn-ghost px-4 py-2.5 text-xs text-muted"
                  >
                    <Trash2 size={15} />
                    Remove
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* ── Cropper ── */
            <div className="flex flex-col gap-4">
              <div className="relative h-72 overflow-hidden rounded-2xl border border-line/12 bg-canvas">
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  cropShape="round"
                  showGrid
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                />
              </div>

              <div className="flex flex-col gap-3 rounded-xl border border-line/10 bg-surface/60 p-4">
                <div className="flex items-center justify-between gap-3 border-b border-line/8 pb-3">
                  <div className="flex items-center gap-2.5">
                    {/* `block` is load-bearing: `width`, `height` and `overflow` do
                        not apply to a bare inline `<span>`, so without it this 36px
                        frame is ignored, the clip never engages, and the preview
                        renders at its intrinsic size. */}
                    <span className="block h-9 w-9 shrink-0 overflow-hidden rounded-full border border-accent/40 bg-canvas">
                      {preview ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={preview} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <span className="grid h-full w-full place-items-center text-dim">
                          <Eye size={14} />
                        </span>
                      )}
                    </span>
                    <div>
                      <p className="text-xs font-medium text-ink">Live preview</p>
                      <p className="font-mono text-[10px] text-dim">Updates as you move</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setZoom(1);
                      setCrop({ x: 0, y: 0 });
                    }}
                    className="btn-quiet gap-1.5"
                  >
                    <RotateCcw size={13} />
                    Reset
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setZoom((z) => Math.max(1, Number((z - 0.15).toFixed(2))))}
                    aria-label="Zoom out"
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-line/12 text-muted transition-colors hover:border-accent/40 hover:text-accent"
                  >
                    <ZoomOut size={15} />
                  </button>
                  <input
                    type="range"
                    min={1}
                    max={3}
                    step={0.02}
                    value={zoom}
                    onChange={(event) => setZoom(Number(event.target.value))}
                    aria-label="Zoom"
                    className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-surface2"
                  />
                  <button
                    type="button"
                    onClick={() => setZoom((z) => Math.min(3, Number((z + 0.15).toFixed(2))))}
                    aria-label="Zoom in"
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-line/12 text-muted transition-colors hover:border-accent/40 hover:text-accent"
                  >
                    <ZoomIn size={15} />
                  </button>
                  <span className="index w-10 shrink-0 text-right text-[11px] text-accent">
                    {Math.round(zoom * 100)}%
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 pt-1">
                <button type="button" onClick={reset} className="btn-quiet">
                  Choose another
                </button>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={close} className="btn-ghost px-4 py-2.5 text-xs">
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={save}
                    disabled={busy}
                    className="btn-primary px-4 py-2.5 text-xs"
                  >
                    <Check size={15} />
                    {busy ? "Saving…" : "Save photo"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}