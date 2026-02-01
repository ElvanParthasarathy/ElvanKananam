const { createClient } = require('@supabase/supabase-client');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env') });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function checkBankDetails() {
    const { data, error } = await supabase
        .from('coolie_settings')
        .select('*');

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log('Profiles found:', data.length);
    data.forEach(p => {
        console.log(`- Org: ${p.organization_name} (${p.marketing_title})`);
        console.log(`  Bank Name: ${p.bank_name} / ${p.bank_name_tamil}`);
        console.log(`  Branch: ${p.branch} / ${p.branch_tamil}`);
        console.log(`  Account: ${p.account_no}`);
        console.log(`  IFSC: ${p.ifsc_code}`);
        console.log('---');
    });
}

checkBankDetails();
