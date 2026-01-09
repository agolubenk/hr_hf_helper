'use client'

import { Box, Flex, Text, Button } from "@radix-ui/themes"
import { InfoCircledIcon, OpenInNewWindowIcon } from "@radix-ui/react-icons"
import styles from './BasicInfoSection.module.css'

interface Vacancy {
  id: number
  title: string
  status: 'active' | 'inactive'
  recruiter: string
  technologies: string[]
  huntflowId: string
}

interface BasicInfoSectionProps {
  vacancy: Vacancy
}

export default function BasicInfoSection({ vacancy }: BasicInfoSectionProps) {
  return (
    <Box className={styles.basicInfoCard}>
      <Flex align="center" gap="2" mb="4" className={styles.header}>
        <Box className={styles.iconCircle}>
          <InfoCircledIcon width={16} height={16} />
        </Box>
        <Text size="5" weight="bold">Основная информация</Text>
      </Flex>

      <Flex gap="4" wrap="wrap">
        {/* Первый столбец */}
        <Flex direction="column" gap="3" style={{ flex: '1 1 calc(50% - 8px)', minWidth: '300px' }}>
          <Flex direction="column" gap="1">
            <Text size="2" weight="bold" style={{ color: 'var(--gray-11)' }}>Название:</Text>
            <Text size="3">{vacancy.title}</Text>
          </Flex>

          <Flex direction="column" gap="1">
            <Text size="2" weight="bold" style={{ color: 'var(--gray-11)' }}>ID для связи:</Text>
            <Flex align="center" gap="3">
              <Text size="3">{vacancy.huntflowId}</Text>
              <Button size="2" variant="soft" className={styles.huntflowButton}>
                Huntflow
                <OpenInNewWindowIcon width={14} height={14} />
              </Button>
            </Flex>
          </Flex>

          <Flex direction="column" gap="1">
            <Text size="2" weight="bold" style={{ color: 'var(--gray-11)' }}>Ответственный рекрутер:</Text>
            <Text size="3">{vacancy.recruiter}</Text>
          </Flex>
        </Flex>

        {/* Второй столбец */}
        <Flex direction="column" gap="3" style={{ flex: '1 1 calc(50% - 8px)', minWidth: '300px' }}>
          <Flex direction="column" gap="2">
            <Text size="2" weight="bold" style={{ color: 'var(--gray-11)' }}>Технологии:</Text>
            <Flex gap="2" wrap="wrap">
              {vacancy.technologies.map((tech, index) => (
                <Box key={index} className={styles.techTag}>
                  <Text size="2">{'</>'} {tech}</Text>
                </Box>
              ))}
            </Flex>
          </Flex>

          <Flex direction="column" gap="1">
            <Text size="2" weight="bold" style={{ color: 'var(--gray-11)' }}>Статус:</Text>
            <Flex align="center" gap="2">
              <Box 
                className={`${styles.statusDot} ${vacancy.status === 'active' ? styles.statusActive : styles.statusInactive}`}
              />
              <Text size="3" weight="bold">
                {vacancy.status === 'active' ? 'Активна' : 'Неактивна'}
              </Text>
            </Flex>
          </Flex>
        </Flex>
      </Flex>
    </Box>
  )
}
