/**
 * Утилита для инициализации Bootstrap компонентов
 */

let bootstrapInstance: any = null;

/**
 * Получает экземпляр Bootstrap
 */
export async function getBootstrap() {
  if (bootstrapInstance) {
    return bootstrapInstance;
  }
  
  try {
    // Пробуем импортировать Bootstrap как модуль
    bootstrapInstance = await import('bootstrap');
    return bootstrapInstance;
  } catch (e) {
    // Если не получилось, пробуем через window
    if (typeof window !== 'undefined' && (window as any).bootstrap) {
      bootstrapInstance = (window as any).bootstrap;
      return bootstrapInstance;
    }
    throw new Error('Bootstrap is not available');
  }
}

/**
 * Инициализирует все dropdowns на странице
 */
export async function initAllDropdowns() {
  const bootstrap = await getBootstrap();
  
  const dropdownElements = document.querySelectorAll('[data-bs-toggle="dropdown"]');
  const dropdownList: any[] = [];
  
  dropdownElements.forEach(element => {
    try {
      // Проверяем, не инициализирован ли уже
      const existing = bootstrap.Dropdown.getInstance(element);
      if (existing) {
        existing.dispose();
      }
      
      // Инициализируем dropdown
      const dropdown = new bootstrap.Dropdown(element, {
        boundary: 'viewport'
      });
      dropdownList.push(dropdown);
    } catch (e) {
      console.warn('Failed to initialize dropdown:', element, e);
    }
  });
  
  return dropdownList;
}

/**
 * Инициализирует dropdown для конкретного элемента
 */
export async function initDropdown(element: HTMLElement) {
  const bootstrap = await getBootstrap();
  
  try {
    const existing = bootstrap.Dropdown.getInstance(element);
    if (existing) {
      existing.dispose();
    }
    
    return new bootstrap.Dropdown(element, {
      boundary: 'viewport'
    });
  } catch (e) {
    console.warn('Failed to initialize dropdown:', e);
    return null;
  }
}

