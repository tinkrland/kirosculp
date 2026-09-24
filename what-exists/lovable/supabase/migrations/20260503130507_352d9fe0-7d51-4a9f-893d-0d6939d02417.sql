GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO anon, authenticated;
ALTER TABLE public.artifacts ADD COLUMN IF NOT EXISTS image_urls text[] DEFAULT '{}'::text[];