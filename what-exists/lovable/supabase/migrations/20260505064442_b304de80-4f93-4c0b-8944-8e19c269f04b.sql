ALTER TABLE public.artifacts ADD COLUMN IF NOT EXISTS artifact_type text;
CREATE INDEX IF NOT EXISTS idx_artifacts_artifact_type ON public.artifacts (artifact_type);