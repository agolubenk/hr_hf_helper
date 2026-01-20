import React, { useState } from 'react';
import './../CBPage.css'; // Общие стили для C&B
import './SalariesPage.css';

interface SalaryData {
  id: string;
  employeeName: string;
  position: string;
  department: string;
  baseSalary: number;
  bonus: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  currency: string;
  effectiveDate: string;
  status: 'active' | 'pending' | 'inactive';
  avatar: string;
}

const SalariesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // Моковые данные зарплат
  const salaries: SalaryData[] = [
    {
      id: '1',
      employeeName: 'Иванов Иван Петрович',
      position: 'Senior Developer',
      department: 'IT',
      baseSalary: 150000,
      bonus: 25000,
      allowances: 15000,
      deductions: 19500,
      netSalary: 170500,
      currency: 'RUB',
      effectiveDate: '2024-01-01',
      status: 'active',
      avatar: 'ИИ'
    },
    {
      id: '2',
      employeeName: 'Петрова Анна Сергеевна',
      position: 'HR Manager',
      department: 'HR',
      baseSalary: 120000,
      bonus: 15000,
      allowances: 10000,
      deductions: 16900,
      netSalary: 128100,
      currency: 'RUB',
      effectiveDate: '2024-01-01',
      status: 'active',
      avatar: 'ПА'
    },
    {
      id: '3',
      employeeName: 'Сидоров Алексей Владимирович',
      position: 'Product Manager',
      department: 'Product',
      baseSalary: 180000,
      bonus: 30000,
      allowances: 20000,
      deductions: 29900,
      netSalary: 200100,
      currency: 'RUB',
      effectiveDate: '2024-01-01',
      status: 'active',
      avatar: 'СА'
    },
    {
      id: '4',
      employeeName: 'Козлова Мария Дмитриевна',
      position: 'Junior Developer',
      department: 'IT',
      baseSalary: 80000,
      bonus: 8000,
      allowances: 5000,
      deductions: 11440,
      netSalary: 81560,
      currency: 'RUB',
      effectiveDate: '2024-01-01',
      status: 'active',
      avatar: 'КМ'
    }
  ];

  const departments = ['IT', 'HR', 'Product', 'Marketing', 'Sales', 'Finance'];
  const statuses = ['active', 'pending', 'inactive'];

  const filteredSalaries = salaries.filter(salary => {
    const matchesSearch = salary.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         salary.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = filterDepartment === 'all' || salary.department === filterDepartment;
    const matchesStatus = filterStatus === 'all' || salary.status === filterStatus;
    
    return matchesSearch && matchesDepartment && matchesStatus;
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
      active: { class: 'status-active', text: 'Активна' },
      pending: { class: 'status-pending', text: 'Ожидает' },
      inactive: { class: 'status-inactive', text: 'Неактивна' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    return <span className={`status-badge ${config.class}`}>{config.text}</span>;
  };

  const totalPayroll = filteredSalaries.reduce((sum, salary) => sum + salary.netSalary, 0);
  const averageSalary = filteredSalaries.length > 0 ? totalPayroll / filteredSalaries.length : 0;

  return (
    <div className="content-area">

      {/* KPI/SLA мини-карточки */}
      <div className="card-grid">
        <div className="card-grid-item-4">
          <div className="card kpi-card border-primary h-100">
            <div className="card-body text-center d-flex flex-column">
              <div className="kpi-icon-wrapper primary">
                <i className="bi bi-people"></i>
              </div>
              <div className="fw-semibold text-muted mb-1">Сотрудников</div>
              <div className="fs-2 fw-bold text-primary mb-2">{filteredSalaries.length}</div>
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
              <div className="fw-semibold text-muted mb-1">Общий фонд</div>
              <div className="fs-2 fw-bold text-success mb-2">{formatCurrency(totalPayroll)}</div>
              <small className="text-muted mb-3">Ежемесячно</small>
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
              <div className="fw-semibold text-muted mb-1">Средняя ЗП</div>
              <div className="fs-2 fw-bold text-info mb-2">{formatCurrency(averageSalary)}</div>
              <small className="text-muted mb-3">По компании</small>
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
                <i className="bi bi-calendar-check"></i>
              </div>
              <div className="fw-semibold text-muted mb-1">Выплаты</div>
              <div className="fs-2 fw-bold text-warning mb-2">98%</div>
              <small className="text-muted mb-3">Вовремя</small>
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
                  placeholder="Поиск по имени или должности..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-3">
              <select 
                className="form-select"
                value={filterDepartment} 
                onChange={(e) => setFilterDepartment(e.target.value)}
              >
                <option value="all">Все отделы</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
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
                    {status === 'active' ? 'Активные' : 
                     status === 'pending' ? 'Ожидающие' : 'Неактивные'}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Таблица зарплат */}
      <div className="card content-card">
        <div className="card-header d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center">
            <div className="card-icon-wrapper me-3">
              <i className="bi bi-table"></i>
            </div>
            <h5 className="mb-0">Зарплаты сотрудников</h5>
          </div>
          <button 
            className="btn btn-primary btn-sm"
            onClick={() => setShowAddModal(true)}
          >
            <i className="bi bi-plus me-1"></i>
            Добавить зарплату
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
                  <th>Базовая зарплата</th>
                  <th>Бонус</th>
                  <th>Надбавки</th>
                  <th>Удержания</th>
                  <th>К выплате</th>
                  <th>Дата вступления</th>
                  <th>Статус</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {filteredSalaries.map(salary => (
                  <tr key={salary.id} className="animated-row">
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="avatar-sm me-3">{salary.avatar}</div>
                        <div>
                          <div className="fw-semibold">{salary.employeeName}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="text-muted">{salary.position}</span>
                    </td>
                    <td>
                      <span className="badge bg-primary-subtle text-primary">{salary.department}</span>
                    </td>
                    <td>
                      <span className="fw-semibold">{formatCurrency(salary.baseSalary)}</span>
                    </td>
                    <td>
                      <span className="text-success">{formatCurrency(salary.bonus)}</span>
                    </td>
                    <td>
                      <span className="text-info">{formatCurrency(salary.allowances)}</span>
                    </td>
                    <td>
                      <span className="text-danger">{formatCurrency(salary.deductions)}</span>
                    </td>
                    <td>
                      <span className="fw-bold text-success fs-6">{formatCurrency(salary.netSalary)}</span>
                    </td>
                    <td>
                      <span className="text-muted">{new Date(salary.effectiveDate).toLocaleDateString('ru-RU')}</span>
                    </td>
                    <td>{getStatusBadge(salary.status)}</td>
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

      {/* Модальное окно добавления зарплаты */}
      {showAddModal && (
        <div className="modal fade show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-plus-circle me-2"></i>
                  Добавить зарплату
                </h5>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={() => setShowAddModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p>Форма добавления зарплаты будет здесь...</p>
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

export default SalariesPage; 