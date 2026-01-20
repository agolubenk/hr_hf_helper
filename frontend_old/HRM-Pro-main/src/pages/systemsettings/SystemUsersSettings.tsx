import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import './SystemSettings.css';

interface SystemUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'pending' | 'blocked';
  avatar?: string;
  modules?: Record<string, 'view' | 'edit' | 'none'>;
}

interface ModuleAccess {
  key: string;
  name: string;
  icon: string;
}

interface RoleModel {
  id: string;
  name: string;
  description: string;
  accessLevel: string;
}

const SystemUsersSettings: React.FC = () => {
  const { addToast } = useAppContext();
  
  const [filterName, setFilterName] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(50);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRoleModelsModal, setShowRoleModelsModal] = useState(false);
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null);
  const [editFormData, setEditFormData] = useState({
    role: 'user',
    status: 'active' as 'active' | 'pending' | 'blocked',
    modules: {} as Record<string, 'view' | 'edit' | 'none'>
  });

  // Список всех модулей
  const allModules: ModuleAccess[] = [
    { key: 'dashboard', name: 'Дашборд', icon: 'bi-speedometer2' },
    { key: 'employees', name: 'Сотрудники', icon: 'bi-people' },
    { key: 'recruiting', name: 'Рекрутинг', icon: 'bi-person-plus' },
    { key: 'adaptation', name: 'Адаптация', icon: 'bi-person-check' },
    { key: 'cb', name: 'C&B', icon: 'bi-cash-stack' },
    { key: 'hrops', name: 'HR Ops', icon: 'bi-gear-wide-connected' },
    { key: 'ld', name: 'L&D', icon: 'bi-mortarboard' },
    { key: 'performance', name: 'KPI', icon: 'bi-graph-up' },
    { key: 'okr', name: 'OKR', icon: 'bi-bullseye' },
    { key: 'time', name: 'Время', icon: 'bi-clock-history' },
    { key: 'projects', name: 'Проекты', icon: 'bi-kanban' },
    { key: 'wiki', name: 'Wiki', icon: 'bi-book' },
    { key: 'corporate', name: 'Портал', icon: 'bi-globe' },
    { key: 'reports', name: 'Отчеты', icon: 'bi-file-earmark-text' },
    { key: 'settings', name: 'Настройки', icon: 'bi-gear' }
  ];

  // Данные ролевых моделей
  const [roleModels, setRoleModels] = useState<RoleModel[]>([
    {
      id: '1',
      name: 'HRD',
      description: 'Руководитель HR-функции',
      accessLevel: 'Полный доступ'
    },
    {
      id: '2',
      name: 'HRBP',
      description: 'HR-бизнес партнер',
      accessLevel: 'Расширенный'
    },
    {
      id: '3',
      name: 'Рекрутер',
      description: 'Специалист по подбору персонала',
      accessLevel: 'Модульный'
    },
    {
      id: '4',
      name: 'Специалист по адаптации',
      description: 'Сопровождение новых сотрудников',
      accessLevel: 'Модульный'
    },
    {
      id: '5',
      name: 'Специалист по кадрам',
      description: 'Операционное управление персоналом',
      accessLevel: 'Модульный'
    },
    {
      id: '6',
      name: 'HR-аналитик',
      description: 'Аналитика и отчетность',
      accessLevel: 'Модульный'
    },
    {
      id: '7',
      name: 'Бренд-менеджер',
      description: 'Управление корпоративной культурой',
      accessLevel: 'Модульный'
    }
  ]);

  const [users, setUsers] = useState<SystemUser[]>([
    {
      id: '1',
      name: 'Иван Иванов',
      email: 'ivanov@company.com',
      role: 'Администратор/HRBP',
      status: 'active',
      modules: {
        dashboard: 'edit',
        employees: 'edit',
        recruiting: 'view',
        settings: 'edit',
      }
    },
    {
      id: '2',
      name: 'Мария Петрова',
      email: 'petrova@company.com',
      role: 'Пользователь/Рекрутер',
      status: 'pending',
      modules: {
        dashboard: 'view',
        employees: 'view',
      }
    },
    {
      id: '3',
      name: 'Алексей Сидоров',
      email: 'sidorov@company.com',
      role: 'Менеджер/HRBP',
      status: 'active',
      modules: {
        dashboard: 'edit',
        employees: 'edit',
        performance: 'view',
        reports: 'edit'
      }
    },
    {
      id: '4',
      name: 'Елена Козлова',
      email: 'kozlova@company.com',
      role: 'Пользователь/Специалист',
      status: 'blocked',
      modules: {
        dashboard: 'view',
        employees: 'view'
      }
    }
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
    
    addToast(`Пользователь "${newUser.name}" добавлен в систему. Статус: ожидает активации.`, { 
      type: 'success',
      title: 'Пользователь добавлен'
    });
  };

  const handleEditUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setEditingUser(user);
      setEditFormData({
        role: user.role.includes('Администратор') ? 'admin' : 'user',
        status: user.status,
        modules: user.modules || {}
      });
      setShowEditModal(true);
    }
  };

  const handleSaveUser = () => {
    if (!editingUser) return;

    const updatedUsers = users.map(user => 
      user.id === editingUser.id 
        ? { 
            ...user, 
            role: editFormData.role === 'admin' ? 'Администратор/HRBP' : 'Пользователь/Специалист',
            status: editFormData.status,
            modules: editFormData.modules
          }
        : user
    );
    
    setUsers(updatedUsers);
    setShowEditModal(false);
    setEditingUser(null);
    
    addToast(`Настройки пользователя "${editingUser.name}" успешно обновлены.`, { 
      type: 'success',
      title: 'Пользователь обновлен'
    });
  };

  const handleCancelEdit = () => {
    setShowEditModal(false);
    setEditingUser(null);
    addToast('Редактирование отменено. Изменения не сохранены.', { 
      type: 'info',
      title: 'Редактирование отменено'
    });
  };

  const handleModuleAccessChange = (moduleKey: string, hasAccess: boolean, accessType: 'view' | 'edit' = 'view') => {
    setEditFormData(prev => ({
      ...prev,
      modules: {
        ...prev.modules,
        [moduleKey]: hasAccess ? accessType : 'none'
      }
    }));
  };

  const handleRoleChange = (role: 'admin' | 'user') => {
    setEditFormData(prev => ({
      ...prev,
      role,
      modules: role === 'admin' 
        ? allModules.reduce((acc, module) => ({ ...acc, [module.key]: 'edit' }), {})
        : {}
    }));
  };

  const handleStatusChange = (status: 'active' | 'pending' | 'blocked') => {
    setEditFormData(prev => ({ ...prev, status }));
  };

  const handleResetAccess = () => {
    setEditFormData(prev => ({
      ...prev,
      role: 'custom',
      modules: {}
    }));
  };

  const handlePositionRole = (position: string) => {
    const positionAccess: Record<string, Record<string, 'view' | 'edit'>> = {
      hrd: {
        dashboard: 'edit', employees: 'edit', recruiting: 'edit', adaptation: 'edit', cb: 'edit', hrops: 'edit', ld: 'edit', performance: 'edit', okr: 'edit', time: 'edit', projects: 'edit', wiki: 'edit', corporate: 'edit', reports: 'edit', settings: 'edit'
      },
      hrbp: {
        dashboard: 'edit', employees: 'edit', performance: 'edit', okr: 'edit', reports: 'edit'
      },
      recruiter: {
        dashboard: 'view', recruiting: 'edit', adaptation: 'view', employees: 'view'
      },
      adaptation: {
        dashboard: 'view', adaptation: 'edit', employees: 'view', recruiting: 'view'
      },
      hr: {
        dashboard: 'view', employees: 'edit', hrops: 'edit', time: 'edit', cb: 'edit'
      },
      analyst: {
        dashboard: 'edit', employees: 'view', performance: 'view', okr: 'view', reports: 'edit'
      },
      brand: {
        dashboard: 'view', corporate: 'edit', wiki: 'edit'
      }
    };

    const access = positionAccess[position] || {};
    setEditFormData(prev => ({
      ...prev,
      modules: access
    }));
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
        addToast(`Пользователь "${user.name}" заблокирован. Доступ к системе ограничен.`, { 
          type: 'warning',
          title: 'Пользователь заблокирован'
        });
      } else {
        addToast(`Пользователь "${user.name}" разблокирован. Доступ к системе восстановлен.`, { 
          type: 'success',
          title: 'Пользователь разблокирован'
        });
      }
    }
  };

  const handleRoleModels = () => {
    setShowRoleModelsModal(true);
    addToast('Открывается редактор ролевых моделей. Здесь вы можете настроить права доступа для различных ролей.', { 
      type: 'info',
      title: 'Ролевые модели'
    });
  };

  const handleExport = () => {
    const exportData = {
      users: filteredUsers,
      exportDate: new Date().toISOString(),
      totalUsers: users.length,
      filteredUsers: filteredUsers.length
    };
    
    console.log('Экспорт данных:', exportData);
    
    addToast(`Экспортировано ${filteredUsers.length} пользователей из ${users.length} общих. Файл сохранен в формате JSON.`, { 
      type: 'success',
      title: 'Экспорт завершен'
    });
  };

  const handleImport = () => {
    addToast('Открывается диалог импорта пользователей. Поддерживаются форматы CSV и JSON.', { 
      type: 'info',
      title: 'Импорт пользователей'
    });
  };

  const handleDeleteRoleModel = (roleId: string) => {
    const role = roleModels.find(r => r.id === roleId);
    if (role && window.confirm(`Вы уверены, что хотите удалить роль "${role.name}"?`)) {
      setRoleModels(roleModels.filter(r => r.id !== roleId));
      addToast(`Роль "${role.name}" удалена`, { 
        type: 'success',
        title: 'Роль удалена'
      });
    }
  };

  const handleEditRoleModel = (roleId: string) => {
    const role = roleModels.find(r => r.id === roleId);
    if (role) {
      addToast(`Редактирование роли: ${role.name}`, { 
        type: 'info',
        title: 'Редактирование роли'
      });
    }
  };

  const handleAddRoleModel = () => {
    setShowRoleModelsModal(true);
    addToast('Открывается редактор ролевых моделей. Здесь вы можете настроить права доступа для различных ролей.', { 
      type: 'info',
      title: 'Ролевые модели'
    });
  };

  // Обработчик клика вне модального окна
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const modal = document.querySelector('.modal.show');
      if (modal && !modal.contains(event.target as Node)) {
        if (showEditModal) {
          handleCancelEdit();
        }
        if (showRoleModelsModal) {
          setShowRoleModelsModal(false);
        }
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (showEditModal) {
          handleCancelEdit();
        }
        if (showRoleModelsModal) {
          setShowRoleModelsModal(false);
        }
      }
    };

    if (showEditModal || showRoleModelsModal) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [showEditModal, showRoleModelsModal]);

  const UserRow = ({ user }: { user: SystemUser }) => (
    <div className="compact-user-row">
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
  );

  return (
    <div className="system-settings-page">
      {/* Заголовок */}
      <div className="settings-header">
        <div className="settings-header-content">
          <div className="settings-title">
            <i className="bi bi-people text-primary"></i>
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
                className="btn btn-primary btn-sm" 
                onClick={handleRoleModels}
                data-bs-toggle="tooltip"
                data-bs-placement="top"
                title="Настройка прав доступа для различных ролей"
              >
                <i className="bi bi-diagram-3"></i>
                <span className="ms-1">Ролевые модели</span>
              </button>
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
        <div className="users-content-compact">
          <div className="compact-users-list">
            {currentUsers.map(user => (
              <UserRow key={user.id} user={user} />
            ))}
          </div>
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

      {/* Модальное окно редактирования пользователя */}
      {showEditModal && editingUser && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header align-items-center">
                <div className="d-flex align-items-center gap-3 w-100">
                  <span className="avatar bg-primary text-white rounded-circle d-none d-md-flex" style={{width:'48px',height:'48px',fontSize:'1.5rem',display:'flex',alignItems:'center',justifyContent:'center'}}>
                    {getInitials(editingUser.name)}
                  </span>
                  <div className="flex-grow-1">
                    <div className="fw-bold fs-5">{editingUser.name}</div>
                    <div className="text-muted small">{editingUser.email}</div>
                    <div className="d-flex gap-2 mt-1 align-items-center flex-wrap mobile-controls-row">
                      <div className="dropdown">
                        <button className="btn btn-sm dropdown-toggle user-role-select" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                          <i className={`bi bi-${editFormData.role === 'admin' ? 'shield-lock' : 'person'} me-1 d-none d-md-inline`}></i>
                          <span>{editFormData.role === 'admin' ? 'Администратор' : 'Пользователь'}</span>
                        </button>
                        <ul className="dropdown-menu">
                          <li><a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); handleRoleChange('admin'); }}>
                            <i className="bi bi-shield-lock me-2"></i>Администратор системы
                          </a></li>
                          <li><a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); handleRoleChange('user'); }}>
                            <i className="bi bi-person me-2"></i>Пользователь
                          </a></li>
                        </ul>
                      </div>
                      <div className="dropdown">
                        <button className="btn btn-sm dropdown-toggle user-status-select" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                          <i className={`bi bi-${editFormData.status === 'active' ? 'check-circle' : editFormData.status === 'pending' ? 'clock' : 'lock'} me-1 d-none d-md-inline`}></i>
                          {editFormData.status === 'active' ? 'Активен' : editFormData.status === 'pending' ? 'Ожидает' : 'Заблокирован'}
                        </button>
                        <ul className="dropdown-menu">
                          <li><a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); handleStatusChange('active'); }}>
                            <i className="bi bi-check-circle me-2"></i>Активен
                          </a></li>
                          <li><a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); handleStatusChange('pending'); }}>
                            <i className="bi bi-clock me-2"></i>Ожидает
                          </a></li>
                          <li><a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); handleStatusChange('blocked'); }}>
                            <i className="bi bi-lock me-2"></i>Заблокирован
                          </a></li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
                <button type="button" className="btn-close ms-2" onClick={handleCancelEdit} aria-label="Закрыть"></button>
              </div>
              
              <div className="modal-body">
                <div className="mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-2 mobile-controls-row">
                    <label className="form-label mb-0 d-none d-md-block">Доступ к модулям</label>
                    <div className="d-flex gap-2 align-items-center flex-wrap mobile-controls-row">
                      <button type="button" className="btn btn-outline-secondary btn-sm" onClick={handleResetAccess}>
                        <i className="bi bi-x-circle me-1 d-none d-md-inline"></i>Сбросить доступы
                      </button>
                      <div className="dropdown">
                        <button className="btn btn-outline-secondary btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                          <i className="bi bi-person-badge me-1 d-none d-md-inline"></i>Роли сотрудников
                        </button>
                        <ul className="dropdown-menu">
                          {roleModels.map((role) => (
                            <li key={role.id}>
                              <a className="dropdown-item" href="#" onClick={(e) => { 
                                e.preventDefault(); 
                                // Применяем права доступа в зависимости от роли
                                const roleAccessMap: Record<string, string> = {
                                  'HRD': 'hrd',
                                  'HRBP': 'hrbp',
                                  'Рекрутер': 'recruiter',
                                  'Специалист по адаптации': 'adaptation',
                                  'Специалист по кадрам': 'hr',
                                  'HR-аналитик': 'analyst',
                                  'Бренд-менеджер': 'brand'
                                };
                                const roleKey = roleAccessMap[role.name];
                                if (roleKey) {
                                  handlePositionRole(roleKey);
                                }
                              }}>
                                <i className="bi bi-person-badge me-2"></i>{role.name}
                              </a>
                            </li>
                          ))}
                          <li><hr className="dropdown-divider" /></li>
                          <li><a className="dropdown-item text-muted" href="#" onClick={(e) => { e.preventDefault(); handleResetAccess(); }}>
                            <i className="bi bi-gear me-2"></i>Настроить вручную
                          </a></li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="table-responsive">
                    <table className="table table-sm align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th style={{width:'40px'}}></th>
                          <th>Модуль</th>
                          <th className="text-center" style={{width:'120px'}}>Да</th>
                          <th className="text-center" style={{width:'120px'}}>Просмотр</th>
                          <th className="text-center" style={{width:'140px'}}>Редактирование</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allModules.map((module) => {
                          const moduleAccess = editFormData.modules[module.key] || 'none';
                          const hasAccess = moduleAccess === 'view' || moduleAccess === 'edit';
                          const group = `modaccess_${module.key}`;
                          
                          return (
                            <tr key={module.key}>
                              <td className="text-center">
                                <i className={`bi ${module.icon} text-primary fs-5`}></i>
                              </td>
                              <td>{module.name}</td>
                              <td className="text-center">
                                <input 
                                  type="checkbox" 
                                  className="form-check-input access-checkbox" 
                                  checked={hasAccess}
                                  onChange={(e) => handleModuleAccessChange(module.key, e.target.checked)}
                                  aria-label="Доступ к модулю"
                                />
                              </td>
                              <td className="text-center">
                                <input 
                                  type="radio" 
                                  className="form-check-input access-radio" 
                                  name={group}
                                  value="view"
                                  checked={hasAccess && moduleAccess === 'view'}
                                  disabled={!hasAccess}
                                  onChange={() => handleModuleAccessChange(module.key, true, 'view')}
                                  aria-label="Только просмотр"
                                />
                              </td>
                              <td className="text-center">
                                <input 
                                  type="radio" 
                                  className="form-check-input access-radio" 
                                  name={group}
                                  value="edit"
                                  checked={hasAccess && moduleAccess === 'edit'}
                                  disabled={!hasAccess}
                                  onChange={() => handleModuleAccessChange(module.key, true, 'edit')}
                                  aria-label="Редактирование"
                                />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              
              <div className="modal-footer justify-content-end">
                <button type="button" className="btn btn-outline-primary btn-sm w-100 add-model-btn" onClick={handleSaveUser}>
                  <i className="bi bi-save me-1"></i>Сохранить
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно ролевых моделей */}
      {showRoleModelsModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header align-items-center">
                <div className="d-flex align-items-center gap-3 w-100">
                  <span className="avatar bg-primary text-white rounded-circle d-none d-md-flex" style={{width:'48px',height:'48px',fontSize:'1.5rem',display:'flex',alignItems:'center',justifyContent:'center'}}>
                    <i className="bi bi-diagram-3"></i>
                  </span>
                  <div className="flex-grow-1">
                    <div className="fw-bold fs-5">Ролевые модели</div>
                    <div className="text-muted small">Управление предустановленными ролями сотрудников</div>
                  </div>
                </div>
                <button type="button" className="btn-close ms-2" onClick={() => setShowRoleModelsModal(false)} aria-label="Закрыть"></button>
              </div>
              
              <div className="modal-body">
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th style={{width:'40px'}}></th>
                        <th>Роль</th>
                        <th>Описание</th>
                        <th style={{width:'120px'}}>Доступы</th>
                        <th style={{width:'100px'}}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {roleModels.map((role) => (
                        <tr key={role.id}>
                          <td><i className="bi bi-person-badge text-primary fs-5 d-none d-md-inline"></i></td>
                          <td>{role.name}</td>
                          <td>{role.description}</td>
                          <td><span className="badge bg-primary">{role.accessLevel}</span></td>
                          <td>
                            <div className="btn-group">
                              <button 
                                className="btn btn-sm btn-light" 
                                title="Редактировать"
                                onClick={() => handleEditRoleModel(role.id)}
                              >
                                <i className="bi bi-pencil"></i>
                              </button>
                              <button 
                                className="btn btn-sm btn-light text-danger" 
                                title="Удалить"
                                onClick={() => handleDeleteRoleModel(role.id)}
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
              </div>
              
              <div className="modal-footer justify-content-center">
                <button type="button" className="btn btn-outline-primary btn-sm w-100 add-model-btn" onClick={handleAddRoleModel}>
                  <i className="bi bi-plus me-1"></i>Добавить модель
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemUsersSettings; 