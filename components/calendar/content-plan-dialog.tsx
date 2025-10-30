import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "../ui/dialog"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../ui/select"
import { Label } from "../ui/label"
import { Input } from "../ui/input"
import { Textarea } from "../ui/textarea"
import { Button } from "../ui/button"
import { Plus, Sparkles, Lock } from "lucide-react"
import { useState } from "react"
import { useSubscription } from "@/hooks/use-subscription"
import { SUBSCRIPTION_PLANS } from "@/lib/subscription-plans"

interface ContentPlanDialogProps {
    onGeneratePlan: (audience: string, subject: string, tone: string, goals: string, mediaMode: 'text' | 'images' | 'gifs') => void;
}

export default function ContentPlanDialog({ onGeneratePlan }: ContentPlanDialogProps): JSX.Element {
    const [open, setOpen] = useState(false);
    const [planSubject, setPlanSubject] = useState('');
    const [planAudience, setPlanAudience] = useState('');
    const [planTone, setPlanTone] = useState('');
    const [planGoals, setPlanGoals] = useState('');
    const [mediaMode, setMediaMode] = useState<'text' | 'images' | 'gifs'>('text');
    const { subscription, loading } = useSubscription();

    const handleGeneratePlan = async () => {
        onGeneratePlan(planAudience, planSubject, planTone, planGoals, mediaMode);
    };

    // Get available media types based on subscription plan
    const getAvailableMediaTypes = () => {
        if (loading || !subscription) return [{ value: 'text', label: 'Text Only', disabled: false }];
        
        const plan = subscription.plan as 'launch' | 'grow' | 'scale';
        const planDetails = SUBSCRIPTION_PLANS[plan];
        const mediaTypesLimit = planDetails?.limits?.mediaTypes;
        const allowedMediaTypes = Array.isArray(mediaTypesLimit) ? mediaTypesLimit : ['text'];
        
        const allMediaTypes = [
            { value: 'text', label: 'Text Only' },
            { value: 'images', label: 'Images' },
            { value: 'gifs', label: 'GIFs' }
        ];
        
        return allMediaTypes.map(type => ({
            ...type,
            disabled: !allowedMediaTypes.includes(type.value as 'text' | 'images' | 'gifs')
        }));
    };

    const availableMediaTypes = getAvailableMediaTypes();

    return (
        <>


            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button
                        variant="default"
                        className="bg-black hover:bg-black/90 text-white px-6 py-2 rounded-lg shadow-sm"
                        onClick={() => setOpen(true)}
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Generate 30 Day Plan
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[550px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-orange-600" />
                            Generate Your 30-Day Content Plan
                        </DialogTitle>
                        <DialogDescription>
                            Tell us about your content goals and we&apos;ll create a personalized 30-day posting schedule with AI-generated ideas.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="subject" className="text-sm font-medium">
                                What will your posts be about? <span className="text-red-500">*</span>
                            </Label>
                            <Textarea
                                id="subject"
                                placeholder="E.g., Tech startup insights, fitness tips, sustainable living, web development tutorials..."
                                value={planSubject}
                                onChange={(e) => setPlanSubject(e.target.value)}
                                className="resize-none h-20"
                            />
                            <p className="text-xs text-muted-foreground">
                                Be specific about your niche, topics, or expertise you want to share.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="audience" className="text-sm font-medium">
                                Who is your target audience?
                            </Label>
                            <Input
                                id="audience"
                                placeholder="E.g., Entrepreneurs, fitness enthusiasts, developers..."
                                value={planAudience}
                                onChange={(e) => setPlanAudience(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="tone" className="text-sm font-medium">
                                Content tone
                            </Label>
                            <Select value={planTone} onValueChange={setPlanTone}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="professional">Professional</SelectItem>
                                    <SelectItem value="casual">Casual & Friendly</SelectItem>
                                    <SelectItem value="inspirational">Inspirational</SelectItem>
                                    <SelectItem value="educational">Educational</SelectItem>
                                    <SelectItem value="humorous">Humorous</SelectItem>
                                    <SelectItem value="authoritative">Authoritative</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="mediaMode" className="text-sm font-medium">
                                Media type
                            </Label>
                            <Select value={mediaMode} onValueChange={(value: 'text' | 'images' | 'gifs') => setMediaMode(value)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableMediaTypes.map((type) => (
                                        <SelectItem 
                                            key={type.value} 
                                            value={type.value}
                                            disabled={type.disabled}
                                        >
                                            <div className="flex items-center gap-2">
                                                {type.value === 'text' && <span>📝</span>}
                                                {type.value === 'images' && <span>🖼️</span>}
                                                {type.value === 'gifs' && <span>🎬</span>}
                                                {type.label}
                                                {type.disabled && <Lock className="h-3 w-3 text-gray-400" />}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {subscription && (
                                <p className="text-xs text-muted-foreground">
                                    {subscription.planDetails?.name}: {availableMediaTypes.filter(t => !t.disabled).map(t => t.label).join(' + ')}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="goals" className="text-sm font-medium">
                                Content goals (optional)
                            </Label>
                            <Textarea
                                id="goals"
                                placeholder="E.g., Build thought leadership, drive traffic to blog, increase engagement..."
                                value={planGoals}
                                onChange={(e) => setPlanGoals(e.target.value)}
                                className="resize-none h-16"
                            />
                        </div>

                        {planSubject && (
                            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mt-2">
                                <p className="text-sm text-foreground">
                                    <span className="font-medium">✨ We&apos;ll generate:</span>
                                    <br />
                                    30 unique post ideas tailored to &quot;{planSubject}&quot; with your selected {planTone} tone.
                                    <br />
                                    <span className="text-xs text-muted-foreground">
                                        Media type: {mediaMode === 'text' ? 'Text only' : mediaMode === 'images' ? 'With images' : 'With GIFs'}
                                    </span>
                                </p>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            className="bg-orange-600 hover:bg-orange-700 text-white"
                            onClick={handleGeneratePlan}
                            disabled={!planSubject.trim()}
                        >
                            <Sparkles className="w-4 h-4 mr-2" />
                            Generate Plan
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>

    );
};
