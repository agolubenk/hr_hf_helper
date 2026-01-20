import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';
import './SystemSettings.css';
import AddIntegrationModal from './AddIntegrationModal';
import SettingsIntegrationModal from './SettingsIntegrationModal';

export interface Integration {
  id: string;
  name: string;
  description: string;
  icon: string;
  status: 'active' | 'inactive' | 'error' | 'pending';
  category: string;
  lastSync?: string;
  type: 'api' | 'webhook' | 'oauth' | 'smtp' | 'database';
}

// Моковые данные
const allIntegrationsData: Integration[] = [
    { id: '1c', name: '1С:Предприятие', description: 'Синхронизация кадровых данных и зарплат', icon: 'bi-calculator-fill', status: 'active', category: 'HR & Payroll', lastSync: '2024-06-10 14:30', type: 'api' },
    { id: 'bitrix24', name: 'Bitrix24', description: 'Интеграция с корпоративным порталом', icon: 'bi-bounding-box', status: 'active', category: 'Collaboration', lastSync: '2024-06-10 13:45', type: 'api' },
    { id: 'email', name: 'SMTP Server', description: 'Отправка системных уведомлений и рассылок', icon: 'bi-envelope-at-fill', status: 'active', category: 'System', lastSync: '2024-06-10 12:00', type: 'smtp' },
    { id: 'gcalendar', name: 'Google Calendar', description: 'Синхронизация событий и отпусков', icon: 'bi-calendar-event-fill', status: 'error', category: 'Productivity', lastSync: '2024-06-09 18:20', type: 'oauth' },
    { id: 'adp', name: 'ADP Workforce Now', description: 'Расчет заработной платы и льгот', icon: 'bi-cash-coin', status: 'active', category: 'HR & Payroll', lastSync: '2024-06-10 09:15', type: 'api' },
    { id: 'workday', name: 'Workday HCM', description: 'Управление человеческим капиталом', icon: 'bi-people-fill', status: 'inactive', category: 'HR & Payroll', type: 'api' },
    { id: 'greenhouse', name: 'Greenhouse', description: 'Система отслеживания кандидатов (ATS)', icon: 'bi-person-plus-fill', status: 'active', category: 'Recruiting', lastSync: '2024-06-10 11:30', type: 'api' },
    { id: 'linkedin', name: 'LinkedIn Recruiter', description: 'Поиск и импорт кандидатов', icon: 'bi-linkedin', status: 'pending', category: 'Recruiting', type: 'oauth' },
];

const marketplaceIntegrations: Integration[] = [
    ...allIntegrationsData,
    { id: 'coursera', name: 'Coursera', description: 'Платформа для корпоративного обучения', icon: 'bi-mortarboard-fill', status: 'inactive', category: 'L&D', type: 'api' },
    { id: 'okta', name: 'Okta', description: 'Управление доступом и SSO', icon: 'bi-shield-lock-fill', status: 'inactive', category: 'System', type: 'oauth' },
    { id: 'salesforce', name: 'Salesforce', description: 'Интеграция с CRM для данных о продажах', icon: 'bi-cloud-fill', status: 'inactive', category: 'Collaboration', type: 'api' },
    { id: 'toggl', name: 'Toggl Track', description: 'Учет рабочего времени сотрудников', icon: 'bi-clock-history', status: 'inactive', category: 'Productivity', type: 'api' },
    { id: 'slack', name: 'Slack', description: 'Уведомления и совместная работа', icon: 'bi-slack', status: 'inactive', category: 'Collaboration', type: 'webhook' },
    { id: 'hh', name: 'HeadHunter', description: 'Импорт откликов на вакансии', icon: 'bi-briefcase-fill', status: 'inactive', category: 'Recruiting', type: 'api'},
    { id: 'postgres', name: 'PostgreSQL DB', description: 'Подключение к базе данных аналитики', icon: 'bi-database-fill-gear', status: 'inactive', category: 'System', type: 'database'}
];

const categories = ['All', ...Array.from(new Set(marketplaceIntegrations.map(i => i.category)))];

type StatusFilter = 'all' | 'active' | 'inactive' | 'error' | 'pending';

const SystemIntegrationsSettings: React.FC = () => {
  const { addToast } = useAppContext();
  const [integrations, setIntegrations] = useState(allIntegrationsData);
  const [filter, setFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);

  const handleAction = (action: string, id: string) => {
    const integration = integrations.find(i => i.id === id);
    
    switch (action) {
      case 'add_new':
        setIsAddModalOpen(true);
        break;
      case 'settings':
        if (integration) {
          setSelectedIntegration(integration);
          setIsSettingsModalOpen(true);
        }
        break;
      case 'delete':
        if (integration && window.confirm(`Вы уверены, что хотите удалить интеграцию "${integration.name}"?`)) {
          setIntegrations(prev => prev.filter(i => i.id !== id));
          addToast(`Интеграция "${integration.name}" удалена.`, { type: 'success' });
        }
        break;
      default:
        const integrationName = integration?.name || 'новая интеграция';
        addToast(`Действие '${action}' для '${integrationName}'`, { type: 'info' });
        break;
    }
  };
  
  const handleAddIntegration = (integrationToAdd: Integration) => {
    const newIntegration: Integration = {
        ...integrationToAdd,
        status: 'pending',
    };
    setIsAddModalOpen(false);
    
    // Не добавляем в стейт, а сразу открываем настройки
    setSelectedIntegration(newIntegration);
    setIsSettingsModalOpen(true);
  };

  const handleSaveSettings = (integrationToSave: Integration) => {
    const isExisting = integrations.some(i => i.id === integrationToSave.id);

    if (isExisting) {
        // Логика обновления (пока просто заглушка, можно будет расширить)
        setIntegrations(prev => prev.map(i => (i.id === integrationToSave.id ? { ...i, ...integrationToSave, status: 'active' as const } : i)));
        addToast(`Настройки для "${integrationToSave.name}" обновлены.`, { type: 'success' });
    } else {
        // Логика добавления новой интеграции
        const finalIntegration = { ...integrationToSave, status: 'active' as const };
        setIntegrations(prev => [...prev, finalIntegration]);
        addToast(`Интеграция "${integrationToSave.name}" успешно добавлена.`, { type: 'success' });
    }

    setIsSettingsModalOpen(false);
    setSelectedIntegration(null);
  };

  const handleCloseSettingsModal = () => {
      setIsSettingsModalOpen(false);
      setSelectedIntegration(null);
  }

  const availableIntegrations = useMemo(() => {
    const installedIds = new Set(integrations.map(i => i.id));
    return marketplaceIntegrations.filter(i => !installedIds.has(i.id));
  }, [integrations]);

  const filteredIntegrations = useMemo(() => {
    return integrations
      .filter(i => filter === 'All' || i.category === filter)
      .filter(i => statusFilter === 'all' || i.status === statusFilter)
      .filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [integrations, filter, searchTerm, statusFilter]);

  const integrationStats = useMemo(() => {
    const total = integrations.length;
    const active = integrations.filter(i => i.status === 'active').length;
    const errors = integrations.filter(i => i.status === 'error').length;
    const pending = integrations.filter(i => i.status === 'pending').length;
    const inactive = integrations.filter(i => i.status === 'inactive').length;
    return { total, active, errors, pending, inactive };
  }, [integrations]);

  const statCardsData: { id: StatusFilter; label: string; value: number; icon: string; style: object; }[] = [
    { id: 'all', label: 'Всего', value: integrationStats.total, icon: 'bi-box-fill', style: { '--icon-bg': 'var(--bs-primary-bg-subtle)', '--icon-color': 'var(--bs-primary)' } },
    { id: 'active', label: 'Активных', value: integrationStats.active, icon: 'bi-check-circle-fill', style: { '--icon-bg': 'var(--bs-success-bg-subtle)', '--icon-color': 'var(--bs-success)' } },
    { id: 'error', label: 'С ошибками', value: integrationStats.errors, icon: 'bi-exclamation-triangle-fill', style: { '--icon-bg': 'var(--bs-danger-bg-subtle)', '--icon-color': 'var(--bs-danger)' } },
    { id: 'pending', label: 'В ожидании', value: integrationStats.pending, icon: 'bi-hourglass-split', style: { '--icon-bg': 'var(--bs-warning-bg-subtle)', '--icon-color': 'var(--bs-warning)' } },
    { id: 'inactive', label: 'Отключено', value: integrationStats.inactive, icon: 'bi-power', style: { '--icon-bg': 'var(--bs-secondary-bg-subtle)', '--icon-color': 'var(--bs-secondary-text-emphasis)' } },
  ];

  const getStatusInfo = (status: Integration['status']) => {
    switch (status) {
      case 'active': return { badge: 'status-active-v2', text: 'Активна' };
      case 'inactive': return { badge: 'status-inactive-v2', text: 'Отключена' };
      case 'error': return { badge: 'status-error-v2', text: 'Ошибка' };
      case 'pending': return { badge: 'status-pending-v2', text: 'В ожидании' };
      default: return { badge: 'status-inactive-v2', text: 'Неизвестно' };
    }
  };

  return (
    <>
      <div className="settings-page integrations-page">
          <div className="settings-header">
              <div className="settings-header-content">
                <div className="settings-title">
                    <i className="bi bi-plug-fill"></i>
                    <div>
                    <h1>Интеграции</h1>
                    <p className="settings-subtitle">
                        Управление подключениями к внешним сервисам и системам.
                    </p>
                    </div>
                </div>
                <div className="settings-header-actions">
                    <button className="btn btn-primary" onClick={() => handleAction('add_new', '')}><i className="bi bi-plus-lg me-2"></i>Добавить</button>
                    <button className="btn btn-light"><i className="bi bi-life-preserver me-2"></i>Документация</button>
                </div>
            </div>
          </div>
          
          <div className="settings-content-wrapper">
            <div className="integrations-stats-v2">
                {statCardsData.map(card => (
                    <div 
                        key={card.id}
                        className={`stat-card-v2 ${statusFilter === card.id ? 'active' : ''}`}
                        onClick={() => setStatusFilter(card.id)}
                    >
                        <div className="stat-card-v2-icon" style={card.style as React.CSSProperties}>
                            <i className={`bi ${card.icon}`}></i>
                        </div>
                        <div className="stat-card-v2-info">
                            <span className="stat-card-v2-value">{card.value}</span>
                            <span className="stat-card-v2-label">{card.label}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="filters-panel">
                <div className="search-bar">
                    <i className="bi bi-search"></i>
                    <input 
                        type="text" 
                        className="form-control" 
                        placeholder="Найти интеграцию..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="category-filters">
                    {categories.map(cat => (
                        <button 
                            key={cat}
                            type="button" 
                            className={`category-filter-btn ${filter === cat ? 'active' : ''}`}
                            onClick={() => setFilter(cat)}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            <div className="integrations-grid-v2">
                <div className="integration-card-v2 add-card-v2" onClick={() => handleAction('add_new', '')}>
                    <div className="add-card-v2-icon"><i className="bi bi-plus"></i></div>
                    <h6>Добавить интеграцию</h6>
                    <p>Подключите новый сервис или создайте свою</p>
                </div>

                {filteredIntegrations.map(integration => {
                    const statusInfo = getStatusInfo(integration.status);
                    return (
                        <div className="integration-card-v2" key={integration.id}>
                            <div className="card-v2-header">
                                <div className="card-v2-icon-wrapper">
                                    <i className={`bi ${integration.icon}`}></i>
                                </div>
                                <div className="card-v2-title">
                                    <h6>{integration.name}</h6>
                                    <span>{integration.category}</span>
                                </div>
                                <span className={`badge ${statusInfo.badge}`}>{statusInfo.text}</span>
                            </div>
                            <p className="card-v2-description">{integration.description}</p>
                            <div className="card-v2-meta">
                                <span><i className="bi bi-box-arrow-in-right"></i> {integration.type.toUpperCase()}</span>
                                <span><i className="bi bi-arrow-repeat"></i> {integration.lastSync || 'Никогда'}</span>
                            </div>
                            <div className="card-v2-footer">
                                <button className="card-action-btn" onClick={() => handleAction('settings', integration.id)}><i className="bi bi-gear-fill"></i> Настроить</button>
                                <button className="card-action-btn" onClick={() => handleAction('sync', integration.id)} disabled={!integration.lastSync}><i className="bi bi-arrow-repeat"></i> Синхр.</button>
                                <div className="dropdown">
                                    <button className="card-action-btn" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                        <i className="bi bi-three-dots"></i>
                                    </button>
                                    <ul className="dropdown-menu dropdown-menu-end">
                                        <li><button className="dropdown-item" type="button" onClick={() => handleAction('toggle', integration.id)}>{integration.status === 'active' ? 'Отключить' : 'Включить'}</button></li>
                                        <li><button className="dropdown-item" type="button" onClick={() => handleAction('logs', integration.id)}>Логи</button></li>
                                        <li><hr className="dropdown-divider" /></li>
                                        <li><button className="dropdown-item text-danger" type="button" onClick={() => handleAction('delete', integration.id)}>Удалить</button></li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
          </div>
      </div>
      <AddIntegrationModal 
        show={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddIntegration}
        availableIntegrations={availableIntegrations}
      />
      <SettingsIntegrationModal
        show={isSettingsModalOpen}
        onClose={handleCloseSettingsModal}
        onSave={handleSaveSettings}
        integration={selectedIntegration}
      />
    </>
  );
};

export default SystemIntegrationsSettings; 