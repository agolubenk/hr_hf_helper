import React, { useState, useEffect } from 'react';
import { toastSuccess, toastInfo, toastError } from '../../utils/toastHelper';
import { api } from '../../utils/api';
import './SystemSettings.css';

interface RejectionReasonTemplate {
  template_id: string;
  name: string;
  description: string;
  is_active: boolean;
}

interface TerminationReasonTemplate {
  template_id: string;
  name: string;
  description: string;
  category: string;
  category_display: string;
  is_active: boolean;
}

interface CompanyRejectionReason {
  reason_id: string;
  template: RejectionReasonTemplate;
  order: number;
  is_active: boolean;
}

interface CompanyTerminationReason {
  reason_id: string;
  template: TerminationReasonTemplate;
  order: number;
  is_active: boolean;
}

interface CompanyStatus {
  id: string;
  name: string;
  display_name: string;
  order: number;
  is_active: boolean;
  is_terminal: boolean;
}

interface RejectionAvailability {
  id: string;
  status_id: string;
  status_name: string;
  rejection_reason_id: string;
  rejection_reason_name: string;
}

const SystemReasonsSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'rejection' | 'termination'>('rejection');
  
  // Причины отказов
  const [rejectionTemplates, setRejectionTemplates] = useState<RejectionReasonTemplate[]>([]);
  const [companyRejections, setCompanyRejections] = useState<CompanyRejectionReason[]>([]);
  const [initialRejections, setInitialRejections] = useState<CompanyRejectionReason[]>([]);
  
  // Причины увольнений
  const [terminationTemplates, setTerminationTemplates] = useState<TerminationReasonTemplate[]>([]);
  const [companyTerminations, setCompanyTerminations] = useState<CompanyTerminationReason[]>([]);
  const [initialTerminations, setInitialTerminations] = useState<CompanyTerminationReason[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  
  // Этапы жизненного цикла и доступность причин отказов
  const [companyStatuses, setCompanyStatuses] = useState<CompanyStatus[]>([]);
  const [rejectionAvailability, setRejectionAvailability] = useState<RejectionAvailability[]>([]);
  
  // Формы создания новых причин
  const [showCreateRejectionForm, setShowCreateRejectionForm] = useState(false);
  const [showCreateTerminationForm, setShowCreateTerminationForm] = useState(false);
  const [newRejectionForm, setNewRejectionForm] = useState({
    new_name: '',
    new_description: '',
    order: 0,
    is_active: true,
  });
  const [newTerminationForm, setNewTerminationForm] = useState({
    new_name: '',
    new_description: '',
    order: 0,
    is_active: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const rejectionsChanged = JSON.stringify(companyRejections) !== JSON.stringify(initialRejections);
    const terminationsChanged = JSON.stringify(companyTerminations) !== JSON.stringify(initialTerminations);
    setIsDirty(rejectionsChanged || terminationsChanged);
  }, [companyRejections, initialRejections, companyTerminations, initialTerminations]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Загружаем данные через API
      const reasonsData = await api.getReasonsSettings();
      
      // Загружаем этапы жизненного цикла
      const lifecycleData = await api.getLifecycleSettings();
      const statuses = Array.isArray(lifecycleData.company_statuses) 
        ? lifecycleData.company_statuses 
        : lifecycleData.company_statuses?.results || [];
      setCompanyStatuses(statuses.filter((s: CompanyStatus) => s.is_active && !s.is_terminal));
      
      // Загружаем доступность причин отказов
      try {
        const availabilityData = await api.getRejectionAvailability();
        const availability = Array.isArray(availabilityData) 
          ? availabilityData 
          : availabilityData?.results || [];
        setRejectionAvailability(availability);
      } catch (error) {
        console.warn('Failed to load rejection availability:', error);
        setRejectionAvailability([]);
      }
      
      if (reasonsData.rejection_templates && reasonsData.termination_templates) {
        setRejectionTemplates(reasonsData.rejection_templates);
        setTerminationTemplates(reasonsData.termination_templates);
        setCompanyRejections(reasonsData.company_rejections || []);
        setCompanyTerminations(reasonsData.company_terminations || []);
        setInitialRejections(JSON.parse(JSON.stringify(reasonsData.company_rejections || [])));
        setInitialTerminations(JSON.parse(JSON.stringify(reasonsData.company_terminations || [])));
      } else {
        // Fallback на моковые данные если API не вернул данные
      const mockRejectionTemplates: RejectionReasonTemplate[] = [
        { template_id: '1', name: 'Недостаточная квалификация', description: 'Кандидат не соответствует требованиям', category: 'qualification', category_display: 'Квалификация', is_active: true },
        { template_id: '2', name: 'Не подходит по зарплате', description: 'Не сошлись в зарплате', category: 'salary', category_display: 'Зарплата', is_active: true },
        { template_id: '3', name: 'Не подходит локация', description: 'Не подходит расположение офиса', category: 'location', category_display: 'Локация', is_active: true },
        { template_id: '4', name: 'Не подходит корпоративная культура', description: 'Не соответствует ценностям компании', category: 'culture', category_display: 'Корпоративная культура', is_active: true },
      ];

      const mockTerminationTemplates: TerminationReasonTemplate[] = [
        { template_id: '1', name: 'По собственному желанию', description: 'Сотрудник уволился по собственному желанию', category: 'resignation', category_display: 'По собственному желанию', is_active: true },
        { template_id: '2', name: 'Увольнение', description: 'Уволен по инициативе работодателя', category: 'dismissal', category_display: 'Увольнение', is_active: true },
        { template_id: '3', name: 'Сокращение', description: 'Сокращение штата', category: 'redundancy', category_display: 'Сокращение', is_active: true },
        { template_id: '4', name: 'Окончание контракта', description: 'Истек срок контракта', category: 'contract_end', category_display: 'Окончание контракта', is_active: true },
      ];

      const mockCompanyRejections: CompanyRejectionReason[] = [
        { reason_id: '1', template: mockRejectionTemplates[0], order: 1, is_active: true },
        { reason_id: '2', template: mockRejectionTemplates[1], order: 2, is_active: true },
      ];

      const mockCompanyTerminations: CompanyTerminationReason[] = [
        { reason_id: '1', template: mockTerminationTemplates[0], order: 1, is_active: true },
        { reason_id: '2', template: mockTerminationTemplates[1], order: 2, is_active: true },
      ];

        setRejectionTemplates(mockRejectionTemplates);
        setTerminationTemplates(mockTerminationTemplates);
        setCompanyRejections(mockCompanyRejections);
        setCompanyTerminations(mockCompanyTerminations);
        setInitialRejections(JSON.parse(JSON.stringify(mockCompanyRejections)));
        setInitialTerminations(JSON.parse(JSON.stringify(mockCompanyTerminations)));
      }
    } catch (error) {
      toastError('Ошибка при загрузке данных', 'Ошибка');
      console.error('Error loading reasons data:', error);
      // Используем моковые данные при ошибке
      const mockRejectionTemplates: RejectionReasonTemplate[] = [
        { template_id: '1', name: 'Недостаточная квалификация', description: 'Кандидат не соответствует требованиям', category: 'qualification', category_display: 'Квалификация', is_active: true },
        { template_id: '2', name: 'Не подходит по зарплате', description: 'Не сошлись в зарплате', category: 'salary', category_display: 'Зарплата', is_active: true },
      ];
      const mockTerminationTemplates: TerminationReasonTemplate[] = [
        { template_id: '1', name: 'По собственному желанию', description: 'Сотрудник уволился по собственному желанию', category: 'resignation', category_display: 'По собственному желанию', is_active: true },
        { template_id: '2', name: 'Увольнение', description: 'Уволен по инициативе работодателя', category: 'dismissal', category_display: 'Увольнение', is_active: true },
      ];
      setRejectionTemplates(mockRejectionTemplates);
      setTerminationTemplates(mockTerminationTemplates);
      setCompanyRejections([]);
      setCompanyTerminations([]);
      setInitialRejections([]);
      setInitialTerminations([]);
    } finally {
      setLoading(false);
    }
  };

  // Обработчики для причин отказов
  const handleToggleRejection = (reasonId: string) => {
    setCompanyRejections(prev => prev.map(r => 
      r.reason_id === reasonId ? { ...r, is_active: !r.is_active } : r
    ));
  };

  const handleMoveRejectionUp = (index: number) => {
    if (index === 0) return;
    const newRejections = [...companyRejections];
    [newRejections[index - 1], newRejections[index]] = [newRejections[index], newRejections[index - 1]];
    newRejections[index - 1].order = index;
    newRejections[index].order = index + 1;
    setCompanyRejections(newRejections);
  };

  const handleMoveRejectionDown = (index: number) => {
    if (index === companyRejections.length - 1) return;
    const newRejections = [...companyRejections];
    [newRejections[index], newRejections[index + 1]] = [newRejections[index + 1], newRejections[index]];
    newRejections[index].order = index + 1;
    newRejections[index + 1].order = index + 2;
    setCompanyRejections(newRejections);
  };

  const handleAddRejection = (template: RejectionReasonTemplate) => {
    if (companyRejections.find(r => r.template.template_id === template.template_id)) {
      toastInfo('Эта причина уже добавлена', 'Информация');
      return;
    }

    const newReason: CompanyRejectionReason = {
      reason_id: `new-${Date.now()}`,
      template,
      order: companyRejections.length + 1,
      is_active: true,
    };

    setCompanyRejections([...companyRejections, newReason]);
  };

  const handleRemoveRejection = (reasonId: string) => {
    setCompanyRejections(prev => prev.filter(r => r.reason_id !== reasonId));
  };

  // Обработчики для причин увольнений
  const handleToggleTermination = (reasonId: string) => {
    setCompanyTerminations(prev => prev.map(t => 
      t.reason_id === reasonId ? { ...t, is_active: !t.is_active } : t
    ));
  };

  const handleMoveTerminationUp = (index: number) => {
    if (index === 0) return;
    const newTerminations = [...companyTerminations];
    [newTerminations[index - 1], newTerminations[index]] = [newTerminations[index], newTerminations[index - 1]];
    newTerminations[index - 1].order = index;
    newTerminations[index].order = index + 1;
    setCompanyTerminations(newTerminations);
  };

  const handleMoveTerminationDown = (index: number) => {
    if (index === companyTerminations.length - 1) return;
    const newTerminations = [...companyTerminations];
    [newTerminations[index], newTerminations[index + 1]] = [newTerminations[index + 1], newTerminations[index]];
    newTerminations[index].order = index + 1;
    newTerminations[index + 1].order = index + 2;
    setCompanyTerminations(newTerminations);
  };

  const handleAddTermination = (template: TerminationReasonTemplate) => {
    if (companyTerminations.find(t => t.template.template_id === template.template_id)) {
      toastInfo('Эта причина уже добавлена', 'Информация');
      return;
    }

    const newReason: CompanyTerminationReason = {
      reason_id: `new-${Date.now()}`,
      template,
      order: companyTerminations.length + 1,
      is_active: true,
    };

    setCompanyTerminations([...companyTerminations, newReason]);
  };

  const handleRemoveTermination = (reasonId: string) => {
    setCompanyTerminations(prev => prev.filter(t => t.reason_id !== reasonId));
  };

  // Создание новых причин
  const handleCreateNewRejection = async () => {
    if (!newRejectionForm.new_name.trim()) {
      toastError('Введите название причины отказа', 'Ошибка');
      return;
    }

    try {
      setSaving(true);
      const maxOrder = companyRejections.length > 0 
        ? Math.max(...companyRejections.map(r => r.order)) 
        : 0;
      
      await api.createRejectionReason({
        new_name: newRejectionForm.new_name,
        new_description: newRejectionForm.new_description || '',
        order: maxOrder + 1,
        is_active: true,
      });

      setShowCreateRejectionForm(false);
      setNewRejectionForm({
        new_name: '',
        new_description: '',
        new_category: 'other',
        order: 0,
        is_active: true,
      });
      await loadData();
      toastSuccess('Причина отказа успешно создана', 'Успешно');
    } catch (error: any) {
      toastError(error.message || 'Ошибка при создании причины отказа', 'Ошибка');
      console.error('Error creating rejection reason:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateNewTermination = async () => {
    if (!newTerminationForm.new_name.trim()) {
      toastError('Введите название причины увольнения', 'Ошибка');
      return;
    }

    try {
      setSaving(true);
      const maxOrder = companyTerminations.length > 0 
        ? Math.max(...companyTerminations.map(t => t.order)) 
        : 0;
      
      await api.createTerminationReason({
        new_name: newTerminationForm.new_name,
        new_description: newTerminationForm.new_description || '',
        order: maxOrder + 1,
        is_active: true,
      });

      setShowCreateTerminationForm(false);
      setNewTerminationForm({
        new_name: '',
        new_description: '',
        order: 0,
        is_active: true,
      });
      await loadData();
      toastSuccess('Причина увольнения успешно создана', 'Успешно');
    } catch (error: any) {
      toastError(error.message || 'Ошибка при создании причины увольнения', 'Ошибка');
      console.error('Error creating termination reason:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setCompanyRejections(JSON.parse(JSON.stringify(initialRejections)));
    setCompanyTerminations(JSON.parse(JSON.stringify(initialTerminations)));
    toastInfo('Изменения отменены', 'Настройки отменены');
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Сохраняем через API
      await api.updateReasonsSettings({
        rejections: companyRejections.map(r => ({
          reason_id: r.reason_id,
          template_id: r.template.template_id,
          order: r.order,
          is_active: r.is_active,
        })),
        terminations: companyTerminations.map(t => ({
          reason_id: t.reason_id,
          template_id: t.template.template_id,
          order: t.order,
          is_active: t.is_active,
        })),
      });
      
      setInitialRejections(JSON.parse(JSON.stringify(companyRejections)));
      setInitialTerminations(JSON.parse(JSON.stringify(companyTerminations)));
      toastSuccess('Настройки причин успешно сохранены', 'Сохранено');
    } catch (error: any) {
      toastError(error.message || 'Ошибка при сохранении настроек', 'Ошибка');
      console.error('Error saving reasons settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const availableRejections = rejectionTemplates.filter(
    t => !companyRejections.find(r => r.template.template_id === t.template_id)
  );

  const availableTerminations = terminationTemplates.filter(
    t => !companyTerminations.find(term => term.template.template_id === t.template_id)
  );

  if (loading) {
    return (
      <div className="settings-page">
        <div className="settings-header">
          <div className="settings-header-content">
            <div className="settings-title">
              <i className="bi bi-list-check"></i>
              <h1>Причины отказов и увольнений</h1>
            </div>
            <p className="settings-subtitle">Настройка причин отказов и увольнений</p>
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
            <i className="bi bi-list-check"></i>
            <h1>Причины отказов и увольнений</h1>
          </div>
          <p className="settings-subtitle">
            Настройте причины отказов кандидатам и увольнений сотрудников для вашей компании.
          </p>
        </div>
      </div>

      <div className="settings-content-wrapper">
        {/* Вкладки */}
        <ul className="nav nav-tabs mb-4" role="tablist">
          <li className="nav-item" role="presentation">
            <button
              className={`nav-link ${activeTab === 'rejection' ? 'active' : ''}`}
              onClick={() => setActiveTab('rejection')}
            >
              <i className="bi bi-x-circle me-2"></i>
              Причины отказов
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className={`nav-link ${activeTab === 'termination' ? 'active' : ''}`}
              onClick={() => setActiveTab('termination')}
            >
              <i className="bi bi-door-open me-2"></i>
              Причины увольнений
            </button>
          </li>
        </ul>

        <div className="settings-grid">
          {/* Причины отказов */}
          {activeTab === 'rejection' && (
            <>
              <div className="settings-section" style={{ gridColumn: '1 / -1' }}>
                <div className="settings-section-header">
                  <i className="bi bi-x-circle text-danger"></i>
                  <h3>Причины отказов компании</h3>
                </div>

                {companyRejections.length === 0 ? (
                  <div className="text-center p-4 text-muted">
                    <i className="bi bi-inbox" style={{ fontSize: '3rem', opacity: 0.3 }}></i>
                    <p className="mt-3">Нет настроенных причин отказов</p>
                    <p className="small">Добавьте причины из списка доступных шаблонов</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th style={{ width: '50px' }}>Порядок</th>
                          <th>Название</th>
                          <th>Описание</th>
                          <th style={{ width: '100px' }}>Статус</th>
                          <th style={{ width: '200px' }}>Действия</th>
                        </tr>
                      </thead>
                      <tbody>
                        {companyRejections.map((reason, index) => (
                          <tr key={reason.reason_id}>
                            <td>
                              <span className="badge bg-secondary">{reason.order}</span>
                            </td>
                            <td>
                              <strong>{reason.template.name}</strong>
                            </td>
                            <td>
                              <small className="text-muted">{reason.template.description}</small>
                            </td>
                            <td>
                              <div className="form-check form-switch">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  checked={reason.is_active}
                                  onChange={() => handleToggleRejection(reason.reason_id)}
                                />
                              </div>
                            </td>
                            <td>
                              <div className="btn-group btn-group-sm">
                                <button
                                  className="btn btn-outline-secondary"
                                  onClick={() => handleMoveRejectionUp(index)}
                                  disabled={index === 0}
                                  title="Вверх"
                                >
                                  <i className="bi bi-arrow-up"></i>
                                </button>
                                <button
                                  className="btn btn-outline-secondary"
                                  onClick={() => handleMoveRejectionDown(index)}
                                  disabled={index === companyRejections.length - 1}
                                  title="Вниз"
                                >
                                  <i className="bi bi-arrow-down"></i>
                                </button>
                                <button
                                  className="btn btn-outline-danger"
                                  onClick={() => handleRemoveRejection(reason.reason_id)}
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

              <div className="settings-section">
                <div className="settings-section-header">
                  <i className="bi bi-plus-circle text-success"></i>
                  <h3>Доступные шаблоны</h3>
                </div>

                {availableRejections.length === 0 ? (
                  <div className="text-center p-4 text-muted">
                    <i className="bi bi-check-circle" style={{ fontSize: '2rem', opacity: 0.3 }}></i>
                    <p className="mt-2 small">Все доступные причины уже добавлены</p>
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-2">
                    {availableRejections.map(template => (
                      <div
                        key={template.template_id}
                        className="card"
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleAddRejection(template)}
                      >
                        <div className="card-body">
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <h6 className="mb-1">{template.name}</h6>
                              <small className="text-muted">{template.description}</small>
                            </div>
                            <button className="btn btn-sm btn-outline-primary">
                              <i className="bi bi-plus"></i> Добавить
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Форма создания новой причины отказа */}
              <div className="settings-section">
                <div className="settings-section-header">
                  <i className="bi bi-plus-circle text-success"></i>
                  <h3>Создать новую причину отказа</h3>
                </div>

                {!showCreateRejectionForm ? (
                  <div className="card" style={{ border: '2px dashed #dee2e6', cursor: 'pointer' }}>
                    <div className="card-body text-center p-4" onClick={() => setShowCreateRejectionForm(true)}>
                      <i className="bi bi-plus-circle" style={{ fontSize: '3rem', color: '#28a745', opacity: 0.5 }}></i>
                      <p className="mt-3 mb-0">Нажмите, чтобы создать новую причину отказа</p>
                    </div>
                  </div>
                ) : (
                  <div className="card">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <h6 className="mb-0">
                          <i className="bi bi-plus-circle text-success me-2"></i>
                          Создать новую причину отказа
                        </h6>
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => {
                            setShowCreateRejectionForm(false);
                            setNewRejectionForm({
                              new_name: '',
                              new_description: '',
                              new_category: 'other',
                              order: 0,
                              is_active: true,
                            });
                          }}
                          disabled={saving}
                        >
                          <i className="bi bi-x"></i>
                        </button>
                      </div>
                      
                      <div className="row g-3">
                        <div className="col-md-12">
                          <label className="form-label">Название причины *</label>
                          <input
                            type="text"
                            className="form-control"
                            value={newRejectionForm.new_name}
                            onChange={(e) => setNewRejectionForm({ ...newRejectionForm, new_name: e.target.value })}
                            placeholder="Например: Недостаточный опыт"
                            disabled={saving}
                          />
                        </div>
                        <div className="col-md-12">
                          <label className="form-label">Описание</label>
                          <textarea
                            className="form-control"
                            rows={3}
                            value={newRejectionForm.new_description}
                            onChange={(e) => setNewRejectionForm({ ...newRejectionForm, new_description: e.target.value })}
                            placeholder="Описание причины отказа"
                            disabled={saving}
                          />
                        </div>
                        <div className="col-md-12">
                          <button
                            className="btn btn-primary w-100"
                            onClick={handleCreateNewRejection}
                            disabled={saving || !newRejectionForm.new_name.trim()}
                          >
                            {saving ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                Создание...
                              </>
                            ) : (
                              <>
                                <i className="bi bi-check-circle me-2"></i>
                                Создать причину
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Причины увольнений */}
          {activeTab === 'termination' && (
            <>
              <div className="settings-section" style={{ gridColumn: '1 / -1' }}>
                <div className="settings-section-header">
                  <i className="bi bi-door-open text-warning"></i>
                  <h3>Причины увольнений компании</h3>
                </div>

                {companyTerminations.length === 0 ? (
                  <div className="text-center p-4 text-muted">
                    <i className="bi bi-inbox" style={{ fontSize: '3rem', opacity: 0.3 }}></i>
                    <p className="mt-3">Нет настроенных причин увольнений</p>
                    <p className="small">Добавьте причины из списка доступных шаблонов</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th style={{ width: '50px' }}>Порядок</th>
                          <th>Название</th>
                          <th>Описание</th>
                          <th>Категория</th>
                          <th style={{ width: '100px' }}>Статус</th>
                          <th style={{ width: '150px' }}>Действия</th>
                        </tr>
                      </thead>
                      <tbody>
                        {companyTerminations.map((reason, index) => (
                          <tr key={reason.reason_id}>
                            <td>
                              <span className="badge bg-secondary">{reason.order}</span>
                            </td>
                            <td>
                              <strong>{reason.template.name}</strong>
                            </td>
                            <td>
                              <small className="text-muted">{reason.template.description}</small>
                            </td>
                            <td>
                              <span className="badge bg-warning">{reason.template.category_display}</span>
                            </td>
                            <td>
                              <div className="form-check form-switch">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  checked={reason.is_active}
                                  onChange={() => handleToggleTermination(reason.reason_id)}
                                />
                              </div>
                            </td>
                            <td>
                              <div className="btn-group btn-group-sm">
                                <button
                                  className="btn btn-outline-secondary"
                                  onClick={() => handleMoveTerminationUp(index)}
                                  disabled={index === 0}
                                  title="Вверх"
                                >
                                  <i className="bi bi-arrow-up"></i>
                                </button>
                                <button
                                  className="btn btn-outline-secondary"
                                  onClick={() => handleMoveTerminationDown(index)}
                                  disabled={index === companyTerminations.length - 1}
                                  title="Вниз"
                                >
                                  <i className="bi bi-arrow-down"></i>
                                </button>
                                <button
                                  className="btn btn-outline-danger"
                                  onClick={() => handleRemoveTermination(reason.reason_id)}
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

              <div className="settings-section">
                <div className="settings-section-header">
                  <i className="bi bi-plus-circle text-success"></i>
                  <h3>Доступные шаблоны</h3>
                </div>

                {availableTerminations.length === 0 ? (
                  <div className="text-center p-4 text-muted">
                    <i className="bi bi-check-circle" style={{ fontSize: '2rem', opacity: 0.3 }}></i>
                    <p className="mt-2 small">Все доступные причины уже добавлены</p>
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-2">
                    {availableTerminations.map(template => (
                      <div
                        key={template.template_id}
                        className="card"
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleAddTermination(template)}
                      >
                        <div className="card-body">
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <h6 className="mb-1">{template.name}</h6>
                              <small className="text-muted">{template.description}</small>
                              <div className="mt-1">
                                <span className="badge bg-warning">{template.category_display}</span>
                              </div>
                            </div>
                            <button className="btn btn-sm btn-outline-primary">
                              <i className="bi bi-plus"></i> Добавить
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Форма создания новой причины увольнения */}
              <div className="settings-section">
                <div className="settings-section-header">
                  <i className="bi bi-plus-circle text-success"></i>
                  <h3>Создать новую причину увольнения</h3>
                </div>

                {!showCreateTerminationForm ? (
                  <div className="card" style={{ border: '2px dashed #dee2e6', cursor: 'pointer' }}>
                    <div className="card-body text-center p-4" onClick={() => setShowCreateTerminationForm(true)}>
                      <i className="bi bi-plus-circle" style={{ fontSize: '3rem', color: '#28a745', opacity: 0.5 }}></i>
                      <p className="mt-3 mb-0">Нажмите, чтобы создать новую причину увольнения</p>
                    </div>
                  </div>
                ) : (
                  <div className="card">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <h6 className="mb-0">
                          <i className="bi bi-plus-circle text-success me-2"></i>
                          Создать новую причину увольнения
                        </h6>
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => {
                            setShowCreateTerminationForm(false);
                            setNewTerminationForm({
                              new_name: '',
                              new_description: '',
                              new_category: 'other',
                              order: 0,
                              is_active: true,
                            });
                          }}
                          disabled={saving}
                        >
                          <i className="bi bi-x"></i>
                        </button>
                      </div>
                      
                      <div className="row g-3">
                        <div className="col-md-12">
                          <label className="form-label">Название причины *</label>
                          <input
                            type="text"
                            className="form-control"
                            value={newTerminationForm.new_name}
                            onChange={(e) => setNewTerminationForm({ ...newTerminationForm, new_name: e.target.value })}
                            placeholder="Например: Нарушение трудовой дисциплины"
                            disabled={saving}
                          />
                        </div>
                        <div className="col-md-12">
                          <label className="form-label">Описание</label>
                          <textarea
                            className="form-control"
                            rows={3}
                            value={newTerminationForm.new_description}
                            onChange={(e) => setNewTerminationForm({ ...newTerminationForm, new_description: e.target.value })}
                            placeholder="Описание причины увольнения"
                            disabled={saving}
                          />
                        </div>
                        <div className="col-md-12">
                          <button
                            className="btn btn-primary w-100"
                            onClick={handleCreateNewTermination}
                            disabled={saving || !newTerminationForm.new_name.trim()}
                          >
                            {saving ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                Создание...
                              </>
                            ) : (
                              <>
                                <i className="bi bi-check-circle me-2"></i>
                                Создать причину
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Секция управления доступностью причин отказов после этапов - только для вкладки "Причины отказов" */}
        {activeTab === 'rejection' && (
          <div className="settings-section" style={{ gridColumn: '1 / -1', marginTop: '2rem' }}>
            <div className="settings-section-header">
              <i className="bi bi-link-45deg text-primary"></i>
              <h3>Доступность причин отказов после этапов</h3>
            </div>
            <p className="text-muted mb-4">
              Выберите причины отказов, которые будут доступны после каждого этапа жизненного цикла
            </p>
            
            {companyStatuses.length === 0 ? (
              <div className="text-center p-4 text-muted">
                <i className="bi bi-inbox" style={{ fontSize: '3rem', opacity: 0.3 }}></i>
                <p className="mt-3">Нет активных этапов жизненного цикла</p>
              </div>
            ) : (
              <div className="row g-3">
                {companyStatuses.map((status) => {
                  const availableReasons = rejectionAvailability
                    .filter(a => a.status_id === status.id)
                    .map(a => a.rejection_reason_id);
                  
                  if (companyRejections.filter(r => r.is_active).length === 0) {
                    return null;
                  }
                  
                  return (
                    <div key={status.id} className="col-md-6">
                      <div className="card">
                        <div className="card-header">
                          <strong>{status.display_name || status.name}</strong>
                          <span className="badge bg-secondary ms-2">Порядок: {status.order}</span>
                        </div>
                        <div className="card-body">
                          <div className="d-flex flex-column gap-2" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                            {companyRejections.filter(r => r.is_active).map((reason) => {
                              const isSelected = availableReasons.includes(reason.reason_id);
                              return (
                                <div key={reason.reason_id} className="form-check">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={async () => {
                                      if (isSelected) {
                                        // Удаляем связь
                                        const availability = rejectionAvailability.find(
                                          a => a.status_id === status.id && a.rejection_reason_id === reason.reason_id
                                        );
                                        if (availability) {
                                          try {
                                            await api.deleteRejectionAvailability(availability.id);
                                            setRejectionAvailability(prev => 
                                              prev.filter(a => a.id !== availability.id)
                                            );
                                            toastSuccess('Связь удалена', 'Успешно');
                                          } catch (error: any) {
                                            toastError(error.message || 'Ошибка при удалении связи', 'Ошибка');
                                          }
                                        }
                                      } else {
                                        // Создаем связь
                                        try {
                                          const newAvailability = await api.createRejectionAvailability({
                                            company_status: status.id,
                                            company_rejection_reason: reason.reason_id,
                                          });
                                          setRejectionAvailability(prev => [...prev, {
                                            id: newAvailability.id,
                                            status_id: status.id,
                                            status_name: status.name,
                                            rejection_reason_id: reason.reason_id,
                                            rejection_reason_name: reason.name,
                                          }]);
                                          toastSuccess('Связь создана', 'Успешно');
                                        } catch (error: any) {
                                          toastError(error.message || 'Ошибка при создании связи', 'Ошибка');
                                        }
                                      }
                                    }}
                                  />
                                  <label className="form-check-label">
                                    {reason.name}
                                  </label>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Кнопки действий */}
        {isDirty && (
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
              onClick={handleSave}
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

export default SystemReasonsSettings;

