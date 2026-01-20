import React, { useState, useEffect, useRef, useCallback } from 'react';
import './components.css';
import { ToastMessage, ToastType } from '../types';

const toastIcons: Record<ToastType, string> = {
    info: 'bi-info-circle-fill',
    success: 'bi-check-circle-fill',
    error: 'bi-x-circle-fill',
    warning: 'bi-exclamation-triangle-fill',
    message: 'bi-chat-dots-fill',
    mention: 'bi-at',
    task: 'bi-check2-circle',
    calendar: 'bi-calendar-event-fill',
};

interface ToastProps {
    toast: ToastMessage;
    onDismiss: (id: number) => void;
    onMinimize: (id: number) => void;
    onPin: (id: number) => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onDismiss, onMinimize, onPin }) => {
    const [isExiting, setIsExiting] = useState(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const handleDismiss = useCallback(() => {
        setIsExiting(true);
        // Clear any existing timer to prevent multiple dismiss calls
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }
        setTimeout(() => onDismiss(toast.id), 300); // 300ms for animation
    }, [onDismiss, toast.id]);
    
    const handleMinimize = (e: React.MouseEvent) => {
        e.stopPropagation();
        handlePauseTimer();
        onMinimize(toast.id);
        handleDismiss(); // Also dismiss after minimizing
    };
    
    const handlePin = (e: React.MouseEvent) => {
        e.stopPropagation();
        handlePauseTimer();
        onPin(toast.id);
        handleDismiss(); // Also dismiss after pinning
    };

    const handlePauseTimer = () => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }
    };

    const handleResumeTimer = () => {
        timerRef.current = setTimeout(handleDismiss, 3000); // Resume with 3s
    };


    useEffect(() => {
        // Automatically dismiss after 5 seconds
        timerRef.current = setTimeout(handleDismiss, 5000);

        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, [handleDismiss]);

    const Icon = toastIcons[toast.type] || toastIcons.info;
    const toastClass = isExiting ? 'closing' : 'show';

    return (
        <div 
            className={`toast-wrapper ${toastClass}`}
            onMouseEnter={handlePauseTimer}
            onMouseLeave={handleResumeTimer}
        >
             <div className="toast-header">
                <i className="bi bi-hexagon-fill toast-logo"></i>
                <span className="toast-title">HRM Pro</span>
                <button onClick={handlePin} className="toast-action-btn" title="Закрепить">
                    <i className="bi bi-pin-angle-fill"></i>
                </button>
                <button onClick={handleDismiss} className="toast-close-btn" title="Закрыть">&times;</button>
            </div>
            <div className={`toast-body type-${toast.type}`}>
                <i className={`bi ${Icon} toast-body-icon`}></i>
                <div className="toast-message-content">
                    <div className="toast-message-title">{toast.title}</div>
                    <p className="toast-message-text">{toast.message}</p>
                </div>
            </div>
        </div>
    );
};

export default Toast; 