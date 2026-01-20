import { useState, useEffect } from 'react';
import type { ThemeName } from '../utils/themeManager';
import { themes, applyTheme, getCurrentTheme } from '../utils/themeManager';
import 'bootstrap-icons/font/bootstrap-icons.css';

interface ThemeSwitcherProps {
  showLabel?: boolean;
}

const ThemeSwitcher = ({ showLabel = false }: ThemeSwitcherProps) => {
  const [currentTheme, setCurrentTheme] = useState<ThemeName>(() => {
    try {
      return getCurrentTheme();
    } catch {
      return 'light';
    }
  });

  // Обновляем текущую тему при изменении в localStorage (синхронизация между вкладками)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'hrm_theme_name' && e.newValue) {
        try {
          const newTheme = e.newValue as ThemeName;
          if (themes.some(t => t.id === newTheme)) {
            setCurrentTheme(newTheme);
          }
        } catch {
          // Игнорируем ошибки
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Циклическое переключение тем
  const cycleTheme = () => {
    const currentIndex = themes.findIndex(t => t.id === currentTheme);
    const nextIndex = (currentIndex + 1) % themes.length;
    const nextTheme = themes[nextIndex];
    
    try {
      applyTheme(nextTheme.id);
      setCurrentTheme(nextTheme.id);
    } catch (error) {
      console.error('Error applying theme:', error);
      setCurrentTheme('light');
    }
  };

  const currentThemeData = themes.find(t => t.id === currentTheme) || themes[0];

  // Простая кнопка для циклического переключения
  return (
    <button
      className={`btn ${showLabel ? 'btn-outline-secondary' : 'quick-action-btn'}`}
      type="button"
      onClick={cycleTheme}
      title={`Текущая тема: ${currentThemeData.name}. Нажмите для переключения.`}
      style={{ position: 'relative', ...(showLabel ? {} : { width: '40px', height: '40px', padding: 0 }) }}
    >
      {showLabel ? (
        <>
          <span style={{ marginRight: '4px' }}>{currentThemeData.icon}</span>
          <span>{currentThemeData.name}</span>
        </>
      ) : (
        <i className="bi bi-palette-fill"></i>
      )}
      <span 
        className="theme-badge" 
        style={{
          position: 'absolute',
          top: '-6px',
          right: '-6px',
          background: 'var(--bs-primary, #0d6efd)',
          border: '2px solid var(--bs-body-bg, #fff)',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          pointerEvents: 'none'
        }}
      >
        {currentThemeData.icon}
      </span>
    </button>
  );
};

export default ThemeSwitcher;

