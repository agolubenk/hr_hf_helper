/**
 * AIChatPage (aichat/page.tsx) - Страница ИИ чата
 * 
 * Назначение:
 * - Чат с ИИ ассистентом для помощи в HR задачах
 * - Управление историей чатов
 * - Отправка сообщений и прикрепление файлов
 * - Переименование чатов
 * - Удаление чатов
 * 
 * Функциональность:
 * - ChatHistory: боковая панель с историей чатов
 * - ChatHeader: заголовок чата с переименованием и удалением
 * - ChatMessages: отображение сообщений чата
 * - ChatInput: поле ввода с отправкой сообщений и прикреплением файлов
 * - Автоматическая прокрутка к последнему сообщению
 * - Кнопка прокрутки вниз при скролле вверх
 * - Создание новых чатов
 * - Управление сообщениями по чатам
 * 
 * Связи:
 * - AppLayout: оборачивает страницу в общий layout
 * - useToast: для отображения уведомлений (подтверждение удаления)
 * - Компоненты чата: ChatHistory, ChatHeader, ChatMessages, ChatInput
 * 
 * Поведение:
 * - При загрузке отображает список чатов и выбранный чат
 * - При создании нового чата автоматически выбирает его
 * - При отправке сообщения добавляет его в текущий чат
 * - При скролле вверх показывает кнопку прокрутки вниз
 * - При удалении чата показывает подтверждение через toast
 * - При удалении последнего чата создает новый пустой чат
 */

'use client'

import AppLayout from "@/components/AppLayout"
import ChatHistory from "@/components/aichat/ChatHistory"
import ChatMessages from "@/components/aichat/ChatMessages"
import ChatInput from "@/components/aichat/ChatInput"
import ChatHeader from "@/components/aichat/ChatHeader"
import { useToast } from "@/components/Toast/ToastContext"
import { Box, Flex, Button } from "@radix-ui/themes"
import { ChevronDownIcon } from "@radix-ui/react-icons"
import { useState, useEffect, useRef, useCallback } from "react"
import styles from './aichat.module.css'

/**
 * Chat - интерфейс чата
 * 
 * Структура:
 * - id: уникальный идентификатор чата
 * - title: название чата (может быть изменено пользователем)
 * - createdAt: дата создания чата
 * - lastMessage: последнее сообщение в чате (опционально, для отображения в истории)
 */
export interface Chat {
  id: string
  title: string
  createdAt: string
  lastMessage?: string
}

/**
 * Message - интерфейс сообщения
 * 
 * Структура:
 * - id: уникальный идентификатор сообщения
 * - role: роль отправителя ('user' - пользователь, 'assistant' - ИИ)
 * - content: текст сообщения
 * - timestamp: время отправки сообщения
 * - files: массив прикрепленных файлов (опционально)
 */
export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  files?: File[]
}

/**
 * AIChatPage - компонент страницы ИИ чата
 * 
 * Состояние:
 * - chats: массив всех чатов пользователя
 * - selectedChatId: ID выбранного чата
 * - messages: объект сообщений по чатам (ключ - ID чата, значение - массив сообщений)
 * - isAtBottom: флаг, находится ли пользователь внизу списка сообщений
 */
export default function AIChatPage() {
  // Хук для отображения уведомлений
  const toast = useToast()

  /**
   * chats - массив всех чатов пользователя
   * 
   * Структура каждого чата:
   * - id: уникальный идентификатор
   * - title: название чата (по умолчанию "Чат DD.MM.YYYY HH:MM")
   * - createdAt: дата создания в формате DD.MM.YYYY HH:MM
   * - lastMessage: последнее сообщение для отображения в истории
   * 
   * TODO: Заменить на реальные данные из API
   */
  const [chats, setChats] = useState<Chat[]>([
    {
      id: '1',
      title: 'Чат 10.10.2025 20:57',
      createdAt: '10.10.2025 23:57',
      lastMessage: 'Расскажи сказку про колобка'
    },
    {
      id: '2',
      title: 'Так назову',
      createdAt: '05.10.2025 18:17',
      lastMessage: 'Привет!'
    },
    {
      id: '3',
      title: 'Чат 26.10.2025 16:38',
      createdAt: '26.10.2025 16:38',
    },
  ])

  // ID выбранного чата: определяет, какой чат отображается в основной области
  const [selectedChatId, setSelectedChatId] = useState<string>('1')
  
  /**
   * messages - объект сообщений по чатам
   * 
   * Структура:
   * - Ключ: ID чата (string)
   * - Значение: массив сообщений этого чата
   * 
   * Используется для:
   * - Хранения всех сообщений всех чатов
   * - Быстрого доступа к сообщениям конкретного чата
   * - Отображения сообщений в ChatMessages компоненте
   * 
   * TODO: Заменить на реальные данные из API
   */
  const [messages, setMessages] = useState<Record<string, Message[]>>({
    '1': [
      {
        id: '1',
        role: 'user',
        content: 'Покажи примеры форматирования текста',
        timestamp: '10.10.2025 23:57'
      },
      {
        id: '2',
        role: 'assistant',
        content: `# Заголовок 1

## Заголовок 2

### Заголовок 3

Вот примеры различных форматов текста:

**Жирный текст** и __тоже жирный__

*Курсивный текст* и _тоже курсивный_

***Жирный и курсивный вместе***

<u>Подчеркнутый текст</u>

~~Зачеркнутый текст~~

\`Inline код\`

Блок кода:
\`\`\`
function example() {
  return "Hello, World!";
}
\`\`\`

> Это цитата с **жирным текстом** и *курсивом*
> Может быть многострочной
> И содержать <u>подчеркнутый</u> и ~~зачеркнутый~~ текст
> Также может быть ***жирный и курсивный вместе***

Комбинации: **жирный** с *курсивом* и <u>подчеркиванием</u>, а также ~~зачеркнутый~~ текст.

Можно использовать \`код\` внутри **жирного** текста.`,
        timestamp: '10.10.2025 23:58'
      }
    ]
  })

  // Выбранный чат: объект чата с выбранным ID
  const selectedChat = chats.find(chat => chat.id === selectedChatId)
  // Текущие сообщения: сообщения выбранного чата или пустой массив
  const currentMessages = messages[selectedChatId] || []
  // Ref для контейнера сообщений: используется для прокрутки
  const messagesScrollRef = useRef<HTMLDivElement>(null)
  // Флаг нахождения внизу списка: true - пользователь внизу, false - прокрутил вверх
  const [isAtBottom, setIsAtBottom] = useState(true)

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
   * - Выполняется при изменении currentMessages (новые сообщения)
   * - Выполняется при изменении selectedChatId (переключение чата)
   * - Прокручивает дважды: сразу и через requestAnimationFrame (для надежности)
   * - Устанавливает флаг isAtBottom в true
   * 
   * Причина двойной прокрутки:
   * - Первая прокрутка выполняется сразу
   * - Вторая через requestAnimationFrame гарантирует прокрутку после полного рендера DOM
   */
  useEffect(() => {
    const el = messagesScrollRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight // Первая прокрутка
    setIsAtBottom(true)
    // Вторая прокрутка через requestAnimationFrame для надежности
    requestAnimationFrame(() => { el.scrollTop = el.scrollHeight })
  }, [currentMessages, selectedChatId]) // Зависимости: сообщения и выбранный чат

  /**
   * showScrollToBottom - флаг отображения кнопки прокрутки вниз
   * 
   * Логика:
   * - Показывать кнопку только если пользователь не внизу (isAtBottom === false)
   * - И только если есть сообщения (currentMessages.length > 0)
   * 
   * Поведение:
   * - Используется для условного рендеринга кнопки "К последнему сообщению"
   * - Кнопка появляется при прокрутке вверх и исчезает при прокрутке вниз
   */
  const showScrollToBottom = !isAtBottom && currentMessages.length > 0

  /**
   * handleNewChat - обработчик создания нового чата
   * 
   * Функциональность:
   * - Создает новый чат с автоматически сгенерированным названием
   * - Добавляет новый чат в начало списка чатов
   * - Автоматически выбирает новый чат
   * - Создает пустой массив сообщений для нового чата
   * 
   * Поведение:
   * - Вызывается из ChatHistory при клике на кнопку создания чата
   * - Название чата генерируется как "Чат DD.MM.YYYY HH:MM"
   * - Новый чат сразу становится активным
   * 
   * Связи:
   * - ChatHistory: вызывает эту функцию через onNewChat prop
   */
  const handleNewChat = () => {
    const newChat: Chat = {
      id: Date.now().toString(), // Используем timestamp как уникальный ID
      title: `Чат ${new Date().toLocaleDateString('ru-RU')} ${new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`,
      createdAt: new Date().toLocaleString('ru-RU', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
    }
    // Добавляем новый чат в начало списка
    setChats([newChat, ...chats])
    // Автоматически выбираем новый чат
    setSelectedChatId(newChat.id)
    // Создаем пустой массив сообщений для нового чата
    setMessages({ ...messages, [newChat.id]: [] })
  }

  /**
   * handleSendMessage - обработчик отправки сообщения
   * 
   * Функциональность:
   * - Создает новое сообщение пользователя
   * - Добавляет сообщение в текущий чат
   * - Подготавливает данные для отправки на сервер
   * 
   * Параметры:
   * - content: текст сообщения
   * - modelId: ID выбранной модели ИИ (опционально)
   * - files: массив прикрепленных файлов (опционально)
   * 
   * Поведение:
   * - Вызывается из ChatInput при отправке сообщения
   * - Сразу добавляет сообщение пользователя в чат (оптимистичное обновление)
   * - В реальной реализации должен отправлять запрос на сервер и получать ответ от ИИ
   * 
   * Связи:
   * - ChatInput: вызывает эту функцию через onSend prop
   * - API: должен отправлять сообщение на сервер и получать ответ от ИИ
   * 
   * TODO: Реализовать отправку на сервер и получение ответа от ИИ
   */
  const handleSendMessage = (content: string, modelId?: string, files?: File[]) => {
    const newMessage: Message = {
      id: Date.now().toString(), // Используем timestamp как уникальный ID
      role: 'user', // Сообщение от пользователя
      content: content || '',
      timestamp: new Date().toLocaleString('ru-RU', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      files: files && files.length > 0 ? files : undefined // Прикрепленные файлы
    }

    // Добавляем сообщение в текущий чат
    setMessages({
      ...messages,
      [selectedChatId]: [...(messages[selectedChatId] || []), newMessage]
    })

    // Здесь будет логика отправки на сервер и получения ответа от AI
    // modelId содержит ID выбранной модели
    // files содержит массив прикрепленных файлов
    // Пока что просто добавляем сообщение пользователя
    // TODO: Отправить запрос на сервер, получить ответ от ИИ и добавить его в чат
  }

  /**
   * handleFileAttach - обработчик прикрепления файла
   * 
   * Функциональность:
   * - Обрабатывает прикрепление файла к сообщению
   * - В текущей реализации только логирует информацию о файле
   * 
   * Поведение:
   * - Вызывается из ChatInput при выборе файла
   * - Файл не отправляется сразу, а прикрепляется к следующему сообщению
   * - При отправке сообщения файл включается в handleSendMessage
   * 
   * Связи:
   * - ChatInput: вызывает эту функцию через onFileAttach prop
   * 
   * TODO: Реализовать предпросмотр прикрепленных файлов
   */
  const handleFileAttach = (file: File) => {
    // Файлы просто прикрепляются к сообщению, не отправляются сразу
    // Логика обработки будет при отправке сообщения
    console.log('Прикреплен файл:', file.name, file.type, file.size)
  }

  /**
   * handleTitleChange - обработчик изменения названия чата
   * 
   * Функциональность:
   * - Обновляет название выбранного чата
   * - Сохраняет изменения в состоянии chats
   * 
   * Поведение:
   * - Вызывается из ChatHeader при переименовании чата
   * - Обновляет только выбранный чат, остальные остаются без изменений
   * 
   * Связи:
   * - ChatHeader: вызывает эту функцию через onTitleChange prop
   * 
   * @param newTitle - новое название чата
   */
  const handleTitleChange = (newTitle: string) => {
    setChats(chats.map(chat => 
      chat.id === selectedChatId 
        ? { ...chat, title: newTitle } // Обновляем только выбранный чат
        : chat // Остальные чаты без изменений
    ))
  }

  /**
   * performDeleteChat - выполнение удаления чата
   * 
   * Функциональность:
   * - Удаляет чат из списка чатов
   * - Удаляет сообщения чата из состояния messages
   * - Если удаляется последний чат - создает новый пустой чат
   * - Если удаляется выбранный чат - выбирает первый оставшийся чат
   * 
   * Логика:
   * 1. Фильтрует чаты, удаляя чат с указанным ID
   * 2. Если после удаления не осталось чатов - создает новый пустой чат
   * 3. Если удаляется выбранный чат - выбирает первый оставшийся
   * 4. Удаляет сообщения удаленного чата из состояния
   * 
   * Поведение:
   * - Вызывается после подтверждения удаления в showDeleteConfirm
   * - Гарантирует, что всегда есть хотя бы один чат
   * 
   * @param chatId - ID чата для удаления
   */
  const performDeleteChat = (chatId: string) => {
    // Используем ref для отслеживания, нужно ли создавать новый чат
    const willCreateNewRef = { current: false }
    setChats(prev => {
      const filtered = prev.filter(c => c.id !== chatId)
      // Если это был последний чат - создаем новый
      if (filtered.length === 0) {
        willCreateNewRef.current = true
        const newChat: Chat = {
          id: Date.now().toString(),
          title: `Чат ${new Date().toLocaleDateString('ru-RU')} ${new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`,
          createdAt: new Date().toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        }
        setSelectedChatId(newChat.id)
        // Удаляем сообщения удаленного чата и создаем пустой массив для нового
        setMessages(prevM => { const n = { ...prevM }; delete n[chatId]; n[newChat.id] = []; return n })
        return [newChat]
      }
      // Если удаляется выбранный чат - выбираем первый оставшийся
      if (chatId === selectedChatId) {
        setSelectedChatId(filtered[0].id)
      }
      return filtered
    })
    // Удаляем сообщения удаленного чата (если не создали новый)
    if (!willCreateNewRef.current) {
      setMessages(prev => { const n = { ...prev }; delete n[chatId]; return n })
    }
  }

  /**
   * showDeleteConfirm - показ подтверждения удаления чата
   * 
   * Функциональность:
   * - Показывает предупреждающее уведомление с подтверждением удаления
   * - Предоставляет кнопки "Отмена" и "Удалить"
   * 
   * Поведение:
   * - Вызывается перед удалением чата
   * - Показывает toast-уведомление с вопросом и кнопками действий
   * - При клике на "Удалить" вызывает performDeleteChat
   * - При клике на "Отмена" просто закрывает уведомление
   * 
   * Связи:
   * - useToast: использует toast для отображения уведомления
   * - performDeleteChat: вызывается при подтверждении удаления
   * 
   * @param chatId - ID чата для удаления
   */
  const showDeleteConfirm = (chatId: string) => {
    toast.showWarning('Удалить чат?', 'Вы уверены, что хотите удалить этот чат?', {
      duration: 12000, // Уведомление показывается 12 секунд
      actions: [
        { label: 'Отмена', onClick: () => {}, variant: 'soft', color: 'gray' },
        { label: 'Удалить', onClick: () => performDeleteChat(chatId), variant: 'solid', color: 'red' },
      ],
    })
  }

  /**
   * handleDeleteChat - обработчик удаления текущего чата
   * 
   * Функциональность:
   * - Показывает подтверждение удаления для выбранного чата
   * 
   * Поведение:
   * - Вызывается из ChatHeader при клике на кнопку удаления
   * - Использует selectedChatId для определения чата для удаления
   */
  const handleDeleteChat = () => showDeleteConfirm(selectedChatId)

  /**
   * handleDeleteChatFromHistory - обработчик удаления чата из истории
   * 
   * Функциональность:
   * - Показывает подтверждение удаления для чата из истории
   * 
   * Поведение:
   * - Вызывается из ChatHistory при удалении чата из списка
   * - Может удалить любой чат, не только выбранный
   * 
   * @param chatId - ID чата для удаления
   */
  const handleDeleteChatFromHistory = (chatId: string) => showDeleteConfirm(chatId)

  /**
   * Рендер компонента страницы ИИ чата
   * 
   * Структура:
   * - AppLayout: оборачивает страницу в общий layout
   * - Двухколоночная раскладка:
   *   - Левая колонка: история чатов (ChatHistory)
   *   - Правая колонка: выбранный чат (ChatHeader, ChatMessages, ChatInput)
   */
  return (
    <AppLayout pageTitle="AI Chat">
      <Box className={styles.aichatContainer}>
        <Flex gap="4" className={styles.mainContent}>
          {/* Левая боковая панель с историей чатов
              - chats: массив всех чатов для отображения
              - selectedChatId: ID выбранного чата для подсветки
              - onChatSelect: обработчик выбора чата (устанавливает selectedChatId)
              - onNewChat: обработчик создания нового чата
              - onChatDelete: обработчик удаления чата из истории */}
          <Box className={styles.sidebarColumn}>
            <ChatHistory
              chats={chats}
              selectedChatId={selectedChatId}
              onChatSelect={setSelectedChatId}
              onNewChat={handleNewChat}
              onChatDelete={handleDeleteChatFromHistory}
            />
          </Box>

          {/* Правая основная область с чатом
              - Отображается только если есть выбранный чат (selectedChat) */}
          <Box className={styles.chatColumn}>
            {selectedChat && (
              <Box className={styles.chatCard}>
                {/* Заголовок чата
                    - title: название чата (можно редактировать)
                    - createdAt: дата создания чата
                    - onTitleChange: обработчик изменения названия
                    - onDelete: обработчик удаления чата */}
                <ChatHeader
                  title={selectedChat.title}
                  createdAt={selectedChat.createdAt}
                  onTitleChange={handleTitleChange}
                  onDelete={handleDeleteChat}
                />

                {/* Обертка для сообщений и кнопки прокрутки
                    - messagesScrollRef: ref для контейнера сообщений (для прокрутки)
                    - onScroll: обработчик скролла (определяет, показывать ли кнопку прокрутки)
                    - ChatMessages: компонент отображения сообщений
                    - Кнопка прокрутки: показывается только если showScrollToBottom === true */}
                <Box className={styles.messagesWrapper}>
                  <Box
                    ref={messagesScrollRef}
                    className={styles.messagesContainer}
                    onScroll={handleMessagesScroll}
                  >
                    <ChatMessages messages={currentMessages} />
                  </Box>
                  {/* Кнопка прокрутки вниз: показывается при прокрутке вверх
                      - onClick: прокручивает контейнер сообщений вниз
                      - title: подсказка при наведении */}
                  {showScrollToBottom && (
                    <Button
                      size="2"
                      variant="soft"
                      color="gray"
                      className={styles.scrollToBottomBtn}
                      onClick={scrollToBottom}
                      title="К последнему сообщению"
                      radius="full"
                    >
                      <ChevronDownIcon width={18} height={18} />
                    </Button>
                  )}
                </Box>

                {/* Контейнер поля ввода
                    - ChatInput: компонент ввода сообщения
                    - onSend: обработчик отправки сообщения
                    - onFileAttach: обработчик прикрепления файла */}
                <Box className={styles.inputContainer}>
                  <ChatInput onSend={handleSendMessage} onFileAttach={handleFileAttach} />
                </Box>
              </Box>
            )}
          </Box>
        </Flex>
      </Box>
    </AppLayout>
  )
}
