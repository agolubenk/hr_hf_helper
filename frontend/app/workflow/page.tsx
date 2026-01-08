'use client'

import AppLayout from "@/components/AppLayout"
import WorkflowHeader from "@/components/workflow/WorkflowHeader"
import WorkflowChat from "@/components/workflow/WorkflowChat"
import WorkflowSidebar from "@/components/workflow/WorkflowSidebar"
import SlotsPanel from "@/components/workflow/SlotsPanel"
import { Box, Flex } from "@radix-ui/themes"
import { useState, useEffect } from "react"
import styles from './workflow.module.css'

export default function WorkflowPage() {
  const [slotsOpen, setSlotsOpen] = useState(false)

  // Устанавливаем верхний padding 8px для AppLayout content только на этой странице
  useEffect(() => {
    const contentElement = document.querySelector('.rt-Box.AppLayout_content__XSUzC') as HTMLElement
    if (contentElement) {
      const originalPaddingTop = contentElement.style.paddingTop
      contentElement.style.paddingTop = '8px'
      
      return () => {
        // Восстанавливаем оригинальный padding при размонтировании
        if (originalPaddingTop) {
          contentElement.style.paddingTop = originalPaddingTop
        } else {
          contentElement.style.paddingTop = ''
        }
      }
    }
  }, [])

  return (
    <AppLayout pageTitle="Workflow">
      <Box className={styles.workflowContainer}>
        <WorkflowHeader 
          onSlotsClick={() => setSlotsOpen(!slotsOpen)}
          slotsOpen={slotsOpen}
        />
        
        {slotsOpen && (
          <Box className={styles.slotsContainer}>
            <SlotsPanel />
          </Box>
        )}

        <Flex gap="4" className={styles.mainContent}>
          <Box className={styles.chatColumn}>
            <WorkflowChat />
          </Box>
          
          <Box className={styles.sidebarColumn}>
            <WorkflowSidebar />
          </Box>
        </Flex>
      </Box>
    </AppLayout>
  )
}
