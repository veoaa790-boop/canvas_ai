import React, { useState, useRef } from 'react';
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { X, Check } from 'lucide-react';
import { getCroppedImg } from '../../utils/imageUtils';

interface CropModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  onCropComplete: (croppedImgUrl: string) => void;
}

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect?: number,
) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect || 16 / 9,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  )
}

export const CropModal: React.FC<CropModalProps> = ({ isOpen, onClose, imageSrc, onCropComplete }) => {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const imgRef = useRef<HTMLImageElement>(null);

  if (!isOpen) return null;

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height));
  };

  const handleSave = async () => {
    if (completedCrop && imgRef.current) {
      try {
        const croppedUrl = await getCroppedImg(imgRef.current.src, completedCrop);
        onCropComplete(croppedUrl);
        onClose();
      } catch (e) {
        console.error('Failed to crop image', e);
      }
    } else {
        onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-2 sm:p-4 touch-manipulation">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[95vh] sm:max-h-[90vh] animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="p-4 sm:p-4 border-b border-gray-200 flex justify-between items-center shrink-0 bg-gradient-to-r from-gray-50 to-white">
          <h3 className="font-bold text-base sm:text-lg text-gray-800">Crop Image</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 active:text-gray-900 p-2 hover:bg-gray-100 active:bg-gray-200 rounded-full transition-all touch-manipulation active:scale-95"
          >
            <X size={20} className="sm:w-6 sm:h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-4 sm:p-6 flex justify-center items-center bg-gray-100 min-h-0 overscroll-contain">
            <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => setCompletedCrop(c)}
                className="max-h-[calc(95vh-200px)] sm:max-h-[60vh] touch-manipulation"
            >
                <img
                    ref={imgRef}
                    alt="Crop me"
                    src={imageSrc}
                    onLoad={onImageLoad}
                    className="max-w-full object-contain select-none"
                    crossOrigin="anonymous"
                    draggable={false}
                />
            </ReactCrop>
        </div>

        <div className="p-4 sm:p-4 border-t border-gray-200 flex justify-end gap-3 sm:gap-3 bg-gradient-to-r from-gray-50 to-white rounded-b-xl shrink-0 safe-bottom">
          <button
            onClick={onClose}
            className="px-4 sm:px-4 py-2.5 text-sm sm:text-base text-gray-700 hover:bg-gray-200 active:bg-gray-300 rounded-lg font-medium transition-all touch-manipulation active:scale-95 border border-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 sm:px-4 py-2.5 text-sm sm:text-base bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 active:bg-indigo-800 font-medium flex items-center gap-2 sm:gap-2 shadow-md transition-all touch-manipulation active:scale-95"
          >
            <Check size={18} className="sm:w-5 sm:h-5" /> <span>Apply Crop</span>
          </button>
        </div>
      </div>
    </div>
  );
};
