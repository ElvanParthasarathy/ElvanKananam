-- DANGER: This script will delete ALL data from the database tables.
-- Use this only when you want to essentially factory reset the application's data.

-- 1. Invoice Items (Foreign Key dependency on invoices)
TRUNCATE TABLE invoice_items CASCADE;

-- 2. Invoices (Silks)
TRUNCATE TABLE invoices CASCADE;

-- 3. Coolie Bills
TRUNCATE TABLE coolie_bills CASCADE;

-- 4. Customers and Items
TRUNCATE TABLE customers CASCADE;
TRUNCATE TABLE items CASCADE;

-- 5. Business Profiles (Settings)
TRUNCATE TABLE organization_profile CASCADE;

-- Optional: Reset sequences if you want IDs to start from 1 again (not always necessary with UUIDs but good for Serials)
-- RESTART IDENTITY is included in TRUNCATE by default in some DBs or via option:
-- TRUNCATE TABLE table_name RESTART IDENTITY;

-- Postgres command to truncate all and restart identities:
TRUNCATE TABLE 
    invoice_items, 
    invoices, 
    coolie_bills, 
    customers, 
    items, 
    organization_profile 
RESTART IDENTITY;
