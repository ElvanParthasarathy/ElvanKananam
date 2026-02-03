import React from 'react';
import { Document, Font, StyleSheet } from '@react-pdf/renderer';
import CoolieTemplate from './templates/CoolieTemplate';

// Register Fonts Globally
// This ensures they are available to ALL templates
Font.register({
    family: 'MuktaMalar',
    fonts: [
        { src: 'https://fonts.gstatic.com/s/muktamalar/v14/MCoXzAXyz8LOE2FpJMxZqLv4.ttf', fontWeight: 400 }, // Regular
        { src: 'https://fonts.gstatic.com/s/muktamalar/v14/MCoKzAXyz8LOE2FpJMxZqIMgA9AB.ttf', fontWeight: 600 }, // Semi-Bold
        { src: 'https://fonts.gstatic.com/s/muktamalar/v14/MCoKzAXyz8LOE2FpJMxZqINEAtAB.ttf', fontWeight: 700 } // Bold
    ]
});

Font.register({
    family: 'Arima',
    fonts: [
        { src: 'https://fonts.gstatic.com/s/arima/v7/neIWzCqmt4Aup_qE1nFWqxI1RZX1UzA-pQ.ttf' }, // Medium 500
        { src: 'https://fonts.gstatic.com/s/arima/v7/neIWzCqmt4Aup_qE1nFWqxI1RZX1hjc-pQ.ttf', fontWeight: 700 } // Bold 700
    ]
});

const BillPDF = (props) => {
    // Dynamic Template Selection
    // In the future: const Template = templateMap[props.config.templateId] || CoolieTemplate;
    const Template = CoolieTemplate;

    return (
        <Document>
            <Template {...props} />
        </Document>
    );
};

export default BillPDF;
