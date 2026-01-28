/**
 * WorkflowChat (components/workflow/WorkflowChat.tsx) - Компонент чата workflow (скрининг/интервью)
 * 
 * Назначение:
 * - Чат-интерфейс для управления процессом скрининга и интервью
 * - Обработка команд через теги (#add, #hr_screening, #tech_screening, #interview, #delete)
 * - Управление кандидатами и инвайтами
 * - Отображение истории действий и ответов системы
 * 
 * Функциональность:
 * - Отображение сообщений чата (пользователь, система, инвайты)
 * - Обработка команд через теги:
 *   - #add: добавление кандидата из файла резюме
 *   - #hr_screening: HR скрининг (ссылка Huntflow + текст ответов)
 *   - #tech_screening: технический скрининг (ссылка Huntflow + дата-время)
 *   - #interview: создание интервью (ссылка Huntflow + дата-время)
 *   - #delete: отмена последнего действия
 * - Управление файлами: загрузка резюме
 * - Управление инвайтами: создание, копирование, пересоздание scorecard
 * - Управление отклонениями: выбор причины отказа
 * - Скрытие сообщений
 * - Автопрокрутка к новым сообщениям
 * 
 * Связи:
 * - workflow/page.tsx: основной компонент страницы workflow
 * - WorkflowHeader: управление типом процесса и настройками
 * - API: отправка команд на сервер для обработки
 * - Huntflow: интеграция для синхронизации данных
 * 
 * Поведение:
 * - При отправке сообщения с тегом обрабатывает команду и показывает ответ системы
 * - При загрузке файла резюме обрабатывает и добавляет кандидата
 * - При отправке ссылки Huntflow извлекает данные и создает/обновляет кандидата
 * - При отправке даты-времени создает инвайт на интервью
 * - При команде #delete отменяет последнее действие
 * 
 * TODO: Реализовать реальную обработку команд на сервере
 */
'use client'

import { Box, Text, Flex, TextArea, Button, Table } from "@radix-ui/themes"
import { ChevronDownIcon, ChevronUpIcon, PaperPlaneIcon, OpenInNewWindowIcon, EyeOpenIcon, CalendarIcon, CheckIcon, PersonIcon, Cross2Icon, ClipboardIcon, CopyIcon, Link2Icon, ExclamationTriangleIcon } from "@radix-ui/react-icons"
import { useState, useRef, useEffect, useCallback } from "react"
import styles from './WorkflowChat.module.css'

/**
 * ParticipantsList - компонент для отображения списка участников интервью
 * 
 * Функциональность:
 * - Отображает количество участников
 * - Раскрывает/сворачивает список участников
 * 
 * Используется для:
 * - Отображения участников интервью в сообщениях типа 'response' с candidate.participants
 * 
 * @param participants - массив имен участников
 */
function ParticipantsList({ participants }: { participants: string[] }) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  /**
   * getParticipantsText - форматирование текста количества участников
   * 
   * Функциональность:
   * - Форматирует текст в зависимости от количества участников
   * 
   * @param count - количество участников
   * @returns отформатированный текст (1 Участник, 2-4 Участника, 5+ Участников)
   */
  const getParticipantsText = (count: number) => {
    if (count === 1) return '1 Участник'
    if (count >= 2 && count <= 4) return `${count} Участника`
    return `${count} Участников`
  }
  
  return (
    <Flex direction="column" gap="1">
      <Flex align="center" gap="1" style={{ cursor: 'pointer' }} onClick={() => setIsExpanded(!isExpanded)}>
        <Text size="2">{getParticipantsText(participants.length)}</Text>
        {isExpanded ? (
          <ChevronUpIcon width={12} height={12} />
        ) : (
          <ChevronDownIcon width={12} height={12} />
        )}
      </Flex>
      {isExpanded && (
        <Box style={{ paddingLeft: '12px' }}>
          {participants.map((participant, index) => (
            <Text key={index} size="2" style={{ display: 'block', marginBottom: '4px' }}>
              • {participant}
            </Text>
          ))}
        </Box>
      )}
    </Flex>
  )
}

/**
 * ChatMessage - интерфейс сообщения в чате
 * 
 * Типы сообщений:
 * - 'user': сообщение от пользователя (команда)
 * - 'invite': сообщение-инвайт (созданный инвайт)
 * - 'response': ответ системы на команду пользователя
 * 
 * Структура:
 * - id: уникальный идентификатор сообщения
 * - type: тип сообщения
 * - content: текстовое содержимое (опционально)
 * - url: ссылка на Huntflow (опционально)
 * - text: текст ответов/команды (опционально)
 * - file: прикрепленный файл (опционально)
 * - timestamp: время сообщения
 * - tag: тег команды (#add, #hr_screening, #tech_screening, #interview, #delete)
 * - candidate: данные кандидата (опционально, только для response)
 * - status: статус операции (опционально, только для response)
 * - rejectionReason: причина отказа (опционально)
 * - showRejectionPrompt: флаг показа запроса причины отказа (опционально)
 * - deleteType: тип удаления (опционально, только для response с tag #delete)
 * - deletedEventInfo: информация об удаленном событии (опционально)
 */
interface ChatMessage {
  id: string
  type: 'user' | 'invite' | 'response'
  content?: string
  url?: string
  text?: string
  file?: {
    name: string
    type: string
  }
  timestamp: string
  tag?: string
  candidate?: {
    name: string
    vacancy: string
    source?: 'Файл' | 'LinkedIn' | 'Rabota.by' | 'Прочий'
    scorecardUrl?: string
    meetUrl?: string
    interviewDate?: string
    salary?: string
    level?: string
    format?: 'Офис' | 'Онлайн' | 'Гибрид'
    participants?: string[]
  }
  status?: string
  rejectionReason?: string
  showRejectionPrompt?: boolean
  deleteType?: 'Удаление кандидата' | 'Удаление записи' | 'Удаление события'
  deletedEventInfo?: {
    eventDate?: string
    documentsDeleted?: boolean
    recordsDeleted?: boolean
  }
}

/**
 * AttachedFile - интерфейс прикрепленного файла
 * 
 * Структура:
 * - id: уникальный идентификатор файла
 * - file: объект File из браузера
 */
interface AttachedFile {
  id: string
  file: File
}

/**
 * WorkflowChat - компонент чата workflow
 * 
 * Состояние:
 * - message: текст сообщения в поле ввода
 * - hiddenMessages: множество ID скрытых сообщений
 * - attachedFiles: массив прикрепленных файлов
 * - currentCommand: текущая обрабатываемая команда (опционально)
 * - rejectedCandidates: множество ID отклоненных кандидатов
 * - rejectionReasons: Map причин отказа (ключ - ID кандидата, значение - причина)
 * 
 * Функциональность:
 * - Управление сообщениями чата
 * - Обработка команд через теги
 * - Управление файлами и инвайтами
 */
export default function WorkflowChat() {
  // Текст сообщения в поле ввода
  const [message, setMessage] = useState('')
  // Множество ID скрытых сообщений (для возможности скрытия сообщений)
  const [hiddenMessages, setHiddenMessages] = useState<Set<string>>(new Set())
  // Массив прикрепленных файлов (резюме)
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([])
  // Текущая обрабатываемая команда (опционально, для отслеживания состояния обработки)
  const [currentCommand, setCurrentCommand] = useState<string | null>(null)
  // Множество ID отклоненных кандидатов
  const [rejectedCandidates, setRejectedCandidates] = useState<Set<string>>(new Set())
  // Map причин отказа (ключ - ID кандидата, значение - причина отказа)
  const [rejectionReasons, setRejectionReasons] = useState<Map<string, string>>(new Map())
  // Ref для поля ввода сообщения (для управления фокусом и размером)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  // Ref для input файла (для программного вызова выбора файла)
  const fileInputRef = useRef<HTMLInputElement>(null)
  // Ref для контейнера сообщений (для автопрокрутки к новым сообщениям)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  // Моковые данные сообщений (начальные)
  const initialMessages: ChatMessage[] = [
    {
      id: '1',
      type: 'user',
      file: {
        name: 'resume.pdf',
        type: 'application/pdf'
      },
      timestamp: '08.01.2026 10:30',
      tag: '#add',
    },
    {
      id: '1-response',
      type: 'response',
      timestamp: '08.01.2026 10:31',
      tag: '#add',
      candidate: {
        name: 'Иван Иванов',
        vacancy: 'Frontend Engineer (React)',
      },
      status: 'Резюме добавлено в систему',
    },
    {
      id: '2',
      type: 'user',
      url: 'https://huntflow.ru/my/softnetix#/vacancy/3936868/filter/workon/id/79013654',
      timestamp: '08.01.2026 11:15',
      tag: '#hr_screening',
      text: '1) ожидаю от 1300$ на руки\n2) Готов, но было бы отлично, если бы была возможность удаленной работы или гибрид. Нахожусь в Минске\n3) Да\n4) Не понял вопроса, если связано с универом, то закончил уже(БГУИР КСиС ПОИТ), военный билет есть\n5) Военный билет есть\n6) Нет\n7) Компания столкнулась с серьезными финансовыми трудностями\n8) кратчайшие сроки после успешного собеса\n9) Наверное нет смысла перечислять мелкие библиотеки, из значимого это настройка SEO, NextJS, да на самом деле много всего, лучше вживую на собеседовании рассказать)\n10) начинающий middle',
    },
    {
      id: '2-response',
      type: 'response',
      timestamp: '08.01.2026 11:16',
      tag: '#hr_screening',
      candidate: {
        name: 'Игорь Грицук',
        vacancy: 'Frontend Engineer',
        salary: '1300 USD',
        level: 'Junior',
      },
      status: 'Данные сохранены и переданы в Huntflow',
    },
    {
      id: '3',
      type: 'user',
      url: 'https://huntflow.ru/my/softnetix#/vacancy/3936868/filter/186500/id/79014225',
      timestamp: '08.01.2026 14:20',
      tag: '#tech_screening',
      text: 'завтра 11:15',
    },
    {
      id: '3-response',
      type: 'response',
      timestamp: '08.01.2026 14:21',
      tag: '#tech_screening',
      candidate: {
        name: 'Игорь Грицук',
        vacancy: 'Frontend Engineer (React)',
        scorecardUrl: '#',
        meetUrl: '#',
        interviewDate: '2026-01-12 12:00',
      },
      status: 'Инвайт отправлен и добавлен в календарь',
    },
    {
      id: '4',
      type: 'user',
      url: 'https://huntflow.ru/my/softnetix#/vacancy/3936868/filter/186500/id/79014225',
      timestamp: '08.01.2026 16:45',
      tag: '#interview',
      text: 'послезавтра 15:30',
    },
    {
      id: '4-response',
      type: 'response',
      timestamp: '08.01.2026 16:46',
      tag: '#interview',
      candidate: {
        name: 'Игорь Грицук',
        vacancy: 'Frontend Engineer (React)',
        scorecardUrl: '#',
        meetUrl: '#',
        interviewDate: '2026-01-10 15:30',
        format: 'Офис',
        participants: ['Петр Иванов', 'Анна Смирнова'],
      },
      status: 'Инвайт отправлен и добавлен в календарь',
    },
    {
      id: '5',
      type: 'user',
      timestamp: '08.01.2026 17:00',
      tag: '#delete',
    },
    {
      id: '5-response',
      type: 'response',
      timestamp: '08.01.2026 17:01',
      tag: '#delete',
      deleteType: 'Удаление события',
      candidate: {
        name: 'Игорь Грицук',
        vacancy: 'Frontend Engineer (React)',
      },
      deletedEventInfo: {
        eventDate: '2026-01-10 15:30',
        documentsDeleted: true,
        recordsDeleted: true,
      },
      status: 'Последнее действие отменено',
    },
    {
      id: '6',
      type: 'user',
      file: {
        name: 'resume2.pdf',
        type: 'application/pdf'
      },
      timestamp: '08.01.2026 18:00',
      tag: '#add',
    },
    {
      id: '6-response',
      type: 'response',
      timestamp: '08.01.2026 18:01',
      tag: '#add',
      candidate: {
        name: 'Петр Сидоров',
        vacancy: 'Backend Engineer (Python)',
      },
      status: 'Резюме добавлено в систему',
    },
    {
      id: '7',
      type: 'user',
      timestamp: '08.01.2026 18:05',
      tag: '#delete',
    },
    {
      id: '7-response',
      type: 'response',
      timestamp: '08.01.2026 18:06',
      tag: '#delete',
      deleteType: 'Удаление кандидата',
      candidate: {
        name: 'Петр Сидоров',
        vacancy: 'Backend Engineer (Python)',
      },
      status: 'Последнее действие отменено',
    },
    {
      id: '8',
      type: 'user',
      url: 'https://huntflow.ru/my/softnetix#/vacancy/3936868/filter/workon/id/79013655',
      timestamp: '08.01.2026 19:00',
      tag: '#hr_screening',
      text: '1) ожидаю от 1500$ на руки\n2) Готов к удаленной работе',
    },
    {
      id: '8-response',
      type: 'response',
      timestamp: '08.01.2026 19:01',
      tag: '#hr_screening',
      candidate: {
        name: 'Мария Козлова',
        vacancy: 'Fullstack Engineer',
        salary: '1500 USD',
        level: 'Middle',
      },
      status: 'Данные сохранены и переданы в Huntflow',
      showRejectionPrompt: false,
    },
    {
      id: '9',
      type: 'user',
      timestamp: '08.01.2026 19:10',
      tag: '#delete',
    },
    {
      id: '9-response',
      type: 'response',
      timestamp: '08.01.2026 19:11',
      tag: '#delete',
      deleteType: 'Удаление записи',
      candidate: {
        name: 'Мария Козлова',
        vacancy: 'Fullstack Engineer',
      },
      status: 'Последнее действие отменено',
    },
    {
      id: '10',
      type: 'user',
      url: 'https://huntflow.ru/my/softnetix#/vacancy/3936868/filter/workon/id/79013656',
      timestamp: '26.01.2026 10:56',
      tag: '#hr_screening',
      text: '1) ожидаю от 1000$ на руки\n2) Готов к работе в офисе\n3) Да\n4) Высшее образование\n5) Военный билет есть\n6) Нет ограничений\n7) Ищу стабильную работу\n8) В течение 2 недель\n9) React, JavaScript, HTML, CSS\n10) Junior',
    },
    {
      id: '10-response',
      type: 'response',
      timestamp: '26.01.2026 10:56',
      tag: '#hr_screening',
      candidate: {
        name: 'Егор Говсь',
        vacancy: 'Frontend Engineer',
        salary: '1000 USD',
        level: 'Junior',
      },
      status: 'Данные сохранены и переданы в Huntflow',
    },
    {
      id: '11',
      type: 'user',
      url: 'https://huntflow.ru/my/softnetix#/vacancy/3936868/filter/workon/id/79013657',
      timestamp: '26.01.2026 10:39',
      tag: '#hr_screening',
      text: '1) ожидаю от 1700$ на руки\n2) Только офисный формат работы\n3) Да\n4) Высшее образование\n5) Военный билет есть\n6) Нет ограничений\n7) Предпочитаю офисную работу\n8) В течение месяца\n9) React, TypeScript, Vue.js\n10) Middle',
    },
    {
      id: '11-response',
      type: 'response',
      timestamp: '26.01.2026 10:39',
      tag: '#hr_screening',
      candidate: {
        name: 'Евгений Хилько',
        vacancy: 'Frontend Engineer',
        salary: '1700 USD',
        level: 'Middle',
      },
      status: 'Данные сохранены. Статус - Отказ: Офисный формат',
      rejectionReason: 'Офисный формат',
    },
  ]

  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [isAtBottom, setIsAtBottom] = useState(true)

  const handleSend = () => {
    if (message.trim() || attachedFiles.length > 0 || currentCommand === '#delete') {
      const files = attachedFiles.map(af => af.file)
      const now = new Date()
      const timestamp = `${now.getDate().toString().padStart(2, '0')}.${(now.getMonth() + 1).toString().padStart(2, '0')}.${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
      
      // Создаем новое сообщение
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'user',
        timestamp,
        tag: currentCommand || undefined,
        url: message.includes('http') ? message.split('\n')[0] : undefined,
        text: message.includes('http') ? message.split('\n').slice(1).join('\n') : message || undefined,
        file: files.length > 0 ? {
          name: files[0].name,
          type: files[0].type
        } : undefined,
      }

      // Добавляем сообщение в список
      setMessages(prev => [...prev, newMessage])
      
      console.log('Отправка сообщения:', message, 'Файлы:', files, 'Команда:', currentCommand)
      setMessage('')
      setAttachedFiles([])
      setCurrentCommand(null)
      // Сбрасываем высоту textarea после отправки
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
        textareaRef.current.style.height = '40px'
      }
    }
  }

  const handleDeleteConfirm = () => {
    // Здесь будет логика подтверждения удаления
    console.log('Удаление подтверждено')
  }

  const handleDeleteCancel = (messageId: string) => {
    // Скрываем сообщение при нажатии "Нет"
    setHiddenMessages(prev => new Set(prev).add(messageId))
    console.log('Удаление отменено, сообщение скрыто')
  }

  const handleFileAttach = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      // Проверяем лимит файлов
      const currentCount = attachedFiles.length
      const newCount = currentCount + files.length
      
      if (newCount > 10) {
        const allowedCount = 10 - currentCount
        if (allowedCount > 0) {
          files.splice(allowedCount)
          alert(`Можно прикрепить не более 10 файлов. Добавлено ${allowedCount} из ${files.length + allowedCount}`)
        } else {
          alert('Можно прикрепить не более 10 файлов')
          if (fileInputRef.current) {
            fileInputRef.current.value = ''
          }
          return
        }
      }

      // Добавляем файлы в список
      const newFiles: AttachedFile[] = files.map(file => ({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9) + file.name,
        file
      }))
      setAttachedFiles([...attachedFiles, ...newFiles])
      
      // Автоматически добавляем команду #add при прикреплении файла
      setCurrentCommand('#add')
    }
    // Сбрасываем значение input, чтобы можно было выбрать тот же файл снова
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleRemoveFile = (fileId: string) => {
    const newFiles = attachedFiles.filter(af => af.id !== fileId)
    setAttachedFiles(newFiles)
    // Если файлов не осталось, убираем команду #add
    if (newFiles.length === 0 && currentCommand === '#add') {
      setCurrentCommand(null)
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  // Функция для сокращения длинных URL
  const shortenUrl = (url: string, maxLength: number = 50): string => {
    if (url.length <= maxLength) return url
    
    // Пытаемся найти паттерн с id в конце
    const idMatch = url.match(/(id\/\d+)$/)
    if (idMatch) {
      const idPart = idMatch[1]
      // Извлекаем начало до первого слеша после протокола (например, "https://hunt")
      const protocolMatch = url.match(/^(https?:\/\/[^\/]+)/)
      if (protocolMatch) {
        const domain = protocolMatch[1]
        // Берем только начало домена до первого слеша или точки после "hunt"
        const huntMatch = domain.match(/^(https?:\/\/hunt)/i)
        if (huntMatch) {
          return `${huntMatch[1]}......${idPart}`
        }
        // Если нет "hunt", используем протокол + начало домена
        const domainStart = domain.split('.')[0] // берем до первой точки
        return `${domainStart}......${idPart}`
      }
      // Если не нашли протокол, используем просто начало
      return `https://hunt......${idPart}`
    }
    
    // Если не удалось найти id, просто обрезаем с многоточием
    return url.substring(0, maxLength - 3) + '...'
  }

  // Функция для определения цвета фона тега
  const getTagColor = (tag: string): string => {
    const tagLower = tag.toLowerCase()
    if (tagLower.includes('hr_screening')) {
      return 'rgba(34, 197, 94, 0.75)' // зеленый
    } else if (tagLower.includes('tech_screening')) {
      return 'rgba(249, 115, 22, 0.75)' // оранжевый
    } else if (tagLower.includes('interview')) {
      return 'rgba(99, 102, 241, 0.75)' // индиго
    } else if (tagLower.includes('delete')) {
      return 'rgba(239, 68, 68, 0.75)' // красный
    } else if (tagLower.includes('add')) {
      return 'rgba(59, 130, 246, 0.75)' // синий
    }
    return 'rgba(255, 255, 255, 0.75)' // по умолчанию
  }

  // Функция для преобразования команды в тег
  const commandToTag = (command: string): string | null => {
    const cmd = command.toLowerCase().trim()
    if (cmd === '/add' || cmd === 'add') return '#add'
    if (cmd === '/s' || cmd === 's') return '#hr_screening'
    if (cmd === '/t' || cmd === 't') return '#tech_screening'
    if (cmd === '/in' || cmd === 'in') return '#interview'
    if (cmd === '/del' || cmd === 'del') return '#delete'
    return null
  }

  // Обработка ввода команды в textarea
  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    
    // Проверяем, есть ли команда в тексте
    const commandPattern = /\/(add|s|t|in|del)(\s|$)/g
    const matches = value.match(commandPattern)
    
    if (matches && matches.length > 0) {
      // Берем последнюю найденную команду
      const lastCommand = matches[matches.length - 1].trim()
      const tag = commandToTag(lastCommand)
      
      if (tag) {
        setCurrentCommand(tag)
        // Удаляем все команды из текста
        const cleanedValue = value.replace(commandPattern, '').trim()
        setMessage(cleanedValue)
        
        // Если команда /del, автоматически отправляем сообщение
        if (tag === '#delete') {
          // Небольшая задержка для обновления состояния перед отправкой
          setTimeout(() => {
            const now = new Date()
            const timestamp = `${now.getDate().toString().padStart(2, '0')}.${(now.getMonth() + 1).toString().padStart(2, '0')}.${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
            
            // Определяем тип удаления на основе последнего сообщения пользователя
            setMessages(prev => {
              const lastUserMessage = [...prev].reverse().find(m => m.type === 'user' && m.tag !== '#delete')
              let deleteType: 'Удаление кандидата' | 'Удаление записи' | 'Удаление события' = 'Удаление события'
              
              if (lastUserMessage) {
                if (lastUserMessage.tag === '#add') {
                  deleteType = 'Удаление кандидата'
                } else if (lastUserMessage.tag === '#hr_screening') {
                  deleteType = 'Удаление записи'
                } else if (lastUserMessage.tag === '#tech_screening' || lastUserMessage.tag === '#interview') {
                  deleteType = 'Удаление события'
                }
              }
              
              const newMessage: ChatMessage = {
                id: Date.now().toString(),
                type: 'user',
                timestamp,
                tag: '#delete',
              }
              
              // Добавляем ответ сразу после сообщения удаления
              const responseTimestamp = `${now.getDate().toString().padStart(2, '0')}.${(now.getMonth() + 1).toString().padStart(2, '0')}.${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${(now.getMinutes() + 1).toString().padStart(2, '0')}`
              
              const responseMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                type: 'response',
                timestamp: responseTimestamp,
                tag: '#delete',
                deleteType,
                candidate: lastUserMessage?.candidate || {
                  name: 'Кандидат',
                  vacancy: 'Вакансия',
                },
                status: 'Последнее действие отменено',
              }
              
              return [...prev, newMessage, responseMessage]
            })
            setCurrentCommand(null)
            setMessage('')
          }, 0)
        }
        return
      }
    }
    
    // Если команды нет, но была установлена ранее и пользователь вводит текст - оставляем команду
    // Если пользователь удалил весь текст - сбрасываем команду (кроме #add при наличии файлов)
    if (value.trim() === '' && currentCommand !== '#add') {
      if (attachedFiles.length === 0) {
        setCurrentCommand(null)
      }
    } else if (value.trim() !== '' && !value.match(commandPattern)) {
      // Если есть текст без команд, но команда была установлена - оставляем команду
    }
    
    setMessage(value)
  }

  // Автоматическое изменение высоты textarea
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      // Сбрасываем высоту для правильного расчета
      textarea.style.height = 'auto'
      // Устанавливаем высоту на основе содержимого
      const scrollHeight = textarea.scrollHeight
      const lineHeight = 20 // Примерная высота строки
      const minHeight = 40
      const maxHeight = 120
      
      // Вычисляем количество строк
      const lines = Math.ceil(scrollHeight / lineHeight)
      const newHeight = Math.min(Math.max(minHeight, lines * lineHeight), maxHeight)
      
      textarea.style.height = `${newHeight}px`
    }
  }, [message])

  const scrollToBottom = useCallback(() => {
    const el = messagesContainerRef.current
    if (el) {
      el.scrollTop = el.scrollHeight
      setIsAtBottom(true)
    }
  }, [])

  const handleMessagesScroll = useCallback(() => {
    const el = messagesContainerRef.current
    if (!el) return
    const threshold = 80
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < threshold
    setIsAtBottom(atBottom)
  }, [])

  // Прокрутка вниз при смене сообщений или при монтировании
  useEffect(() => {
    const el = messagesContainerRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
    setIsAtBottom(true)
    requestAnimationFrame(() => {
      if (el) el.scrollTop = el.scrollHeight
    })
  }, [messages])

  const visibleMessages = messages.filter(m => !hiddenMessages.has(m.id))
  const showScrollToBottom = !isAtBottom && visibleMessages.length > 0

  return (
    <Box className={styles.chatContainer}>
      {/* Заголовок чата */}
      <Flex
        align="center"
        justify="between"
        className={styles.chatHeader}
      >
        <Text size="4" weight="bold" style={{ color: '#ffffff' }}>
          HR-помощник #38
        </Text>
      </Flex>

      {/* Сообщения */}
      <Box className={styles.messagesWrapper}>
        <Box ref={messagesContainerRef} className={styles.messagesContainer} onScroll={handleMessagesScroll}>
            {visibleMessages.map((msg) => (
              <Flex
                key={msg.id}
                className={`${styles.messageWrapper} ${msg.type === 'user' ? styles.messageUser : styles.messageAssistant}`}
                align="end"
                gap="3"
              >
                {msg.type === 'user' ? (
                  <>
                    <Flex 
                      direction="column" 
                      gap="0" 
                      className={styles.userMessageContainer}
                    >
                      {(msg.url || msg.file || msg.tag === '#delete') && (
                        <Box className={`${styles.messageBubble} ${styles.messageBubbleUser}`}>
                          <Flex direction="column" gap="0">
                            {msg.file && (
                              <Text size="2" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                                📄 {msg.file.name}
                              </Text>
                            )}
                            {msg.url && (
                              <Text size="2" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                                <a href={msg.url} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>
                                  {shortenUrl(msg.url)}
                                </a>
                              </Text>
                            )}
                            {msg.text && (
                              <Text size="2" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                                {msg.text}
                              </Text>
                            )}
                            {msg.tag === '#delete' && !msg.url && !msg.file && !msg.text && (
                              <Flex direction="column" gap="2">
                                <Text size="2" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                                  Отменить последнее действие?
                                </Text>
                                <Flex gap="2" justify="start">
                                  <Button 
                                    size="1" 
                                    variant="soft"
                                    onClick={handleDeleteConfirm}
                                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', color: '#ffffff', border: '1px solid rgba(255, 255, 255, 0.3)' }}
                                  >
                                    Да
                                  </Button>
                                  <Button 
                                    size="1" 
                                    variant="solid"
                                    onClick={(e) => {
                                      e.preventDefault()
                                      handleDeleteCancel(msg.id)
                                    }}
                                    style={{ backgroundColor: '#ffffff', color: 'var(--accent-9)', border: '1px solid rgba(255, 255, 255, 0.3)' }}
                                  >
                                    Нет
                                  </Button>
                                </Flex>
                              </Flex>
                            )}
                          </Flex>
                        </Box>
                      )}
                      
                      {msg.tag && (
                        <Box className={styles.tagContainer}>
                          <Box 
                            className={styles.tag}
                            style={{ backgroundColor: getTagColor(msg.tag) }}
                          >
                            <Text size="1" style={{ fontSize: '10px', lineHeight: 1 }}>{msg.tag}</Text>
                          </Box>
                        </Box>
                      )}

                      {/* Дата и время */}
                      <Text size="1" className={styles.messageTimestamp}>
                        {msg.timestamp}
                      </Text>
                    </Flex>

                    <Box className={styles.avatarUser}>
                      <PersonIcon width={20} height={20} />
                    </Box>
                  </>
                ) : (
                  <>
                    <Box className={styles.avatarAssistant}>
                      <Box className={styles.avatarIcon}>🤖</Box>
                    </Box>

                    <Flex 
                      direction="column" 
                      gap="0" 
                      className={styles.assistantMessageContainer}
                    >
                      {/* Для interview и tech_screening - формат Инвайт */}
                      {(msg.type === 'invite' || (msg.type === 'response' && (msg.tag === '#interview' || msg.tag === '#tech_screening'))) && (
                        <Box className={styles.inviteMessage}>
                          {msg.candidate && (
                            <Box className={styles.candidateInfo} style={{ padding: '16px' }}>
                              <Flex align="center" gap="2" mb="2">
                                <CalendarIcon width={16} height={16} />
                                <Text size="2" weight="bold">
                                  {msg.tag === '#tech_screening' ? 'Tech-скрининг' : 'Инвайт'}
                                </Text>
                              </Flex>
                              
                              <Flex gap="2" align="start" className={styles.tableWithButtons}>
                                <Table.Root>
                                  <Table.Body>
                                    <Table.Row>
                                      <Table.Cell>
                                        <Text size="2" weight="bold">Кандидат:</Text>
                                      </Table.Cell>
                                      <Table.Cell>
                                        <Text size="2">{msg.candidate.name}</Text>
                                      </Table.Cell>
                                    </Table.Row>
                                    <Table.Row>
                                      <Table.Cell>
                                        <Text size="2" weight="bold">Вакансия:</Text>
                                      </Table.Cell>
                                      <Table.Cell>
                                        <Text size="2">{msg.candidate.vacancy}</Text>
                                      </Table.Cell>
                                    </Table.Row>
                                    
                                    {msg.candidate.scorecardUrl && (
                                      <Table.Row>
                                        <Table.Cell>
                                          <Text size="2" weight="bold">Scorecard:</Text>
                                        </Table.Cell>
                                        <Table.Cell>
                                          <a 
                                            href={msg.candidate.scorecardUrl} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            style={{ color: '#10b981', textDecoration: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px' }}
                                          >
                                            Открыть
                                            <OpenInNewWindowIcon width={12} height={12} style={{ display: 'inline-block', verticalAlign: 'middle' }} />
                                          </a>
                                        </Table.Cell>
                                      </Table.Row>
                                    )}
                                    
                                    {msg.tag === '#interview' && msg.candidate.format && (
                                      <Table.Row>
                                        <Table.Cell>
                                          <Text size="2" weight="bold">Формат:</Text>
                                        </Table.Cell>
                                        <Table.Cell>
                                          <Text size="2">{msg.candidate.format}</Text>
                                        </Table.Cell>
                                      </Table.Row>
                                    )}
                                    
                                    {msg.candidate.meetUrl && (
                                      <Table.Row>
                                        <Table.Cell>
                                          <Text size="2" weight="bold">Google Meet:</Text>
                                        </Table.Cell>
                                        <Table.Cell>
                                          <a 
                                            href={msg.candidate.meetUrl} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            style={{ color: '#10b981', textDecoration: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px' }}
                                          >
                                            Присоединиться
                                            <OpenInNewWindowIcon width={12} height={12} style={{ display: 'inline-block', verticalAlign: 'middle' }} />
                                          </a>
                                        </Table.Cell>
                                      </Table.Row>
                                    )}
                                    
                                    {msg.candidate.interviewDate && (
                                      <Table.Row>
                                        <Table.Cell>
                                          <Text size="2" weight="bold">Дата интервью:</Text>
                                        </Table.Cell>
                                        <Table.Cell>
                                          <Text size="2">{msg.candidate.interviewDate}</Text>
                                        </Table.Cell>
                                      </Table.Row>
                                    )}
                                  </Table.Body>
                                </Table.Root>
                                
                                <Flex gap="1" className={styles.actionButtons}>
                                  <Button size="1" variant="soft" style={{ backgroundColor: '#3b82f6', color: '#ffffff', width: '32px', height: '32px', padding: 0, minWidth: '32px' }}>
                                    <OpenInNewWindowIcon width={14} height={14} />
                                  </Button>
                                  <Button size="1" variant="soft" style={{ backgroundColor: '#10b981', color: '#ffffff', width: '32px', height: '32px', padding: 0, minWidth: '32px' }}>
                                    <EyeOpenIcon width={14} height={14} />
                                  </Button>
                                  <Button size="1" variant="soft" style={{ backgroundColor: '#d97706', color: '#ffffff', width: '32px', height: '32px', padding: 0, minWidth: '32px' }}>
                                    <ClipboardIcon width={14} height={14} />
                                  </Button>
                                </Flex>
                              </Flex>
                              
                              {msg.tag === '#interview' && msg.candidate.participants && msg.candidate.participants.length > 0 && (
                                <Box mt="2">
                                  <ParticipantsList participants={msg.candidate.participants} />
                                </Box>
                              )}

                              {msg.status && (
                                <Flex align="center" gap="2" className={styles.statusBar} mt="2">
                                  <CheckIcon width={14} height={14} style={{ color: '#10b981' }} />
                                  <Text size="2" style={{ color: '#10b981' }}>
                                    {msg.status}
                                  </Text>
                                </Flex>
                              )}
                            </Box>
                          )}
                        </Box>
                      )}

                      {/* Для hr_screening, delete, add - формат HR-скрининг */}
                      {msg.type === 'response' && (msg.tag === '#hr_screening' || msg.tag === '#delete' || msg.tag === '#add') && (
                        <Box className={styles.screeningMessage}>
                          {msg.candidate && (
                            <Box className={styles.candidateInfo} style={{ padding: '16px' }}>
                              <Flex align="center" gap="2" mb="2">
                                <ClipboardIcon width={16} height={16} />
                                <Text size="2" weight="bold">
                                  {msg.tag === '#hr_screening' ? 'HR-скрининг' : msg.tag === '#delete' ? (msg.deleteType || 'Удаление') : 'Добавление'}
                                </Text>
                              </Flex>
                              
                              <Flex gap="2" align="start" className={styles.tableWithButtons}>
                                <Table.Root>
                                  <Table.Body>
                                    <Table.Row>
                                      <Table.Cell>
                                        <Text size="2" weight="bold">Кандидат:</Text>
                                      </Table.Cell>
                                      <Table.Cell>
                                        <Text size="2">{msg.candidate.name}</Text>
                                      </Table.Cell>
                                    </Table.Row>
                                    <Table.Row>
                                      <Table.Cell>
                                        <Text size="2" weight="bold">Вакансия:</Text>
                                      </Table.Cell>
                                      <Table.Cell>
                                        <Text size="2">{msg.candidate.vacancy}</Text>
                                      </Table.Cell>
                                    </Table.Row>
                                    {msg.tag === '#add' && (
                                      <Table.Row>
                                        <Table.Cell>
                                          <Text size="2" weight="bold">Источник:</Text>
                                        </Table.Cell>
                                        <Table.Cell>
                                          <Text size="2">{msg.candidate.source || 'Прочий'}</Text>
                                        </Table.Cell>
                                      </Table.Row>
                                    )}
                                  {msg.tag === '#delete' && msg.deleteType === 'Удаление записи' && (
                                    <Table.Row>
                                      <Table.Cell>
                                        <Text size="2" weight="bold">Удалено:</Text>
                                      </Table.Cell>
                                      <Table.Cell>
                                        <Text size="2">HR-скрининг у {msg.candidate.name}</Text>
                                      </Table.Cell>
                                    </Table.Row>
                                  )}
                                  {msg.tag === '#delete' && msg.deleteType === 'Удаление кандидата' && (
                                    <Table.Row>
                                      <Table.Cell>
                                        <Text size="2" weight="bold">Удалено:</Text>
                                      </Table.Cell>
                                      <Table.Cell>
                                        <Text size="2">Кандидат {msg.candidate.name}</Text>
                                      </Table.Cell>
                                    </Table.Row>
                                  )}
                                  {msg.tag === '#delete' && msg.deleteType === 'Удаление события' && (
                                    <>
                                      <Table.Row>
                                        <Table.Cell>
                                          <Text size="2" weight="bold">Удалено:</Text>
                                        </Table.Cell>
                                        <Table.Cell>
                                          <Text size="2">Событие у {msg.candidate.name}</Text>
                                        </Table.Cell>
                                      </Table.Row>
                                      {msg.deletedEventInfo?.eventDate && (
                                        <Table.Row>
                                          <Table.Cell>
                                            <Text size="2" weight="bold">Дата события:</Text>
                                          </Table.Cell>
                                          <Table.Cell>
                                            <Text size="2">{msg.deletedEventInfo.eventDate}</Text>
                                          </Table.Cell>
                                        </Table.Row>
                                      )}
                                      {msg.deletedEventInfo?.documentsDeleted !== undefined && (
                                        <Table.Row>
                                          <Table.Cell>
                                            <Text size="2" weight="bold">Документы:</Text>
                                          </Table.Cell>
                                          <Table.Cell>
                                            <Text size="2">{msg.deletedEventInfo.documentsDeleted ? 'Удалены' : 'Не удалены'}</Text>
                                          </Table.Cell>
                                        </Table.Row>
                                      )}
                                      {msg.deletedEventInfo?.recordsDeleted !== undefined && (
                                        <Table.Row>
                                          <Table.Cell>
                                            <Text size="2" weight="bold">Записи в БД:</Text>
                                          </Table.Cell>
                                          <Table.Cell>
                                            <Text size="2">{msg.deletedEventInfo.recordsDeleted ? 'Удалены' : 'Не удалены'}</Text>
                                          </Table.Cell>
                                        </Table.Row>
                                      )}
                                    </>
                                  )}
                                  {msg.tag !== '#add' && msg.tag !== '#delete' && msg.candidate.salary && (
                                    <Table.Row>
                                      <Table.Cell>
                                        <Text size="2" weight="bold">Зарплата:</Text>
                                      </Table.Cell>
                                      <Table.Cell>
                                        <Text size="2">{msg.candidate.salary}</Text>
                                      </Table.Cell>
                                    </Table.Row>
                                  )}
                                  {msg.tag !== '#add' && msg.tag !== '#delete' && msg.candidate.level && (
                                    <Table.Row>
                                      <Table.Cell>
                                        <Text size="2" weight="bold">Уровень:</Text>
                                      </Table.Cell>
                                      <Table.Cell>
                                        <Box className={styles.levelTag}>
                                          <Text size="1" style={{ color: '#ffffff', fontSize: '11px' }}>
                                            {msg.candidate.level}
                                          </Text>
                                        </Box>
                                      </Table.Cell>
                                    </Table.Row>
                                  )}
                                  </Table.Body>
                                </Table.Root>
                                
                                {msg.tag !== '#delete' || msg.deleteType !== 'Удаление кандидата' ? (
                                  <Flex gap="1" className={styles.actionButtons}>
                                    <Button size="1" variant="soft" style={{ backgroundColor: '#3b82f6', color: '#ffffff', width: '32px', height: '32px', padding: 0, minWidth: '32px' }}>
                                      <OpenInNewWindowIcon width={14} height={14} />
                                    </Button>
                                    {msg.tag === '#add' && (
                                      <Button 
                                        size="1" 
                                        variant="soft" 
                                        style={{ backgroundColor: '#6366f1', color: '#ffffff', width: '32px', height: '32px', padding: 0, minWidth: '32px' }}
                                        onClick={() => {
                                          const url = window.location.href
                                          navigator.clipboard.writeText(url).catch(() => {})
                                        }}
                                        title="Копировать ссылку"
                                      >
                                        <Link2Icon width={14} height={14} />
                                      </Button>
                                    )}
                                    {msg.tag === '#hr_screening' && msg.rejectionReason && (
                                      <Button 
                                        size="1" 
                                        variant="soft" 
                                        style={{ backgroundColor: 'var(--accent-9, #ef4444)', color: '#ffffff', width: '32px', height: '32px', padding: 0, minWidth: '32px' }}
                                        onClick={() => {
                                          const url = window.location.href
                                          navigator.clipboard.writeText(url).catch(() => {})
                                        }}
                                        title="Копировать ссылку"
                                      >
                                        <Cross2Icon width={14} height={14} />
                                      </Button>
                                    )}
                                  </Flex>
                                ) : null}
                              </Flex>

                              {msg.status && (
                                <Flex align="center" gap="2" className={styles.statusBar} mt="2" style={{ 
                                  backgroundColor: msg.rejectionReason ? '#fee2e2' : '#d1fae5',
                                  border: msg.rejectionReason ? '1px solid #fca5a5' : undefined
                                }}>
                                  {msg.rejectionReason ? (
                                    <Cross2Icon width={14} height={14} style={{ color: '#dc2626' }} />
                                  ) : (
                                    <CheckIcon width={14} height={14} style={{ color: '#10b981' }} />
                                  )}
                                  <Text size="2" style={{ color: msg.rejectionReason ? '#dc2626' : '#10b981' }}>
                                    {msg.status}
                                  </Text>
                                </Flex>
                              )}

                              {msg.tag === '#hr_screening' && !msg.rejectionReason && !rejectedCandidates.has(msg.id) && msg.showRejectionPrompt !== false && (
                                <Box className={styles.rejectionPrompt} mt="2">
                                  <Flex align="center" gap="2" mb="2">
                                    <ExclamationTriangleIcon width={18} height={18} style={{ color: '#f97316', flexShrink: 0 }} />
                                    <Text size="2" weight="bold" style={{ color: '#f97316' }}>
                                      Отказать кандидату?
                                    </Text>
                                  </Flex>
                                  <Flex gap="2" justify="start">
                                    <Button 
                                      size="1" 
                                      variant="soft"
                                      onClick={() => {
                                        const reason = prompt('Укажите причину отказа:')
                                        if (reason) {
                                          setRejectedCandidates(prev => new Set(prev).add(msg.id))
                                          setRejectionReasons(prev => new Map(prev).set(msg.id, reason))
                                          setMessages(prev => prev.map(m => 
                                            m.id === msg.id 
                                              ? { ...m, rejectionReason: reason, status: `Данные сохранены. Статус - Отказ: ${reason}` }
                                              : m
                                          ))
                                        }
                                      }}
                                      style={{ backgroundColor: '#ef4444', color: '#ffffff', border: 'none' }}
                                    >
                                      <Cross2Icon width={12} height={12} />
                                      <Text size="1" style={{ color: '#ffffff' }}>Да</Text>
                                    </Button>
                                    <Button 
                                      size="1" 
                                      variant="solid"
                                      onClick={() => {
                                        setRejectedCandidates(prev => new Set(prev).add(msg.id))
                                      }}
                                      style={{ backgroundColor: '#10b981', color: '#ffffff', border: 'none' }}
                                    >
                                      <CheckIcon width={12} height={12} />
                                      <Text size="1" style={{ color: '#ffffff' }}>Нет</Text>
                                    </Button>
                                  </Flex>
                                </Box>
                              )}
                            </Box>
                          )}
                        </Box>
                      )}
                      
                      {/* Дата и время для всех сообщений ассистента */}
                      <Text size="1" className={styles.messageTimestamp}>
                        {msg.timestamp}
                      </Text>
                    </Flex>
                  </>
                )}
              </Flex>
            ))}
        </Box>
        {showScrollToBottom && (
          <Button
            size="2"
            variant="soft"
            color="gray"
            radius="full"
            title="К последнему сообщению"
            className={styles.scrollToBottomBtn}
            onClick={scrollToBottom}
          >
            <ChevronDownIcon width={16} height={16} />
          </Button>
        )}
      </Box>

      {/* Поле ввода сообщения */}
      <Flex direction="column" className={styles.inputContainer}>
            {attachedFiles.length > 0 && (
              <Box className={styles.attachedFilesContainer}>
                <Flex gap="2" className={styles.attachedFilesList}>
                  {attachedFiles.map((attachedFile) => (
                    <Box key={attachedFile.id} className={styles.fileTag}>
                      <Text size="1" className={styles.fileName} title={attachedFile.file.name}>
                        {attachedFile.file.name.length > 20 
                          ? attachedFile.file.name.substring(0, 20) + '...' 
                          : attachedFile.file.name}
                      </Text>
                      <Text size="1" className={styles.fileSize}>
                        {formatFileSize(attachedFile.file.size)}
                      </Text>
                      <Button
                        size="1"
                        variant="ghost"
                        className={styles.removeFileButton}
                        onClick={() => handleRemoveFile(attachedFile.id)}
                      >
                        ×
                      </Button>
                    </Box>
                  ))}
                </Flex>
              </Box>
            )}
            <Flex gap="2" align="center">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                multiple
                style={{ display: 'none' }}
              />
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
              <Box style={{ position: 'relative', flex: 1 }}>
                {currentCommand && (
                  <Box className={styles.commandTag}>
                    <Box 
                      className={styles.commandTagInner}
                      style={{ backgroundColor: getTagColor(currentCommand) }}
                    >
                      <Text size="1" style={{ fontSize: '10px', lineHeight: 1 }}>
                        {currentCommand}
                      </Text>
                    </Box>
                  </Box>
                )}
                <TextArea
                  ref={textareaRef}
                  value={message}
                  onChange={handleMessageChange}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSend()
                    }
                  }}
                  placeholder="Введите сообщение..."
                  style={{ 
                    flex: 1,
                    resize: 'none',
                    minHeight: '40px',
                    maxHeight: '120px',
                    overflowY: 'auto'
                  }}
                  rows={1}
                />
              </Box>
              <Button
                onClick={handleSend}
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
  )
}
