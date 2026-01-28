/**
 * ToastContext (components/Toast/ToastContext.tsx) - Контекст для управления уведомлениями (Toast)
 * 
 * Назначение:
 * - Централизованное управление уведомлениями в приложении
 * - Отображение различных типов уведомлений (info, warning, error, success, system)
 * - Управление жизненным циклом уведомлений (показ, удаление)
 * - Поддержка действий в уведомлениях (кнопки)
 * 
 * Функциональность:
 * - showToast: базовая функция для показа уведомления
 * - showInfo: показ информационного уведомления
 * - showWarning: показ предупреждающего уведомления
 * - showError: показ уведомления об ошибке
 * - showSuccess: показ уведомления об успехе
 * - showSystem: показ системного уведомления
 * - removeToast: удаление уведомления
 * 
 * Связи:
 * - Toast: компонент отдельного уведомления
 * - React Portal: тосты рендерятся в body через портал для отображения поверх модальных окон
 * - useToast: хук для доступа к функциям показа уведомлений
 * - Все компоненты приложения: используют useToast для показа уведомлений
 * 
 * Поведение:
 * - При вызове show* функции создается новое уведомление с уникальным ID
 * - Уведомления отображаются в контейнере в правом верхнем углу
 * - Уведомления автоматически удаляются через указанное время (duration)
 * - Уведомления можно закрыть вручную
 * - Уведомления могут содержать действия (кнопки)
 */

'use client'

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Box, Theme } from '@radix-ui/themes'
import { useTheme } from '@/components/ThemeProvider'
import Toast, { ToastType } from './Toast'
import styles from './Toast.module.css'

/**
 * ToastAction - интерфейс действия в уведомлении
 * 
 * Структура:
 * - label: текст кнопки действия
 * - onClick: обработчик клика на кнопку
 * - variant: вариант кнопки (solid, soft, outline, ghost)
 * - color: цвет кнопки (blue, green, red, yellow, gray)
 */
export interface ToastAction {
  label: string
  onClick: () => void
  variant?: 'solid' | 'soft' | 'outline' | 'ghost'
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'gray'
}

/**
 * ToastData - интерфейс данных уведомления
 * 
 * Структура:
 * - id: уникальный идентификатор уведомления
 * - type: тип уведомления (info, warning, error, success, system)
 * - title: заголовок уведомления
 * - message: текст сообщения
 * - duration: продолжительность отображения в миллисекундах (опционально)
 * - actions: массив действий (кнопок) в уведомлении (опционально)
 */
export interface ToastData {
  id: string
  type: ToastType
  title: string
  message: string
  duration?: number
  actions?: ToastAction[]
}

/**
 * ToastContextType - интерфейс контекста уведомлений
 * 
 * Структура:
 * - showToast: базовая функция для показа уведомления
 * - showInfo, showWarning, showError, showSuccess, showSystem: функции для показа уведомлений разных типов
 * - removeToast: функция удаления уведомления
 */
interface ToastContextType {
  showToast: (toast: Omit<ToastData, 'id'>) => void
  showInfo: (title: string, message: string, options?: { duration?: number; actions?: ToastAction[] }) => void
  showWarning: (title: string, message: string, options?: { duration?: number; actions?: ToastAction[] }) => void
  showError: (title: string, message: string, options?: { duration?: number; actions?: ToastAction[] }) => void
  showSuccess: (title: string, message: string, options?: { duration?: number; actions?: ToastAction[] }) => void
  showSystem: (title: string, message: string, options?: { duration?: number; actions?: ToastAction[] }) => void
  removeToast: (id: string) => void
}

/**
 * ToastContext - React Context для уведомлений
 * 
 * Используется для:
 * - Предоставления функций управления уведомлениями всем дочерним компонентам
 */
const ToastContext = createContext<ToastContextType | undefined>(undefined)

/**
 * useToast - хук для доступа к контексту уведомлений
 * 
 * Функциональность:
 * - Возвращает контекст уведомлений
 * - Выбрасывает ошибку, если используется вне ToastProvider
 * 
 * Используется для:
 * - Получения функций показа уведомлений в компонентах
 * 
 * @returns ToastContextType - контекст уведомлений
 * @throws Error если используется вне ToastProvider
 */
export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}

/**
 * ToastProviderProps - интерфейс пропсов компонента ToastProvider
 * 
 * Структура:
 * - children: дочерние компоненты
 */
interface ToastProviderProps {
  children: ReactNode
}

/**
 * ToastProvider - провайдер уведомлений
 * 
 * Состояние:
 * - toasts: массив всех активных уведомлений
 * 
 * Функциональность:
 * - Управление жизненным циклом уведомлений
 * - Отображение уведомлений в контейнере
 */
export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  // Получаем текущую тему для применения к тостам в портале
  const { theme, lightThemeAccentColor, darkThemeAccentColor } = useTheme()
  // Массив всех активных уведомлений
  const [toasts, setToasts] = useState<ToastData[]>([])

  /**
   * removeToast - удаление уведомления
   * 
   * Функциональность:
   * - Удаляет уведомление из массива по ID
   * 
   * Поведение:
   * - Вызывается при закрытии уведомления (вручную или автоматически)
   * - Фильтрует массив toasts, удаляя уведомление с указанным ID
   * 
   * @param id - ID уведомления для удаления
   * 
   * useCallback:
   * - Мемоизирует функцию для оптимизации производительности
   */
  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  /**
   * showToast - базовая функция для показа уведомления
   * 
   * Функциональность:
   * - Создает новое уведомление с уникальным ID
   * - Добавляет уведомление в массив toasts
   * 
   * Поведение:
   * - Генерирует уникальный ID на основе времени и случайной строки
   * - Добавляет уведомление в конец массива toasts
   * 
   * @param toast - данные уведомления (без ID, он генерируется автоматически)
   * 
   * useCallback:
   * - Мемоизирует функцию для оптимизации производительности
   */
  const showToast = useCallback((toast: Omit<ToastData, 'id'>) => {
    // Генерируем уникальный ID на основе времени и случайной строки
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const newToast: ToastData = { ...toast, id }
    setToasts((prev) => [...prev, newToast]) // Добавляем уведомление в массив
  }, [])

  /**
   * showInfo - показ информационного уведомления
   * 
   * Функциональность:
   * - Показывает уведомление типа 'info'
   * 
   * Используется для:
   * - Отображения информационных сообщений
   * 
   * @param title - заголовок уведомления
   * @param message - текст сообщения
   * @param options - опциональные параметры (duration, actions)
   */
  const showInfo = useCallback(
    (title: string, message: string, options?: { duration?: number; actions?: ToastAction[] }) => {
      showToast({ type: 'info', title, message, ...options })
    },
    [showToast]
  )

  /**
   * showWarning - показ предупреждающего уведомления
   * 
   * Функциональность:
   * - Показывает уведомление типа 'warning'
   * 
   * Используется для:
   * - Отображения предупреждений
   * 
   * @param title - заголовок уведомления
   * @param message - текст сообщения
   * @param options - опциональные параметры (duration, actions)
   */
  const showWarning = useCallback(
    (title: string, message: string, options?: { duration?: number; actions?: ToastAction[] }) => {
      showToast({ type: 'warning', title, message, ...options })
    },
    [showToast]
  )

  /**
   * showError - показ уведомления об ошибке
   * 
   * Функциональность:
   * - Показывает уведомление типа 'error'
   * 
   * Используется для:
   * - Отображения ошибок
   * 
   * @param title - заголовок уведомления
   * @param message - текст сообщения
   * @param options - опциональные параметры (duration, actions)
   */
  const showError = useCallback(
    (title: string, message: string, options?: { duration?: number; actions?: ToastAction[] }) => {
      showToast({ type: 'error', title, message, ...options })
    },
    [showToast]
  )

  /**
   * showSuccess - показ уведомления об успехе
   * 
   * Функциональность:
   * - Показывает уведомление типа 'success'
   * 
   * Используется для:
   * - Отображения успешных операций
   * 
   * @param title - заголовок уведомления
   * @param message - текст сообщения
   * @param options - опциональные параметры (duration, actions)
   */
  const showSuccess = useCallback(
    (title: string, message: string, options?: { duration?: number; actions?: ToastAction[] }) => {
      showToast({ type: 'success', title, message, ...options })
    },
    [showToast]
  )

  /**
   * showSystem - показ системного уведомления
   * 
   * Функциональность:
   * - Показывает уведомление типа 'system'
   * 
   * Используется для:
   * - Отображения системных сообщений
   * 
   * @param title - заголовок уведомления
   * @param message - текст сообщения
   * @param options - опциональные параметры (duration, actions)
   */
  const showSystem = useCallback(
    (title: string, message: string, options?: { duration?: number; actions?: ToastAction[] }) => {
      showToast({ type: 'system', title, message, ...options })
    },
    [showToast]
  )

  /**
   * Рендер компонента ToastProvider
   * 
   * Структура:
   * - ToastContext.Provider: предоставляет контекст уведомлений дочерним компонентам
   * - Box с классом toastContainer: контейнер для отображения уведомлений
   * - Toast компоненты: рендерятся для каждого активного уведомления
   */
  // Состояние для проверки, что мы в браузере (для SSR)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Определяем акцентный цвет в зависимости от темы
  const currentAccentColor = theme === 'dark' ? darkThemeAccentColor : lightThemeAccentColor

  // Рендерим тосты через портал в body, чтобы они были поверх всех модальных окон
  // Обертываем в Theme компонент, чтобы сохранить контекст Radix UI
  const toastContent = (
    <Theme
      accentColor={currentAccentColor}
      grayColor="sand"
      radius="large"
      scaling="95%"
      appearance={theme}
    >
      <Box className={styles.toastContainer}>
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            id={toast.id}
            type={toast.type}
            title={toast.title}
            message={toast.message}
            duration={toast.duration}
            onClose={removeToast} // Обработчик закрытия уведомления
            actions={toast.actions} // Действия (кнопки) в уведомлении
          />
        ))}
      </Box>
    </Theme>
  )

  return (
    <ToastContext.Provider
      value={{
        showToast, // Базовая функция для показа уведомления
        showInfo, // Функция для показа информационного уведомления
        showWarning, // Функция для показа предупреждающего уведомления
        showError, // Функция для показа уведомления об ошибке
        showSuccess, // Функция для показа уведомления об успехе
        showSystem, // Функция для показа системного уведомления
        removeToast, // Функция удаления уведомления
      }}
    >
      {children}
      {/* Контейнер для отображения уведомлений
          - Рендерится через React Portal напрямую в body
          - Фиксированная позиция (обычно правый верхний угол)
          - Отображает все активные уведомления
          - Всегда поверх модальных окон благодаря порталу */}
      {isMounted && typeof document !== 'undefined' && createPortal(toastContent, document.body)}
    </ToastContext.Provider>
  )
}
