import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../../context/AppContext';
import { ThemeSettings } from '../../types';
import './SystemSettings.css';

interface AccentColor {
  key: string;
  name: string;
  color: string;
  preview: string;
}

const allAccentColors: AccentColor[] = [
  // Solid
  { key: 'primary', name: 'Синий', color: '#0d6efd', preview: '#0d6efd' },
  { key: 'success', name: 'Зелёный', color: '#198754', preview: '#198754' },
  { key: 'danger', name: 'Красный', color: '#dc3545', preview: '#dc3545' },
  { key: 'warning', name: 'Оранжевый', color: '#fd7e14', preview: '#fd7e14' },
  { key: 'info', name: 'Голубой', color: '#0dcaf0', preview: '#0dcaf0' },
  { key: 'purple', name: 'Фиолетовый', color: '#6f42c1', preview: '#6f42c1' },
  { key: 'pink', name: 'Розовый', color: '#d63384', preview: '#d63384' },
  { key: 'teal', name: 'Бирюзовый', color: '#20c997', preview: '#20c997' },
  // Gradients
  { key: 'blue-violet', name: 'Сине-фиолетовый', color: 'linear-gradient(90deg, #0d6efd 0%, #6f42c1 100%)', preview: 'linear-gradient(90deg, #0d6efd 0%, #6f42c1 100%)' },
  { key: 'green-yellow', name: 'Зелено-желтый', color: 'linear-gradient(90deg, #198754 0%, #fd7e14 100%)', preview: 'linear-gradient(90deg, #198754 0%, #fd7e14 100%)' },
  { key: 'pink-orange', name: 'Розово-оранжевый', color: 'linear-gradient(90deg, #d63384 0%, #fd7e14 100%)', preview: 'linear-gradient(90deg, #d63384 0%, #fd7e14 100%)' },
];

const SystemThemeSettings: React.FC = () => {
  const { updateThemeSettings, applyThemeAndAccent, addToast } = useAppContext();

  // Загружаем сохраненные настройки
  const loadSavedSettings = (): ThemeSettings => {
    const saved = localStorage.getItem('theme-settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Ошибка при загрузке настроек:', e);
      }
    }
    
    // Настройки по умолчанию
    return {
      accentColor: 'primary',
      animations: 'enabled',
      gridDisplay: 'auto',
      borderRadius: 'medium',
      shadows: true,
      transitions: true
    };
  };

  const [settings, setSettings] = useState<ThemeSettings>(() => loadSavedSettings());
  const [originalSettings, setOriginalSettings] = useState<ThemeSettings>(() => loadSavedSettings());
  const [isDirty, setIsDirty] = useState(false);
  const [showCustomColorPopover, setShowCustomColorPopover] = useState(false);
  const [customColor, setCustomColor] = useState('#475c7b');
  const [popoverPosition, setPopoverPosition] = useState<'bottom' | 'top' | 'right' | 'left' | 'fallback'>('bottom');
  const customColorRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hasChanges = JSON.stringify(settings) !== JSON.stringify(originalSettings);
    setIsDirty(hasChanges);
  }, [settings, originalSettings]);

  // Применяем акцентный цвет при изменении
  useEffect(() => {
    applyThemeAndAccent('auto', settings.accentColor);
  }, [settings.accentColor, applyThemeAndAccent]);

  const handleSettingsChange = (field: keyof ThemeSettings, value: any) => {
    const newSettings = { ...settings, [field]: value };
    setSettings(newSettings);
    setIsDirty(true);
    
    // Немедленно применяем изменения
    updateThemeSettings(newSettings);
  };
  
  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setCustomColor(newColor);
    handleSettingsChange('accentColor', newColor);
  };

  const handleCustomColorCardClick = () => {
    // Определяем оптимальную позицию для popover
    if (customColorRef.current) {
      const rect = customColorRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      const popoverHeight = 280; // Реальная высота popover
      const popoverWidth = 320; // Реальная ширина popover
      const margin = 16; // Отступ от края экрана
      
      let position: 'bottom' | 'top' | 'right' | 'left' | 'fallback' = 'bottom';
      
      // Проверяем, поместится ли popover снизу
      if (rect.bottom + popoverHeight + margin <= viewportHeight) {
        position = 'bottom';
      }
      // Проверяем, поместится ли popover сверху
      else if (rect.top - popoverHeight - margin >= 0) {
        position = 'top';
      }
      // Проверяем, поместится ли popover справа
      else if (rect.right + popoverWidth + margin <= viewportWidth) {
        position = 'right';
      }
      // Проверяем, поместится ли popover слева
      else if (rect.left - popoverWidth - margin >= 0) {
        position = 'left';
      }
      // Если ничего не подходит, используем fallback (центрированное модальное окно)
      else {
        position = 'fallback';
      }
      
      setPopoverPosition(position);
    }
    
    setShowCustomColorPopover(true);
  };

  const handleCustomColorApply = () => {
    handleSettingsChange('accentColor', customColor);
    setShowCustomColorPopover(false);
  };

  const handleSave = () => {
    // Сохраняем в localStorage
    localStorage.setItem('selected-accent', settings.accentColor);
    localStorage.setItem('theme-settings', JSON.stringify(settings));
    
    // Обновляем исходные настройки
    setOriginalSettings(settings);
    
    // Сбрасываем флаг изменений
    setIsDirty(false);
    
    addToast('Настройки внешнего вида успешно сохранены.', { type: 'success', title: 'Сохранено' });
    console.log('Настройки сохранены:', settings);
  };

  const handleCancel = () => {
    setSettings(originalSettings);
    setIsDirty(false);
    addToast('Изменения отменены.', { type: 'info', title: 'Отмена' });
  };

  const handleReset = () => {
    const defaultSettings: ThemeSettings = {
      accentColor: 'primary',
      animations: 'enabled',
      gridDisplay: 'auto',
      borderRadius: 'medium',
      shadows: true,
      transitions: true
    };
    
    // Устанавливаем настройки по умолчанию
    setSettings(defaultSettings);
    setOriginalSettings(defaultSettings);
    
    // Обновляем в контексте
    updateThemeSettings(defaultSettings);
    
    // Сразу сохраняем в localStorage
    localStorage.setItem('selected-accent', 'primary');
    localStorage.setItem('theme-settings', JSON.stringify(defaultSettings));
    
    // Сбрасываем флаг изменений
    setIsDirty(false);
    
    addToast('Настройки сброшены к значениям по умолчанию.', { type: 'info', title: 'Сброс' });
  };

  // Закрываем popover при клике вне его
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showCustomColorPopover &&
        customColorRef.current &&
        popoverRef.current &&
        !customColorRef.current.contains(event.target as Node) &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        setShowCustomColorPopover(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCustomColorPopover]);

  return (
    <div className="settings-page">
      <div className="settings-header">
        <div className="settings-header-content">
          <div className="settings-title">
            <i className="bi bi-palette"></i>
            <div>
              <h1>Внешний вид</h1>
              <p className="settings-subtitle">
                Настройте акцентные цвета и дополнительные параметры интерфейса для всей системы.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="settings-content-wrapper">
        <div className="settings-grid">
            <div className="settings-section h-100">
              <div className="settings-section-header">
                <i className="bi bi-droplet-half"></i>
                <h3>Акцентный цвет</h3>
              </div>
            <div className="accent-colors-grid">
              {allAccentColors.map(color => (
                  <div
                    key={color.key}
                  className={`accent-color-card ${settings.accentColor === color.key ? 'active' : ''}`}
                    onClick={() => handleSettingsChange('accentColor', color.key)}
                >
                  <div className="accent-preview" style={{ background: color.preview }}>
                    <div className="accent-preview-content">
                      <div className="preview-button"></div>
                      <div className="preview-link"></div>
                    </div>
                  </div>
                  <div className="accent-info">
                    <span className="accent-name">{color.name}</span>
                    {settings.accentColor === color.key && <i className="bi bi-check-circle-fill accent-selected"></i>}
                  </div>
                </div>
              ))}
              {/* Кастомный цвет как карточка с popover */}
              <div className="custom-color-wrapper" style={{ position: 'relative' }} ref={customColorRef}>
                <div
                  className={`accent-color-card ${settings.accentColor.startsWith('#') || settings.accentColor.startsWith('linear-gradient') ? 'active' : ''}`}
                  onClick={handleCustomColorCardClick}
                >
                  <div className="accent-preview" style={{ background: customColor }}>
                    <div className="accent-preview-content">
                      <div className="preview-button"></div>
                      <div className="preview-link"></div>
                    </div>
                  </div>
                  <div className="accent-info">
                    <span className="accent-name">Свой цвет</span>
                    {(settings.accentColor.startsWith('#') || settings.accentColor.startsWith('linear-gradient')) && (
                      <i className="bi bi-check-circle-fill accent-selected"></i>
                    )}
                  </div>
                </div>
                
                {/* Popover для настройки кастомного цвета */}
                {showCustomColorPopover && (
                  <div 
                    className={`custom-color-popover ${popoverPosition === 'fallback' ? 'popover-fallback' : `popover-${popoverPosition}`}`}
                    ref={popoverRef}
                  >
                    <div className="popover-header">
                      <h6>Цвет</h6>
                      <button 
                        type="button" 
                        className="btn-close" 
                        onClick={() => setShowCustomColorPopover(false)}
                        aria-label="Закрыть"
                      ></button>
                    </div>
                    <div className="popover-body">
                      <div className="form-group">
                        <input
                          type="color"
                          className="form-control form-control-color"
                          value={customColor.startsWith('#') ? customColor : '#475c7b'}
                          onChange={handleCustomColorChange}
                          title="Выбрать цвет"
                        />
                      </div>
                      <div className="form-group">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="#475c7b или linear-gradient(...)"
                          value={customColor}
                          onChange={handleCustomColorChange}
                        />
                      </div>
                    </div>
                    <div className="popover-footer">
                      <button 
                        type="button" 
                        className="btn btn-primary btn-sm"
                        onClick={handleCustomColorApply}
                      >
                        Применить
                      </button>
                      <button 
                        type="button" 
                        className="btn btn-light btn-sm"
                        onClick={() => setShowCustomColorPopover(false)}
                      >
                        Отмена
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="settings-section h-100">
              <div className="settings-section-header">
                <i className="bi bi-gear"></i>
                <h3>Дополнительные настройки</h3>
              </div>
              <div className="settings-form">
                <div className="form-group">
                  <label className="form-label">Анимации</label>
                  <select 
                    className="form-select" 
                    value={settings.animations}
                    onChange={(e) => handleSettingsChange('animations', e.target.value)}
                  >
                    <option value="enabled">Включены</option>
                    <option value="reduced">Уменьшенные</option>
                    <option value="disabled">Отключены</option>
                  </select>
                  <div className="form-text">Анимации переходов и эффектов в интерфейсе.</div>
                </div>
                <div className="form-group">
                  <label className="form-label">Отображение сетки</label>
                  <select 
                    className="form-select" 
                    value={settings.gridDisplay}
                    onChange={(e) => handleSettingsChange('gridDisplay', e.target.value)}
                  >
                    <option value="auto">Авто</option>
                    <option value="compact">Компактная</option>
                    <option value="spacious">Просторная</option>
                  </select>
                  <div className="form-text">Стиль отображения сеток и таблиц.</div>
                </div>
                <div className="form-group">
                  <label className="form-label">Скругление углов</label>
                  <select 
                    className="form-select" 
                    value={settings.borderRadius}
                    onChange={(e) => handleSettingsChange('borderRadius', e.target.value)}
                  >
                    <option value="none">Без скругления</option>
                    <option value="small">Малое</option>
                    <option value="medium">Среднее</option>
                    <option value="large">Большое</option>
                  </select>
                  <div className="form-text">Скругление углов у карточек и кнопок.</div>
                </div>
                <div className="form-group">
                  <div className="form-check form-switch form-check-lg">
                    <input 
                      className="form-check-input" 
                      type="checkbox" 
                      id="shadows" 
                      checked={settings.shadows} 
                      onChange={(e) => handleSettingsChange('shadows', e.target.checked)} 
                    />
                    <label className="form-check-label" htmlFor="shadows">Тени элементов</label>
                  </div>
                  <div className="form-text">Отображение теней у карточек и модальных окон.</div>
                </div>
                <div className="form-group">
                  <div className="form-check form-switch form-check-lg">
                    <input 
                      className="form-check-input" 
                      type="checkbox" 
                      id="transitions" 
                      checked={settings.transitions} 
                      onChange={(e) => handleSettingsChange('transitions', e.target.checked)} 
                    />
                    <label className="form-check-label" htmlFor="transitions">Плавные переходы</label>
                  </div>
                  <div className="form-text">Плавные анимации при изменении состояний элементов.</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Плавающий элемент с кнопками действий */}
      {isDirty && (
        <div className="settings-actions">
          <button
            type="button"
            className="btn btn-light btn-lg me-3"
            onClick={handleCancel}
          >
            Отмена
          </button>
          <button
            type="button"
            className="btn btn-primary btn-lg"
            onClick={handleSave}
          >
            Сохранить изменения
          </button>
          <button 
            type="button" 
            className="btn btn-link text-secondary ms-3"
            onClick={handleReset}
          >
            Сбросить настройки
          </button>
        </div>
      )}
    </div>
  );
};

export default SystemThemeSettings; 