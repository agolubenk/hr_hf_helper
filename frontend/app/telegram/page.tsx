'use client'

import AppLayout from '@/components/AppLayout'
import { Box, Flex, Text, Button, TextField, Separator } from '@radix-ui/themes'
import { useState } from 'react'
import styles from './telegram.module.css'

/** Детерминированный паттерн, напоминающий QR: углы 7×7, полоса, часть ячеек */
function getQrPattern(): boolean[][] {
  const n = 21
  const m: boolean[][] = Array(n)
    .fill(0)
    .map(() => Array(n).fill(false))
  // Углы 7×7 (как finder pattern в QR)
  const corners = [
    [0, 0],
    [0, n - 7],
    [n - 7, 0],
  ]
  corners.forEach(([r, c]) => {
    for (let i = 0; i < 7; i++)
      for (let j = 0; j < 7; j++) {
        m[r + i][c + j] = true
      }
  })
  // Внутренний «белый» в finder (упрощённо — вырежем 1,1-5,5 в левом верхнем)
  for (let i = 2; i < 5; i++)
    for (let j = 2; j < 5; j++) m[i][j] = false
  // Timing pattern — линия по 6-й строке и 6-му столбцу
  for (let k = 0; k < n; k++) {
    m[6][k] = k % 2 === 0
    m[k][6] = k % 2 === 0
  }
  // Доп. заполнение для «плотности»
  for (let i = 8; i < n; i++)
    for (let j = 8; j < n; j++) {
      if (i !== 6 && j !== 6 && (i + j) % 3 === 0) m[i][j] = true
    }
  for (let i = 0; i < 6; i++)
    for (let j = 8; j < n; j++) {
      if (j !== 6 && (i * 2 + j) % 5 === 0) m[i][j] = true
    }
  for (let i = 8; i < n; i++)
    for (let j = 0; j < 6; j++) {
      if (i !== 6 && (i + j * 2) % 5 === 1) m[i][j] = true
    }
  return m
}

const QR_PATTERN = getQrPattern()

export default function TelegramLoginPage() {
  // Номер телефона для входа
  const [phoneNumber, setPhoneNumber] = useState('')

  /**
   * handlePhoneInput - обработчик ввода номера телефона
   * 
   * Функциональность:
   * - Разрешает ввод только цифр, круглых скобок и знака +
   * - Фильтрует недопустимые символы
   * 
   * @param value - введенное значение
   */
  const handlePhoneInput = (value: string) => {
    // Разрешаем только цифры, круглые скобки и знак +
    const filtered = value.replace(/[^0-9()+]/g, '')
    setPhoneNumber(filtered)
  }

  /**
   * handlePhoneLogin - обработчик входа по номеру телефона
   * 
   * Функциональность:
   * - Отправляет запрос на вход по номеру телефона
   * - TODO: Реализовать интеграцию с Telegram API
   */
  const handlePhoneLogin = () => {
    if (!phoneNumber.trim()) return
    // TODO: Реализовать вход по номеру телефона через Telegram API
    console.log('Вход по номеру телефона:', phoneNumber)
  }

  return (
    <AppLayout pageTitle="Telegram — Вход">
      <Box className={styles.container}>
        <Box className={styles.card}>
          <Text size="4" weight="bold" style={{ display: 'block', marginBottom: 8 }}>
            Вход в Telegram
          </Text>
          <Text size="2" color="gray" style={{ marginBottom: 16, display: 'block' }}>
            Откройте Telegram на телефоне, перейдите в «Устройства» → «Подключить устройство» и отсканируйте QR-код.
          </Text>

          <Flex justify="center">
            <Box className={styles.qrWrap}>
              <div className={styles.qrGrid}>
                {QR_PATTERN.flatMap((row, i) =>
                  row.map((filled, j) => (
                    <div
                      key={`${i}-${j}`}
                      className={filled ? styles.qrCell : styles.qrCellEmpty}
                    />
                  ))
                )}
              </div>
            </Box>
          </Flex>

          <Text size="1" color="gray" style={{ textAlign: 'center', display: 'block', marginTop: 8 }}>
            QR-код обновляется каждые 60 секунд
          </Text>

          {/* Разделитель */}
          <Flex align="center" gap="3" my="4">
            <Separator style={{ flex: 1 }} />
            <Text size="2" color="gray">или</Text>
            <Separator style={{ flex: 1 }} />
          </Flex>

          {/* Форма входа по номеру телефона */}
          <Flex direction="column" gap="3" className={styles.phoneLoginForm}>
            <Text size="3" weight="medium" style={{ textAlign: 'center' }}>
              Войти по номеру телефона
            </Text>
            <TextField.Root
              placeholder="+7 (999) 123-45-67"
              value={phoneNumber}
              onChange={(e) => handlePhoneInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handlePhoneLogin()
                }
              }}
              style={{ width: '100%' }}
            />
            <Button 
              onClick={handlePhoneLogin}
              disabled={!phoneNumber.trim()}
              style={{ width: '100%' }}
            >
              Войти
            </Button>
          </Flex>
        </Box>
      </Box>
    </AppLayout>
  )
}
