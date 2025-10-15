"use client";

import { useRef } from 'react';
import { Textarea } from '@/components/ui/textarea';

// Simple tweet composer
export function TweetComposer({
    value,
    onChange,
    placeholder,
    registerInserter
}: {
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    registerInserter?: (fn: (text: string) => void) => void;
}) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const insertAtCursor = (text: string) => {
        const textarea = textareaRef.current;
        if (!textarea) {
            // Fallback: append
            const next = value + text;
            if (next.length <= 280) onChange(next);
            return;
        }

        const start = textarea.selectionStart ?? value.length;
        const end = textarea.selectionEnd ?? value.length;
        const before = value.slice(0, start);
        const after = value.slice(end);
        const next = before + text + after;
        if (next.length > 280) return;

        const newCaretPos = start + text.length;
        onChange(next);
        // Restore caret after React updates value
        requestAnimationFrame(() => {
            if (textareaRef.current) {
                textareaRef.current.focus();
                textareaRef.current.setSelectionRange(newCaretPos, newCaretPos);
            }
        });
    };

    // Register the insertAtCursor function if registerInserter is provided
    if (registerInserter) {
        registerInserter(insertAtCursor);
    }

    return (
        <div className="prose prose-sm max-w-none mb-6">
            <Textarea
                ref={textareaRef}
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full min-h-[300px] bg-white border-0 resize-none focus-visible:ring-0 text-base leading-relaxed p-0"
                maxLength={280}
            />
        </div>
    );
}
