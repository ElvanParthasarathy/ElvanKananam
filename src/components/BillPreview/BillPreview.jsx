import React, { useState, useEffect } from 'react';
import { IconPhone, IconPrinter, IconEdit, IconMail, IconZoomIn, IconZoomOut, IconSave, IconLoader } from '../common/Icons';
import { showSubtitles } from '../../config/translations';
import { numberToWordsTamil } from '../../utils/tamilNumbers';
import { calcItemAmount, calcTotalKg, calcTotalRs, gramsToKg, formatWeight, formatCurrency } from '../../utils/calculations';
import { PDF_SERVER_URL } from '../../config/index';

/**
 * BillPreview Component
 * 
 * A4-sized print preview of the bill - New Design
 */
function BillPreview({
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
    onEdit,
    t,
    language,
    showIFSC = true,
    showBankDetails = true
}) {
    const showSubs = false; // Never show bilingual subtitles in Preview/Print
    const { name, greeting, billType, address: merchantAddress, phone, email } = config;

    // Calculations
    const setharamKg = gramsToKg(setharamGrams);
    const totalKg = calcTotalKg(items, setharamGrams);
    const totalRs = calcTotalRs(items, courierRs, ahimsaSilkRs, customChargeRs);

    // Generate CSS variables for dynamic theming
    const customStyles = {
        '--bill-primary': config.colors.primary,
        '--bill-primary-light': config.colors.headerBg,
        '--bill-accent': config.colors.accent,
        '--bill-border': config.colors.border,
        '--bill-text': config.colors.text,
        '--bill-text-dark': config.colors.textDark,
        '--bill-row-alt': '#f8faf8' // Keep default light gray/greenish for alt rows
    };

    // Responsive Scaling Logic
    const [scale, setScale] = useState(1);
    // Track if user has manually changed zoom
    const [manualZoom, setManualZoom] = useState(false);

    useEffect(() => {
        // If user manually zoomed, don't auto-scale
        if (manualZoom) return;

        const handleResize = () => {
            const paperWidth = 820; // Approx 210mm + padding
            const windowWidth = window.innerWidth;

            // Only scale down if window is smaller than paper
            if (windowWidth < paperWidth) {
                const newScale = (windowWidth - 32) / paperWidth; // -32 for padding
                setScale(newScale);
            } else {
                setScale(1);
            }
        };

        handleResize(); // Initial call
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [manualZoom]);

    // Zoom Handlers
    const handleZoomIn = () => {
        setManualZoom(true);
        setScale(prev => Math.min(prev + 0.1, 1.5)); // Max zoom 1.5
    };

    const handleZoomOut = () => {
        setManualZoom(true);
        setScale(prev => Math.max(prev - 0.1, 0.3)); // Min zoom 0.3
    };

    // PRINT Handler (Native Browser Print)
    const handlePrint = () => {
        const originalTitle = document.title;
        // Set filename for "Save as PDF"
        const cleanDate = date.replace(/[/._]/g, ' ');
        const cleanName = name.english.replace(/[/._]/g, ' ');
        document.title = `Bill-${billNo} ${cleanDate} ${cleanName}`;

        // Short delay to ensure title update applies
        setTimeout(() => {
            window.print();
            // Restore title
            setTimeout(() => document.title = originalTitle, 500);
        }, 100);
    };





    return (
        <div className="preview-overlay" style={{
            overflow: 'auto',
            textAlign: scale < 1 ? 'center' : 'left',
            background: 'var(--color-preview-bg)',
            zIndex: 2000
        }}>



            {/* Wrapper to handle scaling and scrolling */}
            <div className="zoom-wrapper" style={{
                width: '210mm',
                transform: `scale(${scale})`,
                transformOrigin: 'top left', // Pivot from top-left for predictable scrolling
                marginTop: scale < 1 ? '0' : '0',
                marginRight: scale < 1 ? 'auto' : '0',
                marginBottom: '200px', // Extra space for FABs
                marginLeft: scale < 1 ? 'auto' : '0'
            }}>
                {/* A4 Paper */}
                <div
                    className="a4-paper font-tamil"
                    style={customStyles}
                >

                    {/* Top Greeting Row */}
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
                            {showSubs && <span className="bill-meta" style={{ fontSize: '10px', marginLeft: '-15px', color: 'var(--bill-text-dark)', opacity: 0.7 }}>Bill No</span>}
                            <span className="bill-meta">நாள் : <strong>{date}</strong></span>
                            {showSubs && <span className="bill-meta" style={{ fontSize: '10px', marginLeft: '-15px', color: 'var(--bill-text-dark)', opacity: 0.7 }}>Date</span>}
                        </div>
                        <div className="customer-info">
                            <div className="customer-name-simple">
                                <span className="customer-label">திரு:</span>
                                <span style={{ fontWeight: '600' }}>
                                    {contactPerson ? `${contactPerson}, ${customerName}` : customerName}
                                </span>
                                {showSubs && <span style={{ fontSize: '10px', color: 'var(--bill-text-dark)', opacity: 0.7, marginLeft: '8px' }}>/ Mr.</span>}
                            </div>
                            <div className="customer-city-simple">
                                <span className="customer-label">ஊர்:</span>
                                {address && city ? `${address}, ${city}` : (address || city || '')}
                                {showSubs && <span style={{ fontSize: '10px', color: 'var(--bill-text-dark)', opacity: 0.7, marginLeft: '8px' }}>/ City</span>}
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <table className="bill-table-new">
                        <thead>
                            <tr>
                                <th style={{ width: '15%' }}>
                                    <div>கூலி</div>
                                    {showSubs && <div style={{ fontSize: '9px', fontWeight: 'normal' }}>Coolie</div>}
                                </th>
                                <th style={{ width: '45%', textAlign: 'left', paddingLeft: '15px' }}>
                                    <div>பொருள் பெயர்</div>
                                    {showSubs && <div style={{ fontSize: '9px', fontWeight: 'normal' }}>Item Description</div>}
                                </th>
                                <th style={{ width: '15%' }}>
                                    <div>எடை (Kg)</div>
                                    {showSubs && <div style={{ fontSize: '9px', fontWeight: 'normal' }}>Weight (Kg)</div>}
                                </th>
                                <th style={{ width: '25%' }}>
                                    <div>தொகை</div>
                                    {showSubs && <div style={{ fontSize: '9px', fontWeight: 'normal' }}>Amount</div>}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, i) => (
                                <tr key={i} className={i % 2 === 1 ? 'row-alt' : ''}>
                                    <td className="text-center">{item.coolie || ''}</td>
                                    <td className="text-left">{item.porul}</td>
                                    <td className="text-center">{item.kg ? formatWeight(item.kg) : ''}</td>
                                    <td className="text-center">{item.kg ? formatCurrency(calcItemAmount(item.coolie, item.kg)) : ''}</td>
                                </tr>
                            ))}

                            {ahimsaSilkRs && (
                                <tr>
                                    <td className="text-center">-</td>
                                    <td className="text-left">
                                        <div>அகிம்சா பட்டு</div>
                                        {showSubs && <div style={{ fontSize: '9px', color: '#666' }}>Ahimsa Silk</div>}
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
                                        {showSubs && !customChargeName && <div style={{ fontSize: '9px', color: '#666' }}>Other Details</div>}
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
                                        {showSubs && <div style={{ fontSize: '9px', color: '#666' }}>Wastage</div>}
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
                                        {showSubs && <div style={{ fontSize: '9px', color: '#666' }}>Courier</div>}
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
                                    {showSubs && <span style={{ fontSize: '10px', marginLeft: '10px', fontWeight: 'normal', textTransform: 'uppercase' }}>/ Total</span>}
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
                        {showSubs && <div style={{ fontSize: '9px', color: '#666', marginTop: '4px' }}>Amount in Words: (Tamil Words Above)</div>}
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
                                {showSubs && <span style={{ fontSize: '12px', marginLeft: '10px', fontWeight: 'normal' }}>/ Thank You</span>}
                            </div>
                        </div>
                        <div className="preview-footer-right">
                            <div className="sign-company font-display">{name.english}</div>
                            <div className="sign-space"></div>
                            <div className="sign-label">
                                (கையொப்பம்)
                                {showSubs && <span style={{ fontSize: '9px', display: 'block', fontWeight: 'normal' }}>Authorized Signature</span>}
                            </div>
                        </div>
                    </div>

                    {/* Contact Section */}
                    <div className="contact-section">
                        <div className="contact-title">
                            தொடர்பு கொள்ள
                            {showSubs && <span style={{ fontSize: '10px', marginLeft: '10px', fontWeight: 'normal' }}>/ Contact Us</span>}
                        </div>
                        <div className="contact-row">
                            <div className="contact-left">
                                <div className="contact-address">
                                    {merchantAddress.line2}
                                    <br />
                                    {merchantAddress.line3}
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
            </div>

            {/* Floating Action Buttons */}
            <div className="preview-actions">
                <button className="fab fab-secondary" onClick={handleZoomOut} aria-label="Zoom Out" title="Zoom Out">
                    <IconZoomOut size={22} />
                </button>
                <div style={{ width: '8px' }}></div>
                <button className="fab fab-secondary" onClick={handleZoomIn} aria-label="Zoom In" title="Zoom In">
                    <IconZoomIn size={22} />
                </button>
                <div style={{ width: '20px' }}></div>
                <button className="fab fab-secondary" onClick={onEdit} aria-label="Edit">
                    <IconEdit size={22} />
                </button>




                {/* Print Button (Fallback) */}
                <button className="fab fab-primary" onClick={handlePrint} aria-label="Print" title="Print to Paper">
                    <IconPrinter size={22} />
                </button>
            </div>
        </div>
    );
}

export default BillPreview;
