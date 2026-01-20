import React, { useState, useMemo } from 'react';
import './SystemSettings.css';
import type { Integration } from './types';
import { toastInfo } from '../../utils/toastHelper';

interface AddIntegrationModalProps {
  show: boolean;
  onClose: () => void;
  onAdd: (integration: Integration) => void;
  availableIntegrations: Integration[];
}

// Примеры доступных интеграций
const availableIntegrationsExamples: Omit<Integration, 'id' | 'status' | 'lastSync'>[] = [
    // Банки и финансовые
    { name: 'НБРБ', description: 'Национальный банк Республики Беларусь', icon: 'bi-bank', category: 'Banking', type: 'api' },
    { name: 'ЦБР', description: 'Центральный банк России', icon: 'bi-bank', category: 'Banking', type: 'api' },
    { name: 'Банк ЕС', description: 'Евразийский банк развития', icon: 'bi-bank', category: 'Banking', type: 'api' },
    // Системы
    { name: 'Notion', description: 'Рабочее пространство и управление проектами', icon: 'bi-file-earmark-text', category: 'Productivity', type: 'api' },
    { name: 'ClickUp', description: 'Управление задачами и проектами', icon: 'bi-check2-square', category: 'Productivity', type: 'api' },
    { name: 'Huntflow', description: 'Система подбора персонала', icon: 'bi-briefcase-fill', category: 'Recruiting', type: 'api' },
    { name: 'hh.ru', description: 'HeadHunter - поиск и подбор кандидатов', icon: 'bi-person-badge', category: 'Recruiting', type: 'api' },
    // AI
    { name: 'OpenAI', description: 'Искусственный интеллект для автоматизации', icon: 'bi-cpu-fill', category: 'AI', type: 'api' },
    { name: 'Gemini AI', description: 'Google Gemini - AI помощник', icon: 'bi-robot', category: 'AI', type: 'api' },
    { name: 'Cloud Sonet', description: 'AI платформа для бизнеса', icon: 'bi-cloud-fill', category: 'AI', type: 'api' },
    { name: 'Perplexity', description: 'AI поисковая система и ассистент', icon: 'bi-search-heart', category: 'AI', type: 'api' },
];

const AddIntegrationModal: React.FC<AddIntegrationModalProps> = ({ show, onClose, onAdd, availableIntegrations }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Объединяем примеры и доступные интеграции
  const allAvailable = useMemo(() => {
    const examples = availableIntegrationsExamples.map((item, index) => ({
      ...item,
      id: `example-${index}`,
      status: 'inactive' as const,
    }));
    return [...examples, ...availableIntegrations];
  }, [availableIntegrations]);

  const categories = useMemo(() => {
    return ['All', ...Array.from(new Set(allAvailable.map(i => i.category)))];
  }, [allAvailable]);

  const filteredMarketplace = useMemo(() => {
    return allAvailable
      .filter(i => categoryFilter === 'All' || i.category === categoryFilter)
      .filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [allAvailable, categoryFilter, searchTerm]);

  const handleCreateCustom = () => {
    toastInfo('Создание собственного приложения (функция в разработке)', 'Информация');
    // TODO: Реализовать создание собственного приложения
  };

  if (!show) {
    return null;
  }

  return (
    <div className="modal-backdrop-v2" onClick={onClose}>
      <div className="modal-content-v2" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-v2">
          <h5>Добавить новую интеграцию</h5>
          <button onClick={onClose} className="btn-close"></button>
        </div>
        <div className="modal-body-v2">
          <div className="marketplace-filters">
            <input 
              type="text" 
              placeholder="Поиск в маркетплейсе..." 
              className="form-control mb-3"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="category-filters">
              {categories.map(cat => (
                <button
                  key={cat}
                  className={`category-filter-btn ${categoryFilter === cat ? 'active' : ''}`}
                  onClick={() => setCategoryFilter(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <div className="marketplace-grid">
            {/* Карточка "Создать свое приложение" */}
            <div className="marketplace-card create-custom-app-card" onClick={handleCreateCustom}>
              <div className="marketplace-card-header">
                <i className="bi bi-tools"></i>
                <h6>Создать свое приложение</h6>
              </div>
              <p>Настройте собственную интеграцию с уникальными параметрами подключения</p>
              <button className="btn btn-sm btn-outline-primary w-100" onClick={(e) => { e.stopPropagation(); handleCreateCustom(); }}>
                <i className="bi bi-plus-lg me-1"></i>
                Создать
              </button>
            </div>

            {filteredMarketplace.map(integ => (
              <div key={integ.id} className="marketplace-card">
                <div className="marketplace-card-header">
                  <i className={`bi ${integ.icon}`}></i>
                  <h6>{integ.name}</h6>
                </div>
                <p>{integ.description}</p>
                <button className="btn btn-sm btn-outline-primary w-100" onClick={() => onAdd(integ)}>
                  <i className="bi bi-plus-lg me-1"></i>
                  Добавить
                </button>
              </div>
            ))}
            {filteredMarketplace.length === 0 && (
                <div className="marketplace-empty">
                    <p>Ничего не найдено. Попробуйте изменить запрос.</p>
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddIntegrationModal;

