'use client'

import { Box, Text, Flex, Button, Grid } from "@radix-ui/themes"
import { PersonIcon, EnvelopeClosedIcon, PaperPlaneIcon, ClockIcon, Pencil1Icon, ChevronLeftIcon } from "@radix-ui/react-icons"
import FloatingLabelInput from "@/components/FloatingLabelInput"
import { useState } from "react"
import styles from './ProfileEditForm.module.css'

// SVG иконка LinkedIn
const LinkedInIcon = ({ width = 16, height = 16 }: { width?: number; height?: number }) => (
  <svg width={width} height={height} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M14.2857 0H1.71429C0.767857 0 0 0.767857 0 1.71429V14.2857C0 15.2321 0.767857 16 1.71429 16H14.2857C15.2321 16 16 15.2321 16 14.2857V1.71429C16 0.767857 15.2321 0 14.2857 0ZM4.85714 13.7143H2.28571V6H4.85714V13.7143ZM3.57143 4.85714C2.71429 4.85714 2 4.14286 2 3.28571C2 2.42857 2.71429 1.71429 3.57143 1.71429C4.42857 1.71429 5.14286 2.42857 5.14286 3.28571C5.14286 4.14286 4.42857 4.85714 3.57143 4.85714ZM13.7143 13.7143H11.1429V9.71429C11.1429 8.71429 11.1429 7.42857 9.71429 7.42857C8.28571 7.42857 8.14286 8.57143 8.14286 9.57143V13.7143H5.57143V6H8V7.14286H8.14286C8.42857 6.57143 9.28571 5.85714 10.5714 5.85714C13.1429 5.85714 13.7143 7.57143 13.7143 10.2857V13.7143Z"
      fill="currentColor"
    />
  </svg>
)

interface ProfileEditFormProps {
  initialData: {
    firstName: string
    lastName: string
    email: string
    telegram?: string
    linkedin?: string
    workStartTime?: string
    workEndTime?: string
    meetingInterval?: string
  }
  onCancel: () => void
  onSave: (data: ProfileEditFormProps['initialData']) => void
}

export default function ProfileEditForm({
  initialData,
  onCancel,
  onSave
}: ProfileEditFormProps) {
  const [formData, setFormData] = useState(initialData)
  const [telegramFocused, setTelegramFocused] = useState(false)
  const [linkedinFocused, setLinkedinFocused] = useState(false)

  const handleChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
    // Остаемся на странице редактирования (не переходим на другую)
  }

  return (
    <Box className={styles.editBlock}>
      {/* Заголовок */}
      <Box className={styles.header}>
        <Flex align="center" gap="2">
          <Pencil1Icon width="20" height="20" />
          <Text size="4" weight="bold">
            Редактирование профиля
          </Text>
        </Flex>
      </Box>

      {/* Форма */}
      <form onSubmit={handleSubmit} className={styles.form}>
        <Box className={styles.content}>
          <Grid columns="2" gap="4" width="100%" className={styles.grid}>
            {/* Левая колонка */}
            <Box>
              <FloatingLabelInput
                id="firstName"
                label="Имя"
                value={formData.firstName}
                onChange={handleChange('firstName')}
                required
                disabled
                icon={<PersonIcon width="16" height="16" />}
              />
            </Box>

            {/* Правая колонка */}
            <Box>
              <FloatingLabelInput
                id="lastName"
                label="Фамилия"
                value={formData.lastName}
                onChange={handleChange('lastName')}
                required
                disabled
                icon={<PersonIcon width="16" height="16" />}
              />
            </Box>
          </Grid>

          <Box style={{ marginTop: '16px' }}>
            <FloatingLabelInput
              id="email"
              label="Email"
              type="email"
              value={formData.email}
              onChange={handleChange('email')}
              required
              disabled
              icon={<EnvelopeClosedIcon width="16" height="16" />}
            />
          </Box>

          <Box style={{ marginTop: '16px' }}>
            <Box style={{ position: 'relative' }}>
              <Box
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: (telegramFocused || formData.telegram) && formData.telegram && formData.telegram.length > 0 ? '20px' : '50%',
                  transform: (telegramFocused || formData.telegram) && formData.telegram && formData.telegram.length > 0 ? 'none' : 'translateY(-50%)',
                  zIndex: 2,
                  color: telegramFocused ? 'var(--accent-9)' : 'var(--gray-11)',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'all 0.2s ease-in-out',
                  pointerEvents: 'none',
                }}
              >
                <PaperPlaneIcon width="16" height="16" />
              </Box>
              <Box
                style={{
                  position: 'absolute',
                  left: '44px',
                  top: (telegramFocused || formData.telegram) && formData.telegram && formData.telegram.length > 0 ? '20px' : '50%',
                  transform: (telegramFocused || formData.telegram) && formData.telegram && formData.telegram.length > 0 ? 'none' : 'translateY(-50%)',
                  color: 'var(--gray-11)',
                  pointerEvents: 'none',
                  zIndex: 3,
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                @
              </Box>
              <input
                id="telegram"
                type="text"
                value={formData.telegram || ''}
                onChange={handleChange('telegram')}
                onFocus={() => setTelegramFocused(true)}
                onBlur={() => setTelegramFocused(false)}
                style={{
                  width: '100%',
                  paddingTop: (telegramFocused || formData.telegram) && formData.telegram && formData.telegram.length > 0 ? '20px' : '12px',
                  paddingBottom: (telegramFocused || formData.telegram) && formData.telegram && formData.telegram.length > 0 ? '8px' : '12px',
                  paddingLeft: '60px',
                  paddingRight: '12px',
                  fontSize: '15px',
                  lineHeight: '20px',
                  borderRadius: '6px',
                  border: '1px solid var(--gray-a6)',
                  backgroundColor: 'var(--color-panel)',
                  color: 'var(--gray-12)',
                  outline: 'none',
                  transition: 'all 0.2s ease-in-out',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => {
                  setTelegramFocused(true)
                  e.currentTarget.style.borderColor = 'var(--accent-9)'
                  e.currentTarget.style.boxShadow = '0 0 0 1px var(--accent-9)'
                }}
                onBlur={(e) => {
                  setTelegramFocused(false)
                  e.currentTarget.style.borderColor = 'var(--gray-a6)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              />
              <Text
                as="label"
                htmlFor="telegram"
                size={(telegramFocused || formData.telegram) && formData.telegram && formData.telegram.length > 0 ? "1" : "3"}
                style={{
                  position: 'absolute',
                  left: '60px',
                  top: (telegramFocused || formData.telegram) && formData.telegram && formData.telegram.length > 0 ? '8px' : '50%',
                  transform: (telegramFocused || formData.telegram) && formData.telegram && formData.telegram.length > 0 ? 'translateY(0)' : 'translateY(-50%)',
                  color: telegramFocused ? 'var(--accent-9)' : 'var(--gray-11)',
                  pointerEvents: 'none',
                  transition: 'all 0.2s ease-in-out',
                  backgroundColor: (telegramFocused || formData.telegram) && formData.telegram && formData.telegram.length > 0 ? 'var(--color-panel)' : 'transparent',
                  padding: (telegramFocused || formData.telegram) && formData.telegram && formData.telegram.length > 0 ? '0 4px' : '0',
                  zIndex: 1,
                  fontWeight: (telegramFocused || formData.telegram) && formData.telegram && formData.telegram.length > 0 ? 500 : 400,
                }}
              >
                Telegram username
              </Text>
            </Box>
          </Box>

          <Box style={{ marginTop: '16px' }}>
            <Box style={{ position: 'relative' }}>
              <Box
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: (linkedinFocused || formData.linkedin) && formData.linkedin && formData.linkedin.length > 0 ? '20px' : '50%',
                  transform: (linkedinFocused || formData.linkedin) && formData.linkedin && formData.linkedin.length > 0 ? 'none' : 'translateY(-50%)',
                  zIndex: 2,
                  color: linkedinFocused ? 'var(--accent-9)' : 'var(--gray-11)',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'all 0.2s ease-in-out',
                  pointerEvents: 'none',
                }}
              >
                <LinkedInIcon width={16} height={16} />
              </Box>
              <input
                id="linkedin"
                type="text"
                value={formData.linkedin || ''}
                onChange={handleChange('linkedin')}
                onFocus={() => setLinkedinFocused(true)}
                onBlur={() => setLinkedinFocused(false)}
                style={{
                  width: '100%',
                  paddingTop: (linkedinFocused || formData.linkedin) && formData.linkedin && formData.linkedin.length > 0 ? '20px' : '12px',
                  paddingBottom: (linkedinFocused || formData.linkedin) && formData.linkedin && formData.linkedin.length > 0 ? '8px' : '12px',
                  paddingLeft: '44px',
                  paddingRight: '12px',
                  fontSize: '15px',
                  lineHeight: '20px',
                  borderRadius: '6px',
                  border: '1px solid var(--gray-a6)',
                  backgroundColor: 'var(--color-panel)',
                  color: 'var(--gray-12)',
                  outline: 'none',
                  transition: 'all 0.2s ease-in-out',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => {
                  setLinkedinFocused(true)
                  e.currentTarget.style.borderColor = 'var(--accent-9)'
                  e.currentTarget.style.boxShadow = '0 0 0 1px var(--accent-9)'
                }}
                onBlur={(e) => {
                  setLinkedinFocused(false)
                  e.currentTarget.style.borderColor = 'var(--gray-a6)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              />
              <Text
                as="label"
                htmlFor="linkedin"
                size={(linkedinFocused || formData.linkedin) && formData.linkedin && formData.linkedin.length > 0 ? "1" : "3"}
                style={{
                  position: 'absolute',
                  left: '44px',
                  top: (linkedinFocused || formData.linkedin) && formData.linkedin && formData.linkedin.length > 0 ? '8px' : '50%',
                  transform: (linkedinFocused || formData.linkedin) && formData.linkedin && formData.linkedin.length > 0 ? 'translateY(0)' : 'translateY(-50%)',
                  color: linkedinFocused ? 'var(--accent-9)' : 'var(--gray-11)',
                  pointerEvents: 'none',
                  transition: 'all 0.2s ease-in-out',
                  backgroundColor: (linkedinFocused || formData.linkedin) && formData.linkedin && formData.linkedin.length > 0 ? 'var(--color-panel)' : 'transparent',
                  padding: (linkedinFocused || formData.linkedin) && formData.linkedin && formData.linkedin.length > 0 ? '0 4px' : '0',
                  zIndex: 1,
                  fontWeight: (linkedinFocused || formData.linkedin) && formData.linkedin && formData.linkedin.length > 0 ? 500 : 400,
                }}
              >
                LinkedIn username
              </Text>
            </Box>
          </Box>

          <Grid columns="2" gap="4" width="100%" style={{ marginTop: '16px' }} className={styles.grid}>
            <Box>
              <FloatingLabelInput
                id="workStartTime"
                label="Начало рабочего времени"
                type="time"
                value={formData.workStartTime || ''}
                onChange={handleChange('workStartTime')}
                icon={<ClockIcon width="16" height="16" />}
              />
              <Text size="1" color="gray" style={{ marginTop: '4px', display: 'block' }}>
                Время начала рабочего дня для планирования интервью
              </Text>
            </Box>

            <Box>
              <FloatingLabelInput
                id="workEndTime"
                label="Конец рабочего времени"
                type="time"
                value={formData.workEndTime || ''}
                onChange={handleChange('workEndTime')}
                icon={<ClockIcon width="16" height="16" />}
              />
              <Text size="1" color="gray" style={{ marginTop: '4px', display: 'block' }}>
                Время окончания рабочего дня для планирования интервью
              </Text>
            </Box>
          </Grid>

          <Box style={{ marginTop: '16px' }}>
            <FloatingLabelInput
              id="meetingInterval"
              label="Время между встречами"
              type="number"
              value={formData.meetingInterval || ''}
              onChange={handleChange('meetingInterval')}
              icon={<ClockIcon width="16" height="16" />}
            />
            <Text size="1" color="gray" style={{ marginTop: '4px', display: 'block' }}>
              Время между встречами в минутах (кратно 5, от 0 до 60)
            </Text>
          </Box>
        </Box>

        {/* Кнопки */}
        <Flex justify="between" align="center" className={styles.actions}>
          <Button
            type="button"
            variant="soft"
            onClick={onCancel}
          >
            <ChevronLeftIcon width="16" height="16" />
            Отмена
          </Button>
          
          <Button
            type="submit"
            className={styles.saveButton}
          >
            <SaveIcon width="16" height="16" />
            Сохранить изменения
          </Button>
        </Flex>
      </form>
    </Box>
  )
}

// SVG иконка для сохранения
const SaveIcon = ({ width = 16, height = 16 }: { width?: number; height?: number }) => (
  <svg width={width} height={height} viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M3 2.5C3 2.22386 3.22386 2 3.5 2H9.08579C9.351 2 9.60536 2.10536 9.79289 2.29289L12.7071 5.20711C12.8946 5.39464 13 5.649 13 5.91421V12.5C13 12.7761 12.7761 13 12.5 13H3.5C3.22386 13 3 12.7761 3 12.5V2.5ZM4 3V12H12V5.91421L9.08579 3H4ZM5.5 3H8.5V5H5.5V3ZM5.5 6.5H9.5V7.5H5.5V6.5ZM5.5 9H9.5V10H5.5V9Z"
      fill="currentColor"
      fillRule="evenodd"
      clipRule="evenodd"
    />
  </svg>
)
