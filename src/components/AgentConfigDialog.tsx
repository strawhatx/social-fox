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

  const renderLeadGeneratorConfig = () => (
    <div className="space-y-6">
      {/* OAuth Configuration */}
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium mb-2">OAuth Configuration</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Global OAuth settings for all users enabling Lead Generator
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="oauth-client-id">OAuth Client ID</Label>
          <Input
            id="oauth-client-id"
            value={oauthClientId}
            onChange={(e) => setOauthClientId(e.target.value)}
            placeholder={oauthConfig?.config_data?.client_id ? "••••••••" : "Enter OAuth Client ID"}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="oauth-client-secret">OAuth Client Secret</Label>
          <Input
            id="oauth-client-secret"
            type="password"
            value={oauthClientSecret}
            onChange={(e) => setOauthClientSecret(e.target.value)}
            placeholder={oauthConfig?.config_data?.client_secret ? "••••••••" : "Enter OAuth Client Secret"}
          />
        </div>
      </div>

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
          <strong>Note:</strong> Gmail integration requires no additional configuration.
        </p>
      </div>
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