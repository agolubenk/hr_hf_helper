"""
Django settings for hrhelper project.
"""

import os
from pathlib import Path
from dotenv import load_dotenv

# Загружаем переменные окружения из .env файла
load_dotenv()

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'django-insecure-hrhelper-secret-key-change-in-production'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

# Логирование для отладки OAuth и Telegram
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
        'simple': {
            'format': '{levelname} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'simple',
        },
        'file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': BASE_DIR / 'telegram.log',
            'formatter': 'verbose',
        },
    },
    'loggers': {
        'apps.accounts.views': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': True,
        },
        'apps.telegram': {
            'handlers': ['file', 'console'],
            'level': 'INFO',
            'propagate': False,
        },
        'telethon': {
            'handlers': ['file'],
            'level': 'WARNING',
            'propagate': False,
        },
        'allauth': {
            'handlers': ['console'],
            'level': 'DEBUG',
            'propagate': True,
        },
        'allauth.socialaccount': {
            'handlers': ['console'],
            'level': 'DEBUG',
            'propagate': True,
        },
        'django.request': {
            'handlers': ['console'],
            'level': 'DEBUG',
            'propagate': True,
        },
    },
}

ALLOWED_HOSTS = ['testserver', '127.0.0.1', 'localhost']

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.sites',
    
    # Приложения проекта
    'apps.accounts',
    'apps.finance',
    'apps.huntflow',
    'apps.gemini',
    'apps.common',
    'apps.interviewers',
    'apps.vacancies',
    'apps.google_oauth',
    'apps.clickup_int',
    'apps.notion_int',
    
    # Django Telethon (отключено из-за конфликтов)
    # 'django_telethon',
    # 'django_telethon_session',
    
    # Django REST Framework
    'rest_framework',
    'corsheaders',
    
    # Django Allauth
    'allauth',
    'allauth.account',
    'allauth.socialaccount',
    'allauth.socialaccount.providers.google',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    # 'django.middleware.csrf.CsrfViewMiddleware',  # Отключено для разработки
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'allauth.account.middleware.AccountMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
                'apps.common.context_processors.sidebar_menu_context',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'

# Database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Internationalization
LANGUAGE_CODE = 'ru'
TIME_ZONE = 'Europe/Minsk'
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_DIRS = [
    BASE_DIR / 'static',
]

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Custom user model
AUTH_USER_MODEL = 'accounts.User'

# Django Auth настройки
AUTHENTICATION_BACKENDS = [
    'django.contrib.auth.backends.ModelBackend',
    'allauth.account.auth_backends.AuthenticationBackend',
]

LOGIN_REDIRECT_URL = '/google-oauth/chat/'
LOGIN_URL = '/accounts/login/'
LOGOUT_URL = '/accounts/logout/'

# Настройки для разработки (в продакшене использовать переменные окружения)
GOOGLE_OAUTH2_CLIENT_ID = '968014303116-vtqq5f39tkaningitmj3dbq25snnmdgp.apps.googleusercontent.com'
GOOGLE_OAUTH2_CLIENT_SECRET = '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'

# Google OAuth настройки
GOOGLE_OAUTH_REDIRECT_URI = 'http://localhost:8000/google-oauth/callback/'
GOOGLE_OAUTH_REDIRECT_URIS = [
    'http://localhost:8000/google-oauth/callback/',
    'http://127.0.0.1:8000/google-oauth/callback/',
    'http://127.0.0.1:8000/google-automation/oauth/callback/',
]

# Redis настройки для кэширования
CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': 'redis://127.0.0.1:6379/1',
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
        }
    }
}

# Настройки кэширования API данных
API_CACHE_TIMEOUT = {
    'google_calendar_events': 180,  # 3 минуты
    'google_drive_files': 600,      # 10 минут
    'google_sheets': 600,           # 10 минут
    'huntflow_candidates': 300,     # 5 минут
    'huntflow_vacancies': 14400,    # 4 часа
    'huntflow_accounts': 43200,     # 12 часов
}

# Celery настройки
CELERY_BROKER_URL = 'redis://127.0.0.1:6379/0'  # Используем стандартную базу Redis
CELERY_RESULT_BACKEND = 'redis://127.0.0.1:6379/0'
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = TIME_ZONE
CELERY_ENABLE_UTC = True

# Применяем настройки к дефолтному экземпляру Celery
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

# Импортируем и настраиваем Celery
try:
    from celery import current_app
    current_app.conf.update(
        broker_url=CELERY_BROKER_URL,
        result_backend=CELERY_RESULT_BACKEND,
        accept_content=CELERY_ACCEPT_CONTENT,
        task_serializer=CELERY_TASK_SERIALIZER,
        result_serializer=CELERY_RESULT_SERIALIZER,
        timezone=CELERY_TIMEZONE,
        enable_utc=CELERY_ENABLE_UTC,
    )
except ImportError:
    pass

# Настройки для ClickUp массового импорта
# CELERY_TASK_ROUTES = {
#     'apps.clickup_int.tasks.bulk_import_clickup_tasks': {'queue': 'clickup_import'},
#     'apps.clickup_int.tasks.import_single_task': {'queue': 'clickup_import'},
# }

# Django Telethon настройки
DJANGO_TELETHON = {
    'RABBITMQ_ACTIVE': False,  # Отключаем RabbitMQ для начала
    'RABBITMQ_URL': 'amqp://localhost:5672',
    'QUEUE_CHANNEL_NAME': 'telegram_queue',
    'QUEUE_CALLBACK': 'django_telethon.callback.on_message'
}

# Telegram API настройки (получить на my.telegram.org)
TELEGRAM_API_ID = os.environ.get('TELEGRAM_API_ID', '12345678')
TELEGRAM_API_HASH = os.environ.get('TELEGRAM_API_HASH', 'test_hash_for_demo')
TELEGRAM_DEMO_MODE = os.environ.get('TELEGRAM_DEMO_MODE', 'false').lower() == 'true'

# Проверяем что API данные заданы (только если не в тестах)
import sys
if 'test' not in sys.argv and not TELEGRAM_DEMO_MODE and (not TELEGRAM_API_ID or not TELEGRAM_API_HASH):
    print("⚠️  ВНИМАНИЕ: TELEGRAM_API_ID и TELEGRAM_API_HASH не настроены!")
    print("   Установите переменные окружения для работы с Telegram")
    print("   Получить ключи можно на https://my.telegram.org")
elif TELEGRAM_DEMO_MODE:
    print("🎭 ДЕМО РЕЖИМ: Telegram работает в демо-режиме для тестирования")

# Notion API настройки
NOTION_VERSION = '2022-06-28'

# Django REST Framework настройки
REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.SessionAuthentication',
        'rest_framework.authentication.BasicAuthentication',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
        'rest_framework.renderers.BrowsableAPIRenderer',
    ],
    'DEFAULT_FILTER_BACKENDS': [
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
}

# CORS настройки
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",  # React dev server
    "http://127.0.0.1:3000",
    "http://localhost:8000",  # Django dev server
    "http://127.0.0.1:8000",
]

# Django Allauth настройки
SITE_ID = 1

# Настройки allauth (обновленные)
ACCOUNT_LOGIN_METHODS = {'email'}
ACCOUNT_SIGNUP_FIELDS = ['email*', 'password1*', 'password2*']
ACCOUNT_EMAIL_VERIFICATION = 'none'
ACCOUNT_UNIQUE_EMAIL = True

# Настройки Google OAuth через allauth
SOCIALACCOUNT_PROVIDERS = {
    'google': {
        'SCOPE': [
            'profile',
            'email',
            'https://www.googleapis.com/auth/calendar',
            'https://www.googleapis.com/auth/drive',
            'https://www.googleapis.com/auth/spreadsheets',
        ],
        'AUTH_PARAMS': {
            'access_type': 'offline',
            'prompt': 'consent',
        },
        'OAUTH_PKCE_ENABLED': True,
    }
}

# Настройки для автоматического создания пользователей через социальные аккаунты
SOCIALACCOUNT_AUTO_SIGNUP = True
SOCIALACCOUNT_EMAIL_REQUIRED = True
SOCIALACCOUNT_EMAIL_VERIFICATION = 'none'
SOCIALACCOUNT_LOGIN_ON_GET = True
SOCIALACCOUNT_QUERY_EMAIL = True

# Адаптеры для allauth
ACCOUNT_ADAPTER = 'apps.accounts.logic.auth_adapters.CustomAccountAdapter'
SOCIALACCOUNT_ADAPTER = 'apps.accounts.logic.auth_adapters.CustomSocialAccountAdapter'

CORS_ALLOW_CREDENTIALS = True

CORS_ALLOW_ALL_ORIGINS = DEBUG  # Только для разработки

# =============================================================================
# TELEGRAM НАСТРОЙКИ
# =============================================================================

# Telegram API настройки (получить на my.telegram.org)
TG_API_ID = os.environ.get('TG_API_ID', '11383291')
TG_API_HASH = os.environ.get('TG_API_HASH', 'cb4a2adc6b83e9f0cca5b659f407a01c')
TG_SESSION_PATH = os.environ.get('TG_SESSION_PATH', str(BASE_DIR / 'sessions' / 'telegram_session'))

# Настройки для Telegram клиента
TELEGRAM_CLIENT_SETTINGS = {
    'connection_retries': 3,
    'request_retries': 3,
    'retry_delay': 1,
    'timeout': 30,
    'auto_reconnect': True,
}

# Настройки для сессий Telegram
TELEGRAM_SESSION_SETTINGS = {
    'auto_save': True,
    'save_interval': 300,  # Сохранять каждые 5 минут
    'max_session_age': 86400 * 30,  # 30 дней
}

# Настройки для чатов и сообщений
TELEGRAM_MESSAGE_SETTINGS = {
    'default_message_limit': 50,
    'max_message_limit': 100,
    'auto_refresh_interval': 10,  # секунды
    'message_history_days': 30,
}

# Настройки безопасности
TELEGRAM_SECURITY_SETTINGS = {
    'require_2fa_for_sensitive_actions': True,
    'max_auth_attempts': 5,
    'auth_timeout': 300,  # 5 минут
    'session_timeout': 3600,  # 1 час
}
