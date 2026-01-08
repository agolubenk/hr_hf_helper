'use client'

import { Flex, Box } from "@radix-ui/themes"
import { PinLeftIcon, PinRightIcon } from "@radix-ui/react-icons"
import { useState, useEffect, useRef, ReactNode } from "react"

interface FloatingAction {
  id: string
  icon: ReactNode
  onClick?: () => void
  label?: string
}

interface FloatingActionsProps {
  actions?: FloatingAction[]
}

export default function FloatingActions({ actions = [] }: FloatingActionsProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isPinned, setIsPinned] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const triggerZoneRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Зона срабатывания на правом краю
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const rightEdgeZone = window.innerWidth - 60 // 60px от правого края - зона срабатывания

      // Проверяем, находится ли курсор в зоне срабатывания или над самим блоком
      const isInTriggerZone = e.clientX >= rightEdgeZone
      const isOverPanel = panelRef.current && panelRef.current.contains(e.target as Node)

      if ((isInTriggerZone || isOverPanel) && !isPinned) {
        setIsVisible(true)
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
          timeoutRef.current = null
        }
      } else if (!isPinned && !isHovering && !isOverPanel && e.clientX < rightEdgeZone) {
        // Задержка перед скрытием, если курсор не над блоком
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }
        timeoutRef.current = setTimeout(() => {
          if (!isHovering && !isPinned) {
            setIsVisible(false)
          }
        }, 300)
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [isPinned, isHovering])

  const handlePinToggle = () => {
    setIsPinned(!isPinned)
    if (!isPinned) {
      setIsVisible(true)
    }
  }

  const handleMouseEnter = () => {
    setIsHovering(true)
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }

  const handleMouseLeave = () => {
    setIsHovering(false)
    if (!isPinned) {
      timeoutRef.current = setTimeout(() => {
        setIsVisible(false)
      }, 300)
    }
  }

  // Дефолтные действия, если не переданы
  const defaultActions: FloatingAction[] = actions.length > 0 ? actions : [
    {
      id: 'action1',
      icon: <Box style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: 'currentColor' }} />,
      label: 'Действие 1',
    },
    {
      id: 'action2',
      icon: <Box style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: 'currentColor' }} />,
      label: 'Действие 2',
    },
  ]

  // Добавляем кнопку pin в конец списка (она будет самой нижней)
  const allActions = [
    ...defaultActions,
    {
      id: 'pin',
      icon: isPinned ? (
        <PinRightIcon width="20" height="20" style={{ color: 'currentColor' }} />
      ) : (
        <PinLeftIcon width="20" height="20" style={{ color: 'currentColor' }} />
      ),
      onClick: handlePinToggle,
      label: isPinned ? 'Открепить' : 'Закрепить',
    },
  ]

  return (
    <>
      {/* Невидимая зона срабатывания - всегда присутствует */}
      <Box
        ref={triggerZoneRef}
        position="fixed"
        top="64px"
        right="0"
        bottom="0"
        width="60px"
        style={{
          zIndex: 998,
          pointerEvents: isPinned ? 'none' : 'auto',
        }}
      />
      
      {/* Плавающий блок с кнопками */}
      {(isVisible || isPinned) && (
        <Box
          ref={panelRef}
          position="fixed"
          right="20px"
          bottom="20px"
          style={{
            zIndex: 1500,
            pointerEvents: 'auto',
            transition: 'opacity 0.2s ease-in-out, transform 0.2s ease-in-out',
            opacity: isVisible || isPinned ? 1 : 0,
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
        <Flex
          direction="column"
          gap="2"
          align="center"
          style={{
            backgroundColor: 'var(--color-panel)',
            border: '1px solid var(--gray-a6)',
            borderRadius: '12px',
            padding: '12px 8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          }}
        >
          {/* Кнопки снизу вверх - pin внизу, остальные сверху */}
          {allActions.map((action) => (
            <Box
              key={action.id}
              onClick={action.onClick}
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: action.id === 'pin' && isPinned
                  ? 'var(--gray-4)'
                  : 'var(--gray-3)',
                border: '1px solid var(--gray-a6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--gray-4)'
                e.currentTarget.style.transform = 'scale(1.1)'
              }}
              onMouseLeave={(e) => {
                if (action.id === 'pin' && isPinned) {
                  e.currentTarget.style.backgroundColor = 'var(--gray-4)'
                } else {
                  e.currentTarget.style.backgroundColor = 'var(--gray-3)'
                }
                e.currentTarget.style.transform = 'scale(1)'
              }}
              title={action.label}
            >
              <Box style={{ color: 'var(--gray-12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {action.icon}
              </Box>
            </Box>
          ))}
        </Flex>
        </Box>
      )}
    </>
  )
}
