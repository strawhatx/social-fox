export type { Project as DatabaseProject } from '@/hooks/useProjects';

// Legacy interface for components that haven't been updated yet
import { Project as DbProject } from '@/hooks/useProjects';

export interface Project {
  id: string;
  name: string;
  description: string;
  platforms: string[];
  contentSources: number;
  
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
  automation_enabled?: boolean;
  automation_frequency?: string;
}

// Utility function to convert database project to legacy format
export const convertDbProjectToLegacy = (dbProject: DbProject): Project => ({
  id: dbProject.id,
  name: dbProject.name,
  description: dbProject.description,
  platforms: dbProject.platforms,
  contentSources: dbProject.content_sources,
  
  roles: dbProject.roles,
  brandVoice: dbProject.brand_voice,
  targetAudience: dbProject.target_audience,
  automation_enabled: dbProject.automation_enabled,
  automation_frequency: dbProject.automation_frequency
});

// Utility function to convert legacy project to database format
export const convertLegacyToDbProject = (legacyProject: Partial<Project>): Partial<DbProject> => ({
  id: legacyProject.id,
  name: legacyProject.name,
  description: legacyProject.description,
  platforms: legacyProject.platforms,
  brand_voice: legacyProject.brandVoice,
  target_audience: legacyProject.targetAudience,
  roles: legacyProject.roles,
  automation_enabled: legacyProject.automation_enabled,
  automation_frequency: legacyProject.automation_frequency,
});