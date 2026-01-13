'use client'

import AppLayout from "@/components/AppLayout"
import { Box, Flex, Text, Tabs } from "@radix-ui/themes"
import { ChatBubbleIcon, StarIcon, CalendarIcon } from "@radix-ui/react-icons"
import { useSearchParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import GeneralTemplatesTab from "@/components/candidate-responses/GeneralTemplatesTab"
import GradeTemplatesTab from "@/components/candidate-responses/GradeTemplatesTab"
import SlotsTab from "@/components/candidate-responses/SlotsTab"
import styles from './candidate-responses.module.css'

export default function CandidateResponsesPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const tabParam = searchParams.get('tab')
  const [activeTab, setActiveTab] = useState<'general' | 'grades' | 'slots'>(
    (tabParam === 'general' || tabParam === 'grades' || tabParam === 'slots') 
      ? tabParam 
      : 'general'
  )

  useEffect(() => {
    if (tabParam && (tabParam === 'general' || tabParam === 'grades' || tabParam === 'slots')) {
      setActiveTab(tabParam)
    }
  }, [tabParam])

  const handleTabChange = (value: string) => {
    setActiveTab(value as 'general' | 'grades' | 'slots')
    router.push(`/candidate-responses?tab=${value}`, { scroll: false })
  }

  return (
    <AppLayout pageTitle="Ответы кандидатам">
      <Box className={styles.container}>
        <Flex direction="column" gap="4">
          <Text size="6" weight="bold">
            Ответы кандидатам
          </Text>

          <Tabs.Root value={activeTab} onValueChange={handleTabChange} className={styles.tabs}>
            <Tabs.List className={styles.tabList}>
              <Tabs.Trigger value="general" className={styles.tab}>
                <ChatBubbleIcon width={16} height={16} />
                Общие
              </Tabs.Trigger>
              <Tabs.Trigger value="grades" className={styles.tab}>
                <StarIcon width={16} height={16} />
                По грейдам
              </Tabs.Trigger>
              <Tabs.Trigger value="slots" className={styles.tab}>
                <CalendarIcon width={16} height={16} />
                Слоты
              </Tabs.Trigger>
            </Tabs.List>

            <Box className={styles.tabContent}>
              <Tabs.Content value="general">
                <GeneralTemplatesTab />
              </Tabs.Content>

              <Tabs.Content value="grades">
                <GradeTemplatesTab />
              </Tabs.Content>

              <Tabs.Content value="slots">
                <SlotsTab />
              </Tabs.Content>
            </Box>
          </Tabs.Root>
        </Flex>
      </Box>
    </AppLayout>
  )
}
