"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import SidebarLayout from "@/components/sidebar-layout";
import SubscriptionGuard from "@/components/subscription/subscription-guard";
import { useSchedulerPosts, type SchedulerItem } from "@/hooks/use-scheduler-posts";

type CalendarPost = {
    id: string;
    date: Date;
    content: string;
    status: 'draft' | 'scheduled' | 'posted' | 'archived' | 'published';
};

interface DashboardProps {
    posts: CalendarPost[];
    onExport: () => void;
}

function Dashboard({ posts, onExport }: DashboardProps) {
    const router = useRouter();
    const [currentDate, setCurrentDate] = useState(new Date());
    const today = new Date();

    const newPost: CalendarPost = {
        id: 'new',
        date: new Date(today.getFullYear(), today.getMonth(), 1),
        content: '',
        status: 'draft'
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

    const getPostsForDate = (date: Date) => posts.filter(p => p.date && p.date.toDateString() === date.toDateString());
    const getStatusColor = (status: string) => status === 'posted' || status === 'published' ? 'bg-emerald-600' : status === 'scheduled' ? 'bg-blue-600' : 'bg-amber-500';
    const isToday = (date: Date) => date.toDateString() === today.toDateString();
    const isCurrentMonth = (date: Date) => date.getMonth() === currentMonth;
    const goToPreviousMonth = () => setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
    const goToNextMonth = () => setCurrentDate(new Date(currentYear, currentMonth + 1, 1));

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
                    {posts.filter(p => p.status === 'posted' || p.status === 'published').length} published • {posts.filter(p => p.status === 'scheduled').length} scheduled • {posts.filter(p => p.status === 'draft').length} drafts
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
                    {days.map((date, index) => {
                        const dayPosts = getPostsForDate(date);
                        const isCurrentMonthDay = isCurrentMonth(date);
                        const isTodayDate = isToday(date);
                        return (
                            <div key={index} className={`min-h-[120px] border-r border-b border-gray-100 p-3 ${!isCurrentMonthDay ? 'bg-gray-50' : 'bg-white'} hover:bg-gray-50 transition-colors`}>
                                <div className="flex items-center justify-between mb-2">
                                    <span className={`text-sm font-medium ${isTodayDate ? 'bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center' : isCurrentMonthDay ? 'text-gray-900' : 'text-gray-400'}`}>{date.getDate()}</span>
                                </div>
                                <div className="space-y-1">
                                    {dayPosts.map((post) => (
                                        <div key={post.id} className={`text-xs text-white px-2 py-1 rounded-md cursor-pointer hover:opacity-80 transition-opacity ${getStatusColor(post.status)}`} onClick={() => router.push(`/editor/${post.id}`)} title={`${post.content}`}>
                                            <div className="truncate font-medium">{post.content}</div>
                                        </div>
                                    ))}
                                    {dayPosts.length === 0 && isCurrentMonthDay && (
                                        <div
                                            className="text-xs text-gray-400 hover:text-gray-600 cursor-pointer py-1 px-2 rounded border border-dashed border-gray-300 hover:border-gray-400 transition-colors"
                                            onClick={() => router.push(`/editor/new`)}>
                                            + Add post
                                        </div>
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
    const { items, refetch, update } = useSchedulerPosts();
    const posts: CalendarPost[] = useMemo(() => {
        return (items || [])
            .filter((it) => !!it.scheduledTime)
            .map((it) => ({ id: it.id, date: new Date(it.scheduledTime as string), content: it.content, status: it.status as any }));
    }, [items]);

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
                <Dashboard posts={posts} onExport={handleExport} />
            </SubscriptionGuard>
        </SidebarLayout>
    );
}

