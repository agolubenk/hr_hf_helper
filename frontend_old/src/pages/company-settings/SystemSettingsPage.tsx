import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import SystemGeneralSettings from './SystemGeneralSettings';
import SystemOrgStructureSettings from './SystemOrgStructureSettings';
import SystemUsersSettings from './SystemUsersSettings';
import SystemSecuritySettings from './SystemSecuritySettings';
import SystemIntegrationsSettings from './SystemIntegrationsSettings';
import SystemThemeSettings from './SystemThemeSettings';
import SystemLifecycleSettings from './SystemLifecycleSettings';
import SystemReasonsSettings from './SystemReasonsSettings';
import './SystemSettings.css';

const SystemSettingsPage: React.FC = () => {
  return (
    <div className="system-settings-page">
      <div className="settings-content">
        <Routes>
          <Route path="/" element={<Navigate to="general" replace />} />
          <Route path="general" element={<SystemGeneralSettings />} />
          <Route path="org-structure" element={<SystemOrgStructureSettings />} />
          <Route path="users" element={<SystemUsersSettings />} />
          <Route path="security" element={<SystemSecuritySettings />} />
          <Route path="integrations" element={<SystemIntegrationsSettings />} />
          <Route path="theme" element={<SystemThemeSettings />} />
          <Route path="lifecycle" element={<SystemLifecycleSettings />} />
          <Route path="reasons" element={<SystemReasonsSettings />} />
        </Routes>
      </div>
    </div>
  );
};

export default SystemSettingsPage;

