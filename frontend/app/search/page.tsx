'use client'

import { Suspense } from 'react'
import AppLayout from '@/components/AppLayout'
import { Box, Flex, Text, Button } from '@radix-ui/themes'
import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation'

const SCOPE_LABELS: Record<string, string> = {
  all: 'Во всех данных',
  vacancies: 'Вакансии',
  candidates: 'Кандидаты',
  companies: 'Компании',
}

function SearchPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const q = searchParams.get('q') ?? ''
  const scope = searchParams.get('scope') ?? 'all'

  const setScope = (s: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (q) params.set('q', q)
    params.set('scope', s)
    router.push(`/search?${params.toString()}`)
  }

  const scopeLabel = (SCOPE_LABELS[scope] ?? scope) || 'Во всех данных'

  return (
    <AppLayout pageTitle="Поиск">
      <Box p="4">
        <Flex direction="column" gap="4">
          <Text size="3">
            Поиск: «{q || '—'}» — Область: <Text weight="medium">{scopeLabel}</Text>
          </Text>
          <Flex gap="2" wrap="wrap">
            <Button size="2" variant={scope === 'all' ? 'solid' : 'soft'} onClick={() => setScope('all')}>
              Показать везде
            </Button>
            <Button size="2" variant={scope === 'vacancies' ? 'solid' : 'soft'} onClick={() => setScope('vacancies')}>
              Только вакансии
            </Button>
            <Button size="2" variant={scope === 'candidates' ? 'solid' : 'soft'} onClick={() => setScope('candidates')}>
              Только кандидаты
            </Button>
            <Button size="2" variant={scope === 'companies' ? 'solid' : 'soft'} onClick={() => setScope('companies')}>
              Только компании
            </Button>
          </Flex>
          <Text size="2" color="gray">
            Страница результатов поиска. Здесь будут отображаться найденные вакансии, кандидаты и компании.
          </Text>
        </Flex>
      </Box>
    </AppLayout>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<AppLayout pageTitle="Поиск"><Box p="4"><Text>Загрузка…</Text></Box></AppLayout>}>
      <SearchPageContent />
    </Suspense>
  )
}
