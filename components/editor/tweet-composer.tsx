"use client";

import { useDrag, useDrop } from 'react-dnd';
import { useRef, useState, useMemo } from 'react';
import { Textarea } from './ui/textarea';
import { toast } from '@/hooks/use-toast';
import { Button } from './ui/button';
import { AiRewritePopover } from './editor/ai-rewrite-popover';

// Drag item types
const ItemTypes = {
    TWEET: 'tweet',
};

// Draggable tweet component
export function DraggableTweet({ tweet, children, source }: { tweet: string; children: React.ReactNode; source: string }) {
    const [{ isDragging }, drag] = useDrag(() => ({
        type: ItemTypes.TWEET,
        item: { tweet, source },
        collect: (monitor: any) => ({
            isDragging: monitor.isDragging(),
        }),
    }));

    return (
        <div
            ref={drag}
            style={{
                opacity: isDragging ? 0.5 : 1,
                cursor: 'grab',
            }}
        >
            {children}
        </div>
    );
}

// Tweet composer with drop zone
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
    const [selStart, setSelStart] = useState<number | null>(null);
    const [selEnd, setSelEnd] = useState<number | null>(null);
    const [showRewrite, setShowRewrite] = useState(false);
    const [rewriteOpen, setRewriteOpen] = useState(false);
    const selectedText = useMemo(() => {
        if (selStart === null || selEnd === null) return '';
        if (selStart === selEnd) return '';
        return value.slice(Math.min(selStart, selEnd), Math.max(selStart, selEnd));
    }, [selStart, selEnd, value]);

    const [{ isOver }, drop] = useDrop(() => ({
        accept: ItemTypes.TWEET,
        drop: (item: { tweet: string; source: string }) => {
            // Smart append logic - add space/newline only if content exists
            const currentValue = value.trim();
            let newValue;

            if (currentValue) {
                // Add appropriate spacing based on content
                const separator = currentValue.endsWith('.') || currentValue.endsWith('!') || currentValue.endsWith('?')
                    ? '\n\n'
                    : ' ';
                newValue = `${currentValue}${separator}${item.tweet}`;
            } else {
                newValue = item.tweet;
            }

            onChange(newValue);

            toast({
                title: `Tweet added from ${item.source}!`,
                description: "Content has been appended to your draft."
            });
        },
        collect: (monitor: any) => ({
            isOver: monitor.isOver(),
        }),
    }));

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

    if (registerInserter) {
        registerInserter(insertAtCursor);
    }

    const updateSelection = () => {
        const ta = textareaRef.current;
        if (!ta) return;
        const start = ta.selectionStart ?? 0;
        const end = ta.selectionEnd ?? 0;
        setSelStart(start);
        setSelEnd(end);
        setShowRewrite(Boolean(end - start));
    };

    const replaceSelection = (replacement: string) => {
        const start = selStart ?? 0;
        const end = selEnd ?? 0;
        const a = Math.min(start, end);
        const b = Math.max(start, end);
        const before = value.slice(0, a);
        const after = value.slice(b);
        const next = before + replacement + after;
        if (next.length > 280) {
            toast({ title: 'Too long', description: 'Rewrite exceeds 280 characters.' });
            return;
        }
        onChange(next);
        requestAnimationFrame(() => {
            if (textareaRef.current) {
                const pos = a + replacement.length;
                textareaRef.current.focus();
                textareaRef.current.setSelectionRange(pos, pos);
            }
        });
    };

    return (
        <div
            ref={drop}
            className={`relative transition-all duration-200 ${isOver ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}`}
        >
            <Textarea
                ref={textareaRef}
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onMouseUp={updateSelection}
                onKeyUp={updateSelection}
                className={`min-h-[180px] resize-none bg-background border-border transition-all duration-200 ${isOver ? 'border-blue-500 shadow-md' : ''
                    }`}
                maxLength={280}
            />
            {showRewrite && (
                <div className="absolute bottom-2 right-2">
                    <AiRewritePopover
                        open={rewriteOpen}
                        onOpenChange={setRewriteOpen}
                        selectedText={selectedText}
                        onApply={(replacement) => {
                            replaceSelection(replacement);
                        }}
                    />
                
                </div>
            )}
            {isOver && (
                <div className="absolute inset-0 bg-blue-50 border-2 border-blue-400 border-dashed rounded-md flex items-center justify-center">
                    <div className="text-center">
                        <p className="text-blue-600 font-medium text-sm">📝 Drop to append content</p>
                        <p className="text-blue-500 text-xs mt-1">Will be added to existing text</p>
                    </div>
                </div>
            )}

        </div>
    );
}
