-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Customers Table
create table customers (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  company_name text,
  gstin text,
  email text,
  phone text,
  address_line1 text,
  address_line2 text,
  city text,
  pincode text,
  state text default 'Tamil Nadu',
  place_of_supply text default 'Tamil Nadu'
);

-- 2. Items (Products) Table
create table items (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null, -- English Name
  name_tamil text,    -- Tamil Name
  description text,
  hsn_code text default '50072010', -- Common for Silk Sarees
  rate numeric default 0,
  tax_rate numeric default 5.0, -- Default GST 5%
  unit text default 'Nos'
);

-- 3. Invoices Table
create table invoices (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  invoice_number text not null unique,
  date date default current_date,
  due_date date,
  customer_id uuid references customers(id),
  status text default 'Draft', -- Draft, Sent, Paid, Overdue
  sub_total numeric default 0,
  total_tax numeric default 0,
  total_amount numeric default 0,
  notes text,
  terms text default '1) Unapproved goods must be returned within 7 days. 2) Disputes subject to ARANI jurisdiction.'
);

-- 4. Invoice Items Table (Line Items)
create table invoice_items (
  id uuid default uuid_generate_v4() primary key,
  invoice_id uuid references invoices(id) on delete cascade,
  item_id uuid references items(id),
  description text,
  quantity numeric default 1,
  rate numeric default 0,
  amount numeric default 0
);

-- Row Level Security (RLS) - Optional for now but good practice
-- alter table customers enable row level security;
-- alter table items enable row level security;
-- alter table invoices enable row level security;
-- alter table invoice_items enable row level security;

-- Create a policy to allow public access (Since we are using anonymously for now/single user)
-- create policy "Public Access" on customers for all using (true);
-- create policy "Public Access" on items for all using (true);
-- create policy "Public Access" on invoices for all using (true);
-- create policy "Public Access" on invoice_items for all using (true);

-- Insert Dummy Data for Items
insert into items (name, name_tamil, rate, hsn_code) values
('Fancy Saree', 'ஃபேன்ஸி சேலை', 7900, '50072010'),
('Fancy Muthu Saree', 'ஃபேன்ஸி முத்து சேலை', 8200, '50072010'),
('Fancy Border Muthu Saree', 'ஃபேன்ஸி பார்டர் முத்து சேலை', 8400, '50072010'),
('Fancy Checked Butta', 'ஃபேன்ஸி கட்டம் புட்டா', 8700, '50072010');

-- Insert Dummy Customer
insert into customers (name, company_name, gstin, place_of_supply, address_line1, city, pincode) values
('SRI SIVARAM SILK SAREES ARANI', 'SRI SIVARAM SILK SAREES', '33AYGPS0561E1ZN', 'Tamil Nadu', '6, NA, Avvaiyaar Street', 'Arani', '632301');
