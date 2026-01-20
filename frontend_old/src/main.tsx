import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import './index.css'
import App from './App.tsx'
import { initTheme } from './utils/themeManager'
import { initFloatingLabels } from './utils/floatingLabelsHelper'

// Инициализация темы при загрузке
initTheme();

// Инициализация Bootstrap JS - делаем доступным глобально
if (typeof window !== 'undefined') {
  // @ts-ignore - Bootstrap types may not be available
  import('bootstrap').then(bootstrap => {
    (window as any).bootstrap = bootstrap;
    
    // Функция для инициализации всех dropdowns
    const initAllDropdowns = () => {
      const dropdownElements = document.querySelectorAll('[data-bs-toggle="dropdown"]');
      dropdownElements.forEach(element => {
        try {
          const existing = bootstrap.Dropdown.getInstance(element);
          if (existing) {
            existing.dispose();
          }
          new bootstrap.Dropdown(element, {
            boundary: 'viewport'
          });
        } catch (e) {
          console.warn('Failed to initialize dropdown:', e);
        }
      });
    };
    
    // Инициализируем сразу, если DOM готов
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        setTimeout(initAllDropdowns, 100);
        setTimeout(initFloatingLabels, 150); // Инициализация плавающих лейблов
      });
    } else {
      setTimeout(initAllDropdowns, 100);
      setTimeout(initFloatingLabels, 150); // Инициализация плавающих лейблов
    }
    
    // Инициализируем при изменении DOM (для динамически добавленных элементов)
    const observer = new MutationObserver(() => {
      initAllDropdowns();
      initFloatingLabels(); // Инициализация плавающих лейблов при изменении DOM
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }).catch(err => {
    console.error('Failed to load Bootstrap:', err);
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Инициализация плавающих лейблов после монтирования React
setTimeout(() => {
  initFloatingLabels();
}, 100);
