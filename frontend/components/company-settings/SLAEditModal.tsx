'use client'

import { Box, Flex, Text, Button, Dialog, TextField, Switch, Card } from "@radix-ui/themes"
import { Pencil1Icon, InfoCircledIcon, BarChartIcon } from "@radix-ui/react-icons"
import { useState, useEffect } from "react"
import styles from './SLAEditModal.module.css'

interface SLA {
  id: string
  vacancy: string
  grade: string
  timeToOffer: number
  timeToHire: number
  status: 'active' | 'inactive'
  createdAt: string
}

interface SLAEditModalProps {
  sla: SLA | null
  isOpen: boolean
  onClose: () => void
  onSave: (sla: SLA) => void
}

export default function SLAEditModal({ sla, isOpen, onClose, onSave }: SLAEditModalProps) {
  const [formData, setFormData] = useState({
    timeToOffer: '',
    timeToHire: '',
    isActive: true
  })

  useEffect(() => {
    if (sla) {
      setFormData({
        timeToOffer: sla.timeToOffer.toString(),
        timeToHire: sla.timeToHire.toString(),
        isActive: sla.status === 'active'
      })
    }
  }, [sla])

  const handleSave = () => {
    if (!sla) return

    const updatedSLA: SLA = {
      ...sla,
      timeToOffer: parseInt(formData.timeToOffer) || 0,
      timeToHire: parseInt(formData.timeToHire) || 0,
      status: formData.isActive ? 'active' : 'inactive'
    }

    onSave(updatedSLA)
    onClose()
  }

  if (!sla) return null

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Content style={{ maxWidth: '900px', maxHeight: '90vh', overflowY: 'auto' }}>
        <Dialog.Title>
          <Flex align="center" gap="2">
            <Pencil1Icon width={20} height={20} />
            Редактирование SLA
          </Flex>
        </Dialog.Title>

        <Flex gap="4" direction="column" mt="4">
          {/* Основная информация */}
          <Card className={styles.card}>
            <Flex align="center" gap="2" mb="4">
              <InfoCircledIcon width={20} height={20} />
              <Text size="4" weight="bold">Основная информация</Text>
            </Flex>

            <Flex direction="column" gap="4">
              <Box>
                <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
                  Вакансия *
                </Text>
                <TextField.Root
                  value={sla.vacancy}
                  disabled
                  size="2"
                  style={{ width: '100%' }}
                />
              </Box>

              <Box>
                <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
                  Грейд *
                </Text>
                <TextField.Root
                  value={sla.grade}
                  disabled
                  size="2"
                  style={{ width: '100%' }}
                />
                <Text size="1" color="gray" mt="1" style={{ display: 'block' }}>
                  Грейд зафиксирован для редактирования
                </Text>
              </Box>

              <Box>
                <Flex align="center" gap="2" mb="2">
                  <Switch
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                  <Text size="2" weight="medium">Активен</Text>
                </Flex>
                <Text size="1" color="gray" mt="1" style={{ display: 'block' }}>
                  Неактивные SLA не будут автоматически подтягиваться при создании заявок
                </Text>
              </Box>
            </Flex>
          </Card>

          {/* Целевые показатели */}
          <Card className={styles.card}>
            <Flex align="center" gap="2" mb="4">
              <BarChartIcon width={20} height={20} />
              <Text size="4" weight="bold">Целевые показатели</Text>
            </Flex>

            <Flex direction="column" gap="4">
              <Box>
                <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
                  Time-to-Offer (дни) *
                </Text>
                <TextField.Root
                  type="number"
                  value={formData.timeToOffer}
                  onChange={(e) => setFormData({ ...formData, timeToOffer: e.target.value })}
                  placeholder="Введите количество дней"
                  size="2"
                  style={{ width: '100%' }}
                />
                <Text size="1" color="gray" mt="1" style={{ display: 'block' }}>
                  Целевое время от открытия до предложения кандидату
                </Text>
              </Box>

              <Box>
                <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
                  Time-to-Hire (дни) *
                </Text>
                <TextField.Root
                  type="number"
                  value={formData.timeToHire}
                  onChange={(e) => setFormData({ ...formData, timeToHire: e.target.value })}
                  placeholder="Введите количество дней"
                  size="2"
                  style={{ width: '100%' }}
                />
                <Text size="1" color="gray" mt="1" style={{ display: 'block' }}>
                  Целевое время от первого контакта до оффера
                </Text>
              </Box>
            </Flex>
          </Card>
        </Flex>

        <Flex justify="end" gap="3" mt="6" pt="4" style={{ borderTop: '1px solid var(--gray-6)' }}>
          <Button variant="soft" onClick={onClose}>
            Отмена
          </Button>
          <Button onClick={handleSave}>
            Сохранить изменения
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  )
}
