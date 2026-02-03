import React from 'react';
import {
    IconPlus,
    IconBox,
    IconFileText,
    IconLock
} from '../common/Icons';
import { showSubtitles } from '../../config/translations';
import './Home.css'; // Import the new styles

/**
 * Home Component
 * 
 * "Action + Overview" Dashboard
 */
function Home({ t, onNavigate, language }) {
    const showSubs = showSubtitles(language);

    // Action Card Component
    const ActionCard = ({ title, subTitle, icon: Icon, color, onClick, disabled = false }) => {
        return (
            <button
                className="action-card"
                onClick={onClick}
                disabled={disabled}
                type="button"
            >
                <div
                    className="card-icon-wrapper"
                    style={{
                        backgroundColor: disabled ? 'var(--md-sys-color-surface-variant)' : `${color}20`,
                        color: disabled ? 'var(--md-sys-color-on-surface-variant)' : color
                    }}
                >
                    <Icon size={28} />
                </div>

                <div className="card-content">
                    <span className="card-title">
                        {subTitle}
                    </span>
                    <span className="card-subtitle">
                        {title}
                    </span>
                </div>

                {/* Quick Add Button / Lock Icon */}
                <div className="card-action-icon">
                    {disabled ? <IconLock size={18} /> : <IconPlus size={20} strokeWidth={2.5} />}
                </div>
            </button>
        );
    };

    return (
        <div className="home-dashboard">

            {/* Header */}
            <header className="home-header">
                <h1 className="home-title">
                    {t.appName}
                </h1>
                {showSubs && (
                    <div className="home-subtitle">
                        {t.appNameEnglish}
                    </div>
                )}
                <div className="home-welcome">
                    <div className="welcome-text-primary">{t.welcomeBack || 'நல்வரவு!'}</div>
                    {showSubs && <div className="welcome-text-secondary">Welcome back!</div>}
                </div>
            </header>

            {/* Main Actions Grid */}
            <div className="action-grid">
                <ActionCard
                    title="Coolie Bill"
                    subTitle={t.coolieBill}
                    icon={IconBox}
                    color="#e65100" // Brand color for Coolie
                    onClick={() => onNavigate('coolie-new')}
                />

                <ActionCard
                    title="Maligai Bill"
                    subTitle={t.silksBill}
                    icon={IconFileText}
                    color="var(--md-sys-color-primary)"
                    onClick={() => { }}
                    disabled={true}
                />
            </div>

        </div>
    );
}

export default Home;
