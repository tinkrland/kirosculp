ALTER TABLE public.artifacts ADD COLUMN IF NOT EXISTS dimensions text;
ALTER TABLE public.artifacts ADD COLUMN IF NOT EXISTS weight_grams numeric;