
import React, { useState, useCallback } from 'react';
import { Image, X } from 'lucide-react';

interface ImageUploadProps {
  onImagesSelected: (imageUrls: string[]) => void;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ onImagesSelected }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [previewImages, setPreviewImages] = useState<string[]>([]);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) {
      setIsDragging(true);
    }
  }, [isDragging]);

  const processFiles = useCallback((files: FileList) => {
    const newImages: string[] = [];
    
    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const imageUrl = URL.createObjectURL(file);
        newImages.push(imageUrl);
      }
    });
    
    if (newImages.length > 0) {
      setPreviewImages(prev => [...prev, ...newImages]);
      onImagesSelected(newImages);
    }
  }, [onImagesSelected]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  }, [processFiles]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  }, [processFiles]);

  const removeImage = useCallback((indexToRemove: number) => {
    setPreviewImages(prev => prev.filter((_, index) => index !== indexToRemove));
  }, []);

  return (
    <div className="w-full">
      {previewImages.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {previewImages.map((image, index) => (
            <div 
              key={index} 
              className="relative w-20 h-20 rounded-lg overflow-hidden group"
            >
              <img 
                src={image} 
                alt={`Preview ${index}`} 
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-1 right-1 bg-black/60 rounded-full p-0.5 
                  opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3 text-white" />
              </button>
            </div>
          ))}
        </div>
      )}
      
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-lg p-4 transition-all duration-200
          ${isDragging 
            ? 'border-gold bg-gold/10' 
            : 'border-muted hover:border-gold/50 hover:bg-muted/50'}`}
      >
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div className="flex flex-col items-center justify-center gap-2 py-2">
          <Image className="w-6 h-6 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Drag images here or click to upload
          </p>
        </div>
      </div>
    </div>
  );
};
