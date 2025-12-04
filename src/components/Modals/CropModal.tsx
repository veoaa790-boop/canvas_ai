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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-2 sm:p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl flex flex-col max-h-[95vh] sm:max-h-[90vh]">
        <div className="p-3 sm:p-4 border-b border-gray-200 flex justify-between items-center shrink-0">
          <h3 className="font-semibold text-base sm:text-lg text-gray-800">Crop Image</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 p-1">
            <X size={20} className="sm:w-6 sm:h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-3 sm:p-6 flex justify-center bg-gray-100 min-h-0">
            <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => setCompletedCrop(c)}
                className="max-h-[calc(95vh-200px)] sm:max-h-[60vh]"
            >
                <img
                    ref={imgRef}
                    alt="Crop me"
                    src={imageSrc}
                    onLoad={onImageLoad}
                    className="max-w-full object-contain"
                    crossOrigin="anonymous"
                />
            </ReactCrop>
        </div>

        <div className="p-3 sm:p-4 border-t border-gray-200 flex justify-end gap-2 sm:gap-3 bg-gray-50 rounded-b-lg shrink-0">
          <button
            onClick={onClose}
            className="px-3 sm:px-4 py-2 text-sm sm:text-base text-gray-700 hover:bg-gray-200 rounded-md font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-3 sm:px-4 py-2 text-sm sm:text-base bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium flex items-center gap-1 sm:gap-2"
          >
            <Check size={16} className="sm:w-4 sm:h-4" /> <span className="hidden sm:inline">Apply</span> Crop
          </button>
        </div>
      </div>
    </div>
  );
};
