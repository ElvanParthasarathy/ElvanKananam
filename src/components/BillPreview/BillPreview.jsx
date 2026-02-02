import React, { useState, useEffect } from 'react';
import { IconZoomIn, IconZoomOut, IconPrinter, IconEdit } from '../common/Icons';
import BillPreviewTamil from './BillPreviewTamil';
import BillPreviewEnglish from './BillPreviewEnglish';

/**
 * BillPreview Component
 * 
 * A4-sized print preview wrapper that delegates layout to language-specific components.
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
    showBankDetails = true,
    selectedCustomer // Received from App.jsx
}) {
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
        const cleanName = config.name.english.replace(/[/._]/g, ' ');
        document.title = `Bill-${billNo} ${cleanDate} ${cleanName}`;

        // Short delay to ensure title update applies
        setTimeout(() => {
            window.print();
            // Restore title
            setTimeout(() => document.title = originalTitle, 500);
        }, 100);
    };

    const commonProps = {
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
        selectedCustomer // Passed to children
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

                {/* Render Language Specific Component */}
                {language === 'en_only' ? (
                    <BillPreviewEnglish {...commonProps} />
                ) : (
                    <BillPreviewTamil {...commonProps} />
                )}

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
