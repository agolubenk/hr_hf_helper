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
  MixerHorizontalIcon
} from "@radix-ui/react-icons"
import { useState, ReactNode, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import styles from './Sidebar.module.css'
import { useTheme } from "@/components/ThemeProvider"

interface MenuItem {
  id: string
  label: string
  icon?: ReactNode
  children?: MenuItem[]
  href?: string
  external?: boolean
}

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

interface MenuItemComponentProps {
  item: MenuItem
  isActive?: boolean
  level?: number
  onNavigate?: () => void
  pathname?: string | null
}

// Функция для проверки, является ли элемент или его дочерние элементы активными
function isItemOrChildrenActive(item: MenuItem, pathname: string | null | undefined): boolean {
  if (!pathname) return false
  
  // Специальные случаи для проверки активности
  if (item.id === 'home' && pathname === '/workflow') {
    return true
  }
  if (item.id === 'wiki' && pathname.startsWith('/wiki')) {
    return true
  }
  if (item.id === 'aichat' && pathname.startsWith('/aichat')) {
    return true
  }
  if (item.id === 'finance' && pathname.startsWith('/finance')) {
    return true
  }
  if (item.id === 'google-related' && (
    pathname.startsWith('/calendar') || 
    pathname.startsWith('/invites')
  )) {
    return true
  }
  if (item.id === 'company-settings' && pathname.startsWith('/company-settings')) {
    return true
  }
  if (item.id === 'vacancies-requests' && pathname.startsWith('/hiring-requests')) {
    return true
  }
  if (item.id === 'interviewers' && pathname.startsWith('/interviewers')) {
    return true
  }
  if (item.id === 'integrations-huntflow' && pathname.startsWith('/huntflow')) {
    return true
  }
  if (item.id === 'reporting' && pathname.startsWith('/reporting')) {
    return true
  }
  
  // Проверяем сам элемент
  if (item.href) {
    // Для finance страницы проверяем путь и query параметры
    if (item.href.includes('/finance')) {
      const basePath = '/finance'
      if (pathname === basePath || pathname.startsWith(basePath)) {
        // Если текущая страница finance, проверяем query параметры
        if (typeof window !== 'undefined') {
          const url = new URL(item.href, window.location.origin)
          const itemTab = url.searchParams.get('tab')
          const currentParams = new URLSearchParams(window.location.search)
          const currentTab = currentParams.get('tab')
          
          // Если оба имеют одинаковый tab параметр
          if (itemTab && currentTab && itemTab === currentTab) {
            return true
          }
          // Если в ссылке нет tab, но текущий URL тоже без tab (или наоборот)
          if (!itemTab && !currentTab) {
            return true
          }
          // Если в ссылке есть tab, но текущий URL без tab - не активен
          if (itemTab && !currentTab) {
            return false
          }
          // Если в ссылке нет tab, но текущий URL с tab - не активен
          if (!itemTab && currentTab) {
            return false
          }
        }
        // Если window недоступен, просто проверяем путь
        return true
      }
    }
    // Для обычных ссылок проверяем точное совпадение или начало пути
    if (pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))) {
      return true
    }
  }
  
  // Проверяем дочерние элементы
  if (item.children && item.children.length > 0) {
    return item.children.some(child => isItemOrChildrenActive(child, pathname))
  }
  
  return false
}

function MenuItemComponent({ item, isActive = false, level = 0, onNavigate, pathname }: MenuItemComponentProps) {
  const router = useRouter()
  const hasChildren = item.children && item.children.length > 0
  // Раскрываем только если элемент или его дочерние элементы активны
  const shouldBeExpanded = hasChildren && isItemOrChildrenActive(item, pathname)
  const [isExpanded, setIsExpanded] = useState(shouldBeExpanded)
  
  // Обновляем состояние при изменении pathname
  useEffect(() => {
    setIsExpanded(shouldBeExpanded)
  }, [shouldBeExpanded])

  const handleClick = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation()
      e.preventDefault()
    }
    
    // Если есть href, всегда выполняем навигацию (даже если есть children)
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
            
            // Сохраняем активную вкладку в localStorage
            localStorage.setItem('profileActiveTab', tabValue)
            // Отправляем кастомное событие для синхронизации в той же вкладке
            window.dispatchEvent(new CustomEvent('localStorageChange', {
              detail: {
                key: 'profileActiveTab',
                value: tabValue
              }
            }))
          }
        }
        router.push(item.href)
        // Закрываем меню при навигации только на мобильных устройствах (< 768px)
        if (onNavigate && typeof window !== 'undefined' && window.innerWidth < 768) {
          onNavigate()
        }
      }
      return // Важно: выходим, чтобы не обрабатывать раскрытие/сворачивание
    }
    
    // Если у элемента есть дочерние элементы, но нет href, просто раскрываем/сворачиваем
    if (hasChildren) {
      setIsExpanded(!isExpanded)
    }
  }

  return (
    <Box>
      <Flex
        align="center"
        gap="2"
        px="3"
        py="2"
        className={`${styles.menuItem} ${isActive ? styles.menuItemActive : ''}`}
        style={{
          backgroundColor: isActive ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
          borderRadius: '6px',
          cursor: (item.href || hasChildren) ? 'pointer' : 'default',
          paddingLeft: level > 0 ? `${16 + level * 20}px` : '12px',
          position: 'relative',
          marginBottom: '2px',
          transition: 'all 0.2s ease-in-out',
        }}
        onClick={(e) => {
          e.stopPropagation()
          handleClick(e)
        }}
        onMouseEnter={(e) => {
          if (!isActive && (item.href || hasChildren)) {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)'
          }
        }}
        onMouseLeave={(e) => {
          if (!isActive) {
            e.currentTarget.style.backgroundColor = 'transparent'
          }
        }}
      >
        {item.icon && (
          <Box style={{ display: 'flex', alignItems: 'center', minWidth: '20px' }}>
            {item.icon}
          </Box>
        )}
        <Text size="2" style={{ flex: 1, color: 'var(--gray-12)' }}>
          {item.label}
        </Text>
        {hasChildren && (
          <Box style={{ display: 'flex', alignItems: 'center' }}>
            {isExpanded ? (
              <ChevronUpIcon width={16} height={16} style={{ color: 'var(--gray-12)' }} />
            ) : (
              <ChevronDownIcon width={16} height={16} style={{ color: 'var(--gray-12)' }} />
            )}
          </Box>
        )}
        {item.external && (
          <OpenInNewWindowIcon width="14" height="14" style={{ color: 'var(--gray-12)', opacity: 0.7 }} />
        )}
      </Flex>
      {hasChildren && isExpanded && (
        <Box onClick={(e) => e.stopPropagation()} onMouseEnter={(e) => e.stopPropagation()} onMouseLeave={(e) => e.stopPropagation()}>
          <Flex direction="column" style={{ marginTop: '4px' }}>
            {item.children!.map((child) => (
              <MenuItemComponent
                key={child.id}
                item={child}
                level={level + 1}
                onNavigate={onNavigate}
                pathname={pathname}
                isActive={isItemOrChildrenActive(child, pathname)}
              />
            ))}
          </Flex>
        </Box>
      )}
    </Box>
  )
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { theme } = useTheme()
  const pathname = usePathname()
  
  // Пример структуры меню - можно вынести в отдельный файл или получать из API
  const menuItems: MenuItem[] = [
    {
      id: 'home',
      label: 'Главная',
      icon: <HomeIcon width={16} height={16} style={{ color: 'var(--gray-12)' }} />,
      href: '/workflow',
    },
    {
      id: 'google-related',
      label: 'Google & Related',
      icon: <Text size="1" weight="bold" style={{ color: 'var(--gray-12)', width: '16px', textAlign: 'center' }}>G</Text>,
      children: [
        {
          id: 'calendar',
          label: 'Календарь',
          icon: <CalendarIcon width={16} height={16} style={{ color: 'var(--gray-12)' }} />,
          href: '/calendar',
        },
        {
          id: 'invites',
          label: 'Инвайты',
          icon: <EnvelopeClosedIcon width={16} height={16} style={{ color: 'var(--gray-12)' }} />,
          children: [
            {
              id: 'invites-list',
              label: 'Список инвайтов',
              icon: <ListBulletIcon width={16} height={16} style={{ color: 'var(--gray-12)' }} />,
              href: '/invites',
            },
            {
              id: 'invites-create',
              label: 'Создать инвайт',
              icon: <PlusIcon width={16} height={16} style={{ color: 'var(--gray-12)' }} />,
              href: '/invites/create',
            },
          ],
        },
      ],
    },
    {
      id: 'aichat',
      label: 'AI Chat',
      icon: <Box style={{ width: '16px', height: '16px', borderRadius: '50%', border: '1px solid var(--gray-12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box style={{ width: '6px', height: '6px', backgroundColor: 'var(--gray-12)', borderRadius: '50%' }} />
      </Box>,
      href: '/aichat',
    },
    {
      id: 'vacancies',
      label: 'Вакансии и финансы',
      icon: <Box style={{ width: '16px', height: '16px', border: '1px solid var(--gray-12)', borderRadius: '2px' }} />,
      children: [
        {
          id: 'vacancies-dashboard',
          label: 'Дашборд',
          icon: <ClockIcon width={16} height={16} style={{ color: 'var(--gray-12)' }} />,
          href: '/vacancies',
        },
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
        {
          id: 'vacancies-salary-ranges',
          label: 'Зарплатные вилки',
          icon: <Box style={{ width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Text size="1" style={{ color: 'var(--gray-12)' }}>$</Text>
          </Box>,
          href: '/vacancies/salary-ranges',
        },
        {
          id: 'vacancies-finance',
          label: 'Грейды, курсы и налоги',
          icon: <BarChartIcon width={16} height={16} style={{ color: 'var(--gray-12)' }} />,
          href: '/finance',
        },
        {
          id: 'vacancies-benchmarks',
          label: 'Бенчмарки',
          icon: <ListBulletIcon width={16} height={16} style={{ color: 'var(--gray-12)' }} />,
          children: [
            {
              id: 'benchmarks-dashboard',
              label: 'Dashboard',
              icon: <DashboardIcon width={16} height={16} style={{ color: 'var(--gray-12)' }} />,
              href: '/vacancies/benchmarks',
            },
            {
              id: 'benchmarks-all',
              label: 'Все бенчмарки',
              icon: <ListBulletIcon width={16} height={16} style={{ color: 'var(--gray-12)' }} />,
              href: '/vacancies/benchmarks/all',
            },
          ],
        },
      ],
    },
    {
      id: 'interviewers',
      label: 'Интервьюеры',
      icon: <PersonIcon width={16} height={16} style={{ color: 'var(--gray-12)' }} />,
      href: '/interviewers',
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
          id: 'company-settings-sla',
          label: 'SLA',
          icon: <ClockIcon width={16} height={16} style={{ color: 'var(--gray-12)' }} />,
          href: '/company-settings/sla',
        },
        {
          id: 'company-settings-benchmark',
          label: 'Бенчмарк',
          icon: <BarChartIcon width={16} height={16} style={{ color: 'var(--gray-12)' }} />,
        },
        {
          id: 'company-settings-scorecard',
          label: 'Scorecard',
          icon: <Box style={{ width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Box style={{ width: '2px', height: '12px', backgroundColor: 'var(--gray-12)', marginRight: '2px' }} />
            <Box style={{ width: '2px', height: '12px', backgroundColor: 'var(--gray-12)' }} />
          </Box>,
          href: '/company-settings/scorecard',
        },
        {
          id: 'company-settings-vacancy-prompt',
          label: 'Единый промпт для вакансий',
          icon: <FileTextIcon width={16} height={16} style={{ color: 'var(--gray-12)' }} />,
          href: '/company-settings/vacancy-prompt',
        },
        {
          id: 'company-settings-integrations',
          label: 'Интеграции',
          icon: <Box style={{ width: '16px', height: '16px', position: 'relative' }}>
            <Box style={{ width: '8px', height: '8px', border: '1px solid var(--gray-12)', borderRadius: '2px', position: 'absolute', top: '0', left: '0' }} />
            <Box style={{ width: '4px', height: '4px', borderTop: '1px solid var(--gray-12)', borderRight: '1px solid var(--gray-12)', position: 'absolute', bottom: '0', right: '0' }} />
          </Box>,
        },
        {
          id: 'company-settings-ai',
          label: 'AI & n8n',
          icon: <Box style={{ width: '16px', height: '16px', borderRadius: '50%', border: '1px solid var(--gray-12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Box style={{ width: '6px', height: '6px', backgroundColor: 'var(--gray-12)', borderRadius: '50%' }} />
          </Box>,
        },
        {
          id: 'company-settings-rules',
          label: 'Правила привлечения',
          icon: <GearIcon width={16} height={16} style={{ color: 'var(--gray-12)' }} />,
        },
        {
          id: 'company-settings-responses',
          label: 'Ответы кандидатам',
          icon: <FileTextIcon width={16} height={16} style={{ color: 'var(--gray-12)' }} />,
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

  return (
    <Box
      position="fixed"
      top="64px"
      left="0"
      bottom="0"
      className={styles.sidebar}
      style={{
        backgroundColor: theme === 'dark' ? 'var(--gray-2, #1c1c1f)' : '#ffffff',
        borderRight: '1px solid var(--gray-a6)',
        transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.2s ease-in-out, background-color 0.2s ease-in-out',
        overflowY: 'auto',
      }}
    >
      <Flex direction="column" p="2" gap="1">
        {/* Основное меню */}
        {menuItems.map((item) => {
          // Определяем активность пункта меню
          let isActive = pathname === item.href || 
            (item.id === 'home' && pathname === '/workflow') ||
            (item.id === 'wiki' && pathname?.startsWith('/wiki')) ||
            (item.id === 'aichat' && pathname?.startsWith('/aichat')) ||
            (item.id === 'google-related' && (
              pathname?.startsWith('/finance') || 
              pathname?.startsWith('/calendar') || 
              pathname?.startsWith('/invites')
            )) ||
            (item.id === 'vacancies' && pathname?.startsWith('/vacancies'))
          
          return (
            <MenuItemComponent
              key={item.id}
              item={item}
              isActive={isActive}
              onNavigate={onClose}
              pathname={pathname}
            />
          )
        })}

        {/* Разделитель */}
        <Separator size="4" my="2" />

        {/* Настройки */}
        {settingsItems.map((item) => {
          // Проверяем, является ли текущая страница активной
          let isActive = pathname === item.href
          
          // Для страницы интеграций проверяем активную вкладку в localStorage
          if (item.id === 'settings-integrations' && pathname === '/profile') {
            if (typeof window !== 'undefined') {
              const activeTab = localStorage.getItem('profileActiveTab')
              isActive = activeTab === 'integrations'
            }
          } else if (item.id === 'profile' && pathname === '/profile') {
            // Для профиля проверяем, что активная вкладка - это профиль (или не установлена)
            if (typeof window !== 'undefined') {
              const activeTab = localStorage.getItem('profileActiveTab')
              isActive = !activeTab || activeTab === 'profile'
            }
          } else if (item.id === 'company-settings' && pathname?.startsWith('/company-settings')) {
            // Для настроек компании проверяем путь
            isActive = isItemOrChildrenActive(item, pathname)
          }
          
          return (
            <MenuItemComponent
              key={item.id}
              item={item}
              isActive={isActive}
              onNavigate={onClose}
              pathname={pathname}
            />
          )
        })}
      </Flex>
    </Box>
  )
}
