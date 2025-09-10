"use client";

import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { QUICK_TEMPLATES } from '@/lib/copilot';

interface TemplateSelectorProps {
  onTemplateSelect: (prompt: string) => void;
}

export function TemplateSelector({ onTemplateSelect }: TemplateSelectorProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Quick Templates</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {QUICK_TEMPLATES.map(template => (
          <div key={template.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{template.label}</p>
                <p className="text-sm text-muted-foreground">{template.prompt}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onTemplateSelect(template.prompt)}
              >
                Use
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}