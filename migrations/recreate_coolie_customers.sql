-- DROP existing table to start fresh
DROP TABLE IF EXISTS coolie_customers;

-- CREATE new table with explicit columns for dual language support
CREATE TABLE coolie_customers (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Basic Info
  type text DEFAULT 'coolie', -- 'coolie' or 'silks'
  phone text,
  email text,

  -- English Fields
  name text,                -- Merchant Name (English)
  company_name text,        -- Company Name (English)
  address_line1 text,       -- Address (English)
  city text,               -- Place/City (English)

  -- Tamil Fields (Explicit Columns)
  name_tamil text,          -- Merchant Name (Tamil)
  company_name_tamil text,  -- Company Name (Tamil)
  address_tamil text,       -- Address (Tamil)
  city_tamil text           -- Place/City (Tamil)
);

-- Enable RLS (Optional, good practice)
ALTER TABLE coolie_customers ENABLE ROW LEVEL SECURITY;

-- Policy (Open for now as per dev env)
CREATE POLICY "Enable all access for all users" ON coolie_customers
FOR ALL USING (true) WITH CHECK (true);
