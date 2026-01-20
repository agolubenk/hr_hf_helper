import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import './LoginPage.css'; // Reusing styles from LoginPage
import StandalonePageControls from '../components/StandalonePageControls';
import ThemeSync from '../components/ThemeSync';

const NewPasswordPageContent: React.FC = () => {
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
                            <i className="bi bi-key-fill"></i>
                        </div>
                        <h1 className="login-title">Создайте новый пароль</h1>
                        <p className="login-subtitle">Ваш новый пароль должен отличаться от предыдущих.</p>
                    </div>
                    <form>
                        <div className="form-floating mb-3">
                            <input type="password" className="form-control" id="newPassword" placeholder="Новый пароль" />
                            <label htmlFor="newPassword">Новый пароль</label>
                        </div>
                        <div className="form-floating mb-3">
                            <input type="password" className="form-control" id="confirmPassword" placeholder="Подтвердите пароль" />
                            <label htmlFor="confirmPassword">Подтвердите пароль</label>
                        </div>
                        <button type="submit" className="btn btn-login w-100 mt-3">Сохранить пароль</button>
                    </form>
                    <div className="login-footer mt-4">
                        <p><Link to="/login" className="btn btn-outline-primary w-100">Вернуться на страницу входа</Link></p>
                    </div>
                </div>
            </div>
        </>
    );
};

const NewPasswordPage: React.FC = () => (
    <NewPasswordPageContent />
);

export default NewPasswordPage; 