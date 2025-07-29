import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface TestGenerationDialogProps {
  platforms: Array<{
    platform: string;
    name: string;
    enabled: boolean;
    template: string;
    characterLimit: number;
  }>;
}

export default function TestGenerationDialog({ platforms }: TestGenerationDialogProps) {
  const [open, setOpen] = useState(false);
  const [testContent, setTestContent] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const enabledPlatforms = platforms.filter(p => p.enabled);

  const handleGenerate = async () => {
    if (!testContent.trim() || !selectedPlatform) {
      toast({
        title: "Missing information",
        description: "Please enter test content and select a platform",
        variant: "destructive",
      });
      return;
    }

    const platform = platforms.find(p => p.platform === selectedPlatform);
    if (!platform) return;

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: {
          content: testContent,
          template: platform.template,
          platform: platform.name
        }
      });

      if (error) throw error;

      setGeneratedContent(data.generatedContent);
      toast({
        title: "Content generated!",
        description: `Successfully generated content for ${platform.name}`,
      });
    } catch (error: any) {
      console.error('Generation error:', error);
      toast({
        title: "Generation failed",
        description: error.message || "Failed to generate content. Make sure OpenAI API key is configured.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setTestContent('');
    setSelectedPlatform('');
    setGeneratedContent('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Zap className="w-4 h-4 mr-2" />
          Test Generation
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Test Content Generation</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="test-content">Test Content</Label>
            <Textarea
              id="test-content"
              placeholder="Enter your source content to test generation..."
              value={testContent}
              onChange={(e) => setTestContent(e.target.value)}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label>Platform</Label>
            <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
              <SelectTrigger>
                <SelectValue placeholder="Select a platform to test" />
              </SelectTrigger>
              <SelectContent>
                {enabledPlatforms.map((platform) => (
                  <SelectItem key={platform.platform} value={platform.platform}>
                    {platform.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedPlatform && (
            <div className="space-y-2">
              <Label>Template Preview</Label>
              <Card className="bg-muted/20">
                <CardContent className="p-3">
                  <p className="text-sm text-muted-foreground">
                    {platforms.find(p => p.platform === selectedPlatform)?.template}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="flex gap-2">
            <Button 
              onClick={handleGenerate} 
              disabled={isGenerating || !testContent.trim() || !selectedPlatform}
              className="flex-1"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Generate Content
                </>
              )}
            </Button>
            <Button variant="outline" onClick={handleClose}>
              Close
            </Button>
          </div>

          {generatedContent && (
            <div className="space-y-2">
              <Label>Generated Content</Label>
              <Card>
                <CardContent className="p-4">
                  <p className="whitespace-pre-wrap">{generatedContent}</p>
                  <div className="mt-2 pt-2 border-t">
                    <p className="text-xs text-muted-foreground">
                      Character count: {generatedContent.length} / {platforms.find(p => p.platform === selectedPlatform)?.characterLimit}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}