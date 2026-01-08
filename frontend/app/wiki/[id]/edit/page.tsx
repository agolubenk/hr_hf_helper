'use client'

import AppLayout from "@/components/AppLayout"
import WikiEditForm from "@/components/wiki/WikiEditForm"
import { Box } from "@radix-ui/themes"
import { useParams } from "next/navigation"

export default function WikiEditPage() {
  const params = useParams()
  const pageId = params.id as string
  const isNew = pageId === 'new'

  // Моковые данные для редактирования (в реальном приложении будут загружаться с сервера)
  const wikiPage = isNew ? undefined : {
    id: pageId,
    title: 'Архитектура продукта HR Helper',
    slug: 'arhitektura-produkta-hr-helper',
    category: 'architect',
    relatedApp: '',
    tags: ['Архитектура', '#architect'],
    description: 'Описание архитектуры продукта HR Helper',
    content: `# Архитектура продукта HR Helper

## Основные модули

1. Управление пользователями и аутентификация (apps.accounts)
   - Регистрация и авторизация пользователей
   - Интеграция с Google OAuth
   - Управление профилями и правами доступа
   - Интеграции с внешними системами

2. Финансы и грейды (apps.finance)
   - Управление грейдами компании
   - Расчет зарплатных вилок
   - Налоговые настройки и курсы валют
   - Бенчмарки зарплат

...`,
    order: 0,
    isPublished: true,
  }

  return (
    <AppLayout pageTitle="Wiki">
      <Box>
        <WikiEditForm 
          initialData={wikiPage}
          isNew={isNew}
        />
      </Box>
    </AppLayout>
  )
}
