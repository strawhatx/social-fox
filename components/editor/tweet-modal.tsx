"use client";
import Image from 'next/image';

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useUser } from "@clerk/nextjs";
import {
    X,
    Smile,
    Calendar,
    Save,
    Send,
    Plus,
    Bold,
    Italic,
    Type,
    List,
    MessageSquare,
    Copy,
    Wand2,
    Globe,
    ChevronDown,
    Upload,
    Gift,
    MapPin,
    PlusCircle
} from "lucide-react";
import { TweetComposer } from "./tweet-composer";
import EmojiPicker from "./emoji-picker";
import GiphyPicker from "./giphy-picker";
import ImageUploader from "./image-uploader";
import { AIContentGenerator } from "./ai-content-generator";
import { toast } from "@/hooks/use-toast";
import { AttachmentItem } from "@/lib/types/attachments";
import { ContentPostItem } from "@/lib/types/content_posts";

interface ThreadTweet {
    id: number;
    content: string;
    attachments: AttachmentItem[];
}

interface TweetModalProps {
    isOpen: boolean;
    onClose: () => void;
    thread: ContentPostItem[];
    onSave?: (threadTweets: ThreadTweet[]) => void;
    onPublish?: (threadTweets: ThreadTweet[]) => void;
    readOnly?: boolean;
}

export default function TweetModal({
    isOpen,
    onClose,
    thread,
    onSave,
    onPublish,
    readOnly
}: TweetModalProps) {
    const { user } = useUser();
    const [threadTweets, setThreadTweets] = useState<ThreadTweet[]>(
        thread?.length > 0
            ? thread.map((item, index) => ({
                id: index + 1,
                content: item.content,
                attachments: item.media || []
            }))
            : [{ id: 1, content: "", attachments: [] }]
    );
    const [isSaving, setIsSaving] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const [focusedTweetId, setFocusedTweetId] = useState<number>(1);

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const dialogContentRef = useRef<HTMLDivElement>(null);

    // Reset state when modal opens/closes
    useEffect(() => {
        if (isOpen) {
            setThreadTweets(
                thread.length > 0
                    ? thread.map((item, index) => ({
                        id: index + 1,
                        content: item.content,
                        attachments: item.media || []
                    }))
                    : [{ id: 1, content: "", attachments: [] }]
            );
            // Focus textarea after modal opens
            if (!readOnly) {
                setTimeout(() => {
                    textareaRef.current?.focus();
                }, 100);
            }
        }
    }, [isOpen, thread, readOnly]);

    // Handle clicking on dialog content to focus textarea
    const handleDialogClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (readOnly) return;
        const target = e.target as HTMLElement;

        // Don't focus if clicking on interactive elements
        if (
            target.tagName === 'BUTTON' ||
            target.tagName === 'A' ||
            target.closest('button') ||
            target.closest('a') ||
            target.closest('[role="button"]') ||
            target.closest('[role="menuitem"]') ||
            target.closest('[data-radix-collection-item]') ||
            target.closest('input') ||
            target.closest('textarea')
        ) {
            return;
        }

        // Focus the textarea
        textareaRef.current?.focus();
    };

    const handleSave = async () => {
        if (!onSave) return;

        setIsSaving(true);
        try {
            await onSave(threadTweets);
            toast({
                title: "Saved!",
                description: `Your thread with ${threadTweets.length} tweet${threadTweets.length === 1 ? '' : 's'} has been saved as a draft`
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to save post",
                variant: "destructive"
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handlePublish = async () => {
        if (!onPublish) return;

        setIsPublishing(true);
        try {
            await onPublish(threadTweets);
            toast({
                title: "Published!",
                description: "Your thread has been published"
            });
            onClose();
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to publish post",
                variant: "destructive"
            });
        } finally {
            setIsPublishing(false);
        }
    };


    const addThreadTweet = () => {
        const newId = Math.max(...threadTweets.map(t => t.id)) + 1;
        setThreadTweets([...threadTweets, { id: newId, content: "", attachments: [] }]);
    };

    const removeThreadTweet = (id: number) => {
        if (threadTweets.length > 1) {
            setThreadTweets(threadTweets.filter(t => t.id !== id));
        }
    };

    const updateThreadTweet = (id: number, content: string, attachments: AttachmentItem[]) => {
        setThreadTweets(threadTweets.map(t =>
            t.id === id ? { ...t, content, attachments } : t
        ));
    };

    // Get the currently focused tweet
    const getFocusedTweet = () => {
        return threadTweets.find(t => t.id === focusedTweetId) || threadTweets[0];
    };

    // Handle image upload for focused tweet
    const handleImageUpload = (items: any[]) => {
        const focusedTweet = getFocusedTweet();
        const incoming = (items || []).map(it => ({
            url: it.url,
            file: it.file,
            type: it.type || null,
            key: it.key
        })).filter(Boolean as any);

        const hasGif = focusedTweet.attachments.some(a => a.type === 'image/gif');
        const hasVideo = focusedTweet.attachments.some(a => (a.type || '').startsWith('video/'));
        const imageCount = focusedTweet.attachments.filter(a => (a.type || '').startsWith('image/') && a.type !== 'image/gif').length;

        if (hasGif) {
            toast({ title: 'Limit reached', description: 'Cannot add images or videos when a GIF is attached.' });
            return;
        }
        if (hasVideo) {
            toast({ title: 'Limit reached', description: 'Cannot add images or GIFs when a video is attached.' });
            return;
        }

        const incomingVideo = incoming.find(a => (a.type || '').startsWith('video/'));
        if (incomingVideo) {
            if (focusedTweet.attachments.length > 0) {
                toast({ title: 'Only one video allowed', description: 'Remove other attachments before adding a video.' });
                return;
            }
            updateThreadTweet(focusedTweetId, focusedTweet.content, [...focusedTweet.attachments, incomingVideo]);
            return;
        }

        const incomingImages = incoming.filter(a => (a.type || '').startsWith('image/') && a.type !== 'image/gif');
        const remaining = Math.max(0, 4 - imageCount);
        const allowed = incomingImages.slice(0, remaining);
        if (allowed.length < incomingImages.length) {
            toast({ title: 'Image limit', description: 'You can attach up to 4 images.' });
        }
        if (!allowed.length) return;
        updateThreadTweet(focusedTweetId, focusedTweet.content, [...focusedTweet.attachments, ...allowed]);
    };

    const handleGifSelect = (gifUrl: string) => {
        const focusedTweet = getFocusedTweet();
        const hasAny = focusedTweet.attachments.length > 0;
        if (hasAny) {
            toast({ title: 'Only one GIF allowed', description: 'Remove other attachments before adding a GIF.' });
            return;
        }
        const gifAttachment = { url: gifUrl, file: null, type: 'image/gif' };
        updateThreadTweet(focusedTweetId, focusedTweet.content, [...focusedTweet.attachments, gifAttachment]);
    };

    const handleEmojiInsert = (emoji: string) => {
        const focusedTweet = getFocusedTweet();
        const addition = (focusedTweet.content?.endsWith(' ') || focusedTweet.content?.length === 0) ? emoji : ` ${emoji}`;
        const next = focusedTweet.content + addition;
        if (next.length <= 280) {
            updateThreadTweet(focusedTweetId, next, focusedTweet.attachments);
        }
    };

    const removeAttachment = async (tweetId: number, index: number) => {
        const tweet = threadTweets.find(t => t.id === tweetId);
        if (!tweet) return;

        const target = tweet.attachments[index];
        if (target?.key) {
            try {
                await fetch('/api/s3/delete', {
                    method: 'POST',
                    headers: { 'content-type': 'application/json' },
                    body: JSON.stringify({ key: target.key }),
                });
            } catch { }
        }
        const updatedAttachments = tweet.attachments.filter((_, i) => i !== index);
        updateThreadTweet(tweetId, tweet.content, updatedAttachments);
    };


    return (
        <Dialog open={isOpen} onOpenChange={onClose} >
            <DialogContent
                ref={dialogContentRef}
                onClick={handleDialogClick}
                className="max-w-2xl w-full max-h-[90vh] flex flex-col p-0 bg-white dark:bg-background focus:outline-none focus:ring-0"
            >
                <DialogHeader className="sr-only">
                    <DialogTitle>Compose Tweet</DialogTitle>
                    <DialogDescription>Write and publish your tweet</DialogDescription>
                </DialogHeader>

                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-border">
                    <div className="flex items-center gap-3">

                        <div className="flex items-center gap-2 ml-8">
                            {user?.imageUrl ? (
                                <Image
                                    src={user.imageUrl}
                                    alt={user.fullName || user.firstName || "User"}
                                    width={32}
                                    height={32}
                                    className="rounded-full object-cover"
                                    unoptimized
                                />
                            ) : (
                                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
                                    <span className="text-white text-sm font-semibold">
                                        {user?.firstName?.charAt(0) || user?.emailAddresses?.[0]?.emailAddress?.charAt(0) || "U"}
                                    </span>
                                </div>
                            )}
                            <div className="flex items-center gap-1">
                                <Badge
                                    variant="outline"
                                    className="text-xs px-2 py-1 border-blue-200 text-blue-600 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800 dark:text-blue-400"
                                >
                                    Everyone
                                </Badge>
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                    <ChevronDown className="h-3 w-3" />
                                </Button>
                            </div>
                        </div>
                    </div>
                    {!readOnly && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20"
                        >
                            Drafts
                        </Button>
                    )}
                </div>

                {/* Main Content Area */}
                <div className="flex-1 overflow-y-auto min-h-0">
                    <div className="p-4 space-y-4">
                        {/* Thread Display */}
                        {threadTweets.map((tweet, index) => (
                            <div
                                key={tweet.id}
                                className={`border rounded-lg p-4 cursor-pointer transition-colors ${focusedTweetId === tweet.id
                                    ? 'border-orange-300 bg-white dark:bg-gray-800'
                                    : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 opacity-60'
                                    }`}
                                onClick={() => setFocusedTweetId(tweet.id)}
                            >
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${focusedTweetId === tweet.id
                                            ? 'bg-orange-600'
                                            : 'bg-gradient-to-br from-orange-500 to-orange-600'
                                            }`}>
                                            <span className="text-white text-sm font-semibold">
                                                {index + 1}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <TweetComposer
                                            value={tweet.content}
                                            onChange={(value) => updateThreadTweet(tweet.id, value, tweet.attachments)}
                                            placeholder={`Tweet ${index + 1} of ${threadTweets.length}`}
                                            readOnly={!!readOnly}
                                        />

                                        {/* Media Preview */}
                                        {tweet.attachments.length > 0 && (
                                            <div className="grid grid-cols-2 gap-2 mt-2">
                                                {tweet.attachments.map((att, idx) => (
                                                    <div key={idx} className="relative group rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                                                        {att.type && att.type?.startsWith('image/') ? (
                                                            <Image src={att.url} alt="attachment" width={400} height={200} className="w-full h-24 object-cover" unoptimized />
                                                        ) : att.type && att.type?.startsWith('video/') ? (
                                                            <video src={att.url} className="w-full h-24 object-cover" muted />
                                                        ) : (
                                                            <Image src={att.url} alt="GIF" width={400} height={200} className="w-full h-24 object-cover" unoptimized />
                                                        )}
                                                        {!readOnly && (
                                                            <button
                                                                type="button"
                                                                className="absolute top-1 right-1 bg-black/50 text-white text-xs px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    removeAttachment(tweet.id, idx);
                                                                }}
                                                            >
                                                                ×
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    {threadTweets.length > 1 && !readOnly && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                removeThreadTweet(tweet.id);
                                            }}
                                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>


                {/* Bottom Action Bar */}
                {!readOnly && (
                <div className="bg-gray-50 dark:bg-gray-800/50 p-4 flex-shrink-0">
                    <div className="flex items-center justify-between">
                        {/* Left Side - Tools */}
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                                {/* Formatting Tools */}
                                <div className="flex items-center gap-1 border-r border-border pr-2 mr-2">
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0">
                                        <Bold className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0">
                                        <Italic className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0">
                                        <List className="h-4 w-4" />
                                    </Button>
                                </div>

                                {/* Media Tools */}
                                <ImageUploader
                                    onSelect={handleImageUpload}
                                    multiple
                                />

                                <GiphyPicker
                                    onSelect={handleGifSelect}
                                />

                                <EmojiPicker
                                    onInsert={handleEmojiInsert}
                                />

                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0">
                                    <MapPin className="h-4 w-4" />
                                </Button>

                                <div className="w-px h-6 bg-border mx-2" />

                                <AIContentGenerator
                                    currentContent={getFocusedTweet().content}
                                    onApplyContent={(content) => {
                                        const focusedTweet = getFocusedTweet();
                                        updateThreadTweet(focusedTweetId, content, focusedTweet.attachments);
                                    }}
                                />
                            </div>
                        </div>

                        {/* Right Side - Actions */}
                        <div className="flex items-center gap-3">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={addThreadTweet}
                                className=" text-gray-700 text-sm"
                            >
                                <PlusCircle className="h-4 w-4 mr-1" />
                            </Button>

                            {/* Save Draft Button */}
                            {onSave && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 border-gray-300 px-3 py-1.5 text-sm"
                                >
                                    {isSaving ? 'Saving...' : 'Save'}
                                </Button>
                            )}

                            {/* Publish Button */}
                            {onPublish && (
                                <Button
                                    variant="default"
                                    size="sm"
                                    onClick={handlePublish}
                                    disabled={isPublishing}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 text-sm"
                                >
                                    {isPublishing ? 'Publishing...' : 'Publish'}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
                )}

            </DialogContent>
        </Dialog>
    );
}
