import React, { useState } from 'react';
import './SystemSettings.css';
import { Integration } from './SystemIntegrationsSettings';

interface SettingsIntegrationModalProps {
  show: boolean;
  onClose: () => void;
  onSave: (integration: Integration) => void;
  integration: Integration | null;
}

const SettingsIntegrationModal: React.FC<SettingsIntegrationModalProps> = ({ show, onClose, onSave, integration }) => {
  const [showApiKey, setShowApiKey] = useState(false);

  if (!show || !integration) {
    return null;
  }

  const handleSave = () => {
    // В будущем здесь будет логика сбора данных из формы
    onSave(integration);
  }

  const renderAuthFields = () => {
    switch (integration.type) {
      case 'api':
        return (
          <div className="mb-3">
            <label htmlFor="apiKey" className="form-label">API Ключ</label>
            <div className="input-group">
              <input type={showApiKey ? 'text' : 'password'} id="apiKey" className="form-control" defaultValue="************" />
              <button className="btn btn-outline-secondary" type="button" onClick={() => setShowApiKey(!showApiKey)}>
                <i className={`bi ${showApiKey ? 'bi-eye-slash-fill' : 'bi-eye-fill'}`}></i>
              </button>
            </div>
          </div>
        );
      case 'oauth':
        return (
          <>
            <div className="mb-3">
              <label htmlFor="clientId" className="form-label">Client ID</label>
              <input type="text" id="clientId" className="form-control" defaultValue="a1b2c3d4e5f6g7h8" />
            </div>
            <div className="mb-3">
              <label htmlFor="clientSecret" className="form-label">Client Secret</label>
              <div className="input-group">
                <input type={showApiKey ? 'text' : 'password'} id="clientSecret" className="form-control" defaultValue="************" />
                <button className="btn btn-outline-secondary" type="button" onClick={() => setShowApiKey(!showApiKey)}>
                  <i className={`bi ${showApiKey ? 'bi-eye-slash-fill' : 'bi-eye-fill'}`}></i>
                </button>
              </div>
            </div>
          </>
        );
       case 'smtp':
        return (
          <>
            <div className="mb-3">
              <label htmlFor="smtpHost" className="form-label">SMTP Host</label>
              <input type="text" id="smtpHost" className="form-control" defaultValue="smtp.example.com" />
            </div>
            <div className="row">
                <div className="col-md-6 mb-3">
                    <label htmlFor="smtpPort" className="form-label">Port</label>
                    <input type="number" id="smtpPort" className="form-control" defaultValue="587" />
                </div>
                <div className="col-md-6 mb-3">
                    <label htmlFor="smtpUser" className="form-label">Username</label>
                    <input type="text" id="smtpUser" className="form-control" defaultValue="user@example.com" />
                </div>
            </div>
             <div className="mb-3">
                <label htmlFor="smtpPassword" className="form-label">Password</label>
                <div className="input-group">
                    <input type={showApiKey ? 'text' : 'password'} id="smtpPassword" className="form-control" defaultValue="************" />
                    <button className="btn btn-outline-secondary" type="button" onClick={() => setShowApiKey(!showApiKey)}>
                        <i className={`bi ${showApiKey ? 'bi-eye-slash-fill' : 'bi-eye-fill'}`}></i>
                    </button>
                </div>
            </div>
          </>
        );
      default:
        return (
            <div className="mb-3">
                <label htmlFor="webhookUrl" className="form-label">URL для Webhook</label>
                <input type="text" id="webhookUrl" className="form-control" placeholder="https://..."/>
            </div>
        );
    }
  }

  return (
    <div className="modal-backdrop-v2">
      <div className="modal-content-v2">
        <div className="modal-header-v2">
          <h5>Настройки: {integration.name}</h5>
          <button onClick={onClose} className="btn-close"></button>
        </div>
        <div className="modal-body-v2">
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="mb-3">
                <label htmlFor="integrationName" className="form-label">Название интеграции</label>
                <input type="text" id="integrationName" className="form-control" defaultValue={integration.name} />
            </div>
            {renderAuthFields()}
            <div className="form-check form-switch mb-3">
                <input className="form-check-input" type="checkbox" role="switch" id="enableSync" defaultChecked={integration.status === 'active'} />
                <label className="form-check-label" htmlFor="enableSync">Активировать интеграцию</label>
            </div>
             <div className="alert alert-secondary mt-3" role="alert">
                <small>ID интеграции: <code>{integration.id}</code></small>
            </div>
          </form>
        </div>
        <div className="modal-footer-v2">
            <button type="button" className="btn btn-light" onClick={onClose}>Отмена</button>
            <button type="button" className="btn btn-primary" onClick={handleSave}>Сохранить настройки</button>
        </div>
      </div>
    </div>
  );
};

export default SettingsIntegrationModal; 