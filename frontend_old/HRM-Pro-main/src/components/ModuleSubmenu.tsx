import React, { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { moduleSubmenus, MODULES } from '../constants';
import { SubmenuItem } from '../types';

const ModuleSubmenu: React.FC = () => {
    const { state } = useAppContext();
    const { activeModule } = state;
    const [activeItem, setActiveItem] = useState<string | null>(null);
    const navigate = useNavigate();
    const location = useLocation();
    
    const submenuItems = useMemo(() => {
        return activeModule && moduleSubmenus[activeModule] ? moduleSubmenus[activeModule] : [];
    }, [activeModule]);

    React.useEffect(() => {
        if (submenuItems.length > 0) {
            const defaultActive = submenuItems.find(item => item.active)?.text;
            setActiveItem(defaultActive || submenuItems[0]?.text || null);
        } else {
            setActiveItem(null);
        }
    }, [submenuItems]);

    // Определяем активный элемент на основе текущего роута для настроек
    React.useEffect(() => {
        if (activeModule === MODULES.SETTINGS && location.pathname.startsWith('/settings/')) {
            const path = location.pathname.split('/')[2]; // Получаем часть после /settings/
            const routeMap: Record<string, string> = {
                'general': 'Общие',
                'users': 'Пользователи',
                'security': 'Безопасность',
                'integrations': 'Интеграции',
                'theme': 'Внешний вид'
            };
            if (routeMap[path]) {
                setActiveItem(routeMap[path]);
            }
        }
        
        // Определяем активный элемент для модуля C&B
        if (activeModule === MODULES.CB && location.pathname.startsWith('/cb')) {
            const path = location.pathname.split('/')[2]; // Получаем часть после /cb/
            const routeMap: Record<string, string> = {
                '': 'Обзор',
                'salaries': 'Зарплаты',
                'bonuses': 'Бонусы',
                'benefits': 'Льготы',
                'calculator': 'Калькулятор',
                'grades': 'Грейды',
                'market-analytics': 'Аналитика рынка'
            };
            if (routeMap[path]) {
                setActiveItem(routeMap[path]);
            }
        }
    }, [activeModule, location.pathname]);
    
    const isVisible = activeModule && submenuItems.length > 0;

    const handleItemClick = (item: SubmenuItem) => {
        setActiveItem(item.text);
        
        // Навигация для настроек
        if (activeModule === MODULES.SETTINGS) {
            const routeMap: Record<string, string> = {
                'Общие': 'general',
                'Пользователи': 'users',
                'Безопасность': 'security',
                'Интеграции': 'integrations',
                'Внешний вид': 'theme'
            };
            const route = routeMap[item.text];
            if (route) {
                // Используем window.location.href для абсолютного перехода
                window.location.href = `/settings/${route}`;
            }
        }
        
        // Навигация для модуля C&B
        if (activeModule === MODULES.CB) {
            const routeMap: Record<string, string> = {
                'Обзор': '/cb',
                'Зарплаты': '/cb/salaries',
                'Бонусы': '/cb/bonuses',
                'Льготы': '/cb/benefits',
                'Калькулятор': '/cb/calculator',
                'Грейды': '/cb/grades',
                'Аналитика рынка': '/cb/market-analytics'
            };
            const route = routeMap[item.text];
            if (route) {
                navigate(route);
            }
        }
    };

    return (
        <div className={`module-submenu ${isVisible ? 'show' : ''}`}>
            <div className="submenu-items">
                {submenuItems.map((item: SubmenuItem) => (
                    <div key={item.text} 
                       className={`submenu-item ${activeItem === item.text ? 'active' : ''}`}
                       onClick={() => handleItemClick(item)}>
                        <i className={`bi ${item.icon}`}></i>
                        <span>{item.text}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ModuleSubmenu;
