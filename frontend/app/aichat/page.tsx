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

export interface Chat {
  id: string
  title: string
  createdAt: string
  lastMessage?: string
}

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  files?: File[]
}

export default function AIChatPage() {
  const toast = useToast()

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

  const [selectedChatId, setSelectedChatId] = useState<string>('1')
  const [messages, setMessages] = useState<Record<string, Message[]>>({
    '1': [
      {
        id: '1',
        role: 'user',
        content: 'Расскажи сказку про колобка',
        timestamp: '10.10.2025 23:57'
      },
      {
        id: '2',
        role: 'assistant',
        content: `Жил-был старик со старухой. И вот однажды говорит старик:

- Испеки-ка мне, старуха, колобок.

Старуха взяла муки горсти две, замесила тесто на сметане, скатала колобок, изжарила его в масле и положила на окно остудиться.

Лежал-лежал колобок на окне, надоело ему, он и покатился – с окна на лавку, с лавки на пол, по полу к двери, прыг через порог – да и покатился по дорожке в лес.

Катится колобок по дороге, а навстречу ему заяц:

- Колобок, колобок, я тебя съем!

- Не ешь меня, косой! Я тебе песенку спою!

И запел колобок:

- Я колобок, колобок! Я от бабушки ушел, Я от дедушки ушел, От тебя, зайца, подавно уйду!

И покатился колобок дальше.

Катится колобок, а навстречу ему волк:`,
        timestamp: '10.10.2025 23:58'
      }
    ]
  })

  const selectedChat = chats.find(chat => chat.id === selectedChatId)
  const currentMessages = messages[selectedChatId] || []
  const messagesScrollRef = useRef<HTMLDivElement>(null)
  const [isAtBottom, setIsAtBottom] = useState(true)

  const scrollToBottom = useCallback(() => {
    const el = messagesScrollRef.current
    if (el) {
      el.scrollTop = el.scrollHeight
      setIsAtBottom(true)
    }
  }, [])

  const handleMessagesScroll = useCallback(() => {
    const el = messagesScrollRef.current
    if (!el) return
    const threshold = 80
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < threshold
    setIsAtBottom(atBottom)
  }, [])

  // Прокрутка чата до конца при смене сообщений, чата или при монтировании
  useEffect(() => {
    const el = messagesScrollRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
    setIsAtBottom(true)
    requestAnimationFrame(() => { el.scrollTop = el.scrollHeight })
  }, [currentMessages, selectedChatId])

  const showScrollToBottom = !isAtBottom && currentMessages.length > 0

  const handleNewChat = () => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: `Чат ${new Date().toLocaleDateString('ru-RU')} ${new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`,
      createdAt: new Date().toLocaleString('ru-RU', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
    }
    setChats([newChat, ...chats])
    setSelectedChatId(newChat.id)
    setMessages({ ...messages, [newChat.id]: [] })
  }

  const handleSendMessage = (content: string, modelId?: string, files?: File[]) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: content || '',
      timestamp: new Date().toLocaleString('ru-RU', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      files: files && files.length > 0 ? files : undefined
    }

    setMessages({
      ...messages,
      [selectedChatId]: [...(messages[selectedChatId] || []), newMessage]
    })

    // Здесь будет логика отправки на сервер и получения ответа от AI
    // modelId содержит ID выбранной модели
    // files содержит массив прикрепленных файлов
    // Пока что просто добавляем сообщение пользователя
  }

  const handleFileAttach = (file: File) => {
    // Файлы просто прикрепляются к сообщению, не отправляются сразу
    // Логика обработки будет при отправке сообщения
    console.log('Прикреплен файл:', file.name, file.type, file.size)
  }

  const handleTitleChange = (newTitle: string) => {
    setChats(chats.map(chat => 
      chat.id === selectedChatId 
        ? { ...chat, title: newTitle }
        : chat
    ))
  }

  const performDeleteChat = (chatId: string) => {
    const willCreateNewRef = { current: false }
    setChats(prev => {
      const filtered = prev.filter(c => c.id !== chatId)
      if (filtered.length === 0) {
        willCreateNewRef.current = true
        const newChat: Chat = {
          id: Date.now().toString(),
          title: `Чат ${new Date().toLocaleDateString('ru-RU')} ${new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`,
          createdAt: new Date().toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        }
        setSelectedChatId(newChat.id)
        setMessages(prevM => { const n = { ...prevM }; delete n[chatId]; n[newChat.id] = []; return n })
        return [newChat]
      }
      if (chatId === selectedChatId) {
        setSelectedChatId(filtered[0].id)
      }
      return filtered
    })
    if (!willCreateNewRef.current) {
      setMessages(prev => { const n = { ...prev }; delete n[chatId]; return n })
    }
  }

  const showDeleteConfirm = (chatId: string) => {
    toast.showWarning('Удалить чат?', 'Вы уверены, что хотите удалить этот чат?', {
      duration: 12000,
      actions: [
        { label: 'Удалить', onClick: () => performDeleteChat(chatId), variant: 'solid', color: 'red' },
        { label: 'Отмена', onClick: () => {}, variant: 'soft', color: 'gray' },
      ],
    })
  }

  const handleDeleteChat = () => showDeleteConfirm(selectedChatId)

  const handleDeleteChatFromHistory = (chatId: string) => showDeleteConfirm(chatId)

  return (
    <AppLayout pageTitle="AI Chat">
      <Box className={styles.aichatContainer}>
        <Flex gap="4" className={styles.mainContent}>
          {/* Левая боковая панель с историей чатов */}
          <Box className={styles.sidebarColumn}>
            <ChatHistory
              chats={chats}
              selectedChatId={selectedChatId}
              onChatSelect={setSelectedChatId}
              onNewChat={handleNewChat}
              onChatDelete={handleDeleteChatFromHistory}
            />
          </Box>

          {/* Правая основная область с чатом */}
          <Box className={styles.chatColumn}>
            {selectedChat && (
              <Box className={styles.chatCard}>
                <ChatHeader
                  title={selectedChat.title}
                  createdAt={selectedChat.createdAt}
                  onTitleChange={handleTitleChange}
                  onDelete={handleDeleteChat}
                />

                <Box className={styles.messagesWrapper}>
                  <Box
                    ref={messagesScrollRef}
                    className={styles.messagesContainer}
                    onScroll={handleMessagesScroll}
                  >
                    <ChatMessages messages={currentMessages} />
                  </Box>
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
