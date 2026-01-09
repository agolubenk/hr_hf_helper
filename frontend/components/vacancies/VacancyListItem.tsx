'use client'

import { Box, Flex, Text, Button } from "@radix-ui/themes"
import { PersonIcon, ExclamationTriangleIcon, EyeOpenIcon, Pencil1Icon, PlayIcon } from "@radix-ui/react-icons"
import styles from './VacancyListItem.module.css'

interface Vacancy {
  id: number
  title: string
  status: 'active' | 'inactive'
  recruiter: string
  technologies: string[]
  interviewers: number
  date: string | null
  hasWarning: boolean
  warningText?: string
}

interface VacancyListItemProps {
  vacancy: Vacancy
  onClick?: () => void
}

export default function VacancyListItem({ vacancy, onClick }: VacancyListItemProps) {
  return (
    <Box className={styles.vacancyListItem} onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      <Flex justify="between" align="center" gap="4">
        {/* Левая часть - информация */}
        <Flex direction="column" gap="2" style={{ flex: 1 }}>
          <Flex align="center" gap="3">
            <Text size="4" weight="bold" style={{ color: 'var(--accent-11)' }}>
              {vacancy.title}
            </Text>
            <Box 
              className={`${styles.statusTag} ${vacancy.status === 'active' ? styles.statusActive : styles.statusInactive}`}
            >
              <Text size="1" weight="bold">
                {vacancy.status === 'active' ? 'Активна' : 'Неактивна'}
              </Text>
            </Box>
            <Text size="2" style={{ color: 'var(--gray-11)' }}>
              # {vacancy.id}
            </Text>
          </Flex>

          <Flex align="center" gap="4" wrap="wrap">
            <Flex align="center" gap="2">
              <PersonIcon width={16} height={16} />
              <Text size="2">• {vacancy.recruiter}</Text>
            </Flex>

            {vacancy.technologies.length > 0 && (
              <Flex align="center" gap="2">
                <Text size="2" style={{ color: 'var(--gray-11)' }}>
                  {'</>'} Технологии:
                </Text>
                <Flex gap="1" wrap="wrap">
                  {vacancy.technologies.map((tech, index) => (
                    <Box key={index} className={styles.techTag}>
                      <Text size="1">{tech}</Text>
                    </Box>
                  ))}
                </Flex>
              </Flex>
            )}

            <Flex align="center" gap="2">
              <Box style={{ width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                👥
              </Box>
              <Text size="2">{vacancy.interviewers} интервьюеров</Text>
            </Flex>


            {vacancy.hasWarning && (
              <Flex align="center" gap="2">
                <ExclamationTriangleIcon width={16} height={16} style={{ color: '#f59e0b' }} />
                <Text size="2" style={{ color: '#f59e0b' }}>
                  {vacancy.warningText}
                </Text>
              </Flex>
            )}
          </Flex>
        </Flex>

        {/* Правая часть - кнопки действий */}
        <Flex gap="1" className={styles.actionButtons}>
          <Button variant="ghost" size="1" className={styles.actionButton}>
            <EyeOpenIcon width={16} height={16} />
          </Button>
          <Button variant="ghost" size="1" className={styles.actionButton}>
            <Pencil1Icon width={16} height={16} />
          </Button>
          <Button variant="ghost" size="1" className={styles.actionButton}>
            <PlayIcon width={16} height={16} />
          </Button>
        </Flex>
      </Flex>
    </Box>
  )
}
