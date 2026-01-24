'use client'

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { Box } from '@radix-ui/themes'
import Toast, { ToastType } from './Toast'
import styles from './Toast.module.css'

export interface ToastAction {
  label: string
  onClick: () => void
  variant?: 'solid' | 'soft' | 'outline' | 'ghost'
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'gray'
}

export interface ToastData {
  id: string
  type: ToastType
  title: string
  message: string
  duration?: number
  actions?: ToastAction[]
}

interface ToastContextType {
  showToast: (toast: Omit<ToastData, 'id'>) => void
  showInfo: (title: string, message: string, options?: { duration?: number; actions?: ToastAction[] }) => void
  showWarning: (title: string, message: string, options?: { duration?: number; actions?: ToastAction[] }) => void
  showError: (title: string, message: string, options?: { duration?: number; actions?: ToastAction[] }) => void
  showSuccess: (title: string, message: string, options?: { duration?: number; actions?: ToastAction[] }) => void
  showSystem: (title: string, message: string, options?: { duration?: number; actions?: ToastAction[] }) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}

interface ToastProviderProps {
  children: ReactNode
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastData[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const showToast = useCallback((toast: Omit<ToastData, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const newToast: ToastData = { ...toast, id }
    setToasts((prev) => [...prev, newToast])
  }, [])

  const showInfo = useCallback(
    (title: string, message: string, options?: { duration?: number; actions?: ToastAction[] }) => {
      showToast({ type: 'info', title, message, ...options })
    },
    [showToast]
  )

  const showWarning = useCallback(
    (title: string, message: string, options?: { duration?: number; actions?: ToastAction[] }) => {
      showToast({ type: 'warning', title, message, ...options })
    },
    [showToast]
  )

  const showError = useCallback(
    (title: string, message: string, options?: { duration?: number; actions?: ToastAction[] }) => {
      showToast({ type: 'error', title, message, ...options })
    },
    [showToast]
  )

  const showSuccess = useCallback(
    (title: string, message: string, options?: { duration?: number; actions?: ToastAction[] }) => {
      showToast({ type: 'success', title, message, ...options })
    },
    [showToast]
  )

  const showSystem = useCallback(
    (title: string, message: string, options?: { duration?: number; actions?: ToastAction[] }) => {
      showToast({ type: 'system', title, message, ...options })
    },
    [showToast]
  )

  return (
    <ToastContext.Provider
      value={{
        showToast,
        showInfo,
        showWarning,
        showError,
        showSuccess,
        showSystem,
        removeToast,
      }}
    >
      {children}
      <Box className={styles.toastContainer}>
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            id={toast.id}
            type={toast.type}
            title={toast.title}
            message={toast.message}
            duration={toast.duration}
            onClose={removeToast}
            actions={toast.actions}
          />
        ))}
      </Box>
    </ToastContext.Provider>
  )
}
