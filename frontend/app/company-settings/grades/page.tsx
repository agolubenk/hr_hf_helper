'use client'

import AppLayout from "@/components/AppLayout"
import { Box, Text } from "@radix-ui/themes"
import GradesSettings from "@/components/company-settings/GradesSettings"
import styles from '../company-settings.module.css'

export default function GradesSettingsPage() {
  return (
    <AppLayout pageTitle="Настройки грейдов">
      <Box className={styles.container}>
        <Text size="6" weight="bold" mb="4" style={{ display: 'block' }}>
          Настройки грейдов
        </Text>

        <GradesSettings />
      </Box>
    </AppLayout>
  )
}
