'use client'

import { Box, Text, Flex } from "@radix-ui/themes"
import { PersonIcon, Pencil1Icon, LightningBoltIcon } from "@radix-ui/react-icons"
import styles from './ProfileNavigation.module.css'

type TabType = 'profile' | 'edit' | 'integrations' | 'quick-buttons'

interface ProfileNavigationProps {
  activeTab: TabType
  onTabChange: (tab: TabType) => void
}

interface MenuItem {
  id: TabType
  label: string
  icon: React.ReactNode
}

export default function ProfileNavigation({
  activeTab,
  onTabChange
}: ProfileNavigationProps) {
  const menuItems: MenuItem[] = [
    { id: 'profile', label: 'Профиль', icon: <PersonIcon width="14" height="14" /> },
    { id: 'edit', label: 'Редактировать', icon: <Pencil1Icon width="14" height="14" /> },
    { id: 'integrations', label: 'Интеграции и API', icon: <LightningBoltIcon width="14" height="14" /> },
    { id: 'quick-buttons', label: 'Быстрые кнопки', icon: <LightningBoltIcon width="14" height="14" /> },
  ]

  return (
    <Box className={styles.navigation}>
      {menuItems.map((item) => {
        const isActive = activeTab === item.id
        return (
          <Box
            key={item.id}
            className={`${styles.menuItem} ${isActive ? styles.active : ''}`}
            onClick={() => onTabChange(item.id)}
          >
            <Flex align="center" gap="2">
              {item.icon}
              <Text size="2" weight={isActive ? "medium" : "regular"}>
                {item.label}
              </Text>
            </Flex>
          </Box>
        )
      })}
    </Box>
  )
}
