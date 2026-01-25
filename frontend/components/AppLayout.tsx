'use client'

import { Box, Flex } from "@radix-ui/themes"
import { useState, useEffect, ReactNode } from "react"
import { usePathname } from "next/navigation"
import Header from "./Header"
import Sidebar from "./Sidebar"
import FloatingActions from "./FloatingActions"
import StatusBar from "./StatusBar"
import { useTheme } from "./ThemeProvider"
import styles from './AppLayout.module.css'

const SIDEBAR_STATE_STORAGE_KEY = 'sidebarMenuOpen'
const DESKTOP_BREAKPOINT = 768 // Мобильные устройства < 768px

interface AppLayoutProps {
  children: ReactNode
  pageTitle?: string
  userName?: string
  onLogout?: () => void
}

export default function AppLayout({
  children,
  pageTitle = "HR Helper",
  userName = "Голубенко Андрей",
  onLogout,
}: AppLayoutProps) {
  const pathname = usePathname()
  const isRecrChatPage = pathname?.startsWith('/recr-chat')
  
  // Проверяем, является ли устройство десктопом
  const isDesktop = () => {
    if (typeof window === 'undefined') return false
    return window.innerWidth >= DESKTOP_BREAKPOINT
  }

  // Инициализируем состояние меню: загружаем из localStorage только на десктопе
  const [menuOpen, setMenuOpen] = useState(() => {
    if (typeof window === 'undefined') return false
    
    // На мобильных устройствах всегда начинаем с закрытого меню
    if (!isDesktop()) {
      return false
    }

    // На десктопе загружаем сохраненное состояние
    try {
      const savedState = localStorage.getItem(SIDEBAR_STATE_STORAGE_KEY)
      return savedState === 'true'
    } catch (error) {
      console.error('Ошибка при загрузке состояния меню из localStorage:', error)
      return false
    }
  })

  const { theme, toggleTheme } = useTheme()

  // Сохраняем состояние меню в localStorage при изменении (только на десктопе)
  useEffect(() => {
    if (typeof window === 'undefined') return

    // На мобильных устройствах не сохраняем состояние
    if (window.innerWidth < DESKTOP_BREAKPOINT) {
      // На мобильных устройствах удаляем сохраненное состояние
      try {
        localStorage.removeItem(SIDEBAR_STATE_STORAGE_KEY)
      } catch (error) {
        // Игнорируем ошибки при удалении из localStorage
      }
      return
    }

    // На десктопе сохраняем состояние
    try {
      localStorage.setItem(SIDEBAR_STATE_STORAGE_KEY, String(menuOpen))
    } catch (error) {
      console.error('Ошибка при сохранении состояния меню в localStorage:', error)
    }
  }, [menuOpen])

  // Обработчик изменения размера окна: на мобильных закрываем меню
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleResize = () => {
      // Если переключились на мобильное устройство, закрываем меню
      if (window.innerWidth < DESKTOP_BREAKPOINT) {
        setMenuOpen((prev) => {
          // Если меню было открыто, закрываем его на мобильном устройстве
          if (prev) {
            // На мобильных не сохраняем состояние в localStorage
            try {
              localStorage.removeItem(SIDEBAR_STATE_STORAGE_KEY)
            } catch (error) {
              // Игнорируем ошибки при удалении из localStorage
            }
            return false
          }
          return prev
        })
      }
    }

    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, []) // Пустой массив зависимостей, так как функция handleResize проверяет window.innerWidth напрямую

  const handleLogout = () => {
    if (onLogout) {
      onLogout()
    } else {
      console.log('Выход из системы')
      // Здесь можно добавить логику выхода по умолчанию
    }
  }

  const handleMenuToggle = () => {
    setMenuOpen(!menuOpen)
  }

  return (
    <>
      <Header
        pageTitle={pageTitle}
        userName={userName}
        onMenuToggle={handleMenuToggle}
        onThemeToggle={toggleTheme}
        currentTheme={theme}
        menuOpen={menuOpen}
        onLogout={handleLogout}
      />
      {isRecrChatPage && <StatusBar />}
      <Sidebar isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      <FloatingActions />
      
      <Flex
        style={{
          marginTop: isRecrChatPage ? '112px' : '64px', // 64px (header) + 48px (status bar если есть)
          width: '100%',
          transition: 'all 0.2s ease-in-out',
        }}
      >
        <Box 
          className={styles.content}
          style={{ 
            padding: '24px 0',
            borderTop: '1px solid var(--gray-a6)',
            flex: 1,
            minWidth: 0,
            marginRight: menuOpen ? '280px' : '0',
            marginLeft: '24px', // Увеличенный отступ слева
            width: menuOpen ? 'calc(100% - 280px - 24px)' : 'calc(100% - 24px)',
            transition: 'margin-right 0.2s ease-in-out, width 0.2s ease-in-out',
          }}
        >
          {children}
        </Box>
      </Flex>
    </>
  )
}
