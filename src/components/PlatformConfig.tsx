import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Twitter, Linkedin, Instagram, Settings, Zap } from 'lucide-react';
import { usePlatformConfigs } from '@/hooks/usePlatformConfigs';
import { useToast } from '@/hooks/use-toast';

interface Project {
  id: string;
  name: string;
  description: string;
  platforms: string[];
  contentSources: number;
  lastGenerated: string;
  status: 'active' | 'paused' | 'draft';
}

interface PlatformConfig {
  id: string;
  name: string;
  enabled: boolean;
  characterLimit: number;
  template: string;
  icon: any;
  color: string;
}

interface PlatformConfigProps {
  project: Project;
}

export default function PlatformConfig({ project }: PlatformConfigProps) {
  const { configs, loading, upsertConfig } = usePlatformConfigs(project.id);
  const { toast } = useToast();

  // Default platform templates
  const defaultPlatforms = [
    {
      platform: 'Twitter',
      name: 'Twitter/X',
      characterLimit: 280,
      template: 'Create an engaging Twitter post about {{content}}. Keep it under 280 characters, use relevant hashtags, and make it shareable.',
      icon: Twitter,
      color: 'twitter'
    },
    {
      platform: 'LinkedIn',
      name: 'LinkedIn',
      characterLimit: 3000,
      template: 'Create a professional LinkedIn post about {{content}}. Focus on business value, include a call-to-action, and make it engaging for professionals.',
      icon: Linkedin,
      color: 'linkedin'
    },
    {
      platform: 'Instagram',
      name: 'Instagram',
      characterLimit: 2200,
      template: 'Create an Instagram caption about {{content}}. Make it visually appealing, use emojis, relevant hashtags, and encourage engagement.',
      icon: Instagram,
      color: 'instagram'
    }
  ];

  // Merge database configs with defaults
  const platforms = defaultPlatforms.map(defaultPlatform => {
    const dbConfig = configs.find(c => c.platform === defaultPlatform.platform);
    return {
      ...defaultPlatform,
      id: dbConfig?.id || defaultPlatform.platform.toLowerCase(),
      enabled: dbConfig?.enabled ?? false,
      template: dbConfig?.template || defaultPlatform.template,
    };
  });

  const togglePlatform = async (platform: string) => {
    const currentConfig = configs.find(c => c.platform === platform);
    const defaultTemplate = defaultPlatforms.find(p => p.platform === platform)?.template || '';
    
    try {
      await upsertConfig(platform, {
        enabled: !currentConfig?.enabled,
        template: currentConfig?.template || defaultTemplate,
        character_limit: defaultPlatforms.find(p => p.platform === platform)?.characterLimit,
      });
      
      toast({
        title: "Platform updated",
        description: `${platform} has been ${currentConfig?.enabled ? 'disabled' : 'enabled'}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update platform configuration",
        variant: "destructive",
      });
    }
  };

  const updateTemplate = async (platform: string, template: string) => {
    const currentConfig = configs.find(c => c.platform === platform);
    
    try {
      await upsertConfig(platform, {
        enabled: currentConfig?.enabled ?? true,
        template,
        character_limit: defaultPlatforms.find(p => p.platform === platform)?.characterLimit,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update template",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Platform Configuration</h2>
          <p className="text-muted-foreground">
            Configure how content is formatted for each platform
          </p>
        </div>
        <Button variant="outline">
          <Zap className="w-4 h-4 mr-2" />
          Test Generation
        </Button>
      </div>

      <div className="grid gap-6">
        {platforms.map((platform) => {
          const IconComponent = platform.icon;
          return (
            <Card key={platform.id} className={`border-l-4 ${platform.enabled ? 'border-l-primary' : 'border-l-muted'}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 bg-${platform.color}/10 rounded-lg flex items-center justify-center`}>
                      <IconComponent className={`w-5 h-5 text-${platform.color}`} />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{platform.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Character limit: {platform.characterLimit}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={platform.enabled ? "default" : "secondary"}>
                      {platform.enabled ? "Enabled" : "Disabled"}
                    </Badge>
                    <Switch
                      checked={platform.enabled}
                      onCheckedChange={() => togglePlatform(platform.platform)}
                    />
                  </div>
                </div>
              </CardHeader>
              
              {platform.enabled && (
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor={`template-${platform.id}`}>
                      Content Generation Template
                    </Label>
                    <Textarea
                      id={`template-${platform.id}`}
                      value={platform.template}
                      onChange={(e) => updateTemplate(platform.platform, e.target.value)}
                      rows={4}
                      placeholder="Enter your GPT-4 prompt template..."
                    />
                    <p className="text-xs text-muted-foreground">
                      Use {'{{content}}'} as a placeholder for the source content
                    </p>
                  </div>
                  
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      <Card className="bg-muted/20">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">GPT-4 Integration</h3>
              <p className="text-sm text-muted-foreground">
                Your content will be processed using GPT-4 with the templates above. 
                Make sure to provide your OpenAI API key in the export configuration.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}