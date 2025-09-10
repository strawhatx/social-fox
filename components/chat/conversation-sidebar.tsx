import { useState } from 'react';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { 
  Plus, 
  MessageSquare, 
  MoreHorizontal, 
  Edit2, 
  Trash2,
  Sparkles,
  Menu,
  X
} from 'lucide-react';
import { Conversation } from '@/lib/copilot';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

interface ConversationSidebarProps {
  conversations: Conversation[];
  currentConversationId: string | null;
  onSelectConversation: (conversationId: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (conversationId: string) => void;
  onRenameConversation: (conversationId: string, newTitle: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function ConversationSidebar({
  conversations,
  currentConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  onRenameConversation,
  isCollapsed,
  onToggleCollapse
}: ConversationSidebarProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const handleStartEdit = (conversation: Conversation) => {
    setEditingId(conversation.id);
    setEditTitle(conversation.title);
  };

  const handleSaveEdit = () => {
    if (editingId && editTitle.trim()) {
      onRenameConversation(editingId, editTitle.trim());
    }
    setEditingId(null);
    setEditTitle('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  if (isCollapsed) {
    return (
      <div className="w-16 border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex flex-col">
        <div className="p-3 border-b">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            className="w-10 h-10"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="flex-1 flex flex-col items-center py-4 space-y-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onNewConversation}
            className="w-10 h-10"
          >
            <Plus className="h-5 w-5" />
          </Button>
          
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Social Fox</h2>
              <p className="text-xs text-muted-foreground">AI Post Co-Pilot</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <Button
          onClick={onNewConversation}
          className="w-full justify-start gap-2"
          variant="outline"
        >
          <Plus className="h-4 w-4" />
          New conversation
        </Button>
      </div>

      {/* Conversations List */}
      <ScrollArea className="flex-1 px-2">
        <div className="space-y-1 py-2">
          {conversations.map((conversation) => (
            <Card
              key={conversation.id}
              className={`group relative cursor-pointer transition-all hover:bg-accent/50 ${
                currentConversationId === conversation.id 
                  ? 'bg-accent border-accent-foreground/20' 
                  : 'border-transparent hover:border-border'
              }`}
              onClick={() => onSelectConversation(conversation.id)}
            >
              <div className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    {editingId === conversation.id ? (
                      <input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onBlur={handleSaveEdit}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveEdit();
                          if (e.key === 'Escape') handleCancelEdit();
                        }}
                        className="w-full bg-background border rounded px-2 py-1 text-sm"
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <>
                        <div className="flex items-center gap-2 mb-1">
                          <MessageSquare className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                          <h3 className="text-sm font-medium truncate">
                            {conversation.title}
                          </h3>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-muted-foreground">
                            {formatTime(conversation.updatedAt)}
                          </p>
                          {conversation.messages.length > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              {conversation.messages.length}
                            </Badge>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                  
                  {editingId !== conversation.id && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleStartEdit(conversation)}>
                          <Edit2 className="h-3 w-3 mr-2" />
                          Rename
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => onDeleteConversation(conversation.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-3 w-3 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>

      {/* Footer Stats */}
      <div className="p-4 border-t bg-muted/30">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Generated today</span>
            <Badge variant="outline">12</Badge>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Time saved</span>
            <Badge variant="outline">2.5h</Badge>
          </div>
        </div>
      </div>
    </div>
  );
}