'use client'

import { Box, Flex, Text } from "@radix-ui/themes"
import * as Tooltip from '@radix-ui/react-tooltip'
import { PersonIcon, PaperPlaneIcon } from "@radix-ui/react-icons"
import { Message } from "@/app/aichat/page"
import { useState } from "react"
import FormattedText from "./FormattedText"
import styles from './ChatMessages.module.css'

interface ChatMessagesProps {
  messages: Message[]
}

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

function FileListTooltip({ files }: { files: File[] }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Tooltip.Root open={isOpen} onOpenChange={setIsOpen}>
      <Tooltip.Trigger asChild>
        <Flex 
          align="center" 
          gap="2" 
          className={styles.multipleFilesInfo}
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
        >
          <PaperPlaneIcon width={14} height={14} />
          <Text size="1" style={{ color: 'var(--gray-11)' }}>
            Отправлено {files.length} файлов
          </Text>
        </Flex>
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content 
          className={styles.filesTooltip}
          side="top"
          align="end"
          sideOffset={8}
          alignOffset={-10}
        >
          <Box className={styles.filesTooltipList}>
            {files.map((file, index) => (
              <Flex key={index} align="center" gap="2" className={styles.filesTooltipItem}>
                <Text size="1" style={{ flex: 1, minWidth: 0 }}>
                  {index + 1}. {file.name}
                </Text>
                <Text size="1" style={{ fontStyle: 'italic', color: 'var(--gray-11)', whiteSpace: 'nowrap', flexShrink: 0 }}>
                  {formatFileSize(file.size)}
                </Text>
              </Flex>
            ))}
          </Box>
          <Tooltip.Arrow className={styles.tooltipArrow} />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  )
}

export default function ChatMessages({ messages }: ChatMessagesProps) {
  if (messages.length === 0) {
    return (
      <Box className={styles.emptyState}>
        <Text size="3" style={{ color: 'var(--gray-11)' }}>
          Начните новый диалог, отправив сообщение
        </Text>
      </Box>
    )
  }

  return (
    <Box className={styles.messagesContainer}>
      {messages.map((message) => (
        <Flex
          key={message.id}
          className={`${styles.messageWrapper} ${message.role === 'user' ? styles.messageUser : styles.messageAssistant}`}
          align="end"
          gap="3"
        >
          {message.role === 'assistant' && (
            <Box className={styles.avatarAssistant}>
              <Box className={styles.avatarIcon}>G</Box>
            </Box>
          )}

          <Flex 
            direction="column" 
            gap="0" 
            className={message.role === 'user' ? styles.userMessageContainer : styles.assistantMessageContainer}
          >
            {message.content && (
              <Box className={`${styles.messageBubble} ${message.role === 'user' ? styles.messageBubbleUser : styles.messageBubbleAssistant}`}>
                {message.role === 'assistant' ? (
                  <FormattedText content={message.content} />
                ) : (
                  <Text size="2" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                    {message.content}
                  </Text>
                )}
              </Box>
            )}

            {message.files && message.files.length > 0 && (
              <Box className={styles.filesInfo}>
                {message.files.length === 1 ? (
                  <Flex align="center" gap="2" className={styles.singleFileInfo}>
                    <PaperPlaneIcon width={14} height={14} />
                    <Text size="1" style={{ color: 'var(--gray-11)' }}>
                      {message.files[0].name} ({formatFileSize(message.files[0].size)})
                    </Text>
                  </Flex>
                ) : (
                  <FileListTooltip files={message.files} />
                )}
              </Box>
            )}

            {/* Дата и время */}
            <Text size="1" className={styles.messageTimestamp}>
              {message.timestamp}
            </Text>
          </Flex>

          {message.role === 'user' && (
            <Box className={styles.avatarUser}>
              <PersonIcon width={20} height={20} />
            </Box>
          )}
        </Flex>
      ))}
    </Box>
  )
}
