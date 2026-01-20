/**
 * Хелпер для показа toast-уведомлений
 */

import type { ToastAction } from '../components/Toast';

export interface ToastOptions {
  type?: 'info' | 'success' | 'error' | 'warning';
  title?: string;
  useExplicit?: boolean;
  actions?: ToastAction[];
}

/**
 * Показывает toast-уведомление
 */
export const showToast = (message: string, options: ToastOptions = {}) => {
  if (typeof window !== 'undefined' && (window as any).addToastWithActions) {
    const type = options.type || 'info';
    const title = options.title || '';
    (window as any).addToastWithActions(type, title, message, options.actions || [], options.useExplicit || false);
  } else if (typeof window !== 'undefined' && (window as any).addToast) {
    const type = options.type || 'info';
    const title = options.title || '';
    (window as any).addToast(type, title, message, options.useExplicit || false);
  } else {
    console.warn('Toast system not available:', message);
  }
};

/**
 * Удобные функции для разных типов уведомлений
 */
export const toastSuccess = (message: string, title = 'Успешно') => {
  showToast(message, { type: 'success', title });
};

export const toastError = (message: string, title = 'Ошибка') => {
  showToast(message, { type: 'error', title });
};

export const toastInfo = (message: string, title = 'Информация') => {
  showToast(message, { type: 'info', title });
};

export const toastWarning = (message: string, title = 'Предупреждение') => {
  showToast(message, { type: 'warning', title });
};

/**
 * Показывает toast с подтверждением действия
 * @param message - Сообщение для подтверждения
 * @param onConfirm - Функция, вызываемая при подтверждении
 * @param onCancel - Функция, вызываемая при отмене (опционально)
 * @param title - Заголовок тоста (по умолчанию "Подтверждение")
 */
export const toastConfirm = (
  message: string,
  onConfirm: () => void,
  onCancel?: () => void,
  title = 'Подтверждение'
) => {
  const actions: ToastAction[] = [
    {
      label: 'Отмена',
      onClick: () => {
        if (onCancel) onCancel();
      },
      variant: 'secondary'
    },
    {
      label: 'Подтвердить',
      onClick: () => {
        onConfirm();
      },
      variant: 'danger'
    }
  ];

  showToast(message, {
    type: 'warning',
    title,
    actions
  });
};

