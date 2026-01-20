import React from 'react';
import '../components.css';

interface BulkAction {
  label: string;
  action: string;
  variant?: 'primary' | 'secondary' | 'danger';
  icon?: string;
}

interface BulkActionsProps {
  actions: BulkAction[];
  selectedCount: number;
  onAction: (action: string) => void;
  onSelectAll?: () => void;
  onClearSelection?: () => void;
  totalCount?: number;
}

const BulkActions: React.FC<BulkActionsProps> = ({
  actions,
  selectedCount,
  onAction,
  onSelectAll,
  onClearSelection,
  totalCount
}) => {
  if (selectedCount === 0) {
    return null;
  }

  return (
    <div className="bulk-actions-container">
      <div className="bulk-info">
        <span className="selected-count">
          Выбрано: {selectedCount}
          {totalCount && ` из ${totalCount}`}
        </span>
        
        <div className="selection-controls">
          {onSelectAll && (
            <button 
              className="btn btn-sm btn-link"
              onClick={onSelectAll}
            >
              Выбрать все
            </button>
          )}
          
          {onClearSelection && (
            <button 
              className="btn btn-sm btn-link"
              onClick={onClearSelection}
            >
              Снять выделение
            </button>
          )}
        </div>
      </div>

      <div className="bulk-actions-list">
        {actions.map((action) => (
          <button
            key={action.action}
            className={`btn btn-sm ${action.variant || 'secondary'}`}
            onClick={() => onAction(action.action)}
            title={action.label}
          >
            {action.icon && <span className="action-icon">{action.icon}</span>}
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default BulkActions; 