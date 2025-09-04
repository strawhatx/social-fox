"use client";

import { useRef } from 'react';
import { Button } from './ui/button';
import { Image as ImageIcon } from 'lucide-react';

type ImageUploaderProps = {
    onSelect: (objectUrls: string[], files: File[]) => void;
    multiple?: boolean;
    disabled?: boolean;
    className?: string;
    accept?: string; // e.g., 'image/*,video/*'
};

export default function ImageUploader({ onSelect, multiple = true, disabled = false, className, accept = 'image/*,video/*' }: ImageUploaderProps) {
    const inputRef = useRef<HTMLInputElement | null>(null);

    return (
        <>
            <input
                ref={inputRef}
                type="file"
                accept={accept}
                multiple={multiple}
                style={{ display: 'none' }}
                onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    const mediaFiles = files.filter((f) => f.type.startsWith('image/') || f.type.startsWith('video/'));
                    const urls = mediaFiles.map((f) => URL.createObjectURL(f));
                    if (urls.length) onSelect(urls, mediaFiles);
                    // reset input to allow re-selecting the same file
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


