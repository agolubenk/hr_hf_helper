'use client'

import { Flex, Box, Text } from "@radix-ui/themes"
import WikiCard from "./WikiCard"
import styles from './WikiCategory.module.css'

interface WikiPage {
  id: string
  title: string
  description: string
  tags: string[]
  date: string
  category: string
}

interface WikiCategoryProps {
  category: string
  pages: WikiPage[]
}

export default function WikiCategory({ category, pages }: WikiCategoryProps) {
  return (
    <Box className={styles.category}>
      <Flex align="center" gap="2" mb="3" className={styles.categoryHeader}>
        <Box style={{ width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Text size="2" style={{ color: 'var(--gray-11)' }}>📁</Text>
        </Box>
        <Text size="4" weight="bold">
          {category}
        </Text>
      </Flex>
      
      <Flex gap="3" wrap="wrap" className={styles.cardsGrid}>
        {pages.map((page) => (
          <WikiCard key={page.id} page={page} />
        ))}
      </Flex>
    </Box>
  )
}
