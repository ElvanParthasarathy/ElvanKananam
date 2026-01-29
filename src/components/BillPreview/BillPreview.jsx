import React from 'react';
import { IconPhone, IconPrinter, IconEdit, IconMail, IconZoomIn, IconZoomOut } from '../common/Icons';
import { numberToWordsTamil } from '../../utils/tamilNumbers';
import { calcItemAmount, calcTotalKg, calcTotalRs, gramsToKg, formatWeight, formatCurrency } from '../../utils/calculations';

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
    city,
    items,
    setharamGrams,

    courierRs,

    ahimsaSilkRs,
    customChargeName,
    customChargeRs,
    onEdit
}) {
    const { name, greeting, billType, address, phone, email, labels } = config;

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
    const [scale, setScale] = React.useState(1);
    // Track if user has manually changed zoom
    const [manualZoom, setManualZoom] = React.useState(false);

    React.useEffect(() => {
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

    return (
        <div className="preview-overlay" style={{ overflow: 'auto', textAlign: scale < 1 ? 'center' : 'left' }}>
            {/* Wrapper to handle scaling and scrolling */}
            <div className="zoom-wrapper" style={{
                width: '210mm',
                transform: `scale(${scale})`,
                transformOrigin: 'top left', // Pivot from top-left for predictable scrolling
                margin: scale < 1 ? '0 auto' : '0', // Center if smaller than screen
                marginBottom: '200px' // Extra space for FABs
            }}>
                {/* A4 Paper */}
                <div
                    className="a4-paper font-tamil"
                    style={customStyles}
                >

                    {/* Top Greeting Row */}
                    <div className="top-greeting-row">
                        <span className="greeting-left">வாழ்க வையகம்</span>
                        <span className="greeting-center">உ</span>
                        <span className="greeting-right">{greeting}</span>
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
                            <div className="bill-type-badge font-tamil">{billType}</div>
                        </div>
                    </div>



                    {/* Divider Line */}
                    <div className="header-divider"></div>

                    {/* Bill Info Section */}
                    <div className="bill-info-section">
                        <div className="bill-meta-row">
                            <span className="bill-meta">{labels.billNo} : <strong>{billNo}</strong></span>
                            <span className="bill-meta">{labels.date} : <strong>{date}</strong></span>
                        </div>
                        <div className="customer-info">
                            <div className="customer-name-simple">
                                <span className="customer-label">{labels.customerPrefix}</span> {customerName}
                            </div>
                            <div className="customer-city-simple">
                                <span className="customer-label">{labels.cityPrefix}</span> {city}
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <table className="bill-table-new">
                        <thead>
                            <tr>
                                <th style={{ width: '15%' }}>{labels.rate}</th>
                                <th style={{ width: '45%', textAlign: 'left', paddingLeft: '15px' }}>{labels.itemName}</th>
                                <th style={{ width: '15%' }}>{labels.weight}</th>
                                <th style={{ width: '25%' }}>{labels.amount}</th>
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

                            {setharamGrams && (
                                <tr className={items.length % 2 === 1 ? 'row-alt' : ''}>
                                    <td className="text-center">-</td>
                                    <td className="text-left">{labels.setharam}</td>
                                    <td className="text-center">{formatWeight(setharamKg)}</td>
                                    <td className="text-center">-</td>
                                </tr>
                            )}

                            {courierRs && (
                                <tr>
                                    <td className="text-center">-</td>
                                    <td className="text-left">{labels.courier}</td>
                                    <td className="text-center">-</td>
                                    <td className="text-center">{formatCurrency(courierRs)}</td>
                                </tr>
                            )}

                            {ahimsaSilkRs && (
                                <tr>
                                    <td className="text-center">-</td>
                                    <td className="text-left">{labels.ahimsaSilk}</td>
                                    <td className="text-center">-</td>
                                    <td className="text-center">{formatCurrency(ahimsaSilkRs)}</td>
                                </tr>
                            )}

                            {customChargeRs && (
                                <tr>
                                    <td className="text-center">-</td>
                                    <td className="text-left">{customChargeName || (labels.otherName || 'More')}</td>
                                    <td className="text-center">-</td>
                                    <td className="text-center">{formatCurrency(customChargeRs)}</td>
                                </tr>
                            )}
                        </tbody>
                        {/* Total Row in Footer for Alignment */}
                        <tfoot>
                            <tr className="total-footer-row">
                                <td colSpan="2" className="text-right total-label-cell">{labels.total}</td>
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
                        {labels.inWords}: <span className="words-line">{numberToWordsTamil(totalRs)}</span>
                    </div>

                    {/* Footer */}
                    <div className="bill-footer-new">
                        <div className="footer-left">
                            <div className="thank-you font-tamil">நன்றி</div>
                        </div>
                        <div className="footer-right">
                            <div className="sign-company font-display">{name.english}</div>
                            <div className="sign-space"></div>
                            <div className="sign-label">{labels.signature}</div>
                        </div>
                    </div>

                    {/* Contact Section */}
                    <div className="contact-section">
                        <div className="contact-title">தொடர்பு கொள்ள</div>
                        <div className="contact-row">
                            <div className="contact-left">
                                <div className="contact-address">
                                    {address.line1}, {address.line2}
                                    <br />
                                    {address.line3}
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
                <button className="fab fab-primary" onClick={() => window.print()} aria-label="Print">
                    <IconPrinter size={22} />
                </button>
            </div>
        </div>
    );
}

export default BillPreview;
