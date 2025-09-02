'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { AuthForm } from '@/components/auth-form';
import { KnowledgeUpload } from '@/components/knowledge-upload';
import { KnowledgeList } from '@/components/knowledge-list';
import { ChatInterface } from '@/components/chat-interface';
import { EmbedCode } from '@/components/embed-code';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogOut, Database, MessageCircle, Code, Sparkles } from 'lucide-react';
import type { User } from '@supabase/supabase-js';

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshKnowledge, setRefreshKnowledge] = useState(0);

  useEffect(() => {
    // Get initial user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const handleUploadSuccess = () => {
    setRefreshKnowledge(prev => prev + 1);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="text-4xl owl-bounce">🦉</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 p-4">
        <AuthForm onAuthSuccess={() => {}} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="text-2xl">🦉</div>
            <div>
              <h1 className="text-xl font-bold">ChatOwl</h1>
              <p className="text-sm text-muted-foreground">Support that never sleeps</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user.email}</span>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Welcome Banner */}
          <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-sm border">
              <Sparkles className="h-5 w-5 text-purple-600" />
              <span className="font-medium">Welcome to your AI helpdesk</span>
            </div>
          </div>

          <Tabs defaultValue="knowledge" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="knowledge" className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                Knowledge
              </TabsTrigger>
              <TabsTrigger value="chat" className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                Chat
              </TabsTrigger>
              <TabsTrigger value="embed" className="flex items-center gap-2">
                <Code className="h-4 w-4" />
                Embed
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Analytics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="knowledge" className="space-y-8">
              <KnowledgeUpload userId={user.id} onUploadSuccess={handleUploadSuccess} />
              <KnowledgeList userId={user.id} refresh={refreshKnowledge} />
            </TabsContent>

            <TabsContent value="chat">
              <ChatInterface userId={user.id} />
            </TabsContent>

            <TabsContent value="embed">
              <EmbedCode userId={user.id} />
            </TabsContent>

            <TabsContent value="analytics">
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🚧</div>
                <h3 className="text-lg font-semibold mb-2">Analytics Coming Soon</h3>
                <p className="text-muted-foreground">
                  We're working on detailed analytics to help you understand your chat performance.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}