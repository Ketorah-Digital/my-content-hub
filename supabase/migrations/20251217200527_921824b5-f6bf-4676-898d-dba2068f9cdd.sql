-- Create content table for storing generated content
CREATE TABLE public.content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  topic TEXT NOT NULL,
  original_script TEXT NOT NULL,
  youtube_version JSONB,
  youtube_shorts_version JSONB,
  tiktok_version JSONB,
  instagram_version JSONB,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.content ENABLE ROW LEVEL SECURITY;

-- For now, allow public access (no auth required for personal use)
CREATE POLICY "Allow public read access" 
ON public.content 
FOR SELECT 
USING (true);

CREATE POLICY "Allow public insert access" 
ON public.content 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public update access" 
ON public.content 
FOR UPDATE 
USING (true);

CREATE POLICY "Allow public delete access" 
ON public.content 
FOR DELETE 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_content_updated_at
BEFORE UPDATE ON public.content
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();