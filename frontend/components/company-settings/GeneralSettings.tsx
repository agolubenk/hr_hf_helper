'use client'

import { Box, Flex, Text, TextField, TextArea, Button, Card, Separator } from "@radix-ui/themes"
import { useState, useRef } from "react"
import { PlusIcon, TrashIcon, Pencil2Icon, CheckIcon, Cross2Icon } from "@radix-ui/react-icons"
import { useToast } from "@/components/Toast/ToastContext"
import styles from './GeneralSettings.module.css'

interface Office {
  id: number
  address: string
  mapLink: string
  country: string
  directions: string
  isMain: boolean
}

// Моковые данные
const mockCompanyData = {
  name: 'HR Helper',
  calendarLink: 'https://calendar.google.com/calendar/u/0',
  logo: null as string | null,
}

const mockOffices: Office[] = [
  {
    id: 1,
    address: 'ул. Ленина, 10, Минск, Беларусь',
    mapLink: 'https://maps.google.com/?q=Минск,+ул.+Ленина,+10',
    country: 'Беларусь',
    directions: 'Вход со стороны главного входа, 3 этаж',
    isMain: true,
  },
  {
    id: 2,
    address: 'ул. Пушкина, 5, Минск, Беларусь',
    mapLink: 'https://maps.google.com/?q=Минск,+ул.+Пушкина,+5',
    country: 'Беларусь',
    directions: 'Вход через бизнес-центр, лифт на 2 этаж',
    isMain: false,
  },
]

export default function GeneralSettings() {
  const toast = useToast()
  const [companyName, setCompanyName] = useState(mockCompanyData.name)
  const [calendarLink, setCalendarLink] = useState(mockCompanyData.calendarLink)
  const [logo, setLogo] = useState<string | null>(mockCompanyData.logo)
  const [offices, setOffices] = useState<Office[]>(mockOffices)
  const [editingOfficeId, setEditingOfficeId] = useState<number | null>(null)
  const [isAddingOffice, setIsAddingOffice] = useState(false)
  const [newOffice, setNewOffice] = useState<Partial<Office>>({
    address: '',
    mapLink: '',
    country: '',
    directions: '',
    isMain: false,
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSetMainOffice = (id: number) => {
    setOffices(prev => prev.map(office => ({
      ...office,
      isMain: office.id === id
    })))
  }

  const handleAddOffice = () => {
    if (!newOffice.address || !newOffice.mapLink) {
      alert('Заполните обязательные поля: адрес и ссылка на карте')
      return
    }

    const office: Office = {
      id: Date.now(),
      address: newOffice.address!,
      mapLink: newOffice.mapLink!,
      country: newOffice.country || 'Беларусь',
      directions: newOffice.directions || '',
      isMain: !offices.some(o => o.isMain),
    }

    setOffices(prev => [...prev, office])
    setNewOffice({
      address: '',
      mapLink: '',
      country: '',
      directions: '',
      isMain: false,
    })
    setIsAddingOffice(false)
  }

  const handleEditOffice = (id: number) => {
    setEditingOfficeId(id)
  }

  const handleSaveOffice = (id: number, updatedOffice: Partial<Office>) => {
    setOffices(prev => prev.map(office => 
      office.id === id ? { ...office, ...updatedOffice } : office
    ))
    setEditingOfficeId(null)
  }

  const handleDeleteOffice = (id: number) => {
    toast.showWarning('Удалить офис?', 'Вы уверены, что хотите удалить этот офис?', {
      actions: [
        { label: 'Отмена', onClick: () => {}, variant: 'soft', color: 'gray' },
        { label: 'Удалить', onClick: () => setOffices(prev => prev.filter(office => office.id !== id)), variant: 'solid', color: 'red' },
      ],
    })
  }

  const handleCancelAdd = () => {
    setNewOffice({
      address: '',
      mapLink: '',
      country: '',
      directions: '',
      isMain: false,
    })
    setIsAddingOffice(false)
  }

  const handleLogoUpload = () => {
    fileInputRef.current?.click()
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Проверяем тип файла (изображения)
    if (!file.type.startsWith('image/')) {
      alert('Пожалуйста, выберите файл изображения')
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      return
    }

    // Проверяем размер файла (максимум 5MB)
    const MAX_SIZE = 5 * 1024 * 1024 // 5MB
    if (file.size > MAX_SIZE) {
      alert('Размер файла не должен превышать 5MB')
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      return
    }

    // Создаем URL для предпросмотра
    const reader = new FileReader()
    reader.onloadend = () => {
      setLogo(reader.result as string)
    }
    reader.readAsDataURL(file)

    // Сбрасываем значение input, чтобы можно было выбрать тот же файл снова
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <Flex direction="column" gap="4">
      {/* Общие настройки */}
      <Card className={styles.card}>
        <Text size="4" weight="bold" mb="4" style={{ display: 'block' }}>
          Общие настройки
        </Text>

        <Flex direction="column" gap="4">
          {/* Логотип и основные поля в одной строке */}
          <Flex gap="4" align="start">
            {/* Логотип - слева */}
            <Box>
              <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
                Логотип компании
              </Text>
              <Box
                className={styles.logoPreview}
                onClick={handleLogoUpload}
                style={{
                  width: '120px',
                  height: '120px',
                  border: '1px solid var(--gray-a6)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'var(--gray-2)',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--accent-9)'
                  e.currentTarget.style.backgroundColor = 'var(--gray-3)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--gray-a6)'
                  e.currentTarget.style.backgroundColor = 'var(--gray-2)'
                }}
              >
                {logo ? (
                  <img src={logo} alt="Logo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                ) : (
                  <Text size="2" color="gray">Нет логотипа</Text>
                )}
              </Box>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                style={{ display: 'none' }}
              />
            </Box>

            {/* Основные поля - справа */}
            <Flex direction="column" gap="4" style={{ flex: 1 }}>
              {/* Название компании */}
              <Box>
                <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
                  Название компании *
                </Text>
                <TextField.Root
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Введите название компании"
                  style={{ width: '100%' }}
                />
              </Box>

              {/* Ссылка на календарь */}
              <Box>
                <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
                  Ссылка на календарь
                </Text>
                <TextField.Root
                  value={calendarLink}
                  onChange={(e) => setCalendarLink(e.target.value)}
                  placeholder="https://calendar.google.com/..."
                  style={{ width: '100%' }}
                />
              </Box>
            </Flex>
          </Flex>
        </Flex>

        {/* Кнопки сохранения */}
        <Flex justify="end" gap="3" pt="3" mt="4" style={{ borderTop: '1px solid var(--gray-a6)' }}>
          <Button variant="soft" size="3">
            Отмена
          </Button>
          <Button size="3">
            Сохранить изменения
          </Button>
        </Flex>
      </Card>

      {/* Офисы */}
      <Card className={styles.card}>
        <Flex justify="between" align="center" mb="4">
          <Text size="4" weight="bold">
            Офисы
          </Text>
          {!isAddingOffice && (
            <Button size="2" onClick={() => setIsAddingOffice(true)}>
              <PlusIcon width={16} height={16} />
              Добавить офис
            </Button>
          )}
        </Flex>

        <Flex direction="column" gap="3">
          {/* Форма добавления нового офиса */}
          {isAddingOffice && (
            <Box className={styles.officeCard} p="4" style={{ border: '2px dashed var(--gray-a6)', borderRadius: '8px' }}>
              <Text size="3" weight="bold" mb="3" style={{ display: 'block' }}>
                Новый офис
              </Text>
              <Flex direction="column" gap="3">
                <Box>
                  <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
                    Адрес *
                  </Text>
                  <TextField.Root
                    value={newOffice.address || ''}
                    onChange={(e) => setNewOffice(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Введите адрес офиса"
                    style={{ width: '100%' }}
                  />
                </Box>

                <Box>
                  <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
                    Ссылка на карте *
                  </Text>
                  <TextField.Root
                    value={newOffice.mapLink || ''}
                    onChange={(e) => setNewOffice(prev => ({ ...prev, mapLink: e.target.value }))}
                    placeholder="https://maps.google.com/..."
                    style={{ width: '100%' }}
                  />
                </Box>

                <Box>
                  <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
                    Страна
                  </Text>
                  <TextField.Root
                    value={newOffice.country || ''}
                    onChange={(e) => setNewOffice(prev => ({ ...prev, country: e.target.value }))}
                    placeholder="Беларусь"
                    style={{ width: '100%' }}
                  />
                  <Text size="1" color="gray" mt="1" style={{ display: 'block' }}>
                    Определяется автоматически по адресу
                  </Text>
                </Box>

                <Box>
                  <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
                    Как пройти
                  </Text>
                  <TextArea
                    value={newOffice.directions || ''}
                    onChange={(e) => setNewOffice(prev => ({ ...prev, directions: e.target.value }))}
                    placeholder="Описание как добраться до офиса"
                    style={{ width: '100%' }}
                    rows={3}
                  />
                </Box>

                <Flex gap="2" justify="end" mt="2">
                  <Button variant="soft" onClick={handleCancelAdd}>
                    <Cross2Icon width={16} height={16} />
                    Отмена
                  </Button>
                  <Button onClick={handleAddOffice}>
                    <CheckIcon width={16} height={16} />
                    Добавить
                  </Button>
                </Flex>
              </Flex>
            </Box>
          )}

          {/* Список офисов */}
          {offices.map(office => (
            <OfficeCard
              key={office.id}
              office={office}
              isEditing={editingOfficeId === office.id}
              onEdit={() => handleEditOffice(office.id)}
              onSave={(updated) => handleSaveOffice(office.id, updated)}
              onCancel={() => setEditingOfficeId(null)}
              onDelete={() => handleDeleteOffice(office.id)}
              onSetMain={() => handleSetMainOffice(office.id)}
            />
          ))}
        </Flex>
      </Card>
    </Flex>
  )
}

interface OfficeCardProps {
  office: Office
  isEditing: boolean
  onEdit: () => void
  onSave: (updated: Partial<Office>) => void
  onCancel: () => void
  onDelete: () => void
  onSetMain: () => void
}

function OfficeCard({ office, isEditing, onEdit, onSave, onCancel, onDelete, onSetMain }: OfficeCardProps) {
  const [formData, setFormData] = useState<Partial<Office>>(office)

  const handleSave = () => {
    onSave(formData)
  }

  const handleCancel = () => {
    setFormData(office)
    onCancel()
  }

  if (isEditing) {
    return (
      <Box className={styles.officeCard} p="4" style={{ border: '1px solid var(--gray-a6)', borderRadius: '8px', background: 'var(--color-panel)' }}>
        <Flex justify="between" align="center" mb="3">
          <Text size="3" weight="bold">
            Редактирование офиса
          </Text>
          {office.isMain && (
            <Box className={styles.mainBadge}>
              <Text size="1" weight="bold">Основной</Text>
            </Box>
          )}
        </Flex>

        <Flex direction="column" gap="3">
          <Box>
            <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
              Адрес *
            </Text>
            <TextField.Root
              value={formData.address || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              style={{ width: '100%' }}
            />
          </Box>

          <Box>
            <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
              Ссылка на карте *
            </Text>
            <TextField.Root
              value={formData.mapLink || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, mapLink: e.target.value }))}
              style={{ width: '100%' }}
            />
          </Box>

          <Box>
            <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
              Страна
            </Text>
            <TextField.Root
              value={formData.country || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
              style={{ width: '100%' }}
            />
          </Box>

          <Box>
            <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
              Как пройти
            </Text>
            <TextArea
              value={formData.directions || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, directions: e.target.value }))}
              style={{ width: '100%' }}
              rows={3}
            />
          </Box>

          <Flex gap="2" justify="between" mt="2">
            <Button variant="soft" color="red" onClick={onDelete} className={styles.actionButton}>
              <TrashIcon width={16} height={16} />
              Удалить
            </Button>
            <Flex gap="2">
              <Button variant="soft" onClick={handleCancel}>
                <Cross2Icon width={16} height={16} />
                Отмена
              </Button>
              <Button onClick={handleSave}>
                <CheckIcon width={16} height={16} />
                Сохранить
              </Button>
            </Flex>
          </Flex>
        </Flex>
      </Box>
    )
  }

  return (
    <Box className={styles.officeCard} p="4" style={{ border: '1px solid var(--gray-a6)', borderRadius: '8px', background: 'var(--color-panel)' }}>
      <Flex justify="between" align="start" mb="3">
        <Flex direction="column" gap="2" style={{ flex: 1 }}>
          <Flex align="center" gap="2">
            <Text size="3" weight="bold">
              {office.address}
            </Text>
            {office.isMain && (
              <Box className={styles.mainBadge}>
                <Text size="1" weight="bold">Основной</Text>
              </Box>
            )}
          </Flex>
          <Text size="2" color="gray">
            {office.country}
          </Text>
          {office.directions && (
            <Box className={styles.quote}>
              <Text size="2" color="gray" style={{ whiteSpace: 'pre-wrap' }}>
                {office.directions}
              </Text>
            </Box>
          )}
          <Text size="2">
            <a href={office.mapLink} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-11)' }}>
              Открыть на карте →
            </a>
          </Text>
        </Flex>
        <Flex gap="1">
          {!office.isMain && (
            <Button variant="ghost" size="1" onClick={onSetMain} title="Сделать основным" className={styles.actionButton}>
              <CheckIcon width={14} height={14} />
            </Button>
          )}
          <Button variant="ghost" size="1" onClick={onEdit} title="Редактировать" className={styles.actionButton}>
            <Pencil2Icon width={14} height={14} />
          </Button>
          <Button variant="ghost" size="1" color="red" onClick={onDelete} title="Удалить" className={styles.actionButton}>
            <TrashIcon width={14} height={14} />
          </Button>
        </Flex>
      </Flex>
    </Box>
  )
}
