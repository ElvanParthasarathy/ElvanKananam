/**
 * Tamil Number to Words Converter
 * 
 * Converts numeric values to Tamil words (up to 1 crore / 10 million)
 */

const ones = [
    '', 'ஒன்று', 'இரண்டு', 'மூன்று', 'நான்கு',
    'ஐந்து', 'ஆறு', 'ஏழு', 'எட்டு', 'ஒன்பது',
    'பத்து', 'பதினொன்று', 'பன்னிரண்டு', 'பதின்மூன்று', 'பதினான்கு',
    'பதினைந்து', 'பதினாறு', 'பதினேழு', 'பதினெட்டு', 'பத்தொன்பது'
];

const tens = [
    '', '', 'இருபது', 'முப்பது', 'நாற்பது',
    'ஐம்பது', 'அறுபது', 'எழுபது', 'எண்பது', 'தொண்ணூறு'
];

/**
 * Internal recursive converter
 */
function convert(n) {
    if (n < 20) return ones[n];
    if (n < 100) {
        return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
    }
    if (n < 1000) {
        return ones[Math.floor(n / 100)] + ' நூற்று' + (n % 100 ? ' ' + convert(n % 100) : '');
    }
    if (n < 100000) {
        return convert(Math.floor(n / 1000)) + ' ஆயிரத்து' + (n % 1000 ? ' ' + convert(n % 1000) : '');
    }
    if (n < 10000000) {
        return convert(Math.floor(n / 100000)) + ' இலட்சத்து' + (n % 100000 ? ' ' + convert(n % 100000) : '');
    }
    return '';
}

/**
 * Convert a number to Tamil words with currency suffix
 * @param {number} num - The number to convert
 * @param {string} suffix - Currency suffix (default: 'ரூபாய் மட்டும்')
 * @returns {string} Tamil representation
 */
export function numberToWordsTamil(num, suffix = 'ரூபாய் மட்டும்') {
    if (num === 0) return 'பூஜ்யம்';
    if (typeof num !== 'number' || isNaN(num)) return '';

    const intPart = Math.floor(Math.abs(num));
    return convert(intPart) + ' ' + suffix;
}

export default numberToWordsTamil;
