import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { MODULES } from '../../constants';
import SystemGeneralSettings from './SystemGeneralSettings';
import SystemUsersSettings from './SystemUsersSettings';
import SystemSecuritySettings from './SystemSecuritySettings';
import SystemIntegrationsSettings from './SystemIntegrationsSettings';
import SystemThemeSettings from './SystemThemeSettings';
import './SystemSettings.css';

const SystemSettingsPage: React.FC = () => {
    const { dispatch } = useAppContext();

    useEffect(() => {
        // Активируем модуль settings при загрузке страницы
        dispatch({ type: 'SET_ACTIVE_MODULE', payload: MODULES.SETTINGS });
    }, [dispatch]);

    return (
        <div className="system-settings-page">
            <div className="settings-content">
                <Routes>
                    <Route path="/" element={<Navigate to="general" replace />} />
                    <Route path="general" element={<SystemGeneralSettings />} />
                    <Route path="users" element={<SystemUsersSettings />} />
                    <Route path="security" element={<SystemSecuritySettings />} />
                    <Route path="integrations" element={<SystemIntegrationsSettings />} />
                    <Route path="theme" element={<SystemThemeSettings />} />
                </Routes>
            </div>
        </div>
    );
};

export default SystemSettingsPage; 