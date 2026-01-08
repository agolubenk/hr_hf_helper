'use client'

import { Box, Text, Flex, Button } from "@radix-ui/themes"
import { ChevronDownIcon, CalendarIcon, ChevronRightIcon, OpenInNewWindowIcon } from "@radix-ui/react-icons"
import { useState } from "react"
import styles from './WorkflowSidebar.module.css'

export default function WorkflowSidebar() {
  const [reportsExpanded, setReportsExpanded] = useState(true)

  const handleWikiClick = () => {
    window.open('/wiki', '_blank')
  }

  return (
    <Flex direction="column" gap="3" className={styles.sidebar}>
      {/* Кнопка для открытия вики */}
      <Button
        size="3"
        variant="solid"
        onClick={handleWikiClick}
        style={{
          width: '100%',
          backgroundColor: 'var(--accent-9)',
          color: '#ffffff',
        }}
      >
        <Text size="3" weight="medium">Вики</Text>
        <OpenInNewWindowIcon width={16} height={16} />
      </Button>

      {/* Отчеты последних недель */}
      <Box className={styles.panel}>
        <Flex
          align="center"
          justify="between"
          className={styles.panelHeader}
          onClick={() => setReportsExpanded(!reportsExpanded)}
          style={{ cursor: 'pointer' }}
        >
          <Text size="3" weight="bold" style={{ color: '#ffffff' }}>
            Отчеты последних недель
          </Text>
          <ChevronDownIcon
            width={16}
            height={16}
            style={{
              color: '#ffffff',
              transform: reportsExpanded ? 'rotate(0deg)' : 'rotate(180deg)',
              transition: 'transform 0.2s ease-in-out',
            }}
          />
        </Flex>

        {reportsExpanded && (
          <Box className={styles.panelContent}>
            <Flex
              align="center"
              gap="2"
              className={styles.reportItem}
              style={{ cursor: 'pointer' }}
            >
              <CalendarIcon width={16} height={16} />
              <Text size="2" style={{ flex: 1 }}>
                Текущая неделя
              </Text>
              <ChevronRightIcon width={16} height={16} />
            </Flex>

            <Flex
              align="center"
              gap="2"
              className={styles.reportItem}
              style={{ cursor: 'pointer', marginTop: '8px' }}
            >
              <CalendarIcon width={16} height={16} />
              <Text size="2" style={{ flex: 1 }}>
                Предыдущая неделя
              </Text>
              <ChevronRightIcon width={16} height={16} />
            </Flex>
          </Box>
        )}
      </Box>
    </Flex>
  )
}
