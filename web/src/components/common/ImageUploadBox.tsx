import React, { useRef } from 'react';
import { UploadCloud, X, Image as ImageIcon } from 'lucide-react';
import { clsx } from 'clsx';

interface ImageUploadBoxProps {
  label: string;
  helperText?: string;
  value?: string | null;
  onChange: (dataUrl: string) => void;
  onRemove?: () => void;
  aspectRatio?: 'square' | 'video' | 'banner';
  required?: boolean;
  error?: string;
}

export const ImageUploadBox: React.FC<ImageUploadBoxProps> = ({
  label,
  helperText,
  value,
  onChange,
  onRemove,
  aspectRatio = 'square',
  required,
  error,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const aspectStyles = {
    square: 'h-40 sm:h-48 w-full max-w-xs',
    video: 'h-44 sm:h-52 w-full',
    banner: 'h-36 sm:h-44 w-full',
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          onChange(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="w-full space-y-1.5 text-left">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-[#1E293B] flex items-center gap-1">
          {label}
          {required && <span className="text-[#EF4444] text-sm">*</span>}
        </label>
        {helperText && <span className="text-[11px] text-[#64748B]">{helperText}</span>}
      </div>

      <div
        onClick={() => !value && fileInputRef.current?.click()}
        className={clsx(
          'relative rounded-2xl border-2 border-dashed transition-all duration-200 overflow-hidden flex flex-col items-center justify-center cursor-pointer',
          aspectStyles[aspectRatio],
          error
            ? 'border-[#EF4444] bg-red-50/30'
            : value
            ? 'border-[#006EFF]/40 bg-slate-50'
            : 'border-[#CBD5E1] bg-white hover:border-[#006EFF] hover:bg-blue-50/20'
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        {value ? (
          <div className="relative w-full h-full group">
            <img src={value} alt={label} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="px-3 py-1.5 bg-white text-[#1E293B] rounded-lg text-xs font-semibold shadow-md hover:bg-slate-100 transition-colors"
              >
                Change
              </button>
              {onRemove && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove();
                  }}
                  className="p-1.5 bg-red-600 text-white rounded-lg text-xs shadow-md hover:bg-red-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-4 text-center">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#006EFF] flex items-center justify-center mb-2 shadow-xs">
              <UploadCloud className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-[#1E293B]">Click or Drag & Drop</p>
            <p className="text-[11px] text-[#64748B] mt-0.5">PNG, JPG or WebP (max 5MB)</p>
          </div>
        )}
      </div>

      {error && <p className="text-xs text-[#EF4444] font-medium">{error}</p>}
    </div>
  );
};

interface MultiImageUploadGridProps {
  label: string;
  images: string[];
  onAdd: (dataUrl: string) => void;
  onRemove: (index: number) => void;
  maxImages?: number;
  helperText?: string;
}

export const MultiImageUploadGrid: React.FC<MultiImageUploadGridProps> = ({
  label,
  images,
  onAdd,
  onRemove,
  maxImages = 6,
  helperText,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          onAdd(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="w-full space-y-2 text-left">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-[#1E293B]">{label}</label>
        <span className="text-[11px] text-[#64748B]">
          {helperText || `(${images.length}/${maxImages} uploaded)`}
        </span>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {images.map((img, index) => (
          <div key={index} className="relative aspect-video rounded-xl overflow-hidden border border-[#E2E8F0] group shadow-xs">
            <img src={img} alt={`Upload ${index + 1}`} className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="absolute top-1.5 right-1.5 p-1 bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-700"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}

        {images.length < maxImages && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="aspect-video rounded-xl border-2 border-dashed border-[#CBD5E1] hover:border-[#006EFF] bg-white hover:bg-blue-50/20 flex flex-col items-center justify-center p-3 text-center transition-all cursor-pointer"
          >
            <ImageIcon className="w-5 h-5 text-[#006EFF] mb-1" />
            <span className="text-[11px] font-bold text-[#1E293B]">Add Photo</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default ImageUploadBox;
