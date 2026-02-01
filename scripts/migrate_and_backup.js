import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Helper to get __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import Hardcoded Data
// We need to use dynamic imports or relative paths carefully
// Since we are in /scripts, we go up one level to src
import pvsConfig from '../src/config/companies/pvs-silk-twisting.js';
import vrmConfig from '../src/config/companies/vrm-silk-twisting.js';
import { defaultItems, defaultCustomers } from '../src/config/defaults.js';

// Read .env manually since we might not have dotenv
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
    console.log('Starting Backup and Migration...');

    // 1. Fetch Existing Data
    console.log('Fetching existing data...');
    const { data: customers } = await supabase.from('customers').select('*');
    const { data: items } = await supabase.from('items').select('*');
    const { data: profiles } = await supabase.from('organization_profile').select('*');
    const { data: invoices } = await supabase.from('invoices').select('*');
    const { data: coolieBills } = await supabase.from('coolie_bills').select('*');
    const { data: users } = await supabase.from('users').select('*').then(res => res).catch(() => ({ data: [] })); // Try to fetch if exists

    // 2. Backup to JSON
    const backupData = {
        timestamp: new Date().toISOString(),
        customers: customers || [],
        items: items || [],
        organization_profile: profiles || [],
        invoices: invoices || [],
        coolie_bills: coolieBills || [],
        // Include hardcoded data in backup just in case
        hardcoded_backups: {
            pvsConfig,
            vrmConfig,
            defaultItems,
            defaultCustomers
        }
    };

    const backupPath = path.resolve(__dirname, '../backup_full.json');
    fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2));
    console.log(`Backup saved to ${backupPath}`);

    // 3. Migrate Hardcoded Profiles
    console.log('Migrating Company Profiles...');
    const configs = [pvsConfig, vrmConfig];

    for (const conf of configs) {
        // Check if exists by name
        const existing = profiles?.find(p => p.organization_name === conf.name.english);
        if (!existing) {
            console.log(`Inserting profile: ${conf.name.english}`);
            const payload = {
                organization_name: conf.name.english,
                marketing_title: 'Silk Twisting Factory', // Config didn't exactly have this, inferring
                address_line1: conf.address.line1,
                address_line2: conf.address.line2,
                city: 'Arani', // Inferred
                pincode: '632301',
                state: 'Tamil Nadu',
                phone: conf.phone.join(', '),
                email: conf.email,
                // Map colors or other specific fields if schema supports, else skip
            };
            const { error } = await supabase.from('organization_profile').insert([payload]);
            if (error) console.error(`Error inserting ${conf.name.english}:`, error.message);
        } else {
            console.log(`Profile already exists: ${conf.name.english}`);
        }
    }

    // 4. Migrate Default Customers
    console.log('Migrating Default Customers...');
    for (const cust of defaultCustomers) {
        // Check duplication by name + city
        const existing = customers?.find(c => c.name === cust.name && c.city === cust.city);
        if (!existing) {
            console.log(`Inserting customer: ${cust.displayName}`);
            const payload = {
                name: cust.name,
                company_name: cust.name, // Mapping logic
                city: cust.city,
                state: 'Tamil Nadu'
            };
            const { error } = await supabase.from('customers').insert([payload]);
            if (error) console.error(`Error inserting ${cust.displayName}:`, error.message);
        }
    }

    // 5. Migrate Default Items
    console.log('Migrating Default Items...');
    for (const item of defaultItems) {
        const existing = items?.find(i => i.name === item.name);
        if (!existing) {
            console.log(`Inserting item: ${item.name}`);
            const payload = {
                name: item.name,
                rate: 0 // Default
            };
            const { error } = await supabase.from('items').insert([payload]);
            if (error) console.error(`Error inserting ${item.name}:`, error.message);
        }
    }

    console.log('Migration Completed.');
}

run().catch(console.error);
