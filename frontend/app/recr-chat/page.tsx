'use client'

import React, { useState, useEffect } from 'react'
import AppLayout from "@/components/AppLayout"
import WorkflowChat from "@/components/workflow/WorkflowChat"
import SlotsPanel from "@/components/workflow/SlotsPanel"
import { Box, Flex, Text, TextField, Button, Tabs, Badge, Avatar, Separator, Card, Table, Select, Dialog, Checkbox } from "@radix-ui/themes"
import { 
  MagnifyingGlassIcon, 
  PersonIcon, 
  ChatBubbleIcon, 
  GearIcon,
  FileTextIcon,
  CalendarIcon,
  ClockIcon,
  EnvelopeClosedIcon,
  PaperPlaneIcon,
  CheckCircledIcon,
  CrossCircledIcon,
  StarIcon,
  Pencil1Icon,
  TrashIcon,
  PlusIcon,
  DownloadIcon,
  EyeOpenIcon,
  Cross2Icon,
  ExternalLinkIcon,
  GlobeIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  Link2Icon,
  CheckIcon,
  ClipboardIcon,
  VideoIcon,
  BoxIcon,
  ReloadIcon,
  OpenInNewWindowIcon
} from "@radix-ui/react-icons"
import { 
  BiLogoWhatsapp,
  BiLogoTelegram,
  BiLogoVk,
  BiLogoLinkedin,
  BiLogoDribbble,
  BiLogoBehance,
  BiLogoPinterest,
  BiLogoGithub,
  BiLogoInstagram,
  BiLogoFacebook,
  BiLogoTwitter,
  BiCodeAlt
} from "react-icons/bi"
import { SiViber } from "react-icons/si"
import styles from './recr-chat.module.css'

// Моковые данные
const mockCandidates = [
  {
    id: '1',
    name: 'John Doe',
    position: 'Senior Developer',
    status: 'Interview',
    statusColor: '#8B5CF6',
    avatar: 'JD',
    timeAgo: '2 days ago',
    unread: 2,
    email: 'john@example.com',
    phone: '+1 (555) 123-4567',
    location: 'New York, USA',
    // Социальные сети и мессенджеры
    whatsapp: '+15551234567',
    viber: '+15551234567',
    telegram: '@johndoe',
    vk: 'johndoe',
    linkedin: '/in/johndoe',
    dribbble: 'johndoe',
    behance: 'johndoe',
    pinterest: 'johndoe',
    habrCareer: 'johndoe',
    github: 'johndoe',
    instagram: '@johndoe',
    facebook: 'johndoe',
    twitter: '@johndoe',
    rating: 4,
    vacancy: 'Frontend Senior',
    applied: 'Jan 15, 2026',
    source: 'LinkedIn',
    tags: ['React', 'TypeScript', 'Senior'],
    level: 'Senior',
    age: 32,
    gender: 'Мужской',
    salaryExpectations: '150,000 - 200,000 USD'
  },
  {
    id: '2',
    name: 'Jane Smith',
    position: 'Product Manager',
    status: 'New',
    statusColor: '#2180A0',
    avatar: 'JS',
    timeAgo: '5 hours ago',
    unread: 0,
    email: 'jane@example.com',
    phone: '+1 (555) 234-5678',
    location: 'San Francisco, USA',
    // Социальные сети и мессенджеры
    whatsapp: '+15552345678',
    telegram: '@janesmith',
    linkedin: '/in/janesmith',
    behance: 'janesmith',
    habrCareer: 'janesmith',
    rating: 5,
    vacancy: 'Product Designer',
    applied: 'Jan 20, 2026',
    source: 'Referral'
  },
  {
    id: '3',
    name: 'Mike Chen',
    position: 'Designer',
    status: 'Rejected',
    statusColor: '#EF4444',
    avatar: 'MC',
    timeAgo: '1 day ago',
    unread: 0,
    email: 'mike@example.com',
    phone: '+1 (555) 345-6789',
    location: 'Los Angeles, USA',
    // Социальные сети и мессенджеры
    linkedin: '/in/mikechen',
    dribbble: 'mikechen',
    behance: 'mikechen',
    pinterest: 'mikechen',
    instagram: '@mikechen',
    rating: 3,
    vacancy: 'UI Designer',
    applied: 'Jan 18, 2026',
    source: 'Job Board'
  }
]

const mockConversations = [
  {
    id: '1',
    candidateId: '1',
    name: 'John Doe',
    avatar: 'JD',
    lastMessage: 'Sure, let me check...',
    timestamp: 'Today 3:45 PM',
    unread: 3,
    channel: 'email',
    favourite: true
  },
  {
    id: '2',
    candidateId: '2',
    name: 'Jane Smith',
    avatar: 'JS',
    lastMessage: 'Thanks for the update!',
    timestamp: 'Today 1:20 PM',
    unread: 0,
    channel: 'telegram',
    favourite: false
  }
]

const mockVacancies = [
  {
    id: '1',
    title: 'Frontend Senior',
    department: 'Engineering',
    priority: 'High',
    priorityColor: '#EF4444',
    pipeline: { new: 5, interview: 3, offer: 1 },
    recruiter: 'Alice',
    deadline: 'Jan 30',
    status: 'Open'
  },
  {
    id: '2',
    title: 'Product Designer',
    department: 'Design',
    priority: 'Medium',
    priorityColor: '#F59E0B',
    pipeline: { new: 2, interview: 1, offer: 0 },
    recruiter: 'Bob',
    deadline: 'Feb 15',
    status: 'Paused'
  }
]

const mockHistory = [
  {
    id: '1',
    type: 'status',
    date: 'Jan 20, 2026 · 8:45 PM',
    text: 'You moved John to "Interview"',
    icon: '📌'
  },
  {
    id: '2',
    type: 'message',
    date: 'Jan 20, 2026 · 5:30 PM',
    text: 'Message from John: "Thanks for the update! Looking forward to the interview."',
    icon: '💬'
  },
  {
    id: '3',
    type: 'interview',
    date: 'Jan 20, 2026 · 2:00 PM',
    text: 'Interview scheduled for Jan 25 at 3:00 PM',
    icon: '📅'
  }
]

// Функция для получения URL социальной сети
const getSocialUrl = (platform: string, value: string): string => {
  if (!value) return ''
  
  const cleanValue = value.replace(/^[@\/]/, '')
  
  const urls: Record<string, (val: string) => string> = {
    whatsapp: (val) => `https://wa.me/${val.replace(/[^\d]/g, '')}`,
    viber: (val) => `viber://chat?number=${val.replace(/[^\d]/g, '')}`,
    telegram: (val) => `https://t.me/${cleanValue}`,
    vk: (val) => `https://vk.com/${cleanValue}`,
    linkedin: (val) => val.startsWith('http') ? val : `https://linkedin.com${val.startsWith('/') ? val : '/' + val}`,
    dribbble: (val) => `https://dribbble.com/${cleanValue}`,
    behance: (val) => `https://behance.net/${cleanValue}`,
    pinterest: (val) => `https://pinterest.com/${cleanValue}`,
    habrCareer: (val) => `https://career.habr.com/${cleanValue}`,
    github: (val) => `https://github.com/${cleanValue}`,
    instagram: (val) => `https://instagram.com/${cleanValue}`,
    facebook: (val) => `https://facebook.com/${cleanValue}`,
    twitter: (val) => `https://twitter.com/${cleanValue}`,
  }
  
  return urls[platform]?.(value) || ''
}

// Функция для получения названия, цвета и иконки платформы
const getPlatformInfo = (platform: string): { name: string; color: string; icon: React.ReactNode } => {
  const iconSize = 16 // Размер для круглых кнопок 35x35 (уменьшен на 25%)
  
  const platforms: Record<string, { name: string; color: string; icon: React.ReactNode }> = {
    whatsapp: { name: 'WhatsApp', color: '#25D366', icon: <BiLogoWhatsapp size={iconSize} /> },
    viber: { name: 'Viber', color: '#665CAC', icon: <SiViber size={iconSize} /> },
    telegram: { name: 'Telegram', color: '#0088cc', icon: <BiLogoTelegram size={iconSize} /> },
    vk: { name: 'VK', color: '#0077FF', icon: <BiLogoVk size={iconSize} /> },
    linkedin: { name: 'LinkedIn', color: '#0077B5', icon: <BiLogoLinkedin size={iconSize} /> },
    dribbble: { name: 'Dribbble', color: '#EA4C89', icon: <BiLogoDribbble size={iconSize} /> },
    behance: { name: 'Behance', color: '#1769FF', icon: <BiLogoBehance size={iconSize} /> },
    pinterest: { name: 'Pinterest', color: '#BD081C', icon: <BiLogoPinterest size={iconSize} /> },
    habrCareer: { name: 'Хабр Карьера', color: '#2A7DE1', icon: <BiCodeAlt size={iconSize} /> }, // Используем CodeAlt для Хабра
    github: { name: 'GitHub', color: '#181717', icon: <BiLogoGithub size={iconSize} /> },
    instagram: { name: 'Instagram', color: '#E4405F', icon: <BiLogoInstagram size={iconSize} /> },
    facebook: { name: 'Facebook', color: '#1877F2', icon: <BiLogoFacebook size={iconSize} /> },
    twitter: { name: 'Twitter', color: '#1DA1F2', icon: <BiLogoTwitter size={iconSize} /> },
  }
  
  return platforms[platform] || { name: platform, color: '#6B7280', icon: <ExternalLinkIcon width={iconSize} height={iconSize} /> }
}

type WorkflowType = 'screening' | 'interview'
type InterviewFormat = 'online' | 'office'

interface Interviewer {
  id: string
  name: string
}

export default function RecrChatPage() {
  const [leftTab, setLeftTab] = useState<'candidates' | 'chat' | 'vacancy-settings'>('candidates')
  const [rightTab, setRightTab] = useState<'info' | 'history' | 'activity' | 'documents'>('info')
  const [selectedCandidate, setSelectedCandidate] = useState(mockCandidates[0])
  const [searchQuery, setSearchQuery] = useState('')
  const [isRightColumnOpen, setIsRightColumnOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  
  // Состояние для кнопок workflow
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowType>('screening')
  const [interviewFormat, setInterviewFormat] = useState<InterviewFormat>('online')
  const [selectedInterviewers, setSelectedInterviewers] = useState<string[]>([])
  const [slotsOpen, setSlotsOpen] = useState(false)
  
  // Моковые данные интервьюеров
  const interviewers: Interviewer[] = [
    { id: '1', name: 'Иван Петров' },
    { id: '2', name: 'Мария Сидорова' },
    { id: '3', name: 'Алексей Иванов' },
  ]
  
  const handleInterviewerToggle = (interviewerId: string) => {
    setSelectedInterviewers(prev =>
      prev.includes(interviewerId)
        ? prev.filter(id => id !== interviewerId)
        : [...prev, interviewerId]
    )
  }
  
  // Настройки вакансии
  const [selectedSettingTab, setSelectedSettingTab] = useState<'text' | 'recruiters' | 'customers' | 'questions' | 'integrations' | 'statuses' | 'salary'>('text')
  
  // Состояние редактирования социальных сетей
  const [editingSocial, setEditingSocial] = useState<string | null>(null)
  const [socialValues, setSocialValues] = useState<Record<string, string>>({})
  
  // Состояние редактирования локации
  const [isEditingLocation, setIsEditingLocation] = useState(false)
  const [locationValue, setLocationValue] = useState(selectedCandidate.location)
  
  // Состояние редактирования контактов
  const [isEditingEmail, setIsEditingEmail] = useState(false)
  const [emailValue, setEmailValue] = useState(selectedCandidate.email)
  const [isEditingPhone, setIsEditingPhone] = useState(false)
  const [phoneValue, setPhoneValue] = useState(selectedCandidate.phone)
  
  // Состояние редактирования меток и уровня
  const [isEditingTags, setIsEditingTags] = useState(false)
  const [tagsValue, setTagsValue] = useState((selectedCandidate.tags || []).join(', '))
  const [isEditingLevel, setIsEditingLevel] = useState(false)
  const [levelValue, setLevelValue] = useState(selectedCandidate.level || '')
  
  // Состояние редактирования дополнительных полей
  const [isEditingAge, setIsEditingAge] = useState(false)
  const [ageValue, setAgeValue] = useState(selectedCandidate.age?.toString() || '')
  const [isEditingGender, setIsEditingGender] = useState(false)
  const [genderValue, setGenderValue] = useState(selectedCandidate.gender || '')
  const [isEditingSalary, setIsEditingSalary] = useState(false)
  const [salaryValue, setSalaryValue] = useState(selectedCandidate.salaryExpectations || '')
  
  // Состояние редактирования Position
  const [isEditingPosition, setIsEditingPosition] = useState(false)
  const [positionValue, setPositionValue] = useState(selectedCandidate.position || '')
  
  // Состояние редактирования Source (Applied не редактируется)
  const [isEditingSource, setIsEditingSource] = useState(false)
  const [sourceValue, setSourceValue] = useState(selectedCandidate.source || '')
  
  // Варианты для поля "Пол"
  const genderOptions = ['Мужской', 'Женский', 'Не указано']
  
  // Состояние статуса и причин отказа
  const [showOtherFields, setShowOtherFields] = useState(false)
  
  // Порядок статусов для перехода
  const statusOrder = ['New', 'Under Review', 'Interview', 'Offer', 'Accepted', 'Rejected', 'Declined', 'Archived']
  const rejectionReasons = [
    'Не подходит по опыту',
    'Не подходит по навыкам',
    'Зарплатные ожидания слишком высокие',
    'Не подходит по локации',
    'Другая причина'
  ]
  
  const getNextStatus = (currentStatus: string) => {
    const currentIndex = statusOrder.findIndex(s => s === currentStatus)
    if (currentIndex >= 0 && currentIndex < statusOrder.length - 1) {
      return statusOrder[currentIndex + 1]
    }
    return currentStatus
  }
  
  const handleStatusChange = (newStatus: string) => {
    setSelectedCandidate(prev => ({
      ...prev,
      status: newStatus,
      statusColor: getStatusColor(newStatus)
    }))
  }
  
  const handleNextStatus = () => {
    const nextStatus = getNextStatus(selectedCandidate.status)
    if (nextStatus !== selectedCandidate.status) {
      handleStatusChange(nextStatus)
    }
  }
  
  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      'New': '#2180A0',
      'Under Review': '#3B82F6',
      'Interview': '#8B5CF6',
      'Offer': '#22C55E',
      'Accepted': '#10B981',
      'Rejected': '#EF4444',
      'Declined': '#F59E0B',
      'Archived': '#6B7280'
    }
    return statusColors[status] || '#6B7280'
  }
  
  useEffect(() => {
    setLocationValue(selectedCandidate.location)
    setEmailValue(selectedCandidate.email)
    setPhoneValue(selectedCandidate.phone)
    setTagsValue((selectedCandidate.tags || []).join(', '))
    setLevelValue(selectedCandidate.level || '')
    setAgeValue(selectedCandidate.age?.toString() || '')
    setGenderValue(selectedCandidate.gender || '')
    setSalaryValue(selectedCandidate.salaryExpectations || '')
    setPositionValue(selectedCandidate.position || '')
    setSourceValue(selectedCandidate.source || '')
  }, [selectedCandidate.location, selectedCandidate.email, selectedCandidate.phone, selectedCandidate.tags, selectedCandidate.level, selectedCandidate.age, selectedCandidate.gender, selectedCandidate.salaryExpectations, selectedCandidate.position, selectedCandidate.source])
  
  const handleEmailSave = () => {
    setSelectedCandidate(prev => ({ ...prev, email: emailValue }))
    setIsEditingEmail(false)
  }
  
  const handlePhoneSave = () => {
    setSelectedCandidate(prev => ({ ...prev, phone: phoneValue }))
    setIsEditingPhone(false)
  }
  
  const handleTagsSave = () => {
    const tags = tagsValue.split(',').map(t => t.trim()).filter(t => t.length > 0)
    setSelectedCandidate(prev => ({ ...prev, tags }))
    setIsEditingTags(false)
  }
  
  const handleLevelSave = () => {
    setSelectedCandidate(prev => ({ ...prev, level: levelValue }))
    setIsEditingLevel(false)
  }
  
  const handleAgeSave = () => {
    setSelectedCandidate(prev => ({ ...prev, age: ageValue ? parseInt(ageValue) : undefined }))
    setIsEditingAge(false)
  }
  
  const handleGenderSave = () => {
    setSelectedCandidate(prev => ({ ...prev, gender: genderValue }))
    setIsEditingGender(false)
  }
  
  const handleSalarySave = () => {
    setSelectedCandidate(prev => ({ ...prev, salaryExpectations: salaryValue }))
    setIsEditingSalary(false)
  }
  
  const handlePositionSave = () => {
    setSelectedCandidate(prev => ({ ...prev, position: positionValue }))
    setIsEditingPosition(false)
  }
  
  const handleSourceSave = () => {
    setSelectedCandidate(prev => ({ ...prev, source: sourceValue }))
    setIsEditingSource(false)
  }
  
  // Получить все социальные сети (включая те, у которых нет контакта)
  const getAllSocialNetworks = () => {
    const socialPlatforms = ['whatsapp', 'viber', 'telegram', 'vk', 'linkedin', 'dribbble', 'behance', 'pinterest', 'habrCareer', 'github', 'instagram', 'facebook', 'twitter'] as const
    return socialPlatforms.map(platform => {
      const value = socialValues[platform] || selectedCandidate[platform as keyof typeof selectedCandidate]
      const hasContact = value && typeof value === 'string' && value.trim() !== ''
      return {
        platform,
        value: hasContact ? (value as string) : '',
        hasContact,
        ...getPlatformInfo(platform)
      }
    })
  }
  
  // Инициализация значений социальных сетей
  useEffect(() => {
    const values: Record<string, string> = {}
    const socialPlatforms = ['whatsapp', 'viber', 'telegram', 'vk', 'linkedin', 'dribbble', 'behance', 'pinterest', 'habrCareer', 'github', 'instagram', 'facebook', 'twitter'] as const
    socialPlatforms.forEach(platform => {
      const value = selectedCandidate[platform as keyof typeof selectedCandidate]
      values[platform] = (value && typeof value === 'string') ? value : ''
    })
    setSocialValues(values)
  }, [selectedCandidate])
  
  const handleSocialEdit = (platform: string) => {
    setEditingSocial(platform)
  }
  
  const handleSocialSave = (platform: string) => {
    // TODO: Сохранить значение в базу данных
    // Пока просто обновляем локальное состояние
    const newValue = socialValues[platform] || ''
    setSelectedCandidate(prev => ({
      ...prev,
      [platform]: newValue
    }))
    setEditingSocial(null)
  }
  
  const handleSocialCancel = () => {
    // Восстанавливаем исходное значение
    const originalValue = selectedCandidate[editingSocial as keyof typeof selectedCandidate] as string || ''
    setSocialValues(prev => ({ ...prev, [editingSocial!]: originalValue }))
    setEditingSocial(null)
  }
  
  const handleSocialValueChange = (platform: string, value: string) => {
    setSocialValues(prev => ({ ...prev, [platform]: value }))
  }
  
  const handleSocialInputKeyDown = (e: React.KeyboardEvent, platform: string) => {
    if (e.key === 'Enter') {
      handleSocialSave(platform)
    } else if (e.key === 'Escape') {
      handleSocialCancel()
    }
  }
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 800)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  
  const handleCandidateSelect = (candidate: typeof mockCandidates[0]) => {
    setSelectedCandidate(candidate)
    // На мобильных открываем правую колонку как модальное окно
    if (isMobile) {
      setIsRightColumnOpen(true)
    } else {
      // На десктопе всегда показываем правую колонку
      setIsRightColumnOpen(false)
    }
  }
  
  // На десктопе правая колонка всегда видна
  useEffect(() => {
    if (!isMobile) {
      setIsRightColumnOpen(false)
    }
  }, [isMobile])
  
  const handleCloseRightColumn = () => {
    setIsRightColumnOpen(false)
  }

  const handleLogout = () => {
    // TODO: Implement logout
    console.log('Logout')
  }

  return (
    <AppLayout pageTitle="RECR&CHAT" onLogout={handleLogout}>
      {/* Кнопки workflow сразу после StatusBar */}
      <Box className={styles.workflowButtonsContainer} mb="3">
        <Flex gap="3" align="center" justify="between" wrap="wrap">
          {/* Быстрые кнопки слева */}
          <Flex gap="2" align="center" style={{ flexShrink: 0 }}>
            <Box className={styles.quickButton} style={{ backgroundColor: '#ef4444', position: 'relative' }}>
              <Link2Icon width={20} height={20} style={{ color: '#ffffff', fontWeight: 'bold' }} />
              <Box className={styles.flagBadge} title="Беларусь">
                <Text style={{ fontSize: '20px', lineHeight: 1 }}>🇧🇾</Text>
              </Box>
            </Box>
            <Box className={styles.quickButton} style={{ backgroundColor: '#f97316', position: 'relative' }}>
              <Text size="4" weight="bold" style={{ color: '#ffffff' }}>?</Text>
              <Box className={styles.flagBadge} title="Беларусь">
                <Text style={{ fontSize: '20px', lineHeight: 1 }}>🇧🇾</Text>
              </Box>
            </Box>
            <Box className={styles.quickButton} style={{ backgroundColor: '#eab308', position: 'relative' }}>
              <Link2Icon width={20} height={20} style={{ color: '#ffffff', fontWeight: 'bold' }} />
              <Box className={styles.flagBadge} title="Польша">
                <Text style={{ fontSize: '20px', lineHeight: 1 }}>🇵🇱</Text>
              </Box>
            </Box>
            <Box className={styles.quickButton} style={{ backgroundColor: '#3b82f6', position: 'relative' }}>
              <Text size="4" weight="bold" style={{ color: '#ffffff' }}>?</Text>
              <Box className={styles.flagBadge} title="Польша">
                <Text style={{ fontSize: '20px', lineHeight: 1 }}>🇵🇱</Text>
              </Box>
            </Box>
            <Box className={styles.quickButton} style={{ backgroundColor: '#06b6d4' }}>
              <CalendarIcon width={20} height={20} style={{ color: '#ffffff', fontWeight: 'bold' }} />
            </Box>
            <Box className={styles.quickButton} style={{ backgroundColor: '#6b7280' }}>
              <Text size="3" weight="bold" style={{ color: '#ffffff' }}>📄</Text>
            </Box>
            <Box className={styles.quickButton} style={{ backgroundColor: '#10b981' }}>
              <Text size="5" weight="bold" style={{ color: '#ffffff' }}>+</Text>
            </Box>
          </Flex>

          {/* Тогглеры и кнопка справа */}
          <Flex gap="3" align="center" style={{ flexShrink: 0 }}>
            {/* Тогглер этапов процесса */}
            <Flex gap="3" align="center">
              <Box
                className={styles.workflowButton}
                data-selected={selectedWorkflow === 'screening'}
                onClick={() => setSelectedWorkflow('screening')}
              >
                <Flex align="center" gap="2">
                  <Box className={styles.workflowIcon}>
                    <ClipboardIcon width={18} height={18} />
                  </Box>
                  <Box>
                    <Text size="2" weight="bold" style={{ display: 'block', color: '#ffffff' }}>
                      Скрининг
                    </Text>
                    <Text size="1" style={{ opacity: 0.9, color: '#ffffff' }}>
                      30 мин
                    </Text>
                  </Box>
                </Flex>
                {selectedWorkflow === 'screening' && (
                  <Box className={styles.selectedBadge}>
                    <CheckIcon width={12} height={12} style={{ color: '#ffffff' }} />
                  </Box>
                )}
              </Box>
              
              <Box
                className={styles.workflowButton}
                data-selected={selectedWorkflow === 'interview'}
                onClick={() => setSelectedWorkflow('interview')}
              >
                <Flex align="center" gap="2">
                  <Box className={styles.workflowIcon}>
                    <PersonIcon width={18} height={18} />
                  </Box>
                  <Box>
                    <Text size="2" weight="bold" style={{ display: 'block', color: '#ffffff' }}>
                      Интервью
                    </Text>
                    <Text size="1" style={{ opacity: 0.9, color: '#ffffff' }}>
                      90 мин
                    </Text>
                  </Box>
                </Flex>
                {selectedWorkflow === 'interview' && (
                  <Box className={styles.selectedBadge}>
                    <CheckIcon width={12} height={12} style={{ color: '#ffffff' }} />
                  </Box>
                )}
              </Box>
            </Flex>
            
            {/* Кнопка со слотами */}
            <Button
              variant="soft"
              size="2"
              onClick={() => setSlotsOpen(true)}
              style={{
                backgroundColor: 'var(--accent-3)',
                color: 'var(--accent-11)',
                flexShrink: 0
              }}
            >
              <ClockIcon width={16} height={16} />
              <Text size="2">слоты</Text>
            </Button>
          </Flex>
        </Flex>

        {/* Блок настроек интервью (показывается только при выборе "Интервью") */}
        {selectedWorkflow === 'interview' && (
          <Box className={styles.interviewOptionsPanel} mt="2">
            <Flex gap="4" align="center" wrap="wrap">
              {/* Тогглер формата интервью */}
              <Flex gap="2" align="center">
                <Box
                  className={styles.formatButton}
                  data-selected={interviewFormat === 'online'}
                  onClick={() => setInterviewFormat('online')}
                >
                  <VideoIcon width={16} height={16} />
                  <Text size="2" weight="medium">Онлайн</Text>
                </Box>
                <Box
                  className={styles.formatButton}
                  data-selected={interviewFormat === 'office'}
                  onClick={() => setInterviewFormat('office')}
                >
                  <BoxIcon width={16} height={16} />
                  <Text size="2" weight="medium">Офис</Text>
                </Box>
              </Flex>

              {/* Вертикальная линия-разделитель */}
              <Separator orientation="vertical" style={{ height: '24px' }} />

              {/* Чекбоксы интервьюеров */}
              <Flex gap="3" align="center" wrap="wrap">
                {interviewers.map(interviewer => (
                  <Flex key={interviewer.id} align="center" gap="2">
                    <Checkbox
                      checked={selectedInterviewers.includes(interviewer.id)}
                      onCheckedChange={() => handleInterviewerToggle(interviewer.id)}
                    />
                    <Text size="2">{interviewer.name}</Text>
                  </Flex>
                ))}
              </Flex>
            </Flex>
          </Box>
        )}
      </Box>
      
      <Box className={styles.container}>
      {/* Левая колонка */}
      <Box className={styles.leftColumn}>
        {/* Переключатель табов */}
        <Flex gap="2" mb="4" className={styles.tabSwitcher}>
          <Button
            variant={leftTab === 'candidates' ? 'solid' : 'soft'}
            onClick={() => setLeftTab('candidates')}
            className={styles.tabButton}
          >
            <PersonIcon width={16} height={16} />
            <Text size="2">Candidates</Text>
            <Badge size="1" color="gray">{mockCandidates.length}</Badge>
          </Button>
          <Button
            variant={leftTab === 'chat' ? 'solid' : 'soft'}
            onClick={() => setLeftTab('chat')}
            className={styles.tabButton}
          >
            <ChatBubbleIcon width={16} height={16} />
            <Text size="2">Chat</Text>
            <Badge size="1" color="red">{mockConversations.filter(c => c.unread > 0).length}</Badge>
          </Button>
          <Button
            variant={leftTab === 'vacancy-settings' ? 'solid' : 'soft'}
            onClick={() => setLeftTab('vacancy-settings')}
            className={styles.tabButton}
          >
            <GearIcon width={16} height={16} />
            <Text size="2">Настройки вакансии</Text>
          </Button>
        </Flex>

        {/* Поиск */}
        <TextField.Root
          placeholder={`Search ${leftTab}...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          mb="3"
        >
          <TextField.Slot>
            <MagnifyingGlassIcon width={16} height={16} />
          </TextField.Slot>
        </TextField.Root>

        {/* Контент табов */}
        {leftTab === 'candidates' && (
          <Box className={styles.candidatesList}>
            {mockCandidates.map((candidate) => (
              <Box
                key={candidate.id}
                className={`${styles.candidateItem} ${selectedCandidate.id === candidate.id ? styles.selected : ''}`}
                onClick={() => handleCandidateSelect(candidate)}
              >
                <Flex align="center" gap="3">
                  <Avatar
                    size="3"
                    fallback={candidate.avatar}
                    style={{ backgroundColor: candidate.statusColor }}
                  />
                  <Flex direction="column" style={{ flex: 1, minWidth: 0 }}>
                    <Flex align="center" gap="2">
                      <Text size="3" weight="bold">{candidate.name}</Text>
                      {candidate.unread > 0 && (
                        <Badge size="1" color="red">{candidate.unread}</Badge>
                      )}
                    </Flex>
                    <Text size="2" color="gray">{candidate.position}</Text>
                    <Flex align="center" gap="2" mt="1">
                      <Badge
                        size="1"
                        style={{
                          backgroundColor: candidate.statusColor,
                          color: 'white'
                        }}
                      >
                        {candidate.status}
                      </Badge>
                      <Text size="1" color="gray">· {candidate.timeAgo}</Text>
                    </Flex>
                  </Flex>
                </Flex>
              </Box>
            ))}
          </Box>
        )}

        {leftTab === 'chat' && (
          <Box className={styles.chatContainer}>
            <WorkflowChat />
          </Box>
        )}

        {leftTab === 'vacancy-settings' && (
          <Box className={styles.vacancySettings}>
            <Card>
              <Flex direction="column" gap="4">
                <Text size="4" weight="bold">Настройки вакансии</Text>
                <Separator size="4" />
                
                {/* Пункты меню настроек */}
                <Box>
                  <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
                    Разделы настроек
                  </Text>
                    <Flex direction="column" gap="1">
                      <Button
                        variant={selectedSettingTab === 'text' ? 'solid' : 'soft'}
                        onClick={() => setSelectedSettingTab('text')}
                        style={{ justifyContent: 'flex-start', width: '100%' }}
                      >
                        <Text size="2">Текст вакансии</Text>
                      </Button>
                      <Button
                        variant={selectedSettingTab === 'recruiters' ? 'solid' : 'soft'}
                        onClick={() => setSelectedSettingTab('recruiters')}
                        style={{ justifyContent: 'flex-start', width: '100%' }}
                      >
                        <Text size="2">Рекрутеры</Text>
                      </Button>
                      <Button
                        variant={selectedSettingTab === 'customers' ? 'solid' : 'soft'}
                        onClick={() => setSelectedSettingTab('customers')}
                        style={{ justifyContent: 'flex-start', width: '100%' }}
                      >
                        <Text size="2">Заказчики и интервьюеры</Text>
                      </Button>
                      <Button
                        variant={selectedSettingTab === 'questions' ? 'solid' : 'soft'}
                        onClick={() => setSelectedSettingTab('questions')}
                        style={{ justifyContent: 'flex-start', width: '100%' }}
                      >
                        <Text size="2">Вопросы и ссылки</Text>
                      </Button>
                      <Button
                        variant={selectedSettingTab === 'integrations' ? 'solid' : 'soft'}
                        onClick={() => setSelectedSettingTab('integrations')}
                        style={{ justifyContent: 'flex-start', width: '100%' }}
                      >
                        <Text size="2">Связи и интеграции</Text>
                      </Button>
                      <Button
                        variant={selectedSettingTab === 'statuses' ? 'solid' : 'soft'}
                        onClick={() => setSelectedSettingTab('statuses')}
                        style={{ justifyContent: 'flex-start', width: '100%' }}
                      >
                        <Text size="2">Статусы</Text>
                      </Button>
                      <Button
                        variant={selectedSettingTab === 'salary' ? 'solid' : 'soft'}
                        onClick={() => setSelectedSettingTab('salary')}
                        style={{ justifyContent: 'flex-start', width: '100%' }}
                      >
                        <Text size="2">Зарплатные вилки</Text>
                      </Button>
                    </Flex>
                </Box>
              </Flex>
            </Card>
          </Box>
        )}
      </Box>

      {/* Затемнение фона для мобильных */}
      {isMobile && isRightColumnOpen && (
        <Box
          className={styles.modalOverlay}
          onClick={handleCloseRightColumn}
        />
      )}
      
      {/* Правая колонка */}
      <Box className={`${styles.rightColumn} ${isRightColumnOpen ? styles.open : ''}`}>
        <Card className={styles.candidateCard}>
          {/* Кнопка закрытия для мобильных */}
          {isMobile && (
            <Button
              variant="ghost"
              size="2"
              onClick={handleCloseRightColumn}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                zIndex: 10,
              }}
            >
              <Cross2Icon width={20} height={20} />
            </Button>
          )}
          {/* Header */}
          <Flex direction="column" gap="3" mb="4">
            <Flex align="center" gap="3">
              <Avatar
                size="5"
                fallback={selectedCandidate.avatar}
                style={{ backgroundColor: selectedCandidate.statusColor }}
              />
              <Flex direction="column" style={{ flex: 1 }}>
                <Text size="5" weight="bold">{selectedCandidate.name}</Text>
                <Text size="3" color="gray">{selectedCandidate.position}</Text>
                <Text size="2" color="gray">{selectedCandidate.email}</Text>
              </Flex>
            </Flex>

            <Flex align="center" gap="2" style={{ flexWrap: 'wrap' }}>
              <Text size="2" weight="medium" style={{ flexShrink: 0 }}>Status:</Text>
              <Select.Root
                value={selectedCandidate.status}
                onValueChange={handleStatusChange}
              >
                <Select.Trigger 
                  style={{ 
                    backgroundColor: selectedCandidate.statusColor,
                    color: 'white',
                    borderColor: selectedCandidate.statusColor,
                    minWidth: '120px'
                  }} 
                />
                <Select.Content>
                  {statusOrder.filter(s => s !== 'Все').map((status) => (
                    <Select.Item key={status} value={status}>
                      {status}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
              {selectedCandidate.status === 'Rejected' && (
                <Select.Root defaultValue={rejectionReasons[0]}>
                  <Select.Trigger 
                    style={{ 
                      minWidth: '180px'
                    }} 
                    placeholder="Причина отказа"
                  />
                  <Select.Content>
                    {rejectionReasons.map((reason) => (
                      <Select.Item key={reason} value={reason}>
                        {reason}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>
              )}
              <Button
                size="2"
                variant="soft"
                onClick={handleNextStatus}
                disabled={getNextStatus(selectedCandidate.status) === selectedCandidate.status}
                style={{ flexShrink: 0 }}
              >
                <Text size="3">→</Text>
              </Button>
            </Flex>

            <Badge size="2" color="blue">
              🎯 {selectedCandidate.vacancy} · {selectedCandidate.status}
            </Badge>
          </Flex>

          <Separator size="4" mb="4" />

          {/* Подтабы */}
          <Tabs.Root value={rightTab} onValueChange={(value) => setRightTab(value as any)}>
            <Tabs.List className={styles.subTabs}>
              <Tabs.Trigger value="info">Info</Tabs.Trigger>
              <Tabs.Trigger value="history">History</Tabs.Trigger>
              <Tabs.Trigger value="activity">Activity</Tabs.Trigger>
              <Tabs.Trigger value="documents">Documents</Tabs.Trigger>
            </Tabs.List>

            <Box mt="4" style={{ overflowY: 'auto', flex: 1, minHeight: 0 }}>
              <Tabs.Content value="info">
                <Flex direction="column" gap="4">
                  <Box>
                    <Text size="3" weight="bold" mb="3" style={{ display: 'block' }}>
                      Контакты
                    </Text>
                    
                    {/* Email */}
                    <Box mb="3">
                      {isEditingEmail ? (
                        <Flex align="center" gap="2" style={{ flexWrap: 'nowrap' }}>
                          <EnvelopeClosedIcon width={16} height={16} style={{ flexShrink: 0 }} />
                          <Text size="2" weight="medium" style={{ flexShrink: 0 }}>Email:</Text>
                          <TextField.Root
                            value={emailValue}
                            onChange={(e) => setEmailValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleEmailSave()
                              } else if (e.key === 'Escape') {
                                setEmailValue(selectedCandidate.email)
                                setIsEditingEmail(false)
                              }
                            }}
                            style={{ flex: 1, minWidth: 0 }}
                            size="1"
                            autoFocus
                          />
                          <Button 
                            size="1" 
                            variant="soft"
                            onClick={handleEmailSave}
                            style={{ flexShrink: 0 }}
                          >
                            <CheckCircledIcon width={14} height={14} />
                          </Button>
                          <Button 
                            size="1" 
                            variant="soft"
                            onClick={() => {
                              setEmailValue(selectedCandidate.email)
                              setIsEditingEmail(false)
                            }}
                            style={{ flexShrink: 0 }}
                          >
                            <Cross2Icon width={14} height={14} />
                          </Button>
                        </Flex>
                      ) : (
                        <Flex align="center" gap="2" style={{ flexWrap: 'nowrap' }}>
                          <EnvelopeClosedIcon width={16} height={16} style={{ flexShrink: 0 }} />
                          <Text size="2" weight="medium" style={{ flexShrink: 0 }}>Email:</Text>
                          <Text size="2">{selectedCandidate.email}</Text>
                          <Button 
                            size="1" 
                            variant="soft"
                            onClick={() => {
                              navigator.clipboard.writeText(selectedCandidate.email)
                            }}
                            style={{ flexShrink: 0 }}
                          >
                            Copy
                          </Button>
                          <Button 
                            size="1" 
                            variant="soft"
                            onClick={() => setIsEditingEmail(true)}
                            style={{ flexShrink: 0 }}
                          >
                            <Pencil1Icon width={14} height={14} />
                          </Button>
                          <Button 
                            size="1" 
                            variant="soft"
                            asChild
                            style={{ flexShrink: 0 }}
                          >
                            <a href={`mailto:${selectedCandidate.email}`} style={{ textDecoration: 'none' }}>
                              <EnvelopeClosedIcon width={14} height={14} />
                            </a>
                          </Button>
                        </Flex>
                      )}
                    </Box>
                    
                    {/* Phone */}
                    <Box mb="3">
                      {isEditingPhone ? (
                        <Flex align="center" gap="2" style={{ flexWrap: 'nowrap' }}>
                          <Text size="2" weight="medium" style={{ flexShrink: 0 }}>📞 Телефон:</Text>
                          <TextField.Root
                            value={phoneValue}
                            onChange={(e) => setPhoneValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handlePhoneSave()
                              } else if (e.key === 'Escape') {
                                setPhoneValue(selectedCandidate.phone)
                                setIsEditingPhone(false)
                              }
                            }}
                            style={{ flex: 1, minWidth: 0 }}
                            size="1"
                            autoFocus
                          />
                          <Button 
                            size="1" 
                            variant="soft"
                            onClick={handlePhoneSave}
                            style={{ flexShrink: 0 }}
                          >
                            <CheckCircledIcon width={14} height={14} />
                          </Button>
                          <Button 
                            size="1" 
                            variant="soft"
                            onClick={() => {
                              setPhoneValue(selectedCandidate.phone)
                              setIsEditingPhone(false)
                            }}
                            style={{ flexShrink: 0 }}
                          >
                            <Cross2Icon width={14} height={14} />
                          </Button>
                        </Flex>
                      ) : (
                        <Flex align="center" gap="2" style={{ flexWrap: 'nowrap' }}>
                          <Text size="2" weight="medium" style={{ flexShrink: 0 }}>📞 Телефон:</Text>
                          <Text size="2">{selectedCandidate.phone}</Text>
                          <Button 
                            size="1" 
                            variant="soft"
                            onClick={() => {
                              navigator.clipboard.writeText(selectedCandidate.phone)
                            }}
                            style={{ flexShrink: 0 }}
                          >
                            Copy
                          </Button>
                          <Button 
                            size="1" 
                            variant="soft"
                            onClick={() => setIsEditingPhone(true)}
                            style={{ flexShrink: 0 }}
                          >
                            <Pencil1Icon width={14} height={14} />
                          </Button>
                          <Button 
                            size="1" 
                            variant="soft"
                            asChild
                            style={{ flexShrink: 0 }}
                          >
                            <a href={`tel:${selectedCandidate.phone.replace(/[^\d+]/g, '')}`} style={{ textDecoration: 'none' }}>
                              Call
                            </a>
                          </Button>
                        </Flex>
                      )}
                    </Box>
                    
                    {/* Location */}
                    <Box mb="4">
                      {isEditingLocation ? (
                        <Flex align="center" gap="2" style={{ flexWrap: 'nowrap' }}>
                          <Text size="2" weight="medium" style={{ flexShrink: 0 }}>📍 Локация:</Text>
                          <TextField.Root
                            value={locationValue}
                            onChange={(e) => setLocationValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                setSelectedCandidate(prev => ({ ...prev, location: locationValue }))
                                setIsEditingLocation(false)
                              } else if (e.key === 'Escape') {
                                setLocationValue(selectedCandidate.location)
                                setIsEditingLocation(false)
                              }
                            }}
                            style={{ flex: 1, minWidth: 0 }}
                            size="1"
                            autoFocus
                          />
                          <Button 
                            size="1" 
                            variant="soft"
                            onClick={() => {
                              setSelectedCandidate(prev => ({ ...prev, location: locationValue }))
                              setIsEditingLocation(false)
                            }}
                            style={{ flexShrink: 0 }}
                          >
                            <CheckCircledIcon width={14} height={14} />
                          </Button>
                          <Button 
                            size="1" 
                            variant="soft"
                            onClick={() => {
                              setLocationValue(selectedCandidate.location)
                              setIsEditingLocation(false)
                            }}
                            style={{ flexShrink: 0 }}
                          >
                            <Cross2Icon width={14} height={14} />
                          </Button>
                        </Flex>
                      ) : (
                        <Flex align="center" gap="2" style={{ flexWrap: 'nowrap' }}>
                          <Text size="2" weight="medium" style={{ flexShrink: 0 }}>📍 Локация:</Text>
                          <Text size="2">{selectedCandidate.location}</Text>
                          <Button 
                            size="1" 
                            variant="soft"
                            onClick={() => {
                              navigator.clipboard.writeText(selectedCandidate.location)
                            }}
                            style={{ flexShrink: 0 }}
                          >
                            Copy
                          </Button>
                          <Button 
                            size="1" 
                            variant="soft"
                            onClick={() => setIsEditingLocation(true)}
                            style={{ flexShrink: 0 }}
                          >
                            <Pencil1Icon width={14} height={14} />
                          </Button>
                          <Button 
                            size="1" 
                            variant="soft"
                            asChild
                            style={{ flexShrink: 0 }}
                          >
                            <a 
                              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedCandidate.location)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ textDecoration: 'none' }}
                            >
                              <GlobeIcon width={14} height={14} />
                            </a>
                          </Button>
                        </Flex>
                      )}
                    </Box>
                    
                    <Separator size="4" mb="3" />
                    
                    {/* Социальные сети и мессенджеры */}
                    <Box>
                      <Flex gap="2" wrap="wrap" style={{ alignItems: 'flex-start' }}>
                        {getAllSocialNetworks().map((social) => {
                          const isEditing = editingSocial === social.platform
                          const currentValue = socialValues[social.platform] || ''
                          const url = social.hasContact && !isEditing ? getSocialUrl(social.platform, currentValue) : '#'
                          
                          if (isEditing) {
                            return (
                              <Box
                                key={social.platform}
                                className={styles.socialEditContainer}
                                  style={{
                                    backgroundColor: social.color,
                                    borderRadius: '8px',
                                    padding: '0 12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    minWidth: '200px',
                                    height: '35px',
                                    transition: 'all 0.3s ease-in-out',
                                }}
                              >
                                <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', width: '16px', height: '16px' }}>
                                  {social.icon}
                                </Box>
                                <TextField.Root
                                  value={currentValue}
                                  onChange={(e) => handleSocialValueChange(social.platform, e.target.value)}
                                  onKeyDown={(e) => handleSocialInputKeyDown(e, social.platform)}
                                  placeholder={`Введите ${social.name}`}
                                  style={{ flex: 1, minWidth: '150px', margin: 0 }}
                                  size="1"
                                  className={styles.socialEditInput}
                                  autoFocus
                                />
                                <Button
                                  size="1"
                                  variant="ghost"
                                  onClick={handleSocialCancel}
                                  style={{
                                    borderRadius: '2px',
                                    width: '16px',
                                    height: '16px',
                                    padding: 0,
                                    minWidth: '16px',
                                    color: 'white',
                                  }}
                                >
                                  <Cross2Icon width={10} height={10} />
                                </Button>
                              </Box>
                            )
                          }
                          
                          return (
                            <Box
                              key={social.platform}
                              className={styles.socialButtonWrapper}
                              style={{ position: 'relative' }}
                            >
                              {social.hasContact ? (
                                <Box
                                  asChild
                                  className={styles.socialButton}
                                  style={{
                                    borderRadius: '8px',
                                    width: '35px',
                                    height: '35px',
                                    backgroundColor: social.color,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease-in-out',
                                    flexShrink: 0,
                                  }}
                                >
                                  <a 
                                    href={url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    style={{ 
                                      textDecoration: 'none',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      width: '35px',
                                      height: '35px',
                                      color: 'white',
                                      borderRadius: '8px',
                                    }}
                                  >
                                    {social.icon}
                                  </a>
                                </Box>
                              ) : (
                                <Box
                                  className={styles.socialButton}
                                  style={{
                                    borderRadius: '8px',
                                    width: '35px',
                                    height: '35px',
                                    backgroundColor: 'var(--gray-4)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    opacity: 0.5,
                                    flexShrink: 0,
                                    cursor: 'not-allowed',
                                  }}
                                >
                                  <Box style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center', 
                                    width: '35px',
                                    height: '35px',
                                    color: 'var(--gray-9)' 
                                  }}>
                                    {social.icon}
                                  </Box>
                                </Box>
                              )}
                              <Button
                                size="1"
                                variant="solid"
                                className={styles.socialEditButton}
                                onClick={() => handleSocialEdit(social.platform)}
                                style={{
                                  position: 'absolute',
                                  top: '-4px',
                                  right: '-4px',
                                  borderRadius: '2px',
                                  width: '16px',
                                  height: '16px',
                                  padding: 0,
                                  minWidth: '16px',
                                  backgroundColor: 'var(--accent-9)',
                                  color: 'white',
                                  border: '2px solid var(--color-surface)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  zIndex: 10,
                                }}
                              >
                                <Pencil1Icon width={8} height={8} />
                              </Button>
                            </Box>
                          )
                        })}
                      </Flex>
                    </Box>
                  </Box>

                  <Box>
                    <Text size="3" weight="bold" mb="3" style={{ display: 'block' }}>
                      Application Details
                    </Text>
                    <Table.Root>
                      <Table.Body>
                        <Table.Row>
                          <Table.Cell>
                            <Text size="2" weight="medium">Position:</Text>
                          </Table.Cell>
                          <Table.Cell>
                            {isEditingPosition ? (
                              <Flex align="center" gap="2" style={{ flexWrap: 'nowrap' }}>
                                <TextField.Root
                                  value={positionValue}
                                  onChange={(e) => setPositionValue(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      handlePositionSave()
                                    } else if (e.key === 'Escape') {
                                      setPositionValue(selectedCandidate.position || '')
                                      setIsEditingPosition(false)
                                    }
                                  }}
                                  style={{ flex: 1, minWidth: 0 }}
                                  size="1"
                                  autoFocus
                                />
                                <Button 
                                  size="1" 
                                  variant="soft"
                                  onClick={handlePositionSave}
                                  style={{ flexShrink: 0 }}
                                >
                                  <CheckCircledIcon width={14} height={14} />
                                </Button>
                                <Button 
                                  size="1" 
                                  variant="soft"
                                  onClick={() => {
                                    setPositionValue(selectedCandidate.position || '')
                                    setIsEditingPosition(false)
                                  }}
                                  style={{ flexShrink: 0 }}
                                >
                                  <Cross2Icon width={14} height={14} />
                                </Button>
                              </Flex>
                            ) : (
                              <Flex align="center" gap="2" style={{ flexWrap: 'nowrap' }}>
                                <Text size="2">{selectedCandidate.position}</Text>
                                <Button 
                                  size="1" 
                                  variant="ghost"
                                  onClick={() => setIsEditingPosition(true)}
                                  style={{ flexShrink: 0, marginLeft: '4px' }}
                                >
                                  <Pencil1Icon width={12} height={12} />
                                </Button>
                              </Flex>
                            )}
                          </Table.Cell>
                        </Table.Row>
                        <Table.Row>
                          <Table.Cell>
                            <Text size="2" weight="medium">Applied / Source:</Text>
                          </Table.Cell>
                          <Table.Cell>
                            {isEditingSource ? (
                              <Flex align="center" gap="2" style={{ flexWrap: 'nowrap' }}>
                                <Text size="1" weight="medium" style={{ flexShrink: 0 }}>Applied:</Text>
                                <Text size="2">{selectedCandidate.applied}</Text>
                                <Text size="2" color="gray" style={{ flexShrink: 0, margin: '0 8px' }}>|</Text>
                                <Text size="1" weight="medium" style={{ flexShrink: 0 }}>Source:</Text>
                                <TextField.Root
                                  value={sourceValue}
                                  onChange={(e) => setSourceValue(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      handleSourceSave()
                                    } else if (e.key === 'Escape') {
                                      setSourceValue(selectedCandidate.source || '')
                                      setIsEditingSource(false)
                                    }
                                  }}
                                  style={{ width: '120px' }}
                                  size="1"
                                  autoFocus
                                />
                                <Button 
                                  size="1" 
                                  variant="soft"
                                  onClick={handleSourceSave}
                                  style={{ flexShrink: 0 }}
                                >
                                  <CheckCircledIcon width={14} height={14} />
                                </Button>
                                <Button 
                                  size="1" 
                                  variant="soft"
                                  onClick={() => {
                                    setSourceValue(selectedCandidate.source || '')
                                    setIsEditingSource(false)
                                  }}
                                  style={{ flexShrink: 0 }}
                                >
                                  <Cross2Icon width={14} height={14} />
                                </Button>
                              </Flex>
                            ) : (
                              <Flex align="center" gap="2" style={{ flexWrap: 'nowrap' }}>
                                <Text size="1" weight="medium" style={{ flexShrink: 0 }}>Applied:</Text>
                                <Text size="2">{selectedCandidate.applied}</Text>
                                <Text size="2" color="gray" style={{ flexShrink: 0, margin: '0 8px' }}>|</Text>
                                <Text size="1" weight="medium" style={{ flexShrink: 0 }}>Source:</Text>
                                <Text size="2">{selectedCandidate.source}</Text>
                                <Button 
                                  size="1" 
                                  variant="ghost"
                                  onClick={() => setIsEditingSource(true)}
                                  style={{ flexShrink: 0, marginLeft: '4px' }}
                                >
                                  <Pencil1Icon width={12} height={12} />
                                </Button>
                              </Flex>
                            )}
                          </Table.Cell>
                        </Table.Row>
                        <Table.Row>
                          <Table.Cell>
                            <Text size="2" weight="medium">Метки (теги):</Text>
                          </Table.Cell>
                          <Table.Cell>
                            {isEditingTags ? (
                              <Flex align="center" gap="2" style={{ flexWrap: 'nowrap' }}>
                                <TextField.Root
                                  value={tagsValue}
                                  onChange={(e) => setTagsValue(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      handleTagsSave()
                                    } else if (e.key === 'Escape') {
                                      setTagsValue((selectedCandidate.tags || []).join(', '))
                                      setIsEditingTags(false)
                                    }
                                  }}
                                  placeholder="Введите теги через запятую"
                                  style={{ flex: 1, minWidth: 0 }}
                                  size="1"
                                  autoFocus
                                />
                                <Button 
                                  size="1" 
                                  variant="soft"
                                  onClick={handleTagsSave}
                                  style={{ flexShrink: 0 }}
                                >
                                  <CheckCircledIcon width={14} height={14} />
                                </Button>
                                <Button 
                                  size="1" 
                                  variant="soft"
                                  onClick={() => {
                                    setTagsValue((selectedCandidate.tags || []).join(', '))
                                    setIsEditingTags(false)
                                  }}
                                  style={{ flexShrink: 0 }}
                                >
                                  <Cross2Icon width={14} height={14} />
                                </Button>
                              </Flex>
                            ) : (
                              <Flex align="center" gap="2" wrap="wrap">
                                {(selectedCandidate.tags || []).map((tag, index) => (
                                  <Badge key={index} size="1" color="blue">
                                    {tag}
                                  </Badge>
                                ))}
                                {(!selectedCandidate.tags || selectedCandidate.tags.length === 0) && (
                                  <Text size="2" color="gray">Не указано</Text>
                                )}
                                <Button 
                                  size="1" 
                                  variant="ghost"
                                  onClick={() => setIsEditingTags(true)}
                                  style={{ flexShrink: 0, marginLeft: '4px' }}
                                >
                                  <Pencil1Icon width={12} height={12} />
                                </Button>
                              </Flex>
                            )}
                          </Table.Cell>
                        </Table.Row>
                        <Table.Row>
                          <Table.Cell>
                            <Text size="2" weight="medium">Уровень:</Text>
                          </Table.Cell>
                          <Table.Cell>
                            {isEditingLevel ? (
                              <Flex align="center" gap="2" style={{ flexWrap: 'nowrap' }}>
                                <TextField.Root
                                  value={levelValue}
                                  onChange={(e) => setLevelValue(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      handleLevelSave()
                                    } else if (e.key === 'Escape') {
                                      setLevelValue(selectedCandidate.level || '')
                                      setIsEditingLevel(false)
                                    }
                                  }}
                                  placeholder="Введите уровень"
                                  style={{ flex: 1, minWidth: 0 }}
                                  size="1"
                                  autoFocus
                                />
                                <Button 
                                  size="1" 
                                  variant="soft"
                                  onClick={handleLevelSave}
                                  style={{ flexShrink: 0 }}
                                >
                                  <CheckCircledIcon width={14} height={14} />
                                </Button>
                                <Button 
                                  size="1" 
                                  variant="soft"
                                  onClick={() => {
                                    setLevelValue(selectedCandidate.level || '')
                                    setIsEditingLevel(false)
                                  }}
                                  style={{ flexShrink: 0 }}
                                >
                                  <Cross2Icon width={14} height={14} />
                                </Button>
                              </Flex>
                            ) : (
                              <Flex align="center" gap="2" style={{ flexWrap: 'nowrap' }}>
                                <Text size="2">{selectedCandidate.level || 'Не указано'}</Text>
                                <Button 
                                  size="1" 
                                  variant="ghost"
                                  onClick={() => setIsEditingLevel(true)}
                                  style={{ flexShrink: 0, marginLeft: '4px' }}
                                >
                                  <Pencil1Icon width={12} height={12} />
                                </Button>
                              </Flex>
                            )}
                          </Table.Cell>
                        </Table.Row>
                      </Table.Body>
                    </Table.Root>
                    
                    {/* Прочие поля (коллапсом) */}
                    <Box mt="3">
                      <Button
                        variant="ghost"
                        size="2"
                        onClick={() => setShowOtherFields(!showOtherFields)}
                        style={{ width: '100%', justifyContent: 'space-between' }}
                      >
                        <Text size="2" weight="medium">Прочие поля</Text>
                        {showOtherFields ? (
                          <ChevronUpIcon width={16} height={16} />
                        ) : (
                          <ChevronDownIcon width={16} height={16} />
                        )}
                      </Button>
                      {showOtherFields && (
                        <Box mt="2">
                          <Table.Root>
                            <Table.Body>
                              <Table.Row>
                                <Table.Cell>
                                  <Text size="2" weight="medium">Возраст:</Text>
                                </Table.Cell>
                                <Table.Cell>
                                  {isEditingAge ? (
                                    <Flex align="center" gap="2" style={{ flexWrap: 'nowrap' }}>
                                      <TextField.Root
                                        value={ageValue}
                                        onChange={(e) => setAgeValue(e.target.value)}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter') {
                                            handleAgeSave()
                                          } else if (e.key === 'Escape') {
                                            setAgeValue(selectedCandidate.age?.toString() || '')
                                            setIsEditingAge(false)
                                          }
                                        }}
                                        placeholder="Введите возраст"
                                        style={{ flex: 1, minWidth: 0 }}
                                        size="1"
                                        autoFocus
                                      />
                                      <Button 
                                        size="1" 
                                        variant="soft"
                                        onClick={handleAgeSave}
                                        style={{ flexShrink: 0 }}
                                      >
                                        <CheckCircledIcon width={14} height={14} />
                                      </Button>
                                      <Button 
                                        size="1" 
                                        variant="soft"
                                        onClick={() => {
                                          setAgeValue(selectedCandidate.age?.toString() || '')
                                          setIsEditingAge(false)
                                        }}
                                        style={{ flexShrink: 0 }}
                                      >
                                        <Cross2Icon width={14} height={14} />
                                      </Button>
                                    </Flex>
                                  ) : (
                                    <Flex align="center" gap="2" style={{ flexWrap: 'nowrap' }}>
                                      <Text size="2">{selectedCandidate.age ? `${selectedCandidate.age} лет` : 'Не указано'}</Text>
                                      <Button 
                                        size="1" 
                                        variant="ghost"
                                        onClick={() => setIsEditingAge(true)}
                                        style={{ flexShrink: 0, marginLeft: '4px' }}
                                      >
                                        <Pencil1Icon width={12} height={12} />
                                      </Button>
                                    </Flex>
                                  )}
                                </Table.Cell>
                              </Table.Row>
                              <Table.Row>
                                <Table.Cell>
                                  <Text size="2" weight="medium">Пол:</Text>
                                </Table.Cell>
                                <Table.Cell>
                                  {isEditingGender ? (
                                    <Flex align="center" gap="2" style={{ flexWrap: 'nowrap' }}>
                                      <Select.Root
                                        value={genderValue || 'Не указано'}
                                        onValueChange={setGenderValue}
                                      >
                                        <Select.Trigger style={{ flex: 1, minWidth: 0 }} />
                                        <Select.Content>
                                          {genderOptions.map((option) => (
                                            <Select.Item key={option} value={option}>
                                              {option}
                                            </Select.Item>
                                          ))}
                                        </Select.Content>
                                      </Select.Root>
                                      <Button 
                                        size="1" 
                                        variant="soft"
                                        onClick={handleGenderSave}
                                        style={{ flexShrink: 0 }}
                                      >
                                        <CheckCircledIcon width={14} height={14} />
                                      </Button>
                                      <Button 
                                        size="1" 
                                        variant="soft"
                                        onClick={() => {
                                          setGenderValue(selectedCandidate.gender || '')
                                          setIsEditingGender(false)
                                        }}
                                        style={{ flexShrink: 0 }}
                                      >
                                        <Cross2Icon width={14} height={14} />
                                      </Button>
                                    </Flex>
                                  ) : (
                                    <Flex align="center" gap="2" style={{ flexWrap: 'nowrap' }}>
                                      <Text size="2">{selectedCandidate.gender || 'Не указано'}</Text>
                                      <Button 
                                        size="1" 
                                        variant="ghost"
                                        onClick={() => setIsEditingGender(true)}
                                        style={{ flexShrink: 0, marginLeft: '4px' }}
                                      >
                                        <Pencil1Icon width={12} height={12} />
                                      </Button>
                                    </Flex>
                                  )}
                                </Table.Cell>
                              </Table.Row>
                              <Table.Row>
                                <Table.Cell>
                                  <Text size="2" weight="medium">Зарплатные ожидания:</Text>
                                </Table.Cell>
                                <Table.Cell>
                                  {isEditingSalary ? (
                                    <Flex align="center" gap="2" style={{ flexWrap: 'nowrap' }}>
                                      <TextField.Root
                                        value={salaryValue}
                                        onChange={(e) => setSalaryValue(e.target.value)}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter') {
                                            handleSalarySave()
                                          } else if (e.key === 'Escape') {
                                            setSalaryValue(selectedCandidate.salaryExpectations || '')
                                            setIsEditingSalary(false)
                                          }
                                        }}
                                        placeholder="Введите зарплатные ожидания"
                                        style={{ flex: 1, minWidth: 0 }}
                                        size="1"
                                        autoFocus
                                      />
                                      <Button 
                                        size="1" 
                                        variant="soft"
                                        onClick={handleSalarySave}
                                        style={{ flexShrink: 0 }}
                                      >
                                        <CheckCircledIcon width={14} height={14} />
                                      </Button>
                                      <Button 
                                        size="1" 
                                        variant="soft"
                                        onClick={() => {
                                          setSalaryValue(selectedCandidate.salaryExpectations || '')
                                          setIsEditingSalary(false)
                                        }}
                                        style={{ flexShrink: 0 }}
                                      >
                                        <Cross2Icon width={14} height={14} />
                                      </Button>
                                    </Flex>
                                  ) : (
                                    <Flex align="center" gap="2" style={{ flexWrap: 'nowrap' }}>
                                      <Text size="2">{selectedCandidate.salaryExpectations || 'Не указано'}</Text>
                                      <Button 
                                        size="1" 
                                        variant="ghost"
                                        onClick={() => setIsEditingSalary(true)}
                                        style={{ flexShrink: 0, marginLeft: '4px' }}
                                      >
                                        <Pencil1Icon width={12} height={12} />
                                      </Button>
                                    </Flex>
                                  )}
                                </Table.Cell>
                              </Table.Row>
                            </Table.Body>
                          </Table.Root>
                        </Box>
                      )}
                    </Box>
                  </Box>
                </Flex>
              </Tabs.Content>

              <Tabs.Content value="history">
                <Flex direction="column" gap="3">
                  {mockHistory.map((item) => (
                    <Box key={item.id} className={styles.historyItem}>
                      <Flex align="start" gap="2">
                        <Text size="4">{item.icon}</Text>
                        <Flex direction="column" style={{ flex: 1 }}>
                          <Text size="1" color="gray" mb="1">{item.date}</Text>
                          <Text size="2">{item.text}</Text>
                        </Flex>
                      </Flex>
                      <Separator size="4" mt="3" />
                    </Box>
                  ))}
                </Flex>
              </Tabs.Content>

              <Tabs.Content value="activity">
                <Flex direction="column" gap="4">
                  <Box>
                    <Text size="3" weight="bold" mb="3" style={{ display: 'block' }}>
                      Add Note
                    </Text>
                    <TextField.Root placeholder="Add note..." />
                    <Flex gap="2" mt="2">
                      <Button size="2">Save</Button>
                      <Button size="2" variant="soft">Cancel</Button>
                    </Flex>
                  </Box>

                  <Box>
                    <Text size="3" weight="bold" mb="3" style={{ display: 'block' }}>
                      Notes & Comments
                    </Text>
                    <Card>
                      <Text size="2" color="gray" mb="2" style={{ display: 'block' }}>
                        Your note (Jan 20, 8:30 PM)
                      </Text>
                      <Text size="2">
                        "Good communication skills, thorough understanding of React. Schedule technical interview."
                      </Text>
                      <Flex gap="2" mt="3">
                        <Button size="1" variant="soft">
                          <Pencil1Icon width={14} height={14} />
                          Edit
                        </Button>
                        <Button size="1" variant="soft" color="red">
                          <TrashIcon width={14} height={14} />
                          Delete
                        </Button>
                      </Flex>
                    </Card>
                  </Box>
                </Flex>
              </Tabs.Content>

              <Tabs.Content value="documents">
                <Flex direction="column" gap="3">
                  <Card>
                    <Flex align="center" justify="between">
                      <Flex align="center" gap="3">
                        <FileTextIcon width={24} height={24} />
                        <Flex direction="column">
                          <Text size="3" weight="medium">john_doe_cv.pdf</Text>
                          <Text size="1" color="gray">Uploaded: Jan 15, 2026 · Size: 450 KB</Text>
                        </Flex>
                      </Flex>
                      <Flex gap="2">
                        <Button size="1" variant="soft">
                          <DownloadIcon width={14} height={14} />
                        </Button>
                        <Button size="1" variant="soft">
                          <EyeOpenIcon width={14} height={14} />
                        </Button>
                        <Button size="1" variant="soft" color="red">
                          <TrashIcon width={14} height={14} />
                        </Button>
                      </Flex>
                    </Flex>
                  </Card>

                  <Button variant="soft">
                    <PlusIcon width={16} height={16} />
                    Upload document
                  </Button>
                </Flex>
              </Tabs.Content>
            </Box>
          </Tabs.Root>
        </Card>
      </Box>
      </Box>
    
    {/* Модальное окно со слотами */}
    <Dialog.Root open={slotsOpen} onOpenChange={setSlotsOpen}>
      <Dialog.Content style={{ maxWidth: '800px', maxHeight: '80vh', overflowY: 'auto' }}>
        <Dialog.Title>Свободные слоты</Dialog.Title>
        <Box mt="4">
          <SlotsPanel />
        </Box>
        <Flex gap="3" justify="end" mt="4">
          <Button variant="soft" onClick={() => setSlotsOpen(false)}>
            Закрыть
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
    </AppLayout>
  )
}
