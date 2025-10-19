"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import SidebarLayout from "@/components/sidebar-layout";
import SubscriptionGuard from "@/components/subscription/subscription-guard";
import { useSchedulerPosts, } from "@/hooks/use-scheduler-posts";
import { ContentPost } from "@/lib/types/content_posts";
import SchedulePicker from "@/components/editor/schedule-picker";

interface DashboardProps {
    posts: ContentPost[];
    onExport: () => void;
    onMonthChange?: (month: number, year: number) => void;
}

function Dashboard({ posts, onExport, onMonthChange }: DashboardProps) {
    const router = useRouter();
    const [currentDate, setCurrentDate] = useState(new Date());
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

            router.push(`/editor/${post.id}`);
        } catch (error) {
            console.error('Error adding post:', error);
        }
    };

    const onSelectPost = (post: ContentPost) => {
        router.push(`/editor/${post.id}`);
    };

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const dayNames = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days: Date[] = [];
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 41);
    for (let day = new Date(startDate); day <= endDate; day.setDate(day.getDate() + 1)) {
        days.push(new Date(day));
    }

    const getStatusColor = (status: string) => status === 'posted' ? 'bg-emerald-600' : status === 'scheduled' ? 'bg-blue-600' : 'bg-amber-500';
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
                <Button className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg shadow-sm" onClick={onExport}>
                    <Plus className="w-4 h-4 mr-2" />
                    Generate 30 Day Plan
                </Button>
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
                <div className="grid grid-cols-7">
                    {days.map((date: Date, index: number) => {
                        const dayPosts = posts.filter((p) => {
                            if (!p.scheduledAt) return false;
                            const t = new Date(p.scheduledAt);
                            return t.getFullYear() === date.getFullYear() && t.getMonth() === date.getMonth() && t.getDate() === date.getDate();
                        });
                        const isCurrentMonthDay = isCurrentMonth(date);
                        const isTodayDate = isToday(date);
                        return (
                            <div
                                key={index}
                                className={`min-h-[120px] border-r border-b border-gray-100 p-3 ${!isCurrentMonthDay ? 'bg-gray-50' : 'bg-white'
                                    } hover:bg-gray-50 transition-colors`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span
                                        className={`text-sm font-medium ${isTodayDate
                                                ? 'bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center'
                                                : isCurrentMonthDay
                                                    ? 'text-gray-900'
                                                    : 'text-gray-400'
                                            }`}
                                    >
                                        {date.getDate()}
                                    </span>
                                </div>

                                {/* Posts for this day */}
                                <div className="space-y-1">
                                    {dayPosts.map((post) => {
                                        const scheduled = post.scheduledAt ? new Date(post.scheduledAt) : null;
                                        const timeLabel = scheduled ? scheduled.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
                                        const preview = Array.isArray(post.items) && post.items.length > 0 ? post.items[0].content : 'New post';
                                        return (
                                            <div
                                                key={post.id}
                                                className={`text-xs text-white px-2 py-1.5 rounded-md cursor-pointer hover:opacity-80 transition-opacity ${getStatusColor(post.status)}`}
                                                onClick={() => onSelectPost(post)}
                                                title={`${timeLabel} ${preview}`.trim()}
                                            >
                                                {timeLabel && (
                                                    <div className="flex items-center gap-1 mb-0.5">
                                                        <Clock className="w-3 h-3" />
                                                        <span className="opacity-90">{timeLabel}</span>
                                                    </div>
                                                )}
                                                <div className="truncate font-medium">
                                                    {preview}
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {/* Add post - uses SchedulePicker */}
                                    {isCurrentMonthDay && (
                                        <SchedulePicker
                                            scheduledAt={date}
                                            onConfirm={(dt) => handleAddPost(dt)}
                                        />
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="flex items-center gap-6 mt-6 text-sm">
                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-emerald-600 rounded"></div><span className="text-gray-600">Published</span></div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-600 rounded"></div><span className="text-gray-600">Scheduled</span></div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-amber-500 rounded"></div><span className="text-gray-600">Draft</span></div>
            </div>
        </div>
    );
}

export default function CalendarPage() {
    const { items, refetch, refetchForMonthYear } = useSchedulerPosts();



    const handleExport = async () => {
        const start = new Date();
        const itemsPayload = Array.from({ length: 30 }).map((_, i) => {
            const d = new Date(start); d.setDate(d.getDate() + i); d.setHours(9, 0, 0, 0);
            return { content: `Post ${i + 1}`, scheduled_at: d.toISOString() };
        });
        await fetch('/api/content-posts/bulk', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items: itemsPayload }) });
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

