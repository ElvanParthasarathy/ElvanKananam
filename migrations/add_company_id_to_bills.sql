-- Add company_id to coolie_bills table
ALTER TABLE coolie_bills ADD COLUMN IF NOT EXISTS company_id uuid;

-- Optional: Add foreign key constraint if profiles table is strictly managed
-- ALTER TABLE coolie_bills ADD CONSTRAINT fk_company FOREIGN KEY (company_id) REFERENCES coolie_settings(id);

-- Update existing records to link to the first available company (optional fallback)
-- UPDATE coolie_bills SET company_id = (SELECT id FROM coolie_settings LIMIT 1) WHERE company_id IS NULL;
