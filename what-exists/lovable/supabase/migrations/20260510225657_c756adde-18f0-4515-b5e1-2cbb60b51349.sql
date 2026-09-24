-- Notes / feedback submissions from the creator docs page
CREATE TABLE public.creator_docs_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.creator_docs_notes ENABLE ROW LEVEL SECURITY;

-- Anyone (including anonymous) can submit a note
CREATE POLICY "anyone can submit a creator docs note"
ON public.creator_docs_notes
FOR INSERT
TO anon, authenticated
WITH CHECK (
  length(coalesce(message, '')) BETWEEN 1 AND 4000
  AND length(coalesce(subject, '')) <= 200
  AND length(coalesce(category, '')) <= 60
  AND length(coalesce(email, '')) <= 320
);

-- Only admins can read submitted notes
CREATE POLICY "admins can view creator docs notes"
ON public.creator_docs_notes
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));