'use client'

import AppLayout from "@/components/AppLayout"
import WikiHeader from "@/components/wiki/WikiHeader"
import WikiFilters from "@/components/wiki/WikiFilters"
import WikiCategory from "@/components/wiki/WikiCategory"
import { Box, Flex } from "@radix-ui/themes"
import { useState } from "react"
import styles from './wiki.module.css'

interface WikiPage {
  id: string
  title: string
  description: string
  tags: string[]
  date: string
  category: string
}

export default function WikiPage() {
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Моковые данные страниц вики
  const wikiPages: WikiPage[] = [
    {
      id: '1',
      title: 'Архитектура продукта',
      description: 'Общая архитектура и компоненты системы HR Helper',
      tags: ['#architect'],
      date: '04.11.2025',
      category: 'Архитектура',
    },
    {
      id: '2',
      title: 'Первичная настройка компании',
      description: 'Пошаговая инструкция по первоначальной настройке компании в системе',
      tags: ['#настройка', '#финансы'],
      date: '03.11.2025',
      category: 'Настройка',
    },
    {
      id: '3',
      title: 'Настройка интервьюеров',
      description: 'Как добавить и настроить интервьюеров в системе',
      tags: ['#интервьюеры', '#настройка'],
      date: '02.11.2025',
      category: 'Настройка',
    },
    {
      id: '4',
      title: 'Управление пользователями',
      description: 'Добавление, редактирование и управление пользователями системы',
      tags: ['#пользователи', '#настройка'],
      date: '01.11.2025',
      category: 'Настройка',
    },
  ]

  // Все доступные теги
  const allTags = [
    { id: 'ai', label: '#ai', color: '#ef4444' },
    { id: 'architect', label: '#architect', color: '#ef4444' },
    { id: 'вакансии', label: '#вакансии', color: '#ef4444' },
    { id: 'интеграции', label: '#интеграции', color: '#84cc16' },
    { id: 'интервьюеры', label: '#интервьюеры', color: '#10b981' },
    { id: 'использование', label: '#использование', color: '#10b981' },
    { id: 'календарь', label: '#календарь', color: '#a855f7' },
    { id: 'метрики', label: '#метрики', color: '#f59e0b' },
    { id: 'настройка', label: '#настройка', color: '#3b82f6' },
    { id: 'пользователи', label: '#пользователи', color: '#6b7280' },
    { id: 'финансы', label: '#финансы', color: '#06b6d4' },
  ]
  
  // Фильтрация страниц
  const filteredPages = wikiPages.filter(page => {
    const matchesTag = !selectedTag || page.tags.some(tag => tag.toLowerCase() === selectedTag.toLowerCase())
    const matchesSearch = !searchQuery || 
      page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      page.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesTag && matchesSearch
  })

  // Группировка отфильтрованных страниц по категориям
  const categories = Array.from(new Set(filteredPages.map(page => page.category)))
  
  // Сортировка категорий: "Архитектура" первая
  const sortedCategories = [...categories].sort((a, b) => {
    if (a === 'Архитектура') return -1
    if (b === 'Архитектура') return 1
    return a.localeCompare(b)
  })

  // Группировка отфильтрованных страниц по категориям
  const groupedPages = sortedCategories.reduce((acc, category) => {
    const pages = filteredPages.filter(page => page.category === category)
    if (pages.length > 0) {
      acc[category] = pages
    }
    return acc
  }, {} as Record<string, WikiPage[]>)

  return (
    <AppLayout pageTitle="Wiki">
      <Box className={styles.wikiContainer}>
        <WikiHeader />
        <WikiFilters
          tags={allTags}
          selectedTag={selectedTag}
          onTagSelect={setSelectedTag}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
        
        <Box className={styles.wikiContent}>
          {Object.entries(groupedPages).map(([category, pages]) => (
            <WikiCategory
              key={category}
              category={category}
              pages={pages}
            />
          ))}
        </Box>
      </Box>
    </AppLayout>
  )
}
