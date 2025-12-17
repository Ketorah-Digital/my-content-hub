import { useState, useEffect } from "react";
import { Loader2, Youtube, Instagram, Copy, Check, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface RepurposeEngineProps {
  initialScript: any;
}

const TikTokIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
  </svg>
);

const RepurposeEngine = ({ initialScript }: RepurposeEngineProps) => {
  const [isRepurposing, setIsRepurposing] = useState(false);
  const [repurposedContent, setRepurposedContent] = useState<any>(null);
  const [copiedPlatform, setCopiedPlatform] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (initialScript && !repurposedContent) {
      handleRepurpose();
    }
  }, [initialScript]);

  const handleRepurpose = async () => {
    if (!initialScript?.script) {
      toast({
        title: "No script available",
        description: "Generate a script first, then repurpose it.",
        variant: "destructive",
      });
      return;
    }

    setIsRepurposing(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-content", {
        body: { topic: initialScript.script, type: "repurpose" },
      });

      if (error) throw error;

      setRepurposedContent(data);
      toast({
        title: "Content repurposed!",
        description: "Your script has been adapted for all platforms.",
      });
    } catch (error: any) {
      console.error("Repurpose error:", error);
      toast({
        title: "Repurposing failed",
        description: error.message || "Failed to repurpose content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRepurposing(false);
    }
  };

  const handleCopy = async (platform: string, content: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedPlatform(platform);
    setTimeout(() => setCopiedPlatform(null), 2000);
    toast({ title: `${platform} content copied!` });
  };

  const handleSaveToLibrary = async () => {
    if (!initialScript || !repurposedContent) return;

    setIsSaving(true);
    try {
      const { error } = await supabase.from("content").insert({
        topic: initialScript.title || "Untitled",
        original_script: initialScript.script,
        youtube_version: repurposedContent.youtube,
        youtube_shorts_version: repurposedContent.youtubeShorts,
        tiktok_version: repurposedContent.tiktok,
        instagram_version: repurposedContent.instagram,
        status: "ready",
      });

      if (error) throw error;

      toast({
        title: "Saved to library!",
        description: "Your content has been saved and is ready to use.",
      });
    } catch (error: any) {
      console.error("Save error:", error);
      toast({
        title: "Save failed",
        description: error.message || "Failed to save content.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!initialScript) {
    return (
      <Card>
        <CardContent className="flex h-[400px] items-center justify-center">
          <div className="text-center text-muted-foreground">
            <p className="mb-2">No script to repurpose yet</p>
            <p className="text-sm">Generate a script first, then come back here to adapt it for all platforms.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isRepurposing) {
    return (
      <Card>
        <CardContent className="flex h-[400px] items-center justify-center">
          <div className="text-center">
            <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-primary" />
            <p className="font-medium">Repurposing your content...</p>
            <p className="text-sm text-muted-foreground">Adapting for YouTube, Shorts, TikTok & Instagram</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!repurposedContent) {
    return (
      <Card>
        <CardContent className="flex h-[400px] items-center justify-center">
          <Button onClick={handleRepurpose}>
            Repurpose Script for All Platforms
          </Button>
        </CardContent>
      </Card>
    );
  }

  const platforms = [
    { id: "youtube", name: "YouTube", icon: <Youtube className="h-4 w-4" />, data: repurposedContent.youtube },
    { id: "shorts", name: "Shorts", icon: <Youtube className="h-4 w-4" />, data: repurposedContent.youtubeShorts },
    { id: "tiktok", name: "TikTok", icon: <TikTokIcon />, data: repurposedContent.tiktok },
    { id: "instagram", name: "Instagram", icon: <Instagram className="h-4 w-4" />, data: repurposedContent.instagram },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Repurposed Content</h3>
          <p className="text-sm text-muted-foreground">Your script adapted for each platform</p>
        </div>
        <Button onClick={handleSaveToLibrary} disabled={isSaving}>
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save to Library
        </Button>
      </div>

      <Tabs defaultValue="youtube" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          {platforms.map((p) => (
            <TabsTrigger key={p.id} value={p.id} className="flex items-center gap-1.5">
              {p.icon}
              <span className="hidden sm:inline">{p.name}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {platforms.map((platform) => (
          <TabsContent key={platform.id} value={platform.id}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {platform.icon}
                  {platform.name} Version
                </CardTitle>
                <CardDescription>Optimized content for {platform.name}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {platform.data?.title && (
                  <div>
                    <h4 className="mb-1 text-sm font-medium text-muted-foreground">Title</h4>
                    <p className="font-semibold">{platform.data.title}</p>
                  </div>
                )}
                {platform.data?.hook && (
                  <div>
                    <h4 className="mb-1 text-sm font-medium text-muted-foreground">Hook</h4>
                    <p className="text-sm">{platform.data.hook}</p>
                  </div>
                )}
                {platform.data?.script && (
                  <div>
                    <h4 className="mb-1 text-sm font-medium text-muted-foreground">Script</h4>
                    <div className="max-h-[200px] overflow-y-auto rounded-md bg-muted/50 p-3">
                      <p className="whitespace-pre-wrap text-sm">{platform.data.script}</p>
                    </div>
                  </div>
                )}
                {platform.data?.description && (
                  <div>
                    <h4 className="mb-1 text-sm font-medium text-muted-foreground">Description</h4>
                    <p className="text-sm">{platform.data.description}</p>
                  </div>
                )}
                {platform.data?.caption && (
                  <div>
                    <h4 className="mb-1 text-sm font-medium text-muted-foreground">Caption</h4>
                    <p className="text-sm">{platform.data.caption}</p>
                  </div>
                )}
                {platform.data?.trendSuggestion && (
                  <div>
                    <h4 className="mb-1 text-sm font-medium text-muted-foreground">Trend Suggestion</h4>
                    <p className="text-sm">{platform.data.trendSuggestion}</p>
                  </div>
                )}
                {platform.data?.hashtags && (
                  <div>
                    <h4 className="mb-1 text-sm font-medium text-muted-foreground">Hashtags</h4>
                    <div className="flex flex-wrap gap-1">
                      {platform.data.hashtags.map((tag: string, i: number) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(platform.name, platform.data?.script || "")}
                >
                  {copiedPlatform === platform.name ? (
                    <Check className="mr-1 h-4 w-4" />
                  ) : (
                    <Copy className="mr-1 h-4 w-4" />
                  )}
                  {copiedPlatform === platform.name ? "Copied" : "Copy Script"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default RepurposeEngine;
