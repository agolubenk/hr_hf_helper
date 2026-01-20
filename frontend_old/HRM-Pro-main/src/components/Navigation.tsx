import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import LanguageSwitcher from './LanguageSwitcher';

// Стили для dropdown
const dropdownStyles = {
  container: {
    position: 'relative' as const,
  },
  menu: {
    position: 'absolute' as const,
    right: 0,
    top: '100%',
    marginTop: '0.5rem',
    zIndex: 1050,
    backgroundColor: 'var(--bs-body-bg)',
    border: '1px solid var(--bs-border-color)',
    borderRadius: '0.5rem',
    boxShadow: '0 0.5rem 1rem rgba(0, 0, 0, 0.15)',
    padding: '0.5rem 0',
    minWidth: '150px',
    opacity: 1,
    transform: 'translateY(0)',
    transition: 'all 0.2s ease-in-out',
    animation: 'dropdownFadeIn 0.2s ease-out',
    listStyle: 'none',
    margin: 0,
  },
  languageMenu: {
    minWidth: '150px',
  },
  profileMenu: {
    minWidth: '200px',
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.5rem 1rem',
    borderRadius: '0.25rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    color: 'var(--bs-body-color)',
    textDecoration: 'none',
    fontSize: '0.875rem',
    border: 'none',
    background: 'transparent',
    width: '100%',
    listStyle: 'none',
  },
  itemHover: {
    backgroundColor: 'var(--bs-secondary-bg)',
    color: 'var(--bs-primary)',
  },
  divider: {
    height: '1px',
    backgroundColor: 'var(--bs-border-color)',
    margin: '0.5rem 0',
  },
  listItem: {
    listStyle: 'none',
    margin: 0,
    padding: 0,
  },
};

// Добавляем CSS анимацию
const style = document.createElement('style');
style.textContent = `
  @keyframes dropdownFadeIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;
document.head.appendChild(style);

interface NavigationProps {
  searchInputRef?: React.RefObject<HTMLInputElement | null>;
}

const Navigation: React.FC<NavigationProps> = ({ searchInputRef }) => {
  const { state, dispatch, addToast } = useAppContext();
  const { currentUser, notifications } = state;
  const unreadNotifications = notifications.filter((n: any) => !n.read).length;
  
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const location = useLocation();
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const handleThemeToggle = () => {
    // Закрываем dropdown при переключении темы
    setProfileDropdownOpen(false);
    dispatch({ type: 'TOGGLE_THEME' });
  };
  
  const handleQuickPanelToggle = () => {
    // Закрываем dropdown при открытии панели
    setProfileDropdownOpen(false);
    dispatch({ type: 'TOGGLE_QUICK_PANEL' });
  };
  
  const handleNotificationClick = () => {
    // Закрываем dropdown при клике на уведомления
    setProfileDropdownOpen(false);
  };

  const handleTestNotification = () => {
    // Создаем тестовое уведомление для проверки закрепления
    addToast('Это тестовое уведомление для проверки функциональности закрепления в футере', { 
      type: 'info', 
      title: 'Тестовое уведомление' 
    });
  };

  // Закрытие dropdown при клике вне
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.profile-dropdown')) {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Закрытие dropdown при смене страницы
  useEffect(() => {
    setProfileDropdownOpen(false);
  }, [location]);

  // Hover эффекты для dropdown элементов
  const handleItemMouseEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.currentTarget.style.backgroundColor = 'var(--bs-secondary-bg)';
    e.currentTarget.style.color = 'var(--bs-primary)';
  };

  const handleItemMouseLeave = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.currentTarget.style.backgroundColor = 'transparent';
    e.currentTarget.style.color = 'var(--bs-body-color)';
  };

  const isMac = typeof navigator !== 'undefined' && navigator.platform.toLowerCase().includes('mac');
  const shortcutLabel = isMac ? '⌘K' : 'Ctrl+K';

  return (
    <nav className="main-nav" onClick={(e) => {
      // Закрываем dropdown при клике на навигацию, но не на сами dropdown кнопки
      const target = e.target as Element;
      if (!target.closest('.profile-dropdown')) {
        setProfileDropdownOpen(false);
      }
    }}>
      <div className="nav-container">
        <a href="/#" className="logo">
          <i className="bi bi-hexagon-fill"></i>
          <span className="logo-text">HRM Pro</span>
        </a>

        <div className="quick-actions">
          <div className="search-container d-none d-md-block">
            <i className="bi bi-search search-icon"></i>
            <input
              type="text"
              className="search-input"
              placeholder="Поиск..."
              ref={searchInputRef}
              onClick={() => {
                setProfileDropdownOpen(false);
              }}
            />
            <span className="search-shortcut">{shortcutLabel}</span>
          </div>

          <button className="quick-action-btn d-md-none" onClick={() => setMobileSearchOpen(true)}>
            <i className="bi bi-search"></i>
          </button>

          <button className="quick-action-btn" onClick={handleQuickPanelToggle}>
            <i className="bi bi-lightning-charge"></i>
          </button>

          <button className="quick-action-btn" onClick={handleNotificationClick}>
            <i className="bi bi-bell"></i>
            {unreadNotifications > 0 && <span className="notification-badge">{unreadNotifications}</span>}
          </button>

          {/* Временная кнопка для тестирования уведомлений */}
          {/*
          <button 
            className="quick-action-btn" 
            onClick={handleTestNotification}
            title="Создать тестовое уведомление"
            style={{ fontSize: '0.8rem' }}
          >
            <i className="bi bi-plus-circle"></i>
          </button>
          */}
          
          <LanguageSwitcher />

          <button className="quick-action-btn" onClick={handleThemeToggle}>
            <i className={`bi ${state.theme === 'light' ? 'bi-sun-fill' : 'bi-moon-fill'}`}></i>
          </button>

          <div className="dropdown profile-dropdown" style={dropdownStyles.container}>
            <button 
              className="quick-action-btn" 
              onClick={(e) => {
                e.stopPropagation();
                setProfileDropdownOpen(!profileDropdownOpen);
              }}
            >
              <i className="bi bi-person-circle"></i>
            </button>
            {profileDropdownOpen && (
              <ul style={{ ...dropdownStyles.menu, ...dropdownStyles.profileMenu }}>
                <li style={dropdownStyles.listItem} className="px-3 py-2">
                  <div className="fw-semibold">{currentUser.name}</div>
                  <small className="text-muted">{currentUser.email}</small>
                </li>
                <li style={dropdownStyles.listItem}><div style={dropdownStyles.divider}></div></li>
                <li style={dropdownStyles.listItem}><Link 
                  style={dropdownStyles.item} 
                  to="/account/profile"
                  onMouseEnter={handleItemMouseEnter}
                  onMouseLeave={handleItemMouseLeave}
                ><i className="bi bi-person me-2"></i>Мой профиль</Link></li>
                <li style={dropdownStyles.listItem}><Link 
                  style={dropdownStyles.item} 
                  to="/account/settings"
                  onMouseEnter={handleItemMouseEnter}
                  onMouseLeave={handleItemMouseLeave}
                ><i className="bi bi-gear me-2"></i>Настройки</Link></li>
                <li style={dropdownStyles.listItem}><Link 
                  style={dropdownStyles.item} 
                  to="/account/activity-log"
                  onMouseEnter={handleItemMouseEnter}
                  onMouseLeave={handleItemMouseLeave}
                ><i className="bi bi-clock-history me-2"></i>Лог активности</Link></li>
                <li style={dropdownStyles.listItem}><a 
                  style={dropdownStyles.item} 
                  href="/#"
                  onMouseEnter={handleItemMouseEnter}
                  onMouseLeave={handleItemMouseLeave}
                ><i className="bi bi-question-circle me-2"></i>Помощь</a></li>
                <li style={dropdownStyles.listItem}><div style={dropdownStyles.divider}></div></li>
                <li style={dropdownStyles.listItem}><a 
                  style={{ ...dropdownStyles.item, color: 'var(--bs-danger)' }} 
                  href="/#"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--bs-danger-bg-subtle)';
                    e.currentTarget.style.color = 'var(--bs-danger)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'var(--bs-danger)';
                  }}
                ><i className="bi bi-box-arrow-right me-2"></i>Выйти</a></li>
              </ul>
            )}
          </div>
        </div>

        {mobileSearchOpen && (
          <div className="mobile-search-container active">
            <input
              type="text"
              className="mobile-search-input"
              placeholder="Поиск..."
              autoFocus
              onClick={() => {
                setProfileDropdownOpen(false);
              }}
            />
            <button className="mobile-search-close" onClick={() => setMobileSearchOpen(false)}>
              <i className="bi bi-x-lg"></i>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
