import { Module } from '../types';
import { MODULES, ICON_COLORS } from '../constants';

// Локальное хранилище
export const storage = {
  get: (key: string) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },
  
  set: (key: string, value: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },
  
  remove: (key: string) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  },

  clear: () => {
    try {
      localStorage.clear();
      return true;
    } catch {
      return false;
    }
  },

  // Функция для тестирования сохранения
  test: () => {
    const testData = { test: 'data', timestamp: Date.now() };
    storage.set('test_key', testData);
    const retrieved = storage.get('test_key');
    storage.remove('test_key');
    return JSON.stringify(retrieved) === JSON.stringify(testData);
  }
};

// Работа с модулями
export const getModuleData = (): Module[] => [
  { key: MODULES.DASHBOARD, name: 'Дашборд', icon: 'bi-speedometer2', count: 'Обзор', color: ICON_COLORS.PRIMARY },
  { key: MODULES.EMPLOYEES, name: 'Сотрудники', icon: 'bi-people', count: '245 человек', color: ICON_COLORS.INFO },
  { key: MODULES.RECRUITING, name: 'Рекрутинг', icon: 'bi-person-plus', count: '18 вакансий', color: ICON_COLORS.SUCCESS },
  { key: MODULES.ADAPTATION, name: 'Адаптация', icon: 'bi-person-check', count: '7 новичков', color: ICON_COLORS.WARNING },
  { key: MODULES.CB, name: 'C&B', icon: 'bi-cash-stack', count: 'Компенсации', color: ICON_COLORS.DANGER },
  { key: MODULES.HROPS, name: 'HR Ops', icon: 'bi-gear-wide-connected', count: 'Процессы', color: ICON_COLORS.SECONDARY },
  { key: MODULES.LD, name: 'L&D', icon: 'bi-mortarboard', count: '34 курса', color: ICON_COLORS.PRIMARY },
  { key: MODULES.PERFORMANCE, name: 'KPI', icon: 'bi-graph-up', count: 'Q2 2025', color: ICON_COLORS.INFO },
  { key: MODULES.OKR, name: 'OKR', icon: 'bi-bullseye', count: 'Цели', color: ICON_COLORS.SUCCESS },
  { key: MODULES.TIME, name: 'Время', icon: 'bi-clock-history', count: 'Учет', color: ICON_COLORS.WARNING },
  { key: MODULES.PROJECTS, name: 'Проекты', icon: 'bi-kanban', count: '12 активных', color: ICON_COLORS.DANGER },
  { key: MODULES.WIKI, name: 'Wiki', icon: 'bi-book', count: 'База знаний', color: ICON_COLORS.SECONDARY },
  { key: MODULES.CORPORATE, name: 'Портал', icon: 'bi-globe', count: 'Корпоративный', color: ICON_COLORS.PRIMARY },
  { key: MODULES.REPORTS, name: 'Отчеты', icon: 'bi-file-earmark-text', count: 'Аналитика', color: ICON_COLORS.INFO },
  { key: MODULES.SETTINGS, name: 'Настройки', icon: 'bi-gear', count: 'Система', color: ICON_COLORS.SECONDARY }
]; 