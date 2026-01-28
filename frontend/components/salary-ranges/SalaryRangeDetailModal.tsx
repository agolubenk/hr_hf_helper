'use client'

import { Box, Flex, Text, Button, TextField, Select, Callout, Dialog } from "@radix-ui/themes"
import { useState, useEffect } from "react"
import { CheckIcon, Cross2Icon, TrashIcon } from "@radix-ui/react-icons"
import { useToast } from "@/components/Toast/ToastContext"
import styles from './SalaryRangeDetailModal.module.css'

// Моковые данные для курсов валют
const mockCurrencyRates = {
  USD: { rate: 3.25, scale: 1 },
  PLN: { rate: 0.82, scale: 100 },
  EUR: { rate: 3.55, scale: 1 },
}

const mockTaxRate = 0.25

const mockVacancies = [
  'DevOps Engineer', 'Frontend Engineer (React)', 'Backend Engineer (Java)',
  'QA Engineer', 'UX/UI Designer', 'System Administrator', 'Project Manager',
  'AQA Engineer (TS)', 'Manual QA Engineer',
]

const mockGrades = [
  'Junior', 'Junior+', 'Middle', 'Middle+', 'Senior', 'Senior+', 'Lead',
]

export interface SalaryRangeForDetail {
  id: number
  vacancyId: number
  vacancyName: string
  grade: string
  salaryUsd: { min: number; max: number }
  salaryByn: { min: number; max: number }
  salaryPln: { min: number; max: number }
  salaryEur: { min: number; max: number }
  isActive: boolean
  updatedAt: string
}

interface SalaryRangeDetailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  salaryRange: SalaryRangeForDetail | null
  onToggleActive?: (id: number) => void
  onSave?: (id: number, data: {
    vacancyName: string
    grade: string
    salaryUsd: { min: number; max: number }
    salaryByn: { min: number; max: number }
    salaryPln: { min: number; max: number }
    salaryEur: { min: number; max: number }
    updatedAt: string
  }) => void
  onDelete?: (id: number) => void
}

function calculateOtherCurrencies(minUsd: number, maxUsd: number) {
  if (!minUsd && !maxUsd) {
    return { byn: { min: 0, max: 0 }, pln: { min: 0, max: 0 }, eur: { min: 0, max: 0 } }
  }
  const usdRate = mockCurrencyRates.USD.rate
  const plnRateNorm = mockCurrencyRates.PLN.rate / mockCurrencyRates.PLN.scale
  const eurRate = mockCurrencyRates.EUR.rate

  const minByn = minUsd ? minUsd * usdRate : 0
  const maxByn = maxUsd ? maxUsd * usdRate : 0

  const minPlnNet = minByn ? minByn / plnRateNorm : 0
  const maxPlnNet = maxByn ? maxByn / plnRateNorm : 0
  const minPlnGross = minPlnNet ? minPlnNet / (1 - mockTaxRate) : 0
  const maxPlnGross = maxPlnNet ? maxPlnNet / (1 - mockTaxRate) : 0

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

export default function SalaryRangeDetailModal({
  open,
  onOpenChange,
  salaryRange,
  onToggleActive,
  onSave,
  onDelete,
}: SalaryRangeDetailModalProps) {
  const toast = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [vacancy, setVacancy] = useState('')
  const [grade, setGrade] = useState('')
  const [salaryMinUsd, setSalaryMinUsd] = useState('')
  const [salaryMaxUsd, setSalaryMaxUsd] = useState('')

  useEffect(() => {
    if (open && salaryRange) {
      setVacancy(salaryRange.vacancyName)
      setGrade(salaryRange.grade)
      setSalaryMinUsd(String(salaryRange.salaryUsd.min))
      setSalaryMaxUsd(String(salaryRange.salaryUsd.max))
      setIsEditing(false)
    }
  }, [open, salaryRange])

  const minUsd = parseFloat(salaryMinUsd) || 0
  const maxUsd = parseFloat(salaryMaxUsd) || 0
  const calculated = calculateOtherCurrencies(minUsd, maxUsd)

  const formatNumber = (n: number) =>
    new Intl.NumberFormat('ru-RU', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n)

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

  const handleSave = () => {
    if (!salaryRange) return
    const min = minUsd
    const max = maxUsd
    if (min > max) {
      alert('Минимум не может быть больше максимума')
      return
    }
    onSave?.(salaryRange.id, {
      vacancyName: vacancy,
      grade,
      salaryUsd: { min, max },
      salaryByn: calculated.byn,
      salaryPln: calculated.pln,
      salaryEur: calculated.eur,
      updatedAt: new Date().toISOString(),
    })
    setIsEditing(false)
  }

  const handleCancel = () => {
    if (salaryRange) {
      setVacancy(salaryRange.vacancyName)
      setGrade(salaryRange.grade)
      setSalaryMinUsd(String(salaryRange.salaryUsd.min))
      setSalaryMaxUsd(String(salaryRange.salaryUsd.max))
    }
    setIsEditing(false)
  }

  const handleToggleActive = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (salaryRange && onToggleActive) onToggleActive(salaryRange.id)
  }

  const handleDelete = () => {
    if (!salaryRange || !onDelete) return
    toast.showWarning('Удалить зарплатную вилку?', 'Вы уверены, что хотите удалить эту зарплатную вилку?', {
      actions: [
        { label: 'Отмена', onClick: () => {}, variant: 'soft', color: 'gray' },
        { label: 'Удалить', onClick: () => { onDelete!(salaryRange.id); onOpenChange(false) }, variant: 'solid', color: 'red' },
      ],
    })
  }

  if (!salaryRange) return null

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content className={styles.dialogContent} size="4">
        <Dialog.Title>
          {isEditing ? 'Редактирование зарплатной вилки' : 'Зарплатная вилка'}
        </Dialog.Title>

        {/* Хедер: кнопки Активировать/Деактивировать и Редактировать в режиме просмотра */}
        {!isEditing && (
          <Flex justify="end" gap="2" mt="2" mb="2">
            <Button
              variant="soft"
              size="2"
              onClick={handleToggleActive}
              type="button"
              title={salaryRange.isActive ? 'Деактивировать' : 'Активировать'}
            >
              {salaryRange.isActive ? (
                <Box style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
                  <Box style={{ width: '3px', height: '10px', backgroundColor: 'currentColor', borderRadius: '1px' }} />
                  <Box style={{ width: '3px', height: '10px', backgroundColor: 'currentColor', borderRadius: '1px' }} />
                </Box>
              ) : (
                <Box style={{ width: '8px', height: '8px', backgroundColor: 'currentColor', borderRadius: '50%' }} />
              )}
            </Button>
            <Button size="2" onClick={() => setIsEditing(true)}>
              Редактировать
            </Button>
          </Flex>
        )}

        <Callout.Root className={styles.infoBox} mb="3">
          <Callout.Text>
            Курсы валют обновляются автоматически. Остальные валюты рассчитываются на основе USD.
          </Callout.Text>
        </Callout.Root>

        <Box className={styles.formContent}>
          <Flex direction="column" gap="4">
            {/* Вакансия */}
            <Box>
              <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>Вакансия *</Text>
              {isEditing ? (
                <Select.Root value={vacancy} onValueChange={setVacancy}>
                  <Select.Trigger style={{ width: '100%' }} />
                  <Select.Content>
                    {mockVacancies.map((v) => (
                      <Select.Item key={v} value={v}>{v}</Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>
              ) : (
                <Text size="3">{vacancy}</Text>
              )}
            </Box>

            {/* Грейд */}
            <Box>
              <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>Грейд *</Text>
              {isEditing ? (
                <Select.Root value={grade} onValueChange={setGrade}>
                  <Select.Trigger style={{ width: '100%' }} />
                  <Select.Content>
                    {mockGrades.map((g) => (
                      <Select.Item key={g} value={g}>{g}</Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>
              ) : (
                <Text size="3">{grade}</Text>
              )}
            </Box>

            {/* Зарплаты */}
            <Box>
              <Text size="3" weight="bold" mb="3" style={{ display: 'block' }}>Зарплатные диапазоны</Text>
              <Flex direction="column" gap="4">
                <Box>
                  <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>$ USD (net) *</Text>
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
                    <Text size="3">{formatNumber(minUsd)} - {formatNumber(maxUsd)}</Text>
                  )}
                </Box>
                <Box>
                  <Text size="2" weight="medium" mb="2" style={{ display: 'block', color: 'var(--gray-11)' }}>₽ BYN (net)</Text>
                  <Text size="3" style={{ color: 'var(--gray-11)' }}>
                    {formatNumber(calculated.byn.min)} - {formatNumber(calculated.byn.max)}
                  </Text>
                </Box>
                <Box>
                  <Text size="2" weight="medium" mb="2" style={{ display: 'block', color: 'var(--gray-11)' }}>zł PLN (gross)</Text>
                  <Text size="3" style={{ color: 'var(--gray-11)' }}>
                    {formatNumber(calculated.pln.min)} - {formatNumber(calculated.pln.max)}
                  </Text>
                </Box>
                <Box>
                  <Text size="2" weight="medium" mb="2" style={{ display: 'block', color: 'var(--gray-11)' }}>€ EUR (gross)</Text>
                  <Text size="3" style={{ color: 'var(--gray-11)' }}>
                    {formatNumber(calculated.eur.min)} - {formatNumber(calculated.eur.max)}
                  </Text>
                </Box>
              </Flex>
            </Box>

            {!isEditing && (
              <Box pt="3" style={{ borderTop: '1px solid var(--gray-a6)' }}>
                <Flex direction="column" gap="2">
                  <Text size="2" color="gray">Обновлено: {formatDate(salaryRange.updatedAt)}</Text>
                  <Text size="2" color="gray">ID вакансии: {salaryRange.vacancyId}</Text>
                </Flex>
              </Box>
            )}

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
      </Dialog.Content>
    </Dialog.Root>
  )
}
