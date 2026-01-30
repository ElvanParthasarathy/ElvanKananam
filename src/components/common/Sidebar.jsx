import {
    IconHome,
    IconBox,
    IconFileText,
    IconSettings,
    IconUsers,
    IconFiles,
    IconLogout,
    IconChevronDown,
    IconX,
    IconSun,
    IconMoon,
    IconAuto
} from './Icons';

const Sidebar = ({ viewMode, onViewChange, onLogout, t, isOpen, onClose, language, setLanguage, theme, setTheme }) => {

    // Helper to check if a section is active
    const isActive = (mode) => viewMode.startsWith(mode);

    // Nav Item Component
    const NavItem = ({ icon: Icon, label, value, onClick, hasSubItems = false }) => (
        <button
            className={`nav-item ${isActive(value) ? 'active' : ''}`}
            onClick={() => onClick(value)}
        >
            <Icon size={20} className="nav-item-icon" />
            <span style={{ flex: 1 }}>{label}</span>
            {hasSubItems && <IconChevronDown size={16} />}
        </button>
    );

    const SubItem = ({ label, value, onClick }) => (
        <button
            className={`nav-item nav-sub-item ${viewMode === value ? 'active-sub' : ''}`} // Add active-sub style if needed
            onClick={(e) => {
                e.stopPropagation();
                onClick(value);
            }}
        >
            {label}
        </button>
    );

    return (
        <>
            {/* Overlay for mobile drawer */}
            <div
                className={`sidebar-overlay ${isOpen ? 'show' : ''}`}
                onClick={onClose}
            />

            <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <div className="sidebar-title">Kananam</div>
                    <button className="sidebar-close-btn" onClick={onClose}>
                        <IconX size={20} />
                    </button>
                </div>

                <nav className="sidebar-nav">

                    {/* Home */}
                    <NavItem
                        icon={IconHome}
                        label={t.home}
                        value="home"
                        onClick={onViewChange}
                    />

                    <div className="nav-section-title">{t.mainModules}</div>

                    {/* Coolie Bill */}
                    <NavItem
                        icon={IconBox}
                        label={t.coolieBill}
                        value="coolie"
                        onClick={() => onViewChange('coolie-dashboard')} // Default to dashboard
                    />
                    {isActive('coolie') && (
                        <>
                            <SubItem label={"+ " + t.newBill} value="coolie-new" onClick={onViewChange} />
                            <SubItem label={t.allBills} value="coolie-dashboard" onClick={onViewChange} />
                            <SubItem label={t.customers} value="coolie-customers" onClick={onViewChange} />
                        </>
                    )}

                    {/* Silks Bill */}
                    <NavItem
                        icon={IconFileText}
                        label={t.silksBill}
                        value="silks"
                        onClick={() => onViewChange('silks-dashboard')}
                    />
                    {isActive('silks') && (
                        <>
                            <SubItem label={"+ " + t.newBill} value="silks-new" onClick={onViewChange} />
                            <SubItem label={t.allBills} value="silks-dashboard" onClick={onViewChange} />
                            <SubItem label={t.customers} value="silks-customers" onClick={onViewChange} />
                            <SubItem label={t.inventory} value="silks-items" onClick={onViewChange} />
                            <SubItem label={t.businessSettings} value="silks-business" onClick={onViewChange} />
                        </>
                    )}

                    <div className="nav-section-title">{t.extrasMenu}</div>

                    <NavItem
                        icon={IconSettings}
                        label={t.settings}
                        value="settings"
                        onClick={onViewChange}
                    />

                </nav>

                <div className="sidebar-footer">
                    {/* Language Toggles */}
                    <div className="pref-section">
                        <div className="pref-label">{t.language}</div>
                        <div className="pref-toggle-group">
                            <button
                                className={`pref-btn ${language === 'en' ? 'active' : ''}`}
                                onClick={() => setLanguage('en')}
                            >
                                English
                            </button>
                            <button
                                className={`pref-btn ${language === 'ta' ? 'active' : ''}`}
                                onClick={() => setLanguage('ta')}
                            >
                                தமிழ்
                            </button>
                        </div>
                    </div>

                    {/* Theme Toggles */}
                    <div className="pref-section" style={{ marginTop: '12px', marginBottom: '12px' }}>
                        <div className="pref-label">{t.display}</div>
                        <div className="pref-toggle-group">
                            <button
                                className={`pref-btn ${theme === 'light' ? 'active' : ''}`}
                                onClick={() => setTheme('light')}
                                title="Light Mode"
                            >
                                <IconSun size={16} />
                            </button>
                            <button
                                className={`pref-btn ${theme === 'dark' ? 'active' : ''}`}
                                onClick={() => setTheme('dark')}
                                title="Dark Mode"
                            >
                                <IconMoon size={16} />
                            </button>
                            <button
                                className={`pref-btn ${theme === 'auto' ? 'active' : ''}`}
                                onClick={() => setTheme('auto')}
                                title="Auto"
                            >
                                <IconAuto size={16} />
                            </button>
                        </div>
                    </div>

                    <button className="nav-item" onClick={onLogout} style={{ color: 'var(--color-danger)', marginTop: '8px' }}>
                        <IconLogout size={20} />
                        <span>{t.logout}</span>
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
