import React, { useEffect, useState } from 'react';

const Toast = ({ message, type = 'success', onClose, duration = 3000 }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Trigger animation
        setIsVisible(true);

        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onClose, 300); // Wait for exit animation
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    // Styles
    const baseStyle = {
        position: 'fixed',
        top: '20px',
        left: '50%',
        transform: isVisible ? 'translate(-50%, 0)' : 'translate(-50%, -100px)',
        opacity: isVisible ? 1 : 0,
        minWidth: '300px',
        padding: '16px 24px',
        borderRadius: '12px',
        color: '#fff',
        fontSize: '15px',
        fontWeight: '500',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        zIndex: 9999,
        backdropFilter: 'blur(10px)',
    };

    const typeStyles = {
        success: {
            background: 'rgba(34, 197, 94, 0.95)', // Green
            boxShadow: '0 10px 40px -10px rgba(34, 197, 94, 0.4)'
        },
        error: {
            background: 'rgba(239, 68, 68, 0.95)', // Red
            boxShadow: '0 10px 40px -10px rgba(239, 68, 68, 0.4)'
        },
        info: {
            background: 'rgba(59, 130, 246, 0.95)', // Blue
            boxShadow: '0 10px 40px -10px rgba(59, 130, 246, 0.4)'
        },
        warning: {
            background: 'rgba(245, 158, 11, 0.95)', // Amber
            boxShadow: '0 10px 40px -10px rgba(245, 158, 11, 0.4)'
        }
    };

    const icons = {
        success: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
        ),
        error: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
        ),
        info: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
        ),
        warning: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
        )
    };

    return (
        <div style={{ ...baseStyle, ...typeStyles[type] }}>
            <span style={{ display: 'flex' }}>{icons[type]}</span>
            <span>{message}</span>
        </div>
    );
};

export default Toast;
