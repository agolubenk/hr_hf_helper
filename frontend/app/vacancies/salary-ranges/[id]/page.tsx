'use client'

import AppLayout from "@/components/AppLayout"
import { Box, Flex, Text, Button, TextField, Select, Callout } from "@radix-ui/themes"
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeftIcon, CheckIcon, Cross2Icon, TrashIcon } from "@radix-ui/react-icons"
import styles from './salary-range-detail.module.css'

// Моковые данные для курсов валют
const mockCurrencyRates = {
  USD: { rate: 3.25, scale: 1 },
  PLN: { rate: 0.82, scale: 100 }, // 82 BYN за 100 PLN
  EUR: { rate: 3.55, scale: 1 },
}

// Моковые данные для налогов (для расчета gross)
const mockTaxRate = 0.25 // 25% общий налог

// Моковые данные для вакансий
const mockVacancies = [
  'DevOps Engineer',
  'Frontend Engineer (React)',
  'Backend Engineer (Java)',
  'QA Engineer',
  'UX/UI Designer',
  'System Administrator',
  'Project Manager',
  'AQA Engineer (TS)',
  'Manual QA Engineer',
]

// Моковые данные для грейдов
const mockGrades = [
  'Junior',
  'Junior+',
  'Middle',
  'Middle+',
  'Senior',
  'Senior+',
  'Lead',
]

// Моковые данные зарплатной вилки
const mockSalaryRange = {
  id: 1,
  vacancyId: 3979419,
  vacancyName: 'DevOps Engineer',
  grade: 'Senior',
  salaryUsd: { min: 3500, max: 5000 },
  salaryByn: { min: 11375, max: 16250 },
  salaryPln: { min: 16794, max: 23992 },
  salaryEur: { min: 3983, max: 5690 },
  isActive: true,
  updatedAt: '2026-01-08T00:00:00Z',
}

export default function SalaryRangeDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string

  const [isEditing, setIsEditing] = useState(false)
  const [isActive, setIsActive] = useState(mockSalaryRange.isActive)
  const [vacancy, setVacancy] = useState(mockSalaryRange.vacancyName)
  const [grade, setGrade] = useState(mockSalaryRange.grade)
  const [salaryMinUsd, setSalaryMinUsd] = useState(mockSalaryRange.salaryUsd.min.toString())
  const [salaryMaxUsd, setSalaryMaxUsd] = useState(mockSalaryRange.salaryUsd.max.toString())

  // Автоматический расчет других валют на основе USD
  const calculateOtherCurrencies = (minUsd: number, maxUsd: number) => {
    if (!minUsd && !maxUsd) {
      return {
        byn: { min: 0, max: 0 },
        pln: { min: 0, max: 0 },
        eur: { min: 0, max: 0 },
      }
    }

    const usdRate = mockCurrencyRates.USD.rate
    // PLN rate нужно нормализовать: если scale=100, то rate/scale дает курс за 1 PLN
    const plnRateNormalized = mockCurrencyRates.PLN.rate / mockCurrencyRates.PLN.scale
    const eurRate = mockCurrencyRates.EUR.rate

    // BYN (net) = USD * курс USD
    const minByn = minUsd ? minUsd * usdRate : 0
    const maxByn = maxUsd ? maxUsd * usdRate : 0

    // PLN (gross): USD -> BYN -> PLN (net) -> PLN (gross)
    // PLN net = BYN / (PLN rate normalized)
    // PLN gross = PLN net / (1 - налог)
    const minPlnNet = minByn ? minByn / plnRateNormalized : 0
    const maxPlnNet = maxByn ? maxByn / plnRateNormalized : 0
    const minPlnGross = minPlnNet ? minPlnNet / (1 - mockTaxRate) : 0
    const maxPlnGross = maxPlnNet ? maxPlnNet / (1 - mockTaxRate) : 0

    // EUR (gross): аналогично PLN
    const minEurNet = minByn ? minByn / eurRate : 0
    const maxEurNet = maxByn ? maxByn / eurRate : 0
    const minEurGross = minEurNet ? minEurNet / (1 - mockTaxRate) : 0
    const maxEurGross = maxEurNet ? maxEurNet / (1 - mockTaxRate) : 0

    return {
      byn: { min: minByn, max: maxByn },
      pln: { min: minPlnGross, max: maxPlnGross },
      eur: { min: minEurGross, max: maxEurGross },
    }
  }

  const calculated = calculateOtherCurrencies(
    parseFloat(salaryMinUsd) || 0,
    parseFloat(salaryMaxUsd) || 0
  )

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ru-RU', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const handleSave = () => {
    // Здесь будет логика сохранения
    setIsEditing(false)
  }

  const handleCancel = () => {
    setVacancy(mockSalaryRange.vacancyName)
    setGrade(mockSalaryRange.grade)
    setSalaryMinUsd(mockSalaryRange.salaryUsd.min.toString())
    setSalaryMaxUsd(mockSalaryRange.salaryUsd.max.toString())
    setIsEditing(false)
  }

  const handleToggleActive = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    const newStatus = !isActive
    setIsActive(newStatus)
    // Здесь будет логика сохранения статуса через API
    // Пока просто обновляем локальное состояние
    console.log('Изменение статуса:', newStatus ? 'активна' : 'неактивна')
    return false
  }

  const handleDelete = () => {
    if (confirm('Вы уверены, что хотите удалить эту зарплатную вилку?')) {
      // Здесь будет логика удаления через API
      router.push('/vacancies/salary-ranges')
    }
  }

  return (
    <AppLayout pageTitle="Зарплатная вилка">
      <Box className={styles.container}>
        {/* Заголовок с кнопкой назад */}
        <Flex justify="between" align="center" mb="4">
          <Flex align="center" gap="3">
            <Button variant="ghost" size="2" onClick={() => router.push('/vacancies/salary-ranges')}>
              <ArrowLeftIcon width={16} height={16} />
            </Button>
            <Text size="6" weight="bold">
              {isEditing ? 'Редактирование зарплатной вилки' : 'Зарплатная вилка'}
            </Text>
          </Flex>
          {!isEditing && (
            <Flex gap="2" align="center" onClick={(e) => e.stopPropagation()}>
              <Button 
                variant="soft" 
                size="3" 
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  handleToggleActive(e)
                }}
                type="button"
                title={isActive ? "Деактивировать" : "Активировать"}
                onMouseDown={(e) => e.preventDefault()}
              >
                {isActive ? (
                  <Box style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
                    <Box style={{ width: '3px', height: '10px', backgroundColor: 'currentColor', borderRadius: '1px' }} />
                    <Box style={{ width: '3px', height: '10px', backgroundColor: 'currentColor', borderRadius: '1px' }} />
                  </Box>
                ) : (
                  <Box style={{ width: '8px', height: '8px', backgroundColor: 'currentColor', borderRadius: '50%' }} />
                )}
              </Button>
              <Button size="3" onClick={() => setIsEditing(true)} type="button">
                Редактировать
              </Button>
            </Flex>
          )}
        </Flex>

        {/* Информационное сообщение о курсах */}
        <Callout.Root className={styles.infoBox} mb="4">
          <Callout.Text>
            Курсы валют обновляются автоматически. Остальные валюты рассчитываются на основе USD и текущих курсов.
          </Callout.Text>
        </Callout.Root>

        {/* Форма редактирования */}
        <Box className={styles.formCard}>
          <Flex direction="column" gap="4">
            {/* Вакансия */}
            <Box>
              <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
                Вакансия *
              </Text>
              {isEditing ? (
                <Select.Root value={vacancy} onValueChange={setVacancy}>
                  <Select.Trigger style={{ width: '100%' }} />
                  <Select.Content>
                    {mockVacancies.map(v => (
                      <Select.Item key={v} value={v}>
                        {v}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>
              ) : (
                <Text size="3">{vacancy}</Text>
              )}
            </Box>

            {/* Грейд */}
            <Box>
              <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
                Грейд *
              </Text>
              {isEditing ? (
                <Select.Root value={grade} onValueChange={setGrade}>
                  <Select.Trigger style={{ width: '100%' }} />
                  <Select.Content>
                    {mockGrades.map(g => (
                      <Select.Item key={g} value={g}>
                        {g}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>
              ) : (
                <Text size="3">{grade}</Text>
              )}
            </Box>

            {/* Зарплаты */}
            <Box>
              <Text size="3" weight="bold" mb="3" style={{ display: 'block' }}>
                Зарплатные диапазоны
              </Text>

              <Flex direction="column" gap="4">
                {/* USD - редактируемое */}
                <Box>
                  <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
                    $ USD (net) *
                  </Text>
                  {isEditing ? (
                    <Flex gap="2" align="center">
                      <TextField.Root
                        placeholder="Минимум"
                        value={salaryMinUsd}
                        onChange={(e) => setSalaryMinUsd(e.target.value)}
                        type="number"
                        style={{ flex: 1 }}
                      />
                      <Text size="2">-</Text>
                      <TextField.Root
                        placeholder="Максимум"
                        value={salaryMaxUsd}
                        onChange={(e) => setSalaryMaxUsd(e.target.value)}
                        type="number"
                        style={{ flex: 1 }}
                      />
                    </Flex>
                  ) : (
                    <Text size="3">
                      {formatNumber(parseFloat(salaryMinUsd) || 0)} - {formatNumber(parseFloat(salaryMaxUsd) || 0)}
                    </Text>
                  )}
                </Box>

                {/* BYN - только отображение */}
                <Box>
                  <Text size="2" weight="medium" mb="2" style={{ display: 'block', color: 'var(--gray-11)' }}>
                    ₽ BYN (net)
                  </Text>
                  <Text size="3" style={{ color: 'var(--gray-11)' }}>
                    {formatNumber(calculated.byn.min)} - {formatNumber(calculated.byn.max)}
                  </Text>
                </Box>

                {/* PLN - только отображение */}
                <Box>
                  <Text size="2" weight="medium" mb="2" style={{ display: 'block', color: 'var(--gray-11)' }}>
                    zł PLN (gross)
                  </Text>
                  <Text size="3" style={{ color: 'var(--gray-11)' }}>
                    {formatNumber(calculated.pln.min)} - {formatNumber(calculated.pln.max)}
                  </Text>
                </Box>

                {/* EUR - только отображение */}
                <Box>
                  <Text size="2" weight="medium" mb="2" style={{ display: 'block', color: 'var(--gray-11)' }}>
                    € EUR (gross)
                  </Text>
                  <Text size="3" style={{ color: 'var(--gray-11)' }}>
                    {formatNumber(calculated.eur.min)} - {formatNumber(calculated.eur.max)}
                  </Text>
                </Box>
              </Flex>
            </Box>

            {/* Метаданные */}
            {!isEditing && (
              <Box pt="3" style={{ borderTop: '1px solid var(--gray-a6)' }}>
                <Flex direction="column" gap="2">
                  <Text size="2" style={{ color: 'var(--gray-11)' }}>
                    Обновлено: {formatDate(mockSalaryRange.updatedAt)}
                  </Text>
                  <Text size="2" style={{ color: 'var(--gray-11)' }}>
                    ID вакансии: {mockSalaryRange.vacancyId}
                  </Text>
                </Flex>
              </Box>
            )}

            {/* Кнопки действий */}
            {isEditing && (
              <Flex gap="3" justify="between" pt="3" style={{ borderTop: '1px solid var(--gray-a6)' }}>
                <Button variant="soft" color="red" onClick={handleDelete}>
                  <TrashIcon width={16} height={16} />
                  Удалить
                </Button>
                <Flex gap="3">
                  <Button variant="soft" onClick={handleCancel}>
                    <Cross2Icon width={16} height={16} />
                    Отмена
                  </Button>
                  <Button onClick={handleSave}>
                    <CheckIcon width={16} height={16} />
                    Сохранить
                  </Button>
                </Flex>
              </Flex>
            )}
          </Flex>
        </Box>
      </Box>
    </AppLayout>
  )
}
