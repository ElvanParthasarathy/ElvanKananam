/**
 * Bill Calculation Utilities
 * 
 * All calculation logic for billing operations
 */

/**
 * Calculate amount for a single item (rate × weight)
 * @param {number|string} rate - Rate per kg
 * @param {number|string} kg - Weight in kg
 * @returns {number} Calculated amount (floored)
 */
export function calcItemAmount(rate, kg) {
    const r = Number(rate) || 0;
    const k = Number(kg) || 0;
    return Math.floor(r * k);
}

/**
 * Calculate total weight from items and setharam
 * @param {Array} items - Array of item objects with kg property
 * @param {number|string} setharamGrams - Setharam in grams
 * @returns {number} Total weight in kg
 */
export function calcTotalKg(items, setharamGrams = 0) {
    const itemsKg = items.reduce((sum, item) => sum + (Number(item.kg) || 0), 0);
    const setharamKg = (Number(setharamGrams) || 0) / 1000;
    return itemsKg + setharamKg;
}

/**
 * Calculate total amount from items and courier
 * @param {Array} items - Array of item objects
 * @param {number|string} courierRs - Courier charges in Rs
 * @param {number|string} ahimsaSilkRs - Ahimsa Silk charges in Rs
 * @param {number|string} customChargeRs - Custom extra charges in Rs
 * @returns {number} Total amount in Rs
 */
export function calcTotalRs(items, courierRs = 0, ahimsaSilkRs = 0, customChargeRs = 0) {
    const itemsTotal = items.reduce((sum, item) => {
        return sum + calcItemAmount(item.coolie, item.kg);
    }, 0);
    return itemsTotal + (Number(courierRs) || 0) + (Number(ahimsaSilkRs) || 0) + (Number(customChargeRs) || 0);
}

/**
 * Convert grams to kg
 * @param {number|string} grams - Weight in grams
 * @returns {number} Weight in kg
 */
export function gramsToKg(grams) {
    return (Number(grams) || 0) / 1000;
}

/**
 * Format weight to 3 decimal places
 * @param {number} kg - Weight in kg
 * @returns {string} Formatted weight
 */
export function formatWeight(kg) {
    return Number(kg).toFixed(3);
}

/**
 * Format currency with Indian commas (e.g. 1,00,000)
 * @param {number|string} amount - Amount in Rs
 * @returns {string} Formatted amount string
 */
export function formatCurrency(amount) {
    if (!amount && amount !== 0) return '';
    return Number(amount).toLocaleString('en-IN');
}

/**
 * Get current date in DD/MM/YYYY format
 * @returns {string} Formatted date
 */
export function getCurrentDate() {
    return new Date().toLocaleDateString('en-GB');
}
