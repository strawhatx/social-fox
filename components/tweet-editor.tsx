"use client";

import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Textarea } from './ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './ui/select';
import { Plus, Image, Hash, AtSign, Smile, MoreHorizontal, ChevronDown } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { TweetComposer } from './tweet-composer';
import HashtagPicker from './hashtag-picker';
import EmojiPicker from './emoji-picker';
import ImageUploader from './image-uploader';
import SchedulePicker from './schedule-picker';
import { CommunitySearchPopover } from './community-search-popover';

export default function TweetEditor() {
    const [activeComposerTab, setActiveComposerTab] = useState<'compose' | 'drafts' | 'scheduled' | 'sent'>('compose');
    const [editedTweet, setEditedTweet] = useState('');
    const [isScheduled, setIsScheduled] = useState(false);
    const [selectedClient, setSelectedClient] = useState('personal');
    const [attachments, setAttachments] = useState<{ url: string; file: File }[]>([]);
    const [selectedCommunity, setSelectedCommunity] = useState<{ id: string; name: string; platform: string } | null>(null);

    const drafts = [
        "Working on something exciting... stay tuned! 👀",
        "The future of web development is",
        "Just discovered this amazing tool for"
    ];

    const scheduled = [
        { content: "🚀 Launching our new feature tomorrow!", time: "Jan 25th, 2025 9:00 AM" },
        { content: "Weekly tech tips thread coming up 🧵", time: "Jan 26th, 2025 2:00 PM" }
    ];

    const sent = [
        { content: "Happy Monday everyone! Let's make this week count 💪", time: "Jan 20th, 2025" },
        { content: "Just shipped a major update to our platform 🎉", time: "Jan 18th, 2025" }
    ];

    const handlePostNow = () => {
        if (!editedTweet.trim()) return;
        toast({
            title: "Tweet posted!",
            description: "Your tweet has been published successfully."
        });
        setEditedTweet("");
    };

    const handleAddToQueue = () => {
        if (!editedTweet.trim()) return;
        setIsScheduled(true);
    };

    const handleSave = () => {
        // no-op placeholder
    };

    const handleSchedule = () => {
        if (!editedTweet.trim()) return;
        toast({
            title: "Tweet scheduled!",
            description: "Your tweet has been added to the scheduler."
        });
        setEditedTweet("");
    };

    const addHashtag = () => {
        // Kept for manual insertion fallback
        setEditedTweet(prev => prev + " #");
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
                <TabsTrigger
                    value="sent"
                    className="border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent rounded-none pb-2 text-xs"
                >
                    Sent
                </TabsTrigger>
            </TabsList>

            <TabsContent value="compose" className="space-y-3 mt-4">
                {/* Your content status */}
                <div className="flex items-center gap-2">
                    <span className="text-muted-foreground text-sm">Your content</span>
                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                    </div>
                    <span className="text-muted-foreground text-sm">OK</span>
                    <Button variant="ghost" size="sm" className="ml-auto text-xs">
                        <Plus className="h-3 w-3 mr-1" />
                        New draft
                    </Button>
                </div>

                {/* Main Composer */}
                <div className="bg-muted/20 border-border shadow-sm">
                    <TweetComposer
                        value={editedTweet}
                        onChange={setEditedTweet}
                        placeholder={editedTweet ? "Add another tweet" : "Write here..."}
                        registerInserter={(fn) => {
                            // expose to closures below
                            (window as any).__insertIntoTweet = fn;
                        }}
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

                            <HashtagPicker
                                content={editedTweet || ""}
                                onInsert={handleInsertHashtag}
                                onAddManual={addHashtag}
                            />

                            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground h-7 w-7 p-0">
                                <AtSign className="h-3 w-3" />
                            </Button>

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
                                {att.file.type.startsWith('image/') ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={att.url} alt="attachment" className="w-full h-24 object-cover" />
                                ) : (
                                    <video src={att.url} className="w-full h-24 object-cover" muted />
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
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            disabled={!editedTweet.trim()}
                            onClick={handlePostNow}
                            className="text-sm"
                            size="sm"
                        >
                            Tweet now
                        </Button>
                        <SchedulePicker
                            disabled={!editedTweet.trim()}
                            scheduledAt={isScheduled ? new Date() : undefined}
                            onConfirm={(d) => {
                                setIsScheduled(true);
                                toast({ title: 'Scheduled', description: `Will post ${d.toLocaleString()}` });
                            }}
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <CommunitySearchPopover
                            onSelect={(c) => {
                                setSelectedCommunity(c);
                                toast({ title: 'Community selected', description: c.name });
                            }}
                        >
                            <Button variant="ghost" size="sm" className="text-sm">
                                Share to community
                            </Button>
                        </CommunitySearchPopover>
                        {selectedCommunity && (
                            <span className="text-xs text-muted-foreground">Selected: {selectedCommunity.name}</span>
                        )}
                    </div>
                </div>
            </TabsContent>

            <TabsContent value="drafts" className="space-y-2">
                {drafts.map((draft, index) => (
                    <Card key={index} className="cursor-pointer hover:bg-accent transition-colors">
                        <CardContent className="p-2">
                            <p className="text-xs">{draft}</p>
                        </CardContent>
                    </Card>
                ))}
            </TabsContent>

            <TabsContent value="scheduled" className="space-y-2">
                {scheduled.map((item, index) => (
                    <Card key={index} className="cursor-pointer hover:bg-accent transition-colors">
                        <CardContent className="p-2">
                            <p className="text-xs">{item.content}</p>
                            <p className="text-xs text-muted-foreground mt-1">{item.time}</p>
                        </CardContent>
                    </Card>
                ))}
            </TabsContent>

            <TabsContent value="sent" className="space-y-2">
                {sent.map((item, index) => (
                    <Card key={index} className="cursor-pointer hover:bg-accent transition-colors">
                        <CardContent className="p-2">
                            <p className="text-xs">{item.content}</p>
                            <p className="text-xs text-muted-foreground mt-1">{item.time}</p>
                        </CardContent>
                    </Card>
                ))}
            </TabsContent>
        </Tabs>
    );
}
