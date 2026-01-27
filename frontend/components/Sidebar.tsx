/**
 * Sidebar (components/Sidebar.tsx) - Боковое меню навигации приложения
 * 
 * Назначение:
 * - Навигация по разделам приложения
 * - Иерархическая структура меню с вложенными пунктами
 * - Подсветка активного пункта меню
 * - Автоматическое раскрытие активных разделов
 * - Закрытие меню на мобильных устройствах при навигации
 * 
 * Функциональность:
 * - Иерархическое меню с поддержкой вложенных пунктов
 * - Автоматическое определение активного пункта по текущему пути
 * - Раскрытие/сворачивание разделов меню
 * - Навигация по внутренним и внешним ссылкам
 * - Обработка пунктов "в разработке" (показ toast вместо навигации)
 * - Синхронизация активной вкладки профиля через localStorage и CustomEvent
 * - Адаптивное поведение (закрытие на мобильных при навигации)
 * 
 * Связи:
 * - AppLayout: получает состояние isOpen и обработчик onClose
 * - usePathname: определение текущего пути для подсветки активного пункта
 * - useRouter: выполнение навигации
 * - useToast: отображение уведомлений для пунктов "в разработке"
 * - ThemeProvider: получение текущей темы
 * 
 * Поведение:
 * - При открытии автоматически раскрывает разделы с активными пунктами
 * - При клике на пункт с дочерними элементами - раскрывает/сворачивает
 * - При клике на пункт без дочерних элементов - выполняет навигацию
 * - На мобильных устройствах закрывается при навигации
 * - Пункты "в разработке" показывают toast вместо навигации
 */

'use client'

import { Flex, Box, Text, Separator } from "@radix-ui/themes"
import { 
  ChevronDownIcon, 
  ChevronUpIcon,
  HomeIcon,
  PersonIcon,
  EnvelopeClosedIcon,
  ListBulletIcon,
  PlusIcon,
  CalendarIcon,
  GearIcon,
  OpenInNewWindowIcon,
  FileTextIcon,
  DashboardIcon,
  ClipboardIcon,
  BarChartIcon,
  DotsHorizontalIcon,
  CheckIcon,
  ClockIcon,
  StarIcon,
  ReloadIcon,
  MixerHorizontalIcon,
  ChatBubbleIcon,
  Cross2Icon
} from "@radix-ui/react-icons"
import { useState, ReactNode, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import styles from './Sidebar.module.css'
import { useTheme } from "@/components/ThemeProvider"
import { useToast } from "@/components/Toast/ToastContext"

/**
 * IN_DEVELOPMENT_IDS - множество ID пунктов меню, которые находятся в разработке
 * 
 * Используется для:
 * - Определения, какие пункты меню показывают toast вместо навигации
 * - Обработки кликов на пункты "в разработке"
 * 
 * Пункты в разработке:
 * - benchmarks-dashboard: Dashboard бенчмарков
 * - integrations-clickup, integrations-notion, integrations-hh, integrations-n8n: интеграции
 * - reporting-recruiter, reporting-vacancy, reporting-interviewer, reporting-funnel: отчеты
 * - company-settings-benchmark: настройки бенчмарков
 * - admin: административная панель
 */
const IN_DEVELOPMENT_IDS = new Set([
  'benchmarks-dashboard',
  'integrations-clickup', 'integrations-notion', 'integrations-hh', 'integrations-n8n',
  'reporting-recruiter', 'reporting-vacancy', 'reporting-interviewer', 'reporting-funnel',
  'company-settings-benchmark',
  'admin',
])

/**
 * MenuItem - интерфейс пункта меню
 * 
 * Структура:
 * - id: уникальный идентификатор пункта меню
 * - label: отображаемый текст пункта
 * - icon: иконка пункта (опционально)
 * - children: массив дочерних пунктов (для вложенных меню)
 * - href: ссылка для навигации (опционально)
 * - external: флаг внешней ссылки (открывается в новой вкладке)
 */
interface MenuItem {
  id: string
  label: string
  icon?: ReactNode
  children?: MenuItem[]
  href?: string
  external?: boolean
}

/**
 * SidebarProps - интерфейс пропсов компонента Sidebar
 * 
 * Структура:
 * - isOpen: флаг открытости меню
 * - onClose: обработчик закрытия меню
 */
interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

/**
 * MenuItemComponentProps - интерфейс пропсов компонента MenuItemComponent
 * 
 * Структура:
 * - item: пункт меню для отображения
 * - isActive: флаг активности пункта (подсветка)
 * - level: уровень вложенности (для отступов)
 * - onNavigate: обработчик навигации (закрытие меню на мобильных)
 * - pathname: текущий путь для определения активности
 * - inDevelopment: флаг "в разработке" (показ toast вместо навигации)
 * - onInDevelopmentClick: обработчик клика на пункт "в разработке"
 */
interface MenuItemComponentProps {
  item: MenuItem
  isActive?: boolean
  level?: number
  onNavigate?: () => void
  pathname?: string | null
  inDevelopment?: boolean
  onInDevelopmentClick?: () => void
}

/**
 * isItemOrChildrenActive - проверка, является ли пункт меню или его дочерние элементы активными
 * 
 * Функциональность:
 * - Проверяет, соответствует ли текущий путь пункту меню или его дочерним элементам
 * - Обрабатывает специальные случаи (home -> /workflow, wiki -> /wiki/* и т.д.)
 * - Рекурсивно проверяет дочерние элементы
 * 
 * Используется для:
 * - Подсветки активного пункта меню
 * - Автоматического раскрытия разделов с активными пунктами
 * 
 * Специальные случаи:
 * - 'home' активен на '/workflow'
 * - 'wiki' активен на всех путях, начинающихся с '/wiki'
 * - 'recruiting' активен на путях рекрутинга
 * - 'finance' активен на путях финансов
 * - 'company-settings' активен на всех путях настроек компании
 * - 'reporting' активен на всех путях отчетности
 * 
 * @param item - пункт меню для проверки
 * @param pathname - текущий путь
 * @returns true если пункт или его дочерние элементы активны, иначе false
 */
function isItemOrChildrenActive(item: MenuItem, pathname: string | null | undefined): boolean {
  if (!pathname) return false
  
  // Специальные случаи для проверки активности
  // 'home' активен на странице '/workflow'
  if (item.id === 'home' && pathname === '/workflow') {
    return true
  }
  // 'wiki' активен на всех страницах вики
  if (item.id === 'wiki' && pathname.startsWith('/wiki')) {
    return true
  }
  // 'recruiting' активен на всех страницах рекрутинга
  if (item.id === 'recruiting' && (
    pathname.startsWith('/recr-chat') ||
    pathname.startsWith('/invites') ||
    pathname.startsWith('/vacancies') ||
    pathname.startsWith('/hiring-requests') ||
    pathname.startsWith('/interviewers')
  )) {
    return true
  }
  // 'finance' активен на страницах финансов
  if (item.id === 'finance' && (
    pathname.startsWith('/vacancies/salary-ranges') ||
    pathname.startsWith('/finance/benchmarks')
  )) {
    return true
  }
  // 'company-settings' активен на всех страницах настроек компании
  if (item.id === 'company-settings' && pathname.startsWith('/company-settings')) {
    return true
  }
  // 'company-settings-finance' активен на страницах финансовых настроек
  if (item.id === 'company-settings-finance' && pathname.startsWith('/company-settings/finance')) {
    return true
  }
  // 'vacancies-requests' активен на странице заявок
  if (item.id === 'vacancies-requests' && pathname.startsWith('/hiring-requests')) {
    return true
  }
  // 'interviewers' активен на странице интервьюеров
  if (item.id === 'interviewers' && pathname.startsWith('/interviewers')) {
    return true
  }
  // 'integrations-huntflow' активен на странице Huntflow
  if (item.id === 'integrations-huntflow' && pathname.startsWith('/huntflow')) {
    return true
  }
  // 'integrations-aichat' активен на странице AI Chat
  if (item.id === 'integrations-aichat' && pathname.startsWith('/aichat')) {
    return true
  }
  // 'integrations-telegram' активен на страницах Telegram
  if (item.id === 'integrations-telegram' && pathname.startsWith('/telegram')) {
    return true
  }
  // 'reporting' активен на всех страницах отчетности
  if (item.id === 'reporting' && pathname.startsWith('/reporting')) {
    return true
  }
  // 'recr-chat' активен на странице Talent Pool
  if (item.id === 'recr-chat' && pathname.startsWith('/recr-chat')) {
    return true
  }
  
  // Проверяем сам элемент: точное совпадение или начало пути
  if (item.href) {
    if (pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))) {
      return true
    }
  }
  
  // Проверяем дочерние элементы рекурсивно
  if (item.children && item.children.length > 0) {
    return item.children.some(child => isItemOrChildrenActive(child, pathname))
  }
  
  return false
}

/**
 * MenuItemComponent - компонент пункта меню
 * 
 * Функциональность:
 * - Отображение пункта меню с иконкой и текстом
 * - Раскрытие/сворачивание дочерних элементов
 * - Навигация по внутренним и внешним ссылкам
 * - Подсветка активного пункта
 * - Обработка пунктов "в разработке"
 * - Синхронизация активной вкладки профиля
 * 
 * Состояние:
 * - isExpanded: флаг раскрытости дочерних элементов
 * 
 * Поведение:
 * - Автоматически раскрывается, если пункт или его дочерние элементы активны
 * - При клике на пункт с дочерними элементами - раскрывает/сворачивает
 * - При клике на пункт без дочерних элементов - выполняет навигацию
 * - На мобильных закрывает меню при навигации
 * - Для пунктов "в разработке" показывает toast вместо навигации
 */
function MenuItemComponent({ item, isActive = false, level = 0, onNavigate, pathname, inDevelopment = false, onInDevelopmentClick }: MenuItemComponentProps) {
  // Хук Next.js для программной навигации
  const router = useRouter()
  // Проверка наличия дочерних элементов
  const hasChildren = item.children && item.children.length > 0
  /**
   * shouldBeExpanded - должен ли пункт быть раскрыт
   * 
   * Логика:
   * - Раскрывается только если есть дочерние элементы И пункт или его дочерние элементы активны
   * 
   * Используется для:
   * - Автоматического раскрытия разделов с активными пунктами
   */
  const shouldBeExpanded = hasChildren && isItemOrChildrenActive(item, pathname)
  // Состояние раскрытости дочерних элементов
  const [isExpanded, setIsExpanded] = useState(shouldBeExpanded)
  
  /**
   * useEffect - обновление состояния раскрытости при изменении pathname
   * 
   * Функциональность:
   * - Обновляет isExpanded при изменении shouldBeExpanded
   * 
   * Поведение:
   * - Выполняется при изменении shouldBeExpanded (который зависит от pathname)
   * - Обеспечивает автоматическое раскрытие разделов при навигации
   */
  useEffect(() => {
    setIsExpanded(shouldBeExpanded)
  }, [shouldBeExpanded])

  /**
   * handleClick - обработчик клика на пункт меню
   * 
   * Функциональность:
   * - Обрабатывает клики на пункты меню
   * - Для пунктов "в разработке" показывает toast
   * - Для пунктов с дочерними элементами - раскрывает/сворачивает
   * - Для пунктов без дочерних элементов - выполняет навигацию
   * - Синхронизирует активную вкладку профиля через localStorage и CustomEvent
   * 
   * Поведение:
   * - Приоритет 1: Если пункт "в разработке" - показывает toast, навигацию не выполняет
   * - Приоритет 2: Если есть дочерние элементы - раскрывает/сворачивает, навигацию не выполняет
   * - Приоритет 3: Если есть href - выполняет навигацию
   * - На мобильных (< 768px) закрывает меню после навигации
   * 
   * Связи:
   * - router.push: внутренняя навигация
   * - window.open: внешняя навигация (новая вкладка)
   * - localStorage: сохранение активной вкладки профиля
   * - CustomEvent: синхронизация активной вкладки между вкладками браузера
   * 
   * @param e - событие клика (опционально)
   */
  const handleClick = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation() // Предотвращаем всплытие события
      e.preventDefault() // Предотвращаем стандартное поведение
    }

    // Пункт «в разработке»: показываем toast, навигацию не выполняем
    if (inDevelopment) {
      onInDevelopmentClick?.() // Показываем toast через обработчик
      return
    }
    
    // ПРИОРИТЕТ: Если есть дочерние элементы, сначала обрабатываем раскрытие/сворачивание
    if (hasChildren) {
      setIsExpanded(!isExpanded) // Инвертируем состояние раскрытости
      return // Выходим, не выполняя навигацию
    }
    
    // Если дочерних элементов нет, но есть href, выполняем навигацию
    if (item.href) {
      // Если это ссылка, выполняем навигацию
      if (item.external) {
        // Внешняя ссылка открывается в новой вкладке
        window.open(item.href, '_blank')
      } else {
        // Внутренняя ссылка - используем Next.js роутер
        // Если это ссылка на профиль, устанавливаем активную вкладку
        if (item.href === '/profile') {
          if (typeof window !== 'undefined') {
            let tabValue = 'profile' // По умолчанию вкладка "Профиль"
            
            // Если это "Интеграции и API", устанавливаем вкладку integrations
            if (item.id === 'settings-integrations') {
              tabValue = 'integrations'
            }
            // Если это "Профиль", устанавливаем вкладку profile
            else if (item.id === 'profile') {
              tabValue = 'profile'
            }
            
            // Сохраняем активную вкладку в localStorage для восстановления при загрузке
            localStorage.setItem('profileActiveTab', tabValue)
            // Отправляем кастомное событие для синхронизации в той же вкладке браузера
            // (позволяет обновить активную вкладку без перезагрузки страницы)
            window.dispatchEvent(new CustomEvent('localStorageChange', {
              detail: {
                key: 'profileActiveTab',
                value: tabValue
              }
            }))
          }
        }
        router.push(item.href) // Выполняем навигацию
        // Закрываем меню при навигации только на мобильных устройствах (< 768px)
        if (onNavigate && typeof window !== 'undefined' && window.innerWidth < 768) {
          onNavigate() // Закрываем меню на мобильных
        }
      }
    }
  }

  /**
   * Рендер компонента MenuItemComponent
   * 
   * Структура:
   * - Flex контейнер пункта меню с иконкой, текстом и индикаторами
   * - Условный рендеринг дочерних элементов при раскрытии
   * 
   * Стили:
   * - paddingLeft: отступ слева зависит от уровня вложенности (level)
   * - backgroundColor: подсветка при активности и наведении
   * - cursor: pointer для кликабельных пунктов
   */
  return (
    <Box>
      {/* Контейнер пункта меню
          - data-tour: атрибут для тура по приложению
          - className: применяет стили меню и активного состояния
          - onClick: обработчик клика (раскрытие/навигация)
          - onMouseEnter/onMouseLeave: визуальная обратная связь при наведении */}
      <Flex
        data-tour={`sidebar-${item.id}`}
        align="center"
        gap="2"
        px="3"
        py="2"
        className={`${styles.menuItem} ${isActive ? styles.menuItemActive : ''}`}
        style={{
          backgroundColor: isActive ? 'rgba(255, 255, 255, 0.15)' : 'transparent', // Подсветка активного пункта
          borderRadius: '6px',
          cursor: (item.href || hasChildren) ? 'pointer' : 'default', // Курсор pointer для кликабельных пунктов
          paddingLeft: level > 0 ? `${16 + level * 20}px` : '12px', // Отступ слева зависит от уровня вложенности
          position: 'relative',
          marginBottom: '2px',
          transition: 'all 0.2s ease-in-out', // Плавные переходы
        }}
        onClick={(e) => {
          e.stopPropagation() // Предотвращаем всплытие события
          handleClick(e) // Вызываем обработчик клика
        }}
        onMouseEnter={(e) => {
          // При наведении показываем легкую подсветку (только для неактивных кликабельных пунктов)
          if (!isActive && (item.href || hasChildren)) {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)'
          }
        }}
        onMouseLeave={(e) => {
          // При уходе курсора возвращаем прозрачный фон (только для неактивных пунктов)
          if (!isActive) {
            e.currentTarget.style.backgroundColor = 'transparent'
          }
        }}
      >
        {/* Иконка пункта меню (если есть) */}
        {item.icon && (
          <Box style={{ display: 'flex', alignItems: 'center', minWidth: '20px' }}>
            {item.icon}
          </Box>
        )}
        {/* Текст пункта меню
            - flex: 1 - занимает оставшееся пространство */}
        <Text size="2" style={{ flex: 1, color: 'var(--gray-12)' }}>
          {item.label}
        </Text>
        {/* Индикатор наличия дочерних элементов
            - ChevronUpIcon: если раскрыто
            - ChevronDownIcon: если свернуто */}
        {hasChildren && (
          <Box style={{ display: 'flex', alignItems: 'center' }}>
            {isExpanded ? (
              <ChevronUpIcon width={16} height={16} style={{ color: 'var(--gray-12)' }} />
            ) : (
              <ChevronDownIcon width={16} height={16} style={{ color: 'var(--gray-12)' }} />
            )}
          </Box>
        )}
        {/* Индикатор внешней ссылки
            - Показывается только для внешних ссылок (external === true) */}
        {item.external && (
          <OpenInNewWindowIcon width="14" height="14" style={{ color: 'var(--gray-12)', opacity: 0.7 }} />
        )}
      </Flex>
      {/* Дочерние элементы пункта меню
          - Рендерятся только если есть дочерние элементы И пункт раскрыт
          - stopPropagation: предотвращаем всплытие событий от дочерних элементов
          - Рекурсивный рендеринг MenuItemComponent для каждого дочернего элемента */}
      {hasChildren && isExpanded && (
        <Box onClick={(e) => e.stopPropagation()} onMouseEnter={(e) => e.stopPropagation()} onMouseLeave={(e) => e.stopPropagation()}>
          <Flex direction="column" style={{ marginTop: '4px' }}>
            {item.children!.map((child) => (
              <MenuItemComponent
                key={child.id}
                item={child}
                level={level + 1} // Увеличиваем уровень вложенности для отступов
                onNavigate={onNavigate}
                pathname={pathname}
                isActive={isItemOrChildrenActive(child, pathname)} // Определяем активность дочернего элемента
                inDevelopment={IN_DEVELOPMENT_IDS.has(child.id)} // Проверяем, в разработке ли дочерний элемент
                onInDevelopmentClick={onInDevelopmentClick}
              />
            ))}
          </Flex>
        </Box>
      )}
    </Box>
  )
}

/**
 * Sidebar - основной компонент бокового меню
 * 
 * Состояние:
 * - isOpen: флаг открытости меню (из пропсов)
 * - theme: текущая тема приложения
 * - pathname: текущий путь для определения активных пунктов
 * 
 * Функциональность:
 * - Отображает иерархическое меню навигации
 * - Определяет активные пункты меню по текущему пути
 * - Обрабатывает клики на пункты меню
 * - Закрывается на мобильных при навигации
 * - Адаптивное позиционирование (учитывает StatusBar на странице recr-chat)
 */
export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  // Хук для получения текущей темы
  const { theme } = useTheme()
  // Получение текущего пути для определения активных пунктов
  const pathname = usePathname()
  // Хук для отображения уведомлений
  const toast = useToast()
  // Проверка, является ли текущая страница recr-chat (для корректного позиционирования)
  const isRecrChatPage = pathname?.startsWith('/recr-chat')
  /**
   * topOffset - отступ сверху для меню
   * 
   * Логика:
   * - На странице recr-chat: 112px (64px Header + 48px StatusBar)
   * - На остальных страницах: 64px (только Header)
   * 
   * Используется для:
   * - Корректного позиционирования меню под Header и StatusBar
   */
  const topOffset = isRecrChatPage ? '112px' : '64px' // 64px header + 48px status bar (только для recr-chat)

  /**
   * handleInDevClick - обработчик клика на пункт "в разработке"
   * 
   * Функциональность:
   * - Показывает toast-уведомление о том, что функция в разработке
   * 
   * Поведение:
   * - Вызывается при клике на пункт меню, который находится в разработке
   * - Показывает информационное уведомление через toast
   * 
   * Используется для:
   * - Обработки кликов на пункты из IN_DEVELOPMENT_IDS
   */
  const handleInDevClick = () => toast.showInfo('В разработке', 'Данная страница или функциональность в разработке.')
  
  /**
   * menuItems - основная структура меню навигации
   * 
   * Структура:
   * - Иерархическое меню с поддержкой вложенных пунктов
   * - Каждый пункт имеет id, label, icon, href (опционально), children (опционально)
   * - Пункты могут быть вложенными (children) для создания подменю
   * 
   * Разделы меню:
   * - Главная: переход на /workflow
   * - Календарь: переход на /calendar
   * - Рекрутинг: раздел с подпунктами (Talent Pool, Инвайты, Вакансии, Интервьюеры)
   * - Финансы: раздел с подпунктами (Зарплатные вилки, Бенчмарки)
   * - Интеграции: раздел с подпунктами (Huntflow, AI Chat, Telegram и т.д.)
   * - Вики: переход на /wiki
   * - Отчетность: раздел с подпунктами (Главная, План найма, По компании и т.д.)
   * 
   * TODO: Вынести в отдельный файл или получать из API
   */
  const menuItems: MenuItem[] = [
    {
      id: 'home',
      label: 'Главная',
      icon: <HomeIcon width={16} height={16} style={{ color: 'var(--gray-12)' }} />,
      href: '/workflow',
    },
    {
      id: 'calendar',
      label: 'Календарь',
      icon: <CalendarIcon width={16} height={16} style={{ color: 'var(--gray-12)' }} />,
      href: '/calendar',
    },
    {
      id: 'recruiting',
      label: 'Рекрутинг',
      icon: <ChatBubbleIcon width={16} height={16} style={{ color: 'var(--gray-12)' }} />,
      children: [
        {
          id: 'recr-chat',
          label: 'Talent Pool',
          icon: <ChatBubbleIcon width={16} height={16} style={{ color: 'var(--gray-12)' }} />,
          href: '/recr-chat',
        },
        {
          id: 'invites',
          label: 'Инвайты',
          icon: <EnvelopeClosedIcon width={16} height={16} style={{ color: 'var(--gray-12)' }} />,
          href: '/invites',
        },
        {
          id: 'vacancies',
          label: 'Вакансии',
          icon: <Box style={{ width: '16px', height: '16px', border: '1px solid var(--gray-12)', borderRadius: '2px' }} />,
          children: [
            {
              id: 'vacancies-list',
              label: 'Вакансии',
              icon: <ListBulletIcon width={16} height={16} style={{ color: 'var(--gray-12)' }} />,
              href: '/vacancies',
            },
            {
              id: 'vacancies-requests',
              label: 'Заявки',
              icon: <ClipboardIcon width={16} height={16} style={{ color: 'var(--gray-12)' }} />,
              href: '/hiring-requests',
            },
          ],
        },
        {
          id: 'interviewers',
          label: 'Интервьюеры',
          icon: <PersonIcon width={16} height={16} style={{ color: 'var(--gray-12)' }} />,
          href: '/interviewers',
        },
      ],
    },
    {
      id: 'finance',
      label: 'Финансы',
      icon: <Box style={{ width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Text size="1" style={{ color: 'var(--gray-12)' }}>$</Text>
      </Box>,
      children: [
        {
          id: 'finance-salary-ranges',
          label: 'Зарплатные вилки',
          icon: <Box style={{ width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Text size="1" style={{ color: 'var(--gray-12)' }}>$</Text>
          </Box>,
          href: '/vacancies/salary-ranges',
        },
        {
          id: 'finance-benchmarks',
          label: 'Бенчмарки',
          icon: <ListBulletIcon width={16} height={16} style={{ color: 'var(--gray-12)' }} />,
          children: [
            {
              id: 'benchmarks-dashboard',
              label: 'Dashboard',
              icon: <DashboardIcon width={16} height={16} style={{ color: 'var(--gray-12)' }} />,
              href: '/finance/benchmarks',
            },
            {
              id: 'benchmarks-all',
              label: 'Все бенчмарки',
              icon: <ListBulletIcon width={16} height={16} style={{ color: 'var(--gray-12)' }} />,
              href: '/finance/benchmarks',
            },
          ],
        },
      ],
    },
    {
      id: 'integrations',
      label: 'Интеграции',
      icon: <Box style={{ width: '16px', height: '16px', position: 'relative' }}>
        <Box style={{ width: '8px', height: '8px', border: '1px solid var(--gray-12)', borderRadius: '2px', position: 'absolute', top: '0', left: '0' }} />
        <Box style={{ width: '4px', height: '4px', borderTop: '1px solid var(--gray-12)', borderRight: '1px solid var(--gray-12)', position: 'absolute', bottom: '0', right: '0' }} />
      </Box>,
      children: [
        {
          id: 'integrations-huntflow',
          label: 'Huntflow',
          icon: <Text size="1" weight="bold" style={{ color: 'var(--gray-12)', width: '16px', textAlign: 'center' }}>H</Text>,
          href: '/huntflow',
        },
        {
          id: 'integrations-aichat',
          label: 'AI Chat',
          icon: <Box style={{ width: '16px', height: '16px', borderRadius: '50%', border: '1px solid var(--gray-12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Box style={{ width: '6px', height: '6px', backgroundColor: 'var(--gray-12)', borderRadius: '50%' }} />
          </Box>,
          href: '/aichat',
        },
        {
          id: 'integrations-clickup',
          label: 'ClickUp',
          icon: <DotsHorizontalIcon width={16} height={16} style={{ color: 'var(--gray-12)' }} />,
          children: [],
        },
        {
          id: 'integrations-notion',
          label: 'Notion',
          icon: <Box style={{ width: '16px', height: '16px', border: '1px solid var(--gray-12)', borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1px' }}>
            <Box style={{ width: '2px', height: '2px', borderRadius: '50%', backgroundColor: 'var(--gray-12)' }} />
            <Box style={{ width: '2px', height: '2px', borderRadius: '50%', backgroundColor: 'var(--gray-12)' }} />
            <Box style={{ width: '2px', height: '2px', borderRadius: '50%', backgroundColor: 'var(--gray-12)' }} />
          </Box>,
          children: [],
        },
        {
          id: 'integrations-hh',
          label: 'HeadHunter.ru',
          icon: <Text size="1" weight="bold" style={{ color: 'var(--gray-12)', width: '16px', textAlign: 'center' }}>H</Text>,
          children: [],
        },
        {
          id: 'integrations-telegram',
          label: 'Telegram',
          icon: <Text size="1" weight="bold" style={{ color: 'var(--gray-12)', width: '16px', textAlign: 'center' }}>T</Text>,
          children: [
            { id: 'integrations-telegram-login', label: 'Вход', icon: <Box style={{ width: 16, height: 16, border: '1px solid var(--gray-12)', borderRadius: 4 }} />, href: '/telegram' },
            { id: 'integrations-telegram-2fa', label: '2FA', icon: <GearIcon width={16} height={16} style={{ color: 'var(--gray-12)' }} />, href: '/telegram/2fa' },
            { id: 'integrations-telegram-chats', label: 'Чаты', icon: <ChatBubbleIcon width={16} height={16} style={{ color: 'var(--gray-12)' }} />, href: '/telegram/chats' },
          ],
        },
        {
          id: 'integrations-n8n',
          label: 'n8n',
          icon: <Text size="1" weight="bold" style={{ color: 'var(--gray-12)', width: '16px', textAlign: 'center' }}>n8n</Text>,
          children: [],
        },
      ],
    },
    {
      id: 'wiki',
      label: 'Вики',
      icon: <FileTextIcon width={16} height={16} style={{ color: 'var(--gray-12)' }} />,
      href: '/wiki',
    },
    {
      id: 'reporting',
      label: 'Отчетность',
      icon: <BarChartIcon width={16} height={16} style={{ color: 'var(--gray-12)' }} />,
      children: [
        {
          id: 'reporting-main',
          label: 'Главная',
          icon: <ClockIcon width={16} height={16} style={{ color: 'var(--gray-12)' }} />,
          href: '/reporting',
        },
        {
          id: 'reporting-hiring-plan',
          label: 'План найма',
          icon: <ClipboardIcon width={16} height={16} style={{ color: 'var(--gray-12)' }} />,
          href: '/reporting/hiring-plan',
        },
        {
          id: 'reporting-company',
          label: 'По компании',
          icon: <Box style={{ width: '16px', height: '16px', border: '1px solid var(--gray-12)', borderRadius: '2px', position: 'relative' }}>
            <Box style={{ width: '10px', height: '6px', border: '1px solid var(--gray-12)', borderRadius: '1px', position: 'absolute', top: '2px', left: '2px' }} />
          </Box>,
          href: '/reporting/company',
        },
        {
          id: 'reporting-recruiter',
          label: 'По рекрутеру',
          icon: <PersonIcon width={16} height={16} style={{ color: 'var(--gray-12)' }} />,
          href: '/reporting/recruiter',
        },
        {
          id: 'reporting-vacancy',
          label: 'По вакансии',
          icon: <Box style={{ width: '16px', height: '16px', border: '1px solid var(--gray-12)', borderRadius: '2px' }} />,
          href: '/reporting/vacancy',
        },
        {
          id: 'reporting-interviewer',
          label: 'По интервьюеру',
          icon: <Box style={{ width: '16px', height: '16px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <PersonIcon width={12} height={12} style={{ color: 'var(--gray-12)' }} />
            <CheckIcon width={8} height={8} style={{ color: 'var(--gray-12)', position: 'absolute', bottom: '-2px', right: '-2px' }} />
          </Box>,
          href: '/reporting/interviewer',
        },
        {
          id: 'reporting-funnel',
          label: 'Воронка',
          icon: <Box style={{ width: '16px', height: '16px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 2L6 6V12L10 14V6L14 2H2Z" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Box>,
          href: '/reporting/funnel',
        },
      ],
    },
  ]

  /**
   * settingsItems - структура меню настроек (внизу Sidebar)
   * 
   * Структура:
   * - Пункты настроек пользователя и компании
   * - Отображаются в нижней части Sidebar
   * 
   * Пункты:
   * - Профиль: переход на /profile (вкладка "Профиль")
   * - Интеграции и API: переход на /profile (вкладка "Интеграции")
   * - Настройки компании: раздел с подпунктами (Общие, Оргструктура, Финансы и т.д.)
   * - Admin-панель: внешняя ссылка (открывается в новой вкладке)
   */
  const settingsItems: MenuItem[] = [
    {
      id: 'profile',
      label: 'Профиль',
      icon: <PersonIcon width={16} height={16} style={{ color: 'var(--gray-12)' }} />,
      href: '/profile',
    },
    {
      id: 'settings-integrations',
      label: 'Интеграции и API',
      icon: <Box style={{ width: '16px', height: '16px', position: 'relative' }}>
        <Box style={{ width: '8px', height: '8px', border: '1px solid var(--gray-12)', borderRadius: '2px', position: 'absolute', top: '0', left: '0' }} />
        <Box style={{ width: '4px', height: '4px', borderTop: '1px solid var(--gray-12)', borderRight: '1px solid var(--gray-12)', position: 'absolute', bottom: '0', right: '0' }} />
      </Box>,
      href: '/profile',
    },
    {
      id: 'company-settings',
      label: 'Настройки компании',
      icon: <Box style={{ width: '16px', height: '16px', border: '1px solid var(--gray-12)', borderRadius: '2px', position: 'relative' }}>
        <Box style={{ width: '10px', height: '6px', border: '1px solid var(--gray-12)', borderRadius: '1px', position: 'absolute', top: '2px', left: '2px' }} />
      </Box>,
      href: '/company-settings',
      children: [
        {
          id: 'company-settings-general',
          label: 'Общие',
          icon: <GearIcon width={16} height={16} style={{ color: 'var(--gray-12)' }} />,
          href: '/company-settings',
        },
        {
          id: 'company-settings-org-structure',
          label: 'Оргструктура',
          icon: <PersonIcon width={16} height={16} style={{ color: 'var(--gray-12)' }} />,
          href: '/company-settings/org-structure',
        },
        {
          id: 'company-settings-grades',
          label: 'Грейды',
          icon: <StarIcon width={16} height={16} style={{ color: 'var(--gray-12)' }} />,
          href: '/company-settings/grades',
        },
        {
          id: 'company-settings-lifecycle',
          label: 'Жизненный цикл сотрудников',
          icon: <MixerHorizontalIcon width={16} height={16} style={{ color: 'var(--gray-12)' }} />,
          href: '/company-settings/employee-lifecycle',
        },
        {
          id: 'company-settings-finance',
          label: 'Финансы',
          icon: <ReloadIcon width={16} height={16} style={{ color: 'var(--gray-12)' }} />,
          href: '/company-settings/finance',
        },
        {
          id: 'company-settings-benchmark',
          label: 'Бенчмарк',
          icon: <BarChartIcon width={16} height={16} style={{ color: 'var(--gray-12)' }} />,
        },
        {
          id: 'company-settings-integrations',
          label: 'Интеграции',
          icon: <Box style={{ width: '16px', height: '16px', position: 'relative' }}>
            <Box style={{ width: '8px', height: '8px', border: '1px solid var(--gray-12)', borderRadius: '2px', position: 'absolute', top: '0', left: '0' }} />
            <Box style={{ width: '4px', height: '4px', borderTop: '1px solid var(--gray-12)', borderRight: '1px solid var(--gray-12)', position: 'absolute', bottom: '0', right: '0' }} />
          </Box>,
          href: '/company-settings/integrations',
        },
        {
          id: 'company-settings-user-groups',
          label: 'Группы пользователей',
          icon: <PersonIcon width={16} height={16} style={{ color: 'var(--gray-12)' }} />,
          href: '/company-settings/user-groups',
        },
        {
          id: 'company-settings-users',
          label: 'Пользователи',
          icon: <PersonIcon width={16} height={16} style={{ color: 'var(--gray-12)' }} />,
          href: '/company-settings/users',
        },
        {
          id: 'recruiting-settings',
          label: 'Настройки рекрутинга',
          icon: <ChatBubbleIcon width={16} height={16} style={{ color: 'var(--gray-12)' }} />,
          href: '/company-settings/recruiting',
          children: [
            {
              id: 'recruiting-settings-rules',
              label: 'Правила привлечения',
              icon: <GearIcon width={16} height={16} style={{ color: 'var(--gray-12)' }} />,
              href: '/company-settings/recruiting/rules',
            },
            {
              id: 'recruiting-settings-stages',
              label: 'Этапы найма и причины отказа',
              icon: <Box style={{ width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Box style={{ width: '2px', height: '12px', backgroundColor: 'var(--gray-12)', marginRight: '2px' }} />
                <Box style={{ width: '2px', height: '12px', backgroundColor: 'var(--gray-12)' }} />
              </Box>,
              href: '/company-settings/recruiting/stages',
            },
            {
              id: 'recruiting-settings-candidate-fields',
              label: 'Дополнительные поля кандидатов',
              icon: <FileTextIcon width={16} height={16} style={{ color: 'var(--gray-12)' }} />,
              href: '/company-settings/candidate-fields',
            },
            {
              id: 'recruiting-settings-scorecard',
              label: 'Scorecard',
              icon: <Box style={{ width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Box style={{ width: '2px', height: '12px', backgroundColor: 'var(--gray-12)', marginRight: '2px' }} />
                <Box style={{ width: '2px', height: '12px', backgroundColor: 'var(--gray-12)' }} />
              </Box>,
              href: '/company-settings/scorecard',
            },
            {
              id: 'recruiting-settings-sla',
              label: 'SLA',
              icon: <ClockIcon width={16} height={16} style={{ color: 'var(--gray-12)' }} />,
              href: '/company-settings/sla',
            },
            {
              id: 'recruiting-settings-vacancy-prompt',
              label: 'Единый промпт для вакансий',
              icon: <FileTextIcon width={16} height={16} style={{ color: 'var(--gray-12)' }} />,
              href: '/company-settings/vacancy-prompt',
            },
            {
              id: 'recruiting-settings-offer-template',
              label: 'Шаблон оффера',
              icon: <FileTextIcon width={16} height={16} style={{ color: 'var(--gray-12)' }} />,
              href: '/company-settings/recruiting/offer-template',
            },
            {
              id: 'recruiting-settings-candidate-responses',
              label: 'Ответы кандидатам',
              icon: <ChatBubbleIcon width={16} height={16} style={{ color: 'var(--gray-12)' }} />,
              href: '/candidate-responses',
            },
          ],
        },
      ],
    },
    {
      id: 'admin',
      label: 'Admin-панель',
      icon: <GearIcon width={16} height={16} style={{ color: 'var(--gray-12)' }} />,
      external: true,
    },
  ]

  /**
   * Рендер компонента Sidebar
   * 
   * Структура:
   * - Фиксированная позиция справа
   * - Отступ сверху зависит от наличия StatusBar (topOffset)
   * - Анимация появления/исчезновения через transform
   * - Основное меню (menuItems)
   * - Разделитель
   * - Меню настроек (settingsItems)
   * 
   * Стили:
   * - transform: translateX(0) когда открыто, translateX(100%) когда закрыто
   * - transition: плавная анимация появления/исчезновения
   * - overflowY: auto - вертикальная прокрутка при переполнении
   */
  return (
    <Box
      position="fixed"
      top={topOffset} // Отступ сверху: 112px для recr-chat (Header + StatusBar), 64px для остальных (только Header)
      right="0"
      bottom="0"
      className={styles.sidebar}
      style={{
        backgroundColor: theme === 'dark' ? 'var(--gray-2, #1c1c1f)' : '#ffffff', // Адаптивный фон в зависимости от темы
        borderLeft: '1px solid var(--gray-a6)', // Разделительная линия слева
        transform: isOpen ? 'translateX(0)' : 'translateX(100%)', // Анимация: открыто - видно, закрыто - скрыто справа
        transition: 'transform 0.2s ease-in-out, background-color 0.2s ease-in-out', // Плавные переходы
        overflowY: 'auto', // Вертикальная прокрутка при переполнении
      }}
    >
      <Flex direction="column" p="2" gap="1">
        {/* Основное меню навигации
            - Рендерим все пункты основного меню
            - Определяем активность каждого пункта по текущему пути
            - Передаем обработчик закрытия меню для мобильных устройств */}
        {menuItems.map((item) => {
          /**
           * Определение активности пункта меню
           * 
           * Логика:
           * - Проверяет точное совпадение пути или начало пути
           * - Обрабатывает специальные случаи (home -> /workflow, wiki -> /wiki/* и т.д.)
           * - Используется для подсветки активного пункта
           */
          let isActive = pathname === item.href || 
            (item.id === 'home' && pathname === '/workflow') ||
            (item.id === 'wiki' && pathname?.startsWith('/wiki')) ||
            (item.id === 'calendar' && pathname?.startsWith('/calendar')) ||
            (item.id === 'recruiting' && (
              pathname?.startsWith('/recr-chat') ||
              pathname?.startsWith('/invites') ||
              pathname?.startsWith('/vacancies') ||
              pathname?.startsWith('/hiring-requests') ||
              pathname?.startsWith('/interviewers')
            )) ||
            (item.id === 'recr-chat' && pathname?.startsWith('/recr-chat')) ||
            (item.id === 'invites' && pathname?.startsWith('/invites')) ||
            (item.id === 'vacancies' && (
              pathname?.startsWith('/vacancies') ||
              pathname?.startsWith('/hiring-requests')
            )) ||
            (item.id === 'finance' && (
              pathname?.startsWith('/vacancies/salary-ranges') ||
              pathname?.startsWith('/finance/benchmarks')
            )) ||
            (item.id === 'finance-salary-ranges' && pathname?.startsWith('/vacancies/salary-ranges')) ||
            (item.id === 'finance-benchmarks' && pathname?.startsWith('/finance/benchmarks')) ||
            (item.id === 'integrations' && (
              pathname?.startsWith('/huntflow') ||
              pathname?.startsWith('/aichat') ||
              pathname?.startsWith('/telegram')
            ))
          
          return (
            <MenuItemComponent
              key={item.id}
              item={item}
              isActive={isActive} // Передаем флаг активности для подсветки
              onNavigate={onClose} // Обработчик закрытия меню на мобильных при навигации
              pathname={pathname}
              inDevelopment={IN_DEVELOPMENT_IDS.has(item.id)} // Проверяем, в разработке ли пункт
              onInDevelopmentClick={handleInDevClick} // Обработчик для пунктов "в разработке"
            />
          )
        })}

        {/* Разделитель между основным меню и настройками
            - Визуально разделяет основное меню и меню настроек */}
        <Separator size="4" my="2" />

        {/* Меню настроек (внизу Sidebar)
            - Пункты настроек пользователя и компании
            - Специальная логика определения активности для профиля (проверка активной вкладки) */}
        {settingsItems.map((item) => {
          /**
           * Определение активности пункта настроек
           * 
           * Логика:
           * - Для 'settings-integrations': проверяет активную вкладку 'integrations' в localStorage
           * - Для 'profile': проверяет, что активная вкладка 'profile' или не установлена
           * - Для 'company-settings': использует isItemOrChildrenActive для проверки пути и дочерних элементов
           * - Для остальных: проверяет точное совпадение пути
           */
          let isActive = pathname === item.href
          
          // Для страницы интеграций проверяем активную вкладку в localStorage
          if (item.id === 'settings-integrations' && pathname === '/profile') {
            if (typeof window !== 'undefined') {
              const activeTab = localStorage.getItem('profileActiveTab')
              isActive = activeTab === 'integrations' // Активен только если активная вкладка 'integrations'
            }
          } else if (item.id === 'profile' && pathname === '/profile') {
            // Для профиля проверяем, что активная вкладка - это профиль (или не установлена)
            if (typeof window !== 'undefined') {
              const activeTab = localStorage.getItem('profileActiveTab')
              isActive = !activeTab || activeTab === 'profile' // Активен если вкладка 'profile' или не установлена
            }
          } else if (item.id === 'company-settings' && pathname?.startsWith('/company-settings')) {
            // Для настроек компании проверяем путь и дочерние элементы
            isActive = isItemOrChildrenActive(item, pathname)
          }
          
          return (
            <MenuItemComponent
              key={item.id}
              item={item}
              isActive={isActive} // Передаем флаг активности для подсветки
              onNavigate={onClose} // Обработчик закрытия меню на мобильных при навигации
              pathname={pathname}
              inDevelopment={IN_DEVELOPMENT_IDS.has(item.id)} // Проверяем, в разработке ли пункт
              onInDevelopmentClick={handleInDevClick} // Обработчик для пунктов "в разработке"
            />
          )
        })}
      </Flex>
    </Box>
  )
}
