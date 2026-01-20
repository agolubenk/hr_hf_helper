import { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import UICheatsheet from './pages/UICheatsheet';
import CopyFloatingGroup from './components/CopyFloatingGroup';
import QuickPanel from './components/QuickPanel';
import ToastContainer from './components/ToastContainer';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import NewPasswordPage from './pages/NewPasswordPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import ActivityLogPage from './pages/ActivityLogPage';
import TelegramMessengerPage from './pages/TelegramMessengerPage';
import FloatingActions from './components/FloatingActions';
import SystemSettingsPage from './pages/company-settings/SystemSettingsPage';
import SettingsSubmenu from './components/SettingsSubmenu';
import type { CopyFloatingAction } from './components/CopyFloatingGroup';
import { showNotImplementedToast } from './utils/showNotImplementedToast';
import './App.css';

const AppContent = () => {
  const [quickPanelOpen, setQuickPanelOpen] = useState(false);
  const location = useLocation();
  
  // Определяем, нужно ли показывать суб-меню настроек
  const hasSettingsSubmenu = location.pathname.startsWith('/settings');
  const mainContentClass = `main-content ${hasSettingsSubmenu ? 'with-settings-submenu' : ''}`;
  
  // Пример действий для CopyFloatingGroup
  const floatingActions: CopyFloatingAction[] = [
    {
      id: 'copy',
      icon: 'bi-copy',
      label: 'Копировать',
      color: 'primary',
      onClick: showNotImplementedToast
    },
    {
      id: 'save',
      icon: 'bi-check-lg',
      label: 'Сохранить',
      color: 'success',
      onClick: showNotImplementedToast
    },
    {
      id: 'info',
      icon: 'bi-info-circle',
      label: 'Информация',
      color: 'info',
      onClick: showNotImplementedToast
    },
    {
      id: 'warning',
      icon: 'bi-exclamation-triangle',
      label: 'Предупреждение',
      color: 'warning',
      onClick: showNotImplementedToast
    },
    {
      id: 'delete',
      icon: 'bi-trash',
      label: 'Удалить',
      color: 'danger',
      onClick: showNotImplementedToast
    }
  ];

  return (
      <div className="app-container">
        <Header onQuickPanelToggle={() => setQuickPanelOpen(!quickPanelOpen)} />
        
      {/* Суб-меню для страниц настроек */}
      <SettingsSubmenu />
      
      <main className={mainContentClass}>
          <Routes>
            {/* Главная страница */}
            <Route path="/" element={<HomePage />} />
            
            {/* Страница UI Cheatsheet */}
            <Route path="/ui-cheatsheet" element={<UICheatsheet />} />
          
            {/* Страницы настроек компании */}
            <Route path="/settings/*" element={<SystemSettingsPage />} />
            
            {/* Страницы пользователя */}
            <Route path="/account/profile" element={<ProfilePage />} />
            <Route path="/account/settings" element={<SettingsPage />} />
            <Route path="/account/activity-log" element={<ActivityLogPage />} />
            
            {/* Telegram Messenger */}
            <Route path="/telegram" element={<TelegramMessengerPage />} />
          </Routes>
        </main>
        
        <Footer />
        
        {/* Copy Floating Group - отображается на всех страницах */}
        <CopyFloatingGroup actions={floatingActions} />
        
      {/* Floating Actions - кнопка вверх и кнопка + */}
        <FloatingActions />
        
        {/* Quick Panel - быстрое меню */}
        <QuickPanel 
          isOpen={quickPanelOpen} 
          onClose={() => setQuickPanelOpen(false)} 
        />
        
        {/* Toast Container - уведомления */}
        <ToastContainer position="bottom-left" />
      </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Страницы аутентификации - отдельный layout */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/account/password/reset" element={<ResetPasswordPage />} />
        <Route path="/account/password/new" element={<NewPasswordPage />} />
        
        {/* Основное приложение */}
        <Route path="*" element={<AppContent />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
