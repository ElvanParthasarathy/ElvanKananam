import React, { useState, useEffect } from 'react';
import {
    IconPlus,
    IconBox,
    IconFileText,
    IconRefresh,
    IconLock
} from '../common/Icons';
import { showSubtitles } from '../../config/translations';

/**
 * Home Component
 * 
 * "Action + Overview" Dashboard
 */
function Home({ t, onNavigate, language }) {
    const showSubs = showSubtitles(language);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Action Card Component
    const ActionCard = ({ title, subTitle, icon: Icon, color, onClick, isPrimary = false, disabled = false }) => {
        if (isMobile) {
            return (
                <div style={{ position: 'relative' }}>
                    <button
                        onClick={onClick}
                        disabled={disabled}
                        style={{
                            background: 'var(--color-surface)',
                            border: '1px solid var(--color-border)',
                            borderRadius: '16px',
                            padding: '20px 15px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '12px',
                            cursor: disabled ? 'not-allowed' : 'pointer',
                            textAlign: 'center',
                            width: '100%',
                            boxShadow: 'var(--shadow-sm)',
                            opacity: disabled ? 0.6 : 1
                        }}
                    >
                        <div style={{ position: 'relative' }}>
                            <div style={{
                                backgroundColor: `${color}20`,
                                padding: '12px',
                                borderRadius: '12px',
                                color: color,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <Icon size={32} />
                            </div>

                            {/* Plus Icon Overlay for Mobile */}
                            {!disabled && (
                                <div style={{
                                    position: 'absolute',
                                    bottom: '-5px',
                                    right: '-5px',
                                    backgroundColor: 'var(--color-primary)',
                                    color: 'white',
                                    borderRadius: '50%',
                                    width: '20px',
                                    height: '20px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: '2px solid var(--color-surface)',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                }}>
                                    <IconPlus size={12} strokeWidth={3} />
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text)' }}>{subTitle}</span>
                            <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>{title}</span>
                        </div>
                    </button>
                    {disabled && (
                        <div style={{
                            position: 'absolute',
                            top: 8, right: 8,
                            background: 'var(--color-bg)',
                            padding: '4px',
                            borderRadius: '50%',
                            border: '1px solid var(--color-border)',
                            display: 'flex',
                            zIndex: 2
                        }}>
                            <IconLock size={12} color="var(--color-text-muted)" />
                        </div>
                    )}
                </div>
            );
        }

        return (
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
                        fontSize: '1.2rem',
                        fontWeight: 700,
                        color: 'var(--color-text)'
                    }}>
                        {subTitle}
                    </span>
                    <span style={{
                        fontSize: '0.9rem',
                        color: 'var(--color-text-muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        fontWeight: 600
                    }}>
                        {title}
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
    };

    return (
        <div className="home-dashboard" style={{ maxWidth: '800px', margin: '0 auto', padding: isMobile ? '0 15px' : '0' }}>

            {/* Header */}
            <header style={{ marginBottom: isMobile ? '24px' : '32px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <h1 style={{
                    fontSize: isMobile ? '1.8rem' : '2.2rem',
                    fontFamily: 'var(--font-display)',
                    color: 'var(--color-primary)',
                    margin: 0,
                    lineHeight: '1.2'
                }}>
                    {t.appName}
                </h1>
                {showSubs && (
                    <div style={{ fontSize: isMobile ? '1rem' : '1.2rem', color: 'var(--color-primary)', opacity: 0.8, fontWeight: '600' }}>
                        {t.appNameEnglish}
                    </div>
                )}
                <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <div style={{ fontSize: isMobile ? '1.1rem' : '1.2rem', fontWeight: '600', color: 'var(--color-text)' }}>{t.welcomeBack || 'நல்வரவு!'}</div>
                    {showSubs && <div style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Welcome back!</div>}
                </div>
            </header>

            {/* Main Actions Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: isMobile ? '15px' : '20px',
                marginBottom: '40px'
            }}>
                <ActionCard
                    title="Coolie Bill"
                    subTitle={t.coolieBill}
                    icon={IconBox}
                    color="#e65100"
                    onClick={() => onNavigate('coolie-new')}
                />

                <ActionCard
                    title="Maligai Bill"
                    subTitle={t.silksBill}
                    icon={IconFileText}
                    color="var(--color-text-muted)"
                    onClick={() => { }}
                    disabled={true}
                />
            </div>

        </div>
    );
}

export default Home;
