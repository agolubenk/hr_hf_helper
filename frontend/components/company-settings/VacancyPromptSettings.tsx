'use client'

import { Box, Flex, Text, TextArea, Button, Card, Table, Switch, Badge, Separator } from "@radix-ui/themes"
import { useState, useEffect } from "react"
import { CheckIcon, ClockIcon, InfoCircledIcon } from "@radix-ui/react-icons"
import styles from './VacancyPromptSettings.module.css'

interface PromptHistory {
  id: number
  prompt: string
  isActive: boolean
  updatedAt: string
  updatedBy: string
}

// Моковые данные
const mockPromptData = {
  prompt: 'Проанализируй вакансию и предоставь детальную информацию о требованиях, зарплате и условиях работы.',
  isActive: true,
  createdAt: '2025-01-15T10:30:00',
  updatedAt: '2025-01-20T14:45:00',
  updatedBy: 'Голубенко А.',
}

const mockHistory: PromptHistory[] = [
  {
    id: 1,
    prompt: 'Проанализируй вакансию и предоставь детальную информацию о требованиях, зарплате и условиях работы.',
    isActive: true,
    updatedAt: '2025-01-20T14:45:00',
    updatedBy: 'Голубенко А.',
  },
  {
    id: 2,
    prompt: 'Проанализируй вакансию и предоставь информацию о требованиях.',
    isActive: false,
    updatedAt: '2025-01-18T09:20:00',
    updatedBy: 'Иванов И.',
  },
  {
    id: 3,
    prompt: 'Проанализируй вакансию.',
    isActive: false,
    updatedAt: '2025-01-15T10:30:00',
    updatedBy: 'Петров П.',
  },
]

export default function VacancyPromptSettings() {
  const [prompt, setPrompt] = useState(mockPromptData.prompt)
  const [isActive, setIsActive] = useState(mockPromptData.isActive)
  const [history, setHistory] = useState<PromptHistory[]>(mockHistory)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    // Проверяем, есть ли изменения
    const hasPromptChanged = prompt !== mockPromptData.prompt
    const hasStatusChanged = isActive !== mockPromptData.isActive
    setHasChanges(hasPromptChanged || hasStatusChanged)
  }, [prompt, isActive])

  const handleSave = () => {
    // Добавляем новую запись в историю
    const newHistoryEntry: PromptHistory = {
      id: Date.now(),
      prompt,
      isActive,
      updatedAt: new Date().toISOString(),
      updatedBy: 'Голубенко А.', // В реальном приложении берем из контекста пользователя
    }
    
    setHistory(prev => [newHistoryEntry, ...prev])
    setHasChanges(false)
    
    // Здесь будет вызов API для сохранения
    console.log('Сохранение промпта:', { prompt, isActive })
  }

  const handleCancel = () => {
    setPrompt(mockPromptData.prompt)
    setIsActive(mockPromptData.isActive)
    setHasChanges(false)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <Box className={styles.container}>
      {/* Основная карточка с промптом */}
      <Card className={styles.card}>
        <Flex direction="column" gap="4">
          <Flex justify="between" align="center">
            <Text size="4" weight="bold">
              Промпт для анализа вакансий
            </Text>
            <Flex align="center" gap="3">
              <Flex align="center" gap="2">
                <Text size="2" color="gray">
                  Статус:
                </Text>
                <Switch
                  checked={isActive}
                  onCheckedChange={setIsActive}
                  size="2"
                />
                <Text size="2" weight="medium">
                  {isActive ? 'Активен' : 'Неактивен'}
                </Text>
              </Flex>
            </Flex>
          </Flex>

          <Separator size="4" />

          {/* Textarea для промпта */}
          <Box>
            <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
              Текст промпта *
            </Text>
            <TextArea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Введите промпт для анализа вакансий..."
              rows={8}
              style={{ width: '100%', fontFamily: 'monospace' }}
            />
            <Text size="1" color="gray" mt="1" style={{ display: 'block' }}>
              Этот промпт будет использоваться для анализа вакансий с помощью AI
            </Text>
          </Box>

          {/* Информация о дате */}
          <Flex direction="column" gap="2" pt="2" style={{ borderTop: '1px solid var(--gray-a6)' }}>
            <Flex align="center" gap="2">
              <ClockIcon width={14} height={14} />
              <Text size="2" color="gray">
                Создан: {formatDate(mockPromptData.createdAt)}
              </Text>
            </Flex>
            <Flex align="center" gap="2">
              <ClockIcon width={14} height={14} />
              <Text size="2" color="gray">
                Последнее обновление: {formatDate(mockPromptData.updatedAt)}
              </Text>
            </Flex>
          </Flex>

          {/* Кнопки сохранения */}
          <Flex justify="end" gap="3" pt="3" mt="2" style={{ borderTop: '1px solid var(--gray-a6)' }}>
            <Button 
              variant="soft" 
              size="3"
              onClick={handleCancel}
              disabled={!hasChanges}
            >
              Отмена
            </Button>
            <Button 
              size="3"
              onClick={handleSave}
              disabled={!hasChanges || !prompt.trim()}
            >
              <CheckIcon width={16} height={16} />
              Сохранить изменения
            </Button>
          </Flex>
        </Flex>
      </Card>

      {/* История обновлений */}
      <Card className={styles.card}>
        <Flex direction="column" gap="4">
          <Flex justify="between" align="center">
            <Text size="4" weight="bold">
              История обновлений
            </Text>
            <Badge color="gray" size="2">
              {history.length} записей
            </Badge>
          </Flex>

          <Separator size="4" />

          {history.length === 0 ? (
            <Box py="6" style={{ textAlign: 'center' }}>
              <InfoCircledIcon width={32} height={32} style={{ color: 'var(--gray-9)', margin: '0 auto 12px' }} />
              <Text size="3" color="gray">
                История обновлений пуста
              </Text>
            </Box>
          ) : (
            <Box className={styles.historyContainer}>
              <Table.Root>
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeaderCell>Дата обновления</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Обновил</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Статус</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Промпт</Table.ColumnHeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {history.map((item) => (
                    <Table.Row key={item.id}>
                      <Table.Cell>
                        <Flex align="center" gap="2">
                          <ClockIcon width={14} height={14} />
                          <Text size="2">
                            {formatDate(item.updatedAt)}
                          </Text>
                        </Flex>
                      </Table.Cell>
                      <Table.Cell>
                        <Text size="2">{item.updatedBy}</Text>
                      </Table.Cell>
                      <Table.Cell>
                        <Badge color={item.isActive ? 'green' : 'gray'}>
                          {item.isActive ? 'Активен' : 'Неактивен'}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell>
                        <Text 
                          size="2" 
                          className={styles.promptText}
                          title={item.prompt}
                        >
                          {item.prompt.length > 100 
                            ? `${item.prompt.substring(0, 100)}...` 
                            : item.prompt}
                        </Text>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            </Box>
          )}
        </Flex>
      </Card>
    </Box>
  )
}
