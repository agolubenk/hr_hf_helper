/**
 * Конфигурация модулей/приложений админки.
 * Навигация и главная страница группируются по этим модулям.
 */

export interface AdminModuleItem {
  href: string
  label: string
}

export interface AdminModule {
  id: string
  label: string
  description?: string
  items: AdminModuleItem[]
}

export const ADMIN_MODULES: AdminModule[] = [
  {
    id: 'accounts',
    label: 'Учётные записи',
    description: 'Пользователи и группы доступа',
    items: [
      { href: '/admin/users', label: 'Пользователи' },
      { href: '/admin/groups', label: 'Группы' },
    ],
  },
  {
    id: 'vacancies',
    label: 'Вакансии',
    description: 'Вакансии и зарплатные вилки',
    items: [
      { href: '/vacancies', label: 'Список вакансий' },
      { href: '/vacancies/salary-ranges', label: 'Зарплатные вилки' },
    ],
  },
  {
    id: 'recruiting',
    label: 'Рекрутинг',
    description: 'Интервью, инвайты, интервьюеры',
    items: [
      { href: '/invites', label: 'Интервью (инвайты)' },
      { href: '/interviewers', label: 'Интервьюеры' },
      { href: '/hiring-requests', label: 'Заявки' },
    ],
  },
  {
    id: 'reporting',
    label: 'Отчётность',
    description: 'План найма, отчёты по компании',
    items: [
      { href: '/reporting', label: 'Главная отчётности' },
      { href: '/reporting/hiring-plan', label: 'План найма' },
      { href: '/reporting/company', label: 'По компании' },
    ],
  },
  {
    id: 'company',
    label: 'Настройки компании',
    description: 'Общие настройки, оргструктура, рекрутинг',
    items: [
      { href: '/company-settings', label: 'Общие' },
      { href: '/company-settings/org-structure', label: 'Оргструктура' },
      { href: '/company-settings/grades', label: 'Грейды' },
      { href: '/company-settings/recruiting/stages', label: 'Этапы найма' },
    ],
  },
  {
    id: 'integrations',
    label: 'Интеграции',
    description: 'Huntflow, календарь, вики',
    items: [
      { href: '/huntflow', label: 'Huntflow' },
      { href: '/calendar', label: 'Календарь' },
      { href: '/wiki', label: 'Вики' },
    ],
  },
]
