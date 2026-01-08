'use client'

import { Flex, Box, Text, Button } from "@radix-ui/themes"
import { ArrowLeftIcon, Pencil1Icon } from "@radix-ui/react-icons"
import { useRouter, useParams } from "next/navigation"
import styles from './WikiDetailHeader.module.css'

interface WikiDetailHeaderProps {
  title: string
  category: string
  tags: string[]
}

export default function WikiDetailHeader({ title, category, tags }: WikiDetailHeaderProps) {
  const router = useRouter()
  const params = useParams()

  return (
    <Box className={styles.detailHeader}>
      {/* Хлебные крошки */}
      <Flex align="center" gap="2" mb="2" className={styles.breadcrumbs}>
        <Text size="2" color="gray" style={{ cursor: 'pointer' }} onClick={() => router.push('/wiki')}>
          Вики
        </Text>
        <Text size="2" color="gray">/</Text>
        <Text size="2" color="gray">{category}</Text>
        <Text size="2" color="gray">/</Text>
        <Text size="2" color="gray">{title}</Text>
      </Flex>

      {/* Заголовок страницы с кнопками */}
      <Flex align="center" justify="between" className={styles.headerContent}>
        <Box>
          <Text size="6" weight="bold" className={styles.pageTitle}>
            {title}
          </Text>
          <Flex gap="2" wrap="wrap" mt="2">
            {tags.map((tag, index) => (
              <Box
                key={index}
                className={styles.tag}
                style={{
                  backgroundColor: tag.startsWith('#') ? '#ef4444' : 'var(--gray-5)',
                  color: tag.startsWith('#') ? '#ffffff' : 'var(--gray-11)',
                }}
              >
                <Text size="1" weight="medium">
                  {tag}
                </Text>
              </Box>
            ))}
          </Flex>
        </Box>
        
        <Flex gap="2" align="center">
          <Button
            size="3"
            variant="soft"
            style={{
              backgroundColor: 'var(--gray-3)',
              color: 'var(--gray-11)',
            }}
            onClick={() => router.push('/wiki')}
          >
            <ArrowLeftIcon width={16} height={16} />
            Вернуться к списку
          </Button>
          
          <Button
            size="3"
            style={{
              backgroundColor: 'var(--accent-9)',
              color: '#ffffff',
              border: '1px solid #ffffff',
            }}
            onClick={() => router.push(`/wiki/${params.id}/edit`)}
          >
            <Pencil1Icon width={16} height={16} />
            Редактировать
          </Button>
        </Flex>
      </Flex>
    </Box>
  )
}
