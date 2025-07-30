import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAgentConfigs } from '@/hooks/useAgentConfigs';
import { Separator } from '@/components/ui/separator';

interface AgentConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agentType: string;
  agentTitle: string;
  projectId: string;
}

export function AgentConfigDialog({ 
  open, 
  onOpenChange, 
  agentType, 
  agentTitle, 
  projectId 
}: AgentConfigDialogProps) {
  const { upsertConfig, getConfig } = useAgentConfigs(projectId);
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Lead Generator specific state
  const [oauthClientId, setOauthClientId] = useState('');
  const [oauthClientSecret, setOauthClientSecret] = useState('');
  const [googleSheetsUrl, setGoogleSheetsUrl] = useState('');
  const [sheetName, setSheetName] = useState('');

  // Load existing configs
  const oauthConfig = getConfig(agentType, 'oauth');
  const googleSheetsConfig = getConfig(agentType, 'google_sheets');

  const handleSave = async () => {
    setLoading(true);
    try {
      if (agentType === 'lead_generator') {
        // Save OAuth config if provided
        if (oauthClientId || oauthClientSecret) {
          const { error: oauthError } = await upsertConfig(agentType, 'oauth', {
            client_id: oauthClientId,
            client_secret: oauthClientSecret,
          });
          if (oauthError) throw oauthError;
        }

        // Save Google Sheets config if provided
        if (googleSheetsUrl || sheetName) {
          const { error: sheetsError } = await upsertConfig(agentType, 'google_sheets', {
            document_url: googleSheetsUrl,
            sheet_name: sheetName,
          });
          if (sheetsError) throw sheetsError;
        }
      }

      toast({
        title: "Configuration saved",
        description: `${agentTitle} has been configured successfully.`,
      });
      
      onOpenChange(false);
      
      // Reset form
      setOauthClientId('');
      setOauthClientSecret('');
      setGoogleSheetsUrl('');
      setSheetName('');
    } catch (error) {
      console.error('Error saving agent config:', error);
      toast({
        title: "Error",
        description: "Failed to save configuration. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const isAuthorized = oauthConfig?.config_data?.access_token;

  const handleGoogleAuthorize = () => {
    // TODO: Implement Google OAuth flow
    // This would typically redirect to Google's OAuth consent screen
    toast({
      title: "OAuth Authorization",
      description: "Google OAuth integration coming soon!",
    });
  };

  const renderLeadGeneratorConfig = () => (
    <div className="space-y-6">
      {/* Google Authorization */}
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium mb-2">Google Authorization</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Authorize access to Google Sheets and Gmail for lead management
          </p>
        </div>
        
        {!isAuthorized ? (
          <Button onClick={handleGoogleAuthorize} className="w-full">
            Authorize Google Account
          </Button>
        ) : (
          <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-green-700 dark:text-green-300">
              Google account authorized
            </span>
          </div>
        )}
      </div>

      {isAuthorized && (
        <>
          <Separator />

          {/* Google Sheets Configuration */}
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Google Sheets Configuration</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Configure the destination Google Sheet for lead data
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="sheets-url">Google Sheets Document URL</Label>
              <Input
                id="sheets-url"
                value={googleSheetsUrl}
                onChange={(e) => setGoogleSheetsUrl(e.target.value)}
                placeholder={googleSheetsConfig?.config_data?.document_url || "https://docs.google.com/spreadsheets/d/..."}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="sheet-name">Sheet Name</Label>
              <Input
                id="sheet-name"
                value={sheetName}
                onChange={(e) => setSheetName(e.target.value)}
                placeholder={googleSheetsConfig?.config_data?.sheet_name || "Sheet1"}
              />
            </div>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Note:</strong> Gmail integration is automatically configured after Google authorization.
            </p>
          </div>
        </>
      )}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Configure {agentTitle}</DialogTitle>
          <DialogDescription>
            Set up the configuration for {agentTitle} agent.
          </DialogDescription>
        </DialogHeader>

        {agentType === 'lead_generator' && renderLeadGeneratorConfig()}

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save Configuration"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}