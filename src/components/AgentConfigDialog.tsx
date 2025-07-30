import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAgentConfigs } from '@/hooks/useAgentConfigs';
import { useGoogleAuth, GoogleAuthUser } from '@/hooks/useGoogleAuth';
import { CheckCircle } from 'lucide-react';
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
  const [googleSheetsUrl, setGoogleSheetsUrl] = useState('');
  const [sheetName, setSheetName] = useState('');
  const [authorizedSheets, setAuthorizedSheets] = useState<GoogleAuthUser | null>(null);
  const [authorizedGmail, setAuthorizedGmail] = useState<GoogleAuthUser | null>(null);
  const { toast } = useToast();
  const { upsertConfig, getConfig } = useAgentConfigs(projectId);
  const { initiateGoogleAuth, isAuthorizing } = useGoogleAuth(projectId);

  // Load existing configuration when dialog opens
  useEffect(() => {
    if (open && agentType === 'lead_generator') {
      // Check for Google Sheets OAuth config
      const sheetsOAuthConfig = getConfig(agentType, 'oauth_sheets');
      const gmailOAuthConfig = getConfig(agentType, 'oauth_gmail');
      const userConfig = getConfig(agentType, 'user_settings');
      
      if (sheetsOAuthConfig?.config_data) {
        setAuthorizedSheets({
          email: sheetsOAuthConfig.config_data.user_email || '',
          name: sheetsOAuthConfig.config_data.user_name || ''
        });
      }
      
      if (gmailOAuthConfig?.config_data) {
        setAuthorizedGmail({
          email: gmailOAuthConfig.config_data.user_email || '',
          name: gmailOAuthConfig.config_data.user_name || ''
        });
      }
      
      if (userConfig) {
        setGoogleSheetsUrl(userConfig.config_data.google_sheets_url || '');
        setSheetName(userConfig.config_data.sheet_name || '');
      }
    }
  }, [open, agentType, getConfig]);

  const handleSave = async () => {
    try {
      if (agentType === 'lead_generator') {
        // Save user settings (Google Sheets URL and sheet name)
        if (googleSheetsUrl && sheetName) {
          await upsertConfig(agentType, 'user_settings', {
            google_sheets_url: googleSheetsUrl,
            sheet_name: sheetName,
          });
        }
      }
      
      toast({
        title: "Configuration Saved",
        description: "Agent configuration has been updated successfully.",
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving configuration:', error);
      toast({
        title: "Error",
        description: "Failed to save configuration. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleGoogleSheetsAuthorize = async () => {
    try {
      const user = await initiateGoogleAuth(agentType, 'Google Sheets');
      setAuthorizedSheets(user);
    } catch (error) {
      console.error('Google Sheets authorization failed:', error);
    }
  };

  const handleGmailAuthorize = async () => {
    try {
      const user = await initiateGoogleAuth(agentType, 'Gmail');
      setAuthorizedGmail(user);
    } catch (error) {
      console.error('Gmail authorization failed:', error);
    }
  };

  const renderLeadGeneratorConfig = () => (
    <div className="space-y-6">
      {/* Google Sheets Authorization */}
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium mb-2">Google Sheets Authorization</h4>
          {authorizedSheets ? (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <div className="flex-1">
                <span className="text-sm font-medium text-green-800">Authorized</span>
                <p className="text-xs text-green-600">{authorizedSheets.email}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="text-sm text-orange-800">Not authorized</span>
              </div>
              <Button 
                onClick={handleGoogleSheetsAuthorize}
                variant="outline"
                disabled={isAuthorizing}
                className="w-full"
              >
                {isAuthorizing ? 'Authorizing...' : 'Authorize Google Sheets'}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Gmail Authorization */}
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium mb-2">Gmail Authorization</h4>
          {authorizedGmail ? (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <div className="flex-1">
                <span className="text-sm font-medium text-green-800">Authorized</span>
                <p className="text-xs text-green-600">{authorizedGmail.email}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="text-sm text-orange-800">Not authorized</span>
              </div>
              <Button 
                onClick={handleGmailAuthorize}
                variant="outline"
                disabled={isAuthorizing}
                className="w-full"
              >
                {isAuthorizing ? 'Authorizing...' : 'Authorize Gmail'}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Google Sheets Configuration */}
      {authorizedSheets && (
        <>
          <Separator />
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Google Sheets Configuration</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Configure the destination Google Sheet for lead data
              </p>
            </div>
            
            <div>
              <Label htmlFor="google-sheets-url">Google Sheets URL</Label>
              <Input
                id="google-sheets-url"
                type="url"
                placeholder="https://docs.google.com/spreadsheets/d/..."
                value={googleSheetsUrl}
                onChange={(e) => setGoogleSheetsUrl(e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="sheet-name">Sheet Name</Label>
              <Input
                id="sheet-name"
                placeholder="Sheet1"
                value={sheetName}
                onChange={(e) => setSheetName(e.target.value)}
              />
            </div>
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
          <Button 
            onClick={handleSave} 
            disabled={!authorizedSheets || !authorizedGmail || !googleSheetsUrl || !sheetName}
          >
            Save Configuration
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}