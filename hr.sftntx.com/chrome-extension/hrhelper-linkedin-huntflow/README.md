# 🔌 HRHelper LinkedIn → Huntflow Chrome Extension

Chrome расширение для интеграции LinkedIn с Huntflow через HRHelper.

## 🚀 Быстрый старт

1. **Установите расширение** (см. [SETUP_GUIDE.md](./SETUP_GUIDE.md))
2. **Настройте Base URL** и **API Token** в настройках расширения
3. **Откройте LinkedIn** - кнопка "Huntflow" появится автоматически

## 📚 Документация

- **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - Полное руководство по настройке
- **[PRODUCTION_SETUP.md](./PRODUCTION_SETUP.md)** - Быстрая инструкция для продакшена

## ⚙️ Настройка для продакшена

### Автоматическое обновление manifest.json

Используйте скрипт для добавления продакшен домена:

```bash
./update_manifest.sh https://your-production-domain.com
```

### Ручное обновление

Откройте `manifest.json` и добавьте ваш домен в `host_permissions`:

```json
"host_permissions": [
  "https://www.linkedin.com/*",
  "https://your-production-domain.com/*"  // ← Добавьте ваш домен
]
```

## 🔑 Получение API токена

1. Откройте HRHelper в браузере
2. Перейдите: `https://your-domain.com/api/v1/accounts/users/token/`
3. Скопируйте токен из ответа
4. Вставьте в настройки расширения

## ✅ Функции

- ✅ Кнопка "Huntflow" на профилях LinkedIn
- ✅ Сохранение связи LinkedIn → Huntflow
- ✅ Быстрое открытие кандидатов в Huntflow
- ✅ Отслеживание статуса кандидата

## 🐛 Устранение проблем

См. раздел [Устранение проблем](./SETUP_GUIDE.md#устранение-проблем) в SETUP_GUIDE.md

## 📝 Лицензия

Внутренний проект HRHelper
