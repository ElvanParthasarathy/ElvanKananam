-- 1. Coolie Settings
CREATE TABLE IF NOT EXISTS coolie_settings (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE coolie_settings 
ADD COLUMN IF NOT EXISTS organization_name text,
ADD COLUMN IF NOT EXISTS marketing_title text,
ADD COLUMN IF NOT EXISTS address_line1 text,
ADD COLUMN IF NOT EXISTS address_line2 text,
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS city_tamil text,
ADD COLUMN IF NOT EXISTS state text DEFAULT 'Tamil Nadu',
ADD COLUMN IF NOT EXISTS pincode text,
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS email text,
ADD COLUMN IF NOT EXISTS website text,
ADD COLUMN IF NOT EXISTS bank_name text,
ADD COLUMN IF NOT EXISTS bank_name_tamil text,
ADD COLUMN IF NOT EXISTS account_no text,
ADD COLUMN IF NOT EXISTS ifsc_code text,
ADD COLUMN IF NOT EXISTS branch text,
ADD COLUMN IF NOT EXISTS branch_tamil text,
ADD COLUMN IF NOT EXISTS logo text,
ADD COLUMN IF NOT EXISTS cgst_rate numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS sgst_rate numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS theme_color text DEFAULT '#388e3c',
ADD COLUMN IF NOT EXISTS type text DEFAULT 'coolie';

-- 2. Coolie Bills
CREATE TABLE IF NOT EXISTS coolie_bills (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE coolie_bills
ADD COLUMN IF NOT EXISTS bill_no text,
ADD COLUMN IF NOT EXISTS date text,
ADD COLUMN IF NOT EXISTS customer_name text,
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS items jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS setharam_grams text,
ADD COLUMN IF NOT EXISTS courier_rs text,
ADD COLUMN IF NOT EXISTS ahimsa_silk_rs text,
ADD COLUMN IF NOT EXISTS custom_charge_name text,
ADD COLUMN IF NOT EXISTS custom_charge_rs text,
ADD COLUMN IF NOT EXISTS bank_details text,
ADD COLUMN IF NOT EXISTS account_no text,
ADD COLUMN IF NOT EXISTS grand_total numeric DEFAULT 0;

-- 3. Coolie Customers
CREATE TABLE IF NOT EXISTS coolie_customers (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE coolie_customers
ADD COLUMN IF NOT EXISTS name text,
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS email text,
ADD COLUMN IF NOT EXISTS address text,
ADD COLUMN IF NOT EXISTS type text DEFAULT 'coolie';

-- 4. Coolie Items
CREATE TABLE IF NOT EXISTS coolie_items (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE coolie_items
ADD COLUMN IF NOT EXISTS name text,
ADD COLUMN IF NOT EXISTS coolie numeric,
ADD COLUMN IF NOT EXISTS type text DEFAULT 'coolie';
