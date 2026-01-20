import React, { useRef, useLayoutEffect, useEffect, useState } from 'react';
import './components.css';
import { useAppContext } from '../context/AppContext';
import { Module } from '../types';

interface ContextMenuItem {
    label: string;
    icon: string;
    action: () => void;
    isDestructive?: boolean;
}

interface ContextMenuProps {
    isVisible: boolean;
    top: number;
    left: number;
    onClose: () => void;
    selectedModule?: Module;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({ isVisible, top, left, onClose, selectedModule }) => {
    const { state, dispatch, addToast } = useAppContext();
    const { favoriteModules, tasks, pinnedTasks } = state;
    const ref = useRef<HTMLDivElement>(null);
    const [coords, setCoords] = useState({ top, left });

    // Корректируем позицию после рендера
    useLayoutEffect(() => {
        if (!isVisible || !ref.current) return;
        const menu = ref.current;
        const rect = menu.getBoundingClientRect();
        let newTop = top;
        let newLeft = left;
        const padding = 8;
        // Если меню выходит за правую границу
        if (rect.right > window.innerWidth - padding) {
            newLeft = Math.max(padding, window.innerWidth - rect.width - padding);
        }
        // Если меню выходит за нижнюю границу
        if (rect.bottom > window.innerHeight - padding) {
            newTop = Math.max(padding, window.innerHeight - rect.height - padding);
        }
        // Если меню выходит за левую границу
        if (rect.left < padding) {
            newLeft = padding;
        }
        // Если меню выходит за верхнюю границу
        if (rect.top < padding) {
            newTop = padding;
        }
        setCoords({ top: newTop, left: newLeft });
    }, [isVisible, top, left]);

    // Закрытие по клику вне
    useEffect(() => {
        if (!isVisible) return;
        const handleClick = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [isVisible, onClose]);

    // Закрытие по Escape
    useEffect(() => {
        if (!isVisible) return;
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [isVisible, onClose]);

    // Закрытие по скроллу/resize
    useEffect(() => {
        if (!isVisible) return;
        const handle = () => onClose();
        window.addEventListener('scroll', handle, { passive: true });
        window.addEventListener('resize', handle, { passive: true });
        return () => {
            window.removeEventListener('scroll', handle);
            window.removeEventListener('resize', handle);
        };
    }, [isVisible, onClose]);

    if (!isVisible || !selectedModule) return null;

    const handleToggleFavorite = (moduleKey: string) => {
        dispatch({ type: 'TOGGLE_FAVORITE_MODULE', payload: moduleKey });
        onClose();
    };
    const handlePinModule = (module: Module) => {
        // Проверка на дублирование по тексту задачи типа 'Модуль: ...'
        const alreadyPinned = tasks.some(
            (t: { text: string; id: number }) => t.text === `Модуль: ${module.name}` && pinnedTasks.includes(t.id)
        );
        if (alreadyPinned) {
            addToast('Этот модуль уже закреплен в трее', { type: 'info', title: 'Уже закреплено' });
            onClose();
            return;
        }
        dispatch({ type: 'PIN_MODULE_AS_TASK', payload: module.name });
        onClose();
    };
    const isFavorite = favoriteModules.includes(selectedModule.key);

    return (
        <div
            ref={ref}
            className="context-menu"
            style={{
                position: 'fixed',
                top: coords.top,
                left: coords.left,
                zIndex: 2000,
                minWidth: 200,
            }}
        >
            <a href="/#" className="context-menu-item" onClick={(e) => { e.preventDefault(); handleToggleFavorite(selectedModule.key); }}>
                <i className={`bi ${isFavorite ? 'bi-star-fill' : 'bi-star'}`}></i>
                <span>{isFavorite ? 'Убрать из избранного' : 'Добавить в избранное'}</span>
            </a>
            <a href="/" target="_blank" rel="noopener noreferrer" className="context-menu-item" onClick={onClose}>
                <i className="bi bi-box-arrow-up-right"></i>
                <span>Открыть в новой вкладке</span>
            </a>
            <div className="context-menu-divider"></div>
            <a href="/#" className="context-menu-item" onClick={(e) => { e.preventDefault(); handlePinModule(selectedModule); }}>
                <i className="bi bi-pin-angle"></i>
                <span>Закрепить внизу</span>
            </a>
        </div>
    );
};

export default ContextMenu; 