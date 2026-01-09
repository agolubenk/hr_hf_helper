'use client'

import { Box, Flex, Text, TextField } from "@radix-ui/themes"
import { Link2Icon } from "@radix-ui/react-icons"
import styles from './VacancyLinksEditSection.module.css'

interface VacancyLinksEditSectionProps {
  links: {
    belarus: string
    poland: string
  }
  onChange: (links: VacancyLinksEditSectionProps['links']) => void
}

export default function VacancyLinksEditSection({ links, onChange }: VacancyLinksEditSectionProps) {
  return (
    <Box id="vacancy-links" className={styles.sectionCard}>
      <Flex align="center" gap="2" mb="4" className={styles.header}>
        <Link2Icon width={20} height={20} />
        <Text size="5" weight="bold">Ссылки на вакансии по странам</Text>
      </Flex>

      <Flex gap="4" wrap="wrap">
        <Flex direction="column" gap="1" style={{ flex: '1 1 calc(50% - 8px)', minWidth: '300px' }}>
          <Flex align="center" gap="2" mb="1">
            <Text size="2" style={{ fontSize: '16px' }}>🇧🇾</Text>
            <Text size="2" weight="bold" style={{ color: 'var(--gray-11)' }}>
              Ссылка на вакансию (Беларусь)
            </Text>
          </Flex>
          <TextField.Root
            value={links.belarus}
            onChange={(e) => onChange({ ...links, belarus: e.target.value })}
            placeholder="https://doc.clickup.com/..."
          />
          <Text size="1" style={{ color: 'var(--gray-11)' }}>
            Ссылка на вакансию в Беларуси (например, rabota.by, jobs.tut.by)
          </Text>
        </Flex>

        <Flex direction="column" gap="1" style={{ flex: '1 1 calc(50% - 8px)', minWidth: '300px' }}>
          <Flex align="center" gap="2" mb="1">
            <Text size="2" style={{ fontSize: '16px' }}>🇵🇱</Text>
            <Text size="2" weight="bold" style={{ color: 'var(--gray-11)' }}>
              Ссылка на вакансию (Польша)
            </Text>
          </Flex>
          <TextField.Root
            type="url"
            value={links.poland}
            onChange={(e) => onChange({ ...links, poland: e.target.value })}
            placeholder="https://doc.clickup.com/..."
          />
          <Text size="1" style={{ color: 'var(--gray-11)' }}>
            Ссылка на вакансию в Польше (например, pracuj.pl, nofluffjobs.com)
          </Text>
        </Flex>
      </Flex>
    </Box>
  )
}
