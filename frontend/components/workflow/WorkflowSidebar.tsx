'use client'

import { Box, Text, Flex } from "@radix-ui/themes"
import { ChevronDownIcon, CalendarIcon, ChevronRightIcon } from "@radix-ui/react-icons"
import { useState } from "react"
import styles from './WorkflowSidebar.module.css'

export default function WorkflowSidebar() {
  const [commandsExpanded, setCommandsExpanded] = useState(true)
  const [reportsExpanded, setReportsExpanded] = useState(true)

  return (
    <Flex direction="column" gap="3" className={styles.sidebar}>
      {/* Команды чата */}
      <Box className={styles.panel}>
        <Flex
          align="center"
          justify="between"
          className={styles.panelHeader}
          onClick={() => setCommandsExpanded(!commandsExpanded)}
          style={{ cursor: 'pointer' }}
        >
          <Text size="3" weight="bold" style={{ color: '#ffffff' }}>
            Команды чата
          </Text>
          <ChevronDownIcon
            width={16}
            height={16}
            style={{
              color: '#ffffff',
              transform: commandsExpanded ? 'rotate(0deg)' : 'rotate(180deg)',
              transition: 'transform 0.2s ease-in-out',
            }}
          />
        </Flex>

        {commandsExpanded && (
          <Box className={styles.panelContent}>
            <Box className={styles.commandItem}>
              <Flex align="center" gap="2" mb="2">
                <Box className={styles.commandLabel} style={{ backgroundColor: '#10b981' }}>
                  <Text size="1" weight="bold" style={{ color: '#ffffff' }}>
                    /s
                  </Text>
                </Box>
                <Text size="2" weight="medium">
                  HR-скрининг
                </Text>
              </Flex>
              <Text size="1" color="gray" style={{ display: 'block', marginBottom: '4px' }}>
                https://huntflow.ru/...
              </Text>
              <Text size="1" color="gray" style={{ fontStyle: 'italic' }}>
                [ответы]
              </Text>
            </Box>

            <Box className={styles.commandItem} style={{ marginTop: '16px' }}>
              <Flex align="center" gap="2" mb="2">
                <Box className={styles.commandLabel} style={{ backgroundColor: '#f59e0b' }}>
                  <Text size="1" weight="bold" style={{ color: '#ffffff' }}>
                    /t
                  </Text>
                </Box>
                <Text size="2" weight="medium">
                  Tech Screening
                </Text>
              </Flex>
              <Text size="1" color="gray" style={{ display: 'block', marginBottom: '4px' }}>
                https://huntflow.ru/...
              </Text>
              <Text size="1" color="gray" style={{ fontStyle: 'italic' }}>
                [дата время] (время) интервьюер
              </Text>
            </Box>
          </Box>
        )}
      </Box>

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
