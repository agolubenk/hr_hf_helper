import React, { Suspense, lazy, useEffect, useRef } from 'react';
import './App.css';
import {
  createBrowserRouter,
  Outlet,
  RouterProvider,
} from "react-router-dom";
import Navigation from './components/Navigation';
import { AppProvider, useAppContext } from './context/AppContext';
import { ToastProvider } from './context/ToastContext';
import { moduleSubmenus } from './constants';
import ErrorPage from './pages/ErrorPage';
import LoginPage from './pages/LoginPage';
import ModuleGrid from './components/ModuleGrid';
import ResetPasswordPage from './pages/ResetPasswordPage';
import NewPasswordPage from './pages/NewPasswordPage';
import ToastContainer from './components/ToastContainer';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import SystemSettingsPage from './pages/systemsettings/SystemSettingsPage';
import QuickPanel from './components/QuickPanel';
import FloatingActions from './components/FloatingActions';
import ModuleSubmenu from './components/ModuleSubmenu';
import CommandCenter from './components/CommandCenter';
import StatWidgets from './components/StatWidgets';
import Tray from './components/Tray';
import CBPage from './pages/CBPage';
import SalariesPage from './pages/cb/SalariesPage';
import BonusesPage from './pages/cb/BonusesPage';
import MarketAnalyticsPage from './pages/cb/MarketAnalyticsPage';
import SystemGeneralSettings from './pages/systemsettings/SystemGeneralSettings';
import SystemUsersSettings from './pages/systemsettings/SystemUsersSettings';
import SystemSecuritySettings from './pages/systemsettings/SystemSecuritySettings';
import SystemIntegrationsSettings from './pages/systemsettings/SystemIntegrationsSettings';
import SystemThemeSettings from './pages/systemsettings/SystemThemeSettings';
import ComponentsDemoPage from './pages/components/ComponentsDemoPage';
import ThemeSync from './components/ThemeSync';
import { useActiveModule } from './hooks/useActiveModule';

// Lazy loading для страниц, которые не загружаются сразу
const ActivityLogPage = lazy(() => import('./pages/ActivityLogPage'));

// Компонент загрузки
const LoadingSpinner = () => (
  <div className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
    <div className="spinner-border text-primary" role="status">
      <span className="visually-hidden">Загрузка...</span>
    </div>
  </div>
);

// Компонент-обертка для главной страницы
const MainPage = () => {
  return (
    <>
      <CommandCenter />
      <StatWidgets />
      <ModuleGrid />
    </>
  );
};

// Компонент-обертка для страниц ошибок
const ErrorPageWrapper: React.FC<{ errorCode: number }> = ({ errorCode }) => {
  return (
    <div className="h-100 d-flex align-items-center justify-content-center">
      <ErrorPage errorCode={errorCode} />
    </div>
  );
};

const AppLayout = ({ searchInputRef }: { searchInputRef: React.RefObject<HTMLInputElement | null> }) => {
  const { state } = useAppContext();
  const hasSubmenu = state.activeModule && moduleSubmenus[state.activeModule]?.length > 0;
  const mainContentClass = `main-content ${hasSubmenu ? 'with-submenu' : ''}`;
  
  // Используем хук для автоматической установки активного модуля
  useActiveModule();

  return (
    <div className="app-container">
      <ThemeSync />
      <Navigation searchInputRef={searchInputRef} />
      <ModuleSubmenu />
      <QuickPanel />
      <main className={mainContentClass}>
        <Outlet />
      </main>
      <FloatingActions />
      <Tray />
    </div>
  );
};

const AppWithProviders: React.FC<{ searchInputRef: React.RefObject<HTMLInputElement | null> }> = ({ searchInputRef }) => {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <AppLayout searchInputRef={searchInputRef} />,
      children: [
        {
          index: true,
          element: <MainPage />
        },
        {
          path: "/account/profile",
          element: <ProfilePage />,
        },
        {
          path: "/account/settings",
          element: <SettingsPage />,
        },
        {
          path: "/settings/*",
          element: <SystemSettingsPage />,
        },
        {
          path: "/cb",
          element: <CBPage />,
        },
        {
          path: "/cb/salaries",
          element: <SalariesPage />,
        },
        {
          path: "/cb/bonuses",
          element: <BonusesPage />,
        },
        {
          path: "/cb/market-analytics",
          element: <MarketAnalyticsPage />,
        },
        {
          path: "/account/activity-log",
          element: (
            <Suspense fallback={<LoadingSpinner />}>
              <ActivityLogPage />
            </Suspense>
          )
        },
        {
          path: "/401",
          element: <ErrorPageWrapper errorCode={401} />
        },
        {
          path: "/403",
          element: <ErrorPageWrapper errorCode={403} />
        },
        {
          path: "/404",
          element: <ErrorPageWrapper errorCode={404} />
        },
        {
          path: "/500",
          element: <ErrorPageWrapper errorCode={500} />
        },
        {
          path: "/503",
          element: <ErrorPageWrapper errorCode={503} />
        },
        {
          path: "/settings/general",
          element: <SystemGeneralSettings />,
        },
        {
          path: "/settings/users",
          element: <SystemUsersSettings />,
        },
        {
          path: "/settings/security",
          element: <SystemSecuritySettings />,
        },
        {
          path: "/settings/integrations",
          element: <SystemIntegrationsSettings />,
        },
        {
          path: "/settings/theme",
          element: <SystemThemeSettings />,
        },
        {
          path: "/cb/benefits",
          element: <div className="content-area"><h2>Управление льготами</h2><p>Страница в разработке...</p></div>,
        },
        {
          path: "/cb/calculator",
          element: <div className="content-area"><h2>Калькулятор компенсаций</h2><p>Страница в разработке...</p></div>,
        },
        {
          path: "/cb/grades",
          element: <div className="content-area"><h2>Управление грейдами</h2><p>Страница в разработке...</p></div>,
        },
        {
          path: "/components/demo",
          element: <ComponentsDemoPage />,
        },
        {
          path: "*",
          element: <ErrorPageWrapper errorCode={404} />,
        },
      ],
    },
    {
      path: "/login",
      element: <LoginPage />,
    },
    {
      path: "/account/password/reset",
      element: <ResetPasswordPage />,
    },
    {
      path: "/account/password/new",
      element: <NewPasswordPage />,
    }
  ]);

  return (
    <AppProvider>
      <ToastProvider>
        <ToastContainer />
        <RouterProvider router={router} />
      </ToastProvider>
    </AppProvider>
  );
};

function App() {
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toLowerCase().includes('mac');
      if ((isMac && e.metaKey && e.key.toLowerCase() === 'k') || (!isMac && e.ctrlKey && e.key.toLowerCase() === 'k')) {
        e.preventDefault();
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <AppWithProviders searchInputRef={searchInputRef} />
  );
}

export default App;
