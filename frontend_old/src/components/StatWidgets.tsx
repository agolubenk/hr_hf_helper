interface StatWidget {
  value: string;
  label: string;
  trend: {
    direction: 'up' | 'down';
    text: string;
  };
}

const StatWidgets: React.FC = () => {
  const stats: StatWidget[] = [
    { value: '245', label: 'Всего сотрудников', trend: { direction: 'up', text: '12% за месяц' } },
    { value: '89%', label: 'Присутствуют сегодня', trend: { direction: 'up', text: '2% выше нормы' } },
    { value: '18', label: 'Открытых вакансий', trend: { direction: 'down', text: '3 закрыто' } },
    { value: '4.8', label: 'Средняя оценка', trend: { direction: 'up', text: '0.3 пункта' } },
  ];

  return (
    <section className="stat-widgets-container">
      {stats.map((stat, index) => (
        <div key={index} className="stat-widget">
          <div className="stat-main">
            <div className="stat-value">{stat.value}</div>
            <div className="stat-label">{stat.label}</div>
          </div>
          <div className="stat-trend-wrapper">
            <span className={`stat-trend ${stat.trend.direction}`}>
              <i className={`bi bi-arrow-${stat.trend.direction}`}></i>
              {stat.trend.text}
            </span>
          </div>
        </div>
      ))}
    </section>
  );
};

export default StatWidgets;

