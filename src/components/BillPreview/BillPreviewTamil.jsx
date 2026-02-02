import React from 'react';
import { showSubtitles } from '../../config/translations';
import { numberToWordsTamil } from '../../utils/tamilNumbers';
import { calcItemAmount, calcTotalKg, calcTotalRs, gramsToKg, formatWeight, formatCurrency } from '../../utils/calculations';
import { IconPhone, IconMail } from '../common/Icons';

/**
 * BillPreviewTamil Component
 * 
 * Strict Tamil layout for the bill.
 */
function BillPreviewTamil({
    config,
    billNo,
    date,
    customerName,
    contactPerson,
    address,
    city,
    items,
    setharamGrams,
    courierRs,
    ahimsaSilkRs,
    customChargeName,
    customChargeRs,
    bankDetails,
    accountNo,
    showIFSC,
    showBankDetails,
    customStyles
}) {
    const showSubs = false; // Strict Tamil, no subtitles
    const { name, displayAddress, email, phone } = config;

    const pickTamilPart = (text) => {
        if (!text) return text;
        const str = String(text);
        if (str.includes('/')) {
            const parts = str.split('/').map(p => p.trim()).filter(Boolean);
            return parts[0] || str;
        }
        return str;
    };

    // Calculations
    const setharamKg = gramsToKg(setharamGrams);
    const totalKg = calcTotalKg(items, setharamGrams);
    const totalRs = calcTotalRs(items, courierRs, ahimsaSilkRs, customChargeRs);

    return (
        <div
            className="a4-paper font-tamil"
            style={customStyles}
        >

            {/* Top Greeting Row */}
            <div className="top-greeting-row">
                <span className="greeting-left">வாழ்க வையகம்</span>
                <span className="greeting-center">உ</span>
                <span className="greeting-right">வாழ்க வளமுடன்</span>
            </div>

            {/* Header */}
            <div className="print-header-new">
                {/* Left - Logo + Company Name */}
                <div className="header-left">

                    <div className="header-company-info">
                        <div className="company-name font-display">
                            {name.english}
                        </div>
                        <div className="company-subtitle">{name.tamil}</div>
                    </div>
                </div>

                {/* Right - Bill Type */}
                <div className="header-right">
                    <div className="bill-type-badge font-tamil">கூலி பில்</div>
                </div>
            </div>

            {/* Divider Line */}
            <div className="header-divider"></div>

            {/* Bill Info Section */}
            <div className="bill-info-section">
                <div className="bill-meta-row">
                    <span className="bill-meta">பில் எண் : <strong>{billNo}</strong></span>
                    <span className="bill-meta">நாள் : <strong>{date}</strong></span>
                </div>
                <div className="customer-info">
                    <div className="customer-name-simple">
                        <span className="customer-label">திரு:</span>
                        <span style={{ fontWeight: '600' }}>
                            {contactPerson ? `${pickTamilPart(contactPerson)}, ${pickTamilPart(customerName)}` : pickTamilPart(customerName)}
                        </span>
                    </div>
                    <div className="customer-city-simple">
                        <span className="customer-label">ஊர்:</span>
                        {address && city ? `${pickTamilPart(address)}, ${pickTamilPart(city)}` : (pickTamilPart(address) || pickTamilPart(city) || '')}
                    </div>
                </div>
            </div>

            {/* Table */}
            <table className="bill-table-new">
                <thead>
                    <tr>
                        <th style={{ width: '15%' }}>
                            <div>கூலி</div>
                        </th>
                        <th style={{ width: '45%', textAlign: 'left', paddingLeft: '15px' }}>
                            <div>பொருள் பெயர்</div>
                        </th>
                        <th style={{ width: '15%' }}>
                            <div>எடை (Kg)</div>
                        </th>
                        <th style={{ width: '25%' }}>
                            <div>தொகை</div>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((item, i) => (
                        <tr key={i} className={i % 2 === 1 ? 'row-alt' : ''}>
                            <td className="text-center">{item.coolie || ''}</td>
                            <td className="text-left">{pickTamilPart(item.porul)}</td>
                            <td className="text-center">{item.kg ? formatWeight(item.kg) : ''}</td>
                            <td className="text-center">{item.kg ? formatCurrency(calcItemAmount(item.coolie, item.kg)) : ''}</td>
                        </tr>
                    ))}

                    {ahimsaSilkRs && (
                        <tr>
                            <td className="text-center">-</td>
                            <td className="text-left">
                                <div>அகிம்சா பட்டு</div>
                            </td>
                            <td className="text-center">-</td>
                            <td className="text-center">{formatCurrency(ahimsaSilkRs)}</td>
                        </tr>
                    )}

                    {customChargeRs && (
                        <tr>
                            <td className="text-center">-</td>
                            <td className="text-left">
                                <div>{customChargeName || 'பிற விவரம்'}</div>
                            </td>
                            <td className="text-center">-</td>
                            <td className="text-center">{formatCurrency(customChargeRs)}</td>
                        </tr>
                    )}

                    {setharamGrams && (
                        <tr className={items.length % 2 === 1 ? 'row-alt' : ''}>
                            <td className="text-center">-</td>
                            <td className="text-left">
                                <div>சேதாரம்</div>
                            </td>
                            <td className="text-center">{formatWeight(setharamKg)}</td>
                            <td className="text-center">-</td>
                        </tr>
                    )}

                    {courierRs && (
                        <tr>
                            <td className="text-center">-</td>
                            <td className="text-left">
                                <div>கொரியர் கட்டணம்</div>
                            </td>
                            <td className="text-center">-</td>
                            <td className="text-center">{formatCurrency(courierRs)}</td>
                        </tr>
                    )}
                </tbody>
                {/* Total Row in Footer for Alignment */}
                <tfoot>
                    <tr className="total-footer-row">
                        <td colSpan="2" className="text-right total-label-cell">
                            மொத்தம்
                        </td>
                        <td className="text-center total-weight-cell">
                            {formatWeight(totalKg)} Kg
                        </td>
                        <td className="text-center total-amount-cell">
                            ₹ {formatCurrency(totalRs)}
                        </td>
                    </tr>
                </tfoot>
            </table>

            {/* Amount in Words */}
            <div className="words-section">
                எழுத்தில் மொத்தத் தொகை: <span className="words-line">{numberToWordsTamil(totalRs)}</span>
            </div>

            {/* Footer */}
            <div className="bill-footer-new">
                <div className="footer-left">
                    {showBankDetails && (bankDetails || accountNo) && (
                        <div style={{
                            marginBottom: '10px',
                            color: 'var(--bill-text-dark)',
                            fontSize: '0.9rem',
                            lineHeight: '1.4',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '6px'
                        }}>
                            {bankDetails && (
                                <div style={{ display: 'flex', gap: '5px' }}>
                                    <div style={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>வங்கி விவரம் :</div>
                                    <div style={{ color: '#000' }}>{bankDetails}</div>
                                </div>
                            )}
                            {accountNo && (
                                <div style={{ display: 'flex', gap: '5px' }}>
                                    <div style={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>கணக்கு எண் :</div>
                                    <div style={{ color: '#000' }}>{accountNo}</div>
                                </div>
                            )}
                            {showIFSC && config.ifscCode && (
                                <div style={{ display: 'flex', gap: '5px' }}>
                                    <div style={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>IFSC :</div>
                                    <div style={{ textTransform: 'uppercase', color: '#000' }}>{config.ifscCode}</div>
                                </div>
                            )}
                        </div>
                    )}
                    <div className="thank-you font-tamil">
                        நன்றி
                    </div>
                </div>
                <div className="preview-footer-right">
                    <div className="sign-company font-display">{name.english}</div>
                    <div className="sign-space"></div>
                    <div className="sign-label">
                        (கையொப்பம்)
                    </div>
                </div>
            </div>

            {/* Contact Section */}
            <div className="contact-section">
                <div className="contact-title">
                    தொடர்பு கொள்ள
                </div>
                <div className="contact-row">
                    <div className="contact-left">
                        <div className="contact-address">
                            {config.address.line2}
                            <br />
                            {config.address.line3}
                        </div>
                        <div className="contact-email">
                            <IconMail size={14} /> {email}
                        </div>
                    </div>
                    <div className="contact-phones">
                        {phone.map((num, i) => (
                            <div key={i} className="phone-item-new">
                                <IconPhone size={14} /> {num}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

        </div>
    );
}

export default BillPreviewTamil;
