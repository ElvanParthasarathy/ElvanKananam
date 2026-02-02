import React, { useState, useEffect } from 'react';
import { numberToWords } from '../../utils/numberToWords';
import { supabase } from '../../config/supabaseClient';

function SilksPreviewEnglish({ data, t }) {
    const [orgProfile, setOrgProfile] = useState(null);

    useEffect(() => {
        async function loadOrg() {
            const { data } = await supabase.from('organization_profile').select('*').limit(1).maybeSingle();
            if (data) setOrgProfile(data);
        }
        loadOrg();
    }, []);

    const { billNo, date, customerDetails, items = [], subTotal, notes, terms, taxRates } = data;

    // Table Data and Taxes
    const cgstRate = taxRates?.cgst || 2.5;
    const sgstRate = taxRates?.sgst || 2.5;
    const cgst = subTotal * (cgstRate / 100);
    const sgst = subTotal * (sgstRate / 100);
    const grandTotal = Math.round(subTotal + cgst + sgst); // Rounded Grand Total

    return (
        <div className="a4-paper font-english" style={{
            minHeight: '297mm',
            padding: '15mm',
            background: 'white',
            color: '#000',
            fontFamily: 'Inter, sans-serif',
            position: 'relative',
            boxShadow: '0 8px 40px rgba(0,0,0,0.2)'
        }}>
            {/* Header Section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '10px', color: '#666', marginBottom: '4px' }}>Live Wellbeing! Live Prosperously!</div>
                    <h1 style={{ fontSize: '28px', fontWeight: '800', margin: '0', color: '#880e4f', letterSpacing: '-0.5px' }}>
                        {orgProfile?.organization_name || 'Sri Jaipriya Silks'}
                    </h1>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: '#444' }}>
                        {orgProfile?.marketing_title || 'Handloom Silk Sarees & Rawsilk'}
                    </div>
                    <div style={{ fontSize: '11px', color: '#555', marginTop: '8px', lineHeight: '1.4' }}>
                        {orgProfile?.address_line1 || '6/606, First Street, Sivasakthi Nagar'}<br />
                        {orgProfile?.city || 'Arani'} - {orgProfile?.pincode || '632317'}, {orgProfile?.state || 'Tamil Nadu'}
                    </div>
                    <div style={{ fontSize: '12px', marginTop: '8px' }}><strong>GSTIN: {orgProfile?.gstin || '33ASSPV0378E1ZD'}</strong></div>
                    <div style={{ fontSize: '11px', color: '#555' }}>Ph: {orgProfile?.phone || '8144604797, 9360779191'}</div>
                    <div style={{ fontSize: '11px', color: '#555' }}>Email: {orgProfile?.email || 'srijaipriyasilks@gmail.com'}</div>
                </div>
                <div style={{ textAlign: 'right', width: '250px' }}>
                    <h2 style={{ fontSize: '22px', color: '#999', fontWeight: '300', margin: '0', marginBottom: '15px' }}>TAX INVOICE</h2>
                    <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <table style={{ fontSize: '12px', width: '100%', borderSpacing: '0 6px' }}>
                            <tbody>
                                <tr>
                                    <td style={{ textAlign: 'right', color: '#64748b' }}>Invoice No :</td>
                                    <td style={{ textAlign: 'right' }}><strong>{billNo}</strong></td>
                                </tr>
                                <tr>
                                    <td style={{ textAlign: 'right', color: '#64748b' }}>Date :</td>
                                    <td style={{ textAlign: 'right' }}><strong>{date}</strong></td>
                                </tr>
                                <tr><td style={{ textAlign: 'right', color: '#64748b' }}>State :</td><td style={{ textAlign: 'right' }}>{orgProfile?.state || 'Tamil Nadu'} ({orgProfile?.gstin?.slice(0, 2) || '33'})</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div style={{ height: '3px', background: '#880e4f', marginBottom: '25px', borderRadius: '2px' }}></div>

            {/* Customer Info */}
            <div style={{ marginBottom: '30px', display: 'flex', gap: '40px' }}>
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: '#999', marginBottom: '8px', fontWeight: '700' }}>
                        Bill To
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: '700', color: '#000' }}>{customerDetails?.company_name || customerDetails?.name}</div>
                    {(customerDetails?.company_name && (customerDetails?.first_name || customerDetails?.name !== customerDetails?.company_name)) && (
                        <div style={{ fontSize: '14px', fontWeight: '500', marginTop: '2px', color: '#333' }}>
                            {[customerDetails?.salutation, customerDetails?.first_name, customerDetails?.last_name].filter(Boolean).join(' ') ||
                                (customerDetails?.name !== customerDetails?.company_name ? customerDetails?.name : '')}
                        </div>
                    )}
                    <div style={{ fontSize: '12px', color: '#444', marginTop: '4px', lineHeight: '1.5' }}>
                        {customerDetails?.address_line1}<br />
                        {customerDetails?.city} - {customerDetails?.pincode}<br />
                        {customerDetails?.state || 'India'}
                    </div>
                    {customerDetails?.gstin && <div style={{ fontSize: '12px', fontWeight: '600', marginTop: '6px' }}>GSTIN: {customerDetails.gstin}</div>}
                </div>
                <div style={{ width: '200px' }}>
                    <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: '#999', marginBottom: '8px', fontWeight: '700' }}>
                        Terms
                    </div>
                    <div style={{ fontSize: '12px', color: '#444' }}>Due on Receipt</div>
                </div>
            </div>

            {/* Items Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', marginBottom: '30px' }}>
                <thead>
                    <tr style={{ background: '#880e4f', color: 'white' }}>
                        <th style={{ padding: '12px 10px', textAlign: 'left', borderRadius: '4px 0 0 0' }}>#</th>
                        <th style={{ padding: '12px 10px', textAlign: 'left' }}>Item & Description</th>
                        <th style={{ padding: '12px 10px', textAlign: 'center' }}>HSN Code</th>
                        <th style={{ padding: '12px 10px', textAlign: 'right' }}>Qty</th>
                        <th style={{ padding: '12px 10px', textAlign: 'right' }}>Rate</th>
                        <th style={{ padding: '12px 10px', textAlign: 'right', borderRadius: '0 4px 0 0' }}>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((item, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '12px 10px', color: '#94a3b8' }}>{i + 1}</td>
                            <td style={{ padding: '12px 10px' }}>
                                {/* Show English name (first part usually) */}
                                <div style={{ fontWeight: '600' }}>{item.name?.split(' / ')[0]}</div>
                            </td>
                            <td style={{ padding: '12px 10px', textAlign: 'center', color: '#64748b' }}>{item.hsn || '5007'}</td>
                            <td style={{ padding: '12px 10px', textAlign: 'right' }}>{parseFloat(item.quantity).toFixed(2)}</td>
                            <td style={{ padding: '12px 10px', textAlign: 'right' }}>{parseFloat(item.rate).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                            <td style={{ padding: '12px 10px', textAlign: 'right', fontWeight: '600' }}>{parseFloat(item.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Calculations Grid */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px' }}>
                <div style={{ flex: 1, paddingRight: '40px' }}>
                    <div style={{ fontSize: '11px', color: '#64748b', borderTop: '1px dashed #e2e8f0', paddingTop: '15px' }}>
                        <strong style={{ color: '#000' }}>Amount in Words:</strong><br />
                        {numberToWords(grandTotal)} Only
                    </div>
                    {notes && (
                        <div style={{ marginTop: '20px' }}>
                            <div style={{ fontSize: '10px', color: '#999', textTransform: 'uppercase', marginBottom: '5px' }}>Notes</div>
                            <div style={{ fontSize: '11px', color: '#444', lineHeight: '1.4' }}>{notes}</div>
                        </div>
                    )}
                </div>
                <div style={{ width: '280px', background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '13px' }}>
                        <span style={{ color: '#64748b' }}>Sub Total</span>
                        <span style={{ fontWeight: '600' }}>{subTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '13px' }}>
                        <span style={{ color: '#64748b' }}>CGST ({cgstRate}%)</span>
                        <span style={{ fontWeight: '600' }}>{cgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '13px' }}>
                        <span style={{ color: '#64748b' }}>SGST ({sgstRate}%)</span>
                        <span style={{ fontWeight: '600' }}>{sgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div style={{ height: '1px', background: '#e2e8f0', margin: '12px 0' }}></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '20px', fontWeight: '800', color: '#880e4f' }}>
                        <span>Total</span>
                        <span>₹ {grandTotal.toLocaleString('en-IN')}</span>
                    </div>
                </div>
            </div>

            {/* Terms and Signature */}
            <div style={{ marginTop: '60px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div style={{ width: '50%' }}>
                    {terms && (
                        <div style={{ fontSize: '9px', color: '#94a3b8', lineHeight: '1.5' }}>
                            <strong style={{ color: '#64748b' }}>Terms & Conditions:</strong><br />
                            {terms}
                        </div>
                    )}
                    {!terms && (
                        <div style={{ fontSize: '9px', color: '#94a3b8', lineHeight: '1.5' }}>
                            <strong style={{ color: '#64748b' }}>Terms & Conditions:</strong><br />
                            1. Unapproved goods must be returned within 7 days.<br />
                            2. Subject to Arani jurisdiction only.
                        </div>
                    )}
                </div>
                <div style={{ textAlign: 'center', width: '200px' }}>
                    <div style={{ fontSize: '11px', fontWeight: '700', marginBottom: '50px', whiteSpace: 'nowrap' }}>
                        For {orgProfile?.organization_name || 'SRI JAIPRIYA SILKS'}
                    </div>
                    <div style={{ borderTop: '1px solid #000', width: '100%' }}></div>
                    <div style={{ fontSize: '10px', marginTop: '5px', color: '#64748b' }}>
                        Authorized Signature
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SilksPreviewEnglish;
