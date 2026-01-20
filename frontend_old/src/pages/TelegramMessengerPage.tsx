import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { toastSuccess, toastError } from '../utils/toastHelper';
import { getUser } from '../utils/auth';
import './TelegramMessengerPage.css';

interface Chat {
  id: number;
  type: string;
  title: string;
  username?: string;
  unread_count: number;
  last_message_date?: string;
  is_pinned: boolean;
}

interface Message {
  id: number;
  date: string;
  text: string;
  from_user?: {
    id: number;
    username?: string;
    first_name?: string;
    last_name?: string;
  };
  is_outgoing: boolean;
  media_type?: string;
}

type AuthStep = 'not_authorized' | 'auth_method' | 'phone' | 'code' | 'qr' | '2fa' | 'authorized';
type AuthMethod = 'sms' | 'qr';

const TelegramMessengerPage: React.FC = () => {
  const [authStep, setAuthStep] = useState<AuthStep>('not_authorized');
  const [authMethod, setAuthMethod] = useState<AuthMethod | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [code, setCode] = useState('');
  const [password2FA, setPassword2FA] = useState('');
  const [qrUrl, setQrUrl] = useState<string>('');
  const [qrToken, setQrToken] = useState<string>('');
  const [qrPolling, setQrPolling] = useState<NodeJS.Timeout | null>(null);
  const [companyId, setCompanyId] = useState<string>('');
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingChats, setLoadingChats] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);

  useEffect(() => {
    // Получаем company_id из пользователя
    const loadCompanyId = async () => {
      try {
        const user = getUser();
        if (user?.company_id) {
          setCompanyId(user.company_id);
          checkAuthStatus(user.company_id);
          return;
        }

        // Пытаемся получить из API
        try {
          const profile: any = await api.getProfile();
          if (profile?.company_id) {
            setCompanyId(profile.company_id);
            checkAuthStatus(profile.company_id);
            return;
          }
        } catch (profileError) {
          console.warn('Failed to get profile, trying getCurrentUser:', profileError);
        }

        // Пытаемся получить из getCurrentUser
        try {
          const currentUser: any = await api.getCurrentUser();
          if (currentUser?.company_id) {
            setCompanyId(currentUser.company_id);
            checkAuthStatus(currentUser.company_id);
            return;
          }
        } catch (userError) {
          console.warn('Failed to get current user:', userError);
        }

        // Если ничего не помогло, показываем ошибку
        toastError('Не удалось определить компанию. Пожалуйста, войдите в систему заново.', 'Ошибка');
      } catch (error) {
        console.error('Error loading company ID:', error);
        toastError('Ошибка при загрузке данных компании', 'Ошибка');
      }
    };

    loadCompanyId();
  }, []);

  const checkAuthStatus = async (cid: string) => {
    try {
      const status = await api.getTelegramAuthStatus(cid);
      if (status && status.status === 'authorized') {
        setAuthStep('authorized');
        loadChats(cid);
      } else {
        setAuthStep('auth_method');
      }
    } catch (error: any) {
      console.error('Failed to check auth status:', error);
      setAuthStep('auth_method');
    }
  };

  const handleSelectAuthMethod = (method: AuthMethod) => {
    setAuthMethod(method);
    if (method === 'sms') {
      setAuthStep('phone');
    } else if (method === 'qr') {
      handleGenerateQR();
    }
  };

  const handleGenerateQR = async () => {
    if (!companyId) return;

    setLoading(true);
    try {
      const result = await api.generateTelegramQR(companyId);
      if (result.success) {
        setQrUrl(result.qr_url);
        setQrToken(result.qr_token);
        setAuthStep('qr');
        startQRPolling();
        toastSuccess('QR код сгенерирован', 'Отсканируйте код в Telegram');
      }
    } catch (error: any) {
      toastError(error.response?.data?.error || error.message || 'Ошибка при генерации QR кода', 'Ошибка');
    } finally {
      setLoading(false);
    }
  };

  const startQRPolling = () => {
    // Останавливаем предыдущий polling если есть
    if (qrPolling) {
      clearInterval(qrPolling);
    }

    // Запускаем проверку статуса каждые 2 секунды
    const interval = setInterval(async () => {
      if (!companyId) return;

      try {
        const result = await api.checkTelegramQRStatus(companyId);
        if (result.success && result.authorized) {
          // Авторизация успешна
          clearInterval(interval);
          setQrPolling(null);
          setAuthStep('authorized');
          toastSuccess('Авторизация успешна', 'Добро пожаловать!');
          loadChats(companyId);
        }
      } catch (error: any) {
        // Игнорируем ошибки при polling
        console.debug('QR status check:', error);
      }
    }, 2000);

    setQrPolling(interval);

    // Останавливаем через 5 минут
    setTimeout(() => {
      clearInterval(interval);
      setQrPolling(null);
    }, 5 * 60 * 1000);
  };

  useEffect(() => {
    // Очистка polling при размонтировании
    return () => {
      if (qrPolling) {
        clearInterval(qrPolling);
      }
    };
  }, [qrPolling]);

  const handleSendPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId || !phoneNumber) return;

    setLoading(true);
    try {
      await api.sendTelegramPhone(companyId, phoneNumber);
      setAuthStep('code');
      toastSuccess('Код отправлен', 'Проверьте Telegram');
    } catch (error: any) {
      toastError(error.response?.data?.error || error.message || 'Ошибка при отправке номера', 'Ошибка');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId || !code) return;

    setLoading(true);
    try {
      const result = await api.verifyTelegramCode(companyId, code);
      if (result.success && result['2fa_required']) {
        setAuthStep('2fa');
        toastSuccess('Требуется пароль 2FA', 'Введите пароль');
      } else if (result.success) {
        setAuthStep('authorized');
        toastSuccess('Авторизация успешна', 'Добро пожаловать!');
        loadChats(companyId);
      }
    } catch (error: any) {
      toastError(error.response?.data?.error || error.message || 'Неверный код', 'Ошибка');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId || !password2FA) return;

    setLoading(true);
    try {
      const result = await api.verifyTelegram2FA(companyId, password2FA);
      if (result.success) {
        setAuthStep('authorized');
        toastSuccess('Авторизация успешна', 'Добро пожаловать!');
        loadChats(companyId);
      }
    } catch (error: any) {
      toastError(error.response?.data?.error || error.message || 'Неверный пароль', 'Ошибка');
    } finally {
      setLoading(false);
    }
  };

  const loadChats = async (cid: string) => {
    setLoadingChats(true);
    try {
      const result = await api.getTelegramChats(cid);
      if (result.success) {
        setChats(result.chats || []);
      }
    } catch (error: any) {
      toastError(error.response?.data?.error || error.message || 'Ошибка при загрузке чатов', 'Ошибка');
    } finally {
      setLoadingChats(false);
    }
  };

  const loadMessages = async (chatId: number) => {
    if (!companyId) return;

    setLoadingMessages(true);
    try {
      const result = await api.getTelegramMessages(companyId, chatId);
      if (result.success) {
        setMessages(result.messages || []);
      }
    } catch (error: any) {
      toastError(error.response?.data?.error || error.message || 'Ошибка при загрузке сообщений', 'Ошибка');
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSelectChat = (chatId: number) => {
    setSelectedChat(chatId);
    loadMessages(chatId);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId || !selectedChat || !messageText.trim()) return;

    setLoading(true);
    try {
      await api.sendTelegramMessage(companyId, selectedChat, messageText);
      setMessageText('');
      toastSuccess('Сообщение отправлено', 'Успешно');
      // Перезагружаем сообщения
      loadMessages(selectedChat);
    } catch (error: any) {
      toastError(error.response?.data?.error || error.message || 'Ошибка при отправке сообщения', 'Ошибка');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (!companyId) return;

    // Останавливаем polling если активен
    if (qrPolling) {
      clearInterval(qrPolling);
      setQrPolling(null);
    }

    try {
      await api.logoutTelegram(companyId);
      setAuthStep('auth_method');
      setChats([]);
      setSelectedChat(null);
      setMessages([]);
      setQrUrl('');
      setQrToken('');
      toastSuccess('Выход выполнен', 'Успешно');
    } catch (error: any) {
      toastError(error.response?.data?.error || error.message || 'Ошибка при выходе', 'Ошибка');
    }
  };

  // Если company_id не загружен, показываем сообщение
  if (!companyId && authStep === 'not_authorized') {
    return (
      <div className="telegram-messenger-page">
        <div className="telegram-auth-container">
          <div className="telegram-auth-card">
            <h2>Загрузка...</h2>
            <p className="text-muted">Определение компании...</p>
            <div className="text-center">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Загрузка...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Выбор метода авторизации
  if (authStep === 'auth_method') {
    return (
      <div className="telegram-messenger-page">
        <div className="telegram-auth-container">
          <div className="telegram-auth-card">
            <h2>Авторизация в Telegram</h2>
            <p className="text-muted">Выберите способ авторизации</p>
            {!companyId ? (
              <div className="alert alert-warning">
                Не удалось определить компанию. Пожалуйста, обновите страницу.
              </div>
            ) : (
              <div className="d-grid gap-3">
                <button
                  type="button"
                  className="btn btn-outline-primary btn-lg"
                  onClick={() => handleSelectAuthMethod('qr')}
                  disabled={loading}
                >
                  <i className="bi bi-qr-code me-2"></i>
                  Авторизация через QR код
                </button>
                <button
                  type="button"
                  className="btn btn-outline-primary btn-lg"
                  onClick={() => handleSelectAuthMethod('sms')}
                  disabled={loading}
                >
                  <i className="bi bi-phone me-2"></i>
                  Авторизация через SMS
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Форма авторизации через SMS
  if (authStep === 'phone') {
    return (
      <div className="telegram-messenger-page">
        <div className="telegram-auth-container">
          <div className="telegram-auth-card">
            <h2>Авторизация в Telegram</h2>
            <p className="text-muted">Введите номер телефона для авторизации</p>
            {!companyId ? (
              <div className="alert alert-warning">
                Не удалось определить компанию. Пожалуйста, обновите страницу.
              </div>
            ) : (
              <form onSubmit={handleSendPhone}>
                <div className="mb-3">
                  <label htmlFor="phone" className="form-label">Номер телефона</label>
                  <input
                    type="tel"
                    id="phone"
                    className="form-control"
                    placeholder="+375291234567"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <button type="submit" className="btn btn-primary w-100" disabled={loading || !companyId}>
                  {loading ? 'Отправка...' : 'Отправить код'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (authStep === 'code') {
    return (
      <div className="telegram-messenger-page">
        <div className="telegram-auth-container">
          <div className="telegram-auth-card">
            <h2>Введите код</h2>
            <p className="text-muted">Код отправлен в Telegram</p>
            <form onSubmit={handleVerifyCode}>
              <div className="mb-3">
                <label htmlFor="code" className="form-label">Код подтверждения</label>
                <input
                  type="text"
                  id="code"
                  className="form-control"
                  placeholder="12345"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                  disabled={loading}
                  maxLength={6}
                />
              </div>
              <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                {loading ? 'Проверка...' : 'Подтвердить'}
              </button>
              <button
                type="button"
                className="btn btn-link w-100 mt-2"
                onClick={() => setAuthStep('auth_method')}
                disabled={loading}
              >
                Выбрать другой способ
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (authStep === '2fa') {
    return (
      <div className="telegram-messenger-page">
        <div className="telegram-auth-container">
          <div className="telegram-auth-card">
            <h2>Пароль 2FA</h2>
            <p className="text-muted">Введите пароль двухфакторной аутентификации</p>
            <form onSubmit={handleVerify2FA}>
              <div className="mb-3">
                <label htmlFor="password2FA" className="form-label">Пароль 2FA</label>
                <input
                  type="password"
                  id="password2FA"
                  className="form-control"
                  placeholder="Пароль"
                  value={password2FA}
                  onChange={(e) => setPassword2FA(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                {loading ? 'Проверка...' : 'Подтвердить'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Авторизация через QR код
  if (authStep === 'qr') {
    return (
      <div className="telegram-messenger-page">
        <div className="telegram-auth-container">
          <div className="telegram-auth-card">
            <h2>Авторизация через QR код</h2>
            <p className="text-muted">Отсканируйте QR код в приложении Telegram</p>
            {qrUrl ? (
              <>
                <div className="text-center mb-3">
                  <div 
                    className="telegram-qr-code"
                    dangerouslySetInnerHTML={{
                      __html: `<img src="https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrUrl)}" alt="QR Code" style="max-width: 100%; height: auto; border: 2px solid var(--bs-border-color); border-radius: var(--bs-border-radius); padding: 1rem; background: white;" />`
                    }}
                  />
                </div>
                <div className="alert alert-info">
                  <i className="bi bi-info-circle me-2"></i>
                  <strong>Инструкция:</strong><br />
                  Откройте Telegram на телефоне → Настройки → Устройства → Связать устройство → Отсканируйте QR код
                </div>
                <button
                  type="button"
                  className="btn btn-link w-100"
                  onClick={() => {
                    if (qrPolling) {
                      clearInterval(qrPolling);
                      setQrPolling(null);
                    }
                    setAuthStep('auth_method');
                    setQrUrl('');
                    setQrToken('');
                  }}
                >
                  <i className="bi bi-arrow-left me-2"></i>
                  Выбрать другой способ
                </button>
              </>
            ) : (
              <div className="text-center">
                <div className="spinner-border" role="status">
                  <span className="visually-hidden">Генерация QR кода...</span>
                </div>
                <p className="mt-3 text-muted">Генерация QR кода...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Основной интерфейс мессенджера
  return (
    <div className="telegram-messenger-page">
      <div className="telegram-header">
        <h3>Telegram Messenger</h3>
        <button className="btn btn-sm btn-outline-secondary" onClick={handleLogout}>
          <i className="bi bi-box-arrow-right"></i> Выход
        </button>
      </div>

      <div className="telegram-container">
        {/* Список чатов */}
        <div className="telegram-sidebar">
          <div className="telegram-sidebar-header">
            <h5>Чаты</h5>
            <button
              className="btn btn-sm btn-link"
              onClick={() => companyId && loadChats(companyId)}
              disabled={loadingChats}
            >
              <i className={`bi ${loadingChats ? 'bi-arrow-clockwise spin' : 'bi-arrow-clockwise'}`}></i>
            </button>
          </div>
          <div className="telegram-chats-list">
            {loadingChats ? (
              <div className="text-center p-3">
                <div className="spinner-border spinner-border-sm" role="status">
                  <span className="visually-hidden">Загрузка...</span>
                </div>
              </div>
            ) : chats.length === 0 ? (
              <div className="text-center p-3 text-muted">Нет чатов</div>
            ) : (
              chats.map((chat) => (
                <div
                  key={chat.id}
                  className={`telegram-chat-item ${selectedChat === chat.id ? 'active' : ''}`}
                  onClick={() => handleSelectChat(chat.id)}
                >
                  <div className="telegram-chat-avatar">
                    <i className="bi bi-person-circle"></i>
                  </div>
                  <div className="telegram-chat-info">
                    <div className="telegram-chat-title">{chat.title || chat.username || `Chat ${chat.id}`}</div>
                    <div className="telegram-chat-meta">
                      {chat.unread_count > 0 && (
                        <span className="badge bg-primary">{chat.unread_count}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Область сообщений */}
        <div className="telegram-messages-area">
          {selectedChat ? (
            <>
              <div className="telegram-messages-header">
                <h5>
                  {chats.find(c => c.id === selectedChat)?.title || 
                   chats.find(c => c.id === selectedChat)?.username || 
                   `Chat ${selectedChat}`}
                </h5>
              </div>
              <div className="telegram-messages-list">
                {loadingMessages ? (
                  <div className="text-center p-3">
                    <div className="spinner-border spinner-border-sm" role="status">
                      <span className="visually-hidden">Загрузка...</span>
                    </div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center p-3 text-muted">Нет сообщений</div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`telegram-message ${message.is_outgoing ? 'outgoing' : 'incoming'}`}
                    >
                      <div className="telegram-message-content">
                        <div className="telegram-message-text">{message.text}</div>
                        <div className="telegram-message-meta">
                          <span className="telegram-message-date">
                            {new Date(message.date).toLocaleTimeString('ru-RU', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                          {message.from_user && !message.is_outgoing && (
                            <span className="telegram-message-author">
                              {message.from_user.first_name || message.from_user.username || 'Unknown'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <form className="telegram-message-input" onSubmit={handleSendMessage}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Введите сообщение..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  disabled={loading}
                />
                <button type="submit" className="btn btn-primary" disabled={loading || !messageText.trim()}>
                  <i className="bi bi-send"></i>
                </button>
              </form>
            </>
          ) : (
            <div className="telegram-empty-state">
              <i className="bi bi-chat-dots" style={{ fontSize: '4rem', color: 'var(--bs-secondary)' }}></i>
              <p className="text-muted">Выберите чат для начала общения</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TelegramMessengerPage;

