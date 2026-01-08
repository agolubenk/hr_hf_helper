'use client'

import { Box, Flex } from "@radix-ui/themes"
import { useState, ReactNode } from "react"
import Header from "./Header"
import Sidebar from "./Sidebar"
import FloatingActions from "./FloatingActions"
import { useTheme } from "./ThemeProvider"
import styles from './AppLayout.module.css'

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
  const [menuOpen, setMenuOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()

  const handleLogout = () => {
    if (onLogout) {
      onLogout()
    } else {
      console.log('Выход из системы')
      // Здесь можно добавить логику выхода по умолчанию
    }
  }

  return (
    <>
      <Header
        pageTitle={pageTitle}
        userName={userName}
        onMenuToggle={() => setMenuOpen(!menuOpen)}
        onThemeToggle={toggleTheme}
        currentTheme={theme}
        menuOpen={menuOpen}
        onLogout={handleLogout}
      />
      <Sidebar isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      <FloatingActions />
      
      <Box 
        className={`${styles.content} ${menuOpen ? styles.contentWithMenu : ''}`}
        style={{ 
          marginTop: '64px', 
          padding: '24px 0',
          borderTop: '1px solid var(--gray-a6)',
          width: '100%',
        }}
      >
        {children}
      </Box>
    </>
  )
}
