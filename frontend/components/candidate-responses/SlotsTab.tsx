'use client'

import { Box, Flex, Text, TextField, TextArea, Button, Card, Callout } from "@radix-ui/themes"
import { useState } from "react"
import { CheckIcon, InfoCircledIcon, CalendarIcon, FileTextIcon, MinusIcon } from "@radix-ui/react-icons"
import styles from './SlotsTab.module.css'

interface SlotsSettings {
  textBeforeCurrentWeek: string
  textBeforeNextWeek: string
  textBeforeAllSlots: string
  separatorBetweenWeeks: string
}

export default function SlotsTab() {
  const [settings, setSettings] = useState<SlotsSettings>({
    textBeforeCurrentWeek: 'У нас есть такие слоты:',
    textBeforeNextWeek: 'На следующей неделе у нас доступны такие слоты:',
    textBeforeAllSlots: 'У нас есть вот такие слоты:',
    separatorBetweenWeeks: 'И на следующей неделе:',
  })

  const [hasChanges, setHasChanges] = useState(false)

  const handleSave = () => {
    // TODO: Сохранение настроек через API
    console.log('Сохранение настроек слотов:', settings)
    setHasChanges(false)
    alert('Настройки сохранены')
  }

  const handleCancel = () => {
    // TODO: Загрузка исходных настроек
    setHasChanges(false)
  }

  const handleChange = (field: keyof SlotsSettings, value: string) => {
    setSettings(prev => ({ ...prev, [field]: value }))
    setHasChanges(true)
  }

  // Пример результата
  const exampleResult = `${settings.textBeforeAllSlots}\n${settings.textBeforeCurrentWeek}\nПН 12-15, 17\nВТ 14-17\n${settings.separatorBetweenWeeks}\n${settings.textBeforeNextWeek}\nПН (15.09) 11-14, 15\nВТ (16.09) 11-18`

  return (
    <Box className={styles.container}>
      <Card className={styles.settingsCard}>
        <Flex direction="column" gap="4">
          <Box>
            <Text size="4" weight="bold" mb="2" style={{ display: 'block' }}>
              Настройки слотов
            </Text>
            <Text size="2" color="gray">
              Настройте дополнительный текст, который будет добавляться к слотам при копировании.
            </Text>
          </Box>

          <Flex direction="column" gap="4">
            {/* Текст перед слотами текущей недели */}
            <Box>
              <Flex align="center" gap="2" mb="2">
                <CalendarIcon width={16} height={16} />
                <Text size="2" weight="bold">
                  Текст перед слотами текущей недели
                </Text>
              </Flex>
              <TextField.Root
                value={settings.textBeforeCurrentWeek}
                onChange={(e) => handleChange('textBeforeCurrentWeek', e.target.value)}
                placeholder="У нас есть такие слоты:"
              />
              <Text size="1" color="gray" mt="1" style={{ display: 'block' }}>
                Этот текст будет добавлен перед слотами текущей недели
              </Text>
            </Box>

            {/* Текст перед слотами следующей недели */}
            <Box>
              <Flex align="center" gap="2" mb="2">
                <CalendarIcon width={16} height={16} />
                <Text size="2" weight="bold">
                  Текст перед слотами следующей недели
                </Text>
              </Flex>
              <TextField.Root
                value={settings.textBeforeNextWeek}
                onChange={(e) => handleChange('textBeforeNextWeek', e.target.value)}
                placeholder="На следующей неделе у нас доступны такие слоты:"
              />
              <Text size="1" color="gray" mt="1" style={{ display: 'block' }}>
                Этот текст будет добавлен перед слотами следующей недели
              </Text>
            </Box>

            {/* Текст перед всеми слотами */}
            <Box>
              <Flex align="center" gap="2" mb="2">
                <FileTextIcon width={16} height={16} />
                <Text size="2" weight="bold">
                  Текст перед всеми слотами
                </Text>
              </Flex>
              <TextField.Root
                value={settings.textBeforeAllSlots}
                onChange={(e) => handleChange('textBeforeAllSlots', e.target.value)}
                placeholder="У нас есть вот такие слоты:"
              />
              <Text size="1" color="gray" mt="1" style={{ display: 'block' }}>
                Этот текст будет добавлен в начало при копировании всех слотов
              </Text>
            </Box>

            {/* Разделитель между неделями */}
            <Box>
              <Flex align="center" gap="2" mb="2">
                <MinusIcon width={16} height={16} />
                <Text size="2" weight="bold">
                  Разделитель между неделями
                </Text>
              </Flex>
              <TextField.Root
                value={settings.separatorBetweenWeeks}
                onChange={(e) => handleChange('separatorBetweenWeeks', e.target.value)}
                placeholder="И на следующей неделе:"
              />
              <Text size="1" color="gray" mt="1" style={{ display: 'block' }}>
                Текст, который будет разделять текущую и следующую неделю
              </Text>
            </Box>
          </Flex>

          {/* Пример результата */}
          <Callout.Root color="blue" className={styles.exampleCallout}>
            <Callout.Icon>
              <InfoCircledIcon />
            </Callout.Icon>
            <Callout.Text>
              <Text size="2" weight="bold" mb="2" style={{ display: 'block' }}>
                Пример результата:
              </Text>
              <Box className={styles.exampleBox}>
                <Text size="2" style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                  {exampleResult}
                </Text>
              </Box>
            </Callout.Text>
          </Callout.Root>

          {/* Кнопки сохранения */}
          <Flex justify="end" gap="3" pt="3" style={{ borderTop: '1px solid var(--gray-6)' }}>
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
              disabled={!hasChanges}
            >
              <CheckIcon width={16} height={16} />
              Сохранить настройки
            </Button>
          </Flex>
        </Flex>
      </Card>
    </Box>
  )
}
