"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, RefreshCw, Sparkles, Heart, MessageCircle, Repeat2, Edit3, Plus, BookOpen, User } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import SidebarLayout from "@/components/sidebar-layout";
import SubscriptionGuard from "@/components/subscription-guard";

interface TweetTemplate {
  id: string;
  text: string;
  category: string;
  hashtags: string[];
  is_viral_ready: boolean;
  is_starter: boolean;
  created_at: string;
  updated_at: string;
}

const templateCategories = [
  "All Templates",
  "Progress Updates", 
  "Lessons Learned",
  "Product Updates",
  "Small Wins",
  "Behind the Scenes",
  "Community Building"
];

export default function LibraryPage() {
  const [templates, setTemplates] = useState<TweetTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All Templates");
  const [libraryType, setLibraryType] = useState<"starter" | "user">("starter");
  const [editingTemplate, setEditingTemplate] = useState<TweetTemplate | null>(null);
  const [newTemplate, setNewTemplate] = useState({
    text: "",
    category: "",
    hashtags: [] as string[],
    is_viral_ready: false
  });
  const [showAddForm, setShowAddForm] = useState(false);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        category: selectedCategory,
        type: libraryType,
        limit: "100"
      });
      
      const response = await fetch(`/api/library?${params}`);
      if (!response.ok) throw new Error('Failed to fetch templates');
      
      const data = await response.json();
      setTemplates(Array.isArray(data.templates) ? data.templates : []);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast({
        title: "Error",
        description: "Failed to load templates",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, [selectedCategory, libraryType]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: "Template copied to clipboard"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive"
      });
    }
  };

  const copyStarterTemplate = async (templateId: string) => {
    try {
      const response = await fetch('/api/library/copy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to copy template');
      }

      toast({
        title: "Template Added!",
        description: "Starter template added to your library"
      });
      
      // Refresh templates if we're viewing user library
      if (libraryType === "user") {
        fetchTemplates();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to copy template",
        variant: "destructive"
      });
    }
  };

  const saveTemplate = async () => {
    try {
      const response = await fetch('/api/library', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTemplate)
      });

      if (!response.ok) throw new Error('Failed to save template');

      toast({
        title: "Template Saved!",
        description: "Your template has been added to the library"
      });

      setNewTemplate({ text: "", category: "", hashtags: [], is_viral_ready: false });
      setShowAddForm(false);
      fetchTemplates();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save template",
        variant: "destructive"
      });
    }
  };

  const updateTemplate = async (template: TweetTemplate) => {
    try {
      const response = await fetch('/api/library', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: template.id,
          text: template.text,
          category: template.category,
          hashtags: template.hashtags,
          is_viral_ready: template.is_viral_ready
        })
      });

      if (!response.ok) throw new Error('Failed to update template');

      toast({
        title: "Template Updated!",
        description: "Your template has been updated"
      });

      setEditingTemplate(null);
      fetchTemplates();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update template",
        variant: "destructive"
      });
    }
  };

  const deleteTemplate = async (templateId: string) => {
    try {
      const response = await fetch(`/api/library?id=${templateId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete template');

      toast({
        title: "Template Deleted!",
        description: "Your template has been removed"
      });

      fetchTemplates();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete template",
        variant: "destructive"
      });
    }
  };

  const filteredTemplates = Array.isArray(templates) ? templates.filter(template => {
    if (selectedCategory === "All Templates") return true;
    return template.category === selectedCategory;
  }) : [];

  return (
    <SidebarLayout>
      <SubscriptionGuard>
        <div className="p-6 space-y-6 bg-gradient-to-br from-blue-50 to-orange-50 min-h-screen">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Template Library</h1>
            <p className="text-gray-600 text-lg">
              Discover and manage your tweet templates
            </p>
          </div>
          <Button onClick={() => setShowAddForm(true)} className="gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-0">
            <Plus className="h-4 w-4" />
            Add Template
          </Button>
        </div>

        <Tabs value={libraryType} onValueChange={(value) => setLibraryType(value as "starter" | "user")}>
          <TabsList className="grid w-full grid-cols-2 bg-white/80 backdrop-blur-sm border-orange-200">
            <TabsTrigger value="starter" className="gap-2 data-[state=active]:bg-orange-500 data-[state=active]:text-white">
              <Sparkles className="h-4 w-4" />
              Starter Library
            </TabsTrigger>
            <TabsTrigger value="user" className="gap-2 data-[state=active]:bg-orange-500 data-[state=active]:text-white">
              <User className="h-4 w-4" />
              My Library
            </TabsTrigger>
          </TabsList>

          <TabsContent value={libraryType} className="space-y-4">
            <div className="flex items-center gap-4">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {templateCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button variant="outline" onClick={fetchTemplates} disabled={loading}>
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>

            {showAddForm && (
              <Card>
                <CardHeader>
                  <CardTitle>Add New Template</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="Enter your template text..."
                    value={newTemplate.text}
                    onChange={(e) => setNewTemplate({ ...newTemplate, text: e.target.value })}
                    rows={4}
                  />
                  <div className="flex gap-4">
                    <Select value={newTemplate.category} onValueChange={(value) => setNewTemplate({ ...newTemplate, category: value })}>
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {templateCategories.slice(1).map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      variant={newTemplate.is_viral_ready ? "default" : "outline"}
                      onClick={() => setNewTemplate({ ...newTemplate, is_viral_ready: !newTemplate.is_viral_ready })}
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      Viral Ready
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={saveTemplate} disabled={!newTemplate.text || !newTemplate.category}>
                      Save Template
                    </Button>
                    <Button variant="outline" onClick={() => setShowAddForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {loading ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="h-3 bg-muted rounded"></div>
                        <div className="h-3 bg-muted rounded w-5/6"></div>
                        <div className="h-3 bg-muted rounded w-4/6"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredTemplates.map((template) => (
                  <Card key={template.id} className="relative bg-white/80 backdrop-blur-sm border-orange-200 transition-all duration-200 hover:-translate-y-1">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-sm font-medium">
                            {template.category}
                          </CardTitle>
                          <CardDescription className="text-xs">
                            {template.is_starter ? "Starter Template" : "Your Template"}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-1">
                          {template.is_viral_ready && (
                            <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700 border-orange-200">
                              <Sparkles className="h-3 w-3 mr-1" />
                              Viral
                            </Badge>
                          )}
                          {template.is_starter && (
                            <Badge variant="outline" className="text-xs">
                              Starter
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm leading-relaxed">{template.text}</p>
                      
                      {template.hashtags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {template.hashtags.map((hashtag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {hashtag}
                            </Badge>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(template.text)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          
                          {template.is_starter && libraryType === "starter" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => copyStarterTemplate(template.id)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          )}
                          
                          {!template.is_starter && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingTemplate(template)}
                              >
                                <Edit3 className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => deleteTemplate(template.id)}
                              >
                                Delete
                              </Button>
                            </>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <span>{template.text.length} chars</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {!loading && filteredTemplates.length === 0 && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No templates found</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    {libraryType === "starter" 
                      ? "No starter templates available in this category."
                      : libraryType === "user"
                      ? "You haven't added any templates to your library yet."
                      : "No templates found for the selected category."
                    }
                  </p>
                  {libraryType === "user" && (
                    <Button onClick={() => setShowAddForm(true)} className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-0">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Template
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {editingTemplate && (
          <Card className="fixed inset-4 z-50 bg-background border shadow-lg">
            <CardHeader>
              <CardTitle>Edit Template</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Enter your template text..."
                value={editingTemplate.text}
                onChange={(e) => setEditingTemplate({ ...editingTemplate, text: e.target.value })}
                rows={4}
              />
              <div className="flex gap-4">
                <Select 
                  value={editingTemplate.category} 
                  onValueChange={(value) => setEditingTemplate({ ...editingTemplate, category: value })}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {templateCategories.slice(1).map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant={editingTemplate.is_viral_ready ? "default" : "outline"}
                  onClick={() => setEditingTemplate({ ...editingTemplate, is_viral_ready: !editingTemplate.is_viral_ready })}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Viral Ready
                </Button>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => updateTemplate(editingTemplate)}>
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => setEditingTemplate(null)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        </div>
      </SubscriptionGuard>
    </SidebarLayout>
  );
}