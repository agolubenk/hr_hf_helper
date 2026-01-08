'use client'

import { Box, Text, Flex, Grid } from "@radix-ui/themes"
import { PersonIcon, ClockIcon, PaperPlaneIcon, EnvelopeClosedIcon } from "@radix-ui/react-icons"
import styles from './ProfileInfo.module.css'

// SVG иконка LinkedIn
const LinkedInIcon = ({ width = 16, height = 16 }: { width?: number; height?: number }) => (
  <svg width={width} height={height} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M14.2857 0H1.71429C0.767857 0 0 0.767857 0 1.71429V14.2857C0 15.2321 0.767857 16 1.71429 16H14.2857C15.2321 16 16 15.2321 16 14.2857V1.71429C16 0.767857 15.2321 0 14.2857 0ZM4.85714 13.7143H2.28571V6H4.85714V13.7143ZM3.57143 4.85714C2.71429 4.85714 2 4.14286 2 3.28571C2 2.42857 2.71429 1.71429 3.57143 1.71429C4.42857 1.71429 5.14286 2.42857 5.14286 3.28571C5.14286 4.14286 4.42857 4.85714 3.57143 4.85714ZM13.7143 13.7143H11.1429V9.71429C11.1429 8.71429 11.1429 7.42857 9.71429 7.42857C8.28571 7.42857 8.14286 8.57143 8.14286 9.57143V13.7143H5.57143V6H8V7.14286H8.14286C8.42857 6.57143 9.28571 5.85714 10.5714 5.85714C13.1429 5.85714 13.7143 7.57143 13.7143 10.2857V13.7143Z"
      fill="currentColor"
    />
  </svg>
)

interface ProfileInfoProps {
  userData: {
    firstName: string
    lastName: string
    email: string
    telegram?: string
    linkedin?: string
    registrationDate: string
    lastLoginDate: string
    workSchedule: string
    meetingInterval: string
    activeEnvironment: string
  }
}

export default function ProfileInfo({ userData }: ProfileInfoProps) {
  return (
    <Box className={styles.profileInfoBlock}>
      {/* Заголовок */}
      <Box className={styles.header}>
        <Flex align="center" gap="2">
          <PersonIcon width="20" height="20" />
          <Text size="4" weight="bold">
            Информация о профиле
          </Text>
        </Flex>
      </Box>

      {/* Содержимое */}
      <Box className={styles.content}>
        <Grid columns="2" gap="4" width="100%" className={styles.grid}>
          {/* Левая колонка */}
          <Box>
            <InfoRow label="Фамилия:" value={userData.lastName} />
            <InfoRow label="Имя:" value={userData.firstName} />
            <InfoRow 
              label="Email:" 
              value={userData.email}
              icon={<EnvelopeClosedIcon width={16} height={16} />}
            />
            <InfoRow 
              label="Telegram:" 
              value={userData.telegram || 'Не указан'}
              icon={<PaperPlaneIcon width={16} height={16} />}
            />
            <InfoRow 
              label="LinkedIn:" 
              value={userData.linkedin || 'Не указан'}
              icon={<LinkedInIcon width={16} height={16} />}
            />
          </Box>

          {/* Правая колонка */}
          <Box>
            <InfoRow label="Дата регистрации:" value={userData.registrationDate} />
            <InfoRow label="Дата последнего входа:" value={userData.lastLoginDate} />
            <InfoRow label="Рабочий график:" value={userData.workSchedule} />
            <InfoRow 
              label="Время между встречами:" 
              value={userData.meetingInterval}
              icon={<ClockIcon width={16} height={16} />}
            />
            <Box className={styles.environmentRow}>
              <Text size="2" weight="medium" style={{ color: 'var(--gray-11)' }}>
                Активная среда:
              </Text>
              <Box className={styles.environmentBadge}>
                <Text size="2" weight="medium">
                  {userData.activeEnvironment}
                </Text>
              </Box>
            </Box>
          </Box>
        </Grid>
      </Box>
    </Box>
  )
}

function InfoRow({ 
  label, 
  value, 
  icon 
}: { 
  label: string
  value: string
  icon?: React.ReactNode 
}) {
  return (
    <Flex direction="column" gap="1" className={styles.infoRow}>
      <Text size="2" weight="medium" style={{ color: 'var(--gray-11)' }}>
        {label}
      </Text>
      <Flex align="center" gap="2">
        {icon}
        <Text size="3" style={{ color: 'var(--gray-12)' }}>
          {value}
        </Text>
      </Flex>
    </Flex>
  )
}
