'use client'

import { Box, Flex, Text, TextField, TextArea, Select } from "@radix-ui/themes"
import { 
  PersonIcon, 
  VideoIcon,
  Link2Icon, 
  QuestionMarkCircledIcon, 
  ClipboardIcon,
  CodeIcon
} from "@radix-ui/react-icons"
import styles from './TransferStagesEditSection.module.css'

interface Stage {
  name: string
  assignStage?: string
  duration?: string
  inviteTitle?: string
  accompanyingText?: string
  forInterviewers?: string
  relatedSections?: Array<{ name: string; icon: string }>
}

interface TransferStagesEditSectionProps {
  stages: {
    hrScreening: Stage
    techScreening: Stage
    techInterview: Stage
  }
  onChange: (stages: TransferStagesEditSectionProps['stages']) => void
}

export default function TransferStagesEditSection({ stages, onChange }: TransferStagesEditSectionProps) {
  const updateStage = (stageKey: keyof typeof stages, updates: Partial<Stage>) => {
    onChange({
      ...stages,
      [stageKey]: { ...stages[stageKey], ...updates }
    })
  }

  const scrollToSection = (sectionName: string) => {
    let targetId = ''
    if (sectionName === 'Ссылки на вакансии') {
      targetId = 'vacancy-links'
    } else if (sectionName === 'Вопросы для интервью') {
      targetId = 'interview-questions'
    } else if (sectionName === 'Зарплатные вилки') {
      targetId = 'salary-ranges'
    } else if (sectionName === 'Промпт для анализа') {
      targetId = 'analysis-prompt'
    } else if (sectionName === 'Интервьюеры') {
      targetId = 'interviewers'
    } else if (sectionName === 'Обязательные участники') {
      targetId = 'mandatory-participants'
    }
    
    if (targetId) {
      const element = document.getElementById(targetId)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
  }

  return (
    <Box className={styles.transferStagesCard}>
      <Flex align="center" gap="2" mb="4" className={styles.header}>
        <Box className={styles.iconCircle}>
          <PersonIcon width={16} height={16} />
        </Box>
        <Text size="5" weight="bold">Этапы для перевода кандидатов</Text>
      </Flex>

      <Flex gap="4" wrap="wrap" className={styles.stagesContainer}>
        {/* HR Screening */}
        <Box className={styles.stageCard}>
          <Flex align="center" gap="2" mb="3" className={styles.stageHeader}>
            <PersonIcon width={20} height={20} />
            <Text size="4" weight="bold">{stages.hrScreening.name}</Text>
          </Flex>

          <Flex direction="column" gap="3">
            <Flex direction="column" gap="1">
              <Text size="2" weight="bold" style={{ color: 'var(--gray-11)' }}>
                → Назначить этап
              </Text>
              <Select.Root
                value={stages.hrScreening.assignStage}
                onValueChange={(value) => updateStage('hrScreening', { assignStage: value })}
              >
                <Select.Trigger />
                <Select.Content>
                  <Select.Item value="HR Screening">HR Screening</Select.Item>
                  <Select.Item value="Tech Screening">Tech Screening</Select.Item>
                  <Select.Item value="Tech Interview">Tech Interview</Select.Item>
                  <Select.Item value="Final Interview">Final Interview</Select.Item>
                </Select.Content>
              </Select.Root>
            </Flex>

            {stages.hrScreening.relatedSections && (
              <>
                <Flex align="center" gap="2" mb="2">
                  <Link2Icon width={16} height={16} />
                  <Text size="3" weight="bold">Связанные разделы</Text>
                </Flex>
                <Flex direction="column" gap="2">
                  {stages.hrScreening.relatedSections.map((section, index) => (
                    <Box
                      key={index}
                      className={styles.relatedSectionButton}
                      onClick={() => scrollToSection(section.name)}
                    >
                      {section.icon === 'globe' && <Link2Icon width={14} height={14} />}
                      {section.icon === 'question' && <QuestionMarkCircledIcon width={14} height={14} />}
                      {section.icon === 'money' && <Box style={{ fontSize: '14px' }}>💰</Box>}
                      {section.icon === 'prompt' && <ClipboardIcon width={14} height={14} />}
                      {section.icon === 'interviewers' && <PersonIcon width={14} height={14} />}
                      <Text size="2">{section.name}</Text>
                    </Box>
                  ))}
                </Flex>
              </>
            )}
          </Flex>
        </Box>

        {/* Tech Screening */}
        <Box className={styles.stageCard}>
          <Flex align="center" gap="2" mb="3" className={styles.stageHeader}>
            <CodeIcon width={20} height={20} />
            <Text size="4" weight="bold">{stages.techScreening.name}</Text>
          </Flex>

          <Flex direction="column" gap="3">
            <Flex direction="column" gap="1">
              <Text size="2" weight="bold" style={{ color: 'var(--gray-11)' }}>
                Длительность (мин)
              </Text>
              <TextField.Root
                type="number"
                value={stages.techScreening.duration}
                onChange={(e) => updateStage('techScreening', { duration: e.target.value })}
                placeholder="30"
              />
            </Flex>

            <Flex direction="column" gap="1">
              <Text size="2" weight="bold" style={{ color: 'var(--gray-11)' }}>
                Заголовок инвайтов
              </Text>
              <TextField.Root
                value={stages.techScreening.inviteTitle}
                onChange={(e) => updateStage('techScreening', { inviteTitle: e.target.value })}
                placeholder="JS Tech Screening |"
              />
            </Flex>

            <Flex direction="column" gap="1">
              <Text size="2" weight="bold" style={{ color: 'var(--gray-11)' }}>
                Сопровождающий текст
              </Text>
              <TextArea
                value={stages.techScreening.accompanyingText}
                onChange={(e) => updateStage('techScreening', { accompanyingText: e.target.value })}
                placeholder="Попрошу быть с камерой..."
                rows={6}
              />
            </Flex>

            <Flex direction="column" gap="1">
              <Text size="2" weight="bold" style={{ color: 'var(--gray-11)' }}>
                → Назначить этап
              </Text>
              <Select.Root
                value={stages.techScreening.assignStage}
                onValueChange={(value) => updateStage('techScreening', { assignStage: value })}
              >
                <Select.Trigger />
                <Select.Content>
                  <Select.Item value="HR Screening">HR Screening</Select.Item>
                  <Select.Item value="Tech Screening">Tech Screening</Select.Item>
                  <Select.Item value="Tech Interview">Tech Interview</Select.Item>
                  <Select.Item value="Final Interview">Final Interview</Select.Item>
                </Select.Content>
              </Select.Root>
            </Flex>
          </Flex>
        </Box>

        {/* Tech Interview */}
        <Box className={styles.stageCard}>
          <Flex align="center" gap="2" mb="3" className={styles.stageHeader}>
            <VideoIcon width={20} height={20} />
            <Text size="4" weight="bold">{stages.techInterview.name}</Text>
          </Flex>

          <Flex direction="column" gap="3">
            <Flex direction="column" gap="1">
              <Text size="2" weight="bold" style={{ color: 'var(--gray-11)' }}>
                Длительность (мин)
              </Text>
              <TextField.Root
                type="number"
                value={stages.techInterview.duration}
                onChange={(e) => updateStage('techInterview', { duration: e.target.value })}
                placeholder="90"
              />
            </Flex>

            <Flex direction="column" gap="1">
              <Text size="2" weight="bold" style={{ color: 'var(--gray-11)' }}>
                Заголовок инвайтов
              </Text>
              <TextField.Root
                value={stages.techInterview.inviteTitle}
                onChange={(e) => updateStage('techInterview', { inviteTitle: e.target.value })}
                placeholder="JS Final Interview |"
              />
            </Flex>

            <Flex direction="column" gap="1">
              <Text size="2" weight="bold" style={{ color: 'var(--gray-11)' }}>
                Сопровождающий текст
              </Text>
              <TextArea
                value={stages.techInterview.accompanyingText}
                onChange={(e) => updateStage('techInterview', { accompanyingText: e.target.value })}
                placeholder="Попрошу быть с камерой..."
                rows={6}
              />
            </Flex>

            <Flex direction="column" gap="1">
              <Text size="2" weight="bold" style={{ color: 'var(--gray-11)' }}>
                → Назначить этап
              </Text>
              <Select.Root
                value={stages.techInterview.assignStage}
                onValueChange={(value) => updateStage('techInterview', { assignStage: value })}
              >
                <Select.Trigger />
                <Select.Content>
                  <Select.Item value="HR Screening">HR Screening</Select.Item>
                  <Select.Item value="Tech Screening">Tech Screening</Select.Item>
                  <Select.Item value="Tech Interview">Tech Interview</Select.Item>
                  <Select.Item value="Final Interview">Final Interview</Select.Item>
                </Select.Content>
              </Select.Root>
            </Flex>
          </Flex>
        </Box>
      </Flex>
    </Box>
  )
}
