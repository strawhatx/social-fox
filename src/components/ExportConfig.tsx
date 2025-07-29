import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Database, Webhook, Table, Key, TestTube, Download } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  description: string;
  platforms: string[];
  contentSources: number;
  lastGenerated: string;
  status: 'active' | 'paused' | 'draft';
}

interface ExportDestination {
  id: string;
  name: string;
  type: 'supabase' | 'airtable' | 'webhook';
  enabled: boolean;
  config: any;
}

interface ExportConfigProps {
  project: Project;
}

export default function ExportConfig({ project }: ExportConfigProps) {
  const [gptApiKey, setGptApiKey] = useState('');
  const [destinations, setDestinations] = useState<ExportDestination[]>([
    {
      id: '1',
      name: 'Supabase Database',
      type: 'supabase',
      enabled: true,
      config: {
        url: 'https://your-project.supabase.co',
        key: '',
        table: 'generated_content'
      }
    },
    {
      id: '2',
      name: 'Airtable Base',
      type: 'airtable',
      enabled: false,
      config: {
        baseId: '',
        tableId: '',
        apiKey: ''
      }
    },
    {
      id: '3',
      name: 'Webhook Endpoint',
      type: 'webhook',
      enabled: false,
      config: {
        url: '',
        method: 'POST',
        headers: {}
      }
    }
  ]);

  const toggleDestination = (id: string) => {
    setDestinations(destinations.map(d => 
      d.id === id ? { ...d, enabled: !d.enabled } : d
    ));
  };

  const updateDestinationConfig = (id: string, config: any) => {
    setDestinations(destinations.map(d => 
      d.id === id ? { ...d, config: { ...d.config, ...config } } : d
    ));
  };

  const getDestinationIcon = (type: string) => {
    switch (type) {
      case 'supabase': return <Database className="w-5 h-5" />;
      case 'airtable': return <Table className="w-5 h-5" />;
      case 'webhook': return <Webhook className="w-5 h-5" />;
      default: return <Database className="w-5 h-5" />;
    }
  };

  const getDestinationColor = (type: string) => {
    switch (type) {
      case 'supabase': return 'bg-green-100 text-green-800';
      case 'airtable': return 'bg-yellow-100 text-yellow-800';
      case 'webhook': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Export Configuration</h2>
          <p className="text-muted-foreground">
            Configure API keys and export destinations for {project.name}
          </p>
        </div>
        <Button>
          <Download className="w-4 h-4 mr-2" />
          Export Flow JSON
        </Button>
      </div>

      {/* GPT-4 API Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Key className="w-5 h-5" />
            <span>OpenAI GPT-4 Configuration</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="gpt-api-key">API Key</Label>
            <Input
              id="gpt-api-key"
              type="password"
              placeholder="sk-..."
              value={gptApiKey}
              onChange={(e) => setGptApiKey(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Your OpenAI API key is required for content generation
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <TestTube className="w-4 h-4 mr-2" />
              Test Connection
            </Button>
            <Button variant="outline" size="sm">
              Usage Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Export Destinations */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Export Destinations</h3>
        
        {destinations.map((destination) => (
          <Card key={destination.id} className={`border-l-4 ${destination.enabled ? 'border-l-primary' : 'border-l-muted'}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    {getDestinationIcon(destination.type)}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{destination.name}</CardTitle>
                    <Badge className={getDestinationColor(destination.type)}>
                      {destination.type}
                    </Badge>
                  </div>
                </div>
                <Switch
                  checked={destination.enabled}
                  onCheckedChange={() => toggleDestination(destination.id)}
                />
              </div>
            </CardHeader>

            {destination.enabled && (
              <CardContent className="space-y-4">
                {destination.type === 'supabase' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Supabase URL</Label>
                        <Input
                          value={destination.config.url}
                          onChange={(e) => updateDestinationConfig(destination.id, { url: e.target.value })}
                          placeholder="https://your-project.supabase.co"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Table Name</Label>
                        <Input
                          value={destination.config.table}
                          onChange={(e) => updateDestinationConfig(destination.id, { table: e.target.value })}
                          placeholder="generated_content"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Service Role Key</Label>
                      <Input
                        type="password"
                        value={destination.config.key}
                        onChange={(e) => updateDestinationConfig(destination.id, { key: e.target.value })}
                        placeholder="eyJ..."
                      />
                    </div>
                  </>
                )}

                {destination.type === 'airtable' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Base ID</Label>
                        <Input
                          value={destination.config.baseId}
                          onChange={(e) => updateDestinationConfig(destination.id, { baseId: e.target.value })}
                          placeholder="app..."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Table ID</Label>
                        <Input
                          value={destination.config.tableId}
                          onChange={(e) => updateDestinationConfig(destination.id, { tableId: e.target.value })}
                          placeholder="tbl..."
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>API Key</Label>
                      <Input
                        type="password"
                        value={destination.config.apiKey}
                        onChange={(e) => updateDestinationConfig(destination.id, { apiKey: e.target.value })}
                        placeholder="pat..."
                      />
                    </div>
                  </>
                )}

                {destination.type === 'webhook' && (
                  <>
                    <div className="space-y-2">
                      <Label>Webhook URL</Label>
                      <Input
                        value={destination.config.url}
                        onChange={(e) => updateDestinationConfig(destination.id, { url: e.target.value })}
                        placeholder="https://your-webhook-endpoint.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Method</Label>
                      <Select 
                        value={destination.config.method}
                        onValueChange={(value) => updateDestinationConfig(destination.id, { method: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="POST">POST</SelectItem>
                          <SelectItem value="PUT">PUT</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <TestTube className="w-4 h-4 mr-2" />
                    Test Connection
                  </Button>
                  <Button variant="outline" size="sm">
                    View Schema
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}