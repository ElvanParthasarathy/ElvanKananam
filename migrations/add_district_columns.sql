-- Add district columns to coolie_settings

ALTER TABLE coolie_settings 
ADD COLUMN IF NOT EXISTS district text,
ADD COLUMN IF NOT EXISTS district_tamil text;
