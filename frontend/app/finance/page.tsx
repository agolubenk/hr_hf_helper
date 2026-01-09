'use client'

import AppLayout from "@/components/AppLayout"
import { Box, Flex, Text, Tabs } from "@radix-ui/themes"
import { StarIcon, ReloadIcon, MixerHorizontalIcon } from "@radix-ui/react-icons"
import GradesSection from "@/components/finance/GradesSection"
import CurrencyRatesSection from "@/components/finance/CurrencyRatesSection"
import TaxesSection from "@/components/finance/TaxesSection"
import { useSearchParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import styles from './finance.module.css'

export default function FinancePage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const tabParam = searchParams.get('tab')
  const [activeTab, setActiveTab] = useState<'grades' | 'currencies' | 'taxes'>(
    (tabParam === 'grades' || tabParam === 'currencies' || tabParam === 'taxes') 
      ? tabParam 
      : 'grades'
  )

  useEffect(() => {
    if (tabParam && (tabParam === 'grades' || tabParam === 'currencies' || tabParam === 'taxes')) {
      setActiveTab(tabParam)
    }
  }, [tabParam])

  const handleTabChange = (value: string) => {
    setActiveTab(value as 'grades' | 'currencies' | 'taxes')
    router.push(`/finance?tab=${value}`, { scroll: false })
  }

  return (
    <AppLayout pageTitle="Финансы и грейды">
      <Box className={styles.container}>
        <Flex direction="column" gap="4">
          <Tabs.Root value={activeTab} onValueChange={handleTabChange} className={styles.tabs}>
            <Tabs.List className={styles.tabList}>
              <Tabs.Trigger value="grades" className={styles.tab}>
                <StarIcon width={16} height={16} />
                Грейды
              </Tabs.Trigger>
              <Tabs.Trigger value="currencies" className={styles.tab}>
                <ReloadIcon width={16} height={16} />
                Курсы валют
              </Tabs.Trigger>
              <Tabs.Trigger value="taxes" className={styles.tab}>
                <MixerHorizontalIcon width={16} height={16} />
                Налоги PLN
              </Tabs.Trigger>
            </Tabs.List>

            <Box className={styles.tabContent}>
              <Tabs.Content value="grades">
                <GradesSection />
              </Tabs.Content>

              <Tabs.Content value="currencies">
                <CurrencyRatesSection />
              </Tabs.Content>

              <Tabs.Content value="taxes">
                <TaxesSection />
              </Tabs.Content>
            </Box>
          </Tabs.Root>
        </Flex>
      </Box>
    </AppLayout>
  )
}
