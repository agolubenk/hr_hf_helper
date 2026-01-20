import React, { useState, useEffect, useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';
import './SystemSettings.css';

const SystemSecuritySettings: React.FC = () => {
  const { addToast } = useAppContext();

  // Исходные данные "с сервера" - обернуты в useMemo для оптимизации
  const initialSettings = useMemo(() => ({
    passwordMinLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    lockoutDuration: 15,
    twoFactorAuth: false,
    ipWhitelist: '',
    ipBlacklist: '',
    auditLogging: true,
    auditActions: {
      logLoginSuccess: true,
      logLoginFailure: true,
      logDataExport: true,
      logSettingsChanges: true,
      logUserManagement: true,
    },
  }), []);

  const [settings, setSettings] = useState(initialSettings);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    // Проверяем, есть ли изменения, сравнивая с начальными настройками
    const hasChanges = JSON.stringify(settings) !== JSON.stringify(initialSettings);
    setIsDirty(hasChanges);
  }, [settings, initialSettings]);

  const handleSettingsChange = (field: keyof typeof settings, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleAuditActionChange = (action: keyof typeof initialSettings.auditActions, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      auditActions: {
        ...(prev.auditActions || initialSettings.auditActions),
        [action]: value,
      }
    }));
  };

  const handleSave = () => {
    console.log('Сохранение настроек безопасности:', settings);
    addToast('Настройки безопасности успешно сохранены.', { type: 'success', title: 'Сохранено' });
    // В реальном приложении здесь бы обновлялись initialSettings
    // setIsDirty(false); 
  };
  
  const handleCancel = () => {
    setSettings(initialSettings);
    addToast('Изменения отменены.', { type: 'info', title: 'Отмена' });
  };

  return (
    <div className="settings-page">
      <div className="settings-header">
        <div className="settings-header-content">
          <div className="settings-title">
            <i className="bi bi-shield-lock"></i>
            <div>
              <h1>Безопасность</h1>
              <p className="settings-subtitle">
                Управление политиками паролей, сессиями и защитой системы.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="settings-content-wrapper">
        <div className="settings-layout">
          <div className="settings-main-content">
            <div className="settings-grid">
              {/* Политика паролей */}
              <div className="settings-section">
                <div className="settings-section-header">
                  <i className="bi bi-key"></i>
                  <h3>Политика паролей</h3>
                </div>
                <div className="settings-form">
                  <div className="form-group">
                    <div className="d-flex justify-content-between align-items-center">
                      <label htmlFor="passwordMinLength" className="form-label mb-0">Минимальная длина пароля</label>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        id="passwordMinLength"
                        min="6" max="20"
                        value={settings.passwordMinLength}
                        onChange={(e) => handleSettingsChange('passwordMinLength', Number(e.target.value))}
                        style={{ width: '80px' }}
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Требования к паролю</label>
                    <div className="d-flex flex-column gap-2">
                      <div className="form-check form-switch">
                        <input className="form-check-input" type="checkbox" id="requireUppercase" checked={settings.requireUppercase} onChange={(e) => handleSettingsChange('requireUppercase', e.target.checked)} />
                        <label className="form-check-label" htmlFor="requireUppercase">Заглавные буквы</label>
                      </div>
                      <div className="form-check form-switch">
                        <input className="form-check-input" type="checkbox" id="requireLowercase" checked={settings.requireLowercase} onChange={(e) => handleSettingsChange('requireLowercase', e.target.checked)} />
                        <label className="form-check-label" htmlFor="requireLowercase">Строчные буквы</label>
                      </div>
                      <div className="form-check form-switch">
                        <input className="form-check-input" type="checkbox" id="requireNumbers" checked={settings.requireNumbers} onChange={(e) => handleSettingsChange('requireNumbers', e.target.checked)} />
                        <label className="form-check-label" htmlFor="requireNumbers">Цифры</label>
                      </div>
                      <div className="form-check form-switch">
                        <input className="form-check-input" type="checkbox" id="requireSpecialChars" checked={settings.requireSpecialChars} onChange={(e) => handleSettingsChange('requireSpecialChars', e.target.checked)} />
                        <label className="form-check-label" htmlFor="requireSpecialChars">Спец. символы</label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Управление доступом */}
              <div className="settings-section">
                <div className="settings-section-header">
                    <i className="bi bi-person-lock"></i>
                    <h3>Управление доступом</h3>
                </div>
                <div className="settings-form">
                    <div className="form-group">
                      <div className="d-flex justify-content-between align-items-center">
                        <label htmlFor="maxLoginAttempts" className="form-label mb-0">Попыток входа</label>
                        <input type="number" className="form-control form-control-sm" id="maxLoginAttempts" min="3" max="10" value={settings.maxLoginAttempts} onChange={(e) => handleSettingsChange('maxLoginAttempts', Number(e.target.value))} style={{ width: '80px' }} />
                      </div>
                    </div>
                    <div className="form-group">
                      <div className="d-flex justify-content-between align-items-center">
                        <label htmlFor="lockoutDuration" className="form-label mb-0">Блокировка (мин)</label>
                        <input type="number" className="form-control form-control-sm" id="lockoutDuration" min="5" max="60" value={settings.lockoutDuration} onChange={(e) => handleSettingsChange('lockoutDuration', Number(e.target.value))} style={{ width: '80px' }}/>
                      </div>
                    </div>
                    <div className="form-group">
                        <div className="d-flex justify-content-between align-items-center">
                            <label htmlFor="sessionTimeout" className="form-label mb-0">Таймаут сессии (минуты)</label>
                            <input type="number" className="form-control form-control-sm" id="sessionTimeout" min="5" max="480" value={settings.sessionTimeout} onChange={(e) => handleSettingsChange('sessionTimeout', Number(e.target.value))} style={{ width: '80px' }}/>
                        </div>
                        <div className="form-text mt-2">Время неактивности до автоматического выхода.</div>
                    </div>
                </div>
              </div>
              
              {/* Расширенная безопасность */}
              <div className="settings-section modules-section">
                <div className="settings-section-header">
                    <i className="bi bi-shield-check"></i>
                    <h3>Расширенная безопасность</h3>
                </div>
                <div className="settings-form">
                  <div className="form-group">
                    <div className="form-check form-switch form-check-lg">
                      <input className="form-check-input" type="checkbox" id="twoFactorAuth" checked={settings.twoFactorAuth} onChange={(e) => handleSettingsChange('twoFactorAuth', e.target.checked)} />
                      <label className="form-check-label" htmlFor="twoFactorAuth">Включить двухфакторную аутентификацию (2FA)</label>
                    </div>
                    <div className="form-text">Повышает безопасность аккаунтов, требуя второй шаг проверки при входе.</div>
                    {settings.twoFactorAuth && (
                        <div className="alert alert-info mt-2"><i className="bi bi-info-circle me-2"></i>Пользователи смогут настроить 2FA в своих профилях.</div>
                    )}
                  </div>

                  <div className="form-group">
                      <label htmlFor="ipWhitelist" className="form-label">Белый список IP-адресов</label>
                      <textarea className="form-control" id="ipWhitelist" rows={3} placeholder="192.168.1.0/24&#10;10.0.0.0/8" value={settings.ipWhitelist} onChange={(e) => handleSettingsChange('ipWhitelist', e.target.value)} />
                      <div className="form-text">Один IP-адрес или подсеть на строку. Оставьте пустым, чтобы разрешить доступ с любых адресов.</div>
                  </div>

                  <div className="form-group">
                      <label htmlFor="ipBlacklist" className="form-label">Черный список IP-адресов</label>
                      <textarea className="form-control" id="ipBlacklist" rows={3} placeholder="203.0.113.0/24&#10;198.51.100.0/24" value={settings.ipBlacklist} onChange={(e) => handleSettingsChange('ipBlacklist', e.target.value)} />
                      <div className="form-text">Один IP-адрес или подсеть на строку. Доступ с этих адресов будет заблокирован.</div>
                  </div>
                </div>
              </div>

              {/* Аудит */}
              <div className="settings-section modules-section">
                <div className="settings-section-header">
                    <i className="bi bi-journal-text"></i>
                    <h3>Аудит и логирование</h3>
                </div>
                <div className="form-check form-switch form-check-lg">
                    <input className="form-check-input" type="checkbox" id="auditLogging" checked={settings.auditLogging} onChange={(e) => handleSettingsChange('auditLogging', e.target.checked)} />
                    <label className="form-check-label" htmlFor="auditLogging">Включить подробное логирование действий</label>
                </div>
                <div className="form-text">Запись всех важных действий пользователей в системе для последующего анализа.</div>
                  {settings.auditLogging && (
                    <div className="alert alert-warning mt-2"><i className="bi bi-exclamation-triangle me-2"></i>Включение аудита может незначительно повлиять на производительность.</div>
                  )}
                  {settings.auditLogging && (
                    <div className="mt-3 p-3 bg-body-tertiary border rounded-3">
                      <label className="form-label fw-semibold">Какие действия логировать:</label>
                      <div className="row mt-2 justify-content-end">
                        <div className="col-md-6">
                          <div className="form-check">
                            <input className="form-check-input" type="checkbox" id="logLoginSuccess" checked={settings.auditActions?.logLoginSuccess ?? false} onChange={(e) => handleAuditActionChange('logLoginSuccess', e.target.checked)} />
                            <label className="form-check-label" htmlFor="logLoginSuccess">Успешные входы</label>
                          </div>
                          <div className="form-check">
                            <input className="form-check-input" type="checkbox" id="logLoginFailure" checked={settings.auditActions?.logLoginFailure ?? false} onChange={(e) => handleAuditActionChange('logLoginFailure', e.target.checked)} />
                            <label className="form-check-label" htmlFor="logLoginFailure">Неудачные входы</label>
                          </div>
                           <div className="form-check">
                            <input className="form-check-input" type="checkbox" id="logUserManagement" checked={settings.auditActions?.logUserManagement ?? false} onChange={(e) => handleAuditActionChange('logUserManagement', e.target.checked)} />
                            <label className="form-check-label" htmlFor="logUserManagement">Управление пользователями</label>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-check">
                            <input className="form-check-input" type="checkbox" id="logDataExport" checked={settings.auditActions?.logDataExport ?? false} onChange={(e) => handleAuditActionChange('logDataExport', e.target.checked)} />
                            <label className="form-check-label" htmlFor="logDataExport">Экспорт данных</label>
                          </div>
                          <div className="form-check">
                            <input className="form-check-input" type="checkbox" id="logSettingsChanges" checked={settings.auditActions?.logSettingsChanges ?? false} onChange={(e) => handleAuditActionChange('logSettingsChanges', e.target.checked)} />
                            <label className="form-check-label" htmlFor="logSettingsChanges">Изменение настроек</label>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
              </div>
            </div>
          </div>

          <div className="settings-sidebar">
            <div className="settings-section">
              <div className="settings-section-header">
                <i className="bi bi-graph-up"></i>
                <h3>Статистика</h3>
              </div>
              <ul className="settings-stats-list">
                <li><span>Активные сессии</span><span className="badge bg-primary-subtle text-primary-emphasis">24</span></li>
                <li><span>Заблокировано</span><span className="badge bg-danger-subtle text-danger-emphasis">3</span></li>
                <li><span>Всего попыток входа</span><span className="badge bg-info-subtle text-info-emphasis">156</span></li>
                <li><span>Подозрительная активность</span><span className="badge bg-warning-subtle text-warning-emphasis">2</span></li>
              </ul>
            </div>
            <div className="settings-section mt-4">
              <div className="settings-section-header">
                <i className="bi bi-play-circle"></i>
                <h3>Быстрые действия</h3>
              </div>
              <div className="d-grid gap-2">
                <button className="btn btn-outline-secondary"><i className="bi bi-download me-2"></i>Экспорт логов</button>
                <button id="scan-system-btn" className="btn btn-scan-system"><i className="bi bi-shield-check me-2"></i>Сканировать систему</button>
                <button className="btn btn-primary"><i className="bi bi-bell me-2"></i>Настроить уведомления</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {isDirty && (
        <div className="settings-actions">
          <button type="button" className="btn btn-secondary btn-lg" onClick={handleCancel}>
            Отменить
          </button>
          <button type="button" className="btn btn-primary btn-lg" onClick={handleSave}>
            <i className="bi bi-save me-2"></i>
            Сохранить изменения
          </button>
        </div>
      )}
    </div>
  );
};

export default SystemSecuritySettings; 