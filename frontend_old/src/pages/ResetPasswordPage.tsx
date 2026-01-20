import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { showNotImplementedToast } from '../utils/showNotImplementedToast';
import { toastSuccess } from '../utils/toastHelper';
import './LoginPage.css';

const ResetPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Получаем email из state при загрузке страницы (если переходим с LoginPage)
  useEffect(() => {
    if (location.state && typeof location.state === 'object' && 'email' in location.state) {
      setEmail(location.state.email as string);
    }
  }, [location.state]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      showNotImplementedToast();
      return;
    }

    setIsLoading(true);
    
    // Здесь будет логика отправки инструкции по восстановлению пароля
    // Для демонстрации используем toast
    setTimeout(() => {
      setIsLoading(false);
      toastSuccess('Инструкция по восстановлению пароля отправлена на вашу электронную почту', 'Письмо отправлено');
      // После успешной отправки можно перенаправить:
      // navigate('/login');
    }, 1000);
  };

  const handleBackToLogin = () => {
    // Передаем email обратно на страницу входа
    navigate('/login', { 
      state: { email } 
    });
  };

  return (
    <div className="login-page">
      <Header 
        hideSearch={true}
        hideQuickPanel={true}
        hideNotifications={true}
        hideProfile={true}
        allowedLanguages={['ru', 'en']}
        allowedThemes={['light', 'dark']}
      />
      
      <main className="login-main">
        <div className="login-container">
          <div className="login-card">
            <div className="login-header">
              <div className="login-logo">
                <i className="bi bi-shield-lock-fill"></i>
              </div>
              <h1 className="login-title">Сброс пароля</h1>
              <p className="login-subtitle">Введите ваш email, и мы вышлем инструкцию по восстановлению.</p>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-floating mb-3">
                <input 
                  type="email" 
                  className="form-control" 
                  id="floatingInput" 
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <label htmlFor="floatingInput">Электронная почта</label>
              </div>
              
              <button 
                type="submit" 
                className="btn btn-primary w-100 mb-4"
                disabled={isLoading}
              >
                {isLoading ? 'Отправка...' : 'Отправить инструкцию'}
              </button>
            </form>
            
            <div className="login-footer mt-4">
              <button 
                type="button"
                className="btn btn-outline-primary w-100"
                onClick={handleBackToLogin}
              >
                Вернуться на страницу входа
              </button>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ResetPasswordPage;

