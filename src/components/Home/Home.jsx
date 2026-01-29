import React from 'react';
import { IconLogout, IconFiles, IconLock } from '../common/Icons';

/**
 * Home Component
 * 
 * Main landing screen to choose between different bill types.
 */
function Home({ t, onNavigate, onLogout, theme, setTheme, language, setLanguage }) {
    return (
        <div className="editor-wrapper" style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', minHeight: '80vh', justifyContent: 'center' }}>

            {/* Branding */}
            <div className="app-branding" style={{ marginBottom: '40px' }}>
                <span className="app-name-tamil" style={{ fontSize: '2.5rem' }}>{t.appName}</span>
                <span className="app-name-english" style={{ letterSpacing: '4px' }}>{t.appNameEnglish}</span>
            </div>

            {/* Main Options */}
            <div className="card" style={{ padding: '30px', borderRadius: '32px' }}>
                <div className="card-title" style={{ textAlign: 'center', marginBottom: '20px' }}>Select Bill Type</div>

                {/* Option 1: Silk Twisting (Current) */}
                <button
                    className="btn btn-primary"
                    onClick={() => onNavigate('edit')}
                    style={{ marginBottom: '20px', height: 'auto', padding: '20px', borderRadius: '50px', display: 'flex', flexDirection: 'column', gap: '5px' }}
                >
                    <span style={{ fontSize: '1.2rem' }}>Silk Twisting Factory Bill</span>
                    <span style={{ fontSize: '0.9rem', opacity: 0.8, fontWeight: 'normal' }}>கூலி பில்</span>
                </button>

                {/* Option 2: Silks Bill (Future) */}
                <button
                    className="btn"
                    style={{
                        background: 'var(--color-bg)',
                        color: 'var(--color-text-muted)',
                        height: 'auto',
                        padding: '20px',
                        borderRadius: '50px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '5px',
                        border: '1px solid var(--color-border)',
                        cursor: 'not-allowed',
                        opacity: 0.7
                    }}
                    disabled
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <IconLock size={16} />
                        <span style={{ fontSize: '1.2rem' }}>Silks Bill</span>
                    </div>
                    <span style={{ fontSize: '0.8rem', background: '#eee', padding: '2px 8px', borderRadius: '10px', color: '#666' }}>Coming Soon</span>
                </button>
            </div>

            {/* Logout */}
            <button
                className="btn"
                onClick={onLogout}
                style={{ marginTop: 'auto', background: 'transparent', color: 'var(--color-danger)', border: '1px solid var(--color-danger)', borderRadius: '50px' }}
            >
                <IconLogout size={18} /> Logout
            </button>

        </div>
    );
}

export default Home;
