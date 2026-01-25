'use client'

import AppLayout from "@/components/AppLayout"
import { Box, Text } from "@radix-ui/themes"
import EmployeeLifecycleSettings from "@/components/company-settings/EmployeeLifecycleSettings"
import styles from '../company-settings.module.css'

export default function EmployeeLifecyclePage() {
  return (
    <AppLayout pageTitle="Жизненный цикл сотрудников">
      <Box className={styles.container}>
        <Text size="6" weight="bold" mb="4" style={{ display: 'block' }}>
          Жизненный цикл сотрудников
        </Text>

        <EmployeeLifecycleSettings />
      </Box>
    </AppLayout>
  )
}
