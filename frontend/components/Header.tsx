'use client'

import { Flex, Button, Text, Box } from "@radix-ui/themes"
import { SunIcon, MoonIcon, PersonIcon, ExitIcon, HamburgerMenuIcon, ChevronLeftIcon } from "@radix-ui/react-icons"
import { useState } from "react"
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
  const [userHover, setUserHover] = useState(false)
  const [logoutHover, setLogoutHover] = useState(false)
  
  // Извлекаем имя из полного имени (второе слово)
  const firstName = userName.split(' ')[1] || userName
  return (
    <header
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
      {/* Левая часть: кнопка меню и название страницы */}
      <Flex align="center" gap="3">
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
          {menuOpen ? (
            <ChevronLeftIcon width="16" height="16" style={{ color: 'var(--gray-12)' }} />
          ) : (
            <HamburgerMenuIcon width="16" height="16" style={{ color: 'var(--gray-12)' }} />
          )}
        </Box>
        <Text size="5" weight="bold" className={styles.pageTitle}>
          {pageTitle}
        </Text>
      </Flex>

      {/* Правая часть: тема и объединенная кнопка пользователя/выхода */}
      <Flex align="center" gap="3">
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
            <MoonIcon width="16" height="16" style={{ color: 'var(--gray-12)' }} />
          ) : (
            <SunIcon width="16" height="16" style={{ color: 'var(--gray-12)' }} />
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
            onClick={() => {}}
          >
            <PersonIcon width="16" height="16" style={{ color: '#3b82f6', flexShrink: 0 }} />
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
            <ExitIcon width="16" height="16" style={{ color: '#ef4444', flexShrink: 0 }} />
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
