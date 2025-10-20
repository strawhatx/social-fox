"use client";

import { useState, useRef, useEffect } from "react";
import SidebarLayout from "@/components/sidebar-layout";
import SubscriptionGuard from "@/components/subscription/subscription-guard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { MessageSquarePlus, Copy, Save } from "lucide-react";
import TweetEditor from "@/components/editor/tweet-editor";
import { AttachmentItem } from "@/lib/types/attachments";
import { useParams } from "next/navigation";
import TweetPreview from "@/components/editor/tweet-preview";
import { ContentPostItem } from "@/lib/types/content_posts";

interface Thread {
  id: string;
  content: string;
  attachments: AttachmentItem[];
}

export default function EditorPage() {
  const [activeTab, setActiveTab] = useState<"preview" | "data" | "outline">("preview");
  const params = useParams();
  const [scheduledAt, setScheduledAt] = useState<string | null>(null);
  const [thread, setThread] = useState<Array<Thread>>([
    {id: '1', content: '', attachments: []},
  ]);

  // Fetch best time to post on mount
  useEffect(() => {
    const fetchPost = async () => {
      const res = await fetch(`/api/content-posts/${encodeURIComponent(params.id as string)}`);
      const data = await res.json();

      setScheduledAt(data.data.scheduledAt);
      setThread(data.data.items.map((item: ContentPostItem) => ({
        id: item.id,
        content: item.content,
        attachments: item.media,
      })));
    };

    fetchPost();
    
  }, []);


  const addNewEditor = () => {
    const newEditorId = `editor-${thread.length + 1}`;
    setThread([...thread, { id: newEditorId, content: '', attachments: [] }]);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(thread.map((post) => post.content).join('\n'));
  };

  const handleSave = async () => {
    try {
      const url = `/api/content-posts/${encodeURIComponent(params.id as string)}`;
      const method = 'PATCH';
      const body: any = {};
      if (scheduledAt) body.scheduled_at = scheduledAt;
      
      body.items = thread.map((post) => ({
        id: post.id,
        content: post.content,
        media: post.attachments.map((a) => ({ url: a.url, type: a.type, key: a.key })),
      }));

      const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!response.ok) throw new Error('Failed to save');

      const keys = thread.flatMap((item) => (item.attachments || []).map((a) => a.key).filter(Boolean) as string[]);
      if (keys.length) {
        await Promise.all(keys.map((key) => fetch('/api/s3/finalize', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ key }),
        })));
      }
    } catch (error) {
      console.error('Error saving thread:', error);
    }
  };

  return (
    <SidebarLayout header={{
      page: 'Editor',
      left_content:
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
          >
            <Copy className="w-4 h-4 mr-2" />
            Copy
          </Button>
          <Button variant="ghost" size="sm">
            Remake
          </Button>
          <Button
            size="sm"
            className="bg-black hover:bg-black/90 text-white"
            onClick={handleSave}
          >
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
        </div>
    }}>
      <SubscriptionGuard>
        <div className="min-h-screen bg-white flex">
          <div className="flex-1 pt-4 pb-8 overflow-y-auto">
            <div className="px-12 mb-4 flex items-center gap-3">
              <label className="text-sm text-gray-600">Scheduled at</label>
              <input
                type="datetime-local"
                className="border border-gray-300 rounded px-2 py-1 text-sm"
                value={scheduledAt ? new Date(scheduledAt).toISOString().slice(0,16) : ''}
                onChange={(e) => {
                  const val = e.target.value;
                  setScheduledAt(val ? new Date(val).toISOString() : null);
                }}
              />
            </div>
            {thread.map((post) => (
              <TweetEditor
                key={post.id}
                content={post.content}
                setContent={(content) => setThread(thread.map((e) => e.id === post.id ? { ...e, content } : e))}
                attachments={post.attachments}
                setAttachments={(attachments) => setThread(thread.map((e) => e.id === post.id ? { ...e, attachments } : e))}
              />
            ))}

            <div className="flex justify-center px-12">
              <Button
                variant="outline"
                size="sm"
                onClick={addNewEditor}
                className="w-full border-dashed border-2 hover:border-orange-500 hover:text-orange-500 hover:bg-orange-50 py-6"
              >
                <MessageSquarePlus className="w-5 h-5 mr-2" />
                Add another tweet to thread
              </Button>
            </div>

          </div>

          <div className="w-80 border-l border-border/50 bg-gray-50/50 pt-4 overflow-y-auto">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="h-full">
              <div className="px-4 py-3 bg-white border-b border-border/50">
                <TabsList className="w-full bg-gray-100">
                  <TabsTrigger value="preview" className="text-xs w-full">PREVIEW</TabsTrigger>
                </TabsList>
              </div>
              <div className="p-4 space-y-4">
                <TabsContent value="preview" className="mt-0 space-y-4">
                  {thread.map((post) => (
                    <TweetPreview
                      key={post.id}
                      content={post.content}
                      attachments={post.attachments}
                    />
                  ))}
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </SubscriptionGuard>
    </SidebarLayout>
  );
}