import { useState } from "react";
import { Loader2, Wand2, Copy, Check, FileText, Video, Layout, MessageSquare, Briefcase, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ContentGeneratorProps {
  onContentGenerated: (content: any) => void;
}

const CONTENT_TYPES = [
  { id: "video", name: "Video Script", icon: Video, description: "YouTube/TikTok/Reels script" },
  { id: "blog", name: "Blog Post", icon: FileText, description: "Long-form article" },
  { id: "carousel", name: "Carousel", icon: Layout, description: "Multi-slide post" },
  { id: "thread", name: "Thread", icon: MessageSquare, description: "X/Twitter thread" },
  { id: "linkedin", name: "LinkedIn", icon: Briefcase, description: "Professional post" },
  { id: "newsletter", name: "Newsletter", icon: Mail, description: "Email newsletter" },
];

const ContentGenerator = ({ onContentGenerated }: ContentGeneratorProps) => {
  const [topic, setTopic] = useState("");
  const [contentType, setContentType] = useState("video");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast({
        title: "Enter a topic",
        description: "Please enter a topic or idea for your content.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-content", {
        body: { topic, type: "generate", contentType },
      });

      if (error) throw error;

      setGeneratedContent({ ...data, contentType });
      toast({
        title: "Content generated!",
        description: "Your content is ready. Click 'Repurpose' to adapt it for all platforms.",
      });
    } catch (error: any) {
      console.error("Generation error:", error);
      toast({
        title: "Generation failed",
        description: error.message || "Failed to generate content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    const textToCopy = generatedContent?.script || generatedContent?.content || generatedContent?.body || "";
    if (textToCopy) {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: "Copied to clipboard!" });
    }
  };

  const handleRepurpose = () => {
    if (generatedContent) {
      onContentGenerated(generatedContent);
    }
  };

  const renderGeneratedContent = () => {
    if (!generatedContent) return null;

    return (
      <div className="space-y-4">
        {generatedContent.title && (
          <div>
            <h4 className="mb-1 text-sm font-medium text-muted-foreground">Title</h4>
            <p className="font-semibold">{generatedContent.title}</p>
          </div>
        )}
        {generatedContent.hook && (
          <div>
            <h4 className="mb-1 text-sm font-medium text-muted-foreground">Hook</h4>
            <p className="text-sm">{generatedContent.hook}</p>
          </div>
        )}
        {generatedContent.subject && (
          <div>
            <h4 className="mb-1 text-sm font-medium text-muted-foreground">Subject Line</h4>
            <p className="font-semibold">{generatedContent.subject}</p>
          </div>
        )}
        {(generatedContent.script || generatedContent.content || generatedContent.body) && (
          <div>
            <h4 className="mb-1 text-sm font-medium text-muted-foreground">
              {contentType === "newsletter" ? "Email Body" : contentType === "blog" ? "Article" : "Content"}
            </h4>
            <div className="max-h-[200px] overflow-y-auto rounded-md bg-muted/50 p-3">
              <p className="whitespace-pre-wrap text-sm">
                {generatedContent.script || generatedContent.content || generatedContent.body}
              </p>
            </div>
          </div>
        )}
        {generatedContent.slides && (
          <div>
            <h4 className="mb-1 text-sm font-medium text-muted-foreground">Slides</h4>
            <div className="space-y-2">
              {generatedContent.slides.map((slide: any, i: number) => (
                <div key={i} className="rounded-md bg-muted/50 p-2">
                  <span className="text-xs font-medium text-muted-foreground">Slide {i + 1}</span>
                  <p className="text-sm">{slide.text || slide}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        {generatedContent.tweets && (
          <div>
            <h4 className="mb-1 text-sm font-medium text-muted-foreground">Thread</h4>
            <div className="space-y-2">
              {generatedContent.tweets.map((tweet: string, i: number) => (
                <div key={i} className="rounded-md bg-muted/50 p-2">
                  <span className="text-xs font-medium text-muted-foreground">{i + 1}/</span>
                  <p className="text-sm">{tweet}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        {generatedContent.keyPoints && (
          <div>
            <h4 className="mb-1 text-sm font-medium text-muted-foreground">Key Points</h4>
            <ul className="list-inside list-disc space-y-1 text-sm">
              {generatedContent.keyPoints.map((point: string, i: number) => (
                <li key={i}>{point}</li>
              ))}
            </ul>
          </div>
        )}
        <div className="flex gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={handleCopy}>
            {copied ? <Check className="mr-1 h-4 w-4" /> : <Copy className="mr-1 h-4 w-4" />}
            {copied ? "Copied" : "Copy"}
          </Button>
          <Button size="sm" onClick={handleRepurpose}>
            Repurpose for All Platforms →
          </Button>
        </div>
      </div>
    );
  };

  const selectedType = CONTENT_TYPES.find(t => t.id === contentType);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5" />
            AI Content Generator
          </CardTitle>
          <CardDescription>
            Enter your topic or idea. AI will create engaging content optimized for your AI education audience.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Content Type</Label>
            <Select value={contentType} onValueChange={setContentType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CONTENT_TYPES.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    <div className="flex items-center gap-2">
                      <type.icon className="h-4 w-4" />
                      <span>{type.name}</span>
                      <span className="text-xs text-muted-foreground">- {type.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Textarea
            placeholder={`e.g., '5 AI tools every jobseeker needs in 2025' or 'How to use ChatGPT to write your resume'`}
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="min-h-[120px] resize-none"
          />
          <Button 
            onClick={handleGenerate} 
            disabled={isGenerating || !topic.trim()}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating {selectedType?.name}...
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-4 w-4" />
                Generate {selectedType?.name}
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Generated {selectedType?.name}</CardTitle>
          <CardDescription>
            {generatedContent ? "Your AI-generated content is ready!" : "Your content will appear here"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {generatedContent ? (
            renderGeneratedContent()
          ) : (
            <div className="flex h-[300px] items-center justify-center text-muted-foreground">
              <p>Enter a topic and click Generate to create your {selectedType?.name.toLowerCase()}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ContentGenerator;
