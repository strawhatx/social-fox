import SchedulePicker from "../editor/schedule-picker";
import { Clock } from "lucide-react";
import { ContentPost } from "@/lib/types/content_posts";

interface DayPostProps {
    posts: ContentPost[];
    isCurrentMonth: (date: Date) => boolean;
    isToday: (date: Date) => boolean;
    days: Date[];
    onSelectPost: (post: ContentPost) => void;
    handleAddPost: (date: Date) => void;
}

export default function PostGrid({ posts, isCurrentMonth, isToday, days, onSelectPost, handleAddPost }: DayPostProps) {
    
    const getStatusColor = (status: string) => status === 'posted' ? 'bg-emerald-600' : status === 'scheduled' ? 'bg-blue-600' : 'bg-amber-500';
    return (
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
    );
}