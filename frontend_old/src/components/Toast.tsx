import React, { useState, useEffect, useRef, useCallback } from 'react';

export type ToastType = 'info' | 'success' | 'error' | 'warning' | 'message' | 'mention' | 'task' | 'calendar' | 'document';

export interface ToastAction {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';
}

export interface ToastMessage {
  id: number;
  type: ToastType;
  title: string;
  message: string | React.ReactNode;
  actions?: ToastAction[];
  pinned?: boolean;
  minimized?: boolean;
}

// Иконки для разных типов тостов
const toastIcons: Record<ToastType, string> = {
  info: 'bi-info-circle-fill',
  success: 'bi-check-circle-fill',
  error: 'bi-x-circle-fill',
  warning: 'bi-exclamation-triangle-fill',
  message: 'bi-chat-dots-fill',
  mention: 'bi-at',
  task: 'bi-list-check',
  calendar: 'bi-calendar-event-fill',
  document: 'bi-file-earmark-text-fill',
};

interface ToastProps {
  toast: ToastMessage;
  onDismiss: (id: number) => void;
  onPin?: (id: number) => void;
  autoHide?: boolean;
  autoHideDelay?: number;
}

const Toast: React.FC<ToastProps> = ({ 
  toast, 
  onDismiss, 
  onPin,
  autoHide = true,
  autoHideDelay = 5000
}) => {
  const [isExiting, setIsExiting] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleDismiss = useCallback(() => {
    setIsExiting(true);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setTimeout(() => onDismiss(toast.id), 300);
  }, [onDismiss, toast.id]);
  
  const handlePin = (e: React.MouseEvent) => {
    e.stopPropagation();
    handlePauseTimer();
    if (onPin) {
      onPin(toast.id);
    }
  };

  const handlePauseTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  };

  const handleResumeTimer = () => {
    if (autoHide && !toast.pinned) {
      timerRef.current = setTimeout(handleDismiss, autoHideDelay);
    }
  };

  useEffect(() => {
    if (autoHide && !toast.pinned) {
      timerRef.current = setTimeout(handleDismiss, autoHideDelay);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [autoHide, toast.pinned, handleDismiss, autoHideDelay]);

  const icon = toastIcons[toast.type] || toastIcons.info;
  const toastClass = isExiting ? 'closing' : 'show';

  // Проверяем, является ли сообщение примером с кодом (содержит <pre>)
  const checkForPreElement = (element: React.ReactNode): boolean => {
    if (!React.isValidElement(element)) return false;
    const el = element as React.ReactElement<any>;
    if (el.type === 'pre') return true;
    const props = el.props as any;
    if (props && props.children) {
      const children = props.children;
      if (Array.isArray(children)) {
        return children.some((child: React.ReactNode) => checkForPreElement(child));
      }
      return checkForPreElement(children);
    }
    return false;
  };

  const isCodeExample = typeof toast.message !== 'string' && checkForPreElement(toast.message);

  const handleCopyCode = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof toast.message !== 'string' && React.isValidElement(toast.message)) {
      // Находим элемент <pre> в сообщении
      const findPreElement = (element: React.ReactNode): string | null => {
        if (!React.isValidElement(element)) return null;
        const el = element as React.ReactElement<any>;
        if (el.type === 'pre') {
          const children = el.props?.children;
          return typeof children === 'string' ? children : null;
        }
        const props = el.props as any;
        if (props?.children) {
          const children = props.children;
          if (Array.isArray(children)) {
            for (const child of children) {
              const result = findPreElement(child);
              if (result) return result;
            }
          } else {
            return findPreElement(children);
          }
        }
        return null;
      };

      const codeText = findPreElement(toast.message);
      if (codeText) {
        navigator.clipboard.writeText(codeText).then(() => {
          // Можно добавить уведомление об успешном копировании
          console.log('Код скопирован в буфер обмена');
        }).catch(err => {
          console.error('Ошибка копирования:', err);
        });
      }
    }
  };

  return (
    <div 
      className={`toast-wrapper ${toastClass}`}
      onMouseEnter={handlePauseTimer}
      onMouseLeave={handleResumeTimer}
    >
      <div className="toast-header">
        <i className={`bi ${icon} toast-action-icon type-${toast.type}`}></i>
        <span className="toast-title">{toast.title}</span>
        <div className="toast-header-actions">
          {onPin && (
            <button 
              onClick={handlePin} 
              className={`toast-action-btn ${toast.pinned ? 'pinned' : ''}`} 
              title={toast.pinned ? 'Открепить' : 'Закрепить'}
            >
              <i className="bi bi-pin-angle-fill"></i>
            </button>
          )}
          <button 
            onClick={handleDismiss} 
            className="toast-close-btn" 
            title="Закрыть"
          >
            &times;
          </button>
        </div>
      </div>
      <div className={`toast-body type-${toast.type}`}>
        <div className="toast-message-content">
          <div className="toast-message-text">
            {isCodeExample && React.isValidElement(toast.message) ? (
              <div className="code-example-wrapper">
                {React.cloneElement(toast.message as React.ReactElement<any>, {
                  children: React.Children.map((toast.message as React.ReactElement<any>).props.children, (child: React.ReactNode) => {
                    if (React.isValidElement(child) && (child as React.ReactElement<any>).type === 'pre') {
                      const preChild = child as React.ReactElement<any>;
                      return React.cloneElement(preChild, {
                        className: `code-block-with-copy ${preChild.props.className || ''}`.trim(),
                        children: (
                          <>
                            {preChild.props.children}
                            <button
                              className="toast-copy-code-btn"
                              onClick={handleCopyCode}
                              title="Копировать код"
                            >
                              <i className="bi bi-copy"></i>
                            </button>
                          </>
                        )
                      });
                    }
                    return child;
                  })
                })}
              </div>
            ) : (
              <>
                <span className="toast-message-text-content">{toast.message}</span>
                {toast.actions && toast.actions.length > 0 && (
                  <span className="toast-actions-inline">
                    {toast.actions.map((action, index) => (
                      <button
                        key={index}
                        className={`btn btn-sm toast-action-button btn-${action.variant || 'primary'}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          action.onClick();
                          // Закрываем тост после действия
                          handleDismiss();
                        }}
                      >
                        {action.label}
                      </button>
                    ))}
                  </span>
                )}
              </>
            )}
          </div>
          {toast.actions && toast.actions.length > 0 && isCodeExample && (
            <div className="toast-actions">
              {toast.actions.map((action, index) => (
                <button
                  key={index}
                  className={`btn btn-sm toast-action-button btn-${action.variant || 'primary'}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    action.onClick();
                    // Закрываем тост после действия
                    handleDismiss();
                  }}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Toast;

