import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Globe, FileText, Rss, Settings, Trash2 } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  description: string;
  platforms: string[];
  contentSources: number;
  lastGenerated: string;
  status: 'active' | 'paused' | 'draft';
}

interface ContentSource {
  id: string;
  name: string;
  type: 'blog' | 'changelog' | 'rss' | 'webhook';
  url: string;
  lastFetch: string;
  status: 'active' | 'inactive';
}

interface ContentSourcesProps {
  project: Project;
}

const mockSources: ContentSource[] = [
  {
    id: '1',
    name: 'Company Blog',
    type: 'blog',
    url: 'https://syncflow.com/blog',
    lastFetch: '2 hours ago',
    status: 'active'
  },
  {
    id: '2',
    name: 'Product Updates',
    type: 'changelog',
    url: 'https://syncflow.com/changelog',
    lastFetch: '1 day ago',
    status: 'active'
  },
  {
    id: '3',
    name: 'Industry News',
    type: 'rss',
    url: 'https://feeds.techcrunch.com/TechCrunch/',
    lastFetch: '5 minutes ago',
    status: 'inactive'
  }
];

export default function ContentSources({ project }: ContentSourcesProps) {
  const [sources, setSources] = useState(mockSources);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSource, setNewSource] = useState({
    name: '',
    type: 'blog' as const,
    url: ''
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'blog': return <FileText className="w-4 h-4" />;
      case 'changelog': return <Settings className="w-4 h-4" />;
      case 'rss': return <Rss className="w-4 h-4" />;
      case 'webhook': return <Globe className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'blog': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'changelog': return 'bg-green-100 text-green-800 border-green-200';
      case 'rss': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'webhook': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleAddSource = () => {
    if (newSource.name && newSource.url) {
      const source: ContentSource = {
        id: Date.now().toString(),
        ...newSource,
        lastFetch: 'Never',
        status: 'active'
      };
      setSources([...sources, source]);
      setNewSource({ name: '', type: 'blog', url: '' });
      setShowAddForm(false);
    }
  };

  const handleDeleteSource = (id: string) => {
    setSources(sources.filter(s => s.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Content Sources</h2>
          <p className="text-muted-foreground">
            Configure where your content comes from for {project.name}
          </p>
        </div>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Source
        </Button>
      </div>

      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Content Source</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="source-name">Source Name</Label>
                <Input
                  id="source-name"
                  placeholder="e.g., Company Blog"
                  value={newSource.name}
                  onChange={(e) => setNewSource({...newSource, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="source-type">Source Type</Label>
                <Select 
                  value={newSource.type} 
                  onValueChange={(value: any) => setNewSource({...newSource, type: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="blog">Blog Posts</SelectItem>
                    <SelectItem value="changelog">Changelog</SelectItem>
                    <SelectItem value="rss">RSS Feed</SelectItem>
                    <SelectItem value="webhook">Webhook</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="source-url">URL</Label>
              <Input
                id="source-url"
                placeholder="https://example.com/blog"
                value={newSource.url}
                onChange={(e) => setNewSource({...newSource, url: e.target.value})}
              />
            </div>
            <div className="flex space-x-2">
              <Button onClick={handleAddSource}>Add Source</Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {sources.map((source) => (
          <Card key={source.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    {getTypeIcon(source.type)}
                  </div>
                  <div>
                    <h3 className="font-semibold">{source.name}</h3>
                    <p className="text-sm text-muted-foreground">{source.url}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge variant="outline" className={getTypeColor(source.type)}>
                    {source.type}
                  </Badge>
                  <Badge variant={source.status === 'active' ? 'default' : 'secondary'}>
                    {source.status}
                  </Badge>
                  <div className="text-sm text-muted-foreground">
                    Last fetch: {source.lastFetch}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteSource(source.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}