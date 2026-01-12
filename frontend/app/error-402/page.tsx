'use client'

import { Box, Flex, Text, Button } from "@radix-ui/themes"
import { 
  HomeIcon,
  ReloadIcon,
  CrossCircledIcon,
  InfoCircledIcon,
  StarIcon,
  CheckCircledIcon
} from "@radix-ui/react-icons"
import { useRouter } from "next/navigation"
import { useEffect, useRef } from "react"
import AppLayout from "@/components/AppLayout"
import styles from './error-402.module.css'

// Иконки для анимации (требуется оплата)
const paymentIcons = [
  StarIcon,
  CheckCircledIcon,
  CrossCircledIcon,
  InfoCircledIcon,
  StarIcon,
  CheckCircledIcon,
  CrossCircledIcon,
  InfoCircledIcon,
  StarIcon,
  CheckCircledIcon,
  CrossCircledIcon,
  InfoCircledIcon,
  StarIcon,
  CheckCircledIcon,
  CrossCircledIcon,
]

interface FloatingIconProps {
  Icon: React.ComponentType<{ width?: number; height?: number }>
  index: number
}

function FloatingIcon({ Icon, index }: FloatingIconProps) {
  const iconRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!iconRef.current) return

    const speedGroups = [
      { min: 8, max: 12 },
      { min: 12, max: 18 },
      { min: 18, max: 25 },
    ]
    const speedGroup = speedGroups[index % speedGroups.length]
    const duration = speedGroup.min + Math.random() * (speedGroup.max - speedGroup.min)
    
    const delay = Math.random() * 2
    const startX = Math.random() * 100
    const startY = Math.random() * 100
    const amplitudeX = 50 + Math.random() * 70
    const amplitudeY = 50 + Math.random() * 70
    const size = 32 + Math.random() * 21
    const opacity = 0.25 + Math.random() * 0.3

    iconRef.current.style.setProperty('--duration', `${duration}s`)
    iconRef.current.style.setProperty('--delay', `${delay}s`)
    iconRef.current.style.setProperty('--start-x', `${startX}%`)
    iconRef.current.style.setProperty('--start-y', `${startY}%`)
    iconRef.current.style.setProperty('--amplitude-x', `${amplitudeX}px`)
    iconRef.current.style.setProperty('--amplitude-y', `${amplitudeY}px`)
    iconRef.current.style.setProperty('--size', `${size}px`)
    iconRef.current.style.setProperty('--opacity', `${opacity}`)
  }, [index])

  return (
    <div ref={iconRef} className={styles.floatingIcon}>
      <Icon width={32} height={32} />
    </div>
  )
}

export default function Error402Page() {
  const router = useRouter()

  return (
    <AppLayout pageTitle="402 - Требуется оплата">
      <Box className={styles.container}>
        <Box className={styles.background}>
          {Array.from({ length: 35 }).map((_, index) => {
            const Icon = paymentIcons[index % paymentIcons.length]
            return <FloatingIcon key={index} Icon={Icon} index={index} />
          })}
        </Box>

        <Flex direction="column" align="center" justify="center" className={styles.content}>
          <Text size="9" weight="bold" className={styles.errorCode}>
            402
          </Text>
          <Flex align="center" gap="2" mt="4">
            <StarIcon width={32} height={32} className={styles.cardIcon} />
            <Text size="6" weight="bold" className={styles.title}>
              Требуется оплата
            </Text>
          </Flex>
          <Text size="4" color="gray" mt="3" style={{ textAlign: 'center', maxWidth: '500px' }}>
            Для доступа к этому контенту требуется оплата. Пожалуйста, выполните оплату для продолжения.
          </Text>
          <Flex gap="3" mt="6">
            <Button size="3" onClick={() => router.push('/workflow')}>
              <HomeIcon width={16} height={16} />
              На главную
            </Button>
            <Button size="3" variant="soft" onClick={() => router.back()}>
              <ReloadIcon width={16} height={16} />
              Назад
            </Button>
          </Flex>
        </Flex>
      </Box>
    </AppLayout>
  )
}
