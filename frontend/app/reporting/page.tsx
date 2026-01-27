/**
 * ReportingPage (reporting/page.tsx) - Главная страница отчетности
 * 
 * Назначение:
 * - Отображение основных метрик и KPI по рекрутингу
 * - Дашборд с ключевыми показателями эффективности
 * - Быстрый доступ к разделам отчетности
 * 
 * Функциональность:
 * - HR метрики: интервьюеры, заявки, вакансии
 * - SLA и скорость: покрытие SLA, Time-to-Offer, Time-to-Hire
 * - Исполнение: заявки в срок, просроченные заявки
 * - Результаты: кандидаты, нанятые, проценты завершения
 * - Быстрые ссылки на разделы отчетности и связанные страницы
 * 
 * Связи:
 * - AppLayout: оборачивает страницу в общий layout
 * - useRouter: для навигации к разделам отчетности и связанным страницам
 * - Компоненты отчетности: ссылки на детальные страницы отчетов
 * 
 * Поведение:
 * - При загрузке отображает все метрики
 * - При клике на быстрые ссылки происходит переход на соответствующие страницы
 * - Метрики отображаются в виде карточек с иконками и значениями
 * 
 * TODO: Заменить моковые данные на реальные из API
 */

'use client'

import AppLayout from "@/components/AppLayout"
import { Box, Flex, Text, Card, Button } from "@radix-ui/themes"
import { BarChartIcon, PersonIcon, ClockIcon, CheckCircledIcon, ExclamationTriangleIcon, CalendarIcon, FileTextIcon, ArrowUpIcon } from "@radix-ui/react-icons"
import { useRouter } from "next/navigation"
import styles from './reporting.module.css'

/**
 * ReportingPage - компонент главной страницы отчетности
 * 
 * Функциональность:
 * - Отображает дашборд с основными метриками
 * - Предоставляет быстрый доступ к разделам отчетности
 */
export default function ReportingPage() {
  // Хук Next.js для программной навигации
  const router = useRouter()

  /**
   * metrics - моковые данные метрик для отображения
   * 
   * Структура метрик:
   * - HR метрики: интервьюеры, заявки, вакансии
   * - SLA метрики: покрытие SLA, активные SLA
   * - Скорость: среднее время до оффера, до найма, дни рекрутера
   * - Исполнение: заявки в срок, просроченные
   * - Результаты: кандидаты, нанятые, проценты завершения
   * 
   * TODO: Заменить на реальные данные из API
   */
  const metrics = {
    // HR метрики
    totalInterviewers: 23,
    activeInterviewers: 22,
    totalRequests: 38,
    plannedRequests: 5,
    inProcessRequests: 15,
    closedRequests: 12,
    cancelledRequests: 6,
    totalVacancies: 25,
    activeVacancies: 18,
    inactiveVacancies: 7,
    
    // SLA метрики
    totalSLAs: 38,
    activeSLAs: 35,
    slaCoverage: 92,
    
    // Скорость и исполнение
    avgTimeToOffer: 45,
    avgTimeToHire: 60,
    avgRecruiterDays: 25,
    onTimeRequests: 28,
    overdueRequests: 10,
    
    // Результаты
    totalCandidates: 45,
    hiredCandidates: 12,
    interviewCompletionRate: 85,
    offerAcceptanceRate: 78
  }

  /**
   * Рендер компонента страницы отчетности
   * 
   * Структура:
   * - AppLayout: оборачивает страницу в общий layout
   * - Заголовок с иконкой
   * - Секции метрик: HR метрики, SLA и скорость, Исполнение, Результаты
   * - Быстрые ссылки на разделы отчетности
   */
  return (
    <AppLayout pageTitle="Отчетность">
      <Box className={styles.container}>
        {/* Заголовок страницы отчетности
            - Иконка графика для визуального обозначения раздела
            - Название раздела */}
        <Flex align="center" gap="2" mb="4">
          <BarChartIcon width={24} height={24} />
          <Text size="6" weight="bold">Отчетность</Text>
        </Flex>

        {/* Секция основных HR метрик
            - Интервьюеры: активные и общее количество
            - Заявки: общее количество с разбивкой по статусам
            - Вакансии: активные и общее количество */}
        <Box mb="4">
          <Text size="4" weight="bold" mb="3" style={{ display: 'block' }}>
            HR метрики
          </Text>
          <Flex gap="4" wrap="wrap">
            {/* Карточка метрики: Интервьюеры
                - Отображает количество активных интервьюеров из общего числа
                - Иконка пользователя для визуального обозначения */}
            <Card className={styles.metricCard} style={{ flex: 1, minWidth: '250px' }}>
              <Flex direction="column" gap="2">
                <Flex align="center" gap="2">
                  <PersonIcon width={20} height={20} style={{ color: 'var(--accent-9)' }} />
                  <Text size="2" color="gray">Интервьюеры</Text>
                </Flex>
                <Text size="5" weight="bold">
                  {metrics.activeInterviewers} / {metrics.totalInterviewers}
                </Text>
                <Text size="1" color="gray">
                  Активных из общего числа
                </Text>
              </Flex>
            </Card>

            <Card className={styles.metricCard} style={{ flex: 1, minWidth: '250px' }}>
              <Flex direction="column" gap="2">
                <Flex align="center" gap="2">
                  <FileTextIcon width={20} height={20} style={{ color: 'var(--accent-9)' }} />
                  <Text size="2" color="gray">Заявки</Text>
                </Flex>
                <Text size="5" weight="bold">{metrics.totalRequests}</Text>
                <Flex gap="2" wrap="wrap">
                  <Text size="1" color="gray">Планируется: {metrics.plannedRequests}</Text>
                  <Text size="1" color="gray">В процессе: {metrics.inProcessRequests}</Text>
                  <Text size="1" color="gray">Закрыто: {metrics.closedRequests}</Text>
                </Flex>
              </Flex>
            </Card>

            <Card className={styles.metricCard} style={{ flex: 1, minWidth: '250px' }}>
              <Flex direction="column" gap="2">
                <Flex align="center" gap="2">
                  <FileTextIcon width={20} height={20} style={{ color: 'var(--accent-9)' }} />
                  <Text size="2" color="gray">Вакансии</Text>
                </Flex>
                <Text size="5" weight="bold">
                  {metrics.activeVacancies} / {metrics.totalVacancies}
                </Text>
                <Text size="1" color="gray">
                  Активных из общего числа
                </Text>
              </Flex>
            </Card>
          </Flex>
        </Box>

        {/* SLA и скорость */}
        <Box mb="4">
          <Text size="4" weight="bold" mb="3" style={{ display: 'block' }}>
            SLA и скорость
          </Text>
          <Flex gap="4" wrap="wrap">
            <Card className={styles.metricCard} style={{ flex: 1, minWidth: '250px' }}>
              <Flex direction="column" gap="2">
                <Flex align="center" gap="2">
                  <ClockIcon width={20} height={20} style={{ color: 'var(--accent-9)' }} />
                  <Text size="2" color="gray">Покрытие SLA</Text>
                </Flex>
                <Text size="5" weight="bold">{metrics.slaCoverage}%</Text>
                <Box style={{ width: '100%', height: '8px', background: 'var(--gray-4)', borderRadius: '4px', overflow: 'hidden' }}>
                  <Box 
                    style={{ 
                      width: `${metrics.slaCoverage}%`, 
                      height: '100%', 
                      background: 'var(--accent-9)',
                      borderRadius: '4px'
                    }} 
                  />
                </Box>
                <Text size="1" color="gray">
                  {metrics.activeSLAs} из {metrics.totalSLAs} активных SLA
                </Text>
              </Flex>
            </Card>

            <Card className={styles.metricCard} style={{ flex: 1, minWidth: '250px' }}>
              <Flex direction="column" gap="2">
                <Flex align="center" gap="2">
                  <ArrowUpIcon width={20} height={20} style={{ color: 'var(--accent-9)' }} />
                  <Text size="2" color="gray">Средний Time-to-Offer</Text>
                </Flex>
                <Text size="5" weight="bold">{metrics.avgTimeToOffer} дней</Text>
                <Text size="1" color="gray">
                  Среднее время до оффера
                </Text>
              </Flex>
            </Card>

            <Card className={styles.metricCard} style={{ flex: 1, minWidth: '250px' }}>
              <Flex direction="column" gap="2">
                <Flex align="center" gap="2">
                  <ArrowUpIcon width={20} height={20} style={{ color: 'var(--accent-9)' }} />
                  <Text size="2" color="gray">Средний Time-to-Hire</Text>
                </Flex>
                <Text size="5" weight="bold">{metrics.avgTimeToHire} дней</Text>
                <Text size="1" color="gray">
                  Среднее время до найма
                </Text>
              </Flex>
            </Card>

            <Card className={styles.metricCard} style={{ flex: 1, minWidth: '250px' }}>
              <Flex direction="column" gap="2">
                <Flex align="center" gap="2">
                  <CalendarIcon width={20} height={20} style={{ color: 'var(--accent-9)' }} />
                  <Text size="2" color="gray">Средние дни рекрутера</Text>
                </Flex>
                <Text size="5" weight="bold">{metrics.avgRecruiterDays} дней</Text>
                <Text size="1" color="gray">
                  Среднее время работы рекрутера
                </Text>
              </Flex>
            </Card>
          </Flex>
        </Box>

        {/* Исполнение */}
        <Box mb="4">
          <Text size="4" weight="bold" mb="3" style={{ display: 'block' }}>
            Исполнение
          </Text>
          <Flex gap="4" wrap="wrap">
            <Card className={styles.metricCard} style={{ flex: 1, minWidth: '250px' }}>
              <Flex direction="column" gap="2">
                <Flex align="center" gap="2">
                  <CheckCircledIcon width={20} height={20} style={{ color: '#10b981' }} />
                  <Text size="2" color="gray">В срок</Text>
                </Flex>
                <Text size="5" weight="bold" style={{ color: '#10b981' }}>
                  {metrics.onTimeRequests}
                </Text>
                <Text size="1" color="gray">
                  Заявок выполнено в срок
                </Text>
              </Flex>
            </Card>

            <Card className={styles.metricCard} style={{ flex: 1, minWidth: '250px' }}>
              <Flex direction="column" gap="2">
                <Flex align="center" gap="2">
                  <ExclamationTriangleIcon width={20} height={20} style={{ color: '#ef4444' }} />
                  <Text size="2" color="gray">Просрочено</Text>
                </Flex>
                <Text size="5" weight="bold" style={{ color: '#ef4444' }}>
                  {metrics.overdueRequests}
                </Text>
                <Text size="1" color="gray">
                  Заявок с просрочкой
                </Text>
              </Flex>
            </Card>

            <Card className={styles.metricCard} style={{ flex: 1, minWidth: '250px' }}>
              <Flex direction="column" gap="2">
                <Flex align="center" gap="2">
                  <ArrowUpIcon width={20} height={20} style={{ color: 'var(--accent-9)' }} />
                  <Text size="2" color="gray">Процент в срок</Text>
                </Flex>
                <Text size="5" weight="bold">
                  {Math.round((metrics.onTimeRequests / (metrics.onTimeRequests + metrics.overdueRequests)) * 100)}%
                </Text>
                <Text size="1" color="gray">
                  Доля заявок в срок
                </Text>
              </Flex>
            </Card>
          </Flex>
        </Box>

        {/* Результаты */}
        <Box mb="4">
          <Text size="4" weight="bold" mb="3" style={{ display: 'block' }}>
            Результаты
          </Text>
          <Flex gap="4" wrap="wrap">
            <Card className={styles.metricCard} style={{ flex: 1, minWidth: '250px' }}>
              <Flex direction="column" gap="2">
                <Flex align="center" gap="2">
                  <PersonIcon width={20} height={20} style={{ color: 'var(--accent-9)' }} />
                  <Text size="2" color="gray">Всего кандидатов</Text>
                </Flex>
                <Text size="5" weight="bold">{metrics.totalCandidates}</Text>
                <Text size="1" color="gray">
                  Кандидатов в системе
                </Text>
              </Flex>
            </Card>

            <Card className={styles.metricCard} style={{ flex: 1, minWidth: '250px' }}>
              <Flex direction="column" gap="2">
                <Flex align="center" gap="2">
                  <CheckCircledIcon width={20} height={20} style={{ color: '#10b981' }} />
                  <Text size="2" color="gray">Нанято</Text>
                </Flex>
                <Text size="5" weight="bold" style={{ color: '#10b981' }}>
                  {metrics.hiredCandidates}
                </Text>
                <Text size="1" color="gray">
                  Успешно нанятых кандидатов
                </Text>
              </Flex>
            </Card>

            <Card className={styles.metricCard} style={{ flex: 1, minWidth: '250px' }}>
              <Flex direction="column" gap="2">
                <Flex align="center" gap="2">
                  <ArrowUpIcon width={20} height={20} style={{ color: 'var(--accent-9)' }} />
                  <Text size="2" color="gray">Завершение интервью</Text>
                </Flex>
                <Text size="5" weight="bold">{metrics.interviewCompletionRate}%</Text>
                <Text size="1" color="gray">
                  Процент завершенных интервью
                </Text>
              </Flex>
            </Card>

            <Card className={styles.metricCard} style={{ flex: 1, minWidth: '250px' }}>
              <Flex direction="column" gap="2">
                <Flex align="center" gap="2">
                  <ArrowUpIcon width={20} height={20} style={{ color: 'var(--accent-9)' }} />
                  <Text size="2" color="gray">Принятие офферов</Text>
                </Flex>
                <Text size="5" weight="bold">{metrics.offerAcceptanceRate}%</Text>
                <Text size="1" color="gray">
                  Процент принятых офферов
                </Text>
              </Flex>
            </Card>
          </Flex>
        </Box>

        {/* Быстрые ссылки */}
        <Box>
          <Text size="4" weight="bold" mb="3" style={{ display: 'block' }}>
            Быстрый доступ
          </Text>
          <Flex gap="3" wrap="wrap">
            <Button
              size="3"
              variant="soft"
              onClick={() => router.push('/hiring-requests')}
            >
              <FileTextIcon width={16} height={16} />
              Заявки
            </Button>
            <Button
              size="3"
              variant="soft"
              onClick={() => router.push('/vacancies')}
            >
              <FileTextIcon width={16} height={16} />
              Вакансии
            </Button>
            <Button
              size="3"
              variant="soft"
              onClick={() => router.push('/interviewers')}
            >
              <PersonIcon width={16} height={16} />
              Интервьюеры
            </Button>
            <Button
              size="3"
              variant="soft"
              onClick={() => router.push('/company-settings/sla')}
            >
              <ClockIcon width={16} height={16} />
              SLA
            </Button>
            <Button
              size="3"
              variant="soft"
              onClick={() => router.push('/huntflow')}
            >
              <FileTextIcon width={16} height={16} />
              Huntflow
            </Button>
          </Flex>
        </Box>
      </Box>
    </AppLayout>
  )
}
