import React from 'react';
import { IconX, IconSun, IconMoon, IconAuto } from './Icons';

/**
 * Sidebar Component
 * 
 * Collapsible side panel for settings (Language, Theme).
 */
function Sidebar({ isOpen, onClose, t, language, setLanguage, theme, setTheme }) {
    if (!isOpen) return null;

    return (
        <div className="sidebar-overlay" onClick={onClose}>
            <div className="sidebar-content" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="sidebar-header">
                    <div className="sidebar-title">Settings</div>
                    <button className="icon-btn-pill" onClick={onClose}>
                        <IconX size={24} />
                    </button>
                </div>

                {/* Language Section */}
                <div className="sidebar-section">
                    <div className="section-label">{t.language}</div>
                    <div className="pill-group">
                        <button
                            className={`pill-btn ${language === 'ta' ? 'active' : ''}`}
                            onClick={() => setLanguage('ta')}
                        >
                            {t.tamil}
                        </button>
                        <button
                            className={`pill-btn ${language === 'en' ? 'active' : ''}`}
                            onClick={() => setLanguage('en')}
                        >
                            {t.english}
                        </button>
                    </div>
                </div>

                {/* Theme Section */}
                <div className="sidebar-section">
                    <div className="section-label">Theme</div>
                    <div className="pill-group">
                        <button
                            className={`pill-btn ${theme === 'light' ? 'active' : ''}`}
                            onClick={() => setTheme('light')}
                        >
                            <IconSun size={18} /> Light
                        </button>
                        <button
                            className={`pill-btn ${theme === 'auto' ? 'active' : ''}`}
                            onClick={() => setTheme('auto')}
                        >
                            <IconAuto size={18} /> Auto
                        </button>
                        <button
                            className={`pill-btn ${theme === 'dark' ? 'active' : ''}`}
                            onClick={() => setTheme('dark')}
                        >
                            <IconMoon size={18} /> Dark
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Sidebar;
