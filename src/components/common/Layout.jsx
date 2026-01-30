import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import { IconMenu } from './Icons';
import './Layout.css';

const Layout = ({ children, viewMode, setViewMode, onLogout, language, setLanguage, theme, setTheme, t }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Close sidebar on navigation (mobile)
    useEffect(() => {
        setIsSidebarOpen(false);
    }, [viewMode]);

    return (
        <div className="app-layout">
            {/* Mobile Header */}
            <header className="mobile-header">
                <button
                    className="menu-toggle-btn"
                    onClick={() => setIsSidebarOpen(true)}
                >
                    <IconMenu size={24} />
                </button>
                <div className="mobile-header-title">Kananam</div>
                <div style={{ width: '40px' }}></div> {/* Spacer */}
            </header>

            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                viewMode={viewMode}
                onViewChange={setViewMode}
                onLogout={onLogout}
                language={language}
                setLanguage={setLanguage}
                theme={theme}
                setTheme={setTheme}
                t={t}
            />

            <main className="main-content">
                {children}
            </main>

            <BottomNav
                viewMode={viewMode}
                onViewChange={setViewMode}
                onMenu={() => setIsSidebarOpen(true)}
            />
        </div>
    );
};

export default Layout;
