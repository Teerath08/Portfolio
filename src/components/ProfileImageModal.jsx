import React, { useState, useRef } from "react";
import Cropper from "react-easy-crop";
import { Upload, Trash2, X, Check, ZoomIn, Camera, Image as ImageIcon } from "lucide-react";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Camera className="text-indigo-400" size={20} />
            <h3 className="text-lg font-bold text-white">Profile Photo</h3>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
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
                    className="w-36 h-36 rounded-full object-cover border-4 border-indigo-500/40 shadow-xl"
                  />
                </div>
              ) : (
                <div className="w-36 h-36 rounded-full bg-gradient-to-br from-indigo-600 to-violet-700 flex items-center justify-center text-white text-4xl font-extrabold shadow-xl mb-6 border-4 border-indigo-500/30">
                  TJ
                </div>
              )}

              <p className="text-sm text-slate-400 max-w-xs mb-6">
                Upload a photo to personalize your portfolio. You can adjust & crop after selecting.
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
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm flex items-center gap-2 shadow-lg shadow-indigo-500/25 transition-all"
                >
                  <Upload size={16} />
                  {currentImage ? "Change Photo" : "Upload Photo"}
                </button>

                {currentImage && (
                  <button
                    onClick={handleRemove}
                    className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-medium text-sm flex items-center gap-2 transition-all"
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
              <div className="relative w-full h-72 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 mb-4">
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
                <ZoomIn size={16} className="text-slate-400" />
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.05}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full accent-indigo-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
                />
                <span className="text-xs font-mono text-slate-400 min-w-8 text-right">
                  {Math.round(zoom * 100)}%
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-2 border-t border-slate-800">
                <button
                  onClick={() => setImageSrc(null)}
                  className="px-4 py-2 rounded-xl text-slate-300 hover:bg-slate-800 text-sm font-medium transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleSaveCrop}
                  disabled={isProcessing}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold flex items-center gap-2 shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-50"
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
