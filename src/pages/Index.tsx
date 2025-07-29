import { useState } from 'react';
import ProjectDashboard from '@/components/ProjectDashboard';
import ProjectWorkspace from '@/components/ProjectWorkspace';

interface Project {
  id: string;
  name: string;
  description: string;
  platforms: string[];
  contentSources: number;
  lastGenerated: string;
  status: 'active' | 'paused' | 'draft';
}

const Index = () => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  if (selectedProject) {
    return (
      <div className="min-h-screen bg-background p-6">
        <ProjectWorkspace
          project={selectedProject}
          onBack={() => setSelectedProject(null)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <ProjectDashboard onSelectProject={setSelectedProject} />
    </div>
  );
};

export default Index;
