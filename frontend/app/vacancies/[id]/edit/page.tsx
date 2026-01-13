'use client'

import AppLayout from "@/components/AppLayout"
import { Box, Flex, Button } from "@radix-ui/themes"
import { useParams, useRouter } from "next/navigation"
import { useState } from "react"
import VacancyDetailHeader from "@/components/vacancies/VacancyDetailHeader"
import BasicInfoEditSection from "@/components/vacancies/edit/BasicInfoEditSection"
import TransferStagesEditSection from "@/components/vacancies/edit/TransferStagesEditSection"
import ScorecardEditSection from "@/components/vacancies/edit/ScorecardEditSection"
import VacancyLinksEditSection from "@/components/vacancies/edit/VacancyLinksEditSection"
import InterviewQuestionsEditSection from "@/components/vacancies/edit/InterviewQuestionsEditSection"
import AnalysisPromptEditSection from "@/components/vacancies/edit/AnalysisPromptEditSection"
import InterviewersEditSection from "@/components/vacancies/edit/InterviewersEditSection"
import SalaryRangesEditSection from "@/components/vacancies/edit/SalaryRangesEditSection"
import styles from './edit.module.css'

// Моковые данные вакансии
const mockVacancy = {
  id: 3936868,
  title: 'Frontend Engineer (React)',
  status: 'active' as 'active' | 'inactive',
  recruiter: 'andrei.golubenko',
  technologies: 'JavaScript, TypeScript, React, Redux, RxJS, WebGL',
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
      duration: '30',
      inviteTitle: 'JS Tech Screening |',
      accompanyingText: 'Попрошу быть с камерой. Технический скрининг будет с секцией лайв-кодинга (нужно будет шарить экран). Если возникнут вопросы – на связи в телеграм [телеграм рекрутера]',
      assignStage: 'Tech Screening',
      forInterviewers: ''
    },
    techInterview: {
      name: 'Tech Interview',
      duration: '90',
      inviteTitle: 'JS Final Interview |',
      accompanyingText: 'Попрошу быть с камерой. Интервью будет с секцией лайв-кодинга (нужно будет шарить экран). По вопросам на связи в телеграм [телеграм рекрутера]',
      assignStage: 'Final Interview',
      forInterviewers: ''
    }
  },
  interviewers: [
    { id: 1, name: 'Bondarenko Aleksei', email: 'aleksei.bondarenko@softnetix.io', selected: true },
    { id: 2, name: 'Dubrouski Anton', email: 'anton.dubrouski@softnetix.io', selected: true },
    { id: 3, name: 'Ivanou Yauheni', email: 'yauheni.ivanou@softnetix.io', selected: true },
    { id: 4, name: 'Lebedzeu Yauheni', email: 'yauheni.lebedzeu@softnetix.io', selected: true },
    { id: 5, name: 'Liashkovich Pavel', email: 'pl@softnetix.io', selected: true },
    { id: 6, name: 'Litavar Yahor', email: 'yahor.litavar@softnetix.io', selected: true },
    { id: 7, name: 'Misiukevich Maksim', email: 'maksim.misiukevich@softnetix.io', selected: true },
    { id: 8, name: 'Tsukanau Siarhei', email: 'siarhei.tsukanau@softnetix.io', selected: true },
    { id: 9, name: 'Akimau Artur', email: 'arthur.akimov@softnetix.io', selected: false },
    { id: 10, name: 'Berezavik Roman', email: 'rb@softnetix.io', selected: false },
    { id: 11, name: 'Churyla Uladzislau', email: 'uladzislau.churyla@softnetix.io', selected: false },
    { id: 12, name: 'Haponau Pavel', email: 'pavel.haponau@softnetix.io', selected: false },
    { id: 13, name: 'Krauchanka Pavel', email: 'pavel.kravchenko@softnetix.io', selected: false },
    { id: 14, name: 'Tkachenka Ryhor', email: 'ryhor.tkachenka@softnetix.io', selected: false },
    { id: 15, name: 'Varabei Ivan', email: 'ivan.varabei@softnetix.io', selected: false },
    { id: 16, name: 'Baber Yauheni', email: 'cto@softnetix.io', selected: false },
    { id: 17, name: 'Torop Mikita', email: 'mikita.torap@softnetix.io', selected: false },
    { id: 18, name: 'Voitas Artsiom', email: 'artsiom.voitas@softnetix.io', selected: false },
    { id: 19, name: 'Babrou Anton', email: 'anton.babrou@softnetix.io', selected: false },
    { id: 20, name: 'Borykau Aleh', email: 'aleh.borykau@softnetix.io', selected: false },
    { id: 21, name: 'Hamza Yauheni', email: 'yauheni.hamza@softnetix.io', selected: false },
    { id: 22, name: 'Koipash Alena', email: 'alena.koipash@softnetix.io', selected: false },
    { id: 23, name: 'Petravets Ilya', email: 'ilya.petravets@softnetix.io', selected: false }
  ],
  mandatoryParticipants: [
    { id: 1, name: 'Bondarenko Aleksei', email: 'aleksei.bondarenko@softnetix.io', selected: false },
    { id: 2, name: 'Dubrouski Anton', email: 'anton.dubrouski@softnetix.io', selected: false },
    { id: 3, name: 'Ivanou Yauheni', email: 'yauheni.ivanou@softnetix.io', selected: false },
    { id: 4, name: 'Lebedzeu Yauheni', email: 'yauheni.lebedzeu@softnetix.io', selected: false },
    { id: 5, name: 'Liashkovich Pavel', email: 'pl@softnetix.io', selected: false },
    { id: 6, name: 'Litavar Yahor', email: 'yahor.litavar@softnetix.io', selected: false },
    { id: 7, name: 'Misiukevich Maksim', email: 'maksim.misiukevich@softnetix.io', selected: false },
    { id: 8, name: 'Tsukanau Siarhei', email: 'siarhei.tsukanau@softnetix.io', selected: false },
    { id: 9, name: 'Akimau Artur', email: 'arthur.akimov@softnetix.io', selected: false },
    { id: 10, name: 'Berezavik Roman', email: 'rb@softnetix.io', selected: false },
    { id: 11, name: 'Churyla Uladzislau', email: 'uladzislau.churyla@softnetix.io', selected: false },
    { id: 12, name: 'Haponau Pavel', email: 'pavel.haponau@softnetix.io', selected: false },
    { id: 13, name: 'Krauchanka Pavel', email: 'pavel.kravchenko@softnetix.io', selected: false },
    { id: 14, name: 'Tkachenka Ryhor', email: 'ryhor.tkachenka@softnetix.io', selected: false },
    { id: 15, name: 'Varabei Ivan', email: 'ivan.varabei@softnetix.io', selected: false },
    { id: 16, name: 'Baber Yauheni', email: 'cto@softnetix.io', selected: false },
    { id: 17, name: 'Torop Mikita', email: 'mikita.torap@softnetix.io', selected: false },
    { id: 18, name: 'Voitas Artsiom', email: 'artsiom.voitas@softnetix.io', selected: false },
    { id: 19, name: 'Babrou Anton', email: 'anton.babrou@softnetix.io', selected: false },
    { id: 20, name: 'Borykau Aleh', email: 'aleh.borykau@softnetix.io', selected: false },
    { id: 21, name: 'Hamza Yauheni', email: 'yauheni.hamza@softnetix.io', selected: false },
    { id: 22, name: 'Koipash Alena', email: 'alena.koipash@softnetix.io', selected: false },
    { id: 23, name: 'Petravets Ilya', email: 'ilya.petravets@softnetix.io', selected: false }
  ],
  analysisPrompt: `Ты - HR-аналитик, который анализирует ответы кандидатов на вопросы рекрутера. Твоя задача - проанализировать ответы кандидата и извлечь структурированную информацию в формате JSON.`,
  useCommonPrompt: false,
  scorecard: {
    title: '| Scorecard FE',
    link: 'https://docs.google.com/spreadsheets/d/1Zz61HtsXAWvfHtlTucfJQnJEDCKLwcVRybmT9BHfZqg/edit?gi'
  },
  vacancyLinks: {
    belarus: 'https://doc.clickup.com/37460873/p/h/13q6w9-123495/8aa71270e661e6c',
    poland: 'https://doc.clickup.com/37460873/d/h/13q6w9-86315/10d819efd7c6b85'
  },
  interviewQuestions: {
    belarus: `6. Есть ли в личных планах релокация?
7. Есть ли военный билет?
8. Есть ли в личных планах релокация?
9. Есть ли военный билет?
10. Есть ли в личных планах релокация?
11. Получится ли завтра в 12:15 короткий скрининг на 30-40 минут?`,
    poland: `1. Какие ваши зарплатные ожидания (с какой суммы готовы начинать общение, злотые, гросс)?
2. У нас формат работы только из офиса (БЦ Q22). Вас это устраивает?
3. Да
4. Компания столкнулась с серьезными финансовыми трудностями
5. Как быстро готовы приступить к работе (включая переезд)?`
  },
  salaryRanges: [
    { id: 1, grade: 'Junior', minSalary: '600,00', maxSalary: '1000,00', status: 'active' },
    { id: 2, grade: 'Junior+', minSalary: '1000,00', maxSalary: '1500,00', status: 'active' },
    { id: 3, grade: 'Middle', minSalary: '1500,00', maxSalary: '1900,00', status: 'active' },
    { id: 4, grade: 'Middle+', minSalary: '1900,00', maxSalary: '2500,00', status: 'active' },
    { id: 5, grade: 'Senior', minSalary: '2500,00', maxSalary: '3500,00', status: 'active' }
  ]
}

export default function VacancyEditPage() {
  const params = useParams()
  const router = useRouter()
  const vacancyId = params.id as string

  const [formData, setFormData] = useState(mockVacancy)

  const handleBack = () => {
    router.push(`/vacancies/${vacancyId}`)
  }

  const handleSave = () => {
    // TODO: Сохранение данных
    console.log('Save vacancy:', formData)
    router.push(`/vacancies/${vacancyId}`)
  }

  const handleCancel = () => {
    router.push(`/vacancies/${vacancyId}`)
  }

  return (
    <AppLayout pageTitle="Редактирование вакансии">
      <Box className={styles.editContainer}>
        <VacancyDetailHeader
          title={formData.title}
          onBack={handleBack}
          onEdit={() => {}}
        />

        <BasicInfoEditSection
          data={formData}
          onChange={(data) => setFormData({ ...formData, ...data })}
        />

        <TransferStagesEditSection
          stages={formData.stages}
          onChange={(stages) => setFormData({ ...formData, stages })}
        />

        <ScorecardEditSection
          scorecard={formData.scorecard}
          onChange={(scorecard) => setFormData({ ...formData, scorecard })}
        />

        <VacancyLinksEditSection
          links={formData.vacancyLinks}
          onChange={(links) => setFormData({ ...formData, vacancyLinks: links })}
        />

        <InterviewQuestionsEditSection
          questions={formData.interviewQuestions}
          onChange={(questions) => setFormData({ ...formData, interviewQuestions: questions })}
        />

        <AnalysisPromptEditSection
          prompt={formData.analysisPrompt}
          useCommonPrompt={formData.useCommonPrompt}
          onChange={(prompt) => setFormData({ ...formData, analysisPrompt: prompt })}
          onUseCommonPromptChange={(useCommon) => setFormData({ ...formData, useCommonPrompt: useCommon })}
        />

        <InterviewersEditSection
          interviewers={formData.interviewers}
          title="Интервьюеры (только связанные с вакансией)"
          subtitle="Интервьюеры"
          helpText="Интервьюеры, привязанные к вакансии"
          onChange={(interviewers) => setFormData({ ...formData, interviewers })}
        />

        <InterviewersEditSection
          interviewers={formData.mandatoryParticipants}
          title="Обязательные участники тех. интервью (все сохраненные интервьюеры)"
          subtitle="Обязательные участники тех. интервью"
          helpText="Интервьюеры, которые обязательно должны участвовать в техническом интервью"
          onChange={(participants) => setFormData({ ...formData, mandatoryParticipants: participants })}
        />

        <SalaryRangesEditSection
          salaryRanges={formData.salaryRanges}
          onChange={(ranges) => setFormData({ ...formData, salaryRanges: ranges })}
        />

        <Flex justify="end" gap="3" mt="6" className={styles.actions}>
          <Button size="3" variant="soft" onClick={handleCancel}>
            Отмена
          </Button>
          <Button size="3" variant="solid" onClick={handleSave}>
            Сохранить
          </Button>
        </Flex>
      </Box>
    </AppLayout>
  )
}
