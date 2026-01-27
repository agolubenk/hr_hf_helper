/**
 * SearchPage (search/page.tsx) - Страница результатов глобального поиска
 * 
 * Назначение:
 * - Отображение результатов глобального поиска по приложению
 * - Фильтрация результатов по областям поиска (вакансии, кандидаты, компании)
 * - Управление областью поиска через URL параметры
 * 
 * Функциональность:
 * - Получение поискового запроса из URL параметра ?q=
 * - Получение области поиска из URL параметра ?scope=
 * - Переключение области поиска (все данные, вакансии, кандидаты, компании)
 * - Отображение текущего запроса и области поиска
 * - Кнопки переключения области поиска
 * 
 * Связи:
 * - AppLayout: оборачивает страницу в общий layout
 * - useSearchParams: получение параметров из URL (?q=, ?scope=)
 * - useRouter: для обновления URL при изменении области поиска
 * - GlobalSearch: компонент в Header, который может перенаправлять на эту страницу
 * 
 * Поведение:
 * - При загрузке читает параметры ?q= и ?scope= из URL
 * - При изменении области поиска обновляет URL параметр ?scope=
 * - Сохраняет поисковый запрос ?q= при переключении области
 * - В текущей реализации только показывает интерфейс (TODO: реализовать реальный поиск)
 * 
 * TODO: Реализовать реальный поиск и отображение результатов
 */

'use client'

import { Suspense } from 'react'
import AppLayout from '@/components/AppLayout'
import { Box, Flex, Text, Button } from '@radix-ui/themes'
import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation'

/**
 * SCOPE_LABELS - маппинг областей поиска на отображаемые названия
 * 
 * Используется для:
 * - Отображения понятного названия области поиска
 * - Валидации области поиска
 * 
 * Области:
 * - 'all': поиск во всех данных
 * - 'vacancies': поиск только в вакансиях
 * - 'candidates': поиск только в кандидатах
 * - 'companies': поиск только в компаниях
 */
const SCOPE_LABELS: Record<string, string> = {
  all: 'Во всех данных',
  vacancies: 'Вакансии',
  candidates: 'Кандидаты',
  companies: 'Компании',
}

/**
 * SearchPageContent - основной компонент содержимого страницы поиска
 * 
 * Функциональность:
 * - Читает параметры поиска из URL
 * - Отображает текущий запрос и область поиска
 * - Предоставляет кнопки переключения области поиска
 * - Обновляет URL при изменении области поиска
 */
function SearchPageContent() {
  // Получение параметров из URL
  const searchParams = useSearchParams()
  // Хук Next.js для программной навигации
  const router = useRouter()
  // Поисковый запрос из URL параметра ?q= (по умолчанию пустая строка)
  const q = searchParams.get('q') ?? ''
  // Область поиска из URL параметра ?scope= (по умолчанию 'all')
  const scope = searchParams.get('scope') ?? 'all'

  /**
   * setScope - установка области поиска
   * 
   * Функциональность:
   * - Обновляет URL параметр ?scope=
   * - Сохраняет поисковый запрос ?q= при переключении области
   * - Выполняет навигацию на обновленный URL
   * 
   * Поведение:
   * - Вызывается при клике на кнопку области поиска
   * - Сохраняет текущий запрос q в URL
   * - Обновляет scope в URL
   * - Выполняет переход на обновленный URL
   * 
   * @param s - новая область поиска ('all', 'vacancies', 'candidates', 'companies')
   */
  const setScope = (s: string) => {
    const params = new URLSearchParams(searchParams.toString())
    // Сохраняем поисковый запрос, если он есть
    if (q) params.set('q', q)
    // Устанавливаем новую область поиска
    params.set('scope', s)
    // Выполняем навигацию на обновленный URL
    router.push(`/search?${params.toString()}`)
  }

  /**
   * scopeLabel - получение отображаемого названия области поиска
   * 
   * Функциональность:
   * - Получает понятное название области из SCOPE_LABELS
   * - Если область не найдена - возвращает саму область или 'Во всех данных'
   * 
   * Поведение:
   * - Используется для отображения текущей области поиска
   * - Гарантирует, что всегда есть отображаемое название
   */
  const scopeLabel = (SCOPE_LABELS[scope] ?? scope) || 'Во всех данных'

  /**
   * Рендер компонента страницы поиска
   * 
   * Структура:
   * - AppLayout: оборачивает страницу в общий layout
   * - Отображение текущего запроса и области поиска
   * - Кнопки переключения области поиска
   * - Информационное сообщение о функциональности
   */
  return (
    <AppLayout pageTitle="Поиск">
      <Box p="4">
        <Flex direction="column" gap="4">
          {/* Отображение текущего поискового запроса и области поиска
              - q: поисковый запрос (или '—' если пустой)
              - scopeLabel: понятное название области поиска */}
          <Text size="3">
            Поиск: «{q || '—'}» — Область: <Text weight="medium">{scopeLabel}</Text>
          </Text>
          
          {/* Кнопки переключения области поиска
              - Каждая кнопка переключает область поиска
              - Активная кнопка имеет variant='solid', неактивная - 'soft'
              - При клике вызывается setScope с соответствующей областью */}
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
          
          {/* Информационное сообщение о функциональности страницы
              TODO: Заменить на реальные результаты поиска */}
          <Text size="2" color="gray">
            Страница результатов поиска. Здесь будут отображаться найденные вакансии, кандидаты и компании.
          </Text>
        </Flex>
      </Box>
    </AppLayout>
  )
}

/**
 * SearchPage - обертка для SearchPageContent с Suspense
 * 
 * Функциональность:
 * - Оборачивает SearchPageContent в Suspense для обработки асинхронной загрузки
 * - Показывает fallback (загрузку) пока компонент загружается
 * - Необходимо для использования useSearchParams() внутри компонента
 * 
 * Поведение:
 * - При загрузке показывает индикатор загрузки
 * - После загрузки отображает SearchPageContent
 * 
 * Причина использования Suspense:
 * - useSearchParams() требует обертки в Suspense для корректной работы с серверным рендерингом
 */
export default function SearchPage() {
  return (
    <Suspense fallback={<AppLayout pageTitle="Поиск"><Box p="4"><Text>Загрузка…</Text></Box></AppLayout>}>
      <SearchPageContent />
    </Suspense>
  )
}
