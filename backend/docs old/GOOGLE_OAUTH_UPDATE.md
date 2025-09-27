# Обновление настроек Google OAuth

## Проблема
Ошибка "Required parameter is missing: response_type" означает, что django-allauth не формирует правильный OAuth запрос.

## Решение
Создан собственный Google OAuth с прямым переходом на Google.

## Обновление настроек в Google Console

### 1. Перейдите в Google Cloud Console
- Откройте [Google Cloud Console](https://console.cloud.google.com/)
- Выберите ваш проект
- Перейдите в "APIs & Services" > "Credentials"

### 2. Обновите OAuth 2.0 клиента
- Найдите ваш OAuth 2.0 Client ID
- Нажмите "Edit" (карандаш)
- В разделе "Authorized redirect URIs" добавьте:
  ```
  http://localhost:8000/profile/google-oauth-callback/
  http://127.0.0.1:8000/profile/google-oauth-callback/
  ```

### 3. Сохраните изменения
- Нажмите "Save"
- Дождитесь применения изменений (может занять несколько минут)

## Новые URL

### Прямой Google OAuth
- **URL**: `/profile/google-oauth/`
- **Функция**: Прямой переход на Google OAuth
- **Параметры**: 
  - `response_type=code` ✅
  - `client_id` ✅
  - `redirect_uri` ✅
  - `scope=openid email profile` ✅
  - `state` (для безопасности) ✅

### Callback
- **URL**: `/profile/google-oauth-callback/`
- **Функция**: Обработка ответа от Google
- **Параметры**: `code`, `state`

## Тестирование

1. Откройте `http://localhost:8000/accounts/login/`
2. Нажмите "Войти через Google"
3. Должен произойти прямой переход на Google OAuth
4. После авторизации вернетесь на сайт

## Преимущества нового подхода

- ✅ **Прямой переход** - без промежуточных страниц
- ✅ **Правильные параметры** - все обязательные параметры включены
- ✅ **Безопасность** - используется state для защиты от CSRF
- ✅ **Простота** - минимум кода, максимум функциональности

## Если что-то не работает

1. Проверьте, что в Google Console добавлен новый redirect URI
2. Убедитесь, что изменения в Google Console применились
3. Проверьте консоль браузера на наличие ошибок
4. Убедитесь, что всплывающие окна разрешены
