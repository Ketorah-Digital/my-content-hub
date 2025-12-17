-- Add scheduling fields to content table
ALTER TABLE public.content 
ADD COLUMN scheduled_for TIMESTAMP WITH TIME ZONE,
ADD COLUMN platform TEXT;