/**
 * CreateInviteModal (components/invites/CreateInviteModal.tsx) - Модальное окно создания инвайта
 * 
 * Назначение:
 * - Создание нового инвайта на интервью из комбинированных данных
 * - Ввод ссылки на кандидата в Huntflow и даты-времени интервью в одном поле
 * - Автоматическое извлечение ссылки и даты из текста
 * 
 * Функциональность:
 * - Поле ввода для комбинированных данных (ссылка + дата-время)
 * - Поддержка различных форматов даты-времени
 * - Поддержка кастомной длительности интервью (в скобках)
 * - Информационная секция с примерами форматов
 * - Валидация введенных данных
 * - Отправка данных на сервер для создания инвайта
 * 
 * Связи:
 * - invites/page.tsx: открывается при клике на "Создать инвайт"
 * - useToast: для отображения уведомлений об успехе/ошибке
 * - API: отправка данных на /google-oauth/invites/create/combined/
 * 
 * Поведение:
 * - При открытии показывает пустое поле ввода
 * - При сохранении валидирует данные и отправляет на сервер
 * - После успешного создания закрывает модальное окно и очищает форму
 * - При ошибке показывает уведомление об ошибке
 * 
 * Форматы данных:
 * - Ссылка: https://huntflow.ru/my/org#/vacancy/[id]/filter/[id]/id/[id] или sandbox.huntflow.dev
 * - Дата-время: YYYY-MM-DD HH:MM, DD.MM.YYYY HH:MM, DD/MM/YYYY HH:MM
 * - Длительность: (1 час), (30 минут), (полчаса), (2 ч), (45 м)
 * 
 * TODO: Реализовать реальный API вызов вместо имитации
 */

'use client'

import { Box, Flex, Text, Button, Dialog, TextArea, Card, Separator } from "@radix-ui/themes"
import { PlusIcon, InfoCircledIcon } from "@radix-ui/react-icons"
import { useState } from "react"
import { useToast } from "@/components/Toast/ToastContext"
import { getApiUrl } from "@/lib/api"
import styles from './CreateInviteModal.module.css'

/**
 * getCsrfToken - получение CSRF токена из cookies
 * 
 * Функциональность:
 * - Извлекает CSRF токен из cookies браузера
 * - Используется для защиты от CSRF атак при отправке POST запросов
 * 
 * Используется для:
 * - Добавления заголовка X-CSRFToken в API запросы
 * 
 * @returns CSRF токен или null если не найден
 */
function getCsrfToken(): string | null {
  if (typeof document === 'undefined') return null // SSR: возвращаем null
  const name = 'csrftoken'
  let cookieValue = null
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';')
    // Ищем cookie с именем 'csrftoken'
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

/**
 * CreateInviteModalProps - интерфейс пропсов компонента CreateInviteModal
 * 
 * Структура:
 * - isOpen: флаг открытости модального окна
 * - onClose: обработчик закрытия модального окна
 * - onSave: обработчик успешного сохранения (опционально)
 */
interface CreateInviteModalProps {
  isOpen: boolean
  onClose: () => void
  onSave?: (data: { combined_data: string }) => void
}

/**
 * CreateInviteModal - компонент модального окна создания инвайта
 * 
 * Состояние:
 * - combinedData: комбинированные данные (ссылка + дата-время)
 * - isSubmitting: флаг отправки данных на сервер
 * 
 * Функциональность:
 * - Ввод комбинированных данных
 * - Валидация и отправка данных
 * - Отображение информации о форматах
 */
export default function CreateInviteModal({ isOpen, onClose, onSave }: CreateInviteModalProps) {
  // Хук для отображения уведомлений
  const toast = useToast()
  // Комбинированные данные: ссылка на кандидата и дата-время интервью
  const [combinedData, setCombinedData] = useState('')
  // Флаг отправки данных на сервер (для блокировки кнопки и показа индикатора)
  const [isSubmitting, setIsSubmitting] = useState(false)

  /**
   * handleSave - обработчик сохранения инвайта
   * 
   * Функциональность:
   * - Валидирует введенные данные
   * - Отправляет данные на сервер для создания инвайта
   * - Обрабатывает успех и ошибки
   * 
   * Поведение:
   * - Проверяет, что поле не пустое
   * - Показывает индикатор загрузки (isSubmitting)
   * - Отправляет данные на сервер (в текущей реализации - имитация)
   * - При успехе показывает уведомление, вызывает onSave, очищает форму и закрывает модальное окно
   * - При ошибке показывает уведомление об ошибке
   * 
   * Связи:
   * - API: /google-oauth/invites/create/combined/ (TODO: раскомментировать когда будет готов)
   * - toast: для отображения уведомлений
   * 
   * TODO: Раскомментировать реальный API вызов когда будет готов backend
   */
  const handleSave = async () => {
    // Валидация: проверяем, что поле не пустое
    if (!combinedData.trim()) {
      toast.showError('Ошибка', 'Поле не может быть пустым')
      return
    }

    setIsSubmitting(true) // Показываем индикатор загрузки
    try {
      // Имитация отправки на сервер (задержка 500мс)
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // TODO: Когда будет готов API, раскомментировать:
      /*
      const csrfToken = getCsrfToken() // Получаем CSRF токен для защиты
      const response = await fetch('/google-oauth/invites/create/combined/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          ...(csrfToken ? { 'X-CSRFToken': csrfToken } : {}), // Добавляем CSRF токен если есть
        },
        body: new URLSearchParams({
          combined_data: combinedData, // Отправляем комбинированные данные
        }),
        credentials: 'include', // Включаем cookies для аутентификации
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || 'Ошибка создания инвайта')
      }

      // Перенаправление на страницу деталей инвайта (если нужно)
      const redirectUrl = response.headers.get('Location')
      if (redirectUrl) {
        window.open(redirectUrl, '_blank') // Открываем в новой вкладке
      }
      */

      toast.showSuccess('Успешно', 'Инвайт успешно создан')
      
      // Вызываем обработчик успешного сохранения (если передан)
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
      setIsSubmitting(false) // Скрываем индикатор загрузки
    }
  }

  /**
   * handleClose - обработчик закрытия модального окна
   * 
   * Функциональность:
   * - Очищает форму
   * - Закрывает модальное окно
   * 
   * Поведение:
   * - Вызывается при клике на "Отмена" или закрытии модального окна
   * - Очищает введенные данные
   */
  const handleClose = () => {
    setCombinedData('') // Очищаем форму
    onClose() // Закрываем модальное окно
  }

  /**
   * Рендер компонента CreateInviteModal
   * 
   * Структура:
   * - Dialog: модальное окно Radix UI
   * - Основная форма: поле ввода комбинированных данных
   * - Информационная секция: примеры форматов ссылок и дат
   * - Кнопки: Отмена и Сохранить
   */
  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => {
      // При закрытии модального окна очищаем форму
      if (!open) {
        handleClose()
      }
    }}>
      <Dialog.Content style={{ maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto' }}>
        {/* Заголовок модального окна */}
        <Dialog.Title>
          <Flex align="center" gap="2">
            <PlusIcon width={20} height={20} />
            Создание инвайта
          </Flex>
        </Dialog.Title>

        <Flex gap="4" direction="column" mt="4">
          {/* Основная форма ввода данных
              - Поле для ввода ссылки на кандидата и даты-времени интервью
              - Поддержка различных форматов даты-времени
              - Поддержка кастомной длительности интервью */}
          <Card>
            <Box p="4">
              <Flex direction="column" gap="4">
                <Box>
                  <Text size="2" weight="medium" mb="2" as="div">
                    Ссылка на кандидата и дата-время интервью
                  </Text>
                  {/* TextArea для ввода комбинированных данных
                      - placeholder содержит примеры форматов
                      - monospace шрифт для лучшей читаемости ссылок и дат
                      - 8 строк для удобного ввода */}
                  <TextArea
                    placeholder="Вставьте ссылку и дата-время в одном поле...

Примеры:
https://huntflow.ru/my/org#/vacancy/123/filter/456/id/789
2025-09-15 14:00
2025-09-15 14:00 (1 час)
2025-09-15 14:00 (30 минут)"
                    value={combinedData}
                    onChange={(e) => setCombinedData(e.target.value)} // Обновляем значение при вводе
                    rows={8}
                    style={{ fontFamily: 'monospace', fontSize: '13px' }} // Monospace для лучшей читаемости
                  />
                  {/* Подсказка о форматах данных */}
                  <Text size="1" color="gray" mt="2" as="div">
                    Вставьте ссылку на кандидата и дата-время интервью в одном поле. Система автоматически извлечет ссылку и дату. 
                    Для указания кастомной длительности добавьте в скобках: (1 час), (30 минут), (полчаса), (2 ч), (45 м).
                  </Text>
                </Box>
              </Flex>
            </Box>
          </Card>

          {/* Информационная секция
              - Примеры форматов ссылок на кандидата (Sandbox и Production)
              - Примеры форматов даты-времени
              - Пример заполнения */}
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
