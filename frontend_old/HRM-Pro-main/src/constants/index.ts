import { SubmenuItem } from '../types';

export const MODULES = {
  DASHBOARD: 'dashboard',
  EMPLOYEES: 'employees',
  RECRUITING: 'recruiting',
  ADAPTATION: 'adaptation',
  CB: 'cb',
  HROPS: 'hrops',
  LD: 'ld',
  PERFORMANCE: 'performance',
  OKR: 'okr',
  TIME: 'time',
  PROJECTS: 'projects',
  WIKI: 'wiki',
  CORPORATE: 'corporate',
  REPORTS: 'reports',
  SETTINGS: 'settings',
} as const;

export const TASK_TYPES = {
  INTERVIEW: 'interview',
  VACATION: 'vacation',
  TIMESHEET: 'timesheet',
  REPORT: 'report',
  MEETING: 'meeting',
  VACANCY: 'vacancy',
  TRAINING: 'training',
  BONUS: 'bonus',
  ADAPTATION: 'adaptation',
  STRUCTURE: 'structure',
  SICK: 'sick',
  PERFORMANCE: 'performance',
  PRESENTATION: 'presentation',
  HROPS: 'hrops',
  RECRUITING: 'recruiting',
  DOCUMENTS: 'documents',
  EVENT: 'event',
  SCHEDULE: 'schedule',
  ANALYTICS: 'analytics',
  COMPENSATION: 'compensation',
  DATABASE: 'database',
  SURVEY: 'survey',
  CUSTOM: 'custom'
} as const;

export const ICON_COLORS = {
  PRIMARY: 'text-primary',
  SUCCESS: 'text-success',
  WARNING: 'text-warning',
  INFO: 'text-info',
  DANGER: 'text-danger',
  SECONDARY: 'text-secondary'
};

export const LANGUAGES = {
  RU: 'ru',
  EN: 'en',
  KZ: 'kz'
} as const;

export const STORAGE_KEYS = {
  THEME: 'hrm_theme',
  LANGUAGE: 'hrm_language',
  COLLAPSED_SECTIONS: 'hrm_collapsed_sections',
  USER_PREFERENCES: 'hrm_user_preferences',
  FAVORITE_MODULES: 'hrm_favorite_modules',
  TASKS: 'hrm_tasks',
} as const;

export const moduleSubmenus: Record<string, SubmenuItem[]> = {
    [MODULES.DASHBOARD]: [],
    [MODULES.EMPLOYEES]: [
        { icon: 'bi-people', text: 'Все сотрудники', active: true },
        { icon: 'bi-person-badge', text: 'Профили' },
        { icon: 'bi-building', text: 'Отделы' },
        { icon: 'bi-diagram-3', text: 'Оргструктура' },
        { icon: 'bi-person-lines-fill', text: 'Контакты' }
    ],
    [MODULES.RECRUITING]: [
        { icon: 'bi-briefcase', text: 'Вакансии', active: true },
        { icon: 'bi-person-plus', text: 'Кандидаты' },
        { icon: 'bi-calendar-check', text: 'Интервью' },
        { icon: 'bi-clipboard-check', text: 'Оценка' },
        { icon: 'bi-graph-up', text: 'Воронка' }
    ],
    [MODULES.ADAPTATION]: [
        { icon: 'bi-person-check', text: 'Новички', active: true },
        { icon: 'bi-list-check', text: 'Планы' },
        { icon: 'bi-clipboard2-check', text: 'Чек-листы' },
        { icon: 'bi-person-workspace', text: 'Наставники' },
        { icon: 'bi-bar-chart', text: 'Прогресс' }
    ],
    [MODULES.CB]: [
        { icon: 'bi-speedometer2', text: 'Обзор', active: true },
        { icon: 'bi-cash-stack', text: 'Зарплаты' },
        { icon: 'bi-gift', text: 'Бонусы' },
        { icon: 'bi-award', text: 'Льготы' },
        { icon: 'bi-calculator', text: 'Калькулятор' },
        { icon: 'bi-file-earmark-bar-graph', text: 'Грейды' },
        { icon: 'bi-graph-up-arrow', text: 'Аналитика рынка' }
    ],
    [MODULES.HROPS]: [
        { icon: 'bi-gear-wide-connected', text: 'Процессы', active: true },
        { icon: 'bi-file-earmark-text', text: 'Документы' },
        { icon: 'bi-envelope', text: 'Заявки' },
        { icon: 'bi-shield-check', text: 'Compliance' },
        { icon: 'bi-robot', text: 'Автоматизация' }
    ],
    [MODULES.LD]: [
        { icon: 'bi-mortarboard', text: 'Курсы', active: true },
        { icon: 'bi-book', text: 'Программы' },
        { icon: 'bi-trophy', text: 'Сертификаты' },
        { icon: 'bi-people', text: 'Тренеры' },
        { icon: 'bi-calendar3', text: 'Расписание' }
    ],
    [MODULES.PERFORMANCE]: [
        { icon: 'bi-speedometer2', text: 'KPI', active: true },
        { icon: 'bi-star', text: 'Оценка' },
        { icon: 'bi-bullseye', text: 'Цели' },
        { icon: 'bi-chat-square-dots', text: 'Фидбек' },
        { icon: 'bi-arrow-up-right', text: 'Развитие' }
    ],
    [MODULES.OKR]: [
        { icon: 'bi-bullseye', text: 'Цели компании', active: true },
        { icon: 'bi-diagram-3', text: 'Каскадирование' },
        { icon: 'bi-bar-chart-line', text: 'Прогресс' },
        { icon: 'bi-flag', text: 'Ключевые результаты' },
        { icon: 'bi-clock-history', text: 'История' }
    ],
    [MODULES.TIME]: [
        { icon: 'bi-clock', text: 'Табель', active: true },
        { icon: 'bi-calendar-week', text: 'График' },
        { icon: 'bi-airplane', text: 'Отпуска' },
        { icon: 'bi-heart-pulse', text: 'Больничные' },
        { icon: 'bi-stopwatch', text: 'Переработки' }
    ],
    [MODULES.PROJECTS]: [
        { icon: 'bi-kanban', text: 'Все проекты', active: true },
        { icon: 'bi-list-task', text: 'Задачи' },
        { icon: 'bi-diagram-2', text: 'Roadmap' },
        { icon: 'bi-people-fill', text: 'Команды' },
        { icon: 'bi-pie-chart', text: 'Отчеты' }
    ],
    [MODULES.WIKI]: [
        { icon: 'bi-house-door', text: 'Главная', active: true },
        { icon: 'bi-folder2-open', text: 'Категории' },
        { icon: 'bi-file-text', text: 'Статьи' },
        { icon: 'bi-search', text: 'Поиск' },
        { icon: 'bi-clock-history', text: 'Недавние' }
    ],
    [MODULES.CORPORATE]: [
        { icon: 'bi-newspaper', text: 'Новости', active: true },
        { icon: 'bi-calendar-event', text: 'События' },
        { icon: 'bi-megaphone', text: 'Объявления' },
        { icon: 'bi-images', text: 'Галерея' },
        { icon: 'bi-info-circle', text: 'О компании' }
    ],
    [MODULES.REPORTS]: [
        { icon: 'bi-file-earmark-bar-graph', text: 'Дашборды', active: true },
        { icon: 'bi-file-earmark-excel', text: 'Экспорт' },
        { icon: 'bi-sliders', text: 'Конструктор' },
        { icon: 'bi-bookmark', text: 'Избранное' },
        { icon: 'bi-clock-history', text: 'История' }
    ],
    [MODULES.SETTINGS]: [
        { icon: 'bi-sliders', text: 'Общие', active: true },
        { icon: 'bi-people', text: 'Пользователи' },
        { icon: 'bi-shield-lock', text: 'Безопасность' },
        { icon: 'bi-plug', text: 'Интеграции' },
        { icon: 'bi-palette', text: 'Внешний вид' }
    ]
}; 