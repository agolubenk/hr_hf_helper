import React from 'react';
import './components.css';

interface StatWidgetProps {
  value: string | number;
  label: string;
  trend: {
    direction: 'up' | 'down';
    value: string;
  };
}

const StatWidget: React.FC<StatWidgetProps> = ({ value, label, trend }) => (
  <div className="stat-widget">
    <div className="stat-main">
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
    <div className="stat-trend-wrapper">
      <span className={`stat-trend ${trend.direction}`}>
        <i className={`bi bi-arrow-${trend.direction}`}></i>
        {trend.value}
      </span>
    </div>
  </div>
);

const StatWidgets: React.FC = () => {
    const stats: StatWidgetProps[] = [
        { value: 245, label: "Всего сотрудников", trend: { direction: 'up', value: "12% за месяц"}},
        { value: "89%", label: "Присутствуют сегодня", trend: { direction: 'up', value: "2% выше нормы"}},
        { value: 18, label: "Открытых вакансий", trend: { direction: 'down', value: "3 закрыто"}},
        { value: 4.8, label: "Средняя оценка", trend: { direction: 'up', value: "0.3 пункта"}},
    ];

    return (
        <div className="stat-widgets-container">
            {stats.map(stat => (
                <StatWidget key={stat.label} {...stat} />
            ))}
        </div>
    );
};

export default StatWidgets;
