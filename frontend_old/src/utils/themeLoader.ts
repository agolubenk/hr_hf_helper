/**
 * Theme Loader - динамическая загрузка CSS тем
 */

const themeStylesheets: Record<string, string> = {
  'orange-light': '/src/themes/orange/hybrid_themes_detailed.css',
  'orange-dark': '/src/themes/orange/hybrid_themes_detailed.css',
  'tomato-light': '/src/themes/tomato/tomato_complete_styles.css',
  'tomato-dark': '/src/themes/tomato/tomato_complete_styles.css',
  'blackberry-light': '/src/themes/blackberry/blackberry_complete_styles.css',
  'blackberry-dark': '/src/themes/blackberry/blackberry_complete_styles.css',
  'banana-light': '/src/themes/banana/banana_space_complete_styles.css',
  'banana-dark': '/src/themes/banana/banana_space_complete_styles.css',
};

const loadedThemes = new Set<string>();

/**
 * Загружает CSS файл темы динамически
 */
export function loadThemeCSS(themeId: string): void {
  // Если тема уже загружена, не загружаем повторно
  if (loadedThemes.has(themeId) || themeId === 'light' || themeId === 'dark') {
    return;
  }

  const stylesheetPath = themeStylesheets[themeId];
  if (!stylesheetPath) {
    return;
  }

  // Проверяем, не загружен ли уже этот CSS файл
  const existingLink = document.querySelector(`link[data-theme-css="${themeId}"]`);
  if (existingLink) {
    return;
  }

  // Создаем link элемент для загрузки CSS
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = stylesheetPath;
  link.setAttribute('data-theme-css', themeId);
  document.head.appendChild(link);

  loadedThemes.add(themeId);
}

/**
 * Удаляет все загруженные темы (кроме light и dark)
 */
export function unloadAllThemes(): void {
  const themeLinks = document.querySelectorAll('link[data-theme-css]');
  themeLinks.forEach(link => {
    link.remove();
  });
  loadedThemes.clear();
}

