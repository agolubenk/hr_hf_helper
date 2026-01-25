'use client'

import AppLayout from '@/components/AppLayout'
import { Box, Flex, Text, TextField } from '@radix-ui/themes'
import Link from 'next/link'
import { MagnifyingGlassIcon } from '@radix-ui/react-icons'
import styles from '../telegram.module.css'

const MOCK_CHATS = [
  { id: '1', name: 'HR Helper — общий', preview: 'Добро пожаловать в чат', avatar: 'H', date: '10:32' },
  { id: '2', name: 'Рекрутинг', preview: 'Новая заявка по вакансии Frontend', avatar: 'Р', date: '09:15' },
  { id: '3', name: 'Кандидаты', preview: 'Иван: готов к интервью', avatar: 'К', date: 'Вчера' },
  { id: '4', name: 'Поддержка', preview: 'Вопрос по интеграции Huntflow', avatar: 'П', date: 'Вчера' },
]

export default function TelegramChatsPage() {
  return (
    <AppLayout pageTitle="Telegram — Чаты">
      <Box className={styles.container}>
        <Flex className={styles.navTabs}>
          <Link href="/telegram" className={styles.navTab}>
            Вход
          </Link>
          <Link href="/telegram/2fa" className={styles.navTab}>
            2FA
          </Link>
          <Link href="/telegram/chats" className={`${styles.navTab} ${styles.navTabActive}`}>
            Чаты
          </Link>
        </Flex>

        <Box className={styles.card} style={{ maxWidth: 480 }}>
          <Text size="4" weight="bold" style={{ display: 'block', marginBottom: 8 }}>
            Чаты
          </Text>
          <Text size="2" color="gray" style={{ marginBottom: 16, display: 'block' }}>
            Список чатов интеграции Telegram с HR Helper.
          </Text>

          <Box mb="4">
            <TextField.Root placeholder="Поиск по чатам" style={{ paddingLeft: 36 }}>
              <TextField.Slot>
                <MagnifyingGlassIcon width={16} height={16} style={{ color: 'var(--gray-10)' }} />
              </TextField.Slot>
            </TextField.Root>
          </Box>

          <Box className={styles.chatList}>
            {MOCK_CHATS.map((ch) => (
              <Box key={ch.id} className={styles.chatItem}>
                <Box className={styles.chatAvatar}>{ch.avatar}</Box>
                <Box className={styles.chatBody}>
                  <Flex justify="between" align="center" gap="2">
                    <Text size="2" weight="medium" className={styles.chatName}>
                      {ch.name}
                    </Text>
                    <Text size="1" color="gray">
                      {ch.date}
                    </Text>
                  </Flex>
                  <Text size="1" className={styles.chatPreview}>
                    {ch.preview}
                  </Text>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </AppLayout>
  )
}
