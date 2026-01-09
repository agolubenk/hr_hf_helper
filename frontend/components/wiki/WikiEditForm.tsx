'use client'

import { useState, useEffect } from "react"
import { Box, Flex, Text, Button, TextArea, TextField, Select, Checkbox } from "@radix-ui/themes"
import { ArrowLeftIcon, Pencil1Icon, TrashIcon, UploadIcon } from "@radix-ui/react-icons"
import { useRouter } from "next/navigation"
import WikiFileUploadModal from "./WikiFileUploadModal"
import WikiDeleteConfirmPopover from "./WikiDeleteConfirmDialog"
import WikiTagSelector from "./WikiTagSelector"
import styles from './WikiEditForm.module.css'

interface WikiPageData {
  id: string
  title: string
  slug: string
  category: string
  relatedApp: string
  tags: string[]
  description: string
  content: string
  order: number
  isPublished: boolean
}

interface WikiEditFormProps {
  initialData?: Partial<WikiPageData>
  isNew?: boolean
}

const CATEGORIES = [
  { value: 'none', label: 'Без категории' },
  { value: 'architect', label: 'Архитектура' },
  { value: 'guide', label: 'Руководство' },
  { value: 'api', label: 'API' },
  { value: 'faq', label: 'FAQ' },
]

const RELATED_APPS = [
  { value: 'none', label: 'Не выбрано' },
  { value: 'accounts', label: 'Управление пользователями' },
  { value: 'finance', label: 'Финансы' },
  { value: 'vacancies', label: 'Вакансии' },
  { value: 'hiring_plan', label: 'План найма' },
]

const AVAILABLE_TAGS = [
  { id: 'ai', label: '#ai', color: '#ef4444' },
  { id: 'architect', label: '#architect', color: '#ef4444' },
  { id: 'вакансии', label: '#вакансии', color: '#ef4444' },
  { id: 'интеграции', label: '#интеграции', color: '#84cc16' },
  { id: 'интервьюеры', label: '#интервьюеры', color: '#10b981' },
  { id: 'использование', label: '#использование', color: '#10b981' },
  { id: 'календарь', label: '#календарь', color: '#a855f7' },
  { id: 'метрики', label: '#метрики', color: '#f59e0b' },
  { id: 'настройка', label: '#настройка', color: '#3b82f6' },
  { id: 'пользователи', label: '#пользователи', color: '#6b7280' },
  { id: 'финансы', label: '#финансы', color: '#06b6d4' },
]

export default function WikiEditForm({ initialData, isNew = false }: WikiEditFormProps) {
  const router = useRouter()
  
  const [formData, setFormData] = useState<WikiPageData>({
    id: initialData?.id || '',
    title: initialData?.title || '',
    slug: initialData?.slug || '',
    category: initialData?.category || '',
    relatedApp: initialData?.relatedApp || '',
    tags: initialData?.tags || [],
    description: initialData?.description || '',
    content: initialData?.content || '',
    order: initialData?.order || 0,
    isPublished: initialData?.isPublished ?? true,
  })

  const [changeNote, setChangeNote] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  // Автогенерация slug из title
  useEffect(() => {
    if (isNew && formData.title && !formData.slug) {
      const generatedSlug = formData.title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
      setFormData(prev => ({ ...prev, slug: generatedSlug }))
    }
  }, [formData.title, isNew, formData.slug])

  const handleChange = (field: keyof WikiPageData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Валидация
    if (!formData.title.trim() || formData.title.length < 3) {
      alert('Название должно содержать минимум 3 символа')
      setIsSubmitting(false)
      return
    }

    if (!formData.slug.trim()) {
      alert('URL-адрес обязателен')
      setIsSubmitting(false)
      return
    }

    if (!formData.content.trim() || formData.content.length < 10) {
      alert('Содержание должно содержать минимум 10 символов')
      setIsSubmitting(false)
      return
    }

    try {
      // TODO: Отправка данных на сервер
      console.log('Saving wiki page:', { ...formData, changeNote })
      
      // Имитация задержки
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // После успешного сохранения переходим на страницу просмотра
      router.push(`/wiki/${formData.slug || formData.id}`)
    } catch (error) {
      console.error('Error saving wiki page:', error)
      alert('Ошибка при сохранении страницы')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    if (isNew) {
      router.push('/wiki')
    } else {
      router.push(`/wiki/${formData.id}`)
    }
  }

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    // TODO: Удаление страницы
    console.log('Deleting wiki page:', formData.id)
    router.push('/wiki')
  }

  const handleFileUpload = (content: string, fileName: string) => {
    // Вставляем содержимое файла в поле content
    setFormData(prev => ({
      ...prev,
      content: prev.content ? prev.content + '\n\n' + content : content
    }))
    setIsUploadModalOpen(false)
  }

  return (
    <Box className={styles.editContainer}>
      {/* Хлебные крошки */}
      <Flex align="center" gap="2" mb="4">
        <Text 
          size="2" 
          color="gray" 
          style={{ cursor: 'pointer' }} 
          onClick={() => router.push('/wiki')}
        >
          Вики
        </Text>
        <Text size="2" color="gray">/</Text>
        {!isNew && (
          <>
            <Text 
              size="2" 
              color="gray" 
              style={{ cursor: 'pointer' }} 
              onClick={() => router.push(`/wiki/${formData.id}`)}
            >
              {formData.title || 'Страница'}
            </Text>
            <Text size="2" color="gray">/</Text>
          </>
        )}
        <Text size="2" color="gray">
          {isNew ? 'Создать' : 'Редактировать'}
        </Text>
      </Flex>

      <Flex gap="4" className={styles.content}>
        {/* Основная форма */}
        <Box className={styles.formContainer}>
          <Box className={styles.formHeader}>
            <Flex align="center" gap="2">
              <Pencil1Icon width={20} height={20} />
              <Text size="5" weight="bold">
                {isNew ? 'Создать новую страницу' : 'Редактировать страницу'}
              </Text>
            </Flex>
          </Box>

          <form onSubmit={handleSubmit} className={styles.form}>
            {/* Название */}
            <Box className={styles.field}>
              <Text size="2" weight="medium" style={{ display: 'block', marginBottom: '8px' }}>
                Название <Text color="red">*</Text>
              </Text>
              <TextField.Root
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="Введите название страницы"
                required
                minLength={3}
              />
              <Text size="1" color="gray" style={{ display: 'block', marginTop: '4px' }}>
                Минимум 3 символа
              </Text>
            </Box>

            {/* URL-адрес */}
            <Box className={styles.field}>
              <Text size="2" weight="medium" style={{ display: 'block', marginBottom: '8px' }}>
                URL-адрес <Text color="red">*</Text>
              </Text>
              <TextField.Root
                value={formData.slug}
                onChange={(e) => handleChange('slug', e.target.value)}
                placeholder="nastroyki-kompanii"
                required
                pattern="[a-z0-9-]+"
              />
              <Text size="1" color="gray" style={{ display: 'block', marginTop: '4px' }}>
                Только латинские буквы, цифры и дефисы. Используется для создания URL страницы.
              </Text>
            </Box>

            {/* Категория и связанное приложение */}
            <Flex gap="3" className={styles.row}>
              <Box className={styles.field} style={{ flex: 1 }}>
                <Text size="2" weight="medium" style={{ display: 'block', marginBottom: '8px' }}>
                  Категория
                </Text>
                <Select.Root
                  value={formData.category || 'none'}
                  onValueChange={(value) => handleChange('category', value === 'none' ? '' : value)}
                >
                  <Select.Trigger />
                  <Select.Content>
                    {CATEGORIES.map(cat => (
                      <Select.Item key={cat.value} value={cat.value}>
                        {cat.label}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>
              </Box>

              <Box className={styles.field} style={{ flex: 1 }}>
                <Text size="2" weight="medium" style={{ display: 'block', marginBottom: '8px' }}>
                  Связанное приложение
                </Text>
                <Select.Root
                  value={formData.relatedApp || 'none'}
                  onValueChange={(value) => handleChange('relatedApp', value === 'none' ? '' : value)}
                >
                  <Select.Trigger />
                  <Select.Content>
                    {RELATED_APPS.map(app => (
                      <Select.Item key={app.value} value={app.value}>
                        {app.label}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>
              </Box>
            </Flex>

            {/* Метки (теги) */}
            <Box className={styles.field}>
              <WikiTagSelector
                availableTags={AVAILABLE_TAGS}
                selectedTags={formData.tags}
                onTagsChange={(tags) => handleChange('tags', tags)}
              />
            </Box>

            {/* Краткое описание */}
            <Box className={styles.field}>
              <Text size="2" weight="medium" style={{ display: 'block', marginBottom: '8px' }}>
                Краткое описание
              </Text>
              <TextArea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Краткое описание страницы для превью"
                maxLength={500}
                rows={3}
              />
              <Text size="1" color="gray" style={{ display: 'block', marginTop: '4px' }}>
                Максимум 500 символов
              </Text>
            </Box>

            {/* Содержание */}
            <Box className={styles.field}>
              <Flex justify="between" align="center" style={{ marginBottom: '8px' }}>
                <Text size="2" weight="medium">
                  Содержание <Text color="red">*</Text>
                </Text>
                <Button
                  type="button"
                  size="2"
                  variant="soft"
                  onClick={() => setIsUploadModalOpen(true)}
                  style={{
                    backgroundColor: 'var(--gray-3)',
                    color: 'var(--gray-11)',
                  }}
                >
                  <UploadIcon width={14} height={14} />
                  Загрузить из файла
                </Button>
              </Flex>
              <TextArea
                value={formData.content}
                onChange={(e) => handleChange('content', e.target.value)}
                placeholder="Введите содержание страницы (поддерживается Markdown)"
                required
                minLength={10}
                rows={20}
                style={{ fontFamily: 'monospace' }}
              />
              <Text size="1" color="gray" style={{ display: 'block', marginTop: '4px' }}>
                Минимум 10 символов. Поддерживается Markdown форматирование.
              </Text>
            </Box>

            {/* Порядок сортировки и опубликовано */}
            <Flex gap="3" className={styles.row}>
              <Box className={styles.field} style={{ flex: 1 }}>
                <Text size="2" weight="medium" style={{ display: 'block', marginBottom: '8px' }}>
                  Порядок сортировки
                </Text>
                <TextField.Root
                  type="number"
                  value={formData.order.toString()}
                  onChange={(e) => handleChange('order', parseInt(e.target.value) || 0)}
                  min={0}
                />
                <Text size="1" color="gray" style={{ display: 'block', marginTop: '4px' }}>
                  Меньше значение = выше в списке
                </Text>
              </Box>

              <Box className={styles.field} style={{ flex: 1, display: 'flex', alignItems: 'center', paddingTop: '24px' }}>
                <Flex align="center" gap="2">
                  <Checkbox
                    checked={formData.isPublished}
                    onCheckedChange={(checked) => handleChange('isPublished', checked)}
                  />
                  <Text size="2" weight="medium">
                    Опубликовано
                  </Text>
                </Flex>
              </Box>
            </Flex>

            {/* Примечание к изменению (только при редактировании) */}
            {!isNew && (
              <Box className={styles.field}>
                <Text size="2" weight="medium" style={{ display: 'block', marginBottom: '8px' }}>
                  Примечание к изменению
                </Text>
                <TextField.Root
                  value={changeNote}
                  onChange={(e) => setChangeNote(e.target.value)}
                  placeholder="Краткое описание внесенных изменений"
                  maxLength={200}
                />
                <Text size="1" color="gray" style={{ display: 'block', marginTop: '4px' }}>
                  Будет сохранено в истории изменений
                </Text>
              </Box>
            )}

            {/* Кнопки */}
            <Flex justify="between" align="center" className={styles.actions}>
              <Flex gap="2">
                <Button
                  type="submit"
                  size="3"
                  style={{
                    backgroundColor: 'var(--accent-9)',
                    color: '#ffffff',
                  }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Сохранение...' : (isNew ? 'Создать страницу' : 'Сохранить изменения')}
                </Button>
                <Button
                  type="button"
                  size="3"
                  variant="soft"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                >
                  Отмена
                </Button>
              </Flex>
              {!isNew && (
                <WikiDeleteConfirmPopover
                  isOpen={isDeleteDialogOpen}
                  onClose={() => setIsDeleteDialogOpen(false)}
                  onConfirm={handleDeleteConfirm}
                  message="Вы уверены, что хотите удалить эту страницу?"
                  trigger={
                    <Button
                      type="button"
                      size="3"
                      variant="soft"
                      color="red"
                      onClick={handleDeleteClick}
                      disabled={isSubmitting}
                    >
                      <TrashIcon width={16} height={16} />
                      Удалить
                    </Button>
                  }
                />
              )}
            </Flex>
          </form>
        </Box>

        {/* Справка */}
        <Box className={styles.helpContainer}>
          <Box className={styles.helpCard}>
            <Text size="4" weight="bold" style={{ display: 'block', marginBottom: '12px' }}>
              Справка
            </Text>
            
            <Text size="3" weight="medium" style={{ display: 'block', marginBottom: '8px', marginTop: '16px' }}>
              Форматирование текста
            </Text>
            <Text size="2" color="gray" style={{ display: 'block', marginBottom: '8px' }}>
              Поддерживается Markdown форматирование:
            </Text>
            <ul style={{ marginLeft: '20px', marginBottom: '16px' }}>
              <li><Text size="2" color="gray"><strong>**жирный текст**</strong> - жирный текст</Text></li>
              <li><Text size="2" color="gray"><em>*курсив*</em> - курсив</Text></li>
              <li><Text size="2" color="gray"><code>`код`</code> - код</Text></li>
              <li><Text size="2" color="gray"># Заголовок 1</Text></li>
              <li><Text size="2" color="gray">## Заголовок 2</Text></li>
              <li><Text size="2" color="gray">- Список</Text></li>
              <li><Text size="2" color="gray">1. Нумерованный список</Text></li>
            </ul>
            
            <Text size="3" weight="medium" style={{ display: 'block', marginBottom: '8px', marginTop: '16px' }}>
              Рекомендации
            </Text>
            <ul style={{ marginLeft: '20px' }}>
              <li><Text size="2" color="gray">Используйте понятные и описательные названия</Text></li>
              <li><Text size="2" color="gray">Указывайте категорию для удобной навигации</Text></li>
              <li><Text size="2" color="gray">Добавляйте краткое описание для превью</Text></li>
              <li><Text size="2" color="gray">Структурируйте содержимое с помощью заголовков</Text></li>
            </ul>
          </Box>
        </Box>
      </Flex>

      {/* Модальное окно загрузки файлов */}
      <WikiFileUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onFileUpload={handleFileUpload}
      />
    </Box>
  )
}
