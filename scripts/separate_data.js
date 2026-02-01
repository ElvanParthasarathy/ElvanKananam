import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read .env
const envPath = path.resolve(__dirname, '../.env');
const envFile = fs.readFileSync(envPath, 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) env[key.trim()] = value.trim();
});

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseKey = env.VITE_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Error: Could not read Supabase credentials from .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    console.log('Starting Data Separation...');

    // 1. Update Items
    console.log('Classifying Items...');
    const { data: items } = await supabase.from('items').select('*');

    if (items) {
        for (const item of items) {
            let type = 'coolie';
            const name = (item.name || '').toLowerCase();

            // Heuristic to detect Silks items
            // "Saree", "Muthu", "Pattu", "Border", "Checked" -> Silks
            // "Coolie", "Thadai", "Sappuri", "Unit" -> Coolie
            if (name.includes('saree') || name.includes('muthu') || name.includes('pattu') || name.includes('fancy')) {
                type = 'silks';
            }

            console.log(`Updating Item: "${item.name}" -> ${type}`);
            await supabase.from('items').update({ type }).eq('id', item.id);
        }
    }

    // 2. Update Customers
    // User requested "existing customers -> coolie". 
    // We will just set all null types to 'coolie'.
    console.log('Classifying Customers...');
    const { data: customers } = await supabase.from('customers').select('*');
    if (customers) {
        for (const cust of customers) {
            // If it's the "Sundari Silks" default which is for Coolie, keep coolie.
            // If user explicitly created Silks customers, they might need manual update.
            // For now, default all to Coolie as requested.

            // Only update if not already set (to be safe if ran multiple times)
            let type = cust.type || 'coolie';

            // Optional: If name has 'Silks' it might be a customer buying silks? 
            // BUT 'Sundari Silks' is the Service Receiver (Coolie customer).
            // So default 'coolie' is correct for existing data.

            console.log(`Updating Customer: "${cust.name}" -> ${type}`);
            await supabase.from('customers').update({ type }).eq('id', cust.id);
        }
    }

    console.log('Data Separation Completed.');
}

run().catch(console.error);
