import React from 'react';
import {
    IconPlus,
    IconBox,
    IconFileText,
    IconRefresh,
    IconLock
} from '../common/Icons';

/**
 * Home Component
 * 
 * "Action + Overview" Dashboard
 */
function Home({ t, onNavigate }) {

    // Action Card Component
    const ActionCard = ({ title, subTitle, icon: Icon, color, onClick, isPrimary = false }) => (
        <button
            className="action-card"
            onClick={onClick}
            style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: '16px',
                padding: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                boxShadow: 'var(--shadow-sm)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                position: 'relative',
                overflow: 'hidden'
            }}
            onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
            }}
            onMouseOut={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
            }}
        >
            {/* Left Stripe for branding */}
            <div style={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: '4px',
                backgroundColor: color
            }} />

            <div style={{
                backgroundColor: `${color}20`, // 20% opacity
                padding: '12px',
                borderRadius: '12px',
                color: color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <Icon size={24} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{
                    fontSize: '0.9rem',
                    color: 'var(--color-text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    fontWeight: 600
                }}>
                    {title}
                </span>
                <span style={{
                    fontSize: '1.2rem',
                    fontWeight: 700,
                    color: 'var(--color-text)'
                }}>
                    {subTitle}
                </span>
            </div>

            {/* Quick Add Button on right */}
            <div style={{
                marginLeft: 'auto',
                backgroundColor: 'var(--color-bg)',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid var(--color-border)'
            }}>
                <IconPlus size={16} />
            </div>

        </button>
    );

    return (
        <div className="home-dashboard" style={{ maxWidth: '800px', margin: '0 auto' }}>

            {/* Header */}
            <header style={{ marginBottom: '32px', textAlign: 'center' }}>
                <h1 style={{
                    fontSize: '2rem',
                    fontFamily: 'var(--font-display)',
                    color: 'var(--color-primary)',
                    marginBottom: '8px'
                }}>
                    {t.appName}
                </h1>
                <p style={{ color: 'var(--color-text-muted)' }}>Welcome back!</p>
            </header>

            {/* Main Actions Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '20px',
                marginBottom: '40px'
            }}>
                <ActionCard
                    title="Coolie Bill"
                    subTitle="கூலி பில்"
                    icon={IconBox}
                    color="var(--color-primary)"
                    onClick={() => onNavigate('coolie-new')}
                />

                <ActionCard
                    title="Silks Invoice"
                    subTitle="பட்டு பில்"
                    icon={IconFileText}
                    color="var(--color-brand-silks, #24AE61)"
                    onClick={() => onNavigate('silks-new')}
                />
            </div>

            {/* Overview Section */}
            <div>
                <h3 style={{ marginBottom: '16px', color: 'var(--color-text-muted)', fontSize: '0.9rem', textTransform: 'uppercase' }}>
                    Overview
                </h3>

                {/* Placeholder for Stats */}
                <div className="stats-grid" style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '16px'
                }}>
                    <div style={{
                        background: 'var(--color-surface)',
                        padding: '20px',
                        borderRadius: '16px',
                        textAlign: 'center',
                        border: '1px solid var(--color-border)'
                    }}>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>0</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Bills Today</div>
                    </div>

                    <div style={{
                        background: 'var(--color-surface)',
                        padding: '20px',
                        borderRadius: '16px',
                        textAlign: 'center',
                        border: '1px solid var(--color-border)'
                    }}>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>₹0</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Revenue Today</div>
                    </div>
                </div>

                <div style={{
                    marginTop: '40px',
                    textAlign: 'center',
                    color: 'var(--color-text-muted)',
                    fontSize: '0.85rem',
                    fontStyle: 'italic'
                }}>
                    Select an action above to get started
                </div>
            </div>

        </div>
    );
}

export default Home;
