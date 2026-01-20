import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import './ErrorPage.css';

interface ErrorPageProps {
  errorCode: number;
}

const errorDetails: { [key: number]: { icon: string; title: { [key: string]: string }; message: { [key: string]: string } } } = {
  404: {
    icon: 'bi-search',
    title: {
      ru: 'Страница не найдена',
      en: 'Page Not Found',
    },
    message: {
      ru: 'Запрашиваемая страница не существует или была перемещена. Пожалуйста, проверьте URL или вернитесь на главную страницу.',
      en: 'The requested page does not exist or has been moved. Please check the URL or return to the home page.',
    },
  },
  500: {
    icon: 'bi-server',
    title: {
      ru: 'Внутренняя ошибка сервера',
      en: 'Internal Server Error',
    },
    message: {
      ru: 'Что-то пошло не так на нашей стороне. Мы уже работаем над решением проблемы. Попробуйте обновить страницу позже.',
      en: 'Something went wrong on our end. We are already working on fixing the problem. Please try refreshing the page later.',
    },
  },
  403: {
    icon: 'bi-lock-fill',
    title: {
      ru: 'Доступ запрещен',
      en: 'Access Denied',
    },
    message: {
      ru: 'У вас нет прав для доступа к этой странице. Если вы считаете, что это ошибка, обратитесь к администратору.',
      en: 'You do not have permission to access this page. If you believe this is an error, please contact an administrator.',
    },
  },
    401: {
    icon: 'bi-shield-lock-fill',
    title: {
        ru: 'Неавторизованный доступ',
        en: 'Unauthorized',
    },
    message: {
        ru: 'Для доступа к этой странице требуется аутентификация. Пожалуйста, войдите в систему.',
        en: 'Authentication is required to access this page. Please log in.',
    },
    },
  503: {
    icon: 'bi-tools',
    title: {
      ru: 'Сервис недоступен',
      en: 'Service Unavailable',
    },
    message: {
      ru: 'Сервис временно недоступен из-за технического обслуживания. Пожалуйста, попробуйте позже.',
      en: 'The service is temporarily unavailable due to maintenance. Please try again later.',
    },
  },
};

const defaultError = {
  icon: 'bi-exclamation-triangle-fill',
  title: {
    ru: 'Произошла ошибка',
    en: 'An Error Occurred',
  },
  message: {
    ru: 'Произошла непредвиденная ошибка. Пожалуйста, попробуйте еще раз.',
    en: 'An unexpected error has occurred. Please try again.',
  },
};

const buttonText = {
  ru: 'Вернуться на главную',
  en: 'Return to Home',
};

const backButtonText = {
  ru: 'На предыдущую страницу',
  en: 'Go Back',
};

const ErrorPage: React.FC<ErrorPageProps> = ({ errorCode }) => {
  const { state } = useAppContext();
  const navigate = useNavigate();
  const lang = state.language === 'ru' ? 'ru' : 'en';

  const details = errorDetails[errorCode] || defaultError;

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="error-container">
      <div className="error-card">
        <i className={`bi ${details.icon} error-icon`}></i>
        <div className="error-code">{errorCode}</div>
        <h1 className="error-title">{details.title[lang]}</h1>
        <p className="error-message">{details.message[lang]}</p>
        <div className="error-buttons">
          <Link to="/" className="error-page-btn-primary">
            <i className="bi bi-house-door me-2"></i>
            <span>{buttonText[lang]}</span>
          </Link>
          <button onClick={handleGoBack} className="error-page-btn-secondary">
            <i className="bi bi-arrow-left me-2"></i>
            <span>{backButtonText[lang]}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage; 