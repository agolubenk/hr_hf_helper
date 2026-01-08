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
  OpenInNewWindowIcon
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
}

function MenuItemComponent({ item, isActive = false, level = 0, onNavigate }: MenuItemComponentProps) {
  const router = useRouter()
  const hasChildren = item.children && item.children.length > 0
  // Некоторые разделы открыты по умолчанию
  const defaultExpanded = item.id === 'invites' || item.id === 'google-oauth'
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  const handleClick = () => {
    if (hasChildren) {
      setIsExpanded(!isExpanded)
    } else if (item.href) {
      // Если это ссылка, выполняем навигацию
      if (item.external) {
        // Внешняя ссылка открывается в новой вкладке
        window.open(item.href, '_blank')
      } else {
        // Внутренняя ссылка - используем Next.js роутер
        // Если это ссылка на профиль с интеграциями, устанавливаем активную вкладку
        if (item.id === 'settings-integrations' && item.href === '/profile') {
          // Сохраняем активную вкладку в localStorage для открытия страницы с интеграциями
          if (typeof window !== 'undefined') {
            localStorage.setItem('profileActiveTab', 'integrations')
            // Отправляем кастомное событие для синхронизации в той же вкладке
            window.dispatchEvent(new CustomEvent('localStorageChange', {
              detail: {
                key: 'profileActiveTab',
                value: 'integrations'
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
    }
  }

  return (
    <Box>
      <Flex
        align="center"
        gap="2"
        px="3"
        py="2"
        style={{
          backgroundColor: isActive ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
          borderRadius: '6px',
          cursor: item.href || hasChildren ? 'pointer' : 'default',
          paddingLeft: level > 0 ? `${16 + level * 20}px` : '12px',
          position: 'relative',
          marginBottom: '2px',
        }}
        onClick={(e) => {
          e.preventDefault()
          handleClick()
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
        <Flex direction="column" style={{ marginTop: '4px' }}>
          {item.children!.map((child) => (
            <MenuItemComponent
              key={child.id}
              item={child}
              level={level + 1}
              onNavigate={onNavigate}
            />
          ))}
        </Flex>
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
      href: '/',
    },
    {
      id: 'huntflow',
      label: 'Huntflow',
      icon: <PersonIcon width={16} height={16} style={{ color: 'var(--gray-12)' }} />,
    },
    {
      id: 'google-oauth',
      label: 'Google OAuth',
      icon: <Text size="1" weight="bold" style={{ color: 'var(--gray-12)', width: '16px', textAlign: 'center' }}>G</Text>,
      children: [],
    },
    {
      id: 'calendar',
      label: 'Календарь',
      icon: <CalendarIcon width={16} height={16} style={{ color: 'var(--gray-12)' }} />,
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
        },
        {
          id: 'invites-create',
          label: 'Создать инвайт',
          icon: <PlusIcon width={16} height={16} style={{ color: 'var(--gray-12)' }} />,
        },
      ],
    },
    {
      id: 'scorecard',
      label: 'Настройки Scorecard',
      icon: <Box style={{ width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box style={{ width: '2px', height: '12px', backgroundColor: 'var(--gray-12)', marginRight: '2px' }} />
        <Box style={{ width: '2px', height: '12px', backgroundColor: 'var(--gray-12)' }} />
      </Box>,
    },
    {
      id: 'gemini',
      label: 'Gemini AI',
      icon: <Box style={{ width: '16px', height: '16px', borderRadius: '50%', border: '1px solid var(--gray-12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box style={{ width: '6px', height: '6px', backgroundColor: 'var(--gray-12)', borderRadius: '50%' }} />
      </Box>,
    },
    {
      id: 'vacancies',
      label: 'Вакансии и финансы',
      icon: <Box style={{ width: '16px', height: '16px', border: '1px solid var(--gray-12)', borderRadius: '2px' }} />,
      children: [],
    },
    {
      id: 'interviewers',
      label: 'Интервьюеры',
      icon: <PersonIcon width={16} height={16} style={{ color: 'var(--gray-12)' }} />,
      children: [],
    },
    {
      id: 'integrations',
      label: 'Интеграции',
      icon: <Box style={{ width: '16px', height: '16px', position: 'relative' }}>
        <Box style={{ width: '8px', height: '8px', border: '1px solid var(--gray-12)', borderRadius: '2px', position: 'absolute', top: '0', left: '0' }} />
        <Box style={{ width: '4px', height: '4px', borderTop: '1px solid var(--gray-12)', borderRight: '1px solid var(--gray-12)', position: 'absolute', bottom: '0', right: '0' }} />
      </Box>,
      children: [],
    },
    {
      id: 'wiki',
      label: 'Вики',
      icon: <Box style={{ width: '16px', height: '16px', border: '1px solid var(--gray-12)', borderRadius: '1px', position: 'relative' }}>
        <Box style={{ width: '10px', height: '2px', backgroundColor: 'var(--gray-12)', position: 'absolute', top: '4px', left: '3px' }} />
        <Box style={{ width: '10px', height: '2px', backgroundColor: 'var(--gray-12)', position: 'absolute', top: '7px', left: '3px' }} />
      </Box>,
    },
    {
      id: 'reporting',
      label: 'Отчетность',
      icon: <ListBulletIcon width={16} height={16} style={{ color: 'var(--gray-12)' }} />,
      children: [],
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
        {menuItems.map((item) => (
          <MenuItemComponent
            key={item.id}
            item={item}
            isActive={pathname === item.href || (item.id === 'home' && pathname === '/')}
            onNavigate={onClose}
          />
        ))}

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
          }
          
          return (
            <MenuItemComponent
              key={item.id}
              item={item}
              isActive={isActive}
              onNavigate={onClose}
            />
          )
        })}
      </Flex>
    </Box>
  )
}
