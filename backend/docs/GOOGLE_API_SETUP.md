# 🔧 Настройка Google API для HR Helper

## 📋 **Проверьте настройки в Google Cloud Console**

### **1. Включите необходимые API**

Перейдите в [Google Cloud Console](https://console.cloud.google.com/) и убедитесь, что включены:

- ✅ **Google Calendar API**
- ✅ **Google Drive API**
- ✅ **Google+ API** (для профиля пользователя)

**Как включить:**
1. Перейдите в раздел "APIs & Services" → "Library"
2. Найдите и включите каждый API
3. Дождитесь активации (может занять несколько минут)

### **2. Проверьте настройки OAuth 2.0**

В разделе "APIs & Services" → "Credentials":

#### **Авторизованные URI перенаправления:**
```
http://127.0.0.1:8000/accounts/google/login/callback/
http://127.0.0.1:8000/google-automation/oauth/callback/
```

#### **Авторизованные источники JavaScript:**
```
http://127.0.0.1:8000
http://localhost:8000
```

### **3. Проверьте scopes в OAuth consent screen**

В разделе "OAuth consent screen" убедитесь, что добавлены:

- ✅ **User information** (email, profile)
- ✅ **Google Calendar** (read-only access)
- ✅ **Google Drive** (read-only access)

## 🔄 **Обновленные настройки Django**

### **В settings.py добавлены scopes:**
```python
SOCIALACCOUNT_PROVIDERS = {
    'google': {
        'SCOPE': [
            'profile',
            'email',
            'https://www.googleapis.com/auth/calendar.readonly',
            'https://www.googleapis.com/auth/drive.readonly',
        ],
        'AUTH_PARAMS': {
            'access_type': 'offline',  # Для получения refresh token
            'prompt': 'consent',       # Принудительное согласие
        },
        'OAUTH_PKCE_ENABLED': True,
    }
}
```

## 🧪 **Тестирование**

### **1. Очистите существующие токены:**
```python
# В Django shell
from allauth.socialaccount.models import SocialAccount, SocialToken
from django.contrib.auth import get_user_model

User = get_user_model()
user = User.objects.first()

# Удаляем старые токены
SocialAccount.objects.filter(user=user, provider='google').delete()
SocialToken.objects.filter(account__user=user).delete()
```

### **2. Повторная авторизация:**
1. Перейдите в `http://127.0.0.1:8000/google-automation/connect/`
2. Нажмите "Подключить Google аккаунт"
3. **ВАЖНО:** При авторизации Google покажет экран согласия с новыми разрешениями
4. Разрешите доступ к календарю и Google Drive
5. Вернитесь в приложение

### **3. Проверка токенов:**
```python
# В Django shell
from allauth.socialaccount.models import SocialAccount, SocialToken

# Проверяем социальный аккаунт
social_account = SocialAccount.objects.filter(user=user, provider='google').first()
if social_account:
    print(f"Account: {social_account.uid}")
    print(f"Extra data: {social_account.extra_data}")
    
    # Проверяем токены
    token = SocialToken.objects.filter(account=social_account).first()
    if token:
        print(f"Token: {token.token[:20]}...")
        print(f"Expires: {token.expires_at}")
        print(f"Scopes: {token.token_secret}")  # Scopes хранятся в token_secret
```

## 🚨 **Возможные проблемы**

### **1. "Access blocked" или "This app isn't verified"**
- **Решение:** В OAuth consent screen добавьте ваш email в "Test users"
- **Или:** Опубликуйте приложение (требует верификации Google)

### **2. "Invalid scope" ошибка**
- **Решение:** Убедитесь, что API включены в Google Cloud Console
- **Проверьте:** Scopes в settings.py соответствуют включенным API

### **3. Токены не сохраняются**
- **Решение:** Проверьте настройки `access_type: 'offline'` и `prompt: 'consent'`
- **Убедитесь:** Что пользователь дал согласие на все запрашиваемые разрешения

### **4. "Insufficient permissions" при вызове API**
- **Решение:** Убедитесь, что токены содержат нужные scopes
- **Проверьте:** Что API включены и доступны для вашего проекта

## 📊 **Отладка**

### **Логирование запросов:**
```python
import logging
logging.basicConfig(level=logging.DEBUG)

# В settings.py добавьте:
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'loggers': {
        'googleapiclient': {
            'handlers': ['console'],
            'level': 'DEBUG',
            'propagate': True,
        },
    },
}
```

### **Проверка токенов через API:**
```python
from apps.google_oauth.services import GoogleAPIService

google_service = GoogleAPIService(user)
credentials = google_service.get_credentials()

if credentials:
    print(f"Valid: {credentials.valid}")
    print(f"Scopes: {credentials.scopes}")
    print(f"Expired: {credentials.expired}")
else:
    print("No credentials available")
```

## ✅ **Ожидаемый результат**

После правильной настройки:

1. **При авторизации** Google покажет экран с разрешениями для календаря и Drive
2. **Токены сохранятся** в `SocialAccount` и `SocialToken`
3. **API вызовы** будут работать для календаря и Google Drive
4. **В админке** будут отображаться все токены и социальные аккаунты

---

**Если проблемы остаются, проверьте логи сервера и убедитесь, что все API включены в Google Cloud Console!** 🚀

