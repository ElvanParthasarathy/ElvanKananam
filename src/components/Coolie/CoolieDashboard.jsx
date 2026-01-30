import React from 'react';
import { IconPlus, IconFiles, IconArrowLeft } from '../common/Icons';

function CoolieDashboard({ onNewBill, onHome }) {
    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <button
                    onClick={onHome}
                    style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        color: 'var(--color-text-muted)'
                    }}
                >
                    <IconArrowLeft size={20} />
                </button>
                <h1 style={{ fontSize: '1.5rem', margin: 0 }}>Coolie Bill Dashboard</h1>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>

                {/* Create New Card */}
                <button
                    onClick={onNewBill}
                    style={{
                        background: 'var(--color-surface)',
                        border: '1px solid var(--color-border)',
                        borderRadius: '16px',
                        padding: '30px',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '16px',
                        textAlign: 'center',
                        boxShadow: 'var(--shadow-sm)'
                    }}
                >
                    <div style={{
                        background: 'var(--color-primary)',
                        color: 'white',
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <IconPlus size={24} />
                    </div>
                    <div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '4px' }}>New Coolie Bill</div>
                        <div style={{ color: 'var(--color-text-muted)' }}>புதிய கூலி பில் உருவாக்கவும்</div>
                    </div>
                </button>

                {/* All Bills Card (Placeholder) */}
                <button
                    disabled
                    style={{
                        background: 'var(--color-bg)',
                        border: '1px solid var(--color-border)',
                        borderRadius: '16px',
                        padding: '30px',
                        cursor: 'not-allowed',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '16px',
                        textAlign: 'center',
                        opacity: 0.7
                    }}
                >
                    <div style={{
                        background: 'var(--color-text-muted)',
                        color: 'white',
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <IconFiles size={24} />
                    </div>
                    <div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '4px' }}>All Bills</div>
                        <div style={{ color: 'var(--color-text-muted)' }}>Coming Soon</div>
                    </div>
                </button>

            </div>
        </div>
    );
}

export default CoolieDashboard;
