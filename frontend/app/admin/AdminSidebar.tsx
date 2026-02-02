/**
 * AdminSidebar — левосторонний сайдбар админки в стиле основного Sidebar.
 * Фиксированная позиция слева (left: 0), ширина 280px, все пункты по модулям.
 * Открывается/закрывается бургером в Header.
 */

'use client'

import { Flex, Box, Text } from '@radix-ui/themes'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from '@/components/ThemeProvider'
import { ADMIN_MODULES } from './config'
import sidebarStyles from '@/components/Sidebar.module.css'
import styles from './admin.module.css'

const TOP_OFFSET = '64px' // под Header

interface AdminSidebarProps {
  isOpen: boolean
  onClose?: () => void
}

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname()
  const { theme } = useTheme()

  const isActive = (href: string) =>
    pathname === href || (pathname?.startsWith(href + '/') ?? false)

  return (
    <Box
      position="fixed"
      top={TOP_OFFSET}
      left="0"
      bottom="0"
      className={styles.adminSidebar}
      style={{
        width: 280,
        backgroundColor: theme === 'dark' ? 'var(--gray-2, #1c1c1f)' : '#ffffff',
        borderRight: '1px solid var(--gray-a6)',
        transition: 'transform 0.2s ease-in-out, background-color 0.2s ease-in-out',
        overflowY: 'auto',
        transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
        zIndex: 999,
      }}
      aria-label="Админка по модулям"
    >
      <Flex direction="column" p="2" gap="1">
        <Link
          href="/admin"
          className={`${sidebarStyles.menuItem} ${pathname === '/admin' ? sidebarStyles.menuItemActive : ''}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 12px',
            borderRadius: 6,
            backgroundColor: pathname === '/admin' ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
            cursor: 'pointer',
            textDecoration: 'none',
            color: 'var(--gray-12)',
            marginBottom: 2,
          }}
        >
          <Text size="2">Главная</Text>
        </Link>

        {ADMIN_MODULES.map((module) => (
          <Box key={module.id} mt="2">
            <Text
              size="1"
              weight="bold"
              className={styles.sidebarModuleLabel}
              style={{ paddingLeft: 12, paddingTop: 4, paddingBottom: 4 }}
            >
              {module.label}
            </Text>
            <Flex direction="column" gap="1">
              {module.items.map((item) => {
                const active = isActive(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`${sidebarStyles.menuItem} ${active ? sidebarStyles.menuItemActive : ''}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '8px 12px 8px 24px',
                      borderRadius: 6,
                      backgroundColor: active ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                      cursor: 'pointer',
                      textDecoration: 'none',
                      color: 'var(--gray-12)',
                      transition: 'all 0.2s ease-in-out',
                    }}
                    onMouseEnter={(e) => {
                      if (!active) e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)'
                    }}
                    onMouseLeave={(e) => {
                      if (!active) e.currentTarget.style.backgroundColor = 'transparent'
                    }}
                  >
                    <Text size="2">{item.label}</Text>
                  </Link>
                )
              })}
            </Flex>
          </Box>
        ))}
      </Flex>
    </Box>
  )
}
