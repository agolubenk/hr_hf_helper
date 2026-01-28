'use client'

import { Box, Flex, Text, TextField, Switch, Select } from "@radix-ui/themes"
import { InfoCircledIcon } from "@radix-ui/react-icons"
import styles from './BasicInfoEditSection.module.css'

interface BasicInfoEditSectionProps {
  data: {
    title: string
    status: 'active' | 'inactive'
    recruiter: string
    technologies: string
    huntflowId: string
  }
  onChange: (data: Partial<BasicInfoEditSectionProps['data']>) => void
}

export default function BasicInfoEditSection({ data, onChange }: BasicInfoEditSectionProps) {
  return (
    <Box className={styles.sectionCard}>
      <Flex align="center" gap="2" mb="4" className={styles.header}>
        <Box className={styles.iconCircle}>
          <InfoCircledIcon width={16} height={16} />
        </Box>
        <Text size="5" weight="bold">Основная информация</Text>
      </Flex>

      <Flex gap="4" wrap="wrap">
        {/* Первый столбец */}
        <Flex direction="column" gap="3" style={{ flex: '1 1 calc(50% - 8px)', minWidth: '300px' }}>
          <Flex direction="column" gap="1">
            <Text size="2" weight="bold" style={{ color: 'var(--gray-11)' }}>
              Название вакансии <Text color="red">*</Text>
            </Text>
            <TextField.Root
              value={data.title}
              onChange={(e) => onChange({ title: e.target.value })}
              placeholder="Название вакансии"
            />
            <Text size="1" style={{ color: 'var(--gray-11)' }}>Название вакансии</Text>
          </Flex>

          <Flex direction="column" gap="1">
            <Text size="2" weight="bold" style={{ color: 'var(--gray-11)' }}>
              Ответственный рекрутер <Text color="red">*</Text>
            </Text>
            <Select.Root
              value={data.recruiter}
              onValueChange={(value) => onChange({ recruiter: value })}
            >
              <Select.Trigger placeholder="Рекрутер, ответственный за вакансию" />
              <Select.Content>
                <Select.Item value="andrei.golubenko">andrei.golubenko</Select.Item>
                <Select.Item value="recruiter1">recruiter1</Select.Item>
                <Select.Item value="recruiter2">recruiter2</Select.Item>
                <Select.Item value="recruiter3">recruiter3</Select.Item>
              </Select.Content>
            </Select.Root>
            <Text size="1" style={{ color: 'var(--gray-11)' }}>Рекрутер, ответственный за вакансию</Text>
          </Flex>

          <Flex direction="column" gap="1">
            <Text size="2" weight="bold" style={{ color: 'var(--gray-11)' }}>
              Активна
            </Text>
            <Flex align="center" gap="2">
              <Switch
                checked={data.status === 'active'}
                onCheckedChange={(checked) => onChange({ status: checked ? 'active' : 'inactive' })}
              />
              <Text size="3" weight="bold">
                {data.status === 'active' ? 'Активна' : 'Неактивна'}
              </Text>
            </Flex>
            <Text size="1" style={{ color: 'var(--gray-11)' }}>Активна ли вакансия</Text>
          </Flex>
        </Flex>

        {/* Второй столбец */}
        <Flex direction="column" gap="3" style={{ flex: '1 1 calc(50% - 8px)', minWidth: '300px' }}>
          <Flex direction="column" gap="1">
            <Text size="2" weight="bold" style={{ color: 'var(--gray-11)' }}>
              ID для связи <Text color="red">*</Text>
            </Text>
            <TextField.Root
              value={data.huntflowId}
              onChange={(e) => onChange({ huntflowId: e.target.value })}
              placeholder="Внешний идентификатор для связи с внешними системами"
            />
            <Text size="1" style={{ color: 'var(--gray-11)' }}>Внешний идентификатор для связи с внешними системами</Text>
          </Flex>

          <Flex direction="column" gap="1">
            <Flex align="center" gap="2" mb="1">
              <Text size="2" style={{ fontSize: '14px' }}>{'</>'}</Text>
              <Text size="2" weight="bold" style={{ color: 'var(--gray-11)' }}>
                Технологии
              </Text>
            </Flex>
            <TextField.Root
              value={data.technologies}
              onChange={(e) => onChange({ technologies: e.target.value })}
              placeholder="JavaScript, TypeScript, React, Redux, RxJS, WebGL"
            />
            <Text size="1" style={{ color: 'var(--gray-11)' }}>
              Список технологий через запятую (например: Python, Django, PostgreSQL, Redis)
            </Text>
            <Flex align="center" gap="1" mt="1">
              <Box style={{ fontSize: '12px', color: 'var(--gray-11)' }}>ℹ️</Box>
              <Text size="1" style={{ color: 'var(--gray-11)' }}>
                Укажите технологии через запятую (например: Python, Django, PostgreSQL, Redis)
              </Text>
            </Flex>
          </Flex>
        </Flex>
      </Flex>
    </Box>
  )
}
