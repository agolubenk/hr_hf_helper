/**
 * TelegramChatsPage (telegram/chats/page.tsx) - Страница управления чатами Telegram
 * 
 * Это самый сложный и функциональный компонент модуля Telegram интеграции, содержащий более 3900 строк кода.
 * 
 * Назначение:
 * Полнофункциональная страница для управления чатами Telegram, включая просмотр переписки, отправку сообщений,
 * настройки чатов и аккаунта, управление папками и исключениями уведомлений.
 * 
 * Основная функциональность:
 * 
 * 1. Управление чатами:
 *    - Отображение списка всех чатов с аватарами, названиями и превью сообщений
 *    - Поиск чатов по названию в реальном времени
 *    - Фильтрация по папкам и типам (чаты/каналы и группы)
 *    - Выбор и просмотр конкретного чата
 *    - Отображение непрочитанных сообщений
 * 
 * 2. Просмотр и отправка сообщений:
 *    - Просмотр истории переписки в выбранном чате
 *    - Отправка сообщений с поддержкой форматирования (Rich Text Input)
 *    - Прикрепление файлов к сообщениям
 *    - Автоматическая прокрутка к последнему сообщению
 *    - Отображение авторов сообщений в группах
 * 
 * 3. Форматирование сообщений:
 *    - Поддержка Markdown-подобного форматирования (жирный, курсив, ссылки, цитаты, код)
 *    - Визуальное форматирование в поле ввода
 *    - Горячие клавиши для форматирования
 *    - Превью ссылок под сообщениями
 * 
 * 4. Группы и подгруппы:
 *    - Поддержка групп с вложенными подгруппами
 *    - Скролл-меню для переключения между подгруппами
 *    - Вариант "Единый чат" для просмотра всех сообщений группы
 * 
 * 5. Настройки чатов:
 *    - Модальное окно настроек для каждого чата
 *    - Редактирование информации о контакте (инлайн и полное)
 *    - Управление заметками и автоматическими ответами
 *    - Блокировка/разблокировка контактов
 *    - Удаление контактов
 *    - Загрузка и просмотр изображений чатов
 * 
 * 6. Настройки аккаунта:
 *    - Просмотр и редактирование информации профиля
 *    - Загрузка и управление изображениями профиля
 *    - Настройки уведомлений и звуков
 *    - Управление исключениями уведомлений
 * 
 * 7. Управление папками:
 *    - Создание и удаление папок для организации чатов
 *    - Редактирование названий папок
 *    - Перетаскивание папок для изменения порядка (drag-and-drop)
 *    - Отображение количества чатов в каждой папке
 * 
 * 8. Исключения уведомлений:
 *    - Управление исключениями для личных чатов, групп и каналов
 *    - Добавление/удаление чатов из исключений
 *    - Поиск чатов в модальном окне исключений
 * 
 * 9. Адаптивность:
 *    - Адаптивная верстка для мобильных устройств
 *    - Мобильное меню для списка чатов
 *    - Автоматическое закрытие мобильного меню при выборе чата
 * 
 * Технические детали:
 * - Использует React hooks для управления состоянием
 * - Использует библиотеку @dnd-kit для drag-and-drop
 * - Использует Radix UI для UI компонентов
 * - Использует кастомные компоненты FormattedText и RichTextInput
 * - Использует систему уведомлений Toast
 * 
 * Состояние компонента:
 * - Более 30 переменных состояния для управления UI и данными
 * - Использует useCallback для мемоизации функций
 * - Использует useRef для доступа к DOM элементам
 * 
 * Связи:
 * - AppLayout: оборачивает страницу в общий layout
 * - /telegram: страница входа в Telegram
 * - /telegram/2fa: страница настройки 2FA
 * - @/components/aichat/FormattedText: компонент форматирования текста
 * - @/components/telegram/RichTextInput: компонент ввода с форматированием
 * - @/components/Toast/ToastContext: система уведомлений
 * 
 * TODO: Замена моковых данных на API:
 * - Загрузка чатов из Telegram API
 * - Отправка сообщений через Telegram API
 * - Загрузка истории сообщений
 * - Синхронизация в реальном времени
 * - Загрузка изображений на сервер
 * - Сохранение настроек через API
 * 
 * Подробная документация:
 * См. frontend/app/telegram/chats/PAGE_DOCUMENTATION.md для полного описания всех функций и возможностей.
 */

'use client'

import AppLayout from '@/components/AppLayout'
import { Box, Flex, Text, TextField, Button, Separator, TextArea, Badge, Avatar, Dialog, Card, SegmentedControl, Switch } from '@radix-ui/themes'
import Link from 'next/link'
import { useState, useRef, useCallback, useEffect } from 'react'
import { 
  MagnifyingGlassIcon, 
  GearIcon, 
  PaperPlaneIcon,
  DotsHorizontalIcon,
  BoxIcon,
  MixerHorizontalIcon,
  PersonIcon,
  HamburgerMenuIcon,
  ChevronDownIcon,
  Cross2Icon,
  ChatBubbleIcon,
  BellIcon,
  EnvelopeClosedIcon,
  Pencil1Icon,
  TrashIcon,
  HandIcon,
  CopyIcon,
  CheckIcon,
  CameraIcon,
  DesktopIcon,
  SpeakerLoudIcon,
  LockClosedIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  PlusIcon,
  StarIcon,
  ArchiveIcon,
  InfoCircledIcon,
  DragHandleDots2Icon
} from '@radix-ui/react-icons'
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import FormattedText from '@/components/aichat/FormattedText'
import RichTextInput from '@/components/telegram/RichTextInput'
import { useToast } from '@/components/Toast/ToastContext'
import styles from '../telegram.module.css'

/**
 * TelegramMessage - интерфейс сообщения в Telegram чате
 * 
 * Структура:
 * - id: уникальный идентификатор сообщения
 * - text: текст сообщения
 * - timestamp: время сообщения
 * - sender: отправитель ('user' - пользователь, 'telegram' - из Telegram)
 * - senderName: имя отправителя (для сообщений из Telegram)
 * - file: прикрепленный файл (опционально)
 */
interface TelegramMessage {
  id: string
  text: string
  timestamp: string
  sender: 'user' | 'telegram'
  senderName?: string
  file?: {
    name: string
    type: string
    size: number
  }
  subChatId?: string // ID подгруппы для групп
}

/**
 * TelegramChat - интерфейс чата Telegram
 * 
 * Структура:
 * - id: уникальный идентификатор чата
 * - name: название чата
 * - preview: превью последнего сообщения
 * - avatar: символ для аватара (первая буква названия)
 * - date: дата/время последнего сообщения (форматированная строка)
 * - unreadCount: количество непрочитанных сообщений
 * - messages: массив сообщений в чате
 * - folderId: ID папки, к которой привязан чат (опционально)
 * - type: тип чата ('chat' - чат, 'channel' - канал, 'group' - группа)
 * - username: имя пользователя в Telegram (опционально)
 * - nickname: никнейм (опционально)
 * - about: информация "О себе" (опционально)
 * - note: заметка пользователя (опционально)
 * - link: внешняя ссылка (например, на вакансию) (опционально)
 * - filesCount: количество прикрепленных файлов (опционально)
 * - autoReplyEnabled: включены ли автоматические ответы (опционально)
 * - status: статус пользователя (опционально, например "был(а) недавно")
 * - isBlocked: заблокирован ли контакт (опционально)
 * - lastName: фамилия пользователя (опционально)
 */
interface TelegramChat {
  id: string
  name: string
  preview: string
  avatar: string
  date: string
  unreadCount?: number
  messages?: TelegramMessage[]
  folderId?: string
  type: 'chat' | 'channel' | 'group'
  username?: string
  nickname?: string
  about?: string
  note?: string
  link?: string
  filesCount?: number
  autoReplyEnabled?: boolean
  status?: string
  isBlocked?: boolean
  lastName?: string
  phone?: string
  subChats?: Array<{ id: string; name: string }> // Подгруппы для групп
}

/**
 * MOCK_CHATS - моковые данные чатов Telegram интеграции
 * 
 * Структура чата:
 * - id: уникальный идентификатор чата
 * - name: название чата
 * - preview: превью последнего сообщения
 * - avatar: символ для аватара (первая буква названия)
 * - date: дата/время последнего сообщения (форматированная строка)
 * - unreadCount: количество непрочитанных сообщений
 * - messages: массив сообщений в чате
 * 
 * TODO: Заменить на реальные данные из API Telegram
 */
const MOCK_CHATS: TelegramChat[] = [
  // Папка "Работа" (folderId: '1')
  { 
    id: '1', 
    name: 'HR Helper — общий', 
    preview: 'Добро пожаловать в чат', 
    avatar: 'H', 
    date: '10:32',
    unreadCount: 2,
    folderId: '1',
    type: 'chat',
    username: 'AlexVavulo',
    nickname: 'AlexVavulo',
    about: 'Software engineer in the petrochemical industry',
    status: 'был(а) недавно',
    filesCount: 4,
    autoReplyEnabled: false,
    link: 'https://huntflow.ru/my/softnetix#/vacancy/3936868/filter/workon/id/79182755',
    messages: [
      { 
        id: '1', 
        text: 'Добро пожаловать в чат **HR Helper**\n\nЭто ваш личный помощник для работы с HR задачами.\n\n**Возможности:**\n\n* Управление кандидатами\n* Отслеживание вакансий\n* *Автоматизация процессов*\n\n> **Важно:** Все данные защищены\n> Используйте форматирование для лучшей читаемости\n\nПодробнее: [документация](https://docs.hrhelper.com)', 
        timestamp: '10:30', 
        sender: 'telegram', 
        senderName: 'HR Helper' 
      },
      { id: '2', text: 'Спасибо!', timestamp: '10:32', sender: 'user' },
      { 
        id: '3', 
        text: 'Если у вас есть вопросы, задавайте их здесь. Я помогу вам с:\n\n* Настройкой интеграций\n* Работой с кандидатами\n* Автоматизацией процессов\n\nТакже вы можете использовать форматирование для лучшей читаемости сообщений.', 
        timestamp: '10:33', 
        sender: 'telegram', 
        senderName: 'HR Helper' 
      },
    ]
  },
  { 
    id: '2', 
    name: 'Рекрутинг', 
    preview: 'Новая заявка по вакансии Frontend', 
    avatar: 'Р', 
    date: '09:15',
    unreadCount: 0,
    folderId: '1',
    type: 'chat',
    messages: [
      { 
        id: '1', 
        text: '**Новая заявка по вакансии**\n\n**Должность:** Frontend Developer\n**Кандидат:** Иван Иванов\n**Статус:** На рассмотрении\n\n> Резюме получено и обрабатывается\n\n[Просмотреть резюме](https://hrhelper.com/resume/123)', 
        timestamp: '09:15', 
        sender: 'telegram', 
        senderName: 'Рекрутинг' 
      },
      { id: '2', text: 'Отлично, посмотрю резюме', timestamp: '09:20', sender: 'user' },
      { 
        id: '3', 
        text: '**Обновление статуса**\n\nКандидат Иван Иванов переведен в статус "Техническое интервью"\n\n**Следующие шаги:**\n* Назначить дату интервью\n* Отправить приглашение\n* Подготовить вопросы', 
        timestamp: '09:25', 
        sender: 'telegram', 
        senderName: 'Рекрутинг' 
      },
    ]
  },
  { 
    id: '3', 
    name: 'Кандидаты', 
    preview: 'Иван: готов к интервью', 
    avatar: 'К', 
    date: 'Вчера',
    unreadCount: 5,
    folderId: '1',
    type: 'chat',
    messages: [
      { 
        id: '1', 
        text: 'Привет! Я **готов к интервью**.\n\nМогу в любое время, кроме:\n* Понедельник утро\n* Среда после 15:00\n\n> Жду подтверждения времени', 
        timestamp: 'Вчера 18:00', 
        sender: 'telegram', 
        senderName: 'Иван' 
      },
      { id: '2', text: 'Отлично, назначим на завтра', timestamp: 'Вчера 18:05', sender: 'user' },
      { 
        id: '3', 
        text: '**Напоминание об интервью**\n\nУ вас запланировано интервью с кандидатом Иван Иванов\n\n**Дата:** Завтра, 15:00\n**Формат:** Онлайн\n**Ссылка:** [Присоединиться](https://meet.hrhelper.com/interview-123)', 
        timestamp: 'Вчера 20:00', 
        sender: 'telegram', 
        senderName: 'HR Helper' 
      },
      { id: '4', text: 'Спасибо за напоминание!', timestamp: 'Вчера 20:05', sender: 'user' },
    ]
  },
  { 
    id: '4', 
    name: 'Поддержка', 
    preview: 'Вопрос по интеграции Huntflow', 
    avatar: 'П', 
    date: 'Вчера',
    unreadCount: 0,
    folderId: '1',
    type: 'chat',
    messages: [
      { 
        id: '1', 
        text: '**Вопрос по интеграции Huntflow**\n\nНужна помощь с настройкой:\n\n1. **Синхронизация кандидатов**\n2. *Автоматическая отправка* уведомлений\n3. ~~Старая интеграция~~ (не работает)\n\n\`\`\`\nAPI endpoint: /api/huntflow/sync\nStatus: pending\n\`\`\`\n\n> Можете помочь?\n\n[Документация API](https://api.hrhelper.com/docs)', 
        timestamp: 'Вчера 14:00', 
        sender: 'telegram', 
        senderName: 'Поддержка' 
      },
      { id: '2', text: 'Какой именно вопрос?', timestamp: 'Вчера 14:05', sender: 'user' },
      { 
        id: '3', 
        text: 'Проблема с синхронизацией кандидатов. Данные не обновляются автоматически.\n\n**Ожидаемое поведение:**\n* Автоматическая синхронизация каждые 5 минут\n* Обновление статусов кандидатов\n\n**Текущее поведение:**\n* Синхронизация не происходит\n* Статусы не обновляются', 
        timestamp: 'Вчера 14:10', 
        sender: 'telegram', 
        senderName: 'Поддержка' 
      },
      { id: '4', text: 'Проверю настройки интеграции', timestamp: 'Вчера 14:15', sender: 'user' },
    ]
  },
  // Папка "Личное" (folderId: '2')
  { 
    id: '5', 
    name: 'Семья', 
    preview: 'Не забудь купить продукты', 
    avatar: 'С', 
    date: 'Сегодня 08:00',
    unreadCount: 1,
    folderId: '2',
    type: 'chat',
    messages: [
      { 
        id: '1', 
        text: 'Привет! Не забудь купить продукты:\n\n* Молоко\n* Хлеб\n* Яйца\n* *Сыр*\n\n> Спасибо!', 
        timestamp: 'Сегодня 08:00', 
        sender: 'telegram', 
        senderName: 'Мама' 
      },
      { id: '2', text: 'Конечно, куплю после работы', timestamp: 'Сегодня 08:05', sender: 'user' },
    ]
  },
  { 
    id: '6', 
    name: 'Друзья', 
    preview: 'Встречаемся в субботу?', 
    avatar: 'Д', 
    date: 'Вчера 19:00',
    unreadCount: 0,
    folderId: '2',
    type: 'group',
    subChats: [
      { id: '6-1', name: 'Общий чат' },
      { id: '6-2', name: 'Игроки' },
      { id: '6-3', name: 'Путешествия' }
    ],
    messages: [
      { 
        id: '1', 
        text: '**Встреча в субботу**\n\nРебята, встречаемся в субботу в 18:00?\n\n**Место:** Кафе на проспекте\n**Время:** 18:00\n\n> Кто сможет?', 
        timestamp: 'Вчера 19:00', 
        sender: 'telegram', 
        senderName: 'Алексей',
        subChatId: '6-1' // ID подгруппы
      },
      { id: '2', text: 'Я смогу!', timestamp: 'Вчера 19:05', sender: 'user', subChatId: '6-1' },
      { 
        id: '3', 
        text: 'Отлично! Я тоже буду. Кто еще?', 
        timestamp: 'Вчера 19:10', 
        sender: 'telegram', 
        senderName: 'Мария',
        subChatId: '6-1'
      },
      {
        id: '4',
        text: 'Кто играет сегодня вечером?',
        timestamp: 'Вчера 20:00',
        sender: 'telegram',
        senderName: 'Иван',
        subChatId: '6-2'
      },
      {
        id: '5',
        text: 'Планируем поездку в Европу',
        timestamp: 'Вчера 21:00',
        sender: 'telegram',
        senderName: 'Ольга',
        subChatId: '6-3'
      }
    ]
  },
  // Папка "Важное" (folderId: '3')
  { 
    id: '7', 
    name: 'Важные уведомления', 
    preview: 'Новое обновление системы', 
    avatar: 'В', 
    date: 'Сегодня 09:00',
    unreadCount: 3,
    folderId: '3',
    type: 'channel',
    messages: [
      { 
        id: '1', 
        text: '**Важное обновление системы**\n\nВышло новое обновление HR Helper с улучшениями:\n\n* Улучшена производительность\n* Добавлены новые интеграции\n* Исправлены ошибки\n\n> Обновите приложение для получения всех улучшений\n\n[Подробнее](https://hrhelper.com/updates)', 
        timestamp: 'Сегодня 09:00', 
        sender: 'telegram', 
        senderName: 'HR Helper' 
      },
      { 
        id: '2', 
        text: '**Напоминание: еженедельный отчет**\n\nНе забудьте отправить еженедельный отчет до пятницы.\n\n**Дедлайн:** Пятница, 18:00', 
        timestamp: 'Сегодня 10:00', 
        sender: 'telegram', 
        senderName: 'HR Helper' 
      },
    ]
  },
  { 
    id: '8', 
    name: 'Срочные задачи', 
    preview: 'Срочно: проверь документы', 
    avatar: 'С', 
    date: 'Сегодня 11:00',
    unreadCount: 2,
    folderId: '3',
    type: 'chat',
    messages: [
      { 
        id: '1', 
        text: '**Срочно!**\n\nНужно проверить документы для нового кандидата.\n\n**Кандидат:** Петр Сидоров\n**Вакансия:** Backend Developer\n\n> Документы в приложении\n\n[Открыть документы](https://hrhelper.com/documents/456)', 
        timestamp: 'Сегодня 11:00', 
        sender: 'telegram', 
        senderName: 'Менеджер' 
      },
      { id: '2', text: 'Проверю сейчас', timestamp: 'Сегодня 11:05', sender: 'user' },
    ]
  },
  // Папка "Архив" (folderId: '4')
  { 
    id: '9', 
    name: 'Старые чаты', 
    preview: 'Архивные сообщения', 
    avatar: 'С', 
    date: 'Неделя назад',
    unreadCount: 0,
    folderId: '4',
    type: 'chat',
    messages: [
      { 
        id: '1', 
        text: 'Это архивный чат с прошлыми сообщениями.', 
        timestamp: 'Неделя назад 10:00', 
        sender: 'telegram', 
        senderName: 'Система' 
      },
    ]
  },
  // Папка "Клиенты" (folderId: '5')
  { 
    id: '10', 
    name: 'Клиент А', 
    preview: 'Обсуждение проекта', 
    avatar: 'К', 
    date: 'Вчера 16:00',
    unreadCount: 0,
    folderId: '5',
    type: 'chat',
    messages: [
      { 
        id: '1', 
        text: '**Обсуждение проекта**\n\nПривет! Хотел обсудить детали проекта.\n\n**Вопросы:**\n1. Сроки выполнения\n2. Бюджет\n3. Технические требования\n\n> Можем созвониться?', 
        timestamp: 'Вчера 16:00', 
        sender: 'telegram', 
        senderName: 'Клиент А' 
      },
      { id: '2', text: 'Конечно, давайте обсудим', timestamp: 'Вчера 16:05', sender: 'user' },
    ]
  },
  { 
    id: '11', 
    name: 'Клиент Б', 
    preview: 'Новый запрос', 
    avatar: 'К', 
    date: '2 дня назад',
    unreadCount: 1,
    folderId: '5',
    type: 'chat',
    messages: [
      { 
        id: '1', 
        text: '**Новый запрос**\n\nУ нас появился новый запрос на подбор персонала.\n\n**Должность:** DevOps Engineer\n**Количество:** 2 человека\n**Срочность:** Высокая', 
        timestamp: '2 дня назад 14:00', 
        sender: 'telegram', 
        senderName: 'Клиент Б' 
      },
    ]
  },
  // Папка "Коллеги" (folderId: '6')
  { 
    id: '12', 
    name: 'Команда разработки', 
    preview: 'Обсуждение новой функции', 
    avatar: 'К', 
    date: 'Сегодня 12:00',
    unreadCount: 0,
    folderId: '6',
    type: 'group',
    messages: [
      { 
        id: '1', 
        text: '**Обсуждение новой функции**\n\nРебята, давайте обсудим новую функцию для чата.\n\n**Идея:**\n* Форматирование текста\n* Прикрепление файлов\n* История сообщений\n\n> Что думаете?', 
        timestamp: 'Сегодня 12:00', 
        sender: 'telegram', 
        senderName: 'Анна' 
      },
      { id: '2', text: 'Отличная идея!', timestamp: 'Сегодня 12:05', sender: 'user' },
      { 
        id: '3', 
        text: 'Согласен, нужно добавить поддержку markdown', 
        timestamp: 'Сегодня 12:10', 
        sender: 'telegram', 
        senderName: 'Петр' 
      },
    ]
  },
  { 
    id: '13', 
    name: 'HR отдел', 
    preview: 'Планерка на завтра', 
    avatar: 'H', 
    date: 'Сегодня 13:00',
    unreadCount: 2,
    folderId: '6',
    type: 'group',
    messages: [
      { 
        id: '1', 
        text: '**Планерка на завтра**\n\nНапоминаю о планерке завтра в 10:00.\n\n**Повестка:**\n* Обсуждение новых вакансий\n* Отчеты по рекрутингу\n* Планы на неделю', 
        timestamp: 'Сегодня 13:00', 
        sender: 'telegram', 
        senderName: 'Руководитель' 
      },
      { 
        id: '2', 
        text: '**Материалы для планерки**\n\nПодготовьте, пожалуйста, отчеты:\n\n* Статистика по вакансиям\n* Количество кандидатов\n* Результаты интервью', 
        timestamp: 'Сегодня 13:05', 
        sender: 'telegram', 
        senderName: 'Руководитель' 
      },
    ]
  },
  // Папка "Проекты" (folderId: '7')
  { 
    id: '14', 
    name: 'Проект Альфа', 
    preview: 'Обновление статуса', 
    avatar: 'П', 
    date: 'Вчера 15:00',
    unreadCount: 0,
    folderId: '7',
    type: 'group',
    messages: [
      { 
        id: '1', 
        text: '**Обновление статуса проекта**\n\nПроект Альфа:\n* Статус: В разработке\n* Прогресс: 75%\n* Следующий этап: Тестирование', 
        timestamp: 'Вчера 15:00', 
        sender: 'telegram', 
        senderName: 'Менеджер проекта' 
      },
      { id: '2', text: 'Отлично, продолжаем работу', timestamp: 'Вчера 15:05', sender: 'user' },
    ]
  },
  { 
    id: '15', 
    name: 'Проект Бета', 
    preview: 'Новая задача', 
    avatar: 'П', 
    date: '3 дня назад',
    unreadCount: 1,
    folderId: '7',
    type: 'group',
    messages: [
      { 
        id: '1', 
        text: '**Новая задача**\n\nДобавлена новая задача в проект Бета.\n\n**Задача:** Интеграция с API\n**Приоритет:** Высокий\n**Исполнитель:** Требуется', 
        timestamp: '3 дня назад 10:00', 
        sender: 'telegram', 
        senderName: 'Система' 
      },
    ]
  },
  // Папка "Срочное" (folderId: '8')
  { 
    id: '16', 
    name: 'Срочные уведомления', 
    preview: 'Важное: проверь сейчас', 
    avatar: 'С', 
    date: 'Сегодня 14:00',
    unreadCount: 4,
    folderId: '8',
    type: 'channel',
    messages: [
      { 
        id: '1', 
        text: '**СРОЧНО!**\n\nТребуется немедленное внимание:\n\n* Проверка документов\n* Подтверждение встречи\n* Ответ на запрос клиента', 
        timestamp: 'Сегодня 14:00', 
        sender: 'telegram', 
        senderName: 'Система' 
      },
      { 
        id: '2', 
        text: '**Напоминание**\n\nНе забудьте выполнить срочные задачи до конца дня.', 
        timestamp: 'Сегодня 14:05', 
        sender: 'telegram', 
        senderName: 'Система' 
      },
    ]
  },
  // Чаты без папки (для демонстрации)
  { 
    id: '17', 
    name: 'Общий чат', 
    preview: 'Новое сообщение', 
    avatar: 'О', 
    date: 'Сегодня 15:00',
    unreadCount: 0,
    type: 'group',
    messages: [
      { 
        id: '1', 
        text: 'Привет всем! Как дела?', 
        timestamp: 'Сегодня 15:00', 
        sender: 'telegram', 
        senderName: 'Коллега' 
      },
      { id: '2', text: 'Все отлично, спасибо!', timestamp: 'Сегодня 15:05', sender: 'user' },
    ]
  },
  // Каналы
  { 
    id: '18', 
    name: 'Новости компании', 
    preview: 'Новое объявление', 
    avatar: 'Н', 
    date: 'Сегодня 16:00',
    unreadCount: 1,
    type: 'channel',
    messages: [
      { 
        id: '1', 
        text: '**Важное объявление**\n\nКомпания объявляет о новом проекте!\n\n**Детали:**\n* Начало: Следующий месяц\n* Команда: Формируется\n* Бюджет: Утвержден\n\n> Следите за обновлениями', 
        timestamp: 'Сегодня 16:00', 
        sender: 'telegram', 
        senderName: 'Администрация' 
      },
    ]
  },
  { 
    id: '19', 
    name: 'Технические новости', 
    preview: 'Обновление технологий', 
    avatar: 'Т', 
    date: 'Вчера 17:00',
    unreadCount: 0,
    type: 'channel',
    messages: [
      { 
        id: '1', 
        text: '**Обновление технологий**\n\nВышла новая версия React 19!\n\n**Основные изменения:**\n* Улучшена производительность\n* Новые хуки\n* Улучшенная типизация\n\n[Подробнее](https://react.dev)', 
        timestamp: 'Вчера 17:00', 
        sender: 'telegram', 
        senderName: 'Технический отдел' 
      },
    ]
  },
  // Заблокированный контакт
  { 
    id: '20', 
    name: 'Заблокированный', 
    preview: 'Этот контакт заблокирован', 
    avatar: 'З', 
    date: 'Неделя назад',
    unreadCount: 0,
    folderId: '2',
    type: 'chat',
    isBlocked: true,
    username: 'blocked_user',
    nickname: 'Blocked',
    about: 'Заблокированный пользователь',
    lastName: 'Пользователь',
    messages: []
  },
]

/**
 * TelegramChatsPage - компонент страницы управления чатами Telegram
 * 
 * Состояние:
 * - selectedChatId: ID выбранного чата (null если не выбран)
 * - searchQuery: поисковый запрос для фильтрации чатов
 * - activeSubmenu: активный пункт субменю ('account' | 'folders' | 'automation' | null)
 * - chatSettingsOpen: флаг открытия настроек чата
 * - settingsChatId: ID чата для настроек
 * - message: текст сообщения в поле ввода
 * 
 * Функциональность:
 * - Отображает список чатов интеграции
 * - Предоставляет поиск по чатам
 * - Показывает информацию о каждом чате
 * - Отображает окно чата при выборе чата
 * - Субменю вверху: настройки аккаунта, папки, настройки автоматизаций
 * - Настройки для каждого чата
 */
/**
 * TelegramChatsPage - Главный компонент страницы управления чатами Telegram
 * 
 * Это функциональный React компонент, который управляет всем функционалом страницы чатов.
 * Компонент использует множество хуков для управления состоянием и side-эффектами.
 * 
 * Структура компонента:
 * 1. Инициализация хуков и состояния
 * 2. Определение вычисляемых значений (selectedChat, filteredChats)
 * 3. Определение обработчиков событий (handleChatClick, handleSendMessage, etc.)
 * 4. Определение side-эффектов (useEffect для прокрутки)
 * 5. Рендер JSX с условной логикой
 * 
 * Производительность:
 * - Использует useCallback для мемоизации функций
 * - Использует useMemo для вычисляемых значений (где необходимо)
 * - Условный рендеринг для оптимизации
 * 
 * Размер:
 * - Более 3900 строк кода
 * - Более 30 переменных состояния
 * - Более 20 обработчиков событий
 * - Несколько модальных окон
 * - Сложная условная логика рендеринга
 */
export default function TelegramChatsPage() {
  /**
   * toast - Хук для отображения уведомлений
   * 
   * Используется для:
   * - Показа успешных операций (создание папки, сохранение настроек)
   * - Показа ошибок (валидация, ошибки загрузки)
   * - Показа предупреждений с действиями (удаление, блокировка)
   * 
   * Методы:
   * - toast.showSuccess(title, message) - успешная операция
   * - toast.showError(title, message) - ошибка
   * - toast.showWarning(title, message, options) - предупреждение с действиями
   */
  const toast = useToast()
  // ID выбранного чата (null если чат не выбран)
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null)
  // Поисковый запрос для фильтрации чатов
  const [searchQuery, setSearchQuery] = useState('')
  // Активный пункт субменю ('account' | 'folders' | 'automation' | null)
  const [activeSubmenu, setActiveSubmenu] = useState<'account' | 'folders' | 'automation' | null>(null)
  // Состояние модального окна настроек аккаунта
  const [accountSettingsOpen, setAccountSettingsOpen] = useState(false)
  const [accountSettingsView, setAccountSettingsView] = useState<'main' | 'myAccount' | 'notifications'>('main')
  // Состояние модального окна управления папками
  const [foldersSettingsOpen, setFoldersSettingsOpen] = useState(false)
  // Состояние для создания новой папки
  const [newFolderName, setNewFolderName] = useState('')
  const [isCreatingFolder, setIsCreatingFolder] = useState(false)
  // Состояние для редактирования названий папок
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null)
  const [editingFolderName, setEditingFolderName] = useState('')
  
  // Настройка сенсоров для drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 6,
      },
    })
  )
  
  // Состояние для настроек аккаунта
  const [accountName, setAccountName] = useState('Андрей')
  const [accountPhone, setAccountPhone] = useState('+375 29 104 9839')
  const [accountUsername, setAccountUsername] = useState('@Talent_Softnetix')
  const [accountBio, setAccountBio] = useState('')
  const [accountStatus, setAccountStatus] = useState('в сети')
  // Состояние для изображений профиля
  const [accountImages, setAccountImages] = useState<string[]>([])
  const [currentAccountImageIndex, setCurrentAccountImageIndex] = useState(0)
  const [mainAccountImageIndex, setMainAccountImageIndex] = useState(0) // Индекс главного изображения
  const [accountImageCarouselOpen, setAccountImageCarouselOpen] = useState(false)
  const accountImageInputRef = useRef<HTMLInputElement>(null)
  // Состояние для изображений чатов
  const [chatImages, setChatImages] = useState<Record<string, string[]>>({})
  const [currentChatImageIndex, setCurrentChatImageIndex] = useState(0)
  const [chatImageCarouselOpen, setChatImageCarouselOpen] = useState(false)
  const [chatImageCarouselChatId, setChatImageCarouselChatId] = useState<string | null>(null)
  const chatImageInputRef = useRef<HTMLInputElement>(null)
  // Состояние для редактирования полей аккаунта
  const [editingAccountField, setEditingAccountField] = useState<'name' | 'username' | null>(null)
  const [editingAccountName, setEditingAccountName] = useState('')
  const [editingAccountUsername, setEditingAccountUsername] = useState('')
  // Состояние для групп: выбранная подгруппа
  const [selectedSubChatId, setSelectedSubChatId] = useState<string | null>(null)
  
  // Состояние для уведомлений
  const [notificationsAllAccounts, setNotificationsAllAccounts] = useState(true)
  const [notificationsDesktop, setNotificationsDesktop] = useState(true)
  const [notificationsDockAnimation, setNotificationsDockAnimation] = useState(true)
  const [notificationsSound, setNotificationsSound] = useState(true)
  const [notificationsPrivateChats, setNotificationsPrivateChats] = useState(true)
  const [notificationsGroups, setNotificationsGroups] = useState(true)
  const [notificationsChannels, setNotificationsChannels] = useState(true)
  // Состояние для модального окна исключений
  const [exceptionsModalOpen, setExceptionsModalOpen] = useState(false)
  const [exceptionsModalType, setExceptionsModalType] = useState<'private' | 'groups' | 'channels' | null>(null)
  const [exceptionsSearchQuery, setExceptionsSearchQuery] = useState('')
  // Исключения для уведомлений (ID чатов, которые исключены)
  const [notificationExceptions, setNotificationExceptions] = useState<{
    private: string[]
    groups: string[]
    channels: string[]
  }>({
    private: [],
    groups: ['6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17'], // Пример: 12 исключений для групп
    channels: ['18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29'] // Пример: 12 исключений для каналов
  })
  // ID выбранной папки (null если не выбрана)
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)

  /**
   * Интерфейс папки
   */
  interface Folder {
    id: string
    name: string
    icon?: 'briefcase' | 'folder' | 'person' | 'box' | 'star' | 'archive' | 'users' | 'project' | 'urgent'
  }

  /**
   * MOCK_FOLDERS - моковые данные папок
   * 
   * Структура папки:
   * - id: уникальный идентификатор папки
   * - name: название папки
   * - icon: иконка папки (опционально)
   * 
   * TODO: Заменить на реальные данные из API
   */
  const [folders, setFolders] = useState<Folder[]>([
    { id: 'all', name: 'Все' }, // Папка "Все" - показывает все чаты
    { id: '1', name: 'Работа', icon: 'briefcase' },
    { id: '2', name: 'Личное', icon: 'person' },
    { id: '3', name: 'Важное', icon: 'star' },
    { id: '4', name: 'Архив', icon: 'archive' },
    { id: '5', name: 'Клиенты', icon: 'users' },
    { id: '6', name: 'Коллеги', icon: 'briefcase' },
    { id: '7', name: 'Проекты', icon: 'project' },
    { id: '8', name: 'Срочное', icon: 'urgent' },
  ])

  // Для обратной совместимости с существующим кодом
  const MOCK_FOLDERS = folders
  // Флаг открытия настроек чата
  const [chatSettingsOpen, setChatSettingsOpen] = useState(false)
  // ID чата для настроек
  const [settingsChatId, setSettingsChatId] = useState<string | null>(null)
  // Состояние автоматических ответов для текущего чата
  const [autoReplyEnabled, setAutoReplyEnabled] = useState(false)
  // Состояние заметки для текущего чата
  const [chatNote, setChatNote] = useState('')
  const [isEditingNote, setIsEditingNote] = useState(false)
  // Состояние редактирования контакта
  const [isEditingContact, setIsEditingContact] = useState(false)
  // Состояние полей редактирования контакта
  const [editName, setEditName] = useState('')
  const [editLastName, setEditLastName] = useState('')
  const [editNickname, setEditNickname] = useState('')
  const [editAbout, setEditAbout] = useState('')
  const [editUsername, setEditUsername] = useState('')
  const [editLink, setEditLink] = useState('')
  const [editPhone, setEditPhone] = useState('')
  // Состояние редактирования полей инлайн
  const [editingField, setEditingField] = useState<'name' | 'lastName' | 'phone' | 'username' | null>(null)
  // Состояние копирования username
  const [usernameCopied, setUsernameCopied] = useState(false)
  // Текст сообщения в поле ввода
  const [message, setMessage] = useState('')
  // Состояние чатов (для обновления сообщений)
  const [chats, setChats] = useState<TelegramChat[]>(MOCK_CHATS)
  // Массив прикрепленных файлов
  const [attachedFiles, setAttachedFiles] = useState<Array<{ id: string; file: File }>>([])
  // Ref для input файла (для программного вызова выбора файла)
  const fileInputRef = useRef<HTMLInputElement>(null)
  // Состояние открытия/закрытия списка чатов на мобильных устройствах
  const [mobileChatListOpen, setMobileChatListOpen] = useState(false)
  // Тип отображения: 'chats' - чаты, 'channels' - каналы и группы
  const [viewType, setViewType] = useState<'chats' | 'channels'>('chats')
  // Ref для контейнера сообщений: используется для прокрутки
  const messagesScrollRef = useRef<HTMLDivElement>(null)
  // Флаг нахождения внизу списка: true - пользователь внизу, false - прокрутил вверх
  const [isAtBottom, setIsAtBottom] = useState(true)

  /**
   * selectedChat - выбранный чат для отображения
   * 
   * Логика:
   * - Находит чат по selectedChatId в массиве chats
   * - Возвращает undefined если чат не выбран
   */
  const selectedChat = selectedChatId ? chats.find(c => c.id === selectedChatId) : undefined

  /**
   * filteredChats - отфильтрованный список чатов
   * 
   * Логика:
   * - Фильтрует чаты по поисковому запросу (название чата)
   * - Фильтрует по выбранной папке (если папка выбрана, показываются только чаты из этой папки)
   * - Фильтрует по типу (чаты/каналы и группы)
   * - Без учета регистра
   */
  const filteredChats = chats.filter(chat => {
    // Фильтр по поисковому запросу
    const matchesSearch = !searchQuery || chat.name.toLowerCase().includes(searchQuery.toLowerCase())
    
    // Фильтр по папке (если выбрана папка "Все" (id: 'all'), показываем все чаты, иначе только чаты из выбранной папки)
    const matchesFolder = !selectedFolderId || selectedFolderId === 'all' || chat.folderId === selectedFolderId
    
    // Фильтр по типу (чаты vs каналы и группы)
    const matchesType = viewType === 'chats' 
      ? chat.type === 'chat' 
      : (chat.type === 'channel' || chat.type === 'group')
    
    return matchesSearch && matchesFolder && matchesType
  })

  /**
   * handleChatClick - обработчик клика на чат
   * 
   * Функциональность:
   * - Выбирает чат для отображения
   * - Открывает окно чата
   * - На мобильных устройствах закрывает меню списка чатов после выбора
   * 
   * @param chatId - ID чата для выбора
   */
  const handleChatClick = (chatId: string) => {
    setSelectedChatId(chatId)
    setSelectedSubChatId(null) // Сбрасываем выбранную подгруппу при переключении чата
    // Закрываем меню списка чатов на мобильных после выбора чата
    setMobileChatListOpen(false)
  }

  /**
   * handleChatSettingsClick - обработчик клика на настройки чата
   * 
   * Функциональность:
   * - Открывает модальное окно настроек чата
   * - Устанавливает ID чата для настроек
   * - Загружает текущие настройки чата (автоответы, заметка)
   * 
   * @param chatId - ID чата для настроек
   * @param e - событие клика (для предотвращения всплытия)
   */
  const handleChatSettingsClick = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation() // Предотвращаем всплытие события к элементу чата
    setSettingsChatId(chatId)
    
    // Загружаем текущие настройки чата
    const chat = chats.find(c => c.id === chatId)
    if (chat) {
      setAutoReplyEnabled(chat.autoReplyEnabled || false)
      setChatNote(chat.note || '')
      // Инициализируем поля редактирования
      setEditName(chat.name || '')
      setEditLastName(chat.lastName || '')
      setEditNickname(chat.nickname || '')
      setEditAbout(chat.about || '')
      setEditUsername(chat.username || '')
      setEditLink(chat.link || '')
      setEditPhone(chat.phone || '+375 29 104 9839') // TODO: Получать из API
      setEditingField(null)
    }
    
    setIsEditingContact(false)
    setChatSettingsOpen(true)
  }

  /**
   * handleCopyUsername - обработчик копирования username
   * 
   * Функциональность:
   * - Копирует username в буфер обмена с символом @
   * - Показывает визуальную обратную связь (иконка меняется на галочку на 2 секунды)
   * 
   * Поведение:
   * - Копирует username в формате @username
   * - После копирования иконка меняется на галочку на 2 секунды
   * 
   * @param username - username для копирования (без символа @)
   */
  const handleCopyUsername = useCallback(async (username: string) => {
    try {
      // Копируем username с символом @
      await navigator.clipboard.writeText(`@${username}`)
      setUsernameCopied(true)
      // Сбрасываем состояние через 2 секунды
      setTimeout(() => setUsernameCopied(false), 2000)
    } catch (err) {
      console.error('Ошибка копирования:', err)
    }
  }, [])

  /**
   * handleSaveNote - обработчик сохранения заметки
   * 
   * Функциональность:
   * - Сохраняет заметку для текущего чата
   * - Обновляет состояние чата
   * 
   * TODO: Реализовать сохранение через API
   */
  const handleSaveNote = useCallback(() => {
    if (!settingsChatId) return
    
    setChats(prevChats => {
      const updatedChats = [...prevChats]
      const chatIndex = updatedChats.findIndex(c => c.id === settingsChatId)
      if (chatIndex !== -1) {
        updatedChats[chatIndex] = {
          ...updatedChats[chatIndex],
          note: chatNote
        }
      }
      return updatedChats
    })
  }, [settingsChatId, chatNote])

  /**
   * handleToggleAutoReply - обработчик переключения автоматических ответов
   * 
   * Функциональность:
   * - Переключает состояние автоматических ответов
   * - Сохраняет настройку для текущего чата
   * 
   * TODO: Реализовать сохранение через API
   */
  const handleToggleAutoReply = useCallback((enabled: boolean) => {
    setAutoReplyEnabled(enabled)
    
    if (!settingsChatId) return
    
    setChats(prevChats => {
      const updatedChats = [...prevChats]
      const chatIndex = updatedChats.findIndex(c => c.id === settingsChatId)
      if (chatIndex !== -1) {
        updatedChats[chatIndex] = {
          ...updatedChats[chatIndex],
          autoReplyEnabled: enabled
        }
      }
      return updatedChats
    })
  }, [settingsChatId])

  /**
   * performDeleteContact - выполнение удаления контакта
   * 
   * Функциональность:
   * - Удаляет чат из списка
   * - Закрывает модальное окно
   * - Показывает уведомление об успешном удалении
   * 
   * TODO: Реализовать удаление через API
   */
  const performDeleteContact = useCallback(() => {
    if (!settingsChatId) return
    
    setChats(prevChats => prevChats.filter(c => c.id !== settingsChatId))
    setChatSettingsOpen(false)
    if (selectedChatId === settingsChatId) {
      setSelectedChatId(null)
    }
    toast.showSuccess('Контакт удален', 'Контакт успешно удален из списка')
  }, [settingsChatId, selectedChatId, toast])

  /**
   * handleDeleteContact - обработчик удаления контакта (показывает подтверждение)
   * 
   * Функциональность:
   * - Показывает модальное окно подтверждения удаления через toast
   * - При подтверждении вызывает performDeleteContact
   * 
   * Поведение:
   * - Вызывается при клике на кнопку удаления контакта
   * - Показывает toast с предупреждением и кнопками "Отмена" и "Удалить"
   * - При клике на "Удалить" вызывает performDeleteContact
   * 
   * Связи:
   * - toast.showWarning: показывает модальное окно подтверждения
   * - performDeleteContact: выполняет фактическое удаление
   */
  const handleDeleteContact = useCallback(() => {
    if (!settingsChatId) return
    
    toast.showWarning('Удалить контакт?', 'Вы уверены, что хотите удалить этот контакт?', {
      duration: 12000,
      actions: [
        { label: 'Отмена', onClick: () => {}, variant: 'soft', color: 'gray' },
        { label: 'Удалить', onClick: () => performDeleteContact(), variant: 'solid', color: 'red' },
      ],
    })
  }, [settingsChatId, performDeleteContact, toast])

  /**
   * performBlockContact - выполнение блокировки контакта
   * 
   * Функциональность:
   * - Блокирует контакт
   * - Закрывает модальное окно
   * - Показывает уведомление об успешной блокировке
   * 
   * TODO: Реализовать блокировку через API
   */
  const performBlockContact = useCallback(() => {
    if (!settingsChatId) return
    
    setChats(prevChats => prevChats.map(c => 
      c.id === settingsChatId ? { ...c, isBlocked: true } : c
    ))
    setChatSettingsOpen(false)
    toast.showSuccess('Контакт заблокирован', 'Контакт успешно заблокирован')
  }, [settingsChatId, toast])

  /**
   * performUnblockContact - выполнение разблокировки контакта
   * 
   * Функциональность:
   * - Разблокирует контакт
   * - Закрывает модальное окно
   * - Показывает уведомление об успешной разблокировке
   * 
   * TODO: Реализовать разблокировку через API
   */
  const performUnblockContact = useCallback(() => {
    if (!settingsChatId) return
    
    setChats(prevChats => prevChats.map(c => 
      c.id === settingsChatId ? { ...c, isBlocked: false } : c
    ))
    setChatSettingsOpen(false)
    toast.showSuccess('Контакт разблокирован', 'Контакт успешно разблокирован')
  }, [settingsChatId, toast])

  /**
   * handleBlockContact - обработчик блокировки контакта (показывает подтверждение)
   * 
   * Функциональность:
   * - Показывает модальное окно подтверждения блокировки через toast
   * - При подтверждении вызывает performBlockContact
   * 
   * Поведение:
   * - Вызывается при клике на кнопку блокировки контакта
   * - Показывает toast с предупреждением и кнопками "Отмена" и "Заблокировать"
   * - При клике на "Заблокировать" вызывает performBlockContact
   * 
   * Связи:
   * - toast.showWarning: показывает модальное окно подтверждения
   * - performBlockContact: выполняет фактическую блокировку
   */
  const handleBlockContact = useCallback(() => {
    if (!settingsChatId) return
    
    toast.showWarning('Заблокировать контакт?', 'Вы уверены, что хотите заблокировать этот контакт?', {
      duration: 12000,
      actions: [
        { label: 'Отмена', onClick: () => {}, variant: 'soft', color: 'gray' },
        { label: 'Заблокировать', onClick: () => performBlockContact(), variant: 'solid', color: 'red' },
      ],
    })
  }, [settingsChatId, performBlockContact, toast])

  /**
   * handleUnblockContact - обработчик разблокировки контакта (показывает подтверждение)
   */
  const handleUnblockContact = useCallback(() => {
    if (!settingsChatId) return
    
    toast.showWarning('Разблокировать контакт?', 'Вы уверены, что хотите разблокировать этот контакт?', {
      duration: 12000,
      actions: [
        { label: 'Отмена', onClick: () => {}, variant: 'soft', color: 'gray' },
        { label: 'Разблокировать', onClick: () => performUnblockContact(), variant: 'solid', color: 'green' },
      ],
    })
  }, [settingsChatId, performUnblockContact, toast])

  /**
   * handleSaveContact - обработчик сохранения изменений контакта
   * 
   * Функциональность:
   * - Сохраняет все изменения контакта в состояние chats
   * - Обновляет поля: name, lastName, nickname, about, username, link, phone
   * - Выходит из режима редактирования (isEditingContact = false)
   * 
   * Поведение:
   * - Вызывается при сохранении формы редактирования контакта
   * - Обновляет чат в массиве chats по settingsChatId
   * - Использует функциональное обновление состояния для корректной работы
   * 
   * Зависимости:
   * - settingsChatId: ID чата для сохранения
   * - editName, editLastName, editNickname, editAbout, editUsername, editLink, editPhone: значения полей
   * 
   * TODO: Реализовать сохранение через Telegram API
   */
  const handleSaveContact = useCallback(() => {
    if (!settingsChatId) return
    
    setChats(prevChats => prevChats.map(chat => {
      if (chat.id === settingsChatId) {
        return {
          ...chat,
          name: editName,
          lastName: editLastName,
          nickname: editNickname,
          about: editAbout,
          username: editUsername,
          link: editLink,
          phone: editPhone
        }
      }
      return chat
    }))
    
    setIsEditingContact(false)
  }, [settingsChatId, editName, editLastName, editNickname, editAbout, editUsername, editLink, editPhone])

  /**
   * handleSaveInlineField - обработчик сохранения отдельного поля контакта при инлайн редактировании
   * 
   * Функциональность:
   * - Сохраняет изменение одного поля контакта (name, lastName, phone, username)
   * - Обновляет только указанное поле, остальные остаются без изменений
   * - Выходит из режима редактирования поля (editingField = null)
   * 
   * Поведение:
   * - Вызывается при сохранении инлайн редактирования (Enter, blur)
   * - Обновляет чат в массиве chats по settingsChatId
   * - Обновляет только указанное поле, используя тернарный оператор для выбора значения
   * 
   * Параметры:
   * @param field - тип поля для сохранения: 'name' | 'lastName' | 'phone' | 'username'
   * 
   * Зависимости:
   * - settingsChatId: ID чата для сохранения
   * - editName, editLastName, editPhone, editUsername: значения полей из состояния
   * 
   * TODO: Реализовать сохранение через Telegram API
   */
  const handleSaveInlineField = useCallback((field: 'name' | 'lastName' | 'phone' | 'username') => {
    if (!settingsChatId) return
    
    setChats(prevChats => prevChats.map(chat => {
      if (chat.id === settingsChatId) {
        return {
          ...chat,
          name: field === 'name' ? editName : chat.name,
          lastName: field === 'lastName' ? editLastName : chat.lastName,
          phone: field === 'phone' ? editPhone : chat.phone,
          username: field === 'username' ? editUsername : chat.username
        }
      }
      return chat
    }))
    
    setEditingField(null)
  }, [settingsChatId, editName, editLastName, editPhone, editUsername])

  /**
   * getChatsCountInFolder - подсчет количества чатов в папке
   * 
   * @param folderId - ID папки (null для всех чатов)
   * @returns количество чатов в папке
   */
  const getChatsCountInFolder = useCallback((folderId: string | null): number => {
    if (folderId === 'all' || folderId === null) {
      return chats.length
    }
    return chats.filter(chat => chat.folderId === folderId).length
  }, [chats])

  /**
   * handleCreateFolder - обработчик создания новой папки для организации чатов
   * 
   * Функциональность:
   * - Создает новую папку с указанным названием
   * - Добавляет папку в массив folders
   * - Очищает поле ввода и закрывает форму создания
   * - Показывает уведомление об успешном создании
   * 
   * Поведение:
   * - Проверяет, что название папки не пустое (после trim)
   * - Генерирует уникальный ID для папки (Date.now().toString())
   * - Устанавливает иконку по умолчанию ('folder')
   * - Добавляет папку в конец массива folders
   * - Сбрасывает состояние создания папки
   * 
   * Валидация:
   * - Если название пустое после trim, функция не выполняет действий
   * 
   * Зависимости:
   * - newFolderName: название новой папки из состояния
   * - toast: для показа уведомления об успешном создании
   * 
   * TODO: Реализовать создание папки через Telegram API
   */
  const handleCreateFolder = useCallback(() => {
    if (!newFolderName.trim()) return
    
    const newFolder: Folder = {
      id: Date.now().toString(),
      name: newFolderName.trim(),
      icon: 'folder'
    }
    
    setFolders(prev => [...prev, newFolder])
    setNewFolderName('')
    setIsCreatingFolder(false)
    toast.showSuccess('Папка создана', `Папка "${newFolder.name}" успешно создана`)
  }, [newFolderName, toast])

  /**
   * handleDragEnd - обработчик окончания перетаскивания папки (drag-and-drop)
   * 
   * Функциональность:
   * - Обрабатывает окончание перетаскивания папки для изменения порядка
   * - Изменяет порядок папок в массиве folders
   * - Использует библиотеку @dnd-kit для определения новой позиции
   * 
   * Поведение:
   * - Вызывается при окончании перетаскивания (drop) папки
   * - Проверяет, что папка была перемещена (active.id !== over.id)
   * - Находит старый и новый индексы папки в массиве
   * - Использует arrayMove для перемещения папки на новую позицию
   * 
   * Параметры:
   * @param event - событие DragEndEvent из @dnd-kit/core
   *   - active: информация о перетаскиваемом элементе
   *   - over: информация о элементе, на который был drop
   * 
   * Технические детали:
   * - Использует arrayMove из @dnd-kit/sortable для безопасного перемещения
   * - Обновляет состояние folders функциональным способом
   * 
   * TODO: Реализовать сохранение порядка папок через Telegram API
   */
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    
    if (over && active.id !== over.id) {
      setFolders((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id)
        const newIndex = items.findIndex(item => item.id === over.id)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }, [])

  /**
   * handleStartEditFolder - начало редактирования названия папки
   * 
   * Функциональность:
   * - Инициализирует режим редактирования названия папки
   * - Устанавливает ID редактируемой папки и текущее название
   * - Переводит UI в режим редактирования (показывает TextField вместо Text)
   * 
   * Поведение:
   * - Вызывается при клике на кнопку редактирования (иконка карандаша)
   * - Устанавливает editingFolderId для определения, какая папка редактируется
   * - Устанавливает editingFolderName для предзаполнения поля ввода
   * 
   * Параметры:
   * @param folderId - ID папки для редактирования
   * @param currentName - текущее название папки для предзаполнения поля
   */
  const handleStartEditFolder = useCallback((folderId: string, currentName: string) => {
    setEditingFolderId(folderId)
    setEditingFolderName(currentName)
  }, [])

  /**
   * handleSaveEditFolder - сохранение измененного названия папки
   * 
   * Функциональность:
   * - Сохраняет новое название папки в массив folders
   * - Обновляет папку по editingFolderId
   * - Выходит из режима редактирования
   * - Показывает уведомление об успешном сохранении
   * 
   * Поведение:
   * - Вызывается при сохранении редактирования (Enter, blur)
   * - Проверяет, что editingFolderId установлен и название не пустое
   * - Обновляет название папки в массиве folders (trim для удаления пробелов)
   * - Сбрасывает состояние редактирования
   * 
   * Валидация:
   * - Если editingFolderId не установлен, функция не выполняет действий
   * - Если название пустое после trim, функция не выполняет действий
   * 
   * Зависимости:
   * - editingFolderId: ID редактируемой папки
   * - editingFolderName: новое название папки
   * - toast: для показа уведомления об успешном сохранении
   * 
   * TODO: Реализовать сохранение названия папки через Telegram API
   */
  const handleSaveEditFolder = useCallback(() => {
    if (!editingFolderId || !editingFolderName.trim()) return
    
    setFolders(prev => prev.map(folder => 
      folder.id === editingFolderId 
        ? { ...folder, name: editingFolderName.trim() }
        : folder
    ))
    setEditingFolderId(null)
    setEditingFolderName('')
    toast.showSuccess('Название изменено', 'Название папки успешно изменено')
  }, [editingFolderId, editingFolderName, toast])

  /**
   * handleCancelEditFolder - отмена редактирования названия папки
   * 
   * Функциональность:
   * - Отменяет редактирование названия папки
   * - Сбрасывает состояние редактирования без сохранения изменений
   * - Возвращает UI в режим отображения (показывает Text вместо TextField)
   * 
   * Поведение:
   * - Вызывается при отмене редактирования (Escape, клик вне поля)
   * - Сбрасывает editingFolderId и editingFolderName
   * - Не сохраняет изменения в массив folders
   */
  const handleCancelEditFolder = useCallback(() => {
    setEditingFolderId(null)
    setEditingFolderName('')
  }, [])

  /**
   * handleAccountImageUpload - обработчик инициации загрузки изображения профиля
   * 
   * Функциональность:
   * - Открывает диалог выбора файла для загрузки изображения профиля
   * - Программно вызывает клик на скрытом input элементе
   * 
   * Поведение:
   * - Вызывается при клике на кнопку с иконкой камеры в настройках аккаунта
   * - Использует ref (accountImageInputRef) для доступа к скрытому input элементу
   * - После выбора файла вызывается handleAccountImageChange
   * 
   * Технические детали:
   * - Input элемент имеет type="file" и accept="image/*"
   * - Элемент скрыт через style={{ display: 'none' }}
   */
  const handleAccountImageUpload = useCallback(() => {
    accountImageInputRef.current?.click()
  }, [])

  /**
   * handleAccountImageChange - обработчик выбора и обработки изображения профиля
   * 
   * Функциональность:
   * - Обрабатывает выбранный файл изображения для профиля
   * - Валидирует тип и размер файла
   * - Создает URL для предпросмотра через FileReader
   * - Добавляет изображение в массив accountImages
   * - Устанавливает изображение как главное, если это первое изображение
   * - Открывает карусель для просмотра загруженного изображения
   * 
   * Валидация:
   * - Проверяет, что файл является изображением (file.type.startsWith('image/'))
   * - Проверяет размер файла (максимум 5MB)
   * - При ошибке валидации показывает toast с сообщением об ошибке
   * 
   * Поведение:
   * - Вызывается при выборе файла в input элементе
   * - Использует FileReader для чтения файла как Data URL
   * - При успешной загрузке:
   *   1. Добавляет imageUrl в массив accountImages
   *   2. Устанавливает currentAccountImageIndex на новое изображение
   *   3. Если это первое изображение, делает его главным (mainAccountImageIndex)
   *   4. Открывает карусель изображений
   *   5. Показывает уведомление об успешной загрузке
   * - Сбрасывает значение input для возможности повторного выбора того же файла
   * 
   * Параметры:
   * @param e - событие изменения input файла
   * 
   * Зависимости:
   * - accountImages.length: для определения, первое ли это изображение
   * - toast: для показа уведомлений
   * 
   * TODO: Реализовать загрузку изображения на сервер через Telegram API
   */
  const handleAccountImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Проверяем тип файла (изображения)
    if (!file.type.startsWith('image/')) {
      toast.showError('Ошибка', 'Пожалуйста, выберите файл изображения')
      if (accountImageInputRef.current) {
        accountImageInputRef.current.value = ''
      }
      return
    }

    // Проверяем размер файла (максимум 5MB)
    const MAX_SIZE = 5 * 1024 * 1024 // 5MB
    if (file.size > MAX_SIZE) {
      toast.showError('Ошибка', 'Размер файла не должен превышать 5MB')
      if (accountImageInputRef.current) {
        accountImageInputRef.current.value = ''
      }
      return
    }

    // Создаем URL для предпросмотра
    const reader = new FileReader()
    reader.onloadend = () => {
      const imageUrl = reader.result as string
      setAccountImages(prev => {
        const newLength = prev.length + 1
        const newIndex = newLength - 1
        setCurrentAccountImageIndex(newIndex) // Устанавливаем на новое изображение
        if (prev.length === 0) {
          setMainAccountImageIndex(newIndex) // Если это первое изображение, делаем его главным
        }
        setAccountImageCarouselOpen(true) // Открываем карусель после загрузки
        return [...prev, imageUrl]
      })
      toast.showSuccess('Изображение загружено', 'Изображение профиля успешно загружено')
    }
    reader.readAsDataURL(file)

    // Сбрасываем значение input
    if (accountImageInputRef.current) {
      accountImageInputRef.current.value = ''
    }
  }, [accountImages.length, toast])

  /**
   * handleChatImageUpload - обработчик инициации загрузки изображения чата
   * 
   * Функциональность:
   * - Открывает диалог выбора файла для загрузки изображения чата
   * - Устанавливает ID чата для загрузки изображения
   * - Программно вызывает клик на скрытом input элементе
   * 
   * Поведение:
   * - Вызывается при клике на кнопку с иконкой камеры в настройках чата
   * - Устанавливает chatImageCarouselChatId для связи изображения с чатом
   * - Использует ref (chatImageInputRef) для доступа к скрытому input элементу
   * - После выбора файла вызывается handleChatImageChange
   * 
   * Параметры:
   * @param chatId - ID чата, для которого загружается изображение
   * 
   * Ограничения:
   * - Работает только для личных чатов (type === 'chat'), не для групп и каналов
   */
  const handleChatImageUpload = useCallback((chatId: string) => {
    setChatImageCarouselChatId(chatId)
    chatImageInputRef.current?.click()
  }, [])

  /**
   * handleChatImageChange - обработчик выбора и обработки изображения чата
   * 
   * Функциональность:
   * - Обрабатывает выбранный файл изображения для чата
   * - Валидирует тип и размер файла
   * - Создает URL для предпросмотра через FileReader
   * - Добавляет изображение в массив chatImages для указанного чата
   * - Открывает карусель для просмотра загруженного изображения
   * 
   * Валидация:
   * - Проверяет, что файл является изображением (file.type.startsWith('image/'))
   * - Проверяет размер файла (максимум 5MB)
   * - Проверяет, что chatImageCarouselChatId установлен
   * - При ошибке валидации показывает toast с сообщением об ошибке
   * 
   * Поведение:
   * - Вызывается при выборе файла в input элементе
   * - Использует FileReader для чтения файла как Data URL
   * - При успешной загрузке:
   *   1. Добавляет imageUrl в массив chatImages для чата (по chatImageCarouselChatId)
   *   2. Устанавливает currentChatImageIndex на новое изображение
   *   3. Открывает карусель изображений
   *   4. Показывает уведомление об успешной загрузке
   * - Сбрасывает значение input для возможности повторного выбора того же файла
   * 
   * Параметры:
   * @param e - событие изменения input файла
   * 
   * Зависимости:
   * - chatImageCarouselChatId: ID чата, для которого загружается изображение
   * - chatImages: текущий массив изображений чатов
   * - toast: для показа уведомлений
   * 
   * Ограничения:
   * - Работает только для личных чатов (type === 'chat'), не для групп и каналов
   * 
   * TODO: Реализовать загрузку изображения на сервер через Telegram API
   */
  const handleChatImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !chatImageCarouselChatId) return

    // Проверяем тип файла (изображения)
    if (!file.type.startsWith('image/')) {
      toast.showError('Ошибка', 'Пожалуйста, выберите файл изображения')
      if (chatImageInputRef.current) {
        chatImageInputRef.current.value = ''
      }
      return
    }

    // Проверяем размер файла (максимум 5MB)
    const MAX_SIZE = 5 * 1024 * 1024 // 5MB
    if (file.size > MAX_SIZE) {
      toast.showError('Ошибка', 'Размер файла не должен превышать 5MB')
      if (chatImageInputRef.current) {
        chatImageInputRef.current.value = ''
      }
      return
    }

    // Создаем URL для предпросмотра
    const reader = new FileReader()
    reader.onloadend = () => {
      const imageUrl = reader.result as string
      setChatImages(prev => {
        const currentImages = prev[chatImageCarouselChatId] || []
        return {
          ...prev,
          [chatImageCarouselChatId]: [...currentImages, imageUrl]
        }
      })
      // Открываем карусель после загрузки и устанавливаем индекс на новое изображение
      const newIndex = (chatImages[chatImageCarouselChatId]?.length || 0)
      setCurrentChatImageIndex(newIndex)
      setChatImageCarouselOpen(true)
      toast.showSuccess('Изображение загружено', 'Изображение чата успешно загружено')
    }
    reader.readAsDataURL(file)

    // Сбрасываем значение input
    if (chatImageInputRef.current) {
      chatImageInputRef.current.value = ''
    }
  }, [chatImageCarouselChatId, chatImages, toast])

  /**
   * handleSaveAccountField - обработчик сохранения отдельного поля аккаунта при инлайн редактировании
   * 
   * Функциональность:
   * - Сохраняет изменение одного поля аккаунта (name или username)
   * - Обновляет соответствующее состояние аккаунта
   * - Выходит из режима редактирования поля (editingAccountField = null)
   * - Показывает уведомление об успешном сохранении
   * 
   * Поведение:
   * - Вызывается при сохранении инлайн редактирования (Enter, blur)
   * - Для поля 'name': сохраняет editingAccountName в accountName (с trim)
   * - Для поля 'username': 
   *   1. Убирает символ @ если пользователь его ввел
   *   2. Применяет trim
   *   3. Добавляет символ @ в начало (гарантирует формат @username)
   *   4. Сохраняет в accountUsername
   * - Сбрасывает состояние редактирования (editingAccountField, editingAccountName, editingAccountUsername)
   * 
   * Параметры:
   * @param field - тип поля для сохранения: 'name' | 'username'
   * 
   * Зависимости:
   * - editingAccountName: значение поля имени из состояния
   * - editingAccountUsername: значение поля username из состояния
   * - toast: для показа уведомления об успешном сохранении
   * 
   * TODO: Реализовать сохранение через Telegram API
   */
  const handleSaveAccountField = useCallback((field: 'name' | 'username') => {
    if (field === 'name') {
      setAccountName(editingAccountName.trim())
    } else if (field === 'username') {
      // Убираем @ если пользователь его ввел
      const username = editingAccountUsername.trim().replace(/^@/, '')
      setAccountUsername('@' + username)
    }
    setEditingAccountField(null)
    setEditingAccountName('')
    setEditingAccountUsername('')
    toast.showSuccess('Изменения сохранены', 'Данные аккаунта успешно обновлены')
  }, [editingAccountName, editingAccountUsername, toast])

  /**
   * handleAddException - обработчик добавления чата в исключения уведомлений
   * 
   * Функциональность:
   * - Добавляет чат в список исключений уведомлений для текущего типа (private/groups/channels)
   * - Обновляет массив notificationExceptions
   * 
   * Поведение:
   * - Вызывается при клике на чат в модальном окне исключений (если чат не в исключениях)
   * - Проверяет, что exceptionsModalType установлен (определяет тип исключений)
   * - Добавляет chatId в соответствующий массив исключений
   * - Использует функциональное обновление состояния для корректной работы
   * 
   * Параметры:
   * @param chatId - ID чата для добавления в исключения
   * 
   * Зависимости:
   * - exceptionsModalType: тип исключений ('private' | 'groups' | 'channels')
   * 
   * Структура данных:
   * - notificationExceptions[exceptionsModalType] - массив ID чатов, исключенных из уведомлений
   * 
   * TODO: Реализовать сохранение исключений через Telegram API
   */
  const handleAddException = useCallback((chatId: string) => {
    if (!exceptionsModalType) return
    setNotificationExceptions(prev => ({
      ...prev,
      [exceptionsModalType]: [...prev[exceptionsModalType], chatId]
    }))
  }, [exceptionsModalType])

  /**
   * handleRemoveException - обработчик удаления чата из исключений уведомлений
   * 
   * Функциональность:
   * - Удаляет чат из списка исключений уведомлений для текущего типа (private/groups/channels)
   * - Обновляет массив notificationExceptions
   * 
   * Поведение:
   * - Вызывается при клике на кнопку "Убрать" в модальном окне исключений
   * - Проверяет, что exceptionsModalType установлен (определяет тип исключений)
   * - Удаляет chatId из соответствующего массива исключений (использует filter)
   * - Использует функциональное обновление состояния для корректной работы
   * 
   * Параметры:
   * @param chatId - ID чата для удаления из исключений
   * 
   * Зависимости:
   * - exceptionsModalType: тип исключений ('private' | 'groups' | 'channels')
   * 
   * Структура данных:
   * - notificationExceptions[exceptionsModalType] - массив ID чатов, исключенных из уведомлений
   * 
   * TODO: Реализовать сохранение исключений через Telegram API
   */
  const handleRemoveException = useCallback((chatId: string) => {
    if (!exceptionsModalType) return
    setNotificationExceptions(prev => ({
      ...prev,
      [exceptionsModalType]: prev[exceptionsModalType].filter(id => id !== chatId)
    }))
  }, [exceptionsModalType])

  /**
   * handleDeleteFolder - обработчик удаления папки
   */
  const handleDeleteFolder = useCallback((folderId: string) => {
    if (folderId === 'all') {
      toast.showError('Ошибка', 'Нельзя удалить папку "Все"')
      return
    }
    
    const folder = folders.find(f => f.id === folderId)
    if (!folder) return
    
    toast.showWarning('Удалить папку?', `Вы уверены, что хотите удалить папку "${folder.name}"?`, {
      duration: 12000,
      actions: [
        { label: 'Отмена', onClick: () => {}, variant: 'soft', color: 'gray' },
        { 
          label: 'Удалить', 
          onClick: () => {
            setFolders(prev => prev.filter(f => f.id !== folderId))
            // Перемещаем чаты из удаленной папки в папку "Все"
            setChats(prevChats => prevChats.map(chat => 
              chat.folderId === folderId ? { ...chat, folderId: undefined } : chat
            ))
            // Если удаленная папка была выбрана, сбрасываем выбор
            if (selectedFolderId === folderId) {
              setSelectedFolderId(null)
            }
            toast.showSuccess('Папка удалена', `Папка "${folder.name}" успешно удалена`)
          }, 
          variant: 'solid', 
          color: 'red' 
        },
      ],
    })
  }, [folders, selectedFolderId, toast])

  /**
   * formatFileSize - форматирование размера файла
   * 
   * Функциональность:
   * - Преобразует размер файла в байтах в читаемый формат (B, KB, MB)
   * 
   * @param bytes - размер файла в байтах
   * @returns отформатированная строка размера
   */
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  /**
   * handleFileAttach - обработчик клика на кнопку прикрепления файла
   * 
   * Функциональность:
   * - Открывает диалог выбора файла
   * 
   * Поведение:
   * - Программно вызывает клик на скрытом input элементе
   */
  const handleFileAttach = () => {
    fileInputRef.current?.click()
  }

  /**
   * handleFileChange - обработчик выбора файла
   * 
   * Функциональность:
   * - Добавляет выбранные файлы в массив прикрепленных файлов
   * - Ограничивает количество файлов (максимум 5)
   * 
   * @param e - событие изменения input файла
   */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      const newFiles = files.slice(0, 5 - attachedFiles.length).map(file => ({
        id: Date.now().toString() + Math.random().toString(),
        file
      }))
      setAttachedFiles(prev => [...prev, ...newFiles])
    }
    // Сбрасываем значение input, чтобы можно было выбрать тот же файл снова
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  /**
   * handleRemoveFile - обработчик удаления прикрепленного файла
   * 
   * Функциональность:
   * - Удаляет файл из массива прикрепленных файлов
   * 
   * @param fileId - ID файла для удаления
   */
  const handleRemoveFile = (fileId: string) => {
    setAttachedFiles(prev => prev.filter(f => f.id !== fileId))
  }

  /**
   * scrollToBottom - прокрутка контейнера сообщений вниз
   * 
   * Функциональность:
   * - Прокручивает контейнер сообщений до самого низа
   * - Устанавливает флаг isAtBottom в true
   * 
   * Поведение:
   * - Вызывается при клике на кнопку "К последнему сообщению"
   * - Используется для автоматической прокрутки при новых сообщениях
   * 
   * Связи:
   * - messagesScrollRef: ссылка на DOM элемент контейнера сообщений
   * - isAtBottom: обновляет флаг после прокрутки
   */
  const scrollToBottom = useCallback(() => {
    const el = messagesScrollRef.current
    if (el) {
      el.scrollTop = el.scrollHeight // Прокручиваем до самого низа
      setIsAtBottom(true) // Устанавливаем флаг, что мы внизу
    }
  }, [])

  /**
   * handleMessagesScroll - обработчик скролла контейнера сообщений
   * 
   * Функциональность:
   * - Определяет, находится ли пользователь внизу списка сообщений
   * - Обновляет флаг isAtBottom
   * 
   * Логика определения:
   * - Вычисляет расстояние от низа контейнера до текущей позиции скролла
   * - Если расстояние меньше threshold (80px) - считаем, что пользователь внизу
   * - Иначе - пользователь прокрутил вверх
   * 
   * Поведение:
   * - Вызывается при каждом скролле контейнера сообщений
   * - Используется для показа/скрытия кнопки "К последнему сообщению"
   * 
   * @param threshold - пороговое расстояние в пикселях (80px)
   */
  const handleMessagesScroll = useCallback(() => {
    const el = messagesScrollRef.current
    if (!el) return
    const threshold = 80 // Пороговое расстояние от низа контейнера
    // Вычисляем, находимся ли мы внизу (с учетом порога)
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < threshold
    setIsAtBottom(atBottom)
  }, [])

  /**
   * useEffect - автоматическая прокрутка к последнему сообщению
   * 
   * Функциональность:
   * - Прокручивает контейнер сообщений вниз при изменении сообщений или чата
   * - Использует requestAnimationFrame для надежной прокрутки после рендера
   * 
   * Поведение:
   * - Выполняется при изменении сообщений выбранного чата
   * - Выполняется при изменении selectedChatId (переключение чата)
   * - При переключении чата всегда прокручивает вниз
   * - При новых сообщениях прокручивает только если пользователь был внизу
   * - Прокручивает дважды: сразу и через requestAnimationFrame (для надежности)
   * - Устанавливает флаг isAtBottom в true
   * 
   * Причина двойной прокрутки:
   * - Первая прокрутка выполняется сразу
   * - Вторая через requestAnimationFrame гарантирует прокрутку после полного рендера DOM
   */
  const previousChatIdRef = useRef<string | null>(null)
  useEffect(() => {
    if (!selectedChatId) return
    const el = messagesScrollRef.current
    if (!el) return
    
    // Если переключили чат, всегда прокручиваем вниз
    const chatChanged = previousChatIdRef.current !== selectedChatId
    if (chatChanged) {
      previousChatIdRef.current = selectedChatId
      setIsAtBottom(true)
      el.scrollTop = el.scrollHeight // Первая прокрутка
      // Вторая прокрутка через requestAnimationFrame для надежности
      requestAnimationFrame(() => { 
        if (el) {
          el.scrollTop = el.scrollHeight
        }
      })
      return
    }
    
    // Если новые сообщения и пользователь был внизу, прокручиваем
    if (isAtBottom) {
      el.scrollTop = el.scrollHeight // Первая прокрутка
      // Вторая прокрутка через requestAnimationFrame для надежности
      requestAnimationFrame(() => { 
        if (el) {
          el.scrollTop = el.scrollHeight
        }
      })
    }
  }, [selectedChat?.messages, selectedChatId, isAtBottom])

  /**
   * showScrollToBottom - флаг отображения кнопки прокрутки вниз
   * 
   * Логика:
   * - Показывать кнопку только если пользователь не внизу (isAtBottom === false)
   * - И только если есть сообщения (selectedChat?.messages?.length > 0)
   * 
   * Поведение:
   * - Используется для условного рендеринга кнопки "К последнему сообщению"
   * - Кнопка появляется при прокрутке вверх и исчезает при прокрутке вниз
   */
  const showScrollToBottom = !isAtBottom && (selectedChat?.messages?.length || 0) > 0

  /**
   * handleSendMessage - обработчик отправки сообщения в выбранный чат
   * 
   * Функциональность:
   * - Создает новое сообщение с текущим текстом и временем
   * - Добавляет сообщение в массив сообщений выбранного чата
   * - Обновляет превью и дату последнего сообщения в чате
   * - Очищает поле ввода и массив прикрепленных файлов
   * - Сбрасывает счетчик непрочитанных сообщений
   * 
   * Валидация:
   * - Проверяет, что есть текст сообщения ИЛИ прикрепленные файлы
   * - Проверяет, что выбран чат (selectedChat не null)
   * - Если условия не выполнены, функция не выполняет действий
   * 
   * Поведение:
   * - Вызывается при клике на кнопку отправки или нажатии Enter
   * - Создает объект TelegramMessage:
   *   - id: генерируется из текущего времени (Date.now().toString())
   *   - text: текст сообщения или сообщение о прикрепленных файлах
   *   - timestamp: текущее время в формате HH:MM
   *   - sender: 'user' (сообщение от пользователя)
   *   - file: информация о первом прикрепленном файле (если есть)
   * - Обновляет чат в массиве chats:
   *   - Добавляет новое сообщение в массив messages
   *   - Обновляет preview (текст сообщения или имя файла)
   *   - Обновляет date (время последнего сообщения)
   *   - Сбрасывает unreadCount в 0
   * - Очищает состояние: message = '', attachedFiles = []
   * 
   * Обработка файлов:
   * - Если есть прикрепленные файлы, сохраняется информация о первом файле
   * - В preview показывается имя первого файла с иконкой 📎
   * - Если файлов нет, показывается текст сообщения
   * 
   * TODO: Реализовать отправку через Telegram API
   * TODO: Реализовать отправку всех прикрепленных файлов (не только первого)
   * TODO: Добавить обработку ошибок отправки
   * TODO: Реализовать оптимистичное обновление UI с откатом при ошибке
   */
  const handleSendMessage = () => {
    if ((!message.trim() && attachedFiles.length === 0) || !selectedChat) return

    const newMessage: TelegramMessage = {
      id: Date.now().toString(),
      text: message || (attachedFiles.length > 0 ? `Прикреплено файлов: ${attachedFiles.length}` : ''),
      timestamp: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
      sender: 'user',
      file: attachedFiles.length > 0 ? {
        name: attachedFiles[0].file.name,
        type: attachedFiles[0].file.type,
        size: attachedFiles[0].file.size
      } : undefined
    }

    // Обновляем чат с новым сообщением через setState
    setChats(prevChats => {
      const updatedChats = [...prevChats]
      const chatIndex = updatedChats.findIndex(c => c.id === selectedChat.id)
      if (chatIndex !== -1) {
        updatedChats[chatIndex] = {
          ...updatedChats[chatIndex],
          messages: [...(updatedChats[chatIndex].messages || []), newMessage],
          preview: message || (attachedFiles.length > 0 ? `📎 ${attachedFiles[0].file.name}` : ''),
          date: newMessage.timestamp,
          unreadCount: 0 // Сбрасываем счетчик непрочитанных после отправки
        }
      }
      return updatedChats
    })

    setMessage('')
    setAttachedFiles([])
    // TODO: Отправить сообщение через Telegram API
  }

  return (
    <AppLayout pageTitle="Telegram — Чаты">
      {/* Субменю вверху страницы (фиксированное, всегда доступно, статичное как header)
          - Кнопка меню для мобильных (фиксированная, не скроллится)
          - Папки: список папок (8 штук)
          - Сепаратор
          - Настройки аккаунта: открывает настройки Telegram аккаунта
          - Настройки автоматизаций: настройка автоматизаций для чатов */}
      <Box className={styles.submenuContainer}>
        {/* Кнопка меню для мобильных устройств (фиксированная, не скроллится) */}
        <Button
          variant="soft"
          onClick={() => setMobileChatListOpen(!mobileChatListOpen)}
          size="2"
          className={styles.mobileMenuButton}
        >
          <HamburgerMenuIcon width={16} height={16} />
        </Button>
        {/* Скроллируемая область с папками и настройками */}
        <Flex gap="2" align="center" className={styles.submenu}>
          {/* Список папок (9 штук, включая "Все") */}
          {MOCK_FOLDERS.map((folder) => (
            <Button
              key={folder.id}
              variant={selectedFolderId === folder.id ? 'solid' : 'soft'}
              onClick={() => {
                setSelectedFolderId(selectedFolderId === folder.id ? null : folder.id)
                setActiveSubmenu(null) // Сбрасываем активное субменю при выборе папки
              }}
              onDoubleClick={() => {
                // Двойной клик открывает настройки папок
                if (folder.id === 'all') {
                  setFoldersSettingsOpen(true)
                }
              }}
              size="2"
              style={{ flexShrink: 0 }} // Предотвращаем сжатие кнопок
            >
              <BoxIcon width={16} height={16} />
              <Text size="2">{folder.name}</Text>
            </Button>
          ))}

          {/* Сепаратор между папками и настройками */}
          <Separator 
            orientation="vertical" 
            style={{ height: '24px', margin: '0 4px', flexShrink: 0 }} 
          />

          {/* Настройки аккаунта */}
          <Button
            variant={activeSubmenu === 'account' ? 'solid' : 'soft'}
            onClick={() => {
              setAccountSettingsOpen(true)
              setAccountSettingsView('main')
              setActiveSubmenu(activeSubmenu === 'account' ? null : 'account')
              setSelectedFolderId(null) // Сбрасываем выбранную папку
            }}
            size="2"
            style={{ flexShrink: 0 }} // Предотвращаем сжатие кнопок
          >
            <PersonIcon width={16} height={16} />
            <Text size="2">Настройки аккаунта</Text>
          </Button>

          {/* Настройки автоматизаций */}
          <Button
            variant={activeSubmenu === 'automation' ? 'solid' : 'soft'}
            onClick={() => {
              setActiveSubmenu(activeSubmenu === 'automation' ? null : 'automation')
              setSelectedFolderId(null) // Сбрасываем выбранную папку
            }}
            size="2"
            style={{ flexShrink: 0 }} // Предотвращаем сжатие кнопок
          >
            <MixerHorizontalIcon width={16} height={16} />
            <Text size="2">Настройки автоматизаций</Text>
          </Button>
        </Flex>
      </Box>


      {/* Основной контент: список чатов и окно чата (скроллится) */}
      <Box className={styles.container}>
        <Flex gap="4" className={styles.chatsLayout}>
          {/* Левая колонка: список чатов (скрывается на мобильных, открывается через кнопку меню) */}
          {/* Overlay для закрытия меню на мобильных при клике вне его */}
          {mobileChatListOpen && (
            <Box 
              className={styles.mobileOverlay}
              onClick={() => setMobileChatListOpen(false)}
            />
          )}
          <Box 
            className={`${styles.card} ${styles.chatListCard} ${mobileChatListOpen ? styles.chatListCardOpen : ''}`}
            style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}
          >
            {/* Заголовок страницы чатов с переключателем типа отображения */}
            <Flex justify="between" align="center" mb="4" style={{ flexShrink: 0 }}>
              <Text size="4" weight="bold">
                Чаты
              </Text>
              {/* Переключатель: Чаты / Каналы и группы */}
              <SegmentedControl.Root 
                value={viewType} 
                onValueChange={(value) => setViewType(value as 'chats' | 'channels')}
                size="1"
              >
                <SegmentedControl.Item value="chats">
                  <Text size="1">Чаты</Text>
                </SegmentedControl.Item>
                <SegmentedControl.Item value="channels">
                  <Text size="1">Каналы и группы</Text>
                </SegmentedControl.Item>
              </SegmentedControl.Root>
            </Flex>

            {/* Поле поиска по чатам
                - placeholder: подсказка для пользователя
                - Иконка поиска для визуального обозначения
                - Фильтрует чаты по названию в реальном времени */}
            <Box mb="4" style={{ flexShrink: 0 }}>
              <TextField.Root 
                placeholder="Поиск по чатам" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: 36 }}
              >
                <TextField.Slot>
                  <MagnifyingGlassIcon width={16} height={16} style={{ color: 'var(--gray-10)' }} />
                </TextField.Slot>
              </TextField.Root>
            </Box>

            {/* Список чатов
                - Каждый чат отображается как элемент списка
                - chatAvatar: аватар чата (символ)
                - chatName: название чата
                - chatPreview: превью последнего сообщения
                - date: дата/время последнего сообщения
                - Кнопка настроек для каждого чата
                - При клике на чат открывается окно чата */}
            <Box className={styles.chatList}>
              {filteredChats.map((ch) => (
                <Box 
                  key={ch.id} 
                  className={`${styles.chatItem} ${selectedChatId === ch.id ? styles.chatItemSelected : ''}`}
                  onClick={() => handleChatClick(ch.id)}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Аватар чата: отображает первую букву названия */}
                  <Box className={styles.chatAvatar} style={{ position: 'relative' }}>
                    {ch.avatar}
                    {/* Иконка замочка для заблокированных контактов */}
                    {ch.isBlocked && (
                      <Box
                        style={{
                          position: 'absolute',
                          bottom: 0,
                          right: 0,
                          width: '18px',
                          height: '18px',
                          backgroundColor: 'var(--gray-1)',
                          border: '2px solid var(--gray-2)',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <LockClosedIcon width={10} height={10} color="var(--gray-11)" />
                      </Box>
                    )}
                  </Box>
                  {/* Тело чата: название, превью и дата */}
                  <Box className={styles.chatBody} style={{ flex: 1 }}>
                    <Flex justify="between" align="center" gap="2">
                      {/* Название чата */}
                      <Text size="2" weight="medium" className={styles.chatName}>
                        {ch.name}
                      </Text>
                      {/* Дата последнего сообщения */}
                      <Text size="1" color="gray">
                        {ch.date}
                      </Text>
                    </Flex>
                    {/* Превью последнего сообщения */}
                    <Flex justify="between" align="center" gap="2">
                      <Text size="1" className={styles.chatPreview}>
                        {ch.preview}
                      </Text>
                      {/* Счетчик непрочитанных сообщений */}
                      {ch.unreadCount && ch.unreadCount > 0 && (
                        <Badge size="1" color="red" style={{ flexShrink: 0 }}>
                          {ch.unreadCount}
                        </Badge>
                      )}
                    </Flex>
                  </Box>
                  {/* Кнопка настроек чата
                      - Открывает модальное окно настроек
                      - stopPropagation предотвращает выбор чата при клике */}
                  <Button
                    size="1"
                    variant="ghost"
                    onClick={(e) => handleChatSettingsClick(ch.id, e)}
                    style={{ flexShrink: 0 }}
                  >
                    <DotsHorizontalIcon width={16} height={16} />
                  </Button>
                </Box>
              ))}
            </Box>
          </Box>

          {/* Правая колонка: окно чата (отображается при выборе чата) */}
          {selectedChat && (
            <Box className={`${styles.card} ${styles.chatWindowCard}`}>
              {/* Заголовок чата */}
              <Flex direction="column" gap="2" mb="4">
                <Flex 
                  align="center" 
                  justify="between" 
                  pb="3" 
                  style={{ 
                    borderBottom: '1px solid var(--gray-6)',
                    cursor: 'pointer'
                  }}
                  onClick={(e) => handleChatSettingsClick(selectedChat.id, e)}
                >
                  <Flex align="center" gap="3">
                    <Box className={styles.chatAvatar} style={{ width: 40, height: 40, fontSize: 18 }}>
                      {selectedChat.avatar}
                    </Box>
                    <Flex direction="column">
                      <Text size="4" weight="bold">{selectedChat.name}</Text>
                      <Text size="1" color="gray">Telegram чат</Text>
                    </Flex>
                  </Flex>
                  <Button
                    size="2"
                    variant="soft"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleChatSettingsClick(selectedChat.id, e)
                    }}
                  >
                    <GearIcon width={16} height={16} />
                  </Button>
                </Flex>

                {/* Скролл-меню подгрупп для групп */}
                {selectedChat.type === 'group' && selectedChat.subChats && selectedChat.subChats.length > 0 && (
                  <Box style={{ 
                    overflowX: 'auto', 
                    overflowY: 'hidden',
                    paddingBottom: '8px',
                    marginBottom: '8px',
                    borderBottom: '1px solid var(--gray-6)'
                  }}>
                    <Flex gap="2" align="center" style={{ minWidth: 'max-content' }}>
                      <Button
                        variant={selectedSubChatId === null ? 'solid' : 'soft'}
                        size="2"
                        onClick={() => setSelectedSubChatId(null)}
                        style={{ flexShrink: 0 }}
                      >
                        <Text size="2">Единый чат</Text>
                      </Button>
                      {selectedChat.subChats.map((subChat) => (
                        <Button
                          key={subChat.id}
                          variant={selectedSubChatId === subChat.id ? 'solid' : 'soft'}
                          size="2"
                          onClick={() => setSelectedSubChatId(subChat.id)}
                          style={{ flexShrink: 0 }}
                        >
                          <Text size="2">{subChat.name}</Text>
                        </Button>
                      ))}
                    </Flex>
                  </Box>
                )}
              </Flex>

              {/* Контейнер сообщений (скроллится, занимает доступное пространство) */}
              <Box style={{ 
                flex: 1, 
                position: 'relative',
                marginBottom: '16px',
                minHeight: 0
              }}>
                {/* Контейнер сообщений с прокруткой */}
                <Box
                  ref={messagesScrollRef}
                  onScroll={handleMessagesScroll}
                  style={{ 
                    height: '100%',
                    overflowY: 'auto', 
                    padding: '16px', 
                    backgroundColor: 'var(--gray-2)', 
                    borderRadius: '8px',
                  }}
                >
                <Flex direction="column" gap="3">
                  {(() => {
                    // Фильтруем сообщения по выбранной подгруппе
                    let filteredMessages = selectedChat.messages || []
                    if (selectedChat.type === 'group' && selectedSubChatId !== null) {
                      // Показываем только сообщения выбранной подгруппы
                      filteredMessages = filteredMessages.filter(msg => msg.subChatId === selectedSubChatId)
                    } else if (selectedChat.type === 'group' && selectedSubChatId === null) {
                      // Показываем все сообщения в "Единый чат"
                      filteredMessages = filteredMessages
                    }
                    
                    return filteredMessages.map((msg) => (
                      <Flex
                        key={msg.id}
                        justify={msg.sender === 'user' ? 'end' : 'start'}
                        style={{ width: '100%' }}
                      >
                        <Box
                          style={{
                            maxWidth: '70%',
                            padding: '12px 16px',
                            borderRadius: '12px',
                            backgroundColor: msg.sender === 'user' ? 'var(--accent-9)' : 'var(--gray-4)',
                            color: msg.sender === 'user' ? '#ffffff' : 'var(--gray-12)',
                          }}
                        >
                          {/* Показываем автора только для сообщений от других пользователей в группах */}
                          {selectedChat.type === 'group' && msg.sender === 'telegram' && msg.senderName && (
                            <Text size="1" weight="bold" style={{ display: 'block', marginBottom: '4px', opacity: 0.8 }}>
                              {msg.senderName}
                            </Text>
                          )}
                          {/* Для обычных чатов показываем автора как раньше */}
                          {selectedChat.type !== 'group' && msg.sender === 'telegram' && msg.senderName && (
                            <Text size="1" weight="bold" style={{ display: 'block', marginBottom: '4px', opacity: 0.8 }}>
                              {msg.senderName}
                            </Text>
                          )}
                        {/* Отображение прикрепленного файла (если есть) */}
                        {msg.file && (
                          <Flex align="center" gap="2" mb="2" style={{ 
                            padding: '8px 12px', 
                            backgroundColor: 'rgba(0, 0, 0, 0.1)', 
                            borderRadius: '6px',
                            fontSize: '12px'
                          }}>
                            <Text size="1">📎</Text>
                            <Text size="1" style={{ flex: 1 }}>{msg.file.name}</Text>
                            <Text size="1" style={{ opacity: 0.7 }}>
                              {formatFileSize(msg.file.size)}
                            </Text>
                          </Flex>
                        )}
                        {/* Форматированный текст для всех сообщений (без заголовков для Telegram, со ссылками) */}
                        {msg.text && (
                          <Box style={{ fontSize: '14px', lineHeight: '1.5' }}>
                            <FormattedText content={msg.text} disableHeadings={msg.sender === 'telegram'} />
                          </Box>
                        )}
                        <Text size="1" style={{ display: 'block', marginTop: '4px', opacity: 0.7 }}>
                          {msg.timestamp}
                        </Text>
                      </Box>
                    </Flex>
                    ))
                  })()}
                </Flex>
                </Box>
                {/* Кнопка прокрутки вниз: показывается при прокрутке вверх */}
                {showScrollToBottom && (
                  <Button
                    size="2"
                    variant="soft"
                    color="gray"
                    onClick={scrollToBottom}
                    title="К последнему сообщению"
                    radius="full"
                    style={{
                      position: 'absolute',
                      bottom: '16px',
                      right: '16px',
                      zIndex: 10,
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
                    }}
                  >
                    <ChevronDownIcon width={18} height={18} />
                  </Button>
                )}
              </Box>

              {/* Поле ввода сообщения (оформлено как в workflow чате) */}
              <Flex direction="column" style={{ 
                padding: '4px',
                borderTop: '1px solid var(--gray-6)',
                background: 'var(--gray-2)',
                borderRadius: '0 0 12px 12px',
                gap: '8px'
              }}>
                {/* Контейнер для прикрепленных файлов */}
                {attachedFiles.length > 0 && (
                  <Box style={{
                    padding: '8px',
                    background: 'var(--gray-3)',
                    borderRadius: '8px',
                    border: '1px solid var(--gray-6)'
                  }}>
                    <Flex gap="2" style={{ flexWrap: 'wrap' }}>
                      {attachedFiles.map((attachedFile) => (
                        <Box key={attachedFile.id} style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '4px 8px',
                          background: 'var(--gray-4)',
                          border: '1px solid var(--gray-6)',
                          borderRadius: '6px',
                          flexShrink: 0,
                          maxWidth: '200px'
                        }}>
                          <Text size="1" style={{ 
                            fontSize: '11px',
                            color: 'var(--gray-12)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            flex: 1,
                            minWidth: 0
                          }} title={attachedFile.file.name}>
                            {attachedFile.file.name.length > 20 
                              ? attachedFile.file.name.substring(0, 20) + '...' 
                              : attachedFile.file.name}
                          </Text>
                          <Text size="1" style={{ 
                            fontSize: '10px',
                            color: 'var(--gray-11)',
                            fontStyle: 'italic',
                            whiteSpace: 'nowrap',
                            flexShrink: 0
                          }}>
                            {formatFileSize(attachedFile.file.size)}
                          </Text>
                          <Button
                            size="1"
                            variant="ghost"
                            onClick={() => handleRemoveFile(attachedFile.id)}
                            style={{
                              padding: 0,
                              minWidth: '16px',
                              width: '16px',
                              height: '16px',
                              borderRadius: '50%',
                              fontSize: '14px',
                              lineHeight: 1,
                              flexShrink: 0
                            }}
                          >
                            ×
                          </Button>
                        </Box>
                      ))}
                    </Flex>
                  </Box>
                )}
                {/* Поле ввода с кнопками */}
                <Flex gap="2" align="start">
                  {/* Скрытый input для выбора файлов */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    multiple
                    style={{ display: 'none' }}
                  />
                  {/* Кнопка прикрепления файла */}
                  <Button
                    onClick={handleFileAttach}
                    style={{ 
                      backgroundColor: 'var(--gray-4)', 
                      color: 'var(--gray-12)',
                      borderRadius: '50%',
                      width: '40px',
                      height: '40px',
                      padding: 0,
                      minWidth: '40px',
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Box style={{ fontSize: '16px', lineHeight: 1 }}>📎</Box>
                  </Button>
                  {/* Поле ввода сообщения с визуальным форматированием */}
                  <Box style={{ position: 'relative', flex: 1 }}>
                    <RichTextInput
                      value={message}
                      onChange={setMessage}
                      onKeyDown={(e) => {
                        // Обработка Enter для отправки сообщения (без Shift)
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          const currentMessage = message
                          setMessage(currentMessage)
                          // Отправляем сообщение через небольшой таймаут
                          setTimeout(() => {
                            if ((currentMessage.trim() || attachedFiles.length > 0) && selectedChat) {
                              const newMessage: TelegramMessage = {
                                id: Date.now().toString(),
                                text: currentMessage || (attachedFiles.length > 0 ? `Прикреплено файлов: ${attachedFiles.length}` : ''),
                                timestamp: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
                                sender: 'user',
                                file: attachedFiles.length > 0 ? {
                                  name: attachedFiles[0].file.name,
                                  type: attachedFiles[0].file.type,
                                  size: attachedFiles[0].file.size
                                } : undefined
                              }

                              setChats(prevChats => {
                                const updatedChats = [...prevChats]
                                const chatIndex = updatedChats.findIndex(c => c.id === selectedChat.id)
                                if (chatIndex !== -1) {
                                  updatedChats[chatIndex] = {
                                    ...updatedChats[chatIndex],
                                    messages: [...(updatedChats[chatIndex].messages || []), newMessage],
                                    preview: currentMessage || (attachedFiles.length > 0 ? `📎 ${attachedFiles[0].file.name}` : ''),
                                    date: newMessage.timestamp,
                                    unreadCount: 0
                                  }
                                }
                                return updatedChats
                              })
                              setMessage('')
                              setAttachedFiles([])
                            }
                          }, 0)
                        }
                        // Shift+Enter создает новую строку (стандартное поведение)
                      }}
                      placeholder="Введите сообщение..."
                      style={{ 
                        flex: 1,
                        resize: 'none'
                      }}
                      rows={1}
                    />
                  </Box>
                  {/* Кнопка отправки */}
                  <Button
                    onClick={handleSendMessage}
                    disabled={!message.trim() && attachedFiles.length === 0}
                    style={{ 
                      backgroundColor: (message.trim() || attachedFiles.length > 0) ? 'var(--accent-9)' : 'var(--gray-4)', 
                      color: (message.trim() || attachedFiles.length > 0) ? '#ffffff' : 'var(--gray-11)',
                      borderRadius: '50%',
                      width: '40px',
                      height: '40px',
                      padding: 0,
                      minWidth: '40px',
                      flexShrink: 0,
                      alignSelf: 'flex-start'
                    }}
                  >
                    <PaperPlaneIcon width={16} height={16} />
                  </Button>
                </Flex>
              </Flex>
            </Box>
          )}

          {/* Сообщение при отсутствии выбранного чата */}
          {!selectedChat && (
            <Box className={`${styles.card} ${styles.chatWindowCard} ${styles.emptyChatCard}`}>
              <Flex direction="column" align="center" gap="3">
                <Text size="4" weight="medium" color="gray">
                  Выберите чат для просмотра сообщений
                </Text>
                <Text size="2" color="gray">
                  Нажмите на чат в списке слева, чтобы открыть переписку
                </Text>
              </Flex>
            </Box>
          )}
        </Flex>
      </Box>

      {/* Модальное окно настроек чата */}
      <Dialog.Root 
        open={chatSettingsOpen} 
        onOpenChange={(open) => {
          setChatSettingsOpen(open)
          if (!open) {
            setIsEditingNote(false)
            setIsEditingContact(false)
          }
        }}
      >
        <Dialog.Content style={{ maxWidth: '420px', maxHeight: '90vh', overflowY: 'auto' }}>
          {(() => {
            const chat = chats.find(c => c.id === settingsChatId)
            if (!chat) return null

            return (
              <>
                {/* Кнопка закрытия */}
                <Flex align="center" justify="end" mb="4">
                  <Dialog.Close>
                    <Button variant="ghost" size="2" style={{ padding: '4px' }}>
                      <Cross2Icon width={16} height={16} />
                    </Button>
                  </Dialog.Close>
                </Flex>

                {/* Фото профиля */}
                <Flex direction="column" align="center" gap="2" mb="4">
                  <Box style={{ position: 'relative' }}>
                    <Avatar
                      size="6"
                      src={
                        chat.type === 'chat' && chatImages[chat.id] && chatImages[chat.id].length > 0
                          ? chatImages[chat.id][0] // Показываем первое изображение в аватаре
                          : undefined
                      }
                      fallback={chat.avatar}
                      style={{ 
                        width: '80px', 
                        height: '80px', 
                        fontSize: '32px',
                        cursor: chat.type === 'chat' && chatImages[chat.id] && chatImages[chat.id].length > 0 ? 'pointer' : 'default'
                      }}
                      onClick={() => {
                        if (chat.type === 'chat' && chatImages[chat.id] && chatImages[chat.id].length > 0) {
                          setChatImageCarouselChatId(chat.id)
                          setCurrentChatImageIndex(0)
                          setChatImageCarouselOpen(true)
                        }
                      }}
                    />
                    {chat.type === 'chat' && (
                      <Button
                        size="1"
                        variant="solid"
                        onClick={() => handleChatImageUpload(chat.id)}
                        style={{
                          position: 'absolute',
                          bottom: 0,
                          right: 0,
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          padding: 0,
                          backgroundColor: 'var(--accent-9)'
                        }}
                      >
                        <CameraIcon width={14} height={14} />
                      </Button>
                    )}
                  </Box>
                  <input
                    ref={chatImageInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleChatImageChange}
                    style={{ display: 'none' }}
                  />
                  <Text size="4" weight="bold">
                    {chat.name}
                  </Text>
                  {chat.status && (
                    <Text size="2" color="gray">
                      {chat.status}
                    </Text>
                  )}
                </Flex>

                {/* Кнопки действий: Чат, Звук, Звонок, Ещё */}
                <Flex gap="2" justify="center" mb="5">
                  <Button variant="soft" size="2" style={{ flex: 1 }}>
                    <ChatBubbleIcon width={16} height={16} style={{ marginRight: '6px' }} />
                    Чат
                  </Button>
                  <Button variant="soft" size="2" style={{ flex: 1 }}>
                    <BellIcon width={16} height={16} style={{ marginRight: '6px' }} />
                    Звук
                  </Button>
                  <Button variant="soft" size="2" style={{ flex: 1 }}>
                    <DotsHorizontalIcon width={16} height={16} style={{ marginRight: '6px' }} />
                    Ещё
                  </Button>
                </Flex>

                {/* Заголовок "Информация" */}
                <Flex align="center" gap="3" mb="4" style={{ alignItems: 'center' }}>
                  <Text size="4" weight="bold">Информация</Text>
                </Flex>

                {/* Информация о контакте или форма редактирования */}
                {isEditingContact ? (
                  <Flex direction="column" gap="4" mb="5">
                    {/* Имя */}
                    <Box>
                      <Text size="2" weight="medium" mb="1" as="div" color="gray">
                        Имя
                      </Text>
                      <TextField.Root
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="Введите имя"
                      />
                    </Box>

                    {/* Никнейм */}
                    <Box>
                      <Text size="2" weight="medium" mb="1" as="div" color="gray">
                        Никнейм
                      </Text>
                      <TextField.Root
                        value={editNickname}
                        onChange={(e) => setEditNickname(e.target.value)}
                        placeholder="Введите никнейм"
                      />
                    </Box>

                    {/* О себе */}
                    <Box>
                      <Text size="2" weight="medium" mb="1" as="div" color="gray">
                        О себе
                      </Text>
                      <TextArea
                        value={editAbout}
                        onChange={(e) => setEditAbout(e.target.value)}
                        placeholder="Введите информацию о себе"
                        rows={3}
                      />
                    </Box>

                    {/* Username */}
                    <Box>
                      <Text size="2" weight="medium" mb="1" as="div" color="gray">
                        Имя пользователя
                      </Text>
                      <TextField.Root
                        value={editUsername}
                        onChange={(e) => setEditUsername(e.target.value)}
                        placeholder="Введите username (без @)"
                      />
                    </Box>

                    {/* Ссылка */}
                    <Box>
                      <Text size="2" weight="medium" mb="1" as="div" color="gray">
                        Ссылка
                      </Text>
                      <TextField.Root
                        value={editLink}
                        onChange={(e) => setEditLink(e.target.value)}
                        placeholder="Введите ссылку"
                      />
                    </Box>

                    {/* Кнопки сохранения/отмены */}
                    <Flex gap="2" mt="2">
                      <Button
                        variant="solid"
                        size="2"
                        onClick={handleSaveContact}
                        style={{ flex: 1 }}
                      >
                        Сохранить
                      </Button>
                      <Button
                        variant="soft"
                        size="2"
                        onClick={() => {
                          setIsEditingContact(false)
                          // Восстанавливаем исходные значения
                          const chat = chats.find(c => c.id === settingsChatId)
                          if (chat) {
                            setEditName(chat.name || '')
                            setEditNickname(chat.nickname || '')
                            setEditAbout(chat.about || '')
                            setEditUsername(chat.username || '')
                            setEditLink(chat.link || '')
                          }
                        }}
                        style={{ flex: 1 }}
                      >
                        Отмена
                      </Button>
                    </Flex>
                  </Flex>
                ) : (
                  <Flex direction="column" gap="3" mb="5">
                    {/* Имя (редактируемое инлайн) */}
                    <Flex align="center" justify="between" style={{ padding: '12px 0', borderBottom: '1px solid var(--gray-6)' }}>
                      <Flex align="center" gap="3">
                        <PersonIcon width={20} height={20} color="var(--gray-10)" />
                        <Text size="3">Имя</Text>
                      </Flex>
                      {editingField === 'name' ? (
                        <Flex align="center" gap="2">
                          <TextField.Root
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            size="2"
                            style={{ width: '150px' }}
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleSaveInlineField('name')
                              }
                              if (e.key === 'Escape') {
                                const chat = chats.find(c => c.id === settingsChatId)
                                if (chat) setEditName(chat.name || '')
                                setEditingField(null)
                              }
                            }}
                            onBlur={() => handleSaveInlineField('name')}
                          />
                        </Flex>
                      ) : (
                        <Text 
                          size="3" 
                          style={{ color: 'var(--accent-9)', cursor: 'pointer' }}
                          onClick={() => {
                            setEditName(chat.name || '')
                            setEditingField('name')
                          }}
                        >
                          {chat.name || 'Не указано'}
                        </Text>
                      )}
                    </Flex>

                    {/* Фамилия (редактируемое инлайн) */}
                    <Flex align="center" justify="between" style={{ padding: '12px 0', borderBottom: '1px solid var(--gray-6)' }}>
                      <Flex align="center" gap="3">
                        <PersonIcon width={20} height={20} color="var(--gray-10)" />
                        <Text size="3">Фамилия</Text>
                      </Flex>
                      {editingField === 'lastName' ? (
                        <Flex align="center" gap="2">
                          <TextField.Root
                            value={editLastName}
                            onChange={(e) => setEditLastName(e.target.value)}
                            size="2"
                            style={{ width: '150px' }}
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleSaveInlineField('lastName')
                              }
                              if (e.key === 'Escape') {
                                const chat = chats.find(c => c.id === settingsChatId)
                                if (chat) setEditLastName(chat.lastName || '')
                                setEditingField(null)
                              }
                            }}
                            onBlur={() => handleSaveInlineField('lastName')}
                          />
                        </Flex>
                      ) : (
                        <Text 
                          size="3" 
                          style={{ color: 'var(--accent-9)', cursor: 'pointer' }}
                          onClick={() => {
                            setEditLastName(chat.lastName || '')
                            setEditingField('lastName')
                          }}
                        >
                          {chat.lastName || 'Не указано'}
                        </Text>
                      )}
                    </Flex>

                    {/* Номер телефона (редактируемое инлайн) */}
                    <Flex align="center" justify="between" style={{ padding: '12px 0', borderBottom: '1px solid var(--gray-6)' }}>
                      <Flex align="center" gap="3">
                        <EnvelopeClosedIcon width={20} height={20} color="var(--gray-10)" />
                        <Text size="3">Номер телефона</Text>
                      </Flex>
                      {editingField === 'phone' ? (
                        <Flex align="center" gap="2">
                          <TextField.Root
                            value={editPhone}
                            onChange={(e) => setEditPhone(e.target.value)}
                            size="2"
                            style={{ width: '150px' }}
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleSaveInlineField('phone')
                              }
                              if (e.key === 'Escape') {
                                const chat = chats.find(c => c.id === settingsChatId)
                                if (chat) setEditPhone(chat.phone || '')
                                setEditingField(null)
                              }
                            }}
                            onBlur={() => handleSaveInlineField('phone')}
                          />
                        </Flex>
                      ) : (
                        <Text 
                          size="3" 
                          style={{ color: 'var(--accent-9)', cursor: 'pointer' }}
                          onClick={() => {
                            setEditPhone(chat.phone || '')
                            setEditingField('phone')
                          }}
                        >
                          {chat.phone || 'Не указано'}
                        </Text>
                      )}
                    </Flex>

                    {/* Имя пользователя (редактируемое инлайн) */}
                    <Flex align="center" justify="between" style={{ padding: '12px 0', borderBottom: '1px solid var(--gray-6)' }}>
                      <Flex align="center" gap="3">
                        <Text size="3" weight="bold" style={{ color: 'var(--gray-10)' }}>@</Text>
                        <Text size="3">Имя пользователя</Text>
                      </Flex>
                      {editingField === 'username' ? (
                        <Flex align="center" gap="2">
                          <TextField.Root
                            value={editUsername}
                            onChange={(e) => setEditUsername(e.target.value)}
                            size="2"
                            style={{ width: '150px' }}
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleSaveInlineField('username')
                              }
                              if (e.key === 'Escape') {
                                const chat = chats.find(c => c.id === settingsChatId)
                                if (chat) setEditUsername(chat.username || '')
                                setEditingField(null)
                              }
                            }}
                            onBlur={() => handleSaveInlineField('username')}
                          />
                        </Flex>
                      ) : (
                        <Flex align="center" gap="2">
                          <Text 
                            size="3" 
                            style={{ color: 'var(--accent-9)', cursor: 'pointer' }}
                            onClick={() => {
                              setEditUsername(chat.username || '')
                              setEditingField('username')
                            }}
                          >
                            {chat.username ? `@${chat.username}` : 'Не указано'}
                          </Text>
                          {chat.username && (
                            <Button
                              variant="ghost"
                              size="1"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleCopyUsername(chat.username!)
                              }}
                              style={{ padding: '4px', minWidth: 'auto' }}
                            >
                              {usernameCopied ? (
                                <CheckIcon width={14} height={14} style={{ color: 'var(--green-9)' }} />
                              ) : (
                                <CopyIcon width={14} height={14} />
                              )}
                            </Button>
                          )}
                        </Flex>
                      )}
                    </Flex>
                  </Flex>
                )}

                {/* Заметка */}
                <Box>
                  <Flex align="center" justify="between" mb="1">
                    <Text size="2" weight="medium" as="div" color="gray">
                      Заметка
                    </Text>
                    <Flex align="center" gap="2">
                      <Text size="1" color="gray" as="div">
                        видна только Вам
                      </Text>
                      {!isEditingNote && (
                        <Button
                          variant="ghost"
                          size="1"
                          onClick={() => setIsEditingNote(true)}
                          style={{ padding: '2px 6px', minWidth: 'auto' }}
                        >
                          <Pencil1Icon width={12} height={12} />
                        </Button>
                      )}
                    </Flex>
                  </Flex>
                  <TextArea
                    value={chatNote}
                    onChange={(e) => setChatNote(e.target.value)}
                    onBlur={() => {
                      handleSaveNote()
                      setIsEditingNote(false)
                    }}
                    readOnly={!isEditingNote}
                    placeholder="Добавьте заметку..."
                    rows={3}
                    style={{ resize: 'vertical' }}
                  />
                </Box>

                {/* Заголовок "Настройки" */}
                <Flex align="center" justify="between" mb="4" mt="4" style={{ alignItems: 'center' }}>
                  <Text size="4" weight="bold">Настройки</Text>
                </Flex>

                {/* Тогглер автоматических ответов */}
                <Box>
                  <Flex align="center" justify="between">
                    <Box>
                      <Text size="2" weight="medium" as="div" mb="1">
                        Автоматические ответы
                      </Text>
                      <Text size="1" color="gray" as="div">
                        Включить автоматические ответы для этого чата
                      </Text>
                    </Box>
                    <Switch
                      checked={autoReplyEnabled}
                      onCheckedChange={handleToggleAutoReply}
                    />
                  </Flex>
                </Box>

                <Separator mb="4" />

                {/* Действия: Изменить контакт, Удалить контакт, Заблокировать */}
                <Flex direction="column" gap="1" align="center" style={{ marginTop: '16px' }}>
                  <Button
                    variant="ghost"
                    size="2"
                    onClick={() => setIsEditingContact(true)}
                    style={{ width: '100%', justifyContent: 'center', marginTop: '3px', marginBottom: '3px' }}
                  >
                    <Pencil1Icon width={16} height={16} style={{ marginRight: '8px' }} />
                    Изменить контакт
                  </Button>
                  <Button
                    variant="ghost"
                    size="2"
                    onClick={handleDeleteContact}
                    style={{ width: '100%', justifyContent: 'center', color: 'var(--red-9)', marginTop: '3px', marginBottom: '3px' }}
                  >
                    <TrashIcon width={16} height={16} style={{ marginRight: '8px' }} />
                    Удалить контакт
                  </Button>
                  {chat.isBlocked ? (
                    <Button
                      variant="solid"
                      size="2"
                      onClick={handleUnblockContact}
                      style={{ 
                        width: '100%', 
                        justifyContent: 'center', 
                        backgroundColor: 'var(--green-9)',
                        color: 'white',
                        marginTop: '3px',
                        marginBottom: '3px'
                      }}
                    >
                      <LockClosedIcon width={16} height={16} style={{ marginRight: '8px' }} />
                      Разблокировать
                    </Button>
                  ) : (
                    <Button
                      variant="solid"
                      size="2"
                      onClick={handleBlockContact}
                      style={{ 
                        width: '100%', 
                        justifyContent: 'center', 
                        backgroundColor: 'var(--red-9)',
                        color: 'white',
                        marginTop: '3px',
                        marginBottom: '3px'
                      }}
                    >
                      <HandIcon width={16} height={16} style={{ marginRight: '8px' }} />
                      Заблокировать
                    </Button>
                  )}
                </Flex>
              </>
            )
          })()}
        </Dialog.Content>
      </Dialog.Root>

      {/* Модальное окно настроек аккаунта */}
      <Dialog.Root 
        open={accountSettingsOpen} 
        onOpenChange={(open) => {
          setAccountSettingsOpen(open)
          if (!open) {
            setAccountSettingsView('main')
          }
        }}
      >
        <Dialog.Content style={{ maxWidth: '420px', maxHeight: '90vh', overflowY: 'auto' }}>
          {accountSettingsView === 'main' && (
            <>
              {/* Заголовок с кнопками */}
              <Flex align="center" justify="between" mb="4" style={{ alignItems: 'center' }}>
                <Dialog.Title style={{ margin: 0, lineHeight: '1' }}>
                  <Text size="5" weight="bold">Настройки</Text>
                </Dialog.Title>
                <Flex gap="2" align="center">
                  <Button variant="ghost" size="2" style={{ padding: '4px' }}>
                    <DotsHorizontalIcon width={16} height={16} />
                  </Button>
                  <Dialog.Close>
                    <Button variant="ghost" size="2" style={{ padding: '4px' }}>
                      <Cross2Icon width={16} height={16} />
                    </Button>
                  </Dialog.Close>
                </Flex>
              </Flex>

              {/* Профиль пользователя */}
              <Flex direction="column" align="center" gap="2" mb="4" pb="4" style={{ borderBottom: '1px solid var(--gray-6)' }}>
                <Box style={{ position: 'relative' }}>
                  <Avatar
                    size="6"
                    src={undefined}
                    fallback={accountName.charAt(0)}
                    style={{ width: '80px', height: '80px', fontSize: '32px' }}
                  />
                  <Button
                    size="1"
                    variant="solid"
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      padding: 0,
                      backgroundColor: 'var(--accent-9)'
                    }}
                  >
                    <CameraIcon width={14} height={14} />
                  </Button>
                </Box>
                <Text size="4" weight="bold">{accountName}</Text>
                <Text size="2" color="gray">{accountPhone}</Text>
                <Text size="2" color="gray">{accountUsername}</Text>
              </Flex>

              {/* Список разделов */}
              <Flex direction="column" gap="0">
                {/* Мой аккаунт */}
                <Button
                  variant="ghost"
                  size="3"
                  onClick={() => setAccountSettingsView('myAccount')}
                  style={{
                    justifyContent: 'flex-start',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    marginBottom: '4px'
                  }}
                >
                  <PersonIcon width={20} height={20} style={{ marginRight: '12px' }} />
                  <Text size="3">Мой аккаунт</Text>
                </Button>

                {/* Уведомления и звуки */}
                <Button
                  variant="ghost"
                  size="3"
                  onClick={() => setAccountSettingsView('notifications')}
                  style={{
                    justifyContent: 'flex-start',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    marginBottom: '4px'
                  }}
                >
                  <BellIcon width={20} height={20} style={{ marginRight: '12px' }} />
                  <Text size="3">Уведомления и звуки</Text>
                </Button>

                {/* Настройки папок */}
                <Button
                  variant="ghost"
                  size="3"
                  onClick={() => {
                    setFoldersSettingsOpen(true)
                    setAccountSettingsOpen(false) // Закрываем модальное окно настроек аккаунта
                  }}
                  style={{
                    justifyContent: 'flex-start',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    marginBottom: '4px'
                  }}
                >
                  <BoxIcon width={20} height={20} style={{ marginRight: '12px' }} />
                  <Text size="3">Настройки папок</Text>
                </Button>
              </Flex>
            </>
          )}

          {accountSettingsView === 'myAccount' && (
            <>
              {/* Заголовок с кнопкой назад */}
              <Flex align="center" gap="3" mb="4" style={{ alignItems: 'center' }}>
                <Button
                  variant="ghost"
                  size="2"
                  onClick={() => setAccountSettingsView('main')}
                  style={{ padding: '4px' }}
                >
                  <ArrowLeftIcon width={16} height={16} />
                </Button>
                <Dialog.Title style={{ margin: 0, lineHeight: '1' }}>
                  <Text size="5" weight="bold">Информация</Text>
                </Dialog.Title>
                <Box style={{ flex: 1 }} />
                <Dialog.Close>
                  <Button variant="ghost" size="2" style={{ padding: '4px' }}>
                    <Cross2Icon width={16} height={16} />
                  </Button>
                </Dialog.Close>
              </Flex>

              {/* Аватар с кнопкой редактирования */}
              <Flex direction="column" align="center" gap="2" mb="4">
                <Box style={{ position: 'relative' }}>
                  <Box
                    onClick={() => {
                      if (accountImages.length > 0) {
                        setCurrentAccountImageIndex(currentAccountImageIndex >= 0 && currentAccountImageIndex < accountImages.length ? currentAccountImageIndex : 0)
                        setAccountImageCarouselOpen(true)
                      }
                    }}
                    style={{
                      cursor: accountImages.length > 0 ? 'pointer' : 'default',
                      display: 'inline-block'
                    }}
                  >
                    <Avatar
                      size="6"
                      src={accountImages.length > 0 ? accountImages[mainAccountImageIndex] : undefined}
                      fallback={accountName.charAt(0)}
                      style={{ 
                        width: '100px', 
                        height: '100px', 
                        fontSize: '40px'
                      }}
                    />
                  </Box>
                  <Button
                    size="2"
                    variant="solid"
                    onClick={handleAccountImageUpload}
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      padding: 0,
                      backgroundColor: 'var(--accent-9)'
                    }}
                  >
                    <CameraIcon width={14} height={14} />
                  </Button>
                </Box>
                <input
                  ref={accountImageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAccountImageChange}
                  style={{ display: 'none' }}
                />
                <Text size="5" weight="bold">{accountName}</Text>
                <Text size="2" color="gray">{accountStatus}</Text>
              </Flex>

              {/* Био */}
              <Box mb="4">
                <Text size="2" weight="medium" mb="2" as="div">
                  О себе
                </Text>
                <TextArea
                  value={accountBio}
                  onChange={(e) => setAccountBio(e.target.value)}
                  placeholder="Любые подробности, например: возраст, род занятий или город.&#10;Пример: 23 года, дизайнер из Санкт-Петербурга."
                  rows={4}
                  style={{ resize: 'none' }}
                />
              </Box>

              {/* Контактная информация */}
              <Flex direction="column" gap="3">
                {/* Имя (редактируемое инлайн) */}
                <Flex align="center" justify="between" style={{ padding: '12px 0', borderBottom: '1px solid var(--gray-6)' }}>
                  <Flex align="center" gap="3">
                    <PersonIcon width={20} height={20} color="var(--gray-10)" />
                    <Text size="3">Имя</Text>
                  </Flex>
                  {editingAccountField === 'name' ? (
                    <Flex align="center" gap="2">
                      <TextField.Root
                        value={editingAccountName}
                        onChange={(e) => setEditingAccountName(e.target.value)}
                        size="2"
                        style={{ width: '150px' }}
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleSaveAccountField('name')
                          }
                          if (e.key === 'Escape') {
                            setEditingAccountName(accountName)
                            setEditingAccountField(null)
                          }
                        }}
                        onBlur={() => handleSaveAccountField('name')}
                      />
                    </Flex>
                  ) : (
                    <Text 
                      size="3" 
                      style={{ color: 'var(--accent-9)', cursor: 'pointer' }}
                      onClick={() => {
                        setEditingAccountName(accountName)
                        setEditingAccountField('name')
                      }}
                    >
                      {accountName}
                    </Text>
                  )}
                </Flex>

                {/* Номер телефона */}
                <Flex align="center" justify="between" style={{ padding: '12px 0', borderBottom: '1px solid var(--gray-6)' }}>
                  <Flex align="center" gap="3">
                    <EnvelopeClosedIcon width={20} height={20} color="var(--gray-10)" />
                    <Text size="3">Номер телефона</Text>
                  </Flex>
                  <Text size="3" style={{ color: 'var(--accent-9)' }}>{accountPhone}</Text>
                </Flex>

                {/* Имя пользователя (редактируемое инлайн) */}
                <Flex align="center" justify="between" style={{ padding: '12px 0', borderBottom: '1px solid var(--gray-6)' }}>
                  <Flex align="center" gap="3">
                    <Text size="3" weight="bold" style={{ color: 'var(--gray-10)' }}>@</Text>
                    <Text size="3">Имя пользователя</Text>
                  </Flex>
                  {editingAccountField === 'username' ? (
                    <Flex align="center" gap="2">
                      <Text size="2" style={{ color: 'var(--gray-10)' }}>@</Text>
                      <TextField.Root
                        value={editingAccountUsername}
                        onChange={(e) => setEditingAccountUsername(e.target.value)}
                        size="2"
                        style={{ width: '150px' }}
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleSaveAccountField('username')
                          }
                          if (e.key === 'Escape') {
                            setEditingAccountUsername(accountUsername.replace(/^@/, ''))
                            setEditingAccountField(null)
                          }
                        }}
                        onBlur={() => handleSaveAccountField('username')}
                      />
                    </Flex>
                  ) : (
                    <Text 
                      size="3" 
                      style={{ color: 'var(--accent-9)', cursor: 'pointer' }}
                      onClick={() => {
                        setEditingAccountUsername(accountUsername.replace(/^@/, ''))
                        setEditingAccountField('username')
                      }}
                    >
                      {accountUsername}
                    </Text>
                  )}
                </Flex>
              </Flex>

              {/* Подсказка */}
              <Box mt="4" p="3" style={{ backgroundColor: 'var(--gray-3)', borderRadius: '8px' }}>
                <Text size="1" color="gray">
                  С помощью имени пользователя другие люди смогут связаться с Вами в Telegram, не зная Вашего телефона.
                </Text>
              </Box>
            </>
          )}

          {accountSettingsView === 'notifications' && (
            <>
              {/* Заголовок */}
              <Flex align="center" gap="3" mb="4" style={{ alignItems: 'center' }}>
                <Dialog.Title style={{ margin: 0, lineHeight: '1' }}>
                  <Text size="5" weight="bold">Уведомления и звуки</Text>
                </Dialog.Title>
                <Box style={{ flex: 1 }} />
                <Dialog.Close>
                  <Button variant="ghost" size="2" style={{ padding: '4px' }}>
                    <Cross2Icon width={16} height={16} />
                  </Button>
                </Dialog.Close>
              </Flex>

              {/* Показывать уведомления */}
              <Box mb="5">
                <Text size="3" weight="medium" mb="3" style={{ color: 'var(--accent-9)' }} as="div">
                  Показывать уведомления
                </Text>
                <Flex align="center" justify="between" mb="2">
                  <Text size="3">Включить уведомления</Text>
                  <Switch
                    checked={notificationsAllAccounts}
                    onCheckedChange={setNotificationsAllAccounts}
                  />
                </Flex>
              </Box>

              {/* Настройки звука */}
              <Box mb="5">
                <Text size="3" weight="medium" mb="3" style={{ color: 'var(--accent-9)' }} as="div">
                  Настройки звука
                </Text>
                <Flex direction="column" gap="3">
                  <Flex align="center" justify="between">
                    <Flex align="center" gap="3">
                      <SpeakerLoudIcon width={20} height={20} color="var(--gray-10)" />
                      <Text size="3">Включить звуки</Text>
                    </Flex>
                    <Switch
                      checked={notificationsSound}
                      onCheckedChange={setNotificationsSound}
                    />
                  </Flex>
                </Flex>
              </Box>

              {/* Уведомления из чатов */}
              <Box>
                <Text size="3" weight="medium" mb="3" style={{ color: 'var(--accent-9)' }} as="div">
                  Уведомления из чатов
                </Text>
                <Flex direction="column" gap="3">
                  <Flex 
                    align="center" 
                    justify="between"
                    style={{ cursor: 'pointer' }}
                    onClick={(e) => {
                      // Открываем модальное окно исключений при клике на элемент (не на тогглер)
                      if ((e.target as HTMLElement).closest('[role="switch"]')) {
                        return // Если клик на тогглер, не открываем модальное окно
                      }
                      setExceptionsModalType('private')
                      setExceptionsModalOpen(true)
                    }}
                  >
                    <Flex direction="column" gap="1" style={{ flex: 1 }}>
                      <Flex align="center" gap="3">
                        <PersonIcon width={20} height={20} color="var(--gray-10)" />
                        <Text size="3">Личные чаты</Text>
                      </Flex>
                      <Text size="1" color="gray" style={{ marginLeft: '32px' }}>
                        Нажмите для изменения
                      </Text>
                    </Flex>
                    <Switch
                      checked={notificationsPrivateChats}
                      onCheckedChange={setNotificationsPrivateChats}
                      onClick={(e) => e.stopPropagation()} // Предотвращаем открытие модального окна при клике на тогглер
                    />
                  </Flex>
                  <Flex 
                    align="center" 
                    justify="between"
                    style={{ cursor: 'pointer' }}
                    onClick={(e) => {
                      if ((e.target as HTMLElement).closest('[role="switch"]')) {
                        return
                      }
                      setExceptionsModalType('groups')
                      setExceptionsModalOpen(true)
                    }}
                  >
                    <Flex direction="column" gap="1" style={{ flex: 1 }}>
                      <Flex align="center" gap="3">
                        <BoxIcon width={20} height={20} color="var(--gray-10)" />
                        <Text size="3">Группы</Text>
                      </Flex>
                      <Text size="1" color="gray" style={{ marginLeft: '32px' }}>
                        {notificationExceptions.groups.length > 0 
                          ? `Включены, ${notificationExceptions.groups.length} ${notificationExceptions.groups.length === 1 ? 'исключение' : notificationExceptions.groups.length < 5 ? 'исключения' : 'исключений'}`
                          : 'Включены'}
                      </Text>
                    </Flex>
                    <Switch
                      checked={notificationsGroups}
                      onCheckedChange={setNotificationsGroups}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </Flex>
                  <Flex 
                    align="center" 
                    justify="between"
                    style={{ cursor: 'pointer' }}
                    onClick={(e) => {
                      if ((e.target as HTMLElement).closest('[role="switch"]')) {
                        return
                      }
                      setExceptionsModalType('channels')
                      setExceptionsModalOpen(true)
                    }}
                  >
                    <Flex direction="column" gap="1" style={{ flex: 1 }}>
                      <Flex align="center" gap="3">
                        <SpeakerLoudIcon width={20} height={20} color="var(--gray-10)" />
                        <Text size="3">Каналы</Text>
                      </Flex>
                      <Text size="1" color="gray" style={{ marginLeft: '32px' }}>
                        {notificationExceptions.channels.length > 0 
                          ? `Включены, ${notificationExceptions.channels.length} ${notificationExceptions.channels.length === 1 ? 'исключение' : notificationExceptions.channels.length < 5 ? 'исключения' : 'исключений'}`
                          : 'Включены'}
                      </Text>
                    </Flex>
                    <Switch
                      checked={notificationsChannels}
                      onCheckedChange={setNotificationsChannels}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </Flex>
                </Flex>
              </Box>
            </>
          )}
        </Dialog.Content>
      </Dialog.Root>

      {/* Модальное окно управления папками */}
      <Dialog.Root 
        open={foldersSettingsOpen} 
        onOpenChange={(open) => {
          setFoldersSettingsOpen(open)
          if (!open) {
            setIsCreatingFolder(false)
            setNewFolderName('')
            setEditingFolderId(null)
            setEditingFolderName('')
          }
        }}
      >
        <Dialog.Content style={{ maxWidth: '420px', maxHeight: '90vh', overflowY: 'auto' }}>
          {/* Заголовок с кнопкой назад и закрытия */}
          <Flex align="center" gap="3" mb="4" style={{ alignItems: 'center' }}>
            <Dialog.Title style={{ margin: 0, lineHeight: '1', flex: 1 }}>
              <Text size="5" weight="bold">Папки</Text>
            </Dialog.Title>
            <Dialog.Close>
              <Button variant="ghost" size="2" style={{ padding: '4px' }}>
                <Cross2Icon width={16} height={16} />
              </Button>
            </Dialog.Close>
          </Flex>

          {/* Раздел "Мои папки" */}
          <Box mb="4">
            <Flex align="center" gap="2" mb="3">
              <Text size="3" weight="bold" as="div">
                Мои папки
              </Text>
              <Box
                style={{
                  position: 'relative',
                  display: 'inline-flex',
                  alignItems: 'center',
                  cursor: 'help'
                }}
                title="Содержимое папок можно определить только в приложении Telegram"
              >
                <InfoCircledIcon width={16} height={16} color="var(--gray-10)" />
              </Box>
            </Flex>
            
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={folders.map(f => f.id)}
                strategy={verticalListSortingStrategy}
              >
                <Flex direction="column" gap="2">
                  {folders.map((folder) => {
                    const chatsCount = getChatsCountInFolder(folder.id === 'all' ? null : folder.id)
                    const isEditing = editingFolderId === folder.id
                    const isDraggable = folder.id !== 'all'
                    
                    // Выбор иконки для папки
                    const getFolderIcon = () => {
                      if (folder.id === 'all') return <BoxIcon width={20} height={20} />
                      switch (folder.icon) {
                        case 'briefcase':
                          return <BoxIcon width={20} height={20} />
                        case 'person':
                          return <PersonIcon width={20} height={20} />
                        case 'star':
                          return <StarIcon width={20} height={20} />
                        case 'archive':
                          return <ArchiveIcon width={20} height={20} />
                        case 'users':
                          return <PersonIcon width={20} height={20} />
                        case 'project':
                          return <BoxIcon width={20} height={20} />
                        case 'urgent':
                          return <BoxIcon width={20} height={20} />
                        default:
                          return <BoxIcon width={20} height={20} />
                      }
                    }

                    // Компонент для сортируемой папки
                    const SortableFolderItem = () => {
                      const {
                        attributes,
                        listeners,
                        setNodeRef,
                        transform,
                        transition,
                        isDragging,
                      } = useSortable({
                        id: folder.id,
                        disabled: !isDraggable,
                      })

                      const style = {
                        transform: CSS.Transform.toString(transform),
                        transition,
                        opacity: isDragging ? 0.5 : 1,
                      }

                      return (
                        <Flex 
                          ref={setNodeRef}
                          align="center" 
                          justify="between" 
                          style={{ 
                            padding: '12px 16px',
                            borderRadius: '8px',
                            backgroundColor: 'var(--gray-2)',
                            border: '1px solid var(--gray-6)',
                            width: '100%',
                            ...style
                          }}
                        >
                          <Flex align="center" gap="3" style={{ flex: 1 }}>
                            {/* Drag handle */}
                            {isDraggable && (
                              <Box
                                {...attributes}
                                {...listeners}
                                style={{
                                  cursor: isDragging ? 'grabbing' : 'grab',
                                  color: 'var(--gray-9)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  padding: '4px',
                                  borderRadius: '4px',
                                }}
                                title="Перетащите для изменения порядка"
                              >
                                <DragHandleDots2Icon width={16} height={16} />
                              </Box>
                            )}
                            
                            <Box style={{ color: 'var(--gray-11)' }}>
                              {getFolderIcon()}
                            </Box>
                            
                            {isEditing ? (
                              <TextField.Root
                                value={editingFolderName}
                                onChange={(e) => setEditingFolderName(e.target.value)}
                                size="2"
                                style={{ flex: 1 }}
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    handleSaveEditFolder()
                                  }
                                  if (e.key === 'Escape') {
                                    handleCancelEditFolder()
                                  }
                                }}
                                onBlur={handleSaveEditFolder}
                              />
                            ) : (
                              <Flex direction="column" gap="1" style={{ flex: 1 }}>
                                <Text size="3" weight="medium">
                                  {folder.name}
                                </Text>
                                <Text size="1" color="gray">
                                  {chatsCount} {chatsCount === 1 ? 'чат' : chatsCount < 5 ? 'чата' : 'чатов'}
                                </Text>
                              </Flex>
                            )}
                          </Flex>
                          
                          {!isEditing && folder.id !== 'all' && (
                            <Flex gap="1" style={{ marginLeft: '1px', marginRight: '1px' }}>
                              <Button
                                variant="ghost"
                                size="1"
                                onClick={() => handleStartEditFolder(folder.id, folder.name)}
                                style={{ padding: '4px', minWidth: 'auto', margin: '1px' }}
                                title="Редактировать название"
                              >
                                <Pencil1Icon width={16} height={16} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="1"
                                onClick={() => handleDeleteFolder(folder.id)}
                                style={{ padding: '4px', minWidth: 'auto', color: 'var(--red-9)', margin: '1px' }}
                                title="Удалить папку"
                              >
                                <TrashIcon width={16} height={16} />
                              </Button>
                            </Flex>
                          )}
                        </Flex>
                      )
                    }

                    return <SortableFolderItem key={folder.id} />
                  })}
                </Flex>
              </SortableContext>
            </DndContext>
          </Box>

          {/* Кнопка создания новой папки */}
          {isCreatingFolder ? (
            <Flex direction="column" gap="2">
              <TextField.Root
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Введите название папки"
                size="2"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCreateFolder()
                  }
                  if (e.key === 'Escape') {
                    setIsCreatingFolder(false)
                    setNewFolderName('')
                  }
                }}
              />
              <Flex gap="2">
                <Button
                  variant="solid"
                  size="2"
                  onClick={handleCreateFolder}
                  disabled={!newFolderName.trim()}
                  style={{ flex: 1 }}
                >
                  Создать
                </Button>
                <Button
                  variant="soft"
                  size="2"
                  onClick={() => {
                    setIsCreatingFolder(false)
                    setNewFolderName('')
                  }}
                  style={{ flex: 1 }}
                >
                  Отмена
                </Button>
              </Flex>
            </Flex>
          ) : (
            <Button
              variant="ghost"
              size="3"
              onClick={() => setIsCreatingFolder(true)}
              style={{
                width: '100%',
                justifyContent: 'flex-start',
                padding: '12px 16px',
                color: 'var(--accent-9)',
                borderRadius: '8px',
                backgroundColor: 'var(--gray-2)',
                border: '1px solid var(--gray-6)'
              }}
            >
              <Flex align="center" gap="2">
                <Box
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--accent-9)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white'
                  }}
                >
                  <PlusIcon width={14} height={14} />
                </Box>
                <Text size="3" style={{ color: 'var(--accent-9)' }}>
                  Создать новую папку
                </Text>
              </Flex>
            </Button>
          )}
        </Dialog.Content>
      </Dialog.Root>

      {/* Модальное окно управления исключениями уведомлений */}
      <Dialog.Root 
        open={exceptionsModalOpen} 
        onOpenChange={(open) => {
          setExceptionsModalOpen(open)
          if (!open) {
            setExceptionsModalType(null)
            setExceptionsSearchQuery('')
          }
        }}
      >
        <Dialog.Content style={{ maxWidth: '500px', maxHeight: '80vh' }}>
          <Flex direction="column" gap="0" style={{ height: '100%' }}>
            {/* Заголовок */}
            <Flex align="center" justify="between" mb="4">
              <Dialog.Title style={{ margin: 0, lineHeight: '1' }}>
                <Text size="5" weight="bold">Добавить исключение</Text>
              </Dialog.Title>
              <Dialog.Close>
                <Button variant="ghost" size="2" style={{ padding: '4px' }}>
                  <Cross2Icon width={16} height={16} />
                </Button>
              </Dialog.Close>
            </Flex>

            {/* Кнопка "Добавить исключение" */}
            <Button
              variant="ghost"
              size="3"
              onClick={() => {
                // Переключаемся в режим добавления (показываем все чаты, не входящие в исключения)
                setExceptionsSearchQuery('')
              }}
              style={{
                width: '100%',
                justifyContent: 'flex-start',
                padding: '12px 16px',
                marginBottom: '16px',
                color: 'var(--accent-9)'
              }}
            >
              <Flex align="center" gap="2">
                <Box
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--accent-9)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white'
                  }}
                >
                  <PlusIcon width={14} height={14} />
                </Box>
                <Text size="3" style={{ color: 'var(--accent-9)' }}>
                  Добавить исключение
                </Text>
              </Flex>
            </Button>

            {/* Поле поиска */}
            <Box mb="4" style={{ flexShrink: 0 }}>
              <TextField.Root 
                placeholder="Поиск" 
                value={exceptionsSearchQuery}
                onChange={(e) => setExceptionsSearchQuery(e.target.value)}
                style={{ paddingLeft: 36 }}
              >
                <TextField.Slot>
                  <MagnifyingGlassIcon width={16} height={16} style={{ color: 'var(--gray-10)' }} />
                </TextField.Slot>
              </TextField.Root>
            </Box>

            {/* Список исключений */}
            <Box style={{ 
              flex: 1, 
              overflowY: 'auto',
              minHeight: 0
            }}>
              <Flex direction="column" gap="2">
                {(() => {
                  if (!exceptionsModalType) return null

                  // Фильтруем чаты по типу
                  const filteredChatsByType = chats.filter(chat => {
                    if (exceptionsModalType === 'private') return chat.type === 'chat'
                    if (exceptionsModalType === 'groups') return chat.type === 'group'
                    if (exceptionsModalType === 'channels') return chat.type === 'channel'
                    return false
                  })

                  // Фильтруем по поисковому запросу
                  const searchFiltered = exceptionsSearchQuery
                    ? filteredChatsByType.filter(chat => 
                        chat.name.toLowerCase().includes(exceptionsSearchQuery.toLowerCase())
                      )
                    : filteredChatsByType

                  // Разделяем на исключенные и не исключенные
                  const exceptions = notificationExceptions[exceptionsModalType]
                  const excludedChats = searchFiltered.filter(chat => exceptions.includes(chat.id))
                  const nonExcludedChats = searchFiltered.filter(chat => !exceptions.includes(chat.id))

                  // Показываем сначала исключенные, потом остальные
                  const allChats = [...excludedChats, ...nonExcludedChats]

                  if (allChats.length === 0) {
                    return (
                      <Text size="2" color="gray" style={{ textAlign: 'center', padding: '20px' }}>
                        {exceptionsSearchQuery ? 'Ничего не найдено' : 'Нет чатов этого типа'}
                      </Text>
                    )
                  }

                  return allChats.map((chat) => {
                    const isExcluded = exceptions.includes(chat.id)
                    return (
                      <Flex
                        key={chat.id}
                        align="center"
                        justify="between"
                        style={{
                          padding: '12px 16px',
                          borderRadius: '8px',
                          backgroundColor: 'var(--gray-2)',
                          border: '1px solid var(--gray-6)',
                          cursor: 'pointer'
                        }}
                        onClick={() => {
                          if (isExcluded) {
                            handleRemoveException(chat.id)
                          } else {
                            handleAddException(chat.id)
                          }
                        }}
                      >
                        <Flex align="center" gap="3" style={{ flex: 1, minWidth: 0 }}>
                          <Box className={styles.chatAvatar} style={{ width: 32, height: 32, fontSize: 14, flexShrink: 0 }}>
                            {chat.avatar}
                          </Box>
                          <Flex direction="column" gap="1" style={{ flex: 1, minWidth: 0 }}>
                            <Text size="3" weight="medium" style={{ 
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>
                              {chat.name}
                            </Text>
                            {isExcluded && (
                              <Text size="1" color="gray">
                                Без уведомлений
                              </Text>
                            )}
                            {!isExcluded && (
                              <Text size="1" color="gray">
                                {chat.type === 'chat' ? 'личный чат' : chat.type === 'group' ? 'группа' : 'канал'}
                              </Text>
                            )}
                          </Flex>
                        </Flex>
                        {isExcluded && (
                          <Button
                            variant="ghost"
                            size="2"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleRemoveException(chat.id)
                            }}
                            style={{ color: 'var(--accent-9)', flexShrink: 0 }}
                          >
                            Убрать
                          </Button>
                        )}
                      </Flex>
                    )
                  })
                })()}
              </Flex>
            </Box>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>

      {/* Модальное окно карусели изображений профиля */}
      <Dialog.Root 
        open={accountImageCarouselOpen} 
        onOpenChange={(open) => {
          setAccountImageCarouselOpen(open)
          if (!open) {
            setCurrentAccountImageIndex(0)
          }
        }}
      >
        <Dialog.Content style={{ maxWidth: '600px', padding: '20px' }}>
          <Flex direction="column" align="center" gap="4">
            <Dialog.Title>
              <Text size="5" weight="bold">Фото профиля</Text>
            </Dialog.Title>
            
            {accountImages.length > 0 ? (
              <>
                <Box style={{ position: 'relative', width: '100%', maxWidth: '500px' }}>
                  <img
                    src={accountImages[currentAccountImageIndex]}
                    alt="Profile"
                    style={{
                      width: '100%',
                      height: 'auto',
                      maxHeight: '500px',
                      objectFit: 'contain',
                      borderRadius: '12px'
                    }}
                  />
                  
                  {accountImages.length > 1 && (
                    <>
                      <Button
                        variant="solid"
                        size="3"
                        onClick={() => {
                          setCurrentAccountImageIndex(prev => 
                            prev > 0 ? prev - 1 : accountImages.length - 1
                          )
                        }}
                        style={{
                          position: 'absolute',
                          left: '16px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          borderRadius: '50%',
                          width: '40px',
                          height: '40px',
                          padding: 0
                        }}
                      >
                        <ArrowLeftIcon width={20} height={20} />
                      </Button>
                      <Button
                        variant="solid"
                        size="3"
                        onClick={() => {
                          setCurrentAccountImageIndex(prev => 
                            prev < accountImages.length - 1 ? prev + 1 : 0
                          )
                        }}
                        style={{
                          position: 'absolute',
                          right: '16px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          borderRadius: '50%',
                          width: '40px',
                          height: '40px',
                          padding: 0
                        }}
                      >
                        <ArrowRightIcon width={20} height={20} />
                      </Button>
                    </>
                  )}
                </Box>
                
                <Text size="2" color="gray">
                  {currentAccountImageIndex + 1} из {accountImages.length}
                </Text>
              </>
            ) : (
              <Text size="2" color="gray">
                Нет загруженных изображений
              </Text>
            )}
            
            <Flex gap="2" direction="column" style={{ width: '100%' }}>
              <Flex gap="2" style={{ width: '100%' }}>
                <Button 
                  onClick={() => {
                    setMainAccountImageIndex(currentAccountImageIndex)
                    toast.showSuccess('Главное фото установлено', 'Это изображение теперь отображается как главное фото профиля')
                  }}
                  variant={mainAccountImageIndex === currentAccountImageIndex ? 'solid' : 'soft'}
                  disabled={accountImages.length === 0}
                  style={{ flex: 1 }}
                >
                  {mainAccountImageIndex === currentAccountImageIndex ? 'Главное фото' : 'Установить как главное'}
                </Button>
                <Button onClick={handleAccountImageUpload} style={{ flex: 1 }}>
                  <CameraIcon width={16} height={16} style={{ marginRight: '8px' }} />
                  Загрузить фото
                </Button>
              </Flex>
              <Dialog.Close>
                <Button variant="soft" style={{ width: '100%' }}>Закрыть</Button>
              </Dialog.Close>
            </Flex>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>

      {/* Модальное окно карусели изображений чата */}
      <Dialog.Root 
        open={chatImageCarouselOpen} 
        onOpenChange={(open) => {
          setChatImageCarouselOpen(open)
          if (!open) {
            setChatImageCarouselChatId(null)
            setCurrentChatImageIndex(0)
          } else if (chatImageCarouselChatId) {
            // При открытии сбрасываем индекс на 0
            setCurrentChatImageIndex(0)
          }
        }}
      >
        <Dialog.Content style={{ maxWidth: '600px', padding: '20px' }}>
          <Flex direction="column" align="center" gap="4">
            <Dialog.Title>
              <Text size="5" weight="bold">
                {chatImageCarouselChatId && chats.find(c => c.id === chatImageCarouselChatId)?.name}
              </Text>
            </Dialog.Title>
            
            {chatImageCarouselChatId && chatImages[chatImageCarouselChatId] && chatImages[chatImageCarouselChatId].length > 0 ? (
              <>
                <Box style={{ position: 'relative', width: '100%', maxWidth: '500px' }}>
                  <img
                    src={chatImages[chatImageCarouselChatId][currentChatImageIndex] || chatImages[chatImageCarouselChatId][0]}
                    alt="Chat"
                    style={{
                      width: '100%',
                      height: 'auto',
                      maxHeight: '500px',
                      objectFit: 'contain',
                      borderRadius: '12px'
                    }}
                  />
                  
                  {chatImages[chatImageCarouselChatId].length > 1 && (
                    <>
                      <Button
                        variant="solid"
                        size="3"
                        onClick={() => {
                          setCurrentChatImageIndex(prev => 
                            prev > 0 ? prev - 1 : chatImages[chatImageCarouselChatId].length - 1
                          )
                        }}
                        style={{
                          position: 'absolute',
                          left: '16px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          borderRadius: '50%',
                          width: '40px',
                          height: '40px',
                          padding: 0
                        }}
                      >
                        <ArrowLeftIcon width={20} height={20} />
                      </Button>
                      <Button
                        variant="solid"
                        size="3"
                        onClick={() => {
                          setCurrentChatImageIndex(prev => 
                            prev < chatImages[chatImageCarouselChatId].length - 1 ? prev + 1 : 0
                          )
                        }}
                        style={{
                          position: 'absolute',
                          right: '16px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          borderRadius: '50%',
                          width: '40px',
                          height: '40px',
                          padding: 0
                        }}
                      >
                        <ArrowRightIcon width={20} height={20} />
                      </Button>
                    </>
                  )}
                </Box>
                
                <Text size="2" color="gray">
                  {(currentChatImageIndex >= 0 ? currentChatImageIndex : 0) + 1} из {chatImages[chatImageCarouselChatId].length}
                </Text>
              </>
            ) : (
              <Text size="2" color="gray">
                Нет загруженных изображений
              </Text>
            )}
            
            <Flex gap="2">
              {chatImageCarouselChatId && (
                <Button
                  variant="soft"
                  onClick={() => handleChatImageUpload(chatImageCarouselChatId)}
                >
                  <CameraIcon width={16} height={16} style={{ marginRight: '8px' }} />
                  Загрузить фото
                </Button>
              )}
              <Dialog.Close>
                <Button variant="soft">
                  Закрыть
                </Button>
              </Dialog.Close>
            </Flex>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    </AppLayout>
  )
}
