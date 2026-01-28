'use client'

import { useState, useRef } from "react"
import { Box, Text, Flex, Button } from "@radix-ui/themes"
import { Cross2Icon, UploadIcon, FileTextIcon } from "@radix-ui/react-icons"
import { useTheme } from "@/components/ThemeProvider"
import styles from './WikiFileUploadModal.module.css'

interface WikiFileUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onFileUpload: (content: string, fileName: string) => void
}

const ALLOWED_EXTENSIONS = ['.md', '.doc', '.docx', '.pdf', '.txt']
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export default function WikiFileUploadModal({
  isOpen,
  onClose,
  onFileUpload
}: WikiFileUploadModalProps) {
  const { theme } = useTheme()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const modalBackgroundColor = theme === 'dark' ? '#1c1c1f' : '#ffffff'

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)

    // Проверка расширения файла
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
    if (!ALLOWED_EXTENSIONS.includes(fileExtension)) {
      setError(`Неподдерживаемый формат файла. Разрешенные форматы: ${ALLOWED_EXTENSIONS.join(', ')}`)
      setSelectedFile(null)
      return
    }

    // Проверка размера файла
    if (file.size > MAX_FILE_SIZE) {
      setError(`Файл слишком большой. Максимальный размер: ${MAX_FILE_SIZE / 1024 / 1024}MB`)
      setSelectedFile(null)
      return
    }

    setSelectedFile(file)
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Пожалуйста, выберите файл')
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      const fileExtension = '.' + selectedFile.name.split('.').pop()?.toLowerCase()
      let content = ''

      if (fileExtension === '.txt' || fileExtension === '.md') {
        // Простые текстовые форматы
        content = await readTextFile(selectedFile)
      } else if (fileExtension === '.doc' || fileExtension === '.docx') {
        // TODO: Реализовать парсинг DOC/DOCX
        setError('Парсинг DOC/DOCX файлов пока не реализован. Используйте формат .txt или .md')
        setIsProcessing(false)
        return
      } else if (fileExtension === '.pdf') {
        // TODO: Реализовать парсинг PDF
        setError('Парсинг PDF файлов пока не реализован. Используйте формат .txt или .md')
        setIsProcessing(false)
        return
      }

      onFileUpload(content, selectedFile.name)
      handleClose()
    } catch (err) {
      console.error('Error processing file:', err)
      setError('Ошибка при обработке файла. Попробуйте другой файл.')
    } finally {
      setIsProcessing(false)
    }
  }

  const readTextFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        resolve(e.target?.result as string)
      }
      reader.onerror = reject
      reader.readAsText(file, 'UTF-8')
    })
  }

  const handleClose = () => {
    setSelectedFile(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    onClose()
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const file = e.dataTransfer.files?.[0]
    if (file) {
      const fakeEvent = {
        target: { files: [file] }
      } as any
      handleFileSelect(fakeEvent)
    }
  }

  if (!isOpen) return null

  return (
    <Box 
      className={styles.modalOverlay} 
      onClick={handleClose}
      style={{ display: isOpen ? 'flex' : 'none' }}
    >
      <Box 
        className={styles.modal} 
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: modalBackgroundColor,
          background: modalBackgroundColor,
          opacity: 1,
        }}
      >
        {/* Заголовок */}
        <Flex justify="between" align="center" className={styles.modalHeader}>
          <Flex align="center" gap="2">
            <UploadIcon width={20} height={20} />
            <Text size="4" weight="bold">
              Загрузить содержимое из файла
            </Text>
          </Flex>
          <Box
            onClick={handleClose}
            style={{
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              color: 'var(--gray-11)',
            }}
            title="Закрыть"
          >
            <Cross2Icon width="20" height="20" />
          </Box>
        </Flex>

        {/* Содержимое */}
        <Box className={styles.modalContent}>
          <Text size="2" color="gray" style={{ display: 'block', marginBottom: '16px' }}>
            Поддерживаемые форматы: {ALLOWED_EXTENSIONS.join(', ')}. Максимальный размер: {MAX_FILE_SIZE / 1024 / 1024}MB
          </Text>

          {/* Область загрузки */}
          <Box
            className={styles.dropZone}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={ALLOWED_EXTENSIONS.join(',')}
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            <Flex direction="column" align="center" gap="3" style={{ padding: '40px' }}>
              <UploadIcon width={48} height={48} style={{ color: 'var(--gray-9)' }} />
              <Text size="3" weight="medium" style={{ textAlign: 'center' }}>
                {selectedFile ? selectedFile.name : 'Перетащите файл сюда или нажмите для выбора'}
              </Text>
              {selectedFile && (
                <Flex align="center" gap="2" style={{ marginTop: '8px' }}>
                  <FileTextIcon width={16} height={16} />
                  <Text size="2" color="gray">
                    {(selectedFile.size / 1024).toFixed(2)} KB
                  </Text>
                </Flex>
              )}
            </Flex>
          </Box>

          {/* Ошибка */}
          {error && (
            <Box className={styles.errorBox}>
              <Text size="2" color="red">
                {error}
              </Text>
            </Box>
          )}

          {/* Информация о поддерживаемых форматах */}
          <Box className={styles.infoBox}>
            <Text size="2" weight="medium" style={{ display: 'block', marginBottom: '8px' }}>
              Поддерживаемые форматы:
            </Text>
            <ul style={{ marginLeft: '20px', marginTop: '4px' }}>
              <li><Text size="2" color="gray">.md, .txt - полная поддержка</Text></li>
              <li><Text size="2" color="gray">.doc, .docx - в разработке</Text></li>
              <li><Text size="2" color="gray">.pdf - в разработке</Text></li>
            </ul>
          </Box>
        </Box>

        {/* Кнопки */}
        <Flex justify="end" gap="3" className={styles.modalFooter}>
          <Button
            variant="soft"
            onClick={handleClose}
            disabled={isProcessing}
          >
            Отмена
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || isProcessing}
            style={{
              backgroundColor: 'var(--accent-9)',
              color: '#ffffff',
            }}
          >
            {isProcessing ? 'Обработка...' : 'Загрузить'}
          </Button>
        </Flex>
      </Box>
    </Box>
  )
}
