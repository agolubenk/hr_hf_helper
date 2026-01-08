'use client'

import { Box, Text, Flex, Select, Grid } from "@radix-ui/themes"
import { ColorWheelIcon } from "@radix-ui/react-icons"
import styles from './AccentColorSettings.module.css'

// Цвета для превью (9-й оттенок из Radix UI цветовой палитры)
const COLOR_PREVIEWS: Record<string, string> = {
  blue: '#3e63dd',
  tomato: '#f23d3d',
  red: '#e5484d',
  ruby: '#f43f5e',
  crimson: '#f93e6b',
  pink: '#f43f9e',
  plum: '#ab4aba',
  purple: '#8e4ec6',
  violet: '#8e4ec6',
  iris: '#5b5bd6',
  indigo: '#5468df',
  cyan: '#28b5cb',
  teal: '#12a594',
  jade: '#29a383',
  green: '#30a46c',
  grass: '#46a758',
  lime: '#65d30e',
  yellow: '#f5d90a',
  amber: '#f5a623',
  orange: '#ff802b',
  brown: '#ad7f58',
}

// Доступные акцентные цвета из Radix UI
const ACCENT_COLORS = [
  { value: 'blue', label: 'Синий' },
  { value: 'tomato', label: 'Томатный' },
  { value: 'red', label: 'Красный' },
  { value: 'ruby', label: 'Рубин' },
  { value: 'crimson', label: 'Малиновый' },
  { value: 'pink', label: 'Розовый' },
  { value: 'plum', label: 'Сливовый' },
  { value: 'purple', label: 'Фиолетовый' },
  { value: 'violet', label: 'Фиалковый' },
  { value: 'iris', label: 'Ирис' },
  { value: 'indigo', label: 'Индиго' },
  { value: 'cyan', label: 'Бирюзовый' },
  { value: 'teal', label: 'Тиффани' },
  { value: 'jade', label: 'Нефрит' },
  { value: 'green', label: 'Зеленый' },
  { value: 'grass', label: 'Трава' },
  { value: 'lime', label: 'Лайм' },
  { value: 'yellow', label: 'Желтый' },
  { value: 'amber', label: 'Янтарный' },
  { value: 'orange', label: 'Оранжевый' },
  { value: 'brown', label: 'Коричневый' },
] as const

export type AccentColorValue = typeof ACCENT_COLORS[number]['value']

interface AccentColorSettingsProps {
  lightThemeColor: AccentColorValue
  darkThemeColor: AccentColorValue
  onLightThemeColorChange: (color: AccentColorValue) => void
  onDarkThemeColorChange: (color: AccentColorValue) => void
}

export default function AccentColorSettings({
  lightThemeColor,
  darkThemeColor,
  onLightThemeColorChange,
  onDarkThemeColorChange
}: AccentColorSettingsProps) {
  return (
    <Box className={styles.accentColorBlock}>
      {/* Заголовок */}
      <Box className={styles.header}>
        <Flex align="center" gap="2">
          <ColorWheelIcon width="20" height="20" />
          <Text size="4" weight="bold">
            Акцентный цвет
          </Text>
        </Flex>
      </Box>

      {/* Содержимое */}
      <Box className={styles.content}>
        <Grid columns="2" gap="4" width="100%" className={styles.grid}>
          {/* Светлая тема */}
          <Box>
            <Text size="2" weight="medium" color="gray" style={{ marginBottom: '8px', display: 'block' }}>
              Светлая тема
            </Text>
            <Select.Root
              value={lightThemeColor}
              onValueChange={(value) => onLightThemeColorChange(value as AccentColorValue)}
            >
              <Select.Trigger style={{ width: '100%' }} />
              <Select.Content>
                {ACCENT_COLORS.map((color) => (
                  <Select.Item key={color.value} value={color.value}>
                    <Flex align="center" gap="2">
                      <Box
                        className={styles.colorPreview}
                        style={{
                          backgroundColor: COLOR_PREVIEWS[color.value] || COLOR_PREVIEWS.blue,
                        }}
                      />
                      {color.label}
                    </Flex>
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
            <Text size="1" color="gray" style={{ marginTop: '4px', display: 'block' }}>
              Выберите акцентный цвет для светлой темы
            </Text>
          </Box>

          {/* Темная тема */}
          <Box>
            <Text size="2" weight="medium" color="gray" style={{ marginBottom: '8px', display: 'block' }}>
              Темная тема
            </Text>
            <Select.Root
              value={darkThemeColor}
              onValueChange={(value) => onDarkThemeColorChange(value as AccentColorValue)}
            >
              <Select.Trigger style={{ width: '100%' }} />
              <Select.Content>
                {ACCENT_COLORS.map((color) => (
                  <Select.Item key={color.value} value={color.value}>
                    <Flex align="center" gap="2">
                      <Box
                        className={styles.colorPreview}
                        style={{
                          backgroundColor: COLOR_PREVIEWS[color.value] || COLOR_PREVIEWS.blue,
                        }}
                      />
                      {color.label}
                    </Flex>
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
            <Text size="1" color="gray" style={{ marginTop: '4px', display: 'block' }}>
              Выберите акцентный цвет для темной темы
            </Text>
          </Box>
        </Grid>
      </Box>
    </Box>
  )
}

// Экспортируем список цветов для использования в других компонентах
export { ACCENT_COLORS }
