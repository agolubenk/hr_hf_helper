import React, { useState, useEffect } from 'react';
import { toastSuccess, toastInfo, toastWarning } from '../../utils/toastHelper';
import './SystemSettings.css';

interface SystemUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'pending' | 'blocked';
}

const SystemUsersSettings: React.FC = () => {
  const [filterName, setFilterName] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(50);

  const [users, setUsers] = useState<SystemUser[]>([
    {
      id: '1',
      name: 'Иван Иванов',
      email: 'ivanov@company.com',
      role: 'Администратор/HRBP',
      status: 'active',
    },
    {
      id: '2',
      name: 'Мария Петрова',
      email: 'petrova@company.com',
      role: 'Пользователь/Рекрутер',
      status: 'pending',
    },
    {
      id: '3',
      name: 'Алексей Сидоров',
      email: 'sidorov@company.com',
      role: 'Менеджер/HRBP',
      status: 'active',
    },
    {
      id: '4',
      name: 'Елена Козлова',
      email: 'kozlova@company.com',
      role: 'Пользователь/Специалист',
      status: 'blocked',
    },
  ]);

  const filteredUsers = users.filter(user => {
    const nameMatch = user.name.toLowerCase().includes(filterName.toLowerCase());
    const roleMatch = user.role.toLowerCase().includes(filterRole.toLowerCase());
    return nameMatch && roleMatch;
  });

  // Пагинация
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="status-badge status-active">Активен</span>;
      case 'pending':
        return <span className="status-badge status-pending">Ожидает</span>;
      case 'blocked':
        return <span className="status-badge status-blocked">Заблокирован</span>;
      default:
        return <span className="status-badge status-unknown">Неизвестно</span>;
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleAddUser = () => {
    const newUser: SystemUser = {
      id: Date.now().toString(),
      name: 'Новый пользователь',
      email: 'newuser@company.com',
      role: 'Пользователь/Специалист',
      status: 'pending'
    };
    
    setUsers([...users, newUser]);
    toastSuccess(`Пользователь "${newUser.name}" добавлен в систему. Статус: ожидает активации.`, 'Пользователь добавлен');
  };

  const handleBlockUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      const newStatus: 'active' | 'blocked' = user.status === 'blocked' ? 'active' : 'blocked';
      const updatedUsers = users.map(u => 
        u.id === userId ? { ...u, status: newStatus } : u
      );
      
      setUsers(updatedUsers);
      
      if (newStatus === 'blocked') {
        toastWarning(`Пользователь "${user.name}" заблокирован. Доступ к системе ограничен.`, 'Пользователь заблокирован');
      } else {
        toastSuccess(`Пользователь "${user.name}" разблокирован. Доступ к системе восстановлен.`, 'Пользователь разблокирован');
      }
    }
  };

  const handleEditUser = (userId: string) => {
    toastInfo('Редактирование пользователя (функция в разработке)', 'Редактирование');
  };

  const handleExport = () => {
    toastSuccess(`Экспортировано ${filteredUsers.length} пользователей из ${users.length} общих.`, 'Экспорт завершен');
  };

  const handleImport = () => {
    toastInfo('Открывается диалог импорта пользователей. Поддерживаются форматы CSV и JSON.', 'Импорт пользователей');
  };

  return (
    <div className="settings-page">
      <div className="settings-header">
        <div className="settings-header-content">
          <div className="settings-title">
            <i className="bi bi-people"></i>
            <h1>Пользователи системы</h1>
          </div>
          <p className="settings-subtitle">
            Управляйте пользователями, их ролями и доступом к системе
          </p>
        </div>
      </div>

      <div className="settings-content-wrapper">
        {/* Фильтры и действия */}
        <div className="filters-section-compact">
          <div className="filters-row-compact">
            <div className="filter-group-compact">
              <input 
                type="text" 
                className="form-control form-control-sm" 
                placeholder="Поиск по имени..."
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
              />
            </div>
            
            <div className="filter-group-compact">
              <input 
                type="text" 
                className="form-control form-control-sm" 
                placeholder="Фильтр по роли..."
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
              />
            </div>
            
            <div className="action-buttons-compact">
              <button 
                type="button" 
                className="btn btn-success btn-sm" 
                onClick={handleAddUser}
              >
                <i className="bi bi-person-plus me-1"></i>
                Добавить
              </button>
            </div>
          </div>
        </div>

        {/* Контент */}
        <div className="compact-users-list">
          {currentUsers.map(user => (
            <div key={user.id} className="compact-user-row">
              <div className="user-avatar-mini">
                {getInitials(user.name)}
              </div>
              <div className="user-info-compact">
                <div className="user-name-compact">{user.name}</div>
                <div className="user-email-compact">{user.email}</div>
                <div className="user-role-mobile">{user.role}</div>
              </div>
              <div className="user-role-compact">{user.role}</div>
              <div className="user-status-compact">
                {getStatusBadge(user.status)}
                <div className="user-actions-mobile">
                  <button 
                    className="action-btn action-edit" 
                    title="Редактировать"
                    onClick={() => handleEditUser(user.id)}
                  >
                    <i className="bi bi-pencil"></i>
                  </button>
                  <button 
                    className={`action-btn ${user.status === 'blocked' ? 'action-unlock' : 'action-lock'}`}
                    title={user.status === 'blocked' ? 'Разблокировать' : 'Заблокировать'}
                    onClick={() => handleBlockUser(user.id)}
                  >
                    <i className={`bi ${user.status === 'blocked' ? 'bi-unlock' : 'bi-lock'}`}></i>
                  </button>
                </div>
              </div>
              <div className="user-actions-compact">
                <button 
                  className="action-btn action-edit" 
                  title="Редактировать"
                  onClick={() => handleEditUser(user.id)}
                >
                  <i className="bi bi-pencil"></i>
                </button>
                <button 
                  className={`action-btn ${user.status === 'blocked' ? 'action-unlock' : 'action-lock'}`}
                  title={user.status === 'blocked' ? 'Разблокировать' : 'Заблокировать'}
                  onClick={() => handleBlockUser(user.id)}
                >
                  <i className={`bi ${user.status === 'blocked' ? 'bi-unlock' : 'bi-lock'}`}></i>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Пагинация */}
        {totalPages > 1 && (
          <div className="pagination-section">
            <div className="pagination-info">
              Показано {startIndex + 1}-{Math.min(endIndex, filteredUsers.length)} из {filteredUsers.length} пользователей
            </div>
            <div className="pagination-controls">
              <button 
                className="btn btn-sm btn-outline-secondary"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                <i className="bi bi-chevron-left"></i>
              </button>
              <span className="pagination-current">
                {currentPage} из {totalPages}
              </span>
              <button 
                className="btn btn-sm btn-outline-secondary"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                <i className="bi bi-chevron-right"></i>
              </button>
            </div>
          </div>
        )}

        {/* Футер */}
        <div className="users-footer-compact">
          <div className="users-stats-compact">
            <span className="text-muted">
              Всего: {users.length} | Отфильтровано: {filteredUsers.length}
            </span>
          </div>
          <div className="users-export-compact">
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={handleExport}>
              <i className="bi bi-download me-1"></i>
              Экспорт
            </button>
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={handleImport}>
              <i className="bi bi-upload me-1"></i>
              Импорт
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemUsersSettings;

