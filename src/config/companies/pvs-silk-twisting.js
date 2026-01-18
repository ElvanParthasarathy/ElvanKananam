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
    line1: 'எண் 4/606 முதல் தெரு, சிவசக்தி நகர்',
    line2: 'வந்தவாசி சாலை, ஆரணி - 632301',
    line3: 'திருவண்ணாமலை மாவட்டம்'
  },

  // Contact
  phone: ['81446 04797', '93607 79191'],
  email: 'vrmshreesarathy@gmail.com',

  // Labels (Tamil)
  labels: {
    billNo: 'எண்',
    date: 'நாள்',
    customerPrefix: 'திரு.',
    cityPrefix: 'ஊர்.',
    rate: 'கூலி',
    itemName: 'பொருள் பெயர்',
    weight: 'கிலோ நிறை (Kg)',
    amount: 'ரூபாய்',
    total: 'மொத்தம்',
    inWords: 'எழுத்தில்',
    setharam: 'சேதாரம்',
    courier: 'கொரியர்',
    signature: 'கையொப்பம்',
    forCompany: 'P.V.S. Silk Twisting'
  },

  // Theme Colors
  colors: {
    primary: '#1a237e',
    accent: '#2c4488',
    headerBg: '#e8eaf6',
    text: '#1a237e',
    textDark: '#000000',
    border: '#1a237e',
    inputBg: '#f9f9f9',
    inputFocus: '#2c4488'
  },

  // Default Bill Number (can be overridden)
  defaultBillNo: '1'
};

export default pvsConfig;
