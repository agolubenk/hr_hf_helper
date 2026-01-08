'use client'

import { Box, Text, Flex, Button, Select, TextField, TextArea } from "@radix-ui/themes"
import {
  Cross2Icon,
  HomeIcon,
  PersonIcon,
  EnvelopeClosedIcon,
  CalendarIcon,
  ClockIcon,
  PaperPlaneIcon,
  FileTextIcon,
  StarIcon,
  HeartIcon,
  LightningBoltIcon,
  Link2Icon,
  GearIcon,
  CheckIcon,
  PlusIcon,
  Pencil1Icon,
  TrashIcon,
  ListBulletIcon,
  MagnifyingGlassIcon,
  DownloadIcon,
  UploadIcon,
  ImageIcon,
  VideoIcon,
  ChatBubbleIcon,
  BellIcon,
  LockClosedIcon,
  GlobeIcon,
  BookmarkIcon,
  Share1Icon,
  CopyIcon,
  ClipboardIcon,
  PinTopIcon,
  PinBottomIcon,
  EyeOpenIcon,
  EyeClosedIcon,
  ReloadIcon,
  CrossCircledIcon,
  CheckCircledIcon,
  InfoCircledIcon,
  ExclamationTriangleIcon,
  QuestionMarkCircledIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  DoubleArrowRightIcon,
  DoubleArrowLeftIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  HamburgerMenuIcon,
  DotsHorizontalIcon,
  DotsVerticalIcon,
  RowsIcon,
  ColumnsIcon,
  DashboardIcon,
  BarChartIcon,
  PieChartIcon,
  CodeIcon,
  MixIcon,
  MixerHorizontalIcon,
  MixerVerticalIcon,
  SliderIcon,
  TokensIcon,
  FontBoldIcon,
  FontItalicIcon,
  UnderlineIcon,
  StrikethroughIcon,
  TextAlignLeftIcon,
  TextAlignCenterIcon,
  TextAlignRightIcon,
  TextAlignJustifyIcon,
  QuoteIcon,
  HeadingIcon,
  TextIcon,
  AlignLeftIcon,
  AlignRightIcon,
  AlignTopIcon,
  AlignBottomIcon,
  ColorWheelIcon,
  Pencil2Icon,
  CropIcon,
  MoveIcon,
  RotateCounterClockwiseIcon,
  LayersIcon,
  StackIcon,
  BoxIcon,
  CubeIcon,
  TableIcon,
  LayoutIcon,
  ActivityLogIcon,
  CommitIcon,
  GitHubLogoIcon,
  TwitterLogoIcon,
  LinkedInLogoIcon,
  DiscordLogoIcon,
  NotionLogoIcon,
  FigmaLogoIcon,
} from "@radix-ui/react-icons"
import { useState, useEffect, useMemo } from "react"
import { useTheme } from "@/components/ThemeProvider"
import styles from './QuickButtonModal.module.css'

interface QuickButtonData {
  id?: string
  name: string
  icon: string
  customIcon?: string
  type: 'link' | 'text' | 'datetime'
  value: string
  color: string
  order: number
}

interface QuickButtonModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: QuickButtonData) => void
  initialData?: QuickButtonData | null
}

// Маппинг имен иконок на компоненты
const iconComponents: Record<string, React.ComponentType<{ width?: number | string; height?: number | string }>> = {
  HomeIcon,
  PersonIcon,
  EnvelopeClosedIcon,
  CalendarIcon,
  ClockIcon,
  PaperPlaneIcon,
  FileTextIcon,
  StarIcon,
  HeartIcon,
  LightningBoltIcon,
  Link2Icon,
  GearIcon,
  CheckIcon,
  PlusIcon,
  Pencil1Icon,
  TrashIcon,
  ListBulletIcon,
  MagnifyingGlassIcon,
  DownloadIcon,
  UploadIcon,
  ImageIcon,
  VideoIcon,
  ChatBubbleIcon,
  BellIcon,
  LockClosedIcon,
  GlobeIcon,
  BookmarkIcon,
  PinTopIcon,
  Share1Icon,
  CopyIcon,
  ClipboardIcon,
  EyeOpenIcon,
  EyeClosedIcon,
  ReloadIcon,
  CrossCircledIcon,
  CheckCircledIcon,
  InfoCircledIcon,
  ExclamationTriangleIcon,
  QuestionMarkCircledIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  DoubleArrowRightIcon,
  DoubleArrowLeftIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  HamburgerMenuIcon,
  DotsHorizontalIcon,
  DotsVerticalIcon,
  RowsIcon,
  ColumnsIcon,
  DashboardIcon,
  BarChartIcon,
  PieChartIcon,
  CodeIcon,
  MixIcon,
  MixerHorizontalIcon,
  MixerVerticalIcon,
  SliderIcon,
  TokensIcon,
  FontBoldIcon,
  FontItalicIcon,
  UnderlineIcon,
  StrikethroughIcon,
  TextAlignLeftIcon,
  TextAlignCenterIcon,
  TextAlignRightIcon,
  TextAlignJustifyIcon,
  QuoteIcon,
  HeadingIcon,
  TextIcon,
  AlignLeftIcon,
  AlignRightIcon,
  AlignTopIcon,
  AlignBottomIcon,
  ColorWheelIcon,
  Pencil2Icon,
  CropIcon,
  MoveIcon,
  RotateCounterClockwiseIcon,
  LayersIcon,
  StackIcon,
  BoxIcon,
  CubeIcon,
  TableIcon,
  LayoutIcon,
  ActivityLogIcon,
  CommitIcon,
  GitHubLogoIcon,
  TwitterLogoIcon,
  LinkedInLogoIcon,
  DiscordLogoIcon,
  NotionLogoIcon,
  FigmaLogoIcon,
}

// Предустановленные иконки из @radix-ui/react-icons
const PRESET_ICONS = [
  { value: 'Link2Icon', label: 'Ссылка', icon: Link2Icon },
  { value: 'HomeIcon', label: 'Дом', icon: HomeIcon },
  { value: 'PersonIcon', label: 'Пользователь', icon: PersonIcon },
  { value: 'EnvelopeClosedIcon', label: 'Почта', icon: EnvelopeClosedIcon },
  { value: 'CalendarIcon', label: 'Календарь', icon: CalendarIcon },
  { value: 'ClockIcon', label: 'Часы', icon: ClockIcon },
  { value: 'PaperPlaneIcon', label: 'Телеграм', icon: PaperPlaneIcon },
  { value: 'FileTextIcon', label: 'Файл', icon: FileTextIcon },
  { value: 'StarIcon', label: 'Звезда', icon: StarIcon },
  { value: 'HeartIcon', label: 'Сердце', icon: HeartIcon },
  { value: 'LightningBoltIcon', label: 'Молния', icon: LightningBoltIcon },
  { value: 'GearIcon', label: 'Настройки', icon: GearIcon },
  { value: 'CheckIcon', label: 'Галочка', icon: CheckIcon },
  { value: 'PlusIcon', label: 'Плюс', icon: PlusIcon },
  { value: 'Pencil1Icon', label: 'Карандаш', icon: Pencil1Icon },
  { value: 'TrashIcon', label: 'Корзина', icon: TrashIcon },
  { value: 'ListBulletIcon', label: 'Список', icon: ListBulletIcon },
  { value: 'MagnifyingGlassIcon', label: 'Поиск', icon: MagnifyingGlassIcon },
  { value: 'DownloadIcon', label: 'Скачать', icon: DownloadIcon },
  { value: 'UploadIcon', label: 'Загрузить', icon: UploadIcon },
  { value: 'ImageIcon', label: 'Изображение', icon: ImageIcon },
  { value: 'VideoIcon', label: 'Видео', icon: VideoIcon },
  { value: 'ChatBubbleIcon', label: 'Чат', icon: ChatBubbleIcon },
  { value: 'BellIcon', label: 'Уведомление', icon: BellIcon },
  { value: 'LockClosedIcon', label: 'Замок', icon: LockClosedIcon },
  { value: 'GlobeIcon', label: 'Глобус', icon: GlobeIcon },
  { value: 'BookmarkIcon', label: 'Закладка', icon: BookmarkIcon },
  { value: 'PinTopIcon', label: 'Булавка', icon: PinTopIcon },
  { value: 'Share1Icon', label: 'Поделиться', icon: Share1Icon },
  { value: 'CopyIcon', label: 'Копировать', icon: CopyIcon },
  { value: 'ClipboardIcon', label: 'Буфер обмена', icon: ClipboardIcon },
  { value: 'EyeOpenIcon', label: 'Глаз (открыт)', icon: EyeOpenIcon },
  { value: 'EyeClosedIcon', label: 'Глаз (закрыт)', icon: EyeClosedIcon },
  { value: 'ReloadIcon', label: 'Обновить', icon: ReloadIcon },
  { value: 'CrossCircledIcon', label: 'Крест в круге', icon: CrossCircledIcon },
  { value: 'CheckCircledIcon', label: 'Галочка в круге', icon: CheckCircledIcon },
  { value: 'InfoCircledIcon', label: 'Информация', icon: InfoCircledIcon },
  { value: 'ExclamationTriangleIcon', label: 'Предупреждение', icon: ExclamationTriangleIcon },
  { value: 'QuestionMarkCircledIcon', label: 'Вопрос', icon: QuestionMarkCircledIcon },
  { value: 'ArrowRightIcon', label: 'Стрелка вправо', icon: ArrowRightIcon },
  { value: 'ArrowLeftIcon', label: 'Стрелка влево', icon: ArrowLeftIcon },
  { value: 'ArrowUpIcon', label: 'Стрелка вверх', icon: ArrowUpIcon },
  { value: 'ArrowDownIcon', label: 'Стрелка вниз', icon: ArrowDownIcon },
  { value: 'DoubleArrowRightIcon', label: 'Двойная стрелка вправо', icon: DoubleArrowRightIcon },
  { value: 'DoubleArrowLeftIcon', label: 'Двойная стрелка влево', icon: DoubleArrowLeftIcon },
  { value: 'ChevronRightIcon', label: 'Шеврон вправо', icon: ChevronRightIcon },
  { value: 'ChevronLeftIcon', label: 'Шеврон влево', icon: ChevronLeftIcon },
  { value: 'ChevronUpIcon', label: 'Шеврон вверх', icon: ChevronUpIcon },
  { value: 'ChevronDownIcon', label: 'Шеврон вниз', icon: ChevronDownIcon },
  { value: 'HamburgerMenuIcon', label: 'Меню', icon: HamburgerMenuIcon },
  { value: 'DotsHorizontalIcon', label: 'Три точки (горизонтально)', icon: DotsHorizontalIcon },
  { value: 'DotsVerticalIcon', label: 'Три точки (вертикально)', icon: DotsVerticalIcon },
  { value: 'RowsIcon', label: 'Строки', icon: RowsIcon },
  { value: 'ColumnsIcon', label: 'Столбцы', icon: ColumnsIcon },
  { value: 'DashboardIcon', label: 'Панель управления', icon: DashboardIcon },
  { value: 'BarChartIcon', label: 'Гистограмма', icon: BarChartIcon },
  { value: 'PieChartIcon', label: 'Круговая диаграмма', icon: PieChartIcon },
  { value: 'CodeIcon', label: 'Код', icon: CodeIcon },
  { value: 'MixIcon', label: 'Микс', icon: MixIcon },
  { value: 'MixerHorizontalIcon', label: 'Микшер (горизонтально)', icon: MixerHorizontalIcon },
  { value: 'MixerVerticalIcon', label: 'Микшер (вертикально)', icon: MixerVerticalIcon },
  { value: 'SliderIcon', label: 'Слайдер', icon: SliderIcon },
  { value: 'TokensIcon', label: 'Токены', icon: TokensIcon },
  { value: 'FontBoldIcon', label: 'Жирный шрифт', icon: FontBoldIcon },
  { value: 'FontItalicIcon', label: 'Курсив', icon: FontItalicIcon },
  { value: 'UnderlineIcon', label: 'Подчеркивание', icon: UnderlineIcon },
  { value: 'StrikethroughIcon', label: 'Зачеркивание', icon: StrikethroughIcon },
  { value: 'TextAlignLeftIcon', label: 'Выравнивание по левому краю', icon: TextAlignLeftIcon },
  { value: 'TextAlignCenterIcon', label: 'Выравнивание по центру', icon: TextAlignCenterIcon },
  { value: 'TextAlignRightIcon', label: 'Выравнивание по правому краю', icon: TextAlignRightIcon },
  { value: 'TextAlignJustifyIcon', label: 'Выравнивание по ширине', icon: TextAlignJustifyIcon },
  { value: 'QuoteIcon', label: 'Цитата', icon: QuoteIcon },
  { value: 'HeadingIcon', label: 'Заголовок', icon: HeadingIcon },
  { value: 'TextIcon', label: 'Текст', icon: TextIcon },
  { value: 'AlignLeftIcon', label: 'Выровнять влево', icon: AlignLeftIcon },
  { value: 'AlignRightIcon', label: 'Выровнять вправо', icon: AlignRightIcon },
  { value: 'AlignTopIcon', label: 'Выровнять сверху', icon: AlignTopIcon },
  { value: 'AlignBottomIcon', label: 'Выровнять снизу', icon: AlignBottomIcon },
  { value: 'ColorWheelIcon', label: 'Цветовое колесо', icon: ColorWheelIcon },
  { value: 'Pencil2Icon', label: 'Карандаш 2', icon: Pencil2Icon },
  { value: 'CropIcon', label: 'Обрезка', icon: CropIcon },
  { value: 'MoveIcon', label: 'Переместить', icon: MoveIcon },
  { value: 'RotateCounterClockwiseIcon', label: 'Повернуть против часовой', icon: RotateCounterClockwiseIcon },
  { value: 'LayersIcon', label: 'Слои', icon: LayersIcon },
  { value: 'StackIcon', label: 'Стек', icon: StackIcon },
  { value: 'BoxIcon', label: 'Коробка', icon: BoxIcon },
  { value: 'CubeIcon', label: 'Куб', icon: CubeIcon },
  { value: 'TableIcon', label: 'Таблица', icon: TableIcon },
  { value: 'LayoutIcon', label: 'Макет', icon: LayoutIcon },
  { value: 'ActivityLogIcon', label: 'Журнал активности', icon: ActivityLogIcon },
  { value: 'CommitIcon', label: 'Коммит', icon: CommitIcon },
  { value: 'GitHubLogoIcon', label: 'GitHub', icon: GitHubLogoIcon },
  { value: 'TwitterLogoIcon', label: 'Twitter', icon: TwitterLogoIcon },
  { value: 'LinkedInLogoIcon', label: 'LinkedIn', icon: LinkedInLogoIcon },
  { value: 'DiscordLogoIcon', label: 'Discord', icon: DiscordLogoIcon },
  { value: 'NotionLogoIcon', label: 'Notion', icon: NotionLogoIcon },
  { value: 'FigmaLogoIcon', label: 'Figma', icon: FigmaLogoIcon },
]

export default function QuickButtonModal({
  isOpen,
  onClose,
  onSave,
  initialData
}: QuickButtonModalProps) {
  const { theme } = useTheme()
  
  const [formData, setFormData] = useState<QuickButtonData>({
    name: '',
    icon: '',
    customIcon: '',
    type: 'link',
    value: '',
    color: '#007bff',
    order: 0,
  })

  const [selectedIconType, setSelectedIconType] = useState<'preset' | 'custom'>('preset')

  // Инициализация формы при открытии модального окна
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        // Редактирование
        setFormData({
          name: initialData.name || '',
          icon: initialData.icon || '',
          customIcon: initialData.customIcon || '',
          type: initialData.type || 'link',
          value: initialData.value || '',
          color: initialData.color || '#007bff',
          order: initialData.order || 0,
        })
        setSelectedIconType('preset')
      } else {
        // Создание новой кнопки
        setFormData({
          name: '',
          icon: '',
          customIcon: '',
          type: 'link',
          value: '',
          color: '#007bff',
          order: 0,
        })
        setSelectedIconType('preset')
      }
    }
  }, [isOpen, initialData])

  const modalBackgroundColor = useMemo(() => {
    return theme === 'dark' ? '#1c1c1f' : '#ffffff'
  }, [theme])

  const handleChange = (field: keyof QuickButtonData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Валидация
    if (!formData.name.trim()) {
      alert('Пожалуйста, введите название')
      return
    }

    if (!formData.icon) {
      alert('Пожалуйста, выберите иконку')
      return
    }

    if (!formData.value.trim()) {
      alert('Пожалуйста, введите значение')
      return
    }

    // Проверка для типа "Ссылка"
    if (formData.type === 'link') {
      const trimmedValue = formData.value.trim()
      const urlPattern = /^(https?:\/\/|\/|mailto:|tel:)/i
      if (!urlPattern.test(trimmedValue)) {
        alert('URL должен начинаться с http://, https://, /, mailto: или tel:')
        return
      }
      // Дополнительная проверка для mailto и tel
      if (trimmedValue.startsWith('mailto:') && !trimmedValue.includes('@')) {
        alert('Некорректный email в mailto:')
        return
      }
      if (trimmedValue.startsWith('tel:') && trimmedValue.length <= 4) {
        alert('Некорректный номер телефона в tel:')
        return
      }
    }

    // Подготовка данных для сохранения
    const saveData: QuickButtonData = {
      ...formData,
      icon: formData.icon,
    }

    onSave(saveData)
  }

  // Получаем подсказку для поля "Значение" в зависимости от типа
  const getValueHelperText = () => {
    switch (formData.type) {
      case 'link':
        return 'Для типа "Ссылка" укажите URL (начинается с http://, https://, /, mailto: или tel:)'
      case 'text':
        return 'Введите текст, который будет отображаться'
      case 'datetime':
        return 'Введите дату и время в формате YYYY-MM-DD HH:mm'
      default:
        return ''
    }
  }

  if (!isOpen) return null

  return (
    <Box 
      className={styles.modalOverlay} 
      onClick={onClose}
      style={{ display: isOpen ? 'flex' : 'none' }}
    >
      <Box 
        className={styles.modal} 
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: modalBackgroundColor,
          background: modalBackgroundColor,
          opacity: 1,
        }}
      >
        {/* Заголовок */}
        <Flex justify="between" align="center" className={styles.modalHeader}>
          <Text size="4" weight="bold">
            {initialData ? 'Редактировать кнопку' : 'Создать кнопку'}
          </Text>
          <Box
            onClick={onClose}
            style={{
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              color: 'white',
            }}
            title="Закрыть"
          >
            <Cross2Icon width="20" height="20" />
          </Box>
        </Flex>

        {/* Форма */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
          <Box 
            className={styles.modalContent}
            style={{
              backgroundColor: modalBackgroundColor,
              background: modalBackgroundColor,
              opacity: 1,
              flex: '1 1 auto',
              minHeight: 0,
            }}
          >
            {/* Название и Порядок в одной строке */}
            <Flex gap="4" style={{ marginBottom: '20px' }}>
              <Box style={{ flex: 1 }}>
                <Text size="2" weight="medium" style={{ display: 'block', marginBottom: '8px' }}>
                  Название <Text color="red">*</Text>
                </Text>
                <TextField.Root
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Введите название"
                  required
                  style={{ width: '100%' }}
                />
              </Box>
              <Box style={{ width: '150px', flexShrink: 0 }}>
                <Text size="2" weight="medium" style={{ display: 'block', marginBottom: '8px' }}>
                  Порядок
                </Text>
                <TextField.Root
                  type="number"
                  value={formData.order.toString()}
                  onChange={(e) => handleChange('order', parseInt(e.target.value) || 0)}
                  placeholder="0"
                  style={{ width: '100%' }}
                />
              </Box>
            </Flex>

            {/* Иконка и Цвет фона в одной строке */}
            <Flex gap="4" style={{ marginBottom: '20px' }}>
              <Box style={{ flex: 1 }}>
                <Text size="2" weight="medium" style={{ display: 'block', marginBottom: '8px' }}>
                  Иконка <Text color="red">*</Text>
                </Text>
                
                <Flex align="center" gap="2" style={{ marginBottom: '12px' }}>
                  {formData.icon && iconComponents[formData.icon] && (
                    <Box style={{ flexShrink: 0 }}>
                      {(() => {
                        const IconComponent = iconComponents[formData.icon]
                        return <IconComponent width={20} height={20} />
                      })()}
                    </Box>
                  )}
                  <Box style={{ flex: 1 }}>
                <Select.Root
                  key={formData.icon || 'empty'}
                  value={formData.icon || undefined}
                  onValueChange={(value) => {
                    handleChange('icon', value)
                  }}
                >
                      <Select.Trigger 
                        placeholder="Выберите иконку..." 
                        style={{ width: '100%' }}
                      >
                        {formData.icon && PRESET_ICONS.find(i => i.value === formData.icon)?.label}
                      </Select.Trigger>
                      <Select.Content 
                        position="popper"
                        style={{ maxHeight: '300px', overflowY: 'auto' }}
                      >
                        {PRESET_ICONS.map(icon => {
                          const IconComponent = icon.icon
                          return (
                            <Select.Item key={icon.value} value={icon.value}>
                              <Flex align="center" gap="2">
                                <IconComponent width={16} height={16} />
                                <Text>{icon.label}</Text>
                              </Flex>
                            </Select.Item>
                          )
                        })}
                      </Select.Content>
                    </Select.Root>
                  </Box>
                </Flex>
                
                <Text size="1" color="gray" style={{ display: 'block', marginBottom: '8px' }}>
                  Выберите иконку из списка @radix-ui/react-icons
                </Text>
              </Box>
              
              <Box style={{ width: '200px', flexShrink: 0 }}>
                <Text size="2" weight="medium" style={{ display: 'block', marginBottom: '8px' }}>
                  Цвет фона
                </Text>
                <Flex direction="column" gap="2">
                  <Flex align="center" gap="2">
                    <input
                      type="color"
                      value={formData.color}
                      onChange={(e) => handleChange('color', e.target.value)}
                      className={styles.colorPicker}
                      style={{ flexShrink: 0 }}
                    />
                    <TextField.Root
                      value={formData.color}
                      onChange={(e) => handleChange('color', e.target.value)}
                      placeholder="#007bff"
                      style={{ flex: 1 }}
                    />
                  </Flex>
                </Flex>
                <Text size="1" color="gray" style={{ display: 'block', marginTop: '8px' }}>
                  Выберите цвет фона для кнопки
                </Text>
              </Box>
            </Flex>

            {/* Тип */}
            <Box style={{ marginBottom: '20px' }}>
              <Text size="2" weight="medium" style={{ display: 'block', marginBottom: '8px' }}>
                Тип <Text color="red">*</Text>
              </Text>
              <Select.Root
                value={formData.type}
                onValueChange={(value: 'link' | 'text' | 'datetime') => handleChange('type', value)}
              >
                <Select.Trigger placeholder="Выберите тип..." style={{ width: '100%' }} />
                <Select.Content>
                  <Select.Item value="link">Ссылка</Select.Item>
                  <Select.Item value="text">Текст</Select.Item>
                  <Select.Item value="datetime">Дата/время</Select.Item>
                </Select.Content>
              </Select.Root>
            </Box>

            {/* Значение - зависит от типа */}
            <Box style={{ marginBottom: '20px' }}>
              <Text size="2" weight="medium" style={{ display: 'block', marginBottom: '8px' }}>
                Значение <Text color="red">*</Text>
              </Text>
              {formData.type === 'text' ? (
                <TextArea
                  value={formData.value}
                  onChange={(e) => handleChange('value', e.target.value)}
                  placeholder="Введите текст"
                  required
                  style={{ width: '100%', minHeight: '100px', marginBottom: '8px' }}
                />
              ) : formData.type === 'datetime' ? (
                <TextField.Root
                  type="datetime-local"
                  value={formData.value}
                  onChange={(e) => handleChange('value', e.target.value)}
                  required
                  style={{ width: '100%', marginBottom: '8px' }}
                />
              ) : (
                <TextField.Root
                  type="url"
                  value={formData.value}
                  onChange={(e) => handleChange('value', e.target.value)}
                  placeholder="https://example.com или /path или mailto:email@example.com или tel:+1234567890"
                  required
                  style={{ width: '100%', marginBottom: '8px' }}
                />
              )}
              <Text size="1" color="gray" style={{ display: 'block' }}>
                {getValueHelperText()}
              </Text>
            </Box>
          </Box>

          {/* Кнопки */}
          <Flex 
            justify="end" 
            gap="3" 
            className={styles.modalFooter}
            style={{ flexShrink: 0 }}
          >
            <Button variant="soft" type="button" onClick={onClose}>
              Отмена
            </Button>
            <Button
              variant="solid"
              type="submit"
              style={{ backgroundColor: 'var(--accent-9)' }}
            >
              Сохранить
            </Button>
          </Flex>
        </form>
      </Box>
    </Box>
  )
}