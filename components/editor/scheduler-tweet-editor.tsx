"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from "@/components/ui/drawer";
import { TweetComposer } from './tweet-composer';
import HashtagPicker from '@/components/editor/hashtag-picker';
import EmojiPicker from '@/components/editor/emoji-picker';
import GiphyPicker from '@/components/editor/giphy-picker';
import ImageUploader from '@/components/editor/image-uploader';
import SchedulePicker from '@/components/editor/schedule-picker';
import { Input } from '@/components/ui/input';
import { HoverCard, HoverCardTrigger, HoverCardContent } from '@/components/ui/hover-card';
import { Info, Save, Calendar, X } from 'lucide-react';

interface SchedulerTweetEditorProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    postId: string;
    initialContent: string;
    initialScheduledAt: string | null;
    status: 'draft' | 'scheduled' | 'posted' | 'archived';
    initialMetadata?: any;
    onSave: (id: string, updates: { content?: string; scheduled_at?: string | null; metadata?: any }) => Promise<void> | void;
}

export default function SchedulerTweetEditor({
    open,
    onOpenChange,
    postId,
    initialContent,
    initialScheduledAt,
    status,
    initialMetadata,
    onSave
}: SchedulerTweetEditorProps) {
    const [editedTweet, setEditedTweet] = useState(initialContent);
    const [attachments, setAttachments] = useState<Array<{ url: string; file: File | null }>>([]);
    const [communityUrl, setCommunityUrl] = useState("");
    const [saving, setSaving] = useState(false);

    // Initialize with the content from the scheduler item
    useEffect(() => {
        if (open) {
            setEditedTweet(initialContent);
            
            // Load attachments from metadata
            const images = initialMetadata?.images || [];
            const loadedAttachments = images.map((url: string) => ({ url, file: null }));
            setAttachments(loadedAttachments);
            
            // Load community URL from metadata
            setCommunityUrl(initialMetadata?.community_url || "");
        }
    }, [open, initialContent, initialMetadata]);

    const isPosted = status === 'posted';
    const canEdit = !isPosted;

    const handleSave = async () => {
        if (!canEdit || !editedTweet.trim()) return;

        setSaving(true);
        try {
            const metadata = {
                ...initialMetadata,
                images: attachments.map(att => att.url),
                community_url: communityUrl || null
            };
            await onSave(postId, { 
                content: editedTweet.trim(),
                metadata
            });
            onOpenChange(false);
        } finally {
            setSaving(false);
        }
    };

    const handleScheduleConfirm = async (scheduledAt: Date) => {
        if (!canEdit || !editedTweet.trim()) return;

        setSaving(true);
        try {
            const metadata = {
                ...initialMetadata,
                images: attachments.map(att => att.url),
                community_url: communityUrl || null
            };
            await onSave(postId, {
                content: editedTweet.trim(),
                scheduled_at: scheduledAt.toISOString(),
                metadata
            });
            onOpenChange(false);
        } finally {
            setSaving(false);
        }
    };

    const handleInsertHashtag = (hashtag: string) => {
        const insert = (window as any).__insertIntoTweet as undefined | ((t: string) => void);
        if (insert) {
            insert(hashtag);
        } else {
            const addition = (editedTweet.endsWith(' ') || editedTweet.length === 0) ? hashtag : ` ${hashtag}`;
            const next = editedTweet + addition;
            if (next.length <= 280) setEditedTweet(next);
        }
    };

    const addHashtag = () => {
        setEditedTweet('#');
    };

    return (
        <Drawer open={open} onOpenChange={onOpenChange}>
            <DrawerContent className="max-h-[90vh]">
                <div className="max-w-md mx-auto">
                    <DrawerHeader>
                        <DrawerTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-orange-500" />
                            Edit Scheduled Post
                        </DrawerTitle>
                    </DrawerHeader>

                    <div className="px-4 pb-4 space-y-4 overflow-y-auto">
                        {/* Community URL Input */}
                        <div className="flex items-center gap-2 max-w-2xl">
                            <Input
                                value={communityUrl}
                                onChange={(e) => setCommunityUrl(e.target.value)}
                                placeholder="Community URL (e.g. https://x.com/i/communities/123456789)"
                                className="text-sm"
                            />
                            <HoverCard>
                                <HoverCardTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground">
                                        <Info className="h-4 w-4" />
                                    </Button>
                                </HoverCardTrigger>
                                <HoverCardContent className="w-80">
                                    <div className="text-xs font-medium mb-1">Share to a community</div>
                                    <p className="text-[10px] leading-tight text-muted-foreground">
                                        Paste the community URL from X. On X: open your Community and copy the URL from the address bar (for example: https://x.com/i/communities/123456789).
                                    </p>
                                </HoverCardContent>
                            </HoverCard>
                        </div>

                        {/* Main Composer */}
                        <div className="py-4">
                            <TweetComposer
                                value={editedTweet}
                                onChange={(value) => {
                                    if (canEdit) {
                                        setEditedTweet(value);
                                    }
                                }}
                                placeholder={editedTweet ? "Add another tweet" : "Write here..."}
                            />

                            {/* Media and options */}
                            <div className="flex items-center justify-between mt-4">
                                <div className="flex items-center gap-2">
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
                                <div className="flex items-center gap-1">
                                    <ImageUploader
                                        onSelect={(urls, files) => {
                                            const next = urls.map((u, i) => ({ url: u, file: files[i] })).filter(Boolean);
                                            setAttachments((prev) => [...prev, ...next]);
                                        }}
                                        multiple
                                    />

                                    <GiphyPicker onSelect={(gifUrl) => {
                                        const gifAttachment = { url: gifUrl, file: null };
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
                            </div>
                        </div>

                        {/* Attachments preview */}
                        {attachments.length > 0 && (
                            <div className="space-y-2">
                                <div className="text-sm font-medium text-muted-foreground">Attachments</div>
                                <div className="grid grid-cols-2 gap-2">
                                    {attachments.map((att, idx) => (
                                        <div key={idx} className="relative group border border-border rounded-md overflow-hidden bg-muted/20">
                                            {att.file && att.file.type.startsWith('image/') ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img src={att.url} alt="attachment" className="w-full h-20 object-cover" />
                                            ) : att.file && att.file.type.startsWith('video/') ? (
                                                <video src={att.url} className="w-full h-20 object-cover" muted />
                                            ) : (
                                                // GIF from Giphy (no file object)
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img src={att.url} alt="GIF" className="w-full h-20 object-cover" />
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
                            </div>
                        )}

                        {/* Status indicator */}
                        {!canEdit && (
                            <div className="text-xs text-muted-foreground italic">
                                Read-only (posted content)
                            </div>
                        )}
                    </div>

                    <DrawerFooter className="flex flex-row gap-2 max-w-md mx-auto">
                        <Button className="text-orange-600" variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
                            <X className="h-3 w-3 mr-1" />
                            Cancel
                        </Button>

                        <div className="flex gap-2">
                            
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            disabled={!editedTweet.trim() || saving}
                            onClick={handleSave}
                        >
                            <Save className="h-3 w-3 mr-1" />
                            Save Draft
                        </Button>
                        <SchedulePicker
                            disabled={!editedTweet.trim() || !canEdit}
                            scheduledAt={initialScheduledAt ? new Date(initialScheduledAt) : undefined}
                            onConfirm={handleScheduleConfirm}
                        />
                    </DrawerFooter>
                </div>

            </DrawerContent>
        </Drawer>
    );
}
