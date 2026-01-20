# Интеграция Telegram мессенджера

## 📋 Описание

Telegram мессенджер полностью интегрирован в фронтенд приложение. Пользователи могут авторизоваться в Telegram и работать с чатами и сообщениями прямо из HRM системы.

## 🎯 Функциональность

### Авторизация
- Ввод номера телефона
- Подтверждение кода из Telegram
- Поддержка 2FA (если включена)

### Работа с чатами
- Просмотр списка чатов
- Выбор чата для общения
- Просмотр истории сообщений
- Отправка сообщений

## 🔌 API методы

Все методы находятся в `frontend/src/utils/api.ts`:

- `sendTelegramPhone(companyId, phoneNumber)` - отправить номер телефона
- `verifyTelegramCode(companyId, code)` - проверить код
- `verifyTelegram2FA(companyId, password)` - проверить пароль 2FA
- `getTelegramAuthStatus(companyId)` - получить статус авторизации
- `logoutTelegram(companyId)` - выйти из Telegram
- `getTelegramChats(companyId, limit, offset)` - получить список чатов
- `getTelegramChat(companyId, chatId)` - получить информацию о чате
- `getTelegramMessages(companyId, chatId, limit, offset)` - получить сообщения
- `sendTelegramMessage(companyId, chatId, text, replyToMessageId?)` - отправить сообщение
- `getTelegramContacts(companyId, limit, offset)` - получить контакты
- `searchTelegramContacts(companyId, query, limit)` - поиск контактов

## 🚀 Использование

### Доступ к мессенджеру

1. Нажмите на кнопку сообщений в хэдере (иконка чата)
2. Или перейдите по адресу `/telegram`

### Авторизация

1. Введите номер телефона в формате `+375291234567`
2. Нажмите "Отправить код"
3. Введите код из Telegram
4. Если включен 2FA, введите пароль

### Работа с чатами

1. После авторизации откроется список чатов
2. Выберите чат для просмотра сообщений
3. Введите сообщение и нажмите отправить

## ⚙️ Настройка

### Переменные окружения

Добавьте в `.env` файл:

```env
VITE_TELEGRAM_SERVICE_URL=http://localhost:8003/api/v1
```

Если переменная не указана, используется значение по умолчанию: `http://localhost:8003/api/v1`

## 📁 Структура файлов

- `frontend/src/pages/TelegramMessengerPage.tsx` - основная страница мессенджера
- `frontend/src/pages/TelegramMessengerPage.css` - стили для мессенджера
- `frontend/src/utils/api.ts` - API методы для работы с Telegram
- `frontend/src/components/Header.tsx` - кнопка сообщений в хэдере

## 🔐 Безопасность

- Все запросы используют JWT токены из localStorage
- Автоматическая обработка 401 ошибок (перенаправление на логин)
- Сессии Telegram хранятся в зашифрованном виде на бэкенде

## 🐛 Обработка ошибок

- Автоматическая проверка статуса авторизации при загрузке
- Обработка ошибок при отправке сообщений
- Показ понятных сообщений об ошибках пользователю

