'use client'

import AppLayout from "@/components/AppLayout"
import WikiDetailHeader from "@/components/wiki/WikiDetailHeader"
import WikiDetailContent from "@/components/wiki/WikiDetailContent"
import WikiDetailSidebar from "@/components/wiki/WikiDetailSidebar"
import WikiDetailHistory from "@/components/wiki/WikiDetailHistory"
import { Box, Flex } from "@radix-ui/themes"
import { useParams } from "next/navigation"
import styles from './wiki-detail.module.css'

export default function WikiDetailPage() {
  const params = useParams()
  const pageId = params.id as string

  // Моковые данные для конкретной страницы
  const wikiPage = {
    id: pageId,
    title: 'Архитектура продукта HR Helper',
    category: 'Архитектура',
    tags: ['Архитектура', '#architect'],
    author: 'Иван Петров',
    lastEditor: 'Мария Сидорова',
    created: '04.11.2025',
    lastEdited: '05.11.2025',
    content: {
      heading: 'Архитектура продукта HR Helper',
      sections: [
        {
          title: 'Основные модули',
          items: [
            '1. Управление пользователями и аутентификация (apps.accounts)',
            '2. Финансы и грейды (apps.finance)',
            '3. Вакансии и найм (apps.vacancies, apps.hiring_plan)',
            '4. Google Calendar интеграция (apps.google_oauth)',
            '5. AI-помощник (apps.gemini)',
            '6. Управление интервьюерами (apps.interviewers)',
            '7. Интеграции (apps.clickup_int, apps.notion_int)',
            '8. Настройки компании (apps.company_settings)',
            '9. Huntflow интеграция (apps.huntflow)',
          ],
        },
        {
          title: '1. Управление пользователями и аутентификация (apps.accounts)',
          items: [
            'Регистрация и авторизация пользователей',
            'Интеграция с Google OAuth',
            'Управление профилями и правами доступа',
            'Интеграции с внешними системами',
          ],
        },
        {
          title: '2. Финансы и грейды (apps.finance)',
          items: [
            'Управление грейдами компании',
            'Расчет зарплатных вилок',
            'Налоговые настройки и курсы валют',
            'Бенчмарки зарплат',
          ],
        },
        {
          title: '3. Вакансии и найм (apps.vacancies, apps.hiring_plan)',
          items: [
            'Создание и управление вакансиями',
            'План найма и заявки на найм',
            'Управление SLA найма',
            'Метрики и KPI найма',
          ],
        },
        {
          title: '4. Google Calendar интеграция (apps.google_oauth)',
          items: [
            'Синхронизация с Google Calendar',
            'Автоматическое создание инвайтов',
            'Управление слотами для интервью',
            'Chat-бот для работы с кандидатами',
          ],
        },
        {
          title: '5. AI-помощник (apps.gemini)',
          items: [
            'Интеграция с Google Gemini AI',
            'Помощь в составлении описаний вакансий',
            'Анализ резюме и кандидатов',
            'Генерация ответов',
          ],
        },
        {
          title: '6. Управление интервьюерами (apps.interviewers)',
          items: [
            'База интервьюеров',
            'Правила привлечения интервьюеров',
            'Автоматическое распределение нагрузки',
          ],
        },
        {
          title: '7. Интеграции (apps.clickup_int, apps.notion_int)',
          items: [
            'Синхронизация с ClickUp',
            'Синхронизация с Notion',
            'Импорт и экспорт данных',
          ],
        },
        {
          title: '8. Настройки компании (apps.company_settings)',
          items: [
            'Базовые настройки компании',
            'Управление активными грейдами',
            'Шаблоны отказов кандидатам',
            'Оргструктура',
          ],
        },
        {
          title: '9. Huntflow интеграция (apps.huntflow)',
          items: [
            'Синхронизация вакансий с Huntflow',
            'Импорт кандидатов',
            'Управление статусами',
          ],
        },
        {
          title: 'Взаимосвязи модулей',
          content: `┌─────────────────┐
│   Пользователи  │
└────────┬────────┘
         │
         ├──► Настройки компании
         │         │
         │         ├──► Грейды
         │         │
         │         └──► Шаблоны отказов
         │
         ├──► Вакансии
         │         │
         │         ├──► Финансы (вилки)
         │         │
         │         └──► План найма
         │                   │
         │                   └──► Интервьюеры
         │
         ├──► Google Calendar
         │         │
         │         ├──► Инвайты
         │         │
         │         └──► Chat-бот
         │
         └──► Интеграции
                   │
                   ├──► ClickUp
                   ├──► Notion
                   └──► Huntflow`,
        },
        {
          title: 'Технологический стек',
          items: [
            'Backend: Django 4.2, Python 3.13',
            'Frontend: Bootstrap 5, JavaScript (Vanilla)',
            'База данных: SQLite (разработка), PostgreSQL (продакшн)',
            'AI: Google Gemini API',
            'Интеграции: Google Calendar API, ClickUp API, Notion API, Huntflow API',
            'Task Queue: Celery с Redis',
          ],
        },
        {
          title: 'Принципы работы',
          items: [
            'Модульность — каждый модуль независим и может работать отдельно',
            'Единая точка входа — все настройки через настройки компании',
            'Иерархия зависимостей — четкая последовательность настройки компонентов',
            'Интеграции — открытая архитектура для подключения внешних систем',
          ],
        },
        {
          title: '',
          content: 'Подробнее о настройке каждого компонента читайте в соответствующих разделах.',
        },
      ],
    },
  }

  return (
    <AppLayout pageTitle="Wiki">
      <Box className={styles.wikiDetailContainer}>
        <WikiDetailHeader 
          title={wikiPage.title}
          category={wikiPage.category}
          tags={wikiPage.tags}
        />
        
        <Flex gap="4" className={styles.detailContent}>
          <Box className={styles.mainContent}>
            <WikiDetailContent content={wikiPage.content} />
          </Box>
          
          <Flex direction="column" gap="3" className={styles.sidebar}>
            <WikiDetailSidebar 
              pageId={pageId} 
              sections={wikiPage.content.sections}
            />
            <WikiDetailHistory
              author={wikiPage.author}
              lastEditor={wikiPage.lastEditor}
              lastEdited={wikiPage.lastEdited}
              created={wikiPage.created}
            />
          </Flex>
        </Flex>
      </Box>
    </AppLayout>
  )
}
