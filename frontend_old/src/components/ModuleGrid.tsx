import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { showNotImplementedToast } from '../utils/showNotImplementedToast';
import { api } from '../utils/api';
import { getActiveModules, type Module } from '../utils/modules';

const ModuleGrid: React.FC = () => {
  const navigate = useNavigate();
  const [activeModules, setActiveModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  
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
          // Если нет настроек, показываем обязательные модули по умолчанию
          const defaultActiveKeys = ['dashboard', 'employees', 'recruiting', 'wiki', 'settings'];
          setActiveModules(getActiveModules(defaultActiveKeys));
        }
      } catch (error) {
        console.error('Failed to load active modules:', error);
        // При ошибке показываем обязательные модули
        const defaultActiveKeys = ['dashboard', 'employees', 'recruiting', 'wiki', 'settings'];
        setActiveModules(getActiveModules(defaultActiveKeys));
      } finally {
        setLoading(false);
      }
    };

    loadActiveModules();
  }, []);

  const handleModuleClick = (moduleKey: string, e: React.MouseEvent) => {
    e.preventDefault();
    
    if (moduleKey === 'settings') {
      // Навигация на страницу настроек компании
      navigate('/settings/general');
    } else {
      // Для остальных модулей показываем тост
      showNotImplementedToast();
    }
  };

  if (loading) {
    return (
      <section className="module-grid">
        <div className="text-center p-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Загрузка модулей...</span>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="module-grid">
      {activeModules.length > 0 ? (
        activeModules.map((module) => (
          <a
            key={module.key}
            href="#"
            className="module-card"
            data-module={module.key}
            onClick={(e) => handleModuleClick(module.key, e)}
          >
            <div className="module-icon-wrapper">
              <i className={`bi ${module.icon} module-icon ${module.color}`}></i>
            </div>
            <div className="module-name">{module.name}</div>
            <div className="module-count">{module.desc}</div>
          </a>
        ))
      ) : (
        <div className="text-center p-4 text-muted">
          Нет активных модулей
        </div>
      )}
    </section>
  );
};

export default ModuleGrid;

