'use client'

import AppLayout from "@/components/AppLayout"
import { Box } from "@radix-ui/themes"
import { useParams, useRouter } from "next/navigation"
import VacancyDetailHeader from "@/components/vacancies/VacancyDetailHeader"
import BasicInfoSection from "@/components/vacancies/BasicInfoSection"
import TransferStagesSection from "@/components/vacancies/TransferStagesSection"
import RelatedSections from "@/components/vacancies/RelatedSections"
import InterviewersSection from "@/components/vacancies/InterviewersSection"
import AnalysisPromptSection from "@/components/vacancies/AnalysisPromptSection"
import SalaryRangesSection from "@/components/vacancies/SalaryRangesSection"
import styles from './vacancy-detail.module.css'

// Моковые данные вакансии
const mockVacancy = {
  id: 3936868,
  title: 'Frontend Engineer (React)',
  status: 'active',
  recruiter: 'Andrei Golubenko',
  technologies: ['JavaScript', 'TypeScript', 'React', 'Redux', 'RxJS', 'WebGL'],
  huntflowId: '3936868',
  stages: {
    hrScreening: {
      name: 'HR Screening',
      assignStage: 'HR Screening',
      relatedSections: [
        { name: 'Ссылки на вакансии', icon: 'globe' },
        { name: 'Вопросы для интервью', icon: 'question' },
        { name: 'Промпт для анализа', icon: 'prompt' },
        { name: 'Интервьюеры', icon: 'interviewers' },
        { name: 'Обязательные участники', icon: 'interviewers' },
        { name: 'Зарплатные вилки', icon: 'money' }
      ]
    },
    techScreening: {
      name: 'Tech Screening',
      duration: '30 мин',
      inviteTitle: 'JS Tech Screening |',
      accompanyingText: 'Попрошу быть с камерой. Технический скрининг будет с секцией лайв-кодинга (нужно будет шарить экран). Если возникнут вопросы – на связи в телеграм [телеграм рекрутера]',
      assignStage: 'Tech Screening',
      forInterviewers: ''
    },
    techInterview: {
      name: 'Tech Interview',
      duration: '90 мин',
      inviteTitle: 'JS Final Interview |',
      accompanyingText: 'Попрошу быть с камерой. Интервью будет с секцией лайв-кодинга (нужно будет шарить экран). По вопросам на связи в телеграм [телеграм рекрутера]',
      assignStage: 'Tech Interview',
      forInterviewers: ''
    }
  },
  interviewers: [
    'Bondarenko Aleksei',
    'Dubrouski Anton',
    'Ivanou Yauheni',
    'Lebedzeu Yauheni',
    'Liashkovich Pavel',
    'Litavar Yahor',
    'Misiukevich Maksim',
    'Tsukanau Siarhei'
  ],
  mandatoryParticipants: [],
  analysisPrompt: `ВАЖНО: Отвечай ТОЛЬКО в формате JSON, без дополнительного текста.

ПРАВИЛА АНАЛИЗА:
1. Если информация не предоставлена в ответах, установи значение null.
2. Внимательно следи за контекстом и смыслом ответов.
3. Для каждого поля предоставь конкретный ответ и прямую цитату из текста кандидата.
4. Используй поле comment для любой дополнительной информации, не захваченной в основных полях.
5. Используй ТОЛЬКО поля, указанные в разделе "ПОЛЯ КАНДИДАТА В HUNTFLOW".
6. Все валюты и денежные суммы должны быть конвертированы в единый формат (USD, BYN, PLN), примеры сумм: 3000, 2500, 601.

ОСОБЫЕ ПРАВИЛА ДЛЯ SELECT ПОЛЕЙ:
- Для поля "Офис" используй только "Да" или "Нет".
- Для поля "Офисный формат" используй всю доступную информацию относительно формата работы в офисе.`,
  useCommonPrompt: false,
  commonPrompt: null,
  scorecard: {
    title: 'Scorecard FE',
    link: 'https://example.com/scorecard'
  },
  vacancyLinks: {
    belarus: 'https://example.com/vacancy/belarus',
    poland: 'https://example.com/vacancy/poland'
  },
  interviewQuestions: {
    belarus: [
      'Какие ваши зарплатные ожидания (с какой суммы вы готовы начинать общение)?',
      'Готовы ли к офисному формату работы (Минск)? Можете сориентировать по текущей локации (город)?',
      'Готовы, но было бы отлично, если бы была возможность удаленной работы или гибрид. Нахожусь в Минске',
      'Да',
      'Не понял вопроса, если связано с универом, то закончил уже(БГУИР КСиС ПОИТ), военный билет есть',
      'Военный билет есть',
      'Нет',
      'Компания столкнулась с серьезными финансовыми трудностями',
      'кратчайшие сроки после успешного собеса',
      'Наверное нет смысла перечислять мелкие библиотеки, из значимого это настройка SEO, NextJS, да на самом деле много всего, лучше вживую на собеседовании рассказать)',
      'начинающий middle'
    ],
    poland: [
      'Какие ваши зарплатные ожидания (с какой суммы готовы начинать общение, злотые, гросс)?',
      'У нас формат работы только из офиса (БЦ Q22). Вас это устраивает?',
      'Да',
      'Компания столкнулась с серьезными финансовыми трудностями',
      'готов начать в кратчайшие сроки после успешного собеса, готов к релокации',
      'Опыт работы как ИП есть, планирую работать по B2B или по договору umowa o pracę',
      'Наверное нет смысла перечислять мелкие библиотеки, из значимого это настройка SEO, NextJS, да на самом деле много всего, лучше вживую на собеседовании рассказать)',
      'начинающий middle'
    ]
  },
  salaryRanges: [
    { grade: 'Senior', usd: '$2500,00 - $3500,00', byn: '7383,00 - 10336,20 BYN', pln: '11995,95 - 16794,34 PLN', eur: '2845,17 - 3983,24 EUR', status: 'active' },
    { grade: 'Middle+', usd: '$1900,00 - $2500,00', byn: '5611,08 - 7383,00 BYN', pln: '9116,93 - 11995,95 PLN', eur: '2162,33 - 2845,17 EUR', status: 'active' },
    { grade: 'Middle', usd: '$1500,00 - $1900,00', byn: '4429,80 - 5611,08 BYN', pln: '7197,57 - 9116,93 PLN', eur: '1707,10 - 2162,33 EUR', status: 'active' },
    { grade: 'Junior+', usd: '$1000,00 - $1500,00', byn: '2953,20 - 4429,80 BYN', pln: '4798,38 - 7197,57 PLN', eur: '1138,07 - 1707,10 EUR', status: 'active' },
    { grade: 'Junior', usd: '$600,00 - $1000,00', byn: '1771,92 - 2953,20 BYN', pln: '2879,03 - 4798,38 PLN', eur: '682,84 - 1138,07 EUR', status: 'active' }
  ]
}

export default function VacancyDetailPage() {
  const params = useParams()
  const router = useRouter()
  const vacancyId = params.id as string

  const handleBack = () => {
    router.push('/vacancies')
  }

  const handleEdit = () => {
    router.push(`/vacancies/${vacancyId}/edit`)
  }

  return (
    <AppLayout pageTitle="Детальная информация о вакансии">
      <Box className={styles.vacancyDetailContainer}>
        <VacancyDetailHeader
          title={mockVacancy.title}
          onBack={handleBack}
          onEdit={handleEdit}
        />

        <BasicInfoSection vacancy={mockVacancy} />

        <TransferStagesSection stages={mockVacancy.stages} />

        <RelatedSections
          scorecard={mockVacancy.scorecard}
          vacancyLinks={mockVacancy.vacancyLinks}
          interviewQuestions={mockVacancy.interviewQuestions}
        />

        <AnalysisPromptSection 
          prompt={mockVacancy.analysisPrompt} 
          useCommonPrompt={mockVacancy.useCommonPrompt}
          commonPrompt={mockVacancy.commonPrompt}
        />

        <InterviewersSection 
          interviewers={mockVacancy.interviewers}
          title="Интервьюеры (только связанные с вакансией)"
        />

        <InterviewersSection 
          interviewers={mockVacancy.mandatoryParticipants}
          title="Обязательные участники тех. интервью (все сохраненные интервьюеры)"
        />

        <SalaryRangesSection salaryRanges={mockVacancy.salaryRanges} />
      </Box>
    </AppLayout>
  )
}
