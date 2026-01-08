'use client'

import { Box, Text, Flex } from "@radix-ui/themes"
import { ChevronRightIcon } from "@radix-ui/react-icons"
import styles from './WikiDetailSidebar.module.css'

interface WikiDetailSidebarProps {
  pageId: string
  sections: Array<{ title: string }>
}

export default function WikiDetailSidebar({ pageId, sections }: WikiDetailSidebarProps) {
  const handleSectionClick = (sectionTitle: string) => {
    // Прокрутка к разделу при клике
    const element = document.getElementById(`section-${sectionTitle.replace(/\s+/g, '-').toLowerCase()}`)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <Box className={styles.sidebar}>
      <Text size="3" weight="bold" className={styles.sidebarTitle}>
        Содержание
      </Text>
      
      <Flex direction="column" gap="1" mt="3" className={styles.contentList}>
        {sections.map((section, index) => (
          <Flex
            key={index}
            align="center"
            gap="2"
            className={styles.contentItem}
            style={{ cursor: 'pointer' }}
            onClick={() => handleSectionClick(section.title)}
          >
            <Text size="2" style={{ flex: 1, color: 'var(--gray-11)' }}>
              {section.title}
            </Text>
            <ChevronRightIcon width={14} height={14} style={{ color: 'var(--gray-9)', opacity: 0.7 }} />
          </Flex>
        ))}
      </Flex>
    </Box>
  )
}
