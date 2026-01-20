import React, { useState } from 'react';
import './BonusesPage.css';

interface BonusData {
  id: string;
  employeeName: string;
  position: string;
  department: string;
  bonusType: string;
  amount: number;
  percentage: number;
  period: string;
  status: 'approved' | 'pending' | 'rejected' | 'paid';
  approvedBy: string;
  approvedDate: string;
  avatar: string;
}

const BonusesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // Моковые данные бонусов
  const bonuses: BonusData[] = [
    {
      id: '1',
      employeeName: 'Иванов Иван Петрович',
      position: 'Senior Developer',
      department: 'IT',
      bonusType: 'Квартальная премия',
      amount: 75000,
      percentage: 15,
      period: 'Q1 2024',
      status: 'paid',
      approvedBy: 'Петров А.С.',
      approvedDate: '2024-03-31',
      avatar: 'ИИ'
    },
    {
      id: '2',
      employeeName: 'Петрова Анна Сергеевна',
      position: 'HR Manager',
      department: 'HR',
      bonusType: 'Премия за проект',
      amount: 45000,
      percentage: 12,
      period: 'Март 2024',
      status: 'approved',
      approvedBy: 'Сидоров В.П.',
      approvedDate: '2024-03-28',
      avatar: 'ПА'
    },
    {
      id: '3',
      employeeName: 'Сидоров Алексей Владимирович',
      position: 'Product Manager',
      department: 'Product',
      bonusType: 'Годовая премия',
      amount: 120000,
      percentage: 20,
      period: '2023',
      status: 'pending',
      approvedBy: '—',
      approvedDate: '—',
      avatar: 'СА'
    },
    {
      id: '4',
      employeeName: 'Козлова Мария Дмитриевна',
      position: 'Junior Developer',
      department: 'IT',
      bonusType: 'Премия за обучение',
      amount: 25000,
      percentage: 8,
      period: 'Февраль 2024',
      status: 'rejected',
      approvedBy: 'Иванов И.П.',
      approvedDate: '2024-02-15',
      avatar: 'КМ'
    }
  ];

  const bonusTypes = ['Квартальная премия', 'Годовая премия', 'Премия за проект', 'Премия за обучение', 'Специальная премия'];
  const statuses = ['approved', 'pending', 'rejected', 'paid'];

  const filteredBonuses = bonuses.filter(bonus => {
    const matchesSearch = bonus.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bonus.bonusType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || bonus.bonusType === filterType;
    const matchesStatus = filterStatus === 'all' || bonus.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const formatCurrency = (amount: number, currency: string = 'RUB') => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      approved: { class: 'status-approved', text: 'Одобрено', icon: 'bi-check-circle' },
      pending: { class: 'status-pending', text: 'На рассмотрении', icon: 'bi-clock' },
      rejected: { class: 'status-rejected', text: 'Отклонено', icon: 'bi-x-circle' },
      paid: { class: 'status-paid', text: 'Выплачено', icon: 'bi-cash-stack' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <span className={`status-badge ${config.class}`}>
        <i className={`${config.icon} me-1`}></i>
        {config.text}
      </span>
    );
  };

  const totalBonuses = filteredBonuses.reduce((sum, bonus) => sum + bonus.amount, 0);
  const averageBonus = filteredBonuses.length > 0 ? totalBonuses / filteredBonuses.length : 0;
  const pendingBonuses = filteredBonuses.filter(bonus => bonus.status === 'pending').length;

  return (
    <div className="content-area">

      {/* KPI/SLA мини-карточки */}
      <div className="card-grid">
        <div className="card-grid-item-4">
          <div className="card kpi-card border-primary h-100">
            <div className="card-body text-center d-flex flex-column">
              <div className="kpi-icon-wrapper primary">
                <i className="bi bi-award"></i>
              </div>
              <div className="fw-semibold text-muted mb-1">Всего бонусов</div>
              <div className="fs-2 fw-bold text-primary mb-2">{filteredBonuses.length}</div>
              <small className="text-muted mb-3">В системе</small>
              <button className="btn btn-outline-primary btn-sm w-100 mt-auto">
                <i className="bi bi-arrow-right me-1"></i>
                Перейти
              </button>
            </div>
          </div>
        </div>
        <div className="card-grid-item-4">
          <div className="card kpi-card border-success h-100">
            <div className="card-body text-center d-flex flex-column">
              <div className="kpi-icon-wrapper success">
                <i className="bi bi-cash-stack"></i>
              </div>
              <div className="fw-semibold text-muted mb-1">Общая сумма</div>
              <div className="fs-2 fw-bold text-success mb-2">{formatCurrency(totalBonuses)}</div>
              <small className="text-muted mb-3">Всего выплачено</small>
              <button className="btn btn-outline-success btn-sm w-100 mt-auto">
                <i className="bi bi-arrow-right me-1"></i>
                Перейти
              </button>
            </div>
          </div>
        </div>
        <div className="card-grid-item-4">
          <div className="card kpi-card border-info h-100">
            <div className="card-body text-center d-flex flex-column">
              <div className="kpi-icon-wrapper info">
                <i className="bi bi-graph-up"></i>
              </div>
              <div className="fw-semibold text-muted mb-1">Средний бонус</div>
              <div className="fs-2 fw-bold text-info mb-2">{formatCurrency(averageBonus)}</div>
              <small className="text-muted mb-3">На сотрудника</small>
              <button className="btn btn-outline-info btn-sm w-100 mt-auto">
                <i className="bi bi-arrow-right me-1"></i>
                Перейти
              </button>
            </div>
          </div>
        </div>
        <div className="card-grid-item-4">
          <div className="card kpi-card border-warning h-100">
            <div className="card-body text-center d-flex flex-column">
              <div className="kpi-icon-wrapper warning">
                <i className="bi bi-clock"></i>
              </div>
              <div className="fw-semibold text-muted mb-1">Ожидают</div>
              <div className="fs-2 fw-bold text-warning mb-2">{pendingBonuses}</div>
              <small className="text-muted mb-3">На рассмотрении</small>
              <button className="btn btn-outline-warning btn-sm w-100 mt-auto">
                <i className="bi bi-arrow-right me-1"></i>
                Перейти
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Фильтры и поиск */}
      <div className="card content-card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-6">
              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Поиск по сотруднику или типу бонуса..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-3">
              <select 
                className="form-select"
                value={filterType} 
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">Все типы</option>
                {bonusTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <select 
                className="form-select"
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">Все статусы</option>
                {statuses.map(status => (
                  <option key={status} value={status}>
                    {status === 'approved' ? 'Одобренные' : 
                     status === 'pending' ? 'Ожидающие' : 
                     status === 'rejected' ? 'Отклоненные' : 'Выплаченные'}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Таблица бонусов */}
      <div className="card content-card">
        <div className="card-header d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center">
            <div className="card-icon-wrapper me-3">
              <i className="bi bi-table"></i>
            </div>
            <h5 className="mb-0">Бонусы сотрудников</h5>
          </div>
          <button 
            className="btn btn-primary btn-sm"
            onClick={() => setShowAddModal(true)}
          >
            <i className="bi bi-plus me-1"></i>
            Добавить бонус
          </button>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead>
                <tr>
                  <th>Сотрудник</th>
                  <th>Должность</th>
                  <th>Отдел</th>
                  <th>Тип бонуса</th>
                  <th>Сумма</th>
                  <th>Процент</th>
                  <th>Период</th>
                  <th>Статус</th>
                  <th>Утвердил</th>
                  <th>Дата</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {filteredBonuses.map(bonus => (
                  <tr key={bonus.id} className="animated-row">
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="avatar-sm me-3">{bonus.avatar}</div>
                        <div>
                          <div className="fw-semibold">{bonus.employeeName}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="text-muted">{bonus.position}</span>
                    </td>
                    <td>
                      <span className="badge bg-primary-subtle text-primary">{bonus.department}</span>
                    </td>
                    <td>
                      <span className="fw-semibold text-info">{bonus.bonusType}</span>
                    </td>
                    <td>
                      <span className="fw-bold text-success fs-6">{formatCurrency(bonus.amount)}</span>
                    </td>
                    <td>
                      <span className="badge bg-success-subtle text-success">{bonus.percentage}%</span>
                    </td>
                    <td>
                      <span className="text-muted">{bonus.period}</span>
                    </td>
                    <td>{getStatusBadge(bonus.status)}</td>
                    <td>
                      <span className="text-muted">{bonus.approvedBy}</span>
                    </td>
                    <td>
                      <span className="text-muted">
                        {bonus.approvedDate !== '—' ? new Date(bonus.approvedDate).toLocaleDateString('ru-RU') : '—'}
                      </span>
                    </td>
                    <td>
                      <div className="btn-group btn-group-sm">
                        <button className="btn btn-outline-primary" title="Редактировать">
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button className="btn btn-outline-secondary" title="Просмотр">
                          <i className="bi bi-eye"></i>
                        </button>
                        <button className="btn btn-outline-info" title="История">
                          <i className="bi bi-clock-history"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Модальное окно добавления бонуса */}
      {showAddModal && (
        <div className="modal fade show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-plus-circle me-2"></i>
                  Добавить бонус
                </h5>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={() => setShowAddModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p>Форма добавления бонуса будет здесь...</p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                  Закрыть
                </button>
                <button type="button" className="btn btn-primary">
                  <i className="bi bi-check me-1"></i>
                  Сохранить
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BonusesPage; 