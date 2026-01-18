/**
 * Translations for the Elvan Kananam Billing App
 * 
 * Supports: Tamil (ta), English (en)
 * Default: Tamil
 */

export const translations = {
    ta: {
        // App
        appName: 'எல்வன் கணனம்',
        appNameEnglish: 'Elvan Kananam',
        createBill: 'பில் உருவாக்கு',

        // Invoice Details
        invoiceDetails: 'பில் விவரங்கள்',
        billNo: 'பில் எண்',
        date: 'தேதி',

        // Customer
        customer: 'வாடிக்கையாளர்',
        name: 'பெயர்',
        enterName: 'பெயர் உள்ளிடவும்',
        placeCity: 'இடம் / நகரம்',
        enterCity: 'நகரம் உள்ளிடவும்',

        // Items
        itemsList: 'பொருட்கள் பட்டியல்',
        itemName: 'பொருள் பெயர்',
        enterItem: 'பொருள் உள்ளிடவும்',
        weight: 'எடை (கிலோ)',
        rate: 'கூலி',
        addAnotherItem: 'மற்றொரு பொருளை சேர்க்க',

        // Extras
        extras: 'கூடுதல் கட்டணங்கள்',
        setharam: 'சேதாரம் (கிராம்)',
        courier: 'கொரியர் கட்டணம் (₹)',

        // Preview
        previewBill: 'பில் முன்னோட்டம்',

        // Print labels (for bill)
        customerPrefix: 'திரு.',
        cityPrefix: 'ஊர்.',
        weightKg: 'கிலோ நிறை (Kg)',
        amount: 'ரூபாய்',
        total: 'மொத்தம்',
        inWords: 'எழுத்தில்',
        signature: '(கையொப்பம்)',

        // Language
        language: 'மொழி',
        tamil: 'தமிழ்',
        english: 'English'
    },

    en: {
        // App
        appName: 'எல்வன் கணனம்',
        appNameEnglish: 'Elvan Kananam',
        createBill: 'Create Bill',

        // Invoice Details
        invoiceDetails: 'Invoice Details',
        billNo: 'Bill No',
        date: 'Date',

        // Customer
        customer: 'Customer',
        name: 'Name',
        enterName: 'Enter name',
        placeCity: 'Place / City',
        enterCity: 'Enter city',

        // Items
        itemsList: 'Items List',
        itemName: 'Item Name',
        enterItem: 'Enter item',
        weight: 'Weight (Kg)',
        rate: 'Rate',
        addAnotherItem: 'Add Another Item',

        // Extras
        extras: 'Extra Charges',
        setharam: 'Setharam (g)',
        courier: 'Courier (₹)',

        // Preview
        previewBill: 'PREVIEW BILL',

        // Print labels (for bill - always Tamil for now)
        customerPrefix: 'திரு.',
        cityPrefix: 'ஊர்.',
        weightKg: 'கிலோ நிறை (Kg)',
        amount: 'ரூபாய்',
        total: 'மொத்தம்',
        inWords: 'எழுத்தில்',
        signature: '(கையொப்பம்)',

        // Language
        language: 'Language',
        tamil: 'தமிழ்',
        english: 'English'
    }
};

export const DEFAULT_LANGUAGE = 'ta';

export const getTranslation = (lang) => translations[lang] || translations[DEFAULT_LANGUAGE];

export default translations;
