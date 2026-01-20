import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { showNotImplementedToast } from '../utils/showNotImplementedToast';
import { toastSuccess, toastError } from '../utils/toastHelper';
import './LoginPage.css';

const NewPasswordPage: React.FC = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPassword || !confirmPassword) {
      toastError('Пожалуйста, заполните все поля', 'Ошибка валидации');
      return;
    }

    if (newPassword !== confirmPassword) {
      toastError('Пароли не совпадают', 'Ошибка валидации');
      return;
    }

    if (newPassword.length < 8) {
      toastError('Пароль должен содержать минимум 8 символов', 'Ошибка валидации');
      return;
    }

    setIsLoading(true);
    
    // Здесь будет логика сохранения нового пароля
    // Для демонстрации используем toast
    setTimeout(() => {
      setIsLoading(false);
      toastSuccess('Пароль успешно изменен', 'Успех');
      // После успешного сохранения перенаправляем на страницу входа:
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    }, 1000);
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
                <i className="bi bi-key-fill"></i>
              </div>
              <h1 className="login-title">Создайте новый пароль</h1>
              <p className="login-subtitle">Ваш новый пароль должен отличаться от предыдущих.</p>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-floating mb-3">
                <input 
                  type="password" 
                  className="form-control" 
                  id="newPassword" 
                  placeholder="Новый пароль"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                />
                <label htmlFor="newPassword">Новый пароль</label>
              </div>
              
              <div className="form-floating mb-3">
                <input 
                  type="password" 
                  className="form-control" 
                  id="confirmPassword" 
                  placeholder="Подтвердите пароль"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                />
                <label htmlFor="confirmPassword">Подтвердите пароль</label>
              </div>
              
              <button 
                type="submit" 
                className="btn btn-primary w-100 mb-4"
                disabled={isLoading}
              >
                {isLoading ? 'Сохранение...' : 'Сохранить пароль'}
              </button>
            </form>
            
            <div className="login-footer mt-4">
              <Link to="/login" className="btn btn-outline-primary w-100">
                Вернуться на страницу входа
              </Link>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default NewPasswordPage;

