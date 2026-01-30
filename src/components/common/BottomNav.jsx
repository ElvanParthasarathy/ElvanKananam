import {
    IconHome,
    IconBox,
    IconFileText,
    IconFiles,
    IconMenu
} from './Icons';

const BottomNav = ({ viewMode, onViewChange, onMenu }) => {

    // Check if default or active in sub-routes
    const isHome = viewMode === 'home';
    const isCoolie = viewMode.startsWith('coolie');
    const isSilks = viewMode.startsWith('silks');
    // const isFiles = viewMode === 'files'; // Future use

    return (
        <nav className="bottom-nav">

            {/* Home */}
            <button
                className={`bottom-nav-item ${isHome ? 'active' : ''}`}
                onClick={() => onViewChange('home')}
            >
                <IconHome size={20} />
                <span className="bottom-nav-label">Home</span>
            </button>

            {/* + Coolie (Action) */}
            <button
                className={`bottom-nav-item ${isCoolie ? 'active' : ''}`}
                onClick={() => onViewChange('coolie-new')}
            >
                <div style={{
                    backgroundColor: 'var(--color-primary)',
                    color: '#fff',
                    padding: '8px 12px',
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                }}>
                    <span style={{ fontSize: '18px', lineHeight: 1 }}>+</span>
                    <span style={{ fontSize: '12px', fontWeight: 'bold' }}>Coolie</span>
                </div>
            </button>

            {/* + Silks (Action) */}
            <button
                className={`bottom-nav-item ${isSilks ? 'active' : ''}`}
                onClick={() => onViewChange('silks-new')}
            >
                <div style={{
                    backgroundColor: 'var(--color-brand-silks, #24AE61)',
                    color: '#fff',
                    padding: '8px 12px',
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                }}>
                    <span style={{ fontSize: '18px', lineHeight: 1 }}>+</span>
                    <span style={{ fontSize: '12px', fontWeight: 'bold' }}>Silks</span>
                </div>
            </button>

            {/* Menu / More */}
            <button
                className="bottom-nav-item"
                onClick={onMenu}
            >
                <IconMenu size={20} />
                <span className="bottom-nav-label">Menu</span>
            </button>

        </nav>
    );
};

export default BottomNav;
