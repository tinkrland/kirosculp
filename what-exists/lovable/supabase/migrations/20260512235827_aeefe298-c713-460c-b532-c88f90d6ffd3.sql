CREATE TABLE public.admin_ideas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL DEFAULT 'untitled',
  content TEXT NOT NULL DEFAULT '',
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_ideas ENABLE ROW LEVEL SECURITY;

-- gated at the app layer via the universal admin password until per-admin
-- profiles ship; revisit and lock down once real admin auth exists.
CREATE POLICY "open read admin_ideas" ON public.admin_ideas FOR SELECT USING (true);
CREATE POLICY "open insert admin_ideas" ON public.admin_ideas FOR INSERT WITH CHECK (true);
CREATE POLICY "open update admin_ideas" ON public.admin_ideas FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "open delete admin_ideas" ON public.admin_ideas FOR DELETE USING (true);

CREATE OR REPLACE FUNCTION public.touch_admin_ideas_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER admin_ideas_touch_updated_at
BEFORE UPDATE ON public.admin_ideas
FOR EACH ROW
EXECUTE FUNCTION public.touch_admin_ideas_updated_at();