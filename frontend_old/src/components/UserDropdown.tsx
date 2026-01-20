import { useEffect, useRef, useId, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { showNotImplementedToast } from '../utils/showNotImplementedToast';
import { api } from '../utils/api';
import { toastSuccess } from '../utils/toastHelper';
import { getUser } from '../utils/auth';

interface UserDropdownItem {
  icon?: string;
  label: string;
  href?: string;
  onClick?: () => void;
  divider?: boolean;
  danger?: boolean;
}

interface UserInfo {
  name: string;
  email: string;
}

interface UserDropdownProps {
  user?: UserInfo;
  items?: UserDropdownItem[];
  className?: string;
  buttonClassName?: string;
  menuClassName?: string;
}

const createDefaultItems = (navigate: any): UserDropdownItem[] => [
  {
    icon: 'bi-person',
    label: 'Мой профиль',
    href: '/account/profile'
  },
  {
    icon: 'bi-gear',
    label: 'Настройки',
    href: '/account/settings'
  },
  {
    icon: 'bi-clock-history',
    label: 'Логи',
    href: '/account/activity-log'
  },
  { divider: true },
  {
    icon: 'bi-question-circle',
    label: 'Помощь',
    href: '#',
    onClick: showNotImplementedToast
  },
  {
    icon: 'bi-info-circle',
    label: 'О программе',
    href: '#',
    onClick: showNotImplementedToast
  },
  { divider: true },
  {
    icon: 'bi-box-arrow-right',
    label: 'Выйти',
    href: '#',
    onClick: async () => {
      try {
        await api.logout();
        toastSuccess('Вы успешно вышли из системы', 'Выход');
        navigate('/login');
      } catch (error) {
        console.error('Logout error:', error);
        // Выходим даже при ошибке
        navigate('/login');
      }
    },
    danger: true
  }
];

const UserDropdown = ({ 
  user: propUser,
  items, 
  className = '',
  buttonClassName = 'quick-action-btn',
  menuClassName = 'dropdown-menu dropdown-menu-end profile-menu'
}: UserDropdownProps) => {
  const navigate = useNavigate();
  const uniqueId = useId().replace(/:/g, '-');
  const dropdownId = `userDropdown-${uniqueId}`;
  const dropdownRef = useRef<HTMLButtonElement>(null);
  const defaultItems = createDefaultItems(navigate);
  const finalItems = items || defaultItems;
  
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  // Загружаем данные пользователя
  useEffect(() => {
    const loadUser = async () => {
      try {
        // Если пользователь передан через props, используем его
        if (propUser) {
          setUser(propUser);
          setLoading(false);
          return;
        }

        // Пытаемся загрузить из API
        try {
          // Сначала пробуем getProfile (более полные данные)
          try {
            const profileData = await api.getProfile();
            if (profileData) {
              const fullName = profileData.full_name || 
                (profileData.first_name || profileData.last_name 
                  ? `${profileData.last_name || ''} ${profileData.first_name || ''} ${profileData.middle_name || ''}`.trim()
                  : '') ||
                'Пользователь';
              setUser({
                name: fullName,
                email: profileData.email || 'email@example.com'
              });
              setLoading(false);
              return;
            }
          } catch (profileError) {
            console.warn('Failed to load profile, trying getCurrentUser:', profileError);
          }

          // Fallback на getCurrentUser
          const currentUser = await api.getCurrentUser();
          if (currentUser) {
            const fullName = currentUser.full_name || 
              (currentUser.first_name || currentUser.last_name 
                ? `${currentUser.last_name || ''} ${currentUser.first_name || ''} ${currentUser.middle_name || ''}`.trim()
                : '') ||
              currentUser.name ||
              'Пользователь';
            setUser({
              name: fullName,
              email: currentUser.email || currentUser.sub || 'email@example.com'
            });
            setLoading(false);
            return;
          }
        } catch (error) {
          console.warn('Failed to load user from API, trying localStorage:', error);
        }

        // Fallback на localStorage
        const storedUser = getUser();
        if (storedUser) {
          const fullName = storedUser.full_name || 
            `${storedUser.first_name || ''} ${storedUser.last_name || ''}`.trim() || 
            storedUser.name || 
            'Пользователь';
          setUser({
            name: fullName,
            email: storedUser.email || 'email@example.com'
          });
        } else {
          // Последний fallback
          setUser({
            name: 'Пользователь',
            email: 'email@example.com'
          });
        }
      } catch (error) {
        console.error('Error loading user:', error);
        setUser({
          name: 'Пользователь',
          email: 'email@example.com'
        });
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [propUser]);

  // Инициализация Bootstrap dropdown
  useEffect(() => {
    if (dropdownRef.current) {
      const initBootstrap = async () => {
        // Используем window.bootstrap если доступен, иначе импортируем
        let bootstrap: any;
        if (typeof window !== 'undefined' && (window as any).bootstrap) {
          bootstrap = (window as any).bootstrap;
        } else {
          bootstrap = await import('bootstrap');
        }
        
        const dropdownElement = dropdownRef.current;
        if (dropdownElement) {
          setTimeout(() => {
            if (dropdownElement) {
              try {
                // Проверяем, не инициализирован ли уже
                const existingDropdown = bootstrap.Dropdown.getInstance(dropdownElement);
                if (existingDropdown) {
                  existingDropdown.dispose();
                }
                // Инициализируем dropdown
                new bootstrap.Dropdown(dropdownElement, {
                  boundary: 'viewport'
                });
              } catch (e) {
                console.warn('Failed to initialize user dropdown:', e);
              }
            }
          }, 150);
        }
      };
      initBootstrap();
    }
  }, []);

  const handleItemClick = (item: UserDropdownItem, e: React.MouseEvent) => {
    if (item.onClick) {
      e.preventDefault();
      item.onClick();
    } else if (item.href === '#' || !item.href) {
      // Если нет onClick и href это # или пустой, показываем тост
      e.preventDefault();
      showNotImplementedToast();
    }
    // Если есть href и это не #, используем стандартную навигацию Link из react-router-dom
  };

  return (
    <div className={`dropdown profile-dropdown ${className}`} style={{ position: 'relative' }}>
      <button
        ref={dropdownRef}
        className={buttonClassName}
        id={dropdownId}
        data-bs-toggle="dropdown"
        aria-expanded="false"
      >
        <i className="bi bi-person-circle"></i>
      </button>
      <ul
        className={menuClassName}
        aria-labelledby={dropdownId}
      >
        {/* Блок с информацией о пользователе */}
        <li className="px-3 py-2">
          <div className="user-info-header">
            {loading ? (
              <div className="spinner-border spinner-border-sm text-primary" role="status">
                <span className="visually-hidden">Загрузка...</span>
              </div>
            ) : (
              <>
                <div className="user-name">{user?.name || 'Пользователь'}</div>
                <div className="user-email text-muted">{user?.email || 'email@example.com'}</div>
              </>
            )}
          </div>
        </li>
        <li><hr className="dropdown-divider" /></li>
        
        {finalItems.map((item, index) => {
          if (item.divider) {
            return <li key={`divider-${index}`}><hr className="dropdown-divider" /></li>;
          }

          const content = (
            <>
              {item.icon && <i className={`bi ${item.icon}`}></i>}
              <span className={item.icon ? 'ms-2' : ''}>{item.label}</span>
            </>
          );

          if (item.href && item.href !== '#') {
            // Используем Link для внутренних маршрутов
            return (
              <li key={`item-${index}`}>
                <Link
                  className={`dropdown-item ${item.danger ? 'text-danger' : ''}`}
                  to={item.href}
                  onClick={(e) => {
                    // Закрываем dropdown при клике
                    if (dropdownRef.current && (window as any).bootstrap) {
                      const bootstrap = (window as any).bootstrap;
                      const dropdown = bootstrap.Dropdown.getInstance(dropdownRef.current);
                      if (dropdown) {
                        dropdown.hide();
                      }
                    }
                  }}
                >
                  {content}
                </Link>
              </li>
            );
          }
          
          if (item.href === '#') {
            return (
              <li key={`item-${index}`}>
                <a
                  className={`dropdown-item ${item.danger ? 'text-danger' : ''}`}
                  href={item.href}
                  onClick={(e) => handleItemClick(item, e)}
                >
                  {content}
                </a>
              </li>
            );
          }

          return (
            <li key={`item-${index}`}>
              <button
                className={`dropdown-item ${item.danger ? 'text-danger' : ''}`}
                type="button"
                onClick={(e) => handleItemClick(item, e)}
              >
                {content}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default UserDropdown;

