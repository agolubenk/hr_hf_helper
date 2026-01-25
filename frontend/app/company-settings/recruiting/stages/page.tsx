'use client'

import AppLayout from "@/components/AppLayout"
import { Box, Text } from "@radix-ui/themes"
import RecruitingStagesSettings from "@/components/company-settings/RecruitingStagesSettings"
import styles from '../../company-settings.module.css'

export default function RecruitingStagesSettingsPage() {
  return (
    <AppLayout pageTitle="Этапы найма и причины отказа">
      <Box data-tour="recruiting-settings-page" className={styles.container}>
        <Box mb="4">
          <Text size="6" weight="bold" style={{ display: 'block' }}>
            Этапы найма и причины отказа
          </Text>
        </Box>

        <RecruitingStagesSettings />
      </Box>
    </AppLayout>
  )
}
