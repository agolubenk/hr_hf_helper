'use client'

import React, { useState, useEffect } from 'react'
import AppLayout from "@/components/AppLayout"
import WorkflowChat from "@/components/workflow/WorkflowChat"
import SlotsPanel from "@/components/workflow/SlotsPanel"
import { Box, Flex, Text, TextField, TextArea, Button, Tabs, Badge, Avatar, Separator, Card, Table, Select, Dialog, Checkbox, DropdownMenu, Switch } from "@radix-ui/themes"
import { useToast } from "@/components/Toast/ToastContext"
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
  EyeClosedIcon,
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
  OpenInNewWindowIcon,
  UploadIcon,
  ImageIcon,
  ChevronLeftIcon,
  ChevronRightIcon
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
import { SiViber, SiKaggle, SiDiscord } from "react-icons/si"
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
    unread: 3,
    unreadSources: { telegram: 2, whatsapp: 1 }, // Непрочитанные сообщения из нескольких источников
    isViewed: true, // Информация просмотрена
    hasUnviewedChanges: false, // Нет непросмотренных изменений
    email: 'john@example.com',
    phone: '+1 (555) 123-4567',
    emails: ['john@example.com'],
    phones: ['+1 (555) 123-4567'],
    location: 'New York, USA',
    hasDuplicateSuspicion: true, // Подозрение на дубликат
    // Социальные сети и мессенджеры (старые поля для обратной совместимости)
    whatsapp: '+15551234567',
    viber: '+15551234567',
    telegram: '@johndoe',
    // Массивы контактов для каждой платформы
    whatsapps: ['+15551234567'],
    vibers: ['+15551234567'],
    telegrams: ['@johndoe'],
    vks: ['johndoe'],
    linkedins: ['/in/johndoe'],
    dribbbles: ['johndoe'],
    behances: ['johndoe'],
    pinterests: ['johndoe'],
    habrCareers: ['johndoe'],
    githubs: ['johndoe'],
    instagrams: ['@johndoe'],
    facebooks: ['johndoe'],
    twitters: ['@johndoe'],
    kaggles: [],
    discords: [],
    // Старые поля для обратной совместимости
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
    salaryExpectations: '150,000 - 200,000 USD',
    offer: '180,000 USD'
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
    unreadSources: {},
    isViewed: true,
    hasUnviewedChanges: false,
    email: 'jane@example.com',
    phone: '+1 (555) 234-5678',
    emails: ['jane@example.com'],
    phones: ['+1 (555) 234-5678'],
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
    unreadSources: {},
    isViewed: false, // Информация не просмотрена
    hasUnviewedChanges: true, // Есть непросмотренные изменения (статус, комментарий, файл, данные) - пример без сообщений
    email: 'mike@example.com',
    phone: '+1 (555) 345-6789',
    emails: ['mike@example.com'],
    phones: ['+1 (555) 345-6789'],
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
  },
  {
    id: '4',
    name: 'Иванов Петр Сергеевич',
    position: 'Backend Developer',
    status: 'Offer',
    statusColor: '#10B981',
    avatar: 'ИП',
    timeAgo: '3 hours ago',
    unread: 1,
    unreadSources: { whatsapp: 1 }, // Непрочитанные сообщения из WhatsApp
    isViewed: true, // Информация просмотрена
    hasUnviewedChanges: true, // Есть непросмотренные изменения (принят оффер)
    email: 'ivanov@example.com',
    phone: '+7 (999) 123-4567',
    emails: ['ivanov@example.com'],
    phones: ['+7 (999) 123-4567'],
    location: 'Москва, Россия',
    whatsapp: '+79991234567',
    telegram: '@ivanov',
    linkedin: '/in/ivanov',
    github: 'ivanov',
    rating: 4,
    vacancy: 'Backend Developer',
    applied: 'Jan 22, 2026',
    source: 'HH.ru',
    tags: ['Java', 'Spring', 'PostgreSQL'],
    level: 'Middle',
    age: 28,
    gender: 'Мужской',
    salaryExpectations: '200,000 - 300,000 RUB',
    offer: '250,000 RUB'
  },
  {
    id: '5',
    name: 'Смирнова Анна Владимировна',
    position: 'Frontend Developer',
    status: 'New',
    statusColor: '#2180A0',
    avatar: 'СА',
    timeAgo: '1 hour ago',
    unread: 12,
    unreadSources: { kaggle: 12 }, // Непрочитанные сообщения из Kaggle
    isViewed: true,
    hasUnviewedChanges: false,
    email: 'smirnova@example.com',
    phone: '+7 (999) 234-5678',
    emails: ['smirnova@example.com'],
    phones: ['+7 (999) 234-5678'],
    location: 'Санкт-Петербург, Россия',
    telegram: '@smirnova',
    linkedin: '/in/smirnova',
    github: 'smirnova',
    kaggles: ['smirnova'], // Массив контактов
    rating: 5,
    vacancy: 'Frontend Senior',
    applied: 'Jan 23, 2026',
    source: 'LinkedIn',
    tags: ['React', 'TypeScript', 'Vue'],
    level: 'Senior',
    age: 30,
    gender: 'Женский',
    salaryExpectations: '250,000 - 350,000 RUB'
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
    kaggle: (val) => `https://kaggle.com/${cleanValue}`,
    discord: (val) => val.startsWith('http') ? val : `https://discord.com/users/${cleanValue}`,
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
    kaggle: { name: 'Kaggle', color: '#20BEFF', icon: <SiKaggle size={iconSize} /> },
    discord: { name: 'Discord', color: '#5865F2', icon: <SiDiscord size={iconSize} /> },
  }
  
  return platforms[platform] || { name: platform, color: '#6B7280', icon: <ExternalLinkIcon width={iconSize} height={iconSize} /> }
}

// Функция для получения информации о непрочитанных сообщениях
const getUnreadInfo = (candidate: any) => {
  const unreadSources = (candidate.unreadSources as Record<string, number>) || {}
  const sourceKeys = Object.keys(unreadSources)
  const totalUnread = candidate.unread || 0
  
  if (totalUnread === 0 || sourceKeys.length === 0) {
    return null
  }
  
  // Если один источник - возвращаем его иконку
  if (sourceKeys.length === 1) {
    const source = sourceKeys[0]
    // Получаем информацию о платформе с размером иконки для бейджа
    const iconSize = 12
    const platformInfo = getPlatformInfo(source)
    // Клонируем иконку с новым размером
    const iconElement = React.isValidElement(platformInfo.icon) 
      ? React.cloneElement(platformInfo.icon as React.ReactElement<any>, { size: iconSize })
      : platformInfo.icon
    return {
      icon: iconElement,
      count: unreadSources[source],
      multiple: false
    }
  }
  
  // Если несколько источников - возвращаем многоточие и сумму
  const totalCount = Object.values(unreadSources).reduce((sum, count) => sum + count, 0)
  return {
    icon: <Text size="1" weight="bold" style={{ fontSize: '10px' }}>...</Text>,
    count: totalCount,
    multiple: true
  }
}

// Функция для получения информации о точке сообщений слева сверху аватара
const getMessageDotInfo = (candidate: any) => {
  const unreadSources = (candidate.unreadSources as Record<string, number>) || {}
  const sourceKeys = Object.keys(unreadSources)
  const totalUnread = candidate.unread || 0
  
  if (totalUnread === 0 || sourceKeys.length === 0) {
    return null
  }
  
  // Если один источник - возвращаем цвет платформы и количество (если < 10)
  if (sourceKeys.length === 1) {
    const source = sourceKeys[0]
    const platformInfo = getPlatformInfo(source)
    const count = unreadSources[source]
    return {
      color: platformInfo.color,
      count: count < 10 ? count : undefined,
      source: source
    }
  }
  
  // Если несколько источников - используем цвет первого источника
  const firstSource = sourceKeys[0]
  const platformInfo = getPlatformInfo(firstSource)
  const totalCount = Object.values(unreadSources).reduce((sum, count) => sum + count, 0)
  return {
    color: platformInfo.color,
    count: totalCount < 10 ? totalCount : undefined,
    source: 'multiple'
  }
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
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1920)
  
  // Состояние для управления аватаром
  const [avatarModalOpen, setAvatarModalOpen] = useState(false)
  const [isEditingPhoto, setIsEditingPhoto] = useState(false)
  const [uploadedPhotoForEdit, setUploadedPhotoForEdit] = useState<string | null>(null)
  const [cropArea, setCropArea] = useState({ x: 0, y: 0, size: 200 })
  const [isDragging, setIsDragging] = useState(false)
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0, displayWidth: 0, displayHeight: 0 })
  const uploadedPhotoRef = React.useRef<HTMLImageElement | null>(null)
  const rightColumnRef = React.useRef<HTMLDivElement | null>(null)
  // Инициализируем с примерами фото для демонстрации
  const [candidatePhotos, setCandidatePhotos] = useState<Record<string, string[]>>({
    // Кандидат 4 (Иванов Петр Сергеевич) - несколько фото для карусели
    '4': [
      '/avatars/photo1.png',
      '/avatars/photo2.png',
      '/avatars/photo3.png',
      '/avatars/photo4.png'
    ],
    // Кандидат 5 (Смирнова Анна Владимировна) - без фото (только форма загрузки)
    // '5': [] - оставляем пустым для демонстрации формы загрузки
  })
  
  // Функция для получения инициалов (первые 2 буквы)
  const getInitials = (name: string): string => {
    const words = name.trim().split(/\s+/)
    if (words.length === 0) return ''
    
    // Берем первые 2 буквы из первых двух слов (или из первого слова, если оно одно)
    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase()
    }
    
    const firstLetter = words[0].charAt(0)
    const secondLetter = words[1].charAt(0)
    return (firstLetter + secondLetter).toUpperCase()
  }
  
  // Обработчик клика на аватар
  const handleAvatarClick = () => {
    setAvatarModalOpen(true)
  }
  
  // Обработчик загрузки фото (открывает форму редактирования)
  const handlePhotoUpload = (file: File) => {
    if (!file.type.startsWith('image/')) return
    
    const reader = new FileReader()
    reader.onloadend = () => {
      const photoUrl = reader.result as string
      setUploadedPhotoForEdit(photoUrl)
      setIsEditingPhoto(true)
      
      // Инициализируем область обрезки по центру изображения
      const img = new Image()
      img.onload = () => {
        const minSize = Math.min(img.width, img.height)
        setImageDimensions({
          width: img.width,
          height: img.height,
          displayWidth: 0,
          displayHeight: 0
        })
        setCropArea({
          x: (img.width - minSize) / 2,
          y: (img.height - minSize) / 2,
          size: minSize
        })
      }
      img.src = photoUrl
    }
    reader.readAsDataURL(file)
  }
  
  // Обновление размеров изображения при загрузке
  const handleImageLoad = () => {
    const img = uploadedPhotoRef.current
    if (img) {
      setImageDimensions(prev => ({
        ...prev,
        displayWidth: img.offsetWidth,
        displayHeight: img.offsetHeight
      }))
    }
  }
  
  // Обработчик изменения файла через input
  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handlePhotoUpload(file)
    }
  }
  
  // Обработчики drag-and-drop
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    
    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith('image/')) {
      handlePhotoUpload(file)
    }
  }
  
  // Обработчики для drag-and-drop документов
  const handleDocumentDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingDocument(true)
  }
  
  const handleDocumentDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingDocument(false)
  }
  
  const handleDocumentDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingDocument(false)
    
    const file = e.dataTransfer.files?.[0]
    if (file && !file.type.startsWith('image/')) {
      // Это документ, а не изображение
      handleDocumentFileSelect(file)
    }
  }
  
  // Обработчик выбора файла документа (через drag-and-drop или кнопку)
  const handleDocumentFileSelect = (file: File) => {
    setPendingDocumentFile(file)
    setDocumentUploadModalOpen(true)
    // Автоматически переключаемся на вкладку Documents
    setRightTab('documents')
  }
  
  // Обработчик загрузки документа через кнопку
  const handleDocumentUploadClick = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.pdf,.doc,.docx,.txt,.rtf'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        handleDocumentFileSelect(file)
      }
    }
    input.click()
  }
  
  // Обработчик подтверждения загрузки документа
  const handleDocumentUploadConfirm = () => {
    if (pendingDocumentFile) {
      // Форматируем размер файла
      const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return bytes + ' B'
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB'
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
      }
      
      // Получаем название группы, если выбрана
      const groupName = documentVisibilityGroup === 'group' && selectedGroup
        ? mockGroups.find(g => g.id === selectedGroup)?.name
        : undefined
      
      // Создаем новый документ
      const now = new Date()
      const uploadedDate = now.toLocaleDateString('en-US', { 
        month: 'short', 
        day: '2-digit', 
        year: 'numeric' 
      })
      
      const newDocument = {
        id: `doc-${Date.now()}`,
        name: pendingDocumentFile.name,
        size: pendingDocumentFile.size,
        uploadedDate: uploadedDate,
        visibility: documentVisibilityGroup,
        groupId: documentVisibilityGroup === 'group' ? selectedGroup : undefined,
        groupName: groupName
      }
      
      // Добавляем документ в список
      setUploadedDocuments(prev => [newDocument, ...prev])
      
      // Закрываем модальное окно и сбрасываем состояние
      setDocumentUploadModalOpen(false)
      setPendingDocumentFile(null)
      setDocumentVisibilityGroup('only-me')
      setSelectedGroup('')
    }
  }
  
  // Обработчик отмены загрузки документа
  const handleDocumentUploadCancel = () => {
    setDocumentUploadModalOpen(false)
    setPendingDocumentFile(null)
    setDocumentVisibilityGroup('only-me')
    setSelectedGroup('')
  }
  
  // Функция обрезки изображения в квадрат
  const cropImageToSquare = (imageUrl: string, cropX: number, cropY: number, cropSize: number): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = cropSize
        canvas.height = cropSize
        const ctx = canvas.getContext('2d')
        
        if (ctx) {
          ctx.drawImage(
            img,
            cropX, cropY, cropSize, cropSize,
            0, 0, cropSize, cropSize
          )
          resolve(canvas.toDataURL('image/png'))
        }
      }
      img.src = imageUrl
    })
  }
  
  // Обработчик сохранения обрезанного фото
  const handleSaveCroppedPhoto = async () => {
    if (!uploadedPhotoForEdit) return
    
    const croppedPhoto = await cropImageToSquare(
      uploadedPhotoForEdit,
      cropArea.x,
      cropArea.y,
      cropArea.size
    )
    
    setCandidatePhotos(prev => ({
      ...prev,
      [selectedCandidate.id]: [croppedPhoto, ...(prev[selectedCandidate.id] || [])]
    }))
    
    setIsEditingPhoto(false)
    setUploadedPhotoForEdit(null)
  }
  
  // Обработчик отмены редактирования
  const handleCancelEdit = () => {
    setIsEditingPhoto(false)
    setUploadedPhotoForEdit(null)
  }
  
  // Обработчик выбора главного фото (клик на изображение в карусели)
  const handleSelectMainPhoto = (photoIndex: number) => {
    const photos = candidatePhotos[selectedCandidate.id]
    if (!photos || photoIndex === 0) return // Уже главное или нет фото
    
    // Перемещаем выбранное фото в начало массива
    const newPhotos = [...photos]
    const [selectedPhoto] = newPhotos.splice(photoIndex, 1)
    newPhotos.unshift(selectedPhoto)
    
    setCandidatePhotos(prev => ({
      ...prev,
      [selectedCandidate.id]: newPhotos
    }))
  }
  
  // Моковые данные вакансий для кандидата (разные примеры в зависимости от кандидата)
  const getCandidateVacancies = (): Array<{
    id: string
    name: string
    status: string
    isActive: boolean
    isArchived: boolean
    isCurrent: boolean
    rejectionReason?: string
  }> => {
    const currentVacancy = selectedCandidate.vacancy
    
    // Пример 1: Для первого кандидата - 2 активных вакансии
    if (selectedCandidate.id === '1') {
      return [
        { id: '1', name: 'Frontend Senior', status: 'Interview', isActive: true, isArchived: false, isCurrent: true },
        { id: '2', name: 'Backend Developer', status: 'Offer', isActive: true, isArchived: false, isCurrent: false },
      ]
    }
    
    // Пример 2: Для второго кандидата - 1 активная + 1 в архиве
    if (selectedCandidate.id === '2') {
      return [
        { id: '3', name: 'Product Manager', status: 'Archived', isActive: false, isArchived: true, isCurrent: false },
        { id: '1', name: currentVacancy, status: selectedCandidate.status, isActive: true, isArchived: false, isCurrent: true },
      ]
    }
    
    // Пример 3: Для третьего кандидата - предыдущая активность (отказ)
    if (selectedCandidate.id === '3') {
      return [
        { id: '4', name: 'Fullstack Engineer', status: 'Rejected', rejectionReason: 'Не подходит по опыту', isActive: false, isArchived: false, isCurrent: false },
      ]
    }
    
    // По умолчанию
    return [
      { id: '1', name: currentVacancy, status: selectedCandidate.status, isActive: true, isArchived: false, isCurrent: true },
    ]
  }
  
  const candidateVacancies = getCandidateVacancies()
  
  // Состояние для кнопок workflow
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowType>('screening')
  const [interviewFormat, setInterviewFormat] = useState<InterviewFormat>('online')
  const [selectedInterviewers, setSelectedInterviewers] = useState<string[]>([])
  const [slotsOpen, setSlotsOpen] = useState(false)
  
  // Моковые данные интервьюеров (автор добавляется в начало списка)
  const currentUser = { id: 'author', name: 'Я (Андрей Голубенко)' }
  const interviewers: Interviewer[] = [
    { id: '1', name: 'Иван Петров' },
    { id: '2', name: 'Мария Сидорова' },
    { id: '3', name: 'Алексей Иванов' },
  ]
  
  // Объединяем автора и интервьюеров
  const allParticipants = [currentUser, ...interviewers]
  
  const handleInterviewerToggle = (interviewerId: string) => {
    setSelectedInterviewers(prev =>
      prev.includes(interviewerId)
        ? prev.filter(id => id !== interviewerId)
        : [...prev, interviewerId]
    )
  }
  
  // Список вакансий
  const availableVacancies = [
    { id: '1', name: 'Frontend Senior', color: 'blue' },
    { id: '2', name: 'Backend Developer', color: 'green' },
    { id: '3', name: 'Fullstack Engineer', color: 'purple' },
    { id: '4', name: 'DevOps Engineer', color: 'orange' },
    { id: '5', name: 'Product Manager', color: 'red' },
  ]
  
  // Настройки вакансии
  const [selectedSettingTab, setSelectedSettingTab] = useState<'text' | 'recruiters' | 'customers' | 'questions' | 'integrations' | 'statuses' | 'salary' | 'interviews' | 'scorecard' | 'dataProcessing' | 'history'>('text')
  const [isPublished, setIsPublished] = useState(false)
  const [publicationUrl, setPublicationUrl] = useState<string | null>(null)
  interface HistoryItem {
    id: string
    date: string
    user: string
    changes: string
    version: number
    fullText?: string
    // Состояние полей для восстановления
    fieldsState?: {
      title: string
      department: string
      header: string
      responsibilities: string
      requirements: string
      niceToHave: string
      conditions: string
      closing: string
      link: string
      fieldSettings: Record<string, { active: boolean; visible: boolean }>
    }
  }
  
  const [editHistory, setEditHistory] = useState<HistoryItem[]>([
    { 
      id: '1', 
      date: '2026-01-24 10:30', 
      user: 'Иван Иванов', 
      changes: 'Изменен текст вакансии', 
      version: 1,
      fullText: 'Название вакансии: Senior Frontend Developer\n\nОтдел: Разработка\n\nЗаголовок: Приглашаем опытного разработчика\n\nОбязанности:\n- Разработка пользовательских интерфейсов\n- Оптимизация производительности\n- Работа с командой\n\nТребования:\n- Опыт работы от 3 лет\n- Знание React, TypeScript\n- Опыт работы с Redux',
      fieldsState: {
        title: 'Senior Frontend Developer',
        department: 'Разработка',
        header: 'Приглашаем опытного разработчика',
        responsibilities: '- Разработка пользовательских интерфейсов\n- Оптимизация производительности\n- Работа с командой',
        requirements: '- Опыт работы от 3 лет\n- Знание React, TypeScript\n- Опыт работы с Redux',
        niceToHave: '',
        conditions: '',
        closing: '',
        link: '',
        fieldSettings: {
          title: { active: true, visible: true },
          department: { active: true, visible: true },
          header: { active: true, visible: true },
          responsibilities: { active: true, visible: true },
          requirements: { active: true, visible: true },
          niceToHave: { active: true, visible: true },
          conditions: { active: true, visible: true },
          closing: { active: true, visible: true },
          link: { active: true, visible: true },
          attachment: { active: true, visible: true }
        }
      }
    },
    { 
      id: '2', 
      date: '2026-01-23 15:45', 
      user: 'Петр Петров', 
      changes: 'Обновлены условия работы', 
      version: 2,
      fullText: 'Название вакансии: Senior Frontend Developer\n\nОтдел: Разработка\n\nЗаголовок: Приглашаем опытного разработчика\n\nОбязанности:\n- Разработка пользовательских интерфейсов\n- Оптимизация производительности\n\nТребования:\n- Опыт работы от 3 лет\n- Знание React, TypeScript',
      fieldsState: {
        title: 'Senior Frontend Developer',
        department: 'Разработка',
        header: 'Приглашаем опытного разработчика',
        responsibilities: '- Разработка пользовательских интерфейсов\n- Оптимизация производительности',
        requirements: '- Опыт работы от 3 лет\n- Знание React, TypeScript',
        niceToHave: '',
        conditions: '',
        closing: '',
        link: '',
        fieldSettings: {
          title: { active: true, visible: true },
          department: { active: true, visible: true },
          header: { active: true, visible: true },
          responsibilities: { active: true, visible: true },
          requirements: { active: true, visible: true },
          niceToHave: { active: false, visible: false },
          conditions: { active: true, visible: true },
          closing: { active: true, visible: true },
          link: { active: true, visible: true },
          attachment: { active: true, visible: true }
        }
      }
    },
    { 
      id: '3', 
      date: '2026-01-22 09:15', 
      user: 'Иван Иванов', 
      changes: 'Создана вакансия', 
      version: 3,
      fullText: 'Название вакансии: Frontend Developer\n\nОтдел: Разработка\n\nЗаголовок: Ищем разработчика\n\nОбязанности:\n- Разработка интерфейсов\n\nТребования:\n- Опыт работы от 2 лет\n- Знание React',
      fieldsState: {
        title: 'Frontend Developer',
        department: 'Разработка',
        header: 'Ищем разработчика',
        responsibilities: '- Разработка интерфейсов',
        requirements: '- Опыт работы от 2 лет\n- Знание React',
        niceToHave: '',
        conditions: '',
        closing: '',
        link: '',
        fieldSettings: {
          title: { active: true, visible: true },
          department: { active: true, visible: true },
          header: { active: true, visible: true },
          responsibilities: { active: true, visible: true },
          requirements: { active: true, visible: true },
          niceToHave: { active: false, visible: false },
          conditions: { active: false, visible: false },
          closing: { active: false, visible: false },
          link: { active: false, visible: false },
          attachment: { active: false, visible: false }
        }
      }
    },
  ])
  
  // Состояние для модального окна истории правок
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<HistoryItem | null>(null)
  
  // Состояние для модального окна подтверждения восстановления
  const [restoreConfirmationOpen, setRestoreConfirmationOpen] = useState(false)
  const [versionToRestore, setVersionToRestore] = useState<HistoryItem | null>(null)
  
  // Функция для восстановления версии
  const handleRestoreVersion = () => {
    if (!versionToRestore || !versionToRestore.fieldsState) {
      showToast('Не удалось восстановить версию: отсутствуют данные', 'error')
      return
    }
    
    const fieldsState = versionToRestore.fieldsState
    
    // Восстанавливаем все поля
    setVacancyTitle(fieldsState.title)
    setVacancyDepartment(fieldsState.department)
    setVacancyHeader(fieldsState.header)
    setVacancyResponsibilities(fieldsState.responsibilities)
    setVacancyRequirements(fieldsState.requirements)
    setVacancyNiceToHave(fieldsState.niceToHave)
    setVacancyConditions(fieldsState.conditions)
    setVacancyClosing(fieldsState.closing)
    setVacancyLink(fieldsState.link)
    
    // Восстанавливаем статусы полей
    setFieldSettings(fieldsState.fieldSettings)
    
    // Создаем новую запись в истории правок
    const newVersion = Math.max(...editHistory.map(h => h.version)) + 1
    const currentUser = 'Текущий пользователь' // В реальном приложении брать из контекста
    const now = new Date().toLocaleString('ru-RU', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit', 
      hour: '2-digit', 
      minute: '2-digit' 
    })
    
    const restoredHistoryItem: HistoryItem = {
      id: Date.now().toString(),
      date: now,
      user: currentUser,
      changes: `Восстановлена версия ${versionToRestore.version} от ${versionToRestore.date}`,
      version: newVersion,
      fullText: versionToRestore.fullText,
      fieldsState: {
        title: fieldsState.title,
        department: fieldsState.department,
        header: fieldsState.header,
        responsibilities: fieldsState.responsibilities,
        requirements: fieldsState.requirements,
        niceToHave: fieldsState.niceToHave,
        conditions: fieldsState.conditions,
        closing: fieldsState.closing,
        link: fieldsState.link,
        fieldSettings: JSON.parse(JSON.stringify(fieldsState.fieldSettings)) // Глубокая копия
      }
    }
    
    setEditHistory(prev => [restoredHistoryItem, ...prev])
    
    // Закрываем модальные окна
    setRestoreConfirmationOpen(false)
    setSelectedHistoryItem(null)
    setVersionToRestore(null)
    
    showToast(`Версия ${versionToRestore.version} успешно восстановлена`, 'success')
  }
  
  // Функция для получения названия поля
  const getFieldName = (fieldKey: string): string => {
    const fieldNames: Record<string, string> = {
      title: 'Название вакансии',
      department: 'Отдел',
      header: 'Заголовок',
      responsibilities: 'Обязанности',
      requirements: 'Требования',
      niceToHave: 'Будет плюсом',
      conditions: 'Условия работы',
      closing: 'Заключение',
      link: 'Ссылка',
      attachment: 'Вложение'
    }
    return fieldNames[fieldKey] || fieldKey
  }
  
  // Функция для вычисления различий между версиями
  const calculateDiff = (currentText: string, nextText: string): string => {
    if (!nextText) return currentText
    
    const currentLines = currentText.split('\n')
    const nextLines = nextText.split('\n')
    const maxLines = Math.max(currentLines.length, nextLines.length)
    const diffLines: string[] = []
    
    for (let i = 0; i < maxLines; i++) {
      const currentLine = currentLines[i] || ''
      const nextLine = nextLines[i] || ''
      
      if (currentLine === nextLine) {
        diffLines.push(currentLine)
      } else {
        // Простое сравнение по словам
        const currentWords = currentLine.split(/(\s+)/)
        const nextWords = nextLine.split(/(\s+)/)
        
        // Если строки полностью разные
        if (currentLine && !nextLine) {
          diffLines.push(`<span style="text-decoration: line-through; background-color: #fef3c7;">${currentLine}</span>`)
        } else if (!currentLine && nextLine) {
          diffLines.push(`<span style="text-decoration: underline; background-color: #fef3c7;">${nextLine}</span>`)
        } else {
          // Сравниваем по словам
          const diffLine = compareLines(currentLine, nextLine)
          diffLines.push(diffLine)
        }
      }
    }
    
    return diffLines.join('\n')
  }
  
  // Функция для сравнения строк по словам
  const compareLines = (current: string, next: string): string => {
    const currentWords = current.split(/(\s+)/)
    const nextWords = next.split(/(\s+)/)
    const result: string[] = []
    
    let currentIdx = 0
    let nextIdx = 0
    
    while (currentIdx < currentWords.length || nextIdx < nextWords.length) {
      if (currentIdx >= currentWords.length) {
        // Остались только слова из следующей версии
        result.push(`<span style="text-decoration: underline; background-color: #fef3c7;">${nextWords.slice(nextIdx).join('')}</span>`)
        break
      } else if (nextIdx >= nextWords.length) {
        // Остались только слова из текущей версии
        result.push(`<span style="text-decoration: line-through; background-color: #fef3c7;">${currentWords.slice(currentIdx).join('')}</span>`)
        break
      } else if (currentWords[currentIdx] === nextWords[nextIdx]) {
        result.push(currentWords[currentIdx])
        currentIdx++
        nextIdx++
      } else {
        // Слова различаются - ищем совпадения дальше
        let found = false
        for (let j = nextIdx + 1; j < nextWords.length; j++) {
          if (currentWords[currentIdx] === nextWords[j]) {
            // Добавляем удаленные слова
            result.push(`<span style="text-decoration: line-through; background-color: #fef3c7;">${nextWords.slice(nextIdx, j).join('')}</span>`)
            nextIdx = j
            found = true
            break
          }
        }
        if (!found) {
          for (let j = currentIdx + 1; j < currentWords.length; j++) {
            if (currentWords[j] === nextWords[nextIdx]) {
              // Добавляем добавленные слова
              result.push(`<span style="text-decoration: underline; background-color: #fef3c7;">${currentWords.slice(currentIdx, j).join('')}</span>`)
              currentIdx = j
              found = true
              break
            }
          }
        }
        if (!found) {
          // Просто помечаем как измененные
          result.push(`<span style="text-decoration: line-through; background-color: #fef3c7;">${currentWords[currentIdx]}</span>`)
          result.push(`<span style="text-decoration: underline; background-color: #fef3c7;">${nextWords[nextIdx]}</span>`)
          currentIdx++
          nextIdx++
        }
      }
    }
    
    return result.join('')
  }
  
  // Моковые данные рекрутеров компании
  const [allRecruiters] = useState([
    { id: '1', name: 'Иван Иванов', email: 'ivan@company.com', phone: '+7 (999) 111-22-33', position: 'Senior Recruiter' },
    { id: '2', name: 'Петр Петров', email: 'petr@company.com', phone: '+7 (999) 222-33-44', position: 'Recruiter' },
    { id: '3', name: 'Мария Сидорова', email: 'maria@company.com', phone: '+7 (999) 333-44-55', position: 'Lead Recruiter' },
    { id: '4', name: 'Анна Смирнова', email: 'anna@company.com', phone: '+7 (999) 444-55-66', position: 'Recruiter' },
    { id: '5', name: 'Дмитрий Козлов', email: 'dmitry@company.com', phone: '+7 (999) 555-66-77', position: 'Junior Recruiter' },
  ])
  
  // Состояние для выбранных рекрутеров (кто может видеть вакансию)
  const [selectedRecruiters, setSelectedRecruiters] = useState<Set<string>>(new Set(['1', '2']))
  
  // Главный рекрутер (может быть только один)
  const [mainRecruiter, setMainRecruiter] = useState<string | null>('1')
  
  // Используем хук для toast-уведомлений
  const toast = useToast()
  
  // Вспомогательная функция для показа toast-уведомлений (для обратной совместимости)
  const showToast = (message: string, type: 'success' | 'warning' | 'error' | 'info' = 'info') => {
    const titles = {
      info: 'Информация',
      warning: 'Внимание',
      error: 'Ошибка',
      success: 'Успешно'
    }
    
    switch (type) {
      case 'info':
        toast.showInfo(titles.info, message)
        break
      case 'warning':
        toast.showWarning(titles.warning, message)
        break
      case 'error':
        toast.showError(titles.error, message)
        break
      case 'success':
        toast.showSuccess(titles.success, message)
        break
    }
  }
  
  const handleRecruiterToggle = (recruiterId: string) => {
    // Если пытаются снять главного рекрутера, показываем предупреждение
    if (mainRecruiter === recruiterId && selectedRecruiters.has(recruiterId)) {
      showToast('Сначала назначьте нового главного рекрутера, затем снимите текущего с вакансии', 'warning')
      return
    }
    
    setSelectedRecruiters(prev => {
      const newSet = new Set(prev)
      if (newSet.has(recruiterId)) {
        newSet.delete(recruiterId)
        // Если это был главный рекрутер, снимаем его с главного
        if (mainRecruiter === recruiterId) {
          setMainRecruiter(null)
        }
      } else {
        newSet.add(recruiterId)
      }
      return newSet
    })
  }
  
  const handleMainRecruiterToggle = (recruiterId: string) => {
    // Главный рекрутер может быть только среди выбранных
    if (!selectedRecruiters.has(recruiterId)) {
      alert('Главный рекрутер должен быть среди тех, кто может видеть вакансию')
      return
    }
    
    // Если уже был главный рекрутер, снимаем его
    if (mainRecruiter === recruiterId) {
      setMainRecruiter(null)
    } else {
      // Устанавливаем нового главного рекрутера (автоматически снимая предыдущего)
      setMainRecruiter(recruiterId)
    }
  }
  
  // Эффект для автоматического снятия главного рекрутера, если он был исключен из выбранных
  useEffect(() => {
    if (mainRecruiter && !selectedRecruiters.has(mainRecruiter)) {
      setMainRecruiter(null)
    }
  }, [selectedRecruiters, mainRecruiter])
  
  // Моковые данные интервьюеров (включая заказчиков - людей в рамках компании)
  const [allInterviewers] = useState([
    { id: '1', name: 'Алексей Козлов', email: 'alexey@company.com', phone: '+7 (999) 111-22-33', position: 'Tech Lead', department: 'Разработка', isCustomer: false },
    { id: '2', name: 'Елена Волкова', email: 'elena@company.com', phone: '+7 (999) 222-33-44', position: 'HR Manager', department: 'HR', isCustomer: false },
    { id: '3', name: 'Дмитрий Новиков', email: 'dmitry@company.com', phone: '+7 (999) 333-44-55', position: 'CTO', department: 'Управление', isCustomer: false },
    { id: '4', name: 'Ольга Морозова', email: 'olga@company.com', phone: '+7 (999) 444-55-66', position: 'Senior Developer', department: 'Разработка', isCustomer: false },
    { id: '5', name: 'Иван Петров', email: 'ivan.petrov@techsoft.ru', phone: '+7 (495) 123-45-67', position: 'Менеджер проекта', department: 'ООО "ТехноСофт"', isCustomer: true },
    { id: '6', name: 'Мария Соколова', email: 'maria@innovations.ru', phone: '+7 (495) 234-56-78', position: 'Руководитель отдела', department: 'АО "Инновации"', isCustomer: true },
    { id: '7', name: 'Петр Сидоров', email: 'petr@sidorov.ru', phone: '+7 (495) 345-67-89', position: 'Владелец', department: 'ИП Сидоров', isCustomer: true },
  ])
  
  // Заказчики и интервьюеры: тогглер «Только из отдела» (вкл.) / «Все» (выкл.)
  const [customersOnlyFromDepartment, setCustomersOnlyFromDepartment] = useState<boolean>(true)
  
  // Состояние для выбранных интервьюеров вакансии (кто может видеть вакансию)
  const [selectedVacancyInterviewers, setSelectedVacancyInterviewers] = useState<Set<string>>(new Set(['1', '2']))
  
  // Состояние для интервьюеров, которых можно приглашать на финальное интервью
  const [finalInterviewInterviewers, setFinalInterviewInterviewers] = useState<Set<string>>(new Set(['1']))
  
  const handleVacancyInterviewerToggle = (interviewerId: string) => {
    setSelectedVacancyInterviewers(prev => {
      const newSet = new Set(prev)
      if (newSet.has(interviewerId)) {
        newSet.delete(interviewerId)
        // Если это был интервьюер для финального интервью, снимаем его
        if (finalInterviewInterviewers.has(interviewerId)) {
          setFinalInterviewInterviewers(prevFinal => {
            const newFinalSet = new Set(prevFinal)
            newFinalSet.delete(interviewerId)
            return newFinalSet
          })
        }
      } else {
        newSet.add(interviewerId)
      }
      return newSet
    })
  }
  
  const handleFinalInterviewToggle = (interviewerId: string) => {
    // Интервьюер для финального интервью должен быть среди выбранных
    if (!selectedVacancyInterviewers.has(interviewerId)) {
      showToast('Интервьюер должен быть среди тех, кто может видеть вакансию', 'warning')
      return
    }
    
    setFinalInterviewInterviewers(prev => {
      const newSet = new Set(prev)
      if (newSet.has(interviewerId)) {
        newSet.delete(interviewerId)
      } else {
        newSet.add(interviewerId)
      }
      return newSet
    })
  }
  
  // Все доступные этапы рекрутинга
  const recruitmentStages = [
    { id: 'new', name: 'New', description: 'Новый кандидат', color: '#2180A0' },
    { id: 'under-review', name: 'Under Review', description: 'На рассмотрении', color: '#3B82F6' },
    { id: 'message', name: 'Message', description: 'Сообщение', color: '#6366F1' },
    { id: 'contact', name: 'Contact', description: 'Контакт', color: '#8B5CF6' },
    { id: 'hr-screening', name: 'HR Screening', description: 'HR скрининг', color: '#A855F7' },
    { id: 'test-task', name: 'Test Task', description: 'Тестовое задание', color: '#C084FC' },
    { id: 'final-interview', name: 'Final Interview', description: 'Финальное интервью', color: '#D946EF' },
    { id: 'decision', name: 'Decision', description: 'Решение', color: '#EC4899' },
    { id: 'interview', name: 'Interview', description: 'Интервью', color: '#8B5CF6' },
    { id: 'offer', name: 'Offer', description: 'Предложение', color: '#22C55E' },
    { id: 'accepted', name: 'Accepted', description: 'Принят', color: '#10B981' },
    { id: 'rejected', name: 'Rejected', description: 'Отказ', color: '#EF4444' },
    { id: 'declined', name: 'Declined', description: 'Отклонено кандидатом', color: '#F59E0B' },
    { id: 'archived', name: 'Archived', description: 'Архив', color: '#6B7280' },
  ]
  
  // Состояние для активных этапов вакансии
  const [activeStages, setActiveStages] = useState<Set<string>>(new Set([
    'new',
    'under-review',
    'interview',
    'offer',
    'accepted',
    'rejected',
    'declined',
    'archived'
  ]))
  
  const handleStageToggle = (stageId: string) => {
    setActiveStages(prev => {
      const newSet = new Set(prev)
      if (newSet.has(stageId)) {
        newSet.delete(stageId)
      } else {
        newSet.add(stageId)
      }
      return newSet
    })
  }
  
  // Все доступные грейды компании
  const allGrades = [
    { id: '1', name: 'Trainee', order: 1 },
    { id: '2', name: 'Junior-', order: 2 },
    { id: '3', name: 'Junior', order: 3 },
    { id: '4', name: 'Junior+', order: 4 },
    { id: '5', name: 'Middle-', order: 5 },
    { id: '6', name: 'Middle', order: 6 },
    { id: '7', name: 'Middle+', order: 7 },
    { id: '8', name: 'Senior-', order: 8 },
    { id: '9', name: 'Senior', order: 9 },
    { id: '10', name: 'Senior+', order: 10 },
    { id: '11', name: 'Lead', order: 11 },
    { id: '12', name: 'Lead+', order: 12 },
    { id: '13', name: 'Head', order: 13 },
    { id: '14', name: 'C-Level', order: 14 },
  ]
  
  // Валюты компании (в порядке настроек)
  const companyCurrencies = [
    { id: '1', code: 'BYN', name: 'Белорусский рубль', isMain: true, order: 1 },
    { id: '2', code: 'USD', name: 'Доллар США', isMain: false, order: 2 },
    { id: '3', code: 'EUR', name: 'Евро', isMain: false, order: 3 },
    { id: '4', code: 'PLN', name: 'Польский злотый', isMain: false, order: 4 },
  ]
  
  // Состояние для активных грейдов вакансии
  const [activeGrades, setActiveGrades] = useState<Set<string>>(new Set(['3', '6', '9', '11']))
  
  // Состояние для зарплатных вилок: gradeId -> currencyCode -> { from: number | null, to: number | null }
  const [salaryRanges, setSalaryRanges] = useState<Record<string, Record<string, { from: number | null; to: number | null }>>>({
    '3': { BYN: { from: 1000, to: 2000 }, USD: { from: null, to: null }, EUR: { from: null, to: null }, PLN: { from: null, to: null } },
    '6': { BYN: { from: 2000, to: 3500 }, USD: { from: null, to: null }, EUR: { from: null, to: null }, PLN: { from: null, to: null } },
    '9': { BYN: { from: 3500, to: 5000 }, USD: { from: null, to: null }, EUR: { from: null, to: null }, PLN: { from: null, to: null } },
    '11': { BYN: { from: 5000, to: 7000 }, USD: { from: null, to: null }, EUR: { from: null, to: null }, PLN: { from: null, to: null } },
  })
  
  // Курсы валют (для пересчета)
  const currencyRates: Record<string, number> = {
    BYN: 1,
    USD: 3.25,
    EUR: 3.46,
    PLN: 0.85
  }
  
  const handleGradeToggle = (gradeId: string) => {
    setActiveGrades(prev => {
      const newSet = new Set(prev)
      if (newSet.has(gradeId)) {
        newSet.delete(gradeId)
        // Удаляем зарплатные вилки для неактивного грейда
        setSalaryRanges(prev => {
          const newRanges = { ...prev }
          delete newRanges[gradeId]
          return newRanges
        })
      } else {
        newSet.add(gradeId)
        // Инициализируем зарплатные вилки для нового грейда
        const mainCurrency = companyCurrencies.find(c => c.isMain)?.code || 'BYN'
        setSalaryRanges(prev => ({
          ...prev,
          [gradeId]: {
            [mainCurrency]: { from: null, to: null },
            ...companyCurrencies.filter(c => !c.isMain).reduce((acc, curr) => {
              acc[curr.code] = { from: null, to: null }
              return acc
            }, {} as Record<string, { from: number | null; to: number | null }>)
          }
        }))
      }
      return newSet
    })
  }
  
  const handleSalaryChange = (gradeId: string, currencyCode: string, field: 'from' | 'to', value: string) => {
    const mainCurrency = companyCurrencies.find(c => c.isMain)?.code || 'BYN'
    const numValue = value === '' ? null : parseFloat(value)
    
    setSalaryRanges(prev => {
      const newRanges = { ...prev }
      if (!newRanges[gradeId]) {
        newRanges[gradeId] = {}
      }
      if (!newRanges[gradeId][currencyCode]) {
        newRanges[gradeId][currencyCode] = { from: null, to: null }
      }
      
      newRanges[gradeId][currencyCode][field] = numValue
      
      // Если изменили главную валюту, пересчитываем остальные
      if (currencyCode === mainCurrency && numValue !== null) {
        companyCurrencies.filter(c => !c.isMain).forEach(currency => {
          if (!newRanges[gradeId][currency.code]) {
            newRanges[gradeId][currency.code] = { from: null, to: null }
          }
          
          const rate = currencyRates[currency.code] || 1
          const mainRate = currencyRates[mainCurrency] || 1
          const convertedValue = (numValue * mainRate) / rate
          
          if (field === 'from') {
            newRanges[gradeId][currency.code].from = Math.round(convertedValue * 100) / 100
          } else {
            newRanges[gradeId][currency.code].to = Math.round(convertedValue * 100) / 100
          }
        })
      }
      
      return newRanges
    })
  }
  
  const getSalaryValue = (gradeId: string, currencyCode: string, field: 'from' | 'to'): number | null => {
    // Если "от" нет, берем "до" предыдущего грейда или 0
    if (field === 'from' && (!salaryRanges[gradeId]?.[currencyCode]?.from)) {
      const currentGrade = allGrades.find(g => g.id === gradeId)
      if (currentGrade) {
        const prevGrade = allGrades
          .filter(g => g.order < currentGrade.order && activeGrades.has(g.id))
          .sort((a, b) => b.order - a.order)[0]
        
        if (prevGrade && salaryRanges[prevGrade.id]?.[currencyCode]?.to) {
          return salaryRanges[prevGrade.id][currencyCode].to
        }
      }
      return 0
    }
    
    return salaryRanges[gradeId]?.[currencyCode]?.[field] || null
  }
  
  // Состояние для формы расчета (Gross/Net) - используется в таблице зарплатных вилок
  const [isGrossFormat, setIsGrossFormat] = useState(true)
  
  // Состояние для вкладки "Встречи и интервью"
  type InterviewMeeting = {
    id: string
    stage: string
    duration: number
    title: string
    description: string
    format: 'office' | 'online' | ''
  }
  
  // Вычисляем количество встреч: активные этапы до оффера - 2
  const getStagesBeforeOffer = () => {
    return recruitmentStages.filter(s => {
      const stageIndex = recruitmentStages.findIndex(st => st.id === s.id)
      const offerIndex = recruitmentStages.findIndex(st => st.id === 'offer')
      return stageIndex < offerIndex && activeStages.has(s.id)
    })
  }
  
  const stagesBeforeOffer = getStagesBeforeOffer()
  const maxMeetingsCount = Math.max(0, stagesBeforeOffer.length - 2)
  
  const [interviewMeetings, setInterviewMeetings] = useState<InterviewMeeting[]>(() => {
    const stages = getStagesBeforeOffer()
    const count = Math.max(0, stages.length - 2)
    // Инициализируем пустые встречи
    return Array.from({ length: count }, (_, i) => ({
      id: `meeting-${i}`,
      stage: '',
      duration: 60,
      title: '',
      description: '',
      format: '' as 'office' | 'online' | '',
    }))
  })
  
  // Обновляем количество встреч при изменении активных этапов
  useEffect(() => {
    const stages = recruitmentStages.filter(s => {
      const stageIndex = recruitmentStages.findIndex(st => st.id === s.id)
      const offerIndex = recruitmentStages.findIndex(st => st.id === 'offer')
      return stageIndex < offerIndex && activeStages.has(s.id)
    })
    const newCount = Math.max(0, stages.length - 2)
    setInterviewMeetings(prev => {
      // Если нужно добавить встречи
      if (prev.length < newCount) {
        const toAdd = newCount - prev.length
        const newMeetings = Array.from({ length: toAdd }, (_, i) => ({
          id: `meeting-${Date.now()}-${i}`,
          stage: '',
          duration: 60,
          title: '',
          description: '',
          format: '' as 'office' | 'online' | '',
        }))
        return [...prev, ...newMeetings]
      }
      // Если нужно удалить встречи (но не меньше 0)
      if (prev.length > newCount && newCount >= 0) {
        return prev.slice(0, newCount)
      }
      return prev
    })
  }, [activeStages])
  
  const updateInterviewMeeting = (id: string, updates: Partial<InterviewMeeting>) => {
    setInterviewMeetings(prev =>
      prev.map(m => m.id === id ? { ...m, ...updates } : m)
    )
  }
  
  const addInterviewMeeting = () => {
    const stages = getStagesBeforeOffer()
    const currentMax = Math.max(0, stages.length - 2)
    setInterviewMeetings(prev => {
      // Разрешаем добавлять встречи, но показываем предупреждение если больше рекомендуемого
      return [
        ...prev,
        {
          id: `meeting-${Date.now()}`,
          stage: '',
          duration: 60,
          title: '',
          description: '',
          format: '' as 'office' | 'online' | '',
        },
      ]
    })
  }
  
  const removeInterviewMeeting = (id: string) => {
    setInterviewMeetings(prev => prev.filter(m => m.id !== id))
  }
  
  // Состояние для вкладки "Scorecard"
  const [scorecardLinkUrl, setScorecardLinkUrl] = useState<string>('')
  const [scorecardLinkTitle, setScorecardLinkTitle] = useState<string>('')
  const [scorecardLinkPosition, setScorecardLinkPosition] = useState<'start' | 'end'>('start')
  const [scorecardLocalActive, setScorecardLocalActive] = useState<boolean>(false)
  const [scorecardLocalSettingsOpen, setScorecardLocalSettingsOpen] = useState<boolean>(false)

  // Состояние для вкладки «Обработка данных»
  const [useUnifiedPrompt, setUseUnifiedPrompt] = useState<boolean>(true)
  const [analysisPrompt, setAnalysisPrompt] = useState<string>('')

  // Состояние для вкладки «Связи и интеграции»: Huntflow
  const [integrationPartner, setIntegrationPartner] = useState<'' | 'huntflow'>('')
  const [huntflowVacancyId, setHuntflowVacancyId] = useState<string>('')
  
  // Офисы компании (для вкладки «Вопросы и ссылки» и др.)
  const questionLinkOffices = [
    { id: 'by', name: 'Беларусь' },
    { id: 'pl', name: 'Польша' },
  ]
  
  // Цвета для выбора (ссылки и вопросы)
  const questionLinkColors = [
    { id: 'blue', hex: '#3B82F6', label: 'Синий' },
    { id: 'green', hex: '#10B981', label: 'Зелёный' },
    { id: 'amber', hex: '#F59E0B', label: 'Янтарный' },
    { id: 'red', hex: '#EF4444', label: 'Красный' },
    { id: 'violet', hex: '#8B5CF6', label: 'Фиолетовый' },
    { id: 'cyan', hex: '#06B6D4', label: 'Бирюзовый' },
    { id: 'gray', hex: '#6B7280', label: 'Серый' },
  ]

  // Подсказки для контактов рекрутера (расширяемый список: при добавлении типа — добавить сюда)
  const recruiterContactHints = [
    { label: 'Телефон', variable: 'recruiter_phone' },
    { label: 'Email', variable: 'recruiter_email' },
    { label: 'LinkedIn', variable: 'recruiter_linkedin' },
    { label: 'Telegram', variable: 'recruiter_telegram' },
  ] as const

  // Состояние для вкладки «Вопросы и ссылки» (по офисам). Один вопрос на офис.
  type OfficeLink = { url: string; useOnSite: boolean; color: string }
  type OfficeQuestionsState = { link: OfficeLink; question: { text: string; color: string } }
  
  const getDefaultOfficeState = (): OfficeQuestionsState => ({
    link: { url: '', useOnSite: false, color: questionLinkColors[0].hex },
    question: { text: '', color: questionLinkColors[0].hex },
  })
  
  const [questionsLinksByOffice, setQuestionsLinksByOffice] = useState<Record<string, OfficeQuestionsState>>(() => {
    const init: Record<string, OfficeQuestionsState> = {}
    questionLinkOffices.forEach((o) => { init[o.id] = getDefaultOfficeState() })
    return init
  })
  
  const updateOfficeLink = (officeId: string, upd: Partial<OfficeLink>) => {
    setQuestionsLinksByOffice((prev) => ({
      ...prev,
      [officeId]: {
        ...prev[officeId],
        link: { ...(prev[officeId]?.link ?? getDefaultOfficeState().link), ...upd },
      },
    }))
  }
  
  const updateOfficeQuestion = (officeId: string, upd: Partial<{ text: string; color: string }>) => {
    setQuestionsLinksByOffice((prev) => {
      const curr = prev[officeId] ?? getDefaultOfficeState()
      const base = curr.question ?? { text: '', color: questionLinkColors[0].hex }
      return {
        ...prev,
        [officeId]: { ...curr, question: { ...base, ...upd } },
      }
    })
  }

  // Состояние для формы текста вакансии
  const [vacancyTitle, setVacancyTitle] = useState('')
  const [vacancyDepartment, setVacancyDepartment] = useState<string>('')
  const [vacancyHeader, setVacancyHeader] = useState('')
  const [vacancyResponsibilities, setVacancyResponsibilities] = useState('')
  const [vacancyRequirements, setVacancyRequirements] = useState('')
  const [vacancyNiceToHave, setVacancyNiceToHave] = useState('')
  const [vacancyConditions, setVacancyConditions] = useState('')
  const [vacancyClosing, setVacancyClosing] = useState('')
  const [vacancyLink, setVacancyLink] = useState('')
  const [vacancyAttachment, setVacancyAttachment] = useState<File | null>(null)
  
  // Состояние для активности и видимости полей
  const [fieldSettings, setFieldSettings] = useState<Record<string, { active: boolean; visible: boolean }>>({
    title: { active: true, visible: true },
    department: { active: true, visible: true },
    header: { active: true, visible: true },
    responsibilities: { active: true, visible: true },
    requirements: { active: true, visible: true },
    niceToHave: { active: true, visible: true },
    conditions: { active: true, visible: true },
    closing: { active: true, visible: true },
    link: { active: true, visible: true },
    attachment: { active: true, visible: true }
  })
  
  // Моковые данные для оргструктуры
  interface Department {
    id: string
    name: string
    parent: string | null
    children?: Department[]
  }
  
  const mockDepartments: Department[] = [
    {
      id: '1',
      name: 'IT Департамент',
      parent: null,
      children: [
        {
          id: '2',
          name: 'Отдел разработки',
          parent: '1',
          children: [
            {
              id: '5',
              name: 'Frontend команда',
              parent: '2',
              children: []
            },
            {
              id: '6',
              name: 'Backend команда',
              parent: '2',
              children: []
            }
          ]
        },
        {
          id: '3',
          name: 'Отдел тестирования',
          parent: '1',
          children: []
        }
      ]
    },
    {
      id: '4',
      name: 'HR Департамент',
      parent: null,
      children: []
    }
  ]
  
  // Функция для получения плоского списка отделов с иерархией
  const getAllDepartmentsFlat = (departments: Department[], level: number = 0): Array<{ id: string; name: string; level: number }> => {
    const result: Array<{ id: string; name: string; level: number }> = []
    departments.forEach(dept => {
      result.push({ id: dept.id, name: dept.name, level })
      if (dept.children && dept.children.length > 0) {
        result.push(...getAllDepartmentsFlat(dept.children, level + 1))
      }
    })
    return result
  }
  
  // Функция для получения полного пути отдела
  const getDepartmentPath = (deptId: string, departments: Department[], path: string[] = []): string => {
    for (const dept of departments) {
      if (dept.id === deptId) {
        return [...path, dept.name].join(' → ')
      }
      if (dept.children) {
        const found = getDepartmentPath(deptId, dept.children, [...path, dept.name])
        if (found) return found
      }
    }
    return ''
  }
  
  // Состояние для активности (комментарии и изменения статуса)
  interface ActivityItem {
    id: string
    type: 'comment' | 'status_change' | 'status_change_with_comment'
    text: string
    date: string
    dateTimestamp?: number // Timestamp для проверки возраста
    status?: string
    oldStatus?: string
    comment?: string // Комментарий, если есть
    rejectionReason?: string // Причина отказа, если статус Rejected
  }
  const [activityItems, setActivityItems] = useState<ActivityItem[]>([])
  
  // Состояние для редактирования активности (теперь редактируем все сразу)
  const [editingActivityId, setEditingActivityId] = useState<string | null>(null)
  const [editingActivityStatus, setEditingActivityStatus] = useState<string>('')
  const [editingActivityOldStatus, setEditingActivityOldStatus] = useState<string>('')
  const [editingActivityComment, setEditingActivityComment] = useState<string>('')
  const [editingActivityRejectionReason, setEditingActivityRejectionReason] = useState<string>('')
  
  // Функция проверки, не старше ли запись 3 дней
  const isActivityEditable = (item: ActivityItem): boolean => {
    if (!item.dateTimestamp) return false
    const now = Date.now()
    const threeDaysInMs = 3 * 24 * 60 * 60 * 1000
    return (now - item.dateTimestamp) <= threeDaysInMs
  }
  
  // Состояние редактирования социальных сетей
  const [editingSocial, setEditingSocial] = useState<string | null>(null)
  const [editingSocialIndex, setEditingSocialIndex] = useState<number | null>(null)
  const [socialValues, setSocialValues] = useState<Record<string, string>>({})
  const [socialValue, setSocialValue] = useState('')
  
  // Состояние редактирования локации
  const [isEditingLocation, setIsEditingLocation] = useState(false)
  const [locationValue, setLocationValue] = useState(selectedCandidate.location)
  
  // Состояние редактирования контактов
  const [isEditingEmail, setIsEditingEmail] = useState(false)
  const [editingEmailIndex, setEditingEmailIndex] = useState<number | null>(null)
  const [emailValue, setEmailValue] = useState('')
  const [isEditingPhone, setIsEditingPhone] = useState(false)
  const [editingPhoneIndex, setEditingPhoneIndex] = useState<number | null>(null)
  const [phoneValue, setPhoneValue] = useState('')
  
  // Состояние для модального окна добавления контакта
  const [addContactModalOpen, setAddContactModalOpen] = useState(false)
  const [newContactType, setNewContactType] = useState<'email' | 'phone'>('email')
  const [newContactValue, setNewContactValue] = useState('')
  
  // Состояние для модального окна добавления социальной сети
  const [addSocialModalOpen, setAddSocialModalOpen] = useState(false)
  const [newSocialPlatform, setNewSocialPlatform] = useState<string>('')
  const [newSocialValue, setNewSocialValue] = useState('')
  
  // Состояние для модального окна дубликатов
  const [duplicateModalOpen, setDuplicateModalOpen] = useState(false)
  
  // Состояние редактирования имени
  const [isEditingName, setIsEditingName] = useState(false)
  const [nameValue, setNameValue] = useState(selectedCandidate.name)
  
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
  const [isEditingOffer, setIsEditingOffer] = useState(false)
  const [offerValue, setOfferValue] = useState((selectedCandidate as any).offer || '')
  
  // Состояние видимости зарплатной информации (по умолчанию скрыты)
  const [isSalaryVisible, setIsSalaryVisible] = useState(false)
  const [isOfferVisible, setIsOfferVisible] = useState(false)
  
  // Состояние для загрузки документов
  const [isDraggingDocument, setIsDraggingDocument] = useState(false)
  const [documentUploadModalOpen, setDocumentUploadModalOpen] = useState(false)
  const [pendingDocumentFile, setPendingDocumentFile] = useState<File | null>(null)
  const [documentVisibilityGroup, setDocumentVisibilityGroup] = useState<'only-me' | 'group'>('only-me')
  const [selectedGroup, setSelectedGroup] = useState<string>('')
  
  // Состояние для хранения загруженных документов
  const [uploadedDocuments, setUploadedDocuments] = useState<Array<{
    id: string
    name: string
    size: number
    uploadedDate: string
    visibility: 'only-me' | 'group'
    groupId?: string
    groupName?: string
  }>>([
    // Пример существующего документа
    {
      id: '1',
      name: 'john_doe_cv.pdf',
      size: 450 * 1024, // 450 KB в байтах
      uploadedDate: 'Jan 15, 2026',
      visibility: 'only-me'
    },
    // Пример документа с группой
    {
      id: '2',
      name: 'test_document.pdf',
      size: 200 * 1024, // 200 KB в байтах
      uploadedDate: 'Jan 20, 2026',
      visibility: 'group',
      groupId: '1',
      groupName: 'Рекрутеры'
    }
  ])
  
  // Моковые группы для выбора видимости документа
  const mockGroups = [
    { id: '1', name: 'Рекрутеры' },
    { id: '2', name: 'Интервьюеры' },
    { id: '3', name: 'Заказчики' },
    { id: '4', name: 'HR отдел' },
    { id: '5', name: 'Менеджмент' }
  ]
  
  // Причины отказа (объявляем до использования в useState)
  const rejectionReasons = [
    'Не подходит по опыту',
    'Не подходит по навыкам',
    'Зарплатные ожидания слишком высокие',
    'Не подходит по локации',
    'Другая причина'
  ]
  
  // Состояние для комментария к статусу
  const [statusComment, setStatusComment] = useState('')
  const [rejectionReason, setRejectionReason] = useState('Без указания причин')
  
  // Состояние для отслеживания изменения статуса на Rejected (для отложенного добавления в активность)
  const [pendingRejectedStatus, setPendingRejectedStatus] = useState<{
    oldStatus: string
    comment: string
    date: string
    dateTimestamp: number
  } | null>(null)
  
  // Состояние редактирования Position
  const [isEditingPosition, setIsEditingPosition] = useState(false)
  const [positionValue, setPositionValue] = useState(selectedCandidate.position || '')
  
  // Состояние редактирования Source (Applied не редактируется)
  const [isEditingSource, setIsEditingSource] = useState(false)
  const [sourceValue, setSourceValue] = useState(selectedCandidate.source || '')
  
  // Варианты для поля "Пол"
  const genderOptions = ['Мужской', 'Женский', 'Не указано']
  const levelOptions = ['Junior', 'Middle', 'Senior', 'Lead', 'Principal']
  
  // Состояние статуса и причин отказа
  const [showOtherFields, setShowOtherFields] = useState(false)
  
  // Порядок статусов для перехода
  const statusOrder = ['New', 'Under Review', 'Interview', 'Offer', 'Accepted', 'Rejected', 'Declined', 'Archived']
  
  const getNextStatus = (currentStatus: string) => {
    const currentIndex = statusOrder.findIndex(s => s === currentStatus)
    if (currentIndex >= 0 && currentIndex < statusOrder.length - 1) {
      return statusOrder[currentIndex + 1]
    }
    return currentStatus
  }
  
  const handleStatusChange = (newStatus: string) => {
    const oldStatus = selectedCandidate.status
    const hasComment = statusComment.trim()
    const hasStatusChange = oldStatus !== newStatus
    const currentDate = new Date().toLocaleString('ru-RU', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    })
    
    // Если меняем статус с "Rejected" на другой - очищаем отложенную запись
    if (oldStatus === 'Rejected' && newStatus !== 'Rejected' && pendingRejectedStatus) {
      setPendingRejectedStatus(null)
    }
    
    // Если новый статус "Rejected" - не добавляем в активность сразу, сохраняем для отложенного добавления
    if (newStatus === 'Rejected' && hasStatusChange) {
      // Сохраняем информацию для отложенного добавления в активность
      const now = Date.now()
      setPendingRejectedStatus({
        oldStatus,
        comment: statusComment,
        date: currentDate,
        dateTimestamp: now
      })
      // Если нет причины, устанавливаем "Без указания причин"
      if (!rejectionReason) {
        setRejectionReason('Без указания причин')
      }
    } else {
      // Для всех остальных статусов добавляем в активность сразу
      // Если есть и комментарий, и изменение статуса - создаем одну объединенную запись
      if (hasComment && hasStatusChange) {
        console.log(`Статус изменен на "${newStatus}" с комментарием: "${statusComment}"`)
        const now = Date.now()
        const combinedItem: ActivityItem = {
          id: `combined-${now}`,
          type: 'status_change_with_comment',
          text: `Статус изменен с "${oldStatus}" на "${newStatus}"`,
          date: currentDate,
          dateTimestamp: now,
          oldStatus,
          status: newStatus,
          comment: statusComment
        }
        setActivityItems(prev => [combinedItem, ...prev])
      } 
      // Если есть только комментарий (без изменения статуса)
      else if (hasComment) {
        console.log(`Комментарий добавлен: "${statusComment}"`)
        const now = Date.now()
        const commentItem: ActivityItem = {
          id: `comment-${now}`,
          type: 'comment',
          text: statusComment,
          date: currentDate,
          dateTimestamp: now,
          status: selectedCandidate.status, // Сохраняем текущий статус для простого комментария
          comment: statusComment
        }
        setActivityItems(prev => [commentItem, ...prev])
      }
      // Если есть только изменение статуса (без комментария)
      else if (hasStatusChange) {
        const now = Date.now()
        const statusItem: ActivityItem = {
          id: `status-${now}`,
          type: 'status_change',
          text: `Статус изменен с "${oldStatus}" на "${newStatus}"`,
          date: currentDate,
          dateTimestamp: now,
          oldStatus,
          status: newStatus
        }
        setActivityItems(prev => [statusItem, ...prev])
      }
      
      // Переключаемся на вкладку Activity (только если не Rejected)
      setRightTab('activity')
    }
    
    setSelectedCandidate(prev => ({
      ...prev,
      status: newStatus,
      statusColor: getStatusColor(newStatus)
    }))
    
    // Очищаем комментарий после отправки
    setStatusComment('')
  }
  
  // Обработка изменения причины отказа - добавляем запись в активность после выбора причины
  const handleRejectionReasonChange = (reason: string) => {
    setRejectionReason(reason)
    
    // Если есть отложенная запись о статусе Rejected, добавляем её в активность
    if (pendingRejectedStatus) {
      const { oldStatus, comment, date, dateTimestamp } = pendingRejectedStatus
      const hasComment = comment.trim()
      
      if (hasComment) {
        // Объединенная запись с комментарием
        const combinedItem: ActivityItem = {
          id: `combined-${dateTimestamp}`,
          type: 'status_change_with_comment',
          text: `Статус изменен с "${oldStatus}" на "Rejected" (${reason})`,
          date: date,
          dateTimestamp: dateTimestamp,
          oldStatus,
          status: 'Rejected',
          comment: comment,
          rejectionReason: reason
        }
        setActivityItems(prev => [combinedItem, ...prev])
      } else {
        // Только изменение статуса
        const statusItem: ActivityItem = {
          id: `status-${dateTimestamp}`,
          type: 'status_change',
          text: `Статус изменен с "${oldStatus}" на "Rejected" (${reason})`,
          date: date,
          dateTimestamp: dateTimestamp,
          oldStatus,
          status: 'Rejected',
          rejectionReason: reason
        }
        setActivityItems(prev => [statusItem, ...prev])
      }
      
      // Очищаем отложенную запись
      setPendingRejectedStatus(null)
      
      // Переключаемся на вкладку Activity
      setRightTab('activity')
    }
  }
  
  const handleNextStatus = () => {
    const nextStatus = getNextStatus(selectedCandidate.status)
    if (nextStatus !== selectedCandidate.status) {
      handleStatusChange(nextStatus)
    }
  }
  
  const handleStatusCommentSubmit = () => {
    if (statusComment.trim()) {
      console.log(`Комментарий отправлен: "${statusComment}"`)
      // Добавляем комментарий в активность
      const now = Date.now()
      const commentItem: ActivityItem = {
        id: `comment-${now}`,
        type: 'comment',
        text: statusComment,
        date: new Date().toLocaleString('ru-RU', { 
          day: '2-digit', 
          month: '2-digit', 
          year: 'numeric', 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        dateTimestamp: now,
        status: selectedCandidate.status, // Сохраняем текущий статус для простого комментария
        comment: statusComment
      }
      setActivityItems(prev => [commentItem, ...prev])
      // Комментарий отправляется без изменения статуса
      setStatusComment('')
      // Переключаемся на вкладку Activity
      setRightTab('activity')
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
  
  // Функции редактирования активности (теперь редактируем все сразу)
  const handleEditActivity = (item: ActivityItem) => {
    setEditingActivityId(item.id)
    // Устанавливаем все значения для редактирования
    if (item.oldStatus && item.status) {
      setEditingActivityOldStatus(item.oldStatus)
      setEditingActivityStatus(item.status)
    } else if (item.status) {
      // Для простого комментария используем текущий статус как oldStatus и status
      setEditingActivityOldStatus(item.status)
      setEditingActivityStatus(item.status)
    } else {
      // Если нет статуса, используем текущий статус кандидата
      setEditingActivityOldStatus(selectedCandidate.status)
      setEditingActivityStatus(selectedCandidate.status)
    }
    setEditingActivityComment(item.comment || item.text || '')
    setEditingActivityRejectionReason(item.rejectionReason || '')
  }
  
  const handleSaveActivityEdit = () => {
    if (!editingActivityId) return
    
    setActivityItems(prev => {
      const updatedItems = [...prev]
      const currentIndex = updatedItems.findIndex(item => item.id === editingActivityId)
      
      if (currentIndex === -1) return prev
      
      const currentItem = updatedItems[currentIndex]
      const hasStatusChange = editingActivityOldStatus !== editingActivityStatus
      const hasComment = editingActivityComment.trim().length > 0
      const newStatus = editingActivityStatus
      const isRejected = newStatus === 'Rejected'
      
      // Определяем тип записи
      let newType: 'comment' | 'status_change' | 'status_change_with_comment'
      if (hasStatusChange && hasComment) {
        newType = 'status_change_with_comment'
      } else if (hasStatusChange) {
        newType = 'status_change'
      } else {
        newType = 'comment'
      }
      
      // Формируем текст для статуса (с причиной отказа, если Rejected)
      let statusText = ''
      if (hasStatusChange) {
        if (isRejected && editingActivityRejectionReason) {
          statusText = `Статус изменен с "${editingActivityOldStatus}" на "Rejected" (${editingActivityRejectionReason})`
        } else {
          statusText = `Статус изменен с "${editingActivityOldStatus}" на "${newStatus}"`
        }
      }
      
      // Обновляем текущий элемент
      const updatedItem: ActivityItem = {
        ...currentItem,
        type: newType,
        // Для простого комментария (без изменения статуса) сохраняем текущий статус
        oldStatus: hasStatusChange ? editingActivityOldStatus : undefined,
        status: newStatus, // Всегда сохраняем текущий статус
        comment: hasComment ? editingActivityComment : undefined,
        text: hasComment ? editingActivityComment : statusText,
        rejectionReason: isRejected ? editingActivityRejectionReason : undefined
      }
      
      updatedItems[currentIndex] = updatedItem
      
      // Если изменился статус, обновляем oldStatus следующего элемента (если он есть)
      if (hasStatusChange && currentIndex < updatedItems.length - 1) {
        const nextItem = updatedItems[currentIndex + 1]
        // Старый статус текущего элемента (до редактирования) - это status, который был до изменения
        const oldStatusOfCurrent = currentItem.status
        
        // Обновляем oldStatus следующего элемента, если он совпадает со старым status текущего элемента
        // Логика: если следующий элемент начинался со старого status текущего элемента,
        // то после изменения текущего элемента на новый статус, следующий элемент должен начинаться с нового статуса
        if (oldStatusOfCurrent && nextItem.oldStatus === oldStatusOfCurrent) {
          // Если oldStatus следующего элемента совпадает со старым status редактируемого элемента
          updatedItems[currentIndex + 1] = {
            ...nextItem,
            oldStatus: newStatus // Обновляем oldStatus следующего элемента на новый статус
          }
        } else if (oldStatusOfCurrent && nextItem.type === 'comment' && nextItem.status === oldStatusOfCurrent) {
          // Если следующий элемент - простой комментарий и его status совпадает со старым status
          updatedItems[currentIndex + 1] = {
            ...nextItem,
            status: newStatus, // Обновляем status на новый статус
            oldStatus: newStatus // Также устанавливаем oldStatus для консистентности
          }
        }
      }
      
      return updatedItems
    })
    
    // Сбрасываем состояние редактирования
    setEditingActivityId(null)
    setEditingActivityStatus('')
    setEditingActivityOldStatus('')
    setEditingActivityComment('')
    setEditingActivityRejectionReason('')
  }
  
  const handleCancelActivityEdit = () => {
    setEditingActivityId(null)
    setEditingActivityStatus('')
    setEditingActivityOldStatus('')
    setEditingActivityComment('')
    setEditingActivityRejectionReason('')
  }
  
  const handleDeleteActivity = (itemId: string) => {
    setActivityItems(prev => {
      // Можно удалять только последний элемент (первый в массиве, так как они отсортированы от новых к старым)
      if (prev.length > 0 && prev[0].id === itemId) {
        return prev.filter(item => item.id !== itemId)
      }
      return prev
    })
  }
  
  useEffect(() => {
    setLocationValue(selectedCandidate.location)
    setTagsValue((selectedCandidate.tags || []).join(', '))
    setLevelValue(selectedCandidate.level || '')
    setAgeValue(selectedCandidate.age?.toString() || '')
    setGenderValue(selectedCandidate.gender || '')
    setSalaryValue(selectedCandidate.salaryExpectations || '')
    setPositionValue(selectedCandidate.position || '')
    setSourceValue(selectedCandidate.source || '')
  }, [selectedCandidate.location, selectedCandidate.tags, selectedCandidate.level, selectedCandidate.age, selectedCandidate.gender, selectedCandidate.salaryExpectations, selectedCandidate.position, selectedCandidate.source])
  
  // Получаем массивы контактов с fallback на старые поля
  const getEmails = () => (selectedCandidate as any).emails || (selectedCandidate.email ? [selectedCandidate.email] : [])
  const getPhones = () => (selectedCandidate as any).phones || (selectedCandidate.phone ? [selectedCandidate.phone] : [])
  
  const handleEmailSave = (index: number) => {
    const emails = getEmails()
    const newEmails = [...emails]
    newEmails[index] = emailValue.trim()
    setSelectedCandidate(prev => ({ 
      ...prev, 
      email: newEmails[0] || '',
      emails: newEmails
    }))
    setIsEditingEmail(false)
    setEditingEmailIndex(null)
    setEmailValue('')
  }
  
  const handlePhoneSave = (index: number) => {
    const phones = getPhones()
    const newPhones = [...phones]
    newPhones[index] = phoneValue.trim()
    setSelectedCandidate(prev => ({ 
      ...prev, 
      phone: newPhones[0] || '',
      phones: newPhones
    }))
    setIsEditingPhone(false)
    setEditingPhoneIndex(null)
    setPhoneValue('')
  }
  
  const handleDeleteEmail = (index: number) => {
    const emails = getEmails()
    const newEmails = emails.filter((_: string, i: number) => i !== index)
    setSelectedCandidate(prev => ({ 
      ...prev, 
      email: newEmails[0] || '',
      emails: newEmails
    }))
  }
  
  const handleDeletePhone = (index: number) => {
    const phones = getPhones()
    const newPhones = phones.filter((_: string, i: number) => i !== index)
    setSelectedCandidate(prev => ({ 
      ...prev, 
      phone: newPhones[0] || '',
      phones: newPhones
    }))
  }
  
  const handleAddContact = () => {
    if (!newContactValue.trim()) return
    
    const emails = getEmails()
    const phones = getPhones()
    
    // Проверка на дубликаты
    if (newContactType === 'email') {
      if (emails.includes(newContactValue.trim())) {
        alert('Такой email уже существует')
        return
      }
      const newEmails = [...emails, newContactValue.trim()]
      setSelectedCandidate(prev => ({ 
        ...prev, 
        email: newEmails[0] || '',
        emails: newEmails
      }))
    } else {
      if (phones.includes(newContactValue.trim())) {
        alert('Такой телефон уже существует')
        return
      }
      const newPhones = [...phones, newContactValue.trim()]
      setSelectedCandidate(prev => ({ 
        ...prev, 
        phone: newPhones[0] || '',
        phones: newPhones
      }))
    }
    
    setNewContactValue('')
    setAddContactModalOpen(false)
  }
  
  const startEditingEmail = (index: number) => {
    const emails = getEmails()
    setEmailValue(emails[index] || '')
    setEditingEmailIndex(index)
    setIsEditingEmail(true)
  }
  
  const startEditingPhone = (index: number) => {
    const phones = getPhones()
    setPhoneValue(phones[index] || '')
    setEditingPhoneIndex(index)
    setIsEditingPhone(true)
  }
  
  const handleNameSave = () => {
    setSelectedCandidate(prev => ({ ...prev, name: nameValue } as typeof prev))
    setIsEditingName(false)
  }
  
  const handleTagsSave = () => {
    const tags = tagsValue.split(',').map(t => t.trim()).filter(t => t.length > 0)
    setSelectedCandidate(prev => ({ ...prev, tags } as typeof prev))
    setIsEditingTags(false)
  }
  
  const handleLevelSave = () => {
    setSelectedCandidate(prev => ({ ...prev, level: levelValue } as typeof prev))
    setIsEditingLevel(false)
  }
  
  const handleAgeSave = () => {
    setSelectedCandidate(prev => ({ ...prev, age: ageValue ? parseInt(ageValue) : undefined } as typeof prev))
    setIsEditingAge(false)
  }
  
  const handleGenderSave = () => {
    setSelectedCandidate(prev => ({ ...prev, gender: genderValue } as typeof prev))
    setIsEditingGender(false)
  }
  
  const handleSalarySave = () => {
    setSelectedCandidate(prev => ({ ...prev, salaryExpectations: salaryValue } as typeof prev))
    setIsEditingSalary(false)
  }
  
  const handleOfferSave = () => {
    setSelectedCandidate(prev => ({ ...prev, offer: offerValue } as any))
    setIsEditingOffer(false)
  }
  
  const handlePositionSave = () => {
    setSelectedCandidate(prev => ({ ...prev, position: positionValue } as typeof prev))
    setIsEditingPosition(false)
  }
  
  const handleSourceSave = () => {
    setSelectedCandidate(prev => ({ ...prev, source: sourceValue } as typeof prev))
    setIsEditingSource(false)
  }
  
  // Получить контакты для конкретной платформы (массив)
  const getSocialContacts = (platform: string): string[] => {
    const pluralKey = `${platform}s` as keyof typeof selectedCandidate
    const contacts = (selectedCandidate as any)[pluralKey]
    if (Array.isArray(contacts)) {
      return contacts
    }
    // Fallback на старое поле для обратной совместимости
    const singleValue = selectedCandidate[platform as keyof typeof selectedCandidate]
    if (singleValue && typeof singleValue === 'string' && singleValue.trim() !== '') {
      return [singleValue]
    }
    return []
  }
  
  // Получить все социальные сети (включая те, у которых нет контакта)
  const getAllSocialNetworks = () => {
    const socialPlatforms = ['whatsapp', 'viber', 'telegram', 'vk', 'linkedin', 'dribbble', 'behance', 'pinterest', 'habrCareer', 'github', 'instagram', 'facebook', 'twitter', 'kaggle', 'discord'] as const
    return socialPlatforms.map(platform => {
      const contacts = getSocialContacts(platform)
      const hasContact = contacts.length > 0
      return {
        platform,
        contacts,
        hasContact,
        ...getPlatformInfo(platform)
      }
    })
  }
  
  // Функция для получения контактов кандидата (для сравнения)
  const getCandidateEmails = (candidate: any): string[] => {
    return candidate.emails || (candidate.email ? [candidate.email] : [])
  }
  
  const getCandidatePhones = (candidate: any): string[] => {
    return candidate.phones || (candidate.phone ? [candidate.phone] : [])
  }
  
  const getCandidateSocialContacts = (candidate: any, platform: string): string[] => {
    const pluralKey = `${platform}s` as keyof typeof candidate
    const contacts = candidate[pluralKey]
    if (Array.isArray(contacts)) {
      return contacts
    }
    const singleValue = candidate[platform]
    if (singleValue && typeof singleValue === 'string' && singleValue.trim() !== '') {
      return [singleValue]
    }
    return []
  }
  
  // Моковые данные для дубликата (в реальном приложении это будет приходить с бэкенда)
  const duplicateCandidate = {
    id: '1-duplicate',
    name: 'John Doe',
    position: 'Senior Developer',
    avatar: 'JD',
    email: 'john@example.com',
    emails: ['john@example.com'],
    phone: '+1 (555) 123-4567',
    phones: ['+1 (555) 123-4567'],
    location: 'New York, USA',
    vacancy: 'Frontend Senior',
    status: 'New',
    source: 'LinkedIn',
    applied: 'Jan 15, 2026',
    level: 'Senior',
    tags: ['React', 'TypeScript', 'Senior'],
    age: 32,
    gender: 'Мужской',
    salaryExpectations: '150,000 - 200,000 USD',
    telegrams: ['@johndoe', '@johndoe_new'],
    whatsapps: ['+15551234567'],
    facebooks: ['johndoe'],
    linkedins: ['/in/johndoe']
  }
  
  // Функция для проверки совпадения значений
  const isMatch = (value1: any, value2: any): boolean => {
    if (value1 === value2) return true
    if (typeof value1 === 'string' && typeof value2 === 'string') {
      return value1.toLowerCase().trim() === value2.toLowerCase().trim()
    }
    if (Array.isArray(value1) && Array.isArray(value2)) {
      return value1.some(v1 => value2.some(v2 => isMatch(v1, v2)))
    }
    return false
  }
  
  // Функция для проверки совпадения контакта в массивах
  const hasMatchingContact = (contacts1: string[], contacts2: string[]): boolean => {
    return contacts1.some(c1 => contacts2.some(c2 => isMatch(c1, c2)))
  }
  
  // Функция для проверки, совпадает ли конкретный контакт
  const isContactMatch = (contact: string, otherContacts: string[]): boolean => {
    return otherContacts.some(c => isMatch(contact, c))
  }
  
  // Функция для расчета вероятности дубликата в процентах
  const calculateDuplicateProbability = (candidate1: any, candidate2: any): number => {
    let matches = 0
    let totalChecks = 0
    
    // Проверка имени (важный фактор)
    totalChecks += 2
    if (isMatch(candidate1.name, candidate2.name)) matches += 2
    
    // Проверка должности
    totalChecks += 1
    if (isMatch(candidate1.position, candidate2.position)) matches += 1
    
    // Проверка email
    const emails1 = getCandidateEmails(candidate1)
    const emails2 = getCandidateEmails(candidate2)
    if (emails1.length > 0 && emails2.length > 0) {
      totalChecks += 2
      if (hasMatchingContact(emails1, emails2)) matches += 2
    }
    
    // Проверка телефона
    const phones1 = getCandidatePhones(candidate1)
    const phones2 = getCandidatePhones(candidate2)
    if (phones1.length > 0 && phones2.length > 0) {
      totalChecks += 2
      if (hasMatchingContact(phones1, phones2)) matches += 2
    }
    
    // Проверка соцсетей
    const socialPlatforms = ['whatsapp', 'viber', 'telegram', 'vk', 'linkedin', 'dribbble', 'behance', 'pinterest', 'habrCareer', 'github', 'instagram', 'facebook', 'twitter', 'kaggle', 'discord']
    socialPlatforms.forEach(platform => {
      const contacts1 = getCandidateSocialContacts(candidate1, platform)
      const contacts2 = getCandidateSocialContacts(candidate2, platform)
      if (contacts1.length > 0 && contacts2.length > 0) {
        totalChecks += 1
        if (hasMatchingContact(contacts1, contacts2)) matches += 1
      }
    })
    
    // Проверка локации
    if (candidate1.location && candidate2.location) {
      totalChecks += 1
      if (isMatch(candidate1.location, candidate2.location)) matches += 1
    }
    
    // Проверка возраста
    if (candidate1.age && candidate2.age) {
      totalChecks += 1
      if (candidate1.age === candidate2.age) matches += 1
    }
    
    // Проверка тегов
    if (candidate1.tags && candidate2.tags && candidate1.tags.length > 0 && candidate2.tags.length > 0) {
      totalChecks += 1
      if (isMatch(candidate1.tags, candidate2.tags)) matches += 1
    }
    
    if (totalChecks === 0) return 0
    
    // Рассчитываем процент (минимум 0, максимум 100)
    const probability = Math.round((matches / totalChecks) * 100)
    return Math.min(100, Math.max(0, probability))
  }
  
  // Инициализация значений социальных сетей
  // Обработка клавиш Enter и Esc в модальном окне загрузки документа
  useEffect(() => {
    if (!documentUploadModalOpen) return
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        if (documentVisibilityGroup === 'only-me' || (documentVisibilityGroup === 'group' && selectedGroup)) {
          handleDocumentUploadConfirm()
        }
      } else if (e.key === 'Escape') {
        e.preventDefault()
        handleDocumentUploadCancel()
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documentUploadModalOpen, documentVisibilityGroup, selectedGroup])
  
  useEffect(() => {
    const values: Record<string, string> = {}
    const socialPlatforms = ['whatsapp', 'viber', 'telegram', 'vk', 'linkedin', 'dribbble', 'behance', 'pinterest', 'habrCareer', 'github', 'instagram', 'facebook', 'twitter', 'kaggle', 'discord'] as const
    socialPlatforms.forEach(platform => {
      const value = selectedCandidate[platform as keyof typeof selectedCandidate]
      values[platform] = (value && typeof value === 'string') ? value : ''
    })
    setSocialValues(values)
  }, [selectedCandidate])
  
  const handleSocialEdit = (platform: string, index: number) => {
    const contacts = getSocialContacts(platform)
    setSocialValue(contacts[index] || '')
    setEditingSocial(platform)
    setEditingSocialIndex(index)
  }
  
  const handleSocialSave = (platform: string, index: number) => {
    if (!socialValue.trim()) return
    
    const contacts = getSocialContacts(platform)
    const newContacts = [...contacts]
    
    // Если индекс равен длине массива, это новый контакт
    if (index === contacts.length) {
      newContacts.push(socialValue.trim())
    } else {
      newContacts[index] = socialValue.trim()
    }
    
    const pluralKey = `${platform}s` as keyof typeof selectedCandidate
    setSelectedCandidate(prev => ({
      ...prev,
      [platform]: newContacts[0] || '', // Для обратной совместимости
      [pluralKey]: newContacts
    }))
    setEditingSocial(null)
    setEditingSocialIndex(null)
    setSocialValue('')
  }
  
  const handleSocialCancel = () => {
    setEditingSocial(null)
    setEditingSocialIndex(null)
    setSocialValue('')
  }
  
  const handleSocialValueChange = (value: string) => {
    setSocialValue(value)
  }
  
  const handleAddSocialContact = (platform: string) => {
    const contacts = getSocialContacts(platform)
    
    // Ограничение до 5 контактов
    if (contacts.length >= 5) {
      alert('Можно добавить максимум 5 контактов для одной платформы')
      return
    }
    
    // Начинаем редактирование нового контакта
    setSocialValue('')
    setEditingSocial(platform)
    setEditingSocialIndex(contacts.length) // Новый индекс
  }
  
  const handleDeleteSocialContact = (platform: string, index: number) => {
    const contacts = getSocialContacts(platform)
    const newContacts = contacts.filter((_, i) => i !== index)
    
    const pluralKey = `${platform}s` as keyof typeof selectedCandidate
    setSelectedCandidate(prev => ({
      ...prev,
      [platform]: newContacts[0] || '', // Для обратной совместимости
      [pluralKey]: newContacts
    }))
  }
  
  // Получить доступные платформы (те, которые еще не добавлены)
  const getAvailableSocialPlatforms = () => {
    const allPlatforms = ['whatsapp', 'viber', 'telegram', 'vk', 'linkedin', 'dribbble', 'behance', 'pinterest', 'habrCareer', 'github', 'instagram', 'facebook', 'twitter', 'kaggle', 'discord'] as const
    return allPlatforms.filter(platform => {
      const value = socialValues[platform] || selectedCandidate[platform as keyof typeof selectedCandidate]
      return !value || (typeof value === 'string' && value.trim() === '')
    })
  }
  
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 800)
      setWindowWidth(window.innerWidth)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  
  const handleCandidateSelect = (candidate: typeof mockCandidates[0]) => {
    // Копируем все данные кандидата, включая все поля социальных сетей
    setSelectedCandidate({ ...candidate })
    // На мобильных открываем правую колонку как модальное окно
    if (isMobile) {
      setIsRightColumnOpen(true)
    } else {
      // На десктопе всегда показываем правую колонку
      setIsRightColumnOpen(false)
    }
  }
  
  // Сброс прокрутки при изменении кандидата, вкладки или настроек
  useEffect(() => {
    if (rightColumnRef.current) {
      rightColumnRef.current.scrollTop = 0
    }
  }, [selectedCandidate.id, leftTab, rightTab])
  
  // На десктопе правая колонка всегда видна
  useEffect(() => {
    if (!isMobile) {
      setIsRightColumnOpen(false)
    }
  }, [isMobile])
  
  const handleCloseRightColumn = () => {
    setIsRightColumnOpen(false)
  }
  
  const handleSettingTabClick = (tab: 'text' | 'recruiters' | 'customers' | 'questions' | 'integrations' | 'statuses' | 'salary' | 'interviews' | 'scorecard' | 'dataProcessing' | 'history') => {
    setSelectedSettingTab(tab)
    // На мобильных открываем правую колонку как модальное окно
    if (isMobile) {
      setIsRightColumnOpen(true)
    }
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
        <Flex align="center" gap="2" mb="3">
          <TextField.Root
            placeholder={`Search ${leftTab}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ flex: 1 }}
          >
            <TextField.Slot>
              <MagnifyingGlassIcon width={16} height={16} />
            </TextField.Slot>
          </TextField.Root>
          {/* Кнопка-глаз для открытия карточки кандидата на мобильных (только на вкладке Chat) */}
          {isMobile && leftTab === 'chat' && (
            <Button
              variant="soft"
              size="2"
              onClick={() => setIsRightColumnOpen(true)}
              style={{ flexShrink: 0 }}
            >
              <EyeOpenIcon width={16} height={16} />
            </Button>
          )}
        </Flex>

        {/* Workflow buttons для мобильных (только на вкладке Chat) */}
        {isMobile && leftTab === 'chat' && (
          <Box className={styles.workflowButtonsContainer} mb="3" style={{ overflowX: 'auto', overflowY: 'hidden', WebkitOverflowScrolling: 'touch' }}>
            <Flex gap="2" align="center" style={{ flexShrink: 0, minWidth: 'max-content' }}>
              {/* Быстрые кнопки */}
              <Box className={styles.quickButton} style={{ backgroundColor: '#ef4444', position: 'relative', flexShrink: 0 }}>
                <Link2Icon width={20} height={20} style={{ color: '#ffffff', fontWeight: 'bold' }} />
                <Box className={styles.flagBadge} title="Беларусь">
                  <Text style={{ fontSize: '20px', lineHeight: 1 }}>🇧🇾</Text>
                </Box>
              </Box>
              <Box className={styles.quickButton} style={{ backgroundColor: '#f97316', position: 'relative', flexShrink: 0 }}>
                <Text size="4" weight="bold" style={{ color: '#ffffff' }}>?</Text>
                <Box className={styles.flagBadge} title="Беларусь">
                  <Text style={{ fontSize: '20px', lineHeight: 1 }}>🇧🇾</Text>
                </Box>
              </Box>
              <Box className={styles.quickButton} style={{ backgroundColor: '#eab308', position: 'relative', flexShrink: 0 }}>
                <Link2Icon width={20} height={20} style={{ color: '#ffffff', fontWeight: 'bold' }} />
                <Box className={styles.flagBadge} title="Польша">
                  <Text style={{ fontSize: '20px', lineHeight: 1 }}>🇵🇱</Text>
                </Box>
              </Box>
              <Box className={styles.quickButton} style={{ backgroundColor: '#3b82f6', position: 'relative', flexShrink: 0 }}>
                <Text size="4" weight="bold" style={{ color: '#ffffff' }}>?</Text>
                <Box className={styles.flagBadge} title="Польша">
                  <Text style={{ fontSize: '20px', lineHeight: 1 }}>🇵🇱</Text>
                </Box>
              </Box>
              <Box className={styles.quickButton} style={{ backgroundColor: '#06b6d4', flexShrink: 0 }}>
                <CalendarIcon width={20} height={20} style={{ color: '#ffffff', fontWeight: 'bold' }} />
              </Box>
              <Box className={styles.quickButton} style={{ backgroundColor: '#6b7280', flexShrink: 0 }}>
                <Text size="3" weight="bold" style={{ color: '#ffffff' }}>📄</Text>
              </Box>
              <Box className={styles.quickButton} style={{ backgroundColor: '#10b981', flexShrink: 0 }}>
                <Text size="5" weight="bold" style={{ color: '#ffffff' }}>+</Text>
              </Box>

              {/* Тогглеры этапов процесса */}
              <Box
                className={styles.workflowButton}
                data-selected={selectedWorkflow === 'screening'}
                onClick={() => setSelectedWorkflow('screening')}
                style={{ flexShrink: 0 }}
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
                style={{ flexShrink: 0 }}
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
              
              {/* Кнопка со слотами */}
              <Button
                variant="soft"
                size="2"
                onClick={() => setSlotsOpen(true)}
                className={styles.slotsButton}
                style={{
                  backgroundColor: 'var(--accent-3)',
                  color: 'var(--accent-11)',
                  flexShrink: 0,
                  height: '42px',
                  boxSizing: 'border-box'
                }}
              >
                <ClockIcon width={16} height={16} />
                <Text size="2" className={styles.slotsButtonText}>слоты</Text>
              </Button>
            </Flex>

            {/* Блок настроек интервью (показывается только при выборе "Интервью") */}
            {selectedWorkflow === 'interview' && (
              <Box mt="3" p="3" style={{ backgroundColor: 'var(--accent-2)', borderRadius: '8px' }}>
                <Flex direction="column" gap="3">
                  <Text size="2" weight="bold">Формат интервью</Text>
                  <Flex gap="2">
                    <Button
                      variant={interviewFormat === 'online' ? 'solid' : 'soft'}
                      size="2"
                      onClick={() => setInterviewFormat('online')}
                    >
                      <VideoIcon width={16} height={16} />
                      <Text size="2">Онлайн</Text>
                    </Button>
                    <Button
                      variant={interviewFormat === 'office' ? 'solid' : 'soft'}
                      size="2"
                      onClick={() => setInterviewFormat('office')}
                    >
                      <PersonIcon width={16} height={16} />
                      <Text size="2">Офлайн</Text>
                    </Button>
                  </Flex>
                  
                  <Text size="2" weight="bold">Интервьюеры</Text>
                  <Flex direction="column" gap="2">
                    {interviewers.map((interviewer) => (
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
        )}

        {/* Контент табов */}
        {leftTab === 'candidates' && (
          <Box className={styles.candidatesList}>
            {mockCandidates.map((candidate) => (
              <Box
                key={candidate.id}
                className={`${styles.candidateItem} ${selectedCandidate.id === candidate.id ? styles.selected : ''}`}
                onClick={() => handleCandidateSelect(candidate)}
                style={{ position: 'relative' }}
              >
                {/* Точка в правом верхнем углу (только для непросмотренных изменений, не для сообщений) */}
                {((candidate as any).hasUnviewedChanges === true) && (
                  <Box
                    style={{
                      position: 'absolute',
                      top: '2px',
                      right: '2px',
                      width: '14px',
                      height: '14px',
                      borderRadius: '50%',
                      backgroundColor: candidate.statusColor,
                      border: '2px solid white',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                      zIndex: 10,
                      cursor: 'pointer'
                    }}
                    onClick={(e) => {
                      e.stopPropagation()
                      // Здесь можно добавить логику для пометки изменений как просмотренных
                      console.log('Mark changes as viewed:', candidate.id)
                    }}
                  />
                )}
                <Flex align="center" gap="3">
                  <Avatar
                    size="3"
                    fallback={getInitials(candidate.name)}
                    src={candidatePhotos[candidate.id]?.[0]}
                    style={{ backgroundColor: candidate.statusColor }}
                  />
                  <Flex direction="column" style={{ flex: 1, minWidth: 0, position: 'relative' }}>
                    <Flex align="center" gap="2" justify="between" style={{ width: '100%' }}>
                      <Text size="3" weight="bold" style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{candidate.name}</Text>
                      {/* Бейдж с иконкой/многоточием и количеством сообщений - справа в конце ряда */}
                      {candidate.unread > 0 && (() => {
                        const unreadInfo = getUnreadInfo(candidate)
                        if (!unreadInfo) return null
                        return (
                          <Badge size="1" color="red" style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                            {unreadInfo.icon}
                            {unreadInfo.count}
                          </Badge>
                        )
                      })()}
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
                        onClick={() => handleSettingTabClick('text')}
                        style={{ justifyContent: 'flex-start', width: '100%' }}
                      >
                        <Text size="2">Текст вакансии</Text>
                      </Button>
                      <Button
                        variant={selectedSettingTab === 'recruiters' ? 'solid' : 'soft'}
                        onClick={() => handleSettingTabClick('recruiters')}
                        style={{ justifyContent: 'flex-start', width: '100%' }}
                      >
                        <Text size="2">Рекрутеры</Text>
                      </Button>
                      <Button
                        variant={selectedSettingTab === 'customers' ? 'solid' : 'soft'}
                        onClick={() => handleSettingTabClick('customers')}
                        style={{ justifyContent: 'flex-start', width: '100%' }}
                      >
                        <Text size="2">Заказчики и интервьюеры</Text>
                      </Button>
                      <Button
                        variant={selectedSettingTab === 'questions' ? 'solid' : 'soft'}
                        onClick={() => handleSettingTabClick('questions')}
                        style={{ justifyContent: 'flex-start', width: '100%' }}
                      >
                        <Text size="2">Вопросы и ссылки</Text>
                      </Button>
                      <Button
                        variant={selectedSettingTab === 'integrations' ? 'solid' : 'soft'}
                        onClick={() => handleSettingTabClick('integrations')}
                        style={{ justifyContent: 'flex-start', width: '100%' }}
                      >
                        <Text size="2">Связи и интеграции</Text>
                      </Button>
                      <Button
                        variant={selectedSettingTab === 'statuses' ? 'solid' : 'soft'}
                        onClick={() => handleSettingTabClick('statuses')}
                        style={{ justifyContent: 'flex-start', width: '100%' }}
                      >
                        <Text size="2">Статусы</Text>
                      </Button>
                      <Button
                        variant={selectedSettingTab === 'salary' ? 'solid' : 'soft'}
                        onClick={() => handleSettingTabClick('salary')}
                        style={{ justifyContent: 'flex-start', width: '100%' }}
                      >
                        <Text size="2">Зарплатные вилки</Text>
                      </Button>
                      <Button
                        variant={selectedSettingTab === 'interviews' ? 'solid' : 'soft'}
                        onClick={() => handleSettingTabClick('interviews')}
                        style={{ justifyContent: 'flex-start', width: '100%' }}
                      >
                        <Text size="2">Встречи и интервью</Text>
                      </Button>
                      <Button
                        variant={selectedSettingTab === 'scorecard' ? 'solid' : 'soft'}
                        onClick={() => handleSettingTabClick('scorecard')}
                        style={{ justifyContent: 'flex-start', width: '100%' }}
                      >
                        <Text size="2">Scorecard</Text>
                      </Button>
                      <Button
                        variant={selectedSettingTab === 'dataProcessing' ? 'solid' : 'soft'}
                        onClick={() => handleSettingTabClick('dataProcessing')}
                        style={{ justifyContent: 'flex-start', width: '100%' }}
                      >
                        <Text size="2">Обработка данных</Text>
                      </Button>
                      <Button
                        variant={selectedSettingTab === 'history' ? 'solid' : 'soft'}
                        onClick={() => handleSettingTabClick('history')}
                        style={{ justifyContent: 'flex-start', width: '100%' }}
                      >
                        <Text size="2">История правок</Text>
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
      <Box 
        ref={rightColumnRef}
        className={`${styles.rightColumn} ${isRightColumnOpen ? styles.open : ''}`}
        onClick={(e) => {
          // Открываем модальное окно при клике на любую часть rightColumn, если есть подозрение на дубликат
          // И не открыты настройки вакансии
          if ((selectedCandidate as any).hasDuplicateSuspicion && leftTab !== 'vacancy-settings') {
            // Проверяем, что клик не был на интерактивных элементах
            const target = e.target as HTMLElement
            const isInteractive = target.closest('button') || target.closest('a') || target.closest('input') || target.closest('select') || target.closest('[role="button"]')
            if (!isInteractive) {
              setDuplicateModalOpen(true)
            }
          }
        }}
        style={{
          cursor: (selectedCandidate as any).hasDuplicateSuspicion && leftTab !== 'vacancy-settings' ? 'pointer' : 'default'
        }}
      >
        {/* Кнопки workflow - показываются только на вкладке Chat и только на десктопе */}
        {leftTab === 'chat' && !isMobile && (
          <Box className={styles.workflowButtonsContainer} mb="3">
            <Flex align="center" gap="3" wrap="nowrap" style={{ width: '100%' }}>
              {/* Скроллируемый контейнер для быстрых кнопок */}
              <Box 
                className={styles.workflowScrollContainer}
                style={{ 
                  flex: '1 1 auto',
                  minWidth: 0,
                  overflowX: 'auto',
                  overflowY: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <Flex gap="2" align="center" style={{ flexShrink: 0, minWidth: 'max-content' }}>
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
              </Box>

              {/* Тогглеры и кнопка справа - всегда видимы */}
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
                  className={styles.slotsButton}
                  style={{
                    backgroundColor: 'var(--accent-3)',
                    color: 'var(--accent-11)',
                    flexShrink: 0,
                    height: '42px',
                    boxSizing: 'border-box'
                  }}
                >
                  <ClockIcon width={16} height={16} />
                  <Text size="2" className={styles.slotsButtonText}>слоты</Text>
                </Button>
              </Flex>
            </Flex>

            {/* Блок настроек интервью (показывается только при выборе "Интервью") */}
            {selectedWorkflow === 'interview' && (
              <Box className={styles.interviewOptionsPanel} mt="2">
                <Box 
                  className={styles.participantsScrollContainer}
                  style={{ 
                    width: '100%',
                    overflowX: 'auto',
                    overflowY: 'hidden',
                    WebkitOverflowScrolling: 'touch',
                    scrollbarWidth: 'thin',
                  }}
                >
                  <Flex gap="4" align="center" wrap="nowrap" style={{ minWidth: 'max-content' }}>
                    {/* Тогглер формата интервью */}
                    <Flex gap="2" align="center" style={{ flexShrink: 0 }}>
                      <Box
                        className={styles.formatButton}
                        data-selected={interviewFormat === 'online'}
                        onClick={() => setInterviewFormat('online')}
                      >
                        <VideoIcon width={14} height={14} />
                        <Text size="2" weight="medium">Онлайн</Text>
                      </Box>
                      <Box
                        className={styles.formatButton}
                        data-selected={interviewFormat === 'office'}
                        onClick={() => setInterviewFormat('office')}
                      >
                        <BoxIcon width={14} height={14} />
                        <Text size="2" weight="medium">Офис</Text>
                      </Box>
                    </Flex>

                    {/* Вертикальная линия-разделитель */}
                    <Separator orientation="vertical" style={{ height: '20px', flexShrink: 0 }} />

                    {/* Список участников */}
                    <Flex gap="3" align="center" wrap="nowrap" style={{ minWidth: 'max-content', flexShrink: 0 }}>
                      {allParticipants.map(participant => {
                        const isSelected = selectedInterviewers.includes(participant.id)
                        return (
                          <Box
                            key={participant.id}
                            onClick={() => handleInterviewerToggle(participant.id)}
                            style={{
                              position: 'relative',
                              padding: '2px 12px',
                              borderRadius: '6px',
                              border: isSelected ? '2px solid var(--accent-9)' : '2px solid transparent',
                              backgroundColor: isSelected ? 'var(--accent-3)' : 'transparent',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              whiteSpace: 'nowrap',
                              flexShrink: 0,
                            }}
                            onMouseEnter={(e) => {
                              if (!isSelected) {
                                e.currentTarget.style.backgroundColor = 'var(--gray-3)'
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!isSelected) {
                                e.currentTarget.style.backgroundColor = 'transparent'
                              }
                            }}
                          >
                            <Text size="2">{participant.name}</Text>
                            {isSelected && (
                              <Box
                                style={{
                                  position: 'absolute',
                                  top: '-6px',
                                  right: '-6px',
                                  width: '18px',
                                  height: '18px',
                                  borderRadius: '50%',
                                  backgroundColor: 'var(--accent-9)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  border: '2px solid white',
                                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                                }}
                              >
                                <CheckIcon width={10} height={10} style={{ color: 'white' }} />
                              </Box>
                            )}
                          </Box>
                        )
                      })}
                    </Flex>
                  </Flex>
                </Box>
              </Box>
            )}
          </Box>
        )}
        
        {/* Кнопка "Подозрение на дубликат" - показывается только если есть подозрение и не открыты настройки вакансии */}
        {(selectedCandidate as any).hasDuplicateSuspicion && leftTab !== 'vacancy-settings' && (
          <Button
            variant="solid"
            color="orange"
            onClick={(e) => {
              e.stopPropagation()
              setDuplicateModalOpen(true)
            }}
            style={{ 
              width: '100%',
              height: '56px',
              marginBottom: '16px',
              position: 'sticky',
              top: '16px',
              zIndex: 100,
              boxShadow: '0 4px 12px rgba(251, 146, 60, 0.4), 0 2px 4px rgba(0, 0, 0, 0.2)',
              backgroundColor: '#fb923c',
              color: 'white',
              fontSize: '16px',
              fontWeight: 'bold',
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
              border: '2px solid #ea580c',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.02)'
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(251, 146, 60, 0.5), 0 2px 4px rgba(0, 0, 0, 0.2)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)'
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(251, 146, 60, 0.4), 0 2px 4px rgba(0, 0, 0, 0.2)'
            }}
          >
            <Text size="4" weight="bold" style={{ fontSize: '16px' }}>⚠️ Подозрение на дубликат</Text>
          </Button>
        )}
        
        <Card 
          className={styles.candidateCard}
          onDragOver={handleDocumentDragOver}
          onDragLeave={handleDocumentDragLeave}
          onDrop={handleDocumentDrop}
          onClick={(e) => {
            // Предотвращаем всплытие клика, если клик на интерактивных элементах
            // И не открыты настройки вакансии
            if (leftTab === 'vacancy-settings') return
            const target = e.target as HTMLElement
            const isInteractive = target.closest('button') || target.closest('a') || target.closest('input') || target.closest('select') || target.closest('[role="button"]') || target.closest('[role="tab"]')
            if (!isInteractive && (selectedCandidate as any).hasDuplicateSuspicion) {
              e.stopPropagation()
              setDuplicateModalOpen(true)
            }
          }}
          style={{
            border: isDraggingDocument ? '2px dashed var(--accent-9)' : undefined,
            transition: 'all 0.3s ease',
            opacity: (selectedCandidate as any).hasDuplicateSuspicion && leftTab !== 'vacancy-settings' ? 0.5 : 1,
            filter: (selectedCandidate as any).hasDuplicateSuspicion && leftTab !== 'vacancy-settings' ? 'blur(3px)' : 'none',
            pointerEvents: (selectedCandidate as any).hasDuplicateSuspicion && leftTab !== 'vacancy-settings' ? 'auto' : 'auto',
            cursor: (selectedCandidate as any).hasDuplicateSuspicion && leftTab !== 'vacancy-settings' ? 'pointer' : 'default'
          }}
        >
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
          
          {/* Содержимое для настроек вакансии */}
          {leftTab === 'vacancy-settings' ? (
            <Flex direction="column" gap="4">
              <Text size="5" weight="bold">Настройки вакансии</Text>
              <Separator size="4" />
              
              {selectedSettingTab === 'text' && (
                <Box>
                  <Flex align="center" justify="between" mb="4">
                    <Text size="3" weight="bold">Текст вакансии</Text>
                    <Flex align="center" gap="2">
                      {isPublished && publicationUrl && (
                        <Button
                          variant="soft"
                          size="2"
                          onClick={() => window.open(publicationUrl, '_blank')}
                        >
                          <GlobeIcon width={16} height={16} />
                          Открыть на сайте
                        </Button>
                      )}
                      <Button
                        variant={isPublished ? 'solid' : 'soft'}
                        color={isPublished ? 'green' : 'gray'}
                        size="2"
                        onClick={(e) => {
                          const button = e.currentTarget
                          // Сбрасываем все инлайн-стили перед изменением состояния
                          button.style.backgroundColor = ''
                          button.style.color = ''
                          button.style.borderColor = ''
                          const textSpan = button.querySelector('.button-text') as HTMLElement
                          if (textSpan) {
                            textSpan.textContent = isPublished ? 'Опубликовано' : 'Опубликовать на сайте'
                          }
                          
                          if (!isPublished) {
                            // Генерируем URL для публикации
                            const url = `https://company.com/vacancies/${vacancyTitle.toLowerCase().replace(/\s+/g, '-')}`
                            setPublicationUrl(url)
                            setIsPublished(true)
                            // Добавляем запись в историю
                            setEditHistory(prev => [{
                              id: Date.now().toString(),
                              date: new Date().toLocaleString('ru-RU'),
                              user: 'Текущий пользователь',
                              changes: 'Вакансия опубликована на сайте',
                              version: prev[0]?.version ? prev[0].version + 1 : 1
                            }, ...prev])
                            alert(`Вакансия опубликована на сайте!\nURL: ${url}`)
                          } else {
                            setIsPublished(false)
                            setPublicationUrl(null)
                            // Добавляем запись в историю
                            setEditHistory(prev => [{
                              id: Date.now().toString(),
                              date: new Date().toLocaleString('ru-RU'),
                              user: 'Текущий пользователь',
                              changes: 'Публикация вакансии снята с сайта',
                              version: prev[0]?.version ? prev[0].version + 1 : 1
                            }, ...prev])
                            alert('Вакансия снята с публикации')
                          }
                        }}
                        onMouseEnter={(e) => {
                          if (isPublished) {
                            const button = e.currentTarget
                            // Определяем цвет в зависимости от темы (красный для светлой, фиолетовый для темной/красной темы)
                            const theme = document.documentElement.getAttribute('data-theme')
                            const accentColor = localStorage.getItem(theme === 'dark' ? 'darkThemeAccentColor' : 'lightThemeAccentColor') || 'crimson'
                            // Если акцентный цвет красный (red, tomato, ruby, crimson), используем фиолетовый для hover
                            const isRedTheme = ['red', 'tomato', 'ruby', 'crimson'].includes(accentColor)
                            const hoverColor = isRedTheme ? 'var(--purple-9)' : 'var(--red-9)'
                            button.style.backgroundColor = hoverColor
                            button.style.color = 'white'
                            button.style.borderColor = hoverColor
                            const textSpan = button.querySelector('.button-text') as HTMLElement
                            if (textSpan) {
                              textSpan.textContent = 'Снять публикацию'
                            }
                          }
                        }}
                        onMouseLeave={(e) => {
                          const button = e.currentTarget
                          // Всегда сбрасываем стили при уходе мыши
                          if (isPublished) {
                            // Возвращаем зеленый цвет для опубликованной кнопки
                            button.style.backgroundColor = ''
                            button.style.color = ''
                            button.style.borderColor = ''
                            const textSpan = button.querySelector('.button-text') as HTMLElement
                            if (textSpan) {
                              textSpan.textContent = 'Опубликовано'
                            }
                          } else {
                            // Убеждаемся, что для неопубликованной кнопки стили сброшены
                            button.style.backgroundColor = ''
                            button.style.color = ''
                            button.style.borderColor = ''
                          }
                        }}
                        style={{
                          transition: 'background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease'
                        }}
                      >
                        {isPublished ? (
                          <>
                            <CheckCircledIcon width={16} height={16} />
                            <span className="button-text">Опубликовано</span>
                          </>
                        ) : (
                          <>
                            <GlobeIcon width={16} height={16} />
                            Опубликовать на сайте
                          </>
                        )}
                      </Button>
                    </Flex>
                  </Flex>
                  
                  <Flex direction="column" gap="4">
                    {/* Название вакансии */}
                    <Box>
                      <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>Название</Text>
                      <TextField.Root
                        value={vacancyTitle}
                        onChange={(e) => setVacancyTitle(e.target.value)}
                        placeholder="Введите название вакансии"
                      />
                    </Box>
                    
                    {/* Отдел */}
                    <Box>
                      <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>Отдел</Text>
                      <Select.Root
                        value={vacancyDepartment}
                        onValueChange={setVacancyDepartment}
                      >
                        <Select.Trigger placeholder="Выберите отдел" />
                        <Select.Content>
                          {getAllDepartmentsFlat(mockDepartments).map((dept) => (
                            <Select.Item key={dept.id} value={dept.id}>
                              {'  '.repeat(dept.level)}{dept.name}
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select.Root>
                    </Box>
                    
                    {/* Шапка */}
                    <Box>
                      <Flex align="center" justify="between" mb="2">
                        <Text size="2" weight="medium">Шапка</Text>
                        <Flex align="center" gap="3">
                          <Flex align="center" gap="2">
                            <Text size="1" color="gray">Активность:</Text>
                            <Switch
                              checked={fieldSettings.header.active}
                              onCheckedChange={(checked) => setFieldSettings(prev => ({ ...prev, header: { ...prev.header, active: checked } }))}
                            />
                          </Flex>
                          <Flex align="center" gap="2">
                            <Text size="1" color="gray">Видимость:</Text>
                            <Switch
                              checked={fieldSettings.header.visible}
                              onCheckedChange={(checked) => setFieldSettings(prev => ({ ...prev, header: { ...prev.header, visible: checked } }))}
                            />
                          </Flex>
                        </Flex>
                      </Flex>
                      <TextArea
                        value={vacancyHeader}
                        onChange={(e) => setVacancyHeader(e.target.value)}
                        placeholder="Введите текст шапки"
                        disabled={!fieldSettings.header.active}
                        style={{ minHeight: '100px' }}
                      />
                    </Box>
                    
                    {/* Обязанности */}
                    <Box>
                      <Flex align="center" justify="between" mb="2">
                        <Text size="2" weight="medium">Обязанности</Text>
                        <Flex align="center" gap="3">
                          <Flex align="center" gap="2">
                            <Text size="1" color="gray">Активность:</Text>
                            <Switch
                              checked={fieldSettings.responsibilities.active}
                              onCheckedChange={(checked) => setFieldSettings(prev => ({ ...prev, responsibilities: { ...prev.responsibilities, active: checked } }))}
                            />
                          </Flex>
                          <Flex align="center" gap="2">
                            <Text size="1" color="gray">Видимость:</Text>
                            <Switch
                              checked={fieldSettings.responsibilities.visible}
                              onCheckedChange={(checked) => setFieldSettings(prev => ({ ...prev, responsibilities: { ...prev.responsibilities, visible: checked } }))}
                            />
                          </Flex>
                        </Flex>
                      </Flex>
                      <TextArea
                        value={vacancyResponsibilities}
                        onChange={(e) => setVacancyResponsibilities(e.target.value)}
                        placeholder="Введите обязанности"
                        disabled={!fieldSettings.responsibilities.active}
                        style={{ minHeight: '100px' }}
                      />
                    </Box>
                    
                    {/* Пожелания */}
                    <Box>
                      <Flex align="center" justify="between" mb="2">
                        <Text size="2" weight="medium">Пожелания</Text>
                        <Flex align="center" gap="3">
                          <Flex align="center" gap="2">
                            <Text size="1" color="gray">Активность:</Text>
                            <Switch
                              checked={fieldSettings.requirements.active}
                              onCheckedChange={(checked) => setFieldSettings(prev => ({ ...prev, requirements: { ...prev.requirements, active: checked } }))}
                            />
                          </Flex>
                          <Flex align="center" gap="2">
                            <Text size="1" color="gray">Видимость:</Text>
                            <Switch
                              checked={fieldSettings.requirements.visible}
                              onCheckedChange={(checked) => setFieldSettings(prev => ({ ...prev, requirements: { ...prev.requirements, visible: checked } }))}
                            />
                          </Flex>
                        </Flex>
                      </Flex>
                      <TextArea
                        value={vacancyRequirements}
                        onChange={(e) => setVacancyRequirements(e.target.value)}
                        placeholder="Введите пожелания"
                        disabled={!fieldSettings.requirements.active}
                        style={{ minHeight: '100px' }}
                      />
                    </Box>
                    
                    {/* Будет плюсом */}
                    <Box>
                      <Flex align="center" justify="between" mb="2">
                        <Text size="2" weight="medium">Будет плюсом</Text>
                        <Flex align="center" gap="3">
                          <Flex align="center" gap="2">
                            <Text size="1" color="gray">Активность:</Text>
                            <Switch
                              checked={fieldSettings.niceToHave.active}
                              onCheckedChange={(checked) => setFieldSettings(prev => ({ ...prev, niceToHave: { ...prev.niceToHave, active: checked } }))}
                            />
                          </Flex>
                          <Flex align="center" gap="2">
                            <Text size="1" color="gray">Видимость:</Text>
                            <Switch
                              checked={fieldSettings.niceToHave.visible}
                              onCheckedChange={(checked) => setFieldSettings(prev => ({ ...prev, niceToHave: { ...prev.niceToHave, visible: checked } }))}
                            />
                          </Flex>
                        </Flex>
                      </Flex>
                      <TextArea
                        value={vacancyNiceToHave}
                        onChange={(e) => setVacancyNiceToHave(e.target.value)}
                        placeholder="Введите что будет плюсом"
                        disabled={!fieldSettings.niceToHave.active}
                        style={{ minHeight: '100px' }}
                      />
                    </Box>
                    
                    {/* Условия работы */}
                    <Box>
                      <Flex align="center" justify="between" mb="2">
                        <Text size="2" weight="medium">Условия работы</Text>
                        <Flex align="center" gap="3">
                          <Flex align="center" gap="2">
                            <Text size="1" color="gray">Активность:</Text>
                            <Switch
                              checked={fieldSettings.conditions.active}
                              onCheckedChange={(checked) => setFieldSettings(prev => ({ ...prev, conditions: { ...prev.conditions, active: checked } }))}
                            />
                          </Flex>
                          <Flex align="center" gap="2">
                            <Text size="1" color="gray">Видимость:</Text>
                            <Switch
                              checked={fieldSettings.conditions.visible}
                              onCheckedChange={(checked) => setFieldSettings(prev => ({ ...prev, conditions: { ...prev.conditions, visible: checked } }))}
                            />
                          </Flex>
                        </Flex>
                      </Flex>
                      <TextArea
                        value={vacancyConditions}
                        onChange={(e) => setVacancyConditions(e.target.value)}
                        placeholder="Введите условия работы"
                        disabled={!fieldSettings.conditions.active}
                        style={{ minHeight: '100px' }}
                      />
                    </Box>
                    
                    {/* Завершение */}
                    <Box>
                      <Flex align="center" justify="between" mb="2">
                        <Text size="2" weight="medium">Завершение</Text>
                        <Flex align="center" gap="3">
                          <Flex align="center" gap="2">
                            <Text size="1" color="gray">Активность:</Text>
                            <Switch
                              checked={fieldSettings.closing.active}
                              onCheckedChange={(checked) => setFieldSettings(prev => ({ ...prev, closing: { ...prev.closing, active: checked } }))}
                            />
                          </Flex>
                          <Flex align="center" gap="2">
                            <Text size="1" color="gray">Видимость:</Text>
                            <Switch
                              checked={fieldSettings.closing.visible}
                              onCheckedChange={(checked) => setFieldSettings(prev => ({ ...prev, closing: { ...prev.closing, visible: checked } }))}
                            />
                          </Flex>
                        </Flex>
                      </Flex>
                      <TextArea
                        value={vacancyClosing}
                        onChange={(e) => setVacancyClosing(e.target.value)}
                        placeholder="Введите завершающий текст"
                        disabled={!fieldSettings.closing.active}
                        style={{ minHeight: '100px' }}
                      />
                    </Box>
                    
                    {/* Дополнительная ссылка */}
                    <Box>
                      <Flex align="center" justify="between" mb="2">
                        <Text size="2" weight="medium">Дополнительная ссылка</Text>
                        <Flex align="center" gap="3">
                          <Flex align="center" gap="2">
                            <Text size="1" color="gray">Активность:</Text>
                            <Switch
                              checked={fieldSettings.link.active}
                              onCheckedChange={(checked) => setFieldSettings(prev => ({ ...prev, link: { ...prev.link, active: checked } }))}
                            />
                          </Flex>
                          <Flex align="center" gap="2">
                            <Text size="1" color="gray">Видимость:</Text>
                            <Switch
                              checked={fieldSettings.link.visible}
                              onCheckedChange={(checked) => setFieldSettings(prev => ({ ...prev, link: { ...prev.link, visible: checked } }))}
                            />
                          </Flex>
                        </Flex>
                      </Flex>
                      <TextField.Root
                        value={vacancyLink}
                        onChange={(e) => setVacancyLink(e.target.value)}
                        placeholder="https://example.com/vacancy"
                        disabled={!fieldSettings.link.active}
                      />
                    </Box>
                    
                    {/* Вложения */}
                    <Box>
                      <Flex align="center" justify="between" mb="2">
                        <Text size="2" weight="medium">Вложения</Text>
                        <Flex align="center" gap="3">
                          <Flex align="center" gap="2">
                            <Text size="1" color="gray">Активность:</Text>
                            <Switch
                              checked={fieldSettings.attachment.active}
                              onCheckedChange={(checked) => setFieldSettings(prev => ({ ...prev, attachment: { ...prev.attachment, active: checked } }))}
                            />
                          </Flex>
                          <Flex align="center" gap="2">
                            <Text size="1" color="gray">Видимость:</Text>
                            <Switch
                              checked={fieldSettings.attachment.visible}
                              onCheckedChange={(checked) => setFieldSettings(prev => ({ ...prev, attachment: { ...prev.attachment, visible: checked } }))}
                            />
                          </Flex>
                        </Flex>
                      </Flex>
                      <Flex direction="column" gap="2">
                        <Box
                          style={{
                            position: 'relative',
                            display: 'inline-block',
                            width: '100%'
                          }}
                        >
                          <input
                            type="file"
                            accept=".docx,.pptx,.figma"
                            onChange={(e) => setVacancyAttachment(e.target.files?.[0] || null)}
                            disabled={!fieldSettings.attachment.active}
                            id="vacancy-attachment-input"
                            style={{
                              position: 'absolute',
                              opacity: 0,
                              width: 0,
                              height: 0,
                              overflow: 'hidden'
                            }}
                          />
                          <Button
                            asChild
                            variant="soft"
                            disabled={!fieldSettings.attachment.active}
                            style={{ width: '100%', justifyContent: 'flex-start' }}
                          >
                            <label
                              htmlFor="vacancy-attachment-input"
                              style={{
                                cursor: fieldSettings.attachment.active ? 'pointer' : 'not-allowed',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                width: '100%',
                                padding: '0'
                              }}
                            >
                              <Box style={{ marginLeft: '8px', display: 'flex', alignItems: 'center' }}>
                                <UploadIcon width={16} height={16} />
                              </Box>
                              <Text size="2">
                                {vacancyAttachment ? vacancyAttachment.name : 'Выберите файл (docx, pptx, figma)'}
                              </Text>
                            </label>
                          </Button>
                        </Box>
                        {vacancyAttachment && (
                          <Flex align="center" gap="2" style={{ padding: '8px 12px', backgroundColor: 'var(--gray-2)', borderRadius: '6px' }}>
                            <FileTextIcon width={16} height={16} style={{ color: 'var(--gray-9)' }} />
                            <Text size="2" style={{ flex: 1 }}>
                              {vacancyAttachment.name}
                            </Text>
                            <Text size="1" color="gray">
                              {(vacancyAttachment.size / 1024).toFixed(2)} KB
                            </Text>
                            <Button
                              size="1"
                              variant="ghost"
                              color="red"
                              onClick={() => setVacancyAttachment(null)}
                            >
                              <Cross2Icon width={14} height={14} />
                            </Button>
                          </Flex>
                        )}
                      </Flex>
                    </Box>
                  </Flex>
                </Box>
              )}
              
              {selectedSettingTab === 'recruiters' && (
                <Box>
                  <Text size="3" weight="bold" mb="4" style={{ display: 'block' }}>Рекрутеры</Text>
                  
                  <Flex direction="column" gap="3">
                    {allRecruiters.map((recruiter) => {
                      const isSelected = selectedRecruiters.has(recruiter.id)
                      const isMain = mainRecruiter === recruiter.id
                      
                      return (
                        <Card key={recruiter.id} style={{ padding: '16px' }}>
                          <Flex align="center" gap="3">
                            {/* Чекбокс для выбора рекрутера */}
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => handleRecruiterToggle(recruiter.id)}
                            />
                            
                            {/* Информация о рекрутере */}
                            <Flex direction="column" gap="1" style={{ flex: 1 }}>
                              <Flex align="center" gap="2">
                                <Text size="3" weight="medium">{recruiter.name}</Text>
                                {isMain && (
                                  <Badge color="blue" variant="soft" size="1">
                                    Главный
                                  </Badge>
                                )}
                              </Flex>
                              <Text size="2" color="gray">{recruiter.position}</Text>
                              <Text size="1" color="gray">{recruiter.email}</Text>
                              <Text size="1" color="gray">{recruiter.phone}</Text>
                            </Flex>
                            
                            {/* Тогглер для главного рекрутера */}
                            <Box>
                              <Text size="1" color="gray" mb="1" style={{ display: 'block', textAlign: 'right' }}>
                                Главный
                              </Text>
                              <Switch
                                checked={isMain}
                                disabled={!isSelected}
                                onCheckedChange={() => handleMainRecruiterToggle(recruiter.id)}
                              />
                            </Box>
                          </Flex>
                        </Card>
                      )
                    })}
                  </Flex>
                  
                  {allRecruiters.length === 0 && (
                    <Text size="2" color="gray" style={{ textAlign: 'center', padding: '40px' }}>
                      Нет доступных рекрутеров
                    </Text>
                  )}
                </Box>
              )}
              
              {selectedSettingTab === 'customers' && (
                <Box>
                  <Text size="3" weight="bold" mb="4" style={{ display: 'block' }}>Заказчики и интервьюеры</Text>
                  
                  <Flex align="center" gap="2" mb="4">
                    <Switch
                      checked={customersOnlyFromDepartment}
                      onCheckedChange={setCustomersOnlyFromDepartment}
                    />
                    <Text size="2">Только из отдела</Text>
                    <Text size="1" color="gray">(выкл. — все)</Text>
                  </Flex>
                  
                  {(() => {
                    const vacancyDeptName = getAllDepartmentsFlat(mockDepartments).find(d => d.id === vacancyDepartment)?.name ?? ''
                    const isHR = (d: string) => d === 'HR' || d === 'HR Департамент'
                    const filteredInterviewers = customersOnlyFromDepartment
                      ? allInterviewers.filter(i => i.department === vacancyDeptName || isHR(i.department))
                      : allInterviewers
                    return (
                  <>
                  <Flex direction="column" gap="3">
                    {filteredInterviewers.map((interviewer) => {
                      const isSelected = selectedVacancyInterviewers.has(interviewer.id)
                      const isFinalInterview = finalInterviewInterviewers.has(interviewer.id)
                      
                      return (
                        <Card key={interviewer.id} style={{ padding: '16px' }}>
                          <Flex align="center" gap="3">
                            {/* Чекбокс для выбора интервьюера */}
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => handleVacancyInterviewerToggle(interviewer.id)}
                            />
                            
                            {/* Информация об интервьюере */}
                            <Flex direction="column" gap="1" style={{ flex: 1 }}>
                              <Flex align="center" gap="2">
                                <Text size="3" weight="medium">{interviewer.name}</Text>
                                {interviewer.isCustomer && (
                                  <Badge color="blue" variant="soft" size="1">
                                    Заказчик
                                  </Badge>
                                )}
                                {isFinalInterview && (
                                  <Badge color="purple" variant="soft" size="1">
                                    Финальное интервью
                                  </Badge>
                                )}
                              </Flex>
                              <Text size="2" color="gray">{interviewer.position}</Text>
                              <Text size="1" color="gray">{interviewer.department}</Text>
                              <Text size="1" color="gray">{interviewer.email}</Text>
                              <Text size="1" color="gray">{interviewer.phone}</Text>
                            </Flex>
                            
                            {/* Тогглер для финального интервью */}
                            <Box>
                              <Text size="1" color="gray" mb="1" style={{ display: 'block', textAlign: 'right' }}>
                                Финальное интервью
                              </Text>
                              <Switch
                                checked={isFinalInterview}
                                disabled={!isSelected}
                                onCheckedChange={() => handleFinalInterviewToggle(interviewer.id)}
                              />
                            </Box>
                          </Flex>
                        </Card>
                      )
                    })}
                  </Flex>
                  
                  {filteredInterviewers.length === 0 && (
                    <Text size="2" color="gray" style={{ textAlign: 'center', padding: '40px' }}>
                      Нет доступных интервьюеров
                    </Text>
                  )}
                  </>
                    )
                  })()}
                </Box>
              )}
              
              {selectedSettingTab === 'questions' && (
                <Box>
                  <Text size="3" weight="bold" mb="3" style={{ display: 'block' }}>Вопросы и ссылки</Text>
                  <Text size="2" color="gray" mb="4" style={{ display: 'block' }}>
                    Ссылка на вакансию, тогглер использования на сайте и один вопрос по вакансии на офис. Настройки задаются отдельно для каждого офиса. У ссылки и вопроса можно выбрать цвет.
                  </Text>
                  
                  <Flex direction="column" gap="4">
                    {questionLinkOffices.map((office) => {
                      const state = questionsLinksByOffice[office.id] ?? getDefaultOfficeState()
                      const { link, question } = state
                      const q = question ?? { text: '', color: questionLinkColors[0].hex }
                      
                      return (
                        <Card key={office.id} style={{ padding: '16px' }}>
                          <Flex direction="column" gap="4">
                            <Text size="4" weight="bold">{office.name}</Text>
                            
                            {/* Ссылка на вакансию */}
                            <Box>
                              <Text size="3" weight="medium" mb="2" style={{ display: 'block' }}>Ссылка на вакансию</Text>
                              <Flex direction="column" gap="3">
                                <Flex align="center" gap="3" wrap="wrap">
                                  <TextField.Root
                                    value={link.url}
                                    onChange={(e) => updateOfficeLink(office.id, { url: e.target.value })}
                                    placeholder="https://example.com/vacancy"
                                    style={{ flex: 1, minWidth: '200px' }}
                                  />
                                  <Flex align="center" gap="2" style={{ flexShrink: 0 }}>
                                    <Text size="2" color="gray">Использовать с сайта:</Text>
                                    <Switch
                                      checked={link.useOnSite}
                                      onCheckedChange={(checked) => updateOfficeLink(office.id, { useOnSite: checked })}
                                    />
                                  </Flex>
                                </Flex>
                                <Flex align="center" gap="2">
                                  <Text size="2" weight="medium">Цвет ссылки:</Text>
                                  <Flex gap="2" wrap="wrap">
                                    {questionLinkColors.map((c) => (
                                      <button
                                        key={c.id}
                                        type="button"
                                        onClick={() => updateOfficeLink(office.id, { color: c.hex })}
                                        title={c.label}
                                        style={{
                                          width: 28,
                                          height: 28,
                                          borderRadius: 6,
                                          backgroundColor: c.hex,
                                          border: link.color === c.hex ? '2px solid var(--gray-12)' : '2px solid transparent',
                                          cursor: 'pointer',
                                          padding: 0,
                                        }}
                                        aria-pressed={link.color === c.hex}
                                      />
                                    ))}
                                  </Flex>
                                </Flex>
                              </Flex>
                            </Box>
                            
                            <Separator size="4" />
                            
                            {/* Вопрос по вакансии (один на офис) */}
                            <Box>
                              <Text size="3" weight="medium" mb="2" style={{ display: 'block' }}>Вопрос по вакансии</Text>
                              <Flex direction="column" gap="2">
                                <TextArea
                                  value={q.text}
                                  onChange={(e) => updateOfficeQuestion(office.id, { text: e.target.value })}
                                  placeholder="Текст вопроса..."
                                  style={{ minWidth: '100%', minHeight: 60 }}
                                />
                                <Flex gap="2" align="center">
                                  <Text size="2" color="gray">Цвет:</Text>
                                  {questionLinkColors.map((c) => (
                                    <button
                                      key={c.id}
                                      type="button"
                                      onClick={() => updateOfficeQuestion(office.id, { color: c.hex })}
                                      title={c.label}
                                      style={{
                                        width: 22,
                                        height: 22,
                                        borderRadius: 4,
                                        backgroundColor: c.hex,
                                        border: q.color === c.hex ? '2px solid var(--gray-12)' : '2px solid transparent',
                                        cursor: 'pointer',
                                        padding: 0,
                                      }}
                                      aria-pressed={q.color === c.hex}
                                    />
                                  ))}
                                </Flex>
                              </Flex>
                            </Box>
                          </Flex>
                        </Card>
                      )
                    })}
                  </Flex>
                </Box>
              )}
              
              {selectedSettingTab === 'integrations' && (
                <Box>
                  <Text size="3" weight="bold" mb="3" style={{ display: 'block' }}>Связи и интеграции</Text>
                  <Text size="2" color="gray" mb="4" style={{ display: 'block' }}>
                    Настройка интеграций с внешними сервисами
                  </Text>
                  
                  <Flex direction="column" gap="4">
                    <Box>
                      <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>Интеграция</Text>
                      <Select.Root
                        value={integrationPartner || '__none__'}
                        onValueChange={(v) => {
                          if (v === '__none__' && integrationPartner === 'huntflow') {
                            toast.showToast({
                              type: 'warning',
                              title: 'Отключить интеграцию Huntflow?',
                              message: 'Подтвердите отключение связи с Huntflow.',
                              duration: 5 * 60 * 1000, // 5 минут
                              actions: [
                                {
                                  label: 'Подтвердить',
                                  onClick: () => {
                                    setIntegrationPartner('')
                                    setHuntflowVacancyId('')
                                  },
                                  variant: 'soft',
                                  color: 'gray',
                                },
                                {
                                  label: 'Отклонить',
                                  onClick: () => {},
                                  variant: 'solid',
                                  color: 'blue',
                                },
                              ],
                            })
                            return
                          }
                          setIntegrationPartner((v === '__none__' ? '' : v) as '' | 'huntflow')
                        }}
                      >
                        <Select.Trigger placeholder="Выберите интеграцию" style={{ width: '100%', maxWidth: 280 }} />
                        <Select.Content>
                          <Select.Item value="__none__">—</Select.Item>
                          <Select.Item value="huntflow">Huntflow</Select.Item>
                        </Select.Content>
                      </Select.Root>
                    </Box>
                    
                    {integrationPartner === 'huntflow' && (
                      <Box>
                        <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>ID вакансии в Huntflow</Text>
                        <TextField.Root
                          type="text"
                          inputMode="numeric"
                          value={huntflowVacancyId}
                          onChange={(e) => setHuntflowVacancyId(e.target.value.replace(/\D/g, ''))}
                          placeholder="Только цифры"
                          style={{ width: '100%', maxWidth: 200 }}
                        />
                      </Box>
                    )}
                  </Flex>
                </Box>
              )}
              
              {selectedSettingTab === 'statuses' && (
                <Box>
                  <Text size="3" weight="bold" mb="4" style={{ display: 'block' }}>Статусы</Text>
                  <Text size="2" color="gray" mb="4" style={{ display: 'block' }}>
                    Выберите этапы рекрутинга, которые будут доступны для данной вакансии
                  </Text>
                  
                  <Flex direction="column" gap="3">
                    {recruitmentStages.map((stage) => {
                      const isActive = activeStages.has(stage.id)
                      
                      return (
                        <Card key={stage.id} style={{ padding: '16px' }}>
                          <Flex align="center" gap="3">
                            {/* Чекбокс для выбора этапа */}
                            <Checkbox
                              checked={isActive}
                              onCheckedChange={() => handleStageToggle(stage.id)}
                            />
                            
                            {/* Информация об этапе */}
                            <Flex align="center" gap="3" style={{ flex: 1 }}>
                              <Box
                                style={{
                                  width: '12px',
                                  height: '12px',
                                  borderRadius: '50%',
                                  backgroundColor: stage.color,
                                  flexShrink: 0
                                }}
                              />
                              <Flex direction="column" gap="1" style={{ flex: 1 }}>
                                <Text size="3" weight="medium">{stage.name}</Text>
                                {stage.description && (
                                  <Text size="2" color="gray">{stage.description}</Text>
                                )}
                              </Flex>
                            </Flex>
                          </Flex>
                        </Card>
                      )
                    })}
                  </Flex>
                  
                  {recruitmentStages.length === 0 && (
                    <Text size="2" color="gray" style={{ textAlign: 'center', padding: '40px' }}>
                      Нет доступных этапов
                    </Text>
                  )}
                </Box>
              )}
              
              {selectedSettingTab === 'salary' && (
                <Box>
                  <Text size="3" weight="bold" mb="4" style={{ display: 'block' }}>Зарплатные вилки</Text>
                  <Text size="2" color="gray" mb="4" style={{ display: 'block' }}>
                    Выберите активные грейды и укажите зарплатные диапазоны. Редактирование доступно только для главной валюты ({companyCurrencies.find(c => c.isMain)?.code || 'BYN'}), остальные пересчитываются автоматически.
                  </Text>
                  
                  <Box className={styles.salaryForksTableWrapper} style={{ overflowX: 'auto', width: '100%' }}>
                    <Table.Root style={{ 
                      tableLayout: 'fixed',
                      width: 'max-content',
                      maxWidth: '100%',
                      borderCollapse: 'separate',
                      borderSpacing: 0
                    }}>
                      <Table.Header>
                        <Table.Row>
                          <Table.ColumnHeaderCell style={{ position: 'sticky', left: 0, backgroundColor: 'var(--gray-2)', zIndex: 10, width: '180px', minWidth: '180px', maxWidth: '180px' }}>
                            Грейд
                          </Table.ColumnHeaderCell>
                          {companyCurrencies.map(currency => (
                            <Table.ColumnHeaderCell 
                              key={currency.id}
                              style={{ 
                                width: currency.isMain ? '260px' : '180px',
                                minWidth: currency.isMain ? '260px' : '180px',
                                maxWidth: currency.isMain ? '260px' : '180px',
                                whiteSpace: 'nowrap',
                                padding: '12px'
                              }}
                            >
                              <Flex direction="column" gap="1" align="center">
                                <Text weight="bold">{currency.code}</Text>
                                {currency.isMain && (
                                  <Badge size="1" color="green">Главная</Badge>
                                )}
                                <Text size="1" color="gray">
                                  {isGrossFormat ? 'Gross' : 'Net'}
                                </Text>
                              </Flex>
                            </Table.ColumnHeaderCell>
                          ))}
                        </Table.Row>
                      </Table.Header>
                      <Table.Body>
                        {allGrades.map((grade) => {
                          const isActive = activeGrades.has(grade.id)
                          const mainCurrency = companyCurrencies.find(c => c.isMain)?.code || 'BYN'
                          
                          return (
                            <Table.Row key={grade.id}>
                              <Table.Cell style={{ position: 'sticky', left: 0, backgroundColor: 'var(--gray-2)', zIndex: 10, width: '180px', minWidth: '180px', maxWidth: '180px' }}>
                                <Flex align="center" gap="2">
                                  <Checkbox
                                    checked={isActive}
                                    onCheckedChange={() => handleGradeToggle(grade.id)}
                                  />
                                  <Text weight={isActive ? 'medium' : 'regular'} style={{ opacity: isActive ? 1 : 0.5 }}>
                                    {grade.name}
                                  </Text>
                                </Flex>
                              </Table.Cell>
                              {companyCurrencies.map(currency => {
                                const isMain = currency.isMain
                                const fromValue = getSalaryValue(grade.id, currency.code, 'from')
                                const toValue = salaryRanges[grade.id]?.[currency.code]?.to || null
                                
                                return (
                                  <Table.Cell
                                    key={currency.id}
                                    style={{ 
                                      whiteSpace: 'nowrap',
                                      width: isMain ? '260px' : '180px',
                                      minWidth: isMain ? '260px' : '180px',
                                      maxWidth: isMain ? '260px' : '180px',
                                      padding: '12px',
                                      verticalAlign: 'middle'
                                    }}
                                  >
                                    {isActive ? (
                                      isMain ? (
                                        <Flex gap="2" align="center" style={{ flexWrap: 'nowrap' }}>
                                          <input
                                              type="number"
                                              placeholder="От"
                                              value={fromValue !== null ? fromValue.toString() : ''}
                                              onChange={(e) => {
                                                handleSalaryChange(grade.id, currency.code, 'from', e.target.value)
                                                // Адаптируем ширину под содержимое
                                                const input = e.target as HTMLInputElement
                                                const value = e.target.value
                                                const charWidth = 8 // примерная ширина одного символа
                                                const padding = 24 // padding left + right
                                                const minWidth = 100
                                                const calculatedWidth = value ? Math.max(minWidth, value.length * charWidth + padding) : minWidth
                                                input.style.width = `${calculatedWidth}px`
                                              }}
                                              style={{
                                                minWidth: '100px',
                                                padding: '8px 12px',
                                                fontSize: '13px',
                                                lineHeight: '20px',
                                                borderRadius: '6px',
                                                border: '1px solid var(--gray-a6)',
                                                backgroundColor: 'var(--color-panel)',
                                                color: 'var(--gray-12)',
                                                outline: 'none',
                                                boxSizing: 'border-box',
                                                width: fromValue !== null 
                                                  ? `${Math.max(100, fromValue.toString().length * 8 + 24)}px` 
                                                  : '100px',
                                              }}
                                              onFocus={(e) => {
                                                e.currentTarget.style.borderColor = 'var(--accent-9)'
                                                e.currentTarget.style.boxShadow = '0 0 0 1px var(--accent-9)'
                                              }}
                                              onBlur={(e) => {
                                                e.currentTarget.style.borderColor = 'var(--gray-a6)'
                                                e.currentTarget.style.boxShadow = 'none'
                                              }}
                                            />
                                            <Text>—</Text>
                                            <input
                                              type="number"
                                              placeholder="До"
                                              value={toValue !== null ? toValue.toString() : ''}
                                              onChange={(e) => {
                                                handleSalaryChange(grade.id, currency.code, 'to', e.target.value)
                                                // Адаптируем ширину под содержимое
                                                const input = e.target as HTMLInputElement
                                                const value = e.target.value
                                                const charWidth = 8 // примерная ширина одного символа
                                                const padding = 24 // padding left + right
                                                const minWidth = 100
                                                const calculatedWidth = value ? Math.max(minWidth, value.length * charWidth + padding) : minWidth
                                                input.style.width = `${calculatedWidth}px`
                                              }}
                                              style={{
                                                minWidth: '100px',
                                                padding: '8px 12px',
                                                fontSize: '13px',
                                                lineHeight: '20px',
                                                borderRadius: '6px',
                                                border: '1px solid var(--gray-a6)',
                                                backgroundColor: 'var(--color-panel)',
                                                color: 'var(--gray-12)',
                                                outline: 'none',
                                                boxSizing: 'border-box',
                                                width: toValue !== null 
                                                  ? `${Math.max(100, toValue.toString().length * 8 + 24)}px` 
                                                  : '100px',
                                              }}
                                              onFocus={(e) => {
                                                e.currentTarget.style.borderColor = 'var(--accent-9)'
                                                e.currentTarget.style.boxShadow = '0 0 0 1px var(--accent-9)'
                                              }}
                                              onBlur={(e) => {
                                                e.currentTarget.style.borderColor = 'var(--gray-a6)'
                                                e.currentTarget.style.boxShadow = 'none'
                                              }}
                                            />
                                        </Flex>
                                      ) : (
                                        <Text size="2" style={{ whiteSpace: 'nowrap', display: 'block' }}>
                                          {fromValue !== null ? fromValue.toFixed(2) : '—'}
                                          {' – '}
                                          {toValue !== null ? toValue.toFixed(2) : '—'}
                                        </Text>
                                      )
                                    ) : (
                                      <Text size="2" color="gray">—</Text>
                                    )}
                                  </Table.Cell>
                                )
                              })}
                            </Table.Row>
                          )
                        })}
                      </Table.Body>
                    </Table.Root>
                  </Box>
                </Box>
              )}
              
              {selectedSettingTab === 'interviews' && (
                <Box>
                  <Flex align="center" justify="between" mb="4">
                    <Text size="3" weight="bold">Встречи и интервью</Text>
                    <Button size="2" variant="soft" onClick={addInterviewMeeting}>
                      <PlusIcon width={14} height={14} />
                      <Text size="2">Добавить встречу</Text>
                    </Button>
                  </Flex>
                  
                  <Text size="2" color="gray" mb="4" style={{ display: 'block' }}>
                    Рекомендуемое количество встреч: {maxMeetingsCount} (активные этапы до оффера - 2). Для каждой встречи укажите этап, длительность, заголовок, сопровождающий текст и формат (офис или онлайн).
                  </Text>
                  
                  {interviewMeetings.length === 0 ? (
                    <Card style={{ padding: '24px', textAlign: 'center' }}>
                      <Text size="2" color="gray">
                        Нет встреч. Добавьте первую встречу.
                      </Text>
                    </Card>
                  ) : (
                    <Flex direction="column" gap="4">
                      {interviewMeetings.map((meeting, index) => (
                        <Card key={meeting.id} style={{ padding: '16px' }}>
                          <Flex direction="column" gap="4">
                            <Flex align="center" justify="between">
                              <Text size="3" weight="medium">Встреча {index + 1}</Text>
                              {interviewMeetings.length > 1 && (
                                <Button
                                  size="1"
                                  variant="ghost"
                                  color="red"
                                  onClick={() => removeInterviewMeeting(meeting.id)}
                                >
                                  <TrashIcon width={14} height={14} />
                                </Button>
                              )}
                            </Flex>
                            
                            {/* Этап */}
                            <Box>
                              <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>Этап</Text>
                              <Select.Root
                                value={meeting.stage}
                                onValueChange={(value) => updateInterviewMeeting(meeting.id, { stage: value })}
                              >
                                <Select.Trigger placeholder="Выберите этап" style={{ width: '100%' }} />
                                <Select.Content>
                                  {stagesBeforeOffer.map((stage) => (
                                    <Select.Item key={stage.id} value={stage.id}>
                                      {stage.description || stage.name}
                                    </Select.Item>
                                  ))}
                                </Select.Content>
                              </Select.Root>
                            </Box>
                            
                            {/* Длительность встречи */}
                            <Box>
                              <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>Длительность встречи (минут)</Text>
                              <TextField.Root
                                type="number"
                                value={meeting.duration.toString()}
                                onChange={(e) => updateInterviewMeeting(meeting.id, { duration: parseInt(e.target.value) || 60 })}
                                placeholder="60"
                                style={{ width: '200px' }}
                              />
                            </Box>
                            
                            {/* Заголовок названия встречи */}
                            <Box>
                              <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>Заголовок названия встречи</Text>
                              <TextField.Root
                                value={meeting.title}
                                onChange={(e) => updateInterviewMeeting(meeting.id, { title: e.target.value })}
                                placeholder="Например: Техническое интервью - Frontend Developer"
                                style={{ width: '100%' }}
                              />
                            </Box>
                            
                            {/* Формат (офис или онлайн) */}
                            <Box>
                              <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>Формат встречи</Text>
                              <Text size="1" color="gray" mb="2" style={{ display: 'block' }}>
                                Выберите офис или онлайн
                              </Text>
                              <Select.Root
                                value={meeting.format || undefined}
                                onValueChange={(v) => updateInterviewMeeting(meeting.id, { format: (v || '') as 'office' | 'online' | '' })}
                              >
                                <Select.Trigger placeholder="Офис или онлайн" style={{ width: '100%' }} />
                                <Select.Content>
                                  <Select.Item value="office">Офис</Select.Item>
                                  <Select.Item value="online">Онлайн</Select.Item>
                                </Select.Content>
                              </Select.Root>
                            </Box>
                            
                            {/* Сопровождающий текст */}
                            <Box>
                              <Flex align="center" justify="between" mb="2">
                                <Text size="2" weight="medium">Сопровождающий текст</Text>
                                <DropdownMenu.Root>
                                  <DropdownMenu.Trigger>
                                    <Button size="1" variant="ghost">
                                      <Text size="1">Подсказки</Text>
                                      <ChevronDownIcon width={12} height={12} />
                                    </Button>
                                  </DropdownMenu.Trigger>
                                  <DropdownMenu.Content style={{ minWidth: 260 }}>
                                    <DropdownMenu.Item
                                      onSelect={() => {
                                        const hint = '{{candidate_link}}'
                                        updateInterviewMeeting(meeting.id, {
                                          description: meeting.description + (meeting.description ? '\n' : '') + hint,
                                        })
                                      }}
                                    >
                                      <Text size="2">Ссылка на кандидата в системе</Text>
                                    </DropdownMenu.Item>
                                    <DropdownMenu.Item
                                      onSelect={() => {
                                        const hint = '{{external_integration_link}}'
                                        updateInterviewMeeting(meeting.id, {
                                          description: meeting.description + (meeting.description ? '\n' : '') + hint,
                                        })
                                      }}
                                    >
                                      <Text size="2">Ссылка во внешней интеграции</Text>
                                    </DropdownMenu.Item>
                                    {recruiterContactHints.map(({ label, variable }) => {
                                      const hint = `{{${variable}}}`
                                      return (
                                        <DropdownMenu.Item
                                          key={variable}
                                          onSelect={() => {
                                            updateInterviewMeeting(meeting.id, {
                                              description: meeting.description + (meeting.description ? '\n' : '') + hint,
                                            })
                                          }}
                                        >
                                          <Text size="2">{label}</Text>
                                        </DropdownMenu.Item>
                                      )
                                    })}
                                    <DropdownMenu.Item
                                      onSelect={() => {
                                        const hint = '{{office_instructions}}'
                                        updateInterviewMeeting(meeting.id, {
                                          description: meeting.description + (meeting.description ? '\n' : '') + hint,
                                        })
                                      }}
                                    >
                                      <Text size="2">Инструкции офиса</Text>
                                    </DropdownMenu.Item>
                                  </DropdownMenu.Content>
                                </DropdownMenu.Root>
                              </Flex>
                              <Text size="1" color="gray" mb="2" style={{ display: 'block' }}>
                                Введите текст, который будет отправлен вместе с приглашением на встречу. Используйте подсказки для вставки шаблонов.
                              </Text>
                              <TextArea
                                value={meeting.description}
                                onChange={(e) => updateInterviewMeeting(meeting.id, { description: e.target.value })}
                                placeholder="Введите текст приглашения на встречу..."
                                style={{ minHeight: '120px', width: '100%' }}
                              />
                            </Box>
                          </Flex>
                        </Card>
                      ))}
                    </Flex>
                  )}
                </Box>
              )}
              
              {selectedSettingTab === 'scorecard' && (
                <Box>
                  <Text size="3" weight="bold" mb="4" style={{ display: 'block' }}>Scorecard</Text>
                  
                  <Flex direction="column" gap="4">
                    {/* Ссылка */}
                    <Card style={{ padding: '16px' }}>
                      <Flex direction="column" gap="3">
                        <Text size="3" weight="medium" mb="2">Ссылка</Text>
                        <Flex direction="column" gap="3">
                          <Flex direction="column" gap="2">
                            <Text size="2" weight="medium">Ссылка на Google документ</Text>
                            <TextField.Root
                              value={scorecardLinkUrl}
                              onChange={(e) => setScorecardLinkUrl(e.target.value)}
                              placeholder="https://docs.google.com/document/..."
                              style={{ width: '100%' }}
                            />
                          </Flex>
                          
                          <Flex direction="column" gap="2">
                            <Text size="2" weight="medium">Название-заголовок</Text>
                            <TextField.Root
                              value={scorecardLinkTitle}
                              onChange={(e) => setScorecardLinkTitle(e.target.value)}
                              placeholder="Введите название"
                              style={{ width: '100%' }}
                            />
                          </Flex>
                          
                          <Flex direction="column" gap="2">
                            <Text size="2" weight="medium">Место добавления</Text>
                            <Select.Root value={scorecardLinkPosition} onValueChange={(value: 'start' | 'end') => setScorecardLinkPosition(value)}>
                              <Select.Trigger style={{ width: '100%' }} />
                              <Select.Content>
                                <Select.Item value="start">В начале</Select.Item>
                                <Select.Item value="end">В конце</Select.Item>
                              </Select.Content>
                            </Select.Root>
                          </Flex>
                        </Flex>
                      </Flex>
                    </Card>
                    
                    {/* Локальный */}
                    <Card style={{ padding: '16px' }}>
                      <Flex direction="column" gap="3">
                        <Text size="3" weight="medium" mb="2">Локальный</Text>
                        <Flex direction="column" gap="3">
                          <Flex align="center" gap="2">
                            <Switch
                              checked={scorecardLocalActive}
                              onCheckedChange={setScorecardLocalActive}
                            />
                            <Text size="2">
                              {scorecardLocalActive ? 'Активный' : 'Не активный'}
                            </Text>
                          </Flex>
                          
                          <Button
                            variant="soft"
                            onClick={() => setScorecardLocalSettingsOpen(true)}
                            disabled={!scorecardLocalActive}
                            style={{ width: 'fit-content' }}
                          >
                            <GearIcon width={16} height={16} />
                            <Text size="2">Настройки</Text>
                          </Button>
                          
                          {!scorecardLocalActive && (
                            <Text size="1" color="gray" style={{ fontStyle: 'italic' }}>
                              В разработке
                            </Text>
                          )}
                        </Flex>
                      </Flex>
                    </Card>
                  </Flex>
                  
                  {/* Модальное окно настроек локального Scorecard */}
                  <Dialog.Root open={scorecardLocalSettingsOpen} onOpenChange={setScorecardLocalSettingsOpen}>
                    <Dialog.Content style={{ maxWidth: '600px' }}>
                      <Dialog.Title>Настройки локального Scorecard</Dialog.Title>
                      <Dialog.Description size="2" color="gray" mb="4">
                        Настройки локального Scorecard находятся в разработке
                      </Dialog.Description>
                      <Flex gap="3" justify="end" mt="4">
                        <Dialog.Close>
                          <Button variant="soft">Закрыть</Button>
                        </Dialog.Close>
                      </Flex>
                    </Dialog.Content>
                  </Dialog.Root>
                </Box>
              )}

              {selectedSettingTab === 'dataProcessing' && (
                <Box>
                  <Text size="3" weight="bold" mb="4" style={{ display: 'block' }}>Обработка данных</Text>
                  <Flex direction="column" gap="4">
                    <Card style={{ padding: '16px' }}>
                      <Flex direction="column" gap="3">
                        <Flex align="center" gap="2">
                          <Switch
                            checked={useUnifiedPrompt}
                            onCheckedChange={setUseUnifiedPrompt}
                          />
                          <Text size="2">Использовать единый промпт</Text>
                        </Flex>
                        <Flex direction="column" gap="2">
                          <Text size="2" weight="medium">Промпт для анализа</Text>
                          <TextArea
                            value={analysisPrompt}
                            onChange={(e) => setAnalysisPrompt(e.target.value)}
                            placeholder="Введите промпт для анализа..."
                            disabled={useUnifiedPrompt}
                            style={{ minHeight: '140px', width: '100%' }}
                          />
                        </Flex>
                      </Flex>
                    </Card>
                  </Flex>
                </Box>
              )}
              
              {selectedSettingTab === 'history' && (
                <Box>
                  <Text size="3" weight="bold" mb="4" style={{ display: 'block' }}>История правок</Text>
                  
                  <Flex direction="column" gap="3">
                    {editHistory.length === 0 ? (
                      <Text size="2" color="gray" style={{ textAlign: 'center', padding: '40px' }}>
                        История правок пуста
                      </Text>
                    ) : (
                      editHistory.map((item) => {
                        // Находим следующую версию по хронологии (более старую)
                        const nextVersion = editHistory
                          .filter(h => h.version < item.version)
                          .sort((a, b) => b.version - a.version)[0]
                        
                        return (
                          <Card 
                            key={item.id} 
                            style={{ padding: '16px', cursor: 'pointer' }}
                            onClick={() => setSelectedHistoryItem(item)}
                          >
                            <Flex direction="column" gap="2">
                              <Flex align="center" justify="between">
                                <Flex align="center" gap="2">
                                  <Badge color="gray" variant="soft">
                                    Версия {item.version}
                                  </Badge>
                                  <Text size="2" weight="medium">{item.changes}</Text>
                                </Flex>
                                <Text size="1" color="gray">{item.date}</Text>
                              </Flex>
                              <Flex align="center" gap="2">
                                <PersonIcon width={14} height={14} style={{ color: 'var(--gray-9)' }} />
                                <Text size="1" color="gray">{item.user}</Text>
                              </Flex>
                            </Flex>
                          </Card>
                        )
                      })
                    )}
                  </Flex>
                  
                  {/* Модальное окно для просмотра правки */}
                  <Dialog.Root open={selectedHistoryItem !== null} onOpenChange={(open) => !open && setSelectedHistoryItem(null)}>
                    <Dialog.Content style={{ maxWidth: '800px', maxHeight: '90vh', overflow: 'auto' }}>
                      {selectedHistoryItem && (() => {
                        // Находим следующую версию по хронологии (более старую)
                        const nextVersion = editHistory
                          .filter(h => h.version < selectedHistoryItem.version)
                          .sort((a, b) => b.version - a.version)[0]
                        
                        const currentText = selectedHistoryItem.fullText || selectedHistoryItem.changes
                        const nextText = nextVersion?.fullText || nextVersion?.changes || ''
                        const diffText = nextText ? calculateDiff(currentText, nextText) : currentText
                        
                        return (
                          <>
                            <Dialog.Title>
                              <Flex direction="column" gap="2">
                                <Text size="4" weight="bold">Версия {selectedHistoryItem.version}</Text>
                                <Text size="2" color="gray">{selectedHistoryItem.changes}</Text>
                              </Flex>
                            </Dialog.Title>
                            
                            <Dialog.Description>
                              <Flex direction="column" gap="3" mt="4">
                                <Flex align="center" gap="2">
                                  <PersonIcon width={16} height={16} />
                                  <Text size="2">{selectedHistoryItem.user}</Text>
                                  <Text size="1" color="gray">•</Text>
                                  <Text size="1" color="gray">{selectedHistoryItem.date}</Text>
                                </Flex>
                                
                                {nextVersion && (
                                  <Box style={{ 
                                    padding: '12px', 
                                    backgroundColor: 'var(--yellow-2)', 
                                    borderRadius: '6px',
                                    border: '1px solid var(--yellow-6)'
                                  }}>
                                    <Text size="1" color="gray" mb="2" style={{ display: 'block' }}>
                                      Сравнение с версией {nextVersion.version} от {nextVersion.date}
                                    </Text>
                                    <Text size="1" style={{ display: 'block' }}>
                                      <span style={{ textDecoration: 'line-through', backgroundColor: '#fef3c7' }}>Удалено</span>
                                      {' '}
                                      <span style={{ textDecoration: 'underline', backgroundColor: '#fef3c7' }}>Добавлено</span>
                                    </Text>
                                  </Box>
                                )}
                                
                                <Box style={{
                                  padding: '16px',
                                  backgroundColor: 'var(--gray-2)',
                                  borderRadius: '6px',
                                  border: '1px solid var(--gray-6)',
                                  whiteSpace: 'pre-wrap',
                                  fontFamily: 'monospace',
                                  fontSize: '13px',
                                  lineHeight: '1.6',
                                  maxHeight: '500px',
                                  overflow: 'auto'
                                }}>
                                  <div dangerouslySetInnerHTML={{ __html: diffText.replace(/\n/g, '<br/>') }} />
                                </Box>
                              </Flex>
                            </Dialog.Description>
                            
                            <Flex gap="3" mt="4" justify="end">
                              <Button 
                                variant="solid" 
                                color="blue"
                                onClick={() => {
                                  setVersionToRestore(selectedHistoryItem)
                                  setRestoreConfirmationOpen(true)
                                }}
                              >
                                Восстановить версию
                              </Button>
                              <Dialog.Close>
                                <Button variant="soft" color="gray">Закрыть</Button>
                              </Dialog.Close>
                            </Flex>
                          </>
                        )
                      })()}
                    </Dialog.Content>
                  </Dialog.Root>
                  
                  {/* Модальное окно подтверждения восстановления */}
                  <Dialog.Root open={restoreConfirmationOpen} onOpenChange={setRestoreConfirmationOpen}>
                    <Dialog.Content style={{ maxWidth: '600px' }}>
                      <Dialog.Title>
                        <Text size="4" weight="bold">Подтверждение восстановления</Text>
                      </Dialog.Title>
                      
                      <Dialog.Description>
                        <Flex direction="column" gap="4" mt="4">
                          <Text size="2">
                            Вы собираетесь восстановить версию {versionToRestore?.version} от {versionToRestore?.date}.
                            Все текущие изменения будут заменены на значения из этой версии.
                          </Text>
                          
                          {versionToRestore?.fieldsState && (
                            <>
                              <Separator />
                              
                              <Text size="2" weight="bold" mb="2">Будут восстановлены следующие поля:</Text>
                              
                              <Box style={{
                                maxHeight: '300px',
                                overflowY: 'auto',
                                padding: '12px',
                                backgroundColor: 'var(--gray-2)',
                                borderRadius: '6px',
                                border: '1px solid var(--gray-6)'
                              }}>
                                <Flex direction="column" gap="2">
                                  {Object.entries(versionToRestore.fieldsState?.fieldSettings ?? {}).map(([fieldKey, settings]) => {
                                    const fieldName = getFieldName(fieldKey)
                                    // Получаем значение поля из fieldsState
                                    const fs = versionToRestore.fieldsState
                                    let fieldValue = ''
                                    if (fieldKey === 'title') fieldValue = fs?.title || ''
                                    else if (fieldKey === 'department') fieldValue = fs?.department || ''
                                    else if (fieldKey === 'header') fieldValue = fs?.header || ''
                                    else if (fieldKey === 'responsibilities') fieldValue = fs?.responsibilities || ''
                                    else if (fieldKey === 'requirements') fieldValue = fs?.requirements || ''
                                    else if (fieldKey === 'niceToHave') fieldValue = fs?.niceToHave || ''
                                    else if (fieldKey === 'conditions') fieldValue = fs?.conditions || ''
                                    else if (fieldKey === 'closing') fieldValue = fs?.closing || ''
                                    else if (fieldKey === 'link') fieldValue = fs?.link || ''
                                    // attachment не имеет текстового значения
                                    
                                    return (
                                      <Card key={fieldKey} style={{ padding: '12px' }}>
                                        <Flex direction="column" gap="2">
                                          <Flex align="center" gap="2">
                                            <Text size="2" weight="medium">{fieldName}</Text>
                                            <Badge 
                                              color={settings.active ? 'green' : 'gray'} 
                                              variant="soft" 
                                              size="1"
                                            >
                                              {settings.active ? 'Активно' : 'Неактивно'}
                                            </Badge>
                                            <Badge 
                                              color={settings.visible ? 'blue' : 'gray'} 
                                              variant="soft" 
                                              size="1"
                                            >
                                              {settings.visible ? 'Видимо' : 'Скрыто'}
                                            </Badge>
                                          </Flex>
                                          {fieldValue && fieldKey !== 'attachment' && (
                                            <Text 
                                              size="1" 
                                              color="gray" 
                                              style={{ 
                                                maxHeight: '60px', 
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap'
                                              }}
                                            >
                                              {fieldValue.length > 100 ? `${fieldValue.substring(0, 100)}...` : fieldValue}
                                            </Text>
                                          )}
                                        </Flex>
                                      </Card>
                                    )
                                  })}
                                </Flex>
                              </Box>
                              
                              <Box style={{
                                padding: '12px',
                                backgroundColor: 'var(--yellow-2)',
                                borderRadius: '6px',
                                border: '1px solid var(--yellow-6)'
                              }}>
                                <Text size="1" color="gray">
                                  ⚠️ Восстановление создаст новую версию в истории правок. Текущие несохраненные изменения будут потеряны.
                                </Text>
                              </Box>
                            </>
                          )}
                        </Flex>
                      </Dialog.Description>
                      
                      <Flex gap="3" mt="4" justify="end">
                        <Button 
                          variant="soft" 
                          color="gray"
                          onClick={() => {
                            setRestoreConfirmationOpen(false)
                            setVersionToRestore(null)
                          }}
                        >
                          Отмена
                        </Button>
                        <Button 
                          variant="solid" 
                          color="blue"
                          onClick={handleRestoreVersion}
                        >
                          Восстановить
                        </Button>
                      </Flex>
                    </Dialog.Content>
                  </Dialog.Root>
                </Box>
              )}
            </Flex>
          ) : (
            <>
          {/* Header */}
          <Flex direction="column" gap="3" mb="4">
            <Flex align="center" gap="3">
              <Box
                onClick={handleAvatarClick}
                style={{ 
                  cursor: 'pointer',
                  borderRadius: '50%',
                  transition: 'transform 0.2s'
                }}
                onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
                  e.currentTarget.style.transform = 'scale(1.05)'
                }}
                onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
                  e.currentTarget.style.transform = 'scale(1)'
                }}
              >
                <Avatar
                  size="5"
                  fallback={getInitials(selectedCandidate.name)}
                  style={{ 
                    backgroundColor: selectedCandidate.statusColor
                  }}
                  src={candidatePhotos[selectedCandidate.id]?.[0]}
                />
              </Box>
              <Flex direction="column" gap="2" style={{ flex: 1, minWidth: 0, maxWidth: '100%', overflow: 'hidden' }}>
                <Flex 
                  align="center" 
                  gap="2" 
                  wrap={isMobile ? "wrap" : "nowrap"}
                  style={{ width: '100%', minWidth: 0, maxWidth: '100%', overflow: 'hidden' }}
                >
                  {/* ФИО и кнопка редактирования - вне скролла */}
                  {isEditingName ? (
                    <Flex align="center" gap="2" style={{ flexWrap: 'nowrap', flexShrink: 0 }}>
                      <TextField.Root
                        value={nameValue}
                        onChange={(e) => setNameValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleNameSave()
                          } else if (e.key === 'Escape') {
                            setNameValue(selectedCandidate.name)
                            setIsEditingName(false)
                          }
                        }}
                        placeholder="Введите имя"
                        size="3"
                        style={{ minWidth: '200px' }}
                        autoFocus
                      />
                      <Button 
                        size="2" 
                        variant="soft"
                        onClick={handleNameSave}
                        style={{ flexShrink: 0 }}
                      >
                        <CheckCircledIcon width={14} height={14} />
                      </Button>
                      <Button 
                        size="2" 
                        variant="soft"
                        onClick={() => {
                          setNameValue(selectedCandidate.name)
                          setIsEditingName(false)
                        }}
                        style={{ flexShrink: 0 }}
                      >
                        <Cross2Icon width={14} height={14} />
                      </Button>
                    </Flex>
                  ) : (
                    <Flex align="center" gap="2" style={{ flexShrink: 0 }}>
                      <Text size="5" weight="bold">{selectedCandidate.name}</Text>
                      <Button 
                        size="1" 
                        variant="ghost"
                        onClick={() => setIsEditingName(true)}
                        style={{ flexShrink: 0 }}
                      >
                        <Pencil1Icon width={12} height={12} />
                      </Button>
                    </Flex>
                  )}
                  
                  {/* Бейджи вакансий - в скроллируемом контейнере */}
                  <Box 
                    style={{ 
                      flex: '1 1 auto',
                      minWidth: 0,
                      overflowX: 'auto',
                      overflowY: 'hidden',
                      scrollbarWidth: 'none',
                      msOverflowStyle: 'none'
                    }}
                    className={styles.workflowScrollContainer}
                  >
                    <Flex gap="2" align="center" wrap="nowrap" style={{ width: 'max-content' }}>
                      {/* Архивные вакансии - только иконка, самые первые */}
                      {candidateVacancies
                        .filter(v => v.isArchived)
                        .map((vacancy) => (
                          <Badge 
                            key={vacancy.id}
                            size="2" 
                            style={{ 
                              backgroundColor: '#9CA3AF', 
                              color: 'white',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: '4px 8px',
                              flexShrink: 0
                            }}
                          >
                            <BoxIcon width={12} height={12} />
                          </Badge>
                        ))}
                      
                      {/* Активные вакансии - текущая на первом месте */}
                      {(() => {
                        const activeVacancies = candidateVacancies.filter(v => v.isActive)
                        // Сортируем: текущая вакансия первая
                        const sortedActive = [...activeVacancies].sort((a, b) => {
                          if (a.isCurrent) return -1
                          if (b.isCurrent) return 1
                          return 0
                        })
                        
                        return sortedActive.map((vacancy) => {
                          const statusColor = getStatusColor(vacancy.status)
                          const fullText = `🎯 ${vacancy.name} · ${vacancy.status}`
                          return (
                            <Badge 
                              key={vacancy.id}
                              size="2" 
                              style={{ 
                                backgroundColor: statusColor,
                                color: 'white',
                                flexShrink: 0,
                                maxWidth: isMobile ? '100%' : 'none',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}
                              title={fullText}
                            >
                              {fullText}
                            </Badge>
                          )
                        })
                      })()}
                      
                      {/* Предыдущие активности (отказы) - после активных */}
                      {candidateVacancies
                        .filter(v => !v.isActive && !v.isArchived)
                        .map((vacancy) => {
                          const fullText = `${vacancy.name} · ${vacancy.status}${vacancy.rejectionReason ? `, ${vacancy.rejectionReason}` : ''}`
                          return (
                            <Badge 
                              key={vacancy.id}
                              size="2" 
                              style={{ 
                                backgroundColor: '#9CA3AF', 
                                color: 'white',
                                flexShrink: 0,
                                maxWidth: isMobile ? '100%' : 'none',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}
                              title={fullText}
                            >
                              {fullText}
                            </Badge>
                          )
                        })}
                    </Flex>
                  </Box>
                  
                  {/* Кнопка "Взять на другую вакансию" - вне скролла, может сокращаться до "+" */}
                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger>
                      <Button 
                        size="2"
                        variant="soft"
                        style={{ 
                          flexShrink: 1,
                          minWidth: '30px',
                          maxWidth: 'none',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          paddingLeft: '8px',
                          paddingRight: '8px'
                        }}
                        title="Взять на другую вакансию"
                      >
                        <PlusIcon width={14} height={14} style={{ flexShrink: 0 }} />
                        {!isMobile && (
                          <span style={{ 
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            minWidth: 0,
                            flexShrink: 1,
                            maxWidth: '100%'
                          }}>
                            Взять на другую вакансию
                          </span>
                        )}
                      </Button>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Content align="end">
                      {availableVacancies
                        .filter(v => v.name !== selectedCandidate.vacancy)
                        .map((vacancy) => (
                          <DropdownMenu.Item key={vacancy.id}>
                            {vacancy.name}
                          </DropdownMenu.Item>
                        ))
                      }
                    </DropdownMenu.Content>
                  </DropdownMenu.Root>
                </Flex>
                <Flex 
                  align="center" 
                  gap="2" 
                  wrap={isMobile ? "wrap" : "nowrap"}
                  style={{ width: '100%', minWidth: 0 }}
                >
                  {/* Контейнер для элементов статуса - разрешен перенос на новую строку */}
                  <Box 
                    style={{ 
                      flex: '1 1 auto',
                      minWidth: 0
                    }}
                  >
                    <Flex 
                      align="center" 
                      gap="2" 
                      wrap="wrap"
                      style={{ width: '100%', minWidth: 0 }}
                    >
                      <Text size="2" weight="medium" style={{ flexShrink: 0 }}>Status:</Text>
                      <TextField.Root
                        size="2"
                        value={statusComment}
                        onChange={(e) => setStatusComment(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && statusComment.trim()) {
                            handleStatusCommentSubmit()
                          }
                        }}
                        placeholder="Введите комментарий..."
                        style={{ 
                          flex: '1 1 auto',
                          minWidth: '150px',
                          maxWidth: 'none'
                        }}
                      >
                        <TextField.Slot side="right" style={{ display: statusComment.trim() ? 'flex' : 'none' }}>
                          <span
                            onClick={handleStatusCommentSubmit}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault()
                                handleStatusCommentSubmit()
                              }
                            }}
                            style={{ 
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              background: 'transparent',
                              border: 'none',
                              padding: '4px',
                              borderRadius: '4px',
                              color: 'var(--gray-11)'
                            }}
                            onMouseEnter={(e: React.MouseEvent<HTMLSpanElement>) => {
                              e.currentTarget.style.backgroundColor = 'var(--gray-4)'
                            }}
                            onMouseLeave={(e: React.MouseEvent<HTMLSpanElement>) => {
                              e.currentTarget.style.backgroundColor = 'transparent'
                            }}
                          >
                            <CheckIcon width={14} height={14} />
                          </span>
                        </TextField.Slot>
                      </TextField.Root>
                      <Select.Root
                        value={selectedCandidate.status}
                        onValueChange={handleStatusChange}
                      >
                        <Select.Trigger 
                          style={{ 
                            backgroundColor: selectedCandidate.statusColor,
                            color: 'white',
                            borderColor: selectedCandidate.statusColor,
                            minWidth: '120px',
                            flexShrink: 0
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
                        <Select.Root value={rejectionReason} onValueChange={handleRejectionReasonChange}>
                          <Select.Trigger 
                            style={{ 
                              minWidth: '180px',
                              flexShrink: 0
                            }} 
                            placeholder="Причина отказа"
                          />
                          <Select.Content>
                            <Select.Item value="Без указания причин">Без указания причин</Select.Item>
                            {rejectionReasons.map((reason) => (
                              <Select.Item key={reason} value={reason}>
                                {reason}
                              </Select.Item>
                            ))}
                          </Select.Content>
                        </Select.Root>
                      )}
                    </Flex>
                  </Box>
                  {/* Кнопка "→" всегда видна вне скролла */}
                  <Button
                    size="2"
                    variant="soft"
                    onClick={handleNextStatus}
                    disabled={getNextStatus(selectedCandidate.status) === selectedCandidate.status}
                    style={{ 
                      flexShrink: 0,
                      backgroundColor: getStatusColor(getNextStatus(selectedCandidate.status)),
                      color: 'white'
                    }}
                  >
                    <Text size="3">→</Text>
                  </Button>
                </Flex>
              </Flex>
            </Flex>
          </Flex>

          <Separator size="4" mb="4" />

          {/* Подтабы */}
          <Tabs.Root value={rightTab} onValueChange={(value) => setRightTab(value as any)}>
            <Tabs.List className={styles.subTabs}>
              <Tabs.Trigger value="info">Info</Tabs.Trigger>
              <Tabs.Trigger value="activity">Activity</Tabs.Trigger>
              <Tabs.Trigger value="documents">Documents</Tabs.Trigger>
              <Tabs.Trigger value="history">History</Tabs.Trigger>
            </Tabs.List>

            <Box mt="4" style={{ overflowY: 'auto', overflowX: 'hidden', flex: 1, minHeight: 0 }}>
              <Tabs.Content value="info">
                <Flex direction="column" gap="4" style={{ width: '100%', maxWidth: '100%' }}>
                  <Box>
                    <Text size="3" weight="bold" mb="3" style={{ display: 'block' }}>
                      Контакты
                    </Text>
                    
                    {/* Emails */}
                    <Box mb="3">
                      <Flex align="center" gap="2" mb="2" wrap="wrap">
                        {getEmails().map((email: string, index: number) => (
                          <Flex key={index} align="center" gap="2" style={{ flexWrap: 'nowrap', minWidth: 0 }}>
                            {isEditingEmail && editingEmailIndex === index ? (
                              <>
                                <EnvelopeClosedIcon width={16} height={16} style={{ flexShrink: 0 }} />
                                <TextField.Root
                                  value={emailValue}
                                  onChange={(e) => setEmailValue(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      handleEmailSave(index)
                                    } else if (e.key === 'Escape') {
                                      setIsEditingEmail(false)
                                      setEditingEmailIndex(null)
                                      setEmailValue('')
                                    }
                                  }}
                                  style={{ flex: 1, minWidth: '150px' }}
                                  size="1"
                                  autoFocus
                                />
                                <Button 
                                  size="1" 
                                  variant="soft"
                                  onClick={() => handleEmailSave(index)}
                                  style={{ flexShrink: 0 }}
                                >
                                  <CheckCircledIcon width={14} height={14} />
                                </Button>
                                <Button 
                                  size="1" 
                                  variant="soft"
                                  onClick={() => {
                                    setIsEditingEmail(false)
                                    setEditingEmailIndex(null)
                                    setEmailValue('')
                                  }}
                                  style={{ flexShrink: 0 }}
                                >
                                  <Cross2Icon width={14} height={14} />
                                </Button>
                              </>
                            ) : (
                              <>
                                <EnvelopeClosedIcon width={16} height={16} style={{ flexShrink: 0 }} />
                                <Text size="2" weight="medium" style={{ flexShrink: 0 }}>Email:</Text>
                                <Text size="2" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>{email}</Text>
                                <Button 
                                  size="1" 
                                  variant="soft"
                                  onClick={() => navigator.clipboard.writeText(email)}
                                  style={{ flexShrink: 0 }}
                                >
                                  Copy
                                </Button>
                                <Button 
                                  size="1" 
                                  variant="soft"
                                  onClick={() => startEditingEmail(index)}
                                  style={{ flexShrink: 0 }}
                                >
                                  <Pencil1Icon width={14} height={14} />
                                </Button>
                                <Button 
                                  size="1" 
                                  variant="soft"
                                  style={{ flexShrink: 0 }}
                                  onClick={() => window.location.href = `mailto:${email}`}
                                >
                                  <EnvelopeClosedIcon width={14} height={14} />
                                </Button>
                                {getEmails().length > 1 && (
                                  <Button 
                                    size="1" 
                                    variant="soft"
                                    color="red"
                                    onClick={() => handleDeleteEmail(index)}
                                    style={{ flexShrink: 0 }}
                                  >
                                    <TrashIcon width={14} height={14} />
                                  </Button>
                                )}
                              </>
                            )}
                          </Flex>
                        ))}
                        <Button 
                          size="1" 
                          variant="soft"
                          onClick={() => {
                            setNewContactType('email')
                            setNewContactValue('')
                            setAddContactModalOpen(true)
                          }}
                          style={{ flexShrink: 0 }}
                        >
                          <PlusIcon width={14} height={14} />
                        </Button>
                      </Flex>
                    </Box>
                    
                    {/* Phones */}
                    <Box mb="3">
                      <Flex align="center" gap="2" mb="2" wrap="wrap">
                        {getPhones().map((phone: string, index: number) => (
                          <Flex key={index} align="center" gap="2" style={{ flexWrap: 'nowrap' }}>
                            {isEditingPhone && editingPhoneIndex === index ? (
                              <>
                                <Text size="2" weight="medium" style={{ flexShrink: 0 }}>📞 Телефон:</Text>
                                <TextField.Root
                                  value={phoneValue}
                                  onChange={(e) => setPhoneValue(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      handlePhoneSave(index)
                                    } else if (e.key === 'Escape') {
                                      setIsEditingPhone(false)
                                      setEditingPhoneIndex(null)
                                      setPhoneValue('')
                                    }
                                  }}
                                  style={{ flex: 1, minWidth: '150px' }}
                                  size="1"
                                  autoFocus
                                />
                                <Button 
                                  size="1" 
                                  variant="soft"
                                  onClick={() => handlePhoneSave(index)}
                                  style={{ flexShrink: 0 }}
                                >
                                  <CheckCircledIcon width={14} height={14} />
                                </Button>
                                <Button 
                                  size="1" 
                                  variant="soft"
                                  onClick={() => {
                                    setIsEditingPhone(false)
                                    setEditingPhoneIndex(null)
                                    setPhoneValue('')
                                  }}
                                  style={{ flexShrink: 0 }}
                                >
                                  <Cross2Icon width={14} height={14} />
                                </Button>
                              </>
                            ) : (
                              <>
                                <Text size="2" weight="medium" style={{ flexShrink: 0 }}>📞 Телефон:</Text>
                                <Text size="2">{phone}</Text>
                                <Button 
                                  size="1" 
                                  variant="soft"
                                  onClick={() => navigator.clipboard.writeText(phone)}
                                  style={{ flexShrink: 0 }}
                                >
                                  Copy
                                </Button>
                                <Button 
                                  size="1" 
                                  variant="soft"
                                  onClick={() => startEditingPhone(index)}
                                  style={{ flexShrink: 0 }}
                                >
                                  <Pencil1Icon width={14} height={14} />
                                </Button>
                                <Button 
                                  size="1" 
                                  variant="soft"
                                  style={{ flexShrink: 0 }}
                                  onClick={() => window.location.href = `tel:${phone.replace(/[^\d+]/g, '')}`}
                                >
                                  Call
                                </Button>
                                {getPhones().length > 1 && (
                                  <Button 
                                    size="1" 
                                    variant="soft"
                                    color="red"
                                    onClick={() => handleDeletePhone(index)}
                                    style={{ flexShrink: 0 }}
                                  >
                                    <TrashIcon width={14} height={14} />
                                  </Button>
                                )}
                              </>
                            )}
                          </Flex>
                        ))}
                        <Button 
                          size="1" 
                          variant="soft"
                          onClick={() => {
                            setNewContactType('phone')
                            setNewContactValue('')
                            setAddContactModalOpen(true)
                          }}
                          style={{ flexShrink: 0 }}
                        >
                          <PlusIcon width={14} height={14} />
                        </Button>
                      </Flex>
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
                                setSelectedCandidate(prev => ({ ...prev, location: locationValue } as typeof prev))
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
                              setSelectedCandidate(prev => ({ ...prev, location: locationValue } as typeof prev))
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
                            style={{ flexShrink: 0 }}
                            onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedCandidate.location)}`, '_blank', 'noopener,noreferrer')}
                          >
                            <GlobeIcon width={14} height={14} />
                          </Button>
                        </Flex>
                      )}
                    </Box>
                    
                    <Separator size="4" mb="3" />
                    
                    {/* Социальные сети и мессенджеры */}
                    <Box>
                      <Flex gap="2" wrap="wrap" style={{ alignItems: 'flex-start', overflow: 'visible' }}>
                        {getAllSocialNetworks().flatMap((social) => {
                          const contacts = social.contacts
                          const isEditing = editingSocial === social.platform && editingSocialIndex !== null
                          const editingIndex = editingSocialIndex
                          
                          // Отображаем все контакты для этой платформы
                          const contactElements = contacts.map((contact, index) => {
                            const isEditingThis = isEditing && editingIndex === index
                            const url = getSocialUrl(social.platform, contact)
                            
                            // Получаем количество непрочитанных сообщений для этой платформы
                            const unreadSources = (selectedCandidate.unreadSources as Record<string, number>) || {}
                            const unreadCount = unreadSources[social.platform] || 0
                            const showBadge = unreadCount > 0 && index === 0 // Показываем бейдж только на первом контакте для любого количества сообщений
                            
                            if (isEditingThis) {
                              return (
                                <Box
                                  key={`${social.platform}-${index}`}
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
                                    value={socialValue}
                                    onChange={(e) => handleSocialValueChange(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        handleSocialSave(social.platform, index)
                                      } else if (e.key === 'Escape') {
                                        handleSocialCancel()
                                      }
                                    }}
                                    placeholder={`Введите ${social.name}`}
                                    style={{ flex: 1, minWidth: '150px', margin: 0 }}
                                    size="1"
                                    className={styles.socialEditInput}
                                    autoFocus
                                  />
                                  <Button
                                    size="1"
                                    variant="solid"
                                    onClick={() => handleSocialSave(social.platform, index)}
                                    style={{
                                      borderRadius: '4px',
                                      width: '24px',
                                      height: '24px',
                                      padding: 0,
                                      minWidth: '24px',
                                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                      color: 'white',
                                      border: '1px solid rgba(255, 255, 255, 0.3)',
                                      cursor: 'pointer',
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'
                                    }}
                                  >
                                    <CheckIcon width={14} height={14} />
                                  </Button>
                                  <Button
                                    size="1"
                                    variant="solid"
                                    onClick={handleSocialCancel}
                                    style={{
                                      borderRadius: '4px',
                                      width: '24px',
                                      height: '24px',
                                      padding: 0,
                                      minWidth: '24px',
                                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                      color: 'white',
                                      border: '1px solid rgba(255, 255, 255, 0.3)',
                                      cursor: 'pointer',
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'
                                    }}
                                  >
                                    <Cross2Icon width={14} height={14} />
                                  </Button>
                                </Box>
                              )
                            }
                            
                            return (
                              <Box
                                key={`${social.platform}-${index}`}
                                className={styles.socialButtonWrapper}
                                style={{ position: 'relative', overflow: 'visible' }}
                              >
                                <a 
                                  href={url} 
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={styles.socialButton}
                                  style={{ 
                                    textDecoration: 'none',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '35px',
                                    height: '35px',
                                    color: 'white',
                                    borderRadius: '8px',
                                    backgroundColor: social.color,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease-in-out',
                                    flexShrink: 0,
                                  }}
                                >
                                  <Box style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    width: '100%',
                                    height: '100%',
                                    filter: 'brightness(1.1) contrast(1.1)'
                                  }}>
                                    {social.icon}
                                  </Box>
                                </a>
                                {/* Бейдж с количеством сообщений (слева сверху) */}
                                {showBadge && (
                                  <Badge
                                    size="1"
                                    color="red"
                                    style={{
                                      position: 'absolute',
                                      top: '-8px',
                                      left: '-8px',
                                      width: '22px',
                                      height: '22px',
                                      minWidth: '22px',
                                      maxWidth: '22px',
                                      padding: 0,
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      fontSize: '12px',
                                      fontWeight: 'bold',
                                      zIndex: 100,
                                      borderRadius: '50%',
                                      backgroundColor: '#EF4444',
                                      color: 'white',
                                      border: '2.5px solid white',
                                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4)',
                                      lineHeight: '1',
                                      pointerEvents: 'none'
                                    }}
                                  >
                                    {unreadCount > 9 ? '+' : unreadCount}
                                  </Badge>
                                )}
                                <Button
                                  size="1"
                                  variant="solid"
                                  className={styles.socialEditButton}
                                  onClick={() => handleSocialEdit(social.platform, index)}
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
                                {contacts.length > 1 && (
                                  <Button
                                    size="1"
                                    variant="solid"
                                    color="red"
                                    onClick={() => handleDeleteSocialContact(social.platform, index)}
                                    style={{
                                      position: 'absolute',
                                      bottom: '-4px',
                                      right: '-4px',
                                      borderRadius: '2px',
                                      width: '16px',
                                      height: '16px',
                                      padding: 0,
                                      minWidth: '16px',
                                      border: '2px solid var(--color-surface)',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      zIndex: 10,
                                    }}
                                  >
                                    <TrashIcon width={8} height={8} />
                                  </Button>
                                )}
                              </Box>
                            )
                          })
                          
                          // Поле редактирования для нового контакта этой платформы
                          if (isEditing && editingIndex === contacts.length) {
                            contactElements.push(
                              <Box
                                key={`${social.platform}-new`}
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
                                  value={socialValue}
                                  onChange={(e) => handleSocialValueChange(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      handleSocialSave(social.platform, contacts.length)
                                    } else if (e.key === 'Escape') {
                                      handleSocialCancel()
                                    }
                                  }}
                                  placeholder={`Введите ${social.name}`}
                                  style={{ flex: 1, minWidth: '150px', margin: 0 }}
                                  size="1"
                                  className={styles.socialEditInput}
                                  autoFocus
                                />
                                <Button
                                  size="1"
                                  variant="solid"
                                  onClick={() => handleSocialSave(social.platform, contacts.length)}
                                  style={{
                                    borderRadius: '4px',
                                    width: '24px',
                                    height: '24px',
                                    padding: 0,
                                    minWidth: '24px',
                                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                    color: 'white',
                                    border: '1px solid rgba(255, 255, 255, 0.3)',
                                    cursor: 'pointer',
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'
                                  }}
                                >
                                  <CheckIcon width={14} height={14} />
                                </Button>
                                <Button
                                  size="1"
                                  variant="solid"
                                  onClick={handleSocialCancel}
                                  style={{
                                    borderRadius: '4px',
                                    width: '24px',
                                    height: '24px',
                                    padding: 0,
                                    minWidth: '24px',
                                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                    color: 'white',
                                    border: '1px solid rgba(255, 255, 255, 0.3)',
                                    cursor: 'pointer',
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'
                                  }}
                                >
                                  <Cross2Icon width={14} height={14} />
                                </Button>
                              </Box>
                            )
                          }
                          
                          return contactElements
                        })}
                        
                        {/* Кнопка добавления новой платформы */}
                        {/* Кнопка добавления новой социальной сети */}
                        <DropdownMenu.Root>
                          <DropdownMenu.Trigger>
                            <Button
                              size="1"
                              variant="soft"
                              style={{
                                borderRadius: '8px',
                                width: '35px',
                                height: '35px',
                                backgroundColor: 'var(--gray-4)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                border: '2px dashed var(--gray-6)'
                              }}
                            >
                              <PlusIcon width={16} height={16} />
                            </Button>
                          </DropdownMenu.Trigger>
                          <DropdownMenu.Content>
                            {(['whatsapp', 'viber', 'telegram', 'vk', 'linkedin', 'dribbble', 'behance', 'pinterest', 'habrCareer', 'github', 'instagram', 'facebook', 'twitter', 'kaggle', 'discord'] as const).map((platform) => {
                              const platformInfo = getPlatformInfo(platform)
                              const contacts = getSocialContacts(platform)
                              const hasContact = contacts.length > 0
                              const canAddMore = contacts.length < 5
                              return (
                                <DropdownMenu.Item
                                  key={platform}
                                  onClick={() => {
                                    if (canAddMore) {
                                      handleAddSocialContact(platform)
                                    } else {
                                      alert('Можно добавить максимум 5 контактов для одной платформы')
                                    }
                                  }}
                                  disabled={!canAddMore}
                                >
                                  <Flex align="center" gap="2" justify="between" style={{ width: '100%' }}>
                                    <Flex align="center" gap="2">
                                      <Box style={{ color: platformInfo.color }}>
                                        {platformInfo.icon}
                                      </Box>
                                      {platformInfo.name}
                                    </Flex>
                                    {hasContact && (
                                      <Text size="1" color="gray">
                                        ({contacts.length}/5)
                                      </Text>
                                    )}
                                  </Flex>
                                </DropdownMenu.Item>
                              )
                            })}
                          </DropdownMenu.Content>
                        </DropdownMenu.Root>
                      </Flex>
                    </Box>
                  </Box>

                  <Box className={styles.applicationDetailsTable}>
                    <Text size="3" weight="bold" mb="3" style={{ display: 'block' }}>
                      Application Details
                    </Text>
                    <Table.Root style={{ width: '100%', tableLayout: 'fixed' }}>
                      <Table.Body>
                        <Table.Row>
                          <Table.Cell>
                            <Flex align="center" gap="2" wrap="wrap">
                              <Text size="1" weight="medium" style={{ flexShrink: 0 }}>Applied:</Text>
                              <Text size="2" style={{ wordBreak: 'break-word' }}>{selectedCandidate.applied}</Text>
                            </Flex>
                          </Table.Cell>
                          <Table.Cell>
                            {isEditingSource ? (
                              <Flex align="center" gap="2" style={{ flexWrap: 'nowrap' }}>
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
                                  style={{ flex: 1, minWidth: 0 }}
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
                              <Flex align="center" gap="2" style={{ flexWrap: 'nowrap', minWidth: 0 }}>
                                <Text size="1" weight="medium" style={{ flexShrink: 0 }}>Source:</Text>
                                <Text size="2" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>{selectedCandidate.source}</Text>
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
                                <Select.Root
                                  value={levelValue || 'Не указано'}
                                  onValueChange={setLevelValue}
                                >
                                  <Select.Trigger style={{ flex: 1, minWidth: 0 }} />
                                  <Select.Content>
                                    {levelOptions.map((option) => (
                                      <Select.Item key={option} value={option}>
                                        {option}
                                      </Select.Item>
                                    ))}
                                    <Select.Item value="Не указано">Не указано</Select.Item>
                                  </Select.Content>
                                </Select.Root>
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
                                <Text size="2">
                                  {isSalaryVisible 
                                    ? (selectedCandidate.salaryExpectations || 'Не указано')
                                    : '••••••••'
                                  }
                                </Text>
                                <Button 
                                  size="1" 
                                  variant="ghost"
                                  onClick={() => setIsSalaryVisible(!isSalaryVisible)}
                                  style={{ flexShrink: 0 }}
                                  title={isSalaryVisible ? 'Скрыть зарплатные ожидания' : 'Показать зарплатные ожидания'}
                                >
                                  {isSalaryVisible ? (
                                    <EyeOpenIcon width={12} height={12} />
                                  ) : (
                                    <EyeClosedIcon width={12} height={12} />
                                  )}
                                </Button>
                                <Button 
                                  size="1" 
                                  variant="ghost"
                                  onClick={() => setIsEditingSalary(true)}
                                  style={{ flexShrink: 0 }}
                                >
                                  <Pencil1Icon width={12} height={12} />
                                </Button>
                              </Flex>
                            )}
                          </Table.Cell>
                        </Table.Row>
                        <Table.Row>
                          <Table.Cell>
                            <Text size="2" weight="medium">Оффер:</Text>
                          </Table.Cell>
                          <Table.Cell>
                            {isEditingOffer ? (
                              <Flex align="center" gap="2" style={{ flexWrap: 'nowrap' }}>
                                <TextField.Root
                                  value={offerValue}
                                  onChange={(e) => setOfferValue(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      handleOfferSave()
                                    } else if (e.key === 'Escape') {
                                      setOfferValue((selectedCandidate as any).offer || '')
                                      setIsEditingOffer(false)
                                    }
                                  }}
                                  placeholder="Введите сумму оффера"
                                  style={{ flex: 1, minWidth: 0 }}
                                  size="1"
                                  autoFocus
                                />
                                <Button 
                                  size="1" 
                                  variant="soft"
                                  onClick={handleOfferSave}
                                  style={{ flexShrink: 0 }}
                                >
                                  <CheckCircledIcon width={14} height={14} />
                                </Button>
                                <Button 
                                  size="1" 
                                  variant="soft"
                                  onClick={() => {
                                    setOfferValue((selectedCandidate as any).offer || '')
                                    setIsEditingOffer(false)
                                  }}
                                  style={{ flexShrink: 0 }}
                                >
                                  <Cross2Icon width={14} height={14} />
                                </Button>
                              </Flex>
                            ) : (
                              <Flex align="center" gap="2" style={{ flexWrap: 'nowrap' }}>
                                <Text size="2">
                                  {isOfferVisible 
                                    ? ((selectedCandidate as any).offer || 'Не указано')
                                    : '••••••••'
                                  }
                                </Text>
                                <Button 
                                  size="1" 
                                  variant="ghost"
                                  onClick={() => setIsOfferVisible(!isOfferVisible)}
                                  style={{ flexShrink: 0 }}
                                  title={isOfferVisible ? 'Скрыть оффер' : 'Показать оффер'}
                                >
                                  {isOfferVisible ? (
                                    <EyeOpenIcon width={12} height={12} />
                                  ) : (
                                    <EyeClosedIcon width={12} height={12} />
                                  )}
                                </Button>
                                <Button 
                                  size="1" 
                                  variant="ghost"
                                  onClick={() => setIsEditingOffer(true)}
                                  style={{ flexShrink: 0 }}
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
                            </Table.Body>
                          </Table.Root>
                        </Box>
                      )}
                    </Box>
                  </Box>
                </Flex>
              </Tabs.Content>

              <Tabs.Content value="activity">
                <Flex direction="column" gap="4">
                  <Box>
                    <Text size="3" weight="bold" mb="3" style={{ display: 'block' }}>
                      Активность
                    </Text>
                    {activityItems.length === 0 ? (
                      <Text size="2" color="gray">
                        Пока нет активности. Комментарии и изменения статуса будут отображаться здесь.
                      </Text>
                    ) : (
                      <Flex direction="column" gap="3">
                        {activityItems.map((item, index) => {
                          const isEditable = isActivityEditable(item)
                          const isEditing = editingActivityId === item.id
                          // Можно удалять только последний элемент (первый в массиве, так как они отсортированы от новых к старым)
                          const canDelete = index === 0
                          
                          // Определяем текущий статус для отображения
                          const currentStatus = item.status || selectedCandidate.status
                          // Показываем переход только если статусы действительно разные
                          const hasStatusChange = item.oldStatus && item.status && item.oldStatus !== item.status
                          
                          return (
                            <Card key={item.id}>
                              <Flex direction="column" gap="2">
                                {/* Заголовок с датой, статусами и кнопками */}
                                <Flex align="center" justify="between">
                                  <Flex align="center" gap="2" wrap="wrap">
                                    <ClockIcon width={16} height={16} />
                                    <Text size="1" color="gray">{item.date}</Text>
                                    {/* Статусы в одну строку с датой */}
                                    {hasStatusChange && item.oldStatus && item.status ? (
                                      // Показываем переход между статусами только если они разные
                                      <Flex align="center" gap="2">
                                        <Badge 
                                          size="1" 
                                          style={{ 
                                            backgroundColor: getStatusColor(item.oldStatus),
                                            color: 'white'
                                          }}
                                        >
                                          {item.oldStatus}
                                        </Badge>
                                        <Text size="1">→</Text>
                                        <Badge 
                                          size="1" 
                                          style={{ 
                                            backgroundColor: getStatusColor(item.status),
                                            color: 'white'
                                          }}
                                        >
                                          {item.status}
                                          {item.status === 'Rejected' && item.rejectionReason && ` (${item.rejectionReason})`}
                                        </Badge>
                                      </Flex>
                                    ) : (
                                      // Если статусы совпадают или это простой комментарий, показываем только один статус
                                      <Badge 
                                        size="1" 
                                        style={{ 
                                          backgroundColor: getStatusColor(currentStatus),
                                          color: 'white'
                                        }}
                                      >
                                        {currentStatus}
                                        {currentStatus === 'Rejected' && item.rejectionReason && ` (${item.rejectionReason})`}
                                      </Badge>
                                    )}
                                  </Flex>
                                  {/* Одна кнопка редактирования и удаления (только для записей не старше 3 дней) */}
                                  {isEditable && !isEditing && (
                                    <Flex gap="1">
                                      <Button
                                        size="1"
                                        variant="ghost"
                                        onClick={() => handleEditActivity(item)}
                                      >
                                        <Pencil1Icon width={12} height={12} />
                                      </Button>
                                      {/* Кнопка удаления показывается только для последнего элемента (первого в массиве) */}
                                      {canDelete && (
                                        <Button
                                          size="1"
                                          variant="ghost"
                                          color="red"
                                          onClick={() => handleDeleteActivity(item.id)}
                                        >
                                          <TrashIcon width={12} height={12} />
                                        </Button>
                                      )}
                                    </Flex>
                                  )}
                                </Flex>
                                
                                {/* Режим редактирования (все поля сразу) */}
                                {isEditing && (
                                  <Flex direction="column" gap="3">
                                    {/* Редактирование статусов */}
                                    <Flex align="center" gap="2" wrap="wrap">
                                      <Select.Root
                                        value={editingActivityOldStatus}
                                        onValueChange={setEditingActivityOldStatus}
                                      >
                                        <Select.Trigger style={{ minWidth: '120px' }} />
                                        <Select.Content>
                                          {statusOrder.filter(s => s !== 'Все').map((status) => (
                                            <Select.Item key={status} value={status}>
                                              {status}
                                            </Select.Item>
                                          ))}
                                        </Select.Content>
                                      </Select.Root>
                                      <Text size="1">→</Text>
                                      <Select.Root
                                        value={editingActivityStatus}
                                        onValueChange={setEditingActivityStatus}
                                      >
                                        <Select.Trigger style={{ minWidth: '120px' }} />
                                        <Select.Content>
                                          {statusOrder.filter(s => s !== 'Все').map((status) => (
                                            <Select.Item key={status} value={status}>
                                              {status}
                                            </Select.Item>
                                          ))}
                                        </Select.Content>
                                      </Select.Root>
                                    </Flex>
                                    
                                    {/* Редактирование причины отказа (если статус Rejected) */}
                                    {editingActivityStatus === 'Rejected' && (
                                      <Select.Root
                                        value={editingActivityRejectionReason || 'Без указания причин'}
                                        onValueChange={setEditingActivityRejectionReason}
                                      >
                                        <Select.Trigger style={{ minWidth: '180px' }} placeholder="Причина отказа" />
                                        <Select.Content>
                                          <Select.Item value="Без указания причин">Без указания причин</Select.Item>
                                          {rejectionReasons.map((reason) => (
                                            <Select.Item key={reason} value={reason}>
                                              {reason}
                                            </Select.Item>
                                          ))}
                                        </Select.Content>
                                      </Select.Root>
                                    )}
                                    
                                    {/* Редактирование комментария */}
                                    <TextField.Root
                                      size="2"
                                      value={editingActivityComment}
                                      onChange={(e) => setEditingActivityComment(e.target.value)}
                                      placeholder="Введите комментарий..."
                                    />
                                    
                                    {/* Кнопки сохранения/отмены */}
                                    <Flex gap="2">
                                      <Button size="1" variant="soft" onClick={handleSaveActivityEdit}>
                                        <CheckCircledIcon width={14} height={14} />
                                        Сохранить
                                      </Button>
                                      <Button size="1" variant="soft" onClick={handleCancelActivityEdit}>
                                        <Cross2Icon width={14} height={14} />
                                        Отмена
                                      </Button>
                                    </Flex>
                                  </Flex>
                                )}
                                
                                {/* Обычный режим отображения */}
                                {!isEditing && (
                                  <>
                                    {/* Комментарий показываем после статусов */}
                                    {item.comment && (
                                      <Box>
                                        <Flex align="center" gap="2" mb="1">
                                          <ChatBubbleIcon width={14} height={14} />
                                          <Text size="1" color="gray" weight="medium">Комментарий:</Text>
                                        </Flex>
                                        <Text size="2">{item.comment}</Text>
                                      </Box>
                                    )}
                                    {/* Для простого комментария без изменения статуса */}
                                    {item.type === 'comment' && !item.comment && (
                                      <Text size="2">{item.text}</Text>
                                    )}
                                  </>
                                )}
                              </Flex>
                            </Card>
                          )
                        })}
                      </Flex>
                    )}
                  </Box>
                </Flex>
              </Tabs.Content>

              <Tabs.Content value="documents">
                <Flex direction="column" gap="3">
                  {/* Список загруженных документов */}
                  {uploadedDocuments.map((doc) => {
                    const formatFileSize = (bytes: number): string => {
                      if (bytes < 1024) return bytes + ' B'
                      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB'
                      return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
                    }
                    
                    return (
                      <Card key={doc.id}>
                        <Flex align="center" justify="between">
                          <Flex align="center" gap="3">
                            <FileTextIcon width={24} height={24} />
                            <Flex direction="column">
                              <Text size="3" weight="medium">{doc.name}</Text>
                              <Text size="1" color="gray">
                                Uploaded: {doc.uploadedDate} · Size: {formatFileSize(doc.size)}
                              </Text>
                            </Flex>
                          </Flex>
                          <Flex gap="2">
                            {/* Выпадающий список для выбора видимости документа */}
                            <DropdownMenu.Root>
                              <DropdownMenu.Trigger>
                                <Button
                                  size="1"
                                  variant="soft"
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    padding: '4px 8px',
                                    fontSize: '12px',
                                    fontWeight: '500',
                                    backgroundColor: 'var(--gray-4)',
                                    color: 'var(--gray-12)'
                                  }}
                                  title={doc.visibility === 'only-me' ? 'Только я' : doc.groupName || 'Выбрать группу'}
                                >
                                  <PersonIcon width={14} height={14} />
                                  {doc.visibility === 'only-me' ? 'Только я' : doc.groupName || 'Выбрать группу'}
                                </Button>
                              </DropdownMenu.Trigger>
                              <DropdownMenu.Content>
                                <DropdownMenu.Item
                                  onClick={() => {
                                    setUploadedDocuments(prev => prev.map(d => 
                                      d.id === doc.id 
                                        ? { ...d, visibility: 'only-me' as const, groupId: undefined, groupName: undefined }
                                        : d
                                    ))
                                  }}
                                >
                                  Только я
                                </DropdownMenu.Item>
                                <DropdownMenu.Separator />
                                {mockGroups.map((group) => (
                                  <DropdownMenu.Item
                                    key={group.id}
                                    onClick={() => {
                                      setUploadedDocuments(prev => prev.map(d => 
                                        d.id === doc.id 
                                          ? { ...d, visibility: 'group' as const, groupId: group.id, groupName: group.name }
                                          : d
                                      ))
                                    }}
                                  >
                                    {group.name}
                                  </DropdownMenu.Item>
                                ))}
                              </DropdownMenu.Content>
                            </DropdownMenu.Root>
                            <Button size="1" variant="soft">
                              <DownloadIcon width={14} height={14} />
                            </Button>
                            <Button size="1" variant="soft">
                              <EyeOpenIcon width={14} height={14} />
                            </Button>
                            <Button 
                              size="1" 
                              variant="soft" 
                              color="red"
                              onClick={() => {
                                setUploadedDocuments(prev => prev.filter(d => d.id !== doc.id))
                              }}
                            >
                              <TrashIcon width={14} height={14} />
                            </Button>
                          </Flex>
                        </Flex>
                      </Card>
                    )
                  })}

                  {/* Кнопка загрузки нового документа */}
                  <Button variant="soft" onClick={handleDocumentUploadClick}>
                    <PlusIcon width={16} height={16} />
                    Upload document
                  </Button>
                </Flex>
              </Tabs.Content>

              <Tabs.Content value="history">
                <Flex direction="column" gap="3">
                  <Text size="3" weight="bold" mb="3" style={{ display: 'block' }}>
                    История активности
                  </Text>
                  <Text size="2" color="gray" mb="3">
                    История изменений статусов и комментариев из предыдущих циклов и других вакансий
                  </Text>
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
            </Box>
          </Tabs.Root>
          </>
          )}
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
    
    {/* Модальное окно для загрузки/просмотра фото аватара */}
    <Dialog.Root open={avatarModalOpen} onOpenChange={setAvatarModalOpen}>
      <Dialog.Content style={{ maxWidth: '600px', maxHeight: '80vh' }}>
        <Dialog.Title>Фото кандидата</Dialog.Title>
        <Dialog.Description size="2" color="gray" mb="4">
          {candidatePhotos[selectedCandidate.id]?.length 
            ? 'Загрузите новое фото или просмотрите существующие'
            : 'Загрузите фото кандидата'}
        </Dialog.Description>
        
        <Flex direction="column" gap="4">
          {isEditingPhoto && uploadedPhotoForEdit ? (
            /* Форма редактирования с обрезкой */
            <Card>
              <Flex direction="column" gap="3">
                <Text size="3" weight="bold">Обрезка фото</Text>
                <Box style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center' }}>
                  <Box
                    style={{
                      position: 'relative',
                      maxWidth: '400px',
                      maxHeight: '400px',
                      overflow: 'hidden',
                      borderRadius: '8px',
                      border: '2px solid var(--gray-6)'
                    }}
                  >
                    <img
                      ref={uploadedPhotoRef}
                      src={uploadedPhotoForEdit}
                      alt="Загруженное фото"
                      onLoad={handleImageLoad}
                      style={{
                        maxWidth: '100%',
                        height: 'auto',
                        display: 'block'
                      }}
                    />
                    {/* Область обрезки */}
                    {imageDimensions.width > 0 && (
                      <>
                        <Box
                          style={{
                            position: 'absolute',
                            left: `${(cropArea.x / imageDimensions.width) * 100}%`,
                            top: `${(cropArea.y / imageDimensions.height) * 100}%`,
                            width: `${(cropArea.size / imageDimensions.width) * 100}%`,
                            height: `${(cropArea.size / imageDimensions.height) * 100}%`,
                            border: '2px solid var(--accent-9)',
                            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
                            cursor: 'move',
                            boxSizing: 'border-box'
                          }}
                          onMouseDown={(e: React.MouseEvent<HTMLDivElement>) => {
                            e.preventDefault()
                            e.stopPropagation()
                            const img = uploadedPhotoRef.current
                            if (!img) return
                            
                            const startX = e.clientX
                            const startY = e.clientY
                            const startCropX = cropArea.x
                            const startCropY = cropArea.y
                            
                            const handleMouseMove = (moveEvent: MouseEvent) => {
                              const imgRect = img.getBoundingClientRect()
                              const scaleX = imageDimensions.width / imgRect.width
                              const scaleY = imageDimensions.height / imgRect.height
                              
                              const deltaX = (moveEvent.clientX - startX) * scaleX
                              const deltaY = (moveEvent.clientY - startY) * scaleY
                              
                              const newX = Math.max(0, Math.min(startCropX + deltaX, imageDimensions.width - cropArea.size))
                              const newY = Math.max(0, Math.min(startCropY + deltaY, imageDimensions.height - cropArea.size))
                              
                              setCropArea(prev => ({ ...prev, x: newX, y: newY }))
                            }
                            
                            const handleMouseUp = () => {
                              document.removeEventListener('mousemove', handleMouseMove)
                              document.removeEventListener('mouseup', handleMouseUp)
                            }
                            
                            document.addEventListener('mousemove', handleMouseMove)
                            document.addEventListener('mouseup', handleMouseUp)
                          }}
                        />
                        {/* Углы для изменения размера */}
                        {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map((corner) => {
                          const isTop = corner.includes('top')
                          const isLeft = corner.includes('left')
                          return (
                            <Box
                              key={corner}
                              style={{
                                position: 'absolute',
                                left: `${isLeft ? (cropArea.x / imageDimensions.width) * 100 : ((cropArea.x + cropArea.size) / imageDimensions.width) * 100}%`,
                                top: `${isTop ? (cropArea.y / imageDimensions.height) * 100 : ((cropArea.y + cropArea.size) / imageDimensions.height) * 100}%`,
                                width: '12px',
                                height: '12px',
                                backgroundColor: 'var(--accent-9)',
                                border: '2px solid white',
                                borderRadius: '50%',
                                cursor: `${isTop ? (isLeft ? 'nw' : 'ne') : (isLeft ? 'sw' : 'se')}-resize`,
                                transform: 'translate(-50%, -50%)',
                                zIndex: 10
                              }}
                              onMouseDown={(e: React.MouseEvent<HTMLDivElement>) => {
                                e.preventDefault()
                                e.stopPropagation()
                                const img = uploadedPhotoRef.current
                                if (!img) return
                                
                                const startX = e.clientX
                                const startY = e.clientY
                                const startCropX = cropArea.x
                                const startCropY = cropArea.y
                                const startSize = cropArea.size
                                
                                const handleMouseMove = (moveEvent: MouseEvent) => {
                                  const imgRect = img.getBoundingClientRect()
                                  const scaleX = imageDimensions.width / imgRect.width
                                  const scaleY = imageDimensions.height / imgRect.height
                                  
                                  const deltaX = (moveEvent.clientX - startX) * scaleX
                                  const deltaY = (moveEvent.clientY - startY) * scaleY
                                  
                                  let newSize = startSize
                                  let newX = startCropX
                                  let newY = startCropY
                                  
                                  if (isLeft && isTop) {
                                    newSize = Math.max(50, Math.min(startSize - deltaX, startSize - deltaY, imageDimensions.width - startCropX, imageDimensions.height - startCropY))
                                    newX = startCropX + (startSize - newSize)
                                    newY = startCropY + (startSize - newSize)
                                  } else if (isLeft && !isTop) {
                                    newSize = Math.max(50, Math.min(startSize - deltaX, startSize + deltaY, imageDimensions.width - startCropX, startCropY + startSize))
                                    newX = startCropX + (startSize - newSize)
                                    newY = startCropY
                                  } else if (!isLeft && isTop) {
                                    newSize = Math.max(50, Math.min(startSize + deltaX, startSize - deltaY, imageDimensions.width - startCropX, imageDimensions.height - startCropY))
                                    newX = startCropX
                                    newY = startCropY + (startSize - newSize)
                                  } else {
                                    newSize = Math.max(50, Math.min(startSize + deltaX, startSize + deltaY, imageDimensions.width - startCropX, imageDimensions.height - startCropY))
                                    newX = startCropX
                                    newY = startCropY
                                  }
                                  
                                  setCropArea({ x: newX, y: newY, size: newSize })
                                }
                                
                                const handleMouseUp = () => {
                                  document.removeEventListener('mousemove', handleMouseMove)
                                  document.removeEventListener('mouseup', handleMouseUp)
                                }
                                
                                document.addEventListener('mousemove', handleMouseMove)
                                document.addEventListener('mouseup', handleMouseUp)
                              }}
                            />
                          )
                        })}
                      </>
                    )}
                  </Box>
                </Box>
                <Flex gap="2" justify="end">
                  <Button variant="soft" onClick={handleCancelEdit}>
                    Отмена
                  </Button>
                  <Button variant="solid" onClick={handleSaveCroppedPhoto}>
                    Сохранить
                  </Button>
                </Flex>
              </Flex>
            </Card>
          ) : (
            /* Форма загрузки с drag-and-drop */
            <Card>
              <Flex direction="column" gap="3">
                <Text size="3" weight="bold">Загрузить новое фото</Text>
                <Box
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '24px',
                    border: `2px dashed ${isDragging ? 'var(--accent-9)' : 'var(--gray-6)'}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    backgroundColor: isDragging ? 'var(--accent-3)' : 'var(--gray-2)'
                  }}
                  onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
                    if (!isDragging) {
                      e.currentTarget.style.borderColor = 'var(--accent-9)'
                      e.currentTarget.style.backgroundColor = 'var(--gray-3)'
                    }
                  }}
                  onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
                    if (!isDragging) {
                      e.currentTarget.style.borderColor = 'var(--gray-6)'
                      e.currentTarget.style.backgroundColor = 'var(--gray-2)'
                    }
                  }}
                  onClick={() => {
                    document.getElementById('avatar-upload')?.click()
                  }}
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileInputChange}
                    style={{ display: 'none' }}
                    id="avatar-upload"
                  />
                  <UploadIcon width={32} height={32} style={{ color: 'var(--gray-9)', marginBottom: '8px' }} />
                  <Text size="2" color="gray" align="center">
                    {isDragging ? 'Отпустите файл для загрузки' : 'Нажмите или перетащите файл сюда'}
                  </Text>
                  <Text size="1" color="gray" align="center" mt="1">
                    PNG, JPG, GIF до 10MB
                  </Text>
                </Box>
              </Flex>
            </Card>
          )}
          
          {/* Карусель фото (если есть загруженные) */}
          {candidatePhotos[selectedCandidate.id]?.length > 0 && (
            <Card>
              <Flex direction="column" gap="3">
                <Text size="3" weight="bold">Загруженные фото</Text>
                <Box style={{ position: 'relative', width: '100%' }}>
                  <Flex align="center" gap="2" style={{ overflowX: 'auto', scrollbarWidth: 'none' }}>
                    {candidatePhotos[selectedCandidate.id].map((photo, index) => (
                      <Box
                        key={index}
                        onClick={() => handleSelectMainPhoto(index)}
                        style={{
                          flexShrink: 0,
                          width: '150px',
                          height: '150px',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          border: index === 0 ? '3px solid var(--accent-9)' : '2px solid var(--gray-6)',
                          position: 'relative',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
                          if (index !== 0) {
                            e.currentTarget.style.borderColor = 'var(--accent-9)'
                            e.currentTarget.style.transform = 'scale(1.05)'
                          }
                        }}
                        onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
                          if (index !== 0) {
                            e.currentTarget.style.borderColor = 'var(--gray-6)'
                            e.currentTarget.style.transform = 'scale(1)'
                          }
                        }}
                      >
                        <img
                          src={photo}
                          alt={`Фото ${index + 1}`}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                        />
                        {index === 0 && (
                          <Box
                            style={{
                              position: 'absolute',
                              top: '4px',
                              left: '4px',
                              backgroundColor: 'var(--accent-9)',
                              color: 'white',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontSize: '10px',
                              fontWeight: 'bold'
                            }}
                          >
                            Текущее
                          </Box>
                        )}
                      </Box>
                    ))}
                  </Flex>
                </Box>
              </Flex>
            </Card>
          )}
        </Flex>
        
        <Flex gap="3" justify="end" mt="4">
          <Button variant="soft" onClick={() => setAvatarModalOpen(false)}>
            Закрыть
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
    
    {/* Модальное окно "Кому показывать" для загрузки документа */}
    <Dialog.Root open={documentUploadModalOpen} onOpenChange={(open) => {
      if (!open) {
        handleDocumentUploadCancel()
      }
    }}>
      <Dialog.Content 
        style={{ maxWidth: '500px' }}
      >
        <Dialog.Title>Кому показывать</Dialog.Title>
        <Dialog.Description size="2" color="gray" mb="4">
          {pendingDocumentFile && `Файл: ${pendingDocumentFile.name}`}
        </Dialog.Description>
        
        <Flex direction="column" gap="4">
          <Flex direction="column" gap="2">
            <Text size="3" weight="medium">Видимость документа</Text>
            <Flex direction="column" gap="2">
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  padding: '8px',
                  borderRadius: '6px',
                  border: documentVisibilityGroup === 'only-me' ? '2px solid var(--accent-9)' : '2px solid transparent',
                  backgroundColor: documentVisibilityGroup === 'only-me' ? 'var(--accent-2)' : 'transparent'
                }}
                onClick={() => setDocumentVisibilityGroup('only-me')}
              >
                <input
                  type="radio"
                  checked={documentVisibilityGroup === 'only-me'}
                  onChange={() => setDocumentVisibilityGroup('only-me')}
                  style={{ cursor: 'pointer' }}
                />
                <Text size="2">Только я</Text>
              </label>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  padding: '8px',
                  borderRadius: '6px',
                  border: documentVisibilityGroup === 'group' ? '2px solid var(--accent-9)' : '2px solid transparent',
                  backgroundColor: documentVisibilityGroup === 'group' ? 'var(--accent-2)' : 'transparent'
                }}
                onClick={() => setDocumentVisibilityGroup('group')}
              >
                <input
                  type="radio"
                  checked={documentVisibilityGroup === 'group'}
                  onChange={() => setDocumentVisibilityGroup('group')}
                  style={{ cursor: 'pointer' }}
                />
                <Text size="2">Группа</Text>
              </label>
            </Flex>
          </Flex>
          
          {documentVisibilityGroup === 'group' && (
            <Flex direction="column" gap="2">
              <Text size="3" weight="medium">Выберите группу</Text>
              <Select.Root
                value={selectedGroup}
                onValueChange={setSelectedGroup}
              >
                <Select.Trigger placeholder="Выберите группу" />
                <Select.Content>
                  {mockGroups.map((group) => (
                    <Select.Item key={group.id} value={group.id}>
                      {group.name}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
            </Flex>
          )}
        </Flex>
        
        <Flex gap="3" justify="end" mt="4">
          <Button variant="soft" onClick={handleDocumentUploadCancel}>
            Отмена
          </Button>
          <Button 
            variant="solid" 
            onClick={handleDocumentUploadConfirm}
            disabled={documentVisibilityGroup === 'group' && !selectedGroup}
          >
            Загрузить
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
    
    {/* Модальное окно для добавления контакта */}
    <Dialog.Root open={addContactModalOpen} onOpenChange={setAddContactModalOpen}>
      <Dialog.Content style={{ maxWidth: '400px' }}>
        <Dialog.Title>
          Добавить {newContactType === 'email' ? 'email' : 'телефон'}
        </Dialog.Title>
        <Dialog.Description size="2" color="gray" mb="4">
          Введите {newContactType === 'email' ? 'email адрес' : 'номер телефона'}
        </Dialog.Description>
        
        <Flex direction="column" gap="3">
          <TextField.Root
            value={newContactValue}
            onChange={(e) => setNewContactValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && newContactValue.trim()) {
                handleAddContact()
              } else if (e.key === 'Escape') {
                setAddContactModalOpen(false)
                setNewContactValue('')
              }
            }}
            placeholder={newContactType === 'email' ? 'example@email.com' : '+1 (555) 123-4567'}
            type={newContactType === 'email' ? 'email' : 'tel'}
            autoFocus
          />
        </Flex>
        
        <Flex gap="3" justify="end" mt="4">
          <Button 
            variant="soft" 
            onClick={() => {
              setAddContactModalOpen(false)
              setNewContactValue('')
            }}
          >
            Отмена
          </Button>
          <Button 
            variant="solid" 
            onClick={handleAddContact}
            disabled={!newContactValue.trim()}
          >
            Добавить
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
    
    {/* Модальное окно "Подозрение на дубликат" */}
    <Dialog.Root open={duplicateModalOpen} onOpenChange={setDuplicateModalOpen}>
      <Dialog.Content style={{ maxWidth: '1200px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', padding: 0 }}>
        {/* Заголовок и вероятность - фиксированные вверху */}
        <Box style={{ padding: '20px 24px', borderBottom: '1px solid var(--gray-a6)', flexShrink: 0 }}>
          <Flex align="center" justify="between" style={{ position: 'relative' }}>
            <Box style={{ flex: 1 }}>
              <Dialog.Title>Подозрение на дубликат</Dialog.Title>
              <Dialog.Description size="2" color="gray" mt="1">
                Сравните карточки похожих кандидатов. Совпадающие элементы выделены красными метками.
              </Dialog.Description>
            </Box>
            <Box
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                backgroundColor: calculateDuplicateProbability(selectedCandidate, duplicateCandidate) >= 70 ? 'rgba(239, 68, 68, 0.15)' : calculateDuplicateProbability(selectedCandidate, duplicateCandidate) >= 50 ? 'rgba(251, 146, 60, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                border: `2px solid ${calculateDuplicateProbability(selectedCandidate, duplicateCandidate) >= 70 ? '#ef4444' : calculateDuplicateProbability(selectedCandidate, duplicateCandidate) >= 50 ? '#fb923c' : '#3b82f6'}`,
              }}
            >
              <Text size="3" weight="bold" style={{ 
                color: calculateDuplicateProbability(selectedCandidate, duplicateCandidate) >= 70 ? '#ef4444' : calculateDuplicateProbability(selectedCandidate, duplicateCandidate) >= 50 ? '#fb923c' : '#3b82f6'
              }}>
                Вероятность: {calculateDuplicateProbability(selectedCandidate, duplicateCandidate)}%
              </Text>
            </Box>
          </Flex>
        </Box>
        
        {/* Скроллируемый контент */}
        <Box style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          <Flex direction="row" gap="4" style={{ alignItems: 'flex-start' }}>
          {/* Карточка нового кандидата (слева) */}
          <Card style={{ flex: 1, minWidth: 0 }}>
            <Flex direction="column" gap="4">
              {/* Аватар и основная информация */}
              <Flex align="center" gap="3" style={{ position: 'relative' }}>
                <Avatar
                  size="5"
                  src={selectedCandidate.avatar}
                  fallback={selectedCandidate.avatar}
                />
                <Flex direction="column" style={{ flex: 1, minWidth: 0, position: 'relative', padding: '4px 8px', borderRadius: '4px', backgroundColor: isMatch(selectedCandidate.name, duplicateCandidate.name) ? 'rgba(239, 68, 68, 0.1)' : 'transparent' }}>
                  <Text size="4" weight="bold" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {selectedCandidate.name}
                  </Text>
                  <Flex align="center" gap="2" style={{ position: 'relative', padding: '2px 4px', borderRadius: '4px', backgroundColor: isMatch(selectedCandidate.position, duplicateCandidate.position) ? 'rgba(239, 68, 68, 0.1)' : 'transparent' }}>
                    <Text size="2" color="gray">{selectedCandidate.position}</Text>
                  </Flex>
                </Flex>
              </Flex>
              
              <Separator />
              
              {/* Контакты */}
              <Box>
                <Text size="3" weight="bold" mb="3" style={{ display: 'block' }}>
                  Контакты
                </Text>
                
                {/* Emails */}
                {getEmails().length > 0 && (
                  <Box mb="3">
                    <Flex direction="column" gap="1">
{getEmails().map((email: string, index: number) => {
                         const duplicateEmails = getCandidateEmails(duplicateCandidate)
                         const isEmailMatch = isContactMatch(email, duplicateEmails)
                        return (
                          <Flex key={index} align="center" gap="2" style={{ flexWrap: 'nowrap', minWidth: 0, position: 'relative', padding: '4px 8px', borderRadius: '4px', backgroundColor: isEmailMatch ? 'rgba(239, 68, 68, 0.1)' : 'transparent' }}>
                            <EnvelopeClosedIcon width={16} height={16} style={{ flexShrink: 0 }} />
                            <Text size="2" weight="medium" style={{ flexShrink: 0 }}>Email:</Text>
                            <Text size="2" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>{email}</Text>
                          </Flex>
                        )
                      })}
                    </Flex>
                  </Box>
                )}
                
                {/* Phones */}
                {getPhones().length > 0 && (
                  <Box mb="3">
                    <Flex direction="column" gap="1">
                      {getPhones().map((phone: string, index: number) => {
                        const duplicatePhones = getCandidatePhones(duplicateCandidate)
                        const isPhoneMatch = isContactMatch(phone, duplicatePhones)
                        return (
                          <Flex key={index} align="center" gap="2" style={{ flexWrap: 'nowrap', position: 'relative', padding: '4px 8px', borderRadius: '4px', backgroundColor: isPhoneMatch ? 'rgba(239, 68, 68, 0.1)' : 'transparent' }}>
                            <Text size="2" weight="medium" style={{ flexShrink: 0 }}>📞 Телефон:</Text>
                            <Text size="2">{phone}</Text>
                          </Flex>
                        )
                      })}
                    </Flex>
                  </Box>
                )}
              </Box>
              
              <Separator />
              
              {/* Социальные сети - списки контактов */}
              <Box>
                <Text size="3" weight="bold" mb="3" style={{ display: 'block' }}>
                  Социальные сети
                </Text>
                <Flex direction="column" gap="3">
                  {getAllSocialNetworks().filter(social => social.contacts.length > 0).map((social) => {
                    const duplicateContacts = getCandidateSocialContacts(duplicateCandidate, social.platform)
                    const hasPlatformMatch = hasMatchingContact(social.contacts, duplicateContacts)
                    return (
                      <Box key={social.platform} style={{ position: 'relative', padding: '8px', borderRadius: '4px', backgroundColor: hasPlatformMatch ? 'rgba(239, 68, 68, 0.05)' : 'transparent' }}>
                        <Flex align="center" gap="2" mb="2">
                          <Box style={{ color: social.color, display: 'flex', alignItems: 'center' }}>
                            {social.icon}
                          </Box>
                          <Text size="2" weight="medium">{social.name}:</Text>
                        </Flex>
                        <Flex direction="column" gap="1" style={{ marginLeft: '24px' }}>
                          {social.contacts.map((contact, index) => {
                            const contactMatches = isContactMatch(contact, duplicateContacts)
                            const url = getSocialUrl(social.platform, contact)
                            return (
                              <Flex
                                key={`${social.platform}-${index}`}
                                align="center"
                                gap="2"
                                style={{
                                  position: 'relative',
                                  padding: '4px 8px',
                                  borderRadius: '4px',
                                  backgroundColor: contactMatches ? 'rgba(239, 68, 68, 0.15)' : 'transparent'
                                }}
                              >
                                <a
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    textDecoration: 'none',
                                    color: 'var(--accent-11)',
                                    fontSize: '14px',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    flex: 1,
                                    minWidth: 0
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.textDecoration = 'underline'
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.textDecoration = 'none'
                                  }}
                                >
                                  {contact}
                                </a>
                              </Flex>
                            )
                          })}
                        </Flex>
                      </Box>
                    )
                  })}
                </Flex>
              </Box>
              
              <Separator />
              
              {/* Дополнительная информация */}
              <Box>
                <Text size="3" weight="bold" mb="3" style={{ display: 'block' }}>
                  Дополнительно
                </Text>
                <Flex direction="column" gap="2">
                  <Flex align="center" gap="2" style={{ position: 'relative', padding: '4px 8px', borderRadius: '4px', backgroundColor: isMatch(selectedCandidate.vacancy, duplicateCandidate.vacancy) ? 'rgba(239, 68, 68, 0.1)' : 'transparent' }}>
                    <Text size="2"><strong>Вакансия:</strong> {selectedCandidate.vacancy}</Text>
                  </Flex>
                  <Flex align="center" gap="2" style={{ position: 'relative', padding: '4px 8px', borderRadius: '4px', backgroundColor: isMatch(selectedCandidate.status, duplicateCandidate.status) ? 'rgba(239, 68, 68, 0.1)' : 'transparent' }}>
                    <Text size="2"><strong>Статус:</strong> {selectedCandidate.status}</Text>
                  </Flex>
                  <Flex align="center" gap="2" style={{ position: 'relative', padding: '4px 8px', borderRadius: '4px', backgroundColor: isMatch(selectedCandidate.source, duplicateCandidate.source) ? 'rgba(239, 68, 68, 0.1)' : 'transparent' }}>
                    <Text size="2"><strong>Источник:</strong> {selectedCandidate.source}</Text>
                  </Flex>
                  {selectedCandidate.location && (
                    <Flex align="center" gap="2" style={{ position: 'relative', padding: '4px 8px', borderRadius: '4px', backgroundColor: isMatch(selectedCandidate.location, duplicateCandidate.location) ? 'rgba(239, 68, 68, 0.1)' : 'transparent' }}>
                      <Text size="2"><strong>Локация:</strong> {selectedCandidate.location}</Text>
                    </Flex>
                  )}
                  {selectedCandidate.applied && (
                    <Flex align="center" gap="2" style={{ position: 'relative', padding: '4px 8px', borderRadius: '4px', backgroundColor: isMatch(selectedCandidate.applied, duplicateCandidate.applied) ? 'rgba(239, 68, 68, 0.1)' : 'transparent' }}>
                      <Text size="2"><strong>Дата подачи:</strong> {selectedCandidate.applied}</Text>
                    </Flex>
                  )}
                  {selectedCandidate.level && (
                    <Flex align="center" gap="2" style={{ position: 'relative', padding: '4px 8px', borderRadius: '4px', backgroundColor: isMatch(selectedCandidate.level, duplicateCandidate.level) ? 'rgba(239, 68, 68, 0.1)' : 'transparent' }}>
                      <Text size="2"><strong>Уровень:</strong> {selectedCandidate.level}</Text>
                    </Flex>
                  )}
                  {selectedCandidate.tags && selectedCandidate.tags.length > 0 && (
                    <Flex align="center" gap="2" wrap="wrap" style={{ position: 'relative', padding: '4px 8px', borderRadius: '4px', backgroundColor: isMatch(selectedCandidate.tags, duplicateCandidate.tags) ? 'rgba(239, 68, 68, 0.1)' : 'transparent' }}>
                      <Text size="2" weight="medium">Теги:</Text>
                      {selectedCandidate.tags.map((tag, index) => (
                        <Badge key={index} size="1" color="blue">{tag}</Badge>
                      ))}
                    </Flex>
                  )}
                  {selectedCandidate.age && (
                    <Flex align="center" gap="2" style={{ position: 'relative', padding: '4px 8px', borderRadius: '4px', backgroundColor: isMatch(selectedCandidate.age, duplicateCandidate.age) ? 'rgba(239, 68, 68, 0.1)' : 'transparent' }}>
                      <Text size="2"><strong>Возраст:</strong> {selectedCandidate.age}</Text>
                    </Flex>
                  )}
                  {selectedCandidate.gender && (
                    <Flex align="center" gap="2" style={{ position: 'relative', padding: '4px 8px', borderRadius: '4px', backgroundColor: isMatch(selectedCandidate.gender, duplicateCandidate.gender) ? 'rgba(239, 68, 68, 0.1)' : 'transparent' }}>
                      <Text size="2"><strong>Пол:</strong> {selectedCandidate.gender}</Text>
                    </Flex>
                  )}
                  {selectedCandidate.salaryExpectations && (
                    <Flex align="center" gap="2" style={{ position: 'relative', padding: '4px 8px', borderRadius: '4px', backgroundColor: isMatch(selectedCandidate.salaryExpectations, duplicateCandidate.salaryExpectations) ? 'rgba(239, 68, 68, 0.1)' : 'transparent' }}>
                      <Text size="2"><strong>Ожидания по зарплате:</strong> {selectedCandidate.salaryExpectations}</Text>
                    </Flex>
                  )}
                </Flex>
              </Box>
            </Flex>
          </Card>
          
          {/* Карточка похожего кандидата (справа) */}
          <Card style={{ flex: 1, minWidth: 0 }}>
            <Flex direction="column" gap="4">
              {/* Аватар и основная информация */}
              <Flex align="center" gap="3" style={{ position: 'relative' }}>
                <Avatar
                  size="5"
                  src={duplicateCandidate.avatar}
                  fallback={duplicateCandidate.avatar}
                />
                <Flex direction="column" style={{ flex: 1, minWidth: 0, position: 'relative', padding: '4px 8px', borderRadius: '4px', backgroundColor: isMatch(duplicateCandidate.name, selectedCandidate.name) ? 'rgba(239, 68, 68, 0.1)' : 'transparent' }}>
                  <Text size="4" weight="bold" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {duplicateCandidate.name} (дубликат?)
                  </Text>
                  <Flex align="center" gap="2" style={{ position: 'relative', padding: '2px 4px', borderRadius: '4px', backgroundColor: isMatch(duplicateCandidate.position, selectedCandidate.position) ? 'rgba(239, 68, 68, 0.1)' : 'transparent' }}>
                    <Text size="2" color="gray">{duplicateCandidate.position}</Text>
                  </Flex>
                </Flex>
              </Flex>
              
              <Separator />
              
              {/* Контакты */}
              <Box>
                <Text size="3" weight="bold" mb="3" style={{ display: 'block' }}>
                  Контакты
                </Text>
                
                {/* Emails */}
                {getCandidateEmails(duplicateCandidate).length > 0 && (
                  <Box mb="3">
                    <Flex direction="column" gap="1">
                      {getCandidateEmails(duplicateCandidate).map((email, index) => {
                        const currentEmails = getEmails()
                        const isEmailMatch = isContactMatch(email, currentEmails)
                        return (
                          <Flex key={index} align="center" gap="2" style={{ flexWrap: 'nowrap', minWidth: 0, position: 'relative', padding: '4px 8px', borderRadius: '4px', backgroundColor: isEmailMatch ? 'rgba(239, 68, 68, 0.1)' : 'transparent' }}>
                            <EnvelopeClosedIcon width={16} height={16} style={{ flexShrink: 0 }} />
                            <Text size="2" weight="medium" style={{ flexShrink: 0 }}>Email:</Text>
                            <Text size="2" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>{email}</Text>
                          </Flex>
                        )
                      })}
                    </Flex>
                  </Box>
                )}
                
                {/* Phones */}
                {getCandidatePhones(duplicateCandidate).length > 0 && (
                  <Box mb="3">
                    <Flex direction="column" gap="1">
                      {getCandidatePhones(duplicateCandidate).map((phone, index) => {
                        const currentPhones = getPhones()
                        const isPhoneMatch = isContactMatch(phone, currentPhones)
                        return (
                          <Flex key={index} align="center" gap="2" style={{ flexWrap: 'nowrap', position: 'relative', padding: '4px 8px', borderRadius: '4px', backgroundColor: isPhoneMatch ? 'rgba(239, 68, 68, 0.1)' : 'transparent' }}>
                            <Text size="2" weight="medium" style={{ flexShrink: 0 }}>📞 Телефон:</Text>
                            <Text size="2">{phone}</Text>
                          </Flex>
                        )
                      })}
                    </Flex>
                  </Box>
                )}
              </Box>
              
              <Separator />
              
              {/* Социальные сети - списки контактов */}
              <Box>
                <Text size="3" weight="bold" mb="3" style={{ display: 'block' }}>
                  Социальные сети
                </Text>
                <Flex direction="column" gap="3">
                  {['whatsapp', 'viber', 'telegram', 'vk', 'linkedin', 'dribbble', 'behance', 'pinterest', 'habrCareer', 'github', 'instagram', 'facebook', 'twitter', 'kaggle', 'discord'].map((platform) => {
                    const contacts = getCandidateSocialContacts(duplicateCandidate, platform)
                    if (contacts.length === 0) return null
                    
                    const platformInfo = getPlatformInfo(platform)
                    const currentContacts = getSocialContacts(platform)
                    const hasPlatformMatch = hasMatchingContact(contacts, currentContacts)
                    
                    return (
                      <Box key={platform} style={{ position: 'relative', padding: '8px', borderRadius: '4px', backgroundColor: hasPlatformMatch ? 'rgba(239, 68, 68, 0.05)' : 'transparent' }}>
                        <Flex align="center" gap="2" mb="2">
                          <Box style={{ color: platformInfo.color, display: 'flex', alignItems: 'center' }}>
                            {platformInfo.icon}
                          </Box>
                          <Text size="2" weight="medium">{platformInfo.name}:</Text>
                        </Flex>
                        <Flex direction="column" gap="1" style={{ marginLeft: '24px' }}>
                          {contacts.map((contact, index) => {
                            const contactMatches = isContactMatch(contact, currentContacts)
                            const url = getSocialUrl(platform, contact)
                            return (
                              <Flex
                                key={`${platform}-${index}`}
                                align="center"
                                gap="2"
                                style={{
                                  position: 'relative',
                                  padding: '4px 8px',
                                  borderRadius: '4px',
                                  backgroundColor: contactMatches ? 'rgba(239, 68, 68, 0.15)' : 'transparent'
                                }}
                              >
                                <a
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    textDecoration: 'none',
                                    color: 'var(--accent-11)',
                                    fontSize: '14px',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    flex: 1,
                                    minWidth: 0
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.textDecoration = 'underline'
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.textDecoration = 'none'
                                  }}
                                >
                                  {contact}
                                </a>
                              </Flex>
                            )
                          })}
                        </Flex>
                      </Box>
                    )
                  })}
                </Flex>
              </Box>
              
              <Separator />
              
              {/* Дополнительная информация */}
              <Box>
                <Text size="3" weight="bold" mb="3" style={{ display: 'block' }}>
                  Дополнительно
                </Text>
                <Flex direction="column" gap="2">
                  <Flex align="center" gap="2" style={{ position: 'relative', padding: '4px 8px', borderRadius: '4px', backgroundColor: isMatch(duplicateCandidate.vacancy, selectedCandidate.vacancy) ? 'rgba(239, 68, 68, 0.1)' : 'transparent' }}>
                    <Text size="2"><strong>Вакансия:</strong> {duplicateCandidate.vacancy}</Text>
                  </Flex>
                  <Flex align="center" gap="2" style={{ position: 'relative', padding: '4px 8px', borderRadius: '4px', backgroundColor: isMatch(duplicateCandidate.status, selectedCandidate.status) ? 'rgba(239, 68, 68, 0.1)' : 'transparent' }}>
                    <Text size="2"><strong>Статус:</strong> {duplicateCandidate.status}</Text>
                  </Flex>
                  <Flex align="center" gap="2" style={{ position: 'relative', padding: '4px 8px', borderRadius: '4px', backgroundColor: isMatch(duplicateCandidate.source, selectedCandidate.source) ? 'rgba(239, 68, 68, 0.1)' : 'transparent' }}>
                    <Text size="2"><strong>Источник:</strong> {duplicateCandidate.source}</Text>
                  </Flex>
                  {duplicateCandidate.location && (
                    <Flex align="center" gap="2" style={{ position: 'relative', padding: '4px 8px', borderRadius: '4px', backgroundColor: isMatch(duplicateCandidate.location, selectedCandidate.location) ? 'rgba(239, 68, 68, 0.1)' : 'transparent' }}>
                      <Text size="2"><strong>Локация:</strong> {duplicateCandidate.location}</Text>
                    </Flex>
                  )}
                  {duplicateCandidate.applied && (
                    <Flex align="center" gap="2" style={{ position: 'relative', padding: '4px 8px', borderRadius: '4px', backgroundColor: isMatch(duplicateCandidate.applied, selectedCandidate.applied) ? 'rgba(239, 68, 68, 0.1)' : 'transparent' }}>
                      <Text size="2"><strong>Дата подачи:</strong> {duplicateCandidate.applied}</Text>
                    </Flex>
                  )}
                  {duplicateCandidate.level && (
                    <Flex align="center" gap="2" style={{ position: 'relative', padding: '4px 8px', borderRadius: '4px', backgroundColor: isMatch(duplicateCandidate.level, selectedCandidate.level) ? 'rgba(239, 68, 68, 0.1)' : 'transparent' }}>
                      <Text size="2"><strong>Уровень:</strong> {duplicateCandidate.level}</Text>
                    </Flex>
                  )}
                  {duplicateCandidate.tags && duplicateCandidate.tags.length > 0 && (
                    <Flex align="center" gap="2" wrap="wrap" style={{ position: 'relative', padding: '4px 8px', borderRadius: '4px', backgroundColor: isMatch(duplicateCandidate.tags, selectedCandidate.tags) ? 'rgba(239, 68, 68, 0.1)' : 'transparent' }}>
                      <Text size="2" weight="medium">Теги:</Text>
                      {duplicateCandidate.tags.map((tag, index) => (
                        <Badge key={index} size="1" color="blue">{tag}</Badge>
                      ))}
                    </Flex>
                  )}
                  {duplicateCandidate.age && (
                    <Flex align="center" gap="2" style={{ position: 'relative', padding: '4px 8px', borderRadius: '4px', backgroundColor: isMatch(duplicateCandidate.age, selectedCandidate.age) ? 'rgba(239, 68, 68, 0.1)' : 'transparent' }}>
                      <Text size="2"><strong>Возраст:</strong> {duplicateCandidate.age}</Text>
                    </Flex>
                  )}
                  {duplicateCandidate.gender && (
                    <Flex align="center" gap="2" style={{ position: 'relative', padding: '4px 8px', borderRadius: '4px', backgroundColor: isMatch(duplicateCandidate.gender, selectedCandidate.gender) ? 'rgba(239, 68, 68, 0.1)' : 'transparent' }}>
                      <Text size="2"><strong>Пол:</strong> {duplicateCandidate.gender}</Text>
                    </Flex>
                  )}
                  {duplicateCandidate.salaryExpectations && (
                    <Flex align="center" gap="2" style={{ position: 'relative', padding: '4px 8px', borderRadius: '4px', backgroundColor: isMatch(duplicateCandidate.salaryExpectations, selectedCandidate.salaryExpectations) ? 'rgba(239, 68, 68, 0.1)' : 'transparent' }}>
                      <Text size="2"><strong>Ожидания по зарплате:</strong> {duplicateCandidate.salaryExpectations}</Text>
                    </Flex>
                  )}
                </Flex>
              </Box>
            </Flex>
          </Card>
          </Flex>
        </Box>
        
        {/* Кнопки - фиксированные внизу */}
        <Box style={{ padding: '16px 24px', borderTop: '1px solid var(--gray-a6)', flexShrink: 0, backgroundColor: 'var(--color-surface)' }}>
          <Flex gap="3" style={{ width: '100%' }}>
            <Button 
              variant="soft" 
              onClick={() => setDuplicateModalOpen(false)}
              style={{ flex: 1, width: '100%' }}
            >
              Это разные кандидаты
            </Button>
            <Button 
              variant="solid" 
              color="red" 
              onClick={() => {
                // TODO: Объединить кандидатов или удалить дубликат
                alert('Функция объединения кандидатов будет реализована')
                setDuplicateModalOpen(false)
              }}
              style={{ flex: 1, width: '100%' }}
            >
              Объединить кандидатов
            </Button>
          </Flex>
        </Box>
      </Dialog.Content>
    </Dialog.Root>
    </AppLayout>
  )
}
