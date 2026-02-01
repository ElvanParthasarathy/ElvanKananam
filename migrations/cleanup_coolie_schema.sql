-- Clean up coolie_settings table
-- Drops legacy/unused columns

ALTER TABLE coolie_settings
DROP COLUMN IF EXISTS website,
DROP COLUMN IF EXISTS cgst_rate,
DROP COLUMN IF EXISTS sgst_rate;
