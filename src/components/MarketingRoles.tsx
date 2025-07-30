import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { User, MessageCircle, BarChart3, Zap } from 'lucide-react';
import { useProjects } from '@/hooks/useProjects';

interface Project {
  id: string;
  name: string;
  description: string;
  platforms: string[];
  contentSources: number;
  lastGenerated: string;
  status: 'active' | 'paused' | 'draft';
  roles: {
    brand_builder: boolean;
    content_creator: boolean;
    audience_researcher: boolean;
    campaign_planner: boolean;
    channel_manager: boolean;
    analytics_tracker: boolean;
    lead_generator: boolean;
    community_engager: boolean;
    growth_hacker: boolean;
  };
  brandVoice: string;
  targetAudience: string;
}

interface MarketingRolesProps {
  project: Project;
  onProjectUpdate?: (updates: Partial<Project>) => void;
}

const roleDefinitions = {
  content_creator: {
    title: "Content Creator",
    description: "Creates engaging content tailored to target audiences",
    icon: User,
    color: "bg-blue-100 text-blue-600"
  },
  lead_generator: {
    title: "Lead Generator",
    description: "Implements strategies to capture and qualify leads",
    icon: Zap,
    color: "bg-yellow-100 text-yellow-600"
  },
  channel_manager: {
    title: "Channel Manager",
    description: "Manages content delivery across platforms",
    icon: MessageCircle,
    color: "bg-cyan-100 text-cyan-600"
  },
  analytics_tracker: {
    title: "Analytics Tracker",
    description: "Measures marketing performance and insights",
    icon: BarChart3,
    color: "bg-indigo-100 text-indigo-600"
  }
};

export default function MarketingRoles({ project, onProjectUpdate }: MarketingRolesProps) {
  const { updateProject } = useProjects();
  const activeRoles = Object.entries(project.roles).filter(([_, enabled]) => enabled);

  const handleRoleToggle = async (roleKey: string, enabled: boolean) => {
    const updatedRoles = {
      ...project.roles,
      [roleKey]: enabled
    };
    
    await updateProject(project.id, { roles: updatedRoles });
    onProjectUpdate?.({ roles: updatedRoles });
  };

  const handleBrandVoiceChange = async (value: string) => {
    await updateProject(project.id, { brand_voice: value });
    onProjectUpdate?.({ brandVoice: value });
  };

  const handleTargetAudienceChange = async (value: string) => {
    await updateProject(project.id, { target_audience: value });
    onProjectUpdate?.({ targetAudience: value });
  };

  return (
    <div className="space-y-6">
      {/* Brand Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Brand Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="brand-voice">Brand Voice</Label>
            <Textarea
              id="brand-voice"
              value={project.brandVoice || ''}
              onChange={(e) => handleBrandVoiceChange(e.target.value)}
              placeholder="Describe your brand's personality, tone, and communication style..."
              className="min-h-[80px]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="target-audience">Target Audience</Label>
            <Textarea
              id="target-audience"
              value={project.targetAudience || ''}
              onChange={(e) => handleTargetAudienceChange(e.target.value)}
              placeholder="Describe your ideal customer demographics, interests, and characteristics..."
              className="min-h-[80px]"
            />
          </div>
        </CardContent>
      </Card>

      {/* Active Roles Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Active Marketing Roles
            <Badge variant="secondary">{activeRoles.length} of 4 enabled</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(roleDefinitions).map(([roleKey, role]) => {
              const isEnabled = project.roles[roleKey as keyof typeof project.roles];
              const Icon = role.icon;
              
              return (
                <div
                  key={roleKey}
                  className={`p-4 rounded-lg border transition-all ${
                    isEnabled 
                      ? 'border-primary bg-primary/5' 
                      : 'border-muted bg-muted/30'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      isEnabled ? role.color : 'bg-gray-100 text-gray-400'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <Switch 
                      checked={isEnabled}
                      onCheckedChange={(checked) => handleRoleToggle(roleKey, checked)}
                      className="data-[state=checked]:bg-primary"
                    />
                  </div>
                  <h3 className={`font-medium text-sm mb-1 ${
                    isEnabled ? 'text-foreground' : 'text-muted-foreground'
                  }`}>
                    {role.title}
                  </h3>
                  <p className={`text-xs leading-relaxed ${
                    isEnabled ? 'text-muted-foreground' : 'text-muted-foreground/60'
                  }`}>
                    {role.description}
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Role Responsibilities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {activeRoles.map(([roleKey, _]) => {
          const role = roleDefinitions[roleKey as keyof typeof roleDefinitions];
          if (!role) return null; // Skip roles not in definitions
          const Icon = role.icon;
          
          return (
            <Card key={roleKey}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <div className={`w-6 h-6 rounded flex items-center justify-center ${role.color}`}>
                    <Icon className="w-3 h-3" />
                  </div>
                  <span>{role.title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {role.description}
                </p>
                <div className="space-y-2">
                  <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    AI Agent Tasks
                  </h4>
                  <div className="text-sm space-y-1">
                    {roleKey === 'content_creator' && (
                      <div className="space-y-1">
                        <div className="flex items-center text-muted-foreground">
                          <div className="w-1 h-1 bg-primary rounded-full mr-2" />
                          Generate platform-specific content
                        </div>
                        <div className="flex items-center text-muted-foreground">
                          <div className="w-1 h-1 bg-primary rounded-full mr-2" />
                          Adapt messaging for brand voice
                        </div>
                      </div>
                    )}
                    {roleKey === 'lead_generator' && (
                      <div className="space-y-1">
                        <div className="flex items-center text-muted-foreground">
                          <div className="w-1 h-1 bg-primary rounded-full mr-2" />
                          Create lead magnets and landing pages
                        </div>
                        <div className="flex items-center text-muted-foreground">
                          <div className="w-1 h-1 bg-primary rounded-full mr-2" />
                          Qualify and score prospects
                        </div>
                      </div>
                    )}
                    {roleKey === 'channel_manager' && (
                      <div className="space-y-1">
                        <div className="flex items-center text-muted-foreground">
                          <div className="w-1 h-1 bg-primary rounded-full mr-2" />
                          Schedule posts across platforms
                        </div>
                        <div className="flex items-center text-muted-foreground">
                          <div className="w-1 h-1 bg-primary rounded-full mr-2" />
                          Monitor posting times
                        </div>
                      </div>
                    )}
                    {roleKey === 'analytics_tracker' && (
                      <div className="space-y-1">
                        <div className="flex items-center text-muted-foreground">
                          <div className="w-1 h-1 bg-primary rounded-full mr-2" />
                          Track performance metrics
                        </div>
                        <div className="flex items-center text-muted-foreground">
                          <div className="w-1 h-1 bg-primary rounded-full mr-2" />
                          Generate insights reports
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}