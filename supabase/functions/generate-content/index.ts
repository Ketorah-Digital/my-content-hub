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
    const { topic, type, contentType = "video" } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let userPrompt = "";
    
    if (type === "generate") {
      const contentPrompts: Record<string, string> = {
        video: `Create a comprehensive educational video script about: "${topic}"

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
}`,
        blog: `Create a comprehensive blog post about: "${topic}"

The article should be 800-1200 words, SEO-optimized. Include:
1. Engaging headline
2. Introduction with hook
3. 3-5 main sections with headers
4. Conclusion with CTA

Format the response as JSON with this structure:
{
  "title": "Blog title",
  "hook": "Opening paragraph",
  "content": "Full article content with markdown formatting",
  "keyPoints": ["key takeaway 1", "key takeaway 2", "key takeaway 3"],
  "metaDescription": "SEO meta description"
}`,
        carousel: `Create an Instagram carousel post about: "${topic}"

The carousel should have 8-10 slides. Include:
1. Hook slide (grab attention)
2. Problem/question slide
3. 5-7 content slides with actionable tips
4. CTA slide

Format the response as JSON with this structure:
{
  "title": "Carousel title",
  "hook": "First slide hook",
  "slides": [
    {"text": "Slide 1 text", "visual": "suggested visual"},
    {"text": "Slide 2 text", "visual": "suggested visual"}
  ],
  "caption": "Instagram caption",
  "hashtags": ["#hashtag1", "#hashtag2"]
}`,
        thread: `Create a Twitter/X thread about: "${topic}"

The thread should have 8-12 tweets. Include:
1. Hook tweet (create curiosity)
2. Context/problem tweet
3. 5-8 value tweets with tips
4. CTA tweet

Format the response as JSON with this structure:
{
  "title": "Thread topic",
  "hook": "First tweet hook",
  "tweets": ["Tweet 1", "Tweet 2", "Tweet 3"],
  "keyPoints": ["key point 1", "key point 2"]
}`,
        linkedin: `Create a LinkedIn post about: "${topic}"

The post should be professional but engaging. Include:
1. Strong hook line
2. Personal story or insight
3. 3-5 actionable tips
4. Question to drive engagement
5. Relevant hashtags

Format the response as JSON with this structure:
{
  "title": "Post topic",
  "hook": "Opening hook line",
  "content": "Full post content",
  "keyPoints": ["key insight 1", "key insight 2"],
  "hashtags": ["#LinkedIn", "#AI", "#CareerGrowth"]
}`,
        newsletter: `Create an email newsletter about: "${topic}"

The newsletter should be 500-700 words. Include:
1. Compelling subject line
2. Personal greeting
3. Main content with 2-3 sections
4. Actionable takeaway
5. Clear CTA

Format the response as JSON with this structure:
{
  "subject": "Email subject line",
  "previewText": "Preview text",
  "title": "Newsletter title",
  "hook": "Opening paragraph",
  "body": "Full newsletter body",
  "cta": "Call to action",
  "keyPoints": ["key point 1", "key point 2"]
}`
      };

      userPrompt = contentPrompts[contentType] || contentPrompts.video;
    } else if (type === "repurpose") {
      userPrompt = `Take this original content and repurpose it for multiple platforms:

Original Content: ${topic}

Create adapted versions for each platform. Return JSON with this structure:
{
  "youtube": {
    "title": "Full YouTube title",
    "description": "YouTube description with keywords",
    "hashtags": ["#hashtag1", "#hashtag2"],
    "script": "Original or enhanced script for long-form video"
  },
  "youtubeShorts": {
    "title": "Short punchy title",
    "hook": "60-second version hook",
    "script": "Condensed 60-second script focusing on ONE key point",
    "hashtags": ["#shorts", "#ai"]
  },
  "tiktok": {
    "hook": "Trending TikTok-style hook",
    "script": "TikTok-optimized script (casual, fast-paced, max 60 seconds)",
    "trendSuggestion": "Suggested trend or sound style",
    "hashtags": ["#tiktok", "#ai", "#learnontiktok"]
  },
  "instagram": {
    "hook": "Instagram Reels hook",
    "script": "Visually-focused script with on-screen text suggestions",
    "caption": "Instagram caption with emojis",
    "hashtags": ["#instagram", "#ai", "#tech"]
  },
  "linkedin": {
    "title": "Professional headline",
    "hook": "Professional opening hook",
    "post": "LinkedIn-optimized professional post (no emojis, business tone)",
    "hashtags": ["#AI", "#CareerGrowth", "#Technology"]
  }
}`;
    }

    console.log(`Generating content for type: ${type}, contentType: ${contentType}, topic length: ${topic?.length || 0}`);

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
    console.log(`Successfully generated content for type: ${type}, contentType: ${contentType}`);

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
