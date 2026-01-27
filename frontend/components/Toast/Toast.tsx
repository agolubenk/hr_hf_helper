'use client'

import React, { useEffect, useState } from 'react'
import { Box, Text, Button } from '@radix-ui/themes'
import {
  InfoCircledIcon,
  ExclamationTriangleIcon,
  CrossCircledIcon,
  CheckCircledIcon,
  GearIcon,
  Cross2Icon
} from '@radix-ui/react-icons'
import styles from './Toast.module.css'

export type ToastType = 'info' | 'warning' | 'error' | 'success' | 'system'

export interface ToastProps {
  id: string
  type: ToastType
  title: string
  message: string
  duration?: number
  onClose: (id: string) => void
  actions?: Array<{
    label: string
    onClick: () => void
    variant?: 'solid' | 'soft' | 'outline' | 'ghost'
    color?: 'blue' | 'green' | 'red' | 'yellow' | 'gray'
  }>
}

const MAX_DURATION_FOR_ACTION_TOASTS_MS = 12000 // тосты с кнопками действий скрываются через 12 сек при неактивности

const Toast: React.FC<ToastProps> = ({
  id,
  type,
  title,
  message,
  duration = 3000,
  onClose,
  actions
}) => {
  const [isExiting, setIsExiting] = useState(false)

  // Тосты, запрашивающие действие (с кнопками), пропадают через 12 сек при неактивности
  const effectiveDuration = actions && actions.length > 0
    ? MAX_DURATION_FOR_ACTION_TOASTS_MS
    : (duration ?? 3000)

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose()
    }, effectiveDuration)

    return () => clearTimeout(timer)
  }, [effectiveDuration])

  const handleClose = () => {
    setIsExiting(true)
    setTimeout(() => {
      onClose(id)
    }, 300) // Wait for animation to complete
  }

  const getIcon = () => {
    const iconProps = { width: 20, height: 20 }
    switch (type) {
      case 'info':
        return <InfoCircledIcon {...iconProps} />
      case 'warning':
        return <ExclamationTriangleIcon {...iconProps} />
      case 'error':
        return <CrossCircledIcon {...iconProps} />
      case 'success':
        return <CheckCircledIcon {...iconProps} />
      case 'system':
        return <GearIcon {...iconProps} />
      default:
        return <InfoCircledIcon {...iconProps} />
    }
  }

  const getToastClassName = () => {
    const baseClass = styles.toast
    const formatClass = styles[`toast${type.charAt(0).toUpperCase() + type.slice(1)}`]
    const exitingClass = isExiting ? styles.toastExiting : ''
    return `${baseClass} ${formatClass} ${exitingClass}`.trim()
  }

  const getIconClassName = () => {
    return styles[`toastIcon${type.charAt(0).toUpperCase() + type.slice(1)}`]
  }

  const getProgressBarClassName = () => {
    return styles[`toastProgressBar${type.charAt(0).toUpperCase() + type.slice(1)}`]
  }

  return (
    <Box className={getToastClassName()}>
      <Box className={styles.toastHeader}>
        <Box className={`${styles.toastIcon} ${getIconClassName()}`}>
          {getIcon()}
        </Box>
        <Text className={styles.toastTitle}>{title}</Text>
        <button
          className={styles.toastCloseButton}
          onClick={handleClose}
          aria-label="Закрыть уведомление"
        >
          <Cross2Icon width={14} height={14} />
        </button>
      </Box>
      
      <Box className={styles.toastProgressBar}>
        <Box className={`${styles.toastProgressBarFill} ${getProgressBarClassName()}`} />
      </Box>
      
      <Box className={styles.toastBody}>
        <Text className={styles.toastMessage}>{message}</Text>
        
        {actions && actions.length > 0 && (
          <Box className={styles.toastActions}>
            {actions.map((action, index) => (
              <Button
                key={index}
                size="1"
                variant={action.variant || 'soft'}
                color={action.color || 'gray'}
                onClick={(e) => {
                  e.stopPropagation() // Предотвращаем всплытие события, чтобы не закрывать модальные окна
                  action.onClick()
                  handleClose()
                }}
              >
                {action.label}
              </Button>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  )
}

export default Toast
