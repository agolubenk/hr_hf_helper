/**
 * Утилита для автоматической инициализации плавающих лейблов
 * Обеспечивает работу floating labels для полей с defaultValue/value
 */

export const initFloatingLabels = () => {
  // Обработка всех form-floating контейнеров
  const floatingContainers = document.querySelectorAll('.form-floating');
  
  floatingContainers.forEach((container) => {
    const input = container.querySelector('.form-control, .form-select') as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
    const label = container.querySelector('label');
    
    if (!input || !label) return;
    
    // Функция для проверки и обновления состояния
    const updateLabelState = () => {
      const hasValue = 
        (input instanceof HTMLInputElement && input.value && input.value !== '') ||
        (input instanceof HTMLSelectElement && input.value && input.value !== '') ||
        (input instanceof HTMLTextAreaElement && input.value && input.value !== '');
      
      if (hasValue || input === document.activeElement) {
        container.classList.add('has-value');
      } else {
        container.classList.remove('has-value');
      }
    };
    
    // Проверка при загрузке
    updateLabelState();
    
    // Обработка событий
    input.addEventListener('input', updateLabelState);
    input.addEventListener('change', updateLabelState);
    input.addEventListener('focus', updateLabelState);
    input.addEventListener('blur', updateLabelState);
    
    // Для select элементов
    if (input instanceof HTMLSelectElement) {
      input.addEventListener('change', updateLabelState);
    }
  });
};

// Автоматическая инициализация для динамически добавленных элементов
if (typeof window !== 'undefined') {
  // Повторная инициализация для динамически добавленных элементов
  const observer = new MutationObserver((mutations) => {
    let shouldUpdate = false;
    mutations.forEach((mutation) => {
      if (mutation.addedNodes.length > 0) {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) { // Element node
            const element = node as Element;
            if (element.classList?.contains('form-floating') || 
                element.querySelector?.('.form-floating')) {
              shouldUpdate = true;
            }
          }
        });
      }
    });
    if (shouldUpdate) {
      setTimeout(initFloatingLabels, 50);
    }
  });
  
  if (document.body) {
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
}

