"use client";

import { useState, useRef, useEffect } from "react";
import SidebarLayout from "@/components/sidebar-layout";
import SubscriptionGuard from "@/components/subscription/subscription-guard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Link as LinkIcon, Twitter, TrendingUp, Hash, FileText, MessageSquarePlus, Copy, Save } from "lucide-react";
import TweetEditor from "@/components/editor/tweet-editor";
import { AttachmentItem } from "@/lib/types/attachments";
import TweetPreview from "@/components/editor/tweet-preview";
import { getBestTimeToPost } from '@/lib/ai';

export default function EditorPage() {
  const [activeTab, setActiveTab] = useState<"preview" | "data" | "outline">("preview");
  const [bestTime, setBestTime] = useState<string>('');

  // Fetch best time to post on mount
  useEffect(() => {
    async function fetchBestTime() {
      const result = await getBestTimeToPost();
      setBestTime(result.time);
    }
    fetchBestTime();
  }, []);

  const [thread, setThread] = useState<Array<{ id: string; content: string; attachments: AttachmentItem[] }>>([
    { id: 'editor-1', content: '', attachments: [] }
  ]);

  const addNewEditor = () => {
    const newEditorId = `editor-${thread.length + 1}`;
    setThread([...thread, { id: newEditorId, content: '', attachments: [] }]);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(thread.map((post) => post.content).join('\n'));
  };

  const handleSave = () => {
    console.log('save');
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