-- 002_enable_rls_and_policies.sql
-- Enable Row Level Security (RLS) and add safe read policies
-- Writes (INSERT/UPDATE/DELETE) are intentionally left without open policies
-- so that only the Supabase service_role (which bypasses RLS) can perform mutations.

-- Enable RLS on products and product_steps
ALTER TABLE IF EXISTS public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.product_steps ENABLE ROW LEVEL SECURITY;

-- Allow anyone (anon or authenticated) to SELECT product records
CREATE POLICY IF NOT EXISTS "allow_select_public_products"
ON public.products
FOR SELECT
USING (true);

-- Allow anyone to SELECT product_steps
CREATE POLICY IF NOT EXISTS "allow_select_public_product_steps"
ON public.product_steps
FOR SELECT
USING (true);

-- NOTE: INSERT/UPDATE/DELETE policies are NOT created here on purpose.
-- Rationale: the backend should use the Supabase service_role key for server-side
-- inserts/updates. The service_role bypasses RLS, so it will be able to write.

-- If you later want to allow authenticated clients to insert (e.g., product creation
-- from logged-in users), you can add a policy like the commented example below.
-- Example (uncomment and adapt if you want client-side authenticated inserts):
--
-- CREATE POLICY "auth_insert_products" ON public.products
--   FOR INSERT
--   USING (auth.role() = 'authenticated')
--   WITH CHECK (auth.role() = 'authenticated');
--
-- Remember: when enabling client writes, validate and sanitize carefully.
