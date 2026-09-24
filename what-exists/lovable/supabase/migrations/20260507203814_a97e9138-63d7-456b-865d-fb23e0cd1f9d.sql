-- follows
CREATE TABLE public.creator_follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  creator_handle text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, creator_handle)
);
CREATE INDEX idx_creator_follows_user ON public.creator_follows(user_id);
CREATE INDEX idx_creator_follows_handle ON public.creator_follows(creator_handle);
ALTER TABLE public.creator_follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "follows owner read" ON public.creator_follows
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "follows owner insert" ON public.creator_follows
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "follows owner delete" ON public.creator_follows
  FOR DELETE TO authenticated USING (user_id = auth.uid());

-- lists
CREATE TABLE public.creator_lists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  visibility text NOT NULL DEFAULT 'private', -- 'private' | 'unlisted'
  share_token text NOT NULL DEFAULT encode(gen_random_bytes(12), 'hex') UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_creator_lists_user ON public.creator_lists(user_id);
ALTER TABLE public.creator_lists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "lists owner all" ON public.creator_lists
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- unlisted lists are readable by anyone (they need the token to find them anyway)
CREATE POLICY "lists unlisted public read" ON public.creator_lists
  FOR SELECT TO anon, authenticated
  USING (visibility = 'unlisted');

CREATE TRIGGER touch_creator_lists
  BEFORE UPDATE ON public.creator_lists
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- list items
CREATE TABLE public.creator_list_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id uuid NOT NULL REFERENCES public.creator_lists(id) ON DELETE CASCADE,
  creator_handle text NOT NULL,
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (list_id, creator_handle)
);
CREATE INDEX idx_creator_list_items_list ON public.creator_list_items(list_id);
ALTER TABLE public.creator_list_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "list items owner all" ON public.creator_list_items
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.creator_lists l WHERE l.id = list_id AND l.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.creator_lists l WHERE l.id = list_id AND l.user_id = auth.uid()));

CREATE POLICY "list items unlisted public read" ON public.creator_list_items
  FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM public.creator_lists l WHERE l.id = list_id AND l.visibility = 'unlisted'));
