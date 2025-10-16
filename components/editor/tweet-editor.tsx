"use client";

import { Button } from '@/components/ui/button';

import {
    Type,
    Bold,
    Italic,
    Underline,
    Strikethrough,
    AlignLeft,
    List,
    ListOrdered,
} from 'lucide-react';
import { TweetComposer } from './tweet-composer';
import HashtagPicker from '@/components/editor/hashtag-picker';
import EmojiPicker from '@/components/editor/emoji-picker';
import GiphyPicker from '@/components/editor/giphy-picker';
import ImageUploader from '@/components/editor/image-uploader';
import { toast } from '@/hooks/use-toast';
import { AttachmentItem } from '@/lib/types/attachments';
import { AiRewritePopover } from './ai-rewrite-popover';
import { AIContentGenerator } from './ai-content-generator';

interface TweetEditorProps {
    content: string | null;
    setContent: (content: string) => void;
    attachments: AttachmentItem[];
    setAttachments: (attachments: AttachmentItem[]) => void;
}

export default function TweetEditor({ content, setContent, attachments, setAttachments }: TweetEditorProps) {
    
    const handleInsertHashtag = (tag: string) => {
        const cleanTag = tag.startsWith('#') ? tag : `#${tag}`;
        const addition = (content?.endsWith(' ') || content?.length === 0) ? cleanTag : ` ${cleanTag}`;
        const next = content + addition;
        if (next.length > 280) {
            toast({
                title: "Too long",
                description: "Adding this hashtag would exceed 280 characters.",
            });
            return;
        }
        setContent(next);
    };

    const addHashtag = () => setContent(content ? content + " #" : "#");

    return (
        <div className="max-w-4xl mx-auto px-12 py-8">
            <div className="flex items-center gap-1 mb-6 pb-4 border-b border-border/30">
                <div className="flex items-center gap-0.5 mr-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-gray-100">
                        <Type className="w-4 h-4" />
                    </Button>
                    <div className="w-px h-5 bg-border mx-1" />
                </div>
                <Button
                    variant="ghost"
                    size="sm" className="h-8 w-8 p-0 hover:bg-gray-100">
                    <Bold className="w-4 h-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-gray-100">
                    <Italic className="w-4 h-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-gray-100">
                    <Underline className="w-4 h-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-gray-100">
                    <Strikethrough className="w-4 h-4" />
                </Button>
                <div className="w-px h-5 bg-border mx-2" />
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-gray-100">
                    <AlignLeft className="w-4 h-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-gray-100">
                    <List className="w-4 h-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-gray-100">
                    <ListOrdered className="w-4 h-4" />
                </Button>
                <div className="w-px h-5 bg-border mx-2" />

                <ImageUploader
                    onSelect={(urls, files) => {
                        // Normalize new items with types
                        const incoming = urls.map((u, i) => ({ url: u, file: files[i], type: files[i]?.type || null })).filter(Boolean);

                        // Existing counts
                        const hasGif = attachments.some(a => a.type === 'image/gif');
                        const hasVideo = attachments.some(a => (a.type || '').startsWith('video/'));
                        const imageCount = attachments.filter(a => (a.type || '').startsWith('image/') && a.type !== 'image/gif').length;

                        // If GIF or video already present, do not add anything else
                        if (hasGif) {
                            toast({ title: 'Limit reached', description: 'Cannot add images or videos when a GIF is attached.' });
                            return;
                        }
                        if (hasVideo) {
                            toast({ title: 'Limit reached', description: 'Cannot add images or GIFs when a video is attached.' });
                            return;
                        }

                        // If user is trying to add a video now, require empty list and pick only the first video
                        const incomingVideo = incoming.find(a => (a.type || '').startsWith('video/'));
                        if (incomingVideo) {
                            if (attachments.length > 0) {
                                toast({ title: 'Only one video allowed', description: 'Remove other attachments before adding a video.' });
                                return;
                            }
                            setAttachments([...attachments, incomingVideo]);
                            return;
                        }

                        // Only images allowed: cap at 4 total
                        const incomingImages = incoming.filter(a => (a.type || '').startsWith('image/') && a.type !== 'image/gif');
                        const remaining = Math.max(0, 4 - imageCount);
                        const allowed = incomingImages.slice(0, remaining);
                        if (allowed.length < incomingImages.length) {
                            toast({ title: 'Image limit', description: 'You can attach up to 4 images.' });
                        }
                        if (!allowed.length) return;
                        setAttachments([...attachments, ...allowed]);
                    }}
                    multiple
                />

                <GiphyPicker onSelect={(gifUrl) => {
                    const hasAny = attachments.length > 0;
                    if (hasAny) {
                        toast({ title: 'Only one GIF allowed', description: 'Remove other attachments before adding a GIF.' });
                        return;
                    }
                    const gifAttachment = { url: gifUrl, file: null, type: 'image/gif' };
                    setAttachments([...attachments, gifAttachment]);
                }} />

                <EmojiPicker onInsert={(emoji) => {
                    const insert = (window as any).__insertIntoTweet as undefined | ((t: string) => void);
                    if (insert) insert(emoji);
                    else {
                        const addition = (content?.endsWith(' ') || content?.length === 0) ? emoji : ` ${emoji}`;
                        const next = content + addition;
                        if (next.length <= 280) setContent(next);
                    }
                }} />

                <div className="w-px h-5 bg-border mx-2" />
                <AIContentGenerator
                    currentContent={content || ""}
                    onApplyContent={(content) => {
                        setContent(content);
                    }}
                />
            </div>

            <div className="flex items-center justify-between flex-wrap gap-2 mb-6">
                <div className="flex items-center gap-2 order-2 sm:order-1">
                    <span className={`text-xs ${content?.length ?? 0 > 250 ? 'text-red-500' : 'text-muted-foreground'}`}>
                        {content?.length} / 280
                    </span>
                    {content && (
                        <div className="flex items-center gap-1">
                            <span className="text-green-600 text-xs">saved</span>
                            <span className="text-green-600">✓</span>
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-1 order-1 sm:order-2 flex-wrap">
                </div>
            </div>
            <TweetComposer
                value={content || ""}
                onChange={(value) => setContent(value)}
                placeholder="Start writing your post..."
            />

            {/* Attachments preview */}
            {attachments.length > 0 && (
                <>
                    <h4 className="text-sm text-muted-foreground mb-3">
                        Attached Media ({attachments.length} / {(attachments.some(a => a.type === 'image/gif') || attachments.some(a => (a.type || '').startsWith('video/'))) ? 1 : 4})
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {attachments.map((att, idx) => (
                            <div key={idx} className="relative group border border-border rounded-md overflow-hidden bg-muted/20">
                                {att.type && att.type?.startsWith('image/') ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={att.url} alt="attachment" className="w-full h-24 object-cover" />
                                ) : att.type && att.type?.startsWith('video/') ? (
                                    <video src={att.url} className="w-full h-24 object-cover" muted />
                                ) : (
                                    // GIF from Giphy (no file object)
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={att.url} alt="GIF" className="w-full h-24 object-cover" />
                                )}
                                <button
                                    type="button"
                                    className="absolute top-1 right-1 bg-background/80 border border-border text-foreground text-xs px-1 rounded opacity-0 group-hover:opacity-100"
                                    onClick={() => setAttachments(attachments.filter((_, i) => i !== idx))}
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
