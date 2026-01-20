'use client'

import { useState, useEffect } from 'react'
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
  Cross2Icon
} from "@radix-ui/react-icons"
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
    linkedin: '/in/johndoe',
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
    linkedin: '/in/janesmith',
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
    linkedin: '/in/mikechen',
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

export default function RecrChatPage() {
  const [leftTab, setLeftTab] = useState<'candidates' | 'chat' | 'vacancy-settings'>('candidates')
  const [rightTab, setRightTab] = useState<'info' | 'history' | 'activity' | 'documents'>('info')
  const [selectedCandidate, setSelectedCandidate] = useState(mockCandidates[0])
  const [searchQuery, setSearchQuery] = useState('')
  const [isRightColumnOpen, setIsRightColumnOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  
  // Настройки вакансии
  const [selectedSettingTab, setSelectedSettingTab] = useState<'text' | 'recruiters' | 'customers' | 'questions' | 'integrations' | 'statuses' | 'salary'>('text')
  
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

            <Flex align="center" gap="2">
              <Text size="2" weight="medium">Rating:</Text>
              <Flex gap="1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <StarIcon
                    key={star}
                    width={16}
                    height={16}
                    style={{
                      color: star <= selectedCandidate.rating ? '#F59E0B' : '#E5E7EB',
                      fill: star <= selectedCandidate.rating ? '#F59E0B' : 'none'
                    }}
                  />
                ))}
              </Flex>
              <Text size="2" color="gray">({selectedCandidate.rating}/5)</Text>
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
                      Personal Information
                    </Text>
                    <Table.Root>
                      <Table.Body>
                        <Table.Row>
                          <Table.Cell>
                            <Text size="2" weight="medium">Email:</Text>
                          </Table.Cell>
                          <Table.Cell>
                            <Flex align="center" gap="2">
                              <Text size="2">{selectedCandidate.email}</Text>
                              <Button size="1" variant="soft">Copy</Button>
                              <Button size="1" variant="soft">
                                <EnvelopeClosedIcon width={14} height={14} />
                              </Button>
                            </Flex>
                          </Table.Cell>
                        </Table.Row>
                        <Table.Row>
                          <Table.Cell>
                            <Text size="2" weight="medium">Phone:</Text>
                          </Table.Cell>
                          <Table.Cell>
                            <Flex align="center" gap="2">
                              <Text size="2">{selectedCandidate.phone}</Text>
                              <Button size="1" variant="soft">Copy</Button>
                              <Button size="1" variant="soft">Call</Button>
                            </Flex>
                          </Table.Cell>
                        </Table.Row>
                        <Table.Row>
                          <Table.Cell>
                            <Text size="2" weight="medium">Location:</Text>
                          </Table.Cell>
                          <Table.Cell>
                            <Text size="2">{selectedCandidate.location}</Text>
                          </Table.Cell>
                        </Table.Row>
                        <Table.Row>
                          <Table.Cell>
                            <Text size="2" weight="medium">LinkedIn:</Text>
                          </Table.Cell>
                          <Table.Cell>
                            <Text size="2">{selectedCandidate.linkedin}</Text>
                          </Table.Cell>
                        </Table.Row>
                      </Table.Body>
                    </Table.Root>
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
