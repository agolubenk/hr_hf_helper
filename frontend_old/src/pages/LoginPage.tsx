import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { api } from '../utils/api';
import { toastSuccess, toastError } from '../utils/toastHelper';
import { showNotImplementedToast } from '../utils/showNotImplementedToast';
import './LoginPage.css';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Получаем email из state при загрузке страницы (если переходим с ResetPasswordPage)
  useEffect(() => {
    if (location.state && typeof location.state === 'object' && 'email' in location.state) {
      setEmail(location.state.email as string);
    }
  }, [location.state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await api.login(email, password);
      
      if (rememberMe) {
        // Сохраняем email для следующего входа
        localStorage.setItem('remembered_email', email);
      } else {
        localStorage.removeItem('remembered_email');
      }

      toastSuccess('Вход выполнен успешно', 'Добро пожаловать!');
      
      // Перенаправляем на главную страницу
      const redirectTo = location.state?.from || '/';
      navigate(redirectTo, { replace: true });
    } catch (error: any) {
      // Обрабатываем разные типы ошибок
      let errorMessage = 'Ошибка при входе. Проверьте email и пароль.';
      let errorTitle = 'Ошибка входа';
      
      console.log('Login error object:', error);
      console.log('Login error.response:', error.response);
      
      // Проверяем разные форматы ошибок
      let errorData: any = null;
      
      // FastAPI возвращает ошибки в error.response?.data
      if (error.response?.data) {
        errorData = error.response.data;
      } 
      // Или в error.response (если это уже распарсенный объект)
      else if (error.response && typeof error.response === 'object' && !error.response.data) {
        errorData = error.response;
      }
      // Или в самом error (если это объект с полями)
      else if (error.detail || error.error_type || error.error_code) {
        errorData = error;
      }
      
      if (errorData) {
        // Если ошибка в формате с error_type или error_code
        const errorType = errorData.error_type || errorData.error_code;
        const detail = errorData.detail || errorData.message;
        
        if (errorType === 'user_not_found') {
          errorMessage = 'Пользователь с таким email не найден. Проверьте правильность введенного email.';
          errorTitle = 'Пользователь не найден';
        } else if (errorType === 'invalid_password') {
          errorMessage = 'Неверный пароль. Проверьте правильность введенного пароля.';
          errorTitle = 'Неверный пароль';
        } else if (detail) {
          // Используем detail из ответа, но проверяем на ключевые слова
          const detailLower = detail.toLowerCase();
          if (detailLower.includes('не найден') || detailLower.includes('not found') || detailLower.includes('user not found')) {
            errorMessage = 'Пользователь с таким email не найден. Проверьте правильность введенного email.';
            errorTitle = 'Пользователь не найден';
          } else if (detailLower.includes('неверный пароль') || detailLower.includes('invalid password') || detailLower.includes('wrong password')) {
            errorMessage = 'Неверный пароль. Проверьте правильность введенного пароля.';
            errorTitle = 'Неверный пароль';
          } else {
            errorMessage = detail;
          }
        }
      } else if (error.message) {
        // Если ошибка в формате Error
        const errorMsg = error.message.toLowerCase();
        if (errorMsg.includes('user not found') || errorMsg.includes('пользователь не найден') || errorMsg.includes('не найден')) {
          errorMessage = 'Пользователь с таким email не найден. Проверьте правильность введенного email.';
          errorTitle = 'Пользователь не найден';
        } else if (errorMsg.includes('invalid password') || errorMsg.includes('неверный пароль') || errorMsg.includes('wrong password')) {
          errorMessage = 'Неверный пароль. Проверьте правильность введенного пароля.';
          errorTitle = 'Неверный пароль';
        } else {
          errorMessage = error.message;
        }
      }
      
      toastError(errorMessage, errorTitle);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    showNotImplementedToast();
  };

  const handleTelegramLogin = () => {
    showNotImplementedToast();
  };

  // Загружаем сохраненный email при монтировании
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('remembered_email');
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleForgotPassword = () => {
    // Передаем email в state при переходе на страницу сброса пароля
    navigate('/account/password/reset', { 
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
                <i className="bi bi-hexagon-fill"></i>
              </div>
              <h1 className="login-title">Вход в систему</h1>
              <p className="login-subtitle">Добро пожаловать! Пожалуйста, войдите в свой аккаунт.</p>
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
              
              <div className="form-floating mb-3">
                <input 
                  type="password" 
                  className="form-control" 
                  id="floatingPassword" 
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <label htmlFor="floatingPassword">Пароль</label>
              </div>
              
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="form-check">
                  <input 
                    className="form-check-input" 
                    type="checkbox" 
                    id="rememberMe"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="rememberMe">
                    Запомнить меня
                  </label>
                </div>
                <a 
                  href="#" 
                  className="text-decoration-none"
                  onClick={(e) => {
                    e.preventDefault();
                    handleForgotPassword();
                  }}
                >
                  Забыли пароль?
                </a>
              </div>
              
              <button 
                type="submit" 
                className="btn btn-primary w-100 mb-4"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Вход...
                  </>
                ) : (
                  'Войти'
                )}
              </button>
            </form>
            
            <div className="login-divider">
              <div className="divider-line"></div>
              <span className="divider-text">или</span>
              <div className="divider-line"></div>
            </div>
            
            <div className="login-social">
              <button 
                type="button" 
                className="btn btn-outline-danger flex-fill"
                onClick={handleGoogleLogin}
              >
                <i className="bi bi-google"></i>
                <span>Google</span>
              </button>
              <button 
                type="button" 
                className="btn btn-outline-info flex-fill"
                onClick={handleTelegramLogin}
              >
                <i className="bi bi-telegram"></i>
                <span>Telegram</span>
              </button>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default LoginPage;

