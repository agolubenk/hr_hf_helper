import React, { useState, useEffect } from 'react';
import { toastSuccess, toastError } from '../../utils/toastHelper';
import { api } from '../../utils/api';
import './SystemSettings.css';

interface Department {
  id: string;
  name: string;
  slug: string;
  short_name: string;
  parent: string | null;
  description: string;
  manager: string | null;
  location: string | null;
  created_at: string;
  updated_at: string;
  employee_count?: number;
  children?: Department[];
}

const SystemOrgStructureSettings: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDepartment, setNewDepartment] = useState<Partial<Department>>({
    name: '',
    short_name: '',
    parent: null,
    description: '',
    location: '',
  });

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    setLoading(true);
    try {
      const data = await api.getOrgStructure();
      
      // Преобразуем данные из API в формат компонента
      const departmentsData: Department[] = Array.isArray(data) ? data : [];
      
      // Нормализуем данные: преобразуем parent из объекта в ID, если нужно
      const normalizeDepartment = (dept: any): Department => {
        // Обрабатываем location: может быть null, undefined, или пустой строкой
        const location = dept.location && dept.location.trim() ? dept.location.trim() : null;
        
        return {
          id: dept.id,
          name: dept.name || '',
          slug: dept.slug || '',
          short_name: dept.short_name || '',
          parent: dept.parent_id || (dept.parent && typeof dept.parent === 'object' ? dept.parent.id : dept.parent) || null, // Используем parent_id если есть, иначе parent (может быть объект или ID)
          description: dept.description || '',
          manager: dept.manager || null,
          location: location,
          created_at: dept.created_at || '',
          updated_at: dept.updated_at || '',
          employee_count: dept.employee_count,
          children: dept.children ? dept.children.map(normalizeDepartment) : undefined,
        };
      };
      
      const normalizedData = departmentsData.map(normalizeDepartment);
      
      // Если данные уже в виде дерева, используем их напрямую
      if (normalizedData.length > 0 && normalizedData[0].children !== undefined) {
        setDepartments(normalizedData);
        // Разворачиваем все узлы по умолчанию
        const allIds = new Set<string>();
        const collectIds = (depts: Department[]) => {
          depts.forEach(dept => {
            allIds.add(dept.id);
            if (dept.children) {
              collectIds(dept.children);
            }
          });
        };
        collectIds(normalizedData);
        setExpandedNodes(allIds);
      } else {
        // Если данные плоские, строим дерево
        const tree = buildTree(normalizedData);
        setDepartments(tree);
        setExpandedNodes(new Set(normalizedData.map(d => d.id)));
      }
    } catch (error) {
      console.error('Error loading departments:', error);
      // В случае ошибки показываем пустой список
      setDepartments([]);
      toastError('Ошибка при загрузке департаментов', 'Ошибка');
    } finally {
      setLoading(false);
    }
  };

  const buildTree = (items: Department[]): Department[] => {
    const map = new Map<string, Department>();
    const roots: Department[] = [];

    // Создаем карту всех элементов
    items.forEach(item => {
      // Нормализуем parent: используем parent_id если есть, иначе parent
      const parentId = (item as any).parent_id || item.parent;
      map.set(item.id, { ...item, parent: parentId, children: [] });
    });

    // Строим дерево
    items.forEach(item => {
      const node = map.get(item.id)!;
      const parentId = (item as any).parent_id || item.parent;
      if (parentId && map.has(parentId)) {
        const parent = map.get(parentId)!;
        if (!parent.children) {
          parent.children = [];
        }
        parent.children.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  };

  const getAllDepartmentsFlat = (tree: Department[]): Department[] => {
    const result: Department[] = [];
    const traverse = (nodes: Department[]) => {
      nodes.forEach(node => {
        result.push(node);
        if (node.children) {
          traverse(node.children);
        }
      });
    };
    traverse(tree);
    return result;
  };

  const getFullPath = (dept: Department, tree: Department[]): string => {
    const findPath = (nodes: Department[], targetId: string, path: string[] = []): string[] | null => {
      for (const node of nodes) {
        const currentPath = [...path, node.name];
        if (node.id === targetId) {
          return currentPath;
        }
        if (node.children) {
          const found = findPath(node.children, targetId, currentPath);
          if (found) return found;
        }
      }
      return null;
    };
    
    const path = findPath(tree, dept.id);
    return path ? path.join(' → ') : dept.name;
  };

  const toggleNode = (id: string) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleAddDepartment = async () => {
    if (!newDepartment.name) {
      toastError('Введите название департамента', 'Ошибка');
      return;
    }

    setSaving(true);
    try {
      await api.createDepartment({
        name: newDepartment.name,
        short_name: newDepartment.short_name || '',
        parent: newDepartment.parent || null,
        description: newDepartment.description || '',
        location: newDepartment.location || '',
      });
      
      toastSuccess('Департамент успешно создан', 'Создано');
      setShowAddForm(false);
      setNewDepartment({
        name: '',
        short_name: '',
        parent: null,
        description: '',
        location: '',
      });
      loadDepartments();
    } catch (error: any) {
      toastError(error.message || 'Ошибка при создании департамента', 'Ошибка');
      console.error('Error creating department:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleEditDepartment = async (department: Department) => {
    setSaving(true);
    try {
      const response = await api.updateDepartment(department.id, {
        name: department.name,
        short_name: department.short_name || '',
        parent: department.parent || null,
        description: department.description || '',
        location: department.location || '',
      });
      
      console.log('Department updated, response:', response);
      
      toastSuccess('Департамент успешно обновлен', 'Обновлено');
      setEditingDepartment(null);
      // Перезагружаем данные для отображения обновленной информации
      await loadDepartments();
    } catch (error: any) {
      toastError(error.message || 'Ошибка при обновлении департамента', 'Ошибка');
      console.error('Error updating department:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteDepartment = async (id: string) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот департамент?')) {
      return;
    }

    setSaving(true);
    try {
      await api.deleteDepartment(id);
      
      toastSuccess('Департамент успешно удален', 'Удалено');
      loadDepartments();
    } catch (error: any) {
      toastError(error.message || 'Ошибка при удалении департамента', 'Ошибка');
      console.error('Error deleting department:', error);
    } finally {
      setSaving(false);
    }
  };

  const renderDepartment = (dept: Department, level: number = 0): React.ReactNode => {
    const hasChildren = dept.children && dept.children.length > 0;
    const isExpanded = expandedNodes.has(dept.id);
    const isEditing = editingDepartment?.id === dept.id;

    return (
      <div key={dept.id} className="department-node" style={{ marginLeft: `${level * 24}px` }}>
        <div className="department-item d-flex align-items-center justify-content-between p-2 border rounded mb-2">
          <div className="d-flex align-items-center flex-grow-1">
            {hasChildren && (
              <button
                className="btn btn-sm btn-link p-0 me-2"
                onClick={() => toggleNode(dept.id)}
                style={{ width: '20px', height: '20px' }}
              >
                <i className={`bi ${isExpanded ? 'bi-chevron-down' : 'bi-chevron-right'}`}></i>
              </button>
            )}
            {!hasChildren && <span style={{ width: '20px', display: 'inline-block' }}></span>}
            
            <span className="me-2">
              {!dept.parent ? '📦' : (!hasChildren ? '📄' : '📁')}
            </span>
            
            <div className="flex-grow-1">
              <div className="d-flex align-items-center gap-2 flex-wrap">
                {isEditing ? (
                  <div className="d-flex flex-column gap-2" style={{ width: '100%' }}>
                    <div className="d-flex gap-2 flex-wrap">
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={editingDepartment.name || ''}
                        onChange={(e) => setEditingDepartment({ ...editingDepartment, name: e.target.value })}
                        style={{ width: '200px', minWidth: '150px' }}
                        placeholder="Название *"
                      />
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={editingDepartment.short_name || ''}
                        onChange={(e) => setEditingDepartment({ ...editingDepartment, short_name: e.target.value })}
                        style={{ width: '120px', minWidth: '100px' }}
                        placeholder="Сокращение"
                      />
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={editingDepartment.location || ''}
                        onChange={(e) => setEditingDepartment({ ...editingDepartment, location: e.target.value })}
                        style={{ width: '150px', minWidth: '120px' }}
                        placeholder="Локация/офис"
                      />
                    </div>
                    <div className="d-flex gap-2 flex-wrap">
                      <select
                        className="form-select form-select-sm"
                        value={editingDepartment.parent || ''}
                        onChange={(e) => setEditingDepartment({ ...editingDepartment, parent: e.target.value || null })}
                        style={{ width: '250px', minWidth: '200px' }}
                      >
                        <option value="">— Без родителя (корневой)</option>
                        {getAllDepartmentsFlat(departments)
                          .filter(d => d.id !== editingDepartment.id) // Исключаем текущий департамент
                          .map(dept => {
                            const path = getFullPath(dept, departments);
                            return (
                              <option key={dept.id} value={dept.id}>
                                {path}
                              </option>
                            );
                          })}
                      </select>
                    </div>
                    <div className="d-flex gap-2">
                      <textarea
                        className="form-control form-control-sm"
                        value={editingDepartment.description || ''}
                        onChange={(e) => setEditingDepartment({ ...editingDepartment, description: e.target.value })}
                        rows={2}
                        placeholder="Описание"
                        style={{ width: '100%' }}
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="d-flex flex-column gap-1">
                      <div className="d-flex align-items-center gap-2 flex-wrap">
                        <strong>{dept.name}</strong>
                        {dept.short_name && (
                          <span className="badge bg-secondary">{dept.short_name}</span>
                        )}
                      </div>
                      {dept.location && (
                        <small className="text-muted">
                          <i className="bi bi-geo-alt"></i> {dept.location}
                        </small>
                      )}
                      {dept.description && (
                        <small className="text-muted" style={{ fontSize: '0.85rem', fontStyle: 'italic' }}>
                          {dept.description}
                        </small>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
            
            <div className="d-flex align-items-center gap-2">
              {dept.employee_count !== undefined && (
                <span className="badge bg-info">
                  <i className="bi bi-people"></i> {dept.employee_count}
                </span>
              )}
              {isEditing ? (
                <>
                  <button
                    className="btn btn-sm btn-success"
                    onClick={() => handleEditDepartment(editingDepartment)}
                    disabled={saving}
                  >
                    <i className="bi bi-check"></i>
                  </button>
                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={() => setEditingDepartment(null)}
                  >
                    <i className="bi bi-x"></i>
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => {
                      // Правильно устанавливаем parent из parent_id или parent
                      const parentId = (dept as any).parent_id || dept.parent;
                      // Обрабатываем location: если null или undefined, используем пустую строку для редактирования
                      const location = dept.location !== null && dept.location !== undefined ? dept.location : '';
                      setEditingDepartment({ 
                        ...dept, 
                        parent: parentId || null,
                        location: location,
                        description: dept.description || '',
                        short_name: dept.short_name || '',
                      });
                    }}
                  >
                    <i className="bi bi-pencil"></i>
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleDeleteDepartment(dept.id)}
                  >
                    <i className="bi bi-trash"></i>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
        
        {isExpanded && hasChildren && (
          <div className="department-children">
            {dept.children!.map(child => renderDepartment(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  // Рекурсивная функция для фильтрации департаментов с учетом вложенных
  const filterDepartments = (depts: Department[]): Department[] => {
    if (!searchTerm) {
      return depts;
    }
    
    const searchLower = searchTerm.toLowerCase();
    const filtered: Department[] = [];
    
    depts.forEach(dept => {
      const matchesSearch = dept.name.toLowerCase().includes(searchLower) ||
                           dept.short_name?.toLowerCase().includes(searchLower);
      
      // Рекурсивно фильтруем детей
      const filteredChildren = dept.children ? filterDepartments(dept.children) : [];
      
      // Если сам департамент или его дети соответствуют поиску
      if (matchesSearch || filteredChildren.length > 0) {
        filtered.push({
          ...dept,
          children: filteredChildren.length > 0 ? filteredChildren : dept.children
        });
      }
    });
    
    return filtered;
  };

  const filteredDepartments = filterDepartments(departments);

  if (loading) {
    return (
      <div className="settings-page">
        <div className="settings-header">
          <div className="settings-header-content">
            <div className="settings-title">
              <i className="bi bi-diagram-3"></i>
              <h1>Оргструктура</h1>
            </div>
            <p className="settings-subtitle">Настройка организационной структуры компании</p>
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
            <i className="bi bi-diagram-3"></i>
            <h1>Оргструктура</h1>
          </div>
          <p className="settings-subtitle">
            Управление организационной структурой компании: департаменты, отделы и подразделения
          </p>
        </div>
      </div>

      <div className="settings-content-wrapper">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="flex-grow-1 me-3">
            <div className="input-group" style={{ height: '38px' }}>
              <span className="input-group-text" style={{ height: '38px', display: 'flex', alignItems: 'center' }}>
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Поиск департаментов..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ height: '38px' }}
              />
            </div>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => setShowAddForm(!showAddForm)}
            style={{ height: '38px' }}
          >
            <i className="bi bi-plus-lg me-2"></i>
            Добавить департамент
          </button>
        </div>

        {showAddForm && (
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">Новый департамент</h5>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Название *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={newDepartment.name || ''}
                    onChange={(e) => setNewDepartment({ ...newDepartment, name: e.target.value })}
                    placeholder="Например: Отдел разработки"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Сокращенное название</label>
                  <input
                    type="text"
                    className="form-control"
                    value={newDepartment.short_name || ''}
                    onChange={(e) => setNewDepartment({ ...newDepartment, short_name: e.target.value })}
                    placeholder="Например: DEV"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Родительский департамент</label>
                  <select
                    className="form-select"
                    value={newDepartment.parent || ''}
                    onChange={(e) => setNewDepartment({ ...newDepartment, parent: e.target.value || null })}
                  >
                    <option value="">— Без родителя (корневой)</option>
                    {getAllDepartmentsFlat(departments).map(dept => {
                      const path = getFullPath(dept, departments);
                      return (
                        <option key={dept.id} value={dept.id}>
                          {path}
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Локация/офис</label>
                  <input
                    type="text"
                    className="form-control"
                    value={newDepartment.location || ''}
                    onChange={(e) => setNewDepartment({ ...newDepartment, location: e.target.value })}
                    placeholder="Например: Главный офис"
                  />
                </div>
                <div className="col-md-12">
                  <label className="form-label">Описание</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={newDepartment.description || ''}
                    onChange={(e) => setNewDepartment({ ...newDepartment, description: e.target.value })}
                    placeholder="Описание задач и зоны ответственности департамента"
                  />
                </div>
              </div>
              <div className="mt-3">
                <button
                  className="btn btn-primary me-2"
                  onClick={handleAddDepartment}
                  disabled={saving}
                >
                  {saving ? 'Сохранение...' : 'Создать'}
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowAddForm(false);
                    setNewDepartment({
                      name: '',
                      short_name: '',
                      parent: null,
                      description: '',
                      location: '',
                    });
                  }}
                >
                  Отмена
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="departments-tree">
          {filteredDepartments.length === 0 ? (
            <div className="text-center p-5 text-muted">
              <i className="bi bi-inbox" style={{ fontSize: '3rem', opacity: 0.3 }}></i>
              <p className="mt-3">Нет департаментов</p>
              <p className="small">Добавьте первый департамент для начала работы</p>
            </div>
          ) : (
            filteredDepartments.map(dept => renderDepartment(dept))
          )}
        </div>
      </div>
    </div>
  );
};

export default SystemOrgStructureSettings;

