'use client'

import { Box, Flex, Text, Button } from "@radix-ui/themes"
import { ChatBubbleIcon, PlusIcon, TrashIcon } from "@radix-ui/react-icons"
import { Chat } from "@/app/aichat/page"
import { useState } from "react"
import styles from './ChatHistory.module.css'

interface ChatHistoryProps {
  chats: Chat[]
  selectedChatId: string
  onChatSelect: (chatId: string) => void
  onNewChat: () => void
  onChatDelete: (chatId: string) => void
}

export default function ChatHistory({ chats, selectedChatId, onChatSelect, onNewChat, onChatDelete }: ChatHistoryProps) {
  const [hoveredChatId, setHoveredChatId] = useState<string | null>(null)
  const [hoveredDelete, setHoveredDelete] = useState<string | null>(null)

  const handleDeleteClick = (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation()
    onChatDelete(chatId)
  }

  return (
    <Flex direction="column" height="100%" className={styles.chatHistory}>
      {/* Заголовок */}
      <Box className={styles.header}>
        <Flex align="center" gap="2">
          <Box className={styles.headerIcon}>
            <ChatBubbleIcon width={20} height={20} />
          </Box>
          <Text size="3" weight="bold" style={{ color: '#ffffff' }}>История чатов</Text>
        </Flex>
      </Box>

      {/* Список чатов */}
      <Box className={styles.chatsList} style={{ flex: 1 }}>
        {chats.map((chat) => {
          const isSelected = chat.id === selectedChatId
          const isHovered = hoveredChatId === chat.id
          const isDeleteHovered = hoveredDelete === chat.id
          return (
            <Box
              key={chat.id}
              className={`${styles.chatItem} ${isSelected ? styles.chatItemSelected : ''} ${isDeleteHovered ? styles.chatItemDeleteHovered : ''}`}
              onClick={() => onChatSelect(chat.id)}
              onMouseEnter={() => setHoveredChatId(chat.id)}
              onMouseLeave={() => {
                setHoveredChatId(null)
                setHoveredDelete(null)
              }}
            >
              <Flex justify="between" align="center" gap="2" style={{ width: '100%' }}>
                <Box style={{ flex: 1, minWidth: 0 }}>
                  <Text size="3" weight={isSelected ? "medium" : "regular"} className={styles.chatTitle}>
                    {chat.title}
                  </Text>
                  {chat.createdAt && (
                    <Text size="1" className={styles.chatDate}>
                      {chat.createdAt}
                    </Text>
                  )}
                </Box>
                {isHovered && (
                  <Box
                    className={styles.deleteIcon}
                    onClick={(e) => handleDeleteClick(e, chat.id)}
                    onMouseEnter={() => setHoveredDelete(chat.id)}
                    onMouseLeave={() => setHoveredDelete(null)}
                    title="Удалить чат"
                  >
                    <TrashIcon width={16} height={16} />
                  </Box>
                )}
              </Flex>
            </Box>
          )
        })}
      </Box>

      {/* Кнопка "Новый чат" */}
      <Box className={styles.newChatButtonContainer}>
        <Button
          className={styles.newChatButton}
          onClick={onNewChat}
          size="3"
        >
          <PlusIcon width={16} height={16} />
          Новый чат
        </Button>
      </Box>
    </Flex>
  )
}
