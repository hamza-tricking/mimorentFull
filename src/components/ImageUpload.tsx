'use client';

import { useState } from 'react';
import { Upload, X } from 'lucide-react';

interface ImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  maxFileSize?: number; // in bytes
  maxTotalSize?: number; // in bytes
  disabled?: boolean;
  error?: string | null;
  onError?: (error: string | null) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  images,
  onImagesChange,
  maxImages = 4,
  maxFileSize = 2 * 1024 * 1024, // 2MB per image
  maxTotalSize = 5 * 1024 * 1024, // 5MB total
  disabled = false,
  error = null,
  onError
}) => {
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validImages = images.filter(img => img && img.trim() !== '');
    const currentImages = validImages.length;
    
    if (currentImages >= maxImages) {
      onError?.(`لا يمكنك إضافة أكثر من ${maxImages} صور`);
      return;
    }
    
    const remainingSlots = maxImages - currentImages;
    const filesToProcess = files.slice(0, remainingSlots);
    
    filesToProcess.forEach(file => {
      // Check file size
      if (file.size > maxFileSize) {
        onError?.(`حجم الصورة ${file.name} كبير جدًا. الحد الأقصى هو 2 ميجابايت.`);
        return;
      }
      
      // Compress image before converting to base64
      compressImage(file, 0.7, 800, 600)
        .then(compressedBase64 => {
          // Check total size after compression
          const currentTotalSize = images.reduce((total, img) => {
            return total + (img.length * 0.75); // Approximate base64 size
          }, 0);
          
          const newImageSize = compressedBase64.length * 0.75;
          
          if (currentTotalSize + newImageSize > maxTotalSize) {
            onError?.(`إجمالي حجم الصور كبير جدًا. الحد الأقصى هو 5 ميجابايت.`);
            return;
          }
          
          onImagesChange([...images, compressedBase64]);
        })
        .catch(error => {
          console.error('Error compressing image:', error);
          onError?.(`فشل معالجة الصورة ${file.name}.`);
        });
    });
    
    if (files.length > remainingSlots) {
      onError?.(`تم إضافة ${remainingSlots} صور فقط. الحد الأقصى هو ${maxImages} صور.`);
    }
  };

  // Image compression function
  const compressImage = (file: File, quality: number, maxWidth: number, maxHeight: number): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth) {
          height = (maxWidth / width) * height;
          width = maxWidth;
        }
        
        if (height > maxHeight) {
          width = (maxHeight / height) * width;
          height = maxHeight;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result as string);
              reader.onerror = reject;
              reader.readAsDataURL(blob);
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          'image/jpeg',
          quality
        );
      };
      
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  const validImages = images.filter(img => img && img.trim() !== '');
    
    return (
    <div>
      <div className="border-2 border-dashed border-gray-300/50 rounded-xl p-6 text-center bg-gray-50/50 backdrop-blur-sm">
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
          id="identity-images"
          disabled={disabled || validImages.length >= maxImages}
        />
        <label
          htmlFor="identity-images"
          className={`cursor-pointer flex flex-col items-center ${
            disabled || validImages.length >= maxImages ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <Upload className="w-8 h-8 text-gray-400 mb-2" />
          <span className="text-sm text-gray-600">
            {validImages.length >= maxImages 
              ? 'تم الوصول للحد الأقصى للصور' 
              : 'اضغط لرفع الصور أو اسحب وأفلت'
            }
          </span>
          <span className="text-xs text-gray-500 mt-1">
            {validImages.length}/{maxImages} صور (PNG, JPG, GIF حتى 10 ميجابايت)
          </span>
        </label>
      </div>
      
      {validImages.length > 0 && (
        <div className="mt-4 pb-20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">الصور المرفوعة ({validImages.length}/{maxImages})</span>
            {validImages.length < maxImages && (
              <span className="text-xs text-gray-500">يمكنك إضافة {maxImages - validImages.length} صور أخرى</span>
            )}
          </div>
          <div className="grid grid-cols-3 gap-2">
            {validImages.map((image, index) => (
              <div key={index} className="relative group">
                <img
                  src={image}
                  alt={`Identity ${index + 1}`}
                  className="w-full h-20 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage(index);
                  }}
                  className="absolute top-2 right-2 w-7 h-7 bg-red-600 text-white rounded-full flex items-center justify-center transition-all duration-300 hover:bg-red-700 shadow-xl z-[1000] transform hover:scale-110 border-2 border-white opacity-90 hover:opacity-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {error && (
        <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded-lg">
          {error}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
