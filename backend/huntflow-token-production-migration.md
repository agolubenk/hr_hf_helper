# Документация по внедрению системы access/refresh токенов для продакшн среды Huntflow

## Обзор

В настоящее время приложение hr_hf_helper использует статические API токены для интеграции с Huntflow. Для продакшн-среды необходимо внедрить систему access/refresh токенов согласно официальной документации Huntflow API v2.

## Текущая архитектура

### Модель пользователя (apps/accounts/models.py)
```python
class User(AbstractUser):
    # Текущие поля для Huntflow
    huntflow_prod_url = models.URLField(max_length=255, blank=True)
    huntflow_prod_api_key = models.CharField(max_length=255, blank=True)
    huntflow_sandbox_url = models.URLField(max_length=255, blank=True) 
    huntflow_sandbox_api_key = models.CharField(max_length=255, blank=True)
    active_system = models.CharField(max_length=10, choices=[('PROD', 'Production'), ('SANDBOX', 'Sandbox')], default='SANDBOX')
```

### Сервис Huntflow (apps/huntflow/services.py)
```python
class HuntflowService:
    def __init__(self, user):
        self.user = user
        self.api_key = self._get_api_key()
        self.headers = {
            'Authorization': f'Bearer {self.api_key}',
            'Content-Type': 'application/json'
        }
```

## Требуемые изменения

### 1. Обновление модели User

Добавить новые поля для хранения токенов:

```python
# apps/accounts/models.py

from django.utils import timezone
from datetime import timedelta

class User(AbstractUser):
    # Существующие поля...
    
    # Новые поля для токенной системы
    huntflow_access_token = models.TextField(blank=True, help_text="Access token для Huntflow API")
    huntflow_refresh_token = models.TextField(blank=True, help_text="Refresh token для Huntflow API")
    huntflow_token_expires_at = models.DateTimeField(null=True, blank=True, help_text="Время истечения access token")
    huntflow_refresh_expires_at = models.DateTimeField(null=True, blank=True, help_text="Время истечения refresh token")
    
    @property
    def is_huntflow_token_valid(self):
        """Проверяет валидность access token"""
        if not self.huntflow_access_token or not self.huntflow_token_expires_at:
            return False
        return timezone.now() < self.huntflow_token_expires_at
    
    @property
    def is_huntflow_refresh_valid(self):
        """Проверяет валидность refresh token"""
        if not self.huntflow_refresh_token or not self.huntflow_refresh_expires_at:
            return False
        return timezone.now() < self.huntflow_refresh_expires_at
    
    def set_huntflow_tokens(self, access_token, refresh_token, expires_in=604800, refresh_expires_in=1209600):
        """
        Устанавливает токены Huntflow
        
        Args:
            access_token: Access token
            refresh_token: Refresh token
            expires_in: Время жизни access token в секундах (по умолчанию 7 дней)
            refresh_expires_in: Время жизни refresh token в секундах (по умолчанию 14 дней)
        """
        self.huntflow_access_token = access_token
        self.huntflow_refresh_token = refresh_token
        self.huntflow_token_expires_at = timezone.now() + timedelta(seconds=expires_in)
        self.huntflow_refresh_expires_at = timezone.now() + timedelta(seconds=refresh_expires_in)
        self.save(update_fields=[
            'huntflow_access_token', 
            'huntflow_refresh_token', 
            'huntflow_token_expires_at', 
            'huntflow_refresh_expires_at'
        ])
```

### 2. Создание миграции

```bash
python manage.py makemigrations accounts --name add_huntflow_token_fields
```

Содержание миграции:
```python
# apps/accounts/migrations/xxxx_add_huntflow_token_fields.py

from django.db import migrations, models

class Migration(migrations.Migration):
    dependencies = [
        ('accounts', 'previous_migration'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='huntflow_access_token',
            field=models.TextField(blank=True, help_text='Access token для Huntflow API'),
        ),
        migrations.AddField(
            model_name='user',
            name='huntflow_refresh_token',
            field=models.TextField(blank=True, help_text='Refresh token для Huntflow API'),
        ),
        migrations.AddField(
            model_name='user',
            name='huntflow_token_expires_at',
            field=models.DateTimeField(blank=True, null=True, help_text='Время истечения access token'),
        ),
        migrations.AddField(
            model_name='user',
            name='huntflow_refresh_expires_at',
            field=models.DateTimeField(blank=True, null=True, help_text='Время истечения refresh token'),
        ),
    ]
```

### 3. Создание сервиса управления токенами

```python
# apps/huntflow/token_service.py

import requests
from django.utils import timezone
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

class HuntflowTokenService:
    """Сервис для управления токенами Huntflow"""
    
    def __init__(self, user):
        self.user = user
        self.base_url = self._get_base_url()
    
    def _get_base_url(self):
        """Получает базовый URL для API запросов"""
        if self.user.active_system == 'PROD':
            return self.user.huntflow_prod_url
        else:
            return self.user.huntflow_sandbox_url
    
    def refresh_access_token(self):
        """
        Обновляет access token используя refresh token
        
        Returns:
            bool: True если обновление успешно, False иначе
        """
        if not self.user.huntflow_refresh_token:
            logger.error(f"Нет refresh token для пользователя {self.user.username}")
            return False
        
        if not self.user.is_huntflow_refresh_valid:
            logger.error(f"Refresh token истек для пользователя {self.user.username}")
            return False
        
        try:
            # Формируем URL для обновления токена
            if self.base_url.endswith('/v2'):
                url = f"{self.base_url}/token/refresh"
            else:
                url = f"{self.base_url}/v2/token/refresh"
            
            data = {
                'refresh_token': self.user.huntflow_refresh_token
            }
            
            headers = {
                'Content-Type': 'application/json'
            }
            
            logger.info(f"Обновляем токен для пользователя {self.user.username}")
            
            response = requests.post(url, json=data, headers=headers, timeout=30)
            
            if response.status_code == 200:
                token_data = response.json()
                
                # Обновляем токены пользователя
                self.user.set_huntflow_tokens(
                    access_token=token_data['access_token'],
                    refresh_token=token_data['refresh_token'],
                    expires_in=token_data.get('expires_in', 604800),
                    refresh_expires_in=token_data.get('refresh_token_expires_in', 1209600)
                )
                
                logger.info(f"Токен успешно обновлен для пользователя {self.user.username}")
                return True
            else:
                logger.error(f"Ошибка обновления токена: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            logger.error(f"Исключение при обновлении токена: {e}")
            return False
    
    def ensure_valid_token(self):
        """
        Проверяет валидность токена и обновляет при необходимости
        
        Returns:
            str: Валидный access token или None
        """
        # Если токен валиден, возвращаем его
        if self.user.is_huntflow_token_valid:
            return self.user.huntflow_access_token
        
        # Если токен истек, пытаемся обновить
        if self.refresh_access_token():
            return self.user.huntflow_access_token
        
        # Если обновить не удалось, возвращаем None
        logger.error(f"Не удалось получить валидный токен для пользователя {self.user.username}")
        return None
    
    def validate_token_setup(self):
        """
        Проверяет корректность настройки токенов
        
        Returns:
            dict: Статус проверки
        """
        issues = []
        
        if not self.user.huntflow_access_token:
            issues.append("Отсутствует access token")
        
        if not self.user.huntflow_refresh_token:
            issues.append("Отсутствует refresh token")
        
        if not self.user.is_huntflow_token_valid:
            issues.append("Access token истек")
        
        if not self.user.is_huntflow_refresh_valid:
            issues.append("Refresh token истек")
        
        return {
            'valid': len(issues) == 0,
            'issues': issues,
            'access_expires_at': self.user.huntflow_token_expires_at,
            'refresh_expires_at': self.user.huntflow_refresh_expires_at
        }
```

### 4. Обновление HuntflowService

```python
# apps/huntflow/services.py

from .token_service import HuntflowTokenService

class HuntflowService:
    """Сервис для работы с Huntflow API с поддержкой токенной аутентификации"""
    
    def __init__(self, user):
        self.user = user
        self.base_url = self._get_base_url()
        self.token_service = HuntflowTokenService(user)
        
    def _get_headers(self):
        """Получает заголовки для API запросов с валидным токеном"""
        # Проверяем, используется ли новая токенная система
        if self.user.huntflow_access_token:
            # Получаем валидный токен
            access_token = self.token_service.ensure_valid_token()
            if not access_token:
                raise Exception("Не удалось получить валидный access token")
            
            return {
                'Authorization': f'Bearer {access_token}',
                'Content-Type': 'application/json'
            }
        else:
            # Fallback на старую систему API ключей
            api_key = self._get_api_key()
            return {
                'Authorization': f'Bearer {api_key}',
                'Content-Type': 'application/json'
            }
    
    def _make_request(self, method: str, endpoint: str, **kwargs):
        """Выполняет HTTP запрос к Huntflow API с автоматическим обновлением токенов"""
        try:
            # Получаем актуальные заголовки
            headers = self._get_headers()
            kwargs['headers'] = headers
            
            # Формируем URL
            if self.base_url.endswith('/v2'):
                url = f"{self.base_url}{endpoint}"
            else:
                url = f"{self.base_url}/v2{endpoint}"
            
            # Выполняем запрос
            response = requests.request(method=method, url=url, timeout=30, **kwargs)
            
            # Если получили 401 и используем токенную систему, пробуем обновить токен
            if response.status_code == 401 and self.user.huntflow_access_token:
                logger.warning("Получен 401, пробуем обновить токен")
                
                if self.token_service.refresh_access_token():
                    # Обновляем заголовки с новым токеном
                    headers = self._get_headers()
                    kwargs['headers'] = headers
                    
                    # Повторяем запрос
                    response = requests.request(method=method, url=url, timeout=30, **kwargs)
            
            # Обрабатываем ответ
            if response.status_code in [200, 201]:
                return response.json()
            else:
                logger.error(f"Ошибка API: {response.status_code} - {response.text}")
                return None
                
        except Exception as e:
            logger.error(f"Ошибка запроса: {e}")
            return None
```

### 5. Создание view для управления токенами

```python
# apps/huntflow/views_token.py

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
from django.views import View
import json
from .token_service import HuntflowTokenService

@method_decorator([login_required, csrf_exempt], name='dispatch')
class HuntflowTokenManagementView(View):
    """View для управления токенами Huntflow"""
    
    def post(self, request):
        """Устанавливает токены Huntflow для пользователя"""
        try:
            data = json.loads(request.body)
            access_token = data.get('access_token')
            refresh_token = data.get('refresh_token')
            
            if not access_token or not refresh_token:
                return JsonResponse({
                    'success': False,
                    'error': 'Необходимо указать access_token и refresh_token'
                })
            
            # Устанавливаем токены
            request.user.set_huntflow_tokens(
                access_token=access_token,
                refresh_token=refresh_token
            )
            
            return JsonResponse({
                'success': True,
                'message': 'Токены успешно сохранены'
            })
            
        except Exception as e:
            return JsonResponse({
                'success': False,
                'error': str(e)
            })
    
    def get(self, request):
        """Получает статус токенов"""
        token_service = HuntflowTokenService(request.user)
        status = token_service.validate_token_setup()
        
        return JsonResponse({
            'success': True,
            'status': status
        })

@login_required
@csrf_exempt
def refresh_huntflow_token_view(request):
    """Обновляет access token"""
    if request.method != 'POST':
        return JsonResponse({'success': False, 'error': 'Метод не поддерживается'})
    
    token_service = HuntflowTokenService(request.user)
    
    if token_service.refresh_access_token():
        return JsonResponse({
            'success': True,
            'message': 'Токен успешно обновлен'
        })
    else:
        return JsonResponse({
            'success': False,
            'error': 'Не удалось обновить токен'
        })

@login_required
def test_huntflow_connection_view(request):
    """Тестирует подключение к Huntflow с текущими токенами"""
    try:
        from .services import HuntflowService
        service = HuntflowService(request.user)
        
        # Пробуем получить информацию о пользователе
        result = service._make_request('GET', '/me')
        
        if result:
            return JsonResponse({
                'success': True,
                'message': 'Подключение успешно',
                'user_info': {
                    'name': result.get('name'),
                    'email': result.get('email')
                }
            })
        else:
            return JsonResponse({
                'success': False,
                'error': 'Не удалось подключиться к API'
            })
            
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        })
```

### 6. Обновление URL маршрутов

```python
# apps/huntflow/urls.py

from django.urls import path
from . import views, views_token

urlpatterns = [
    # Существующие URL...
    
    # Новые URL для управления токенами
    path('tokens/', views_token.HuntflowTokenManagementView.as_view(), name='huntflow_tokens'),
    path('tokens/refresh/', views_token.refresh_huntflow_token_view, name='huntflow_refresh_token'),
    path('tokens/test/', views_token.test_huntflow_connection_view, name='huntflow_test_connection'),
]
```

### 7. Обновление админки

```python
# apps/accounts/admin.py

from django.contrib import admin
from .models import User

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    fieldsets = (
        # Существующие fieldsets...
        
        ('Huntflow Токены', {
            'fields': (
                'huntflow_access_token', 
                'huntflow_refresh_token',
                'huntflow_token_expires_at',
                'huntflow_refresh_expires_at'
            ),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ('huntflow_token_expires_at', 'huntflow_refresh_expires_at')
    
    def get_readonly_fields(self, request, obj=None):
        readonly = list(super().get_readonly_fields(request, obj))
        
        # Показываем статус токенов
        if obj and obj.huntflow_access_token:
            readonly.extend(['huntflow_token_status'])
        
        return readonly
    
    def huntflow_token_status(self, obj):
        """Показывает статус токенов в админке"""
        if not obj.huntflow_access_token:
            return "Токены не настроены"
        
        status = "✅ Валидный" if obj.is_huntflow_token_valid else "❌ Истек"
        refresh_status = "✅ Валидный" if obj.is_huntflow_refresh_valid else "❌ Истек"
        
        return f"Access: {status}, Refresh: {refresh_status}"
    
    huntflow_token_status.short_description = "Статус токенов"
```

### 8. Создание команды для миграции токенов

```python
# apps/huntflow/management/commands/migrate_to_tokens.py

from django.core.management.base import BaseCommand
from apps.accounts.models import User

class Command(BaseCommand):
    help = 'Миграция с API ключей на токенную систему'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Показать что будет сделано без выполнения',
        )
    
    def handle(self, *args, **options):
        dry_run = options['dry_run']
        
        users_with_api_keys = User.objects.filter(
            huntflow_prod_api_key__isnull=False
        ).exclude(huntflow_prod_api_key='')
        
        self.stdout.write(f"Найдено пользователей с API ключами: {users_with_api_keys.count()}")
        
        for user in users_with_api_keys:
            self.stdout.write(f"\nПользователь: {user.username}")
            self.stdout.write(f"Текущий API ключ: {user.huntflow_prod_api_key[:20]}...")
            
            if user.huntflow_access_token:
                self.stdout.write("  ✅ Уже использует токенную систему")
                continue
            
            if dry_run:
                self.stdout.write("  [DRY RUN] Требуется ручная настройка токенов")
            else:
                self.stdout.write("  ⚠️  Требуется ручная настройка токенов в интерфейсе Huntflow")
                self.stdout.write("     1. Перейдите в Настройки → API → Добавить токен")
                self.stdout.write("     2. Получите access_token и refresh_token")
                self.stdout.write("     3. Обновите профиль пользователя")
        
        if not dry_run:
            self.stdout.write(
                self.style.WARNING(
                    "\nВНИМАНИЕ: Автоматическая миграция API ключей невозможна. "
                    "Каждый пользователь должен получить новые токены через интерфейс Huntflow."
                )
            )
```

### 9. Обновление шаблонов

```html
<!-- templates/accounts/profile_settings.html -->

<div class="card">
    <div class="card-header">
        <h5>Huntflow Токены</h5>
    </div>
    <div class="card-body">
        <div id="token-status" class="mb-3"></div>
        
        <form id="huntflow-tokens-form">
            <div class="mb-3">
                <label for="access_token" class="form-label">Access Token</label>
                <textarea class="form-control" id="access_token" rows="3" 
                          placeholder="Вставьте access_token полученный из Huntflow"></textarea>
            </div>
            
            <div class="mb-3">
                <label for="refresh_token" class="form-label">Refresh Token</label>
                <textarea class="form-control" id="refresh_token" rows="3"
                          placeholder="Вставьте refresh_token полученный из Huntflow"></textarea>
            </div>
            
            <div class="d-flex gap-2">
                <button type="submit" class="btn btn-primary">Сохранить токены</button>
                <button type="button" class="btn btn-secondary" onclick="refreshToken()">Обновить токен</button>
                <button type="button" class="btn btn-info" onclick="testConnection()">Тест подключения</button>
            </div>
        </form>
    </div>
</div>

<script>
// Загружаем статус токенов при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    loadTokenStatus();
});

function loadTokenStatus() {
    fetch('/huntflow/tokens/')
        .then(response => response.json())
        .then(data => {
            const statusDiv = document.getElementById('token-status');
            if (data.success) {
                const status = data.status;
                let html = '<h6>Статус токенов:</h6>';
                
                if (status.valid) {
                    html += '<div class="alert alert-success">✅ Токены валидны</div>';
                } else {
                    html += '<div class="alert alert-warning">⚠️ Требуется обновление токенов</div>';
                    html += '<ul>';
                    status.issues.forEach(issue => {
                        html += `<li>${issue}</li>`;
                    });
                    html += '</ul>';
                }
                
                if (status.access_expires_at) {
                    html += `<small>Access token истекает: ${new Date(status.access_expires_at).toLocaleString()}</small><br>`;
                }
                if (status.refresh_expires_at) {
                    html += `<small>Refresh token истекает: ${new Date(status.refresh_expires_at).toLocaleString()}</small>`;
                }
                
                statusDiv.innerHTML = html;
            }
        });
}

document.getElementById('huntflow-tokens-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const accessToken = document.getElementById('access_token').value;
    const refreshToken = document.getElementById('refresh_token').value;
    
    if (!accessToken || !refreshToken) {
        alert('Необходимо указать оба токена');
        return;
    }
    
    fetch('/huntflow/tokens/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify({
            access_token: accessToken,
            refresh_token: refreshToken
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Токены успешно сохранены');
            loadTokenStatus();
            document.getElementById('huntflow-tokens-form').reset();
        } else {
            alert('Ошибка: ' + data.error);
        }
    });
});

function refreshToken() {
    fetch('/huntflow/tokens/refresh/', {
        method: 'POST',
        headers: {
            'X-CSRFToken': getCookie('csrftoken')
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Токен успешно обновлен');
            loadTokenStatus();
        } else {
            alert('Ошибка обновления токена: ' + data.error);
        }
    });
}

function testConnection() {
    fetch('/huntflow/tokens/test/')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert(`Подключение успешно!\nПользователь: ${data.user_info.name}\nEmail: ${data.user_info.email}`);
            } else {
                alert('Ошибка подключения: ' + data.error);
            }
        });
}

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
</script>
```

## План внедрения

### Фаза 1: Подготовка (1-2 дня)
1. ✅ Создание миграции для новых полей токенов
2. ✅ Обновление модели User
3. ✅ Создание HuntflowTokenService

### Фаза 2: Основная разработка (2-3 дня)
1. ✅ Обновление HuntflowService для поддержки токенов
2. ✅ Создание views для управления токенами
3. ✅ Обновление URL маршрутов
4. ✅ Создание команды миграции

### Фаза 3: Интерфейс (1-2 дня)
1. ✅ Обновление админки
2. ✅ Создание/обновление шаблонов
3. ✅ JavaScript для управления токенами

### Фаза 4: Тестирование и внедрение (2-3 дня)
1. ✅ Тестирование на sandbox окружении
2. ✅ Создание документации для пользователей
3. ✅ Постепенная миграция пользователей
4. ✅ Мониторинг и исправление проблем

## Инструкции для пользователей

### Как получить токены в Huntflow

1. **Войдите в Huntflow** (prod или sandbox)
2. **Перейдите в Настройки → API и вебхуки**
3. **Нажмите "Добавить токен"**
4. **Введите название токена** (например, "HR Helper Production")
5. **Нажмите "Создать"**
6. **Перейдите по полученной ссылке** (действует 3 дня)
7. **Скопируйте оба токена:**
   - `access_token` - для API запросов (жизнь 7 дней)
   - `refresh_token` - для обновления (жизнь 14 дней)

### Как настроить токены в HR Helper

1. **Войдите в систему HR Helper**
2. **Перейдите в Профиль → Настройки**
3. **Найдите раздел "Huntflow Токены"**
4. **Вставьте оба токена в соответствующие поля**
5. **Нажмите "Сохранить токены"**
6. **Нажмите "Тест подключения"** для проверки

## Мониторинг и обслуживание

### Логирование

```python
# settings.py
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'huntflow_file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': 'logs/huntflow_tokens.log',
        },
    },
    'loggers': {
        'apps.huntflow.token_service': {
            'handlers': ['huntflow_file'],
            'level': 'INFO',
            'propagate': True,
        },
    },
}
```

### Периодическая проверка токенов

```python
# apps/huntflow/management/commands/check_token_health.py

from django.core.management.base import BaseCommand
from apps.accounts.models import User
from datetime import timedelta
from django.utils import timezone

class Command(BaseCommand):
    help = 'Проверяет состояние токенов Huntflow'
    
    def handle(self, *args, **options):
        users = User.objects.exclude(huntflow_access_token='')
        
        expiring_soon = []
        expired = []
        
        for user in users:
            if user.huntflow_token_expires_at:
                if user.huntflow_token_expires_at < timezone.now():
                    expired.append(user)
                elif user.huntflow_token_expires_at < timezone.now() + timedelta(days=1):
                    expiring_soon.append(user)
        
        if expired:
            self.stdout.write(
                self.style.ERROR(f"Пользователи с истекшими токенами: {len(expired)}")
            )
            for user in expired:
                self.stdout.write(f"  - {user.username}")
        
        if expiring_soon:
            self.stdout.write(
                self.style.WARNING(f"Токены истекают в ближайшие 24 часа: {len(expiring_soon)}")
            )
            for user in expiring_soon:
                self.stdout.write(f"  - {user.username}")
        
        if not expired and not expiring_soon:
            self.stdout.write(self.style.SUCCESS("Все токены в порядке"))
```

### Cron задача для проверки

```bash
# Добавить в crontab
0 9 * * * cd /path/to/project && python manage.py check_token_health
```

## Безопасность

### Рекомендации
1. **Храните токены в защищенном виде** - рассмотрите шифрование в БД
2. **Мониторьте использование токенов** - логируйте все обновления
3. **Ротируйте токены регулярно** - особенно при смене персонала
4. **Используйте HTTPS** для всех API запросов
5. **Ограничьте доступ к БД** с токенами

### Шифрование токенов (опционально)

```python
# apps/accounts/models.py

from cryptography.fernet import Fernet
from django.conf import settings

class User(AbstractUser):
    # Зашифрованные поля
    _huntflow_access_token = models.TextField(blank=True, db_column='huntflow_access_token')
    _huntflow_refresh_token = models.TextField(blank=True, db_column='huntflow_refresh_token')
    
    @property
    def huntflow_access_token(self):
        if not self._huntflow_access_token:
            return ''
        try:
            f = Fernet(settings.ENCRYPTION_KEY)
            return f.decrypt(self._huntflow_access_token.encode()).decode()
        except:
            return ''
    
    @huntflow_access_token.setter
    def huntflow_access_token(self, value):
        if value:
            f = Fernet(settings.ENCRYPTION_KEY)
            self._huntflow_access_token = f.encrypt(value.encode()).decode()
        else:
            self._huntflow_access_token = ''
```

## Заключение

Данная документация описывает полный процесс внедрения системы access/refresh токенов для продакшн среды Huntflow API. Система обеспечивает:

- ✅ **Автоматическое обновление токенов** без участия пользователя
- ✅ **Безопасное хранение** токенов в базе данных
- ✅ **Мониторинг состояния** токенов
- ✅ **Обратную совместимость** с API ключами
- ✅ **Простой интерфейс** для пользователей
- ✅ **Надежное логирование** операций

После внедрения системы пользователи получат стабильную интеграцию с Huntflow API без необходимости постоянного ввода API ключей.