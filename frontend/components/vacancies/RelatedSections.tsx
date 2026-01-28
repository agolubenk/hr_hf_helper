'use client'

import { Box, Flex, Text, Button } from "@radix-ui/themes"
import { ClipboardIcon, Link2Icon, QuestionMarkCircledIcon, OpenInNewWindowIcon } from "@radix-ui/react-icons"
import styles from './RelatedSections.module.css'

interface RelatedSectionsProps {
  scorecard: {
    title: string
    link: string
  }
  vacancyLinks: {
    belarus: string
    poland: string
  }
  interviewQuestions: {
    belarus: string[]
    poland: string[]
  }
}

export default function RelatedSections({
  scorecard,
  vacancyLinks,
  interviewQuestions
}: RelatedSectionsProps) {
  return (
    <Flex direction="column" gap="4">
      {/* Scorecard */}
      <Box className={styles.sectionCard}>
        <Flex align="center" gap="2" mb="3" className={styles.sectionHeader}>
          <ClipboardIcon width={20} height={20} />
          <Text size="5" weight="bold">Scorecard</Text>
        </Flex>
        <Flex direction="column" gap="2">
          <Flex gap="4" wrap="wrap">
            <Flex align="center" gap="2" style={{ flex: '1 1 calc(50% - 8px)', minWidth: '300px' }}>
              <Text size="2" weight="bold">Заголовок Scorecard: | {scorecard.title}</Text>
            </Flex>
            <Flex align="center" gap="2" style={{ flex: '1 1 calc(50% - 8px)', minWidth: '300px' }}>
              <Text size="2" weight="bold">Ссылка на Scorecard:</Text>
              <Button size="2" variant="soft" className={styles.openButton}>
                Открыть
                <OpenInNewWindowIcon width={14} height={14} />
              </Button>
            </Flex>
          </Flex>
        </Flex>
      </Box>

      {/* Links to Vacancies by Country */}
      <Box id="vacancy-links" className={styles.sectionCard}>
        <Flex align="center" gap="2" mb="3" className={styles.sectionHeader}>
          <Link2Icon width={20} height={20} />
          <Text size="5" weight="bold">Ссылки на вакансии по странам</Text>
        </Flex>
        <Flex gap="4" wrap="wrap">
          <Flex align="center" gap="2" wrap="nowrap" style={{ flex: '1 1 calc(50% - 8px)', minWidth: '300px' }}>
            <Text size="2" weight="bold">
              Ссылка <span className={styles.mobileHidden}>на вакансию</span> (Беларусь):
            </Text>
            <Button size="2" variant="soft" className={styles.openButton}>
              Открыть
              <OpenInNewWindowIcon width={14} height={14} />
            </Button>
          </Flex>
          <Flex align="center" gap="2" wrap="nowrap" style={{ flex: '1 1 calc(50% - 8px)', minWidth: '300px' }}>
            <Text size="2" weight="bold">
              Ссылка <span className={styles.mobileHidden}>на вакансию</span> (Польша):
            </Text>
            <Button size="2" variant="soft" className={styles.openButton}>
              Открыть
              <OpenInNewWindowIcon width={14} height={14} />
            </Button>
          </Flex>
        </Flex>
      </Box>

      {/* Interview Questions */}
      <Box id="interview-questions" className={styles.sectionCard}>
        <Flex align="center" gap="2" mb="3" className={styles.sectionHeader}>
          <QuestionMarkCircledIcon width={20} height={20} />
          <Text size="5" weight="bold">Вопросы для интервью</Text>
        </Flex>
        <Flex gap="4" wrap="wrap" className={styles.questionsContainer}>
          <Box className={styles.questionsColumn}>
            <Text size="3" weight="bold" mb="3" style={{ display: 'block' }}>Вопросы для Беларуси:</Text>
            <Box className={styles.questionsContent}>
              <Text size="2" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                {interviewQuestions.belarus.join('\n')}
              </Text>
            </Box>
          </Box>
          <Box className={styles.questionsColumn}>
            <Text size="3" weight="bold" mb="3" style={{ display: 'block' }}>Вопросы для Польши:</Text>
            <Box className={styles.questionsContent}>
              <Text size="2" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                {interviewQuestions.poland.join('\n')}
              </Text>
            </Box>
          </Box>
        </Flex>
      </Box>

    </Flex>
  )
}
