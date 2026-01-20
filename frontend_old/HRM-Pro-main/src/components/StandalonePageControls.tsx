import React from 'react';
import { useAppContext } from '../context/AppContext';
import LanguageSwitcher from './LanguageSwitcher';
import './components.css';

const StandalonePageControls: React.FC = () => {
    const { state, dispatch } = useAppContext();

    const handleThemeToggle = () => {
        dispatch({ type: 'TOGGLE_THEME' });
    };

    return (
        <div className="standalone-controls">
            <LanguageSwitcher />
            <button className="standalone-btn" onClick={handleThemeToggle}>
                <i className={`bi ${state.theme === 'light' ? 'bi-sun-fill' : 'bi-moon-fill'}`}></i>
            </button>
        </div>
    );
};

export default StandalonePageControls; 