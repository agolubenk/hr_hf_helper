'use client'

import AppLayout from '@/components/AppLayout'
import { Box, Flex, Text, TextField, Button } from '@radix-ui/themes'
import Link from 'next/link'
import { useState } from 'react'
import styles from '../telegram.module.css'

export default function Telegram2FAPage() {
  const [password, setPassword] = useState('')

  return (
    <AppLayout pageTitle="Telegram — 2FA">
      <Box className={styles.container}>
        <Flex className={styles.navTabs}>
          <Link href="/telegram" className={styles.navTab}>
            Вход
          </Link>
          <Link href="/telegram/2fa" className={`${styles.navTab} ${styles.navTabActive}`}>
            2FA
          </Link>
          <Link href="/telegram/chats" className={styles.navTab}>
            Чаты
          </Link>
        </Flex>

        <Box className={styles.card} style={{ maxWidth: 400 }}>
          <Text size="4" weight="bold" style={{ display: 'block', marginBottom: 8 }}>
            Двухэтапная аутентификация
          </Text>
          <Text size="2" color="gray" style={{ marginBottom: 24, display: 'block' }}>
            Введите облачный пароль. Он нужен для входа в аккаунт на новых устройствах и отключения 2FA.
          </Text>

          <Box mb="4">
            <Text size="2" weight="medium" color="gray" as="label" style={{ display: 'block', marginBottom: 8 }}>
              Облачный пароль
            </Text>
            <TextField.Root
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Введите пароль"
            />
          </Box>

          <Flex gap="3" wrap="wrap">
            <Button>Подтвердить</Button>
            <Button asChild variant="soft">
              <Link href="/telegram">Отмена</Link>
            </Button>
          </Flex>

          <Text size="1" color="gray" style={{ marginTop: 24, display: 'block' }}>
            Забыли пароль? Восстановление через email, привязанный к аккаунту Telegram.
          </Text>
        </Box>
      </Box>
    </AppLayout>
  )
}
