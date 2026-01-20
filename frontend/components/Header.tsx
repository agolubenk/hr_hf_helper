'use client'

import { Flex, Button, Text, Box, TextField } from "@radix-ui/themes"
import { SunIcon, MoonIcon, PersonIcon, ExitIcon, LightningBoltIcon, MagnifyingGlassIcon, BellIcon } from "@radix-ui/react-icons"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import styles from './Header.module.css'

interface HeaderProps {
  pageTitle: string
  userName?: string
  onMenuToggle?: () => void
  onThemeToggle: () => void
  currentTheme: 'light' | 'dark'
  menuOpen?: boolean
  onLogout: () => void
}

export default function Header({ 
  pageTitle, 
  userName = "Голубенко Андрей",
  onMenuToggle,
  onThemeToggle,
  currentTheme,
  menuOpen = false,
  onLogout
}: HeaderProps) {
  const router = useRouter()
  const [userHover, setUserHover] = useState(false)
  const [logoutHover, setLogoutHover] = useState(false)
  const searchContainerRef = useRef<HTMLDivElement>(null)
  
  // Определяем, какая ОС используется для отображения правильной комбинации клавиш
  const isMac = typeof window !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0
  const shortcutKey = isMac ? '⌘K' : 'Ctrl+K'
  
  // Извлекаем имя из полного имени (второе слово)
  const firstName = userName.split(' ')[1] || userName

  // Обработчик клика на имя пользователя - переход на страницу профиля
  const handleUserClick = () => {
    // Сохраняем активную вкладку "Профиль" в localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('profileActiveTab', 'profile')
    }
    // Переходим на страницу профиля
    router.push('/profile')
  }

  // Обработчик горячих клавиш для поиска (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Проверяем комбинацию Cmd+K (Mac) или Ctrl+K (Windows/Linux)
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        // Предотвращаем стандартное поведение браузера
        e.preventDefault()
        
        // Находим input внутри контейнера поиска
        if (searchContainerRef.current) {
          const input = searchContainerRef.current.querySelector('input') as HTMLInputElement
          if (input) {
            input.focus()
            // Выделяем весь текст, если он есть
            input.select()
          }
        }
      }
    }

    // Добавляем обработчик события
    window.addEventListener('keydown', handleKeyDown)

    // Удаляем обработчик при размонтировании компонента
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])
  return (
    <header
      id="app-header"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '64px',
        backgroundColor: currentTheme === 'dark' 
          ? 'var(--gray-2)' 
          : '#ffffff',
        borderBottom: '1px solid var(--gray-a6)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        backdropFilter: 'none',
      }}
    >
      <Flex align="center" justify="between" width="100%">
      {/* Левая часть: название страницы и форма поиска */}
      <Flex align="center" gap="3" style={{ flex: 1, minWidth: 0 }}>
        <Text size="5" weight="bold" className={styles.pageTitle} style={{ flexShrink: 0 }}>
          {pageTitle}
        </Text>
        {/* Форма поиска - занимает всю доступную ширину */}
        <Box ref={searchContainerRef} style={{ position: 'relative', flex: 1, minWidth: 0, marginRight: '12px' }}>
          <TextField.Root
            placeholder="Поиск..."
            style={{
              width: '100%',
              height: '34px',
            }}
          >
            <TextField.Slot>
              <MagnifyingGlassIcon width={16} height={16} />
            </TextField.Slot>
            <TextField.Slot side="right" style={{ paddingRight: '8px' }}>
              <Box
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  backgroundColor: currentTheme === 'dark' ? 'var(--gray-4)' : 'var(--gray-3)',
                  border: '1px solid var(--gray-a6)',
                  fontSize: '11px',
                  lineHeight: 1,
                  color: 'var(--gray-11)',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  fontWeight: 500,
                  userSelect: 'none',
                  pointerEvents: 'none',
                }}
                title={`Нажмите ${shortcutKey} для поиска`}
              >
                {shortcutKey}
              </Box>
            </TextField.Slot>
          </TextField.Root>
        </Box>
      </Flex>

      {/* Правая часть: меню, уведомления, тема и объединенная кнопка пользователя/выхода */}
      <Flex align="center" gap="3" style={{ flexShrink: 0 }}>
        {/* Кнопка меню с молнией */}
        <Box
          onClick={onMenuToggle}
          style={{
            cursor: 'pointer',
            backgroundColor: 'transparent',
            border: '1px solid var(--gray-a6)',
            borderRadius: '6px',
            padding: '6px 8px',
            height: '34px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
          title={menuOpen ? 'Закрыть меню' : 'Открыть меню'}
        >
          <LightningBoltIcon width={16} height={16} style={{ color: 'var(--gray-12)' }} />
        </Box>

        {/* Кнопка уведомлений */}
        <Box
          onClick={() => {
            // TODO: Добавить обработчик уведомлений
            console.log('Notifications clicked')
          }}
          style={{
            cursor: 'pointer',
            backgroundColor: 'transparent',
            border: '1px solid var(--gray-a6)',
            borderRadius: '6px',
            padding: '6px 8px',
            height: '34px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
          title="Уведомления"
        >
          <BellIcon width={16} height={16} style={{ color: 'var(--gray-12)' }} />
        </Box>

        {/* Кнопка выбора темы */}
        <Box
          onClick={onThemeToggle}
          style={{
            cursor: 'pointer',
            backgroundColor: 'transparent',
            border: '1px solid var(--gray-a6)',
            borderRadius: '6px',
            padding: '6px 8px',
            height: '34px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
          title={currentTheme === 'light' ? 'Переключить на темную тему' : 'Переключить на светлую тему'}
        >
          {currentTheme === 'light' ? (
            <MoonIcon width={16} height={16} style={{ color: 'var(--gray-12)' }} />
          ) : (
            <SunIcon width={16} height={16} style={{ color: 'var(--gray-12)' }} />
          )}
        </Box>

        {/* Объединенная кнопка пользователя и выхода */}
        <Flex
          align="center"
          style={{
            border: '1px solid var(--gray-a6)',
            borderRadius: '6px',
            overflow: 'hidden',
            backgroundColor: 'transparent',
            height: '34px',
          }}
        >
          {/* Левая часть: пользователь с email */}
          <Flex
            align="center"
            gap="2"
            px="3"
            onMouseEnter={() => setUserHover(true)}
            onMouseLeave={() => setUserHover(false)}
            style={{
              backgroundColor: userHover 
                ? (currentTheme === 'dark' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.1)')
                : 'transparent',
              borderRight: '1px solid var(--gray-a6)',
              cursor: 'pointer',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              transition: 'background-color 0.2s ease-in-out',
            }}
            onClick={handleUserClick}
          >
            <PersonIcon width={16} height={16} style={{ color: '#3b82f6', flexShrink: 0 }} />
            <Text size="2" className={styles.userFullName} style={{ color: '#3b82f6', whiteSpace: 'nowrap', fontWeight: 400 }}>
              {userName}
            </Text>
            <Text size="2" className={styles.userName} style={{ color: '#3b82f6', whiteSpace: 'nowrap', fontWeight: 400 }}>
              {firstName}
            </Text>
          </Flex>

          {/* Правая часть: выход */}
          <Flex
            align="center"
            gap="2"
            px="3"
            className={styles.logoutButton}
            onMouseEnter={() => setLogoutHover(true)}
            onMouseLeave={() => setLogoutHover(false)}
            onClick={onLogout}
            style={{
              backgroundColor: logoutHover 
                ? (currentTheme === 'dark' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.1)')
                : 'transparent',
              borderLeft: '1px solid var(--gray-a6)',
              cursor: 'pointer',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              transition: 'background-color 0.2s ease-in-out',
            }}
          >
            <ExitIcon width={16} height={16} style={{ color: '#ef4444', flexShrink: 0 }} />
            <Text size="2" className={styles.logoutText} style={{ color: '#ef4444', whiteSpace: 'nowrap', fontWeight: 400 }}>
              Выход
            </Text>
          </Flex>
        </Flex>
      </Flex>
      </Flex>
    </header>
  )
}
