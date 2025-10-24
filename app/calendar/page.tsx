"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import SidebarLayout from "@/components/sidebar-layout";
import SubscriptionGuard from "@/components/subscription/subscription-guard";
import { useSchedulerPosts, } from "@/hooks/use-scheduler-posts";
import { ContentPost } from "@/lib/types/content_posts";
import PostGrid from "@/components/calendar/post-grid";
import ContentPlanDialog from "@/components/calendar/content-plan-dialog";
import TweetModal from "@/components/editor/tweet-modal";
import { toast } from "@/hooks/use-toast";

interface DashboardProps {
    posts: ContentPost[];
    onExport: (audience: string, subject: string, tone: string, goals: string) => void;
    onMonthChange?: (month: number, year: number) => void;
}

function Dashboard({ posts, onExport, onMonthChange }: DashboardProps) {
    const router = useRouter();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [showTweetModal, setShowTweetModal] = useState(false);
    const [editingPost, setEditingPost] = useState<ContentPost | null>(null);
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

                <PostGrid 
                    posts={posts} 
                    isCurrentMonth={isCurrentMonth} 
                    isToday={isToday} 
                    days={days} 
                    onSelectPost={onSelectPost} 
                    handleAddPost={handleAddPost} 
                />
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
                initialContent={editingPost?.items?.[0]?.content || ""}
                initialAttachments={editingPost?.items?.[0]?.media || []}
                onSave={async (content: string, attachments: any[]) => {
                    if (!editingPost) return;
                    try {
                        const response = await fetch(`/api/content-posts/${editingPost.id}`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                items: [{
                                    id: editingPost.items[0]?.id || '1',
                                    content,
                                    media: attachments.map((a: any) => ({ url: a.url, type: a.type, key: a.key })),
                                }]
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
                onPublish={async (content: string, attachments: any[]) => {
                    if (!editingPost) return;
                    try {
                        // Save the post first
                        await fetch(`/api/content-posts/${editingPost.id}`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                items: [{
                                    id: editingPost.items[0]?.id || '1',
                                    content,
                                    media: attachments.map((a: any) => ({ url: a.url, type: a.type, key: a.key })),
                                }]
                            }),
                        });
                        
                        // Publish the post
                        const publishResponse = await fetch(`/api/content-posts/${editingPost.id}/publish`, {
                            method: 'POST',
                        });
                        
                        if (!publishResponse.ok) throw new Error('Failed to publish post');
                        
                        toast({
                            title: "Published!",
                            description: "Your post has been published"
                        });
                        
                        setShowTweetModal(false);
                        setEditingPost(null);
                        // Refresh posts
                        onMonthChange?.(currentDate.getMonth() + 1, currentDate.getFullYear());
                    } catch (error) {
                        toast({
                            title: "Error",
                            description: "Failed to publish post",
                            variant: "destructive"
                        });
                    }
                }}
            />
        </div>
    );
}

export default function CalendarPage() {
    const { items, refetch, refetchForMonthYear } = useSchedulerPosts();



    const handleExport = async (audience: string, subject: string, tone: string, goals: string) => {
        const start = new Date();

        await fetch('/api/content-posts/bulk', { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify({ 
                startDate: start.toISOString(), 
                audience, 
                subject,
                tone,
                goals
            }) 
        });
        await refetch();
    };

    return (
        <SidebarLayout>
            <SubscriptionGuard>
                <Dashboard
                    posts={items}
                    onExport={handleExport}
                    onMonthChange={(month, year) => refetchForMonthYear(month, year)}
                />
            </SubscriptionGuard>
        </SidebarLayout>
    );
}

