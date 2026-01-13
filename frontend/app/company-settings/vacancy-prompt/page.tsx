'use client'

import AppLayout from "@/components/AppLayout"
import { Box, Text } from "@radix-ui/themes"
import VacancyPromptSettings from "@/components/company-settings/VacancyPromptSettings"
import styles from '../company-settings.module.css'

export default function VacancyPromptPage() {
  return (
    <AppLayout pageTitle="Единый промпт для вакансий">
      <Box className={styles.container}>
        <Text size="6" weight="bold" mb="4" style={{ display: 'block' }}>
          Единый промпт для вакансий
        </Text>

        <VacancyPromptSettings />
      </Box>
    </AppLayout>
  )
}
