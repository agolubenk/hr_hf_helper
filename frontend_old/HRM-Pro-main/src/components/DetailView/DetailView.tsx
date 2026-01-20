import React, { useState } from 'react';
import '../components.css';

interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
}

interface Action {
  label: string;
  action: string;
  variant?: 'primary' | 'secondary' | 'danger';
}

interface DetailViewProps {
  data: any;
  tabs: Tab[];
  actions?: Action[];
  onAction?: (action: string) => void;
  onClose?: () => void;
  title?: string;
}

const DetailView: React.FC<DetailViewProps> = ({
  data,
  tabs,
  actions = [],
  onAction,
  onClose,
  title
}) => {
  const [activeTab, setActiveTab] = useState(tabs[0]?.id || '');

  const handleAction = (action: string) => {
    onAction?.(action);
  };

  return (
    <div className="detail-view">
      {/* Заголовок */}
      <div className="detail-header">
        <div className="detail-title">
          <h2>{title || 'Детальная информация'}</h2>
          {onClose && (
            <button 
              className="close-button"
              onClick={onClose}
              aria-label="Закрыть"
            >
              ×
            </button>
          )}
        </div>
        
        {/* Действия */}
        {actions.length > 0 && (
          <div className="detail-actions">
            {actions.map((action) => (
              <button
                key={action.action}
                className={`btn ${action.variant || 'secondary'}`}
                onClick={() => handleAction(action.action)}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Табы */}
      <div className="detail-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Контент таба */}
      <div className="detail-content">
        {tabs.find(tab => tab.id === activeTab)?.content}
      </div>
    </div>
  );
};

export default DetailView; 