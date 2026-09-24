
-- guest checkout: user_id no longer required
ALTER TABLE public.orders ALTER COLUMN user_id DROP NOT NULL;

-- allow anon + authenticated to place orders without user_id forgery
DROP POLICY IF EXISTS "orders authenticated insert" ON public.orders;
CREATE POLICY "orders anyone insert"
  ON public.orders
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    user_id IS NULL OR user_id = auth.uid()
  );

-- buyer dashboard: read by matching email OR ownership
DROP POLICY IF EXISTS "orders read own" ON public.orders;
CREATE POLICY "orders read own or by email"
  ON public.orders
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR lower(customer_email) = lower(coalesce((auth.jwt() ->> 'email'), ''))
    OR public.has_role(auth.uid(), 'admin'::app_role)
  );

-- backfill prior guest orders to a newly created user account
CREATE OR REPLACE FUNCTION public.link_guest_orders_to_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.email IS NOT NULL THEN
    UPDATE public.orders
       SET user_id = NEW.id
     WHERE user_id IS NULL
       AND lower(customer_email) = lower(NEW.email);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS link_guest_orders_on_signup ON auth.users;
CREATE TRIGGER link_guest_orders_on_signup
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.link_guest_orders_to_new_user();
