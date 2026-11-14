import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  Image as ImageIcon,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Link2,
} from 'lucide-react';
import { uploadService } from '../../services/upload.service';

export interface ImageUploadFieldProps {
  /** Formik field name */
  name: string;
  /** Field label */
  label?: string;
  /** Current image URL string value */
  value?: string;
  /** Callback when image URL updates */
  onChange: (url: string) => void;
  /** Cloudinary folder (e.g. 'products', 'categories', defaults to backend 'adwika/general') */
  folder?: string;
  /** Optional custom publicId */
  publicId?: string;
  /** Whether the field is required */
  required?: boolean;
  /** Optional helper text below the field */
  helperText?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Optional custom CSS classes */
  className?: string;
}

export const ImageUploadField: React.FC<ImageUploadFieldProps> = ({
  name,
  label = 'Garment Image',
  value = '',
  onChange,
  folder = 'products',
  publicId,
  required = false,
  helperText,
  disabled = false,
  className = '',
}) => {
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isManualUrlMode, setIsManualUrlMode] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileProcess = async (file: File) => {
    setUploadError(null);
    setUploadSuccess(false);

    // Validate size and format
    const validation = uploadService.validateFile(file);
    if (!validation.valid) {
      setUploadError(validation.error || 'Invalid image file.');
      return;
    }

    setIsUploading(true);

    try {
      const res = await uploadService.uploadImage(file, { folder, publicId });
      onChange(res.secureUrl);
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 4000);
    } catch (err: any) {
      setUploadError(err?.message || 'Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !isUploading) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled || isUploading) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  const handleRemove = () => {
    onChange('');
    setUploadSuccess(false);
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const hasImage = Boolean(value && value.trim().length > 0);

  return (
    <div className={`space-y-1.5 ${className}`}>
      {/* Label and Mode Switcher */}
      <div className="flex items-center justify-between">
        <label
          htmlFor={name}
          className="block text-xs uppercase tracking-wider text-neutral-300 font-medium"
        >
          {label} {required && <span className="text-[#c9a87c]">*</span>}
        </label>
        <button
          type="button"
          onClick={() => {
            setIsManualUrlMode((prev) => !prev);
            setUploadError(null);
          }}
          disabled={disabled || isUploading}
          className="text-[11px] font-mono text-[#c9a87c] hover:text-[#e4cfb5] flex items-center gap-1 transition-colors disabled:opacity-50"
        >
          <Link2 size={12} />
          <span>{isManualUrlMode ? 'Switch to File Upload' : 'Paste Image URL'}</span>
        </button>
      </div>

      {/* Hidden Native File Input */}
      <input
        ref={fileInputRef}
        type="file"
        id={name}
        name={name}
        accept="image/jpeg,image/png,image/webp,image/avif,image/gif,image/svg+xml"
        onChange={handleFileSelect}
        disabled={disabled || isUploading}
        className="hidden"
      />

      {/* Manual URL Input Fallback Mode */}
      {isManualUrlMode ? (
        <div className="space-y-2">
          <div className="relative">
            <input
              type="url"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="https://res.cloudinary.com/... or image URL"
              disabled={disabled}
              className="w-full bg-[#1e1c1a] border border-[#38332e] focus:border-[#c9a87c] rounded pl-9 pr-3.5 py-2.5 text-xs font-mono text-neutral-100 placeholder:text-neutral-500 outline-none transition-colors"
            />
            <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
              <ImageIcon size={14} className="text-[#c9a87c]" />
            </div>
            {value && (
              <button
                type="button"
                onClick={handleRemove}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-rose-400 p-1 transition-colors"
                title="Clear image URL"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      ) : hasImage ? (
        /* Image Preview State */
        <div className="p-3 bg-[#181615] border border-[#38332e] rounded-lg">
          <div className="flex items-center gap-3.5">
            {/* Image Thumbnail */}
            <div className="relative w-16 h-16 rounded border border-[#38332e] bg-[#121110] overflow-hidden shrink-0 group">
              <img
                src={value}
                alt="Uploaded preview"
                className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                }}
              />
            </div>

            {/* Info and Actions */}
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-medium text-emerald-400 bg-emerald-950/50 border border-emerald-800/60 px-1.5 py-0.5 rounded flex items-center gap-1">
                  <CheckCircle2 size={11} />
                  <span>Ready</span>
                </span>
                <span className="text-[11px] text-neutral-400 font-mono truncate">
                  Cloudinary Asset
                </span>
              </div>
              <p
                className="text-[11px] text-neutral-400 font-mono truncate max-w-full"
                title={value}
              >
                {value}
              </p>
              <div className="flex items-center gap-2 pt-0.5">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={disabled || isUploading}
                  className="text-xs text-[#c9a87c] hover:text-white font-medium transition-colors disabled:opacity-50"
                >
                  Replace Image
                </button>
                <span className="text-neutral-600 text-xs">•</span>
                <button
                  type="button"
                  onClick={handleRemove}
                  disabled={disabled || isUploading}
                  className="text-xs text-rose-400 hover:text-rose-300 font-medium transition-colors disabled:opacity-50"
                >
                  Remove
                </button>
                <span className="text-neutral-600 text-xs">•</span>
                <a
                  href={value}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-neutral-400 hover:text-neutral-200 inline-flex items-center gap-1 font-mono transition-colors"
                >
                  <span>View</span>
                  <ExternalLink size={10} />
                </a>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Empty Upload Dropzone State */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => {
            if (!disabled && !isUploading) {
              fileInputRef.current?.click();
            }
          }}
          className={`relative border-2 border-dashed rounded-lg p-5 text-center cursor-pointer transition-all duration-200 select-none ${
            isDragging
              ? 'border-[#c9a87c] bg-[#2a221b]/40 scale-[0.99]'
              : 'border-[#38332e] bg-[#1a1816]/70 hover:border-[#c9a87c]/70 hover:bg-[#1f1d1a]'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isUploading ? (
            <div className="py-2 flex flex-col items-center justify-center gap-2">
              <Loader2 size={24} className="text-[#c9a87c] animate-spin" />
              <p className="text-xs font-mono text-[#c9a87c]">
                Uploading image directly to Cloudinary...
              </p>
              <p className="text-[11px] text-neutral-500 font-sans">
                Processing file and securing URL
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-1.5">
              <div className="p-2 rounded-full bg-[#24201c] text-[#c9a87c] border border-[#3e342a] mb-0.5">
                <UploadCloud size={20} />
              </div>
              <p className="text-xs font-medium text-neutral-200">
                <span className="text-[#c9a87c] underline underline-offset-2">Click to upload</span>{' '}
                or drag and drop
              </p>
              <p className="text-[11px] text-neutral-400 font-mono">
                JPEG, PNG, WEBP, AVIF, GIF, SVG (max 10MB)
              </p>
            </div>
          )}
        </div>
      )}

      {/* Success Notification */}
      {uploadSuccess && (
        <div className="text-[11px] text-emerald-400 font-mono flex items-center gap-1.5 pt-0.5 animate-fadeIn">
          <CheckCircle2 size={12} className="shrink-0" />
          <span>Image uploaded to Cloudinary successfully and URL set in payload.</span>
        </div>
      )}

      {/* Error Message */}
      {uploadError && (
        <div className="text-xs text-rose-400 font-sans flex items-center gap-1.5 pt-0.5 animate-fadeIn">
          <AlertCircle size={13} className="shrink-0 text-rose-400" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Helper text */}
      {helperText && !uploadError && (
        <p className="text-[11px] text-neutral-500 font-sans">{helperText}</p>
      )}
    </div>
  );
};

