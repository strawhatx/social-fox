import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import { Card } from "../ui/card";
import { ScrollArea } from "../ui/scroll-area";
import {
  Sparkles,
  Wand2,
  BookTemplate,
  TrendingUp,
  Lightbulb,
  Zap,
  MessageSquare,
  ArrowRight,
  Copy,
  Check,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface AIContentGeneratorProps {
  currentContent: string;
  onApplyContent: (content: string) => void;
  tweetIndex?: number; // 0 for main, 1+ for thread replies
}

interface Template {
  id: string;
  title: string;
  description: string;
  category: string;
  preview: string;
  icon: string;
}

const CONTENT_TEMPLATES: Template[] = [
  {
    id: "tip",
    title: "Quick Tip",
    description: "Share a valuable insight or hack",
    category: "Educational",
    preview: "🔥 Quick tip:\n\n[Your insight here]\n\nThis will help you [benefit]\n\n#tip #productivity",
    icon: "💡",
  },
  {
    id: "story",
    title: "Story Thread",
    description: "Tell a compelling story",
    category: "Engagement",
    preview: "Let me tell you about the time I [experience]...\n\n🧵 Thread 👇",
    icon: "📖",
  },
  {
    id: "list",
    title: "Listicle",
    description: "Numbered list of tips or insights",
    category: "Educational",
    preview: "5 things I learned about [topic]:\n\n1. [Point one]\n2. [Point two]\n3. [Point three]\n4. [Point four]\n5. [Point five]",
    icon: "📝",
  },
  {
    id: "question",
    title: "Engaging Question",
    description: "Start a conversation",
    category: "Engagement",
    preview: "Hot take:\n\n[Your controversial or interesting opinion]\n\nAgree or disagree? 👇",
    icon: "❓",
  },
  {
    id: "milestone",
    title: "Milestone Update",
    description: "Celebrate achievements",
    category: "Update",
    preview: "Just hit [milestone]! 🎉\n\nHere's what I learned:\n\n[Key takeaway]\n\nThank you to everyone who supported! 🙏",
    icon: "🎯",
  },
  {
    id: "tutorial",
    title: "How-To Guide",
    description: "Step-by-step tutorial",
    category: "Educational",
    preview: "How to [achieve goal] in [timeframe]:\n\nStep 1: [Action]\nStep 2: [Action]\nStep 3: [Action]\n\nResults: [Outcome]",
    icon: "🎓",
  },
  {
    id: "poll",
    title: "Poll Question",
    description: "Get audience feedback",
    category: "Engagement",
    preview: "Quick poll for my followers:\n\nWhat's your biggest challenge with [topic]?\n\nA) [Option 1]\nB) [Option 2]\nC) [Option 3]\nD) [Option 4]",
    icon: "📊",
  },
  {
    id: "behind-scenes",
    title: "Behind the Scenes",
    description: "Share your process",
    category: "Personal",
    preview: "Behind the scenes of [project/task]:\n\n• Started at [time]\n• [Progress update]\n• Current status: [status]\n\nBuilding in public 🚀",
    icon: "🎬",
  },
];

const enhancementMap: Record<string, string> = {
    "improve-grammar": "✨ Enhanced with improved grammar and clarity",
    "translate": "🌍 Translated to English",
    "engaging-hook": "🎣 Added an engaging hook",
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
    
    // Simulate AI generation
    setTimeout(() => {
      let content = "";
      
      if (activeTab === "generate") {
        // Generate from prompt
        content = `🚀 ${prompt}\n\nHere's what I discovered:\n\n• Key insight 1\n• Key insight 2\n• Key insight 3\n\nWhat's your experience with this? 👇\n\n#${prompt.split(" ")[0].toLowerCase()}`;
      } else if (activeTab === "improve") {
        // Improve existing content
        const hasEmojis = currentContent.includes("🚀") || currentContent.includes("✨");
        content = currentContent 
          + (hasEmojis ? "" : " ✨")
          + "\n\nWhat do you think? Drop a comment below! 👇";
      }
      
      setGeneratedContent(content);
      setIsGenerating(false);
      toast({ title: "Content generated!" });
    }, 1500);
  };

  const handleAiEnhancement = (action: string) => {
    // Get the instruction text for the selected action
    const instructionMap: Record<string, string> = {
      'improve-grammar': 'Improve the grammar and clarity of this text while keeping the same meaning and tone:',
      'translate': 'Translate this text to English while maintaining the original meaning and tone:',
      'engaging-hook': 'Rewrite this text to start with an engaging hook that grabs attention:',
      'more-details': 'Expand this text with more details and context while keeping it concise:',
      'engaging': 'Make this text more engaging and interesting to read:',
      'humorous': 'Add humor and wit to this text while keeping the original message:',
      'creative': 'Rewrite this text in a more creative and imaginative way:',
      'sarcastic': 'Rewrite this text with a sarcastic tone while keeping the original meaning:',
      'inspirational': 'Make this text more inspirational and motivational:',
      'concise': 'Make this text more concise while keeping all the important information:'
    };

    const instruction = instructionMap[action] || 'Improve this text:';

    //onApply(instruction);
    setOpen(false);

    toast({
      title: 'Instruction added!',
      description: enhancementMap[action] || 'Instruction has been added',
    });
  };

  const handleApplyTemplate = (template: Template) => {
    setGeneratedContent(template.preview);
    toast({ title: `Applied ${template.title} template` });
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

  const handleQuickImprove = (improvementType: string) => {
    setIsGenerating(true);
    
    setTimeout(() => {
      let improved = currentContent;
      
      switch(improvementType) {
        case "Make it more engaging":
          improved = "🔥 " + currentContent + "\n\nDouble tap if you agree! ❤️";
          break;
        case "Add storytelling":
          improved = "Let me share a story...\n\n" + currentContent + "\n\nAnd that's how I learned this lesson.";
          break;
        case "Shorten and simplify":
          improved = currentContent.split("\n")[0] + " 💡";
          break;
        case "Add emojis":
          improved = "✨ " + currentContent.replace(/\./g, ". 🎯").replace(/!/g, "! 🚀");
          break;
        case "Make it more professional":
          improved = currentContent.replace(/!/g, ".").replace(/🚀|✨|🔥/g, "");
          break;
        case "Add call-to-action":
          improved = currentContent + "\n\n👉 Follow for more tips like this!\n💬 Comment your thoughts below";
          break;
      }
      
      setGeneratedContent(improved);
      setIsGenerating(false);
      toast({ title: "Content improved!" });
    }, 1000);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
                <TabsList className="w-full grid grid-cols-3">
                  <TabsTrigger value="generate" className="text-xs">
                    <Wand2 className="w-3 h-3 mr-1" />
                    Generate
                  </TabsTrigger>
                  <TabsTrigger value="improve" className="text-xs">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Improve
                  </TabsTrigger>
                  <TabsTrigger value="templates" className="text-xs">
                    <BookTemplate className="w-3 h-3 mr-1" />
                    Templates
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
                            className="justify-start"
                          >
                            {enhancementMap[item]}
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

                {/* Templates Tab */}
                <TabsContent value="templates" className="mt-0">
                  <div className="space-y-3">
                    {CONTENT_TEMPLATES.map((template) => (
                      <Card
                        key={template.id}
                        className="p-4 cursor-pointer hover:border-orange-500 hover:shadow-md transition-all"
                        onClick={() => handleApplyTemplate(template)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="text-2xl">{template.icon}</div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-sm">{template.title}</h4>
                              <Badge variant="secondary" className="text-xs">
                                {template.category}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mb-2">
                              {template.description}
                            </p>
                            <div className="flex items-center text-xs text-orange-600">
                              Use template
                              <ArrowRight className="w-3 h-3 ml-1" />
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
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
