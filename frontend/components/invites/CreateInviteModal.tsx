'use client'

import { Box, Flex, Text, Button, Dialog, TextArea, Card, Separator } from "@radix-ui/themes"
import { PlusIcon, InfoCircledIcon } from "@radix-ui/react-icons"
import { useState } from "react"
import { useToast } from "@/components/Toast/ToastContext"
import { getApiUrl } from "@/lib/api"
import styles from './CreateInviteModal.module.css'

// Функция для получения CSRF токена
function getCsrfToken(): string | null {
  if (typeof document === 'undefined') return null
  const name = 'csrftoken'
  let cookieValue = null
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';')
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim()
      if (cookie.substring(0, name.length + 1) === name + '=') {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1))
        break
      }
    }
  }
  return cookieValue
}

interface CreateInviteModalProps {
  isOpen: boolean
  onClose: () => void
  onSave?: (data: { combined_data: string }) => void
}

export default function CreateInviteModal({ isOpen, onClose, onSave }: CreateInviteModalProps) {
  const toast = useToast()
  const [combinedData, setCombinedData] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSave = async () => {
    if (!combinedData.trim()) {
      toast.showError('Ошибка', 'Поле не может быть пустым')
      return
    }

    setIsSubmitting(true)
    try {
      // Имитация отправки на сервер
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // TODO: Когда будет готов API, раскомментировать:
      /*
      const csrfToken = getCsrfToken()
      const response = await fetch('/google-oauth/invites/create/combined/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          ...(csrfToken ? { 'X-CSRFToken': csrfToken } : {}),
        },
        body: new URLSearchParams({
          combined_data: combinedData,
        }),
        credentials: 'include',
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || 'Ошибка создания инвайта')
      }

      // Перенаправление на страницу деталей инвайта (если нужно)
      const redirectUrl = response.headers.get('Location')
      if (redirectUrl) {
        window.open(redirectUrl, '_blank')
      }
      */

      toast.showSuccess('Успешно', 'Инвайт успешно создан')
      
      if (onSave) {
        onSave({ combined_data: combinedData })
      }
      
      // Очищаем форму и закрываем модальное окно
      setCombinedData('')
      onClose()
    } catch (error) {
      toast.showError('Ошибка', 'Не удалось создать инвайт')
      console.error('Error creating invite:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setCombinedData('')
    onClose()
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => {
      if (!open) {
        handleClose()
      }
    }}>
      <Dialog.Content style={{ maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto' }}>
        <Dialog.Title>
          <Flex align="center" gap="2">
            <PlusIcon width={20} height={20} />
            Создание инвайта
          </Flex>
        </Dialog.Title>

        <Flex gap="4" direction="column" mt="4">
          {/* Основная форма */}
          <Card>
            <Box p="4">
              <Flex direction="column" gap="4">
                <Box>
                  <Text size="2" weight="medium" mb="2" as="div">
                    Ссылка на кандидата и дата-время интервью
                  </Text>
                  <TextArea
                    placeholder="Вставьте ссылку и дата-время в одном поле...

Примеры:
https://huntflow.ru/my/org#/vacancy/123/filter/456/id/789
2025-09-15 14:00
2025-09-15 14:00 (1 час)
2025-09-15 14:00 (30 минут)"
                    value={combinedData}
                    onChange={(e) => setCombinedData(e.target.value)}
                    rows={8}
                    style={{ fontFamily: 'monospace', fontSize: '13px' }}
                  />
                  <Text size="1" color="gray" mt="2" as="div">
                    Вставьте ссылку на кандидата и дата-время интервью в одном поле. Система автоматически извлечет ссылку и дату. 
                    Для указания кастомной длительности добавьте в скобках: (1 час), (30 минут), (полчаса), (2 ч), (45 м).
                  </Text>
                </Box>
              </Flex>
            </Box>
          </Card>

          {/* Информация */}
          <Card>
            <Box p="4">
              <Flex direction="column" gap="3">
                <Flex align="center" gap="2">
                  <InfoCircledIcon width={16} height={16} />
                  <Text size="3" weight="medium">Информация</Text>
                </Flex>
                
                <Separator />
                
                <Box>
                  <Text size="2" weight="medium" mb="2" as="div">
                    Формат ссылки на кандидата:
                  </Text>
                  <Box style={{ 
                    backgroundColor: 'var(--gray-2)', 
                    padding: '12px', 
                    borderRadius: '6px',
                    fontFamily: 'monospace',
                    fontSize: '12px',
                  }}>
                    <Text size="1" as="div" mb="1">
                      <strong>Sandbox:</strong>
                    </Text>
                    <Text size="1" color="gray" as="div" mb="2">
                      https://sandbox.huntflow.dev/my/org694#/vacancy/[id вакансии]/filter/[id статуса]/id/[id кандидата]
                    </Text>
                    <Text size="1" as="div" mb="1">
                      <strong>Production:</strong>
                    </Text>
                    <Text size="1" color="gray" as="div">
                      https://huntflow.ru/my/[название_аккаунта]#/vacancy/[id вакансии]/filter/[id статуса]/id/[id кандидата]
                    </Text>
                  </Box>
                </Box>

                <Box>
                  <Text size="2" weight="medium" mb="2" as="div">
                    Форматы даты-времени:
                  </Text>
                  <Box style={{ 
                    backgroundColor: 'var(--gray-2)', 
                    padding: '12px', 
                    borderRadius: '6px',
                    fontFamily: 'monospace',
                    fontSize: '12px',
                  }}>
                    <Text size="1" color="gray" as="div">
                      • 2025-09-15 14:00 (YYYY-MM-DD HH:MM)
                    </Text>
                    <Text size="1" color="gray" as="div">
                      • 15.09.2025 14:00 (DD.MM.YYYY HH:MM)
                    </Text>
                    <Text size="1" color="gray" as="div">
                      • 15/09/2025 14:00 (DD/MM/YYYY HH:MM)
                    </Text>
                  </Box>
                </Box>

                <Box>
                  <Text size="2" weight="medium" mb="2" as="div">
                    Пример заполнения:
                  </Text>
                  <Box style={{ 
                    backgroundColor: 'var(--blue-2)', 
                    padding: '12px', 
                    borderRadius: '6px',
                    fontFamily: 'monospace',
                    fontSize: '12px',
                  }}>
                    <Text size="1" as="div">
                      https://huntflow.ru/my/org#/vacancy/123/filter/456/id/789
                    </Text>
                    <Text size="1" as="div">
                      2025-09-15 14:00
                    </Text>
                  </Box>
                </Box>
              </Flex>
            </Box>
          </Card>

          {/* Кнопки */}
          <Flex justify="end" gap="3" mt="2">
            <Button variant="soft" onClick={handleClose} disabled={isSubmitting}>
              Отмена
            </Button>
            <Button onClick={handleSave} disabled={isSubmitting || !combinedData.trim()}>
              {isSubmitting ? 'Сохранение...' : 'Сохранить'}
            </Button>
          </Flex>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  )
}
