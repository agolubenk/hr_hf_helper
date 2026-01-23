'use client'

import React, { useState, useEffect } from 'react'
import AppLayout from "@/components/AppLayout"
import WorkflowChat from "@/components/workflow/WorkflowChat"
import SlotsPanel from "@/components/workflow/SlotsPanel"
import { Box, Flex, Text, TextField, Button, Tabs, Badge, Avatar, Separator, Card, Table, Select, Dialog, Checkbox, DropdownMenu } from "@radix-ui/themes"
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
import { SiViber, SiKaggle } from "react-icons/si"
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
    status: 'Interview',
    statusColor: '#8B5CF6',
    avatar: 'ИП',
    timeAgo: '3 hours ago',
    unread: 1,
    unreadSources: { whatsapp: 1 }, // Непрочитанные сообщения из WhatsApp
    isViewed: true, // Информация просмотрена
    hasUnviewedChanges: false, // Нет непросмотренных изменений
    email: 'ivanov@example.com',
    phone: '+7 (999) 123-4567',
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
    unread: 0,
    unreadSources: {},
    isViewed: true,
    hasUnviewedChanges: false,
    email: 'smirnova@example.com',
    phone: '+7 (999) 234-5678',
    location: 'Санкт-Петербург, Россия',
    telegram: '@smirnova',
    linkedin: '/in/smirnova',
    github: 'smirnova',
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
  const [selectedSettingTab, setSelectedSettingTab] = useState<'text' | 'recruiters' | 'customers' | 'questions' | 'integrations' | 'statuses' | 'salary'>('text')
  
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
  const [socialValues, setSocialValues] = useState<Record<string, string>>({})
  
  // Состояние редактирования локации
  const [isEditingLocation, setIsEditingLocation] = useState(false)
  const [locationValue, setLocationValue] = useState(selectedCandidate.location)
  
  // Состояние редактирования контактов
  const [isEditingEmail, setIsEditingEmail] = useState(false)
  const [emailValue, setEmailValue] = useState(selectedCandidate.email)
  const [isEditingPhone, setIsEditingPhone] = useState(false)
  const [phoneValue, setPhoneValue] = useState(selectedCandidate.phone)
  
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
  
  const handleNameSave = () => {
    setSelectedCandidate(prev => ({ ...prev, name: nameValue }))
    setIsEditingName(false)
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
  
  const handleOfferSave = () => {
    setSelectedCandidate(prev => ({ ...prev, offer: offerValue } as any))
    setIsEditingOffer(false)
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
    const socialPlatforms = ['whatsapp', 'viber', 'telegram', 'vk', 'linkedin', 'dribbble', 'behance', 'pinterest', 'habrCareer', 'github', 'instagram', 'facebook', 'twitter', 'kaggle'] as const
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
    const socialPlatforms = ['whatsapp', 'viber', 'telegram', 'vk', 'linkedin', 'dribbble', 'behance', 'pinterest', 'habrCareer', 'github', 'instagram', 'facebook', 'twitter', 'kaggle'] as const
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
      setWindowWidth(window.innerWidth)
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
  
  const handleSettingTabClick = (tab: 'text' | 'recruiters' | 'customers' | 'questions' | 'integrations' | 'statuses' | 'salary') => {
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
                      variant={interviewFormat === 'offline' ? 'solid' : 'soft'}
                      size="2"
                      onClick={() => setInterviewFormat('offline')}
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
                      top: '8px',
                      right: '8px',
                      width: '12px',
                      height: '12px',
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
                    <Flex align="center" gap="2">
                      <Text size="3" weight="bold">{candidate.name}</Text>
                      {/* Бейдж с иконкой/многоточием и количеством сообщений */}
                      {candidate.unread > 0 && (() => {
                        const unreadInfo = getUnreadInfo(candidate)
                        if (!unreadInfo) return null
                        return (
                          <Flex align="center" gap="1">
                            <Badge size="1" color="red" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              {unreadInfo.icon}
                              {unreadInfo.count}
                            </Badge>
                          </Flex>
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
        
        <Card 
          className={styles.candidateCard}
          onDragOver={handleDocumentDragOver}
          onDragLeave={handleDocumentDragLeave}
          onDrop={handleDocumentDrop}
          style={{
            border: isDraggingDocument ? '2px dashed var(--accent-9)' : undefined,
            transition: 'border 0.2s'
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
                  <Text size="3" weight="bold" mb="3" style={{ display: 'block' }}>Текст вакансии</Text>
                  <Text size="2" color="gray" mb="3" style={{ display: 'block' }}>
                    Здесь будет редактор текста вакансии
                  </Text>
                  <TextField.Root placeholder="Название вакансии" mb="3" />
                  <TextField.Root placeholder="Описание" />
                </Box>
              )}
              
              {selectedSettingTab === 'recruiters' && (
                <Box>
                  <Text size="3" weight="bold" mb="3" style={{ display: 'block' }}>Рекрутеры</Text>
                  <Text size="2" color="gray">
                    Список рекрутеров, работающих над этой вакансией
                  </Text>
                </Box>
              )}
              
              {selectedSettingTab === 'customers' && (
                <Box>
                  <Text size="3" weight="bold" mb="3" style={{ display: 'block' }}>Заказчики и интервьюеры</Text>
                  <Text size="2" color="gray">
                    Управление заказчиками и интервьюерами
                  </Text>
                </Box>
              )}
              
              {selectedSettingTab === 'questions' && (
                <Box>
                  <Text size="3" weight="bold" mb="3" style={{ display: 'block' }}>Вопросы и ссылки</Text>
                  <Text size="2" color="gray">
                    Вопросы для кандидатов и полезные ссылки
                  </Text>
                </Box>
              )}
              
              {selectedSettingTab === 'integrations' && (
                <Box>
                  <Text size="3" weight="bold" mb="3" style={{ display: 'block' }}>Связи и интеграции</Text>
                  <Text size="2" color="gray">
                    Настройка интеграций с внешними сервисами
                  </Text>
                </Box>
              )}
              
              {selectedSettingTab === 'statuses' && (
                <Box>
                  <Text size="3" weight="bold" mb="3" style={{ display: 'block' }}>Статусы</Text>
                  <Text size="2" color="gray">
                    Управление статусами кандидатов
                  </Text>
                </Box>
              )}
              
              {selectedSettingTab === 'salary' && (
                <Box>
                  <Text size="3" weight="bold" mb="3" style={{ display: 'block' }}>Зарплатные вилки</Text>
                  <Text size="2" color="gray">
                    Настройка зарплатных диапазонов для вакансии
                  </Text>
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
                        <Flex align="center" gap="2" style={{ flexWrap: 'nowrap', minWidth: 0 }}>
                          <EnvelopeClosedIcon width={16} height={16} style={{ flexShrink: 0 }} />
                          <Text size="2" weight="medium" style={{ flexShrink: 0 }}>Email:</Text>
                          <Text size="2" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>{selectedCandidate.email}</Text>
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
                            style={{ flexShrink: 0 }}
                            onClick={() => window.location.href = `mailto:${selectedCandidate.email}`}
                          >
                            <EnvelopeClosedIcon width={14} height={14} />
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
                            style={{ flexShrink: 0 }}
                            onClick={() => window.location.href = `tel:${selectedCandidate.phone.replace(/[^\d+]/g, '')}`}
                          >
                            Call
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
                          
                          // Получаем количество непрочитанных сообщений для этой платформы
                          const unreadSources = (selectedCandidate.unreadSources as Record<string, number>) || {}
                          const unreadCount = unreadSources[social.platform] || 0
                          const showBadge = unreadCount > 0 && unreadCount < 10
                          
                          return (
                            <Box
                              key={social.platform}
                              className={styles.socialButtonWrapper}
                              style={{ position: 'relative', overflow: 'visible' }}
                            >
                              {social.hasContact ? (
                                <>
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
                                        minWidth: '22px',
                                        height: '22px',
                                        padding: '0 6px',
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
                                      {unreadCount}
                                    </Badge>
                                  )}
                                </>
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
                    <Table.Root style={{ width: '100%', tableLayout: 'fixed' }}>
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
                                {doc.visibility === 'group' && doc.groupName && ` · ${doc.groupName}`}
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
    </AppLayout>
  )
}
