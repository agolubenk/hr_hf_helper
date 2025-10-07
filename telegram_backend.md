# Интеграция Telegram-клиента с Django (Backend)

## Структура проекта

- Приложение: `telegram_app`
- Файлы:
  - `telegram_client.py`  
  - `db_sessions.py`  
  - `views.py`  
  - `urls.py`  
  - `models.py`  

## 1. Установка зависимостей

```bash
pip install telethon sqlalchemy psycopg2-binary django-allauth
```

## 2. Модели

```python
# telegram_app/models.py
from django.conf import settings
from django.db import models

class TelegramSession(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE
    )
    name = models.CharField(max_length=100, unique=True)
    session_data = models.TextField(blank=True)
```

## 3. Класс хранения сессий в БД

```python
# telegram_app/db_sessions.py
from telethon.sessions import StringSession
from .models import TelegramSession

class DBSessions(StringSession):
    def __init__(self, user):
        tg_sess, _ = TelegramSession.objects.get_or_create(
            user=user,
            defaults={'name': f'tg_{user.id}'}
        )
        super().__init__(self._load_data(tg_sess))
        self.name = tg_sess.name

    def _load_data(self, tg_sess):
        return tg_sess.session_data or ''

    def save(self):
        data = self.save_to_string()
        tg_sess = TelegramSession.objects.get(name=self.name)
        tg_sess.session_data = data
        tg_sess.save()
```

## 4. Инициализация клиента

```python
# telegram_app/telegram_client.py
from telethon import TelegramClient
from django.conf import settings
from .db_sessions import DBSessions


def get_client(user):
    session = DBSessions(user)
    return TelegramClient(
        session,
        settings.TELEGRAM_API_ID,
        settings.TELEGRAM_API_HASH
    )
```

## 5. Views и URLs

```python
# telegram_app/views.py
import json
from django.http import JsonResponse
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from telethon.errors import SessionPasswordNeededError
from .telegram_client import get_client


def index(request):
    view = request.GET.get('view', 'login')
    template = 'telegram_app/main.html' if view=='main' else 'telegram_app/login.html'
    return render(request, template)

@login_required
def session_status(request):
    client = get_client(request.user)
    client.loop.run_until_complete(client.connect())
    active = client.loop.run_until_complete(client.is_user_authorized())
    return JsonResponse({'active': active})

@csrf_exempt
def auth_phone(request):
    data = json.loads(request.body)
    client = get_client(request.user)
    client.loop.run_until_complete(client.connect())
    client.loop.run_until_complete(client.send_code_request(data['phone']))
    return JsonResponse({'sent': True})

@csrf_exempt
def auth_verify(request):
    data = json.loads(request.body)
    client = get_client(request.user)
    client.loop.run_until_complete(client.connect())
    try:
        client.loop.run_until_complete(client.sign_in(data['phone'], data['code']))
    except SessionPasswordNeededError:
        client.loop.run_until_complete(client.sign_in(password=data.get('password')))
    return JsonResponse({'authorized': True})

@login_required
def qr_start(request):
    client = get_client(request.user)
    client.loop.run_until_complete(client.connect())
    qr = client.loop.run_until_complete(client.qr_login().generate())
    return JsonResponse({'url': qr})

@login_required
def qr_status(request):
    client = get_client(request.user)
    client.loop.run_until_complete(client.connect())
    done = client.loop.run_until_complete(client.qr_login().wait(timeout=0))
    return JsonResponse({'authorized': done})

@login_required
def list_chats(request):
    client = get_client(request.user)
    client.loop.run_until_complete(client.connect())
    dialogs = client.loop.run_until_complete(client.get_dialogs(limit=50))
    chats = [{'id': d.id, 'title': d.title or str(d.entity)} for d in dialogs]
    return JsonResponse(chats, safe=False)

@login_required
def get_messages(request, chat_id):
    client = get_client(request.user)
    client.loop.run_until_complete(client.connect())
    msgs = client.loop.run_until_complete(
        client.get_messages(int(chat_id), limit=50)
    )
    return JsonResponse([
        {'id': m.id, 'sender': m.sender_id, 'text': m.text, 'date': m.date.isoformat()}
        for m in msgs
    ], safe=False)
```

```python
# telegram_app/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='telegram_index'),
    path('session/status/', views.session_status, name='session_status'),
    path('auth/phone/', views.auth_phone, name='auth_phone'),
    path('auth/verify/', views.auth_verify, name='auth_verify'),
    path('auth/qr/', views.qr_start, name='auth_qr'),
    path('auth/qr/status/', views.qr_status, name='auth_qr_status'),
    path('chats/', views.list_chats, name='list_chats'),
    path('chats/<int:chat_id>/messages/', views.get_messages, name='get_messages'),
]
```