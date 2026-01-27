/**
 * Header (components/Header.tsx) - Верхняя панель приложения
 * 
 * Назначение:
 * - Отображение заголовка текущей страницы
 * - Глобальный поиск по приложению
 * - Управление темой (светлая/темная)
 * - Уведомления
 * - Информация о пользователе и выход из системы
 * - Кнопка открытия/закрытия бокового меню
 * 
 * Функциональность:
 * - pageTitle: отображение заголовка текущей страницы
 * - GlobalSearch: глобальный поиск с поддержкой горячих клавиш (Cmd+S / Ctrl+S)
 * - Кнопка меню: открытие/закрытие Sidebar
 * - Кнопка уведомлений: отображение уведомлений (в разработке)
 * - Переключатель темы: переключение между светлой и темной темой
 * - Информация о пользователе: имя пользователя с переходом на профиль
 * - Кнопка выхода: выход из системы
 * 
 * Связи:
 * - AppLayout: получает пропсы и передает обработчики
 * - GlobalSearch: компонент глобального поиска
 * - useRouter: для навигации на страницу профиля
 * - useToast: для отображения уведомлений (в разработке)
 * - ThemeProvider: для управления темой
 * 
 * Поведение:
 * - Фиксированная позиция вверху страницы (position: fixed, top: 0)
 * - Высота 64px
 * - Горячие клавиши Cmd+S (Mac) / Ctrl+S (Windows/Linux) для фокуса на поиск
 * - При клике на имя пользователя - переход на страницу профиля
 * - При клике на кнопку выхода - вызов onLogout
 * - Адаптивная верстка для мобильных и десктопных устройств
 */

'use client'

import { Flex, Text, Box } from "@radix-ui/themes"
import { SunIcon, MoonIcon, PersonIcon, ExitIcon, LightningBoltIcon, BellIcon } from "@radix-ui/react-icons"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import GlobalSearch from "@/components/GlobalSearch/GlobalSearch"
import { useToast } from "@/components/Toast/ToastContext"
import styles from './Header.module.css'

/**
 * IN_DEV_TITLE - заголовок для уведомлений о функциях в разработке
 */
const IN_DEV_TITLE = 'В разработке'

/**
 * IN_DEV_MESSAGE - сообщение для уведомлений о функциях в разработке
 */
const IN_DEV_MESSAGE = 'Данная страница или функциональность в разработке.'

/**
 * IN_DEV_SEARCH_MESSAGE - сообщение для уведомления о поиске в разработке
 */
const IN_DEV_SEARCH_MESSAGE = 'Функция поиска в разработке.'

/**
 * HeaderProps - интерфейс пропсов компонента Header
 * 
 * Структура:
 * - pageTitle: заголовок текущей страницы
 * - userName: имя пользователя (опционально)
 * - onMenuToggle: обработчик открытия/закрытия меню (опционально)
 * - onThemeToggle: обработчик переключения темы
 * - currentTheme: текущая тема ('light' или 'dark')
 * - menuOpen: флаг открытости меню (опционально)
 * - onLogout: обработчик выхода из системы
 */
interface HeaderProps {
  pageTitle: string
  userName?: string
  onMenuToggle?: () => void
  onThemeToggle: () => void
  currentTheme: 'light' | 'dark'
  menuOpen?: boolean
  onLogout: () => void
}

/**
 * Header - компонент верхней панели приложения
 * 
 * Состояние:
 * - userHover: флаг наведения на область пользователя
 * - logoutHover: флаг наведения на кнопку выхода
 * - shortcutKey: текст горячей клавиши для поиска ('⌘S' для Mac, 'Ctrl+S' для Windows/Linux)
 */
export default function Header({ 
  pageTitle, 
  userName = "Голубенко Андрей",
  onMenuToggle,
  onThemeToggle,
  currentTheme,
  menuOpen = false,
  onLogout
}: HeaderProps) {
  // Хук Next.js для программной навигации
  const router = useRouter()
  // Хук для отображения уведомлений
  const toast = useToast()
  // Флаг наведения на область пользователя (для визуальной обратной связи)
  const [userHover, setUserHover] = useState(false)
  // Флаг наведения на кнопку выхода (для визуальной обратной связи)
  const [logoutHover, setLogoutHover] = useState(false)
  // Ref для контейнера поиска (для фокуса на input при нажатии горячих клавиш)
  const searchContainerRef = useRef<HTMLDivElement>(null)
  /**
   * shortcutKey - текст горячей клавиши для поиска
   * 
   * Инициализация:
   * - Начальное значение 'Ctrl+S' для SSR (избегаем hydration mismatch)
   * - После монтирования определяется по ОС (Mac: '⌘S', Windows/Linux: 'Ctrl+S')
   */
  const [shortcutKey, setShortcutKey] = useState<'⌘S' | 'Ctrl+S'>('Ctrl+S')

  /**
   * useEffect - определение горячей клавиши по операционной системе
   * 
   * Функциональность:
   * - Определяет, является ли устройство Mac
   * - Устанавливает соответствующую горячую клавишу
   * 
   * Поведение:
   * - Выполняется один раз при монтировании компонента
   * - Проверяет navigator.platform для определения ОС
   * - Устанавливает '⌘S' для Mac, 'Ctrl+S' для других ОС
   */
  useEffect(() => {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
    setShortcutKey(isMac ? '⌘S' : 'Ctrl+S')
  }, [])

  /**
   * firstName - извлечение имени из полного имени пользователя
   * 
   * Функциональность:
   * - Извлекает второе слово из полного имени (например, "Андрей" из "Голубенко Андрей")
   * - Если второе слово отсутствует - использует полное имя
   * 
   * Используется для:
   * - Отображения имени пользователя в Header
   */
  const firstName = userName.split(' ')[1] || userName

  /**
   * handleUserClick - обработчик клика на имя пользователя
   * 
   * Функциональность:
   * - Сохраняет активную вкладку "Профиль" в localStorage
   * - Переходит на страницу профиля
   * 
   * Поведение:
   * - Вызывается при клике на имя пользователя в Header
   * - Сохраняет 'profile' в localStorage для восстановления вкладки при загрузке профиля
   * - Выполняет навигацию на /profile
   * 
   * Связи:
   * - router.push: выполняет навигацию
   * - localStorage: сохраняет активную вкладку
   * - profile/page.tsx: страница профиля, которая читает активную вкладку из localStorage
   */
  const handleUserClick = () => {
    // Сохраняем активную вкладку "Профиль" в localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('profileActiveTab', 'profile')
    }
    // Переходим на страницу профиля
    router.push('/profile')
  }

  /**
   * useEffect - обработчик горячих клавиш для поиска
   * 
   * Функциональность:
   * - Обрабатывает комбинацию Cmd+S (Mac) или Ctrl+S (Windows/Linux)
   * - Фокусирует input поиска и выделяет текст
   * 
   * Поведение:
   * - Выполняется один раз при монтировании компонента
   * - Слушает событие keydown на window
   * - При нажатии Cmd+S / Ctrl+S:
   *   - Предотвращает стандартное поведение браузера (сохранение страницы)
   *   - Находит input в контейнере поиска
   *   - Фокусирует input
   *   - Выделяет весь текст в input (если есть)
   * 
   * Связи:
   * - searchContainerRef: ref контейнера поиска для доступа к input
   * - GlobalSearch: компонент поиска, содержащий input
   * 
   * Примечание:
   * - Cmd+K теперь используется для вставки ссылок в RichTextInput
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Проверяем комбинацию Cmd+S (Mac) или Ctrl+S (Windows/Linux)
      // Используем e.code для работы независимо от раскладки клавиатуры
      if ((e.metaKey || e.ctrlKey) && e.code === 'KeyS') {
        // Предотвращаем стандартное поведение браузера (сохранение страницы)
        e.preventDefault()
        
        // Находим input внутри контейнера поиска
        if (searchContainerRef.current) {
          const input = searchContainerRef.current.querySelector('input') as HTMLInputElement
          if (input) {
            input.focus() // Фокусируем input
            // Выделяем весь текст, если он есть (для быстрого удаления/замены)
            input.select()
          }
        }
      }
    }

    // Добавляем обработчик события на window
    window.addEventListener('keydown', handleKeyDown)

    // Удаляем обработчик при размонтировании компонента (cleanup)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])
  /**
   * Рендер компонента Header
   * 
   * Структура:
   * - Левая часть: заголовок страницы и глобальный поиск
   * - Правая часть: кнопка меню, уведомления, переключатель темы, пользователь/выход
   * 
   * Стили:
   * - Фиксированная позиция вверху страницы
   * - Высота 64px
   * - z-index 1000 (поверх контента)
   * - Адаптивный фон в зависимости от темы
   */
  return (
    <header
      id="app-header"
      style={{
        position: 'fixed', // Фиксированная позиция вверху страницы
        top: 0,
        left: 0,
        right: 0,
        height: '64px', // Фиксированная высота Header
        backgroundColor: currentTheme === 'dark' 
          ? 'var(--gray-2)' // Темный фон для темной темы
          : '#ffffff', // Белый фон для светлой темы
        borderBottom: '1px solid var(--gray-a6)', // Разделительная линия снизу
        zIndex: 1000, // Поверх контента страницы
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px', // Горизонтальные отступы
        backdropFilter: 'none',
      }}
    >
      <Flex align="center" justify="between" width="100%">
      {/* Левая часть: название страницы и форма поиска
          - Заголовок страницы (pageTitle)
          - Глобальный поиск с поддержкой горячих клавиш */}
      <Flex align="center" gap="3" style={{ flex: 1, minWidth: 0 }}>
        {/* Заголовок текущей страницы
            - Отображает pageTitle из пропсов
            - flexShrink: 0 - не сжимается при нехватке места */}
        <Text size="5" weight="bold" className={styles.pageTitle} style={{ flexShrink: 0 }}>
          {pageTitle}
        </Text>
        {/* Глобальный поиск: запросы, сущности, скоуп
            - Компонент GlobalSearch с поддержкой горячих клавиш
            - ref для доступа к input при нажатии Cmd+S / Ctrl+S
            - flex: 1 - занимает оставшееся пространство
            - minWidth: 0 - позволяет сжиматься при нехватке места */}
        <Box ref={searchContainerRef} style={{ position: 'relative', flex: 1, minWidth: 0, marginRight: '12px' }}>
          <GlobalSearch
            placeholder="Поиск..."
            shortcutHint={shortcutKey} // Подсказка горячей клавиши (⌘S или Ctrl+S)
            dark={currentTheme === 'dark'} // Темная тема для поиска
            onSearch={() => toast.showInfo(IN_DEV_TITLE, IN_DEV_SEARCH_MESSAGE)} // TODO: Реализовать поиск
            onEntityClick={() => toast.showInfo(IN_DEV_TITLE, IN_DEV_SEARCH_MESSAGE)} // TODO: Реализовать клик по сущности
          />
        </Box>
      </Flex>

      {/* Правая часть: меню, уведомления, тема и объединенная кнопка пользователя/выхода
          - flexShrink: 0 - не сжимается при нехватке места */}
      <Flex align="center" gap="3" style={{ flexShrink: 0 }}>
        {/* Кнопка меню с молнией
            - Открывает/закрывает боковое меню (Sidebar)
            - data-tour: атрибут для тура по приложению
            - title: подсказка при наведении (меняется в зависимости от состояния меню) */}
        <Box
          data-tour="header-menu"
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

        {/* Кнопка уведомлений
            - Показывает уведомления (в разработке)
            - При клике показывает toast с сообщением "В разработке" */}
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

        {/* Кнопка выбора темы
            - Переключает между светлой и темной темой
            - data-tour: атрибут для тура по приложению
            - Иконка меняется в зависимости от текущей темы (Moon для светлой, Sun для темной)
            - title: подсказка при наведении (меняется в зависимости от темы) */}
        <Box
          data-tour="header-theme"
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

        {/* Объединенная кнопка пользователя и выхода
            - Состоит из двух частей: пользователь (слева) и выход (справа)
            - Разделительная линия между частями
            - Адаптивный фон при наведении */}
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
          {/* Левая часть: пользователь с email
              - Отображает имя пользователя (полное и сокращенное)
              - При клике переходит на страницу профиля
              - data-tour: атрибут для тура по приложению
              - Адаптивный фон при наведении (синий оттенок)
              - borderRight: разделительная линия между пользователем и выходом */}
          <Flex
            data-tour="header-profile"
            align="center"
            gap="2"
            px="3"
            onMouseEnter={() => setUserHover(true)} // Устанавливаем флаг наведения
            onMouseLeave={() => setUserHover(false)} // Сбрасываем флаг наведения
            style={{
              backgroundColor: userHover 
                ? (currentTheme === 'dark' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.1)') // Синий фон при наведении
                : 'transparent',
              borderRight: '1px solid var(--gray-a6)', // Разделительная линия справа
              cursor: 'pointer',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              transition: 'background-color 0.2s ease-in-out', // Плавный переход фона
            }}
            onClick={handleUserClick} // Переход на страницу профиля
          >
            <PersonIcon width={16} height={16} style={{ color: '#3b82f6', flexShrink: 0 }} />
            {/* Полное имя пользователя (скрывается на мобильных через CSS) */}
            <Text size="2" className={styles.userFullName} style={{ color: '#3b82f6', whiteSpace: 'nowrap', fontWeight: 400 }}>
              {userName}
            </Text>
            {/* Сокращенное имя пользователя (показывается на мобильных через CSS) */}
            <Text size="2" className={styles.userName} style={{ color: '#3b82f6', whiteSpace: 'nowrap', fontWeight: 400 }}>
              {firstName}
            </Text>
          </Flex>

          {/* Правая часть: выход
              - Кнопка выхода из системы
              - data-tour: атрибут для тура по приложению
              - Адаптивный фон при наведении (красный оттенок)
              - borderLeft: разделительная линия между выходом и пользователем */}
          <Flex
            data-tour="header-logout"
            align="center"
            gap="2"
            px="3"
            className={styles.logoutButton}
            onMouseEnter={() => setLogoutHover(true)} // Устанавливаем флаг наведения
            onMouseLeave={() => setLogoutHover(false)} // Сбрасываем флаг наведения
            onClick={onLogout} // Вызов обработчика выхода
            style={{
              backgroundColor: logoutHover 
                ? (currentTheme === 'dark' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.1)') // Красный фон при наведении
                : 'transparent',
              borderLeft: '1px solid var(--gray-a6)', // Разделительная линия слева
              cursor: 'pointer',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              transition: 'background-color 0.2s ease-in-out', // Плавный переход фона
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
