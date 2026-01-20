/**
 * Theme Manager - система управления темами
 */

export type ThemeName = 
  | 'light'
  | 'dark'
  | 'orange-light' 
  | 'orange-dark'
  | 'tomato-light'
  | 'tomato-dark'
  | 'blackberry-light'
  | 'blackberry-dark'
  | 'banana-light'
  | 'banana-dark'
  | 'aqua-lime-light'
  | 'raspberry-moon-dark'
  | 'arugula-light'
  | 'arugula-dark';

export interface Theme {
  id: ThemeName;
  name: string;
  icon: string;
  fruitIcon: string; // Иконка фрукта для отображения в кнопке (эмодзи для dropdown)
  fruitImagePath: string; // Относительный путь к изображению фрукта (от папки themes)
  secondaryImagePath?: string; // Второе изображение для комбинированных тем (вода/луна) или солнце/луна для остальных
  dataTheme: string;
  mode: 'light' | 'dark';
}

export const themes: Theme[] = [
  { id: 'light', name: 'Light', icon: '☀️', fruitIcon: '☀️', fruitImagePath: 'classic/day.png', dataTheme: '', mode: 'light' },
  { id: 'dark', name: 'Dark', icon: '🌙', fruitIcon: '🌙', fruitImagePath: 'classic/night.png', dataTheme: '', mode: 'dark' },
  { id: 'aqua-lime-light', name: 'Aqua Lime Light', icon: '💧', fruitIcon: '🍋', fruitImagePath: 'aqua_lime/lime.png', secondaryImagePath: 'aqua_lime/water.png', dataTheme: 'water-lime-light', mode: 'light' },
  { id: 'raspberry-moon-dark', name: 'Raspberry Moon Dark', icon: '🌙', fruitIcon: '🫐', fruitImagePath: 'raspberry_moon/raspberry.png', secondaryImagePath: 'raspberry_moon/moon.png', dataTheme: 'raspberry-moon-dark', mode: 'dark' },
  { id: 'orange-light', name: 'Orange Light', icon: '🟠', fruitIcon: '🟠', fruitImagePath: 'orange/orange.png', secondaryImagePath: 'classic/sun.png', dataTheme: 'soft-black-light', mode: 'light' },
  { id: 'orange-dark', name: 'Orange Dark', icon: '🟧', fruitIcon: '🟧', fruitImagePath: 'orange/orange.png', secondaryImagePath: 'classic/moon.png', dataTheme: 'classic-energetic-dark', mode: 'dark' },
  { id: 'tomato-light', name: 'Tomato Light', icon: '🔴', fruitIcon: '🍅', fruitImagePath: 'tomato/tomato.png', secondaryImagePath: 'classic/sun.png', dataTheme: 'tomato-black-light', mode: 'light' },
  { id: 'tomato-dark', name: 'Tomato Dark', icon: '🟥', fruitIcon: '🍅', fruitImagePath: 'tomato/tomato.png', secondaryImagePath: 'classic/moon.png', dataTheme: 'classic-energetic-tomato-dark', mode: 'dark' },
  { id: 'blackberry-light', name: 'Blackberry Light', icon: '🟣', fruitIcon: '🫐', fruitImagePath: 'blackberry/blackberry.png', secondaryImagePath: 'classic/sun.png', dataTheme: 'blackberry-black-light', mode: 'light' },
  { id: 'blackberry-dark', name: 'Blackberry Dark', icon: '🟪', fruitIcon: '🫐', fruitImagePath: 'blackberry/blackberry.png', secondaryImagePath: 'classic/moon.png', dataTheme: 'classic-energetic-blackberry-dark', mode: 'dark' },
  { id: 'banana-light', name: 'Banana Light', icon: '🟡', fruitIcon: '🍌', fruitImagePath: 'banana/banana.png', secondaryImagePath: 'classic/sun.png', dataTheme: 'banana-black-light', mode: 'light' },
  { id: 'banana-dark', name: 'Banana Dark', icon: '🟨', fruitIcon: '🍌', fruitImagePath: 'banana/banana.png', secondaryImagePath: 'classic/moon.png', dataTheme: 'space-banana-dark', mode: 'dark' },
  { id: 'arugula-light', name: 'Arugula Light', icon: '🥬', fruitIcon: '🥬', fruitImagePath: 'arugula/argula.png', secondaryImagePath: 'classic/sun.png', dataTheme: 'rukkola-black-light', mode: 'light' },
  { id: 'arugula-dark', name: 'Arugula Dark', icon: '🌿', fruitIcon: '🥬', fruitImagePath: 'arugula/argula.png', secondaryImagePath: 'classic/moon.png', dataTheme: 'classic-energetic-rukkola-dark', mode: 'dark' },
];

/**
 * Получает полный URL для изображения фрукта темы
 */
export function getThemeFruitImageUrl(imagePath: string): string {
  if (!imagePath) return '';
  // В Vite файлы из public доступны по пути от корня
  // Копируем изображения в public/themes для доступа
  return `/themes/${imagePath}`;
}

const THEME_STORAGE_KEY = 'hrm_theme_name';

/**
 * Применяет тему к документу
 */
export function applyTheme(themeId: ThemeName): void {
  const theme = themes.find(t => t.id === themeId) || themes[0];
  
  // Удаляем все предыдущие data-theme атрибуты
  document.documentElement.removeAttribute('data-theme');
  
  // Применяем новую тему через data-theme (для кастомных тем)
  if (theme.dataTheme) {
    document.documentElement.setAttribute('data-theme', theme.dataTheme);
  }
  
  // Также устанавливаем data-bs-theme для Bootstrap (light/dark)
  document.documentElement.setAttribute('data-bs-theme', theme.mode);
  
  // Для темы "light" просто используем Bootstrap по умолчанию
  if (themeId === 'light') {
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.setAttribute('data-bs-theme', 'light');
  }
  
  // Для темы "dark" используем только Bootstrap dark
  if (themeId === 'dark') {
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.setAttribute('data-bs-theme', 'dark');
  }
  
  // Сохраняем в localStorage
  localStorage.setItem(THEME_STORAGE_KEY, themeId);
}

/**
 * Получает текущую тему из localStorage
 */
export function getCurrentTheme(): ThemeName {
  const saved = localStorage.getItem(THEME_STORAGE_KEY);
  return (saved && themes.some(t => t.id === saved)) ? saved as ThemeName : 'light';
}

/**
 * Инициализирует тему при загрузке страницы
 */
export function initTheme(): void {
  try {
    const currentTheme = getCurrentTheme();
    // Убеждаемся, что тема валидна
    if (themes.some(t => t.id === currentTheme)) {
      applyTheme(currentTheme);
    } else {
      // Если тема невалидна, сбрасываем на light
      applyTheme('light');
    }
  } catch (error) {
    console.error('Error initializing theme:', error);
    // В случае ошибки применяем light тему
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.setAttribute('data-bs-theme', 'light');
  }
}

