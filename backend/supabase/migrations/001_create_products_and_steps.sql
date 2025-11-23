-- 001_create_products_and_steps.sql
-- Migration: create products and product_steps tables for Hack-Bozok

-- products: stores basic product metadata and last known state
CREATE TABLE IF NOT EXISTS public.products (
  product_id TEXT PRIMARY KEY,
  serial_number TEXT NOT NULL,
  manufacturer TEXT NOT NULL,
  location TEXT NOT NULL,
  current_status INTEGER NOT NULL DEFAULT 0,
  current_location TEXT,
  tx_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- product_steps: stores step entries (history) linked to products
CREATE TABLE IF NOT EXISTS public.product_steps (
  id BIGSERIAL PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES public.products(product_id) ON DELETE CASCADE,
  step_type INTEGER NOT NULL,
  location TEXT NOT NULL,
  responsible_party TEXT NOT NULL,
  tracking_number TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  tx_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products (created_at);
CREATE INDEX IF NOT EXISTS idx_product_steps_product_id ON public.product_steps (product_id);
CREATE INDEX IF NOT EXISTS idx_product_steps_created_at ON public.product_steps (created_at);

-- Optional: example policies (commented out). For security, use Supabase's RLS
-- and the service_role key for server-side inserts. Enable RLS and define policies
-- appropriate for your app. Example policy that allows inserts only via service role
-- (not applicable directly in SQL editor as-is, adjust for your setup):
-- ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "service_role_insert_products" ON public.products
--   FOR INSERT USING (auth.role() = 'service_role');

-- End of migration
