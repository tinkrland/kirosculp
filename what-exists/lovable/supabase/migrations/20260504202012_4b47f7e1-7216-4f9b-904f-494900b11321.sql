
ALTER TABLE public.market_accounts ADD COLUMN IF NOT EXISTS slug text;

UPDATE public.market_accounts
SET slug = COALESCE(slug, handle || '-' || substr(id::text, 1, 8))
WHERE slug IS NULL;

ALTER TABLE public.market_accounts ALTER COLUMN slug SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS market_accounts_slug_key ON public.market_accounts (slug);
CREATE UNIQUE INDEX IF NOT EXISTS market_accounts_handle_lower_key ON public.market_accounts (lower(handle));

ALTER TABLE public.market_accounts
  ADD CONSTRAINT market_accounts_handle_format
  CHECK (handle ~ '^[a-z0-9]{4,}$') NOT VALID;
