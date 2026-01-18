import React from 'react';
import { IconPhone, IconPrinter, IconEdit } from '../common/Icons';
import { numberToWordsTamil } from '../../utils/tamilNumbers';
import { calcItemAmount, calcTotalKg, calcTotalRs, gramsToKg, formatWeight } from '../../utils/calculations';

/**
 * BillPreview Component
 * 
 * A4-sized print preview of the bill
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

                {/* Header */}
                <div className="print-header">
                    {/* Left - Logo & Greeting */}
                    <div className="ph-left">
                        <div className="bill-logo">
                            <img src="/icons/SJSFMTT (Large).png" alt="Logo" />
                        </div>
                        {greeting}
                    </div>

                    {/* Center - Business Info */}
                    <div className="ph-center">
                        <div className="biz-title font-display">
                            {name.english}
                        </div>
                        <div className="biz-sub">{name.tamil}</div>
                        <div className="biz-addr">
                            {address.line1}<br />
                            {address.line2}<br />
                            {address.line3}
                        </div>
                        <div className="biz-email">
                            <strong>மின்னஞ்சல் முகவரி :</strong> {email}
                        </div>
                        <div className="bill-badge">{billType}</div>
                    </div>

                    {/* Right - Phone Numbers */}
                    <div className="ph-right">
                        {phone.map((num, i) => (
                            <div key={i} className="phone-item">
                                <IconPhone size={14} /> {num}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Meta Row */}
                <div className="meta-row">
                    <div>{labels.billNo} : {billNo}</div>
                    <div>{labels.date} : {date}</div>
                </div>

                {/* Customer Info */}
                <div className="cust-row">
                    {labels.customerPrefix} <span className="dotted-line">{customerName}</span>
                </div>
                <div className="cust-row">
                    {labels.cityPrefix} <span className="dotted-line">{city}</span>
                </div>

                {/* Table */}
                <table className="bill-table">
                    <thead>
                        <tr>
                            <th style={{ width: '15%' }}>{labels.rate}</th>
                            <th style={{ width: '45%', textAlign: 'left', paddingLeft: '15px' }}>{labels.itemName}</th>
                            <th style={{ width: '20%' }}>{labels.weight}</th>
                            <th style={{ width: '20%' }}>{labels.amount}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, i) => (
                            <tr key={i}>
                                <td className="text-center">{item.coolie}</td>
                                <td className="text-left">{item.porul}</td>
                                <td className="text-center">{item.kg ? formatWeight(item.kg) : ''}</td>
                                <td className="text-center">{calcItemAmount(item.coolie, item.kg) || ''}</td>
                            </tr>
                        ))}

                        {setharamGrams && (
                            <tr>
                                <td></td>
                                <td className="text-left">{labels.setharam}</td>
                                <td className="text-center">{formatWeight(setharamKg)}</td>
                                <td className="text-center">-</td>
                            </tr>
                        )}

                        {courierRs && (
                            <tr>
                                <td></td>
                                <td className="text-left">{labels.courier}</td>
                                <td className="text-center">-</td>
                                <td className="text-center">{courierRs}</td>
                            </tr>
                        )}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colSpan={2} style={{ textAlign: 'right', paddingRight: '15px' }}>
                                {labels.total}
                            </td>
                            <td className="text-center">{formatWeight(totalKg)}</td>
                            <td className="text-center">{totalRs}</td>
                        </tr>
                    </tfoot>
                </table>

                {/* Footer */}
                <div className="bill-footer">
                    <div>
                        {labels.inWords}: <span className="words-line">{numberToWordsTamil(totalRs)}</span>
                    </div>
                    <div className="sign-area">
                        <div className="sign-title font-display">
                            {labels.forCompany}
                        </div>
                        <div className="sign-label">{labels.signature}</div>
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
