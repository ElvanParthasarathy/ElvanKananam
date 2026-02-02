import React, { useState, useEffect } from 'react';
import { IconPrinter, IconEdit, IconZoomIn, IconZoomOut, IconArrowLeft } from '../common/Icons';
import { showSubtitles } from '../../config/translations';
import SilksPreviewTamil from './SilksPreviewTamil';
import SilksPreviewEnglish from './SilksPreviewEnglish';

function SilksPreview({ data, onEdit, onBack, t, language }) {
    const showSubs = showSubtitles(language);
    const [scale, setScale] = useState(1);
    const [manualZoom, setManualZoom] = useState(false);

    // Determine Language Mode from Data (default to Tamil)
    const previewMode = data?.previewLanguage || 'ta_only';
    const isEnglish = previewMode === 'en_only';

    useEffect(() => {
        if (manualZoom) return;
        const handleResize = () => {
            const paperWidth = 820; // Approx A4 width in pixels + margins
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

    if (!data) return <div style={{ padding: '40px', textAlign: 'center', color: 'white' }}>{t.noDataAvailable || 'No Data Available'}</div>;

    const { billNo } = data;

    return (
        <div className="preview-overlay" style={{
            overflow: 'auto',
            textAlign: scale < 1 ? 'center' : 'left',
            background: 'var(--color-preview-bg)',
            zIndex: 2000
        }}>

            {/* Toolbar Top */}
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
                    <IconArrowLeft size={18} /> {showSubs ? `${t.allBills || t.invoices || 'பில்கள்'} / Invoices` : (t.allBills || t.invoices || 'பில்கள்')}
                </button>
                <div style={{ fontSize: '14px', fontWeight: '600' }}>#{billNo}</div>
                <div style={{ width: '40px' }}></div>
            </div>

            {/* Zoom Wrapper */}
            <div className="zoom-wrapper" style={{
                width: '210mm',
                transform: `scale(${scale})`,
                transformOrigin: 'top left',
                marginRight: 'auto',
                marginLeft: 'auto',
                marginTop: '60px',
                marginBottom: '200px'
            }}>
                {isEnglish ? (
                    <SilksPreviewEnglish data={data} t={t} />
                ) : (
                    <SilksPreviewTamil data={data} t={t} />
                )}
            </div>

            {/* Actions */}
            <div className="preview-actions">
                <button className="fab fab-secondary" onClick={() => { setScale(prev => Math.max(prev - 0.1, 0.4)); setManualZoom(true); }}><IconZoomOut /></button>
                <button className="fab fab-secondary" onClick={() => { setScale(prev => Math.min(prev + 0.1, 1.5)); setManualZoom(true); }}><IconZoomIn /></button>
                <button className="fab fab-secondary" onClick={onEdit}><IconEdit /></button>
                <button className="fab fab-primary" onClick={() => window.print()}><IconPrinter /></button>
            </div>
        </div>
    );
}

export default SilksPreview;
