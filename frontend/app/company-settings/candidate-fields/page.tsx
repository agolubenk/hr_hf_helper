'use client'

import AppLayout from "@/components/AppLayout"
import { Box, Text } from "@radix-ui/themes"
import CandidateFieldsSettings from "@/components/company-settings/CandidateFieldsSettings"
import styles from '../company-settings.module.css'

export default function CandidateFieldsSettingsPage() {
  return (
    <AppLayout pageTitle="Настройки дополнительных полей кандидатов">
      <Box className={styles.container}>
        <Text size="6" weight="bold" mb="4" style={{ display: 'block' }}>
          Настройки дополнительных полей кандидатов
        </Text>

        <CandidateFieldsSettings />
      </Box>
    </AppLayout>
  )
}
