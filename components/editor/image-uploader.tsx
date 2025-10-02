'use client';

import { useRef } from 'react';
import { Button } from '../ui/button';
import { Image as ImageIcon } from 'lucide-react';

type ImageUploaderProps = {
  onSelect: (urls: string[], files: File[]) => void;
  multiple?: boolean;
  disabled?: boolean;
  className?: string;
  accept?: string;
};

export default function ImageUploader({
  onSelect,
  multiple = true,
  disabled = false,
  className,
  accept = 'image/*,video/*',
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  // No immediate upload; return blob URLs for preview and keep File objects for save

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        style={{ display: 'none' }}
        onChange={async (e) => {
          const files = Array.from(e.target.files || []);
          const mediaFiles = files.filter((f) => f.type.startsWith('image/') || f.type.startsWith('video/'));

          if (!mediaFiles.length) return;

          // Create local object URLs for preview; actual upload happens on save
          const blobUrls = mediaFiles.map((f) => URL.createObjectURL(f));
          onSelect(blobUrls, mediaFiles);

          // Reset input so user can re-select same files
          if (inputRef.current) inputRef.current.value = '';
        }}
      />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        disabled={disabled}
        className={`text-muted-foreground hover:text-foreground h-7 w-7 p-0 ${className || ''}`}
        onClick={() => inputRef.current?.click()}
      >
        <ImageIcon className="h-3 w-3" />
      </Button>
    </>
  );
}
