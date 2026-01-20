import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { Toast, ToastType } from '../types';

interface ToastContextType {
    toasts: Toast[];
    addToast: (message: string, options?: { type?: ToastType; }) => void;
    removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = useCallback((message: string, options?: { type?: ToastType }) => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts(currentToasts => [
            ...currentToasts,
            { id, message, type: options?.type || 'info' }
        ]);
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts(currentToasts => currentToasts.filter(toast => toast.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
            {children}
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (context === undefined) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}; 