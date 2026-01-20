import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './SettingsSubmenu.css';

interface SubmenuItem {
  id: string;
  text: string;
  icon: string;
  route: string;
}

const submenuItems: SubmenuItem[] = [
  { id: 'general', text: 'Общие', icon: 'bi-sliders', route: '/settings/general' },
  { id: 'org-structure', text: 'Оргструктура', icon: 'bi-diagram-3', route: '/settings/org-structure' },
  { id: 'users', text: 'Пользователи', icon: 'bi-people', route: '/settings/users' },
  { id: 'security', text: 'Безопасность', icon: 'bi-shield-lock', route: '/settings/security' },
  { id: 'integrations', text: 'Интеграции', icon: 'bi-plug-fill', route: '/settings/integrations' },
  { id: 'theme', text: 'Внешний вид', icon: 'bi-palette', route: '/settings/theme' },
  { id: 'lifecycle', text: 'Жизненный цикл', icon: 'bi-arrow-repeat', route: '/settings/lifecycle' },
  { id: 'reasons', text: 'Причины', icon: 'bi-list-check', route: '/settings/reasons' },
];

const SettingsSubmenu: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [isCopyMenuOpen, setIsCopyMenuOpen] = useState(false);

  // Определяем активный элемент на основе текущего роута
  useEffect(() => {
    if (location.pathname.startsWith('/settings/')) {
      const path = location.pathname.split('/')[2]; // Получаем часть после /settings/
      if (path) {
        setActiveItem(path);
      } else {
        setActiveItem('general'); // По умолчанию "Общие"
      }
    }
  }, [location.pathname]);

  // Отслеживаем состояние открытия CopyFloatingGroup
  useEffect(() => {
    const checkCopyMenuState = () => {
      const copyMenu = document.querySelector('.copy-floating-group-menu');
      const isOpen = copyMenu?.classList.contains('open') || copyMenu?.classList.contains('pinned');
      setIsCopyMenuOpen(!!isOpen);
    };

    // Проверяем состояние при монтировании
    checkCopyMenuState();

    // Наблюдаем за изменениями в DOM для отслеживания открытия/закрытия меню
    const observer = new MutationObserver(checkCopyMenuState);
    const copyMenu = document.querySelector('.copy-floating-group-menu');
    
    if (copyMenu) {
      observer.observe(copyMenu, {
        attributes: true,
        attributeFilter: ['class']
      });
    }

    // Также проверяем периодически (на случай, если изменения происходят не через классы)
    const interval = setInterval(checkCopyMenuState, 100);

    return () => {
      observer.disconnect();
      clearInterval(interval);
    };
  }, []);

  const handleItemClick = (item: SubmenuItem) => {
    setActiveItem(item.id);
    navigate(item.route);
  };

  // Показываем суб-меню только на страницах настроек
  const isVisible = location.pathname.startsWith('/settings');

  if (!isVisible) {
    return null;
  }

  return (
    <div className={`settings-submenu show ${isCopyMenuOpen ? 'copy-menu-open' : ''}`}>
      <div className="submenu-items">
        {submenuItems.map((item) => (
          <div
            key={item.id}
            className={`submenu-item ${activeItem === item.id ? 'active' : ''}`}
            onClick={() => handleItemClick(item)}
          >
            <i className={`bi ${item.icon}`}></i>
            <span>{item.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SettingsSubmenu;

