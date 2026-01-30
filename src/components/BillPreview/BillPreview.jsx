import React, { useState, useEffect } from 'react';
import { IconPhone, IconPrinter, IconEdit, IconMail, IconZoomIn, IconZoomOut, IconSave, IconLoader } from '../common/Icons';
import { PDFDownloadLink } from '@react-pdf/renderer'; // Keep for now if needed, or remove fully
// import BillPDF from './BillPDF'; // Removed
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
    bankDetails,
    accountNo,
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

    // SERVER-SIDE PDF DOWNLOAD
    const [isGenerating, setIsGenerating] = useState(false);
    const [downloadProgress, setDownloadProgress] = useState(0);

    const handleDownloadPDF = async () => {
        setIsGenerating(true);
        setDownloadProgress(2);

        let activeInterval = setInterval(() => {
            setDownloadProgress(prev => {
                if (prev < 90) return prev + Math.floor(Math.random() * 5) + 1;
                if (prev < 98) return prev + 0.5;
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

            clearInterval(activeInterval);
            activeInterval = null;
            setDownloadProgress(95);

            const contentLength = response.headers.get('content-length');
            const total = parseInt(contentLength, 10);
            let loaded = 0;

            const reader = response.body.getReader();
            const chunks = [];

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                chunks.push(value);
                loaded += value.length;

                if (total) {
                    const percent = Math.round((loaded / total) * 100);
                    setDownloadProgress(percent);
                } else {
                    // Gradual fallback if no content length
                    setDownloadProgress(prev => Math.min(prev + 2, 98));
                }
            }

            const blob = new Blob(chunks, { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const cleanDate = date.replace(/[/._]/g, ' ');
            const cleanName = name.english.replace(/[/._]/g, ' ');
            a.download = `Bill-${billNo} ${cleanDate} ${cleanName}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();

        } catch (error) {
            console.error('PDF Download Error:', error);
            alert('Failed to generate PDF. Is the PDF Server running?');
        } finally {
            if (activeInterval) clearInterval(activeInterval);
            setTimeout(() => {
                setIsGenerating(false);
                setDownloadProgress(0);
            }, 800);
        }
    };

    return (
        <div className="preview-overlay" style={{ overflow: 'auto', textAlign: scale < 1 ? 'center' : 'left' }}>

            {/* Download Progress Overlay */}
            {isGenerating && (
                <div className="download-overlay">
                    <div className="download-card">
                        <div style={{ marginBottom: '15px' }}>
                            <IconLoader size={40} className="animate-spin" style={{ color: '#e65100' }} />
                        </div>
                        <h3 style={{ margin: '0 0 10px 0', fontSize: '18px' }}>
                            {downloadProgress < 95 ? 'Generating PDF...' : 'Downloading File...'}
                        </h3>
                        <p style={{ margin: '0', fontSize: '12px', color: '#666' }}>Please wait, this will take a few seconds</p>

                        <div className="progress-container">
                            <div className="progress-fill" style={{ width: `${downloadProgress}%` }}></div>
                        </div>

                        <div style={{ fontSize: '24px', fontWeight: '800', color: '#e65100' }}>
                            {Math.round(downloadProgress)}%
                        </div>
                    </div>
                </div>
            )}

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
                            {(bankDetails || accountNo) && (
                                <div style={{ marginBottom: '15px', color: 'var(--bill-text-dark)', fontSize: '0.9rem', lineHeight: '1.5' }}>
                                    {bankDetails && <div><strong>வங்கி விவரம் :</strong> {bankDetails}</div>}
                                    {accountNo && <div><strong>கணக்கு எண் :</strong> {accountNo}</div>}
                                </div>
                            )}
                            <div className="thank-you font-tamil">நன்றி</div>
                        </div>
                        <div className="preview-footer-right">
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

                {/* Server-Side PDF Download */}
                <button
                    className="fab fab-primary"
                    onClick={handleDownloadPDF}
                    disabled={isGenerating}
                    aria-label="Save PDF (Server)"
                    title={isGenerating ? `Generating... ${downloadProgress}%` : "Download PDF (High Quality)"}
                    style={{
                        marginRight: '8px',
                        backgroundColor: '#e65100',
                        opacity: isGenerating ? 0.7 : 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        minWidth: '50px' // Ensure enough space for text
                    }}
                >
                    {isGenerating ? (
                        <>
                            <IconLoader size={26} className="animate-spin" />
                            <span style={{
                                position: 'absolute',
                                fontSize: '8px',
                                fontWeight: '800',
                                color: 'white',
                                pointerEvents: 'none'
                            }}>
                                {downloadProgress > 0 ? `${downloadProgress}%` : ''}
                            </span>
                        </>
                    ) : <IconSave size={22} />}
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
