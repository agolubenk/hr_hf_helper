import { useState, useEffect, useRef, useId } from 'react';

export type LanguageCode = 'ru' | 'en' | 'de' | 'fr';

export interface Language {
  code: LanguageCode;
  name: string;
  nameNative: string;
  flag: string;
  abbreviation: string; // Сокращение языка (RU, EN, DE, FR)
}

export const languages: Language[] = [
  { code: 'ru', name: 'Russian', nameNative: 'Русский', flag: '🇷🇺', abbreviation: 'RU' },
  { code: 'en', name: 'English', nameNative: 'English', flag: '🇬🇧', abbreviation: 'EN' },
  { code: 'de', name: 'German', nameNative: 'Deutsch', flag: '🇩🇪', abbreviation: 'DE' },
  { code: 'fr', name: 'French', nameNative: 'Français', flag: '🇫🇷', abbreviation: 'FR' },
];

const LANGUAGE_STORAGE_KEY = 'hrm_language';

export function getCurrentLanguage(): LanguageCode {
  if (typeof window === 'undefined') return 'ru';
  
  try {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (stored && languages.some(l => l.code === stored)) {
      return stored as LanguageCode;
    }
  } catch (error) {
    console.warn('Failed to read language from localStorage:', error);
  }
  
  // Определяем язык браузера
  const browserLang = navigator.language.split('-')[0];
  const supportedLang = languages.find(l => l.code === browserLang);
  return supportedLang ? supportedLang.code : 'ru';
}

export function setLanguage(languageCode: LanguageCode): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, languageCode);
    // Можно добавить логику изменения языка в приложении
    // Например, через i18n или контекст
  } catch (error) {
    console.error('Failed to save language to localStorage:', error);
  }
}

interface LanguageSelectorProps {
  className?: string;
  allowedLanguages?: LanguageCode[]; // Список разрешенных языков
}

const LanguageSelector = ({ className = '', allowedLanguages }: LanguageSelectorProps) => {
  const uniqueId = useId().replace(/:/g, '-');
  const dropdownId = `languageSelectorDropdown-${uniqueId}`;
  const dropdownRef = useRef<HTMLButtonElement>(null);
  
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>(() => {
    try {
      return getCurrentLanguage();
    } catch {
      return 'ru';
    }
  });

  // Обновляем текущий язык при изменении в localStorage (синхронизация между вкладками)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === LANGUAGE_STORAGE_KEY && e.newValue) {
        try {
          const newLanguage = e.newValue as LanguageCode;
          if (languages.some(l => l.code === newLanguage)) {
            setCurrentLanguage(newLanguage);
          }
        } catch {
          // Игнорируем ошибки
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleLanguageChange = (languageCode: LanguageCode) => {
    try {
      setLanguage(languageCode);
      setCurrentLanguage(languageCode);
      // Здесь можно добавить обновление языка в приложении
      // Например, через i18n.changeLanguage(languageCode)
    } catch (error) {
      console.error('Error changing language:', error);
    }
  };

  // Инициализация Bootstrap dropdown
  useEffect(() => {
    if (dropdownRef.current) {
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
                console.warn('Failed to initialize language dropdown:', e);
              }
            }
          }, 150);
        }
      };
      initBootstrap();
    }
  }, []);

  // Фильтруем языки, если указан список разрешенных
  const availableLanguages = allowedLanguages 
    ? languages.filter(l => allowedLanguages.includes(l.code))
    : languages;

  const currentLanguageData = availableLanguages.find(l => l.code === currentLanguage) || availableLanguages[0];

  // Если текущий язык не в списке разрешенных, выбираем первый разрешенный
  useEffect(() => {
    if (allowedLanguages && !allowedLanguages.includes(currentLanguage)) {
      const firstAllowed = allowedLanguages[0];
      if (firstAllowed) {
        handleLanguageChange(firstAllowed);
      }
    }
  }, [allowedLanguages]);

  return (
    <div className={`language-selector language-selector-dropdown ${className}`}>
      <div className="dropdown" style={{ position: 'relative' }}>
        <button
          ref={dropdownRef}
          className="quick-action-btn language-btn"
          type="button"
          id={dropdownId}
          data-bs-toggle="dropdown"
          aria-expanded="false"
          title={currentLanguageData.nameNative}
        >
          <i className="bi bi-globe2"></i>
          {/* Флаг в правом верхнем углу */}
          <span className="language-flag-icon">
            {currentLanguageData.flag}
          </span>
        </button>
        <ul className="dropdown-menu dropdown-menu-end" aria-labelledby={dropdownId}>
          {availableLanguages.map((language) => (
            <li key={language.code}>
              <button
                className={`dropdown-item ${currentLanguage === language.code ? 'active' : ''}`}
                type="button"
                onClick={() => handleLanguageChange(language.code)}
              >
                <span className="me-2">{language.flag}</span>
                <span>{language.nameNative}</span>
                <span className="text-muted ms-2" style={{ fontSize: '0.875rem' }}>
                  ({language.abbreviation})
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default LanguageSelector;

