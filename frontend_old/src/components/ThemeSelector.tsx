import { useState, useEffect, useRef, useId } from 'react';
import type { ThemeName } from '../utils/themeManager';
import { themes, applyTheme, getCurrentTheme, getThemeFruitImageUrl } from '../utils/themeManager';

interface ThemeSelectorProps {
  variant?: 'toggle' | 'dropdown';
  className?: string;
  allowedThemes?: ThemeName[]; // Список разрешенных тем
}

const ThemeSelector = ({ variant, className = '', allowedThemes }: ThemeSelectorProps) => {
  const uniqueId = useId().replace(/:/g, '-');
  const dropdownId = `themeSelectorDropdown-${uniqueId}`;
  const dropdownRef = useRef<HTMLButtonElement>(null);
  
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

  const handleThemeChange = (themeId: ThemeName) => {
    try {
      applyTheme(themeId);
      setCurrentTheme(themeId);
    } catch (error) {
      console.error('Error applying theme:', error);
    }
  };

  // Фильтруем темы, если указан список разрешенных
  const availableThemes = allowedThemes 
    ? themes.filter(t => allowedThemes.includes(t.id))
    : themes;

  // Если текущая тема не в списке разрешенных, выбираем первую разрешенную
  useEffect(() => {
    if (allowedThemes && !allowedThemes.includes(currentTheme)) {
      const firstAllowed = allowedThemes[0];
      if (firstAllowed) {
        handleThemeChange(firstAllowed);
      }
    }
  }, [allowedThemes]);

  // Определяем, сколько тем у нас есть
  const themeCount = availableThemes.length;
  
  // Если тем 2, показываем toggle
  // Если тем больше 2, показываем dropdown
  const shouldShowToggle = themeCount === 2;
  const shouldShowDropdown = themeCount > 2;

  // Если явно указан variant, используем его
  const displayVariant = variant || (shouldShowToggle ? 'toggle' : 'dropdown');

  if (displayVariant === 'toggle' && themeCount === 2) {
    // Toggle для двух тем
    const [theme1, theme2] = availableThemes;
    const isTheme1 = currentTheme === theme1.id;

    return (
      <div className={`theme-selector theme-selector-toggle ${className}`}>
        <div className="btn-group" role="group" aria-label="Выбор темы">
          <button
            type="button"
            className={`btn btn-sm ${isTheme1 ? 'btn-primary' : 'btn-outline-secondary'}`}
            onClick={() => handleThemeChange(theme1.id)}
            title={theme1.name}
          >
            <span className="me-1">{theme1.icon}</span>
            {theme1.name}
          </button>
          <button
            type="button"
            className={`btn btn-sm ${!isTheme1 ? 'btn-primary' : 'btn-outline-secondary'}`}
            onClick={() => handleThemeChange(theme2.id)}
            title={theme2.name}
          >
            <span className="me-1">{theme2.icon}</span>
            {theme2.name}
          </button>
        </div>
      </div>
    );
  }

  // Dropdown для более чем 2 тем
  const currentThemeData = availableThemes.find(t => t.id === currentTheme) || availableThemes[0];

  // Инициализация Bootstrap dropdown при монтировании
  useEffect(() => {
    if (displayVariant === 'dropdown' && dropdownRef.current) {
      const initBootstrap = async () => {
        // Используем window.bootstrap если доступен, иначе импортируем
        let bootstrap: any;
        if (typeof window !== 'undefined' && (window as any).bootstrap) {
          bootstrap = (window as any).bootstrap;
        } else {
          bootstrap = await import('bootstrap');
        }
        
        const dropdownElement = dropdownRef.current;
        if (dropdownElement) {
          setTimeout(() => {
            if (dropdownElement) {
              try {
                // Проверяем, не инициализирован ли уже
                const existingDropdown = bootstrap.Dropdown.getInstance(dropdownElement);
                if (existingDropdown) {
                  existingDropdown.dispose();
                }
                // Инициализируем dropdown
                new bootstrap.Dropdown(dropdownElement, {
                  boundary: 'viewport'
                });
              } catch (e) {
                console.warn('Failed to initialize theme selector dropdown:', e);
              }
            }
          }, 150);
        }
      };
      initBootstrap();
    }
  }, [displayVariant]);

  // Определяем иконку для центра кнопки (солнце для светлой темы, луна для темной)
  const centerIcon = currentThemeData.mode === 'light' ? 'bi-sun' : 'bi-moon';
  const fruitImageUrl = currentThemeData.fruitImagePath ? getThemeFruitImageUrl(currentThemeData.fruitImagePath) : '';
  const secondaryImageUrl = currentThemeData.secondaryImagePath ? getThemeFruitImageUrl(currentThemeData.secondaryImagePath) : '';
  const fruitIcon = currentThemeData.fruitIcon || currentThemeData.icon;

  return (
    <div className={`theme-selector theme-selector-dropdown ${className}`}>
      <div className="dropdown" style={{ position: 'relative' }}>
        <button
          ref={dropdownRef}
          className="quick-action-btn theme-btn"
          type="button"
          id={dropdownId}
          data-bs-toggle="dropdown"
          aria-expanded="false"
          title={currentThemeData.name}
        >
          {/* Центральная иконка (солнце/луна) */}
          <i className={`bi ${centerIcon}`}></i>
          
          {/* Иконка фрукта в правом верхнем углу - только фрукт/трава, без луны/солнца/воды */}
          {fruitImageUrl ? (
            <span className={`theme-fruit-icon ${currentThemeData.id.includes('blackberry') ? 'theme-fruit-icon-blackberry' : ''}`}>
              <img src={fruitImageUrl} alt={currentThemeData.name} className="theme-fruit-image" />
            </span>
          ) : (
            <span className="theme-fruit-icon">{fruitIcon}</span>
          )}
        </button>
        <ul className="dropdown-menu dropdown-menu-end" aria-labelledby={dropdownId}>
          {/* Светлые темы */}
          {availableThemes.filter(theme => theme.mode === 'light').map((theme) => {
            const themeFruitImageUrl = theme.fruitImagePath ? getThemeFruitImageUrl(theme.fruitImagePath) : '';
            const themeSecondaryImageUrl = theme.secondaryImagePath ? getThemeFruitImageUrl(theme.secondaryImagePath) : '';
            return (
              <li key={theme.id}>
                <button
                  className={`dropdown-item ${currentTheme === theme.id ? 'active' : ''}`}
                  type="button"
                  onClick={() => handleThemeChange(theme.id)}
                >
                  {themeFruitImageUrl ? (
                    <span className={`me-2 d-inline-block ${theme.id.includes('blackberry') ? 'theme-dropdown-icon-blackberry' : ''}`} style={{ width: '20px', height: '20px', borderRadius: '50%', overflow: 'visible', position: 'relative', verticalAlign: 'middle' }}>
                      <img src={themeFruitImageUrl} alt={theme.name} style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '50%' }} />
                      {themeSecondaryImageUrl && (
                        <span style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '12.8px', height: '12.8px', backgroundColor: 'var(--bs-body-bg)', borderRadius: '50%', border: '1.5px solid var(--bs-border-color)', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'visible', zIndex: 2 }}>
                          <img src={themeSecondaryImageUrl} alt={theme.name} style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '50%', transform: 'scale(1.22)' }} />
                        </span>
                      )}
                    </span>
                  ) : (
                    <span className="me-2">{theme.icon}</span>
                  )}
                  {theme.name}
                </button>
              </li>
            );
          })}
          {/* Разделитель */}
          {availableThemes.some(t => t.mode === 'light') && availableThemes.some(t => t.mode === 'dark') && (
            <li><hr className="dropdown-divider" /></li>
          )}
          {/* Темные темы */}
          {availableThemes.filter(theme => theme.mode === 'dark').map((theme) => {
            const themeFruitImageUrl = theme.fruitImagePath ? getThemeFruitImageUrl(theme.fruitImagePath) : '';
            const themeSecondaryImageUrl = theme.secondaryImagePath ? getThemeFruitImageUrl(theme.secondaryImagePath) : '';
            return (
              <li key={theme.id}>
                <button
                  className={`dropdown-item ${currentTheme === theme.id ? 'active' : ''}`}
                  type="button"
                  onClick={() => handleThemeChange(theme.id)}
                >
                  {themeFruitImageUrl ? (
                    <span className={`me-2 d-inline-block ${theme.id.includes('blackberry') ? 'theme-dropdown-icon-blackberry' : ''}`} style={{ width: '20px', height: '20px', borderRadius: '50%', overflow: 'visible', position: 'relative', verticalAlign: 'middle' }}>
                      <img src={themeFruitImageUrl} alt={theme.name} style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '50%' }} />
                      {themeSecondaryImageUrl && (
                        <span style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '12.8px', height: '12.8px', backgroundColor: 'var(--bs-body-bg)', borderRadius: '50%', border: '1.5px solid var(--bs-border-color)', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'visible', zIndex: 2 }}>
                          <img src={themeSecondaryImageUrl} alt={theme.name} style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '50%', transform: 'scale(1.22)' }} />
                        </span>
                      )}
                    </span>
                  ) : (
                    <span className="me-2">{theme.icon}</span>
                  )}
                  {theme.name}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default ThemeSelector;

