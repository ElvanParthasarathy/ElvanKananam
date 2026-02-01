/**
 * PVS Silk Twisting - Company Configuration
 * 
 * This file contains all business-specific details for PVS Silk Twisting.
 * To add a new company, create a similar file and import it in ../index.js
 */

const pvsConfig = {
  id: 'pvs-silk-twisting',

  // Business Names
  name: {
    english: 'P.V.S. Silk Twisting',
    tamil: 'பி.வி.எஸ். சில்க் டுவிஸ்டிங்'
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
    forCompany: 'P.V.S. Silk Twisting'
  },

  // Theme Colors
  colors: {
    primary: '#388e3c',
    accent: '#4caf50',
    headerBg: '#e8f5e9',
    text: '#388e3c',
    textDark: '#2e7d32',
    border: '#388e3c',
    inputBg: '#f9f9f9',
    inputFocus: '#4caf50'
  },

  // Default Bill Number (can be overridden)
  defaultBillNo: '1'
};

export default pvsConfig;
