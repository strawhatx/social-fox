"use client";

import { useRef, forwardRef, useEffect, useCallback } from 'react';
import { Textarea } from '@/components/ui/textarea';

// Simple tweet composer
export const TweetComposer = forwardRef<HTMLTextAreaElement, {
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    registerInserter?: (fn: (text: string) => void) => void;
}>(function TweetComposer({
    value,
    onChange,
    placeholder,
    registerInserter
}, ref) {
    const internalRef = useRef<HTMLTextAreaElement>(null);
    const textareaRef = (ref as React.RefObject<HTMLTextAreaElement>) || internalRef;

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

    // Auto-resize function
    const autoResize = useCallback(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
        }
    }, []);

    // Auto-resize when value changes
    useEffect(() => {
        autoResize();
    }, [value, autoResize]);

    return (
        <div className="prose prose-sm max-w-none">
            <Textarea
                ref={textareaRef}
                placeholder={placeholder}
                value={value}
                rows={1}
                onChange={(e) => onChange(e.target.value)}
                className="w-full bg-white border-none rounded-md resize-none text-base leading-relaxed p-0 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 min-h-[1.5rem]"
                style={{ 
                    height: 'auto',
                    minHeight: '1.5rem',
                    maxHeight: '200px'
                }}
                onInput={autoResize}
                maxLength={280}
            />
        </div>
    );
});
