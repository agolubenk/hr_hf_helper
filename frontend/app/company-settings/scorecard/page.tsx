'use client'

import AppLayout from "@/components/AppLayout"
import { Box, Text } from "@radix-ui/themes"
import ScorecardSettings from "@/components/company-settings/ScorecardSettings"
import styles from '../company-settings.module.css'

export default function ScorecardSettingsPage() {
  return (
    <AppLayout pageTitle="Настройки Scorecard">
      <Box className={styles.container}>
        <Text size="6" weight="bold" mb="4" style={{ display: 'block' }}>
          Настройки Scorecard
        </Text>

        <ScorecardSettings />
      </Box>
    </AppLayout>
  )
}
