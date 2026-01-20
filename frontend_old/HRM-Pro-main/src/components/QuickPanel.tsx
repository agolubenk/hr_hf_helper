import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { storage, getModuleData } from '../utils';
import { STORAGE_KEYS, MODULES } from '../constants';
import './components.css';
import { ContextMenu } from './ContextMenu';
import { Module } from '../types';
import { useActiveModule } from '../hooks/useActiveModule';
import { useContextMenu } from '../utils/useContextMenu';

const CollapsibleSection: React.FC<{ title: string; sectionId: string; children: React.ReactNode }> = ({ title, sectionId, children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const collapsedSections = storage.get(STORAGE_KEYS.COLLAPSED_SECTIONS) || {};
    if (collapsedSections[sectionId]) {
      setIsCollapsed(true);
    }
  }, [sectionId]);

  const toggleCollapse = () => {
    const collapsedSections = storage.get(STORAGE_KEYS.COLLAPSED_SECTIONS) || {};
    collapsedSections[sectionId] = !isCollapsed;
    storage.set(STORAGE_KEYS.COLLAPSED_SECTIONS, collapsedSections);
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

const QuickPanel: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const navigate = useNavigate();
  const allModules = getModuleData();
  const { favoriteModules } = state;
  const { contextMenu, closeContextMenu, handleContextMenu } = useContextMenu();
  
  const favoriteModuleObjects = allModules.filter(m => favoriteModules.includes(m.key));

  const handleModuleSelect = (module: Module) => {
    try {
      // Сначала закрываем панель
      dispatch({ type: 'SET_QUICK_PANEL', payload: false });
      
      // Затем активируем модуль
      dispatch({ type: 'SET_ACTIVE_MODULE', payload: module.key });
      
      // Навигация на системные настройки
      if (module.key === MODULES.SETTINGS) {
        setTimeout(() => {
          try {
            // Используем window.location.href для абсолютного перехода
            window.location.href = '/settings/general';
          } catch (error) {
            console.error('Ошибка навигации:', error);
          }
        }, 100);
      }
    } catch (error) {
      console.error('Ошибка в handleModuleSelect:', error);
    }
  };

  return (
    <>
      <div className={`panel-overlay ${state.quickPanelOpen ? 'show' : ''}`} onClick={() => dispatch({ type: 'SET_QUICK_PANEL', payload: false })}></div>
      <div className={`quick-panel ${state.quickPanelOpen ? 'show' : ''}`}>
        <CollapsibleSection title="Недавние" sectionId="recent">
            <div className="d-flex flex-column gap-2">
                 <a href="/#" className="action-card">
                     <div className="action-icon info"><i className="bi bi-person"></i></div>
                     <div className="action-content">
                         <div className="action-title">Иван Петров</div>
                         <div className="action-desc">Просмотрен 5 мин назад</div>
                     </div>
                 </a>
                 <a href="/#" className="action-card">
                     <div className="action-icon success"><i className="bi bi-file-text"></i></div>
                     <div className="action-content">
                         <div className="action-title">Отчет по KPI</div>
                         <div className="action-desc">Изменен час назад</div>
                     </div>
                 </a>
            </div>
        </CollapsibleSection>

        <CollapsibleSection title="Избранное" sectionId="favorites">
             <div className="d-flex flex-column gap-1">
                {favoriteModuleObjects.length > 0 ? (
                    favoriteModuleObjects.map(module => (
                        <div key={module.key} className="favorite-item" 
                           onClick={() => handleModuleSelect(module)} 
                           onContextMenu={(e) => handleContextMenu(e, module)}>
                            <i className="bi bi-star-fill text-warning"></i>
                            <span>{module.name}</span>
                        </div>
                    ))
                ) : (
                    <div className="text-muted text-center p-2" style={{ fontSize: '0.875rem' }}>Нет избранных модулей</div>
                )}
             </div>
        </CollapsibleSection>

        <CollapsibleSection title="Модули" sectionId="modules">
          <div className="quick-module-list">
            {allModules.map(module => (
              <div key={module.key} className="quick-module-item" 
                 onClick={() => handleModuleSelect(module)}
                 onContextMenu={(e) => handleContextMenu(e, module)}>
                <i className={`bi ${module.icon} quick-module-icon ${module.color}`}></i>
                <span>{module.name}</span>
              </div>
            ))}
          </div>
        </CollapsibleSection>
      </div>
      
      {contextMenu.visible && contextMenu.selectedModule && (
        <ContextMenu 
            isVisible={contextMenu.visible}
            top={contextMenu.mouseY}
            left={contextMenu.mouseX}
            onClose={closeContextMenu}
            selectedModule={contextMenu.selectedModule}
        />
      )}
    </>
  );
};

export default QuickPanel;
