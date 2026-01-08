'use client'

import { Box, Text, Flex, TextArea, Button } from "@radix-ui/themes"
import { ChevronDownIcon, PaperPlaneIcon, OpenInNewWindowIcon, EyeOpenIcon, CalendarIcon, CheckIcon } from "@radix-ui/react-icons"
import { useState, useRef, useEffect } from "react"
import styles from './WorkflowChat.module.css'

interface ChatMessage {
  id: string
  type: 'user' | 'invite'
  content?: string
  url?: string
  timestamp: string
  tag?: string
  candidate?: {
    name: string
    vacancy: string
    scorecardUrl?: string
    meetUrl?: string
    interviewDate?: string
  }
  status?: string
}

export default function WorkflowChat() {
  const [message, setMessage] = useState('')
  const [chatExpanded, setChatExpanded] = useState(true)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Моковые данные сообщений
  const messages: ChatMessage[] = [
    {
      id: '1',
      type: 'user',
      url: 'https://huntflow.ru/...',
      timestamp: '08.01.2026 17:47',
      tag: '#tech_screening',
    },
    {
      id: '2',
      type: 'invite',
      timestamp: '08.01.2026 17:47',
      candidate: {
        name: 'Саковский Антон',
        vacancy: 'Frontend Engineer (React)',
        scorecardUrl: '#',
        meetUrl: '#',
        interviewDate: '2026-01-12 11:15',
      },
      status: 'Инвайт отправлен и добавлен в календарь',
    },
    {
      id: '3',
      type: 'user',
      url: 'https://huntflow.ru/...',
      timestamp: 'завтра 14:15',
      tag: '#tech_screening',
    },
    {
      id: '4',
      type: 'invite',
      timestamp: '08.01.2026 18:15',
      candidate: {
        name: 'Hurynovich Yahor',
        vacancy: 'Frontend Engineer (React)',
        scorecardUrl: '#',
        meetUrl: '#',
        interviewDate: '2026-01-13 14:00',
      },
      status: 'Инвайт отправлен и добавлен в календарь',
    },
  ]

  const handleSend = () => {
    if (message.trim()) {
      // Здесь будет логика отправки сообщения
      console.log('Отправка сообщения:', message)
      setMessage('')
      // Сбрасываем высоту textarea после отправки
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
        textareaRef.current.style.height = '40px'
      }
    }
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

  return (
    <Box className={styles.chatContainer}>
      {/* Заголовок чата */}
      <Flex
        align="center"
        justify="between"
        className={styles.chatHeader}
        onClick={() => setChatExpanded(!chatExpanded)}
        style={{ cursor: 'pointer' }}
      >
        <Text size="4" weight="bold" style={{ color: '#ffffff' }}>
          HR-помощник #38
        </Text>
        <ChevronDownIcon
          width={20}
          height={20}
          style={{
            color: '#ffffff',
            transform: chatExpanded ? 'rotate(0deg)' : 'rotate(180deg)',
            transition: 'transform 0.2s ease-in-out',
          }}
        />
      </Flex>

      {chatExpanded && (
        <>
          {/* Сообщения */}
          <Box className={styles.messagesContainer}>
            {messages.map((msg) => (
              <Box key={msg.id} className={styles.messageWrapper}>
                {msg.type === 'user' ? (
                  <Flex justify="end" mb="3">
                    <Box className={styles.userMessage}>
                      {msg.url && (
                        <Text size="2" style={{ display: 'block', marginBottom: '4px' }}>
                          <a href={msg.url} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }}>
                            {msg.url}
                          </a>
                        </Text>
                      )}
                      <Flex align="center" gap="2" mt="2">
                        <Text size="1" color="gray">
                          {msg.timestamp}
                        </Text>
                        {msg.tag && (
                          <Box className={styles.tag}>
                            <Text size="1">{msg.tag}</Text>
                          </Box>
                        )}
                        <Box className={styles.avatar}>
                          <Text size="1">A</Text>
                        </Box>
                      </Flex>
                    </Box>
                  </Flex>
                ) : (
                  <Flex justify="start" mb="3">
                    <Box className={styles.inviteMessage}>
                      <Flex align="center" gap="2" className={styles.inviteHeader}>
                        <Box className={styles.botIcon}>🤖</Box>
                        <Text size="2" weight="bold" style={{ color: '#ffffff' }}>
                          Инвайт {msg.timestamp}
                        </Text>
                        <Text size="2" style={{ color: '#ffffff' }}>🏆</Text>
                      </Flex>

                      {msg.candidate && (
                        <Box className={styles.candidateInfo} style={{ padding: '16px' }}>
                          <Text size="2" style={{ display: 'block', marginBottom: '8px' }}>
                            <strong>Кандидат:</strong> {msg.candidate.name}
                          </Text>
                          <Text size="2" style={{ display: 'block', marginBottom: '8px' }}>
                            <strong>Вакансия:</strong> {msg.candidate.vacancy}
                          </Text>
                          
                          <Flex direction="column" gap="2" mb="3">
                            <Flex align="center" gap="2">
                              <Text size="2">
                                <strong>Scorecard:</strong>
                              </Text>
                              <Button size="1" variant="soft">
                                Открыть
                                <OpenInNewWindowIcon width={12} height={12} />
                              </Button>
                            </Flex>
                            
                            <Flex align="center" gap="2">
                              <Text size="2">
                                <strong>Google Meet:</strong>
                              </Text>
                              <Button size="1" variant="soft">
                                Присоединиться
                                <OpenInNewWindowIcon width={12} height={12} />
                              </Button>
                            </Flex>
                            
                            <Text size="2">
                              <strong>Дата интервью:</strong> {msg.candidate.interviewDate}
                            </Text>
                          </Flex>

                          <Flex gap="2" justify="end" mb="2">
                            <Button size="1" variant="ghost">
                              <OpenInNewWindowIcon width={14} height={14} />
                            </Button>
                            <Button size="1" variant="ghost">
                              <EyeOpenIcon width={14} height={14} />
                            </Button>
                            <Button size="1" variant="ghost">
                              <CalendarIcon width={14} height={14} />
                            </Button>
                          </Flex>

                          {msg.status && (
                            <Flex align="center" gap="2" className={styles.statusBar}>
                              <CheckIcon width={14} height={14} style={{ color: '#10b981' }} />
                              <Text size="2" style={{ color: '#10b981' }}>
                                {msg.status}
                              </Text>
                            </Flex>
                          )}
                        </Box>
                      )}
                    </Box>
                  </Flex>
                )}
              </Box>
            ))}
          </Box>

          {/* Поле ввода сообщения */}
          <Flex className={styles.inputContainer}>
            <TextArea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
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
            <Button
              onClick={handleSend}
              style={{ 
                backgroundColor: 'var(--accent-9)', 
                color: '#ffffff',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                padding: 0,
                minWidth: '40px',
                alignSelf: 'flex-start'
              }}
            >
              <PaperPlaneIcon width={16} height={16} />
            </Button>
          </Flex>
        </>
      )}
    </Box>
  )
}
