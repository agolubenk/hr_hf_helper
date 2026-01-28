'use client'

import { Flex, Box, Text, Button } from "@radix-ui/themes"
import { RocketIcon, PersonIcon, PlusIcon } from "@radix-ui/react-icons"
import { useRouter } from "next/navigation"
import styles from './WikiHeader.module.css'

export default function WikiHeader() {
  const router = useRouter()

  return (
    <Flex align="center" justify="between" className={styles.header}>
      <Text size="7" weight="bold" className={styles.title}>
        Список страниц вики
      </Text>
      
      <Flex gap="2" align="center">
        <Button
          size="3"
          style={{
            backgroundColor: 'var(--accent-9)',
            color: '#ffffff',
          }}
        >
          <RocketIcon width={16} height={16} />
          Быстрый старт
        </Button>
        
        <Button
          size="3"
          style={{
            backgroundColor: '#06b6d4',
            color: '#ffffff',
          }}
        >
          <PersonIcon width={16} height={16} />
          Путеводитель
        </Button>
        
        <Button
          size="3"
          style={{
            backgroundColor: '#2563eb',
            color: '#ffffff',
          }}
          onClick={() => router.push('/wiki/new/edit')}
        >
          <PlusIcon width={16} height={16} />
          Создать страницу
        </Button>
      </Flex>
    </Flex>
  )
}
