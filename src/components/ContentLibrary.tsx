import { useEffect, useState } from "react";
import { Loader2, Copy, Trash2, Youtube, Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ContentItem {
  id: string;
  topic: string;
  original_script: string;
  youtube_version: any;
  youtube_shorts_version: any;
  tiktok_version: any;
  instagram_version: any;
  facebook_version:  any;
  pinterest_version:  any;
  status: string;
  created_at: string;
}

const TikTokIcon = () => (
  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
  </svg>
);

const ContentLibrary = () => {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchContent = async () => {
    try {
      const { data, error } = await supabase
        .from("content")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setContent(data || []);
    } catch (error: any) {
      console.error("Fetch error:", error);
      toast({
        title: "Failed to load content",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("content").delete().eq("id", id);
      if (error) throw error;
      setContent(content.filter((c) => c.id !== id));
      toast({ title: "Content deleted" });
    } catch (error: any) {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard!" });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex h-[300px] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (content.length === 0) {
    return (
      <Card>
        <CardContent className="flex h-[300px] items-center justify-center">
          <div className="text-center text-muted-foreground">
            <p className="mb-2">No content saved yet</p>
            <p className="text-sm">Generate and repurpose content, then save it to your library.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Content Library</h3>
        <p className="text-sm text-muted-foreground">{content.length} items saved</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {content.map((item) => (
          <Card key={item.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-base">{item.topic}</CardTitle>
                  <CardDescription className="text-xs">
                    {new Date(item.created_at).toLocaleDateString()}
                  </CardDescription>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete content?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete this content and all platform versions.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(item.id)}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="line-clamp-2 text-sm text-muted-foreground">{item.original_script}</p>
              
              <div className="flex flex-wrap gap-1.5">
                {item.youtube_version && (
                  <Badge variant="outline" className="cursor-pointer gap-1" onClick={() => handleCopy(item.youtube_version?.script || "")}>
                    <Youtube className="h-3 w-3" /> YouTube
                    <Copy className="ml-1 h-2.5 w-2.5" />
                  </Badge>
                )}
                {item.youtube_shorts_version && (
                  <Badge variant="outline" className="cursor-pointer gap-1" onClick={() => handleCopy(item.youtube_shorts_version?.script || "")}>
                    <Youtube className="h-3 w-3" /> Shorts
                    <Copy className="ml-1 h-2.5 w-2.5" />
                  </Badge>
                )}
                {item.tiktok_version && (
                  <Badge variant="outline" className="cursor-pointer gap-1" onClick={() => handleCopy(item.tiktok_version?.script || "")}>
                    <TikTokIcon /> TikTok
                    <Copy className="ml-1 h-2.5 w-2.5" />
                  </Badge>
                )}
                {item.instagram_version && (
                  <Badge variant="outline" className="cursor-pointer gap-1" onClick={() => handleCopy(item.instagram_version?.script || "")}>
                    <Instagram className="h-3 w-3" /> Reels
                    <Copy className="ml-1 h-2.5 w-2.5" />
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ContentLibrary;
