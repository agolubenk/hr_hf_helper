/**
 * WorkflowSidebar (components/workflow/WorkflowSidebar.tsx) - Боковая панель страницы workflow
 * 
 * Назначение:
 * - Отображение отчетов по последним неделям
 * - Быстрый доступ к вики
 * - Быстрые действия для коммуникации (Telegram, WhatsApp, Viber, LinkedIn, Email)
 * 
 * Функциональность:
 * - Кнопка "Вики": открытие вики в новой вкладке
 * - Отчеты последних недель: раскрывающиеся секции с таблицами этапов
 *   - Текущая неделя: статистика по этапам за текущую неделю
 *   - Предыдущая неделя: статистика по этапам за предыдущую неделю
 * - Быстрые действия: карточки для быстрого доступа к коммуникации
 *   - Telegram: несколько аккаунтов
 *   - WhatsApp: несколько номеров
 *   - Viber: несколько номеров
 *   - LinkedIn: несколько профилей
 *   - Email: несколько адресов
 * 
 * Связи:
 * - workflow/page.tsx: отображается на странице workflow
 * - wiki/page.tsx: переход к вики при клике на кнопку
 * - Внешние сервисы: открытие в новой вкладке при клике на карточки
 * 
 * Поведение:
 * - При клике на "Вики" открывает вики в новой вкладке
 * - При клике на секцию отчета раскрывает/сворачивает её
 * - При открытии одной недели автоматически закрывает другую
 * - При клике на карточку быстрого действия открывает соответствующий сервис в новой вкладке
 * 
 * TODO: Загружать данные отчетов из API
 */
'use client'

import { Box, Text, Flex, Button, Table } from "@radix-ui/themes"
import { ChevronDownIcon, CalendarIcon, ChevronUpIcon, OpenInNewWindowIcon, PaperPlaneIcon, EnvelopeClosedIcon } from "@radix-ui/react-icons"
import { useState } from "react"
import styles from './WorkflowSidebar.module.css'

/**
 * WorkflowSidebar - компонент боковой панели страницы workflow
 * 
 * Состояние:
 * - reportsExpanded: флаг раскрытости секции "Отчеты последних недель"
 * - currentWeekExpanded: флаг раскрытости секции "Текущая неделя"
 * - previousWeekExpanded: флаг раскрытости секции "Предыдущая неделя"
 * 
 * Функциональность:
 * - Управление раскрытием/сворачиванием секций отчетов
 * - Отображение таблиц статистики по этапам
 */
export default function WorkflowSidebar() {
  // Флаг раскрытости секции "Отчеты последних недель" (по умолчанию раскрыта)
  const [reportsExpanded, setReportsExpanded] = useState(true)
  // Флаг раскрытости секции "Текущая неделя" (по умолчанию свернута)
  const [currentWeekExpanded, setCurrentWeekExpanded] = useState(false)
  // Флаг раскрытости секции "Предыдущая неделя" (по умолчанию свернута)
  const [previousWeekExpanded, setPreviousWeekExpanded] = useState(false)

  /**
   * handleWikiClick - обработчик клика на кнопку "Вики"
   * 
   * Функциональность:
   * - Открывает страницу вики в новой вкладке
   * 
   * Поведение:
   * - Вызывается при клике на кнопку "Вики"
   * - Открывает /wiki в новой вкладке браузера
   */
  const handleWikiClick = () => {
    window.open('/wiki', '_blank')
  }

  /**
   * handleCurrentWeekClick - обработчик клика на секцию "Текущая неделя"
   * 
   * Функциональность:
   * - Переключает раскрытость секции "Текущая неделя"
   * - Закрывает секцию "Предыдущая неделя" при открытии текущей
   * 
   * Поведение:
   * - Инвертирует состояние currentWeekExpanded
   * - Если открываем текущую неделю - закрываем предыдущую
   */
  const handleCurrentWeekClick = () => {
    const newState = !currentWeekExpanded
    setCurrentWeekExpanded(newState)
    // Если открываем текущую неделю, закрываем предыдущую
    if (newState) {
      setPreviousWeekExpanded(false)
    }
  }

  /**
   * handlePreviousWeekClick - обработчик клика на секцию "Предыдущая неделя"
   * 
   * Функциональность:
   * - Переключает раскрытость секции "Предыдущая неделя"
   * - Закрывает секцию "Текущая неделя" при открытии предыдущей
   * 
   * Поведение:
   * - Инвертирует состояние previousWeekExpanded
   * - Если открываем предыдущую неделю - закрываем текущую
   */
  const handlePreviousWeekClick = () => {
    const newState = !previousWeekExpanded
    setPreviousWeekExpanded(newState)
    // Если открываем предыдущую неделю, закрываем текущую
    if (newState) {
      setCurrentWeekExpanded(false)
    }
  }

  /**
   * stages - данные для таблиц отчетов
   * 
   * Структура:
   * - stage: название этапа найма
   * - count: количество кандидатов на этом этапе
   * 
   * Используется для:
   * - Отображения статистики по этапам в таблицах отчетов
   * 
   * TODO: Загружать из API
   */
  const stages = [
    { stage: 'HR-screening', count: 0 },
    { stage: 'Tech Screening', count: 0 },
    { stage: 'Interview', count: 0 },
    { stage: 'Offer', count: 0 },
    { stage: 'Offer Accepted', count: 0 },
    { stage: 'Onboarding', count: 0 },
  ]

  return (
    <Flex direction="column" gap="3" className={styles.sidebar} style={{ height: '100%' }}>
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
            {/* Текущая неделя */}
            <Box>
              <Flex
                align="center"
                gap="2"
                className={styles.reportItem}
                onClick={handleCurrentWeekClick}
                style={{ cursor: 'pointer' }}
              >
                <CalendarIcon width={16} height={16} />
                <Text size="2" style={{ flex: 1 }}>
                  Текущая неделя
                </Text>
                <ChevronUpIcon
                  width={16}
                  height={16}
                  style={{
                    transform: currentWeekExpanded ? 'rotate(0deg)' : 'rotate(180deg)',
                    transition: 'transform 0.2s ease-in-out',
                  }}
                />
              </Flex>
              
              {currentWeekExpanded && (
                <Box className={styles.reportTable}>
                  <Table.Root>
                    <Table.Header>
                      <Table.Row>
                        <Table.ColumnHeaderCell className={styles.tableHeader}>Этап</Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell className={styles.tableHeader}>Количество</Table.ColumnHeaderCell>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {stages.map((item, index) => (
                        <Table.Row key={index}>
                          <Table.Cell>{item.stage}</Table.Cell>
                          <Table.Cell>{item.count}</Table.Cell>
                        </Table.Row>
                      ))}
                    </Table.Body>
                  </Table.Root>
                </Box>
              )}
            </Box>

            {/* Предыдущая неделя */}
            <Box style={{ marginTop: '4px' }}>
              <Flex
                align="center"
                gap="2"
                className={styles.reportItem}
                onClick={handlePreviousWeekClick}
                style={{ cursor: 'pointer' }}
              >
                <CalendarIcon width={16} height={16} />
                <Text size="2" style={{ flex: 1 }}>
                  Предыдущая неделя
                </Text>
                <ChevronUpIcon
                  width={16}
                  height={16}
                  style={{
                    transform: previousWeekExpanded ? 'rotate(0deg)' : 'rotate(180deg)',
                    transition: 'transform 0.2s ease-in-out',
                  }}
                />
              </Flex>
              
              {previousWeekExpanded && (
                <Box className={styles.reportTable}>
                  <Table.Root>
                    <Table.Header>
                      <Table.Row>
                        <Table.ColumnHeaderCell className={styles.tableHeader}>Этап</Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell className={styles.tableHeader}>Количество</Table.ColumnHeaderCell>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {stages.map((item, index) => (
                        <Table.Row key={index}>
                          <Table.Cell>{item.stage}</Table.Cell>
                          <Table.Cell>{item.count}</Table.Cell>
                        </Table.Row>
                      ))}
                    </Table.Body>
                  </Table.Root>
                </Box>
              )}
            </Box>
          </Box>
        )}
      </Box>

      {/* Карточка быстрых действий */}
      <Box className={`${styles.panel} ${styles.quickActionsPanel}`}>
        <Flex
          align="center"
          justify="between"
          className={styles.panelHeader}
        >
          <Text size="3" weight="bold" style={{ color: '#ffffff' }}>
            Быстрые действия
          </Text>
        </Flex>

        <Box className={styles.panelContent}>
          <Flex direction="column" gap="3" align="center">
            {/* Telegram */}
            <Box
              className={styles.quickActionButton}
              onClick={() => window.open('https://web.telegram.org', '_blank')}
              style={{ backgroundColor: '#0088cc' }}
              title="Telegram @username"
            >
              <PaperPlaneIcon width={20} height={20} style={{ color: '#ffffff' }} />
            </Box>

            <Box
              className={styles.quickActionButton}
              onClick={() => window.open('https://web.telegram.org', '_blank')}
              style={{ backgroundColor: '#0088cc' }}
              title="Telegram @hr_manager"
            >
              <PaperPlaneIcon width={20} height={20} style={{ color: '#ffffff' }} />
            </Box>

            <Box
              className={styles.quickActionButton}
              onClick={() => window.open('https://web.telegram.org', '_blank')}
              style={{ backgroundColor: '#0088cc' }}
              title="Telegram @recruiter"
            >
              <PaperPlaneIcon width={20} height={20} style={{ color: '#ffffff' }} />
            </Box>

            {/* WhatsApp */}
            <Box
              className={styles.quickActionButton}
              onClick={() => window.open('https://web.whatsapp.com', '_blank')}
              style={{ backgroundColor: '#25D366' }}
              title="WhatsApp +7 (999) 123-45-67"
            >
              <Text size="4" weight="bold" style={{ color: '#ffffff' }}>W</Text>
            </Box>

            <Box
              className={styles.quickActionButton}
              onClick={() => window.open('https://web.whatsapp.com', '_blank')}
              style={{ backgroundColor: '#25D366' }}
              title="WhatsApp +7 (999) 987-65-43"
            >
              <Text size="4" weight="bold" style={{ color: '#ffffff' }}>W</Text>
            </Box>

            <Box
              className={styles.quickActionButton}
              onClick={() => window.open('https://web.whatsapp.com', '_blank')}
              style={{ backgroundColor: '#25D366' }}
              title="WhatsApp +7 (999) 555-44-33"
            >
              <Text size="4" weight="bold" style={{ color: '#ffffff' }}>W</Text>
            </Box>

            {/* Viber */}
            <Box
              className={styles.quickActionButton}
              onClick={() => window.open('https://web.viber.com', '_blank')}
              style={{ backgroundColor: '#665CAC' }}
              title="Viber +7 (999) 123-45-67"
            >
              <Text size="4" weight="bold" style={{ color: '#ffffff' }}>V</Text>
            </Box>

            <Box
              className={styles.quickActionButton}
              onClick={() => window.open('https://web.viber.com', '_blank')}
              style={{ backgroundColor: '#665CAC' }}
              title="Viber +7 (999) 111-22-33"
            >
              <Text size="4" weight="bold" style={{ color: '#ffffff' }}>V</Text>
            </Box>

            {/* LinkedIn */}
            <Box
              className={styles.quickActionButton}
              onClick={() => window.open('https://www.linkedin.com', '_blank')}
              style={{ backgroundColor: '#0077B5' }}
              title="LinkedIn linkedin.com/in/username"
            >
              <Text size="4" weight="bold" style={{ color: '#ffffff' }}>in</Text>
            </Box>

            <Box
              className={styles.quickActionButton}
              onClick={() => window.open('https://www.linkedin.com', '_blank')}
              style={{ backgroundColor: '#0077B5' }}
              title="LinkedIn linkedin.com/in/recruiter"
            >
              <Text size="4" weight="bold" style={{ color: '#ffffff' }}>in</Text>
            </Box>

            <Box
              className={styles.quickActionButton}
              onClick={() => window.open('https://www.linkedin.com', '_blank')}
              style={{ backgroundColor: '#0077B5' }}
              title="LinkedIn linkedin.com/company/companyname"
            >
              <Text size="4" weight="bold" style={{ color: '#ffffff' }}>in</Text>
            </Box>

            {/* Email */}
            <Box
              className={styles.quickActionButton}
              onClick={() => window.open('mailto:', '_blank')}
              style={{ backgroundColor: '#EA4335' }}
              title="Email example@email.com"
            >
              <EnvelopeClosedIcon width={20} height={20} style={{ color: '#ffffff' }} />
            </Box>

            <Box
              className={styles.quickActionButton}
              onClick={() => window.open('mailto:', '_blank')}
              style={{ backgroundColor: '#EA4335' }}
              title="Email hr@company.com"
            >
              <EnvelopeClosedIcon width={20} height={20} style={{ color: '#ffffff' }} />
            </Box>

            <Box
              className={styles.quickActionButton}
              onClick={() => window.open('mailto:', '_blank')}
              style={{ backgroundColor: '#EA4335' }}
              title="Email recruiting@company.com"
            >
              <EnvelopeClosedIcon width={20} height={20} style={{ color: '#ffffff' }} />
            </Box>
          </Flex>
        </Box>
      </Box>
    </Flex>
  )
}
