/**
 * V.R.M. Silk Twisting Factory - Company Configuration
 * 
 * Same configuration as PVS, but with different business name.
 */

const vrmConfig = {
    id: 'vrm-silk-twisting',

    // Business Names
    name: {
        english: 'V.R.M. Silk Twisting Factory',
        tamil: 'வி.ஆர்.எம். பட்டு முறுக்கு ஆலை'
    },

    // Header Content
    greeting: 'வாழ்க வளமுடன்',
    billType: 'கூலி பில்',

    // Address
    address: {
        line1: '4/606 முதல் தெரு, சிவசக்தி நகர்',
        line2: 'ஆரணி - 632301',
        line3: 'திருவண்ணாமலை மாவட்டம்'
    },

    // Contact
    phone: ['8144604797', '9360779191'],
    email: 'vrmshreesarathy@gmail.com',

    // Labels (Tamil)
    labels: {
        billNo: 'பில் எண்',
        date: 'நாள்',
        customerPrefix: 'திரு:',
        cityPrefix: 'ஊர்:',
        rate: 'கூலி',
        itemName: 'பொருள் பெயர்',
        weight: 'எடை (Kg)',
        amount: 'ரூபாய்',
        total: 'மொத்தம்',
        inWords: 'எழுத்தில் மொத்தத் தொகை',
        setharam: 'சேதாரம்',
        courier: 'கொரியர்',
        ahimsaSilk: 'அகிம்சா பட்டு',
        signature: 'கையொப்பம்',
        forCompany: 'V.R.M. Silk Twisting Factory'
    },

    // Theme Colors
    colors: {
        primary: '#8E24AA',
        accent: '#BA68C8',
        headerBg: '#F3E5F5',
        text: '#6A1B9A',
        textDark: '#4A148C',
        border: '#7B1FA2',
        inputBg: '#f9f9f9',
        inputFocus: '#AB47BC'
    },

    // Default Bill Number
    defaultBillNo: '1'
};

export default vrmConfig;
