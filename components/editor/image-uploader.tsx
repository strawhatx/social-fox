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

  // Upload files to backend S3 API
  async function uploadFilesToS3(files: File[]): Promise<string[]> {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));

    const res = await fetch('/api/uploads', {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      console.error('Failed to upload files to S3');
      return [];
    }

    const data = await res.json();
    return data.urls as string[];
  }

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

          // Upload to S3
          const uploadedUrls = await uploadFilesToS3(mediaFiles);

          // Return S3 URLs and the original files
          onSelect(uploadedUrls, mediaFiles);

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
