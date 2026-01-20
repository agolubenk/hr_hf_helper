import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import './LoginPage.css'; // Reusing styles from LoginPage
import StandalonePageControls from '../components/StandalonePageControls';
import ThemeSync from '../components/ThemeSync';

const ResetPasswordPageContent: React.FC = () => {
    useEffect(() => {
        document.body.classList.add('login-page-body');
        return () => {
            document.body.classList.remove('login-page-body');
        };
    }, []);

    return (
        <>
            <ThemeSync />
            <StandalonePageControls />
            <div className="login-container">
                <div className="login-card">
                    <div className="login-header">
                        <div className="login-logo">
                            <i className="bi bi-shield-lock-fill"></i>
                        </div>
                        <h1 className="login-title">Сброс пароля</h1>
                        <p className="login-subtitle">Введите ваш email, и мы вышлем инструкцию по восстановлению.</p>
                    </div>
                    <form>
                        <div className="form-floating mb-3">
                            <input type="email" className="form-control" id="floatingInput" placeholder="name@example.com" />
                            <label htmlFor="floatingInput">Электронная почта</label>
                        </div>
                        <button type="submit" className="btn btn-login w-100 mt-3">Отправить инструкцию</button>
                    </form>
                    <div className="login-footer mt-4">
                        <p><Link to="/login" className="btn btn-outline-primary w-100">Вернуться на страницу входа</Link></p>
                    </div>
                </div>
            </div>
        </>
    );
};

const ResetPasswordPage: React.FC = () => (
    <ResetPasswordPageContent />
);

export default ResetPasswordPage; 