'use client'

import { Box, Text, Flex, TextArea, Button } from "@radix-ui/themes"
import { ChevronDownIcon, PaperPlaneIcon, OpenInNewWindowIcon, EyeOpenIcon, CalendarIcon, CheckIcon, PersonIcon, Cross2Icon } from "@radix-ui/react-icons"
import { useState, useRef, useEffect } from "react"
import styles from './WorkflowChat.module.css'

interface ChatMessage {
  id: string
  type: 'user' | 'invite'
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
    scorecardUrl?: string
    meetUrl?: string
    interviewDate?: string
  }
  status?: string
}

interface AttachedFile {
  id: string
  file: File
}

export default function WorkflowChat() {
  const [message, setMessage] = useState('')
  const [chatExpanded, setChatExpanded] = useState(true)
  const [hiddenMessages, setHiddenMessages] = useState<Set<string>>(new Set())
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([])
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Моковые данные сообщений
  const messages: ChatMessage[] = [
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
      id: '2',
      type: 'user',
      url: 'https://huntflow.ru/my/softnetix#/vacancy/3936868/filter/workon/id/79013654',
      timestamp: '08.01.2026 11:15',
      tag: '#hr_screening',
      text: '1) ожидаю от 1300$ на руки\n2) Готов, но было бы отлично, если бы была возможность удаленной работы или гибрид. Нахожусь в Минске\n3) Да\n4) Не понял вопроса, если связано с универом, то закончил уже(БГУИР КСиС ПОИТ), военный билет есть\n5) Военный билет есть\n6) Нет\n7) Компания столкнулась с серьезными финансовыми трудностями\n8) кратчайшие сроки после успешного собеса\n9) Наверное нет смысла перечислять мелкие библиотеки, из значимого это настройка SEO, NextJS, да на самом деле много всего, лучше вживую на собеседовании рассказать)\n10) начинающий middle',
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
      id: '4',
      type: 'user',
      url: 'https://huntflow.ru/my/softnetix#/vacancy/3936868/filter/186500/id/79014225',
      timestamp: '08.01.2026 16:45',
      tag: '#interview',
      text: 'послезавтра 15:30',
    },
    {
      id: '5',
      type: 'user',
      timestamp: '08.01.2026 17:00',
      tag: '#delete',
    },
    {
      id: '6',
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
  ]

  const handleSend = () => {
    if (message.trim() || attachedFiles.length > 0) {
      // Здесь будет логика отправки сообщения
      const files = attachedFiles.map(af => af.file)
      console.log('Отправка сообщения:', message, 'Файлы:', files)
      setMessage('')
      setAttachedFiles([])
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
    }
    // Сбрасываем значение input, чтобы можно было выбрать тот же файл снова
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleRemoveFile = (fileId: string) => {
    setAttachedFiles(attachedFiles.filter(af => af.id !== fileId))
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
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
            {messages.filter(msg => !hiddenMessages.has(msg.id)).map((msg) => (
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
                                  {msg.url}
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
                                <Flex gap="2" justify="end">
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
                  </>
                )}
              </Flex>
            ))}
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
        </>
      )}
    </Box>
  )
}
