import React from 'react';
import { IconPrinter, IconEdit } from '../common/Icons';
import { numberToWordsTamil } from '../../utils/tamilNumbers';

function SilksPreview({ data, onEdit }) {
    if (!data) return <div>No Data</div>;

    const { billNo, date, customerDetails, items, subTotal } = data;

    // Tax Calculation (Assuming 5% GST: 2.5% CGST + 2.5% SGST)
    const sgst = subTotal * 0.025;
    const cgst = subTotal * 0.025;
    const totalAmount = subTotal + sgst + cgst;

    return (
        <div className="preview-overlay" style={{ overflow: 'auto', background: '#333' }}>
            <div className="a4-paper" style={{
                width: '210mm',
                minHeight: '297mm',
                padding: '20mm',
                background: 'white',
                margin: '20px auto',
                boxShadow: '0 0 20px rgba(0,0,0,0.5)',
                color: '#000',
                fontFamily: 'Arial, sans-serif'
            }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <div>
                        <div style={{ fontSize: '10px' }}>வாழ்க வையகம்! வாழ்க வளமுடன்!</div>
                        <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '5px 0', color: '#880e4f' }}>Sri Jaipriya Silks</h1>
                        <div style={{ fontSize: '12px' }}>Handloom Silk Sarees & Rawsilk</div>
                        <div style={{ fontSize: '12px' }}>6/606, First Street, Sivasakthi Nagar</div>
                        <div style={{ fontSize: '12px' }}>Arani - 632317, T.V.M Dist, Tamil Nadu</div>
                        <div style={{ fontSize: '12px' }}><strong>GSTIN: 33ASSPV0378E1ZD</strong></div>
                        <div style={{ fontSize: '12px' }}>Ph: 8144604797, 9360779191</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <h2 style={{ fontSize: '18px', color: '#666' }}>TAX INVOICE</h2>
                        <table style={{ fontSize: '12px', marginTop: '10px', float: 'right' }}>
                            <tbody>
                                <tr><td style={{ textAlign: 'right', paddingRight: '10px' }}>Invoice#:</td><td><strong>{billNo}</strong></td></tr>
                                <tr><td style={{ textAlign: 'right', paddingRight: '10px' }}>Date:</td><td><strong>{date}</strong></td></tr>
                                <tr><td style={{ textAlign: 'right', paddingRight: '10px' }}>Place of Supply:</td><td>Tamil Nadu (33)</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <hr style={{ borderColor: '#eee' }} />

                {/* Bill To */}
                <div style={{ margin: '20px 0' }}>
                    <div style={{ fontSize: '12px', color: '#666' }}>Bill To</div>
                    <div style={{ fontWeight: 'bold' }}>{customerDetails?.company_name || customerDetails?.name}</div>
                    <div style={{ fontSize: '12px' }}>{customerDetails?.address_line1}, {customerDetails?.city} - {customerDetails?.pincode}</div>
                    <div style={{ fontSize: '12px' }}>GSTIN: {customerDetails?.gstin}</div>
                </div>

                {/* Items Table */}
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', marginBottom: '20px' }}>
                    <thead style={{ background: '#f8f9fa', borderBottom: '2px solid #ddd' }}>
                        <tr>
                            <th style={{ padding: '10px', textAlign: 'left' }}>#</th>
                            <th style={{ padding: '10px', textAlign: 'left' }}>Item & Description</th>
                            <th style={{ padding: '10px', textAlign: 'right' }}>Qty</th>
                            <th style={{ padding: '10px', textAlign: 'right' }}>Rate</th>
                            <th style={{ padding: '10px', textAlign: 'right' }}>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, i) => (
                            <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: '10px' }}>{i + 1}</td>
                                <td style={{ padding: '10px' }}>
                                    <div>{item.name.split(' / ')[0]}</div>
                                    <div style={{ color: '#666', fontSize: '10px' }}>{(item.name.split(' / ')[1] || '')} - HSN: 5007</div>
                                </td>
                                <td style={{ padding: '10px', textAlign: 'right' }}>{item.quantity}</td>
                                <td style={{ padding: '10px', textAlign: 'right' }}>{item.rate ? Number(item.rate).toFixed(2) : '0.00'}</td>
                                <td style={{ padding: '10px', textAlign: 'right' }}>{item.amount ? Number(item.amount).toFixed(2) : '0.00'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Totals */}
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <table style={{ width: '50%', fontSize: '12px' }}>
                        <tbody>
                            <tr>
                                <td style={{ padding: '5px', textAlign: 'right' }}>Sub Total</td>
                                <td style={{ padding: '5px', textAlign: 'right' }}>{subTotal.toFixed(2)}</td>
                            </tr>
                            <tr>
                                <td style={{ padding: '5px', textAlign: 'right' }}>CGST (2.5%)</td>
                                <td style={{ padding: '5px', textAlign: 'right' }}>{cgst.toFixed(2)}</td>
                            </tr>
                            <tr>
                                <td style={{ padding: '5px', textAlign: 'right' }}>SGST (2.5%)</td>
                                <td style={{ padding: '5px', textAlign: 'right' }}>{sgst.toFixed(2)}</td>
                            </tr>
                            <tr style={{ fontWeight: 'bold', fontSize: '14px', borderTop: '2px solid #ddd' }}>
                                <td style={{ padding: '10px 5px', textAlign: 'right' }}>Total</td>
                                <td style={{ padding: '10px 5px', textAlign: 'right' }}>₹ {totalAmount.toFixed(2)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div style={{ marginTop: '10px', fontSize: '12px', borderTop: '1px solid #eee', paddingTop: '10px' }}>
                    <strong>Amount in Words:</strong> {numberToWordsTamil(Math.round(totalAmount))}
                </div>

                {/* Footer */}
                <div style={{ marginTop: '50px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div style={{ fontSize: '10px', width: '60%' }}>
                        <strong>Terms & Conditions:</strong><br />
                        1) Unapproved goods must be returned within 7 days of receipt.<br />
                        2) All disputes are subject to ARANI jurisdiction only.
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '12px', marginBottom: '30px' }}>For SRI JAIPRIYA SILKS</div>
                        <div style={{ borderTop: '1px solid #000', width: '150px', margin: '0 auto' }}></div>
                        <div style={{ fontSize: '10px' }}>Authorized Signature</div>
                    </div>
                </div>

            </div>

            <div className="preview-actions">
                <button className="fab fab-secondary" onClick={onEdit}>
                    <IconEdit size={22} />
                </button>
                <button className="fab fab-primary" onClick={() => window.print()}>
                    <IconPrinter size={22} />
                </button>
            </div>
        </div>
    );
}

export default SilksPreview;
