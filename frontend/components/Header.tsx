'use client'

import { Flex, Text, Box } from "@radix-ui/themes"
import { SunIcon, MoonIcon, PersonIcon, ExitIcon, LightningBoltIcon, BellIcon } from "@radix-ui/react-icons"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import GlobalSearch from "@/components/GlobalSearch/GlobalSearch"
import { useToast } from "@/components/Toast/ToastContext"
import styles from './Header.module.css'

const IN_DEV_TITLE = 'В разработке'
const IN_DEV_MESSAGE = 'Данная страница или функциональность в разработке.'
const IN_DEV_SEARCH_MESSAGE = 'Функция поиска в разработке.'

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
  const toast = useToast()
  const [userHover, setUserHover] = useState(false)
  const [logoutHover, setLogoutHover] = useState(false)
  const searchContainerRef = useRef<HTMLDivElement>(null)
  // Начальное значение = SSR, чтобы избежать hydration mismatch. После монтирования — по ОС.
  const [shortcutKey, setShortcutKey] = useState<'⌘K' | 'Ctrl+K'>('Ctrl+K')

  useEffect(() => {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
    setShortcutKey(isMac ? '⌘K' : 'Ctrl+K')
  }, [])

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
        {/* Глобальный поиск: запросы, сущности, скоуп */}
        <Box ref={searchContainerRef} style={{ position: 'relative', flex: 1, minWidth: 0, marginRight: '12px' }}>
          <GlobalSearch
            placeholder="Поиск..."
            shortcutHint={shortcutKey}
            dark={currentTheme === 'dark'}
            onSearch={() => toast.showInfo(IN_DEV_TITLE, IN_DEV_SEARCH_MESSAGE)}
            onEntityClick={() => toast.showInfo(IN_DEV_TITLE, IN_DEV_SEARCH_MESSAGE)}
          />
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
          onClick={() => toast.showInfo(IN_DEV_TITLE, IN_DEV_MESSAGE)}
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
