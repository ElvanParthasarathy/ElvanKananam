-- Add type column to split Coolie vs Silks data
alter table customers add column if not exists type text default 'coolie';
alter table items add column if not exists type text default 'coolie';

-- Add type column for organizations (Business Profiles)
alter table organization_profile add column if not exists type text default 'silks';

-- Optional: Create index for performance if needed
-- create index idx_customers_type on customers(type);
-- create index idx_items_type on items(type);
