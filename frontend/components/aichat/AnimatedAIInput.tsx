'use client'

import { Box, Flex, TextArea, Button, Text, Separator } from "@radix-ui/themes"
import * as Popover from '@radix-ui/react-popover'
import { PaperPlaneIcon, ChevronDownIcon, CheckIcon, Cross2Icon } from "@radix-ui/react-icons"
import { useState, useRef, useEffect } from "react"
import styles from './AnimatedAIInput.module.css'

interface AIModel {
  id: string
  name: string
  icon: React.ReactNode
  provider: 'openai' | 'gemini' | 'claude'
}

interface AttachedFile {
  id: string
  file: File
}

interface AnimatedAIInputProps {
  onSend: (message: string, modelId?: string, files?: File[]) => void
  onFileAttach?: (file: File) => void
  placeholder?: string
  disabled?: boolean
}

const AI_MODELS: AIModel[] = [
  {
    id: 'o3-mini',
    name: 'o3-mini',
    icon: <Box className={styles.modelIconOpenAI}>O</Box>,
    provider: 'openai'
  },
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    icon: <Box className={styles.modelIconGemini}>◆</Box>,
    provider: 'gemini'
  },
  {
    id: 'claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet',
    icon: <Box className={styles.modelIconClaude}>A</Box>,
    provider: 'claude'
  },
  {
    id: 'gpt-4-1-mini',
    name: 'GPT-4-1 Mini',
    icon: <Box className={styles.modelIconOpenAI}>O</Box>,
    provider: 'openai'
  },
  {
    id: 'gpt-4-1',
    name: 'GPT-4-1',
    icon: <Box className={styles.modelIconOpenAI}>O</Box>,
    provider: 'openai'
  },
]

export default function AnimatedAIInput({ 
  onSend,
  onFileAttach,
  placeholder = "Введите ваше сообщение...",
  disabled = false
}: AnimatedAIInputProps) {
  const [message, setMessage] = useState('')
  const [selectedModel, setSelectedModel] = useState<AIModel>(AI_MODELS[1]) // По умолчанию
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false)
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([])
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Автоматическое изменение высоты textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [message])

  const handleSend = () => {
    if ((message.trim() || attachedFiles.length > 0) && !disabled) {
      const files = attachedFiles.map(af => af.file)
      onSend(message.trim(), selectedModel.id, files)
      setMessage('')
      setAttachedFiles([])
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleModelSelect = (model: AIModel) => {
    setSelectedModel(model)
    setIsModelDropdownOpen(false)
  }

  const handleFileAttachClick = () => {
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

      // Вызываем callback для каждого файла если есть
      if (onFileAttach) {
        files.forEach(file => onFileAttach(file))
      }
    }
    // Сбрасываем значение input, чтобы можно было выбрать те же файлы снова
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

  const hasContent = message.trim().length > 0 || attachedFiles.length > 0

  return (
    <Box 
      ref={containerRef}
      className={styles.inputContainer}
    >
      {/* Прикрепленные файлы */}
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
                  variant="ghost"
                  size="1"
                  className={styles.removeFileButton}
                  onClick={() => handleRemoveFile(attachedFile.id)}
                  title="Удалить файл"
                >
                  <Cross2Icon width={12} height={12} />
                </Button>
              </Box>
            ))}
          </Flex>
        </Box>
      )}

      {/* Текстовое поле */}
      <TextArea
        ref={textareaRef}
        className={styles.textArea}
        placeholder={placeholder}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyPress}
        disabled={disabled}
        rows={1}
        style={{
          resize: 'none',
          overflow: 'hidden',
          minHeight: '24px',
          maxHeight: '200px',
        }}
      />

      {/* Панель действий */}
      <Flex align="center" gap="2" className={styles.actionBar}>
        {/* Выбор модели */}
        <Popover.Root open={isModelDropdownOpen} onOpenChange={setIsModelDropdownOpen}>
          <Popover.Trigger asChild>
            <Button
              variant="ghost"
              className={styles.modelSelector}
              size="2"
            >
              <Flex align="center" gap="2">
                {selectedModel.icon}
                <Text size="2">{selectedModel.name}</Text>
                <ChevronDownIcon width={14} height={14} />
              </Flex>
            </Button>
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content 
              className={styles.modelDropdown} 
              side="top" 
              align="start"
              sideOffset={8}
              onEscapeKeyDown={() => setIsModelDropdownOpen(false)}
              onInteractOutside={() => setIsModelDropdownOpen(false)}
            >
              <Box className={styles.modelList}>
                {AI_MODELS.map((model) => (
                  <Box
                    key={model.id}
                    className={`${styles.modelItem} ${selectedModel.id === model.id ? styles.modelItemSelected : ''}`}
                    onClick={() => handleModelSelect(model)}
                  >
                    <Flex align="center" justify="between" width="100%" gap="1">
                      <Flex align="center" gap="1" style={{ flex: 1, minWidth: 0 }}>
                        {model.icon}
                        <Text 
                          size="1" 
                          weight={selectedModel.id === model.id ? "medium" : "regular"}
                          style={{ fontSize: '11px', lineHeight: '1.2' }}
                        >
                          {model.name}
                        </Text>
                      </Flex>
                      {selectedModel.id === model.id && (
                        <CheckIcon width={12} height={12} className={styles.checkIcon} />
                      )}
                    </Flex>
                  </Box>
                ))}
              </Box>
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>

        <Separator orientation="vertical" className={styles.separator} />

        {/* Скрытый input для файлов */}
        <input
          ref={fileInputRef}
          type="file"
          style={{ display: 'none' }}
          onChange={handleFileChange}
          multiple={true}
        />

        {/* Кнопка прикрепления */}
        <Button
          variant="ghost"
          className={styles.attachButton}
          size="2"
          disabled={disabled}
          onClick={handleFileAttachClick}
          title="Прикрепить файл"
        >
          <Box className={styles.paperclipIcon}>📎</Box>
        </Button>

        {/* Кнопка отправки */}
        <Button
          className={`${styles.sendButton} ${hasContent ? styles.sendButtonActive : ''}`}
          onClick={handleSend}
          disabled={!hasContent || disabled}
          size="2"
        >
          <Text size="1" style={{ marginRight: '6px' }}>Отправить</Text>
          <PaperPlaneIcon width={16} height={16} />
        </Button>
      </Flex>
    </Box>
  )
}
