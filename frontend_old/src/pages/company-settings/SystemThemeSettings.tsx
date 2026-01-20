import React, { useState, useEffect } from 'react';
import { toastSuccess, toastInfo, toastError } from '../../utils/toastHelper';
import { api } from '../../utils/api';
import './SystemSettings.css';

interface Theme {
  id: string;
  name: string;
  theme_type: 'light' | 'dark';
  is_active: boolean;
  is_default: boolean;
  css_file?: string;
  css_file_url?: string;
  icon_primary?: string;
  icon_primary_url?: string;
  icon_secondary?: string;
  icon_secondary_url?: string;
  theme_data: {
    data_theme?: string;
    icon?: string;
    fruit_icon?: string;
    fruit_image_path?: string;
    secondary_image_path?: string;
  };
  order: number;
}

const SystemThemeSettings: React.FC = () => {
  const [lightThemes, setLightThemes] = useState<Theme[]>([]);
  const [darkThemes, setDarkThemes] = useState<Theme[]>([]);
  const [selectedLightThemes, setSelectedLightThemes] = useState<Set<string>>(new Set());
  const [selectedDarkThemes, setSelectedDarkThemes] = useState<Set<string>>(new Set());
  const [initialSelectedLightThemes, setInitialSelectedLightThemes] = useState<Set<string>>(new Set());
  const [initialSelectedDarkThemes, setInitialSelectedDarkThemes] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadThemes();
  }, []);

  const loadThemes = async () => {
    setLoading(true);
    try {
      const [light, dark, selected] = await Promise.all([
        api.getLightThemes() as Promise<Theme[]>,
        api.getDarkThemes() as Promise<Theme[]>,
        api.getCompanySelectedThemes() as Promise<Theme[]>,
      ]);
      
      setLightThemes(light || []);
      setDarkThemes(dark || []);
      
      // Загружаем выбранные темы из API
      const lightSet = new Set<string>();
      const darkSet = new Set<string>();
      
      // Находим тему "Light" (не "Aqua Lime Light")
      const lightTheme = light?.find(t => t.name === 'Light');
      if (lightTheme) {
        lightSet.add(lightTheme.id);
      }
      
      // Добавляем выбранные темы из API
      if (selected && Array.isArray(selected)) {
        selected.forEach((theme: Theme) => {
          if (theme.theme_type === 'light') {
            lightSet.add(theme.id);
          } else if (theme.theme_type === 'dark') {
            darkSet.add(theme.id);
          }
        });
      }
      
      setSelectedLightThemes(lightSet);
      setSelectedDarkThemes(darkSet);
      setInitialSelectedLightThemes(new Set(lightSet));
      setInitialSelectedDarkThemes(new Set(darkSet));
    } catch (error) {
      console.error('Error loading themes:', error);
      toastError('Не удалось загрузить темы', 'Ошибка');
    } finally {
      setLoading(false);
    }
  };

  const handleLightThemeToggle = (themeId: string) => {
    // Находим тему "Light"
    const lightTheme = lightThemes.find(t => t.name === 'Light');
    const isLightTheme = lightTheme?.id === themeId;
    
    // Светлая тема "Light" нельзя отключить
    if (isLightTheme && selectedLightThemes.has(themeId)) {
      toastInfo('Светлая тема "Light" не может быть отключена', 'Информация');
      return;
    }
    
    const newSelected = new Set(selectedLightThemes);
    if (newSelected.has(themeId)) {
      newSelected.delete(themeId);
    } else {
      newSelected.add(themeId);
    }
    setSelectedLightThemes(newSelected);
  };

  const handleDarkThemeToggle = (themeId: string) => {
    const newSelected = new Set(selectedDarkThemes);
    if (newSelected.has(themeId)) {
      newSelected.delete(themeId);
    } else {
      newSelected.add(themeId);
    }
    setSelectedDarkThemes(newSelected);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Убеждаемся, что тема "Light" всегда выбрана
      const lightTheme = lightThemes.find(t => t.name === 'Light');
      const finalLightThemes = new Set(selectedLightThemes);
      if (lightTheme) {
        finalLightThemes.add(lightTheme.id);
      }
      
      // Объединяем все выбранные темы
      const allSelectedThemeIds = Array.from([...finalLightThemes, ...selectedDarkThemes]);
      
      // Сохраняем через API
      const savedThemes = await api.updateCompanySelectedThemes(allSelectedThemeIds) as Theme[];
      
      // Обновляем состояние на основе ответа API
      const savedLightSet = new Set<string>();
      const savedDarkSet = new Set<string>();
      
      savedThemes.forEach((theme: Theme) => {
        if (theme.theme_type === 'light') {
          savedLightSet.add(theme.id);
        } else if (theme.theme_type === 'dark') {
          savedDarkSet.add(theme.id);
        }
      });
      
      setSelectedLightThemes(savedLightSet);
      setSelectedDarkThemes(savedDarkSet);
      setInitialSelectedLightThemes(new Set(savedLightSet));
      setInitialSelectedDarkThemes(new Set(savedDarkSet));
      
      toastSuccess('Выбор тем сохранен', 'Сохранено');
    } catch (error: any) {
      console.error('Error saving themes:', error);
      toastError(error.message || 'Ошибка при сохранении тем', 'Ошибка');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Восстанавливаем начальные значения
    setSelectedLightThemes(new Set(initialSelectedLightThemes));
    setSelectedDarkThemes(new Set(initialSelectedDarkThemes));
    toastInfo('Изменения отменены', 'Отмена');
  };

  // Проверяем, есть ли изменения
  const isDirty = 
    JSON.stringify(Array.from(selectedLightThemes).sort()) !== JSON.stringify(Array.from(initialSelectedLightThemes).sort()) ||
    JSON.stringify(Array.from(selectedDarkThemes).sort()) !== JSON.stringify(Array.from(initialSelectedDarkThemes).sort());

  if (loading) {
    return (
      <div className="settings-page">
        <div className="settings-header">
          <div className="settings-header-content">
            <div className="settings-title">
              <i className="bi bi-palette"></i>
              <div>
                <h1>Внешний вид</h1>
                <p className="settings-subtitle">
                  Настройте акцентные цвета и темы оформления для всей системы.
                </p>
              </div>
            </div>
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

  const lightTheme = lightThemes.find(t => t.name === 'Light');

  return (
    <div className="settings-page">
      <div className="settings-header">
        <div className="settings-header-content">
          <div className="settings-title">
            <i className="bi bi-palette"></i>
            <div>
              <h1>Внешний вид</h1>
              <p className="settings-subtitle">
                Настройте акцентные цвета и темы оформления для всей системы.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="settings-content-wrapper">
        <div className="settings-grid">
          <div className="settings-section h-100">
            <div className="settings-section-header">
              <i className="bi bi-sun"></i>
              <h3>Варианты светлых тем</h3>
            </div>
            <div className="accent-colors-grid">
              {lightThemes.map(theme => {
                // Используем URL из API
                const primaryImageUrl = theme.icon_primary_url || '';
                const secondaryImageUrl = theme.icon_secondary_url || '';
                const isSelected = selectedLightThemes.has(theme.id);
                const isLightTheme = theme.name === 'Light';
                const isDisabled = isLightTheme && isSelected; // Светлая тема "Light" нельзя отключить
                
                // Формируем название: убираем "Light" из конца, оставляем только основную часть
                let displayName = theme.name;
                displayName = displayName.replace(/\s+Light$/i, '');
                
                return (
                  <div
                    key={theme.id}
                    className="accent-color-card"
                    onClick={() => !isDisabled && handleLightThemeToggle(theme.id)}
                    style={{ cursor: isDisabled ? 'not-allowed' : 'pointer', opacity: isDisabled ? 0.6 : 1 }}
                  >
                    <div className="accent-preview" style={{ 
                      background: '#dee2e6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      overflow: 'hidden',
                      borderBottom: '1px solid rgba(0, 0, 0, 0.1)'
                    }}>
                      {secondaryImageUrl && (
                        <img 
                          src={secondaryImageUrl} 
                          alt={theme.name} 
                          style={{ 
                            position: 'absolute',
                            bottom: '10%',
                            right: '0%',
                            width: '50%', 
                            height: '50%', 
                            objectFit: 'contain',
                            zIndex: 2,
                            filter: 'drop-shadow(rgba(0, 0, 0, 0.2) 0px 2px 4px)'
                          }} 
                        />
                      )}
                      <div className="accent-preview-content" style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: primaryImageUrl ? 'space-between' : 'center',
                        width: primaryImageUrl ? '110%' : '100%',
                        height: primaryImageUrl ? '110%' : '100%',
                        position: 'relative',
                        overflow: 'hidden'
                      }}>
                        {primaryImageUrl ? (
                          <img 
                            src={primaryImageUrl} 
                            alt={theme.name} 
                            style={{ 
                              width: '100%', 
                              height: '100%', 
                              objectFit: 'contain',
                              zIndex: 1
                            }} 
                          />
                        ) : (
                          <span style={{ fontSize: '3rem' }}>{theme.theme_data?.icon || '☀️'}</span>
                        )}
                      </div>
                    </div>
                    <div className="accent-info">
                      <span className="accent-name">{displayName}</span>
                      {isSelected && <i className="bi bi-check-circle-fill accent-selected"></i>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="settings-section h-100">
            <div className="settings-section-header">
              <i className="bi bi-moon-stars"></i>
              <h3>Варианты темных тем</h3>
            </div>
            <div className="accent-colors-grid">
              {darkThemes.map(theme => {
                // Используем URL из API
                const primaryImageUrl = theme.icon_primary_url || '';
                const secondaryImageUrl = theme.icon_secondary_url || '';
                const isSelected = selectedDarkThemes.has(theme.id);
                
                // Формируем название: убираем "Dark" и "Moon" из конца, оставляем только основную часть
                let displayName = theme.name;
                displayName = displayName.replace(/\s+Moon\s+Dark$/i, '');
                displayName = displayName.replace(/\s+Dark$/i, '');
                
                return (
                  <div
                    key={theme.id}
                    className="accent-color-card"
                    onClick={() => handleDarkThemeToggle(theme.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="accent-preview" style={{ 
                      background: 'rgb(26, 26, 26)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      overflow: 'hidden',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                    }}>
                      {secondaryImageUrl && (
                        <img 
                          src={secondaryImageUrl} 
                          alt={theme.name} 
                          style={{ 
                            position: 'absolute',
                            bottom: '10%',
                            right: '0%',
                            width: '50%', 
                            height: '50%', 
                            objectFit: 'contain',
                            zIndex: 2,
                            filter: 'drop-shadow(rgba(0, 0, 0, 0.2) 0px 2px 4px)'
                          }} 
                        />
                      )}
                      <div className="accent-preview-content" style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: primaryImageUrl ? 'space-between' : 'center',
                        width: primaryImageUrl ? '110%' : '100%',
                        height: primaryImageUrl ? '110%' : '100%',
                        position: 'relative',
                        overflow: 'hidden'
                      }}>
                        {primaryImageUrl ? (
                          <img 
                            src={primaryImageUrl} 
                            alt={theme.name} 
                            style={{ 
                              width: '100%', 
                              height: '100%', 
                              objectFit: 'contain',
                              zIndex: 1
                            }} 
                          />
                        ) : (
                          <span style={{ fontSize: '3rem' }}>{theme.theme_data?.icon || '🌙'}</span>
                        )}
                </div>
              </div>
                    <div className="accent-info">
                      <span className="accent-name">{displayName}</span>
                      {isSelected && <i className="bi bi-check-circle-fill accent-selected"></i>}
                </div>
              </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Блок подтверждения изменений */}
      {isDirty && (
        <div className="settings-actions">
          <button
            type="button"
            className="btn btn-secondary btn-lg"
            onClick={handleCancel}
            disabled={saving}
          >
            Отменить
          </button>
          <button
            type="button"
            className="btn btn-primary btn-lg"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
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

export default SystemThemeSettings;
