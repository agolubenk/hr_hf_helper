'use client'

import { Box, Text, Flex } from "@radix-ui/themes"
import styles from './WikiDetailContent.module.css'

interface ContentSection {
  title: string
  content?: string
  items?: string[]
  subsections?: Array<{ title: string; items: string[] }>
}

interface WikiDetailContentProps {
  content: {
    heading: string
    sections: ContentSection[]
  }
}

export default function WikiDetailContent({ content }: WikiDetailContentProps) {
  return (
    <Box className={styles.content}>
      <Text size="6" weight="bold" className={styles.mainHeading}>
        {content.heading}
      </Text>
      
      {content.sections.map((section, index) => {
        const sectionId = section.title 
          ? `section-${section.title.replace(/\s+/g, '-').toLowerCase()}` 
          : `section-${index}`
        return (
          <Box key={index} id={sectionId} className={styles.section}>
            {section.title && (
              <Text size="4" weight="bold" className={styles.sectionTitle}>
                {section.title}
              </Text>
            )}
            
            {section.content && (
              <Text size="3" className={styles.sectionContent}>
                {section.content}
              </Text>
            )}
            
            {section.items && (
              <ul className={styles.itemsList}>
                {section.items.map((item, itemIndex) => (
                  <li key={itemIndex} className={styles.listItem}>
                    <Text size="3">{item}</Text>
                  </li>
                ))}
              </ul>
            )}
            
            {section.subsections && section.subsections.map((subsection, subIndex) => (
              <Box key={subIndex} className={styles.subsection}>
                <Text size="3" weight="medium" className={styles.subsectionTitle}>
                  {subsection.title}
                </Text>
                {subsection.items && (
                  <ul className={styles.itemsList}>
                    {subsection.items.map((item, itemIndex) => (
                      <li key={itemIndex} className={styles.listItem}>
                        <Text size="3">{item}</Text>
                      </li>
                    ))}
                  </ul>
                )}
              </Box>
            ))}
          </Box>
        )
      })}
    </Box>
  )
}
