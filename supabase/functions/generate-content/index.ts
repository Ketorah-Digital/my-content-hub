import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const systemPrompt = `You are an expert AI content creator specializing in educational content about AI for beginners, jobseekers, and upskillers. You create engaging, actionable content about micro-courses, toolkits, and digital learning tools.

When generating content, always:
- Use simple, accessible language
- Include practical tips and actionable advice
- Make content engaging with hooks and storytelling
- Focus on helping people learn AI skills for career advancement`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { topic, type } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let userPrompt = "";
    
    if (type === "generate") {
      userPrompt = `Create a comprehensive educational video script about: "${topic}"

The script should be for a 2-3 minute YouTube video. Include:
1. A strong hook (first 5 seconds to grab attention)
2. Introduction (who this is for and what they'll learn)
3. Main content (3-4 key points with examples)
4. Call-to-action (what viewers should do next)

Format the response as JSON with this structure:
{
  "title": "Video title",
  "hook": "Opening hook text",
  "script": "Full script text",
  "keyPoints": ["point1", "point2", "point3"],
  "cta": "Call to action text"
}`;
    } else if (type === "repurpose") {
      userPrompt = `Take this original YouTube script and repurpose it for multiple platforms:

Original Script: ${topic}

Create adapted versions for each platform. Return JSON with this structure:
{
  "youtube": {
    "title": "Full YouTube title",
    "description": "YouTube description with keywords",
    "hashtags": ["#hashtag1", "#hashtag2"],
    "script": "Original or slightly enhanced script"
  },
  "youtubeShorts": {
    "title": "Short punchy title",
    "hook": "60-second version hook",
    "script": "Condensed 60-second script focusing on ONE key point",
    "hashtags": ["#shorts", "#ai", "etc"]
  },
  "tiktok": {
    "hook": "Trending TikTok-style hook",
    "script": "TikTok-optimized script (casual, fast-paced)",
    "trendSuggestion": "Suggested trend or sound style",
    "hashtags": ["#tiktok", "#ai", "etc"]
  },
  "instagram": {
    "hook": "Instagram Reels hook",
    "script": "Visually-focused script with on-screen text suggestions",
    "caption": "Instagram caption",
    "hashtags": ["#instagram", "#ai", "etc"]
  }
}`;
    }

    console.log(`Generating content for type: ${type}, topic length: ${topic?.length || 0}`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits depleted. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    // Extract JSON from response (handle markdown code blocks)
    let jsonContent = content;
    const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/);
    if (jsonMatch) {
      jsonContent = jsonMatch[1];
    }
    
    const parsed = JSON.parse(jsonContent);
    console.log(`Successfully generated content for type: ${type}`);

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in generate-content:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
