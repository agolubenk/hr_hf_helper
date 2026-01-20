'use client'

import React, { useState, useEffect } from 'react'
import AppLayout from "@/components/AppLayout"
import WorkflowChat from "@/components/workflow/WorkflowChat"
import { Box, Flex, Text, TextField, Button, Tabs, Badge, Avatar, Separator, Card, Table, Select } from "@radix-ui/themes"
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
  ExternalLinkIcon
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
    source: 'LinkedIn'
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

export default function RecrChatPage() {
  const [leftTab, setLeftTab] = useState<'candidates' | 'chat' | 'vacancy-settings'>('candidates')
  const [rightTab, setRightTab] = useState<'info' | 'history' | 'activity' | 'documents'>('info')
  const [selectedCandidate, setSelectedCandidate] = useState(mockCandidates[0])
  const [searchQuery, setSearchQuery] = useState('')
  const [isRightColumnOpen, setIsRightColumnOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  
  // Настройки вакансии
  const [selectedSettingTab, setSelectedSettingTab] = useState<'text' | 'recruiters' | 'customers' | 'questions' | 'integrations' | 'statuses' | 'salary'>('text')
  
  // Состояние редактирования социальных сетей
  const [editingSocial, setEditingSocial] = useState<string | null>(null)
  const [socialValues, setSocialValues] = useState<Record<string, string>>({})
  
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

            <Flex align="center" gap="2">
              <Text size="2" weight="medium">Status:</Text>
              <Badge
                size="2"
                style={{
                  backgroundColor: selectedCandidate.statusColor,
                  color: 'white'
                }}
              >
                {selectedCandidate.status}
              </Badge>
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

            <Box mt="4" style={{ maxHeight: '500px', overflowY: 'auto' }}>
              <Tabs.Content value="info">
                <Flex direction="column" gap="4">
                  <Box>
                    <Text size="3" weight="bold" mb="3" style={{ display: 'block' }}>
                      Контакты
                    </Text>
                    
                    {/* Email */}
                    <Box mb="3">
                      <Flex align="center" gap="2" style={{ flexWrap: 'nowrap' }}>
                        <EnvelopeClosedIcon width={16} height={16} style={{ flexShrink: 0 }} />
                        <Text size="2" weight="medium" style={{ flexShrink: 0 }}>Email:</Text>
                        <Text size="2" style={{ flex: 1, minWidth: 0 }}>{selectedCandidate.email}</Text>
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
                          asChild
                          style={{ flexShrink: 0 }}
                        >
                          <a href={`mailto:${selectedCandidate.email}`} style={{ textDecoration: 'none' }}>
                            <EnvelopeClosedIcon width={14} height={14} />
                          </a>
                        </Button>
                      </Flex>
                    </Box>
                    
                    {/* Phone */}
                    <Box mb="3">
                      <Flex align="center" gap="2" style={{ flexWrap: 'nowrap' }}>
                        <Text size="2" weight="medium" style={{ flexShrink: 0 }}>📞 Телефон:</Text>
                        <Text size="2" style={{ flex: 1, minWidth: 0 }}>{selectedCandidate.phone}</Text>
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
                          asChild
                          style={{ flexShrink: 0 }}
                        >
                          <a href={`tel:${selectedCandidate.phone.replace(/[^\d+]/g, '')}`} style={{ textDecoration: 'none' }}>
                            Call
                          </a>
                        </Button>
                      </Flex>
                    </Box>
                    
                    {/* Location */}
                    <Box mb="4">
                      <Flex align="center" gap="2" style={{ flexWrap: 'nowrap' }}>
                        <Text size="2" weight="medium" style={{ flexShrink: 0 }}>📍 Локация:</Text>
                        <Text size="2" style={{ flex: 1, minWidth: 0 }}>{selectedCandidate.location}</Text>
                      </Flex>
                    </Box>
                    
                    <Separator size="4" mb="3" />
                    
                    {/* Социальные сети и мессенджеры */}
                    <Box>
                      <Text size="3" weight="bold" mb="3" style={{ display: 'block' }}>
                        Социальные сети и мессенджеры
                      </Text>
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
                            <Text size="2">{selectedCandidate.position}</Text>
                          </Table.Cell>
                        </Table.Row>
                        <Table.Row>
                          <Table.Cell>
                            <Text size="2" weight="medium">Applied:</Text>
                          </Table.Cell>
                          <Table.Cell>
                            <Text size="2">{selectedCandidate.applied}</Text>
                          </Table.Cell>
                        </Table.Row>
                        <Table.Row>
                          <Table.Cell>
                            <Text size="2" weight="medium">Source:</Text>
                          </Table.Cell>
                          <Table.Cell>
                            <Text size="2">{selectedCandidate.source}</Text>
                          </Table.Cell>
                        </Table.Row>
                      </Table.Body>
                    </Table.Root>
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
    </AppLayout>
  )
}
