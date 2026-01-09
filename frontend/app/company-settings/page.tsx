'use client'

import AppLayout from "@/components/AppLayout"
import { Box, Text } from "@radix-ui/themes"
import GeneralSettings from "@/components/company-settings/GeneralSettings"
import styles from './company-settings.module.css'

export default function CompanySettingsPage() {
  return (
    <AppLayout pageTitle="Общие настройки компании">
      <Box className={styles.container}>
        <Text size="6" weight="bold" mb="4" style={{ display: 'block' }}>
          Общие настройки
        </Text>

        <GeneralSettings />
      </Box>
    </AppLayout>
  )
}
