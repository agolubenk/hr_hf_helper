/**
 * FloatingActions (components/FloatingActions.tsx) - Плавающие кнопки быстрых действий
 * 
 * Назначение:
 * - Быстрый доступ к часто используемым функциям
 * - Настраиваемые быстрые кнопки (ссылки, текст, дата/время)
 * - Кнопка прокрутки страницы вверх
 * - Кнопка настроек быстрых кнопок
 * - Закрепление/открепление панели
 * 
 * Функциональность:
 * - Быстрые кнопки: настраиваемые кнопки для быстрого доступа (ссылки, копирование текста/даты)
 * - Кнопка "Вверх": плавная прокрутка страницы в самый верх
 * - Кнопка "Настройки": переход на страницу настроек быстрых кнопок
 * - Кнопка "Закрепить": закрепление/открепление панели
 * - Невидимая зона срабатывания: показ панели при наведении на левый край экрана
 * - Сохранение состояния в localStorage (закрепление, видимость кнопок)
 * - Синхронизация состояния между вкладками браузера
 * 
 * Связи:
 * - AppLayout: отображается на всех страницах
 * - useRouter: для навигации на страницу настроек
 * - usePathname: для определения отступа сверху (recr-chat имеет StatusBar)
 * - ThemeProvider: для получения текущей темы
 * - localStorage: сохранение состояния закрепления и видимости кнопок
 * - CustomEvent: синхронизация состояния между вкладками
 * 
 * Поведение:
 * - По умолчанию скрыта, появляется при наведении на левый край экрана
 * - При закреплении всегда видна
 * - При выключении быстрых кнопок скрывается (если не закреплена)
 * - Кнопки можно включать/выключать в настройках профиля
 * - Состояние синхронизируется между вкладками браузера
 */

'use client'

import { Flex, Box, Separator } from "@radix-ui/themes"
import { PinRightIcon, GearIcon } from "@radix-ui/react-icons"
import {
  LightningBoltIcon,
  CalendarIcon,
  EnvelopeClosedIcon,
  PaperPlaneIcon,
  ClockIcon,
  ArrowUpIcon,
} from "@radix-ui/react-icons"
import { useState, useEffect, useRef, ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useTheme } from "./ThemeProvider"

/**
 * PinUnpinnedIcon - иконка для не зафиксированного состояния (drawing pin)
 * 
 * Используется для:
 * - Отображения иконки "закрепить" когда панель не закреплена
 * - Визуального отличия закрепленного и незакрепленного состояния
 * 
 * @param width - ширина иконки (по умолчанию 15)
 * @param height - высота иконки (по умолчанию 15)
 * @param color - цвет иконки (по умолчанию 'currentColor')
 */
const PinUnpinnedIcon = ({ width = 15, height = 15, color = 'currentColor' }: { width?: number; height?: number; color?: string }) => (
  <svg width={width} height={height} viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10.3285 1.13607C10.1332 0.940809 9.81662 0.940808 9.62136 1.13607C9.42609 1.33133 9.42609 1.64792 9.62136 1.84318L10.2744 2.49619L5.42563 6.13274L4.31805 5.02516C4.12279 4.8299 3.80621 4.8299 3.61095 5.02516C3.41569 5.22042 3.41569 5.537 3.61095 5.73226L5.02516 7.14648L6.08582 8.20714L2.81545 11.4775C2.62019 11.6728 2.62019 11.9894 2.81545 12.1846C3.01072 12.3799 3.3273 12.3799 3.52256 12.1846L6.79293 8.91425L7.85359 9.97491L9.2678 11.3891C9.46306 11.5844 9.77965 11.5844 9.97491 11.3891C10.1702 11.1939 10.1702 10.8773 9.97491 10.682L8.86733 9.57443L12.5039 4.7257L13.1569 5.37871C13.3522 5.57397 13.6687 5.57397 13.864 5.37871C14.0593 5.18345 14.0593 4.86687 13.864 4.6716L12.8033 3.61094L11.3891 2.19673L10.3285 1.13607ZM6.13992 6.84702L10.9887 3.21047L11.7896 4.01142L8.15305 8.86015L6.13992 6.84702Z" fill={color} fillRule="evenodd" clipRule="evenodd" />
  </svg>
)

/**
 * PinLeftIcon - иконка для зафиксированного состояния (стрелка влево, упирающаяся в вертикальную линию)
 * 
 * Используется для:
 * - Отображения иконки "открепить" когда панель закреплена
 * - Визуального отличия закрепленного и незакрепленного состояния
 * 
 * @param width - ширина иконки (по умолчанию 20)
 * @param height - высота иконки (по умолчанию 20)
 * @param color - цвет иконки (по умолчанию 'currentColor')
 */
const PinLeftIcon = ({ width = 20, height = 20, color = 'currentColor' }: { width?: number; height?: number; color?: string }) => (
  <svg width={width} height={height} viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Вертикальная линия справа (символизирует закрепление) */}
    <path d="M12 1V14" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    {/* Стрелка влево (символизирует открепление) */}
    <path d="M8 4L4 7.5L8 11" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
)

/**
 * iconComponents - маппинг имен иконок на компоненты
 * 
 * Используется для:
 * - Динамического рендеринга иконок для быстрых кнопок
 * - Преобразования строковых имен иконок в React компоненты
 */
const iconComponents: Record<string, React.ComponentType<{ width?: number | string; height?: number | string }>> = {
  LightningBoltIcon,
  CalendarIcon,
  EnvelopeClosedIcon,
  PaperPlaneIcon,
  ClockIcon,
}

/**
 * quickButtonsData - данные быстрых кнопок (по умолчанию)
 * 
 * Структура каждой кнопки:
 * - id: уникальный идентификатор кнопки
 * - name: название кнопки
 * - icon: имя иконки (из iconComponents)
 * - color: цвет фона кнопки
 * - type: тип кнопки ('link', 'text', 'datetime')
 * - value: значение (URL для link, текст для text, дата/время для datetime)
 * 
 * Типы кнопок:
 * - 'link': открывает ссылку в новой вкладке
 * - 'text': копирует текст в буфер обмена
 * - 'datetime': копирует дату/время в буфер обмена
 * 
 * TODO: Загружать из настроек пользователя или API
 */
const quickButtonsData = [
  {
    id: '1',
    name: 'Huntflow',
    icon: 'LightningBoltIcon',
    color: '#3b82f6',
    type: 'link' as const,
    value: 'https://huntflow.ru',
  },
  {
    id: '2',
    name: 'Календарь встреч',
    icon: 'CalendarIcon',
    color: '#10b981',
    type: 'link' as const,
    value: 'https://calendar.google.com',
  },
  {
    id: '3',
    name: 'Email',
    icon: 'EnvelopeClosedIcon',
    color: '#f59e0b',
    type: 'link' as const,
    value: 'mailto:andrei.golubenko@softnetix.io',
  },
  {
    id: '4',
    name: 'Телеграм',
    icon: 'PaperPlaneIcon',
    color: '#06b6d4',
    type: 'link' as const,
    value: 'https://t.me/talent_softnetix',
  },
  {
    id: '5',
    name: 'Рабочий график',
    icon: 'ClockIcon',
    color: '#8b5cf6',
    type: 'text' as const,
    value: '11:00 - 18:30',
  },
  {
    id: '6',
    name: 'Следующая встреча',
    icon: 'CalendarIcon',
    color: '#ef4444',
    type: 'datetime' as const,
    value: '2026-01-15T14:00',
  },
]

/**
 * renderIcon - рендеринг иконки на основе имени
 * 
 * Функциональность:
 * - Преобразует строковое имя иконки в React компонент
 * - Возвращает null если иконка не найдена
 * 
 * Используется для:
 * - Отображения иконок быстрых кнопок
 * 
 * @param iconName - имя иконки (ключ из iconComponents)
 * @param size - размер иконки (по умолчанию 20)
 * @returns React компонент иконки или null
 */
const renderIcon = (iconName: string, size: number = 20) => {
  if (iconComponents[iconName]) {
    const IconComponent = iconComponents[iconName]
    return <IconComponent width={size} height={size} />
  }
  return null
}

/**
 * FloatingAction - интерфейс действия плавающей кнопки
 * 
 * Структура:
 * - id: уникальный идентификатор действия
 * - icon: ReactNode иконки действия
 * - onClick: обработчик клика (опционально)
 * - label: подсказка при наведении (опционально)
 */
interface FloatingAction {
  id: string
  icon: ReactNode
  onClick?: () => void
  label?: string
}

/**
 * FloatingActionsProps - интерфейс пропсов компонента FloatingActions
 * 
 * Структура:
 * - actions: массив кастомных действий (опционально, по умолчанию используются quickButtonsData)
 */
interface FloatingActionsProps {
  actions?: FloatingAction[]
}

/**
 * STORAGE_KEY - ключ для сохранения состояния закрепления панели в localStorage
 */
const STORAGE_KEY = 'floatingActionsPinned'

/**
 * SCROLL_TOP_BUTTON_STORAGE_KEY - ключ для сохранения состояния видимости кнопки "Вверх" в localStorage
 */
const SCROLL_TOP_BUTTON_STORAGE_KEY = 'floatingActionsScrollTopEnabled'

/**
 * SETTINGS_BUTTON_STORAGE_KEY - ключ для сохранения состояния видимости кнопки "Настройки" в localStorage
 */
const SETTINGS_BUTTON_STORAGE_KEY = 'floatingActionsSettingsEnabled'

/**
 * QUICK_BUTTONS_ENABLED_KEY - ключ для сохранения состояния включения/выключения быстрых кнопок в localStorage
 * 
 * Экспортируется для использования в других компонентах (например, в настройках профиля)
 */
export const QUICK_BUTTONS_ENABLED_KEY = 'quickButtonsEnabled'

/**
 * FloatingActions - компонент плавающих кнопок быстрых действий
 * 
 * Состояние:
 * - isPinned: флаг закрепления панели
 * - isVisible: флаг видимости панели
 * - isHovering: флаг наведения на панель
 * - isScrollTopEnabled: флаг видимости кнопки "Вверх"
 * - isSettingsEnabled: флаг видимости кнопки "Настройки"
 * - isQuickButtonsEnabled: флаг включения быстрых кнопок
 * 
 * Функциональность:
 * - Управление видимостью панели (по наведению или закреплению)
 * - Управление видимостью отдельных кнопок
 * - Синхронизация состояния между вкладками браузера
 * - Плавная прокрутка страницы вверх
 */
export default function FloatingActions({ actions = [] }: FloatingActionsProps) {
  // Хук для получения текущей темы
  const { theme } = useTheme()
  // Хук Next.js для программной навигации
  const router = useRouter()
  // Получение текущего пути для определения отступа сверху
  const pathname = usePathname()
  // Проверка, является ли текущая страница recr-chat (для корректного позиционирования)
  const isRecrChatPage = pathname?.startsWith('/recr-chat')
  /**
   * topOffset - отступ сверху для панели
   * 
   * Логика:
   * - На странице recr-chat: 112px (64px Header + 48px StatusBar)
   * - На остальных страницах: 64px (только Header)
   * 
   * Используется для:
   * - Корректного позиционирования панели под Header и StatusBar
   */
  const topOffset = isRecrChatPage ? '112px' : '64px' // 64px header + 48px status bar (только для recr-chat)

  /**
   * handleSettingsClick - обработчик клика на кнопку "Настройки"
   * 
   * Функциональность:
   * - Сохраняет активную вкладку 'quick-buttons' в localStorage
   * - Отправляет CustomEvent для синхронизации в той же вкладке
   * - Переходит на страницу профиля
   * 
   * Поведение:
   * - Вызывается при клике на кнопку "Настройки"
   * - Открывает страницу профиля с активной вкладкой "Быстрые кнопки"
   * 
   * Связи:
   * - router.push: выполняет навигацию на /profile
   * - localStorage: сохраняет активную вкладку
   * - CustomEvent: синхронизирует активную вкладку между вкладками браузера
   */
  const handleSettingsClick = () => {
    if (typeof window !== 'undefined') {
      // Сохраняем активную вкладку в localStorage для восстановления при загрузке профиля
      localStorage.setItem('profileActiveTab', 'quick-buttons')
      // Отправляем кастомное событие для синхронизации в той же вкладке браузера
      // (позволяет обновить активную вкладку без перезагрузки страницы)
      window.dispatchEvent(new CustomEvent('localStorageChange', {
        detail: {
          key: 'profileActiveTab',
          value: 'quick-buttons'
        }
      }))
    }
    router.push('/account/profile') // Переходим на страницу профиля
  }
  /**
   * isPinned - состояние закрепления панели
   * 
   * Инициализация:
   * - Загружается из localStorage при монтировании
   * - По умолчанию false (не закреплена)
   * 
   * Поведение:
   * - При закреплении панель всегда видна
   * - При откреплении панель показывается только при наведении
   */
  const [isPinned, setIsPinned] = useState(() => {
    if (typeof window === 'undefined') return false // SSR: всегда false
    try {
      const savedPinnedState = localStorage.getItem(STORAGE_KEY)
      return savedPinnedState === 'true' // Преобразуем строку в boolean
    } catch (error) {
      console.error('Ошибка при загрузке состояния закрепления из localStorage:', error)
      return false // При ошибке возвращаем false
    }
  })

  /**
   * isScrollTopEnabled - состояние видимости кнопки "Вверх"
   * 
   * Инициализация:
   * - Загружается из localStorage при монтировании
   * - По умолчанию true (включена)
   * 
   * Поведение:
   * - При true кнопка "Вверх" отображается
   * - При false кнопка "Вверх" скрыта
   * - Синхронизируется между вкладками браузера
   */
  const [isScrollTopEnabled, setIsScrollTopEnabled] = useState(() => {
    if (typeof window === 'undefined') return true // SSR: всегда true
    try {
      const saved = localStorage.getItem(SCROLL_TOP_BUTTON_STORAGE_KEY)
      return saved !== null ? saved === 'true' : true // По умолчанию включено
    } catch (error) {
      console.error('Ошибка при загрузке состояния кнопки "Вверх":', error)
      return true // При ошибке возвращаем true
    }
  })

  /**
   * isSettingsEnabled - состояние видимости кнопки "Настройки"
   * 
   * Инициализация:
   * - Загружается из localStorage при монтировании
   * - По умолчанию true (включена)
   * 
   * Поведение:
   * - При true кнопка "Настройки" отображается
   * - При false кнопка "Настройки" скрыта
   * - Синхронизируется между вкладками браузера
   */
  const [isSettingsEnabled, setIsSettingsEnabled] = useState(() => {
    if (typeof window === 'undefined') return true // SSR: всегда true
    try {
      const saved = localStorage.getItem(SETTINGS_BUTTON_STORAGE_KEY)
      return saved !== null ? saved === 'true' : true // По умолчанию включено
    } catch (error) {
      console.error('Ошибка при загрузке состояния кнопки "Настройки":', error)
      return true // При ошибке возвращаем true
    }
  })

  /**
   * isQuickButtonsEnabled - состояние включения/выключения быстрых кнопок
   * 
   * Инициализация:
   * - Загружается из localStorage при монтировании
   * - По умолчанию true (включены)
   * 
   * Поведение:
   * - При true быстрые кнопки отображаются (если панель видна или закреплена)
   * - При false быстрые кнопки скрыты (панель скрывается, если не закреплена)
   * - Синхронизируется между вкладками браузера через CustomEvent
   */
  const [isQuickButtonsEnabled, setIsQuickButtonsEnabled] = useState(() => {
    if (typeof window === 'undefined') return true // SSR: всегда true
    try {
      const saved = localStorage.getItem(QUICK_BUTTONS_ENABLED_KEY)
      return saved !== null ? saved === 'true' : true // По умолчанию включено
    } catch (error) {
      console.error('Ошибка при загрузке состояния быстрых кнопок:', error)
      return true // При ошибке возвращаем true
    }
  })

  /**
   * useEffect - синхронизация состояния быстрых кнопок между вкладками
   * 
   * Функциональность:
   * - Слушает CustomEvent 'localStorageChange' для синхронизации состояния
   * - Обновляет isQuickButtonsEnabled при изменении в другой вкладке
   * 
   * Поведение:
   * - Выполняется один раз при монтировании компонента
   * - Слушает кастомное событие для синхронизации в той же вкладке
   * - Очищает обработчик при размонтировании
   * 
   * Причина:
   * - Позволяет синхронизировать состояние быстрых кнопок между вкладками браузера
   * - Обновляет состояние без перезагрузки страницы
   */
  useEffect(() => {
    if (typeof window === 'undefined') return // SSR: пропускаем

    const handleStorageChange = (e: CustomEvent) => {
      if (e.detail?.key === QUICK_BUTTONS_ENABLED_KEY) {
        setIsQuickButtonsEnabled(e.detail.value === 'true') // Обновляем состояние
      }
    }

    window.addEventListener('localStorageChange', handleStorageChange as EventListener)
    return () => {
      window.removeEventListener('localStorageChange', handleStorageChange as EventListener)
    }
  }, [])

  /**
   * useEffect - синхронизация состояния кнопок "Вверх" и "Настройки" между вкладками
   * 
   * Функциональность:
   * - Слушает события storage и localStorageChange для синхронизации
   * - Периодически проверяет состояние (каждые 500мс)
   * - Проверяет состояние при фокусе на окне
   * 
   * Поведение:
   * - Выполняется один раз при монтировании компонента
   * - Слушает события storage (для синхронизации между вкладками)
   * - Слушает кастомное событие localStorageChange (для синхронизации в той же вкладке)
   * - Периодически проверяет состояние для надежной синхронизации
   * - Проверяет состояние при возвращении фокуса на окно
   * 
   * Причина:
   * - Обеспечивает надежную синхронизацию состояния кнопок между вкладками
   * - Обновляет состояние без перезагрузки страницы
   * - Периодическая проверка компенсирует возможные пропуски событий
   */
  useEffect(() => {
    if (typeof window === 'undefined') return // SSR: пропускаем

    /**
     * checkAndUpdateScrollTopState - проверка и обновление состояния кнопки "Вверх"
     * 
     * Функциональность:
     * - Читает состояние из localStorage
     * - Обновляет isScrollTopEnabled только если значение изменилось
     */
    const checkAndUpdateScrollTopState = () => {
      try {
        const saved = localStorage.getItem(SCROLL_TOP_BUTTON_STORAGE_KEY)
        const newValue = saved !== null ? saved === 'true' : true // По умолчанию true
        setIsScrollTopEnabled(prev => {
          if (prev !== newValue) {
            console.log(`🔄 Обновлено состояние кнопки "Вверх": ${prev} -> ${newValue}`)
            return newValue
          }
          return prev
        })
      } catch (error) {
        console.error('Ошибка при проверке состояния кнопки "Вверх":', error)
      }
    }

    /**
     * checkAndUpdateSettingsState - проверка и обновление состояния кнопки "Настройки"
     * 
     * Функциональность:
     * - Читает состояние из localStorage
     * - Обновляет isSettingsEnabled только если значение изменилось
     */
    const checkAndUpdateSettingsState = () => {
      try {
        const saved = localStorage.getItem(SETTINGS_BUTTON_STORAGE_KEY)
        const newValue = saved !== null ? saved === 'true' : true // По умолчанию true
        setIsSettingsEnabled(prev => {
          if (prev !== newValue) {
            console.log(`🔄 Обновлено состояние кнопки "Настройки": ${prev} -> ${newValue}`)
            return newValue
          }
          return prev
        })
      } catch (error) {
        console.error('Ошибка при проверке состояния кнопки "Настройки":', error)
      }
    }

    /**
     * handleStorageChange - обработчик события storage (для синхронизации между вкладками)
     * 
     * Функциональность:
     * - Слушает изменения в localStorage из других вкладок
     * - Обновляет состояние кнопок при изменении
     * 
     * Поведение:
     * - Срабатывает только при изменении localStorage в другой вкладке
     * - Не срабатывает при изменении в той же вкладке (для этого используется CustomEvent)
     */
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === SCROLL_TOP_BUTTON_STORAGE_KEY) {
        console.log(`📡 Событие storage: кнопка "Вверх" изменена на ${e.newValue}`)
        setIsScrollTopEnabled(e.newValue === 'true')
      } else if (e.key === SETTINGS_BUTTON_STORAGE_KEY) {
        console.log(`📡 Событие storage: кнопка "Настройки" изменена на ${e.newValue}`)
        setIsSettingsEnabled(e.newValue === 'true')
      }
    }

    /**
     * handleCustomStorageChange - обработчик кастомного события localStorageChange (для синхронизации в той же вкладке)
     * 
     * Функциональность:
     * - Слушает кастомное событие для синхронизации в той же вкладке
     * - Обновляет состояние кнопок при изменении
     * 
     * Поведение:
     * - Срабатывает при изменении localStorage в той же вкладке
     * - Используется для немедленного обновления без перезагрузки
     */
    const handleCustomStorageChange = (e: CustomEvent) => {
      if (e.detail?.key === SCROLL_TOP_BUTTON_STORAGE_KEY) {
        console.log(`📡 Кастомное событие: кнопка "Вверх" изменена на ${e.detail?.value}`)
        setIsScrollTopEnabled(e.detail?.value === 'true')
      } else if (e.detail?.key === SETTINGS_BUTTON_STORAGE_KEY) {
        console.log(`📡 Кастомное событие: кнопка "Настройки" изменена на ${e.detail?.value}`)
        setIsSettingsEnabled(e.detail?.value === 'true')
      }
    }

    // Добавляем обработчики событий
    window.addEventListener('storage', handleStorageChange) // Для синхронизации между вкладками
    window.addEventListener('localStorageChange', handleCustomStorageChange as EventListener) // Для синхронизации в той же вкладке

    /**
     * handleFocus - обработчик фокуса на окне
     * 
     * Функциональность:
     * - Проверяет состояние кнопок при возвращении фокуса на окно
     * 
     * Поведение:
     * - Срабатывает при возвращении фокуса на вкладку
     * - Позволяет синхронизировать состояние после переключения между вкладками
     */
    const handleFocus = () => {
      checkAndUpdateScrollTopState()
      checkAndUpdateSettingsState()
    }

    window.addEventListener('focus', handleFocus)

    /**
     * Периодическая проверка для более надежной синхронизации
     * 
     * Функциональность:
     * - Проверяет состояние кнопок каждые 500мс
     * 
     * Поведение:
     * - Компенсирует возможные пропуски событий storage
     * - Обеспечивает надежную синхронизацию состояния
     */
    const intervalId = setInterval(() => {
      checkAndUpdateScrollTopState()
      checkAndUpdateSettingsState()
    }, 500)

    // Cleanup: удаляем все обработчики и интервал при размонтировании
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('localStorageChange', handleCustomStorageChange as EventListener)
      window.removeEventListener('focus', handleFocus)
      clearInterval(intervalId)
    }
  }, [])
  /**
   * isVisible - состояние видимости панели
   * 
   * Инициализация:
   * - Если панель закреплена - сразу видна
   * - Если не закреплена - скрыта, показывается при наведении
   * 
   * Поведение:
   * - При закреплении всегда видна
   * - При откреплении показывается при наведении на левый край экрана
   * - Скрывается через 300мс после ухода курсора (если не закреплена)
   */
  const [isVisible, setIsVisible] = useState(() => {
    if (typeof window === 'undefined') return false // SSR: всегда false
    try {
      const savedPinnedState = localStorage.getItem(STORAGE_KEY)
      return savedPinnedState === 'true' // Видна сразу, если закреплена
    } catch (error) {
      return false // При ошибке возвращаем false
    }
  })
  // Флаг наведения на панель (для управления видимостью)
  const [isHovering, setIsHovering] = useState(false)
  // Ref для невидимой зоны срабатывания (левый край экрана)
  const triggerZoneRef = useRef<HTMLDivElement>(null)
  // Ref для панели с кнопками
  const panelRef = useRef<HTMLDivElement>(null)
  // Ref для таймера скрытия панели
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  /**
   * useEffect - сохранение состояния закрепления в localStorage
   * 
   * Функциональность:
   * - Сохраняет состояние isPinned в localStorage при изменении
   * 
   * Поведение:
   * - Выполняется при изменении isPinned
   * - Сохраняет состояние для восстановления при следующей загрузке
   */
  useEffect(() => {
    if (typeof window === 'undefined') return // SSR: пропускаем
    
    try {
      localStorage.setItem(STORAGE_KEY, String(isPinned))
    } catch (error) {
      console.error('Ошибка при сохранении состояния закрепления в localStorage:', error)
    }
  }, [isPinned])

  /**
   * handlePinToggle - обработчик переключения закрепления панели
   * 
   * Функциональность:
   * - Инвертирует состояние isPinned
   * - При закреплении сразу показывает панель
   * 
   * Поведение:
   * - Вызывается при клике на кнопку "Закрепить/Открепить"
   * - При закреплении панель становится всегда видимой
   * - При откреплении панель показывается только при наведении
   */
  const handlePinToggle = () => {
    setIsPinned(!isPinned) // Инвертируем состояние закрепления
    if (!isPinned) {
      // Если закрепляем - сразу показываем панель
      setIsVisible(true)
    }
  }

  /**
   * handleMouseEnter - обработчик наведения на панель
   * 
   * Функциональность:
   * - Показывает панель при наведении (если быстрые кнопки включены)
   * - Отменяет таймер скрытия панели
   * 
   * Поведение:
   * - Вызывается при наведении на панель или зону срабатывания
   * - Показывает панель только если быстрые кнопки включены
   * - Отменяет запланированное скрытие панели
   */
  const handleMouseEnter = () => {
    if (!isQuickButtonsEnabled) return // Не показываем, если быстрые кнопки выключены
    setIsHovering(true) // Устанавливаем флаг наведения
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current) // Отменяем запланированное скрытие
      timeoutRef.current = null
    }
  }

  /**
   * handleMouseLeave - обработчик ухода курсора с панели
   * 
   * Функциональность:
   * - Скрывает панель через 300мс после ухода курсора (если не закреплена)
   * 
   * Поведение:
   * - Вызывается при уходе курсора с панели или зоны срабатывания
   * - Скрывает панель только если быстрые кнопки включены
   * - Если панель закреплена - не скрывает
   * - Задержка 300мс для плавного UX (позволяет вернуть курсор)
   */
  const handleMouseLeave = () => {
    if (!isQuickButtonsEnabled) return // Не обрабатываем, если быстрые кнопки выключены
    setIsHovering(false) // Сбрасываем флаг наведения
    if (!isPinned) {
      // Если не закреплена - скрываем через 300мс
      timeoutRef.current = setTimeout(() => {
        setIsVisible(false)
      }, 300)
    }
  }

  /**
   * useEffect - скрытие панели при выключении быстрых кнопок
   * 
   * Функциональность:
   * - Скрывает панель, если быстрые кнопки выключены и панель не закреплена
   * 
   * Поведение:
   * - Выполняется при изменении isQuickButtonsEnabled или isPinned
   * - Скрывает панель только если быстрые кнопки выключены И панель не закреплена
   * - Если панель закреплена - не скрывает (пользователь может видеть, что кнопки выключены)
   */
  useEffect(() => {
    if (!isQuickButtonsEnabled && !isPinned) {
      setIsVisible(false) // Скрываем панель
      setIsHovering(false) // Сбрасываем флаг наведения
    }
  }, [isQuickButtonsEnabled, isPinned])

  /**
   * smoothScrollTo - плавная прокрутка с easing функцией
   * 
   * Функциональность:
   * - Плавно прокручивает элемент к целевой позиции
   * - Использует easing функцию для плавного ускорения и замедления
   * 
   * Используется для:
   * - Прокрутки страницы вверх при клике на кнопку "Вверх"
   * 
   * Easing функция:
   * - ease-in-out-cubic: плавное ускорение в начале и замедление в конце
   * 
   * @param element - элемент для прокрутки (window, documentElement или body)
   * @param target - целевая позиция прокрутки
   * @param duration - продолжительность анимации в миллисекундах (по умолчанию 800мс)
   * @returns Promise, который разрешается после завершения анимации
   */
  const smoothScrollTo = (element: HTMLElement | Window, target: number, duration: number = 800) => {
    return new Promise<void>((resolve) => {
      const start = element === window 
        ? (window.scrollY || window.pageYOffset)
        : (element as HTMLElement).scrollTop
      
      const distance = target - start
      let startTime: number | null = null

      // Easing функция: ease-in-out-cubic (плавное ускорение и замедление)
      const easeInOutCubic = (t: number): number => {
        return t < 0.5
          ? 4 * t * t * t
          : 1 - Math.pow(-2 * t + 2, 3) / 2
      }

      const animateScroll = (currentTime: number) => {
        if (startTime === null) startTime = currentTime
        const timeElapsed = currentTime - startTime
        const progress = Math.min(timeElapsed / duration, 1)
        
        // Применяем easing функцию для плавного ускорения и замедления
        const easeProgress = easeInOutCubic(progress)
        const currentPosition = start + distance * easeProgress

        if (element === window) {
          window.scrollTo(0, currentPosition)
        } else {
          (element as HTMLElement).scrollTop = currentPosition
        }

        if (progress < 1) {
          requestAnimationFrame(animateScroll)
        } else {
          resolve()
        }
      }

      requestAnimationFrame(animateScroll)
    })
  }

  /**
   * scrollToTop - прокрутка страницы в самый верх
   * 
   * Функциональность:
   * - Плавно прокручивает страницу в самый верх
   * - Учитывает фиксированный Header (64px)
   * - Прокручивает все возможные элементы (window, documentElement, body)
   * - Использует easing функцию для плавной анимации
   * 
   * Поведение:
   * - Вызывается при клике на кнопку "Вверх"
   * - Проверяет текущую позицию прокрутки
   * - Если уже вверху - не выполняет прокрутку
   * - Прокручивает все элементы для совместимости с разными браузерами
   * - Выполняет финальную корректировку позиций после анимации
   * 
   * Оптимизация:
   * - Продолжительность анимации зависит от расстояния (от 800мс до 1200мс)
   * - Использует requestAnimationFrame для плавной анимации
   * - Учитывает фиксированный Header при проверке позиции
   * 
   * TODO: Оптимизировать для Next.js с учетом фиксированного хэдера
   */
  const scrollToTop = async () => {
    console.log('🔝 Кнопка "Вверх" нажата')
    
    // Проверяем, что мы на клиенте (не на сервере)
    if (typeof window === 'undefined') {
      console.warn('⚠️ scrollToTop вызвана на сервере - это не должно происходить')
      return
    }

    // Проверяем текущую позицию прокрутки
    const scrollY = window.scrollY || window.pageYOffset || 0
    const innerHeight = window.innerHeight || 0
    console.log(`📊 Текущая позиция прокрутки: ${scrollY}px, высота окна: ${innerHeight}px`)
    
    // Проверяем видимость верхней части контента (учитывая фиксированный хэдер высотой 64px)
    let shouldScroll = true
    
    try {
      // Проверяем, виден ли верх документа в viewport
      const documentTop = document.documentElement.scrollTop || document.body.scrollTop || 0
      
      // Если scrollY = 0, проверяем, действительно ли мы вверху
      // Может быть ситуация, когда scrollY = 0, но контент прокручен вниз из-за другого механизма
      if (scrollY === 0 && documentTop === 0) {
        // Проверяем, находится ли верх контента в видимой области
        const firstContentElement = document.body.querySelector('main') || 
                                   document.body.querySelector('[role="main"]') ||
                                   document.body.firstElementChild
        
        if (firstContentElement && firstContentElement instanceof HTMLElement) {
          const rect = firstContentElement.getBoundingClientRect()
          const headerHeight = 64
          
          console.log(`📏 Позиция первого элемента контента: top=${Math.round(rect.top)}px, headerHeight=${headerHeight}px`)
          
          // Если верх контента уже находится в правильной позиции (на уровне хэдера или выше)
          if (rect.top <= headerHeight + 10) { // 10px допуск для возможных округлений
            console.log('ℹ️ Контент уже в верхней позиции (учитывая хэдер), прокрутка не требуется')
            shouldScroll = false
          } else {
            console.log(`✅ Контент не в верхней позиции (top=${Math.round(rect.top)}px > ${headerHeight + 10}px), прокрутка нужна`)
          }
        } else {
          // Если не нашли элемент контента, но scrollY = 0, считаем что вверху
          console.log('ℹ️ Элемент контента не найден, но scrollY = 0, считаем что уже вверху')
          shouldScroll = false
        }
      } else {
        // Если scrollY > 0, всегда прокручиваем
        console.log(`✅ Прокрутка нужна: scrollY = ${scrollY}px, documentTop = ${documentTop}px`)
      }
    } catch (error) {
      console.warn('⚠️ Ошибка при проверке позиции контента:', error)
      // В случае ошибки всегда прокручиваем, чтобы быть уверенными
      shouldScroll = true
    }
    
    if (!shouldScroll) {
      return
    }
    
    console.log('🚀 Начинаем плавную прокрутку вверх...')

    // Проверяем, какой элемент на самом деле прокручивается
    const docElementScroll = document.documentElement?.scrollTop || 0
    const bodyScroll = document.body?.scrollTop || 0
    const windowScrollY = window.scrollY || window.pageYOffset || 0
    
    console.log(`🔍 Диагностика прокрутки:`)
    console.log(`   - window.scrollY: ${windowScrollY}px`)
    console.log(`   - document.documentElement.scrollTop: ${docElementScroll}px`)
    console.log(`   - document.body.scrollTop: ${bodyScroll}px`)

    // Определяем, какой элемент нужно прокручивать и максимальное расстояние
    const maxScroll = Math.max(windowScrollY, docElementScroll, bodyScroll)
    const distance = maxScroll
    console.log(`   - Максимальная позиция прокрутки: ${maxScroll}px`)
    console.log(`   - Расстояние для прокрутки: ${distance}px`)

    // Продолжительность анимации зависит от расстояния (чем дальше, тем дольше, но с ограничением)
    const duration = Math.min(800 + distance * 0.3, 1200) // От 800мс до 1200мс
    console.log(`   - Продолжительность анимации: ${duration}ms`)

    // Прокручиваем все возможные элементы с плавной анимацией
    const scrollPromises: Promise<void>[] = []

    try {
      // Метод 1: window (основной метод для современных браузеров)
      if (windowScrollY > 0) {
        console.log(`✨ Метод 1: Плавная прокрутка window (с ${windowScrollY}px)`)
        scrollPromises.push(smoothScrollTo(window, 0, duration))
      }
    } catch (error) {
      console.warn('⚠️ Ошибка при прокрутке window:', error)
    }

    // Метод 2: Прокручиваем document.documentElement (если он прокручивается)
    try {
      if (docElementScroll > 0 && document.documentElement) {
        console.log(`✨ Метод 2: Плавная прокрутка documentElement (с ${docElementScroll}px)`)
        scrollPromises.push(smoothScrollTo(document.documentElement, 0, duration))
      }
    } catch (error) {
      console.warn('⚠️ Ошибка при прокрутке documentElement:', error)
    }

    // Метод 3: Прокручиваем document.body (если он прокручивается)
    try {
      if (bodyScroll > 0 && document.body) {
        console.log(`✨ Метод 3: Плавная прокрутка body (с ${bodyScroll}px)`)
        scrollPromises.push(smoothScrollTo(document.body, 0, duration))
      }
    } catch (error) {
      console.warn('⚠️ Ошибка при прокрутке body:', error)
    }

    // Ждем завершения всех анимаций
    try {
      await Promise.all(scrollPromises)
      console.log('✅ Все анимации прокрутки завершены!')
      
      // Финальная проверка - убеждаемся, что все элементы в позиции 0
      setTimeout(() => {
        const finalWindowScroll = window.scrollY || window.pageYOffset || 0
        const finalDocScroll = document.documentElement?.scrollTop || 0
        const finalBodyScroll = document.body?.scrollTop || 0
        
        // Если что-то не в нуле, фиксируем это напрямую
        if (finalWindowScroll > 0 || finalDocScroll > 0 || finalBodyScroll > 0) {
          console.log('🔧 Финальная корректировка позиций...')
          if (finalWindowScroll > 0) window.scrollTo(0, 0)
          if (finalDocScroll > 0) document.documentElement.scrollTop = 0
          if (finalBodyScroll > 0) document.body.scrollTop = 0
        }
        
        console.log(`📊 Финальное состояние:`)
        console.log(`   - window.scrollY: ${window.scrollY || window.pageYOffset || 0}px`)
        console.log(`   - documentElement.scrollTop: ${document.documentElement?.scrollTop || 0}px`)
        console.log(`   - body.scrollTop: ${document.body?.scrollTop || 0}px`)
        console.log('🎉 Прокрутка завершена успешно!')
      }, 100)
    } catch (error) {
      console.error('❌ Ошибка при выполнении анимации прокрутки:', error)
    }
  }

  /**
   * defaultActions - массив действий для быстрых кнопок
   * 
   * Логика:
   * - Если быстрые кнопки выключены - пустой массив
   * - Если передан actions - используем его
   * - Иначе - используем quickButtonsData с обработчиками
   * 
   * Обработчики действий:
   * - 'link': открывает ссылку в новой вкладке через window.open
   * - 'text': копирует текст в буфер обмена через navigator.clipboard
   * - 'datetime': копирует дату/время в буфер обмена
   * 
   * Поведение:
   * - Перед выполнением действия проверяет, включены ли быстрые кнопки
   * - Если выключены - не выполняет действие
   */
  const defaultActions: FloatingAction[] = !isQuickButtonsEnabled ? [] : (actions.length > 0 ? actions : quickButtonsData.map(button => ({
    id: button.id,
    icon: renderIcon(button.icon, 20), // Рендерим иконку по имени
    label: button.name, // Название кнопки для подсказки
    onClick: () => {
      // Проверяем, включены ли быстрые кнопки перед выполнением действия
      if (!isQuickButtonsEnabled) {
        console.log('Быстрые кнопки выключены')
        return
      }
      // Обработка в зависимости от типа кнопки
      if (button.type === 'link') {
        // Открываем ссылку в новой вкладке
        window.open(button.value, '_blank')
      } else if (button.type === 'text') {
        // Копируем текст в буфер обмена
        navigator.clipboard.writeText(button.value).then(() => {
          // Можно добавить уведомление о копировании
          console.log('Скопировано:', button.value)
        })
      } else if (button.type === 'datetime') {
        // Для datetime копируем дату/время в буфер обмена
        // TODO: Можно показать модальное окно или скопировать
        navigator.clipboard.writeText(button.value).then(() => {
          console.log('Скопировано:', button.value)
        })
      }
    },
  })))

  /**
   * pinIconColor - цвет иконки закрепления в зависимости от темы
   * 
   * Используется для:
   * - Адаптации цвета иконки под текущую тему
   * - Для светлой темы: темный цвет (#1f2937)
   * - Для темной темы: светлый цвет (#ffffff)
   */
  const pinIconColor = theme === 'light' ? '#1f2937' : '#ffffff'
  
  /**
   * useEffect - логирование состояния кнопки "Вверх" при изменении
   * 
   * Функциональность:
   * - Логирует состояние видимости кнопки "Вверх" в консоль
   * 
   * Поведение:
   * - Выполняется при изменении isScrollTopEnabled
   * - Используется для отладки
   */
  useEffect(() => {
    console.log(`🔘 Кнопка "Вверх" ${isScrollTopEnabled ? 'ПОКАЗАНА' : 'СКРЫТА'} в панели быстрых кнопок`)
  }, [isScrollTopEnabled])

  /**
   * useEffect - логирование состояния кнопки "Настройки" при изменении
   * 
   * Функциональность:
   * - Логирует состояние видимости кнопки "Настройки" в консоль
   * 
   * Поведение:
   * - Выполняется при изменении isSettingsEnabled
   * - Используется для отладки
   */
  useEffect(() => {
    console.log(`🔘 Кнопка "Настройки" ${isSettingsEnabled ? 'ПОКАЗАНА' : 'СКРЫТА'} в панели быстрых кнопок`)
  }, [isSettingsEnabled])
  
  /**
   * allActions - массив всех действий для отображения в панели
   * 
   * Структура:
   * - Кнопка "Настройки" (если включена) - в самом верху
   * - Быстрые кнопки (defaultActions)
   * - Кнопка "Вверх" (если включена)
   * - Кнопка "Закрепить/Открепить" - всегда внизу
   * 
   * Порядок:
   * - Сверху вниз: Настройки -> Быстрые кнопки -> Вверх -> Закрепить
   */
  const allActions = [
    // Кнопка "Настройки" в самом верху (добавляется только если она включена)
    ...(isSettingsEnabled ? [{
      id: 'settings',
      icon: <GearIcon width="20" height="20" style={{ color: '#ffffff' }} />,
      onClick: handleSettingsClick, // Переход на страницу настроек быстрых кнопок
      label: 'Настройки',
    }] : []),
    // Быстрые кнопки (по умолчанию или переданные через props)
    ...defaultActions,
    // Кнопка "Вверх" добавляется только если она включена (isScrollTopEnabled === true)
    ...(isScrollTopEnabled ? [{
      id: 'scroll-top',
      icon: <ArrowUpIcon width="20" height="20" style={{ color: '#ffffff' }} />,
      onClick: scrollToTop, // Прокрутка страницы вверх
      label: 'Наверх',
    }] : []),
    // Кнопка "Закрепить/Открепить" - всегда внизу
    {
      id: 'pin',
      icon: isPinned ? (
        <PinLeftIcon width={20} height={20} color={pinIconColor} /> // Иконка "открепить" когда закреплена
      ) : (
        <PinUnpinnedIcon width={20} height={20} color={pinIconColor} /> // Иконка "закрепить" когда не закреплена
      ),
      onClick: handlePinToggle, // Переключение закрепления
      label: isPinned ? 'Открепить' : 'Закрепить',
    },
  ]

  /**
   * Рендер компонента FloatingActions
   * 
   * Структура:
   * - Невидимая зона срабатывания (левый край экрана)
   * - Плавающий блок с кнопками (если виден или закреплен)
   * 
   * Поведение:
   * - Невидимая зона срабатывания: показывает панель при наведении на левый край
   * - Панель: отображается если видна или закреплена, и быстрые кнопки включены
   */
  return (
    <>
      {/* Невидимая зона срабатывания - всегда присутствует (только слева)
          - Ширина 7px, фиксированная позиция слева
          - Показывает панель при наведении на левый край экрана
          - Отключена если панель закреплена или быстрые кнопки выключены */}
      <Box
        ref={triggerZoneRef}
        position="fixed"
        top={topOffset} // Отступ сверху: 112px для recr-chat, 64px для остальных
        left="0"
        bottom="0"
        width="7px" // Узкая зона для срабатывания
        style={{
          zIndex: 998, // Поверх контента, но под панелью
          pointerEvents: (isPinned || !isQuickButtonsEnabled) ? 'none' : 'auto', // Отключена если закреплена или выключены кнопки
        }}
        onMouseEnter={() => {
          // При наведении на зону показываем панель (только если не закреплена и кнопки включены)
          if (!isPinned && isQuickButtonsEnabled) {
            setIsVisible(true)
            setIsHovering(true)
          }
        }}
        onMouseLeave={() => {
          // При уходе курсора скрываем панель через 300мс (только если не закреплена и кнопки включены)
          if (!isPinned && isQuickButtonsEnabled) {
            setIsHovering(false)
            timeoutRef.current = setTimeout(() => {
              if (!isPinned) {
                setIsVisible(false)
              }
            }, 300) // Задержка для плавного UX
          }
        }}
      />
      
      {/* Плавающий блок с кнопками
          - Отображается если панель видна или закреплена, и быстрые кнопки включены
          - Фиксированная позиция слева внизу
          - Плавные переходы появления/исчезновения */}
      {(isVisible || isPinned) && isQuickButtonsEnabled && (
        <Box
          ref={panelRef}
          position="fixed"
          left="16px"
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
            backgroundColor: theme === 'light' 
              ? 'rgba(255, 255, 255, 0.7)' 
              : 'rgba(28, 28, 31, 0.7)',
            backdropFilter: 'blur(10px)',
            border: '1px solid var(--gray-a6)',
            borderRadius: '12px',
            padding: '10px 6px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          }}
        >
          {/* Кнопки снизу вверх - pin внизу, остальные сверху */}
          {allActions.map((action, index) => (
            <Box key={action.id}>
              <Box
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  if (action.onClick) {
                    action.onClick()
                  }
                }}
                style={{
                  width: '39px',
                  height: '39px',
                  borderRadius: '50%',
                  backgroundColor: action.id === 'pin' && isPinned
                    ? 'var(--gray-4)'
                    : action.id === 'scroll-top'
                    ? 'var(--accent-9)'
                    : action.id === 'settings'
                    ? 'var(--gray-9)'
                    : quickButtonsData.find(b => b.id === action.id)?.color || 'var(--gray-3)',
                  border: '1px solid var(--gray-a6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out',
                }}
                onMouseEnter={(e) => {
                  if (action.id === 'scroll-top') {
                    e.currentTarget.style.backgroundColor = 'var(--accent-10)'
                  } else if (action.id === 'pin' && isPinned) {
                    e.currentTarget.style.backgroundColor = 'var(--gray-4)'
                  } else if (action.id === 'settings') {
                    e.currentTarget.style.backgroundColor = 'var(--gray-10)'
                  } else {
                    const buttonData = quickButtonsData.find(b => b.id === action.id)
                    e.currentTarget.style.backgroundColor = buttonData?.color || 'var(--gray-4)'
                  }
                  e.currentTarget.style.transform = 'scale(1.1)'
                  e.currentTarget.style.opacity = '0.9'
                }}
                onMouseLeave={(e) => {
                  if (action.id === 'pin' && isPinned) {
                    e.currentTarget.style.backgroundColor = 'var(--gray-4)'
                  } else if (action.id === 'scroll-top') {
                    e.currentTarget.style.backgroundColor = 'var(--accent-9)'
                  } else if (action.id === 'settings') {
                    e.currentTarget.style.backgroundColor = 'var(--gray-9)'
                  } else {
                    const buttonData = quickButtonsData.find(b => b.id === action.id)
                    e.currentTarget.style.backgroundColor = buttonData?.color || 'var(--gray-3)'
                  }
                  e.currentTarget.style.transform = 'scale(1)'
                  e.currentTarget.style.opacity = '1'
                }}
                title={action.label}
              >
                <Box style={{ 
                  color: action.id === 'pin' 
                    ? (theme === 'light' ? '#1f2937' : '#ffffff')
                    : '#ffffff', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  width: '20px',
                  height: '20px',
                  transform: 'scale(0.9)'
                }}>
                  {action.icon}
                </Box>
              </Box>
              {/* Разделитель после кнопки "Настройки" (если она есть и это первая кнопка) */}
              {index === 0 && isSettingsEnabled && (
                <Separator size="2" my="2" style={{ width: '100%' }} />
              )}
            </Box>
          ))}
        </Flex>
        </Box>
      )}
    </>
  )
}
