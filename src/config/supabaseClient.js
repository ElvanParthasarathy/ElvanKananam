import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)

// ========================================
// DATABASE CONNECTION FLAGS
// ========================================
// Set to false to disable database operations during development
// Coolie Bill: Always connected
// Silks Bill: Disabled until finalized
// ========================================
export const SILKS_DB_ENABLED = false;  // Change to true when Silks Bill is finalized
export const COOLIE_DB_ENABLED = true;  // Always enabled
