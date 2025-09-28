# 🚀 Huntflow Integration - Краткая инструкция

## 📋 Что создано

Приложение `huntflow` для интеграции с Huntflow API, которое позволяет:

✅ **Просматривать вакансии** - список, детали, статусы  
✅ **Просматривать кандидатов** - профили, анкеты, фильтрация  
✅ **Тестировать подключение** - проверка API ключей  
✅ **Фильтровать данные** - по статусам, вакансиям, пагинация  

## 🔧 Настройка

### 1. Настройте Huntflow в профиле пользователя
В админ панели (`/admin/accounts/user/`) укажите:

```python
# PROD система
huntflow_prod_url = "https://your-company.huntflow.ru"
huntflow_prod_api_key = "your_prod_api_key"

# SANDBOX система  
huntflow_sandbox_url = "https://sandbox.huntflow.dev"
huntflow_sandbox_api_key = "your_sandbox_api_key"

# Активная система
active_system = "PROD"  # или "SANDBOX"
```

### 2. Получите API ключи Huntflow
1. Войдите в Huntflow → Настройки → API
2. Создайте новый токен
3. Скопируйте `access_token`

## 🚀 Использование

### Доступ к приложению
```
http://localhost:8000/huntflow/
```

### Основные страницы
- **Дашборд** - тест подключения, список организаций
- **Вакансии** - `/huntflow/accounts/{id}/vacancies/`
- **Кандидаты** - `/huntflow/accounts/{id}/applicants/`

### Функции
- 🔌 **Тест API** - проверка подключения к Huntflow
- 📋 **Фильтры** - по статусам, вакансиям, пагинация
- 🔍 **Поиск** - быстрая навигация по данным
- 📱 **Responsive** - работает на всех устройствах

## 🎯 API Endpoints

```python
# Основные
GET /v2/accounts                    # Организации
GET /v2/accounts/{id}/vacancies    # Вакансии
GET /v2/accounts/{id}/applicants   # Кандидаты
GET /v2/accounts/{id}/vacancies/statuses      # Статусы
GET /v2/accounts/{id}/applicants/questionary  # Анкеты
```

## 🐛 Отладка

### Включить debug
```python
# settings.py
DEBUG = True
```

### Проверить подключение
1. Откройте `/huntflow/`
2. Нажмите "Тест подключения"
3. Проверьте сообщения об ошибках

## 📁 Структура файлов

```
apps/huntflow/
├── services.py          # HuntflowService - работа с API
├── views.py            # Views для страниц
├── urls.py             # URL маршруты
└── templates/          # HTML шаблоны
    ├── dashboard.html  # Главная страница
    ├── vacancies_list.html    # Список вакансий
    ├── applicants_list.html   # Список кандидатов
    └── ...
```

## 🔒 Безопасность

- ✅ Требует авторизации
- ✅ Пользователь видит только свои данные
- ✅ CSRF защита для форм
- ✅ Безопасное хранение API ключей

## 🚀 Запуск

```bash
# Активировать виртуальное окружение
source venv/bin/activate

# Запустить сервер
python manage.py runserver 8000

# Открыть в браузере
http://localhost:8000/huntflow/
```

---

**Готово к использованию!** 🎉
