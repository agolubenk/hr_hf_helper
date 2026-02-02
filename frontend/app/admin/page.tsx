/**
 * Admin — главная страница раздела админки (Radix UI).
 * Отображение по модулям/приложениям: секции с карточками ссылок.
 */

'use client'

import { Box, Card, Flex, Text, Section } from '@radix-ui/themes'
import Link from 'next/link'
import { ADMIN_MODULES } from './config'
import styles from './admin.module.css'

export default function AdminPage() {
  return (
    <Section size="2">
      <Text as="p" size="6" weight="bold" mb="2">
        Admin CRM
      </Text>
      <Text as="p" size="2" color="gray" mb="6" style={{ maxWidth: '560px' }}>
        Обзор по модулям приложения. Данные загружаются из API и отображаются в едином стиле.
      </Text>

      {ADMIN_MODULES.map((module) => (
        <Box key={module.id} mb="6">
          <Text as="p" size="3" weight="bold" mb="1" style={{ color: 'var(--gray-12)' }}>
            {module.label}
          </Text>
          {module.description && (
            <Text as="p" size="1" color="gray" mb="3">
              {module.description}
            </Text>
          )}
          <Flex gap="3" wrap="wrap">
            {module.items.map((item) => (
              <Link key={item.href} href={item.href} className={styles.cardLink}>
                <Card size="2" className={styles.dashboardCard}>
                  <Text size="2" weight="medium">{item.label}</Text>
                </Card>
              </Link>
            ))}
          </Flex>
        </Box>
      ))}
    </Section>
  )
}
