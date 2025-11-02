'use client';

import { useRef } from 'react';
import { Button } from '../ui/button';
import { Image as ImageIcon } from 'lucide-react';

type ImageUploaderProps = {
  onSelect: (items: Array<{ url: string; file: File; type: string; key?: string }>) => void;
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

  async function uploadFile(file: File): Promise<{ url: string; file: File; type: string; key?: string } | null> {
    try {
      const presignRes = await fetch('/api/s3/presign', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ contentType: file.type, fileName: file.name }),
      });
      
      if (!presignRes.ok) return null;
      const { url, fields, publicUrl, key } = await presignRes.json();

      const form = new FormData();
      Object.entries(fields || {}).forEach(([k, v]) => form.append(k, String(v)));
      form.append('file', file);

      const uploadRes = await fetch(url, { method: 'POST', body: form });
      if (!uploadRes.ok) {
        const errText = await uploadRes.text().catch(() => '');
        console.error('S3 upload failed', {
          status: uploadRes.status,
          statusText: uploadRes.statusText,
          body: errText,
        });
        return null;
      }

      return { url: publicUrl, file, type: file.type, key };
    } catch {
      return null;
    }
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

          const results = await Promise.all(mediaFiles.map(uploadFile));
          const successful = results.filter(Boolean) as Array<{ url: string; file: File; type: string; key?: string }>;
          if (successful.length) onSelect(successful);

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
