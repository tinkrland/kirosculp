
ALTER TABLE public.artifacts
  ADD COLUMN IF NOT EXISTS size_type text NOT NULL DEFAULT 'unisize',
  ADD COLUMN IF NOT EXISTS sizes text[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS size_surcharges jsonb NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS size text;
