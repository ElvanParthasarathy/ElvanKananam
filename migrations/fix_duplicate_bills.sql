-- Fix Duplicate Bills in coolie_bills table
-- This script keeps only the most recent version of each bill_no

-- Step 1: Create a temporary table with the IDs to keep (latest version of each bill_no)
CREATE TEMPORARY TABLE bills_to_keep AS
SELECT DISTINCT ON (bill_no) id 
FROM coolie_bills 
ORDER BY bill_no, created_at DESC NULLS LAST, id DESC;

-- Step 2: Delete all bills that are NOT in the keep list
DELETE FROM coolie_bills 
WHERE id NOT IN (SELECT id FROM bills_to_keep);

-- Step 3: Verify the cleanup
SELECT bill_no, COUNT(*) as count 
FROM coolie_bills 
GROUP BY bill_no 
HAVING COUNT(*) > 1;
-- This should return 0 rows if cleanup was successful
