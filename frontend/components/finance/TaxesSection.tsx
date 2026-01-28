'use client'

import { Box, Flex, Text, Button, TextField, Table, Badge, Switch } from "@radix-ui/themes"
import { MixerHorizontalIcon, PlusIcon, TrashIcon, Pencil2Icon } from "@radix-ui/react-icons"
import { useState } from "react"
import { useToast } from "@/components/Toast/ToastContext"
import styles from './TaxesSection.module.css'

interface PLNTax {
  id: number
  name: string
  rate: string
  rate_decimal?: number
  is_active: boolean
  created_at: string
  updated_at: string
}

// Моковые данные
const mockTaxes: PLNTax[] = [
  {
    id: 1,
    name: 'Подоходный налог (PIT)',
    rate: '25.00',
    rate_decimal: 0.25,
    is_active: true,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
]

export default function TaxesSection() {
  const toast = useToast()
  const [taxes, setTaxes] = useState<PLNTax[]>(mockTaxes)
  const [isAdding, setIsAdding] = useState(false)
  const [newTax, setNewTax] = useState({ name: '', rate: '' })
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editingTax, setEditingTax] = useState({ name: '', rate: '', is_active: true })

  const handleAdd = () => {
    if (!newTax.name.trim() || !newTax.rate.trim()) {
      alert('Заполните все поля')
      return
    }

    const rate = parseFloat(newTax.rate)
    if (isNaN(rate) || rate < 0 || rate > 100) {
      alert('Ставка должна быть числом от 0 до 100')
      return
    }

    const newTaxItem: PLNTax = {
      id: Math.max(...taxes.map(t => t.id), 0) + 1,
      name: newTax.name.trim(),
      rate: rate.toFixed(2),
      rate_decimal: rate / 100,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    setTaxes([...taxes, newTaxItem])
    setNewTax({ name: '', rate: '' })
    setIsAdding(false)
  }

  const handleEdit = (tax: PLNTax) => {
    setEditingId(tax.id)
    setEditingTax({
      name: tax.name,
      rate: tax.rate,
      is_active: tax.is_active,
    })
  }

  const handleSaveEdit = () => {
    if (!editingId || !editingTax.name.trim() || !editingTax.rate.trim()) {
      alert('Заполните все поля')
      return
    }

    const rate = parseFloat(editingTax.rate)
    if (isNaN(rate) || rate < 0 || rate > 100) {
      alert('Ставка должна быть числом от 0 до 100')
      return
    }

    setTaxes(taxes.map(t => 
      t.id === editingId 
        ? { 
            ...t, 
            name: editingTax.name.trim(), 
            rate: rate.toFixed(2),
            rate_decimal: rate / 100,
            is_active: editingTax.is_active,
            updated_at: new Date().toISOString(),
          }
        : t
    ))
    setEditingId(null)
    setEditingTax({ name: '', rate: '', is_active: true })
  }

  const handleToggleActive = (tax: PLNTax) => {
    setTaxes(taxes.map(t => 
      t.id === tax.id 
        ? { ...t, is_active: !t.is_active, updated_at: new Date().toISOString() }
        : t
    ))
  }

  const handleDelete = (id: number) => {
    toast.showWarning('Удалить налог?', 'Вы уверены, что хотите удалить этот налог?', {
      actions: [
        { label: 'Отмена', onClick: () => {}, variant: 'soft', color: 'gray' },
        { label: 'Удалить', onClick: () => setTaxes(prev => prev.filter(t => t.id !== id)), variant: 'solid', color: 'red' },
      ],
    })
  }

  const activeTaxes = taxes.filter(t => t.is_active)
  const totalRate = activeTaxes.reduce((sum, tax) => {
    const rate = parseFloat(tax.rate) || 0
    return sum + rate
  }, 0)

  // Пример расчета (если есть активные налоги)
  const exampleNet = 5000
  const exampleGross = totalRate > 0 ? exampleNet / (1 - totalRate / 100) : exampleNet
  const exampleTaxes = exampleGross - exampleNet

  return (
    <Box className={styles.section}>
      <Flex justify="between" align="center" className={styles.header}>
        <Flex align="center" gap="2">
          <MixerHorizontalIcon width={20} height={20} />
          <Text size="5" weight="bold">Налоги PLN</Text>
        </Flex>
        <Button
          size="2"
          onClick={() => setIsAdding(true)}
          disabled={isAdding}
        >
          <PlusIcon width={16} height={16} />
          Добавить налог
        </Button>
      </Flex>

      {isAdding && (
        <Box className={styles.addForm}>
          <Flex direction="column" gap="3">
            <TextField.Root
              placeholder="Название налога"
              value={newTax.name}
              onChange={(e) => setNewTax({ ...newTax, name: e.target.value })}
            />
            <TextField.Root
              placeholder="Ставка (%)"
              type="number"
              value={newTax.rate}
              onChange={(e) => setNewTax({ ...newTax, rate: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAdd()
                if (e.key === 'Escape') {
                  setIsAdding(false)
                  setNewTax({ name: '', rate: '' })
                }
              }}
            />
            <Flex gap="2">
              <Button onClick={handleAdd}>Сохранить</Button>
              <Button
                variant="soft"
                onClick={() => {
                  setIsAdding(false)
                  setNewTax({ name: '', rate: '' })
                }}
              >
                Отмена
              </Button>
            </Flex>
          </Flex>
        </Box>
      )}

      <Flex gap="4" className={styles.content}>
        <Box className={styles.tableContainer}>
          <Table.Root className={styles.table}>
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell>Налог</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Ставка</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Статус</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Действия</Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {taxes.map((tax) => (
                <Table.Row key={tax.id}>
                  <Table.Cell>
                    {editingId === tax.id ? (
                      <TextField.Root
                        value={editingTax.name}
                        onChange={(e) =>
                          setEditingTax({ ...editingTax, name: e.target.value })
                        }
                        size="2"
                      />
                    ) : (
                      <Text weight="medium">{tax.name}</Text>
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    {editingId === tax.id ? (
                      <TextField.Root
                        value={editingTax.rate}
                        onChange={(e) =>
                          setEditingTax({ ...editingTax, rate: e.target.value })
                        }
                        type="number"
                        size="2"
                        style={{ width: '100px' }}
                      />
                    ) : (
                      <Text>{tax.rate}%</Text>
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    {editingId === tax.id ? (
                      <Switch
                        checked={editingTax.is_active}
                        onCheckedChange={(checked) =>
                          setEditingTax({ ...editingTax, is_active: checked })
                        }
                      />
                    ) : (
                      <Badge color={tax.is_active ? 'green' : 'gray'}>
                        {tax.is_active ? 'Активен' : 'Неактивен'}
                      </Badge>
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    {editingId === tax.id ? (
                      <Flex gap="1">
                        <Button size="1" onClick={handleSaveEdit}>
                          Сохранить
                        </Button>
                        <Button
                          size="1"
                          variant="soft"
                          onClick={() => {
                            setEditingId(null)
                            setEditingTax({ name: '', rate: '', is_active: true })
                          }}
                        >
                          Отмена
                        </Button>
                      </Flex>
                    ) : (
                      <Flex gap="4" align="center">
                        <Button
                          size="2"
                          variant="soft"
                          onClick={() => handleEdit(tax)}
                        >
                          <Pencil2Icon width={14} height={14} />
                        </Button>
                        <Button
                          size="2"
                          variant="soft"
                          onClick={() => handleToggleActive(tax)}
                        >
                          {tax.is_active ? (
                            <Box style={{ 
                              width: '14px', 
                              height: '14px', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              position: 'relative'
                            }}>
                              <Box style={{
                                width: '3px',
                                height: '10px',
                                backgroundColor: 'currentColor',
                                borderRadius: '1px',
                                marginRight: '2px'
                              }} />
                              <Box style={{
                                width: '3px',
                                height: '10px',
                                backgroundColor: 'currentColor',
                                borderRadius: '1px'
                              }} />
                            </Box>
                          ) : (
                            <Box style={{
                              width: '10px',
                              height: '10px',
                              borderRadius: '50%',
                              backgroundColor: 'currentColor'
                            }} />
                          )}
                        </Button>
                        <Button
                          size="2"
                          variant="soft"
                          color="red"
                          onClick={() => handleDelete(tax.id)}
                        >
                          <TrashIcon width={14} height={14} />
                        </Button>
                      </Flex>
                    )}
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Box>

        <Box className={styles.exampleBox}>
          <Flex align="center" gap="2" mb="3">
            <MixerHorizontalIcon width={18} height={18} />
            <Text weight="bold" size="4">Пример расчета</Text>
          </Flex>
          <Flex direction="column" gap="2">
            <Text size="2" color="gray">Net: {exampleNet.toFixed(2)} PLN</Text>
            <Text size="2" color="gray">Gross: {exampleGross.toFixed(2)} PLN</Text>
            <Text size="2" color="gray">Налоги: {exampleTaxes.toFixed(2)} PLN</Text>
          </Flex>
          <Box mt="3" pt="3" style={{ borderTop: '1px solid var(--gray-a6)' }}>
            <Text size="1" color="gray">
              Активных налогов: {activeTaxes.length}
            </Text>
          </Box>
        </Box>
      </Flex>
    </Box>
  )
}
