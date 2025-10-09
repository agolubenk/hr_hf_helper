# План полного удаления Gemini AI из hr_hf_helper

## 1. Обзор изменений

### Цель
Полностью удалить все зависимости от Gemini AI и сконцентрировать всю логику анализа даты/времени в методе `analyze_time_with_parser`.

### Затрагиваемые компоненты
- Модель `Invite` (поле `gemini_suggested_datetime`)
- Методы анализа времени с Gemini
- Промпты и конфигурация Gemini
- API ключи и настройки
- Тесты и документация

## 2. Поэтапный план удаления

### Этап 1: Подготовка
```bash
# Создание ветки для изменений
git checkout -b remove-gemini-ai-integration
```

### Этап 2: Модель Invite
```python
# models.py - УДАЛИТЬ
class Invite(models.Model):
    # УДАЛИТЬ ЭТО ПОЛЕ
    # gemini_suggested_datetime = models.DateTimeField(null=True, blank=True)
    
    # ОСТАВИТЬ ТОЛЬКО ЭТИ ПОЛЯ
    interview_datetime = models.DateTimeField(null=True, blank=True)
    original_form_data = models.JSONField(default=dict)
```

### Этап 3: Создание миграции
```python
# migrations/XXXX_remove_gemini_fields.py
from django.db import migrations

class Migration(migrations.Migration):
    dependencies = [
        ('core', 'XXXX_previous_migration'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='invite',
            name='gemini_suggested_datetime',
        ),
    ]
```

### Этап 4: Удаление методов и функций
```python
# УДАЛИТЬ ПОЛНОСТЬЮ
def analyze_time_with_gemini(self, text):
    # УДАЛИТЬ ВСЮ ФУНКЦИЮ
    pass

# УДАЛИТЬ импорты
# import google.generativeai as genai
# from google.generativeai.types import HarmCategory, HarmBlockThreshold
```

### Этап 5: Обновление представлений (views)
```python
# views.py - НАЙТИ И ЗАМЕНИТЬ
# Заменить все вызовы analyze_time_with_gemini на analyze_time_with_parser
def process_invite_data(request):
    # БЫЛО
    # gemini_result = invite.analyze_time_with_gemini(text)
    
    # СТАЛО
    parser_result = invite.analyze_time_with_parser(text)
```

### Этап 6: Обновление сериализаторов
```python
# serializers.py - УДАЛИТЬ
class InviteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Invite
        fields = [
            'interview_datetime',
            'original_form_data',
            # УДАЛИТЬ: 'gemini_suggested_datetime',
        ]
```

### Этап 7: Настройки и конфигурация
```python
# settings.py - УДАЛИТЬ
# GEMINI_API_KEY = env('GEMINI_API_KEY', default=None)
# GEMINI_MODEL_NAME = env('GEMINI_MODEL_NAME', default='gemini-pro')

# requirements.txt - УДАЛИТЬ
# google-generativeai==x.x.x
```

### Этап 8: Обновление тестов
```python
# tests.py - УДАЛИТЬ ИЛИ ОБНОВИТЬ
class TestInvite(TestCase):
    def test_analyze_time_with_gemini(self):
        # УДАЛИТЬ ЭТОТ ТЕСТ
        pass
    
    def test_analyze_time_with_parser(self):
        # РАСШИРИТЬ ЭТОТ ТЕСТ
        invite = Invite.objects.create()
        result = invite.analyze_time_with_parser("завтра в 15:00")
        self.assertIsNotNone(result['parsed_datetime'])
```

## 3. Файлы для проверки и очистки

### 3.1 Файлы моделей
- `models.py` - удалить поле `gemini_suggested_datetime`
- `admin.py` - обновить отображение полей

### 3.2 Файлы представлений
- `views.py` - заменить вызовы Gemini на parser
- `api/views.py` - обновить API endpoints

### 3.3 Файлы форм и сериализаторов
- `forms.py` - убрать поля Gemini
- `serializers.py` - обновить поля модели

### 3.4 Файлы шаблонов
- `templates/` - найти и удалить отображение gemini_suggested_datetime
- `static/js/` - убрать JS код работы с Gemini полями

### 3.5 Конфигурационные файлы
- `settings.py` - удалить переменные Gemini
- `requirements.txt` - удалить google-generativeai
- `.env.example` - удалить GEMINI_API_KEY

## 4. Команды для поиска остатков

### Поиск по коду
```bash
# Поиск упоминаний Gemini
grep -r "gemini" --exclude-dir=venv --exclude-dir=node_modules .
grep -r "Gemini" --exclude-dir=venv --exclude-dir=node_modules .

# Поиск устаревших полей
grep -r "gemini_suggested_datetime" --exclude-dir=venv .

# Поиск методов
grep -r "analyze_time_with_gemini" --exclude-dir=venv .

# Поиск импортов
grep -r "google.generativeai" --exclude-dir=venv .
grep -r "genai" --exclude-dir=venv .
```

### Проверка базы данных
```sql
-- Проверить наличие поля в схеме
DESCRIBE core_invite;

-- Проверить данные (если поле еще есть)
SELECT COUNT(*) FROM core_invite WHERE gemini_suggested_datetime IS NOT NULL;
```

## 5. Тестирование после удаления

### 5.1 Unit тесты
```python
# Запуск всех тестов
python manage.py test

# Проверка конкретных тестов
python manage.py test apps.core.tests.TestInvite
```

### 5.2 Интеграционные тесты
```python
# Тестирование API
def test_create_invite_without_gemini():
    response = client.post('/api/invites/', {
        'original_form_data': {'text': 'завтра в 15:00'}
    })
    assert response.status_code == 201
    invite = Invite.objects.get(id=response.data['id'])
    assert invite.interview_datetime is not None
```

### 5.3 Ручное тестирование
- Создание нового инвайта через форму
- Анализ времени через analyze_time_with_parser
- Проверка корректности парсинга дат

## 6. Документация и очистка

### 6.1 Обновить README.md
```markdown
## Анализ времени

Приложение использует встроенный parser для анализа даты и времени:
- analyze_time_with_parser() - основной метод анализа
- Поддержка множественных форматов ввода
- Автоматическая коррекция опечаток
```

### 6.2 Обновить API документацию
- Убрать поле `gemini_suggested_datetime` из схем
- Обновить примеры ответов API

### 6.3 Комментарии в коде
```python
# TODO: Удалить после полного перехода на parser
# DEPRECATED: Этот метод был заменен на analyze_time_with_parser
```

## 7. Контрольный список (Checklist)

### Код
- [ ] Удалено поле `gemini_suggested_datetime` из модели
- [ ] Удален метод `analyze_time_with_gemini`
- [ ] Обновлены все вызовы на `analyze_time_with_parser`
- [ ] Удалены импорты google.generativeai
- [ ] Обновлены сериализаторы и формы

### База данных
- [ ] Создана миграция для удаления поля
- [ ] Выполнена миграция на dev/staging
- [ ] Проверена целостность данных

### Конфигурация
- [ ] Удалены настройки Gemini из settings.py
- [ ] Удалена зависимость из requirements.txt
- [ ] Обновлен .env.example

### Тестирование
- [ ] Обновлены unit тесты
- [ ] Пройдены все тесты
- [ ] Проведено интеграционное тестирование
- [ ] Ручное тестирование функциональности

### Документация
- [ ] Обновлен README.md
- [ ] Обновлена API документация
- [ ] Удалены устаревшие комментарии

## 8. Команды для выполнения

```bash
# 1. Создание миграции
python manage.py makemigrations --empty core

# 2. Применение миграций
python manage.py migrate

# 3. Тестирование
python manage.py test

# 4. Проверка покрытия тестами
coverage run --source='.' manage.py test
coverage report

# 5. Статический анализ
flake8 .
pylint apps/
```

## 9. План отката (Rollback Plan)

В случае проблем:

```bash
# Откат миграции
python manage.py migrate core XXXX_previous_migration

# Возврат к предыдущему коммиту
git reset --hard HEAD~1

# Восстановление ветки
git checkout main
git branch -D remove-gemini-ai-integration
```

## 10. Мониторинг после деплоя

- Отслеживание ошибок в логах
- Проверка корректности парсинга времени
- Мониторинг производительности analyze_time_with_parser
- Проверка отсутствия 500 ошибок, связанных с Gemini

Этот план обеспечит полную и безопасную зачистку кода от интеграции с Gemini AI.