-- Full Database Setup Script
-- Run this AFTER running drop_all_tables.sql to re-create the structure.

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Customers Table
create table if not exists customers (
    id uuid default uuid_generate_v4() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    name text not null,
    company_name text,
    phone text,
    email text,
    address_line1 text,
    address_line2 text,
    city text,
    state text,
    pincode text,
    gstin text,
    type text default 'coolie' -- 'coolie' or 'silks'
);

-- 2. Items Table
create table if not exists items (
    id uuid default uuid_generate_v4() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    name text not null,
    name_tamil text,
    hsn_or_sac text,
    rate numeric default 0,
    type text default 'coolie' -- 'coolie' or 'silks'
);

-- 3. Organization Profile Table
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
    logo text,
    cgst_rate numeric default 2.5,
    sgst_rate numeric default 2.5,
    type text default 'coolie' -- 'coolie' or 'silks'
);

-- 4. Invoices Table (Silks)
create table if not exists invoices (
    id uuid default uuid_generate_v4() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    invoice_number text not null,
    date date default current_date,
    customer_id uuid references customers(id),
    sub_total numeric default 0,
    total_tax numeric default 0,
    total_amount numeric default 0,
    status text default 'Draft',
    notes text,
    terms text
);

-- 5. Invoice Items Table (Silks)
create table if not exists invoice_items (
    id uuid default uuid_generate_v4() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    invoice_id uuid references invoices(id) on delete cascade,
    description text,
    quantity numeric default 1,
    rate numeric default 0,
    amount numeric default 0,
    hsn_code text
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
