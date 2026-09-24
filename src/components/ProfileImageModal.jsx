import React, { useState, useRef } from "react";
import Cropper from "react-easy-crop";
import { Upload, Trash2, X, Check, ZoomIn, Camera } from "lucide-react";
import { getCroppedImg } from "../utils/cropImage";

export default function ProfileImageModal({ isOpen, onClose, currentImage, onSave, onRemove }) {
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const onCropComplete = (croppedArea, pixels) => {
    setCroppedAreaPixels(pixels);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result);
        setZoom(1);
        setCrop({ x: 0, y: 0 });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveCrop = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    try {
      setIsProcessing(true);
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
      onSave(croppedImage);
      handleClose();
    } catch (err) {
      console.error("Failed to crop image", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setImageSrc(null);
    setZoom(1);
    setCrop({ x: 0, y: 0 });
    onClose();
  };

  const handleRemove = () => {
    onRemove();
    handleClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-zinc-950 border border-red-950 rounded-2xl shadow-2xl shadow-black overflow-hidden text-zinc-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-red-950/80">
          <div className="flex items-center gap-2">
            <Camera className="text-red-500" size={20} />
            <h3 className="text-lg font-bold text-white">Profile Photo</h3>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {!imageSrc ? (
            /* Upload / View Current State */
            <div className="flex flex-col items-center justify-center py-6 text-center">
              {currentImage ? (
                <div className="relative mb-6 group">
                  <img
                    src={currentImage}
                    alt="Profile Avatar"
                    className="w-36 h-36 rounded-full object-cover border-4 border-red-600/50 shadow-xl shadow-red-950"
                  />
                </div>
              ) : (
                <div className="w-36 h-36 rounded-full bg-gradient-to-br from-red-600 via-rose-700 to-black flex items-center justify-center text-white text-4xl font-extrabold shadow-xl mb-6 border-4 border-red-500/40">
                  TJ
                </div>
              )}

              <p className="text-sm text-zinc-400 max-w-xs mb-6">
                Upload a photo to personalize your portfolio. You can adjust and crop after selecting.
              </p>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />

              <div className="flex flex-wrap justify-center gap-3 w-full">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-medium text-sm flex items-center gap-2 shadow-lg shadow-red-600/30 transition-all cursor-pointer"
                >
                  <Upload size={16} />
                  {currentImage ? "Change Photo" : "Upload Photo"}
                </button>

                {currentImage && (
                  <button
                    onClick={handleRemove}
                    className="px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-red-950/40 text-red-400 border border-red-900/60 font-medium text-sm flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <Trash2 size={16} />
                    Remove Photo
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Cropper Area */
            <div>
              <div className="relative w-full h-72 rounded-xl overflow-hidden bg-black border border-red-950 mb-4">
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  cropShape="round"
                  showGrid={false}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                />
              </div>

              {/* Zoom Controls */}
              <div className="flex items-center gap-3 mb-6 px-2">
                <ZoomIn size={16} className="text-zinc-400" />
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.05}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full accent-red-500 bg-zinc-900 h-1.5 rounded-lg cursor-pointer"
                />
                <span className="text-xs font-mono text-zinc-400 min-w-8 text-right">
                  {Math.round(zoom * 100)}%
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-2 border-t border-red-950/80">
                <button
                  onClick={() => setImageSrc(null)}
                  className="px-4 py-2 rounded-xl text-zinc-300 hover:bg-zinc-900 text-sm font-medium transition-colors cursor-pointer"
                >
                  Back
                </button>
                <button
                  onClick={handleSaveCrop}
                  disabled={isProcessing}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white text-sm font-bold flex items-center gap-2 shadow-lg shadow-red-600/30 transition-all disabled:opacity-50 cursor-pointer"
                >
                  <Check size={16} />
                  {isProcessing ? "Saving..." : "Save & Apply"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
