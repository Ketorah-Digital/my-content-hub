-- Enable RLS on optimal_posting_times and allow all authenticated users to read
ALTER TABLE public.optimal_posting_times ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read optimal times" ON public.optimal_posting_times
FOR SELECT TO authenticated USING (true);