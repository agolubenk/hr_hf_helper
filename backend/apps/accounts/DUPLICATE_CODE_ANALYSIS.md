# Анализ дублирующегося кода в apps/accounts/views.py

## Обзор
В файле `views.py` обнаружено значительное количество дублирующегося кода, что нарушает принцип DRY (Don't Repeat Yourself) и усложняет поддержку приложения.

## 1. Дублирование логики получения Google OAuth аккаунта

### Функции с дублированием:
- `profile_view()` (строки 186-198)
- `profile_edit()` (строки 235-245)

### Дублированный код:
```python
# Получаем информацию о Google OAuth аккаунте
oauth_account = None
is_google_oauth_connected = False
try:
    from apps.google_oauth.models import GoogleOAuthAccount
    oauth_account = GoogleOAuthAccount.objects.get(user=user)
    # Аккаунт считается подключенным, если он существует в БД (даже если токен истек)
    is_google_oauth_connected = oauth_account is not None
    token_valid = oauth_account.is_token_valid() if oauth_account else False
except:
    token_valid = False
```

### Описание логики:
Получение информации о Google OAuth аккаунте пользователя, проверка его существования и валидности токена.

### Рекомендация:
Создать функцию `get_google_oauth_info(user)` в сервисном слое.

---

## 2. Дублирование логики тестирования API ключей

### Функции с дублированием:
- `test_gemini_api()` (строки 354-369)
- `test_huntflow_api()` (строки 374-392)
- `test_clickup_api()` (строки 397-412)
- `test_notion_api()` (строки 417-436)

### Дублированный код:
```python
@login_required
@require_POST
def test_*_api(request):
    """Тестирование * API ключа"""
    try:
        api_key = request.POST.get('api_key')
        if not api_key:
            return JsonResponse({'success': False, 'message': 'API ключ не указан'})
        
        # Здесь можно добавить реальную проверку API ключа
        # Пока просто проверяем, что ключ не пустой
        if len(api_key) < 10:  # или другие условия валидации
            return JsonResponse({'success': False, 'message': 'API ключ слишком короткий'})
        
        return JsonResponse({'success': True, 'message': 'API ключ валиден'})
        
    except Exception as e:
        return JsonResponse({'success': False, 'message': f'Ошибка: {str(e)}'})
```

### Описание логики:
Валидация API ключей различных сервисов с базовой проверкой длины и формата.

### Рекомендация:
Создать базовый класс `APIKeyValidator` или функцию `validate_api_key(api_key, service_type)`.

---

## 3. Дублирование логики обработки форм

### Функции с дублированием:
- `profile_edit()` (строки 247-254)
- `profile_settings()` (строки 269-276)

### Дублированный код:
```python
if request.method == 'POST':
    form = SomeForm(request.POST, instance=request.user)
    if form.is_valid():
        form.save()
        messages.success(request, 'Данные успешно обновлены!')
        return redirect('some_url')
else:
    form = SomeForm(instance=request.user)
```

### Описание логики:
Стандартная обработка Django форм с валидацией, сохранением и редиректом.

### Рекомендация:
Создать декоратор `@handle_form_submission` или базовый класс `FormView`.

---

## 4. Дублирование логики создания пользователя

### Функции с дублированием:
- `google_oauth_callback()` (строки 125-149)

### Дублированный код:
```python
try:
    # Пытаемся найти пользователя по email
    user = User.objects.get(email=email)
    logger.info(f"Found existing user: {user.username}")
except User.DoesNotExist:
    # Создаем нового пользователя
    username = email.split('@')[0]  # Используем часть email как username
    
    # Проверяем, что username уникален
    original_username = username
    counter = 1
    while User.objects.filter(username=username).exists():
        username = f"{original_username}{counter}"
        counter += 1
    
    user = User.objects.create_user(
        username=username,
        email=email,
        first_name=first_name,
        last_name=last_name
    )
    logger.info(f"Created new user: {username}")
    messages.success(request, f'Добро пожаловать, {first_name}!')
else:
    messages.success(request, f'Добро пожаловать обратно, {user.first_name or user.username}!')
```

### Описание логики:
Поиск существующего пользователя по email или создание нового с генерацией уникального username.

### Рекомендация:
Создать функцию `get_or_create_user_by_email(email, first_name, last_name)` в сервисном слое.

---

## 5. Дублирование логики получения статистики интеграций

### Функции с дублированием:
- `profile_view()` (строки 200-214)
- `integrations_view()` (строки 286-315)

### Дублированный код:
```python
# Получаем статистику Google сервисов
google_stats = {
    'calendar_events': 0,
    'drive_files': 0,
    'sheets': 0,
}

if oauth_account:
    try:
        from apps.google_oauth.models import GoogleCalendarEvent, GoogleDriveFile, GoogleSheet
        google_stats['calendar_events'] = GoogleCalendarEvent.objects.filter(google_account=oauth_account).count()
        google_stats['drive_files'] = GoogleDriveFile.objects.filter(google_account=oauth_account).count()
        google_stats['sheets'] = GoogleSheet.objects.filter(google_account=oauth_account).count()
    except:
        pass
```

### Описание логики:
Подсчет количества объектов в различных Google сервисах для отображения статистики.

### Рекомендация:
Создать функцию `get_google_services_stats(oauth_account)` в сервисном слое.

---

## 6. Дублирование логики проверки статуса интеграций

### Функции с дублированием:
- `integrations_view()` (строки 287-315)

### Дублированный код:
```python
integrations_status = {
    'huntflow': {
        'name': 'Huntflow',
        'enabled': bool(user.huntflow_sandbox_api_key or user.huntflow_prod_api_key),
        'sandbox_configured': bool(user.huntflow_sandbox_api_key),
        'prod_configured': bool(user.huntflow_prod_api_key),
        'active_system': user.active_system,
    },
    'gemini': {
        'name': 'Gemini AI',
        'enabled': bool(user.gemini_api_key),
        'configured': bool(user.gemini_api_key),
    },
    # ... аналогично для других сервисов
}
```

### Описание логики:
Проверка статуса настройки различных интеграций на основе наличия API ключей.

### Рекомендация:
Создать функцию `get_integrations_status(user)` в сервисном слое.

---

## 7. Дублирование логики обработки ошибок

### Функции с дублированием:
- `google_oauth_callback()` (строки 164-167)
- Все функции тестирования API (строки 368-369, 391-392, 411-412, 435-436)

### Дублированный код:
```python
except Exception as e:
    logger.error(f"Error: {str(e)}", exc_info=True)
    messages.error(request, f'Ошибка: {str(e)}')
    return redirect('some_url')
```

### Описание логики:
Стандартная обработка исключений с логированием и отображением сообщений пользователю.

### Рекомендация:
Создать декоратор `@handle_exceptions` или функцию `handle_view_error(request, error, redirect_url)`.

---

## 8. Дублирование логики получения социальных аккаунтов

### Функции с дублированием:
- `profile_view()` (строки 175-184)

### Дублированный код:
```python
# Получаем информацию о социальных аккаунтах
social_accounts = []
if hasattr(user, 'socialaccount_set'):
    for account in user.socialaccount_set.all():
        social_accounts.append({
            'provider': account.provider,
            'uid': account.uid,
            'extra_data': account.extra_data,
            'date_joined': account.date_joined,
        })
```

### Описание логики:
Получение списка социальных аккаунтов пользователя с преобразованием в словари.

### Рекомендация:
Создать функцию `get_social_accounts(user)` в сервисном слое.

---

## 9. Дублирование логики обновления API ключей

### Функции с дублированием:
- `api_keys_view()` (строки 330-340)

### Дублированный код:
```python
if request.method == 'POST':
    # Обновляем API ключи
    user.gemini_api_key = request.POST.get('gemini_api_key', '')
    user.clickup_api_key = request.POST.get('clickup_api_key', '')
    user.notion_integration_token = request.POST.get('notion_integration_token', '')
    user.huntflow_sandbox_api_key = request.POST.get('huntflow_sandbox_api_key', '')
    user.huntflow_prod_api_key = request.POST.get('huntflow_prod_api_key', '')
    user.huntflow_sandbox_url = request.POST.get('huntflow_sandbox_url', '')
    user.huntflow_prod_url = request.POST.get('huntflow_prod_url', '')
    user.active_system = request.POST.get('active_system', 'sandbox')
    user.save()
```

### Описание логики:
Обновление всех API ключей пользователя из POST-запроса.

### Рекомендация:
Создать функцию `update_user_api_keys(user, post_data)` в сервисном слое.

---

## 10. Дублирование логики аутентификации

### Функции с дублированием:
- `account_login()` (строки 444-456)
- `google_oauth_callback()` (строки 151-155)

### Дублированный код:
```python
from django.contrib.auth import authenticate
user = authenticate(request, username=username, password=password)

if user is not None:
    login(request, user)
    messages.success(request, 'Вы успешно вошли в систему!')
    return redirect('/huntflow/')
else:
    messages.error(request, 'Неверное имя пользователя или пароль.')
```

### Описание логики:
Стандартная аутентификация пользователя с последующим входом в систему.

### Рекомендация:
Создать функцию `authenticate_and_login(request, username, password)` в сервисном слое.

---

## Рекомендации по рефакторингу

### 1. Создать сервисный слой
Создать файл `services.py` с функциями:
- `get_google_oauth_info(user)`
- `get_or_create_user_by_email(email, first_name, last_name)`
- `get_google_services_stats(oauth_account)`
- `get_integrations_status(user)`
- `get_social_accounts(user)`
- `update_user_api_keys(user, post_data)`
- `authenticate_and_login(request, username, password)`

### 2. Создать утилиты
Создать файл `utils.py` с:
- `APIKeyValidator` класс
- `@handle_form_submission` декоратор
- `@handle_exceptions` декоратор

### 3. Создать базовые классы
Создать файл `base_views.py` с:
- `BaseFormView` класс
- `BaseAPIView` класс

### 4. Приоритет рефакторинга
1. **Высокий**: Дублирование логики тестирования API (4 функции)
2. **Высокий**: Дублирование логики получения Google OAuth (2 функции)
3. **Средний**: Дублирование логики обработки форм (2 функции)
4. **Средний**: Дублирование логики создания пользователя (1 функция)
5. **Низкий**: Остальные дублирования

## Заключение
В файле `views.py` обнаружено 10 типов дублирующегося кода, что значительно усложняет поддержку приложения. Рекомендуется провести рефакторинг с созданием сервисного слоя и утилит для устранения дублирования.
