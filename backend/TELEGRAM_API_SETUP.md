# 🔑 Настройка API ключей Telegram

## ⚠️ ВАЖНО: Замените тестовые ключи на настоящие!

Сейчас в файле `.env` используются тестовые API ключи:
```
TELEGRAM_API_ID=12345678
TELEGRAM_API_HASH=abcdef1234567890abcdef1234567890
```

## 📱 Как получить настоящие API ключи:

### 1. Перейдите на https://my.telegram.org
### 2. Войдите с номером телефона
### 3. Нажмите "API Development tools"
### 4. Нажмите "Create new application"
### 5. Заполните форму:
   - **App title**: `HR Helper`
   - **Short name**: `hrhelper`
   - **Platform**: `Desktop`
   - **Description**: `HR Helper Telegram Integration`
### 6. Нажмите "Create application"
### 7. **ЗАПИШИТЕ api_id и api_hash!!!**

## 🔧 Обновление .env файла:

Замените содержимое файла `.env`:
```env
# Telegram API настройки
TELEGRAM_API_ID=ваш_настоящий_api_id
TELEGRAM_API_HASH=ваш_настоящий_api_hash

# Уровень логирования
TELEGRAM_LOG_LEVEL=INFO
```

## ✅ Проверка настройки:

```bash
cd /Users/agolubenko/hrhelper/fullstack/backend
python3 manage.py shell -c "
from django.conf import settings
print('API_ID:', settings.TELEGRAM_API_ID)
print('API_HASH:', settings.TELEGRAM_API_HASH[:10] + '...' if settings.TELEGRAM_API_HASH else 'None')
print('Настроены:', bool(settings.TELEGRAM_API_ID and settings.TELEGRAM_API_HASH))
"
```

## 🚀 После настройки:

1. Перезапустите сервер:
   ```bash
   python3 manage.py runserver 8000
   ```

2. Откройте http://localhost:8000/telegram/

3. Войдите в систему

4. Нажмите "Создать QR-код"

5. Отсканируйте QR-код в Telegram:
   - Откройте Telegram на телефоне
   - Настройки → Устройства
   - "Подключить устройство"
   - Наведите камеру на QR-код

## 🔒 Безопасность:

- ✅ API ключи хранятся в `.env` файле
- ✅ `.env` файл не попадает в git
- ✅ Каждый пользователь имеет изолированную сессию
- ✅ Все операции логируются

## 🐛 Если что-то не работает:

1. Проверьте логи:
   ```bash
   tail -f telegram.log
   ```

2. Проверьте настройки:
   ```bash
   python3 manage.py shell -c "
   from django.conf import settings
   print('API_ID:', settings.TELEGRAM_API_ID)
   print('API_HASH:', settings.TELEGRAM_API_HASH)
   "
   ```

3. Очистите сессии если нужно:
   ```bash
   python3 manage.py shell -c "
   from apps.telegram.models import TelegramUser
   TelegramUser.objects.all().delete()
   print('Сессии очищены')
   "
   ```

## 🎉 Готово!

После настройки настоящих API ключей Telegram интеграция будет полностью функциональна!