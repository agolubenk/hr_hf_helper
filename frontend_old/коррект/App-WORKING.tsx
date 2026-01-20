import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import UICheatsheet from './pages/UICheatsheet';
import CopyFloatingGroup from './components/CopyFloatingGroup';
import QuickPanel from './components/QuickPanel';
import ToastContainer from './components/ToastContainer';
import HomePage from './pages/HomePage';
import FloatingActions from './components/FloatingActions';
import ScrollToTop from './components/ScrollToTop';
import type { CopyFloatingAction } from './components/CopyFloatingGroup';
import { showNotImplementedToast } from './utils/showNotImplementedToast';
import './App.css';

function App() {
  const [quickPanelOpen, setQuickPanelOpen] = useState(false);

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
    <BrowserRouter>
      <div className="app-container">
        {/* Верхний заголовок */}
        <Header onQuickPanelToggle={() => setQuickPanelOpen(!quickPanelOpen)} />

        {/* Основной контент */}
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/ui-cheatsheet" element={<UICheatsheet />} />
          </Routes>
        </main>

        {/* Нижний footer */}
        <Footer />

        {/* Плавающие элементы */}
        <CopyFloatingGroup actions={floatingActions} />
        <FloatingActions />
        <ScrollToTop />

        {/* Боковые панели */}
        <QuickPanel isOpen={quickPanelOpen} onClose={() => setQuickPanelOpen(false)} />

        {/* Уведомления (toasts) */}
        <ToastContainer position="bottom-left" />
      </div>
    </BrowserRouter>
  );
}

export default App;