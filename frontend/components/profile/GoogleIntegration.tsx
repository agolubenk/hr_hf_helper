'use client'

import { Box, Text, Flex, Button } from "@radix-ui/themes"
import { CheckIcon } from "@radix-ui/react-icons"
import styles from './GoogleIntegration.module.css'

// Простая SVG иконка для переподключения
const ReloadIcon = ({ width = 16, height = 16 }: { width?: number; height?: number }) => (
  <svg width={width} height={height} viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M1.84998 7.49998C1.84998 4.66458 4.05979 1.84998 7.49998 1.84998C10.2783 1.84998 11.6515 3.9064 12.2367 5H10.5C10.2239 5 10 5.22386 10 5.5C10 5.77614 10.2239 6 10.5 6H13.5C13.7761 6 14 5.77614 14 5.5V2.5C14 2.22386 13.7761 2 13.5 2C13.2239 2 13 2.22386 13 2.5V4.31318C12.2955 3.07126 10.6659 0.849976 7.49998 0.849976C3.43716 0.849976 0.849976 4.18537 0.849976 7.49998C0.849976 10.8146 3.43716 14.15 7.49998 14.15C9.44382 14.15 11.0622 13.3808 12.2145 12.2084C12.8315 11.5806 13.3133 10.839 13.6418 10.0407C13.7469 9.78536 13.6251 9.49315 13.3698 9.38806C13.1144 9.28296 12.8222 9.40478 12.7171 9.66014C12.4363 10.3425 12.0251 10.9745 11.5013 11.5074C10.5295 12.4963 9.16504 13.15 7.49998 13.15C4.05979 13.15 1.84998 10.3354 1.84998 7.49998Z"
      fill="currentColor"
      fillRule="evenodd"
      clipRule="evenodd"
    />
  </svg>
)

interface GoogleIntegrationProps {
  isConnected: boolean
  tokenStatus: string
  email: string
  name: string
}

export default function GoogleIntegration({
  isConnected,
  tokenStatus,
  email,
  name
}: GoogleIntegrationProps) {
  return (
    <Box className={styles.integrationBlock}>
      {/* Заголовок */}
      <Box className={styles.header}>
        <Flex align="center" gap="2">
          <Box className={styles.googleIcon}>
            <Text size="6" weight="bold" style={{ color: 'white' }}>
              G
            </Text>
          </Box>
          <Text size="4" weight="bold">
            Google интеграция
          </Text>
        </Flex>
      </Box>

      {/* Содержимое */}
      <Box className={styles.content}>
        <Flex gap="4" align="start">
          {/* Логотип Google */}
          <Box className={styles.googleLogo}>
            <Text size="9" weight="bold" style={{ color: '#ea4335' }}>
              G
            </Text>
          </Box>

          {/* Информация */}
          <Flex direction="column" gap="3" style={{ flex: 1 }}>
            {/* Статус подключения */}
            <Flex align="center" gap="2">
              <CheckIcon width={16} height={16} style={{ color: 'var(--green-9)' }} />
              <Text size="3">
                Google API подключен
              </Text>
            </Flex>

            {/* Статус токена */}
            <Flex align="center" gap="2">
              <CheckIcon width={16} height={16} style={{ color: 'var(--green-9)' }} />
              <Text size="3">
                Статус токена: {tokenStatus}
              </Text>
            </Flex>

            {/* Email */}
            <Text size="2" color="gray">
              Email: {email}
            </Text>

            {/* Имя */}
            <Text size="2" color="gray">
              Имя: {name}
            </Text>
          </Flex>

          {/* Кнопка переподключения */}
          <Button 
            size="3" 
            variant="soft"
            style={{ 
              backgroundColor: 'var(--yellow-9)',
              color: 'var(--gray-12)',
              alignSelf: 'flex-start'
            }}
          >
            <ReloadIcon width={16} height={16} />
            Переподключить Google
          </Button>
        </Flex>
      </Box>
    </Box>
  )
}
