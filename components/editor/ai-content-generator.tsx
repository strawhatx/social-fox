import { useCallback, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import { ScrollArea } from "../ui/scroll-area";
import { Sparkles, Wand2, TrendingUp, Lightbulb, Zap, MessageSquare, Copy, Check } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { generatePrime } from "node:crypto";

interface AIContentGeneratorProps {
  currentContent: string;
  onApplyContent: (content: string) => void;
  tweetIndex?: number; // 0 for main, 1+ for thread replies
}

const enhancementMap: Record<string, string> = {
  "improve-grammar": "✨ Improve grammar and clarity",
  "more-details": "📝 Expanded with more details",
  "engaging": "💫 Made more engaging",
  "humorous": "😄 Added humor",
  "creative": "🎨 Enhanced creativity",
  "sarcastic": "😏 Added sarcastic tone",
  "inspirational": "⭐ Made more inspirational",
  "concise": "✂️ Made more concise"
};

export function AIContentGenerator({
  currentContent,
  onApplyContent,
  tweetIndex = 0,
}: AIContentGeneratorProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"generate" | "improve" | "templates">("generate");
  const [prompt, setPrompt] = useState("");
  const [generatedContent, setGeneratedContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim() && activeTab === "generate") {
      toast({ title: "Please enter a prompt or idea", variant: "destructive" });
      return;
    }

    setIsGenerating(true);

    // Call API for generate
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Rewrite failed');
      const generated = json?.generated || currentContent;
      
      onApplyContent(generated);
      toast({ title: 'Content enhanced!' });
    } catch (err: any) {
      toast({ title: 'Rewrite failed', description: err?.message || 'Please try again.' });
    }
  };

  const handleAiEnhancement = async (action: string) => {
    if (!currentContent.trim()) {
      toast({ 
        title: 'No content to enhance', 
        description: 'Please add some content to enhance!' 
      });

      return;
    }

    // Call API for rewrite
    try {
      const res = await fetch('/api/rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: currentContent, style: action }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Rewrite failed');
      const enhanced = json?.rewritten || currentContent;
      
      onApplyContent(enhanced);
      
      toast({
        title: 'Content enhanced!',
        description: enhancementMap[action] || 'Content has been improved',
      });
    } catch (err: any) {
      toast({ title: 'Rewrite failed', description: err?.message || 'Please try again.' });
    }
  };

  const handleApply = () => {
    onApplyContent(generatedContent);
    setOpen(false);
    toast({ title: `Content applied to Tweet ${tweetIndex + 1}` });
    setGeneratedContent("");
    setPrompt("");
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContent);
    setCopied(true);
    toast({ title: "Copied to clipboard!" });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-3 text-xs"
        >
          <Sparkles className="h-3 w-3 mr-1" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[85vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl">AI Content Generator</DialogTitle>
              <DialogDescription>
                Create engaging content for Tweet {tweetIndex + 1}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex h-[calc(85vh-120px)]">
          {/* Left Side - Tabs */}
          <div className="w-1/2 border-r">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="h-full flex flex-col">
              <div className="px-6 pt-4">
                <TabsList className="w-full grid grid-cols-2">
                  <TabsTrigger value="generate" className="text-xs w-full">
                    <Wand2 className="w-3 h-3 mr-1" />
                    Generate
                  </TabsTrigger>
                  <TabsTrigger value="improve" className="text-xs w-full">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Improve
                  </TabsTrigger>
                </TabsList>
              </div>

              <ScrollArea className="flex-1 px-6 py-4">
                {/* Generate Tab */}
                <TabsContent value="generate" className="mt-0">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm mb-2 block">
                        What do you want to create?
                      </label>
                      <Textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="E.g., Tips for productivity, My startup journey, How to learn coding..."
                        className="min-h-[120px] resize-none"
                      />
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground mb-3">Quick starters:</p>
                      <div className="flex flex-wrap gap-2">
                        {[
                          "Share a tip",
                          "Tell a story",
                          "Ask a question",
                          "Share progress",
                          "Give advice",
                        ].map((starter) => (
                          <Badge
                            key={starter}
                            variant="outline"
                            className="cursor-pointer hover:bg-orange-50 hover:border-orange-500 hover:text-orange-700"
                            onClick={() => setPrompt(starter)}
                          >
                            <Lightbulb className="w-3 h-3 mr-1" />
                            {starter}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <Button
                      onClick={handleGenerate}
                      disabled={isGenerating || !prompt.trim()}
                      className="w-full bg-orange-500 hover:bg-orange-600"
                    >
                      {isGenerating ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          >
                            <Sparkles className="w-4 h-4 mr-2" />
                          </motion.div>
                          Generating...
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 mr-2" />
                          Generate Content
                        </>
                      )}
                    </Button>
                  </div>
                </TabsContent>

                {/* Improve Tab */}
                <TabsContent value="improve" className="mt-0">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm mb-2 block">Current content:</label>
                      <div className="p-3 bg-gray-50 rounded-lg border text-sm min-h-[100px]">
                        {currentContent || (
                          <span className="text-muted-foreground">No content yet...</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm mb-3">Quick improvements:</p>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.keys(enhancementMap).map((item, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            onClick={() => handleAiEnhancement(item)}
                            disabled={!currentContent || isGenerating}
                            className="justify-start w-full"
                          >
                            <span className="text-xs text-left whitespace-normal">{enhancementMap[item]}</span>
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm mb-2 block">Custom improvement:</label>
                      <Textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="E.g., Make it funnier, Add statistics, Make it more emotional..."
                        className="min-h-[80px] resize-none"
                      />
                    </div>

                    <Button
                      onClick={handleGenerate}
                      disabled={isGenerating || !currentContent}
                      className="w-full bg-orange-500 hover:bg-orange-600"
                    >
                      {isGenerating ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          >
                            <Sparkles className="w-4 h-4 mr-2" />
                          </motion.div>
                          Improving...
                        </>
                      ) : (
                        <>
                          <Wand2 className="w-4 h-4 mr-2" />
                          Improve Content
                        </>
                      )}
                    </Button>
                  </div>
                </TabsContent>
              </ScrollArea>
            </Tabs>
          </div>

          {/* Right Side - Preview */}
          <div className="w-1/2 flex flex-col">
            <div className="px-6 py-4 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm">Generated Content</h4>
                  <p className="text-xs text-muted-foreground">
                    Preview and edit before applying
                  </p>
                </div>
                {generatedContent && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopy}
                  >
                    {copied ? (
                      <Check className="w-4 h-4 mr-2" />
                    ) : (
                      <Copy className="w-4 h-4 mr-2" />
                    )}
                    {copied ? "Copied!" : "Copy"}
                  </Button>
                )}
              </div>
            </div>

            <ScrollArea className="flex-1 p-6">
              <AnimatePresence mode="wait">
                {generatedContent ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <Textarea
                      value={generatedContent}
                      onChange={(e) => setGeneratedContent(e.target.value)}
                      className="min-h-[300px] resize-none text-base leading-relaxed"
                      placeholder="Generated content will appear here..."
                    />
                    <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                      <span>{generatedContent.length} characters</span>
                      <span>{generatedContent.split(/\s+/).filter(Boolean).length} words</span>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="h-full flex items-center justify-center"
                  >
                    <div className="text-center text-muted-foreground">
                      <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-20" />
                      <p className="text-sm">No content generated yet</p>
                      <p className="text-xs mt-1">
                        Use the options on the left to create content
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </ScrollArea>

            {generatedContent && (
              <div className="p-6 border-t bg-gray-50/50">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setGeneratedContent("");
                      setPrompt("");
                    }}
                    className="flex-1"
                  >
                    Clear
                  </Button>
                  <Button
                    onClick={handleApply}
                    className="flex-1 bg-orange-500 hover:bg-orange-600"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Apply to Tweet {tweetIndex + 1}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
