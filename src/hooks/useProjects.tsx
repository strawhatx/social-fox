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
  
  brand_voice: string;
  target_audience: string;
  automation_enabled: boolean;
  automation_frequency: string;
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
        platforms: project.platforms && project.platforms.length > 0 ? project.platforms : ['Twitter', 'LinkedIn'],
        content_sources: 0,
        
        
        brand_voice: project.brand_voice || '',
        target_audience: project.target_audience || '',
        automation_enabled: project.automation_enabled || false,
        automation_frequency: project.automation_frequency || 'daily',
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

    // Check if user already has a project
    if (projects.length >= 1) {
      toast({
        title: "Project Limit Reached",
        description: "You can only have one project. Please delete your existing project to create a new one.",
        variant: "destructive",
      });
      return null;
    }

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
            // role columns removed from schema
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
          automation_enabled: updates.automation_enabled,
          automation_frequency: updates.automation_frequency,
          // role columns removed from schema
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