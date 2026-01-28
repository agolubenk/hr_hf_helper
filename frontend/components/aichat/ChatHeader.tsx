'use client'

import { Box, Flex, TextField, Text } from "@radix-ui/themes"
import { CheckIcon, Cross2Icon, TrashIcon, Pencil1Icon } from "@radix-ui/react-icons"
import { useState, useRef, useEffect } from "react"
import styles from './ChatHeader.module.css'

interface ChatHeaderProps {
  title: string
  createdAt?: string
  onTitleChange: (newTitle: string) => void
  onDelete: () => void
}

export default function ChatHeader({ title, onTitleChange, onDelete }: ChatHeaderProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(title)
  const [isHovered, setIsHovered] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  useEffect(() => {
    setEditValue(title)
  }, [title])

  const handleStartEdit = () => {
    setIsEditing(true)
  }

  const handleSave = () => {
    if (editValue.trim()) {
      onTitleChange(editValue.trim())
    } else {
      setEditValue(title)
    }
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditValue(title)
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave()
    } else if (e.key === 'Escape') {
      handleCancel()
    }
  }

  return (
    <Box 
      className={styles.chatHeader}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Flex justify="between" align="center" gap="4">
        {/* Левая часть: редактирование названия */}
        <Flex align="center" gap="2" style={{ flex: 1 }}>
          {isEditing ? (
            <Flex align="center" gap="2" style={{ flex: 1 }}>
              <TextField.Root
                ref={inputRef}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={handleKeyDown}
                className={styles.titleInput}
                style={{
                  flex: 1,
                }}
              />
              <Box
                className={styles.saveButton}
                onClick={handleSave}
                title="Сохранить"
              >
                <CheckIcon width={14} height={14} />
              </Box>
              <Box
                className={styles.cancelButton}
                onClick={handleCancel}
                title="Отменить"
              >
                <Cross2Icon width={14} height={14} />
              </Box>
            </Flex>
          ) : (
            <Flex align="center" gap="2" className={styles.titleContainer}>
              <Box
                className={styles.chatTitle}
                onClick={handleStartEdit}
                title="Нажмите для редактирования"
              >
                {title}
              </Box>
              {isHovered && (
                <Box
                  className={styles.editIcon}
                  onClick={handleStartEdit}
                  title="Редактировать название"
                >
                  <Pencil1Icon width={16} height={16} />
                </Box>
              )}
            </Flex>
          )}
        </Flex>

        {/* Правая часть: кнопка удаления */}
        {isHovered && !isEditing && (
          <Box
            className={styles.deleteButton}
            onClick={onDelete}
            title="Удалить чат"
          >
            <TrashIcon width={16} height={16} />
            <Text size="2" className={styles.deleteButtonText}>Удалить чат</Text>
          </Box>
        )}
      </Flex>
    </Box>
  )
}
