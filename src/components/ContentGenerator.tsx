import { useState } from "react";
import { Loader2, Wand2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ContentGeneratorProps {
  onContentGenerated: (content: any) => void;
}

const ContentGenerator = ({ onContentGenerated }: ContentGeneratorProps) => {
  const [topic, setTopic] = useState("");
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
        body: { topic, type: "generate" },
      });

      if (error) throw error;

      setGeneratedContent(data);
      toast({
        title: "Content generated!",
        description: "Your script is ready. Click 'Repurpose' to adapt it for all platforms.",
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
    if (generatedContent?.script) {
      await navigator.clipboard.writeText(generatedContent.script);
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

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5" />
            AI Content Generator
          </CardTitle>
          <CardDescription>
            Enter your topic or idea. AI will create an engaging script optimized for your AI education audience.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="e.g., '5 AI tools every jobseeker needs in 2025' or 'How to use ChatGPT to write your resume'"
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
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-4 w-4" />
                Generate Script
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Output Section */}
      <Card>
        <CardHeader>
          <CardTitle>Generated Script</CardTitle>
          <CardDescription>
            {generatedContent ? "Your AI-generated content is ready!" : "Your script will appear here"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {generatedContent ? (
            <div className="space-y-4">
              <div>
                <h4 className="mb-1 text-sm font-medium text-muted-foreground">Title</h4>
                <p className="font-semibold">{generatedContent.title}</p>
              </div>
              <div>
                <h4 className="mb-1 text-sm font-medium text-muted-foreground">Hook</h4>
                <p className="text-sm">{generatedContent.hook}</p>
              </div>
              <div>
                <h4 className="mb-1 text-sm font-medium text-muted-foreground">Script</h4>
                <div className="max-h-[200px] overflow-y-auto rounded-md bg-muted/50 p-3">
                  <p className="whitespace-pre-wrap text-sm">{generatedContent.script}</p>
                </div>
              </div>
              <div>
                <h4 className="mb-1 text-sm font-medium text-muted-foreground">Key Points</h4>
                <ul className="list-inside list-disc space-y-1 text-sm">
                  {generatedContent.keyPoints?.map((point: string, i: number) => (
                    <li key={i}>{point}</li>
                  ))}
                </ul>
              </div>
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
          ) : (
            <div className="flex h-[300px] items-center justify-center text-muted-foreground">
              <p>Enter a topic and click Generate to create your script</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ContentGenerator;
