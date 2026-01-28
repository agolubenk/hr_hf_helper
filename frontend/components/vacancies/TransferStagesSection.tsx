'use client'

import { Box, Flex, Text, Button } from "@radix-ui/themes"
import { 
  PersonIcon, 
  VideoIcon,
  Link2Icon, 
  QuestionMarkCircledIcon, 
  ClipboardIcon
} from "@radix-ui/react-icons"
import styles from './TransferStagesSection.module.css'

interface Stage {
  name: string
  assignStage?: string
  duration?: string
  inviteTitle?: string
  accompanyingText?: string
  forInterviewers?: string
  relatedSections?: Array<{ name: string; icon: string }>
}

interface TransferStagesSectionProps {
  stages: {
    hrScreening: Stage
    techScreening: Stage
    techInterview: Stage
  }
}

export default function TransferStagesSection({ stages }: TransferStagesSectionProps) {
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
              <Text size="2">
                <Text weight="bold">Назначить этап:</Text> {stages.hrScreening.assignStage}
              </Text>
            </Flex>

            {stages.hrScreening.relatedSections && (
              <>
                <Flex align="center" gap="2" mb="2">
                  <Link2Icon width={16} height={16} />
                  <Text size="3" weight="bold">Связанные разделы</Text>
                </Flex>
                <Flex direction="column" gap="2">
                  {stages.hrScreening.relatedSections.map((section, index) => {
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
                      <Button
                        key={index}
                        size="2"
                        variant="soft"
                        className={styles.relatedSectionButton}
                        onClick={() => scrollToSection(section.name)}
                      >
                        {section.icon === 'globe' && <Link2Icon width={14} height={14} />}
                        {section.icon === 'question' && <QuestionMarkCircledIcon width={14} height={14} />}
                        {section.icon === 'money' && <Box style={{ fontSize: '14px' }}>💰</Box>}
                        {section.icon === 'prompt' && <ClipboardIcon width={14} height={14} />}
                        {section.icon === 'interviewers' && <PersonIcon width={14} height={14} />}
                        {section.name}
                      </Button>
                    )
                  })}
                </Flex>
              </>
            )}
          </Flex>
        </Box>

        {/* Tech Screening */}
        <Box className={styles.stageCard}>
          <Flex align="center" gap="2" mb="3" className={styles.stageHeader}>
            <ClipboardIcon width={20} height={20} />
            <Text size="4" weight="bold">{stages.techScreening.name}</Text>
          </Flex>

          <Flex direction="column" gap="3">
            <Flex direction="column" gap="1">
              <Text size="2" weight="bold">Длительность: {stages.techScreening.duration}</Text>
            </Flex>

            <Flex direction="column" gap="1">
              <Text size="2" weight="bold">Заголовок инвайтов: {stages.techScreening.inviteTitle}</Text>
            </Flex>

            <Flex direction="column" gap="1">
              <Text size="2" weight="bold">Сопровождающий текст:</Text>
              <Box className={styles.quoteBox}>
                <Text size="2" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                  {stages.techScreening.accompanyingText}
{'\n---\nДля интервьюеров'}
                </Text>
              </Box>
            </Flex>

            <Flex direction="column" gap="1">
              <Text size="2" weight="bold">Назначить этап: {stages.techScreening.assignStage}</Text>
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
              <Text size="2" weight="bold">Длительность: {stages.techInterview.duration}</Text>
            </Flex>

            <Flex direction="column" gap="1">
              <Text size="2" weight="bold">Заголовок инвайтов: {stages.techInterview.inviteTitle}</Text>
            </Flex>

            <Flex direction="column" gap="1">
              <Text size="2" weight="bold">Сопровождающий текст:</Text>
              <Box className={styles.quoteBox}>
                <Text size="2" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                  {stages.techInterview.accompanyingText}
{'\n---\nДля интервьюеров'}
                </Text>
              </Box>
            </Flex>

            <Flex direction="column" gap="1">
              <Text size="2">
                <Text weight="bold">Назначить этап:</Text> {stages.techInterview.assignStage}
              </Text>
            </Flex>
          </Flex>
        </Box>
      </Flex>
    </Box>
  )
}
