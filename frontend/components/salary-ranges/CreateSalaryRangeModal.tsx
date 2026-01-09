'use client'

import { Box, Flex, Text, Button, TextField, Select, Callout, Dialog } from "@radix-ui/themes"
import { useState } from "react"
import { CheckIcon, Cross2Icon } from "@radix-ui/react-icons"
import styles from './CreateSalaryRangeModal.module.css'

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

interface CreateSalaryRangeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave?: (data: {
    vacancy: string
    grade: string
    salaryMinUsd: number
    salaryMaxUsd: number
  }) => void
}

export default function CreateSalaryRangeModal({
  open,
  onOpenChange,
  onSave
}: CreateSalaryRangeModalProps) {
  const [vacancy, setVacancy] = useState('')
  const [grade, setGrade] = useState('')
  const [salaryMinUsd, setSalaryMinUsd] = useState('')
  const [salaryMaxUsd, setSalaryMaxUsd] = useState('')

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

  const handleSave = () => {
    if (!vacancy || !grade || !salaryMinUsd || !salaryMaxUsd) {
      alert('Заполните все обязательные поля')
      return
    }

    const minUsd = parseFloat(salaryMinUsd)
    const maxUsd = parseFloat(salaryMaxUsd)

    if (isNaN(minUsd) || isNaN(maxUsd) || minUsd < 0 || maxUsd < 0) {
      alert('Введите корректные значения зарплаты')
      return
    }

    if (minUsd > maxUsd) {
      alert('Минимум не может быть больше максимума')
      return
    }

    if (onSave) {
      onSave({
        vacancy,
        grade,
        salaryMinUsd: minUsd,
        salaryMaxUsd: maxUsd,
      })
    }

    // Сброс формы
    setVacancy('')
    setGrade('')
    setSalaryMinUsd('')
    setSalaryMaxUsd('')
    onOpenChange(false)
  }

  const handleCancel = () => {
    setVacancy('')
    setGrade('')
    setSalaryMinUsd('')
    setSalaryMaxUsd('')
    onOpenChange(false)
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content className={styles.dialogContent} size="4">
        <Dialog.Title>Создание зарплатной вилки</Dialog.Title>
        <Dialog.Description size="2" color="gray" mb="4">
          Заполните обязательные поля. Остальные валюты рассчитываются автоматически.
        </Dialog.Description>

        {/* Информационное сообщение о курсах */}
        <Callout.Root className={styles.infoBox} mb="4">
          <Callout.Text>
            Курсы валют обновляются автоматически. Остальные валюты рассчитываются на основе USD и текущих курсов.
          </Callout.Text>
        </Callout.Root>

        {/* Форма */}
        <Box className={styles.formContent}>
          <Flex direction="column" gap="4">
            {/* Вакансия */}
            <Box>
              <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
                Вакансия *
              </Text>
              <Select.Root value={vacancy} onValueChange={setVacancy}>
                <Select.Trigger style={{ width: '100%' }} placeholder="Выберите вакансию" />
                <Select.Content>
                  {mockVacancies.map(v => (
                    <Select.Item key={v} value={v}>
                      {v}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
            </Box>

            {/* Грейд */}
            <Box>
              <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
                Грейд *
              </Text>
              <Select.Root value={grade} onValueChange={setGrade}>
                <Select.Trigger style={{ width: '100%' }} placeholder="Выберите грейд" />
                <Select.Content>
                  {mockGrades.map(g => (
                    <Select.Item key={g} value={g}>
                      {g}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
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
                  <Flex gap="2" align="center">
                    <TextField.Root
                      placeholder="Минимум (0 если не определен)"
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
          </Flex>
        </Box>

        {/* Кнопки действий */}
        <Flex gap="3" justify="end" pt="4" style={{ borderTop: '1px solid var(--gray-a6)' }}>
          <Dialog.Close>
            <Button variant="soft" onClick={handleCancel}>
              <Cross2Icon width={16} height={16} />
              Отмена
            </Button>
          </Dialog.Close>
          <Button onClick={handleSave}>
            <CheckIcon width={16} height={16} />
            Создать
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  )
}
