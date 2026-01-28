/**
 * AccentColorSettings (components/profile/AccentColorSettings.tsx) - Компонент настройки акцентного цвета темы
 * 
 * Назначение:
 * - Настройка акцентного цвета для светлой темы
 * - Настройка акцентного цвета для темной темы
 * - Визуальный выбор цвета из предустановленной палитры
 * 
 * Функциональность:
 * - Два Select для выбора цвета (светлая и темная тема)
 * - Превью цветов в выпадающем списке
 * - 21 доступный цвет из Radix UI цветовой палитры
 * - Применение выбранного цвета к теме через ThemeProvider
 * 
 * Доступные цвета:
 * - blue, tomato, red, ruby, crimson, pink, plum, purple, violet, iris, indigo
 * - cyan, teal, jade, green, grass, lime, yellow, amber, orange, brown
 * 
 * Связи:
 * - ThemeProvider: использует useTheme для получения и установки акцентных цветов
 * - ProfilePage: используется на вкладке 'edit' страницы профиля
 * - ACCENT_COLORS: экспортируется для использования в других компонентах
 * 
 * Поведение:
 * - При изменении цвета светлой темы вызывает onLightThemeColorChange
 * - При изменении цвета темной темы вызывает onDarkThemeColorChange
 * - Цвета применяются к теме через ThemeProvider
 * - Выбранные цвета сохраняются в настройках пользователя (TODO: через API)
 * 
 * TODO: Замена моковых данных на API
 * - Сохранять акцентные цвета через API: PUT /api/user/theme
 * - Загружать сохраненные цвета при инициализации
 */

'use client'

// Импорты компонентов Radix UI для создания интерфейса
import { Box, Text, Flex, Select, Grid } from "@radix-ui/themes"
// Импорты иконок из Radix UI для визуального оформления
import { ColorWheelIcon } from "@radix-ui/react-icons"
// Импорт CSS модуля для стилизации компонента
import styles from './AccentColorSettings.module.css'

/**
 * COLOR_PREVIEWS - маппинг цветов на hex коды для превью
 * 
 * Назначение: Используется для отображения цветовых превью в выпадающем списке Select
 * 
 * Источник: 9-й оттенок из Radix UI цветовой палитры (accent-9)
 * 
 * Структура:
 * - Ключ: имя цвета (например, "blue", "red", "green")
 * - Значение: hex код цвета (например, "#3e63dd", "#e5484d", "#30a46c")
 * 
 * Использование: Отображается в Select.Item как цветной квадрат рядом с названием цвета
 */
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

/**
 * ACCENT_COLORS - список доступных акцентных цветов из Radix UI
 * 
 * Назначение: Используется для выбора акцентного цвета темы
 * 
 * Структура:
 * - value: внутреннее имя цвета (используется в ThemeProvider)
 * - label: отображаемое название цвета на русском языке
 * 
 * Количество: 21 цвет
 * 
 * Экспорт: Экспортируется для использования в других компонентах
 */
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

/**
 * AccentColorValue - тип значения акцентного цвета
 * 
 * Определение: Извлекается из ACCENT_COLORS как union type всех возможных значений
 * 
 * Пример значений: 'blue' | 'tomato' | 'red' | 'ruby' | ... | 'brown'
 * 
 * Использование: Используется для типизации пропсов и параметров функций
 */
export type AccentColorValue = typeof ACCENT_COLORS[number]['value']

/**
 * AccentColorSettingsProps - пропсы компонента AccentColorSettings
 * 
 * Параметры:
 * - lightThemeColor: текущий акцентный цвет для светлой темы (AccentColorValue)
 * - darkThemeColor: текущий акцентный цвет для темной темы (AccentColorValue)
 * - onLightThemeColorChange: обработчик изменения цвета светлой темы ((color: AccentColorValue) => void)
 * - onDarkThemeColorChange: обработчик изменения цвета темной темы ((color: AccentColorValue) => void)
 * 
 * Использование: Передаются из ProfilePage при рендеринге на вкладке 'edit'
 */
interface AccentColorSettingsProps {
  lightThemeColor: AccentColorValue
  darkThemeColor: AccentColorValue
  onLightThemeColorChange: (color: AccentColorValue) => void
  onDarkThemeColorChange: (color: AccentColorValue) => void
}

/**
 * AccentColorSettings - компонент настройки акцентного цвета темы
 * 
 * Функциональность:
 * - Отображает два Select для выбора цвета (светлая и темная тема)
 * - Показывает превью цветов в выпадающем списке
 * - Применяет выбранный цвет к теме через callbacks
 * 
 * Поведение:
 * - При изменении цвета светлой темы вызывает onLightThemeColorChange
 * - При изменении цвета темной темы вызывает onDarkThemeColorChange
 * - Цвета применяются к теме через ThemeProvider (в ProfilePage)
 * 
 * Структура:
 * - Заголовок с иконкой цветового круга
 * - Двухколоночная сетка с Select для светлой и темной темы
 * - Каждый Select содержит список цветов с превью
 */
export default function AccentColorSettings({
  lightThemeColor,
  darkThemeColor,
  onLightThemeColorChange,
  onDarkThemeColorChange
}: AccentColorSettingsProps) {
  /**
   * Рендер компонента настройки акцентного цвета
   * 
   * Структура:
   * - Заголовок с иконкой цветового круга
   * - Двухколоночная сетка с Select для светлой и темной темы
   * - Каждый Select содержит список цветов с превью
   */
  return (
    <Box className={styles.accentColorBlock}>
      {/* Заголовок блока настройки акцентного цвета
          styles.header - стили для заголовка (отступы, граница снизу)
          Содержит иконку цветового круга и текст "Акцентный цвет" */}
      <Box className={styles.header}>
        <Flex align="center" gap="2">
          {/* Иконка цветового круга - визуально обозначает тему настройки цвета
              width="20" height="20" - размер иконки */}
          <ColorWheelIcon width="20" height="20" />
          {/* Текст заголовка - название блока
              size="4" - средний размер текста
              weight="bold" - жирное начертание */}
          <Text size="4" weight="bold">
            Акцентный цвет
          </Text>
        </Flex>
      </Box>

      {/* Содержимое блока - настройки цветов для светлой и темной темы
          styles.content - стили для контента (отступы, расположение)
          Grid columns="2" - две колонки (светлая и темная тема)
          gap="4" - отступ между колонками
          styles.grid - стили для сетки (адаптивность на мобильных) */}
      <Box className={styles.content}>
        <Grid columns="2" gap="4" width="100%" className={styles.grid}>
          {/* Левая колонка: Настройка акцентного цвета для светлой темы */}
          <Box>
            {/* Метка Select - название настройки
                size="2" - маленький размер текста
                weight="medium" - средняя жирность
                color="gray" - серый цвет для визуального отличия
                marginBottom: '8px' - отступ снизу
                display: 'block' - блочный элемент */}
            <Text size="2" weight="medium" color="gray" style={{ marginBottom: '8px', display: 'block' }}>
              Светлая тема
            </Text>
            {/* Select для выбора акцентного цвета светлой темы
                Select.Root - корневой компонент Select из Radix UI
                value={lightThemeColor} - текущее выбранное значение
                onValueChange - обработчик изменения значения
                При изменении вызывает onLightThemeColorChange с новым цветом */}
            <Select.Root
              value={lightThemeColor}
              onValueChange={(value) => onLightThemeColorChange(value as AccentColorValue)}
            >
              {/* Триггер Select - кнопка открытия выпадающего списка
                  style={{ width: '100%' }} - полная ширина контейнера */}
              <Select.Trigger style={{ width: '100%' }} />
              {/* Содержимое выпадающего списка - список всех доступных цветов
                  Select.Content - контейнер для элементов списка */}
              <Select.Content>
                {/* Генерируем элементы списка для каждого цвета из ACCENT_COLORS
                    map - итерация по массиву ACCENT_COLORS
                    key={color.value} - уникальный ключ для React */}
                {ACCENT_COLORS.map((color) => (
                  <Select.Item key={color.value} value={color.value}>
                    {/* Элемент списка - содержит превью цвета и название
                        align="center" - выравнивание по центру
                        gap="2" - отступ между превью и текстом */}
                    <Flex align="center" gap="2">
                      {/* Превью цвета - цветной квадрат для визуального отображения цвета
                          className={styles.colorPreview} - стили для превью (размер, скругление)
                          backgroundColor - цвет фона из COLOR_PREVIEWS или синий по умолчанию */}
                      <Box
                        className={styles.colorPreview}
                        style={{
                          backgroundColor: COLOR_PREVIEWS[color.value] || COLOR_PREVIEWS.blue,
                        }}
                      />
                      {/* Название цвета на русском языке - отображается в списке
                          color.label - текст из ACCENT_COLORS (например, "Синий", "Красный") */}
                      {color.label}
                    </Flex>
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
            {/* Подсказка под Select - объясняет назначение настройки
                size="1" - очень маленький размер текста
                color="gray" - серый цвет для визуального отличия
                marginTop: '4px' - отступ сверху
                display: 'block' - блочный элемент */}
            <Text size="1" color="gray" style={{ marginTop: '4px', display: 'block' }}>
              Выберите акцентный цвет для светлой темы
            </Text>
          </Box>

          {/* Правая колонка: Настройка акцентного цвета для темной темы
              Аналогична левой колонке, но для темной темы */}
          <Box>
            {/* Метка Select - название настройки */}
            <Text size="2" weight="medium" color="gray" style={{ marginBottom: '8px', display: 'block' }}>
              Темная тема
            </Text>
            {/* Select для выбора акцентного цвета темной темы
                value={darkThemeColor} - текущее выбранное значение
                onValueChange - обработчик изменения значения
                При изменении вызывает onDarkThemeColorChange с новым цветом */}
            <Select.Root
              value={darkThemeColor}
              onValueChange={(value) => onDarkThemeColorChange(value as AccentColorValue)}
            >
              {/* Триггер Select - кнопка открытия выпадающего списка */}
              <Select.Trigger style={{ width: '100%' }} />
              {/* Содержимое выпадающего списка - список всех доступных цветов */}
              <Select.Content>
                {/* Генерируем элементы списка для каждого цвета из ACCENT_COLORS */}
                {ACCENT_COLORS.map((color) => (
                  <Select.Item key={color.value} value={color.value}>
                    {/* Элемент списка - содержит превью цвета и название */}
                    <Flex align="center" gap="2">
                      {/* Превью цвета - цветной квадрат для визуального отображения цвета */}
                      <Box
                        className={styles.colorPreview}
                        style={{
                          backgroundColor: COLOR_PREVIEWS[color.value] || COLOR_PREVIEWS.blue,
                        }}
                      />
                      {/* Название цвета на русском языке */}
                      {color.label}
                    </Flex>
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
            {/* Подсказка под Select - объясняет назначение настройки */}
            <Text size="1" color="gray" style={{ marginTop: '4px', display: 'block' }}>
              Выберите акцентный цвет для темной темы
            </Text>
          </Box>
        </Grid>
      </Box>
    </Box>
  )
}

/**
 * Экспорт списка цветов для использования в других компонентах
 * 
 * Назначение: Позволяет другим компонентам использовать ACCENT_COLORS для отображения списка цветов
 * 
 * Использование:
 * - import { ACCENT_COLORS } from '@/components/profile/AccentColorSettings'
 * - Используется в компонентах, которые также работают с акцентными цветами
 */
export { ACCENT_COLORS }
