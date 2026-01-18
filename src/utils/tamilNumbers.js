/**
 * Tamil Number to Words Converter
 * 
 * Converts numeric values to Tamil words (up to 1 crore / 10 million)
 * Properly handles Tamil number naming conventions
 */

// Units 1-19
const ones = [
    '', 'ஒன்று', 'இரண்டு', 'மூன்று', 'நான்கு',
    'ஐந்து', 'ஆறு', 'ஏழு', 'எட்டு', 'ஒன்பது',
    'பத்து', 'பதினொன்று', 'பன்னிரண்டு', 'பதிமூன்று', 'பதினான்கு',
    'பதினைந்து', 'பதினாறு', 'பதினேழு', 'பதினெட்டு', 'பத்தொன்பது'
];

// Tens 20, 30, 40, etc.
const tens = [
    '', '', 'இருபது', 'முப்பது', 'நாற்பது',
    'ஐம்பது', 'அறுபது', 'எழுபது', 'எண்பது', 'தொண்ணூறு'
];

// Compound tens (when followed by units) - e.g., 21 = இருபத்தி ஒன்று
const tensCompound = [
    '', '', 'இருபத்தி', 'முப்பத்தி', 'நாற்பத்தி',
    'ஐம்பத்தி', 'அறுபத்தி', 'எழுபத்தி', 'எண்பத்தி', 'தொண்ணூற்றி'
];

// Hundreds standalone vs compound
const hundredsCompound = {
    1: 'நூற்றி',
    2: 'இருநூற்றி',
    3: 'முந்நூற்றி',
    4: 'நானூற்றி',
    5: 'ஐந்நூற்றி',
    6: 'அறுநூற்றி',
    7: 'எழுநூற்றி',
    8: 'எண்ணூற்றி',
    9: 'தொள்ளாயிரத்தி'
};

const hundredsStandalone = {
    1: 'நூறு',
    2: 'இருநூறு',
    3: 'முந்நூறு',
    4: 'நானூறு',
    5: 'ஐந்நூறு',
    6: 'அறுநூறு',
    7: 'எழுநூறு',
    8: 'எண்ணூறு',
    9: 'தொள்ளாயிரம்'
};

// Thousands
const thousandsCompound = {
    1: 'ஆயிரத்தி',
    2: 'இரண்டாயிரத்தி',
    3: 'மூவாயிரத்தி',
    4: 'நாலாயிரத்தி',
    5: 'ஐயாயிரத்தி',
    6: 'ஆறாயிரத்தி',
    7: 'ஏழாயிரத்தி',
    8: 'எட்டாயிரத்தி',
    9: 'ஒன்பதாயிரத்தி',
    10: 'பத்தாயிரத்தி',
    11: 'பதினோராயிரத்தி',
    12: 'பன்னிரெண்டாயிரத்தி',
    13: 'பதிமூன்றாயிரத்தி',
    14: 'பதினாலாயிரத்தி',
    15: 'பதினைந்தாயிரத்தி',
    16: 'பதினாறாயிரத்தி',
    17: 'பதினேழாயிரத்தி',
    18: 'பதினெட்டாயிரத்தி',
    19: 'பத்தொன்பதாயிரத்தி',
    20: 'இருபதாயிரத்தி'
};

const thousandsStandalone = {
    1: 'ஆயிரம்',
    2: 'இரண்டாயிரம்',
    3: 'மூவாயிரம்',
    4: 'நாலாயிரம்',
    5: 'ஐயாயிரம்',
    6: 'ஆறாயிரம்',
    7: 'ஏழாயிரம்',
    8: 'எட்டாயிரம்',
    9: 'ஒன்பதாயிரம்',
    10: 'பத்தாயிரம்',
    11: 'பதினோராயிரம்',
    12: 'பன்னிரெண்டாயிரம்',
    13: 'பதிமூன்றாயிரம்',
    14: 'பதினாலாயிரம்',
    15: 'பதினைந்தாயிரம்',
    16: 'பதினாறாயிரம்',
    17: 'பதினேழாயிரம்',
    18: 'பதினெட்டாயிரம்',
    19: 'பத்தொன்பதாயிரம்',
    20: 'இருபதாயிரம்'
};

/**
 * Convert numbers under 100
 */
function convertUnder100(n) {
    if (n < 20) return ones[n];
    const tensDigit = Math.floor(n / 10);
    const onesDigit = n % 10;
    if (onesDigit === 0) {
        return tens[tensDigit];
    }
    return tensCompound[tensDigit] + ' ' + ones[onesDigit];
}

/**
 * Convert numbers under 1000
 */
function convertUnder1000(n) {
    if (n < 100) return convertUnder100(n);

    const hundredsDigit = Math.floor(n / 100);
    const remainder = n % 100;

    if (remainder === 0) {
        return hundredsStandalone[hundredsDigit];
    }
    return hundredsCompound[hundredsDigit] + ' ' + convertUnder100(remainder);
}

/**
 * Convert numbers under 100000 (1 lakh)
 */
function convertUnder100000(n) {
    if (n < 1000) return convertUnder1000(n);

    const thousands = Math.floor(n / 1000);
    const remainder = n % 1000;

    let result = '';

    // Handle thousands part
    if (thousands <= 20 && thousandsCompound[thousands] && remainder > 0) {
        result = thousandsCompound[thousands];
    } else if (thousands <= 20 && thousandsStandalone[thousands] && remainder === 0) {
        return thousandsStandalone[thousands];
    } else if (thousands <= 20 && remainder > 0) {
        result = thousandsCompound[thousands] || (convertUnder100(thousands) + ' ஆயிரத்தி');
    } else if (thousands <= 20 && remainder === 0) {
        return thousandsStandalone[thousands] || (convertUnder100(thousands) + ' ஆயிரம்');
    } else {
        // For thousands > 20
        if (remainder > 0) {
            result = convertUnder100(thousands) + ' ஆயிரத்தி';
        } else {
            return convertUnder100(thousands) + ' ஆயிரம்';
        }
    }

    if (remainder > 0) {
        result += ' ' + convertUnder1000(remainder);
    }

    return result;
}

/**
 * Convert numbers under 1 crore (10 million)
 */
function convert(n) {
    if (n === 0) return 'பூஜ்ஜியம்';
    if (n < 100000) return convertUnder100000(n);

    // Handle lakhs
    const lakhs = Math.floor(n / 100000);
    const remainder = n % 100000;

    let result = '';

    if (lakhs === 1) {
        result = remainder > 0 ? 'ஒரு இலட்சத்தி' : 'ஒரு இலட்சம்';
    } else if (lakhs < 10) {
        result = ones[lakhs] + (remainder > 0 ? ' இலட்சத்தி' : ' இலட்சம்');
    } else {
        result = convertUnder100(lakhs) + (remainder > 0 ? ' இலட்சத்தி' : ' இலட்சம்');
    }

    if (remainder > 0) {
        result += ' ' + convertUnder100000(remainder);
    }

    return result;
}

/**
 * Convert a number to Tamil words with currency suffix
 * @param {number} num - The number to convert
 * @param {string} suffix - Currency suffix (default: 'ரூபாய் மட்டும்')
 * @returns {string} Tamil representation
 */
export function numberToWordsTamil(num, suffix = 'ரூபாய் மட்டும்') {
    if (num === 0) return 'பூஜ்ஜியம்';
    if (typeof num !== 'number' || isNaN(num)) return '';

    const intPart = Math.floor(Math.abs(num));
    const words = convert(intPart);

    return words + ' ' + suffix;
}

export default numberToWordsTamil;
