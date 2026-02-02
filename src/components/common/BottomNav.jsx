import {
    IconHome,
    IconBox,
    IconFiles,
    IconSettings
} from './Icons';
import { showSubtitles } from '../../config/translations';

const BottomNav = ({ viewMode, onViewChange, language, t }) => {
    const showSubs = showSubtitles(language);

    const isActive = (mode) => viewMode.startsWith(mode);

    return (
        <nav className="bottom-nav">

            {/* Home */}
            <button
                className={`bottom-nav-item ${viewMode === 'home' ? 'active' : ''}`}
                onClick={() => onViewChange('home')}
            >
                <IconHome size={22} />
                <div className="bottom-nav-label" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: '1' }}>
                    <span>{t.home}</span>
                    {showSubs && <span style={{ fontSize: '9px', opacity: 0.8 }}>Home</span>}
                </div>
            </button>

            {/* Coolie Bill */}
            <button
                className={`bottom-nav-item ${isActive('coolie') ? 'active' : ''}`}
                onClick={() => onViewChange('coolie-dashboard')}
            >
                <IconBox size={22} />
                <div className="bottom-nav-label" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: '1' }}>
                    <span>{t.coolieBill}</span>
                    {showSubs && <span style={{ fontSize: '9px', opacity: 0.8 }}>Coolie</span>}
                </div>
            </button>

            {/* Pattu Bill (Silks) */}
            <button
                className={`bottom-nav-item ${isActive('silks') ? 'active' : ''}`}
                onClick={() => onViewChange('silks-dashboard')}
            >
                <IconFiles size={20} />
                <div className="bottom-nav-label" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: '1' }}>
                    <span>{t.silksBill}</span>
                    {showSubs && <span style={{ fontSize: '9px', opacity: 0.8 }}>Maligai</span>}
                </div>
            </button>

            {/* Settings */}
            <button
                className={`bottom-nav-item ${viewMode === 'settings' ? 'active' : ''}`}
                onClick={() => onViewChange('settings')}
            >
                <IconSettings size={22} />
                <div className="bottom-nav-label" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: '1' }}>
                    <span>{t.settings}</span>
                    {showSubs && <span style={{ fontSize: '9px', opacity: 0.8 }}>Settings</span>}
                </div>
            </button>

        </nav>
    );
};

export default BottomNav;
