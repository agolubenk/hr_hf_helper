'use client'

import AppLayout from "@/components/AppLayout"
import { Box, Text } from "@radix-ui/themes"
import SLASettings from "@/components/company-settings/SLASettings"
import styles from '../company-settings.module.css'

export default function SLASettingsPage() {
  return (
    <AppLayout pageTitle="SLA для вакансий">
      <Box className={styles.container}>
        <Text size="6" weight="bold" mb="4" style={{ display: 'block' }}>
          SLA для вакансий
        </Text>

        <SLASettings />
      </Box>
    </AppLayout>
  )
}
