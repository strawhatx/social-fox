"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import SidebarLayout from "@/components/sidebar-layout";
import SubscriptionGuard from "@/components/subscription/subscription-guard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  List,
  ListOrdered,
  Link as LinkIcon,
  Image as ImageIcon,
  Table,
  Undo,
  Redo,
  MoreHorizontal,
  Copy,
  Twitter,
  TrendingUp,
  Hash,
  Type,
  FileText,
  Save,
  X as CloseIcon,
  Upload,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import TweetEditor from "@/components/editor/tweet-editor";

export default function EditorPage() {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [activeTab, setActiveTab] = useState<"preview" | "data" | "outline">("preview");
  const [uploadedPreviews, setUploadedPreviews] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const characterCount = content.length;
  const maxCharacters = 280;
  const words = content.split(/\s+/).filter(Boolean).length;
  const hashtags = (content.match(/#\w+/g) || []).length;
  const mentions = (content.match(/@\w+/g) || []).length;
  const lines = content.split("\n").length;

  const handleCopy = () => { navigator.clipboard.writeText(content); toast({ title: "Copied!", description: "Content copied" }); };

  const pushPreview = (file: File, dataUrl: string) => {
    setUploadedPreviews((prev) => [...prev, dataUrl]);
    setSelectedFiles((prev) => [...prev, file]);
  };

  const handleImageUpload = (files: FileList | null) => {
    if (!files) return;
    const list = Array.from(files);

    // Validate: one gif OR one video OR up to 4 images
    const isVideo = (t: string) => t.startsWith("video/");
    const isGif = (t: string) => t === "image/gif" || t.endsWith("/gif");
    const isImage = (t: string) => t.startsWith("image/") && !isGif(t);

    const incomingGif = list.find((f) => isGif(f.type));
    const incomingVideo = list.find((f) => isVideo(f.type));
    const incomingImages = list.filter((f) => isImage(f.type));

    if (incomingGif || incomingVideo) {
      if (selectedFiles.length > 0) { toast({ title: "Limit", description: "Remove existing attachments before adding a GIF/Video" }); return; }
      const f = incomingGif || incomingVideo!;
      const reader = new FileReader();
      reader.onload = (e) => { if (e.target?.result) pushPreview(f, String(e.target.result)); };
      reader.readAsDataURL(f);
      return;
    }

    const currentImages = selectedFiles.filter((f) => isImage(f.type)).length;
    const remaining = Math.max(0, 4 - currentImages);
    const allowed = incomingImages.slice(0, remaining);
    if (allowed.length < incomingImages.length) { toast({ title: "Image limit", description: "Up to 4 images." }); }
    allowed.forEach((f) => { const reader = new FileReader(); reader.onload = (e) => { if (e.target?.result) pushPreview(f, String(e.target.result)); }; reader.readAsDataURL(f); });
  };

  const removeImage = (index: number) => {
    setUploadedPreviews((prev) => prev.filter((_, i) => i !== index));
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    toast({ title: "Removed", description: "Attachment removed" });
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => { setIsDragging(false); };
  const handleDrop = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); handleImageUpload(e.dataTransfer.files); };

  const handleSave = async () => {
    if (!content.trim()) { toast({ title: "Add content", description: "Write something first" }); return; }
    try {
      // multipart upload to /api/content-posts
      const form = new FormData();
      form.append('content', content.trim());
      form.append('platform', 'twitter');
      form.append('status', 'draft');
      form.append('scheduled_at', '');
      form.append('communityUrl', '');
      form.append('attachments', JSON.stringify([]));
      selectedFiles.forEach((f) => form.append('files', f));

      const res = await fetch('/api/content-posts', { method: 'POST', body: form });
      if (!res.ok) throw new Error('Save failed');
      toast({ title: "Saved", description: "Draft created" });
      setContent("");
      setUploadedPreviews([]);
      setSelectedFiles([]);
    } catch (e: any) {
      toast({ title: "Error", description: e?.message || 'Failed to save' });
    }
  };

  return (
    <SidebarLayout>
      <SubscriptionGuard>
        <div className="min-h-screen bg-white flex">
          
          <div className="flex-1 pt-14 pb-8 overflow-y-auto">
            <TweetEditor contentToLoad={content} persistKey="editor-page" />
          </div>

          <div className="w-80 border-l border-border/50 bg-gray-50/50 pt-14 overflow-y-auto">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="h-full">
              <div className="px-4 py-3 bg-white border-b border-border/50">
                <TabsList className="w-full grid grid-cols-3 bg-gray-100">
                  <TabsTrigger value="preview" className="text-xs">PREVIEW</TabsTrigger>
                  <TabsTrigger value="data" className="text-xs">DATA</TabsTrigger>
                  <TabsTrigger value="outline" className="text-xs">OUTLINE</TabsTrigger>
                </TabsList>
              </div>
              <div className="p-4 space-y-4">
                <TabsContent value="preview" className="mt-0 space-y-4">
                  <Card className="p-4 bg-white">
                    <h4 className="text-sm mb-3">X/Twitter Preview</h4>
                    <div className="border border-border rounded-lg p-3 bg-white">
                      <div className="flex gap-2 mb-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1 text-sm mb-1"><span>Your Name</span><span className="text-muted-foreground text-xs">@yourhandle · now</span></div>
                          <p className="text-sm whitespace-pre-wrap break-words mb-2">{content || (<span className="text-muted-foreground">Your post will appear here...</span>)}</p>
                          {uploadedPreviews.length > 0 && (
                            <div className={`grid gap-1 mt-2 rounded-lg overflow-hidden ${uploadedPreviews.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
                              {uploadedPreviews.map((img, index) => (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img key={index} src={img} alt={`Preview ${index + 1}`} className="w-full h-24 object-cover" />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-6 text-muted-foreground text-xs ml-12 mt-2"><span>💬</span><span>🔁</span><span>❤️</span><span>📊</span></div>
                    </div>
                  </Card>
                  <Card className="p-3 bg-white">
                    <Button variant="ghost" size="sm" className="w-full justify-start text-sm"><LinkIcon className="w-4 h-4 mr-2" /> Insert internal links<Badge variant="secondary" className="ml-auto text-xs">NEW</Badge></Button>
                  </Card>
                </TabsContent>
                <TabsContent value="data" className="mt-0 space-y-4">
                  <Card className="p-4 bg-white">
                    <div className="flex items-center justify-between mb-3"><h4 className="text-sm">Content Structure</h4><Button variant="ghost" size="sm" className="h-6 text-xs">Adjust</Button></div>
                    <div className="grid grid-cols-4 gap-3">
                      <div className="text-center"><div className="text-xs text-muted-foreground mb-1">WORDS</div><div className="text-lg">{words}</div><div className="text-xs text-muted-foreground">2-10C→2-4T</div></div>
                      <div className="text-center"><div className="text-xs text-muted-foreground mb-1">HASHTAGS</div><div className="text-lg">{hashtags}</div><div className="text-xs text-muted-foreground">2-4→2-3</div></div>
                      <div className="text-center"><div className="text-xs text-muted-foreground mb-1">LINES</div><div className="text-lg">{lines}</div><div className="text-xs text-muted-foreground">6-8→2</div></div>
                      <div className="text-center"><div className="text-xs text-muted-foreground mb-1">IMAGES</div><div className="text-lg">{uploadedPreviews.length}</div><div className="text-xs text-muted-foreground">0-4 max</div></div>
                    </div>
                  </Card>
                  <Card className="p-4 bg-white">
                    <h4 className="text-sm mb-3">Predicted Engagement</h4>
                    <div className="space-y-3">
                      <div><div className="flex items-center justify-between text-xs mb-1"><span className="text-muted-foreground">Likes</span><span>~120</span></div><Progress value={75} className="h-1.5" /></div>
                      <div><div className="flex items-center justify-between text-xs mb-1"><span className="text-muted-foreground">Retweets</span><span>~45</span></div><Progress value={60} className="h-1.5" /></div>
                      <div><div className="flex items-center justify-between text-xs mb-1"><span className="text-muted-foreground">Replies</span><span>~30</span></div><Progress value={45} className="h-1.5" /></div>
                    </div>
                  </Card>
                  <Card className="p-4 bg-white">
                    <div className="flex items-center justify-between mb-3"><h4 className="text-sm">Terms</h4><Button variant="ghost" size="sm" className="h-6 text-xs">Adjust</Button></div>
                    <div className="relative mb-3"><Input placeholder="Search" className="pl-8 h-8 text-sm" /><span className="absolute left-2.5 top-2 text-muted-foreground">🔍</span></div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="text-xs">All <span className="ml-1 bg-primary text-white rounded px-1">82</span></Badge>
                      <Badge variant="outline" className="text-xs">Headings <span className="ml-1">8</span></Badge>
                      <Badge variant="outline" className="text-xs">NLP <span className="ml-1">40</span></Badge>
                    </div>
                  </Card>
                  <Card className="p-4 bg-white">
                    <h4 className="text-sm mb-3">Suggested Hashtags</h4>
                    <div className="flex flex-wrap gap-2">
                      {["#BuildInPublic", "#SaaS", "#ContentCreation", "#Marketing", "#AI"].map((tag) => (
                        <Badge key={tag} variant="outline" className="cursor-pointer hover:bg-primary hover:text-white transition-colors" onClick={() => setContent(content + " " + tag)}>{tag}</Badge>
                      ))}
                    </div>
                  </Card>
                </TabsContent>
                <TabsContent value="outline" className="mt-0 space-y-4">
                  <Card className="p-4 bg-white">
                    <h4 className="text-sm mb-3">Post Outline</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"><FileText className="w-4 h-4 text-muted-foreground" /><span>Introduction</span></div>
                      <div className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"><FileText className="w-4 h-4 text-muted-foreground" /><span>Main Content</span></div>
                      <div className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"><Hash className="w-4 h-4 text-muted-foreground" /><span>Hashtags</span></div>
                      <div className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"><TrendingUp className="w-4 h-4 text-muted-foreground" /><span>Call to Action</span></div>
                    </div>
                  </Card>
                  <Card className="p-4 bg-white">
                    <h4 className="text-sm mb-3">Quick Stats</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-muted-foreground">Reading time</span><span>~30 sec</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Scheduled</span><span>{new Date().toLocaleDateString()}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Platform</span><span className="flex items-center gap-1"><Twitter className="w-3 h-3" /> X/Twitter</span></div>
                    </div>
                  </Card>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </SubscriptionGuard>
    </SidebarLayout>
  );
}