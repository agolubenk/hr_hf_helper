/**
 * Общие определения модулей системы
 */

export interface Module {
  key: string;
  name: string;
  icon: string;
  desc: string;
  color: string;
  is_required?: boolean;
}

// Обязательные модули, которые нельзя отключить
export const REQUIRED_MODULES = ['dashboard', 'employees', 'recruiting', 'wiki', 'settings'];

// Определение всех модулей системы в порядке отображения
export const ALL_MODULES: Module[] = [
  { key: 'dashboard', name: 'Дашборд', icon: 'bi-speedometer2', desc: 'Обзор', color: 'text-primary', is_required: true },
  { key: 'employees', name: 'Сотрудники', icon: 'bi-people', desc: '245 человек', color: 'text-info', is_required: true },
  { key: 'recruiting', name: 'Рекрутинг', icon: 'bi-person-plus', desc: '18 вакансий', color: 'text-success', is_required: true },
  { key: 'adaptation', name: 'Адаптация', icon: 'bi-person-check', desc: '7 новичков', color: 'text-warning', is_required: false },
  { key: 'cb', name: 'C&B', icon: 'bi-cash-stack', desc: 'Компенсации', color: 'text-danger', is_required: false },
  { key: 'hrops', name: 'HR Operations', icon: 'bi-gear-wide-connected', desc: 'Операции', color: 'text-secondary', is_required: false },
  { key: 'ld', name: 'L&D', icon: 'bi-mortarboard', desc: 'Обучение', color: 'text-primary', is_required: false },
  { key: 'performance', name: 'KPI и оценка', icon: 'bi-graph-up', desc: 'Производительность', color: 'text-info', is_required: false },
  { key: 'okr', name: 'OKR', icon: 'bi-bullseye', desc: 'Цели', color: 'text-success', is_required: false },
  { key: 'time', name: 'Учет времени', icon: 'bi-clock-history', desc: 'Время', color: 'text-warning', is_required: false },
  { key: 'projects', name: 'HR-проекты', icon: 'bi-kanban', desc: 'Проекты', color: 'text-danger', is_required: false },
  { key: 'wiki', name: 'Wiki', icon: 'bi-book', desc: 'База знаний', color: 'text-secondary', is_required: true },
  { key: 'corporate', name: 'Корпоративный портал', icon: 'bi-globe', desc: 'Портал', color: 'text-primary', is_required: false },
  { key: 'reports', name: 'Отчеты', icon: 'bi-file-earmark-text', desc: 'Аналитика', color: 'text-info', is_required: false },
  { key: 'settings', name: 'Настройки системы', icon: 'bi-gear', desc: 'Конфигурация', color: 'text-secondary', is_required: true }
];

/**
 * Получить активные модули в порядке их определения
 * @param activeModuleKeys - массив ключей активных модулей
 * @returns отфильтрованные модули в порядке определения
 */
export function getActiveModules(activeModuleKeys: string[]): Module[] {
  // Создаем Map для быстрого поиска
  const activeKeysSet = new Set(activeModuleKeys);
  
  // Фильтруем и сохраняем порядок из ALL_MODULES
  return ALL_MODULES.filter(module => activeKeysSet.has(module.key));
}

