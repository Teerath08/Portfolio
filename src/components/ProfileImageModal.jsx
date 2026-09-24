import React, { useState, useRef, useEffect, useCallback } from "react";
import Cropper from "react-easy-crop";
import "react-easy-crop/react-easy-crop.css";
import {
  Upload,
  Trash2,
  X,
  Check,
  ZoomIn,
  ZoomOut,
  Camera,
  RotateCcw,
  Sparkles,
  AlertCircle,
  Eye,
} from "lucide-react";
import { getCroppedImg } from "../utils/cropImage";

export default function ProfileImageModal({
  isOpen,
  onClose,
  currentImage,
  onSave,
  onRemove,
}) {
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [livePreview, setLivePreview] = useState(null);

  const fileInputRef = useRef(null);
  const loadedImageRef = useRef(null);
  const previewCanvasRef = useRef(null);

  // Clean up state when modal closes
  const handleClose = () => {
    setImageSrc(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    setErrorMessage("");
    setLivePreview(null);
    onClose();
  };

  const handleRemove = () => {
    onRemove();
    handleClose();
  };

  // Process uploaded file
  const processFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please select a valid image file (PNG, JPG, WEBP).");
      return;
    }
    setErrorMessage("");

    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result);
      setZoom(1);
      setCrop({ x: 0, y: 0 });

      // Pre-load image object for initial preview calculation
      const img = new Image();
      img.onload = () => {
        loadedImageRef.current = img;
        const size = Math.min(img.naturalWidth, img.naturalHeight);
        const initialCrop = {
          x: Math.round((img.naturalWidth - size) / 2),
          y: Math.round((img.naturalHeight - size) / 2),
          width: size,
          height: size,
        };
        setCroppedAreaPixels(initialCrop);
        generateLivePreview(img, initialCrop);
      };
      img.src = reader.result;
    };
    reader.onerror = () => {
      setErrorMessage("Error reading image file. Please try again.");
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
    // Reset input so re-selecting the exact same image triggers onChange
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  // Generate real-time live preview thumbnail on zoom or crop change
  const generateLivePreview = (img, pixelCrop) => {
    if (!img || !pixelCrop) return;
    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const size = 120;
      canvas.width = size;
      canvas.height = size;

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      ctx.drawImage(
        img,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        size,
        size
      );

      setLivePreview(canvas.toDataURL("image/jpeg", 0.85));
    } catch (err) {
      // Ignore preview errors silently
    }
  };

  const onCropComplete = useCallback((croppedArea, pixels) => {
    setCroppedAreaPixels(pixels);
    if (loadedImageRef.current) {
      generateLivePreview(loadedImageRef.current, pixels);
    }
  }, []);

  const handleSaveCrop = async () => {
    if (!imageSrc) return;
    try {
      setIsProcessing(true);
      setErrorMessage("");

      // Fallback crop if user didn't move the slider
      const cropToUse = croppedAreaPixels || {
        x: 0,
        y: 0,
        width: loadedImageRef.current?.naturalWidth || 300,
        height: loadedImageRef.current?.naturalHeight || 300,
      };

      const croppedImage = await getCroppedImg(imageSrc, cropToUse);
      if (croppedImage) {
        onSave(croppedImage);
        handleClose();
      } else {
        setErrorMessage("Failed to crop image. Please try again.");
      }
    } catch (err) {
      console.error("Save crop error:", err);
      setErrorMessage("Could not apply profile picture. Please try another image.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Zoom helpers
  const handleZoomIn = () => setZoom((z) => Math.min(3, +(z + 0.15).toFixed(2)));
  const handleZoomOut = () => setZoom((z) => Math.max(1, +(z - 0.15).toFixed(2)));
  const handleResetZoom = () => {
    setZoom(1);
    setCrop({ x: 0, y: 0 });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-zinc-950 border border-red-950 rounded-2xl shadow-2xl shadow-black overflow-hidden text-zinc-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-red-950/80 bg-black/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-950/70 border border-red-800/60 flex items-center justify-center text-red-500 shadow-md">
              <Camera size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                <span>Profile Photo Editor</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-red-950 text-red-400 font-mono border border-red-800/50">
                  3D Theme
                </span>
              </h3>
              <p className="text-[11px] text-zinc-400">
                Upload, zoom, preview & set your portfolio avatar
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto">
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-red-950/50 border border-red-800/60 text-red-300 text-xs flex items-center gap-2 animate-fade-in">
              <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {!imageSrc ? (
            /* Upload / View Current State Dropzone */
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed transition-all text-center ${
                isDragOver
                  ? "border-red-500 bg-red-950/30 scale-[0.99]"
                  : "border-red-950/80 bg-zinc-900/40 hover:border-red-600/50"
              }`}
            >
              {currentImage ? (
                <div className="relative mb-5 group">
                  <img
                    src={currentImage}
                    alt="Current Profile Avatar"
                    className="w-32 h-32 rounded-full object-cover border-4 border-red-600/60 shadow-xl shadow-red-950/80"
                  />
                  <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[11px] font-mono text-white bg-red-600/80 px-2 py-1 rounded-md">
                      Current Pic
                    </span>
                  </div>
                </div>
              ) : (
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-red-600 via-rose-700 to-black flex items-center justify-center text-white text-4xl font-extrabold shadow-xl mb-5 border-4 border-red-500/40">
                  TJ
                </div>
              )}

              <h4 className="text-base font-bold text-white mb-1">
                Upload Your Profile Photo
              </h4>
              <p className="text-xs text-zinc-400 max-w-xs mb-6">
                Drag and drop your image here, or browse from your computer. You'll be able to zoom, pan, and preview before saving.
              </p>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/png,image/jpeg,image/webp,image/jpg,image/gif"
                className="hidden"
              />

              <div className="flex flex-wrap justify-center gap-3 w-full">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-primary text-sm px-5 py-2.5 shadow-red-600/30 cursor-pointer"
                >
                  <Upload size={16} />
                  <span>{currentImage ? "Choose New Photo" : "Browse Image"}</span>
                </button>

                {currentImage && (
                  <button
                    type="button"
                    onClick={handleRemove}
                    className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-red-950/60 text-red-400 border border-red-900/60 font-semibold text-xs flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <Trash2 size={15} />
                    <span>Remove Photo</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Interactive Cropper & Live Preview Workspace */
            <div className="flex flex-col gap-4">
              {/* Cropper Viewport */}
              <div className="relative w-full h-72 rounded-2xl overflow-hidden bg-black border border-red-900/80 shadow-inner">
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  cropShape="round"
                  showGrid={true}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                />
              </div>

              {/* Real-time Live Preview Badge & Zoom Controls Row */}
              <div className="p-4 rounded-xl bg-black/60 border border-red-950 flex flex-col gap-3">
                {/* Live Avatar Preview Row */}
                <div className="flex items-center justify-between gap-3 pb-3 border-b border-red-950/80">
                  <div className="flex items-center gap-2.5">
                    {/* Live Preview Avatar */}
                    <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-red-500/60 shadow-lg shadow-red-600/30 bg-black flex items-center justify-center flex-shrink-0">
                      {livePreview ? (
                        <img
                          src={livePreview}
                          alt="Live Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Camera size={20} className="text-zinc-600" />
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Eye size={13} className="text-red-400" />
                        <span>Live Profile Preview</span>
                      </div>
                      <p className="text-[11px] text-zinc-400 font-mono">
                        Updates as you pan & zoom
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleResetZoom}
                    className="p-1.5 text-xs text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg border border-red-950 transition-colors flex items-center gap-1 cursor-pointer font-mono"
                    title="Reset zoom & position"
                  >
                    <RotateCcw size={12} />
                    <span>Reset</span>
                  </button>
                </div>

                {/* Zoom Slider & Buttons */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleZoomOut}
                    className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-red-950 transition-colors cursor-pointer"
                    title="Zoom Out"
                  >
                    <ZoomOut size={16} />
                  </button>

                  <input
                    type="range"
                    min={1}
                    max={3}
                    step={0.02}
                    value={zoom}
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="w-full accent-red-500 bg-zinc-900 h-2 rounded-lg cursor-pointer"
                    aria-label="Image zoom slider"
                  />

                  <button
                    type="button"
                    onClick={handleZoomIn}
                    className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-red-950 transition-colors cursor-pointer"
                    title="Zoom In"
                  >
                    <ZoomIn size={16} />
                  </button>

                  <span className="text-xs font-mono text-red-400 min-w-12 text-right font-bold">
                    {Math.round(zoom * 100)}%
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setImageSrc(null)}
                  className="px-4 py-2.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 text-xs font-semibold transition-colors cursor-pointer border border-transparent hover:border-red-950"
                >
                  Choose Different Photo
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-4 py-2.5 rounded-xl text-zinc-300 hover:bg-zinc-900 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveCrop}
                    disabled={isProcessing}
                    className="btn-primary text-xs px-5 py-2.5 cursor-pointer disabled:opacity-50"
                  >
                    <Check size={16} />
                    <span>{isProcessing ? "Applying..." : "Save & Set Profile Pic"}</span>
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
