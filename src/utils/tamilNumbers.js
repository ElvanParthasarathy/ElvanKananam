/**
 * Tamil Number to Words Converter
 * 
 * Converts numeric values to Tamil words with proper Sandhi rules (grammar joining).
 * Example: 57 -> ஐம்பத்தேழு (not ஐம்பத்து ஏழு)
 * Example: 500 oblique -> ஐந்நூற்று
 */

const ones = [
    '', 'ஒன்று', 'இரண்டு', 'மூன்று', 'நான்கு',
    'ஐந்து', 'ஆறு', 'ஏழு', 'எட்டு', 'ஒன்பது',
    'பத்து', 'பதினொன்று', 'பன்னிரண்டு', 'பதிமூன்று', 'பதினான்கு',
    'பதினைந்து', 'பதினாறு', 'பதினேழு', 'பதினெட்டு', 'பத்தொன்பது'
];

// Base tens (20, 30...90)
const tensBase = [
    '', '', 'இருபது', 'முப்பது', 'நாற்பது',
    'ஐம்பது', 'அறுபது', 'எழுபது', 'எண்பது', 'தொண்ணூறு'
];

// Oblique tens (20, 30...90 used when combining)
const tensOblique = [
    '', '', 'இருபத்து', 'முப்பத்து', 'நாற்பத்து',
    'ஐம்பத்து', 'அறுபத்து', 'எழுபத்து', 'எண்பத்து', 'தொண்ணூற்று'
];

const hundredsBase = {
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

const hundredsOblique = {
    1: 'நூற்று',
    2: 'இருநூற்று',
    3: 'முந்நூற்று',
    4: 'நானூற்று',
    5: 'ஐந்நூற்று',
    6: 'அறுநூற்று',
    7: 'எழுநூற்று',
    8: 'எண்ணூற்று',
    9: 'தொள்ளாயிரத்து'
};

// Vowel signs mapping
const vowelSigns = {
    'அ': '',
    'ஆ': 'ா',
    'இ': 'ி',
    'ஈ': 'ீ',
    'உ': 'ு',
    'ஊ': 'ூ',
    'எ': 'ெ',
    'ஏ': 'ே',
    'ஐ': 'ை',
    'ஒ': 'ொ',
    'ஓ': 'ோ',
    'ஔ': 'ௌ'
};

/**
 * Helper to join two Tamil words using Sandhi rules.
 * Specifically handles words ending in 'u' (து, று, டு) joining with words starting with vowels.
 */
function joinTamil(word1, word2) {
    if (!word1) return word2;
    if (!word2) return word1;

    const vowels = ['அ', 'ஆ', 'இ', 'ஈ', 'உ', 'ஊ', 'எ', 'ஏ', 'ஐ', 'ஒ', 'ஓ', 'ஔ'];
    const firstChar = Array.from(word2)[0];

    // Check if word2 starts with a vowel
    if (vowels.includes(firstChar)) {
        let root = word1;
        let base = '';

        // Handle specific endings common in numbers (து, று, டு)
        if (root.endsWith('து')) {
            // Remove 'து', add 'த்'
            base = root.substring(0, root.length - 'து'.length) + 'த்';
        } else if (root.endsWith('று')) {
            // Remove 'று', add 'ற்'
            base = root.substring(0, root.length - 'று'.length) + 'ற்';
        } else if (root.endsWith('டு')) {
            // Remove 'டு', add 'ட்'
            base = root.substring(0, root.length - 'டு'.length) + 'ட்';
        } else {
            // If no match, just space join (fallback)
            return word1 + ' ' + word2;
        }

        // Now add the vowel sign to the base consonant
        // The base ends with the consonant + virama.
        // We assume valid Tamil unicode sequence (Consonant + Virama).
        // e.g. 'த்' is 'த' + '்'.
        // We remove the virama ('்') and add the vowel sign.

        // Remove last char (virama)
        let consonantBase = base.substring(0, base.length - 1);
        let sign = vowelSigns[firstChar];

        // Return Joined String: ConsonantBase + VowelSign + RestOfWord2
        return consonantBase + sign + word2.substring(firstChar.length);
    }

    // Default: Join with space
    return word1 + ' ' + word2;
}

function convertUnder100(n) {
    if (n < 20) return ones[n];

    const tensDigit = Math.floor(n / 10);
    const onesDigit = n % 10;

    if (onesDigit === 0) {
        return tensBase[tensDigit];
    }

    return joinTamil(tensOblique[tensDigit], ones[onesDigit]);
}

function convertUnder1000(n) {
    if (n < 100) return convertUnder100(n);

    const hundredsDigit = Math.floor(n / 100);
    const remainder = n % 100;

    if (remainder === 0) {
        return hundredsBase[hundredsDigit];
    }

    return joinTamil(hundredsOblique[hundredsDigit], convertUnder100(remainder));
}

function convertUnder100000(n) {
    if (n < 1000) return convertUnder1000(n);

    const thousands = Math.floor(n / 1000);
    const remainder = n % 1000;

    let thousandsStr = convertUnder100(thousands);
    let suffix = (remainder === 0) ? 'ஆயிரம்' : 'ஆயிரத்து';

    let thousandPart = joinTamil(thousandsStr, suffix);

    if (remainder === 0) return thousandPart;

    return thousandPart + ' ' + convertUnder1000(remainder);
}

function convert(n) {
    if (n === 0) return 'பூஜ்ஜியம்';
    if (n < 100000) return convertUnder100000(n);

    const lakhs = Math.floor(n / 100000);
    const remainder = n % 100000;

    let lakhPart = '';

    if (lakhs === 1) {
        lakhPart = (remainder === 0) ? 'ஒரு லட்சம்' : 'ஒரு லட்சத்து';
    } else {
        let lakhsStr = convertUnder100(lakhs);
        let suffix = (remainder === 0) ? 'லட்சம்' : 'லட்சத்து';
        lakhPart = joinTamil(lakhsStr, suffix);
    }

    if (remainder === 0) return lakhPart;

    return lakhPart + ' ' + convertUnder100000(remainder);
}

export function numberToWordsTamil(num, suffix = 'ரூபாய் மட்டும்') {
    if (num === 0) return 'பூஜ்ஜியம்';
    if (typeof num !== 'number' || isNaN(num)) return '';

    const intPart = Math.floor(Math.abs(num));
    const words = convert(intPart);

    return words + ' ' + suffix;
}

export default numberToWordsTamil;
