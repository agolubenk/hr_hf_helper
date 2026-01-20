import React, { useState } from 'react';
import './../CBPage.css'; // Общие стили для C&B
import './MarketAnalyticsPage.css';

interface MarketData {
  id: string;
  position: string;
  location: string;
  country: string;
  city: string;
  companyMedian: number;
  marketMedian: number;
  marketMin: number;
  marketMax: number;
  percentile25: number;
  percentile75: number;
  dataPoints: number;
  lastUpdated: string;
  trend: 'up' | 'down' | 'stable';
  changePercent: number;
  grade: string;
  specialization: string;
}

interface BenchmarkData {
  id: string;
  company: string;
  position: string;
  location: string;
  country: string;
  city: string;
  salary: number;
  benefits: string[];
  source: string;
  date: string;
  grade: string;
  specialization: string;
}

interface ExternalVacancy {
  id: string;
  title: string;
  company: string;
  location: string;
  country: string;
  city: string;
  salary: {
    min: number;
    max: number;
    currency: string;
  };
  requirements: string[];
  benefits: string[];
  source: string;
  postedDate: string;
  grade: string;
  specialization: string;
}

interface ConversionMatrix {
  fromLocation: string;
  toLocation: string;
  coefficient: number;
  lastUpdated: string;
  dataPoints: number;
}

const MarketAnalyticsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCountry, setFilterCountry] = useState('all');
  const [filterCity, setFilterCity] = useState('all');
  const [filterGrade, setFilterGrade] = useState('all');
  const [selectedTimeframe, setSelectedTimeframe] = useState('3m');
  const [activeTab, setActiveTab] = useState<'market' | 'benchmarks' | 'vacancies' | 'conversion'>('market');
  const [showDetailedAnalytics, setShowDetailedAnalytics] = useState(false);

  // Моковые данные аналитики рынка
  const marketData: MarketData[] = [
    {
      id: '1',
      position: 'Frontend Developer',
      location: 'Москва',
      country: 'Россия',
      city: 'Москва',
      companyMedian: 180000,
      marketMedian: 190000,
      marketMin: 120000,
      marketMax: 350000,
      percentile25: 150000,
      percentile75: 250000,
      dataPoints: 245,
      lastUpdated: '2024-06-01',
      trend: 'up',
      changePercent: 5.2,
      grade: 'Middle',
      specialization: 'Frontend'
    },
    {
      id: '2',
      position: 'Backend Developer',
      location: 'Санкт-Петербург',
      country: 'Россия',
      city: 'Санкт-Петербург',
      companyMedian: 200000,
      marketMedian: 210000,
      marketMin: 140000,
      marketMax: 400000,
      percentile25: 170000,
      percentile75: 280000,
      dataPoints: 189,
      lastUpdated: '2024-06-01',
      trend: 'up',
      changePercent: 3.8,
      grade: 'Senior',
      specialization: 'Backend'
    },
    {
      id: '3',
      position: 'Product Manager',
      location: 'Минск',
      country: 'Беларусь',
      city: 'Минск',
      companyMedian: 250000,
      marketMedian: 270000,
      marketMin: 180000,
      marketMax: 500000,
      percentile25: 220000,
      percentile75: 350000,
      dataPoints: 156,
      lastUpdated: '2024-06-01',
      trend: 'stable',
      changePercent: 0.5,
      grade: 'Senior',
      specialization: 'Product'
    },
    {
      id: '4',
      position: 'HR Manager',
      location: 'Казань',
      country: 'Россия',
      city: 'Казань',
      companyMedian: 120000,
      marketMedian: 110000,
      marketMin: 80000,
      marketMax: 200000,
      percentile25: 95000,
      percentile75: 150000,
      dataPoints: 98,
      lastUpdated: '2024-06-01',
      trend: 'down',
      changePercent: -2.1,
      grade: 'Middle',
      specialization: 'HR'
    },
    {
      id: '5',
      position: 'Data Scientist',
      location: 'Алматы',
      country: 'Казахстан',
      city: 'Алматы',
      companyMedian: 220000,
      marketMedian: 240000,
      marketMin: 160000,
      marketMax: 450000,
      percentile25: 200000,
      percentile75: 320000,
      dataPoints: 134,
      lastUpdated: '2024-06-01',
      trend: 'up',
      changePercent: 7.2,
      grade: 'Senior',
      specialization: 'Data Science'
    }
  ];

  // Моковые данные бенчмарков
  const benchmarkData: BenchmarkData[] = [
    {
      id: '1',
      company: 'Яндекс',
      position: 'Frontend Developer',
      location: 'Москва',
      country: 'Россия',
      city: 'Москва',
      salary: 220000,
      benefits: ['ДМС', 'Спорт', 'Обучение'],
      source: 'hh.ru',
      date: '2024-05-28',
      grade: 'Middle',
      specialization: 'Frontend'
    },
    {
      id: '2',
      company: 'VK',
      position: 'Backend Developer',
      location: 'Санкт-Петербург',
      country: 'Россия',
      city: 'Санкт-Петербург',
      salary: 240000,
      benefits: ['ДМС', 'Спорт', 'Столовая'],
      source: 'linkedin.com',
      date: '2024-05-29',
      grade: 'Senior',
      specialization: 'Backend'
    },
    {
      id: '3',
      company: 'EPAM',
      position: 'Product Manager',
      location: 'Минск',
      country: 'Беларусь',
      city: 'Минск',
      salary: 300000,
      benefits: ['ДМС', 'Спорт', 'Обучение', 'Ипотека'],
      source: 'rabota.ru',
      date: '2024-05-30',
      grade: 'Senior',
      specialization: 'Product'
    },
    {
      id: '4',
      company: 'Тинькофф',
      position: 'HR Manager',
      location: 'Москва',
      country: 'Россия',
      city: 'Москва',
      salary: 180000,
      benefits: ['ДМС', 'Спорт', 'Обучение'],
      source: 'superjob.ru',
      date: '2024-05-31',
      grade: 'Middle',
      specialization: 'HR'
    }
  ];

  // Моковые данные внешних вакансий
  const externalVacancies: ExternalVacancy[] = [
    {
      id: '1',
      title: 'Senior Frontend Developer',
      company: 'Google',
      location: 'Москва',
      country: 'Россия',
      city: 'Москва',
      salary: {
        min: 300000,
        max: 500000,
        currency: 'RUB'
      },
      requirements: ['React', 'TypeScript', '5+ лет опыта'],
      benefits: ['ДМС', 'Спорт', 'Обучение', 'Сток-опционы'],
      source: 'hh.ru',
      postedDate: '2024-05-25',
      grade: 'Senior',
      specialization: 'Frontend'
    },
    {
      id: '2',
      title: 'Lead Backend Engineer',
      company: 'Microsoft',
      location: 'Санкт-Петербург',
      country: 'Россия',
      city: 'Санкт-Петербург',
      salary: {
        min: 400000,
        max: 600000,
        currency: 'RUB'
      },
      requirements: ['Java', 'Spring', 'Microservices', '7+ лет опыта'],
      benefits: ['ДМС', 'Спорт', 'Обучение', 'Сток-опционы'],
      source: 'linkedin.com',
      postedDate: '2024-05-26',
      grade: 'Lead',
      specialization: 'Backend'
    },
    {
      id: '3',
      title: 'Product Manager',
      company: 'Apple',
      location: 'Минск',
      country: 'Беларусь',
      city: 'Минск',
      salary: {
        min: 250000,
        max: 400000,
        currency: 'RUB'
      },
      requirements: ['Product Management', 'Analytics', '3+ лет опыта'],
      benefits: ['ДМС', 'Спорт', 'Обучение'],
      source: 'rabota.ru',
      postedDate: '2024-05-27',
      grade: 'Middle',
      specialization: 'Product'
    }
  ];

  // Матрица коэффициентов пересчета
  const conversionMatrix: ConversionMatrix[] = [
    { fromLocation: 'Москва', toLocation: 'Минск', coefficient: 0.69, lastUpdated: '2024-06-01', dataPoints: 156 },
    { fromLocation: 'Москва', toLocation: 'Санкт-Петербург', coefficient: 0.85, lastUpdated: '2024-06-01', dataPoints: 234 },
    { fromLocation: 'Москва', toLocation: 'Казань', coefficient: 0.65, lastUpdated: '2024-06-01', dataPoints: 89 },
    { fromLocation: 'Москва', toLocation: 'Алматы', coefficient: 0.72, lastUpdated: '2024-06-01', dataPoints: 67 },
    { fromLocation: 'Санкт-Петербург', toLocation: 'Минск', coefficient: 0.81, lastUpdated: '2024-06-01', dataPoints: 123 },
    { fromLocation: 'Санкт-Петербург', toLocation: 'Казань', coefficient: 0.76, lastUpdated: '2024-06-01', dataPoints: 78 },
    { fromLocation: 'Минск', toLocation: 'Алматы', coefficient: 1.04, lastUpdated: '2024-06-01', dataPoints: 45 }
  ];

  const countries = ['Россия', 'Беларусь', 'Казахстан', 'Украина', 'Узбекистан'];
  const cities = ['Москва', 'Санкт-Петербург', 'Казань', 'Екатеринбург', 'Новосибирск', 'Минск', 'Алматы', 'Киев', 'Ташкент'];
  const locations = ['Москва', 'Санкт-Петербург', 'Казань', 'Екатеринбург', 'Новосибирск', 'Минск', 'Алматы', 'Киев', 'Ташкент'];
  const positions = ['Frontend Developer', 'Backend Developer', 'Product Manager', 'HR Manager', 'Designer', 'Analyst', 'Data Scientist'];
  const grades = ['Junior', 'Middle', 'Senior', 'Lead', 'Head'];
  const specializations = ['Frontend', 'Backend', 'Product', 'HR', 'Design', 'Analytics', 'Data Science', 'DevOps', 'QA'];

  // Фильтрация данных
  const filteredMarketData = marketData.filter(data => {
    const matchesSearch = data.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         data.specialization.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCountry = filterCountry === 'all' || data.country === filterCountry;
    const matchesCity = filterCity === 'all' || data.city === filterCity;
    const matchesGrade = filterGrade === 'all' || data.grade === filterGrade;
    return matchesSearch && matchesCountry && matchesCity && matchesGrade;
  });

  const filteredBenchmarkData = benchmarkData.filter(data => {
    const matchesSearch = data.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         data.specialization.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCountry = filterCountry === 'all' || data.country === filterCountry;
    const matchesCity = filterCity === 'all' || data.city === filterCity;
    const matchesGrade = filterGrade === 'all' || data.grade === filterGrade;
    return matchesSearch && matchesCountry && matchesCity && matchesGrade;
  });

  const filteredVacancies = externalVacancies.filter(vacancy => {
    const matchesSearch = vacancy.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vacancy.specialization.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCountry = filterCountry === 'all' || vacancy.country === filterCountry;
    const matchesCity = filterCity === 'all' || vacancy.city === filterCity;
    const matchesGrade = filterGrade === 'all' || vacancy.grade === filterGrade;
    return matchesSearch && matchesCountry && matchesCity && matchesGrade;
  });

  const formatCurrency = (amount: number, currency: string = 'RUB') => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getTrendIcon = (trend: string) => {
    switch(trend) {
      case 'up': return <i className="bi bi-arrow-up-right text-success"></i>;
      case 'down': return <i className="bi bi-arrow-down-right text-danger"></i>;
      case 'stable': return <i className="bi bi-dash text-muted"></i>;
      default: return <i className="bi bi-dash text-muted"></i>;
    }
  };

  const getTrendBadge = (trend: string, changePercent: number) => {
    const isPositive = changePercent > 0;
    const isNegative = changePercent < 0;
    
    if (isPositive) {
      return <span className="badge bg-success-subtle text-success">+{changePercent}%</span>;
    } else if (isNegative) {
      return <span className="badge bg-danger-subtle text-danger">{changePercent}%</span>;
    } else {
      return <span className="badge bg-secondary-subtle text-secondary">{changePercent}%</span>;
    }
  };

  const totalPositions = filteredMarketData.length;
  const averageMarketMedian = filteredMarketData.length > 0 
    ? filteredMarketData.reduce((sum, data) => sum + data.marketMedian, 0) / filteredMarketData.length 
    : 0;
  const competitivePositions = filteredMarketData.filter(data => data.companyMedian >= data.marketMedian).length;

  return (
    <div className="content-area">
      {/* KPI/SLA мини-карточки */}
      <div className="card-grid">
        <div className="card-grid-item-4">
          <div className="card kpi-card border-primary h-100">
            <div className="card-body text-center d-flex flex-column">
              <div className="kpi-icon-wrapper primary">
                <i className="bi bi-graph-up-arrow"></i>
              </div>
              <div className="fw-semibold text-muted mb-1">Позиций отслеживается</div>
              <div className="fs-2 fw-bold text-primary mb-2">{totalPositions}</div>
              <small className="text-muted mb-3">Активных</small>
              <button className="btn btn-outline-primary btn-sm w-100 mt-auto">
                <i className="bi bi-arrow-right me-1"></i>
                Перейти
              </button>
            </div>
          </div>
        </div>
        <div className="card-grid-item-4">
          <div className="card kpi-card border-success h-100">
            <div className="card-body text-center d-flex flex-column">
              <div className="kpi-icon-wrapper success">
                <i className="bi bi-cash-stack"></i>
              </div>
              <div className="fw-semibold text-muted mb-1">Средняя рыночная ЗП</div>
              <div className="fs-2 fw-bold text-success mb-2">{formatCurrency(averageMarketMedian)}</div>
              <small className="text-muted mb-3">По отслеживаемым позициям</small>
              <button className="btn btn-outline-success btn-sm w-100 mt-auto">
                <i className="bi bi-arrow-right me-1"></i>
                Перейти
              </button>
            </div>
          </div>
        </div>
        <div className="card-grid-item-4">
          <div className="card kpi-card border-info h-100">
            <div className="card-body text-center d-flex flex-column">
              <div className="kpi-icon-wrapper info">
                <i className="bi bi-trophy"></i>
              </div>
              <div className="fw-semibold text-muted mb-1">Конкурентные позиции</div>
              <div className="fs-2 fw-bold text-info mb-2">{competitivePositions}</div>
              <small className="text-muted mb-3">Выше рынка</small>
              <button className="btn btn-outline-info btn-sm w-100 mt-auto">
                <i className="bi bi-arrow-right me-1"></i>
                Перейти
              </button>
            </div>
          </div>
        </div>
        <div className="card-grid-item-4">
          <div className="card kpi-card border-warning h-100">
            <div className="card-body text-center d-flex flex-column">
              <div className="kpi-icon-wrapper warning">
                <i className="bi bi-clock-history"></i>
              </div>
              <div className="fw-semibold text-muted mb-1">Обновлено</div>
              <div className="fs-2 fw-bold text-warning mb-2">Сегодня</div>
              <small className="text-muted mb-3">Последние данные</small>
              <button className="btn btn-outline-warning btn-sm w-100 mt-auto">
                <i className="bi bi-arrow-right me-1"></i>
                Обновить
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Расширенные фильтры и поиск */}
      <div className="card content-card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-3">
              <input
                type="text"
                className="form-control"
                placeholder="Поиск по позиции..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="col-md-2">
              <select
                className="form-select"
                value={filterCountry}
                onChange={(e) => setFilterCountry(e.target.value)}
              >
                <option value="all">Все страны</option>
                {countries.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>
            <div className="col-md-2">
              <select
                className="form-select"
                value={filterCity}
                onChange={(e) => setFilterCity(e.target.value)}
              >
                <option value="all">Все города</option>
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
            <div className="col-md-2">
              <select
                className="form-select"
                value={filterGrade}
                onChange={(e) => setFilterGrade(e.target.value)}
              >
                <option value="all">Все грейды</option>
                {grades.map(grade => (
                  <option key={grade} value={grade}>{grade}</option>
                ))}
              </select>
            </div>
            <div className="col-md-1">
              <select
                className="form-select"
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value)}
              >
                <option value="1m">1м</option>
                <option value="3m">3м</option>
                <option value="6m">6м</option>
                <option value="1y">1г</option>
              </select>
            </div>
          </div>
          <div className="row g-3 mt-2">
            <div className="col-md-6">
              <div className="d-flex gap-2">
                <button 
                  className="btn btn-outline-primary btn-sm"
                  onClick={() => setShowDetailedAnalytics(true)}
                >
                  <i className="bi bi-graph-up me-1"></i>
                  Подробная аналитика
                </button>
                <button className="btn btn-outline-success btn-sm">
                  <i className="bi bi-download me-1"></i>
                  Экспорт данных
                </button>
                <button className="btn btn-outline-info btn-sm">
                  <i className="bi bi-gear me-1"></i>
                  Настройки
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Табы для переключения между таблицами */}
      <div className="card content-card mb-4">
        <div className="card-header">
          <ul className="nav nav-tabs card-header-tabs">
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'market' ? 'active' : ''}`}
                onClick={() => setActiveTab('market')}
              >
                <i className="bi bi-graph-up-arrow me-1"></i>
                Аналитика рынка
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'benchmarks' ? 'active' : ''}`}
                onClick={() => setActiveTab('benchmarks')}
              >
                <i className="bi bi-building me-1"></i>
                Бенчмарки
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'vacancies' ? 'active' : ''}`}
                onClick={() => setActiveTab('vacancies')}
              >
                <i className="bi bi-briefcase me-1"></i>
                Внешние вакансии
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'conversion' ? 'active' : ''}`}
                onClick={() => setActiveTab('conversion')}
              >
                <i className="bi bi-arrow-left-right me-1"></i>
                Коэффициенты
              </button>
            </li>
          </ul>
        </div>
        <div className="card-body p-0">
          {/* Таблица аналитики рынка */}
          {activeTab === 'market' && (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead>
                  <tr>
                    <th>Позиция</th>
                    <th>Локация</th>
                    <th>Страна</th>
                    <th>Грейд</th>
                    <th>Наша медиана</th>
                    <th>Рыночная медиана</th>
                    <th>Диапазон рынка</th>
                    <th>Тренд</th>
                    <th>Изменение</th>
                    <th>Данных</th>
                    <th>Обновлено</th>
                    <th>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMarketData.map(data => (
                    <tr key={data.id} className="animated-row">
                      <td>
                        <div className="fw-semibold">{data.position}</div>
                        <small className="text-muted">{data.specialization}</small>
                      </td>
                      <td>
                        <span className="badge bg-primary-subtle text-primary">{data.location}</span>
                      </td>
                      <td>
                        <span className="text-muted">{data.country}</span>
                      </td>
                      <td>
                        <span className="badge bg-info-subtle text-info">{data.grade}</span>
                      </td>
                      <td>
                        <span className="fw-bold text-primary">{formatCurrency(data.companyMedian)}</span>
                      </td>
                      <td>
                        <span className="fw-semibold">{formatCurrency(data.marketMedian)}</span>
                      </td>
                      <td>
                        <div className="small">
                          <div>{formatCurrency(data.marketMin)} - {formatCurrency(data.marketMax)}</div>
                          <div className="text-muted">25-75%: {formatCurrency(data.percentile25)} - {formatCurrency(data.percentile75)}</div>
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          {getTrendIcon(data.trend)}
                        </div>
                      </td>
                      <td>
                        {getTrendBadge(data.trend, data.changePercent)}
                      </td>
                      <td>
                        <span className="badge bg-info-subtle text-info">{data.dataPoints}</span>
                      </td>
                      <td>
                        <span className="text-muted">{new Date(data.lastUpdated).toLocaleDateString('ru-RU')}</span>
                      </td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <button className="btn btn-outline-primary" title="Детали">
                            <i className="bi bi-eye"></i>
                          </button>
                          <button className="btn btn-outline-success" title="Экспорт">
                            <i className="bi bi-download"></i>
                          </button>
                          <button className="btn btn-outline-warning" title="Редактировать">
                            <i className="bi bi-pencil"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Таблица бенчмарков */}
          {activeTab === 'benchmarks' && (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead>
                  <tr>
                    <th>Компания</th>
                    <th>Позиция</th>
                    <th>Локация</th>
                    <th>Страна</th>
                    <th>Грейд</th>
                    <th>Зарплата</th>
                    <th>Льготы</th>
                    <th>Источник</th>
                    <th>Дата</th>
                    <th>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBenchmarkData.map(benchmark => (
                    <tr key={benchmark.id} className="animated-row">
                      <td>
                        <div className="fw-semibold">{benchmark.company}</div>
                      </td>
                      <td>
                        <div>
                          <span className="text-muted">{benchmark.position}</span>
                          <br />
                          <small className="text-muted">{benchmark.specialization}</small>
                        </div>
                      </td>
                      <td>
                        <span className="badge bg-secondary-subtle text-secondary">{benchmark.location}</span>
                      </td>
                      <td>
                        <span className="text-muted">{benchmark.country}</span>
                      </td>
                      <td>
                        <span className="badge bg-info-subtle text-info">{benchmark.grade}</span>
                      </td>
                      <td>
                        <span className="fw-bold text-success">{formatCurrency(benchmark.salary)}</span>
                      </td>
                      <td>
                        <div className="small">
                          {benchmark.benefits.map((benefit, index) => (
                            <span key={index} className="badge bg-light text-dark me-1">{benefit}</span>
                          ))}
                        </div>
                      </td>
                      <td>
                        <span className="text-muted small">{benchmark.source}</span>
                      </td>
                      <td>
                        <span className="text-muted">{new Date(benchmark.date).toLocaleDateString('ru-RU')}</span>
                      </td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <button className="btn btn-outline-primary" title="Детали">
                            <i className="bi bi-eye"></i>
                          </button>
                          <button className="btn btn-outline-success" title="Сравнить">
                            <i className="bi bi-arrow-left-right"></i>
                          </button>
                          <button className="btn btn-outline-danger" title="Удалить">
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Таблица внешних вакансий */}
          {activeTab === 'vacancies' && (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead>
                  <tr>
                    <th>Вакансия</th>
                    <th>Компания</th>
                    <th>Локация</th>
                    <th>Страна</th>
                    <th>Грейд</th>
                    <th>Зарплата</th>
                    <th>Требования</th>
                    <th>Льготы</th>
                    <th>Источник</th>
                    <th>Дата</th>
                    <th>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVacancies.map(vacancy => (
                    <tr key={vacancy.id} className="animated-row">
                      <td>
                        <div className="fw-semibold">{vacancy.title}</div>
                        <small className="text-muted">{vacancy.specialization}</small>
                      </td>
                      <td>
                        <span className="fw-semibold text-primary">{vacancy.company}</span>
                      </td>
                      <td>
                        <span className="badge bg-primary-subtle text-primary">{vacancy.location}</span>
                      </td>
                      <td>
                        <span className="text-muted">{vacancy.country}</span>
                      </td>
                      <td>
                        <span className="badge bg-info-subtle text-info">{vacancy.grade}</span>
                      </td>
                      <td>
                        <div className="fw-bold text-success">
                          {formatCurrency(vacancy.salary.min)} - {formatCurrency(vacancy.salary.max)}
                        </div>
                      </td>
                      <td>
                        <div className="small">
                          {vacancy.requirements.slice(0, 2).map((req, index) => (
                            <span key={index} className="badge bg-warning-subtle text-warning me-1">{req}</span>
                          ))}
                          {vacancy.requirements.length > 2 && (
                            <span className="badge bg-secondary">+{vacancy.requirements.length - 2}</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="small">
                          {vacancy.benefits.slice(0, 2).map((benefit, index) => (
                            <span key={index} className="badge bg-success-subtle text-success me-1">{benefit}</span>
                          ))}
                          {vacancy.benefits.length > 2 && (
                            <span className="badge bg-secondary">+{vacancy.benefits.length - 2}</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className="text-muted small">{vacancy.source}</span>
                      </td>
                      <td>
                        <span className="text-muted">{new Date(vacancy.postedDate).toLocaleDateString('ru-RU')}</span>
                      </td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <button className="btn btn-outline-primary" title="Детали">
                            <i className="bi bi-eye"></i>
                          </button>
                          <button className="btn btn-outline-success" title="Сохранить">
                            <i className="bi bi-bookmark"></i>
                          </button>
                          <button className="btn btn-outline-info" title="Сравнить">
                            <i className="bi bi-arrow-left-right"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Таблица коэффициентов пересчета */}
          {activeTab === 'conversion' && (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead>
                  <tr>
                    <th>От локации</th>
                    <th>К локации</th>
                    <th>Коэффициент</th>
                    <th>Пример пересчета</th>
                    <th>Данных</th>
                    <th>Обновлено</th>
                    <th>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {conversionMatrix.map((conversion, index) => (
                    <tr key={index} className="animated-row">
                      <td>
                        <span className="badge bg-primary-subtle text-primary">{conversion.fromLocation}</span>
                      </td>
                      <td>
                        <span className="badge bg-success-subtle text-success">{conversion.toLocation}</span>
                      </td>
                      <td>
                        <span className="fw-bold text-info">{conversion.coefficient.toFixed(2)}</span>
                      </td>
                      <td>
                        <div className="small">
                          <div>100,000₸ → {formatCurrency(100000 * conversion.coefficient)}</div>
                          <div className="text-muted">200,000₸ → {formatCurrency(200000 * conversion.coefficient)}</div>
                        </div>
                      </td>
                      <td>
                        <span className="badge bg-info-subtle text-info">{conversion.dataPoints}</span>
                      </td>
                      <td>
                        <span className="text-muted">{new Date(conversion.lastUpdated).toLocaleDateString('ru-RU')}</span>
                      </td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <button className="btn btn-outline-primary" title="Детали">
                            <i className="bi bi-eye"></i>
                          </button>
                          <button className="btn btn-outline-warning" title="Редактировать">
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button className="btn btn-outline-success" title="Экспорт">
                            <i className="bi bi-download"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Плавающие кнопки для подробной аналитики */}
      {showDetailedAnalytics && (
        <>
          <div className="analytics-overlay" onClick={() => setShowDetailedAnalytics(false)}></div>
          <div className="floating-analytics-panel">
            <div className="analytics-panel-header">
              <h5>Подробная аналитика</h5>
              <button 
                className="btn-close"
                onClick={() => setShowDetailedAnalytics(false)}
              >×</button>
            </div>
            <div className="analytics-panel-content">
              <div className="row">
                <div className="col-md-6">
                  <h6>Анализ по локациям</h6>
                  <div className="analytics-chart-placeholder">
                    <p>График распределения зарплат по городам</p>
                  </div>
                </div>
                <div className="col-md-6">
                  <h6>Анализ по специализациям</h6>
                  <div className="analytics-chart-placeholder">
                    <p>График трендов по специализациям</p>
                  </div>
                </div>
              </div>
              <div className="row mt-3">
                <div className="col-md-6">
                  <h6>Анализ по грейдам</h6>
                  <div className="analytics-chart-placeholder">
                    <p>График роста зарплат по грейдам</p>
                  </div>
                </div>
                <div className="col-md-6">
                  <h6>Матрица коэффициентов</h6>
                  <div className="analytics-chart-placeholder">
                    <p>Тепловая карта коэффициентов пересчета</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MarketAnalyticsPage; 