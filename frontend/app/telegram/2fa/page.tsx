/**
 * Telegram2FAPage (telegram/2fa/page.tsx) - Страница настройки двухфакторной аутентификации Telegram
 * 
 * Назначение:
 * - Настройка двухфакторной аутентификации (2FA) для Telegram
 * - Ввод облачного пароля для подтверждения
 * - Отключение 2FA (при необходимости)
 * 
 * Функциональность:
 * - Форма ввода облачного пароля
 * - Кнопка подтверждения для включения/отключения 2FA
 * - Кнопка отмены для возврата на страницу входа
 * - Навигационные вкладки для переключения между разделами Telegram
 * - Информация о восстановлении пароля
 * 
 * Связи:
 * - AppLayout: оборачивает страницу в общий layout
 * - Link: навигация к другим страницам Telegram интеграции
 * - /telegram: страница входа в Telegram
 * - /telegram/chats: страница управления чатами
 * 
 * Поведение:
 * - При загрузке отображает форму ввода облачного пароля
 * - При вводе пароля сохраняет его в состоянии
 * - При клике на "Подтвердить" должен отправлять запрос на сервер для настройки 2FA
 * - При клике на "Отмена" происходит возврат на страницу входа
 * 
 * TODO: Реализовать реальную логику настройки 2FA через Telegram API
 */

'use client'

import AppLayout from '@/components/AppLayout'
import { Box, Flex, Text, TextField, Button } from '@radix-ui/themes'
import Link from 'next/link'
import { useState } from 'react'
import styles from '../telegram.module.css'

/**
 * Telegram2FAPage - компонент страницы настройки 2FA
 * 
 * Состояние:
 * - password: значение поля облачного пароля
 */
export default function Telegram2FAPage() {
  // Состояние формы: облачный пароль для подтверждения 2FA
  const [password, setPassword] = useState('')

  /**
   * Рендер компонента страницы настройки 2FA
   * 
   * Структура:
   * - AppLayout: оборачивает страницу в общий layout
   * - Навигационные вкладки для переключения между разделами
   * - Форма ввода облачного пароля
   * - Кнопки подтверждения и отмены
   */
  return (
    <AppLayout pageTitle="Telegram — 2FA">
      <Box className={styles.container}>
        {/* Карточка с формой настройки 2FA (выровнена по центру) */}
        <Flex justify="center">
          <Box className={styles.card} style={{ maxWidth: 400 }}>
          {/* Заголовок страницы настройки 2FA */}
          <Text size="4" weight="bold" style={{ display: 'block', marginBottom: 8 }}>
            Двухэтапная аутентификация
          </Text>
          {/* Описание назначения облачного пароля */}
          <Text size="2" color="gray" style={{ marginBottom: 24, display: 'block' }}>
            Введите облачный пароль. Он нужен для входа в аккаунт на новых устройствах и отключения 2FA.
          </Text>

          {/* Поле ввода облачного пароля
              - type="password": скрывает вводимый текст
              - value: текущее значение пароля
              - onChange: обновляет состояние password при вводе
              - placeholder: подсказка для пользователя */}
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

          {/* Кнопки действий
              - Подтвердить: отправляет пароль на сервер для настройки 2FA
              - Отмена: возврат на страницу входа
              TODO: Реализовать обработчик подтверждения */}
          <Flex gap="3" wrap="wrap">
            <Button>Подтвердить</Button>
            <Button asChild variant="soft">
              <Link href="/telegram">Отмена</Link>
            </Button>
          </Flex>
          </Box>
        </Flex>
      </Box>
    </AppLayout>
  )
}
