'use client'

import { Theme } from '@radix-ui/themes'
import { useState, useEffect, createContext, useContext, ReactNode } from 'react'

type ThemeMode = 'light' | 'dark'

interface ThemeContextType {
  theme: ThemeMode
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}

interface ThemeProviderProps {
  children: ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<ThemeMode>('light')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Загружаем сохраненную тему из localStorage или используем системную
    const savedTheme = localStorage.getItem('theme') as ThemeMode
    let initialTheme: ThemeMode = 'light'
    
    if (savedTheme) {
      initialTheme = savedTheme
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      initialTheme = prefersDark ? 'dark' : 'light'
    }
    
    setTheme(initialTheme)
    
    // Применяем тему к html и body элементам при первой загрузке
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', initialTheme)
      document.documentElement.style.colorScheme = initialTheme
      document.body.setAttribute('data-theme', initialTheme)
      document.body.style.colorScheme = initialTheme
      
      // Применяем фон к body напрямую
      if (initialTheme === 'dark') {
        document.body.style.backgroundColor = 'var(--gray-1, #1c1c1f)'
        document.body.style.color = 'var(--gray-12, #ffffff)'
        document.body.classList.add('dark-theme')
        document.body.classList.remove('light-theme')
      } else {
        document.body.style.backgroundColor = '#ffffff'
        document.body.style.color = '#000000'
        document.body.classList.add('light-theme')
        document.body.classList.remove('dark-theme')
      }
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    
    // Применяем тему к html и body элементам для глобального применения
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', newTheme)
      document.documentElement.style.colorScheme = newTheme
      document.body.setAttribute('data-theme', newTheme)
      document.body.style.colorScheme = newTheme
      
      // Применяем фон к body напрямую
      if (newTheme === 'dark') {
        document.body.style.backgroundColor = 'var(--gray-1, #1c1c1f)'
        document.body.style.color = 'var(--gray-12, #ffffff)'
        document.body.classList.add('dark-theme')
        document.body.classList.remove('light-theme')
      } else {
        document.body.style.backgroundColor = '#ffffff'
        document.body.style.color = '#000000'
        document.body.classList.add('light-theme')
        document.body.classList.remove('dark-theme')
      }
    }
  }

  useEffect(() => {
    if (mounted && typeof document !== 'undefined') {
      // Применяем текущую тему к html и body элементам
      document.documentElement.setAttribute('data-theme', theme)
      document.documentElement.style.colorScheme = theme
      document.body.setAttribute('data-theme', theme)
      document.body.style.colorScheme = theme
      
      // Применяем фон к body напрямую
      if (theme === 'dark') {
        document.body.style.backgroundColor = 'var(--gray-1, #1c1c1f)'
        document.body.style.color = 'var(--gray-12, #ffffff)'
        document.body.classList.add('dark-theme')
        document.body.classList.remove('light-theme')
      } else {
        document.body.style.backgroundColor = '#ffffff'
        document.body.style.color = '#000000'
        document.body.classList.add('light-theme')
        document.body.classList.remove('dark-theme')
      }
    }
  }, [theme, mounted])

  if (!mounted) {
    return null
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <Theme 
        accentColor="crimson" 
        grayColor="sand" 
        radius="large" 
        scaling="95%"
        appearance={theme}
      >
        {children}
      </Theme>
    </ThemeContext.Provider>
  )
}
