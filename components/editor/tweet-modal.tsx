"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useUser } from "@clerk/nextjs";
import {
    X,
    Image,
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
    MapPin
} from "lucide-react";
import { TweetComposer } from "./tweet-composer";
import EmojiPicker from "./emoji-picker";
import GiphyPicker from "./giphy-picker";
import ImageUploader from "./image-uploader";
import { AIContentGenerator } from "./ai-content-generator";
import { toast } from "@/hooks/use-toast";
import { AttachmentItem } from "@/lib/types/attachments";

interface TweetModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialContent?: string;
    initialAttachments?: AttachmentItem[];
    onSave?: (content: string, attachments: AttachmentItem[]) => void;
    onPublish?: (content: string, attachments: AttachmentItem[]) => void;
    isEditing?: boolean;
    scheduledAt?: string | null;
    onScheduleChange?: (date: string | null) => void;
}

export default function TweetModal({
    isOpen,
    onClose,
    initialContent = "",
    initialAttachments = [],
    onSave,
    onPublish,
    isEditing = false,
    scheduledAt,
    onScheduleChange
}: TweetModalProps) {
    const { user } = useUser();
    const [content, setContent] = useState(initialContent);
    const [attachments, setAttachments] = useState<AttachmentItem[]>(initialAttachments);
    const [activeTab, setActiveTab] = useState<"post" | "thread">("post");
    const [audience, setAudience] = useState("Everyone");
    const [replySetting, setReplySetting] = useState("Everyone can reply");
    const [isSaving, setIsSaving] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const [showSchedule, setShowSchedule] = useState(false);
    const [threadTweets, setThreadTweets] = useState([{ id: 1, content: initialContent, attachments: initialAttachments || [] }]);

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const dialogContentRef = useRef<HTMLDivElement>(null);

    // Reset state when modal opens/closes
    useEffect(() => {
        if (isOpen) {
            setContent(initialContent);
            setAttachments(initialAttachments);
            // Focus textarea after modal opens
            setTimeout(() => {
                textareaRef.current?.focus();
            }, 100);
        }
    }, [isOpen, initialContent, initialAttachments]);

    // Handle clicking on dialog content to focus textarea
    const handleDialogClick = (e: React.MouseEvent<HTMLDivElement>) => {
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
            await onSave(content, attachments);
            toast({
                title: "Saved!",
                description: "Your post has been saved as a draft"
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
            await onPublish(content, attachments);
            toast({
                title: "Published!",
                description: "Your post has been published"
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

    const handleCopy = () => {
        navigator.clipboard.writeText(content);
        toast({
            title: "Copied!",
            description: "Content copied to clipboard"
        });
    };

    const handleImageUpload = (items: any[]) => {
        const incoming = (items || []).map(it => ({
            url: it.url,
            file: it.file,
            type: it.type || null,
            key: it.key
        })).filter(Boolean as any);

        const hasGif = attachments.some(a => a.type === 'image/gif');
        const hasVideo = attachments.some(a => (a.type || '').startsWith('video/'));
        const imageCount = attachments.filter(a => (a.type || '').startsWith('image/') && a.type !== 'image/gif').length;

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
            if (attachments.length > 0) {
                toast({ title: 'Only one video allowed', description: 'Remove other attachments before adding a video.' });
                return;
            }
            setAttachments([...attachments, incomingVideo]);
            return;
        }

        const incomingImages = incoming.filter(a => (a.type || '').startsWith('image/') && a.type !== 'image/gif');
        const remaining = Math.max(0, 4 - imageCount);
        const allowed = incomingImages.slice(0, remaining);
        if (allowed.length < incomingImages.length) {
            toast({ title: 'Image limit', description: 'You can attach up to 4 images.' });
        }
        if (!allowed.length) return;
        setAttachments([...attachments, ...allowed]);
    };

    const handleGifSelect = (gifUrl: string) => {
        const hasAny = attachments.length > 0;
        if (hasAny) {
            toast({ title: 'Only one GIF allowed', description: 'Remove other attachments before adding a GIF.' });
            return;
        }
        const gifAttachment = { url: gifUrl, file: null, type: 'image/gif' };
        setAttachments([...attachments, gifAttachment]);
    };

    const handleEmojiInsert = (emoji: string) => {
        const addition = (content?.endsWith(' ') || content?.length === 0) ? emoji : ` ${emoji}`;
        const next = content + addition;
        if (next.length <= 280) setContent(next);
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

    const removeAttachment = async (index: number) => {
        const target = attachments[index];
        if (target?.key) {
            try {
                await fetch('/api/s3/delete', {
                    method: 'POST',
                    headers: { 'content-type': 'application/json' },
                    body: JSON.stringify({ key: target.key }),
                });
            } catch { }
        }
        setAttachments(attachments.filter((_, i) => i !== index));
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose} >
            <DialogContent 
                ref={dialogContentRef}
                onClick={handleDialogClick}
                className="max-w-2xl w-full max-h-[90vh] overflow-hidden p-0 bg-white dark:bg-background focus:outline-none focus:ring-0"
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
                                <img
                                    src={user.imageUrl}
                                    alt={user.fullName || user.firstName || "User"}
                                    className="w-8 h-8 rounded-full object-cover"
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
                                    {audience}
                                </Badge>
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                    <ChevronDown className="h-3 w-3" />
                                </Button>
                            </div>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20"
                    >
                        Drafts
                    </Button>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 overflow-y-auto">
                    <div className="p-4 space-y-4">
                        {/* Text Input */}
                        <div className="space-y-2">
                            <TweetComposer
                                ref={textareaRef}
                                value={content}
                                onChange={setContent}
                                placeholder="What's happening?"
                                registerInserter={(fn) => {
                                    (window as any).__insertIntoTweet = fn;
                                }}
                            />

                            {/* Media Preview */}
                            {attachments.length > 0 && (
                                <div className="grid grid-cols-2 gap-2 mt-4">
                                    {attachments.map((att, idx) => (
                                        <div key={idx} className="relative group rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                                            {att.type && att.type?.startsWith('image/') ? (
                                                <img src={att.url} alt="attachment" className="w-full h-32 object-cover" />
                                            ) : att.type && att.type?.startsWith('video/') ? (
                                                <video src={att.url} className="w-full h-32 object-cover" muted />
                                            ) : (
                                                <img src={att.url} alt="GIF" className="w-full h-32 object-cover" />
                                            )}
                                            <button
                                                type="button"
                                                className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={() => removeAttachment(idx)}
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>



                    </div>
                </div>

                <div className="flex px-4 items-center justify-between">
                    {/* Left Actions */}
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
                            currentContent={content}
                            onApplyContent={setContent}
                        />
                    </div>

                    {/* Character Count */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <span className={`text-sm ${content?.length > 250 ? 'text-red-500' : 'text-gray-500'}`}>
                                {content?.length || 0} / 280
                            </span>
                            {content && (
                                <div className="flex items-center gap-1">
                                    <span className="text-green-600 text-sm">saved</span>
                                    <span className="text-green-600">✓</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Bottom Action Bar */}
                <div className="bg-gray-50 dark:bg-gray-800/50 p-4">
                    <div className="flex items-center justify-between">
                        {/* Left Side - Media Tools */}
                        <div className="flex items-center gap-3">
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
                            
                            {/* Add Tweet Button */}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={addThreadTweet}
                                className="bg-white hover:bg-gray-50 text-gray-700 border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                            >
                                <Plus className="h-4 w-4 mr-1" />
                                Add Tweet
                            </Button>
                        </div>

                        {/* Right Side - Actions */}
                        <div className="flex items-center gap-3">
                            {/* Preview */}
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                            >
                                <Globe className="h-4 w-4" />
                            </Button>

                            {/* Save Draft Button */}
                            {onSave && (
                                <div className="flex items-center">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleSave}
                                        disabled={isSaving}
                                        className="bg-gray-200 hover:bg-gray-300 text-gray-700 border-gray-300 rounded-l-md rounded-r-none px-3 py-1.5 text-sm focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                                    >
                                        {isSaving ? 'Saving...' : 'Save draft'}
                                    </Button>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="bg-gray-200 hover:bg-gray-300 text-gray-700 border-gray-300 border-l-0 rounded-l-none rounded-r-md px-2 py-1.5 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                                            >
                                                <ChevronDown className="h-3 w-3" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-48">
                                            <DropdownMenuItem onClick={handleSave}>
                                                <Calendar className="h-4 w-4 mr-2" />
                                                Save as draft
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setShowSchedule(true)}>
                                                <Calendar className="h-4 w-4 mr-2" />
                                                Schedule
                                            </DropdownMenuItem>
                                            {onPublish && (
                                                <DropdownMenuItem onClick={handlePublish}>
                                                    <Send className="h-4 w-4 mr-2" />
                                                    Publish
                                                </DropdownMenuItem>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Schedule Input */}
                    {showSchedule && onScheduleChange && (
                        <div className="mt-3 p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                            <div className="flex items-center gap-3">
                                <Calendar className="h-4 w-4 text-gray-500" />
                                <input
                                    type="datetime-local"
                                    className="flex-1 border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-0"
                                    value={scheduledAt ? new Date(scheduledAt).toISOString().slice(0, 16) : ''}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        onScheduleChange(val ? new Date(val).toISOString() : null);
                                    }}
                                />
                            </div>
                        </div>
                    )}
                </div>

            </DialogContent>
        </Dialog>
    );
}
