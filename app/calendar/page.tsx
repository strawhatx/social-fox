"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, GripVertical, Clock } from "lucide-react";
import SidebarLayout from "@/components/sidebar-layout";
import SubscriptionGuard from "@/components/subscription/subscription-guard";
import { useSchedulerPosts, } from "@/hooks/use-scheduler-posts";
import { ContentPost } from "@/lib/types/content_posts";
import PostGrid from "@/components/calendar/post-grid";
import ContentPlanDialog from "@/components/calendar/content-plan-dialog";
import TweetModal from "@/components/editor/tweet-modal";
import { toast } from "@/hooks/use-toast";
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCenter, rectIntersection } from "@dnd-kit/core";

interface ThreadTweet {
    id: number;
    content: string;
    attachments: any[];
}

interface DashboardProps {
    posts: ContentPost[];
    setPosts: React.Dispatch<React.SetStateAction<ContentPost[]>>;
    onExport: (audience: string, subject: string, tone: string, goals: string, mediaMode: 'text' | 'images' | 'gifs') => void;
    onMonthChange?: (month: number, year: number) => void;
}

function Dashboard({ posts, setPosts, onExport, onMonthChange }: DashboardProps) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [showTweetModal, setShowTweetModal] = useState(false);
    const [editingPost, setEditingPost] = useState<ContentPost | null>(null);
    const [activePost, setActivePost] = useState<ContentPost | null>(null);
    const today = new Date();

    const handleAddPost = async (scheduled: Date): Promise<void> => {
        try {
            const y = scheduled.getFullYear();
            const m = scheduled.getMonth();
            const d = scheduled.getDate();
            const h = scheduled.getHours();
            const conflict = posts.some((p) => {
                if (!p.scheduledAt) return false;
                const t = new Date(p.scheduledAt);
                return t.getFullYear() === y && t.getMonth() === m && t.getDate() === d && t.getHours() === h;
            });

            if (conflict) throw new Error('Post already exists at that hour');

            const response = await fetch('/api/content-posts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ scheduled_at: scheduled.toISOString() }),
            });

            if (!response.ok) {
                throw new Error(`Failed to add post: ${response.statusText} ${response.status}`);
            }

            const data = await response.json();
            const post = data.data as ContentPost;

            // Open modal with new post
            setEditingPost(post);
            setShowTweetModal(true);
        } catch (error) {
            console.error('Error adding post:', error);
            toast({
                title: "Error",
                description: "Failed to create new post",
                variant: "destructive"
            });
        }
    };

    const onSelectPost = (post: ContentPost) => {
        setEditingPost(post);
        setShowTweetModal(true);
    };

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        const postId = String(active.id);
        console.log('Drag start:', { postId, active: active.id });
        if (postId.startsWith('post-')) {
            const id = postId.replace('post-', '');
            const post = posts.find(p => p.id === id);
            console.log('Found post for drag:', { id, post: !!post });
            if (post) {
                setActivePost(post);
            }
        }
    };

    const getNextAvailableHour = (targetDate: Date) => {
        // Get all posts for the target date
        const dayPosts = posts.filter((p) => {
            if (!p.scheduledAt) return false;
            const t = new Date(p.scheduledAt);
            return t.getFullYear() === targetDate.getFullYear() &&
                t.getMonth() === targetDate.getMonth() &&
                t.getDate() === targetDate.getDate();
        });

        // Get all occupied hours
        const occupiedHours = new Set(
            dayPosts.map(p => {
                const scheduled = new Date(p.scheduledAt!);
                return scheduled.getHours();
            })
        );

        // Find next available hour (9 AM to 9 PM)
        for (let hour = 9; hour <= 21; hour++) {
            if (!occupiedHours.has(hour)) {
                return hour;
            }
        }

        // Default to 9 AM if all hours are taken
        return 9;
    };

    function handleDragEnd(event: any) {
        const { active, over } = event;
        setActivePost(null); // clear overlay

        if (!over) return;

        const postId = String(active.id).replace("post-", "");

        // Resolve target date robustly
        let targetDate: Date | null = null;
        const overId = String(over.id);
        const dataDate = over?.data?.current?.date as Date | undefined;
        if (dataDate instanceof Date) {
            targetDate = new Date(dataDate);
        } else if (overId.startsWith('day-')) {
            const dateStr = overId.replace('day-', '');
            const [y, m, d] = dateStr.split('-').map(Number);
            targetDate = new Date(y, (m || 1) - 1, d || 1);
        } else if (overId.startsWith('post-')) {
            const overPostId = overId.replace('post-', '');
            const overPost = posts.find(p => p.id === overPostId);
            if (overPost?.scheduledAt) {
                const dt = new Date(overPost.scheduledAt);
                targetDate = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
            }
        }

        if (!targetDate) return;

        // ✅ Call parent handler to update DB + local state
        onMovePost?.(postId, targetDate);
    }
    // ✅ Define the handler in the parent component
    const onMovePost = async (postId: string, newDate: Date) => {
        // Preserve the original time if present, else default to 9:00
        const original = posts.find(p => p.id === postId);
        const originalDt = original?.scheduledAt ? new Date(original.scheduledAt) : null;
        const hours = originalDt ? originalDt.getHours() : 9;
        const minutes = originalDt ? originalDt.getMinutes() : 0;

        const newScheduledAt = new Date(newDate);
        newScheduledAt.setHours(hours, minutes, 0, 0);

        // Optimistic update
        const prevScheduledAt = original?.scheduledAt;
        setPosts((prev: ContentPost[]) => prev.map(p => p.id === postId ? { ...p, scheduledAt: newScheduledAt.toISOString() } : p));

        try {
            const res = await fetch(`/api/content-posts/${postId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ scheduled_at: newScheduledAt.toISOString() }),
            });
            if (!res.ok) throw new Error('Failed to persist move');
        } catch (e) {
            // Revert on failure
            setPosts((prev: ContentPost[]) => prev.map(p => p.id === postId ? { ...p, scheduledAt: prevScheduledAt || p.scheduledAt } : p));
            toast({ title: 'Error', description: 'Failed to move post', variant: 'destructive' });
        }
    };


    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const dayNames = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    const firstDay = new Date(currentYear, currentMonth, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days: Date[] = [];
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 41);
    for (let day = new Date(startDate); day <= endDate; day.setDate(day.getDate() + 1)) {
        days.push(new Date(day));
    }

    const isToday = (date: Date) => date.toDateString() === today.toDateString();
    const isCurrentMonth = (date: Date) => date.getMonth() === currentMonth;
    const goToPreviousMonth = () => {
        const next = new Date(currentYear, currentMonth - 1, 1);
        setCurrentDate(next);
        onMonthChange?.(next.getMonth() + 1, next.getFullYear());
    };
    const goToNextMonth = () => {
        const next = new Date(currentYear, currentMonth + 1, 1);
        setCurrentDate(next);
        onMonthChange?.(next.getMonth() + 1, next.getFullYear());
    };

    return (
        <div className="p-6 max-w-none overflow-auto h-full">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <p className="text-gray-600">Plan and track your content.</p>
                </div>

                <ContentPlanDialog onGeneratePlan={onExport} />
            </div>

            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" onClick={goToPreviousMonth} className="p-2"><ChevronLeft className="w-4 h-4" /></Button>
                    <h2 className="text-xl font-medium text-gray-900 min-w-[200px] text-center">{monthNames[currentMonth]} {currentYear}</h2>
                    <Button variant="outline" size="sm" onClick={goToNextMonth} className="p-2"><ChevronRight className="w-4 h-4" /></Button>
                </div>
                <div className="text-sm text-gray-500">
                    {posts.filter(p => p.status === 'posted').length} published • {posts.filter(p => p.status === 'scheduled').length} scheduled • {posts.filter(p => p.status === 'draft').length} drafts
                </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="grid grid-cols-7 border-b border-gray-200">
                    {dayNames.map((day) => (
                        <div key={day} className="p-4 text-center">
                            <span className="text-sm font-medium text-gray-600">{day}</span>
                        </div>
                    ))}
                </div>

                <DndContext
                    collisionDetection={closestCenter}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                >
                    <PostGrid
                        posts={posts}
                        isCurrentMonth={isCurrentMonth}
                        isToday={isToday}
                        days={days}
                        onSelectPost={onSelectPost}
                        handleAddPost={handleAddPost}
                        onMovePost={onMovePost}
                    />

                    <DragOverlay>
                        {activePost ? (
                            <div className="text-xs text-white px-3 py-2 rounded-lg bg-blue-600 shadow-2xl border border-blue-400 transform rotate-2 scale-105">
                                <div className="flex items-center gap-2 mb-1">
                                    <GripVertical className="w-3 h-3 opacity-80" />
                                    {activePost.scheduledAt && (
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            <span className="opacity-90">
                                                {new Date(activePost.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div className="truncate font-medium max-w-[200px]">
                                    {Array.isArray(activePost.items) && activePost.items.length > 0 ? activePost.items[0].content : 'New post'}
                                </div>
                                <div className="text-xs opacity-75 mt-1">
                                    Moving to new date...
                                </div>
                            </div>
                        ) : null}
                    </DragOverlay>
                </DndContext>
            </div>

            <div className="flex items-center gap-6 mt-6 text-sm">
                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-emerald-600 rounded"></div><span className="text-gray-600">Published</span></div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-600 rounded"></div><span className="text-gray-600">Scheduled</span></div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-amber-500 rounded"></div><span className="text-gray-600">Draft</span></div>
            </div>

            {/* Tweet Modal */}
            <TweetModal
                isOpen={showTweetModal}
                onClose={() => {
                    setShowTweetModal(false);
                    setEditingPost(null);
                }}
                thread={editingPost?.items || [{ id: "1", postId: "1", parentId: null, metadata: {}, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), content: "", media: [] }]}
                onSave={async (threadTweets: ThreadTweet[]) => {
                    if (!editingPost) return;
                    try {
                        const response = await fetch(`/api/content-posts/${editingPost.id}`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                items: threadTweets.map(tweet => ({
                                    id: editingPost.items[0]?.id || '1',
                                    content: tweet.content,
                                    media: tweet.attachments.map((a: any) => ({ url: a.url, type: a.type, key: a.key })),
                                }))
                            }),
                        });
                        if (!response.ok) throw new Error('Failed to save post');
                        toast({
                            title: "Saved!",
                            description: "Your post has been saved"
                        });
                        // Refresh posts
                        onMonthChange?.(currentDate.getMonth() + 1, currentDate.getFullYear());
                    } catch (error) {
                        toast({
                            title: "Error",
                            description: "Failed to save post",
                            variant: "destructive"
                        });
                    }
                }}
            />
        </div>
    );
}

export default function CalendarPage() {
    const { items, setPosts, refetch, refetchForMonthYear } = useSchedulerPosts();

    const handleExport = async (audience: string, subject: string, tone: string, goals: string, mediaMode: 'text' | 'images' | 'gifs') => {
        const start = new Date();

        await fetch('/api/content-posts/bulk', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                startDate: start.toISOString(),
                audience,
                subject,
                tone,
                goals,
                mediaMode
            })
        });
        await refetch();
    };

    return (
        <SidebarLayout>
            <SubscriptionGuard>
                <Dashboard
                    posts={items}
                    setPosts={setPosts}
                    onExport={handleExport}
                    onMonthChange={(month, year) => refetchForMonthYear(month, year)}
                />
            </SubscriptionGuard>
        </SidebarLayout>
    );
}

