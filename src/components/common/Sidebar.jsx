import React, { useState } from 'react';
import {
    IconHome,
    IconBox,
    IconFileText,
    IconSettings,
    IconUsers,
    IconFiles,
    IconLogout,
    IconChevronDown,
    IconX
} from './Icons';

const Sidebar = ({ viewMode, onViewChange, onLogout, t, isOpen, onClose }) => {

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
                        label="Home"
                        value="home"
                        onClick={onViewChange}
                    />

                    <div className="nav-section-title">Main Modules</div>

                    {/* Coolie Bill */}
                    <NavItem
                        icon={IconBox}
                        label="Coolie Bill"
                        value="coolie"
                        onClick={() => onViewChange('coolie-dashboard')} // Default to dashboard
                    />
                    {isActive('coolie') && (
                        <>
                            <SubItem label="+ New Bill" value="coolie-new" onClick={onViewChange} />
                            <SubItem label="All Bills" value="coolie-dashboard" onClick={onViewChange} />
                            <SubItem label="Customers" value="coolie-customers" onClick={onViewChange} />
                        </>
                    )}

                    {/* Silks Bill */}
                    <NavItem
                        icon={IconFileText}
                        label="Silks Bill"
                        value="silks"
                        onClick={() => onViewChange('silks-dashboard')}
                    />
                    {isActive('silks') && (
                        <>
                            <SubItem label="+ New Invoice" value="silks-new" onClick={onViewChange} />
                            <SubItem label="All Invoices" value="silks-dashboard" onClick={onViewChange} />
                            <SubItem label="Customers" value="silks-customers" onClick={onViewChange} />
                            <SubItem label="Inventory / Items" value="silks-items" onClick={onViewChange} />
                            <SubItem label="Business Settings" value="silks-business" onClick={onViewChange} />
                        </>
                    )}

                    <div className="nav-section-title">Extras</div>

                    <NavItem
                        icon={IconSettings}
                        label="Settings"
                        value="settings"
                        onClick={onViewChange}
                    />

                </nav>

                <div className="sidebar-footer">
                    <button className="nav-item" onClick={onLogout} style={{ color: 'var(--color-danger)' }}>
                        <IconLogout size={20} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
