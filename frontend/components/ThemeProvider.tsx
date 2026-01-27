/**
 * ThemeProvider (components/ThemeProvider.tsx) - Провайдер темы приложения
 * 
 * Назначение:
 * - Управление темой приложения (светлая/темная)
 * - Управление акцентными цветами для светлой и темной темы
 * - Сохранение настроек темы в localStorage
 * - Определение системной темы при первой загрузке
 * - Применение темы к HTML и body элементам
 * 
 * Функциональность:
 * - Переключение между светлой и темной темой
 * - Сохранение выбранной темы в localStorage
 * - Загрузка сохраненной темы при монтировании
 * - Определение системной темы (prefers-color-scheme) если тема не сохранена
 * - Управление акцентными цветами для каждой темы отдельно
 * - Применение темы к document.documentElement и document.body
 * - Предотвращение hydration mismatch (mounted флаг)
 * 
 * Связи:
 * - AppLayout: использует useTheme для переключения темы
 * - Header: использует useTheme для отображения переключателя темы
 * - AccentColorSettings: использует useTheme для управления акцентными цветами
 * - Radix UI Theme: применяет тему и акцентный цвет к компонентам
 * 
 * Поведение:
 * - При первой загрузке: проверяет localStorage, если нет - использует системную тему
 * - При переключении темы: сохраняет в localStorage и применяет к DOM
 * - При изменении акцентного цвета: сохраняет в localStorage
 * - Применяет тему к HTML и body для глобального применения
 */

'use client'

import { Theme } from '@radix-ui/themes'
import { useState, useEffect, createContext, useContext, ReactNode } from 'react'
import type { AccentColorValue } from '@/components/profile/AccentColorSettings'

/**
 * ThemeMode - тип темы приложения
 * 
 * Варианты:
 * - 'light': светлая тема
 * - 'dark': темная тема
 */
type ThemeMode = 'light' | 'dark'

/**
 * ThemeContextType - интерфейс контекста темы
 * 
 * Структура:
 * - theme: текущая тема
 * - toggleTheme: функция переключения темы
 * - lightThemeAccentColor: акцентный цвет для светлой темы
 * - darkThemeAccentColor: акцентный цвет для темной темы
 * - setLightThemeAccentColor: функция установки акцентного цвета для светлой темы
 * - setDarkThemeAccentColor: функция установки акцентного цвета для темной темы
 */
interface ThemeContextType {
  theme: ThemeMode
  toggleTheme: () => void
  lightThemeAccentColor: AccentColorValue
  darkThemeAccentColor: AccentColorValue
  setLightThemeAccentColor: (color: AccentColorValue) => void
  setDarkThemeAccentColor: (color: AccentColorValue) => void
}

/**
 * ThemeContext - React Context для темы
 * 
 * Используется для:
 * - Предоставления темы и функций управления темой всем дочерним компонентам
 */
const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

/**
 * useTheme - хук для доступа к контексту темы
 * 
 * Функциональность:
 * - Возвращает контекст темы
 * - Выбрасывает ошибку, если используется вне ThemeProvider
 * 
 * Используется для:
 * - Получения текущей темы и функций управления темой в компонентах
 * 
 * @returns ThemeContextType - контекст темы
 * @throws Error если используется вне ThemeProvider
 */
export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}

/**
 * ThemeProviderProps - интерфейс пропсов компонента ThemeProvider
 * 
 * Структура:
 * - children: дочерние компоненты
 */
interface ThemeProviderProps {
  children: ReactNode
}

/**
 * ThemeProvider - провайдер темы приложения
 * 
 * Состояние:
 * - theme: текущая тема (light/dark)
 * - mounted: флаг монтирования компонента (для предотвращения hydration mismatch)
 * - lightThemeAccentColor: акцентный цвет для светлой темы
 * - darkThemeAccentColor: акцентный цвет для темной темы
 * 
 * Функциональность:
 * - Инициализация темы из localStorage или системной темы
 * - Применение темы к DOM элементам
 * - Управление акцентными цветами
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
  // Текущая тема (по умолчанию 'light' для SSR)
  const [theme, setTheme] = useState<ThemeMode>('light')
  /**
   * mounted - флаг монтирования компонента
   * 
   * Используется для:
   * - Предотвращения hydration mismatch (сервер рендерит с одной темой, клиент с другой)
   * - Применения темы к DOM только после монтирования
   */
  const [mounted, setMounted] = useState(false)
  // Акцентный цвет для светлой темы (по умолчанию 'crimson')
  const [lightThemeAccentColor, setLightThemeAccentColorState] = useState<AccentColorValue>('crimson')
  // Акцентный цвет для темной темы (по умолчанию 'crimson')
  const [darkThemeAccentColor, setDarkThemeAccentColorState] = useState<AccentColorValue>('crimson')

  /**
   * useEffect - инициализация темы при монтировании компонента
   * 
   * Функциональность:
   * - Загружает сохраненную тему из localStorage
   * - Если тема не сохранена - определяет системную тему (prefers-color-scheme)
   * - Загружает сохраненные акцентные цвета
   * - Применяет тему к DOM элементам
   * 
   * Поведение:
   * - Выполняется один раз при монтировании компонента
   * - Устанавливает mounted в true после инициализации
   * - Применяет тему к document.documentElement и document.body
   * - Устанавливает классы и стили для темы
   * 
   * Причина:
   * - Обеспечивает правильную инициализацию темы при загрузке страницы
   * - Восстанавливает сохраненные настройки пользователя
   */
  useEffect(() => {
    setMounted(true) // Устанавливаем флаг монтирования
    // Загружаем сохраненную тему из localStorage или используем системную
    const savedTheme = localStorage.getItem('theme') as ThemeMode
    let initialTheme: ThemeMode = 'light'
    
    if (savedTheme) {
      // Если тема сохранена - используем её
      initialTheme = savedTheme
    } else {
      // Если тема не сохранена - определяем системную тему
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      initialTheme = prefersDark ? 'dark' : 'light'
    }
    
    setTheme(initialTheme) // Устанавливаем тему

    // Загружаем сохраненные акцентные цвета из localStorage
    const savedLightAccent = localStorage.getItem('lightThemeAccentColor') as AccentColorValue
    const savedDarkAccent = localStorage.getItem('darkThemeAccentColor') as AccentColorValue
    
    if (savedLightAccent) {
      setLightThemeAccentColorState(savedLightAccent)
    }
    if (savedDarkAccent) {
      setDarkThemeAccentColorState(savedDarkAccent)
    }
    
    // Применяем тему к html и body элементам при первой загрузке
    if (typeof document !== 'undefined') {
      // Устанавливаем атрибуты и стили для темы
      document.documentElement.setAttribute('data-theme', initialTheme)
      document.documentElement.style.colorScheme = initialTheme
      document.body.setAttribute('data-theme', initialTheme)
      document.body.style.colorScheme = initialTheme
      
      // Применяем фон к body напрямую в зависимости от темы
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

  /**
   * toggleTheme - переключение темы
   * 
   * Функциональность:
   * - Инвертирует текущую тему (light <-> dark)
   * - Сохраняет новую тему в localStorage
   * - Применяет тему к DOM элементам
   * 
   * Поведение:
   * - Вызывается при клике на переключатель темы
   * - Сохраняет предпочтения пользователя в localStorage
   * - Немедленно применяет тему к DOM
   */
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light' // Инвертируем тему
    setTheme(newTheme) // Обновляем состояние
    localStorage.setItem('theme', newTheme) // Сохраняем в localStorage
    
    // Применяем тему к html и body элементам для глобального применения
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', newTheme)
      document.documentElement.style.colorScheme = newTheme
      document.body.setAttribute('data-theme', newTheme)
      document.body.style.colorScheme = newTheme
      
      // Применяем фон к body напрямую в зависимости от новой темы
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

  /**
   * useEffect - применение темы к DOM при изменении
   * 
   * Функциональность:
   * - Применяет текущую тему к DOM элементам при изменении theme или mounted
   * 
   * Поведение:
   * - Выполняется при изменении theme или mounted
   * - Применяет тему только после монтирования (mounted === true)
   * - Обновляет атрибуты, стили и классы для темы
   * 
   * Причина:
   * - Обеспечивает синхронизацию темы с DOM при изменении
   * - Предотвращает hydration mismatch (применяет только после монтирования)
   */
  useEffect(() => {
    if (mounted && typeof document !== 'undefined') {
      // Применяем текущую тему к html и body элементам
      document.documentElement.setAttribute('data-theme', theme)
      document.documentElement.style.colorScheme = theme
      document.body.setAttribute('data-theme', theme)
      document.body.style.colorScheme = theme
      
      // Применяем фон к body напрямую в зависимости от темы
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

  /**
   * setLightThemeAccentColor - установка акцентного цвета для светлой темы
   * 
   * Функциональность:
   * - Устанавливает акцентный цвет для светлой темы
   * - Сохраняет цвет в localStorage
   * 
   * Поведение:
   * - Вызывается из AccentColorSettings при изменении цвета
   * - Сохраняет предпочтения пользователя
   * 
   * @param color - новый акцентный цвет
   */
  const setLightThemeAccentColor = (color: AccentColorValue) => {
    setLightThemeAccentColorState(color) // Обновляем состояние
    localStorage.setItem('lightThemeAccentColor', color) // Сохраняем в localStorage
  }

  /**
   * setDarkThemeAccentColor - установка акцентного цвета для темной темы
   * 
   * Функциональность:
   * - Устанавливает акцентный цвет для темной темы
   * - Сохраняет цвет в localStorage
   * 
   * Поведение:
   * - Вызывается из AccentColorSettings при изменении цвета
   * - Сохраняет предпочтения пользователя
   * 
   * @param color - новый акцентный цвет
   */
  const setDarkThemeAccentColor = (color: AccentColorValue) => {
    setDarkThemeAccentColorState(color) // Обновляем состояние
    localStorage.setItem('darkThemeAccentColor', color) // Сохраняем в localStorage
  }

  /**
   * currentAccentColor - текущий акцентный цвет на основе активной темы
   * 
   * Логика:
   * - Если тема светлая - возвращает lightThemeAccentColor
   * - Если тема темная - возвращает darkThemeAccentColor
   * 
   * Используется для:
   * - Применения акцентного цвета к Radix UI Theme компоненту
   * 
   * Примечание:
   * - До mount используем дефолты, чтобы сервер и первый клиентский рендер совпадали
   * - Это предотвращает "missing bootstrap script" ошибку
   */
  const currentAccentColor = theme === 'light' ? lightThemeAccentColor : darkThemeAccentColor

  /**
   * Рендер компонента ThemeProvider
   * 
   * Структура:
   * - ThemeContext.Provider: предоставляет контекст темы дочерним компонентам
   * - Radix UI Theme: применяет тему и акцентный цвет к компонентам Radix UI
   * 
   * Параметры Radix UI Theme:
   * - accentColor: текущий акцентный цвет (зависит от темы)
   * - grayColor: цветовая палитра серого ("sand")
   * - radius: радиус скругления ("large")
   * - scaling: масштабирование (95%)
   * - appearance: тема (light/dark)
   */
  return (
    <ThemeContext.Provider 
      value={{ 
        theme, // Текущая тема
        toggleTheme, // Функция переключения темы
        lightThemeAccentColor, // Акцентный цвет для светлой темы
        darkThemeAccentColor, // Акцентный цвет для темной темы
        setLightThemeAccentColor, // Функция установки акцентного цвета для светлой темы
        setDarkThemeAccentColor // Функция установки акцентного цвета для темной темы
      }}
    >
      {/* Radix UI Theme компонент
          - Применяет тему и акцентный цвет ко всем компонентам Radix UI
          - Обеспечивает единообразный стиль во всем приложении */}
      <Theme 
        accentColor={currentAccentColor} // Текущий акцентный цвет (зависит от темы)
        grayColor="sand" // Цветовая палитра серого
        radius="large" // Радиус скругления
        scaling="95%" // Масштабирование компонентов
        appearance={theme} // Тема (light/dark)
      >
        {children}
      </Theme>
    </ThemeContext.Provider>
  )
}
