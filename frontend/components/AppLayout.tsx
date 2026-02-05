/**
 * AppLayout (components/AppLayout.tsx) - Основной layout компонент приложения
 * 
 * Назначение:
 * - Оборачивает все страницы приложения единым layout
 * - Управляет структурой страницы (Header, Sidebar, контент)
 * - Управляет состоянием бокового меню (открыто/закрыто)
 * - Адаптивная верстка для мобильных и десктопных устройств
 * - Сохранение состояния меню в localStorage
 * 
 * Функциональность:
 * - Header: верхняя панель с заголовком, поиском, уведомлениями, темой, пользователем
 * - Sidebar: боковое меню навигации (открывается/закрывается)
 * - FloatingActions: плавающие кнопки действий
 * - StatusBar: статусная панель (показывается только на странице recr-chat)
 * - Управление темой через ThemeProvider
 * - Адаптивное поведение меню (на мобильных всегда закрыто, на десктопе сохраняется состояние)
 * 
 * Связи:
 * - Header: отображает заголовок страницы, поиск, уведомления, переключатель темы
 * - Sidebar: боковое меню навигации
 * - FloatingActions: плавающие кнопки быстрых действий
 * - StatusBar: статусная панель для страницы recr-chat
 * - ThemeProvider: управление темой приложения
 * - usePathname: определение текущего пути для условного рендеринга
 * 
 * Поведение:
 * - На десктопе: меню может быть открыто/закрыто, состояние сохраняется в localStorage
 * - На мобильных: меню всегда закрыто при загрузке, не сохраняется в localStorage
 * - При изменении размера окна: если переключились на мобильное - меню закрывается
 * - На странице recr-chat: дополнительно показывается StatusBar
 * - Контент страницы отображается с отступом от Header (64px) и StatusBar (если есть)
 */

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

/**
 * SIDEBAR_STATE_STORAGE_KEY - ключ для сохранения состояния бокового меню в localStorage
 * 
 * Используется для:
 * - Сохранения состояния открыто/закрыто меню на десктопе
 * - Восстановления состояния при следующей загрузке страницы
 */
const SIDEBAR_STATE_STORAGE_KEY = 'sidebarMenuOpen'

/**
 * DESKTOP_BREAKPOINT - точка перелома для определения десктопных устройств
 * 
 * Используется для:
 * - Определения, является ли устройство десктопом или мобильным
 * - Адаптивного поведения меню (на мобильных всегда закрыто)
 * 
 * Значение: 768px (стандартная точка перелома для планшетов/десктопов)
 */
const DESKTOP_BREAKPOINT = 768 // Мобильные устройства < 768px

/**
 * AppLayoutProps - интерфейс пропсов компонента AppLayout
 * 
 * Структура:
 * - children: содержимое страницы (ReactNode)
 * - pageTitle: заголовок страницы (отображается в Header)
 * - userName: имя пользователя (отображается в Header)
 * - onLogout: обработчик выхода из системы (опционально)
 */
interface AppLayoutProps {
  children: ReactNode
  pageTitle?: string
  userName?: string
  onLogout?: () => void
  /** Контент слева от заголовка (например, бургер для админки) */
  leftHeaderContent?: ReactNode
}

/**
 * AppLayout - основной layout компонент приложения
 * 
 * Состояние:
 * - menuOpen: флаг открытости бокового меню
 * - theme: текущая тема приложения (light/dark)
 * 
 * Функциональность:
 * - Управляет состоянием бокового меню
 * - Сохраняет состояние меню в localStorage (только на десктопе)
 * - Адаптирует поведение меню для мобильных устройств
 * - Определяет, является ли текущая страница recr-chat (для показа StatusBar)
 */
export default function AppLayout({
  children,
  pageTitle = "HR Helper",
  userName = "Голубенко Андрей",
  onLogout,
  leftHeaderContent,
}: AppLayoutProps) {
  // Получение текущего пути для условного рендеринга
  const pathname = usePathname()
  // Проверка, является ли текущая страница recr-chat (для показа StatusBar)
  const isRecrChatPage = pathname?.startsWith('/recr-chat')
  
  /**
   * isDesktop - проверка, является ли устройство десктопом
   * 
   * Функциональность:
   * - Проверяет ширину окна браузера
   * - Возвращает true если ширина >= DESKTOP_BREAKPOINT
   * 
   * Используется для:
   * - Определения поведения меню (на мобильных всегда закрыто)
   * - Решения, сохранять ли состояние меню в localStorage
   * 
   * @returns true если устройство десктоп, false если мобильное
   */
  const isDesktop = () => {
    if (typeof window === 'undefined') return false // SSR: всегда false
    return window.innerWidth >= DESKTOP_BREAKPOINT
  }

  /**
   * menuOpen - состояние открытости бокового меню
   * 
   * Инициализация:
   * - На мобильных: всегда false (меню закрыто)
   * - На десктопе: загружается из localStorage (если есть сохраненное состояние)
   * 
   * Поведение:
   * - На десктопе: состояние сохраняется в localStorage
   * - На мобильных: состояние не сохраняется, всегда закрыто при загрузке
   */
  const [menuOpen, setMenuOpen] = useState(() => {
    if (typeof window === 'undefined') return false // SSR: всегда false
    
    // На мобильных устройствах всегда начинаем с закрытого меню
    if (!isDesktop()) {
      return false
    }

    // На десктопе загружаем сохраненное состояние из localStorage
    try {
      const savedState = localStorage.getItem(SIDEBAR_STATE_STORAGE_KEY)
      return savedState === 'true' // Преобразуем строку в boolean
    } catch (error) {
      console.error('Ошибка при загрузке состояния меню из localStorage:', error)
      return false // При ошибке возвращаем false
    }
  })

  // Хук для управления темой приложения
  const { theme, toggleTheme } = useTheme()

  /**
   * useEffect - сохранение состояния меню в localStorage при изменении
   * 
   * Функциональность:
   * - Сохраняет состояние меню в localStorage (только на десктопе)
   * - На мобильных устройствах удаляет сохраненное состояние
   * 
   * Поведение:
   * - Выполняется при изменении menuOpen
   * - На десктопе: сохраняет состояние в localStorage
   * - На мобильных: удаляет сохраненное состояние (чтобы не мешать при следующем заходе с десктопа)
   * 
   * Причина:
   * - Позволяет сохранять предпочтения пользователя на десктопе
   * - На мобильных меню всегда должно быть закрыто при загрузке
   */
  useEffect(() => {
    if (typeof window === 'undefined') return // SSR: пропускаем

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

  /**
   * useEffect - обработчик изменения размера окна
   * 
   * Функциональность:
   * - Отслеживает изменение размера окна браузера
   * - При переключении на мобильное устройство закрывает меню
   * 
   * Поведение:
   * - Выполняется один раз при монтировании компонента
   * - При уменьшении окна до мобильного размера (< 768px) закрывает меню
   * - Удаляет сохраненное состояние из localStorage при переключении на мобильное
   * 
   * Причина:
   * - Обеспечивает корректное поведение меню при изменении размера окна
   * - На мобильных меню должно быть закрыто
   */
  useEffect(() => {
    if (typeof window === 'undefined') return // SSR: пропускаем

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

  /**
   * handleLogout - обработчик выхода из системы
   * 
   * Функциональность:
   * - Вызывает переданный обработчик onLogout, если он есть
   * - Иначе выводит сообщение в консоль
   * 
   * Поведение:
   * - Вызывается при клике на кнопку выхода в Header
   * - Если передан onLogout - вызывает его
   * - Если не передан - выводит сообщение в консоль (для разработки)
   * 
   * Связи:
   * - Header: кнопка выхода вызывает эту функцию
   * - onLogout: опциональный обработчик из пропсов
   */
  const handleLogout = () => {
    if (onLogout) {
      onLogout()
    } else {
      console.log('Выход из системы')
      // Здесь можно добавить логику выхода по умолчанию
    }
  }

  /**
   * handleMenuToggle - обработчик переключения состояния меню
   * 
   * Функциональность:
   * - Переключает состояние menuOpen (открыто/закрыто)
   * 
   * Поведение:
   * - Вызывается при клике на кнопку меню в Header
   * - Инвертирует текущее состояние menuOpen
   * 
   * Связи:
   * - Header: кнопка меню вызывает эту функцию
   * - setMenuOpen: обновляет состояние меню
   */
  const handleMenuToggle = () => {
    setMenuOpen(!menuOpen)
  }

  /**
   * Рендер компонента AppLayout
   * 
   * Структура:
   * - Header: верхняя панель (фиксированная, высота 64px)
   * - StatusBar: статусная панель (только на странице recr-chat, высота 48px)
   * - Sidebar: боковое меню (открывается/закрывается)
   * - FloatingActions: плавающие кнопки действий
   * - children: содержимое страницы (с отступом от Header и StatusBar)
   */
  return (
    <>
      {/* Верхняя панель приложения
          - Отображает заголовок страницы, поиск, уведомления, переключатель темы, пользователя
          - Кнопка меню для открытия/закрытия Sidebar
          - Фиксированная позиция, высота 64px */}
      <Header
        pageTitle={pageTitle}
        userName={userName}
        onMenuToggle={handleMenuToggle}
        onThemeToggle={toggleTheme}
        currentTheme={theme}
        menuOpen={menuOpen}
        onLogout={handleLogout}
        leftContent={leftHeaderContent}
      />
      {/* Статусная панель (только на странице recr-chat)
          - Показывается только если текущая страница начинается с /recr-chat
          - Высота 48px, фиксированная позиция под Header */}
      {isRecrChatPage && <StatusBar />}
      {/* Боковое меню навигации
          - Открывается/закрывается через кнопку в Header
          - На мобильных закрывается при клике вне меню или при навигации
          - Состояние сохраняется в localStorage на десктопе */}
      <Sidebar isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      {/* Плавающие кнопки быстрых действий
          - Отображаются поверх контента
          - Предоставляют быстрый доступ к часто используемым функциям */}
      <FloatingActions />
      
      {/* Контейнер для содержимого страницы
          - marginTop: отступ от Header (64px) и StatusBar (48px если есть)
          - Переходы для плавной анимации при изменении размера */}
      <Flex
        style={{
          marginTop: isRecrChatPage ? '112px' : '64px', // 64px (header) + 48px (status bar если есть)
          width: '100%',
          transition: 'all 0.2s ease-in-out',
        }}
      >
        {/* Основной контент страницы
            - padding: вертикальные отступы для контента
            - borderTop: разделительная линия между Header и контентом */}
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
