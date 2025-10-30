import { Clock, Plus, GripVertical, Trash2 } from "lucide-react";
import { ContentPost } from "@/lib/types/content_posts";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

interface DayPostProps {
    posts: ContentPost[];
    isCurrentMonth: (date: Date) => boolean;
    isToday: (date: Date) => boolean;
    days: Date[];
    onSelectPost: (post: ContentPost) => void;
    handleAddPost: (date: Date) => void;
    onMovePost?: (postId: string, newDate: Date, newHour?: number) => void;
    onDeletePost: (postId: string) => void;
}

interface DraggablePostProps {
    post: ContentPost;
    onSelectPost: (post: ContentPost) => void;
    getStatusColor: (status: string) => string;
    onDeletePost: (postId: string) => void;
}

function DraggablePost({ post, onSelectPost, getStatusColor, onDeletePost }: DraggablePostProps) {
    const postId = `post-${post.id}`;
    console.log('DraggablePost setup:', { postId, post: post.id });
    const isPosted = post.status === 'posted';
    
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        isDragging,
    } = useDraggable({
        id: postId,
        data: {
            post,
        },
        disabled: isPosted,
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        opacity: isDragging || isPosted ? 0.5 : 1,
    };

    const scheduled = post.scheduledAt ? new Date(post.scheduledAt) : null;
    const timeLabel = scheduled ? scheduled.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
    const preview = Array.isArray(post.items) && post.items.length > 0 ? post.items[0].content : 'New post';

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`relative text-xs text-white px-2 py-1.5 rounded-md transition-all duration-200 ${getStatusColor(post.status)} ${
                isDragging ? 'z-50 scale-105 shadow-lg' : isPosted ? 'cursor-not-allowed' : 'hover:scale-105 cursor-grab active:cursor-grabbing'
            }`}
            onClick={(e) => {
                if (isDragging || isPosted) return; // don't open editor after a drag or when disabled
                e.stopPropagation();
                onSelectPost(post);
            }}
            title={`${timeLabel} ${preview}`.trim()}
        >
            {/* Delete button */}
            {!isPosted && (
                <button
                    type="button"
                    aria-label="Delete post"
                    className="absolute top-1 right-1 p-1 rounded hover:bg-white/20 focus:outline-none"
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('Delete this post?')) {
                            onDeletePost(String(post.id));
                        }
                    }}
                >
                    <Trash2 className="w-3 h-3 opacity-90" />
                </button>
            )}
            <div className="flex items-center gap-1 mb-0.5">
                {timeLabel && (
                    <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span className="opacity-90">{timeLabel}</span>
                    </div>
                )}
            </div>
            <div className="truncate font-medium">
                {preview}
            </div>
        </div>
    );
}

interface DroppableCellProps {
    date: Date;
    isCurrentMonthDay: boolean;
    isTodayDate: boolean;
    dayPosts: ContentPost[];
    onSelectPost: (post: ContentPost) => void;
    handleAddPost: (date: Date) => void;
    getStatusColor: (status: string) => string;
    onMovePost?: (postId: string, newDate: Date, newHour?: number) => void;
    onDeletePost: (postId: string) => void;
}

function DroppableCell({ 
    date, 
    isCurrentMonthDay, 
    isTodayDate, 
    dayPosts, 
    onSelectPost, 
    handleAddPost, 
    getStatusColor,
    onMovePost,
    onDeletePost
}: DroppableCellProps) {
    // Create a consistent date string that avoids timezone issues
    const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const dayId = `day-${dateString}`;
    // Determine if this day is in the past (by day, ignoring time)
    const now = new Date();
    const today0 = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const date0 = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const isPastDay = date0 < today0;
    
    console.log('DroppableCell setup:', { 
        date: date.toLocaleDateString(), 
        dateString, 
        dayId,
        isCurrentMonthDay 
    });
    
    const { isOver, setNodeRef } = useDroppable({
        id: dayId,
        data: {
            date,
        },
        disabled: isPastDay,
    });

    return (
        <div
            ref={setNodeRef}
            className={`min-h-[120px] border-r border-b border-gray-100 p-3 relative ${
                !isCurrentMonthDay ? 'bg-gray-50' : isPastDay ? 'bg-gray-50' : 'bg-white'
            } ${isPastDay ? 'opacity-80' : 'hover:bg-gray-50'} transition-all duration-200 ${
                isOver ? 'bg-orange-50 border-orange-300 border-2 shadow-inner' : ''
            }`}
        >
            {/* Drop zone indicator */}
            {isOver && (
                <div className="absolute inset-0 border-2 border-dashed border-orange-300 bg-orange-50 bg-opacity-50 rounded-md flex items-center justify-center">
                    <div className="text-orange-600 text-sm font-medium">
                        Drop post here
                    </div>
                </div>
            )}

            <div className="flex items-center justify-between mb-2">
                <span
                    className={`text-sm font-medium ${
                        isTodayDate
                            ? 'bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center'
                            : isPastDay
                                ? 'text-gray-400'
                                : isCurrentMonthDay
                                    ? 'text-gray-900'
                                    : 'text-gray-400'
                    }`}
                >
                    {date.getDate()}
                </span>
                {dayPosts.length > 0 && (
                    <div className="ml-auto flex items-center gap-1.5">
                        {dayPosts.slice(0, 5).map((p) => (
                            <span
                                key={p.id}
                                className={`inline-block h-2 w-3 rounded-sm ${getStatusColor(p.status)}`}
                                title={p.status}
                            />
                        ))}
                        {dayPosts.length > 5 && (
                            <span className="text-[10px] text-gray-500">+{dayPosts.length - 5}</span>
                        )}
                    </div>
                )}
            </div>

            {/* Posts for this day */}
            <div className="space-y-1">
                {dayPosts.map((post) => (
                    <DraggablePost
                        key={post.id}
                        post={post}
                        onSelectPost={onSelectPost}
                        getStatusColor={getStatusColor}
                        onDeletePost={onDeletePost}
                    />
                ))}

                {/* Add post button */}
                {isCurrentMonthDay && !isPastDay && (
                    <button
                        onClick={() => handleAddPost(date)}
                        className="w-full text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 px-2 py-1.5 rounded-md transition-colors flex items-center gap-1"
                        title="Add new post"
                    >
                        <Plus className="w-3 h-3" />
                        Add post
                    </button>
                )}
            </div>
        </div>
    );
}

export default function PostGrid({ posts, isCurrentMonth, isToday, days, onSelectPost, handleAddPost, onMovePost, onDeletePost }: DayPostProps) {
    
    const getStatusColor = (status: string) => status === 'posted' ? 'bg-emerald-600' : status === 'scheduled' ? 'bg-orange-500' : 'bg-amber-500';
    
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
                    <DroppableCell
                        key={index}
                        date={date}
                        isCurrentMonthDay={isCurrentMonthDay}
                        isTodayDate={isTodayDate}
                        dayPosts={dayPosts}
                        onSelectPost={onSelectPost}
                        handleAddPost={handleAddPost}
                        getStatusColor={getStatusColor}
                        onMovePost={onMovePost}
                        onDeletePost={onDeletePost}
                    />
                );
            })}
        </div>
    );
}