import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ThemeSelector from './ThemeSelector';
import UserDropdown from './UserDropdown';
import LanguageSelector from './LanguageSelector';
import { api } from '../utils/api';
import { showNotImplementedToast } from '../utils/showNotImplementedToast';

import type { LanguageCode } from './LanguageSelector';
import type { ThemeName } from '../utils/themeManager';

interface HeaderProps {
  onQuickPanelToggle?: () => void;
  hideSearch?: boolean;
  hideQuickPanel?: boolean;
  hideNotifications?: boolean;
  hideProfile?: boolean;
  allowedLanguages?: LanguageCode[]; // Список разрешенных языков
  allowedThemes?: ThemeName[]; // Список разрешенных тем
}

interface CompanyData {
  display_name?: string;
  logo_url?: string;
}

const Header = ({ 
  onQuickPanelToggle, 
  hideSearch = false,
  hideQuickPanel = false,
  hideNotifications = false,
  hideProfile = false,
  allowedLanguages,
  allowedThemes
}: HeaderProps) => {
  const navigate = useNavigate();
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  
  // Загружаем данные компании для хэдера
  useEffect(() => {
    const loadCompanyData = async () => {
      try {
        const settings = await api.getGeneralSettings().catch(() => null) as any;
        if (settings) {
          setCompanyData({
            display_name: settings.display_name,
            logo_url: settings.logo_url,
          });
        }
      } catch (error) {
        // Игнорируем ошибки загрузки - используем значения по умолчанию
        console.debug('Failed to load company data for header:', error);
      }
    };
    
    loadCompanyData();
  }, []);

  return (
    <nav className="main-nav">
      <div className="nav-container">
        <a 
          href="/" 
          className="logo"
          onClick={(e) => {
            e.preventDefault();
            navigate('/');
          }}
        >
          {companyData?.logo_url ? (
            <img 
              src={companyData.logo_url} 
              alt={companyData.display_name || 'Company Logo'} 
              className="logo-image"
              style={{ 
                maxWidth: '32px', 
                maxHeight: '32px', 
                objectFit: 'contain'
              }}
              onError={(e) => {
                // Если изображение не загрузилось, показываем иконку по умолчанию
                e.currentTarget.style.display = 'none';
                const icon = e.currentTarget.nextElementSibling as HTMLElement;
                if (icon) icon.style.display = 'inline-block';
              }}
            />
          ) : null}
          <i 
            className="bi bi-hexagon-fill" 
            style={{ display: companyData?.logo_url ? 'none' : 'inline-block' }}
          ></i>
          <span className="logo-text">
            {companyData?.display_name || 'HRM Pro'}
          </span>
        </a>
        
        <div className="quick-actions">
          {!hideSearch && (
            <>
          <div className="search-container d-none d-md-block">
            <i className="bi bi-search search-icon"></i>
            <input 
              type="text" 
              className="search-input" 
              placeholder="Поиск..."
            />
            <span className="search-shortcut">⌘K</span>
          </div>
          
          <button 
            className="quick-action-btn d-md-none" 
            onClick={() => setMobileSearchOpen(true)}
          >
            <i className="bi bi-search"></i>
          </button>
            </>
          )}
          
          {!hideQuickPanel && onQuickPanelToggle && (
          <button 
            className="quick-action-btn" 
            id="quickPanelBtn"
            onClick={onQuickPanelToggle}
            title="Быстрое меню"
          >
            <i className="bi bi-lightning-charge"></i>
          </button>
          )}
          
          {!hideNotifications && (
          <button 
            className="quick-action-btn" 
            id="notificationsBtn"
            onClick={showNotImplementedToast}
            title="Уведомления"
          >
            <i className="bi bi-bell"></i>
          </button>
          )}
          
          <button 
            className="quick-action-btn" 
            id="messagesBtn"
            onClick={() => {
              // Открываем Telegram мессенджер через роутинг
              navigate('/telegram');
            }}
            title="Сообщения Telegram"
            style={{ position: 'relative' }}
          >
            <i className="bi bi-chat-dots"></i>
            {/* Badge для непрочитанных сообщений (можно добавить позже) */}
            {/* <span className="badge bg-danger" style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              fontSize: '0.65rem',
              padding: '2px 5px',
              borderRadius: '10px',
              minWidth: '18px',
              textAlign: 'center'
            }}>3</span> */}
          </button>
          
          <LanguageSelector allowedLanguages={allowedLanguages} />
          
          <ThemeSelector variant="dropdown" allowedThemes={allowedThemes} />
          
          {!hideProfile && <UserDropdown />}
        </div>
        
        {/* Mobile Search */}
        {!hideSearch && (
        <div 
          className={`mobile-search-container ${mobileSearchOpen ? 'active' : ''}`}
          id="mobileSearch"
        >
          <input 
            type="text" 
            className="mobile-search-input" 
            placeholder="Поиск..."
          />
          <button 
            className="mobile-search-close" 
            id="mobileSearchClose"
            onClick={() => setMobileSearchOpen(false)}
          >
            <i className="bi bi-x-lg"></i>
          </button>
        </div>
        )}
      </div>
    </nav>
  );
};

export default Header;

