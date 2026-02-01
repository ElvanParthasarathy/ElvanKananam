-- DANGER: This script will DROP (DELETE) ALL TABLES and their data.
-- This effectively wipes the database schema for the application.

DROP TABLE IF EXISTS invoice_items CASCADE;
DROP TABLE IF EXISTS invoices CASCADE;
DROP TABLE IF EXISTS coolie_bills CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS items CASCADE;
DROP TABLE IF EXISTS organization_profile CASCADE;

-- If you have any enums or types created, drop them here too (if applicable)
-- DROP TYPE IF EXISTS some_enum_type;
