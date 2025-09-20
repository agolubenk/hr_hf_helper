# Настройка Google OAuth для HR Helper

## Шаги настройки Google OAuth

### 1. Создание проекта в Google Cloud Console

1. Перейдите в [Google Cloud Console](https://console.cloud.google.com/)
2. Создайте новый проект или выберите существующий
3. Включите Google+ API

### 2. Создание OAuth 2.0 клиента

1. Перейдите в "APIs & Services" > "Credentials"
2. Нажмите "Create Credentials" > "OAuth 2.0 Client IDs"
3. Выберите "Web application"
4. Добавьте авторизованные URI перенаправления:
   - `http://localhost:8000/accounts/google/login/callback/` (для разработки)
   - `https://yourdomain.com/accounts/google/login/callback/` (для продакшена)

### 3. Настройка в Django

1. Скопируйте Client ID и Client Secret из Google Console
2. Обновите настройки в `config/settings.py`:

```python
# В продакшене используйте переменные окружения
GOOGLE_OAUTH2_CLIENT_ID = 'your-actual-client-id'
GOOGLE_OAUTH2_CLIENT_SECRET = 'your-actual-client-secret'
```

### 4. Настройка в админ панели Django

1. Войдите в админ панель: `http://localhost:8000/admin/`
2. Перейдите в "Social Applications"
3. Добавьте новое приложение:
   - **Provider**: Google
   - **Name**: HR Helper Google OAuth
   - **Client id**: ваш Client ID
   - **Secret key**: ваш Client Secret
   - **Sites**: выберите "localhost:8000" (для разработки)

### 5. Тестирование

1. Перейдите на `http://localhost:8000/accounts/login/`
2. Нажмите "Войти через Google"
3. Авторизуйтесь через Google
4. Вы должны быть перенаправлены в систему

## Переменные окружения для продакшена

Создайте файл `.env` в корне проекта:

```env
GOOGLE_OAUTH2_CLIENT_ID=your-production-client-id
GOOGLE_OAUTH2_CLIENT_SECRET=your-production-client-secret
SECRET_KEY=your-production-secret-key
DEBUG=False
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
```

## Безопасность

- Никогда не коммитьте Client Secret в репозиторий
- Используйте HTTPS в продакшене
- Регулярно обновляйте Client Secret
- Ограничьте домены в Google Console

## Устранение неполадок

### Ошибка "redirect_uri_mismatch"
- Проверьте, что URI перенаправления в Google Console точно совпадает с URL в Django

### Ошибка "invalid_client"
- Проверьте правильность Client ID и Client Secret
- Убедитесь, что приложение активно в Google Console

### Ошибка "access_denied"
- Проверьте настройки OAuth consent screen
- Убедитесь, что домен добавлен в авторизованные домены
