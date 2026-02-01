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

// DEPRECATED: Hardcoded data moved to Supabase DB.
// Kept temporarily for reference or extreme fallback.

// All available companies
export const companies = {
    // 'pvs-silk-twisting': pvsConfig,
    // 'vrm-silk-twisting': vrmConfig
};

// Default company (used when no company is selected)
export const DEFAULT_COMPANY_ID = 'pvs-silk-twisting'; // Keep ID for reference

/**
 * PDF Server Configuration
 * For local development: Vite proxies /api/pdf to http://localhost:3001
 * For production (Vercel): Uses the native /api/pdf serverless function
 */
export const PDF_SERVER_URL = import.meta.env.VITE_PDF_SERVER_URL || '';

// DEPRECATED: Use DB fetch instead
export const getCompanyConfig = (companyId) => {
    return null; // companies[companyId] || companies[DEFAULT_COMPANY_ID];
};

// DEPRECATED: Use DB fetch instead
export const getCompanyOptions = () => {
    return [];
};

export default pvsConfig; // Default export for convenience
