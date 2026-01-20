import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import './SystemSettings.css';

interface Module {
  key: string;
  name: string;
  icon: string;
  desc: string;
  color: string;
}

const SystemGeneralSettings: React.FC = () => {
  const { addToast } = useAppContext();
  const [initialSettings, setInitialSettings] = useState({
    companyName: 'HRM Pro',
    defaultLang: 'ru',
    timezone: 'GMT+3',
    activeModules: [
      'dashboard', 'employees', 'recruiting', 'adaptation', 'cb', 'hrops', 'ld', 'performance', 'okr', 'time', 'projects', 'wiki', 'corporate', 'reports'
    ]
  });

  const [companyName, setCompanyName] = useState(initialSettings.companyName);
  const [defaultLang, setDefaultLang] = useState(initialSettings.defaultLang);
  const [timezone, setTimezone] = useState(initialSettings.timezone);
  const [activeModules, setActiveModules] = useState(initialSettings.activeModules);
  
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const currentSettings = { companyName, defaultLang, timezone, activeModules };
    const hasChanged = 
      currentSettings.companyName !== initialSettings.companyName ||
      currentSettings.defaultLang !== initialSettings.defaultLang ||
      currentSettings.timezone !== initialSettings.timezone ||
      JSON.stringify(currentSettings.activeModules.sort()) !== JSON.stringify(initialSettings.activeModules.sort());
      
    setIsDirty(hasChanged);
  }, [companyName, defaultLang, timezone, activeModules, initialSettings]);

  const allModules: Module[] = [
    { key: 'dashboard', name: 'Дашборд', icon: 'bi-speedometer2', desc: 'Обзор', color: 'text-primary' },
    { key: 'employees', name: 'Сотрудники', icon: 'bi-people', desc: '245 человек', color: 'text-info' },
    { key: 'recruiting', name: 'Рекрутинг', icon: 'bi-person-plus', desc: '18 вакансий', color: 'text-success' },
    { key: 'adaptation', name: 'Адаптация', icon: 'bi-person-check', desc: '7 новичков', color: 'text-warning' },
    { key: 'cb', name: 'C&B', icon: 'bi-cash-stack', desc: 'Компенсации', color: 'text-danger' },
    { key: 'hrops', name: 'HR Operations', icon: 'bi-gear-wide-connected', desc: 'Операции', color: 'text-secondary' },
    { key: 'ld', name: 'L&D', icon: 'bi-mortarboard', desc: 'Обучение', color: 'text-primary' },
    { key: 'performance', name: 'KPI и оценка', icon: 'bi-graph-up', desc: 'Производительность', color: 'text-info' },
    { key: 'okr', name: 'OKR', icon: 'bi-bullseye', desc: 'Цели', color: 'text-success' },
    { key: 'time', name: 'Учет времени', icon: 'bi-clock-history', desc: 'Время', color: 'text-warning' },
    { key: 'projects', name: 'HR-проекты', icon: 'bi-kanban', desc: 'Проекты', color: 'text-danger' },
    { key: 'wiki', name: 'Wiki', icon: 'bi-book', desc: 'База знаний', color: 'text-secondary' },
    { key: 'corporate', name: 'Корпоративный портал', icon: 'bi-globe', desc: 'Портал', color: 'text-primary' },
    { key: 'reports', name: 'Отчеты', icon: 'bi-file-earmark-text', desc: 'Аналитика', color: 'text-info' },
    { key: 'settings', name: 'Настройки системы', icon: 'bi-gear', desc: 'Конфигурация', color: 'text-secondary' }
  ];

  const inactiveModules = allModules.filter(module => !activeModules.includes(module.key));
  const activeModuleObjects = allModules.filter(module => activeModules.includes(module.key));

  const handleModuleToggle = (moduleKey: string) => {
    if (activeModules.includes(moduleKey)) {
      setActiveModules(activeModules.filter(key => key !== moduleKey));
    } else {
      setActiveModules([...activeModules, moduleKey]);
    }
  };

  const handleReset = () => {
    setCompanyName(initialSettings.companyName);
    setDefaultLang(initialSettings.defaultLang);
    setTimezone(initialSettings.timezone);
    setActiveModules([...initialSettings.activeModules]);
    
    addToast('Изменения отменены. Все настройки восстановлены.', { 
      type: 'info',
      title: 'Настройки отменены'
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Имитация сохранения
      await new Promise(resolve => setTimeout(resolve, 1500));
      const newSettings = { companyName, defaultLang, timezone, activeModules };
      setInitialSettings(newSettings);
      
      // Определяем, какие изменения были сохранены
      const changes = [];
      if (companyName !== initialSettings.companyName) {
        changes.push(`название компании изменено на "${companyName}"`);
      }
      if (defaultLang !== initialSettings.defaultLang) {
        changes.push(`язык по умолчанию изменен на "${defaultLang === 'ru' ? 'Русский' : 'English'}"`);
      }
      if (timezone !== initialSettings.timezone) {
        changes.push(`часовой пояс изменен на "${timezone}"`);
      }
      
      const modulesDiff = activeModules.length - initialSettings.activeModules.length;
      if (modulesDiff > 0) {
        changes.push(`активировано ${modulesDiff} модулей`);
      } else if (modulesDiff < 0) {
        changes.push(`деактивировано ${Math.abs(modulesDiff)} модулей`);
      }
      
      const message = changes.length > 0 
        ? `Настройки успешно сохранены. ${changes.join(', ')}.`
        : 'Настройки успешно сохранены.';
      
      addToast(message, { 
        type: 'success',
        title: 'Настройки сохранены'
      });
    } catch (error) {
      addToast('Ошибка при сохранении настроек. Попробуйте еще раз.', { 
        type: 'error',
        title: 'Ошибка сохранения'
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="settings-page">
      {/* Заголовок страницы */}
      <div className="settings-header">
        <div className="settings-header-content">
          <div className="settings-title">
            <i className="bi bi-sliders text-primary"></i>
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
                <label htmlFor="companyName" className="form-label">
                  <i className="bi bi-building me-2"></i>
                  Название компании
                </label>
                <input 
                  type="text" 
                  className="form-control form-control-lg" 
                  id="companyName" 
                  placeholder="Введите название компании" 
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
                <div className="form-text">
                  Это название будет отображаться в заголовке системы и уведомлениях
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="companyLogo" className="form-label">
                  <i className="bi bi-image me-2"></i>
                  Логотип компании
                </label>
                <div className="logo-upload-area">
                  <div className="logo-preview">
                    <i className="bi bi-building"></i>
                  </div>
                  <div className="logo-upload-content">
                    <input className="form-control" type="file" id="companyLogo" accept="image/*" />
                    <div className="form-text">
                      Рекомендуемый размер: 200x200px, формат: PNG, JPG
                    </div>
                  </div>
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
                <label htmlFor="defaultLang" className="form-label">
                  <i className="bi bi-translate me-2"></i>
                  Язык по умолчанию
                </label>
                <select 
                  className="form-select form-select-lg" 
                  id="defaultLang"
                  value={defaultLang}
                  onChange={(e) => setDefaultLang(e.target.value)}
                >
                  <option value="ru">🇷🇺 Русский</option>
                  <option value="en">🇺🇸 English</option>
                  <option value="kk">🇰🇿 Қазақша</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="timezone" className="form-label">
                  <i className="bi bi-clock me-2"></i>
                  Часовой пояс
                </label>
                <select 
                  className="form-select form-select-lg" 
                  id="timezone"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                >
                  <option value="GMT+3">GMT+3 (Москва)</option>
                  <option value="GMT+2">GMT+2 (Калининград)</option>
                  <option value="GMT+5">GMT+5 (Екатеринбург)</option>
                  <option value="GMT+7">GMT+7 (Новосибирск)</option>
                  <option value="GMT+8">GMT+8 (Иркутск)</option>
                  <option value="GMT+10">GMT+10 (Владивосток)</option>
                </select>
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
                {activeModuleObjects.map(module => (
                  <div 
                    key={module.key} 
                    className="settings-module-card active"
                    onClick={() => handleModuleToggle(module.key)}
                  >
                    <div className="module-icon-wrapper">
                      <div className="module-icon">
                        <i className={`bi ${module.icon} ${module.color}`}></i>
                      </div>
                      <div className="module-action">
                        <i className="bi bi-dash-circle-fill text-danger"></i>
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