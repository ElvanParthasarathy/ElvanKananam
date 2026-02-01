import React, { createContext, useState, useContext, useCallback, useRef } from 'react';
import ConfirmModal from '../components/common/ConfirmModal';

const ConfirmContext = createContext();

export const ConfirmProvider = ({ children }) => {
    const [modalState, setModalState] = useState({
        isOpen: false,
        title: '',
        message: '',
        confirmText: 'Confirm',
        cancelText: 'Cancel',
        type: 'info'
    });

    // Ref to hold the resolve function of the current promise
    const awaitPromiseRef = useRef(null);

    const confirm = useCallback((options) => {
        // If a modal is already open, strictly speaking we should queue or reject, but replacing is fine for now
        setModalState({
            isOpen: true,
            title: options.title || 'உறுதிப்படுத்தவும்',
            message: options.message || 'இந்த செயலை உறுதிப்படுத்தவும். / Please confirm this action.',
            confirmText: options.confirmText || 'ஆம் / Yes',
            cancelText: options.cancelText || 'இல்லை / No',
            type: options.type || 'info'
        });

        return new Promise((resolve) => {
            awaitPromiseRef.current = resolve;
        });
    }, []);

    const handleConfirm = useCallback(() => {
        if (awaitPromiseRef.current) {
            awaitPromiseRef.current(true);
        }
        setModalState(prev => ({ ...prev, isOpen: false }));
        awaitPromiseRef.current = null;
    }, []);

    const handleCancel = useCallback(() => {
        if (awaitPromiseRef.current) {
            awaitPromiseRef.current(false);
        }
        setModalState(prev => ({ ...prev, isOpen: false }));
        awaitPromiseRef.current = null;
    }, []);

    return (
        <ConfirmContext.Provider value={{ confirm }}>
            {children}
            <ConfirmModal
                {...modalState}
                onConfirm={handleConfirm}
                onCancel={handleCancel}
            />
        </ConfirmContext.Provider>
    );
};

export const useConfirm = () => {
    const context = useContext(ConfirmContext);
    if (!context) {
        throw new Error('useConfirm must be used within a ConfirmProvider');
    }
    return context;
};
