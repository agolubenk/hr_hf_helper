'use client'

import AppLayout from "@/components/AppLayout"
import { Box, Text } from "@radix-ui/themes"
import RecruitingStagesSettings from "@/components/company-settings/RecruitingStagesSettings"
import styles from '../../company-settings.module.css'

export default function RecruitingStagesSettingsPage() {
  return (
    <AppLayout pageTitle="Этапы найма и причины отказа">
      <Box className={styles.container}>
        <Text size="6" weight="bold" mb="4" style={{ display: 'block' }}>
          Этапы найма и причины отказа
        </Text>

        <RecruitingStagesSettings />
      </Box>
    </AppLayout>
  )
}
