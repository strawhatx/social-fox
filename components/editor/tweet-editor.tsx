"use client";

import { useRef } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Plus,
    Info,
    Type,
    Bold,
    Italic,
    Underline,
    Strikethrough,
    AlignLeft,
    List,
    ListOrdered,
    Link as LinkIcon,
    Image as ImageIcon,
    Table,
    Undo,
    Redo,
    MoreHorizontal,
} from 'lucide-react';
import { TweetComposer } from './tweet-composer';
import HashtagPicker from '@/components/editor/hashtag-picker';
import EmojiPicker from '@/components/editor/emoji-picker';
import GiphyPicker from '@/components/editor/giphy-picker';
import ImageUploader from '@/components/editor/image-uploader';
import { useTweetEditor } from '@/hooks/use-tweet-editor';
import { toast } from '@/hooks/use-toast';

interface TweetEditorProps {
    contentToLoad?: string;
    persistKey?: string;
}

export default function TweetEditor({ contentToLoad, persistKey }: TweetEditorProps) {
    const {
        activeComposerTab,
        editedTweet,
        isScheduled,
        attachments,
        communityUrl,
        currentPostStatus,
        drafts,
        scheduled,
        loadingDrafts,
        loadingScheduled,
        setActiveComposerTab,
        setEditedTweet,
        setAttachments,
        setCommunityUrl,
        handleScheduleConfirm,
        handleSaveDraft,
        loadDraft,
        loadScheduled,
        handleInsertHashtag,
        addHashtag,
    } = useTweetEditor(contentToLoad, { persistKey });

    const fileInputRef = useRef<HTMLInputElement>(null);

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
                            setAttachments((prev) => [...prev, incomingVideo]);
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
                        setAttachments((prev) => [...prev, ...allowed]);
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
                    setAttachments((prev) => [...prev, gifAttachment]);
                }} />

                <HashtagPicker
                    content={editedTweet || ""}
                    onInsert={handleInsertHashtag}
                    onAddManual={addHashtag}
                />

                <EmojiPicker onInsert={(emoji) => {
                    const insert = (window as any).__insertIntoTweet as undefined | ((t: string) => void);
                    if (insert) insert(emoji);
                    else {
                        const addition = (editedTweet.endsWith(' ') || editedTweet.length === 0) ? emoji : ` ${emoji}`;
                        const next = editedTweet + addition;
                        if (next.length <= 280) setEditedTweet(next);
                    }
                }} />
            </div>

            <TweetComposer
                value={editedTweet}
                onChange={(value) => {
                    if (currentPostStatus !== 'posted') {
                        setEditedTweet(value);
                    }
                }}
                placeholder="Start writing your post..."
            />

            <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2 order-2 sm:order-1">
                    <span className={`text-xs ${editedTweet.length > 250 ? 'text-red-500' : 'text-muted-foreground'}`}>
                        {editedTweet.length} / 280
                    </span>
                    {editedTweet && (
                        <div className="flex items-center gap-1">
                            <span className="text-green-600 text-xs">saved</span>
                            <span className="text-green-600">✓</span>
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-1 order-1 sm:order-2 flex-wrap">
                </div>
            </div>

            {/* Attachments preview */}
            {attachments.length > 0 && (
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
                                onClick={() => setAttachments((prev) => prev.filter((_, i) => i !== idx))}
                            >
                                Remove
                            </button>
                        </div>
                    ))}
                </div>
            )}

        </div>




    );
}
