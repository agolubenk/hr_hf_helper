import React, { useState, useEffect, useMemo } from 'react';
import './components.css';

interface RegisterModalProps {
    show: boolean;
    onClose: () => void;
}

const PasswordRequirement: React.FC<{ isValid: boolean; text: string }> = ({ isValid, text }) => (
    <li className={isValid ? 'valid' : 'invalid'}>
        <i className={`bi ${isValid ? 'bi-check-circle' : 'bi-x-circle'}`}></i>
        <span>{text}</span>
    </li>
);


const RegisterModal: React.FC<RegisterModalProps> = ({ show, onClose }) => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const requirements = useMemo(() => ({
        length: password.length >= 12,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    }), [password]);

    const passwordStrength = useMemo(() => {
        const metRequirements = Object.values(requirements).filter(Boolean).length;
        if (password.length === 0) return { text: '', className: '' };
        if (metRequirements <= 2) return { text: 'Слабый', className: 'weak' };
        if (metRequirements <= 3) return { text: 'Средний', className: 'medium' };
        if (metRequirements <= 4) return { text: 'Сильный', className: 'strong' };
        return { text: 'Очень сильный', className: 'very-strong' };
    }, [password, requirements]);
    
    const passwordsMatch = useMemo(() => {
        if (confirmPassword.length === 0) return null;
        return password === confirmPassword;
    }, [password, confirmPassword]);

    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [onClose]);

    if (!show) return null;

    return (
        <>
            <div className="modal-backdrop fade show"></div>
            <div className="modal fade show" style={{ display: 'block' }} tabIndex={-1} onClick={onClose}>
                <div className="modal-dialog modal-dialog-centered modal-lg" onClick={(e) => e.stopPropagation()}>
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Регистрация</h5>
                            <button type="button" className="btn-close" onClick={onClose}></button>
                        </div>
                        <div className="modal-body">
                            <form className="register-form">
                                {/* Fields for name, email, phone */}
                                <div className="form-floating">
                                    <input type="text" className="form-control" id="firstName" placeholder="Имя" />
                                    <label htmlFor="firstName">Имя</label>
                                </div>
                                <div className="form-floating">
                                    <input type="text" className="form-control" id="lastName" placeholder="Фамилия" />
                                    <label htmlFor="lastName">Фамилия</label>
                                </div>
                                <div className="form-floating">
                                    <input type="email" className="form-control" id="registerEmail" placeholder="Email"/>
                                    <label htmlFor="registerEmail">Email</label>
                                </div>
                                <div className="form-floating">
                                    <input type="tel" className="form-control" id="phone" placeholder="Телефон" />
                                    <label htmlFor="phone">Телефон</label>
                                </div>

                                {/* Password section */}
                                <div className="password-section-wide">
                                    <div className="password-section">
                                        <div className="password-fields">
                                            <div className="form-floating">
                                                <input 
                                                    type="password" 
                                                    className="form-control" 
                                                    id="registerPassword" 
                                                    placeholder="Пароль"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                />
                                                <label htmlFor="registerPassword">Пароль</label>
                                            </div>
                                            <div className="password-requirements">
                                                <ul>
                                                    <PasswordRequirement isValid={requirements.length} text="Минимум 12 символов" />
                                                    <PasswordRequirement isValid={requirements.uppercase} text="Минимум 1 заглавная буква" />
                                                    <PasswordRequirement isValid={requirements.lowercase} text="Минимум 1 строчная буква" />
                                                    <PasswordRequirement isValid={requirements.number} text="Минимум 1 цифра" />
                                                    <PasswordRequirement isValid={requirements.special} text="Минимум 1 спец. символ" />
                                                </ul>
                                            </div>
                                        </div>
                                        <div className="password-info">
                                             <div className="form-floating">
                                                <input 
                                                    type="password" 
                                                    className="form-control" 
                                                    id="confirmPassword" 
                                                    placeholder="Подтвердите пароль"
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                />
                                                <label htmlFor="confirmPassword">Подтвердите пароль</label>
                                            </div>
                                            {passwordsMatch !== null && (
                                                <div className={`password-match ${passwordsMatch ? 'valid' : 'invalid'}`}>
                                                    <i className={`bi ${passwordsMatch ? 'bi-check-circle' : 'bi-x-circle'}`}></i>
                                                    <span>{passwordsMatch ? 'Пароли совпадают' : 'Пароли не совпадают'}</span>
                                                </div>
                                            )}
                                            <div className="password-strength">
                                                <div className="password-strength-title">Сложность пароля</div>
                                                <div className="password-strength-bar">
                                                    <div className={`password-strength-bar-fill ${passwordStrength.className}`}></div>
                                                </div>
                                                <div className="password-strength-text">{passwordStrength.text}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="form-check" style={{gridColumn: 'span 2'}}>
                                    <input className="form-check-input" type="checkbox" id="terms"/>
                                    <label className="form-check-label" htmlFor="terms">
                                        Я согласен с <a href="/#">условиями использования</a>
                                    </label>
                                </div>
                            </form>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-login w-100">Зарегистрироваться</button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default RegisterModal; 