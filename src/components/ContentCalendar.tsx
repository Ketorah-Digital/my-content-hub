import { useState, useEffect } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, isToday } from "date-fns";
import { ChevronLeft, ChevronRight, Youtube, Instagram, Clock, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface ScheduledContent {
  id: string;
  topic: string;
  original_script: string;
  youtube_version: any;
  youtube_shorts_version: any;
  tiktok_version: any;
  instagram_version: any;
  status: string;
  scheduled_for: string | null;
  platform: string | null;
  created_at: string;
}

const TikTokIcon = () => (
  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
  </svg>
);

const platformIcons: Record<string, React.ReactNode> = {
  youtube: <Youtube className="h-3.5 w-3.5" />,
  shorts: <Youtube className="h-3.5 w-3.5" />,
  tiktok: <TikTokIcon />,
  instagram: <Instagram className="h-3.5 w-3.5" />,
};

const platformColors: Record<string, string> = {
  youtube: "bg-red-500/20 text-red-600 border-red-500/30",
  shorts: "bg-red-500/20 text-red-600 border-red-500/30",
  tiktok: "bg-zinc-500/20 text-zinc-600 border-zinc-500/30",
  instagram: "bg-pink-500/20 text-pink-600 border-pink-500/30",
};

const ContentCalendar = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [scheduledContent, setScheduledContent] = useState<ScheduledContent[]>([]);
  const [unscheduledContent, setUnscheduledContent] = useState<ScheduledContent[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedContent, setSelectedContent] = useState<ScheduledContent | null>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const fetchContent = async () => {
    try {
      const { data, error } = await supabase
        .from("content")
        .select("*")
        .order("scheduled_for", { ascending: true });

      if (error) throw error;

      const scheduled = (data || []).filter((c) => c.scheduled_for);
      const unscheduled = (data || []).filter((c) => !c.scheduled_for);
      
      setScheduledContent(scheduled);
      setUnscheduledContent(unscheduled);
    } catch (error: any) {
      console.error("Fetch error:", error);
      toast({
        title: "Failed to load content",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const scheduleContent = async (contentId: string, date: Date, platform: string) => {
    try {
      const { error } = await supabase
        .from("content")
        .update({ 
          scheduled_for: date.toISOString(), 
          platform,
          status: "scheduled" 
        })
        .eq("id", contentId);

      if (error) throw error;
      
      await fetchContent();
      toast({ title: "Content scheduled!", description: `Scheduled for ${format(date, "PPP")}` });
    } catch (error: any) {
      toast({
        title: "Scheduling failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const unscheduleContent = async (contentId: string) => {
    try {
      const { error } = await supabase
        .from("content")
        .update({ 
          scheduled_for: null, 
          platform: null,
          status: "ready" 
        })
        .eq("id", contentId);

      if (error) throw error;
      
      await fetchContent();
      toast({ title: "Content unscheduled" });
    } catch (error: any) {
      toast({
        title: "Failed to unschedule",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Copied to clipboard!" });
  };

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const getContentForDay = (day: Date) => {
    return scheduledContent.filter((c) => 
      c.scheduled_for && isSameDay(new Date(c.scheduled_for), day)
    );
  };

  const firstDayOfMonth = startOfMonth(currentMonth).getDay();
  const emptyDays = Array(firstDayOfMonth).fill(null);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
      {/* Calendar Grid */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle>Content Calendar</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="min-w-[140px] text-center font-medium">
                {format(currentMonth, "MMMM yyyy")}
              </span>
              <Button variant="outline" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1">
            {emptyDays.map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}
            {days.map((day) => {
              const dayContent = getContentForDay(day);
              return (
                <Dialog key={day.toISOString()}>
                  <DialogTrigger asChild>
                    <button
                      className={cn(
                        "aspect-square rounded-lg border border-border/50 p-1 text-left transition-colors hover:bg-muted/50",
                        isToday(day) && "border-primary bg-primary/5",
                        dayContent.length > 0 && "bg-muted/30"
                      )}
                    >
                      <span className={cn(
                        "text-xs font-medium",
                        isToday(day) && "text-primary"
                      )}>
                        {format(day, "d")}
                      </span>
                      <div className="mt-1 space-y-0.5">
                        {dayContent.slice(0, 2).map((content) => (
                          <div
                            key={content.id}
                            className={cn(
                              "flex items-center gap-1 rounded px-1 py-0.5 text-[10px] truncate border",
                              platformColors[content.platform || "youtube"]
                            )}
                          >
                            {platformIcons[content.platform || "youtube"]}
                            <span className="truncate">{content.topic}</span>
                          </div>
                        ))}
                        {dayContent.length > 2 && (
                          <span className="text-[10px] text-muted-foreground">+{dayContent.length - 2} more</span>
                        )}
                      </div>
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>{format(day, "EEEE, MMMM d")}</DialogTitle>
                      <DialogDescription>
                        {dayContent.length} {dayContent.length === 1 ? "item" : "items"} scheduled
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                      {dayContent.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">No content scheduled for this day</p>
                      ) : (
                        dayContent.map((content) => (
                          <div key={content.id} className="rounded-lg border p-3 space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="font-medium text-sm">{content.topic}</p>
                                <Badge variant="outline" className={cn("mt-1", platformColors[content.platform || "youtube"])}>
                                  {platformIcons[content.platform || "youtube"]}
                                  <span className="ml-1 capitalize">{content.platform}</span>
                                </Badge>
                              </div>
                              <Button variant="ghost" size="sm" onClick={() => unscheduleContent(content.id)}>
                                Unschedule
                              </Button>
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2">{content.original_script}</p>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-full"
                              onClick={() => handleCopy(content.original_script)}
                            >
                              {copied ? <Check className="mr-1 h-3 w-3" /> : <Copy className="mr-1 h-3 w-3" />}
                              Copy Script
                            </Button>
                          </div>
                        ))
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Unscheduled Content Sidebar */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ready to Schedule</CardTitle>
          <CardDescription>{unscheduledContent.length} items</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {unscheduledContent.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">All content is scheduled!</p>
          ) : (
            unscheduledContent.map((content) => (
              <ScheduleCard 
                key={content.id} 
                content={content} 
                onSchedule={scheduleContent}
              />
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};

interface ScheduleCardProps {
  content: ScheduledContent;
  onSchedule: (contentId: string, date: Date, platform: string) => void;
}

const ScheduleCard = ({ content, onSchedule }: ScheduleCardProps) => {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [platform, setPlatform] = useState<string>("youtube");
  const [open, setOpen] = useState(false);

  const handleSchedule = () => {
    if (date) {
      onSchedule(content.id, date, platform);
      setOpen(false);
      setDate(undefined);
    }
  };

  return (
    <div className="rounded-lg border p-3 space-y-2">
      <p className="font-medium text-sm line-clamp-1">{content.topic}</p>
      <p className="text-xs text-muted-foreground line-clamp-2">{content.original_script}</p>
      
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="w-full">
            <Clock className="mr-1 h-3 w-3" />
            Schedule
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-4" align="end">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Platform</label>
              <Select value={platform} onValueChange={setPlatform}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="youtube">
                    <span className="flex items-center gap-2"><Youtube className="h-4 w-4" /> YouTube</span>
                  </SelectItem>
                  <SelectItem value="shorts">
                    <span className="flex items-center gap-2"><Youtube className="h-4 w-4" /> Shorts</span>
                  </SelectItem>
                  <SelectItem value="tiktok">
                    <span className="flex items-center gap-2"><TikTokIcon /> TikTok</span>
                  </SelectItem>
                  <SelectItem value="instagram">
                    <span className="flex items-center gap-2"><Instagram className="h-4 w-4" /> Instagram</span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              disabled={(d) => d < new Date()}
              initialFocus
              className="pointer-events-auto rounded-md border"
            />
            <Button 
              onClick={handleSchedule} 
              disabled={!date}
              className="w-full"
            >
              Schedule for {date ? format(date, "MMM d") : "..."}
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default ContentCalendar;
