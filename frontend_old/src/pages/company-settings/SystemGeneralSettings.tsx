import React, { useState, useEffect, useMemo } from 'react';
import { toastSuccess, toastInfo, toastError } from '../../utils/toastHelper';
import { api } from '../../utils/api';
import { ALL_MODULES, REQUIRED_MODULES, type Module } from '../../utils/modules';
import './SystemSettings.css';

const SystemGeneralSettings: React.FC = () => {
  const [initialSettings, setInitialSettings] = useState({
    display_name: 'HRM Pro',
    primary_language: 'ru',
    primary_timezone: 'Europe/Minsk',
    primary_currency: '',
    languages: ['ru', 'en'],
    currencies: ['BYN'],
    logo_file: null as File | null,
    logo_url: '',
    work_start_time: '09:00',
    work_end_time: '18:00',
    default_meeting_duration: 30,
    buffer_between_meetings: 10,
    calendar_url: '',
    activeModules: [
      'dashboard', 'employees', 'recruiting', 'adaptation', 'cb', 'hrops', 'ld', 'performance', 'okr', 'time', 'projects', 'wiki', 'corporate', 'reports'
    ]
  });

  const [display_name, setDisplay_name] = useState(initialSettings.display_name);
  const [primary_language, setPrimary_language] = useState(initialSettings.primary_language);
  const [primary_timezone, setPrimary_timezone] = useState(initialSettings.primary_timezone);
  const [primary_currency, setPrimary_currency] = useState(initialSettings.primary_currency);
  const [languages, setLanguages] = useState<string[]>(initialSettings.languages);
  const [currencies, setCurrencies] = useState<string[]>(initialSettings.currencies);
  const [logo_file, setLogo_file] = useState<File | null>(initialSettings.logo_file);
  const [logo_url, setLogo_url] = useState(initialSettings.logo_url);
  const [work_start_time, setWork_start_time] = useState(initialSettings.work_start_time);
  const [work_end_time, setWork_end_time] = useState(initialSettings.work_end_time);
  const [default_meeting_duration, setDefault_meeting_duration] = useState(initialSettings.default_meeting_duration);
  const [buffer_between_meetings, setBuffer_between_meetings] = useState(initialSettings.buffer_between_meetings);
  const [calendar_url, setCalendar_url] = useState(initialSettings.calendar_url);
  const [activeModules, setActiveModules] = useState(initialSettings.activeModules);
  
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [availableLanguages, setAvailableLanguages] = useState<Array<{code: string, name: string}>>([]);
  const [availableCurrencies, setAvailableCurrencies] = useState<Array<{code: string, name: string}>>([]);
  
  // Используем useMemo для создания обновленного списка модулей с информацией из API
  const [modulesFromAPI, setModulesFromAPI] = useState<Record<string, { is_required?: boolean }>>({});
  
  // Создаем обновленный список модулей с информацией из API
  const allModules = useMemo(() => {
    return ALL_MODULES.map(module => ({
      ...module,
      is_required: modulesFromAPI[module.key]?.is_required ?? module.is_required
    }));
  }, [modulesFromAPI]);

  // Загружаем настройки компании при монтировании
  useEffect(() => {
    const loadSettings = async () => {
      try {
        // Загружаем доступные языки и валюты
        const [settings, languages, currencies] = await Promise.all([
          api.getGeneralSettings(),
          api.getAvailableLanguages().catch(() => []),
          api.getAvailableCurrencies().catch(() => [])
        ]);
        
        if (languages && Array.isArray(languages)) {
          setAvailableLanguages(languages);
        }
        if (currencies && Array.isArray(currencies)) {
          setAvailableCurrencies(currencies);
        }
        if (settings) {
          // Извлекаем модули из ответа API
          let activeModulesList = settings.active_modules 
            ? settings.active_modules.map((m: any) => m.key)
            : initialSettings.activeModules;
          
          // Убеждаемся, что обязательные модули всегда включены
          activeModulesList = [...new Set([...activeModulesList, ...REQUIRED_MODULES])];
          
          // Сохраняем информацию о модулях из API (включая is_required)
          if (settings.active_modules && Array.isArray(settings.active_modules)) {
            const modulesInfo: Record<string, { is_required?: boolean }> = {};
            settings.active_modules.forEach((apiModule: any) => {
              modulesInfo[apiModule.key] = {
                is_required: apiModule.is_required || false
              };
            });
            setModulesFromAPI(modulesInfo);
          }
          
          // Убеждаемся, что languages и currencies всегда массивы
          const normalizedLanguages = Array.isArray(settings.languages) 
            ? settings.languages 
            : (settings.languages ? [settings.languages] : ['ru', 'en']);
          const normalizedCurrencies = Array.isArray(settings.currencies)
            ? settings.currencies
            : (settings.currencies ? [settings.currencies] : ['BYN']);
          
          const loadedSettings = {
            display_name: settings.display_name || 'HRM Pro',
            primary_language: settings.primary_language || 'ru',
            primary_timezone: settings.primary_timezone || 'Europe/Minsk',
            primary_currency: settings.primary_currency || '',
            languages: normalizedLanguages,
            currencies: normalizedCurrencies,
            logo_file: null as File | null,
            logo_url: settings.logo_url || '',
            work_start_time: settings.work_start_time ? settings.work_start_time.substring(0, 5) : '09:00',
            work_end_time: settings.work_end_time ? settings.work_end_time.substring(0, 5) : '18:00',
            default_meeting_duration: settings.default_meeting_duration || 30,
            buffer_between_meetings: settings.buffer_between_meetings || 10,
            calendar_url: settings.calendar_url || '',
            activeModules: Array.isArray(activeModulesList) ? activeModulesList : [],
          };
          
          setDisplay_name(loadedSettings.display_name);
          setPrimary_language(loadedSettings.primary_language);
          setPrimary_timezone(loadedSettings.primary_timezone);
          setPrimary_currency(loadedSettings.primary_currency);
          setLanguages(loadedSettings.languages);
          setCurrencies(loadedSettings.currencies);
          setLogo_url(loadedSettings.logo_url);
          setWork_start_time(loadedSettings.work_start_time);
          setWork_end_time(loadedSettings.work_end_time);
          setDefault_meeting_duration(loadedSettings.default_meeting_duration);
          setBuffer_between_meetings(loadedSettings.buffer_between_meetings);
          setCalendar_url(loadedSettings.calendar_url);
          setActiveModules(loadedSettings.activeModules);
          
          setInitialSettings(loadedSettings);
        }
      } catch (error) {
        console.error('Failed to load company settings:', error);
        toastError('Не удалось загрузить настройки компании', 'Ошибка');
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  useEffect(() => {
    // Убеждаемся, что languages и currencies всегда массивы
    const currentLanguages = Array.isArray(languages) ? languages : [];
    const currentCurrencies = Array.isArray(currencies) ? currencies : [];
    const initialLanguages = Array.isArray(initialSettings.languages) ? initialSettings.languages : [];
    const initialCurrencies = Array.isArray(initialSettings.currencies) ? initialSettings.currencies : [];
    const currentActiveModules = Array.isArray(activeModules) ? activeModules : [];
    const initialActiveModules = Array.isArray(initialSettings.activeModules) ? initialSettings.activeModules : [];
    
    const currentSettings = {
      display_name,
      primary_language,
      primary_timezone,
      primary_currency,
      languages: currentLanguages,
      currencies: currentCurrencies,
      logo_url,
      logo_file,
      work_start_time,
      work_end_time,
      default_meeting_duration,
      buffer_between_meetings,
      calendar_url,
      activeModules: currentActiveModules
    };
    const hasChanged = 
      currentSettings.display_name !== initialSettings.display_name ||
      currentSettings.primary_language !== initialSettings.primary_language ||
      currentSettings.primary_timezone !== initialSettings.primary_timezone ||
      currentSettings.primary_currency !== initialSettings.primary_currency ||
      JSON.stringify([...currentLanguages].sort()) !== JSON.stringify([...initialLanguages].sort()) ||
      JSON.stringify([...currentCurrencies].sort()) !== JSON.stringify([...initialCurrencies].sort()) ||
      currentSettings.logo_url !== initialSettings.logo_url ||
      currentSettings.logo_file !== initialSettings.logo_file ||
      currentSettings.work_start_time !== initialSettings.work_start_time ||
      currentSettings.work_end_time !== initialSettings.work_end_time ||
      currentSettings.default_meeting_duration !== initialSettings.default_meeting_duration ||
      currentSettings.buffer_between_meetings !== initialSettings.buffer_between_meetings ||
      currentSettings.calendar_url !== initialSettings.calendar_url ||
      JSON.stringify([...currentActiveModules].sort()) !== JSON.stringify([...initialActiveModules].sort());
      
    setIsDirty(hasChanged);
  }, [display_name, primary_language, primary_timezone, primary_currency, languages, currencies, logo_url, logo_file, work_start_time, work_end_time, default_meeting_duration, buffer_between_meetings, calendar_url, activeModules, initialSettings]);

  const inactiveModules = allModules.filter(module => !activeModules.includes(module.key));
  const activeModuleObjects = allModules.filter(module => activeModules.includes(module.key));

  const handleModuleToggle = (moduleKey: string) => {
    // Проверяем, является ли модуль обязательным
    const module = allModules.find(m => m.key === moduleKey);
    const isRequired = module?.is_required || REQUIRED_MODULES.includes(moduleKey);
    
    // Не позволяем убрать обязательные модули из активных
    if (activeModules.includes(moduleKey) && isRequired) {
      return; // Игнорируем попытку отключить обязательный модуль
    }
    
    if (activeModules.includes(moduleKey)) {
      setActiveModules(activeModules.filter(key => key !== moduleKey));
    } else {
      setActiveModules([...activeModules, moduleKey]);
    }
  };

  const handleReset = () => {
    setDisplay_name(initialSettings.display_name);
    setPrimary_language(initialSettings.primary_language);
    setPrimary_timezone(initialSettings.primary_timezone);
    setPrimary_currency(initialSettings.primary_currency);
    setLanguages([...initialSettings.languages]);
    setCurrencies([...initialSettings.currencies]);
    setLogo_url(initialSettings.logo_url);
    setWork_start_time(initialSettings.work_start_time);
    setWork_end_time(initialSettings.work_end_time);
    setDefault_meeting_duration(initialSettings.default_meeting_duration);
    setBuffer_between_meetings(initialSettings.buffer_between_meetings);
    setCalendar_url(initialSettings.calendar_url);
    setActiveModules([...initialSettings.activeModules]);
    
    toastInfo('Изменения отменены. Все настройки восстановлены.', 'Настройки отменены');
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Создаем FormData для отправки файла, если он есть
      const formData = new FormData();
      
      // Убеждаемся, что обязательные модули всегда включены
      const modulesToSave = [...new Set([...activeModules, ...REQUIRED_MODULES])];
      
      // Добавляем текстовые поля
      formData.append('display_name', display_name);
      formData.append('primary_language', primary_language);
      formData.append('primary_timezone', primary_timezone);
      formData.append('primary_currency', primary_currency);
      formData.append('languages', JSON.stringify(languages));
      formData.append('currencies', JSON.stringify(currencies));
      formData.append('work_start_time', work_start_time);
      formData.append('work_end_time', work_end_time);
      formData.append('default_meeting_duration', default_meeting_duration.toString());
      formData.append('buffer_between_meetings', buffer_between_meetings.toString());
      formData.append('calendar_url', calendar_url);
      formData.append('active_module_keys', JSON.stringify(modulesToSave));
      
      // Если есть URL логотипа, добавляем его
      if (logo_url) {
        formData.append('logo_url', logo_url);
      }
      
      // Если есть файл логотипа, добавляем его
      if (logo_file) {
        formData.append('logo_file', logo_file);
      }
      
      // Сохраняем через API
      const response = await api.updateGeneralSettings(formData);
      
      // После успешного сохранения, если был загружен файл, получаем обновленный URL
      let updatedLogoUrl = logo_url;
      if (logo_file && response && response.logo_url) {
        updatedLogoUrl = response.logo_url;
        setLogo_url(updatedLogoUrl);
      } else if (logo_file) {
        // Если в ответе нет logo_url, перезагружаем настройки
        try {
          const updatedSettings = await api.getGeneralSettings();
          if (updatedSettings && updatedSettings.logo_url) {
            updatedLogoUrl = updatedSettings.logo_url;
            setLogo_url(updatedLogoUrl);
          }
        } catch (error) {
          console.warn('Failed to reload settings after save:', error);
        }
      }
      
      const newSettings = {
        display_name,
        primary_language,
        primary_timezone,
        primary_currency,
        languages: [...languages],
        currencies: [...currencies],
        logo_file: null,
        logo_url: updatedLogoUrl,
        work_start_time,
        work_end_time,
        default_meeting_duration,
        buffer_between_meetings,
        calendar_url,
        activeModules: [...activeModules]
      };
      setInitialSettings(newSettings);
      setLogo_file(null); // Очищаем файл после сохранения
      
      toastSuccess('Настройки компании успешно сохранены.', 'Настройки сохранены');
    } catch (error) {
      toastError('Ошибка при сохранении настроек. Попробуйте еще раз.', 'Ошибка сохранения');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="settings-page">
        <div className="settings-header">
          <div className="settings-header-content">
            <div className="settings-title">
              <i className="bi bi-sliders"></i>
              <h1>Общие настройки</h1>
            </div>
            <p className="settings-subtitle">
              Настройте основные параметры системы, включая информацию о компании и активные модули
            </p>
          </div>
        </div>
        <div className="settings-content-wrapper">
          <div className="text-center p-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Загрузка...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-page">
      {/* Заголовок страницы */}
      <div className="settings-header">
        <div className="settings-header-content">
          <div className="settings-title">
            <i className="bi bi-sliders"></i>
            <h1>Общие настройки</h1>
          </div>
          <p className="settings-subtitle">
            Настройте основные параметры системы, включая информацию о компании и активные модули
          </p>
        </div>
      </div>

      {/* Основной контент */}
      <div className="settings-content-wrapper">
        <div className="settings-grid">
          {/* Левая колонка - Основные настройки */}
          <div className="settings-section">
            <div className="settings-section-header">
              <i className="bi bi-building text-primary"></i>
              <h3>Информация о компании</h3>
            </div>
            
            <div className="settings-form">
              <div className="form-group">
                <label htmlFor="display_name" className="form-label">
                  <i className="bi bi-building me-2"></i>
                  Название компании
                </label>
                <input 
                  type="text" 
                  className="form-control form-control-lg" 
                  id="display_name" 
                  placeholder="Введите название компании" 
                  value={display_name}
                  onChange={(e) => setDisplay_name(e.target.value)}
                />
                <div className="form-text">
                  Это название будет отображаться в заголовке системы и уведомлениях
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="logo_file" className="form-label">
                  <i className="bi bi-image me-2"></i>
                  Логотип компании (файл)
                </label>
                <div className="logo-upload-area">
                  <div className="logo-preview">
                    {logo_url ? (
                      <img 
                        src={logo_url} 
                        alt="Logo" 
                        style={{ maxWidth: '100px', maxHeight: '100px', objectFit: 'contain' }} 
                        onError={(e) => {
                          // Если изображение не загрузилось, показываем иконку
                          e.currentTarget.style.display = 'none';
                          const icon = e.currentTarget.parentElement?.querySelector('.bi-building');
                          if (icon) {
                            (icon as HTMLElement).style.display = 'block';
                          }
                        }}
                      />
                    ) : null}
                    {!logo_url && <i className="bi bi-building"></i>}
                  </div>
                  <div className="logo-upload-content">
                    <input 
                      className="form-control" 
                      type="file" 
                      id="logo_file" 
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          const file = e.target.files[0];
                          setLogo_file(file);
                          // Создаем превью для отображения
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setLogo_url(reader.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    <div className="form-text">
                      Рекомендуемый размер: 200x200px, формат: PNG, JPG
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="logo_url" className="form-label">
                  <i className="bi bi-link-45deg me-2"></i>
                  URL логотипа
                </label>
                <input 
                  type="url" 
                  className="form-control" 
                  id="logo_url" 
                  placeholder="https://example.com/logo.png" 
                  value={logo_url}
                  onChange={(e) => setLogo_url(e.target.value)}
                />
                <div className="form-text">
                  URL логотипа компании (если загружен по ссылке)
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="calendar_url" className="form-label">
                  <i className="bi bi-calendar-event me-2"></i>
                  Ссылка на календарь
                </label>
                <input 
                  type="url" 
                  className="form-control" 
                  id="calendar_url" 
                  placeholder="https://calendar.google.com/..." 
                  value={calendar_url}
                  onChange={(e) => setCalendar_url(e.target.value)}
                />
                <div className="form-text">
                  Ссылка на календарь компании (Google Calendar, Outlook и т.д.)
                </div>
              </div>
            </div>
          </div>

          {/* Правая колонка - Локализация */}
          <div className="settings-section">
            <div className="settings-section-header">
              <i className="bi bi-globe text-primary"></i>
              <h3>Локализация</h3>
            </div>
            
            <div className="settings-form">
              <div className="form-group">
                <label htmlFor="primary_language" className="form-label">
                  <i className="bi bi-translate me-2"></i>
                  Основной язык
                </label>
                <select 
                  className="form-select form-select-lg" 
                  id="primary_language"
                  value={primary_language}
                  onChange={(e) => setPrimary_language(e.target.value)}
                >
                  {availableLanguages.length > 0 ? (
                    availableLanguages.map(lang => (
                      <option key={lang.code} value={lang.code}>
                        {lang.name}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="ru">🇷🇺 Русский</option>
                      <option value="en">🇺🇸 English</option>
                      <option value="kk">🇰🇿 Қазақша</option>
                      <option value="de">🇩🇪 Deutsch</option>
                      <option value="pl">🇵🇱 Polski</option>
                    </>
                  )}
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="languages" className="form-label">
                  <i className="bi bi-translate me-2"></i>
                  Языки компании
                </label>
                <div className="d-flex flex-wrap gap-2">
                  {availableLanguages.length > 0 ? (
                    availableLanguages.map(lang => (
                      <div key={lang.code} className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id={`lang-${lang.code}`}
                          checked={languages.includes(lang.code)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setLanguages([...languages, lang.code]);
                            } else {
                              setLanguages(languages.filter(l => l !== lang.code));
                            }
                          }}
                        />
                        <label className="form-check-label" htmlFor={`lang-${lang.code}`}>
                          {lang.name}
                        </label>
                      </div>
                    ))
                  ) : (
                    ['ru', 'en', 'by', 'de'].map(lang => (
                      <div key={lang} className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id={`lang-${lang}`}
                          checked={languages.includes(lang)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setLanguages([...languages, lang]);
                            } else {
                              setLanguages(languages.filter(l => l !== lang));
                            }
                          }}
                        />
                        <label className="form-check-label" htmlFor={`lang-${lang}`}>
                          {lang === 'ru' ? '🇷🇺 Русский' : lang === 'en' ? '🇺🇸 English' : lang === 'by' ? '🇧🇾 Беларуская' : '🇩🇪 Deutsch'}
                        </label>
                      </div>
                    ))
                  )}
                </div>
                <div className="form-text">
                  Список языков компании. Для локаций подтягиваются автоматически, но можно добавить другие.
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="primary_timezone" className="form-label">
                  <i className="bi bi-clock me-2"></i>
                  Часовой пояс
                </label>
                <select 
                  className="form-select form-select-lg" 
                  id="primary_timezone"
                  value={primary_timezone}
                  onChange={(e) => setPrimary_timezone(e.target.value)}
                >
                  <option value="Europe/Minsk">Europe/Minsk (GMT+3)</option>
                  <option value="Europe/Moscow">Europe/Moscow (GMT+3)</option>
                  <option value="Europe/Kaliningrad">Europe/Kaliningrad (GMT+2)</option>
                  <option value="Asia/Yekaterinburg">Asia/Yekaterinburg (GMT+5)</option>
                  <option value="Asia/Novosibirsk">Asia/Novosibirsk (GMT+7)</option>
                  <option value="Asia/Irkutsk">Asia/Irkutsk (GMT+8)</option>
                  <option value="Asia/Vladivostok">Asia/Vladivostok (GMT+10)</option>
                </select>
                <div className="form-text">
                  Основная таймзона компании (головная, по которой ориентируется время на бэке)
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="primary_currency" className="form-label">
                  <i className="bi bi-currency-exchange me-2"></i>
                  Основная валюта
                </label>
                <select 
                  className="form-select form-select-lg" 
                  id="primary_currency"
                  value={primary_currency}
                  onChange={(e) => setPrimary_currency(e.target.value)}
                >
                  <option value="">Не выбрано</option>
                  {availableCurrencies.length > 0 ? (
                    availableCurrencies.map(curr => (
                      <option key={curr.code} value={curr.code}>
                        {curr.code} - {curr.name}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="BYN">BYN - Белорусский рубль</option>
                      <option value="RUB">RUB - Российский рубль</option>
                      <option value="USD">USD - Доллар США</option>
                      <option value="EUR">EUR - Евро</option>
                    </>
                  )}
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="currencies" className="form-label">
                  <i className="bi bi-currency-exchange me-2"></i>
                  Валюты компании
                </label>
                <div className="d-flex flex-wrap gap-2">
                  {availableCurrencies.length > 0 ? (
                    availableCurrencies.map(currency => (
                      <div key={currency.code} className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id={`currency-${currency.code}`}
                          checked={currencies.includes(currency.code)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setCurrencies([...currencies, currency.code]);
                            } else {
                              setCurrencies(currencies.filter(c => c !== currency.code));
                            }
                          }}
                        />
                        <label className="form-check-label" htmlFor={`currency-${currency.code}`}>
                          {currency.code} - {currency.name}
                        </label>
                      </div>
                    ))
                  ) : (
                    ['BYN', 'RUB', 'USD', 'EUR'].map(currency => (
                      <div key={currency} className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id={`currency-${currency}`}
                          checked={currencies.includes(currency)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setCurrencies([...currencies, currency]);
                            } else {
                              setCurrencies(currencies.filter(c => c !== currency));
                            }
                          }}
                        />
                        <label className="form-check-label" htmlFor={`currency-${currency}`}>
                          {currency}
                        </label>
                      </div>
                    ))
                  )}
                </div>
                <div className="form-text">
                  Список валют компании. Для локаций подтягиваются автоматически, но можно добавить другие.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Рабочие часы и настройки встреч */}
        <div className="settings-grid">
          <div className="settings-section">
            <div className="settings-section-header">
              <i className="bi bi-clock-history text-primary"></i>
              <h3>Рабочие часы</h3>
            </div>
            
            <div className="settings-form">
              <div className="form-group">
                <label htmlFor="work_start_time" className="form-label">
                  <i className="bi bi-clock me-2"></i>
                  Время начала рабочего дня
                </label>
                <input 
                  type="time" 
                  className="form-control form-control-lg" 
                  id="work_start_time"
                  value={work_start_time}
                  onChange={(e) => setWork_start_time(e.target.value)}
                />
                <div className="form-text">
                  Стандартное время начала рабочего дня (например: 09:00)
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="work_end_time" className="form-label">
                  <i className="bi bi-clock me-2"></i>
                  Время окончания рабочего дня
                </label>
                <input 
                  type="time" 
                  className="form-control form-control-lg" 
                  id="work_end_time"
                  value={work_end_time}
                  onChange={(e) => setWork_end_time(e.target.value)}
                />
                <div className="form-text">
                  Стандартное время окончания рабочего дня (например: 18:00)
                </div>
              </div>
            </div>
          </div>

          <div className="settings-section">
            <div className="settings-section-header">
              <i className="bi bi-calendar-event text-primary"></i>
              <h3>Настройки встреч</h3>
            </div>
            
            <div className="settings-form">
              <div className="form-group">
                <label htmlFor="default_meeting_duration" className="form-label">
                  <i className="bi bi-hourglass me-2"></i>
                  Длительность встречи по умолчанию (минуты)
                </label>
                <input 
                  type="number" 
                  className="form-control" 
                  id="default_meeting_duration"
                  min="5"
                  max="480"
                  value={default_meeting_duration}
                  onChange={(e) => setDefault_meeting_duration(Number(e.target.value))}
                />
                <div className="form-text">
                  Длительность встречи по умолчанию в минутах (например: 30)
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="buffer_between_meetings" className="form-label">
                  <i className="bi bi-arrow-left-right me-2"></i>
                  Буферное время между встречами (минуты)
                </label>
                <input 
                  type="number" 
                  className="form-control" 
                  id="buffer_between_meetings"
                  min="0"
                  max="120"
                  value={buffer_between_meetings}
                  onChange={(e) => setBuffer_between_meetings(Number(e.target.value))}
                />
                <div className="form-text">
                  Буферное время между встречами в минутах (например: 10)
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Модули системы */}
        <div className="settings-section modules-section">
          <div className="settings-section-header">
            <i className="bi bi-puzzle text-primary"></i>
            <h3>Модули системы</h3>
            <div className="settings-header-actions">
              <button 
                type="button" 
                className="btn btn-outline-secondary btn-sm"
                onClick={() => setActiveModules(allModules.map(m => m.key))}
              >
                <i className="bi bi-check-all me-1"></i>
                Включить все
              </button>
              <button 
                type="button" 
                className="btn btn-outline-secondary btn-sm"
                onClick={() => setActiveModules([])}
              >
                <i className="bi bi-x-lg me-1"></i>
                Отключить все
              </button>
            </div>
          </div>
          
          <div className="modules-grid">
            <div className="modules-column">
              <div className="modules-column-header">
                <h6>Неактивные модули</h6>
                <span className="badge bg-secondary">{inactiveModules.length}</span>
              </div>
              <div className="modules-list">
                {inactiveModules.map(module => (
                  <div 
                    key={module.key} 
                    className="settings-module-card inactive"
                    onClick={() => handleModuleToggle(module.key)}
                  >
                    <div className="module-icon-wrapper">
                      <div className="module-icon">
                        <i className={`bi ${module.icon} ${module.color}`}></i>
                      </div>
                      <div className="module-action">
                        <i className="bi bi-plus-circle-fill text-success"></i>
                      </div>
                    </div>
                    <div className="module-content">
                      <div className="module-name">{module.name}</div>
                      <div className="module-desc">{module.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="modules-column">
              <div className="modules-column-header">
                <h6>Активные модули</h6>
                <span className="badge bg-success">{activeModuleObjects.length}</span>
              </div>
              <div className="modules-list">
                {activeModuleObjects.map(module => {
                  const isRequired = module.is_required || REQUIRED_MODULES.includes(module.key);
                  return (
                    <div 
                      key={module.key} 
                      className={`settings-module-card active ${isRequired ? 'required' : ''}`}
                      onClick={() => !isRequired && handleModuleToggle(module.key)}
                      style={{ cursor: isRequired ? 'not-allowed' : 'pointer', opacity: isRequired ? 0.8 : 1 }}
                      title={isRequired ? 'Этот модуль обязателен и не может быть отключен' : ''}
                    >
                      <div className="module-icon-wrapper">
                        <div className="module-icon">
                          <i className={`bi ${module.icon} ${module.color}`}></i>
                        </div>
                        {isRequired ? (
                          <div className="module-action" title="Обязательный модуль">
                            <i className="bi bi-lock-fill text-warning"></i>
                          </div>
                        ) : (
                          <div className="module-action">
                            <i className="bi bi-dash-circle-fill text-danger"></i>
                          </div>
                        )}
                      </div>
                      <div className="module-content">
                        <div className="module-name">
                          {module.name}
                          {isRequired && <span className="badge bg-warning text-dark ms-2" style={{ fontSize: '0.65rem' }}>Обязательный</span>}
                        </div>
                        <div className="module-desc">{module.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Кнопка сохранения */}
      {isDirty && (
        <div className="settings-actions">
          <button 
            type="button" 
            className="btn btn-secondary btn-lg"
            onClick={handleReset}
            disabled={isSaving}
          >
            Отменить
          </button>
          <button 
            type="button" 
            className={`btn btn-primary btn-lg ${isSaving ? 'loading' : ''}`}
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Сохранение...
              </>
            ) : (
              <>
                <i className="bi bi-save me-2"></i>
                Сохранить изменения
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default SystemGeneralSettings;

