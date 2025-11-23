-- seed_products.sql
-- Inserts sample products and product_steps for local testing

-- Sample products
INSERT INTO public.products (product_id, serial_number, manufacturer, location, current_status, current_location, tx_hash, created_at)
VALUES
  ('PROD1', 'SN-001', 'GDJ7DSEYDWYWBNAPBDXAE7P6NHHQJ6J7ER5NHO3RDZ5G454LENQ66U5O', 'Factory A', 0, 'Factory A', 'txhash_example_1', now()),
  ('PROD2', 'SN-002', 'GDJ7DSEYDWYWBNAPBDXAE7P6NHHQJ6J7ER5NHO3RDZ5G454LENQ66U5O', 'Factory B', 0, 'Factory B', 'txhash_example_2', now());

-- Sample steps for PROD1
INSERT INTO public.product_steps (product_id, step_type, location, responsible_party, tracking_number, metadata, tx_hash, created_at)
VALUES
  ('PROD1', 0, 'Factory A', 'GDJ7DSEYDWYWBNAPBDXAE7P6NHHQJ6J7ER5NHO3RDZ5G454LENQ66U5O', NULL, '{"note": "Production completed"}'::jsonb, 'txstep1', now()),
  ('PROD1', 1, 'On Route', 'GCF3V7Q...EXAMPLE', 'TRACK123', '{"carrier":"ACME Logistics"}'::jsonb, 'txstep2', now());

-- Sample steps for PROD2
INSERT INTO public.product_steps (product_id, step_type, location, responsible_party, tracking_number, metadata, tx_hash, created_at)
VALUES
  ('PROD2', 0, 'Factory B', 'GDJ7DSEYDWYWBNAPBDXAE7P6NHHQJ6J7ER5NHO3RDZ5G454LENQ66U5O', NULL, '{"note": "Production completed"}'::jsonb, 'txstep3', now());

-- Verify inserts: select sample rows
-- SELECT * FROM public.products LIMIT 10;
-- SELECT * FROM public.product_steps WHERE product_id = 'PROD1' ORDER BY created_at;
