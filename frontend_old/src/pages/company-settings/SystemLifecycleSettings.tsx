import React, { useState, useEffect } from 'react';
import { toastSuccess, toastInfo, toastError } from '../../utils/toastHelper';
import { api } from '../../utils/api';
import './SystemSettings.css';

interface EmployeeStatusTemplate {
  id: string;
  name: string;
  display_name: string;
  default_color: string | null;
  default_icon: string | null;
  is_terminal_default: boolean;
  created_at: string;
  updated_at: string;
}

interface CompanyStatus {
  id: string;
  status_id: string; // template.id
  name: string;
  display_name: string;
  order: number;
  color: string | null;
  icon: string | null;
  is_active: boolean;
  is_terminal: boolean;
  created_at?: string;
  updated_at?: string;
  template?: EmployeeStatusTemplate;
}

interface NewStatusForm {
  name: string;
  color: string;
  icon: string;
  order: number;
  is_terminal: boolean;
  template_id?: string; // Если создаем из шаблона
}

const SystemLifecycleSettings: React.FC = () => {
  const [templates, setTemplates] = useState<EmployeeStatusTemplate[]>([]);
  const [companyStatuses, setCompanyStatuses] = useState<CompanyStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [initialStatuses, setInitialStatuses] = useState<CompanyStatus[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingStatus, setEditingStatus] = useState<CompanyStatus | null>(null);
  const [newStatusForm, setNewStatusForm] = useState<NewStatusForm>({
    name: '',
    color: '#0066cc',
    icon: '👤',
    order: 0,
    is_terminal: false,
  });

  // Загрузка данных
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const lifecycleData = await api.getLifecycleSettings();
      
      // Обрабатываем данные - проверяем, что это массивы
      const templates = Array.isArray(lifecycleData.templates) 
        ? lifecycleData.templates 
        : lifecycleData.templates?.results || [];
      
      const company_statuses = Array.isArray(lifecycleData.company_statuses) 
        ? lifecycleData.company_statuses 
        : lifecycleData.company_statuses?.results || [];
      
      if (templates && company_statuses) {
        // Сортируем статусы по order
        const sortedStatuses = [...company_statuses].sort((a, b) => a.order - b.order);
        setTemplates(templates);
        setCompanyStatuses(sortedStatuses);
        setInitialStatuses(JSON.parse(JSON.stringify(sortedStatuses)));
      }
    } catch (error) {
      toastError('Ошибка при загрузке данных', 'Ошибка');
      console.error('Error loading lifecycle data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Отслеживание изменений
  useEffect(() => {
    const hasChanged = JSON.stringify(companyStatuses) !== JSON.stringify(initialStatuses);
    setIsDirty(hasChanged);
  }, [companyStatuses, initialStatuses]);

  const handleToggleStatus = (statusId: string) => {
    setCompanyStatuses(prev => prev.map(status => 
      status.id === statusId 
        ? { ...status, is_active: !status.is_active }
        : status
    ));
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newStatuses = [...companyStatuses];
    const temp = newStatuses[index - 1].order;
    newStatuses[index - 1].order = newStatuses[index].order;
    newStatuses[index].order = temp;
    [newStatuses[index - 1], newStatuses[index]] = [newStatuses[index], newStatuses[index - 1]];
    setCompanyStatuses(newStatuses);
  };

  const handleMoveDown = (index: number) => {
    if (index === companyStatuses.length - 1) return;
    const newStatuses = [...companyStatuses];
    const temp = newStatuses[index].order;
    newStatuses[index].order = newStatuses[index + 1].order;
    newStatuses[index + 1].order = temp;
    [newStatuses[index], newStatuses[index + 1]] = [newStatuses[index + 1], newStatuses[index]];
    setCompanyStatuses(newStatuses);
  };

  const handleAddFromTemplate = async (template: EmployeeStatusTemplate) => {
    if (companyStatuses.find(s => s.status_id === template.id)) {
      toastInfo('Этот статус уже добавлен', 'Информация');
      return;
    }

    try {
      setSaving(true);
      const maxOrder = companyStatuses.length > 0 
        ? Math.max(...companyStatuses.map(s => s.order)) 
        : 0;
      
      await api.createEmployeeStatus({
        template: template.id,
        order: maxOrder + 1,
        color: template.default_color || null,
        icon: template.default_icon || null,
        is_active: true,
        is_terminal: template.is_terminal_default || false,
      });

      await loadData();
      toastSuccess('Статус успешно добавлен', 'Успешно');
    } catch (error: any) {
      toastError(error.message || 'Ошибка при добавлении статуса', 'Ошибка');
      console.error('Error adding status from template:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateNewStatus = async () => {
    if (!newStatusForm.name.trim()) {
      toastError('Введите название статуса', 'Ошибка');
      return;
    }

    try {
      setSaving(true);
      const maxOrder = companyStatuses.length > 0 
        ? Math.max(...companyStatuses.map(s => s.order)) 
        : 0;
      
      await api.createEmployeeStatus({
        name: newStatusForm.name,
        order: maxOrder + 1,
        color: newStatusForm.color,
        icon: newStatusForm.icon,
        is_active: true,
        is_terminal: newStatusForm.is_terminal,
      });

      setShowCreateForm(false);
      setNewStatusForm({
        name: '',
        color: '#0066cc',
        icon: '👤',
        order: 0,
        is_terminal: false,
      });
      await loadData();
      toastSuccess('Статус успешно создан', 'Успешно');
    } catch (error: any) {
      toastError(error.message || 'Ошибка при создании статуса', 'Ошибка');
      console.error('Error creating status:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleEditStatus = (status: CompanyStatus) => {
    setEditingStatus(status);
    setNewStatusForm({
      name: status.name,
      color: status.color || '#0066cc',
      icon: status.icon || '👤',
      order: status.order,
      is_terminal: status.is_terminal,
    });
    setShowCreateForm(true);
  };

  const handleUpdateStatus = async () => {
    if (!editingStatus || !newStatusForm.name.trim()) {
      toastError('Введите название статуса', 'Ошибка');
      return;
    }

    try {
      setSaving(true);
      await api.updateEmployeeStatus(editingStatus.id, {
        order: newStatusForm.order,
        color: newStatusForm.color,
        icon: newStatusForm.icon,
        is_active: editingStatus.is_active,
        is_terminal: newStatusForm.is_terminal,
      });

      setEditingStatus(null);
      setShowCreateForm(false);
      setNewStatusForm({
        name: '',
        color: '#0066cc',
        icon: '👤',
        order: 0,
        is_terminal: false,
      });
      await loadData();
      toastSuccess('Статус успешно обновлен', 'Успешно');
    } catch (error: any) {
      toastError(error.message || 'Ошибка при обновлении статуса', 'Ошибка');
      console.error('Error updating status:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteStatus = async (statusId: string) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот статус?')) {
      return;
    }

    try {
      setSaving(true);
      await api.deleteEmployeeStatus(statusId);
      await loadData();
      toastSuccess('Статус успешно удален', 'Успешно');
    } catch (error: any) {
      toastError(error.message || 'Ошибка при удалении статуса', 'Ошибка');
      console.error('Error deleting status:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      // Обновляем порядок всех статусов
      const updates = companyStatuses.map((status, index) => ({
        id: status.id,
        order: index + 1,
        is_active: status.is_active,
      }));

      await Promise.all(
        updates.map(update => 
          api.updateEmployeeStatus(update.id, {
            order: update.order,
            is_active: update.is_active,
          })
        )
      );
      
      await loadData();
      toastSuccess('Настройки жизненного цикла успешно сохранены', 'Сохранено');
    } catch (error: any) {
      toastError(error.message || 'Ошибка при сохранении настроек', 'Ошибка');
      console.error('Error saving lifecycle settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setCompanyStatuses(JSON.parse(JSON.stringify(initialStatuses)));
    toastInfo('Изменения отменены', 'Настройки отменены');
  };

  const handleCancelForm = () => {
    setShowCreateForm(false);
    setEditingStatus(null);
    setNewStatusForm({
      name: '',
      color: '#0066cc',
      icon: '👤',
      order: 0,
      is_terminal: false,
    });
  };

  const availableTemplates = templates.filter(
    t => !companyStatuses.find(s => s.status_id === t.id)
  );

  const sortedStatuses = [...companyStatuses].sort((a, b) => a.order - b.order);

  if (loading) {
    return (
      <div className="settings-page">
        <div className="settings-header">
          <div className="settings-header-content">
            <div className="settings-title">
              <i className="bi bi-arrow-repeat"></i>
              <h1>Жизненный цикл специалистов</h1>
            </div>
            <p className="settings-subtitle">Настройка статусов жизненного цикла специалистов</p>
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
      <div className="settings-header">
        <div className="settings-header-content">
          <div className="settings-title">
            <i className="bi bi-arrow-repeat"></i>
            <h1>Жизненный цикл специалистов</h1>
          </div>
          <p className="settings-subtitle">
            Настройте статусы жизненного цикла специалистов для вашей компании. 
            Выберите нужные статусы из шаблонов или создайте свои собственные.
          </p>
        </div>
      </div>

      <div className="settings-content-wrapper">
        <div className="settings-grid">
          {/* Активные статусы */}
          <div className="settings-section" style={{ gridColumn: '1 / -1' }}>
            <div className="settings-section-header">
              <i className="bi bi-list-check text-primary"></i>
              <h3>Активные статусы компании</h3>
            </div>

            {sortedStatuses.length === 0 ? (
              <div className="text-center p-4 text-muted">
                <i className="bi bi-inbox" style={{ fontSize: '3rem', opacity: 0.3 }}></i>
                <p className="mt-3">Нет активных статусов</p>
                <p className="small">Добавьте статусы из списка доступных шаблонов или создайте свой</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th style={{ width: '50px' }}>Порядок</th>
                      <th style={{ width: '80px' }}>Иконка</th>
                      <th>Название</th>
                      <th style={{ width: '100px' }}>Цвет</th>
                      <th style={{ width: '100px' }}>Статус</th>
                      <th style={{ width: '100px' }}>Терминальный</th>
                      <th style={{ width: '200px' }}>Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedStatuses.map((status, index) => (
                      <tr key={status.id}>
                        <td>
                          <span className="badge bg-secondary">{status.order}</span>
                        </td>
                        <td>
                          <span style={{ fontSize: '1.5rem' }}>{status.icon || '👤'}</span>
                        </td>
                        <td>
                          <strong>{status.display_name || status.name}</strong>
                        </td>
                        <td>
                          <div
                            style={{
                              width: '30px',
                              height: '30px',
                              backgroundColor: status.color || '#0066cc',
                              borderRadius: '4px',
                              border: '1px solid #ddd',
                            }}
                            title={status.color || '#0066cc'}
                          ></div>
                        </td>
                        <td>
                          <div className="form-check form-switch">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              checked={status.is_active}
                              onChange={() => handleToggleStatus(status.id)}
                            />
                          </div>
                        </td>
                        <td>
                          {status.is_terminal && (
                            <span className="badge bg-danger">Терминальный</span>
                          )}
                        </td>
                        <td>
                          <div className="btn-group btn-group-sm">
                            <button
                              className="btn btn-outline-primary"
                              onClick={() => handleEditStatus(status)}
                              title="Редактировать"
                            >
                              <i className="bi bi-pencil"></i>
                            </button>
                            <button
                              className="btn btn-outline-secondary"
                              onClick={() => handleMoveUp(index)}
                              disabled={index === 0}
                              title="Вверх"
                            >
                              <i className="bi bi-arrow-up"></i>
                            </button>
                            <button
                              className="btn btn-outline-secondary"
                              onClick={() => handleMoveDown(index)}
                              disabled={index === sortedStatuses.length - 1}
                              title="Вниз"
                            >
                              <i className="bi bi-arrow-down"></i>
                            </button>
                            <button
                              className="btn btn-outline-danger"
                              onClick={() => handleDeleteStatus(status.id)}
                              title="Удалить"
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Форма создания нового статуса */}
          <div className="settings-section">
            <div className="settings-section-header">
              <i className="bi bi-plus-circle text-success"></i>
              <h3>Создать новый статус</h3>
            </div>

            {!showCreateForm ? (
              <div className="card" style={{ border: '2px dashed #dee2e6', cursor: 'pointer' }}>
                <div className="card-body text-center p-4" onClick={() => {
                  setEditingStatus(null);
                  setShowCreateForm(true);
                }}>
                  <i className="bi bi-plus-circle" style={{ fontSize: '3rem', color: '#28a745', opacity: 0.5 }}></i>
                  <p className="mt-3 mb-0">Нажмите, чтобы создать новый статус</p>
                </div>
              </div>
            ) : (
              <div className="card">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="mb-0">
                      <i className="bi bi-plus-circle text-success me-2"></i>
                      {editingStatus ? 'Редактирование статуса' : 'Создать новый статус'}
                    </h6>
                    <button
                      className="btn btn-sm btn-outline-secondary"
                      onClick={handleCancelForm}
                      disabled={saving}
                    >
                      <i className="bi bi-x"></i>
                    </button>
                  </div>
                  
                  <div className="row g-3">
                    <div className="col-md-12">
                      <label className="form-label">Название статуса *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={newStatusForm.name}
                        onChange={(e) => setNewStatusForm({ ...newStatusForm, name: e.target.value })}
                        placeholder="Например: Кандидат"
                        disabled={editingStatus !== null} // Нельзя менять название при редактировании
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Цвет</label>
                      <input
                        type="color"
                        className="form-control form-control-color"
                        value={newStatusForm.color}
                        onChange={(e) => setNewStatusForm({ ...newStatusForm, color: e.target.value })}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Иконка (emoji)</label>
                      <input
                        type="text"
                        className="form-control"
                        value={newStatusForm.icon}
                        onChange={(e) => setNewStatusForm({ ...newStatusForm, icon: e.target.value })}
                        placeholder="👤"
                        maxLength={2}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Порядок</label>
                      <input
                        type="number"
                        className="form-control"
                        value={newStatusForm.order}
                        onChange={(e) => setNewStatusForm({ ...newStatusForm, order: parseInt(e.target.value) || 0 })}
                        min="0"
                      />
                    </div>
                    <div className="col-md-12">
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={newStatusForm.is_terminal}
                          onChange={(e) => setNewStatusForm({ ...newStatusForm, is_terminal: e.target.checked })}
                        />
                        <label className="form-check-label">
                          Терминальный статус (например, Черный список)
                        </label>
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="btn-group">
                        <button
                          className="btn btn-primary"
                          onClick={editingStatus ? handleUpdateStatus : handleCreateNewStatus}
                          disabled={saving || !newStatusForm.name.trim()}
                        >
                          {saving ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2"></span>
                              Сохранение...
                            </>
                          ) : (
                            <>
                              <i className={`bi ${editingStatus ? 'bi-check' : 'bi-plus-circle'} me-2`}></i>
                              {editingStatus ? 'Сохранить изменения' : 'Создать статус'}
                            </>
                          )}
                        </button>
                        <button
                          className="btn btn-secondary"
                          onClick={handleCancelForm}
                          disabled={saving}
                        >
                          <i className="bi bi-x me-2"></i>Отменить
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Доступные шаблоны */}
          <div className="settings-section">
            <div className="settings-section-header">
              <i className="bi bi-collection text-info"></i>
              <h3>Доступные шаблоны</h3>
            </div>

            {availableTemplates.length === 0 ? (
              <div className="text-center p-4 text-muted">
                <i className="bi bi-check-circle" style={{ fontSize: '2rem', opacity: 0.3 }}></i>
                <p className="mt-2 small">Все доступные статусы уже добавлены</p>
              </div>
            ) : (
              <div className="d-flex flex-column gap-2">
                {availableTemplates.map(template => (
                  <div
                    key={template.id}
                    className="card"
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleAddFromTemplate(template)}
                  >
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center gap-3">
                          <span style={{ fontSize: '1.5rem' }}>{template.default_icon || '👤'}</span>
                          <div>
                            <h6 className="mb-1">{template.display_name || template.name}</h6>
                            {template.is_terminal_default && (
                              <span className="badge bg-danger">Терминальный</span>
                            )}
                          </div>
                        </div>
                        <button 
                          className="btn btn-sm btn-outline-primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddFromTemplate(template);
                          }}
                        >
                          <i className="bi bi-plus"></i> Добавить
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Кнопки действий */}
        {isDirty && !showCreateForm && (
          <div className="settings-actions">
            <button
              className="btn btn-secondary"
              onClick={handleReset}
              disabled={saving}
            >
              <i className="bi bi-arrow-counterclockwise"></i> Отменить
            </button>
            <button
              className="btn btn-primary btn-lg"
              onClick={handleSaveAll}
              disabled={saving}
            >
              {saving ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Сохранение...
                </>
              ) : (
                <>
                  <i className="bi bi-check-circle me-2"></i>
                  Сохранить изменения
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemLifecycleSettings;
