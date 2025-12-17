import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Plus, Trash2, Youtube, Instagram } from 'lucide-react';

const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
  </svg>
);

const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

interface SocialConnection {
  id: string;
  platform: string;
  webhook_url: string;
  is_active: boolean;
}

const PLATFORMS = [
  { id: 'youtube', name: 'YouTube', icon: Youtube },
  { id: 'tiktok', name: 'TikTok', icon: TikTokIcon },
  { id: 'instagram', name: 'Instagram', icon: Instagram },
  { id: 'linkedin', name: 'LinkedIn', icon: LinkedInIcon },
];

const Settings = () => {
  const [connections, setConnections] = useState<SocialConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('social_connections')
      .select('*')
      .eq('user_id', user.id);
    
    if (!error && data) {
      setConnections(data);
    }
    setLoading(false);
  };

  const addConnection = async (platform: string) => {
    if (!user) return;
    setSaving(platform);
    
    const { data, error } = await supabase
      .from('social_connections')
      .insert({
        user_id: user.id,
        platform,
        webhook_url: '',
        is_active: false
      })
      .select()
      .single();

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else if (data) {
      setConnections([...connections, data]);
      toast({ title: 'Added', description: `${platform} connection added` });
    }
    setSaving(null);
  };

  const updateConnection = async (id: string, updates: Partial<SocialConnection>) => {
    setSaving(id);
    const { error } = await supabase
      .from('social_connections')
      .update(updates)
      .eq('id', id);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      setConnections(connections.map(c => c.id === id ? { ...c, ...updates } : c));
      toast({ title: 'Saved', description: 'Connection updated' });
    }
    setSaving(null);
  };

  const deleteConnection = async (id: string) => {
    const { error } = await supabase
      .from('social_connections')
      .delete()
      .eq('id', id);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      setConnections(connections.filter(c => c.id !== id));
      toast({ title: 'Deleted', description: 'Connection removed' });
    }
  };

  const getPlatformIcon = (platformId: string) => {
    const platform = PLATFORMS.find(p => p.id === platformId);
    if (!platform) return null;
    const Icon = platform.icon;
    return <Icon className="h-4 w-4" />;
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/40 bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-semibold">Settings</h1>
        </div>
      </header>

      <main className="container py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Auto-Post Connections</CardTitle>
            <CardDescription>
              Connect your Zapier webhooks to enable automatic posting to each platform
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {loading ? (
              <div className="text-muted-foreground">Loading...</div>
            ) : (
              <>
                {connections.map((conn) => (
                  <div key={conn.id} className="space-y-3 p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getPlatformIcon(conn.platform)}
                        <span className="font-medium capitalize">{conn.platform}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={conn.is_active}
                          onCheckedChange={(checked) => updateConnection(conn.id, { is_active: checked })}
                          disabled={!conn.webhook_url}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteConnection(conn.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Zapier Webhook URL</Label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="https://hooks.zapier.com/..."
                          value={conn.webhook_url}
                          onChange={(e) => setConnections(connections.map(c => 
                            c.id === conn.id ? { ...c, webhook_url: e.target.value } : c
                          ))}
                        />
                        <Button 
                          onClick={() => updateConnection(conn.id, { webhook_url: conn.webhook_url })}
                          disabled={saving === conn.id}
                        >
                          Save
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="pt-4 border-t">
                  <Label className="text-sm text-muted-foreground mb-3 block">Add Platform</Label>
                  <div className="flex flex-wrap gap-2">
                    {PLATFORMS.filter(p => !connections.some(c => c.platform === p.id)).map((platform) => (
                      <Button
                        key={platform.id}
                        variant="outline"
                        size="sm"
                        onClick={() => addConnection(platform.id)}
                        disabled={saving === platform.id}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        {platform.name}
                      </Button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Settings;
