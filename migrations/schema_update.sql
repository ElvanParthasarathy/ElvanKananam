-- 5. Organization Profile Table
create table if not exists organization_profile (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  organization_name text not null,
  marketing_title text,
  address_line1 text,
  address_line2 text,
  city text,
  state text,
  pincode text,
  phone text,
  email text,
  gstin text,
  website text,
  logo text, -- Base64 or URL
  cgst_rate numeric default 2.5,
  sgst_rate numeric default 2.5
);

-- 6. Coolie Bills Table
create table if not exists coolie_bills (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  bill_no text not null,
  date date default current_date,
  customer_name text,
  city text,
  items jsonb default '[]'::jsonb,
  setharam_grams text,
  courier_rs text,
  ahimsa_silk_rs text,
  custom_charge_name text,
  custom_charge_rs text,
  bank_details text,
  grand_total numeric default 0
);
