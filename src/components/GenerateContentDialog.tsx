import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Sparkles, Calendar, Github, CheckSquare, MessageSquare, Twitter, Linkedin, Loader2 } from 'lucide-react';
import { usePlatformConfigs } from '@/hooks/usePlatformConfigs';
import { useContentPosts } from '@/hooks/useContentPosts';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface GenerateContentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: {
    id: string;
    name: string;
    description?: string;
    brand_voice?: string;
    target_audience?: string;
  };
}

interface ContentSource {
  id: string;
  name: string;
  type: string;
  icon: React.ReactNode;
  description: string;
  selected: boolean;
}

export const GenerateContentDialog = ({ open, onOpenChange, project }: GenerateContentDialogProps) => {
  const { configs: platformConfigs, loading: configsLoading } = usePlatformConfigs(project.id);
  const { createPost } = useContentPosts(project.id);
  
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [contentSources, setContentSources] = useState<ContentSource[]>([
    {
      id: 'github',
      name: 'Recent GitHub Activity',
      type: 'github',
      icon: <Github className="h-4 w-4" />,
      description: '3 commits in the last 24 hours',
      selected: true
    },
    {
      id: 'tasks',
      name: 'Task Updates',
      type: 'tasks',
      icon: <CheckSquare className="h-4 w-4" />,
      description: '2 completed tasks today',
      selected: true
    },
    {
      id: 'feedback',
      name: 'User Feedback',
      type: 'feedback',
      icon: <MessageSquare className="h-4 w-4" />,
      description: '1 new user email',
      selected: false
    }
  ]);
  
  const [brandVoice, setBrandVoice] = useState({
    tone: project.brand_voice || 'Friendly',
    voice: 'Enthusiastic',
    style: 'Storytelling'
  });
  
  const [generatedContent, setGeneratedContent] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [currentStep, setCurrentStep] = useState<'setup' | 'preview' | 'publish'>('setup');
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Load real data from connected integrations when dialog opens
  useEffect(() => {
    if (open) {
      loadConnectedData();
    }
  }, [open, project.id]);

  const loadConnectedData = async () => {
    setIsLoadingData(true);
    try {
      const realSources: ContentSource[] = [];

      // Always include project description as the first data source
      realSources.push({
        id: 'project-description',
        name: 'Project Description',
        type: 'project-description',
        icon: <MessageSquare className="h-4 w-4" />,
        description: project.description || 'Project overview and context',
        selected: true
      });

      setContentSources(realSources);
    } catch (error) {
      console.error('Error loading connected data:', error);
      toast.error('Failed to load connection data');
    } finally {
      setIsLoadingData(false);
    }
  };

  const getGitHubData = async () => {
    try {
      console.log('getGitHubData: Calling fetch-github-data for project:', project.id);
      
      // Call the fetch-github-data edge function to get real data
      const { data, error } = await supabase.functions.invoke('fetch-github-data', {
        body: { projectId: project.id }
      });

      console.log('getGitHubData: Response from fetch-github-data:', { data, error });

      if (error) {
        console.error('Error fetching GitHub data:', error);
        return null;
      }

      return data?.data || null;
    } catch (error) {
      console.error('getGitHubData: Error fetching GitHub data:', error);
      return null;
    }
  };

  const getGitHubDescription = async (accountConfig: any) => {
    try {
      console.log('getGitHubDescription: Calling fetch-github-data for project:', project.id);
      
      // Call the fetch-github-data edge function to get real data
      const { data, error } = await supabase.functions.invoke('fetch-github-data', {
        body: { projectId: project.id }
      });

      console.log('getGitHubDescription: Response from fetch-github-data:', { data, error });

      if (error) {
        console.error('Error fetching GitHub data:', error);
        return 'GitHub account connected';
      }

      if (data?.data) {
        const githubData = data.data;
        console.log('getGitHubDescription: GitHub data received:', githubData);
        
        const parts = [];
        
        if (githubData.commits && githubData.commits.length > 0) {
          parts.push(`${githubData.commits.length} recent commits`);
        }
        
        if (githubData.tickets && githubData.tickets.length > 0) {
          parts.push(`${githubData.tickets.length} active tickets`);
        }
        
        if (githubData.comments && githubData.comments > 0) {
          parts.push(`${githubData.comments} comments`);
        }
        
        if (parts.length > 0) {
          const finalDescription = parts.join(', ');
          console.log('getGitHubDescription: Returning description with real data:', finalDescription);
          return finalDescription;
        }
        
        // If we have commits but no other data, still show it
        if (githubData.commits && githubData.commits.length > 0) {
          return `${githubData.commits.length} recent commits`;
        }
      }
      
      const fallback = accountConfig?.login ? `GitHub account connected (${accountConfig.login})` : 'GitHub account connected';
      console.log('getGitHubDescription: Returning fallback:', fallback);
      return fallback;
    } catch (error) {
      console.error('getGitHubDescription: Error fetching GitHub data:', error);
      return 'GitHub account connected';
    }
  };


  const handleSourceToggle = (sourceId: string) => {
    setContentSources(prev => 
      prev.map(source => 
        source.id === sourceId 
          ? { ...source, selected: !source.selected }
          : source
      )
    );
  };

  const handlePlatformToggle = (platform: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  const generateContent = async () => {
    if (selectedPlatforms.length === 0) {
      toast.error('Please select at least one platform');
      return;
    }

    setIsGenerating(true);
    setCurrentStep('preview');

    try {
      const selectedSources = contentSources.filter(s => s.selected);
      const sourceContent = selectedSources.map(s => `${s.name}: ${s.description}`).join('\n');
      
      const contentPrompt = `Project: ${project.name}
Available Data:
${sourceContent}

Brand Voice: ${brandVoice.tone}, ${brandVoice.voice}, ${brandVoice.style}
Target Audience: ${project.target_audience || 'General audience'}

Generate engaging social media content that highlights recent progress and achievements.`;

      const newGeneratedContent: Record<string, string> = {};

      for (const platform of selectedPlatforms) {
        const platformConfig = platformConfigs.find(c => c.platform === platform);
        const template = platformConfig?.template || 'Create engaging {{platform}} content about: {{content}}';
        
        const { data } = await supabase.functions.invoke('generate-content', {
          body: {
            content: contentPrompt,
            template: template.replace('{{platform}}', platform),
            platform
          }
        });

        if (data?.generatedContent) {
          newGeneratedContent[platform] = data.generatedContent;
        }
      }

      setGeneratedContent(newGeneratedContent);
    } catch (error) {
      console.error('Error generating content:', error);
      toast.error('Failed to generate content');
      setCurrentStep('setup');
    } finally {
      setIsGenerating(false);
    }
  };

  const publishContent = async (action: 'draft' | 'schedule' | 'publish') => {
    setIsPublishing(true);

    try {
      for (const [platform, content] of Object.entries(generatedContent)) {
        await createPost({
          content,
          platform,
          status: action === 'publish' ? 'posted' : action === 'schedule' ? 'scheduled' : 'draft'
        });
      }

      toast.success(`Content ${action === 'publish' ? 'published' : action === 'schedule' ? 'scheduled' : 'saved as draft'} successfully!`);
      onOpenChange(false);
      
      // Reset state
      setCurrentStep('setup');
      setGeneratedContent({});
      setSelectedPlatforms([]);
    } catch (error) {
      console.error('Error publishing content:', error);
      toast.error('Failed to publish content');
    } finally {
      setIsPublishing(false);
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'twitter': return <Twitter className="h-4 w-4" />;
      case 'linkedin': return <Linkedin className="h-4 w-4" />;
      default: return <Sparkles className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Content Composer
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Generate authentic content from your real work and progress
          </p>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Panel */}
          <div className="space-y-4">
            {/* Available Data and Brand Voice - Side by Side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Available Data */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    Available Data
                    {isLoadingData && <Loader2 className="h-4 w-4 animate-spin" />}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {contentSources.map((source) => (
                    <div key={source.id} className="flex items-center space-x-3">
                      <Checkbox
                        checked={source.selected}
                        onCheckedChange={() => handleSourceToggle(source.id)}
                      />
                      <div className="flex items-center space-x-2 flex-1">
                        {source.icon}
                        <div className="flex-1">
                          <p className="text-sm font-medium">{source.name}</p>
                          <p className="text-xs text-muted-foreground">{source.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Brand Voice */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Brand Voice</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="text-xs text-muted-foreground">Tone:</label>
                    <Select value={brandVoice.tone} onValueChange={(value) => setBrandVoice(prev => ({ ...prev, tone: value }))}>
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Friendly">Friendly</SelectItem>
                        <SelectItem value="Professional">Professional</SelectItem>
                        <SelectItem value="Casual">Casual</SelectItem>
                        <SelectItem value="Formal">Formal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Voice:</label>
                    <Select value={brandVoice.voice} onValueChange={(value) => setBrandVoice(prev => ({ ...prev, voice: value }))}>
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Enthusiastic">Enthusiastic</SelectItem>
                        <SelectItem value="Confident">Confident</SelectItem>
                        <SelectItem value="Helpful">Helpful</SelectItem>
                        <SelectItem value="Inspiring">Inspiring</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Style:</label>
                    <Select value={brandVoice.style} onValueChange={(value) => setBrandVoice(prev => ({ ...prev, style: value }))}>
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Storytelling">Storytelling</SelectItem>
                        <SelectItem value="Direct">Direct</SelectItem>
                        <SelectItem value="Educational">Educational</SelectItem>
                        <SelectItem value="Conversational">Conversational</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Generate Button */}
            {currentStep === 'setup' && (
              <Button 
                onClick={generateContent} 
                disabled={isGenerating || configsLoading}
                className="w-full"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating Content...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Content
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Right Panel */}
          <div className="space-y-4">
            {/* Platform Selection */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Choose Platform</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {platformConfigs.map((config) => (
                    <Badge
                      key={config.platform}
                      variant={selectedPlatforms.includes(config.platform) ? "default" : "outline"}
                      className="cursor-pointer flex items-center gap-1 px-3 py-1"
                      onClick={() => handlePlatformToggle(config.platform)}
                    >
                      {getPlatformIcon(config.platform)}
                      {config.platform}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Content Preview */}
            {currentStep !== 'setup' && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Content Preview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(generatedContent).map(([platform, content]) => (
                    <div key={platform} className="space-y-2">
                      <div className="flex items-center gap-2">
                        {getPlatformIcon(platform)}
                        <span className="font-medium capitalize">{platform}</span>
                      </div>
                      <Textarea
                        value={content}
                        onChange={(e) => setGeneratedContent(prev => ({ ...prev, [platform]: e.target.value }))}
                        className="min-h-[120px]"
                        placeholder="Generated content will appear here..."
                      />
                      <div className="text-xs text-muted-foreground text-right">
                        {content.length}/280
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Publishing Options */}
            {currentStep === 'preview' && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Publishing Options</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-xs text-muted-foreground">Schedule for later (optional)</label>
                    <Input
                      type="datetime-local"
                      value={scheduleDate}
                      onChange={(e) => setScheduleDate(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={() => publishContent('draft')}
                      disabled={isPublishing}
                      variant="outline"
                      className="flex-1"
                    >
                      Save Draft
                    </Button>
                    {scheduleDate && (
                      <Button
                        onClick={() => publishContent('schedule')}
                        disabled={isPublishing}
                        variant="outline"
                        className="flex-1"
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        Schedule
                      </Button>
                    )}
                    <Button
                      onClick={() => publishContent('publish')}
                      disabled={isPublishing}
                      className="flex-1"
                    >
                      {isPublishing ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : null}
                      Publish Now
                    </Button>
                  </div>
                  
                  <Button
                    onClick={() => setCurrentStep('setup')}
                    variant="ghost"
                    className="w-full"
                  >
                    Back to Edit
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};