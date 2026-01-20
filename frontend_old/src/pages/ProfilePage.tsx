import React, { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getUserData, getSelectedWidgets } from '../utils/userStorage';
import { api } from '../utils/api';
import { getUser } from '../utils/auth';
import './ProfilePage.css';

interface Widget {
    id: string;
    title: string;
    description: string;
    icon: string;
    color: string;
    link: string;
}

const allSelectableWidgets: Omit<Widget, 'description' | 'link'>[] = [
    { id: 'salary', title: 'Моя зарплата', icon: 'bi-cash-stack', color: 'primary' },
    { id: 'vacation', title: 'Мой отпуск', icon: 'bi-airplane', color: 'info' },
    { id: 'courses', title: 'Мои курсы', icon: 'bi-mortarboard', color: 'success' },
    { id: 'projects', title: 'Проекты', icon: 'bi-kanban', color: 'warning' },
    { id: 'wiki', title: 'Wiki', icon: 'bi-book', color: 'dark' },
    { id: 'reports', title: 'Отчеты', icon: 'bi-file-earmark-bar-graph', color: 'secondary' },
    { id: 'portal', title: 'Портал', icon: 'bi-globe', color: 'primary' },
    { id: 'kpi', title: 'KPI', icon: 'bi-graph-up-arrow', color: 'info' },
    { id: 'okr', title: 'OKR', icon: 'bi-bullseye', color: 'danger' },
];

const permanentWidget: Omit<Widget, 'id' | 'link'> = {
    title: 'Создать заявку',
    description: 'Новая заявка',
    icon: 'bi-plus-circle',
    color: 'warning'
};

const fullWidgetData: Record<string, Pick<Widget, 'description'|'link'>> = {
    salary: { description: 'Зарплата и бонусы', link: '#' },
    vacation: { description: 'График отпусков', link: '#' },
    courses: { description: 'Обучение', link: '#' },
    projects: { description: 'Активные проекты', link: '#' },
    wiki: { description: 'База знаний', link: '#' },
    reports: { description: 'Аналитика', link: '#' },
    portal: { description: 'Корпоративный портал', link: '#' },
    kpi: { description: 'Показатели', link: '#' },
    okr: { description: 'Цели и результаты', link: '#' },
    request: { description: 'Новая заявка', link: '#' }
};

const ProfilePage: React.FC = () => {
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const selectedWidgetIds = getSelectedWidgets();

    useEffect(() => {
        const loadProfile = async () => {
            try {
                // Пытаемся загрузить профиль из API
                try {
                    const profileData = await api.getProfile();
                    console.log('📥 Profile data loaded:', profileData);
                    if (profileData) {
                        setProfile(profileData);
                        setLoading(false);
                        return;
                    }
                } catch (profileError) {
                    console.warn('⚠️ Failed to load profile, trying getCurrentUser:', profileError);
                }

                // Если профиль не загрузился, пытаемся загрузить текущего пользователя
                try {
                    const currentUser = await api.getCurrentUser();
                    console.log('📥 Current user data loaded:', currentUser);
                    if (currentUser) {
                        setProfile(currentUser);
                    }
                } catch (userError) {
                    console.warn('⚠️ Failed to load current user:', userError);
                    // Используем данные из localStorage как последний fallback
                    const storedUser = getUser();
                    if (storedUser) {
                        console.log('📥 Using stored user data:', storedUser);
                        setProfile(storedUser);
                    }
                }
            } catch (error) {
                console.error('❌ Failed to load profile:', error);
            } finally {
                setLoading(false);
            }
        };
        loadProfile();
    }, []);

    const displayedWidgets = useMemo(() => {
        const selected = selectedWidgetIds
            .map((id: string) => {
                const widget = allSelectableWidgets.find(w => w.id === id);
                if (!widget) return null;
                return {
                    ...widget,
                    description: fullWidgetData[widget.id]?.description || '',
                    link: fullWidgetData[widget.id]?.link || '#',
                } as Widget;
            })
            .filter((w): w is Widget => w !== null);

        const createRequestWidget: Widget = {
            id: 'request',
            ...permanentWidget,
            link: fullWidgetData.request.link,
        };
        
        return [...selected, createRequestWidget];
    }, [selectedWidgetIds]);

    return (
        <div className="profile-page">
            <div className="profile-container">
                {/* Заголовок профиля */}
                <div className="profile-header">
                    <div className="profile-avatar">
                        {loading ? (
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Загрузка...</span>
                            </div>
                        ) : profile?.avatar ? (
                            <img src={profile.avatar} alt="Avatar" />
                        ) : (
                            <i className="bi bi-person"></i>
                        )}
                    </div>
                    
                    <div className="profile-info">
                        <h1 className="profile-name">
                            {loading ? (
                                <span>Загрузка...</span>
                            ) : (
                                <>
                                    {(() => {
                                        if (profile?.full_name) {
                                            return profile.full_name;
                                        }
                                        if (profile?.first_name || profile?.last_name) {
                                            const parts = [
                                                profile.last_name,
                                                profile.first_name,
                                                profile.middle_name
                                            ].filter(Boolean);
                                            return parts.join(' ') || 'Пользователь';
                                        }
                                        return 'Пользователь';
                                    })()}
                                    <span className="profile-role-separator"> | </span>
                                    <span className="profile-role">HR Generalist</span>
                                </>
                            )}
                        </h1>
                        <div className="profile-position">
                            <em>{profile?.position || 'Сотрудник'}</em>
                        </div>
                        
                        <div className="profile-stats">
                            <div className="stat-item">
                                <div className="stat-value">7</div>
                                <div className="stat-label">лет в компании</div>
                            </div>
                            <div className="stat-item">
                                <div className="stat-value">24</div>
                                <div className="stat-label">достижения</div>
                            </div>
                            <div className="stat-item">
                                <div className="stat-value">12</div>
                                <div className="stat-label">сертификаты</div>
                            </div>
                        </div>
                    </div>

                    <div className="top-right-info">
                        <div className="table-number tooltip-trigger" data-tooltip="Табельный номер">таб. 25485</div>
                        <div className="birthday-info tooltip-trigger" data-tooltip="День рождения">
                            <i className="bi bi-gift"></i>
                            <span>15 мар 85</span>
                        </div>
                    </div>
                </div>
                
                {/* Секции профиля */}
                <div className="profile-sections">
                    {/* О себе */}
                    <div className="profile-section">
                        <div className="section-header">
                            <h2 className="section-title">О себе</h2>
                            <Link to="/account/settings" className="section-action">Редактировать</Link>
                        </div>
                        
                        <ul className="info-list">
                            <li className="info-item">
                                <div className="info-icon">
                                    <i className="bi bi-envelope"></i>
                                </div>
                                <div className="info-content">
                                    <div className="info-value">
                                        <a 
                                            href={`mailto:${profile?.email || ''}`}
                                            data-tooltip="Нажмите для отправки письма"
                                            className="tooltip-trigger"
                                        >
                                            {profile?.email || 'Не указан'}
                                        </a>
                                    </div>
                                </div>
                            </li>
                            <li className="info-item">
                                <div className="info-icon">
                                    <i className="bi bi-telephone"></i>
                                </div>
                                <div className="info-content">
                                    <div className="info-value">
                                        <a 
                                            href={`tel:${profile?.phone || ''}`}
                                            data-tooltip="Нажмите для звонка"
                                            className="tooltip-trigger"
                                        >
                                            {profile?.phone || 'Не указан'}
                                        </a>
                                    </div>
                                </div>
                            </li>
                            <li className="info-item">
                                <div className="info-icon">
                                    <i className="bi bi-telegram"></i>
                                </div>
                                <div className="info-content">
                                    <div className="info-value">
                                        <a 
                                            href={`https://t.me/${((profile?.telegram || '').replace('@', ''))}`} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            data-tooltip="Открыть в Telegram"
                                            className="tooltip-trigger"
                                        >
                                            {profile?.telegram ? `@${profile.telegram.replace('@', '')}` : 'Не указан'}
                                        </a>
                                    </div>
                                </div>
                            </li>
                            <li className="info-item">
                                <div className="info-icon">
                                    <i className="bi bi-geo-alt"></i>
                                </div>
                                <div className="info-content">
                                    <div 
                                        className="info-value tooltip-trigger"
                                        data-tooltip="Местоположение сотрудника"
                                    >
                                        Москва, Россия
                                    </div>
                                </div>
                            </li>
                        </ul>
                    </div>
                    
                    {/* Навыки */}
                    <div className="profile-section">
                        <div className="section-header">
                            <h2 className="section-title">Навыки</h2>
                        </div>
                        
                        <div className="skills-list">
                            <div className="skill-item">
                                <span className="skill-name">JavaScript</span>
                                <div className="skill-bar">
                                    <div className="skill-progress" style={{ width: '85%' }}></div>
                                </div>
                            </div>
                            <div className="skill-item">
                                <span className="skill-name">React</span>
                                <div className="skill-bar">
                                    <div className="skill-progress" style={{ width: '90%' }}></div>
                                </div>
                            </div>
                            <div className="skill-item">
                                <span className="skill-name">TypeScript</span>
                                <div className="skill-bar">
                                    <div className="skill-progress" style={{ width: '75%' }}></div>
                                </div>
                            </div>
                            <div className="skill-item">
                                <span className="skill-name">Node.js</span>
                                <div className="skill-bar">
                                    <div className="skill-progress" style={{ width: '70%' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Последняя активность */}
                    <div className="profile-section">
                        <div className="section-header">
                            <Link to="/account/activity-log" className="section-title-link">
                                <h2 className="section-title">Последняя активность</h2>
                            </Link>
                        </div>
                        
                        <div className="activity-list">
                            <div className="activity-item">
                                <div className="activity-icon">
                                    <i className="bi bi-person-plus"></i>
                                </div>
                                <div className="activity-content">
                                    <div className="activity-title">Новый сотрудник добавлен</div>
                                    <div className="activity-time">2 часа назад</div>
                                </div>
                            </div>
                            <div className="activity-item">
                                <div className="activity-icon">
                                    <i className="bi bi-file-text"></i>
                                </div>
                                <div className="activity-content">
                                    <div className="activity-title">Обновлен отчет по KPI</div>
                                    <div className="activity-time">Вчера, 15:30</div>
                                </div>
                            </div>
                            <div className="activity-item">
                                <div className="activity-icon">
                                    <i className="bi bi-calendar-check"></i>
                                </div>
                                <div className="activity-content">
                                    <div className="activity-title">Проведено собеседование</div>
                                    <div className="activity-time">Вчера, 11:00</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Мои модули */}
                <div className="row g-3 mt-3 mb-5">
                    {displayedWidgets.map(widget => (
                        <div className="col-6 col-md-3" key={widget.id}>
                            <a 
                                href={widget.link} 
                                className="module-card" 
                                data-module={widget.id}
                            >
                                <div className="module-icon-wrapper">
                                    <i className={`bi ${widget.icon} module-icon text-${widget.color}`}></i>
                                </div>
                                <div className="module-content">
                                    <div className="module-name">{widget.title}</div>
                                    <div className="module-count small text-muted">{widget.description}</div>
                                </div>
                            </a>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;

