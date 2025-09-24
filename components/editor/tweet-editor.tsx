"use client";

import { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, AtSign, Info } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { TweetComposer } from './tweet-composer';
import HashtagPicker from '@/components/editor/hashtag-picker';
import EmojiPicker from '@/components/editor/emoji-picker';
import GiphyPicker from '@/components/editor/giphy-picker';
import ImageUploader from '@/components/editor/image-uploader';
import SchedulePicker from '@/components/editor/schedule-picker';
import { Input } from '@/components/ui/input';
import { HoverCard, HoverCardTrigger, HoverCardContent } from '@/components/ui/hover-card';

interface TweetEditorProps {
    contentToLoad?: string;
}

export default function TweetEditor({ contentToLoad }: TweetEditorProps) {
    const [activeComposerTab, setActiveComposerTab] = useState<'compose' | 'drafts' | 'scheduled' | 'sent'>('compose');
    const [editedTweet, setEditedTweet] = useState('');
    const [isScheduled, setIsScheduled] = useState(false);
    const [attachments, setAttachments] = useState<{ url: string; file: File | null }[]>([]);
    const [communityUrl, setCommunityUrl] = useState('');

    // Handle content to load from chat
    useEffect(() => {
        if (contentToLoad) {
            setEditedTweet(contentToLoad);
            setActiveComposerTab('compose');
        }
    }, [contentToLoad]);

    // Real data state
    const [drafts, setDrafts] = useState<any[]>([]);
    const [scheduled, setScheduled] = useState<any[]>([]);
    const [loadingDrafts, setLoadingDrafts] = useState(false);
    const [loadingScheduled, setLoadingScheduled] = useState(false);

    // Fetch drafts from API
    const fetchDrafts = async () => {
        setLoadingDrafts(true);
        try {
            const response = await fetch('/api/content-posts?status=draft');
            if (response.ok) {
                const data = await response.json();
                setDrafts(data.data || []);
            }
        } catch (error) {
            console.error('Error fetching drafts:', error);
        } finally {
            setLoadingDrafts(false);
        }
    };

    // Fetch scheduled posts from API
    const fetchScheduled = async () => {
        setLoadingScheduled(true);
        try {
            const response = await fetch('/api/content-posts?status=scheduled');
            if (response.ok) {
                const data = await response.json();
                setScheduled(data.data || []);
            }
        } catch (error) {
            console.error('Error fetching scheduled posts:', error);
        } finally {
            setLoadingScheduled(false);
        }
    };

    // Fetch data when component mounts or when tabs change
    useEffect(() => {
        if (activeComposerTab === 'drafts') {
            fetchDrafts();
        } else if (activeComposerTab === 'scheduled') {
            fetchScheduled();
        }
    }, [activeComposerTab]);

    const handleScheduleConfirm = async (date: Date) => {
        if (!editedTweet.trim()) return;

        try {
            const response = await fetch('/api/content-posts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    content: editedTweet.trim(),
                    platform: 'x',
                    scheduled_at: date.toISOString(),
                    status: 'scheduled',
                    images: attachments.map(att => att.url),
                    communityUrl: communityUrl || null
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to schedule tweet');
            }

            setIsScheduled(true);
            toast({
                title: 'Scheduled',
                description: `Will post ${date.toLocaleString()}`
            });
            setEditedTweet("");
            // Refresh scheduled if we're on the scheduled tab
            if (activeComposerTab === 'scheduled') {
                fetchScheduled();
            }
        } catch (error) {
            console.error('Error scheduling tweet:', error);
            toast({
                title: "Error",
                description: "Failed to schedule tweet. Please try again.",
                variant: "destructive"
            });
        }
    };

    const handleSaveDraft = async () => {
        if (!editedTweet.trim()) return;

        try {
            const response = await fetch('/api/content-posts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    content: editedTweet.trim(),
                    platform: 'twitter',
                    status: 'draft'
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to save draft');
            }

            toast({
                title: "Draft saved!",
                description: "Your tweet has been saved as a draft."
            });
            setEditedTweet("");
            // Refresh drafts if we're on the drafts tab
            if (activeComposerTab === 'drafts') {
                fetchDrafts();
            }
        } catch (error) {
            console.error('Error saving draft:', error);
            toast({
                title: "Error",
                description: "Failed to save draft. Please try again.",
                variant: "destructive"
            });
        }
    };

    const addHashtag = () => {
        // Kept for manual insertion fallback
        setEditedTweet(prev => prev + " #");
    };

    const loadDraft = (draft: any) => {
        setEditedTweet(draft.content);
        setActiveComposerTab('compose');
        
        // Load attachments and community URL from draft metadata
        const metadata = draft.metadata || {};
        const images = metadata.images || [];
        const communityUrl = metadata.community_url;
        
        // Convert image URLs back to attachment format
        const attachments = images.map((url: string) => ({ url, file: null }));
        setAttachments(attachments);
        setCommunityUrl(communityUrl || '');
    };

    const loadScheduled = (scheduled: any) => {
        setEditedTweet(scheduled.content);
        setActiveComposerTab('compose');
        
        // Load attachments and community URL from scheduled metadata
        const metadata = scheduled.metadata || {};
        const images = metadata.images || [];
        const communityUrl = metadata.community_url;
        
        // Convert image URLs back to attachment format
        const attachments = images.map((url: string) => ({ url, file: null }));
        setAttachments(attachments);
        setCommunityUrl(communityUrl || '');
    };

    const handleInsertHashtag = (tag: string) => {
        const cleanTag = tag.startsWith('#') ? tag : `#${tag}`;
        const addition = (editedTweet.endsWith(' ') || editedTweet.length === 0) ? cleanTag : ` ${cleanTag}`;
        const next = editedTweet + addition;
        if (next.length > 280) {
            toast({
                title: "Too long",
                description: "Adding this hashtag would exceed 280 characters.",
            });
            return;
        }
        setEditedTweet(next);
    };

    return (
        <Tabs
            value={activeComposerTab}
            onValueChange={(value) => setActiveComposerTab(value as 'compose' | 'drafts' | 'scheduled' | 'sent')} className="space-y-3">
            <TabsList className="grid w-full grid-cols-4 bg-background border-b border-border rounded-none p-0 h-auto">
                <TabsTrigger
                    value="compose"
                    className="border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent rounded-none pb-2 text-xs"
                >
                    Compose
                </TabsTrigger>
                <TabsTrigger
                    value="drafts"
                    className="border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent rounded-none pb-2 text-xs"
                >
                    Drafts
                </TabsTrigger>
                <TabsTrigger
                    value="scheduled"
                    className="border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent rounded-none pb-2 text-xs"
                >
                    Scheduled
                </TabsTrigger>
            </TabsList>

            <TabsContent value="compose" className="space-y-3 mt-4">
                {/* Main Composer */}
                <div className="bg-muted/20 border-border shadow-sm">
                    <div className="flex flex-col gap-2 w-full mb-4">
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
                    </div>

                    <TweetComposer
                        value={editedTweet}
                        onChange={setEditedTweet}
                        placeholder={editedTweet ? "Add another tweet" : "Write here..."}
                    />


                    {/* Media and options */}
                    <div className="flex items-center justify-between">
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
                                    const next = urls.map((u, i) => ({ url: u, file: files[i] })).filter(Boolean as any);
                                    setAttachments((prev) => [...prev, ...next]);
                                }}
                                multiple
                            />

                            <GiphyPicker onSelect={(gifUrl) => {
                                // Add GIF as attachment (similar to image uploader)
                                const gifAttachment = { url: gifUrl, file: null }; // GIFs don't have File objects
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
                    <div className="grid grid-cols-3 gap-2">
                        {attachments.map((att, idx) => (
                            <div key={idx} className="relative group border border-border rounded-md overflow-hidden bg-muted/20">
                                {att.file && att.file.type.startsWith('image/') ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={att.url} alt="attachment" className="w-full h-24 object-cover" />
                                ) : att.file && att.file.type.startsWith('video/') ? (
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

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                    {/* Your content status */}
                    <div className="flex items-end gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="ml-auto text-xs"
                            disabled={!editedTweet.trim()}
                            onClick={handleSaveDraft}>
                            <Plus className="h-3 w-3 mr-1" />
                            Save draft
                        </Button>
                    </div>
                    <SchedulePicker
                        disabled={!editedTweet.trim()}
                        scheduledAt={isScheduled ? new Date() : undefined}
                        onConfirm={handleScheduleConfirm}
                    />
                </div>
            </TabsContent>

            <TabsContent value="drafts" className="space-y-2">
                {loadingDrafts ? (
                    <div className="text-center py-4">
                        <p className="text-sm text-muted-foreground">Loading drafts...</p>
                    </div>
                ) : drafts.length === 0 ? (
                    <div className="text-center py-4">
                        <p className="text-sm text-muted-foreground">No drafts found</p>
                    </div>
                ) : (
                    drafts.map((draft) => (
                        <Card key={draft.id} className="cursor-pointer hover:bg-accent transition-colors" onClick={() => loadDraft(draft)}>
                            <CardContent className="p-2">
                                <p className="text-xs">{draft.content}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Created: {new Date(draft.createdAt).toLocaleDateString()}
                                </p>
                            </CardContent>
                        </Card>
                    ))
                )}
            </TabsContent>

            <TabsContent value="scheduled" className="space-y-2">
                {loadingScheduled ? (
                    <div className="text-center py-4">
                        <p className="text-sm text-muted-foreground">Loading scheduled posts...</p>
                    </div>
                ) : scheduled.length === 0 ? (
                    <div className="text-center py-4">
                        <p className="text-sm text-muted-foreground">No scheduled posts found</p>
                    </div>
                ) : (
                    scheduled.map((item) => (
                        <Card key={item.id} className="cursor-pointer hover:bg-accent transition-colors" onClick={() => loadScheduled(item)}>
                            <CardContent className="p-2">
                                <p className="text-xs">{item.content}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Scheduled: {new Date(item.scheduledAt).toLocaleString()}
                                </p>
                            </CardContent>
                        </Card>
                    ))
                )}
            </TabsContent>
        </Tabs>
    );
}
