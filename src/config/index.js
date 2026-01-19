/**
 * Company Configuration Index
 * 
 * Import and export all company configurations here.
 * To add a new company:
 * 1. Create a new file in ./companies/
 * 2. Import it below
 * 3. Add it to the companies object
 */

import pvsConfig from './companies/pvs-silk-twisting.js';
import vrmConfig from './companies/vrm-silk-twisting.js';

// All available companies
export const companies = {
    'pvs-silk-twisting': pvsConfig,
    'vrm-silk-twisting': vrmConfig
};

// Default company (used when no company is selected)
export const DEFAULT_COMPANY_ID = 'pvs-silk-twisting';

// Get company config by ID
export const getCompanyConfig = (companyId) => {
    return companies[companyId] || companies[DEFAULT_COMPANY_ID];
};

// Get all company options (for future company selector)
export const getCompanyOptions = () => {
    return Object.entries(companies).map(([id, config]) => ({
        id,
        name: config.name.english,
        nameTamil: config.name.tamil
    }));
};

export default pvsConfig; // Default export for convenience
