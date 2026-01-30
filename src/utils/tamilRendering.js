/**
 * Tamil Text Rendering Utility for @react-pdf/renderer
 * Use this to fix visual rendering issues where the PDF engine fails to process OpenType shaping tables.
 * This converts Logical Order (Unicode) to Visual Order for specific vowel signs.
 */

const TAMIL_VOWELS = {
    // Left-side vowels (Visual order: Vowel + Consonant)
    '\u0BC6': { type: 'LEFT', glyph: '\u0BC6' }, // e (ெ)
    '\u0BC7': { type: 'LEFT', glyph: '\u0BC7' }, // ee (ே)
    '\u0BC8': { type: 'LEFT', glyph: '\u0BC8' }, // ai (ை)

    // Split vowels (Visual order: Left Part + Consonant + Right Part)
    '\u0BCA': { type: 'SPLIT', left: '\u0BC6', right: '\u0BBE' }, // o (ொ) -> e (ெ) + aa (ா)
    '\u0BCB': { type: 'SPLIT', left: '\u0BC7', right: '\u0BBE' }, // oo (ோ) -> ee (ே) + aa (ா)
    '\u0BCC': { type: 'SPLIT', left: '\u0BC6', right: '\u0BD7' }, // au (ௌ) -> e (ெ) + au length mark (ள)
};

const PROPER_ORDER_VOWELS = [
    '\u0BBE', // aa (ா)
    '\u0BBF', // i (ி)
    '\u0BC0', // ii (ீ)
    '\u0BC1', // u (ு)
    '\u0BC2', // uu (ூ)
    '\u0BCD', // virama (்)
];

/**
 * Reorders Tamil text from Unicode Logical Order to Visual Order.
 * @param {string} text - The input Tamil text.
 * @returns {string} - The reordered text for rendering.
 */
export const renderTamil = (text) => {
    if (!text) return '';

    // Ensure input is a string and Normalize to NFC
    const input = text.toString().normalize('NFC');
    let output = [];

    for (let i = 0; i < input.length; i++) {
        const char = input[i];
        const nextChar = input[i + 1];

        // Check if next char is a special vowel sign that needs reordering
        const vowelRule = TAMIL_VOWELS[nextChar];

        if (vowelRule) {
            if (vowelRule.type === 'LEFT') {
                // Swap: Vowel + Consonant
                output.push(vowelRule.glyph);
                output.push(char);
                i++; // Skip next char (vowel) as we processed it
            } else if (vowelRule.type === 'SPLIT') {
                // Split: Left Vowel + Consonant + Right Vowel
                output.push(vowelRule.left);
                output.push(char);
                output.push(vowelRule.right);
                i++; // Skip next char
            }
        } else {
            // Normal character or consonant without special vowel following it
            output.push(char);
        }
    }

    return output.join('');
};
