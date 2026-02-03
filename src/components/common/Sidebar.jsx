import {
    IconHome,
    IconBox,
    IconSettings,
    IconLogout,
    IconChevronDown,
    IconChevronLeft,
    IconChevronRight,
    IconX,
    IconSun,
    IconMoon,
    IconAuto,
    IconFiles
} from './Icons';
import { showSubtitles } from '../../config/translations';

const Sidebar = ({ viewMode, onViewChange, onLogout, t, isOpen, onClose, language, setLanguage, theme, setTheme, isCollapsed, onToggleCollapse }) => {
    const showSubs = showSubtitles(language);

    // Helper to check if a section is active
    const isActive = (mode) => viewMode.startsWith(mode);

    // Nav Item Component
    const NavItem = ({ icon: Icon, label, value, onClick, hasSubItems = false, title, mobileHidden = false }) => (
        <button
            className={`nav-item ${isActive(value) ? 'active' : ''} ${isCollapsed ? 'collapsed' : ''} ${mobileHidden ? 'mobile-hidden' : ''}`}
            onClick={() => onClick(value)}
            title={isCollapsed ? title : undefined}
        >
            <Icon size={20} className="nav-item-icon" />
            {!isCollapsed && <span style={{ flex: 1 }}>{label}</span>}
            {!isCollapsed && hasSubItems && <IconChevronDown size={16} />}
        </button>
    );



    return (
        <>
            {/* Overlay for mobile drawer */}
            <div
                className={`sidebar-overlay ${isOpen ? 'show' : ''}`}
                onClick={onClose}
            />

            <aside className={`sidebar ${isOpen ? 'open' : ''} ${isCollapsed ? 'collapsed' : ''}`}>
                <div className="sidebar-header" style={{ justifyContent: isCollapsed ? 'center' : 'space-between' }}>
                    {!isCollapsed && (
                        <div className="sidebar-title" style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.2' }}>
                            <span>{t.appName}</span>
                            {showSubs && <span style={{ fontSize: '12px', opacity: 0.7, fontWeight: 'normal' }}>{t.appNameEnglish}</span>}
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                        {/* Desktop Collapse Toggle */}
                        <button
                            className="sidebar-toggle-btn desktop-only"
                            onClick={onToggleCollapse}
                            title={isCollapsed ? "Expand" : "Collapse"}
                        >
                            {isCollapsed ? <IconChevronRight size={18} /> : <IconChevronLeft size={18} />}
                        </button>

                        {/* Mobile Close Button */}
                        <button className="sidebar-close-btn mobile-only" onClick={onClose}>
                            <IconX size={20} />
                        </button>
                    </div>
                </div>

                <nav className="sidebar-nav">

                    {/* Home */}
                    <NavItem
                        icon={IconHome}
                        label={
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: '1.2' }}>
                                <span style={{ fontSize: '15px', fontWeight: '600' }}>{t.home}</span>
                                {showSubs && <span style={{ fontSize: '11px', opacity: 0.7 }}>Home</span>}
                            </div>
                        }
                        title="Home"
                        value="home"
                        onClick={onViewChange}
                        mobileHidden={true}
                    />

                    {!isCollapsed && (
                        <div className="nav-section-title desktop-only">
                            <div>{t.mainModules}</div>
                            {showSubs && <div style={{ fontSize: '10px', fontWeight: 'normal' }}>Main Modules</div>}
                        </div>
                    )}

                    {/* Coolie Bill */}
                    <NavItem
                        icon={IconBox}
                        label={
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: '1.2' }}>
                                <span style={{ fontSize: '15px', fontWeight: '600' }}>{t.coolieBill}</span>
                                {showSubs && <span style={{ fontSize: '11px', opacity: 0.7 }}>Coolie Bill</span>}
                            </div>
                        }
                        title="Coolie Bill"
                        value="coolie"
                        onClick={() => onViewChange('coolie-dashboard')} // Default to dashboard
                        mobileHidden={true}
                    />


                    {/* Silks Bill */}
                    <NavItem
                        icon={IconFiles}
                        label={
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: '1.2' }}>
                                <span style={{ fontSize: '15px', fontWeight: '600' }}>{t.silksBill}</span>
                                {showSubs && <span style={{ fontSize: '11px', opacity: 0.7 }}>Maligai Bill</span>}
                            </div>
                        }
                        title="Maligai Bill"
                        value="silks"
                        onClick={() => onViewChange('silks-dashboard')}
                        mobileHidden={true}
                    />


                    {!isCollapsed && (
                        <div className="nav-section-title desktop-only">
                            <div>{t.extrasMenu}</div>
                            {showSubs && <div style={{ fontSize: '10px', fontWeight: 'normal' }}>Extras Menu</div>}
                        </div>
                    )}

                    <NavItem
                        icon={IconSettings}
                        label={
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: '1.2' }}>
                                <span style={{ fontSize: '15px', fontWeight: '600' }}>{t.settings}</span>
                                {showSubs && <span style={{ fontSize: '11px', opacity: 0.7 }}>Settings</span>}
                            </div>
                        }
                        title="Settings"
                        value="settings"
                        onClick={onViewChange}
                        mobileHidden={true}
                    />

                </nav>

                <div className="sidebar-footer">
                    {!isCollapsed && (
                        <div className="lang-switcher-group">
                            <button
                                onClick={() => setLanguage('ta_mixed')}
                                className={`lang-btn ${language === 'ta_mixed' ? 'active' : ''}`}
                                title="Tamil + English"
                            >
                                TA+
                            </button>
                            <button
                                onClick={() => setLanguage('ta_only')}
                                className={`lang-btn ${language === 'ta_only' ? 'active' : ''}`}
                                title="Tamil Only"
                            >
                                TA
                            </button>
                            <button
                                onClick={() => setLanguage('en_only')}
                                className={`lang-btn ${language === 'en_only' ? 'active' : ''}`}
                                title="English Only"
                            >
                                EN
                            </button>
                            <button
                                onClick={() => setLanguage('tg_mixed')}
                                className={`lang-btn ${language === 'tg_mixed' ? 'active' : ''}`}
                                title="Tanglish + English"
                            >
                                TG
                            </button>
                        </div>
                    )}
                    <div className="sidebar-version">
                        ver 1.0.0
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
