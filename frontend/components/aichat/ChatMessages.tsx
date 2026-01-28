/**
 * ChatMessages (components/aichat/ChatMessages.tsx) - Компонент отображения сообщений чата
 * 
 * Назначение:
 * - Отображение списка сообщений в AI чате
 * - Различение сообщений пользователя и ассистента
 * - Отображение прикрепленных файлов
 * - Форматирование текста сообщений ассистента
 * 
 * Функциональность:
 * - Отображение сообщений пользователя (справа) и ассистента (слева)
 * - Аватары для визуального различия ролей
 * - Форматирование текста ассистента через FormattedText (markdown)
 * - Отображение прикрепленных файлов (один файл или список через tooltip)
 * - Отображение временных меток сообщений
 * - Пустое состояние при отсутствии сообщений
 * 
 * Связи:
 * - aichat/page.tsx: получает массив сообщений через пропсы
 * - FormattedText: компонент для форматирования текста ассистента (markdown)
 * - Message: интерфейс сообщения из aichat/page.tsx
 * 
 * Поведение:
 * - Если сообщений нет - показывает пустое состояние
 * - Сообщения пользователя отображаются справа с иконкой пользователя
 * - Сообщения ассистента отображаются слева с аватаром "G"
 * - Текст ассистента форматируется через FormattedText
 * - Текст пользователя отображается как есть (pre-wrap)
 * - Файлы отображаются под сообщением
 */
'use client'

import { Box, Flex, Text } from "@radix-ui/themes"
import * as Tooltip from '@radix-ui/react-tooltip'
import { PersonIcon, PaperPlaneIcon } from "@radix-ui/react-icons"
import { Message } from "@/app/aichat/page"
import { useState } from "react"
import FormattedText from "./FormattedText"
import styles from './ChatMessages.module.css'

/**
 * ChatMessagesProps - интерфейс пропсов компонента ChatMessages
 * 
 * Структура:
 * - messages: массив сообщений для отображения
 */
interface ChatMessagesProps {
  messages: Message[]
}

/**
 * formatFileSize - форматирование размера файла в читаемый формат
 * 
 * Функциональность:
 * - Преобразует размер файла в байтах в читаемый формат
 * - Форматы: B (байты), KB (килобайты), MB (мегабайты)
 * 
 * Алгоритм:
 * - Если < 1024 байт - возвращает "X B"
 * - Если < 1024 KB - возвращает "X.X KB" (1 знак после запятой)
 * - Иначе - возвращает "X.X MB" (1 знак после запятой)
 * 
 * Используется для:
 * - Отображения размера файлов в сообщениях
 * 
 * @param bytes - размер файла в байтах
 * @returns отформатированная строка размера файла
 */
const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

/**
 * FileListTooltip - компонент tooltip для списка файлов
 * 
 * Функциональность:
 * - Отображает количество файлов в сообщении
 * - При наведении показывает tooltip со списком всех файлов
 * - Показывает имя и размер каждого файла
 * 
 * Поведение:
 * - Показывается только если файлов больше одного
 * - При наведении открывает tooltip со списком
 * - Каждый файл отображается с номером, именем и размером
 * 
 * Используется для:
 * - Компактного отображения множества файлов в сообщении
 * 
 * @param files - массив файлов для отображения
 */
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

/**
 * ChatMessages - компонент отображения сообщений чата
 * 
 * Функциональность:
 * - Отображает список сообщений пользователя и ассистента
 * - Различает сообщения по ролям (user/assistant)
 * - Форматирует текст ассистента через FormattedText
 * - Отображает прикрепленные файлы
 * 
 * Поведение:
 * - Если сообщений нет - показывает пустое состояние
 * - Сообщения пользователя отображаются справа с иконкой пользователя
 * - Сообщения ассистента отображаются слева с аватаром "G"
 * - Текст ассистента форматируется (markdown)
 * - Текст пользователя отображается как есть (сохраняет переносы строк)
 * - Файлы отображаются под сообщением (один файл или tooltip для нескольких)
 * 
 * @param messages - массив сообщений для отображения
 */
export default function ChatMessages({ messages }: ChatMessagesProps) {
  // Пустое состояние: если сообщений нет - показываем приглашение начать диалог
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
      {/* Рендерим каждое сообщение из массива messages
          - key: уникальный ID сообщения
          - className: стили зависят от роли (user/assistant)
          - align="end": выравнивание по нижнему краю (для аватаров) */}
      {messages.map((message) => (
        <Flex
          key={message.id}
          className={`${styles.messageWrapper} ${message.role === 'user' ? styles.messageUser : styles.messageAssistant}`}
          align="end"
          gap="3"
        >
          {/* Аватар ассистента (только для сообщений ассистента)
              - Отображается слева от сообщения
              - Иконка "G" (Gemini) */}
          {message.role === 'assistant' && (
            <Box className={styles.avatarAssistant}>
              <Box className={styles.avatarIcon}>G</Box>
            </Box>
          )}

          {/* Контейнер сообщения
              - direction="column": вертикальное расположение (текст, файлы, время)
              - className: стили зависят от роли */}
          <Flex 
            direction="column" 
            gap="0" 
            className={message.role === 'user' ? styles.userMessageContainer : styles.assistantMessageContainer}
          >
            {/* Текст сообщения
                - Показывается только если есть content
                - Для ассистента: форматируется через FormattedText (markdown)
                - Для пользователя: отображается как есть (pre-wrap для сохранения переносов) */}
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

            {/* Информация о прикрепленных файлах
                - Показывается только если есть файлы
                - Если файл один: показывает имя и размер
                - Если файлов несколько: показывает tooltip со списком */}
            {message.files && message.files.length > 0 && (
              <Box className={styles.filesInfo}>
                {message.files.length === 1 ? (
                  // Один файл: показываем имя и размер напрямую
                  <Flex align="center" gap="2" className={styles.singleFileInfo}>
                    <PaperPlaneIcon width={14} height={14} />
                    <Text size="1" style={{ color: 'var(--gray-11)' }}>
                      {message.files[0].name} ({formatFileSize(message.files[0].size)})
                    </Text>
                  </Flex>
                ) : (
                  // Несколько файлов: показываем tooltip со списком
                  <FileListTooltip files={message.files} />
                )}
              </Box>
            )}

            {/* Временная метка сообщения
                - Отображается под текстом и файлами
                - Формат определяется в aichat/page.tsx */}
            <Text size="1" className={styles.messageTimestamp}>
              {message.timestamp}
            </Text>
          </Flex>

          {/* Аватар пользователя (только для сообщений пользователя)
              - Отображается справа от сообщения
              - Иконка PersonIcon */}
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
