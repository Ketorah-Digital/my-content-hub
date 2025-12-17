import { useState } from "react";
import { Sparkles, CalendarDays } from "lucide-react";
import ContentGenerator from "@/components/ContentGenerator";
import RepurposeEngine from "@/components/RepurposeEngine";
import ContentLibrary from "@/components/ContentLibrary";
import ContentCalendar from "@/components/ContentCalendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index = () => {
  const [generatedScript, setGeneratedScript] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("generate");

  const handleContentGenerated = (content: any) => {
    setGeneratedScript(content);
    setActiveTab("repurpose");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="text-xl font-semibold tracking-tight">Content Hub</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">AI Content Distribution Hub</h1>
          <p className="mt-2 text-muted-foreground">
            Create once, publish everywhere. AI-powered content for Instagram, TikTok, YouTube Shorts & YouTube.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-lg grid-cols-4">
            <TabsTrigger value="generate">Generate</TabsTrigger>
            <TabsTrigger value="repurpose">Repurpose</TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-1">
              <CalendarDays className="h-4 w-4" />
              <span className="hidden sm:inline">Calendar</span>
            </TabsTrigger>
            <TabsTrigger value="library">Library</TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="space-y-6">
            <ContentGenerator onContentGenerated={handleContentGenerated} />
          </TabsContent>

          <TabsContent value="repurpose" className="space-y-6">
            <RepurposeEngine initialScript={generatedScript} />
          </TabsContent>

          <TabsContent value="calendar" className="space-y-6">
            <ContentCalendar />
          </TabsContent>

          <TabsContent value="library" className="space-y-6">
            <ContentLibrary />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
