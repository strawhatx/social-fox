import { Outlet, useLocation, useParams, Link } from 'react-router-dom';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const stepOrder = [
  { key: 'basics', path: '/create-project', label: 'Basics' },
  { key: 'brand', path: (id: string) => `/create-project/${id}/brand`, label: 'Brand' },
  { key: 'github', path: (id: string) => `/create-project/${id}/github`, label: 'GitHub' },
  { key: 'style', path: (id: string) => `/create-project/${id}/style`, label: 'Style' },
  { key: 'finalize', path: (id: string) => `/create-project/${id}/finalize`, label: 'Finish' },
];

const WizardLayout = () => {
  const location = useLocation();
  const { projectId } = useParams();

  const getStepIndex = (): number => {
    const pathname = location.pathname;
    if (pathname.includes('/finalize')) return 5;
    if (pathname.includes('/style')) return 4;
    if (pathname.includes('/github')) return 3;
    if (pathname.includes('/brand')) return 2;
    // If it matches /create-project/[projectId] (step 1)
    if (pathname.match(/^\/create-project\/[^\/]+$/)) return 1;
    return 1;
  };

  const currentStep = getStepIndex();
  const totalSteps = 5;
  const progress = (currentStep / totalSteps) * 100;

  const prevPath = () => {
    switch (currentStep) {
      case 2:
        return projectId ? `/create-project/${projectId}` : '/';
      case 3:
        return projectId ? `/create-project/${projectId}/brand` : '/';
      case 4:
        return projectId ? `/create-project/${projectId}/github` : '/';
      case 5:
        return projectId ? `/create-project/${projectId}/style` : '/';
      default:
        return '/';
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Create New Project</h1>
          <span className="text-sm text-muted-foreground">Step {currentStep} of {totalSteps}</span>
        </div>
        <Progress value={progress} className="mb-4" />
        {currentStep > 1 && (
          <div className="mb-2">
            <Link to={prevPath()}>
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" /> Back
              </Button>
            </Link>
          </div>
        )}
      </div>

      <Outlet />
    </div>
  );
};

export default WizardLayout;


