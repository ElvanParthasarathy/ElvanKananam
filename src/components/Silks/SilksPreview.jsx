import React, { useState, useEffect } from 'react';
import { IconPrinter, IconEdit, IconSave, IconLoader, IconZoomIn, IconZoomOut, IconArrowLeft } from '../common/Icons';
import { numberToWordsTamil } from '../../utils/tamilNumbers';
import { supabase } from '../../config/supabaseClient';

function SilksPreview({ data, onEdit, onBack }) {
    const [orgProfile, setOrgProfile] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [downloadProgress, setDownloadProgress] = useState(0);
    const [scale, setScale] = useState(1);
    const [manualZoom, setManualZoom] = useState(false);

    useEffect(() => {
        async function loadOrg() {
            const { data } = await supabase.from('organization_profile').select('*').limit(1).single();
            if (data) setOrgProfile(data);
        }
        loadOrg();
    }, []);

    useEffect(() => {
        if (manualZoom) return;
        const handleResize = () => {
            const paperWidth = 820;
            const windowWidth = window.innerWidth;
            if (windowWidth < paperWidth) {
                setScale((windowWidth - 32) / paperWidth);
            } else {
                setScale(1);
            }
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [manualZoom]);

    if (!data) return <div style={{ padding: '40px', textAlign: 'center', color: 'white' }}>No Data Available</div>;

    const { billNo, date, customerDetails, items = [], subTotal, notes, terms, taxRates } = data;

    // Table Data and Taxes
    const cgstRate = taxRates?.cgst || 2.5;
    const sgstRate = taxRates?.sgst || 2.5;
    const cgst = subTotal * (cgstRate / 100);
    const sgst = subTotal * (sgstRate / 100);
    const grandTotal = subTotal + cgst + sgst;

    const handleDownloadPDF = async () => {
        setIsGenerating(true);
        setDownloadProgress(2);
        let activeInterval = setInterval(() => {
            setDownloadProgress(prev => {
                if (prev < 90) return prev + 5;
                return prev;
            });
        }, 400);

        try {
            const fullHtml = document.documentElement.outerHTML;
            const response = await fetch('/generate-pdf', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ html: fullHtml })
            });
            if (!response.ok) throw new Error('Server Failed');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Silks-Bill-${billNo}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();
        } catch (error) {
            console.error('PDF Error:', error);
            alert('Failed to generate PDF');
        } finally {
            clearInterval(activeInterval);
            setIsGenerating(false);
            setDownloadProgress(0);
        }
    };

    return (
        <div className="preview-overlay" style={{
            overflow: 'auto',
            textAlign: scale < 1 ? 'center' : 'left',
            background: 'var(--color-preview-bg)',
            zIndex: 2000
        }}>

            {/* Toolbar Top (Mobile Friendly) */}
            <div className="no-print" style={{
                position: 'fixed',
                top: 0, left: 0, right: 0,
                zIndex: 1001,
                background: 'rgba(0,0,0,0.8)',
                backdropFilter: 'blur(10px)',
                padding: '10px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                color: 'white'
            }}>
                <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <IconArrowLeft size={18} /> Invoices
                </button>
                <div style={{ fontSize: '14px', fontWeight: '600' }}>#{billNo}</div>
                <div style={{ width: '40px' }}></div> {/* Spacer */}
            </div>

            {/* Download Progress */}
            {isGenerating && (
                <div className="download-overlay">
                    <div className="download-card">
                        <IconLoader size={40} className="animate-spin" style={{ color: '#e65100', marginBottom: '15px' }} />
                        <h3 style={{ margin: '0 0 10px 0' }}>Generating PDF...</h3>
                        <div className="progress-container">
                            <div className="progress-fill" style={{ width: `${downloadProgress}%` }}></div>
                        </div>
                    </div>
                </div>
            )}

            <div className="zoom-wrapper" style={{
                width: '210mm',
                transform: `scale(${scale})`,
                transformOrigin: 'top left',
                margin: scale < 1 ? '60px auto' : '60px auto 200px',
                marginBottom: '200px'
            }}>
                <div className="a4-paper" style={{
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
                            <div style={{ fontSize: '10px', color: '#666', marginBottom: '4px' }}>வாழ்க வையகம்! வாழ்க வளமுடன்!</div>
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
                                        <tr><td style={{ textAlign: 'right', color: '#64748b' }}>Invoice#:</td><td style={{ textAlign: 'right' }}><strong>{billNo}</strong></td></tr>
                                        <tr><td style={{ textAlign: 'right', color: '#64748b' }}>Date:</td><td style={{ textAlign: 'right' }}><strong>{date}</strong></td></tr>
                                        <tr><td style={{ textAlign: 'right', color: '#64748b' }}>State:</td><td style={{ textAlign: 'right' }}>Tamil Nadu (33)</td></tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <div style={{ height: '3px', background: '#880e4f', marginBottom: '25px', borderRadius: '2px' }}></div>

                    {/* Customer Info */}
                    <div style={{ marginBottom: '30px', display: 'flex', gap: '40px' }}>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: '#999', marginBottom: '8px', fontWeight: '700' }}>Bill To</div>
                            <div style={{ fontSize: '16px', fontWeight: '700', color: '#000' }}>{customerDetails?.company_name || customerDetails?.name}</div>
                            <div style={{ fontSize: '12px', color: '#444', marginTop: '4px', lineHeight: '1.5' }}>
                                {customerDetails?.address_line1}<br />
                                {customerDetails?.city} - {customerDetails?.pincode}<br />
                                {customerDetails?.state || 'India'}
                            </div>
                            {customerDetails?.gstin && <div style={{ fontSize: '12px', fontWeight: '600', marginTop: '6px' }}>GSTIN: {customerDetails.gstin}</div>}
                        </div>
                        <div style={{ width: '200px' }}>
                            <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: '#999', marginBottom: '8px', fontWeight: '700' }}>Terms</div>
                            <div style={{ fontSize: '12px', color: '#444' }}>Due on Receipt</div>
                        </div>
                    </div>

                    {/* Items Table */}
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', marginBottom: '30px' }}>
                        <thead>
                            <tr style={{ background: '#880e4f', color: 'white' }}>
                                <th style={{ padding: '12px 10px', textAlign: 'left', borderRadius: '4px 0 0 0' }}>#</th>
                                <th style={{ padding: '12px 10px', textAlign: 'left' }}>ITEM & DESCRIPTION</th>
                                <th style={{ padding: '12px 10px', textAlign: 'center' }}>HSN</th>
                                <th style={{ padding: '12px 10px', textAlign: 'right' }}>QTY</th>
                                <th style={{ padding: '12px 10px', textAlign: 'right' }}>RATE</th>
                                <th style={{ padding: '12px 10px', textAlign: 'right', borderRadius: '0 4px 0 0' }}>AMOUNT</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '12px 10px', color: '#94a3b8' }}>{i + 1}</td>
                                    <td style={{ padding: '12px 10px' }}>
                                        <div style={{ fontWeight: '600' }}>{item.name?.split(' / ')[0]}</div>
                                        {item.name?.includes(' / ') && <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>{item.name.split(' / ')[1]}</div>}
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
                                {numberToWordsTamil(Math.round(grandTotal))} Only
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
                                <span>₹ {grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
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
                            <div style={{ fontSize: '10px', marginTop: '5px', color: '#64748b' }}>Authorized Signature</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="preview-actions">
                <button className="fab fab-secondary" onClick={() => { setScale(prev => Math.max(prev - 0.1, 0.4)); setManualZoom(true); }}><IconZoomOut /></button>
                <button className="fab fab-secondary" onClick={() => { setScale(prev => Math.min(prev + 0.1, 1.5)); setManualZoom(true); }}><IconZoomIn /></button>
                <button className="fab fab-secondary" onClick={onEdit}><IconEdit /></button>
                <button className="fab fab-primary" onClick={handleDownloadPDF} disabled={isGenerating}>
                    {isGenerating ? <IconLoader className="animate-spin" /> : <IconSave />}
                </button>
                <button className="fab fab-primary" onClick={() => window.print()}><IconPrinter /></button>
            </div>
        </div>
    );
}

export default SilksPreview;
