'use client'

import AppLayout from "@/components/AppLayout"
import { Flex, Box } from "@radix-ui/themes"
import UserCard from "@/components/profile/UserCard"
import ProfileNavigation from "@/components/profile/ProfileNavigation"
import ProfileInfo from "@/components/profile/ProfileInfo"
import ProfileEditForm from "@/components/profile/ProfileEditForm"
import IntegrationsPage from "@/components/profile/IntegrationsPage"
import AccentColorSettings from "@/components/profile/AccentColorSettings"
import QuickButtonsPage from "@/components/profile/QuickButtonsPage"
import { useTheme } from "@/components/ThemeProvider"
import { useState, useEffect } from "react"
import styles from './profile.module.css'

type TabType = 'profile' | 'edit' | 'integrations' | 'quick-buttons'

export default function ProfilePage() {
  // Загружаем активную вкладку из localStorage или используем 'profile' по умолчанию
  const getInitialTab = (): TabType => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('profileActiveTab')
      if (saved === 'profile' || saved === 'edit' || saved === 'integrations' || saved === 'quick-buttons') {
        return saved as TabType
      }
    }
    return 'profile'
  }

  const [activeTab, setActiveTab] = useState<TabType>(getInitialTab)

  // Сохраняем активную вкладку в localStorage при изменении
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('profileActiveTab', activeTab)
    }
  }, [activeTab])

  // Слушаем изменения в localStorage для синхронизации (например, при клике на "Интеграции и API" из меню)
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'profileActiveTab' && e.newValue) {
        const newTab = e.newValue as TabType
        if (newTab === 'profile' || newTab === 'edit' || newTab === 'integrations' || newTab === 'quick-buttons') {
          setActiveTab(newTab)
        }
      }
    }

    // Кастомное событие для синхронизации в той же вкладке
    const handleCustomStorageChange = (e: CustomEvent) => {
      if (e.detail?.key === 'profileActiveTab' && e.detail?.value) {
        const newTab = e.detail.value as TabType
        if (newTab === 'profile' || newTab === 'edit' || newTab === 'integrations' || newTab === 'quick-buttons') {
          setActiveTab(newTab)
        }
      }
    }

    // Проверяем изменения при фокусе на окне
    const handleFocus = () => {
      const saved = localStorage.getItem('profileActiveTab')
      if (saved && (saved === 'profile' || saved === 'edit' || saved === 'integrations' || saved === 'quick-buttons')) {
        setActiveTab(saved as TabType)
      }
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('localStorageChange', handleCustomStorageChange as EventListener)
    window.addEventListener('focus', handleFocus)

    // Периодическая проверка для надежной синхронизации
    const intervalId = setInterval(() => {
      const saved = localStorage.getItem('profileActiveTab')
      if (saved && (saved === 'profile' || saved === 'edit' || saved === 'integrations' || saved === 'quick-buttons')) {
        const newTab = saved as TabType
        setActiveTab(prev => {
          if (prev !== newTab) {
            return newTab
          }
          return prev
        })
      }
    }, 200)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('localStorageChange', handleCustomStorageChange as EventListener)
      window.removeEventListener('focus', handleFocus)
      clearInterval(intervalId)
    }
  }, [])
  const { lightThemeAccentColor, darkThemeAccentColor, setLightThemeAccentColor, setDarkThemeAccentColor } = useTheme()

  // Моковые данные пользователя (в реальном приложении будут приходить из API)
  const userData = {
    firstName: 'Andrei',
    lastName: 'Golubenko',
    email: 'andrei.golubenko@softnetix.io',
    telegram: 'talent_softnetix',
    linkedin: 'andrei-golubenko',
    registrationDate: '05.09.2025 15:03',
    lastLoginDate: '08.01.2026 10:57',
    workSchedule: '11:00 - 18:30',
    workStartTime: '11:00',
    workEndTime: '18:30',
    meetingInterval: '15',
    activeEnvironment: 'Прод',
  }

  const handleSave = (data: {
    firstName: string
    lastName: string
    email: string
    telegram?: string
    linkedin?: string
    workStartTime?: string
    workEndTime?: string
    meetingInterval?: string
  }) => {
    console.log('Сохранение данных:', data)
    // Здесь будет логика сохранения через API
    // После успешного сохранения можно вернуться на вкладку профиля
    // setActiveTab('profile')
  }

  const handleCancel = () => {
    setActiveTab('profile')
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileInfo userData={userData} />
      case 'edit':
        return (
          <Flex direction="column" gap="4">
            <ProfileEditForm
              initialData={{
                firstName: userData.firstName,
                lastName: userData.lastName,
                email: userData.email,
                telegram: userData.telegram,
                linkedin: userData.linkedin,
                workStartTime: userData.workStartTime,
                workEndTime: userData.workEndTime,
                meetingInterval: userData.meetingInterval,
              }}
              onCancel={handleCancel}
              onSave={handleSave}
            />
            {/* Настройки акцентного цвета под карточкой редактирования */}
            <AccentColorSettings
              lightThemeColor={lightThemeAccentColor}
              darkThemeColor={darkThemeAccentColor}
              onLightThemeColorChange={(color) => {
                setLightThemeAccentColor(color)
                // Остаемся на вкладке редактирования
              }}
              onDarkThemeColorChange={(color) => {
                setDarkThemeAccentColor(color)
                // Остаемся на вкладке редактирования
              }}
            />
          </Flex>
        )
      case 'integrations':
        return <IntegrationsPage />
      case 'quick-buttons':
        return <QuickButtonsPage />
      default:
        return null
    }
  }

  return (
    <AppLayout pageTitle="Профиль">
      <Box id="main-content-start" className={styles.profileWrapper}>
        <Flex gap="4" className={styles.profileLayout}>
          {/* Левая колонка */}
          <Box className={styles.leftColumn}>
            <UserCard 
              firstName={userData.firstName}
              lastName={userData.lastName}
              email={userData.email}
              telegram={userData.telegram}
            />
            <ProfileNavigation 
              activeTab={activeTab} 
              onTabChange={setActiveTab}
            />
          </Box>

          {/* Правая колонка */}
          <Box className={styles.rightColumn}>
            {renderContent()}
          </Box>
        </Flex>
      </Box>
    </AppLayout>
  )
}
