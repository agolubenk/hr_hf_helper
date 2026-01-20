// Утилита для работы с данными пользователя в localStorage

export interface UserData {
  name?: string;
  email?: string;
  phone?: string;
  telegram?: string;
  bio?: string;
  role?: string;
  avatar?: string;
  firstName?: string;
  lastName?: string;
}

export interface UserProfile extends UserData {
  selectedWidgetIds: string[];
}

const USER_STORAGE_KEY = 'hrm_user_profile';
const SELECTED_WIDGETS_KEY = 'hrm_selected_widgets';

// Получить данные пользователя
export function getUserData(): UserData {
  if (typeof window === 'undefined') {
    return {
      name: 'Админ Иванов',
      email: 'ivan.petrov@company.com',
      phone: '+7 (999) 123-45-67',
      telegram: '@ivanov_admin',
      role: 'Главный по тарелочкам в этой компании',
    };
  }

  try {
    const saved = localStorage.getItem(USER_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.warn('Failed to read user data from localStorage:', error);
  }

  // Значения по умолчанию
  return {
    name: 'Админ Иванов',
    email: 'ivan.petrov@company.com',
    phone: '+7 (999) 123-45-67',
    telegram: '@ivanov_admin',
    role: 'Главный по тарелочкам в этой компании',
  };
}

// Сохранить данные пользователя
export function saveUserData(userData: UserData): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
  } catch (error) {
    console.error('Failed to save user data to localStorage:', error);
  }
}

// Получить выбранные виджеты
export function getSelectedWidgets(): string[] {
  if (typeof window === 'undefined') {
    return ['salary', 'vacation', 'courses', 'projects'];
  }

  try {
    const saved = localStorage.getItem(SELECTED_WIDGETS_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.warn('Failed to read selected widgets from localStorage:', error);
  }

  // Значения по умолчанию
  return ['salary', 'vacation', 'courses', 'projects'];
}

// Сохранить выбранные виджеты
export function saveSelectedWidgets(widgetIds: string[]): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(SELECTED_WIDGETS_KEY, JSON.stringify(widgetIds));
  } catch (error) {
    console.error('Failed to save selected widgets to localStorage:', error);
  }
}

