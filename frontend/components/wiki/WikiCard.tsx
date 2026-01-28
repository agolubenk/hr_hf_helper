'use client'

import { Box, Text, Flex } from "@radix-ui/themes"
import { ClockIcon, OpenInNewWindowIcon } from "@radix-ui/react-icons"
import { useRouter } from "next/navigation"
import styles from './WikiCard.module.css'

interface WikiPage {
  id: string
  title: string
  description: string
  tags: string[]
  date: string
  category: string
}

interface WikiCardProps {
  page: WikiPage
}

// Цвета для тегов (соответствуют цветам из фильтров)
const tagColors: Record<string, string> = {
  '#ai': '#ef4444',
  '#architect': '#ef4444',
  '#вакансии': '#ef4444',
  '#интеграции': '#84cc16',
  '#интервьюеры': '#10b981',
  '#использование': '#10b981',
  '#календарь': '#a855f7',
  '#метрики': '#f59e0b',
  '#настройка': '#3b82f6',
  '#пользователи': '#6b7280',
  '#финансы': '#06b6d4',
}

export default function WikiCard({ page }: WikiCardProps) {
  const router = useRouter()
  // Первая страница в категории "Архитектура" должна быть выделена
  const isHighlighted = page.category === 'Архитектура' && page.id === '1'
  
  const handleClick = () => {
    router.push(`/wiki/${page.id}`)
  }
  
  return (
    <Box 
      className={`${styles.card} ${isHighlighted ? styles.highlighted : ''}`}
      onClick={handleClick}
    >
      <Text size="4" weight="bold" className={styles.cardTitle}>
        {page.title}
      </Text>
      
      <Flex gap="2" wrap="wrap" my="2">
        {page.tags.map((tag, index) => (
          <Box
            key={index}
            className={styles.tag}
            style={{
              backgroundColor: tagColors[tag.toLowerCase()] || 'var(--gray-5)',
              color: '#ffffff',
            }}
          >
            <Text size="1" weight="medium">
              {tag}
            </Text>
          </Box>
        ))}
      </Flex>
      
      <Text size="2" color="gray" className={styles.description}>
        {page.description}
      </Text>
      
      <Flex align="center" justify="between" mt="3" className={styles.cardFooter}>
        <Flex align="center" gap="2">
          <ClockIcon width={14} height={14} style={{ color: 'var(--gray-9)' }} />
          <Text size="1" color="gray">
            {page.date}
          </Text>
        </Flex>
        
        <Box className={styles.openIcon}>
          <OpenInNewWindowIcon width={16} height={16} style={{ color: 'var(--gray-9)' }} />
        </Box>
      </Flex>
    </Box>
  )
}
