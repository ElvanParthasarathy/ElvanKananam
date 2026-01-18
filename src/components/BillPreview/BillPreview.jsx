import React from 'react';
import { IconPhone, IconPrinter, IconEdit, IconMail } from '../common/Icons';
import { numberToWordsTamil } from '../../utils/tamilNumbers';
import { calcItemAmount, calcTotalKg, calcTotalRs, gramsToKg, formatWeight } from '../../utils/calculations';

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
    onEdit
}) {
    const { name, greeting, billType, address, phone, email, labels } = config;

    // Calculations
    const setharamKg = gramsToKg(setharamGrams);
    const totalKg = calcTotalKg(items, setharamGrams);
    const totalRs = calcTotalRs(items, courierRs);

    return (
        <div className="preview-overlay">
            {/* A4 Paper */}
            <div className="a4-paper font-tamil">

                {/* Top Greeting Row */}
                <div className="top-greeting-row">
                    <span className="greeting-left">வாழ்க வையகம்</span>
                    <span className="greeting-right">{greeting}</span>
                </div>

                {/* Header */}
                <div className="print-header-new">
                    {/* Left - Logo */}
                    <div className="header-logo">
                        <img src="/icons/SJSFMTT (Large).png" alt="Logo" />
                    </div>

                    {/* Right - Company Name & Bill Type */}
                    <div className="header-company">
                        <div className="company-name font-display">
                            {name.english}
                        </div>
                        <div className="company-subtitle">{name.tamil}</div>
                        <div className="bill-type-badge font-display">{billType}</div>
                    </div>
                </div>

                {/* Divider Line */}
                <div className="header-divider"></div>

                {/* Bill Info Section */}
                <div className="bill-info-section">
                    <div className="bill-info-row">
                        <span className="bill-to-badge">{labels.customerPrefix}</span>
                        <span className="bill-meta">{labels.billNo} : {billNo}</span>
                        <span className="bill-meta">{labels.date} : <strong>{date}</strong></span>
                    </div>
                    <div className="customer-info">
                        <div className="customer-name">{customerName}</div>
                        <div className="customer-address">
                            {city}
                            {address && (
                                <>
                                    <br />{address.line1}
                                    <br />{address.line2}
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Table */}
                <table className="bill-table-new">
                    <thead>
                        <tr>
                            <th style={{ width: '45%', textAlign: 'left', paddingLeft: '15px' }}>{labels.itemName}</th>
                            <th style={{ width: '15%' }}>{labels.rate}</th>
                            <th style={{ width: '15%' }}>{labels.weight}</th>
                            <th style={{ width: '25%' }}>{labels.amount}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, i) => (
                            <tr key={i} className={i % 2 === 1 ? 'row-alt' : ''}>
                                <td className="text-left">{item.porul}</td>
                                <td className="text-center">{item.coolie ? `₹ ${item.coolie}` : ''}</td>
                                <td className="text-center">{item.kg ? formatWeight(item.kg) : ''}</td>
                                <td className="text-center">{calcItemAmount(item.coolie, item.kg) ? `₹ ${calcItemAmount(item.coolie, item.kg)}` : ''}</td>
                            </tr>
                        ))}

                        {setharamGrams && (
                            <tr className={items.length % 2 === 1 ? 'row-alt' : ''}>
                                <td className="text-left">{labels.setharam}</td>
                                <td className="text-center">-</td>
                                <td className="text-center">{formatWeight(setharamKg)}</td>
                                <td className="text-center">-</td>
                            </tr>
                        )}

                        {courierRs && (
                            <tr>
                                <td className="text-left">{labels.courier}</td>
                                <td className="text-center">-</td>
                                <td className="text-center">-</td>
                                <td className="text-center">₹ {courierRs}</td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {/* Total Row */}
                <div className="total-row-new">
                    <span className="total-label">{labels.total}</span>
                    <span className="total-value">₹ {totalRs}</span>
                </div>

                {/* Amount in Words */}
                <div className="words-section">
                    {labels.inWords}: <span className="words-line">{numberToWordsTamil(totalRs)}</span>
                </div>

                {/* Footer */}
                <div className="bill-footer-new">
                    <div className="footer-left">
                        <div className="thank-you font-display">நன்றி</div>
                    </div>
                    <div className="footer-right">
                        <div className="sign-line"></div>
                        <div className="sign-label">{labels.signature}</div>
                    </div>
                </div>

                {/* Contact Info Row */}
                <div className="contact-row">
                    <div className="contact-email">
                        <IconMail size={14} /> {email}
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

            {/* Floating Action Buttons */}
            <div className="preview-actions">
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
