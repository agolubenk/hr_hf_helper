import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { getModuleData } from '../utils';
import { Module } from '../types';
import { ContextMenu } from './ContextMenu';
import { MODULES } from '../constants';
import { useContextMenu } from '../utils/useContextMenu';

const ModuleCard: React.FC<{ module: Module; onContextMenu: (e: React.MouseEvent, module: Module) => void; isFavorite: boolean }> = ({ module, onContextMenu, isFavorite }) => {
    const { state, dispatch } = useAppContext();
    const navigate = useNavigate();
    
    const handleClick = (e: React.MouseEvent) => {
        try {
            e.preventDefault();
            dispatch({ type: 'SET_ACTIVE_MODULE', payload: module.key });
            
            // Навигация на системные настройки
            if (module.key === MODULES.SETTINGS) {
                setTimeout(() => {
                    try {
                        // Используем window.location.href для абсолютного перехода
                        window.location.href = '/settings/general';
                    } catch (error) {
                        console.error('Ошибка навигации в ModuleGrid:', error);
                    }
                }, 100);
            }
            
            // Навигация на страницу C&B
            if (module.key === MODULES.CB) {
                setTimeout(() => {
                    try {
                        navigate('/cb');
                    } catch (error) {
                        console.error('Ошибка навигации в ModuleGrid:', error);
                    }
                }, 100);
            }
        } catch (error) {
            console.error('Ошибка в handleClick ModuleGrid:', error);
        }
    };
    
    return (
        <div className={`module-card ${state.activeModule === module.key ? 'active' : ''}`} 
           onClick={handleClick}
           onContextMenu={(e) => onContextMenu(e, module)}>
            
            <div className="module-icon-wrapper">
                {isFavorite && <i className="bi bi-star-fill favorite-star"></i>}
                <i className={`bi ${module.icon} module-icon ${module.color}`}></i>
            </div>
            <div className="module-name">{module.name}</div>
            <div className="module-count">{module.count}</div>
        </div>
    );
};

const ModuleGrid: React.FC = () => {
    const { state } = useAppContext();
    const modules = getModuleData();
    const { favoriteModules } = state;
    const { contextMenu, closeContextMenu, handleContextMenu } = useContextMenu();

    return (
        <>
            <div className="module-grid">
                {modules.map(module => 
                    <ModuleCard 
                        key={module.key} 
                        module={module} 
                        onContextMenu={handleContextMenu} 
                        isFavorite={favoriteModules.includes(module.key)} 
                    />
                )}
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

export default ModuleGrid;
