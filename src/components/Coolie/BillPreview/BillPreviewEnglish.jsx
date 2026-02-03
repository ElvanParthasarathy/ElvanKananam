import React from 'react';
import { numberToWords } from '../../../utils/numberToWords';
import { calcItemAmount, calcTotalKg, calcTotalRs, gramsToKg, formatWeight, formatCurrency } from '../../../utils/calculations';
import { IconPhone, IconMail } from '../../common/Icons';

/**
 * BillPreviewEnglish Component
 * 
 * English layout for the bill.
 * Preserves the Tamil spiritual greeting and Bilingual Company Name as requested.
 */
function BillPreviewEnglish({
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
    customStyles,
    selectedCustomer // New Prop
}) {
    const { email, phone } = config; // Removed displayAddress from destructuring as it's now derived

    // Calculations
    const totalKg = calcTotalKg(items, setharamGrams);
    const totalRs = calcTotalRs(items, courierRs, ahimsaSilkRs, customChargeRs);
    const setharamKg = gramsToKg(setharamGrams);

    // English Data Logic
    // If selectedCustomer is present, we try to use the English fields.
    // 'customerName' prop usually holds the primary display name (Tamil in Editor).
    // 'contactPerson' prop usually holds the person name in 'Both' mode (Tamil in Editor).

    const pickEnglishPart = (text) => {
        if (!text) return text;
        const str = String(text);
        if (str.includes('/')) {
            const parts = str.split('/').map(p => p.trim()).filter(Boolean);
            return parts[parts.length - 1] || str;
        }
        return str;
    };

    let displayCustomerName = customerName;
    let displayCity = city;

    // Resolve Name
    if (selectedCustomer) {
        // English Fields from DB
        const engName = selectedCustomer.name || '';
        const engCompany = selectedCustomer.company_name || '';

        if (contactPerson) {
            // Both Mode: Person Name, Company Name
            // If we have English versions, use them.
            // Fallback: if English name missing, use the prop (which might be Tamil, but better than nothing)
            const pName = engName || pickEnglishPart(contactPerson);
            const cName = engCompany || pickEnglishPart(customerName);
            displayCustomerName = `${pName}, ${cName}`;
        } else {
            // Single Mode (Company OR Individual)
            // If customerName prop matches company_name_tamil/company_name, use English Company Logic
            // Otherwise use English Name logic. 
            // Simple heuristic: if we have an English Company name and it's not empty, prefer it if the user selected a company-like profile.
            // But safest is: check if `customerName` provided matches the Tamil Company Name? 
            // Better: Just use whatever non-empty English field exists that matches the 'primary' intent.

            // If the user selected 'Company' mode, BillEditor passed company name as 'customerName'.
            // If 'Individual', passed name as 'customerName'.

            // We can check which one aligns. 
            // Or simpler: If existing 'customerName' matches 'company_name_tamil', use 'company_name'.

            if (customerName === (selectedCustomer.company_name_tamil || selectedCustomer.company_name)) {
                displayCustomerName = engCompany || pickEnglishPart(customerName);
            } else {
                displayCustomerName = engName || pickEnglishPart(customerName);
            }
        }

        // Resolve City
        if (selectedCustomer.city) {
            displayCity = selectedCustomer.city;
        }
    } else {
        // Fallback for Manual Entry or Legacy
        const pName = contactPerson ? pickEnglishPart(contactPerson) : '';
        const cName = pickEnglishPart(customerName);
        displayCustomerName = contactPerson ? `${pName}, ${cName}` : cName;
    }

    // Address Handling: If selectedCustomer has address_line1 (English), use it?
    // The 'address' prop currently comes from setAddress in BillEditor, which prefers Tamil.
    // So we should override if English available.
    let displayAddress = address;
    if (selectedCustomer && selectedCustomer.address_line1) {
        displayAddress = selectedCustomer.address_line1;
    } else {
        displayAddress = pickEnglishPart(displayAddress);
    }

    if (selectedCustomer && selectedCustomer.city) {
        displayCity = selectedCustomer.city;
    } else {
        displayCity = pickEnglishPart(displayCity);
    }

    const name = config.name || {};

    return (
        <div
            className="a4-paper"
            style={customStyles}
        >

            {/* Top Greeting Row - Transliterated to English */}
            <div className="top-greeting-row">
                <span className="greeting-left">Vaazhga Vaiyagam</span>
                <span className="greeting-center">உ</span>
                <span className="greeting-right">Vaazhga Valamudan</span>
            </div>

            {/* Header */}
            <div className="print-header-new">
                {/* Left - Logo + Company Name */}
                <div className="header-left">

                    <div className="header-company-info">
                        <div className="company-name font-display">
                            {name.english}
                        </div>
                        {/* Company Subtitle Preserved in Tamil */}
                        <div className="company-subtitle">{name.tamil}</div>
                    </div>
                </div>

                {/* Right - Bill Type */}
                <div className="header-right">
                    <div className="bill-type-badge">Coolie Bill</div>
                </div>
            </div>

            {/* Divider Line */}
            <div className="header-divider"></div>

            {/* Bill Info Section */}
            <div className="bill-info-section">
                <div className="bill-meta-row">
                    <span className="bill-meta">Bill No : <strong>{billNo}</strong></span>
                    <span className="bill-meta">Date : <strong>{date}</strong></span>
                </div>
                <div className="customer-info">
                    <div className="customer-name-simple">
                        <span className="customer-label">Thiru:</span>
                        <span style={{ fontWeight: '600' }}>
                            {displayCustomerName}
                        </span>
                    </div>
                    <div className="customer-city-simple">
                        <span className="customer-label">Place:</span>
                        {displayAddress && displayCity ? `${displayAddress}, ${displayCity}` : (displayAddress || displayCity || '')}
                    </div>
                </div>
            </div>

            {/* Table */}
            <table className="bill-table-new">
                <thead>
                    <tr>
                        <th style={{ width: '15%' }}>
                            <div>Coolie</div>
                        </th>
                        <th style={{ width: '45%', textAlign: 'left', paddingLeft: '15px' }}>
                            <div>Item description</div>
                        </th>
                        <th style={{ width: '15%' }}>
                            <div>Weight (Kg)</div>
                        </th>
                        <th style={{ width: '25%' }}>
                            <div>Amount</div>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((item, i) => (
                        <tr key={i} className={i % 2 === 1 ? 'row-alt' : ''}>
                            <td className="text-center">{item.coolie || ''}</td>
                            <td className="text-left">{item.name_english || item.porul}</td>
                            <td className="text-center">{item.kg ? formatWeight(item.kg) : ''}</td>
                            <td className="text-center">{item.kg ? formatCurrency(calcItemAmount(item.coolie, item.kg)) : ''}</td>
                        </tr>
                    ))}

                    {ahimsaSilkRs && (
                        <tr>
                            <td className="text-center">-</td>
                            <td className="text-left">
                                <div>Ahimsa Silk</div>
                            </td>
                            <td className="text-center">-</td>
                            <td className="text-center">{formatCurrency(ahimsaSilkRs)}</td>
                        </tr>
                    )}

                    {customChargeRs && (
                        <tr>
                            <td className="text-center">-</td>
                            <td className="text-left">
                                <div>{customChargeName || 'Other Charges'}</div>
                            </td>
                            <td className="text-center">-</td>
                            <td className="text-center">{formatCurrency(customChargeRs)}</td>
                        </tr>
                    )}

                    {setharamGrams && (
                        <tr className={items.length % 2 === 1 ? 'row-alt' : ''}>
                            <td className="text-center">-</td>
                            <td className="text-left">
                                <div>Wastage</div>
                            </td>
                            <td className="text-center">{formatWeight(setharamKg)}</td>
                            <td className="text-center">-</td>
                        </tr>
                    )}

                    {courierRs && (
                        <tr>
                            <td className="text-center">-</td>
                            <td className="text-left">
                                <div>Courier Charges</div>
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
                            Total
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
                Amount in Words: <span className="words-line" style={{ textTransform: 'capitalize' }}>{numberToWords(totalRs)} Only</span>
            </div>

            {/* Footer */}
            <div className="bill-footer-new">
                <div className="footer-left">
                    {showBankDetails && (
                        <div style={{
                            marginBottom: '10px',
                            color: 'var(--bill-text-dark)',
                            fontSize: '0.9rem',
                            lineHeight: '1.4',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '6px'
                        }}>
                            <div style={{ display: 'flex', gap: '5px' }}>
                                <div style={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>Bank Details :</div>
                                <div style={{ color: '#000' }}>{config.bankDetailsEnglish || bankDetails}</div>
                            </div>

                            {accountNo && (
                                <div style={{ display: 'flex', gap: '5px' }}>
                                    <div style={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>Account No :</div>
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
                    <div className="thank-you">
                        Thank You
                    </div>
                </div>
                <div className="preview-footer-right">
                    <div className="sign-company font-display">{name.english}</div>
                    <div className="sign-space"></div>
                    <div className="sign-label">
                        (Authorized Signature)
                    </div>
                </div>
            </div>

            {/* Contact Section */}
            <div className="contact-section">
                <div className="contact-title">
                    Contact Us
                </div>
                <div className="contact-row">
                    <div className="contact-left">
                        <div className="contact-address">
                            {config.address.english?.line2 || config.address.line2}
                            <br />
                            {config.address.english?.line3 || config.address.line3}
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

export default BillPreviewEnglish;
