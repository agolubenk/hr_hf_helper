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
import { useRouter } from "next/navigation"
import { useTheme } from "./ThemeProvider"

// Иконка для не зафиксированного состояния (drawing pin)
const PinUnpinnedIcon = ({ width = 15, height = 15, color = 'currentColor' }: { width?: number; height?: number; color?: string }) => (
  <svg width={width} height={height} viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10.3285 1.13607C10.1332 0.940809 9.81662 0.940808 9.62136 1.13607C9.42609 1.33133 9.42609 1.64792 9.62136 1.84318L10.2744 2.49619L5.42563 6.13274L4.31805 5.02516C4.12279 4.8299 3.80621 4.8299 3.61095 5.02516C3.41569 5.22042 3.41569 5.537 3.61095 5.73226L5.02516 7.14648L6.08582 8.20714L2.81545 11.4775C2.62019 11.6728 2.62019 11.9894 2.81545 12.1846C3.01072 12.3799 3.3273 12.3799 3.52256 12.1846L6.79293 8.91425L7.85359 9.97491L9.2678 11.3891C9.46306 11.5844 9.77965 11.5844 9.97491 11.3891C10.1702 11.1939 10.1702 10.8773 9.97491 10.682L8.86733 9.57443L12.5039 4.7257L13.1569 5.37871C13.3522 5.57397 13.6687 5.57397 13.864 5.37871C14.0593 5.18345 14.0593 4.86687 13.864 4.6716L12.8033 3.61094L11.3891 2.19673L10.3285 1.13607ZM6.13992 6.84702L10.9887 3.21047L11.7896 4.01142L8.15305 8.86015L6.13992 6.84702Z" fill={color} fillRule="evenodd" clipRule="evenodd" />
  </svg>
)

// Маппинг имен иконок на компоненты
const iconComponents: Record<string, React.ComponentType<{ width?: number | string; height?: number | string }>> = {
  LightningBoltIcon,
  CalendarIcon,
  EnvelopeClosedIcon,
  PaperPlaneIcon,
  ClockIcon,
}

// Данные быстрых кнопок (кроме последней - GitHub)
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

// Рендерим иконку на основе имени
const renderIcon = (iconName: string, size: number = 20) => {
  if (iconComponents[iconName]) {
    const IconComponent = iconComponents[iconName]
    return <IconComponent width={size} height={size} />
  }
  return null
}

interface FloatingAction {
  id: string
  icon: ReactNode
  onClick?: () => void
  label?: string
}

interface FloatingActionsProps {
  actions?: FloatingAction[]
}

const STORAGE_KEY = 'floatingActionsPinned'
const SCROLL_TOP_BUTTON_STORAGE_KEY = 'floatingActionsScrollTopEnabled'
const SETTINGS_BUTTON_STORAGE_KEY = 'floatingActionsSettingsEnabled'
export const QUICK_BUTTONS_ENABLED_KEY = 'quickButtonsEnabled'

export default function FloatingActions({ actions = [] }: FloatingActionsProps) {
  const { theme } = useTheme()
  const router = useRouter()

  // Обработчик для перехода на страницу настроек быстрых кнопок
  const handleSettingsClick = () => {
    if (typeof window !== 'undefined') {
      // Сохраняем активную вкладку в localStorage
      localStorage.setItem('profileActiveTab', 'quick-buttons')
      // Отправляем кастомное событие для синхронизации в той же вкладке
      window.dispatchEvent(new CustomEvent('localStorageChange', {
        detail: {
          key: 'profileActiveTab',
          value: 'quick-buttons'
        }
      }))
    }
    router.push('/profile')
  }
  // Инициализируем состояние закрепления из localStorage (только на клиенте)
  const [isPinned, setIsPinned] = useState(() => {
    if (typeof window === 'undefined') return false
    try {
      const savedPinnedState = localStorage.getItem(STORAGE_KEY)
      return savedPinnedState === 'true'
    } catch (error) {
      console.error('Ошибка при загрузке состояния закрепления из localStorage:', error)
      return false
    }
  })
  // Состояние видимости кнопки "Вверх" (по умолчанию включено)
  const [isScrollTopEnabled, setIsScrollTopEnabled] = useState(() => {
    if (typeof window === 'undefined') return true
    try {
      const saved = localStorage.getItem(SCROLL_TOP_BUTTON_STORAGE_KEY)
      return saved !== null ? saved === 'true' : true // По умолчанию включено
    } catch (error) {
      console.error('Ошибка при загрузке состояния кнопки "Вверх":', error)
      return true
    }
  })

  // Состояние видимости кнопки "Настройки" (по умолчанию включено)
  const [isSettingsEnabled, setIsSettingsEnabled] = useState(() => {
    if (typeof window === 'undefined') return true
    try {
      const saved = localStorage.getItem(SETTINGS_BUTTON_STORAGE_KEY)
      return saved !== null ? saved === 'true' : true // По умолчанию включено
    } catch (error) {
      console.error('Ошибка при загрузке состояния кнопки "Настройки":', error)
      return true
    }
  })

  // Состояние включения/выключения быстрых кнопок (по умолчанию включено)
  const [isQuickButtonsEnabled, setIsQuickButtonsEnabled] = useState(() => {
    if (typeof window === 'undefined') return true
    try {
      const saved = localStorage.getItem(QUICK_BUTTONS_ENABLED_KEY)
      return saved !== null ? saved === 'true' : true // По умолчанию включено
    } catch (error) {
      console.error('Ошибка при загрузке состояния быстрых кнопок:', error)
      return true
    }
  })

  // Слушаем изменения в localStorage для синхронизации между вкладками
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleStorageChange = (e: CustomEvent) => {
      if (e.detail?.key === QUICK_BUTTONS_ENABLED_KEY) {
        setIsQuickButtonsEnabled(e.detail.value === 'true')
      }
    }

    window.addEventListener('localStorageChange', handleStorageChange as EventListener)
    return () => {
      window.removeEventListener('localStorageChange', handleStorageChange as EventListener)
    }
  }, [])

  // Слушаем изменения в localStorage для кнопки "Вверх" (для синхронизации между компонентами)
  useEffect(() => {
    if (typeof window === 'undefined') return

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

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === SCROLL_TOP_BUTTON_STORAGE_KEY) {
        console.log(`📡 Событие storage: кнопка "Вверх" изменена на ${e.newValue}`)
        setIsScrollTopEnabled(e.newValue === 'true')
      } else if (e.key === SETTINGS_BUTTON_STORAGE_KEY) {
        console.log(`📡 Событие storage: кнопка "Настройки" изменена на ${e.newValue}`)
        setIsSettingsEnabled(e.newValue === 'true')
      }
    }

    // Кастомное событие для синхронизации в той же вкладке
    const handleCustomStorageChange = (e: CustomEvent) => {
      if (e.detail?.key === SCROLL_TOP_BUTTON_STORAGE_KEY) {
        console.log(`📡 Кастомное событие: кнопка "Вверх" изменена на ${e.detail?.value}`)
        setIsScrollTopEnabled(e.detail?.value === 'true')
      } else if (e.detail?.key === SETTINGS_BUTTON_STORAGE_KEY) {
        console.log(`📡 Кастомное событие: кнопка "Настройки" изменена на ${e.detail?.value}`)
        setIsSettingsEnabled(e.detail?.value === 'true')
      }
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('localStorageChange', handleCustomStorageChange as EventListener)

    // Проверяем изменения при фокусе на окне (для синхронизации после возвращения на вкладку)
    const handleFocus = () => {
      checkAndUpdateScrollTopState()
      checkAndUpdateSettingsState()
    }

    window.addEventListener('focus', handleFocus)

    // Периодическая проверка для более надежной синхронизации (каждые 500мс)
    const intervalId = setInterval(() => {
      checkAndUpdateScrollTopState()
      checkAndUpdateSettingsState()
    }, 500)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('localStorageChange', handleCustomStorageChange as EventListener)
      window.removeEventListener('focus', handleFocus)
      clearInterval(intervalId)
    }
  }, [])
  // Если кнопки закреплены, они должны быть видны сразу
  const [isVisible, setIsVisible] = useState(() => {
    if (typeof window === 'undefined') return false
    try {
      const savedPinnedState = localStorage.getItem(STORAGE_KEY)
      return savedPinnedState === 'true'
    } catch (error) {
      return false
    }
  })
  const [isHovering, setIsHovering] = useState(false)
  const triggerZoneRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Сохраняем состояние закрепления в localStorage при изменении
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.setItem(STORAGE_KEY, String(isPinned))
    } catch (error) {
      console.error('Ошибка при сохранении состояния закрепления в localStorage:', error)
    }
  }, [isPinned])

  // Зона срабатывания на правом краю
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const rightEdgeZone = window.innerWidth - 7 // 7px от правого края - зона срабатывания

      // Проверяем, находится ли курсор в зоне срабатывания или над самим блоком
      const isInTriggerZone = e.clientX >= rightEdgeZone
      const isOverPanel = panelRef.current && panelRef.current.contains(e.target as Node)
      const isOverTriggerZone = triggerZoneRef.current && triggerZoneRef.current.contains(e.target as Node)

      if ((isInTriggerZone || isOverPanel || isOverTriggerZone) && !isPinned) {
        setIsVisible(true)
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
          timeoutRef.current = null
        }
      } else if (!isPinned && !isHovering && !isOverPanel && !isOverTriggerZone && e.clientX < rightEdgeZone) {
        // Задержка перед скрытием, если курсор не над блоком
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }
        timeoutRef.current = setTimeout(() => {
          if (!isHovering && !isPinned) {
            setIsVisible(false)
          }
        }, 300)
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [isPinned, isHovering])

  const handlePinToggle = () => {
    setIsPinned(!isPinned)
    if (!isPinned) {
      setIsVisible(true)
    }
  }

  const handleMouseEnter = () => {
    if (!isQuickButtonsEnabled) return
    setIsHovering(true)
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }

  const handleMouseLeave = () => {
    if (!isQuickButtonsEnabled) return
    setIsHovering(false)
    if (!isPinned) {
      timeoutRef.current = setTimeout(() => {
        setIsVisible(false)
      }, 300)
    }
  }

  // Скрываем панель, если быстрые кнопки выключены
  useEffect(() => {
    if (!isQuickButtonsEnabled && !isPinned) {
      setIsVisible(false)
      setIsHovering(false)
    }
  }, [isQuickButtonsEnabled, isPinned])

  // Плавная прокрутка с easing функцией (ускорение, прокрутка, замедление)
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

  // Прокрутка страницы в самый верх (оптимизировано для Next.js с учетом фиксированного хэдера)
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

  // Используем быстрые кнопки (кроме последней) или переданные actions
  // Если быстрые кнопки выключены, не добавляем их
  const defaultActions: FloatingAction[] = !isQuickButtonsEnabled ? [] : (actions.length > 0 ? actions : quickButtonsData.map(button => ({
    id: button.id,
    icon: renderIcon(button.icon, 20),
    label: button.name,
    onClick: () => {
      // Проверяем, включены ли быстрые кнопки перед выполнением действия
      if (!isQuickButtonsEnabled) {
        console.log('Быстрые кнопки выключены')
        return
      }
      if (button.type === 'link') {
        window.open(button.value, '_blank')
      } else if (button.type === 'text') {
        navigator.clipboard.writeText(button.value).then(() => {
          // Можно добавить уведомление о копировании
          console.log('Скопировано:', button.value)
        })
      } else if (button.type === 'datetime') {
        // Для datetime можно показать модальное окно или скопировать
        navigator.clipboard.writeText(button.value).then(() => {
          console.log('Скопировано:', button.value)
        })
      }
    },
  })))

  // Добавляем кнопку "Вверх" (если включена) и кнопку pin в конец списка
  // Для светлой темы используем темный цвет иконки
  const pinIconColor = theme === 'light' ? '#1f2937' : '#ffffff'
  
  // Логируем состояние кнопок при изменении
  useEffect(() => {
    console.log(`🔘 Кнопка "Вверх" ${isScrollTopEnabled ? 'ПОКАЗАНА' : 'СКРЫТА'} в панели быстрых кнопок`)
  }, [isScrollTopEnabled])

  useEffect(() => {
    console.log(`🔘 Кнопка "Настройки" ${isSettingsEnabled ? 'ПОКАЗАНА' : 'СКРЫТА'} в панели быстрых кнопок`)
  }, [isSettingsEnabled])
  
  const allActions = [
    // Кнопка "Настройки" в самом верху (добавляется только если она включена)
    ...(isSettingsEnabled ? [{
      id: 'settings',
      icon: <GearIcon width="20" height="20" style={{ color: '#ffffff' }} />,
      onClick: handleSettingsClick,
      label: 'Настройки',
    }] : []),
    ...defaultActions,
    // Кнопка "Вверх" добавляется только если она включена (isScrollTopEnabled === true)
    ...(isScrollTopEnabled ? [{
      id: 'scroll-top',
      icon: <ArrowUpIcon width="20" height="20" style={{ color: '#ffffff' }} />,
      onClick: scrollToTop,
      label: 'Наверх',
    }] : []),
    {
      id: 'pin',
      icon: isPinned ? (
        <PinRightIcon width="20" height="20" style={{ color: pinIconColor }} />
      ) : (
        <PinUnpinnedIcon width={20} height={20} color={pinIconColor} />
      ),
      onClick: handlePinToggle,
      label: isPinned ? 'Открепить' : 'Закрепить',
    },
  ]

  return (
    <>
      {/* Невидимая зона срабатывания - всегда присутствует */}
      <Box
        ref={triggerZoneRef}
        position="fixed"
        top="64px"
        right="0"
        bottom="0"
        width="7px"
        style={{
          zIndex: 998,
          pointerEvents: (isPinned || !isQuickButtonsEnabled) ? 'none' : 'auto',
        }}
        onMouseEnter={() => {
          if (!isPinned && isQuickButtonsEnabled) {
            setIsVisible(true)
            setIsHovering(true)
          }
        }}
        onMouseLeave={() => {
          if (!isPinned && isQuickButtonsEnabled) {
            setIsHovering(false)
            timeoutRef.current = setTimeout(() => {
              if (!isPinned) {
                setIsVisible(false)
              }
            }, 300)
          }
        }}
      />
      
      {/* Плавающий блок с кнопками */}
      {(isVisible || isPinned) && isQuickButtonsEnabled && (
        <Box
          ref={panelRef}
          position="fixed"
          right="16px"
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
