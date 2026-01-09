'use client'

import { Flex, Text, Button } from "@radix-ui/themes"
import { FileTextIcon, Pencil1Icon, ArrowLeftIcon } from "@radix-ui/react-icons"
import styles from './VacancyDetailHeader.module.css'

interface VacancyDetailHeaderProps {
  title: string
  onBack: () => void
  onEdit: () => void
}

export default function VacancyDetailHeader({ title, onBack, onEdit }: VacancyDetailHeaderProps) {
  return (
    <Flex justify="between" align="center" className={styles.header}>
      <Flex align="center" gap="3">
        <FileTextIcon width={24} height={24} />
        <Text size="6" weight="bold">{title}</Text>
      </Flex>
      
      <Flex align="center" gap="3">
        <Button size="3" variant="soft" onClick={onEdit} className={styles.editButton}>
          <Pencil1Icon width={16} height={16} />
          Редактировать
        </Button>
        <Button size="3" variant="ghost" onClick={onBack} className={styles.backButton}>
          <ArrowLeftIcon width={16} height={16} />
          Назад к списку
        </Button>
      </Flex>
    </Flex>
  )
}
