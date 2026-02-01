import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import { IconMenu } from './Icons';
import './Layout.css';

const Layout = ({ children, viewMode, setViewMode, onLogout, language, setLanguage, theme, setTheme, t }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
        // Build on saved preference if available
        return localStorage.getItem('sidebar-collapsed') === 'true';
    });

    // Close sidebar on navigation (mobile)
    useEffect(() => {
        setIsSidebarOpen(false);
    }, [viewMode]);

    const toggleSidebarCollapse = () => {
        const newState = !isSidebarCollapsed;
        setIsSidebarCollapsed(newState);
        localStorage.setItem('sidebar-collapsed', newState);
    };

    return (
        <div className={`app-layout ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
            {/* Mobile Header */}
            <header className="mobile-header">
                <button
                    className="menu-toggle-btn"
                    onClick={() => setIsSidebarOpen(true)}
                >
                    <IconMenu size={24} />
                </button>
                <div className="mobile-header-title">
                    <span>{t.appName}</span>
                </div>
                <div style={{ width: '40px' }}></div> {/* Spacer */}
            </header>

            <Sidebar
                isOpen={isSidebarOpen}
                isCollapsed={isSidebarCollapsed}
                onToggleCollapse={toggleSidebarCollapse}
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
                language={language}
                t={t}
            />
        </div>
    );
};

export default Layout;
