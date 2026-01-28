// QuickButtonsPage - Страница управления быстрыми кнопками
// См. QuickButtonsPage.DOCUMENTATION.md для подробной документации

'use client'

// Импорты компонентов Radix UI для создания интерфейса
import { Box, Text, Flex, Button, Table, Switch, Separator } from "@radix-ui/themes"
// Импорт хука для отображения уведомлений
import { useToast } from "@/components/Toast/ToastContext"
// Импорты иконок из Radix UI (более 60 иконок для выбора в модальном окне)
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

// Импорт константы ключа localStorage для включения/выключения быстрых кнопок
import { QUICK_BUTTONS_ENABLED_KEY } from "@/components/FloatingActions"

/**
 * Константы ключей localStorage для настроек быстрых кнопок
 * 
 * Назначение: Используются для сохранения и чтения настроек из localStorage
 * 
 * Ключи:
 * - SCROLL_TOP_BUTTON_STORAGE_KEY: видимость кнопки "Вверх" (прокрутка в начало страницы)
 * - SETTINGS_BUTTON_STORAGE_KEY: видимость кнопки "Настройки"
 * - QUICK_BUTTONS_ENABLED_KEY: включение/выключение всех быстрых кнопок (импортируется из FloatingActions)
 * 
 * Использование: Синхронизируются с компонентом FloatingActions через общие ключи localStorage
 */
const SCROLL_TOP_BUTTON_STORAGE_KEY = 'floatingActionsScrollTopEnabled'
const SETTINGS_BUTTON_STORAGE_KEY = 'floatingActionsSettingsEnabled'

/**
 * iconComponents - маппинг имен иконок на компоненты из Radix UI
 * 
 * Назначение: Используется для рендеринга иконок быстрых кнопок по имени
 * 
 * Структура:
 * - Ключ: строка с именем иконки (например, "HomeIcon", "CalendarIcon")
 * - Значение: React компонент иконки из @radix-ui/react-icons
 * 
 * Использование:
 * - renderIcon(iconName) использует этот маппинг для получения компонента иконки
 * - Поддерживает более 60 различных иконок
 * 
 * Пример:
 * - iconComponents['HomeIcon'] возвращает компонент HomeIcon
 * - renderIcon('HomeIcon', 16) рендерит <HomeIcon width={16} height={16} />
 */
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

/**
 * QuickButton - интерфейс быстрой кнопки
 * 
 * Структура:
 * - id: уникальный идентификатор кнопки (string)
 * - name: название кнопки, отображаемое пользователю (string)
 * - icon: имя иконки из iconComponents (string, например "HomeIcon", "CalendarIcon")
 * - color: цвет кнопки в формате hex (string, например "#3b82f6")
 * - type: тип кнопки ('link' | 'text' | 'datetime')
 *   - 'link': ссылка (открывается в новой вкладке)
 *   - 'text': текст (вставляется в активное поле ввода)
 *   - 'datetime': дата-время (вставляется текущая дата-время)
 * - value: значение кнопки (string)
 *   - Для 'link': URL ссылки (например, "https://huntflow.ru")
 *   - Для 'text': текст для вставки (например, "11:00 - 18:30")
 *   - Для 'datetime': формат даты-времени (например, "2026-01-15T14:00")
 * - order: порядок отображения кнопок (number, используется для сортировки)
 * 
 * Использование: Используется для хранения данных быстрых кнопок в состоянии компонента
 */
interface QuickButton {
  id: string
  name: string
  icon: string
  color: string
  type: 'link' | 'text' | 'datetime'
  value: string
  order: number
}

/**
 * initialButtons - начальные фиктивные данные для быстрых кнопок
 * 
 * Назначение: Используются для демонстрации функциональности до интеграции с API
 * 
 * Содержит примеры различных типов кнопок:
 * - Ссылки на внешние сервисы (Huntflow, Google Calendar, Email, Telegram, GitHub)
 * - Текстовые значения (рабочий график)
 * - Дата-время (следующая встреча)
 * 
 * TODO: Заменить на загрузку из API
 * - GET /api/user/quick-buttons - получение списка кнопок пользователя
 * - Использовать пустой массив [] если кнопок нет
 */
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

/**
 * QuickButtonsPage - компонент страницы управления быстрыми кнопками
 * 
 * Состояние:
 * - buttons: массив быстрых кнопок пользователя
 * - isModalOpen: флаг открытости модального окна создания/редактирования
 * - editingButton: кнопка для редактирования (null если создание новой)
 * - isQuickButtonsEnabled: включение/выключение всех быстрых кнопок
 * - isScrollTopEnabled: видимость кнопки "Вверх" (прокрутка в начало страницы)
 * - isSettingsEnabled: видимость кнопки "Настройки"
 * 
 * Поведение:
 * - При загрузке читает настройки из localStorage
 * - При изменении настроек сохраняет их в localStorage и синхронизирует между вкладками
 * - Максимальное количество кнопок: 15
 * - При удалении кнопки показывает подтверждение через toast
 */
export default function QuickButtonsPage() {
  // Хук для отображения уведомлений (используется для подтверждения удаления)
  const toast = useToast()
  
  // Состояние: массив быстрых кнопок пользователя
  // Инициализируется из initialButtons (моковые данные, TODO: загружать из API)
  const [buttons, setButtons] = useState<QuickButton[]>(initialButtons)
  
  // Состояние: флаг открытости модального окна создания/редактирования кнопки
  // true когда модальное окно открыто, false когда закрыто
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  // Состояние: кнопка для редактирования
  // null если создается новая кнопка, иначе объект QuickButton для редактирования
  const [editingButton, setEditingButton] = useState<QuickButton | null>(null)
  
  /**
   * isQuickButtonsEnabled - включение/выключение всех быстрых кнопок
   * 
   * Инициализация:
   * - Читает значение из localStorage с ключом QUICK_BUTTONS_ENABLED_KEY
   * - По умолчанию true (включено), если значение не найдено
   * - Обрабатывает ошибки чтения localStorage (например, в SSR)
   * 
   * Использование:
   * - Переключается через Switch в заголовке страницы
   * - Синхронизируется с компонентом FloatingActions через общий ключ localStorage
   * - Сохраняется в localStorage при изменении
   */
  const [isQuickButtonsEnabled, setIsQuickButtonsEnabled] = useState(() => {
    if (typeof window === 'undefined') return true // SSR: возвращаем значение по умолчанию
    try {
      const saved = localStorage.getItem(QUICK_BUTTONS_ENABLED_KEY)
      return saved !== null ? saved === 'true' : true // По умолчанию включено
    } catch (error) {
      console.error('Ошибка при загрузке состояния быстрых кнопок:', error)
      return true // При ошибке возвращаем значение по умолчанию
    }
  })
  
  /**
   * isScrollTopEnabled - видимость кнопки "Вверх" (прокрутка в начало страницы)
   * 
   * Инициализация:
   * - Читает значение из localStorage с ключом SCROLL_TOP_BUTTON_STORAGE_KEY
   * - По умолчанию true (включено), если значение не найдено
   * 
   * Использование:
   * - Переключается через Switch в настройках страницы
   * - Синхронизируется с компонентом FloatingActions через общий ключ localStorage
   * - Сохраняется в localStorage при изменении
   */
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

  /**
   * isSettingsEnabled - видимость кнопки "Настройки"
   * 
   * Инициализация:
   * - Читает значение из localStorage с ключом SETTINGS_BUTTON_STORAGE_KEY
   * - По умолчанию true (включено), если значение не найдено
   * 
   * Использование:
   * - Переключается через Switch в настройках страницы
   * - Синхронизируется с компонентом FloatingActions через общий ключ localStorage
   * - Сохраняется в localStorage при изменении
   */
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

  /**
   * useEffect - сохранение состояния кнопки "Вверх" в localStorage и синхронизация
   * 
   * Функциональность:
   * - Сохраняет состояние isScrollTopEnabled в localStorage
   * - Отправляет кастомное событие 'localStorageChange' для синхронизации в той же вкладке
   * - Синхронизируется с компонентом FloatingActions через общий ключ
   * 
   * Поведение:
   * - Выполняется при каждом изменении isScrollTopEnabled
   * - Сохраняет значение как строку ('true' или 'false')
   * - Отправляет событие для синхронизации в той же вкладке (storage event не срабатывает в той же вкладке)
   * 
   * Связи:
   * - FloatingActions: читает тот же ключ SCROLL_TOP_BUTTON_STORAGE_KEY для отображения/скрытия кнопки
   * - Другие вкладки браузера: синхронизируются через storage event (автоматически)
   */
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const valueString = String(isScrollTopEnabled)
      localStorage.setItem(SCROLL_TOP_BUTTON_STORAGE_KEY, valueString)
      console.log('💾 Сохранено состояние кнопки "Вверх":', isScrollTopEnabled, '(', valueString, ')')
      
      // Отправляем кастомное событие для синхронизации в той же вкладке
      // storage event не срабатывает в той же вкладке, поэтому используем кастомное событие
      window.dispatchEvent(new CustomEvent('localStorageChange', {
        detail: {
          key: SCROLL_TOP_BUTTON_STORAGE_KEY,
          value: valueString
        }
      }))
      console.log('📤 Отправлено событие для синхронизации кнопки "Вверх":', valueString)
    } catch (error) {
      console.error('❌ Ошибка при сохранении состояния кнопки "Вверх":', error)
    }
  }, [isScrollTopEnabled])

  /**
   * useEffect - сохранение состояния кнопки "Настройки" в localStorage и синхронизация
   * 
   * Функциональность:
   * - Сохраняет состояние isSettingsEnabled в localStorage
   * - Отправляет кастомное событие 'localStorageChange' для синхронизации в той же вкладке
   * - Синхронизируется с компонентом FloatingActions через общий ключ
   * 
   * Поведение:
   * - Выполняется при каждом изменении isSettingsEnabled
   * - Аналогично useEffect для isScrollTopEnabled
   */
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const valueString = String(isSettingsEnabled)
      localStorage.setItem(SETTINGS_BUTTON_STORAGE_KEY, valueString)
      console.log('💾 Сохранено состояние кнопки "Настройки":', isSettingsEnabled, '(', valueString, ')')
      
      // Отправляем кастомное событие для синхронизации в той же вкладке
      window.dispatchEvent(new CustomEvent('localStorageChange', {
        detail: {
          key: SETTINGS_BUTTON_STORAGE_KEY,
          value: valueString
        }
      }))
      console.log('📤 Отправлено событие для синхронизации кнопки "Настройки":', valueString)
    } catch (error) {
      console.error('❌ Ошибка при сохранении состояния кнопки "Настройки":', error)
    }
  }, [isSettingsEnabled])

  /**
   * useEffect - сохранение состояния включения/выключения быстрых кнопок в localStorage и синхронизация
   * 
   * Функциональность:
   * - Сохраняет состояние isQuickButtonsEnabled в localStorage
   * - Отправляет кастомное событие 'localStorageChange' для синхронизации в той же вкладке
   * - Синхронизируется с компонентом FloatingActions через общий ключ QUICK_BUTTONS_ENABLED_KEY
   * 
   * Поведение:
   * - Выполняется при каждом изменении isQuickButtonsEnabled
   * - Сохраняет значение как строку ('true' или 'false')
   * - Отправляет событие для синхронизации в той же вкладке
   * 
   * Связи:
   * - FloatingActions: читает тот же ключ QUICK_BUTTONS_ENABLED_KEY для показа/скрытия всех кнопок
   */
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const valueString = String(isQuickButtonsEnabled)
      localStorage.setItem(QUICK_BUTTONS_ENABLED_KEY, valueString)
      console.log('💾 Сохранено состояние быстрых кнопок:', isQuickButtonsEnabled, '(', valueString, ')')
      
      // Отправляем кастомное событие для синхронизации в той же вкладке
      window.dispatchEvent(new CustomEvent('localStorageChange', {
        detail: {
          key: QUICK_BUTTONS_ENABLED_KEY,
          value: valueString
        }
      }))
      console.log('📤 Отправлено событие для синхронизации быстрых кнопок:', valueString)
    } catch (error) {
      console.error('❌ Ошибка при сохранении состояния быстрых кнопок:', error)
    }
  }, [isQuickButtonsEnabled])

  /**
   * useEffect - слушатель изменений localStorage для синхронизации между вкладками браузера
   * 
   * Функциональность:
   * - Слушает кастомные события 'localStorageChange' в той же вкладке
   * - Обновляет состояние isQuickButtonsEnabled при изменении в другой вкладке
   * 
   * Поведение:
   * - Выполняется один раз при монтировании компонента (пустой массив зависимостей)
   * - Обрабатывает события с ключом QUICK_BUTTONS_ENABLED_KEY
   * - Обновляет состояние только если значение изменилось
   * 
   * Примечание:
   * - storage event (window.addEventListener('storage')) срабатывает только в других вкладках
   * - Для синхронизации в той же вкладке используется кастомное событие 'localStorageChange'
   * - Другие вкладки синхронизируются автоматически через storage event
   */
  useEffect(() => {
    if (typeof window === 'undefined') return

    /**
     * handleStorageChange - обработчик кастомного события для синхронизации в той же вкладке
     * 
     * Функциональность:
     * - Обрабатывает события с ключом QUICK_BUTTONS_ENABLED_KEY
     * - Обновляет состояние isQuickButtonsEnabled
     * 
     * Поведение:
     * - Вызывается при отправке события 'localStorageChange' в той же вкладке
     * - Обновляет состояние только если ключ совпадает
     */
    const handleStorageChange = (e: CustomEvent) => {
      if (e.detail?.key === QUICK_BUTTONS_ENABLED_KEY) {
        setIsQuickButtonsEnabled(e.detail.value === 'true')
      }
    }

    // Подписываемся на кастомное событие для синхронизации в той же вкладке
    window.addEventListener('localStorageChange', handleStorageChange as EventListener)
    
    // Очистка: удаляем обработчик при размонтировании компонента
    return () => {
      window.removeEventListener('localStorageChange', handleStorageChange as EventListener)
    }
  }, [])

  /**
   * handleCreate - обработчик создания новой быстрой кнопки
   * 
   * Функциональность:
   * - Проверяет максимальное количество кнопок (15)
   * - Открывает модальное окно для создания новой кнопки
   * 
   * Поведение:
   * - Вызывается при клике на кнопку "Создать" или "Добавить"
   * - Если достигнут лимит (15 кнопок) - показывает alert и не открывает модальное окно
   * - Устанавливает editingButton в null (создание новой кнопки)
   * - Открывает модальное окно (isModalOpen = true)
   */
  const handleCreate = () => {
    if (buttons.length >= 15) {
      alert('Максимальное количество быстрых кнопок - 15')
      return
    }
    setEditingButton(null) // Создание новой кнопки (не редактирование)
    setIsModalOpen(true) // Открываем модальное окно
  }

  /**
   * handleEdit - обработчик редактирования существующей быстрой кнопки
   * 
   * Функциональность:
   * - Устанавливает кнопку для редактирования
   * - Открывает модальное окно с данными выбранной кнопки
   * 
   * Поведение:
   * - Вызывается при клике на кнопку "Редактировать" в таблице
   * - Устанавливает editingButton в выбранную кнопку
   * - Открывает модальное окно (isModalOpen = true)
   * 
   * @param button - кнопка для редактирования (объект QuickButton)
   */
  const handleEdit = (button: QuickButton) => {
    setEditingButton(button) // Устанавливаем кнопку для редактирования
    setIsModalOpen(true) // Открываем модальное окно
  }

  /**
   * handleDelete - обработчик удаления быстрой кнопки
   * 
   * Функциональность:
   * - Показывает подтверждение удаления через toast
   * - Удаляет кнопку из массива после подтверждения
   * 
   * Поведение:
   * - Вызывается при клике на кнопку "Удалить" в таблице
   * - Показывает предупреждение с подтверждением через toast.showWarning
   * - При подтверждении удаляет кнопку из массива buttons
   * 
   * TODO: Реализовать удаление через API
   * - DELETE /api/user/quick-buttons/{id}
   * - Обработка ошибок удаления
   * 
   * @param id - идентификатор кнопки для удаления
   */
  const handleDelete = (id: string) => {
    // Показываем предупреждение с подтверждением через toast
    toast.showWarning('Удалить кнопку?', 'Вы уверены, что хотите удалить эту кнопку?', {
      actions: [
        // Кнопка "Отмена" - закрывает предупреждение без действий
        { label: 'Отмена', onClick: () => {}, variant: 'soft', color: 'gray' },
        // Кнопка "Удалить" - удаляет кнопку из массива
        { label: 'Удалить', onClick: () => setButtons(prev => prev.filter(btn => btn.id !== id)), variant: 'solid', color: 'red' },
      ],
    })
  }

  /**
   * handleSave - обработчик сохранения быстрой кнопки (создание или редактирование)
   * 
   * Функциональность:
   * - Сохраняет новую кнопку или обновляет существующую
   * - Сортирует кнопки по порядку (order)
   * - Закрывает модальное окно
   * 
   * Логика:
   * - Если editingButton не null - редактирование существующей кнопки
   * - Если editingButton null - создание новой кнопки
   * 
   * Поведение:
   * - Вызывается при сохранении в QuickButtonModal
   * - Проверяет максимальное количество кнопок при создании новой
   * - Генерирует временный ID для новой кнопки (Date.now().toString())
   * - Сортирует кнопки по полю order после добавления новой
   * - Закрывает модальное окно и сбрасывает editingButton
   * 
   * TODO: Реализовать сохранение через API
   * - POST /api/user/quick-buttons - создание новой кнопки
   * - PUT /api/user/quick-buttons/{id} - обновление существующей кнопки
   * - Обработка ответа: получение ID с сервера для новой кнопки
   * - Обработка ошибок сохранения
   * 
   * @param data - данные кнопки для сохранения (без id для новой кнопки, с id для редактирования)
   */
  const handleSave = (data: Omit<QuickButton, 'id'> & { id?: string }) => {
    if (editingButton) {
      // Редактирование существующей кнопки
      // Обновляем кнопку с тем же ID в массиве
      setButtons(prev => prev.map(btn => 
        btn.id === editingButton.id 
          ? { ...data, id: editingButton.id } // Сохраняем ID редактируемой кнопки
          : btn
      ))
    } else {
      // Создание новой кнопки
      // Проверяем максимальное количество кнопок
      if (buttons.length >= 15) {
        alert('Максимальное количество быстрых кнопок - 15')
        return
      }
      // Создаем новую кнопку с временным ID
      // В реальном приложении ID будет приходить с сервера после сохранения
      const newButton: QuickButton = {
        ...data,
        id: Date.now().toString(), // Временный ID, в реальном приложении будет приходить с сервера
      }
      // Добавляем новую кнопку и сортируем по порядку (order)
      setButtons(prev => [...prev, newButton].sort((a, b) => a.order - b.order))
    }
    // Закрываем модальное окно и сбрасываем editingButton
    setIsModalOpen(false)
    setEditingButton(null)
  }

  /**
   * handleClose - обработчик закрытия модального окна
   * 
   * Функциональность:
   * - Закрывает модальное окно
   * - Сбрасывает кнопку для редактирования
   * 
   * Поведение:
   * - Вызывается при закрытии модального окна (клик вне окна, кнопка закрытия)
   * - Устанавливает isModalOpen в false и editingButton в null
   */
  const handleClose = () => {
    setIsModalOpen(false)
    setEditingButton(null)
  }

  /**
   * getTypeDisplay - получение отображаемого названия типа кнопки
   * 
   * Функциональность:
   * - Преобразует внутренний тип кнопки в читаемое название на русском языке
   * 
   * Маппинг типов:
   * - 'link' → 'Ссылка'
   * - 'text' → 'Текст'
   * - 'datetime' → 'Дата/время'
   * - другие → возвращает исходное значение
   * 
   * Использование:
   * - Отображается в таблице кнопок в колонке "Тип"
   * 
   * @param type - тип кнопки ('link' | 'text' | 'datetime' | string)
   * @returns отображаемое название типа на русском языке
   */
  const getTypeDisplay = (type: string) => {
    switch (type) {
      case 'link':
        return 'Ссылка'
      case 'text':
        return 'Текст'
      case 'datetime':
        return 'Дата/время'
      default:
        return type // Возвращаем исходное значение для неизвестных типов
    }
  }

  /**
   * renderIcon - рендеринг иконки по имени
   * 
   * Функциональность:
   * - Получает компонент иконки из iconComponents по имени
   * - Рендерит иконку с указанным размером
   * - Использует fallback (эмодзи ⚡) если иконка не найдена
   * 
   * Использование:
   * - Отображает иконку кнопки в таблице и в модальном окне
   * - Поддерживает более 60 различных иконок из Radix UI
   * 
   * Поведение:
   * - Если иконка найдена в iconComponents - рендерит компонент иконки
   * - Если иконка не найдена - рендерит fallback (эмодзи ⚡)
   * 
   * @param iconName - имя иконки (например, "HomeIcon", "CalendarIcon")
   * @param size - размер иконки в пикселях (по умолчанию 16)
   * @returns React элемент с иконкой или fallback
   */
  const renderIcon = (iconName: string, size: number = 16) => {
    // Проверяем, есть ли иконка в маппинге iconComponents
    if (iconComponents[iconName]) {
      const IconComponent = iconComponents[iconName]
      return <IconComponent width={size} height={size} />
    }
    // Fallback для старых иконок Font Awesome или других форматов
    // Используем эмодзи как запасной вариант
    return <span style={{ fontSize: size + 'px' }}>⚡</span>
  }

  // Рендер компонента страницы управления быстрыми кнопками
  return (
    <Box className={styles.quickButtonsBlock}>

      {/* Заголовок блока быстрых кнопок
          styles.header - стили для заголовка (отступы, граница снизу)
          justify="between" - элементы по краям (название слева, переключатель/кнопка справа)
          width="100%" - полная ширина */}
      <Box className={styles.header}>
        <Flex align="center" justify="between" width="100%">
          {/* Левая часть заголовка: иконка, название и счетчик кнопок
              align="center" - выравнивание по центру
              gap="2" - отступ между элементами */}
          <Flex align="center" gap="2">
            {/* Иконка молнии - визуально обозначает тему быстрых действий
                width="20" height="20" - размер иконки */}
            <LightningBoltIcon width="20" height="20" />
            {/* Текст заголовка - название блока
                size="4" - средний размер текста
                weight="bold" - жирное начертание */}
            <Text size="4" weight="bold">
              Быстрые кнопки
            </Text>
            {/* Счетчик кнопок - отображается только если есть кнопки
                Формат: (текущее количество/максимальное количество)
                size="2" - маленький размер текста
                color="gray" - серый цвет для визуального отличия */}
            {buttons.length > 0 && (
              <Text size="2" color="gray" style={{ marginLeft: '8px' }}>
                ({buttons.length}/15)
              </Text>
            )}
          </Flex>
          {/* Правая часть заголовка: переключатель включения/выключения и кнопка создания
              align="center" - выравнивание по центру
              gap="3" - отступ между элементами */}
          <Flex align="center" gap="3">
            {/* Переключатель включения/выключения быстрых кнопок
                Switch - компонент переключателя из Radix UI
                checked={isQuickButtonsEnabled} - текущее состояние (включено/выключено)
                onCheckedChange={setIsQuickButtonsEnabled} - обработчик изменения
                size="2" - маленький размер переключателя
                Текст рядом показывает текущее состояние ("Включено" или "Выключено") */}
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
            {/* Кнопка создания/добавления новой быстрой кнопки
                variant="solid" - сплошной стиль
                backgroundColor: 'var(--accent-9)' - акцентный цвет темы
                onClick={handleCreate} - обработчик открытия модального окна
                disabled={buttons.length >= 15} - блокировка при достижении лимита (15 кнопок)
                Текст меняется: "Создать" если кнопок нет, "Добавить" если есть
                Внутри: иконка плюса и текст */}
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

      {/* Содержимое блока - таблица кнопок или пустое состояние
          styles.content - стили для контента (отступы, расположение)
          Условный рендеринг: пустое состояние если кнопок нет, таблица если есть */}
      <Box className={styles.content}>
        {buttons.length === 0 ? (
          <Box className={styles.emptyState}>
            {/* Пустое состояние - отображается когда нет быстрых кнопок
                styles.emptyState - стили для пустого состояния (центрирование, отступы)
                Содержит иконку, заголовок, описание и кнопку создания */}
            {/* Иконка молнии - визуально обозначает тему быстрых кнопок
                width="48" height="48" - крупный размер иконки
                opacity: 0.3 - полупрозрачность для визуального отличия
                marginBottom: '16px' - отступ снизу */}
            <LightningBoltIcon width="48" height="48" style={{ opacity: 0.3, marginBottom: '16px' }} />
            {/* Заголовок пустого состояния
                size="3" - средний размер текста
                weight="medium" - средняя жирность
                display: 'block' - блочный элемент
                marginBottom: '8px' - отступ снизу */}
            <Text size="3" weight="medium" style={{ display: 'block', marginBottom: '8px' }}>
              Нет быстрых кнопок
            </Text>
            {/* Описание пустого состояния - объясняет назначение быстрых кнопок
                size="2" - маленький размер текста
                color="gray" - серый цвет для визуального отличия
                display: 'block' - блочный элемент
                marginBottom: '16px' - отступ снизу */}
            <Text size="2" color="gray" style={{ display: 'block', marginBottom: '16px' }}>
              Создайте свою первую быструю кнопку для быстрого доступа к важной информации
            </Text>
            {/* Кнопка создания первой кнопки
                variant="solid" - сплошной стиль
                backgroundColor: 'var(--accent-9)' - акцентный цвет темы
                onClick={handleCreate} - обработчик открытия модального окна
                Внутри: иконка плюса и текст "Создать" */}
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
            {/* Таблица быстрых кнопок - отображается когда есть кнопки
                styles.tableContainer - стили для контейнера таблицы (отступы, скролл)
                Table.Root - корневой компонент таблицы из Radix UI */}
            <Table.Root>
              {/* Заголовок таблицы - названия колонок
                  Table.Header - контейнер заголовка таблицы
                  Table.Row - строка заголовка
                  Table.ColumnHeaderCell - ячейка заголовка колонки */}
              <Table.Header>
                <Table.Row>
                  {/* Колонка "№" - порядковый номер кнопки (ширина 60px) */}
                  <Table.ColumnHeaderCell style={{ width: '60px' }}>№</Table.ColumnHeaderCell>
                  {/* Колонка "Иконка" - визуальное отображение иконки кнопки (ширина 80px) */}
                  <Table.ColumnHeaderCell style={{ width: '80px' }}>Иконка</Table.ColumnHeaderCell>
                  {/* Колонка "Цвет" - hex код цвета кнопки (ширина 100px) */}
                  <Table.ColumnHeaderCell style={{ width: '100px' }}>Цвет</Table.ColumnHeaderCell>
                  {/* Колонка "Название" - название кнопки (автоматическая ширина) */}
                  <Table.ColumnHeaderCell>Название</Table.ColumnHeaderCell>
                  {/* Колонка "Тип" - тип кнопки (ссылка/текст/дата-время, ширина 120px) */}
                  <Table.ColumnHeaderCell style={{ width: '120px' }}>Тип</Table.ColumnHeaderCell>
                  {/* Колонка "Действия" - кнопки редактирования и удаления (ширина 120px) */}
                  <Table.ColumnHeaderCell style={{ width: '120px' }}>Действия</Table.ColumnHeaderCell>
                </Table.Row>
              </Table.Header>
              {/* Тело таблицы - строки с данными кнопок
                  Table.Body - контейнер тела таблицы
                  map - итерация по массиву buttons для создания строк */}
              <Table.Body>
                {buttons.map((button, index) => (
                  <Table.Row key={button.id}>
                    {/* Ячейка "№" - порядковый номер кнопки (начиная с 1)
                        index + 1 - номер строки (1, 2, 3, ...) */}
                    <Table.Cell>
                      <Text size="2">{index + 1}</Text>
                    </Table.Cell>
                    {/* Ячейка "Иконка" - визуальное отображение иконки кнопки
                        Box - контейнер для иконки с цветным фоном
                        width: '32px' height: '32px' - размер контейнера
                        borderRadius: '6px' - скругление углов
                        backgroundColor: button.color - цвет фона из данных кнопки
                        color: '#ffffff' - белый цвет иконки для контраста
                        title={button.icon} - подсказка с именем иконки при наведении
                        renderIcon(button.icon, 18) - рендеринг иконки по имени */}
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
                    {/* Ячейка "Цвет" - hex код цвета кнопки
                        size="2" - маленький размер текста
                        color="gray" - серый цвет для визуального отличия */}
                    <Table.Cell>
                      <Text size="2" color="gray">{button.color}</Text>
                    </Table.Cell>
                    {/* Ячейка "Название" - название кнопки
                        size="2" - маленький размер текста */}
                    <Table.Cell>
                      <Text size="2">{button.name}</Text>
                    </Table.Cell>
                    {/* Ячейка "Тип" - тип кнопки (отображаемое название на русском)
                        getTypeDisplay(button.type) - преобразование типа в читаемое название */}
                    <Table.Cell>
                      <Text size="2">{getTypeDisplay(button.type)}</Text>
                    </Table.Cell>
                    {/* Ячейка "Действия" - кнопки редактирования и удаления
                        gap="2" - отступ между кнопками */}
                    <Table.Cell>
                      <Flex gap="2">
                        {/* Кнопка "Редактировать" - открывает модальное окно для редактирования кнопки
                            size="1" - очень маленький размер кнопки
                            variant="soft" - мягкий стиль (прозрачный фон)
                            onClick={() => handleEdit(button)} - обработчик открытия модального окна
                            title - подсказка при наведении
                            Внутри: иконка карандаша */}
                        <Button
                          size="1"
                          variant="soft"
                          onClick={() => handleEdit(button)}
                          title="Редактировать"
                        >
                          <Pencil1Icon width="14" height="14" />
                        </Button>
                        {/* Кнопка "Удалить" - показывает подтверждение удаления через toast
                            size="1" - очень маленький размер кнопки
                            variant="soft" - мягкий стиль
                            color="red" - красный цвет для визуального обозначения опасного действия
                            onClick={() => handleDelete(button.id)} - обработчик удаления
                            title - подсказка при наведении
                            Внутри: иконка корзины */}
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

        {/* Настройки видимости дополнительных кнопок
            Отображаются только если есть хотя бы одна быстрая кнопка (buttons.length > 0)
            Содержат переключатели для кнопки "Вверх" и кнопки "Настройки" */}
        {buttons.length > 0 && (
          <>
            {/* Настройка видимости кнопки "Вверх" (прокрутка в начало страницы)
                align="center" - выравнивание по центру
                gap="3" - отступ между элементами
                py="2" - вертикальные отступы
                mt="4" - отступ сверху от таблицы */}
            <Flex align="center" gap="3" py="2" mt="4">
              {/* Switch переключатель видимости кнопки "Вверх"
                  checked={isScrollTopEnabled} - текущее состояние (включено/выключено)
                  onCheckedChange={setIsScrollTopEnabled} - обработчик изменения
                  size="2" - маленький размер переключателя */}
              <Switch
                checked={isScrollTopEnabled}
                onCheckedChange={setIsScrollTopEnabled}
                size="2"
              />
              {/* Иконка стрелки вверх - визуально обозначает кнопку "Вверх"
                  width="20" height="20" - размер иконки
                  opacity: 0.7 - полупрозрачность для визуального отличия */}
              <ArrowUpIcon width="20" height="20" style={{ opacity: 0.7 }} />
              {/* Описание настройки - название и объяснение */}
              <Box>
                {/* Название настройки
                    size="3" - средний размер текста
                    weight="medium" - средняя жирность
                    display: 'block' - блочный элемент
                    marginBottom: '2px' - отступ снизу */}
                <Text size="3" weight="medium" style={{ display: 'block', marginBottom: '2px' }}>
                  Кнопка "Вверх"
                </Text>
                {/* Описание настройки - объясняет назначение
                    size="2" - маленький размер текста
                    color="gray" - серый цвет для визуального отличия */}
                <Text size="2" color="gray">
                  Показать кнопку "Вверх" в панели быстрых кнопок
                </Text>
              </Box>
            </Flex>

            {/* Разделитель между настройками
                Separator - визуальный разделитель из Radix UI
                size="4" - размер разделителя
                my="2" - вертикальные отступы */}
            <Separator size="4" my="2" />

            {/* Настройка видимости кнопки "Настройки"
                align="center" - выравнивание по центру
                gap="3" - отступ между элементами
                py="2" - вертикальные отступы */}
            <Flex align="center" gap="3" py="2">
              {/* Switch переключатель видимости кнопки "Настройки"
                  checked={isSettingsEnabled} - текущее состояние (включено/выключено)
                  onCheckedChange={setIsSettingsEnabled} - обработчик изменения
                  size="2" - маленький размер переключателя */}
              <Switch
                checked={isSettingsEnabled}
                onCheckedChange={setIsSettingsEnabled}
                size="2"
              />
              {/* Иконка шестеренки - визуально обозначает кнопку "Настройки"
                  width="20" height="20" - размер иконки
                  opacity: 0.7 - полупрозрачность для визуального отличия */}
              <GearIcon width="20" height="20" style={{ opacity: 0.7 }} />
              {/* Описание настройки - название и объяснение */}
              <Box>
                {/* Название настройки
                    size="3" - средний размер текста
                    weight="medium" - средняя жирность
                    display: 'block' - блочный элемент
                    marginBottom: '2px' - отступ снизу */}
                <Text size="3" weight="medium" style={{ display: 'block', marginBottom: '2px' }}>
                  Кнопка "Настройки"
                </Text>
                {/* Описание настройки - объясняет назначение
                    size="2" - маленький размер текста
                    color="gray" - серый цвет для визуального отличия */}
                <Text size="2" color="gray">
                  Показать кнопку "Настройки" в панели быстрых кнопок
                </Text>
              </Box>
            </Flex>
          </>
        )}
      </Box>

      {/* Модальное окно создания/редактирования быстрой кнопки (условный рендеринг)
          QuickButtonModal - компонент модального окна для создания/редактирования кнопки
          isOpen={isModalOpen} - флаг открытости модального окна
          onClose={handleClose} - обработчик закрытия модального окна
          onSave={handleSave} - обработчик сохранения кнопки
          initialData={editingButton} - начальные данные для редактирования (null если создание новой) */}
      <QuickButtonModal
        isOpen={isModalOpen}
        onClose={handleClose}
        onSave={handleSave}
        initialData={editingButton}
      />
    </Box>
  )
}