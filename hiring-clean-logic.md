# 📋 ЛОГИКА СИСТЕМЫ: Единственный план + Заявки на найм + SLA

## 🎯 КОНЦЕПЦИЯ

**Нет множественных планов найма** — есть **один глобальный реестр заявок**.  
Каждая **Заявка (HiringRequest)** = запрос на **1 специалиста**.  
**SLA** привязана к паре **Вакансия + Грейд** и определяет целевые сроки (time-to-fill, time-to-hire).

---

## 📊 ОСНОВНЫЕ СУЩНОСТИ

### 1. SLA (Service Level Agreement)

**Назначение:** Определяет целевые сроки для закрытия вакансии конкретного грейда.

**Модель:**
```python
class VacancySLA(models.Model):
    """SLA для пары Вакансия + Грейд"""
    
    vacancy = ForeignKey('vacancies.Vacancy', on_delete=CASCADE,
                        verbose_name='Вакансия')
    grade = ForeignKey('finance.Grade', on_delete=CASCADE,
                      verbose_name='Грейд')
    
    # Целевые показатели в днях
    time_to_fill = PositiveIntegerField(
        verbose_name='Time-to-Fill (дни)',
        help_text='Целевое время от открытия до закрытия вакансии'
    )
    time_to_hire = PositiveIntegerField(
        verbose_name='Time-to-Hire (дни)',
        help_text='Целевое время от первого контакта до оффера'
    )
    
    # Метаданные
    is_active = BooleanField(default=True)
    created_at = DateTimeField(auto_now_add=True)
    updated_at = DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'SLA вакансии'
        verbose_name_plural = 'SLA вакансий'
        unique_together = [['vacancy', 'grade']]
    
    def __str__(self):
        return f"SLA: {self.vacancy.name} - {self.grade.name} ({self.time_to_fill} дней)"
```

**Пример:**
- Backend Engineer (Java) + Middle → Time-to-Fill: 30 дней, Time-to-Hire: 21 день
- Backend Engineer (Java) + Senior → Time-to-Fill: 45 дней, Time-to-Hire: 30 дней

---

### 2. Заявка на найм (HiringRequest)

**Назначение:** Индивидуальный запрос на найм **одного** специалиста.

**Модель:**
```python
class HiringRequest(models.Model):
    """Заявка на найм одного специалиста"""
    
    # === ОСНОВНАЯ ИНФОРМАЦИЯ ===
    vacancy = ForeignKey('vacancies.Vacancy', on_delete=CASCADE,
                        verbose_name='Вакансия')
    grade = ForeignKey('finance.Grade', on_delete=PROTECT,
                      verbose_name='Грейд')
    project = CharField(max_length=200, blank=True,
                       verbose_name='Проект')
    
    # === ПРИОРИТЕТ ===
    PRIORITY_CHOICES = [
        (1, 'Критический'),
        (2, 'Высокий'),
        (3, 'Средний'),
        (4, 'Низкий'),
    ]
    priority = IntegerField(choices=PRIORITY_CHOICES, default=3,
                           verbose_name='Приоритет')
    
    # === СТАТУС ===
    STATUS_CHOICES = [
        ('planned', 'Планируется'),
        ('in_progress', 'В процессе'),
        ('overdue', 'Просрочена'),
        ('cancelled', 'Отменена'),
        ('closed', 'Закрыта'),
    ]
    status = CharField(max_length=20, choices=STATUS_CHOICES, 
                      default='planned', verbose_name='Статус')
    
    # === ПРИЧИНА ОТКРЫТИЯ ===
    REASON_CHOICES = [
        ('replacement_army', 'Замена - армия'),
        ('replacement_fired', 'Замена - увольнение'),
        ('replacement_decree', 'Замена - декрет'),
        ('new_position', 'Новая позиция'),
        ('expansion', 'Расширение команды'),
        ('other', 'Другое'),
    ]
    opening_reason = CharField(max_length=30, choices=REASON_CHOICES,
                              verbose_name='Причина открытия')
    
    # === ДАТЫ ===
    opening_date = DateField(
        verbose_name='Дата открытия вакансии',
        help_text='Может быть в будущем или прошлом'
    )
    deadline = DateField(
        verbose_name='Дедлайн',
        help_text='Целевая дата закрытия'
    )
    closed_date = DateField(
        null=True, blank=True,
        verbose_name='Дата закрытия'
    )
    
    # === SLA (автоматически подтягивается) ===
    sla = ForeignKey(VacancySLA, on_delete=SET_NULL, null=True, blank=True,
                    verbose_name='SLA', 
                    help_text='Автоматически определяется по Вакансия+Грейд')
    
    # === ПЕРИОД В РАБОТЕ ===
    @property
    def days_in_progress(self):
        """Количество дней в работе"""
        if self.status == 'closed' and self.closed_date:
            return (self.closed_date - self.opening_date).days
        else:
            return (timezone.now().date() - self.opening_date).days
    
    # === КАНДИДАТ (если закрыта) ===
    candidate = ForeignKey('candidates.Candidate', on_delete=SET_NULL,
                          null=True, blank=True,
                          verbose_name='Кандидат')
    
    # === ЗАМЕТКИ ===
    notes = TextField(blank=True, verbose_name='Заметки')
    
    # === МЕТАДАННЫЕ ===
    created_at = DateTimeField(auto_now_add=True)
    updated_at = DateTimeField(auto_now=True)
    created_by = ForeignKey(User, on_delete=SET_NULL, null=True, blank=True,
                           related_name='created_requests')
    
    class Meta:
        verbose_name = 'Заявка на найм'
        verbose_name_plural = 'Заявки на найм'
        ordering = ['-opening_date', 'priority']
        indexes = [
            Index(fields=['status', 'opening_date']),
            Index(fields=['vacancy', 'grade']),
            Index(fields=['deadline']),
        ]
    
    def __str__(self):
        return f"{self.vacancy.name} ({self.grade.name}) - {self.get_status_display()}"
    
    def save(self, *args, **kwargs):
        # Автоматически определяем SLA
        if not self.sla:
            self.sla = VacancySLA.objects.filter(
                vacancy=self.vacancy,
                grade=self.grade,
                is_active=True
            ).first()
        
        # Автоматически меняем статус на overdue, если просрочен дедлайн
        if self.status in ['planned', 'in_progress']:
            if timezone.now().date() > self.deadline:
                self.status = 'overdue'
        
        super().save(*args, **kwargs)
    
    @property
    def is_overdue(self):
        """Проверка просрочки"""
        if self.status == 'closed':
            return False
        return timezone.now().date() > self.deadline
    
    @property
    def sla_compliance(self):
        """Соответствие SLA (%)"""
        if not self.sla or not self.closed_date:
            return None
        
        actual_days = (self.closed_date - self.opening_date).days
        target_days = self.sla.time_to_fill
        
        if actual_days <= target_days:
            return 100
        else:
            return round((target_days / actual_days) * 100, 2)
    
    @property
    def sla_status_display(self):
        """Текстовый статус по SLA"""
        if not self.sla:
            return 'Нет SLA'
        
        if self.status == 'closed' and self.closed_date:
            compliance = self.sla_compliance
            if compliance >= 100:
                return 'В срок'
            elif compliance >= 80:
                return 'С задержкой'
            else:
                return 'Просрочено'
        else:
            days_left = (self.deadline - timezone.now().date()).days
            if days_left >= 7:
                return 'Нормально'
            elif days_left >= 0:
                return 'Риск просрочки'
            else:
                return 'Просрочено'
```

---

## 🔄 ЛОГИКА РАБОТЫ

### Создание заявки

1. **Выбираем Вакансию и Грейд**
2. **Автоматически подтягивается SLA** (если настроена для этой пары)
3. **Указываем:**
   - Проект
   - Приоритет
   - Причину открытия (замена-армия/увольнение или новая позиция)
   - Дату открытия (может быть будущая или прошлая)
   - Дедлайн (автоматически рассчитывается из SLA: opening_date + time_to_fill)
4. **Статус:** по умолчанию "Планируется"

### Работа с заявкой

**Статусы:**
- **Планируется** → ещё не началась активная работа
- **В процессе** → активно ищем кандидата
- **Просрочена** → автоматически, если deadline прошёл
- **Отменена** → заявка отменена
- **Закрыта** → найден кандидат, указана дата закрытия

**Автоматизация:**
- При сохранении проверяется deadline → если просрочен, статус меняется на "Просрочена"
- При закрытии указывается кандидат и дата закрытия
- Рассчитывается SLA compliance (%)

### Отображение списка заявок

**URL:** `/hiring-requests/`

**Фильтры:**
- По периоду: месяц, квартал (Q1-Q4), год
- По статусу: планируется, в процессе, просрочена, закрыта
- По вакансии
- По грейду
- По проекту
- По приоритету

**Таблица (как на скриншоте):**

| Вакансия | Проект | Грейды | Требуется | Нанято | В процессе | Progress | Приоритет | Дедлайн | Действия |
|---|---|---|---|---|---|---|---|---|---|

**Но теперь:**
- 1 строка = 1 заявка (1 специалист)
- Вместо "Требуется: 5" → 5 отдельных строк с разными заявками
- Каждая строка показывает индивидуальный прогресс, статус, SLA

**Пример:**

| Вакансия | Грейд | Проект | Статус | Открытие | Дедлайн | SLA | Период в работе | Приоритет | Действия |
|---|---|---|---|---|---|---|---|---|---|
| Backend Engineer (Java) | Middle | Project X | В процессе | 01.10.2025 | 22.11.2025 | 30 дней | 23 дня | Критический | ✏️ 🗑️ |
| Backend Engineer (Java) | Middle | Project X | Планируется | 15.10.2025 | 05.12.2025 | 30 дней | 9 дней | Критический | ✏️ 🗑️ |
| Frontend Engineer (React) | Middle | Project Y | Закрыта | 01.10.2025 | 07.12.2025 | 45 дней | 14 дней | Высокий | 👁️ |

---

## 📂 СТРУКТУРА ФАЙЛОВ

```
apps/hiring_plan/
├── models.py              # VacancySLA + HiringRequest
├── admin.py               # Админка для SLA и заявок
├── forms.py               # Формы создания/редактирования заявок
├── views.py               # ListView, CreateView, UpdateView для заявок
├── urls.py                # URL маршруты
├── services.py            # Бизнес-логика (фильтрация, статистика)
└── templates/
    └── hiring_plan/
        ├── request_list.html       # Список всех заявок с фильтрами
        ├── request_form.html       # Форма создания/редактирования
        ├── request_detail.html     # Детальный просмотр заявки
        └── sla_list.html           # Список SLA
```

---

## 🎨 ИНТЕРФЕЙС

### Главная страница: `/hiring-requests/`

**Фильтры (сверху):**
```
[ Период: месяц ▼ ]  [ Статус: все ▼ ]  [ Вакансия: все ▼ ]  [ Грейд: все ▼ ]  [ 🔍 Поиск ]
```

**Таблица заявок:**
```
┌──────────────────┬────────┬──────────┬────────────┬────────────┬─────────┬────────────┬───────────┬─────────┐
│ Вакансия         │ Грейд  │ Проект   │ Статус     │ Открытие   │ Дедлайн │ SLA        │ В работе  │ Действия│
├──────────────────┼────────┼──────────┼────────────┼────────────┼─────────┼────────────┼───────────┼─────────┤
│ Backend (Java)   │ Middle │ Proj X   │ В процессе │ 01.10.2025 │ 22.11  │ 30д (норма)│ 23 дня    │ ✏️ 🗑️  │
│ Backend (Java)   │ Senior │ Proj X   │ Просрочена │ 10.09.2025 │ 10.10  │ 45д (риск) │ 44 дня    │ ✏️ 🗑️  │
│ Frontend (React) │ Middle │ Proj Y   │ Закрыта    │ 01.10.2025 │ 07.12  │ 45д (OK)   │ 14 дней   │ 👁️     │
└──────────────────┴────────┴──────────┴────────────┴────────────┴─────────┴────────────┴───────────┴─────────┘
```

**Статистика (в сайдбаре или вверху):**
- Всего заявок: 150
- В процессе: 45
- Планируется: 30
- Просрочено: 12
- Закрыто: 63

---

## 📋 ФОРМЫ

### Форма создания заявки

```
┌─────────────────────────────────────────┐
│ 📝 Новая заявка на найм                 │
├─────────────────────────────────────────┤
│ Вакансия *        [Backend Engineer ▼]  │
│ Грейд *           [Middle ▼]            │
│ Проект            [____________]        │
│ Приоритет *       [Критический ▼]       │
│ Причина открытия* [Замена - увольнение▼]│
│ Дата открытия *   [01.10.2025 📅]       │
│ Дедлайн *         [22.11.2025 📅]       │
│                   (автоматически: +30д) │
│ SLA               30 дней (auto)        │
│ Заметки           [_________________]   │
│                                         │
│ [💾 Создать заявку]  [❌ Отмена]       │
└─────────────────────────────────────────┘
```

---

## ⚙️ АВТОМАТИЗАЦИЯ

### 1. Автоопределение SLA
При выборе Вакансии + Грейда автоматически подтягивается SLA и рассчитывается дедлайн.

### 2. Автообновление статуса
При сохранении заявки:
- Если `deadline < today` и статус не "Закрыта/Отменена" → статус = "Просрочена"

### 3. Уведомления (опционально)
- За 7 дней до дедлайна → предупреждение
- В день дедлайна → алерт
- При просрочке → критическое уведомление

---

## 📊 МЕТРИКИ И ДАШБОРДЫ

### Dashboard: `/hiring-requests/dashboard/`

**KPI Cards:**
- Средний Time-to-Fill: 28 дней
- SLA Compliance: 85%
- Просроченных заявок: 12
- Заявок в работе: 45

**Графики:**
- Воронка найма (по стадиям)
- Динамика открытия/закрытия заявок
- Соответствие SLA по вакансиям
- Распределение по причинам открытия

---

## ✅ ИТОГО: ЧИСТАЯ ЛОГИКА

✅ **Нет множественных планов** — есть единая таблица заявок  
✅ **1 заявка = 1 специалист** — детализация до каждого headcount  
✅ **SLA привязана к Вакансия + Грейд** — автоматический расчет дедлайнов  
✅ **Полная история:** дата открытия, дедлайн, закрытия, период в работе  
✅ **Автоматизация:** статусы, SLA compliance, уведомления  
✅ **Фильтрация:** по периодам (месяц/квартал/год), статусам, проектам  
✅ **Гибкость:** дата открытия может быть в будущем (планирование)  

Эта архитектура проста, понятна и масштабируема! 🚀
