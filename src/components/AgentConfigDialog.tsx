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
  const { upsertConfig, getConfig, refetch } = useAgentConfigs(projectId);
  const { initiateGoogleAuth, getAuthorizingState } = useGoogleAuth(projectId);

  // Load existing configuration when dialog opens
  useEffect(() => {
    if (open && agentType === 'lead_generator') {
      const config = getConfig(agentType);
      
      if (config?.config_data) {
        // Check for Google Sheets OAuth config - check for either user_email or access_token
        if (config.config_data.google_sheets?.user_email || config.config_data.google_sheets?.access_token) {
          setAuthorizedSheets({
            email: config.config_data.google_sheets.user_email || 'Google Account',
            name: config.config_data.google_sheets.user_name || 'Authorized User'
          });
        }
        
        // Check for Gmail OAuth config - check for either user_email or access_token  
        if (config.config_data.gmail?.user_email || config.config_data.gmail?.access_token) {
          setAuthorizedGmail({
            email: config.config_data.gmail.user_email || 'Google Account',
            name: config.config_data.gmail.user_name || 'Authorized User'
          });
        }
        
        // Load user settings
        setGoogleSheetsUrl(config.config_data.google_sheets?.url || '');
        setSheetName(config.config_data.google_sheets?.sheet_name || '');
      }
    }
  }, [open, agentType]); // Removed getConfig from dependencies to prevent constant re-runs

  const handleSave = async () => {
    try {
      if (agentType === 'lead_generator') {
        // Save Google Sheets configuration
        if (googleSheetsUrl && sheetName) {
          await upsertConfig(agentType, {
            google_sheets: {
              url: googleSheetsUrl,
              sheet_name: sheetName,
              ...authorizedSheets && {
                user_email: authorizedSheets.email,
                user_name: authorizedSheets.name
              }
            }
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
      await initiateGoogleAuth(agentType, 'Google Sheets');
      // The user info will be updated through the OAuth callback
      // For now, set a placeholder to indicate authorization is in progress
      setAuthorizedSheets({ email: 'pending...', name: 'Authorizing...' });
      
      // Reload config after a short delay to get updated data
      setTimeout(async () => {
        await refetch();
        const config = getConfig(agentType);
        if (config?.config_data?.google_sheets?.user_email) {
          setAuthorizedSheets({
            email: config.config_data.google_sheets.user_email,
            name: config.config_data.google_sheets.user_name || 'Google User'
          });
        }
      }, 2000);
    } catch (error) {
      console.error('Google Sheets authorization failed:', error);
      setAuthorizedSheets(null);
    }
  };

  const handleGmailAuthorize = async () => {
    try {
      await initiateGoogleAuth(agentType, 'Gmail');
      // The user info will be updated through the OAuth callback
      setAuthorizedGmail({ email: 'pending...', name: 'Authorizing...' });
      
      // Reload config after a short delay to get updated data
      setTimeout(async () => {
        await refetch();
        const config = getConfig(agentType);
        if (config?.config_data?.gmail?.user_email) {
          setAuthorizedGmail({
            email: config.config_data.gmail.user_email,
            name: config.config_data.gmail.user_name || 'Google User'
          });
        }
      }, 2000);
    } catch (error) {
      console.error('Gmail authorization failed:', error);
      setAuthorizedGmail(null);
    }
  };

  const renderLeadGeneratorConfig = () => (
    <div className="space-y-6">
      {/* Google Sheets Authorization */}
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium mb-2">Google Sheets Authorization</h4>
          {authorizedSheets ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <div className="flex-1">
                  <span className="text-sm font-medium text-green-800">Authorized</span>
                  <p className="text-xs text-green-600">{authorizedSheets.email}</p>
                </div>
              </div>
              <Button 
                onClick={handleGoogleSheetsAuthorize}
                variant="outline"
                disabled={getAuthorizingState(agentType, 'Google Sheets')}
                className="w-full"
                size="sm"
              >
                {getAuthorizingState(agentType, 'Google Sheets') ? 'Reauthorizing...' : 'Reauthorize'}
              </Button>
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
                disabled={getAuthorizingState(agentType, 'Google Sheets')}
                className="w-full"
              >
                {getAuthorizingState(agentType, 'Google Sheets') ? 'Authorizing...' : 'Authorize Google Sheets'}
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
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <div className="flex-1">
                  <span className="text-sm font-medium text-green-800">Authorized</span>
                  <p className="text-xs text-green-600">{authorizedGmail.email}</p>
                </div>
              </div>
              <Button 
                onClick={handleGmailAuthorize}
                variant="outline"
                disabled={getAuthorizingState(agentType, 'Gmail')}
                className="w-full"
                size="sm"
              >
                {getAuthorizingState(agentType, 'Gmail') ? 'Reauthorizing...' : 'Reauthorize'}
              </Button>
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
                disabled={getAuthorizingState(agentType, 'Gmail')}
                className="w-full"
              >
                {getAuthorizingState(agentType, 'Gmail') ? 'Authorizing...' : 'Authorize Gmail'}
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
                onChange={(e) => {
                  console.log('URL input changed:', e.target.value);
                  setGoogleSheetsUrl(e.target.value);
                }}
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
            disabled={!authorizedSheets || !googleSheetsUrl || !sheetName}
          >
            Save Configuration
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}