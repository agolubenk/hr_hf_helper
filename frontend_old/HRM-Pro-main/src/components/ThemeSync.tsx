import React, { useEffect } from 'react';
import { useAppContext } from '../context/AppContext';

const ThemeSync: React.FC = () => {
    const { state, dispatch } = useAppContext();

    // Синхронизация с localStorage при загрузке
    useEffect(() => {
        const savedTheme = localStorage.getItem('hrm_theme');
        const savedLanguage = localStorage.getItem('hrm_language');
        
        if (savedTheme && savedTheme !== state.theme) {
            dispatch({ type: 'SET_THEME', payload: savedTheme as 'light' | 'dark' });
        }
        
        if (savedLanguage && savedLanguage !== state.language) {
            dispatch({ type: 'CHANGE_LANGUAGE', payload: savedLanguage as 'ru' | 'en' });
        }
    }, []);

    // Слушатель изменений в localStorage (для синхронизации между вкладками)
    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'hrm_theme' && e.newValue) {
                const newTheme = e.newValue as 'light' | 'dark';
                if (newTheme !== state.theme) {
                    dispatch({ type: 'SET_THEME', payload: newTheme });
                }
            }
            if (e.key === 'hrm_language' && e.newValue) {
                const newLanguage = e.newValue as 'ru' | 'en';
                if (newLanguage !== state.language) {
                    dispatch({ type: 'CHANGE_LANGUAGE', payload: newLanguage });
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [state.theme, state.language, dispatch]);

    return null; // Этот компонент не рендерит ничего
};

export default ThemeSync; 