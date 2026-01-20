import React from 'react';
import { ActionCard } from '../types';

const ActionCardItem: React.FC<ActionCard> = ({ icon, title, description, color }) => (
    <a href="/#" className="action-card">
        <div className={`action-icon ${color}`}>
            <i className={`bi ${icon}`}></i>
        </div>
        <div className="action-content">
            <div className="action-title">{title}</div>
            <div className="action-desc">{description}</div>
        </div>
        <i className="bi bi-chevron-right ms-auto"></i>
    </a>
);

const CommandCenter: React.FC = () => {
    const actionCards: ActionCard[] = [
        { icon: 'bi-person-plus', title: 'Новый сотрудник', description: 'Оформить прием на работу', color: 'primary' },
        { icon: 'bi-calendar-check', title: 'Собеседования сегодня', description: '3 кандидата ожидают', color: 'success' },
        { icon: 'bi-exclamation-triangle', title: 'Требуют внимания', description: '5 заявок на одобрение', color: 'warning' },
        { icon: 'bi-graph-up-arrow', title: 'Отчеты', description: 'Сформировать аналитику', color: 'info' },
    ];
    
    return (
        <div className="command-center">
            <h1 className="greeting">Добро пожаловать! 👋</h1>
            <p className="subtitle">Сегодня понедельник, 28 мая. Вот что происходит в компании:</p>
            <div className="action-cards">
                {actionCards.map(card => <ActionCardItem key={card.title} {...card} />)}
            </div>
        </div>
    );
};

export default CommandCenter;
