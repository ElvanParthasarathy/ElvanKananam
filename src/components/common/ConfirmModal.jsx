import React from 'react';

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, confirmText = 'Confirm', cancelText = 'Cancel', type = 'info' }) => {
    if (!isOpen) return null;

    const overlayStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        backdropFilter: 'blur(3px)',
        animation: 'fadeIn 0.2s ease-out'
    };

    const modalStyle = {
        backgroundColor: 'var(--color-surface, #fff)',
        borderRadius: '12px',
        padding: '24px',
        maxWidth: '400px',
        width: '90%',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        transform: 'scale(1)',
        animation: 'scaleIn 0.2s ease-out',
        border: '1px solid var(--color-border, #eee)'
    };

    const titleStyle = {
        fontSize: '1.25rem',
        fontWeight: '600',
        marginBottom: '10px',
        color: 'var(--color-text, #111)',
    };

    const messageStyle = {
        fontSize: '1rem',
        color: 'var(--color-text-muted, #666)',
        marginBottom: '24px',
        lineHeight: '1.5'
    };

    const buttonContainer = {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '12px'
    };

    const btnBase = {
        padding: '8px 16px',
        borderRadius: '6px',
        fontSize: '14px',
        fontWeight: '500',
        cursor: 'pointer',
        border: 'none',
        transition: 'all 0.2s',
    };

    const btnCancel = {
        ...btnBase,
        backgroundColor: 'var(--color-bg, #f3f4f6)',
        color: 'var(--color-text, #374151)',
    };

    const btnConfirm = {
        ...btnBase,
        backgroundColor: type === 'danger' ? 'var(--color-danger, #ef4444)' : 'var(--color-primary, #2563eb)',
        color: '#fff',
    };

    return (
        <div style={overlayStyle}>
            <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
      `}</style>
            <div style={modalStyle}>
                <div style={titleStyle}>{title}</div>
                <div style={messageStyle}>{message}</div>
                <div style={buttonContainer}>
                    <button style={btnCancel} onClick={onCancel}>
                        {cancelText}
                    </button>
                    <button style={btnConfirm} onClick={onConfirm}>
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
