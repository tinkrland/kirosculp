
-- commission terms + customizable form on each creator's market account
ALTER TABLE public.market_accounts
  ADD COLUMN IF NOT EXISTS commission_terms text,
  ADD COLUMN IF NOT EXISTS commission_allow_commercial boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS commission_allow_resell boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS commission_allow_modifications boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS commission_min_budget numeric,
  ADD COLUMN IF NOT EXISTS commission_intake_questions jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS commission_intro text;

-- store commission requests sent from the public shop pages
CREATE TABLE IF NOT EXISTS public.commission_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_handle text NOT NULL,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  budget numeric,
  timeline text,
  intended_use text,
  description text NOT NULL,
  reference_urls text[] DEFAULT '{}',
  answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.commission_requests ENABLE ROW LEVEL SECURITY;

-- anyone (including not-logged-in collectors) can submit a request
CREATE POLICY "commission_requests anon insert"
  ON public.commission_requests FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- creators read/manage their own requests through the dashboard. since
-- the dashboard auth model is access-key based (no auth.uid), we keep
-- public read by handle gated to the rls level via a permissive policy.
-- the dashboard ui filters by handle. (mirrors existing 'orders read by creator handle' pattern.)
CREATE POLICY "commission_requests public read"
  ON public.commission_requests FOR SELECT
  USING (true);

CREATE POLICY "commission_requests admin manage"
  ON public.commission_requests FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- creators with a creator_profile owning the handle can update their own
CREATE POLICY "commission_requests owner update"
  ON public.commission_requests FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.creator_profiles cp
    WHERE cp.username = commission_requests.creator_handle
      AND cp.user_id = auth.uid()
  ));

CREATE TRIGGER touch_commission_requests_updated_at
  BEFORE UPDATE ON public.commission_requests
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE INDEX IF NOT EXISTS idx_commission_requests_handle ON public.commission_requests(creator_handle);
