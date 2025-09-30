import React, { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

interface AttachmentItem {
  url: string;
  type: string | null;
  file?: File | null;
  key?: string;
}

interface TweetEditorState {
  activeComposerTab: 'compose' | 'drafts' | 'scheduled' | 'sent';
  editedTweet: string;
  isScheduled: boolean;
  attachments: AttachmentItem[] ;
  communityUrl: string;
  editingPostId: string | null;
  currentPostStatus: string | null;
  drafts: any[];
  scheduled: any[];
  loadingDrafts: boolean;
  loadingScheduled: boolean;
}

interface TweetEditorActions {
  setActiveComposerTab: (tab: 'compose' | 'drafts' | 'scheduled' | 'sent') => void;
  setEditedTweet: (tweet: string) => void;
  setAttachments: React.Dispatch<React.SetStateAction<AttachmentItem[]>>;
  setCommunityUrl: (url: string) => void;
  handleScheduleConfirm: (date: Date) => Promise<void>;
  handleSaveDraft: () => Promise<void>;
  loadDraft: (draft: any) => void;
  loadScheduled: (scheduled: any) => void;
  handleInsertHashtag: (tag: string) => void;
  addHashtag: () => void;
  fetchDrafts: () => Promise<void>;
  fetchScheduled: () => Promise<void>;
}

export function useTweetEditor(contentToLoad?: string, options?: { persistKey?: string }): TweetEditorState & TweetEditorActions {
  // State
  const [activeComposerTab, setActiveComposerTab] = useState<'compose' | 'drafts' | 'scheduled' | 'sent'>('compose');
  const [editedTweet, setEditedTweet] = useState('');
  const [isScheduled, setIsScheduled] = useState(false);
  const [attachments, setAttachments] = useState<AttachmentItem[]>([]);
  const [communityUrl, setCommunityUrl] = useState('');
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [currentPostStatus, setCurrentPostStatus] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<any[]>([]);
  const [scheduled, setScheduled] = useState<any[]>([]);
  const [loadingDrafts, setLoadingDrafts] = useState(false);
  const [loadingScheduled, setLoadingScheduled] = useState(false);

  const persistKey = options?.persistKey;

  // Load persisted state on mount (per-page session)
  useEffect(() => {
    if (!persistKey) return;
    try {
      const raw = sessionStorage.getItem(persistKey);
      if (!raw) return;
      const data = JSON.parse(raw);
      if (typeof data?.editedTweet === 'string') setEditedTweet(data.editedTweet);
      if (Array.isArray(data?.attachments)) setAttachments(data.attachments);
      if (typeof data?.communityUrl === 'string') setCommunityUrl(data.communityUrl);
      if (data?.activeComposerTab === 'compose' || data?.activeComposerTab === 'drafts' || data?.activeComposerTab === 'scheduled' || data?.activeComposerTab === 'sent') {
        setActiveComposerTab(data.activeComposerTab);
      }
    } catch (_e) {
      // ignore malformed storage
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle content to load from chat
  useEffect(() => {
    if (contentToLoad) {
      setEditedTweet(contentToLoad);
      setActiveComposerTab('compose');
      setEditingPostId(null);
      setCurrentPostStatus(null);
    }
  }, [contentToLoad]);

  // Persist state when it changes
  useEffect(() => {
    if (!persistKey) return;
    try {
      const payload = {
        editedTweet,
        attachments,
        communityUrl,
        activeComposerTab,
      };
      sessionStorage.setItem(persistKey, JSON.stringify(payload));
    } catch (_e) {
      // ignore storage errors
    }
  }, [persistKey, editedTweet, attachments, communityUrl, activeComposerTab]);

  // Fetch drafts from API
  const fetchDrafts = async () => {
    setLoadingDrafts(true);
    try {
      const response = await fetch('/api/content-posts?status=draft');
      if (response.ok) {
        const data = await response.json();
        setDrafts(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching drafts:', error);
    } finally {
      setLoadingDrafts(false);
    }
  };

  // Fetch scheduled posts from API
  const fetchScheduled = async () => {
    setLoadingScheduled(true);
    try {
      const response = await fetch('/api/content-posts?status=scheduled');
      if (response.ok) {
        const data = await response.json();
        setScheduled(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching scheduled posts:', error);
    } finally {
      setLoadingScheduled(false);
    }
  };

  // Fetch data when component mounts or when tabs change
  useEffect(() => {
    if (activeComposerTab === 'drafts') {
      fetchDrafts();
    } else if (activeComposerTab === 'scheduled') {
      fetchScheduled();
    }
  }, [activeComposerTab]);

  // Helper function to save/update posts
  const savePost = async (status: 'draft' | 'scheduled', scheduledAt?: Date) => {
    if (!editedTweet.trim()) return;

    const isUpdate = !!editingPostId;
    
    // Handle posted content - create a copy as draft instead of updating
    if (isUpdate && currentPostStatus === 'posted') {
      if (status === 'draft') {
        // Create a new draft copy of the posted content
        const response = await fetch('/api/content-posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: editedTweet.trim(),
            platform: 'twitter',
            status: 'draft',
            attachments: attachments,
            communityUrl: communityUrl || null
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to create draft copy');
        }

        // Clear form state
        setEditedTweet("");
        setEditingPostId(null);
        setCurrentPostStatus(null);
        setAttachments([]);
        setCommunityUrl('');
        
        // Refresh relevant tabs
        if (activeComposerTab === 'drafts') fetchDrafts();
        if (activeComposerTab === 'scheduled') fetchScheduled();

        return { isUpdate: false, scheduledAt };
      } else {
        throw new Error('Cannot schedule posted content - create a draft copy first');
      }
    }

    const url = isUpdate ? `/api/content-posts/${encodeURIComponent(editingPostId!)}` : '/api/content-posts';
    const method = isUpdate ? 'PATCH' : 'POST';
    const form = new FormData();
    form.append('content', editedTweet.trim());
    form.append('status', status);
    form.append('platform', 'x');
    if (scheduledAt) form.append('scheduled_at', scheduledAt.toISOString());
    if (communityUrl) form.append('communityUrl', communityUrl);

    // Desired attachments list (kept by the user): non-blob items with url/type/key
    const desired = attachments
      .filter(a => !a.url.startsWith('blob:'))
      .map(a => ({ url: a.url, type: a.type || '', key: a.key }));
    form.append('attachments', JSON.stringify(desired));

    // New files to upload: blob attachments with File present
    const newFiles = attachments.filter(a => a.url.startsWith('blob:') && a.file);
    for (const a of newFiles) {
      form.append('files', a.file as File, (a.file as File).name);
    }

    const response = await fetch(url, { method, body: form });

    if (!response.ok) {
      throw new Error(`Failed to ${isUpdate ? 'update' : 'save'} ${status === 'draft' ? 'draft' : 'tweet'}`);
    }

    // Clear form state
    setEditedTweet("");
    setEditingPostId(null);
    setCurrentPostStatus(null);
    setAttachments([]);
    setCommunityUrl('');
    // Clear persisted state
    if (persistKey) {
      try { sessionStorage.removeItem(persistKey); } catch (_e) {}
    }
    
    // Refresh relevant tabs
    if (activeComposerTab === 'drafts') fetchDrafts();
    if (activeComposerTab === 'scheduled') fetchScheduled();

    return { isUpdate, scheduledAt };
  };

  const handleScheduleConfirm = async (date: Date) => {
    try {
      const result = await savePost('scheduled', date);
      if (!result) return;
      
      const { isUpdate } = result;
      
      toast({
        title: isUpdate ? 'Updated' : 'Scheduled',
        description: isUpdate 
          ? `Post updated and scheduled for ${date.toLocaleString()}`
          : `Will post ${date.toLocaleString()}`
      });

      setIsScheduled(true);
    } catch (error) {
      console.error('Error scheduling tweet:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to schedule tweet. Please try again.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const handleSaveDraft = async () => {
    try {
      const result = await savePost('draft');
      if (!result) return;
      
      const { isUpdate } = result;
      
      // Special message for posted content copied to draft
      if (currentPostStatus === 'posted') {
        toast({
          title: "Draft copy created!",
          description: "A draft copy of the posted content has been created."
        });
      } else {
        toast({
          title: isUpdate ? "Draft updated!" : "Draft saved!",
          description: isUpdate 
            ? "Your tweet draft has been updated."
            : "Your tweet has been saved as a draft."
        });
      }
    } catch (error) {
      console.error('Error saving draft:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to save draft. Please try again.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const loadDraft = (draft: any) => {
    setEditedTweet(draft.content);
    setActiveComposerTab('compose');
    setEditingPostId(draft.id);
    setCurrentPostStatus(draft.status);
    
    // Load attachments and community URL from draft metadata
    const metadata = draft.metadata || {};
    const att = (metadata.attachments || []).map((a: any) => ({ url: a.url, type: a.type || null, key: a.key }));
    const communityUrl = metadata.community_url;
  
    // Convert image URLs back to attachment format
    setAttachments(att);
    setCommunityUrl(communityUrl || '');
  };

  const loadScheduled = (scheduled: any) => {
    setEditedTweet(scheduled.content);
    setActiveComposerTab('compose');
    setEditingPostId(scheduled.id);
    setCurrentPostStatus(scheduled.status);
    
    // Load attachments and community URL from scheduled metadata
    const metadata = scheduled.metadata || {};
    const att = (metadata.attachments || metadata.images || []).map((a: any) => {
      if (typeof a === 'string') return { url: a, type: null } as AttachmentItem;
      return { url: a.url, type: a.type || null, key: a.key } as AttachmentItem;
    });
    const communityUrl = metadata.community_url;
    setAttachments(att);
    setCommunityUrl(communityUrl || '');
  };

  const handleInsertHashtag = (tag: string) => {
    const cleanTag = tag.startsWith('#') ? tag : `#${tag}`;
    const addition = (editedTweet.endsWith(' ') || editedTweet.length === 0) ? cleanTag : ` ${cleanTag}`;
    const next = editedTweet + addition;
    if (next.length > 280) {
      toast({
        title: "Too long",
        description: "Adding this hashtag would exceed 280 characters.",
      });
      return;
    }
    setEditedTweet(next);
  };

  const addHashtag = () => {
    setEditedTweet(prev => prev + " #");
  };

  return {
    // State
    activeComposerTab,
    editedTweet,
    isScheduled,
    attachments,
    communityUrl,
    editingPostId,
    currentPostStatus,
    drafts,
    scheduled,
    loadingDrafts,
    loadingScheduled,
    
    // Actions
    setActiveComposerTab,
    setEditedTweet,
    setAttachments,
    setCommunityUrl,
    handleScheduleConfirm,
    handleSaveDraft,
    loadDraft,
    loadScheduled,
    handleInsertHashtag,
    addHashtag,
    fetchDrafts,
    fetchScheduled,
  };
}
