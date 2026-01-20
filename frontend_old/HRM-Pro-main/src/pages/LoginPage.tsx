import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './LoginPage.css';
import RegisterModal from '../components/RegisterModal';
import StandalonePageControls from '../components/StandalonePageControls';
import ThemeSync from '../components/ThemeSync';

const LoginPageContent: React.FC = () => {
    const [showRegisterModal, setShowRegisterModal] = useState(false);

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
                            <i className="bi bi-hexagon-fill"></i>
                        </div>
                        <h1 className="login-title">Вход в систему</h1>
                        <p className="login-subtitle">Добро пожаловать! Пожалуйста, войдите в свой аккаунт.</p>
                    </div>
                    <form>
                        <div className="form-floating mb-3">
                            <input type="email" className="form-control" id="floatingInput" placeholder="name@example.com" />
                            <label htmlFor="floatingInput">Электронная почта</label>
                        </div>
                        <div className="form-floating">
                            <input type="password" className="form-control" id="floatingPassword" placeholder="Password" />
                            <label htmlFor="floatingPassword">Пароль</label>
                        </div>
                        <div className="d-flex justify-content-between align-items-center mt-3">
                            <div className="form-check">
                                <input className="form-check-input" type="checkbox" value="" id="rememberMe" />
                                <label className="form-check-label" htmlFor="rememberMe">
                                    Запомнить меня
                                </label>
                            </div>
                            <Link to="/account/password/reset" className="forgot-password-link">Забыли пароль?</Link>
                        </div>
                        <button type="submit" className="btn btn-login w-100 mt-4">Войти</button>
                    </form>
                    <div className="login-footer mt-4">
                        <button type="button" className="btn btn-register w-100" onClick={() => setShowRegisterModal(true)}>
                            Регистрация
                        </button>
                    </div>
                </div>
            </div>
            <RegisterModal show={showRegisterModal} onClose={() => setShowRegisterModal(false)} />
        </>
    );
};

const LoginPage: React.FC = () => (
    <LoginPageContent />
);

export default LoginPage; 