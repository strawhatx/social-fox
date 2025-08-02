import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description: string;
  platforms: string[];
  content_sources: number;
  last_generated: string | null;
  status: 'active' | 'paused' | 'draft';
  brand_voice: string;
  target_audience: string;
  automation_enabled: boolean;
  automation_frequency: string;
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
  created_at: string;
  updated_at: string;
}

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchProjects = async () => {
    if (!user) {
      setProjects([]);
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('projects' as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformedProjects: Project[] = (data || []).map((project: any) => ({
        id: project.id,
        user_id: project.user_id,
        name: project.name,
        description: project.description || '',
        platforms: project.platforms || [],
        content_sources: 0,
        last_generated: project.last_generated,
        status: project.status,
        brand_voice: project.brand_voice || '',
        target_audience: project.target_audience || '',
        automation_enabled: project.automation_enabled || false,
        automation_frequency: project.automation_frequency || 'daily',
        roles: {
          brand_builder: project.role_brand_builder || false,
          content_creator: project.role_content_creator || false,
          audience_researcher: project.role_audience_researcher || false,
          campaign_planner: project.role_campaign_planner || false,
          channel_manager: project.role_channel_manager || false,
          analytics_tracker: project.role_analytics_tracker || false,
          lead_generator: project.role_lead_generator || false,
          community_engager: project.role_community_engager || false,
          growth_hacker: project.role_growth_hacker || false,
        },
        created_at: project.created_at,
        updated_at: project.updated_at,
      }));

      setProjects(transformedProjects);
    } catch (error: any) {
      console.error('Error fetching projects:', error);
      toast({
        title: "Error",
        description: "Failed to load projects. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (projectData: Partial<Project>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('projects' as any)
        .insert([
          {
            user_id: user.id,
            name: projectData.name,
            description: projectData.description,
            platforms: projectData.platforms || [],
            brand_voice: projectData.brand_voice,
            target_audience: projectData.target_audience,
            role_brand_builder: projectData.roles?.brand_builder || false,
            role_content_creator: projectData.roles?.content_creator || false,
            role_audience_researcher: projectData.roles?.audience_researcher || false,
            role_campaign_planner: projectData.roles?.campaign_planner || false,
            role_channel_manager: projectData.roles?.channel_manager || false,
            role_analytics_tracker: projectData.roles?.analytics_tracker || false,
            role_lead_generator: projectData.roles?.lead_generator || false,
            role_community_engager: projectData.roles?.community_engager || false,
            role_growth_hacker: projectData.roles?.growth_hacker || false,
          }
        ])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Project created successfully!",
      });

      fetchProjects();
      return data;
    } catch (error: any) {
      console.error('Error creating project:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create project. Please try again.",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateProject = async (id: string, updates: Partial<Project>) => {
    try {
      const { error } = await supabase
        .from('projects' as any)
        .update({
          name: updates.name,
          description: updates.description,
          platforms: updates.platforms,
          brand_voice: updates.brand_voice,
          target_audience: updates.target_audience,
          status: updates.status,
          automation_enabled: updates.automation_enabled,
          automation_frequency: updates.automation_frequency,
          role_brand_builder: updates.roles?.brand_builder,
          role_content_creator: updates.roles?.content_creator,
          role_audience_researcher: updates.roles?.audience_researcher,
          role_campaign_planner: updates.roles?.campaign_planner,
          role_channel_manager: updates.roles?.channel_manager,
          role_analytics_tracker: updates.roles?.analytics_tracker,
          role_lead_generator: updates.roles?.lead_generator,
          role_community_engager: updates.roles?.community_engager,
          role_growth_hacker: updates.roles?.growth_hacker,
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Project updated successfully!",
      });

      fetchProjects();
    } catch (error: any) {
      console.error('Error updating project:', error);
      toast({
        title: "Error",
        description: "Failed to update project. Please try again.",
        variant: "destructive",
      });
    }
  };

  const deleteProject = async (id: string) => {
    try {
      const { error } = await supabase
        .from('projects' as any)
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Project deleted successfully!",
      });

      fetchProjects();
    } catch (error: any) {
      console.error('Error deleting project:', error);
      toast({
        title: "Error",
        description: "Failed to delete project. Please try again.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [user]);

  return {
    projects,
    loading,
    createProject,
    updateProject,
    deleteProject,
    refetch: fetchProjects,
  };
};