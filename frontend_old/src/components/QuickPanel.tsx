import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { showNotImplementedToast } from '../utils/showNotImplementedToast';
import { api } from '../utils/api';
import { getActiveModules, type Module } from '../utils/modules';

interface QuickPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

interface RecentItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  iconColor: 'primary' | 'success' | 'info' | 'warning' | 'danger';
  href?: string;
  onClick?: () => void;
}

interface FavoriteItem {
  id: string;
  name: string;
  icon: string;
  color?: string;
  onClick?: () => void;
}

interface ModuleItem {
  id: string;
  name: string;
  icon: string;
  color?: string;
  count?: string;
  onClick?: () => void;
}

interface CollapsibleSectionProps {
  title: string;
  sectionId: string;
  children: React.ReactNode;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({ title, sectionId, children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const collapsedSections = JSON.parse(localStorage.getItem('hrm_collapsed_sections') || '{}');
    if (collapsedSections[sectionId]) {
      setIsCollapsed(true);
    }
  }, [sectionId]);

  const toggleCollapse = () => {
    const collapsedSections = JSON.parse(localStorage.getItem('hrm_collapsed_sections') || '{}');
    collapsedSections[sectionId] = !isCollapsed;
    localStorage.setItem('hrm_collapsed_sections', JSON.stringify(collapsedSections));
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className="collapsible-section">
      <div className="section-header" onClick={toggleCollapse}>
        <h6 className="section-title">{title}</h6>
        <i className={`bi bi-chevron-down section-toggle ${isCollapsed ? 'collapsed' : ''}`}></i>
      </div>
      {!isCollapsed && <div className="section-content">{children}</div>}
    </div>
  );
};

const QuickPanel: React.FC<QuickPanelProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  
  // Закрытие панели по клавише Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isOpen, onClose]);

  // Пример данных - в реальном приложении они будут приходить из пропсов или контекста
  const recentItems: RecentItem[] = [
    {
      id: '1',
      title: 'Иван Петров',
      description: 'Просмотрен 5 мин назад',
      icon: 'bi-person',
      iconColor: 'info',
      href: '#',
    },
    {
      id: '2',
      title: 'Отчет по KPI',
      description: 'Изменен час назад',
      icon: 'bi-file-text',
      iconColor: 'success',
      href: '#',
    },
  ];

  const [activeModules, setActiveModules] = useState<Module[]>([]);
  const [loadingModules, setLoadingModules] = useState(true);

  // Загружаем активные модули из настроек компании
  useEffect(() => {
    const loadActiveModules = async () => {
      try {
        const settings = await api.getGeneralSettings() as any;
        if (settings && settings.active_modules) {
          const activeModuleKeys = settings.active_modules.map((m: any) => m.key);
          const modules = getActiveModules(activeModuleKeys);
          setActiveModules(modules);
        } else {
          // Если нет настроек, показываем все модули по умолчанию
          const defaultActiveKeys = ['dashboard', 'employees', 'recruiting', 'wiki', 'settings'];
          setActiveModules(getActiveModules(defaultActiveKeys));
        }
      } catch (error) {
        console.error('Failed to load active modules:', error);
        // При ошибке показываем обязательные модули
        const defaultActiveKeys = ['dashboard', 'employees', 'recruiting', 'wiki', 'settings'];
        setActiveModules(getActiveModules(defaultActiveKeys));
      } finally {
        setLoadingModules(false);
      }
    };

    if (isOpen) {
      loadActiveModules();
    }
  }, [isOpen]);

  const favoriteItems: FavoriteItem[] = [
    {
      id: '1',
      name: 'Сотрудники',
      icon: 'bi-people',
    },
    {
      id: '2',
      name: 'Отчеты',
      icon: 'bi-graph-up',
    },
  ];

  // Преобразуем активные модули в формат ModuleItem
  const moduleItems: ModuleItem[] = activeModules.map((module) => ({
    id: module.key,
    name: module.name,
    icon: module.icon,
    color: module.color,
    count: module.desc,
  }));

  const handleItemClick = (moduleId?: string, onClick?: () => void) => {
    if (onClick) {
      onClick();
    } else if (moduleId === 'settings') {
      // Навигация на страницу настроек
      navigate('/settings/general');
    } else if (moduleId) {
      // Если есть moduleId, но нет onClick, показываем тост
      showNotImplementedToast();
    }
    onClose();
  };

  return (
    <>
      <div 
        className={`panel-overlay ${isOpen ? 'show' : ''}`} 
        onClick={onClose}
      ></div>
      <div className={`quick-panel ${isOpen ? 'show' : ''}`}>
        <CollapsibleSection title="Недавние" sectionId="recent">
          <div className="d-flex flex-column" style={{ gap: '0.5rem' }}>
            {recentItems.map((item) => (
              <a
                key={item.id}
                href={item.href || '#'}
                className="action-card"
                onClick={(e) => {
                  e.preventDefault();
                  if (item.onClick) {
                    item.onClick();
                    onClose();
                  } else {
                    handleItemClick();
                  }
                }}
              >
                <div className={`action-icon ${item.iconColor}`}>
                  <i className={`bi ${item.icon}`}></i>
                </div>
                <div className="action-content">
                  <div className="action-title">{item.title}</div>
                  <div className="action-desc">{item.description}</div>
                </div>
              </a>
            ))}
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="Избранное" sectionId="favorites">
          <div className="d-flex flex-column" style={{ gap: '0.25rem' }}>
            {favoriteItems.length > 0 ? (
              favoriteItems.map((item) => (
                <div
                  key={item.id}
                  className="favorite-item"
                  onClick={() => {
                    if (item.onClick) {
                      item.onClick();
                      onClose();
                    } else {
                      handleItemClick();
                    }
                  }}
                >
                  <i className="bi bi-star-fill text-warning"></i>
                  <span>{item.name}</span>
                </div>
              ))
            ) : (
              <div className="text-muted text-center p-2" style={{ fontSize: '0.875rem' }}>
                Нет избранных модулей
              </div>
            )}
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="Модули" sectionId="modules">
          <div className="quick-module-list">
            {loadingModules ? (
              <div className="text-muted text-center p-2" style={{ fontSize: '0.875rem' }}>
                Загрузка модулей...
              </div>
            ) : moduleItems.length > 0 ? (
              moduleItems.map((module) => (
                <div
                  key={module.id}
                  className="quick-module-item"
                  onClick={() => handleItemClick(module.id, module.onClick)}
                >
                  <i className={`bi ${module.icon} quick-module-icon ${module.color || ''}`}></i>
                  <div className="quick-module-content">
                    <span className="quick-module-name">{module.name}</span>
                    {module.count && (
                      <span className="quick-module-count">{module.count}</span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-muted text-center p-2" style={{ fontSize: '0.875rem' }}>
                Нет активных модулей
              </div>
            )}
          </div>
        </CollapsibleSection>
      </div>
    </>
  );
};

export default QuickPanel;

