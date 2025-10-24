# 📋 План найма (Hiring Plan) - Концепция и MVP

## 🎯 Цель модуля

**Hiring Plan** - это приложение для стратегического планирования найма специалистов, которое позволяет:
- Планировать количество необходимых специалистов по вакансиям
- Визуализировать прогресс и статус найма
- Управлять приоритетами и дедлайнами
- Отслеживать ключевые метрики рекрутинга
- Автоматизировать активацию вакансий в HuntFlow

## 🏗️ Архитектурное решение

### Интеграция с текущей системой

```
┌─────────────────────────────────────────────────────────────┐
│              Существующие модули hr_hf_helper               │
├─────────────────────────────────────────────────────────────┤
│  accounts/     │  vacancies/    │  finance/                 │
│  (User)        │  (Vacancy,     │  (Grade,                  │
│                │   SalaryRange) │   CurrencyRate)           │
│                                                              │
│  huntflow/     │  google_oauth/ │  clickup_int/             │
│  (HuntFlow     │  (Calendar,    │  (Task import)            │
│   интеграция)  │   Screening)   │                           │
└─────────────────────────────────────────────────────────────┘
                            ↓ ↓ ↓
┌─────────────────────────────────────────────────────────────┐
│                   🆕 hiring_plan/                            │
├─────────────────────────────────────────────────────────────┤
│  • HiringPlan          - План найма                         │
│  • HiringPlanPosition  - Позиции в плане                    │
│  • PlanMetrics         - Метрики плана                      │
└─────────────────────────────────────────────────────────────┘
```

### Принципы интеграции

✅ **Переиспользуем существующие модели:**
- `vacancies.Vacancy` - вакансии (с external_id для HuntFlow)
- `finance.Grade` - грейды специалистов
- `accounts.User` - рекрутеры и владельцы планов
- `finance.CurrencyRate` - курсы валют для бюджетирования

✅ **Минимальные зависимости:**
- Не затрагиваем существующие модели
- Используем ForeignKey для связей
- Отдельное приложение = изолированность

✅ **Постепенное развитие:**
- MVP: базовая функциональность без сложных метрик
- Фаза 2: интеграция с HuntFlow для синхронизации
- Фаза 3: расширенная аналитика

---

## 📦 MVP: Минимальный жизнеспособный продукт

### Что включает MVP

#### 1. Модели данных (3 модели)

**HiringPlan** - Главная сущность плана найма
```python
class HiringPlan(models.Model):
    title = CharField(max_length=255)
    description = TextField(blank=True)
    
    # Временные рамки
    start_date = DateField()
    end_date = DateField(null=True, blank=True)
    
    # Статус
    STATUS_CHOICES = [
        ('draft', 'Черновик'),
        ('active', 'Активен'),
        ('paused', 'На паузе'),
        ('completed', 'Завершен'),
        ('cancelled', 'Отменен'),
    ]
    status = CharField(max_length=20, choices=STATUS_CHOICES)
    
    # Владение
    owner = ForeignKey(User, on_delete=SET_NULL, null=True)
    responsible_recruiter = ForeignKey(User, ...)
    
    # Метаданные
    created_at = DateTimeField(auto_now_add=True)
    updated_at = DateTimeField(auto_now=True)
```

**HiringPlanPosition** - Позиции внутри плана
```python
class HiringPlanPosition(models.Model):
    hiring_plan = ForeignKey(HiringPlan, on_delete=CASCADE)
    vacancy = ForeignKey('vacancies.Vacancy', on_delete=CASCADE)
    
    # Количество специалистов
    headcount_needed = PositiveIntegerField()
    headcount_hired = PositiveIntegerField(default=0)
    headcount_in_progress = PositiveIntegerField(default=0)
    
    # Приоритизация
    PRIORITY_CHOICES = [
        (1, 'Критический'),
        (2, 'Высокий'),
        (3, 'Средний'),
        (4, 'Низкий'),
    ]
    priority = IntegerField(choices=PRIORITY_CHOICES, default=3)
    
    # Срочность
    urgency_deadline = DateField(null=True, blank=True)
    
    # Грейды (M2M к существующим)
    grades = ManyToManyField('finance.Grade', blank=True)
    
    # Специфика
    specifics = TextField(blank=True)
    notes = TextField(blank=True)
    
    # Активность
    is_active = BooleanField(default=True)
    
    created_at = DateTimeField(auto_now_add=True)
    updated_at = DateTimeField(auto_now=True)
```

**PlanMetrics** - Базовые метрики (упрощенные для MVP)
```python
class PlanMetrics(models.Model):
    hiring_plan = OneToOneField(HiringPlan, on_delete=CASCADE)
    
    # Простые счетчики
    total_positions = PositiveIntegerField(default=0)
    total_headcount_needed = PositiveIntegerField(default=0)
    total_headcount_hired = PositiveIntegerField(default=0)
    
    # Прогресс (в процентах)
    completion_rate = DecimalField(max_digits=5, decimal_places=2, default=0)
    
    # Дата последнего обновления
    last_updated = DateTimeField(auto_now=True)
```

#### 2. Визуальный интерфейс

**Страница списка планов** (`/hiring-plans/`)
- Таблица всех планов найма
- Фильтры: статус, рекрутер, даты
- Поиск по названию
- Карточки с прогресс-барами

**Страница детального просмотра плана** (`/hiring-plans/<id>/`)
- Общая информация о плане
- Прогресс-бар выполнения
- Таблица позиций с:
  - Вакансией
  - Грейдами
  - Количеством (нужно/нанято/в процессе)
  - Приоритетом
  - Дедлайном
  - Статусом
- Кнопки действий: редактировать, добавить позицию

**Форма создания/редактирования плана** (`/hiring-plans/create/`, `/hiring-plans/<id>/edit/`)
- Название, описание
- Даты начала/окончания
- Статус
- Выбор ответственного рекрутера

**Форма добавления позиции** (`/hiring-plans/<id>/positions/add/`)
- Выбор вакансии (из существующих)
- Количество специалистов
- Выбор грейдов (множественный выбор)
- Приоритет
- Дедлайн
- Специфика/заметки

#### 3. Базовая функциональность

✅ **CRUD операции:**
- Создание плана найма
- Редактирование плана
- Удаление плана (с подтверждением)
- Просмотр списка планов

✅ **Управление позициями:**
- Добавление позиции в план
- Редактирование позиции
- Удаление позиции
- Обновление количества (нанято/в процессе)

✅ **Базовая аналитика:**
- Автоматический подсчет прогресса плана
- Вычисление completion_rate
- Отображение статистики по приоритетам
- Индикаторы просроченных дедлайнов

✅ **Визуализация:**
- Progress bar общего прогресса
- Цветовая индикация приоритетов
- Badge'и для статусов
- Иконки для действий

#### 4. Интеграция с существующими модулями

✅ **С vacancies.Vacancy:**
- Выбор вакансий из выпадающего списка
- Отображение названия и external_id
- Фильтр только активных вакансий

✅ **С finance.Grade:**
- Множественный выбор грейдов для позиции
- Отображение названий грейдов
- Фильтрация по грейдам

✅ **С accounts.User:**
- Выбор owner и responsible_recruiter
- Фильтр только пользователей с ролью "Рекрутер"
- Отображение имени пользователя

---

## 🎨 Дизайн интерфейса (в стиле hr_hf_helper)

### 1. Страница списка планов

```
┌────────────────────────────────────────────────────────────┐
│  📋 Планы найма                         [+ Создать план]   │
├────────────────────────────────────────────────────────────┤
│  Фильтры: [Статус ▼] [Рекрутер ▼] [Даты]  🔍 Поиск...     │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 📊 Q4 2025 Backend Team Growth                        │  │
│  │ Статус: 🟢 Активен  │  Владелец: Андрей Голубенко    │  │
│  │ Дедлайн: 31.12.2025 │  Прогресс: ████████░░ 75%       │  │
│  │ Позиций: 5 │ Нужно: 15 │ Нанято: 11 │ В процессе: 2   │  │
│  │ [👁 Просмотр] [✏️ Редактировать] [📊 Метрики]          │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 📊 Poland Office Expansion                            │  │
│  │ Статус: 🟡 Черновик │  Владелец: ...                  │  │
│  │ Дедлайн: 15.02.2026 │  Прогресс: ██░░░░░░░░ 20%       │  │
│  │ Позиций: 3 │ Нужно: 8 │ Нанято: 2 │ В процессе: 0    │  │
│  │ [👁 Просмотр] [✏️ Редактировать] [📊 Метрики]          │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
```

### 2. Страница детального просмотра плана

```
┌────────────────────────────────────────────────────────────┐
│  ← Назад к планам                                          │
├────────────────────────────────────────────────────────────┤
│  📋 Q4 2025 Backend Team Growth                            │
│  Статус: 🟢 Активен  │  Период: 01.10.2025 - 31.12.2025  │
│  Владелец: Андрей Голубенко │ Рекрутер: ...                │
├────────────────────────────────────────────────────────────┤
│  📊 Общий прогресс                                         │
│  ████████████████░░░░ 75% (11 из 15 нанято)               │
├────────────────────────────────────────────────────────────┤
│  📋 Позиции в плане               [+ Добавить позицию]     │
│  ┌────────────────────────────────────────────────────┐    │
│  │ Вакансия │ Грейды │ Нужно │ Нанято │ Приоритет │ ⏰  │    │
│  ├────────────────────────────────────────────────────┤    │
│  │ Backend Engineer (Java) │ Middle, Senior │ 5 │ 4 │    │    │
│  │ 🔴 Критический │ 31.10.2025 │ [✏️] [🗑️]            │    │
│  ├────────────────────────────────────────────────────┤    │
│  │ Frontend Engineer (React) │ Middle │ 3 │ 2 │         │    │
│  │ 🟡 Средний │ 15.11.2025 │ [✏️] [🗑️]                 │    │
│  ├────────────────────────────────────────────────────┤    │
│  │ DevOps Engineer │ Senior │ 2 │ 2 │ ✅               │    │
│  │ 🟢 Низкий │ 30.12.2025 │ [✏️] [🗑️]                  │    │
│  └────────────────────────────────────────────────────┘    │
└────────────────────────────────────────────────────────────┘
```

### 3. Форма создания плана

```
┌────────────────────────────────────────────────────────────┐
│  📋 Создание плана найма                                   │
├────────────────────────────────────────────────────────────┤
│  Название плана *                                          │
│  [_____________________________]                           │
│                                                             │
│  Описание                                                  │
│  [___________________________________________________________│
│   ___________________________________________________________│
│   __________________________________________________________]│
│                                                             │
│  Дата начала *         Дата окончания                      │
│  [01.10.2025 📅]      [31.12.2025 📅]                      │
│                                                             │
│  Статус *              Ответственный рекрутер *            │
│  [Активен ▼]          [Андрей Голубенко ▼]                │
│                                                             │
│  [💾 Сохранить]  [❌ Отмена]                               │
└────────────────────────────────────────────────────────────┘
```

### 4. Форма добавления позиции

```
┌────────────────────────────────────────────────────────────┐
│  📋 Добавление позиции в план "Q4 2025 Backend Team"       │
├────────────────────────────────────────────────────────────┤
│  Вакансия *                                                │
│  [Backend Engineer (Java) ▼]                               │
│                                                             │
│  Грейды * (можно выбрать несколько)                        │
│  ☑ Junior   ☑ Middle   ☑ Senior   ☐ Lead   ☐ Head        │
│                                                             │
│  Количество специалистов *                                 │
│  Требуется: [5]  │  Нанято: [0]  │  В процессе: [0]       │
│                                                             │
│  Приоритет *           Дедлайн                             │
│  [Высокий ▼]          [31.10.2025 📅]                      │
│                                                             │
│  Специфика позиции                                         │
│  [___________________________________________________________│
│   Требования: опыт работы с Spring Boot, микросервисы...   │
│   __________________________________________________________]│
│                                                             │
│  Заметки                                                   │
│  [___________________________________________________________│
│   Важно: срочно нужны для проекта E-commerce...            │
│   __________________________________________________________]│
│                                                             │
│  [💾 Добавить позицию]  [❌ Отмена]                        │
└────────────────────────────────────────────────────────────┘
```

---

## 🔧 Техническая реализация MVP

### Структура приложения

```
apps/hiring_plan/
├── __init__.py
├── models.py                  # Модели данных
├── admin.py                   # Django admin
├── views.py                   # Views для интерфейса
├── urls.py                    # URL маршруты
├── forms.py                   # Формы создания/редактирования
├── services.py               # Бизнес-логика (сервисный слой)
├── templates/
│   └── hiring_plan/
│       ├── plan_list.html        # Список планов
│       ├── plan_detail.html      # Детальный просмотр
│       ├── plan_form.html        # Форма плана
│       └── position_form.html    # Форма позиции
└── static/
    └── hiring_plan/
        ├── css/
        │   └── hiring_plan.css   # Стили
        └── js/
            └── hiring_plan.js    # Интерактивность
```

### Ключевые методы в models.py

```python
class HiringPlan(models.Model):
    # ... поля ...
    
    @property
    def total_positions(self):
        """Общее количество позиций"""
        return self.positions.count()
    
    @property
    def total_headcount_needed(self):
        """Общее количество требуемых специалистов"""
        return self.positions.aggregate(
            total=Sum('headcount_needed')
        )['total'] or 0
    
    @property
    def total_headcount_hired(self):
        """Общее количество нанятых"""
        return self.positions.aggregate(
            total=Sum('headcount_hired')
        )['total'] or 0
    
    @property
    def completion_rate(self):
        """Процент выполнения плана"""
        needed = self.total_headcount_needed
        if needed == 0:
            return 0
        hired = self.total_headcount_hired
        return round((hired / needed) * 100, 2)
    
    def update_metrics(self):
        """Обновление метрик плана"""
        metrics, created = PlanMetrics.objects.get_or_create(
            hiring_plan=self
        )
        metrics.total_positions = self.total_positions
        metrics.total_headcount_needed = self.total_headcount_needed
        metrics.total_headcount_hired = self.total_headcount_hired
        metrics.completion_rate = self.completion_rate
        metrics.save()


class HiringPlanPosition(models.Model):
    # ... поля ...
    
    @property
    def fulfillment_rate(self):
        """Процент закрытия позиции"""
        if self.headcount_needed == 0:
            return 0
        return round((self.headcount_hired / self.headcount_needed) * 100, 2)
    
    @property
    def is_fulfilled(self):
        """Позиция полностью закрыта?"""
        return self.headcount_hired >= self.headcount_needed
    
    @property
    def remaining_headcount(self):
        """Сколько еще нужно нанять"""
        return max(0, self.headcount_needed - self.headcount_hired)
    
    @property
    def is_overdue(self):
        """Проверка просрочки дедлайна"""
        if not self.urgency_deadline:
            return False
        return timezone.now().date() > self.urgency_deadline and not self.is_fulfilled
    
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Обновляем метрики плана после сохранения позиции
        self.hiring_plan.update_metrics()
```

### Сервисный слой (services.py)

```python
from django.db.models import Sum, Count, Q
from .models import HiringPlan, HiringPlanPosition

class HiringPlanService:
    """Сервис для работы с планами найма"""
    
    @staticmethod
    def get_dashboard_data(hiring_plan):
        """Получить данные для дашборда плана"""
        positions = hiring_plan.positions.all()
        
        return {
            'overview': {
                'total_positions': hiring_plan.total_positions,
                'total_needed': hiring_plan.total_headcount_needed,
                'total_hired': hiring_plan.total_headcount_hired,
                'completion_rate': hiring_plan.completion_rate,
            },
            'by_priority': {
                'critical': positions.filter(priority=1, is_fulfilled=False).count(),
                'high': positions.filter(priority=2, is_fulfilled=False).count(),
                'medium': positions.filter(priority=3, is_fulfilled=False).count(),
                'low': positions.filter(priority=4, is_fulfilled=False).count(),
            },
            'overdue': positions.filter(
                urgency_deadline__lt=timezone.now().date(),
                is_fulfilled=False
            ).count(),
        }
    
    @staticmethod
    def get_plans_summary():
        """Получить summary всех планов"""
        plans = HiringPlan.objects.filter(status='active')
        
        return {
            'total_plans': plans.count(),
            'total_positions': sum(p.total_positions for p in plans),
            'total_needed': sum(p.total_headcount_needed for p in plans),
            'total_hired': sum(p.total_headcount_hired for p in plans),
        }
```

### URL маршруты (urls.py)

```python
from django.urls import path
from . import views

app_name = 'hiring_plan'

urlpatterns = [
    # Список планов
    path('', views.PlanListView.as_view(), name='plan_list'),
    
    # Создание плана
    path('create/', views.PlanCreateView.as_view(), name='plan_create'),
    
    # Детальный просмотр плана
    path('<int:pk>/', views.PlanDetailView.as_view(), name='plan_detail'),
    
    # Редактирование плана
    path('<int:pk>/edit/', views.PlanUpdateView.as_view(), name='plan_update'),
    
    # Удаление плана
    path('<int:pk>/delete/', views.PlanDeleteView.as_view(), name='plan_delete'),
    
    # Добавление позиции
    path('<int:plan_pk>/positions/add/', 
         views.PositionCreateView.as_view(), name='position_add'),
    
    # Редактирование позиции
    path('positions/<int:pk>/edit/', 
         views.PositionUpdateView.as_view(), name='position_update'),
    
    # Удаление позиции
    path('positions/<int:pk>/delete/', 
         views.PositionDeleteView.as_view(), name='position_delete'),
]
```

---

## 📊 Возможности для будущего развития (после MVP)

### Фаза 2: Интеграция с HuntFlow

✨ **Автоматическая синхронизация:**
- Автоматическое обновление количества нанятых из HuntFlow
- Синхронизация статусов кандидатов
- Обновление headcount_in_progress из активных откликов

✨ **Автоматизация активации вакансий:**
- Автоактивация вакансий в HuntFlow при создании позиции
- Автодеактивация при достижении целевого headcount
- Webhooks для обновлений в реальном времени

### Фаза 3: Расширенная аналитика

✨ **Метрики найма:**
- Time-to-Fill (среднее время закрытия позиции)
- Cost-per-Hire (стоимость найма)
- Source of Hire (эффективность каналов)
- Conversion rates (конверсии воронки)

✨ **Прогнозирование:**
- Прогноз даты завершения плана
- Риск-анализ срыва дедлайнов
- Рекомендации по приоритизации

### Фаза 4: Бюджетирование

✨ **Финансовый tracking:**
- Бюджет плана найма
- Фактические затраты vs план
- Интеграция с SalaryRange для оценки стоимости
- Отчеты по финансам

### Фаза 5: Collaboration

✨ **Совместная работа:**
- Комментарии к позициям
- История изменений
- Уведомления для рекрутеров
- Интеграция с Telegram для алертов

---

## ✅ Чеклист MVP разработки

### Этап 1: Модели и миграции (1 день)
- [ ] Создать models.py с HiringPlan, HiringPlanPosition, PlanMetrics
- [ ] Добавить методы @property для подсчетов
- [ ] Создать и применить миграции
- [ ] Зарегистрировать модели в admin.py

### Этап 2: Формы (1 день)
- [ ] Создать HiringPlanForm
- [ ] Создать HiringPlanPositionForm
- [ ] Добавить валидацию форм
- [ ] Настроить widgets для дат и селектов

### Этап 3: Views (1-2 дня)
- [ ] PlanListView - список планов
- [ ] PlanDetailView - детальный просмотр
- [ ] PlanCreateView - создание плана
- [ ] PlanUpdateView - редактирование
- [ ] PlanDeleteView - удаление
- [ ] PositionCreateView - добавление позиции
- [ ] PositionUpdateView - редактирование позиции
- [ ] PositionDeleteView - удаление позиции

### Этап 4: Templates (1-2 дня)
- [ ] plan_list.html - список с фильтрами
- [ ] plan_detail.html - детальный view с таблицей позиций
- [ ] plan_form.html - форма создания/редактирования
- [ ] position_form.html - форма позиции
- [ ] Интеграция с base.html проекта

### Этап 5: Стили и UI (1 день)
- [ ] CSS стили в стиле проекта (Bootstrap)
- [ ] Progress bars для прогресса
- [ ] Badge'и для приоритетов и статусов
- [ ] Цветовая индикация дедлайнов

### Этап 6: Тестирование (1 день)
- [ ] Создание тестовых данных
- [ ] Проверка всех CRUD операций
- [ ] Проверка подсчетов и метрик
- [ ] Проверка на различных разрешениях

### Этап 7: Документация (0.5 дня)
- [ ] README для модуля
- [ ] Комментарии в коде
- [ ] Описание моделей и методов

**Итого: 6.5-8 дней разработки для MVP**

---

## 🎯 Итоговая концепция

### Что получаем в MVP:

✅ **Простое и понятное приложение** для планирования найма
✅ **Визуальный интерфейс** с прогресс-барами и индикаторами
✅ **Интеграция с существующими моделями** (Vacancy, Grade, User)
✅ **Минимальные зависимости** - не ломаем текущую систему
✅ **Готовность к расширению** - архитектура позволяет добавлять функции

### Ключевые преимущества:

🚀 **Быстрая разработка** - MVP за 6-8 дней
🎨 **Единый стиль** - использует Bootstrap и дизайн hr_hf_helper
🔧 **Гибкость** - легко добавлять новые функции
📊 **Полезность** - сразу дает ценность для рекрутеров
🔗 **Интеграция** - готовность к связи с HuntFlow

### Следующие шаги:

1. **Утверждение концепции** - согласовать функциональность MVP
2. **Начало разработки** - создание моделей и миграций
3. **Итеративная разработка** - постепенное добавление UI
4. **Тестирование** - проверка на реальных данных
5. **Деплой MVP** - первый релиз для использования
6. **Сбор feedback** - корректировка на основе опыта
7. **Фаза 2** - добавление интеграции с HuntFlow

---

## 💡 Дополнительные идеи для обсуждения

### Вопросы для уточнения:

1. **Проекты/департаменты** - нужно ли добавлять сущность "Проект"?
2. **Бюджетирование** - включать ли бюджет в MVP или отложить?
3. **Webhooks HuntFlow** - насколько критична реалтайм синхронизация?
4. **Экспорт данных** - нужен ли экспорт в Excel/CSV в MVP?
5. **Канбан-доска** - альтернативный view для позиций?

### Возможные улучшения MVP:

- Фильтры и поиск в списке планов
- Bulk actions для позиций (массовое обновление)
- Quick edit прямо в таблице (inline editing)
- Экспорт плана в Excel
- Dashboard с общей статистикой по всем планам

Готов обсудить любые аспекты и начать разработку! 🚀
