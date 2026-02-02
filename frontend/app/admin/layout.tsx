/**
 * Admin layout — общий layout раздела админки (Radix, AppLayout).
 * Левосторонний сайдбар в стиле основного Sidebar; бургер в Header открывает/закрывает его.
 */

'use client'

import { Box } from '@radix-ui/themes'
import { useState, useEffect } from 'react'
import { HamburgerMenuIcon } from '@radix-ui/react-icons'
import AppLayout from '@/components/AppLayout'
import AdminSidebar from './AdminSidebar'
import styles from './admin.module.css'

const ADMIN_SIDEBAR_STORAGE_KEY = 'adminSidebarOpen'
const DESKTOP_BREAKPOINT = 768

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [adminSidebarOpen, setAdminSidebarOpen] = useState(() => {
    if (typeof window === 'undefined') return true
    if (window.innerWidth < DESKTOP_BREAKPOINT) return false
    try {
      return localStorage.getItem(ADMIN_SIDEBAR_STORAGE_KEY) !== 'false'
    } catch {
      return true
    }
  })

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(ADMIN_SIDEBAR_STORAGE_KEY, String(adminSidebarOpen))
    } catch {}
  }, [adminSidebarOpen])

  const burgerButton = (
    <Box
      data-tour="header-admin-burger"
      onClick={() => setAdminSidebarOpen((v) => !v)}
      title={adminSidebarOpen ? 'Закрыть меню админки' : 'Открыть меню админки'}
      aria-label={adminSidebarOpen ? 'Закрыть меню админки' : 'Открыть меню админки'}
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
    >
      <HamburgerMenuIcon width={16} height={16} style={{ color: 'var(--gray-12)' }} />
    </Box>
  )

  return (
    <AppLayout pageTitle="Admin CRM" leftHeaderContent={burgerButton}>
      <AdminSidebar isOpen={adminSidebarOpen} onClose={() => setAdminSidebarOpen(false)} />
      <Box
        className={styles.adminWrap}
        style={{ marginLeft: adminSidebarOpen ? 280 : 0, transition: 'margin-left 0.2s ease-in-out' }}
      >
        <Box className={styles.content}>
          {children}
        </Box>
      </Box>
    </AppLayout>
  )
}
