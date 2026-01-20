import { useState, useEffect } from 'react';
import { showNotImplementedToast } from '../utils/showNotImplementedToast';
import { api } from '../utils/api';

interface ActionCard {
  icon: string;
  title: string;
  description: string;
  color: 'primary' | 'success' | 'warning' | 'info';
}

const ActionCardItem: React.FC<ActionCard> = ({ icon, title, description, color }) => (
  <a 
    href="#" 
    className="action-card"
    onClick={(e) => {
      e.preventDefault();
      showNotImplementedToast();
    }}
  >
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
  const [userName, setUserName] = useState<string>('');
  const actionCards: ActionCard[] = [
    { icon: 'bi-person-plus', title: 'Новый сотрудник', description: 'Оформить прием на работу', color: 'primary' },
    { icon: 'bi-calendar-check', title: 'Собеседования сегодня', description: '3 кандидата ожидают', color: 'success' },
    { icon: 'bi-exclamation-triangle', title: 'Требуют внимания', description: '5 заявок на одобрение', color: 'warning' },
    { icon: 'bi-graph-up-arrow', title: 'Отчеты', description: 'Сформировать аналитику', color: 'info' },
  ];

  useEffect(() => {
    const loadUserName = async () => {
      try {
        // Пытаемся загрузить профиль
        try {
          const profileData = await api.getProfile();
          if (profileData) {
            // Извлекаем только имя (first_name)
            let firstName = profileData.first_name;
            
            // Если first_name нет, пытаемся извлечь из full_name
            if (!firstName && profileData.full_name) {
              const nameParts = profileData.full_name.trim().split(/\s+/);
              // В русском формате обычно: Фамилия Имя Отчество
              // Имя - это обычно второе слово, или первое, если только одно слово
              firstName = nameParts.length > 1 ? nameParts[1] : nameParts[0];
            }
            
            setUserName(firstName || 'Пользователь');
            return;
          }
        } catch (profileError) {
          console.debug('Failed to load profile, trying getCurrentUser:', profileError);
        }

        // Fallback на getCurrentUser
        const currentUser = await api.getCurrentUser();
        if (currentUser) {
          // Извлекаем только имя (first_name)
          let firstName = currentUser.first_name;
          
          // Если first_name нет, пытаемся извлечь из full_name или name
          if (!firstName) {
            const fullName = currentUser.full_name || currentUser.name;
            if (fullName) {
              const nameParts = fullName.trim().split(/\s+/);
              // В русском формате обычно: Фамилия Имя Отчество
              // Имя - это обычно второе слово, или первое, если только одно слово
              firstName = nameParts.length > 1 ? nameParts[1] : nameParts[0];
            }
          }
          
          setUserName(firstName || 'Пользователь');
          return;
        }
      } catch (error) {
        console.debug('Failed to load user name:', error);
        setUserName('Пользователь');
      }
    };
    
    loadUserName();
  }, []);

  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    // Ночь: 23:00 - 5:59
    if (hour >= 23 || hour < 6) return 'night';
    // Утро: 6:00 - 11:59
    if (hour >= 6 && hour < 12) return 'morning';
    // День: 12:00 - 17:59
    if (hour >= 12 && hour < 18) return 'day';
    // Вечер: 18:00 - 22:59
    return 'evening';
  };

  const getGreeting = () => {
    const timeOfDay = getTimeOfDay();
    switch (timeOfDay) {
      case 'night': return 'Доброй ночи';
      case 'morning': return 'Доброе утро';
      case 'day': return 'Добрый день';
      case 'evening': return 'Добрый вечер';
      default: return 'Добро пожаловать';
    }
  };

  const getGreetingIcon = () => {
    const timeOfDay = getTimeOfDay();
    switch (timeOfDay) {
      case 'night': return '🌙'; // Луна
      case 'morning': return '👋'; // Ладошка
      case 'day': return '💻'; // Ноутбук (эмодзи для парня за ноутбуком)
      case 'evening': return '🌆'; // Закат/вечерний город
      default: return '👋';
    }
  };

  const getDateString = () => {
    const date = new Date();
    const days = ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'];
    const months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
    return `Сегодня ${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]}`;
  };

  const displayName = userName || 'Пользователь';
  const greetingText = `${getGreeting()}, ${displayName}!`;

  return (
    <div className="command-center-wrapper">
      <div className="command-center-card">
        <div className="command-center">
          <h1 className="greeting">{greetingText} {getGreetingIcon()}</h1>
          <p className="subtitle">{getDateString()}. Вот что происходит в компании:</p>
          <div className="action-cards">
            {actionCards.map(card => <ActionCardItem key={card.title} {...card} />)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommandCenter;

