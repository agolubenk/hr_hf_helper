'use client'

import { Box, Text, Flex, Button, Table, Switch, Separator } from "@radix-ui/themes"
import { useToast } from "@/components/Toast/ToastContext"
import {
  PlusIcon,
  Pencil1Icon,
  TrashIcon,
  LightningBoltIcon,
  HomeIcon,
  PersonIcon,
  EnvelopeClosedIcon,
  CalendarIcon,
  ClockIcon,
  PaperPlaneIcon,
  FileTextIcon,
  StarIcon,
  HeartIcon,
  Link2Icon,
  GearIcon,
  CheckIcon,
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
} from "@radix-ui/react-icons"
import { useState, useEffect } from "react"
import QuickButtonModal from "./QuickButtonModal"
import styles from './QuickButtonsPage.module.css'

import { QUICK_BUTTONS_ENABLED_KEY } from "@/components/FloatingActions"

const SCROLL_TOP_BUTTON_STORAGE_KEY = 'floatingActionsScrollTopEnabled'
const SETTINGS_BUTTON_STORAGE_KEY = 'floatingActionsSettingsEnabled'

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

interface QuickButton {
  id: string
  name: string
  icon: string
  color: string
  type: 'link' | 'text' | 'datetime'
  value: string
  order: number
}

// Начальные фиктивные данные для быстрых кнопок
const initialButtons: QuickButton[] = [
  {
    id: '1',
    name: 'Huntflow',
    icon: 'LightningBoltIcon',
    color: '#3b82f6',
    type: 'link',
    value: 'https://huntflow.ru',
    order: 1,
  },
  {
    id: '2',
    name: 'Календарь встреч',
    icon: 'CalendarIcon',
    color: '#10b981',
    type: 'link',
    value: 'https://calendar.google.com',
    order: 2,
  },
  {
    id: '3',
    name: 'Email',
    icon: 'EnvelopeClosedIcon',
    color: '#f59e0b',
    type: 'link',
    value: 'mailto:andrei.golubenko@softnetix.io',
    order: 3,
  },
  {
    id: '4',
    name: 'Телеграм',
    icon: 'PaperPlaneIcon',
    color: '#06b6d4',
    type: 'link',
    value: 'https://t.me/talent_softnetix',
    order: 4,
  },
  {
    id: '5',
    name: 'Рабочий график',
    icon: 'ClockIcon',
    color: '#8b5cf6',
    type: 'text',
    value: '11:00 - 18:30',
    order: 5,
  },
  {
    id: '6',
    name: 'Следующая встреча',
    icon: 'CalendarIcon',
    color: '#ef4444',
    type: 'datetime',
    value: '2026-01-15T14:00',
    order: 6,
  },
  {
    id: '7',
    name: 'GitHub',
    icon: 'GitHubLogoIcon',
    color: '#1f2937',
    type: 'link',
    value: 'https://github.com',
    order: 7,
  },
]

export default function QuickButtonsPage() {
  const toast = useToast()
  const [buttons, setButtons] = useState<QuickButton[]>(initialButtons)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingButton, setEditingButton] = useState<QuickButton | null>(null)
  
  // Состояние включения/выключения быстрых кнопок (по умолчанию включено)
  const [isQuickButtonsEnabled, setIsQuickButtonsEnabled] = useState(() => {
    if (typeof window === 'undefined') return true
    try {
      const saved = localStorage.getItem(QUICK_BUTTONS_ENABLED_KEY)
      return saved !== null ? saved === 'true' : true // По умолчанию включено
    } catch (error) {
      console.error('Ошибка при загрузке состояния быстрых кнопок:', error)
      return true
    }
  })
  
  // Состояние видимости кнопки "Вверх" (по умолчанию включено)
  const [isScrollTopEnabled, setIsScrollTopEnabled] = useState(() => {
    if (typeof window === 'undefined') return true
    try {
      const saved = localStorage.getItem(SCROLL_TOP_BUTTON_STORAGE_KEY)
      return saved !== null ? saved === 'true' : true // По умолчанию включено
    } catch (error) {
      console.error('Ошибка при загрузке состояния кнопки "Вверх":', error)
      return true
    }
  })

  // Состояние видимости кнопки "Настройки" (по умолчанию включено)
  const [isSettingsEnabled, setIsSettingsEnabled] = useState(() => {
    if (typeof window === 'undefined') return true
    try {
      const saved = localStorage.getItem(SETTINGS_BUTTON_STORAGE_KEY)
      return saved !== null ? saved === 'true' : true // По умолчанию включено
    } catch (error) {
      console.error('Ошибка при загрузке состояния кнопки "Настройки":', error)
      return true
    }
  })

  // Сохраняем состояние кнопки "Вверх" в localStorage и отправляем событие для синхронизации
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const valueString = String(isScrollTopEnabled)
      localStorage.setItem(SCROLL_TOP_BUTTON_STORAGE_KEY, valueString)
      console.log(`💾 Сохранено состояние кнопки "Вверх": ${isScrollTopEnabled} (${valueString})`)
      
      // Отправляем кастомное событие для синхронизации в той же вкладке
      window.dispatchEvent(new CustomEvent('localStorageChange', {
        detail: {
          key: SCROLL_TOP_BUTTON_STORAGE_KEY,
          value: valueString
        }
      }))
      console.log(`📤 Отправлено событие для синхронизации кнопки "Вверх": ${valueString}`)
    } catch (error) {
      console.error('❌ Ошибка при сохранении состояния кнопки "Вверх":', error)
    }
  }, [isScrollTopEnabled])

  // Сохраняем состояние кнопки "Настройки" в localStorage и отправляем событие для синхронизации
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const valueString = String(isSettingsEnabled)
      localStorage.setItem(SETTINGS_BUTTON_STORAGE_KEY, valueString)
      console.log(`💾 Сохранено состояние кнопки "Настройки": ${isSettingsEnabled} (${valueString})`)
      
      // Отправляем кастомное событие для синхронизации в той же вкладке
      window.dispatchEvent(new CustomEvent('localStorageChange', {
        detail: {
          key: SETTINGS_BUTTON_STORAGE_KEY,
          value: valueString
        }
      }))
      console.log(`📤 Отправлено событие для синхронизации кнопки "Настройки": ${valueString}`)
    } catch (error) {
      console.error('❌ Ошибка при сохранении состояния кнопки "Настройки":', error)
    }
  }, [isSettingsEnabled])

  // Сохраняем состояние включения/выключения быстрых кнопок в localStorage и отправляем событие для синхронизации
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const valueString = String(isQuickButtonsEnabled)
      localStorage.setItem(QUICK_BUTTONS_ENABLED_KEY, valueString)
      console.log(`💾 Сохранено состояние быстрых кнопок: ${isQuickButtonsEnabled} (${valueString})`)
      
      // Отправляем кастомное событие для синхронизации в той же вкладке
      window.dispatchEvent(new CustomEvent('localStorageChange', {
        detail: {
          key: QUICK_BUTTONS_ENABLED_KEY,
          value: valueString
        }
      }))
      console.log(`📤 Отправлено событие для синхронизации быстрых кнопок: ${valueString}`)
    } catch (error) {
      console.error('❌ Ошибка при сохранении состояния быстрых кнопок:', error)
    }
  }, [isQuickButtonsEnabled])

  // Слушаем изменения в localStorage для синхронизации между вкладками
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleStorageChange = (e: CustomEvent) => {
      if (e.detail?.key === QUICK_BUTTONS_ENABLED_KEY) {
        setIsQuickButtonsEnabled(e.detail.value === 'true')
      }
    }

    window.addEventListener('localStorageChange', handleStorageChange as EventListener)
    return () => {
      window.removeEventListener('localStorageChange', handleStorageChange as EventListener)
    }
  }, [])

  const handleCreate = () => {
    if (buttons.length >= 15) {
      alert('Максимальное количество быстрых кнопок - 15')
      return
    }
    setEditingButton(null)
    setIsModalOpen(true)
  }

  const handleEdit = (button: QuickButton) => {
    setEditingButton(button)
    setIsModalOpen(true)
  }

  const handleDelete = (id: string) => {
    toast.showWarning('Удалить кнопку?', 'Вы уверены, что хотите удалить эту кнопку?', {
      actions: [
        { label: 'Отмена', onClick: () => {}, variant: 'soft', color: 'gray' },
        { label: 'Удалить', onClick: () => setButtons(prev => prev.filter(btn => btn.id !== id)), variant: 'solid', color: 'red' },
      ],
    })
  }

  const handleSave = (data: Omit<QuickButton, 'id'> & { id?: string }) => {
    if (editingButton) {
      // Редактирование существующей кнопки
      setButtons(prev => prev.map(btn => 
        btn.id === editingButton.id 
          ? { ...data, id: editingButton.id }
          : btn
      ))
    } else {
      // Создание новой кнопки
      if (buttons.length >= 15) {
        alert('Максимальное количество быстрых кнопок - 15')
        return
      }
      const newButton: QuickButton = {
        ...data,
        id: Date.now().toString(), // Временный ID, в реальном приложении будет приходить с сервера
      }
      setButtons(prev => [...prev, newButton].sort((a, b) => a.order - b.order))
    }
    setIsModalOpen(false)
    setEditingButton(null)
  }

  const handleClose = () => {
    setIsModalOpen(false)
    setEditingButton(null)
  }

  // Получаем тип для отображения
  const getTypeDisplay = (type: string) => {
    switch (type) {
      case 'link':
        return 'Ссылка'
      case 'text':
        return 'Текст'
      case 'datetime':
        return 'Дата/время'
      default:
        return type
    }
  }

  // Рендерим иконку на основе имени
  const renderIcon = (iconName: string, size: number = 16) => {
    if (iconComponents[iconName]) {
      const IconComponent = iconComponents[iconName]
      return <IconComponent width={size} height={size} />
    }
    // Fallback для старых иконок Font Awesome или других форматов
    return <span style={{ fontSize: `${size}px` }}>⚡</span>
  }

  return (
    <Box className={styles.quickButtonsBlock}>

      {/* Заголовок */}
      <Box className={styles.header}>
        <Flex align="center" justify="between" width="100%">
          <Flex align="center" gap="2">
            <LightningBoltIcon width="20" height="20" />
            <Text size="4" weight="bold">
              Быстрые кнопки
            </Text>
            {buttons.length > 0 && (
              <Text size="2" color="gray" style={{ marginLeft: '8px' }}>
                ({buttons.length}/15)
              </Text>
            )}
          </Flex>
          <Flex align="center" gap="3">
            <Flex align="center" gap="2">
              <Switch
                checked={isQuickButtonsEnabled}
                onCheckedChange={setIsQuickButtonsEnabled}
                size="2"
              />
              <Text size="2" color="gray">
                {isQuickButtonsEnabled ? 'Включено' : 'Выключено'}
              </Text>
            </Flex>
            <Button
              variant="solid"
              style={{ backgroundColor: 'var(--accent-9)' }}
              onClick={handleCreate}
              disabled={buttons.length >= 15}
            >
              <PlusIcon width="14" height="14" />
              {buttons.length === 0 ? 'Создать' : 'Добавить'}
            </Button>
          </Flex>
        </Flex>
      </Box>

      {/* Таблица */}
      <Box className={styles.content}>
        {buttons.length === 0 ? (
          <Box className={styles.emptyState}>
            <LightningBoltIcon width="48" height="48" style={{ opacity: 0.3, marginBottom: '16px' }} />
            <Text size="3" weight="medium" style={{ display: 'block', marginBottom: '8px' }}>
              Нет быстрых кнопок
            </Text>
            <Text size="2" color="gray" style={{ display: 'block', marginBottom: '16px' }}>
              Создайте свою первую быструю кнопку для быстрого доступа к важной информации
            </Text>
            <Button
              variant="solid"
              style={{ backgroundColor: 'var(--accent-9)' }}
              onClick={handleCreate}
            >
              <PlusIcon width="14" height="14" />
              Создать
            </Button>
          </Box>
        ) : (
          <Box className={styles.tableContainer}>
            <Table.Root>
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeaderCell style={{ width: '60px' }}>№</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell style={{ width: '80px' }}>Иконка</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell style={{ width: '100px' }}>Цвет</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Название</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell style={{ width: '120px' }}>Тип</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell style={{ width: '120px' }}>Действия</Table.ColumnHeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {buttons.map((button, index) => (
                  <Table.Row key={button.id}>
                    <Table.Cell>
                      <Text size="2">{index + 1}</Text>
                    </Table.Cell>
                    <Table.Cell>
                      <Box
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '6px',
                          backgroundColor: button.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#ffffff',
                        }}
                        title={button.icon}
                      >
                        {renderIcon(button.icon, 18)}
                      </Box>
                    </Table.Cell>
                    <Table.Cell>
                      <Text size="2" color="gray">{button.color}</Text>
                    </Table.Cell>
                    <Table.Cell>
                      <Text size="2">{button.name}</Text>
                    </Table.Cell>
                    <Table.Cell>
                      <Text size="2">{getTypeDisplay(button.type)}</Text>
                    </Table.Cell>
                    <Table.Cell>
                      <Flex gap="2">
                        <Button
                          size="1"
                          variant="soft"
                          onClick={() => handleEdit(button)}
                          title="Редактировать"
                        >
                          <Pencil1Icon width="14" height="14" />
                        </Button>
                        <Button
                          size="1"
                          variant="soft"
                          color="red"
                          onClick={() => handleDelete(button.id)}
                          title="Удалить"
                        >
                          <TrashIcon width="14" height="14" />
                        </Button>
                      </Flex>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Box>
        )}

        {/* Настройка кнопки "Вверх" */}
        {buttons.length > 0 && (
          <>
            <Flex align="center" gap="3" py="2" mt="4">
              <Switch
                checked={isScrollTopEnabled}
                onCheckedChange={setIsScrollTopEnabled}
                size="2"
              />
              <ArrowUpIcon width="20" height="20" style={{ opacity: 0.7 }} />
              <Box>
                <Text size="3" weight="medium" style={{ display: 'block', marginBottom: '2px' }}>
                  Кнопка "Вверх"
                </Text>
                <Text size="2" color="gray">
                  Показать кнопку "Вверх" в панели быстрых кнопок
                </Text>
              </Box>
            </Flex>

            {/* Разделитель */}
            <Separator size="4" my="2" />

            {/* Настройка кнопки "Настройки" */}
            <Flex align="center" gap="3" py="2">
              <Switch
                checked={isSettingsEnabled}
                onCheckedChange={setIsSettingsEnabled}
                size="2"
              />
              <GearIcon width="20" height="20" style={{ opacity: 0.7 }} />
              <Box>
                <Text size="3" weight="medium" style={{ display: 'block', marginBottom: '2px' }}>
                  Кнопка "Настройки"
                </Text>
                <Text size="2" color="gray">
                  Показать кнопку "Настройки" в панели быстрых кнопок
                </Text>
              </Box>
            </Flex>
          </>
        )}
      </Box>

      {/* Модальное окно */}
      <QuickButtonModal
        isOpen={isModalOpen}
        onClose={handleClose}
        onSave={handleSave}
        initialData={editingButton}
      />
    </Box>
  )
}