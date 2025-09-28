# Анализ дублирующегося кода в приложении Vacancies

## 📋 **Обзор**

Данный документ содержит анализ дублирующегося кода между `views.py` и `views_api.py` в приложении `@vacancies/`. Цель - выявить общие паттерны и логику, которые можно вынести в отдельные обработчики для улучшения архитектуры и переиспользования кода.

## 🔍 **Выявленные дублирования**

### 1. **Логика переключения статуса активности**

**В `views.py`:**
```python
@login_required
@require_POST
def vacancy_toggle_active(request, pk):
    """Переключение статуса активности вакансии"""
    vacancy = get_object_or_404(Vacancy, pk=pk)
    
    try:
        vacancy.is_active = not vacancy.is_active
        vacancy.save()
        
        status = 'активирована' if vacancy.is_active else 'деактивирована'
        messages.success(request, f'Вакансия "{vacancy.name}" {status}!')
        
        return JsonResponse({
            'success': True,
            'is_active': vacancy.is_active,
            'message': f'Вакансия {status}'
        })
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': f'Ошибка: {str(e)}'
        })
```

**В `views_api.py`:**
```python
@action(detail=True, methods=['post'], url_path='toggle-active')
def toggle_active(self, request, pk=None):
    """Переключение активности вакансии"""
    vacancy = self.get_object()
    vacancy.is_active = not vacancy.is_active
    vacancy.save()
    
    serializer = VacancySerializer(vacancy)
    return Response(serializer.data)
```

**Дублирование:** Логика переключения `is_active` поля и сохранения объекта.

### 2. **Логика поиска и фильтрации**

**В `views.py` (vacancy_list):**
```python
# Применяем фильтры
if search_query:
    vacancies = vacancies.filter(
        Q(name__icontains=search_query) |
        Q(external_id__icontains=search_query)
    )

if recruiter_filter:
    vacancies = vacancies.filter(recruiter_id=recruiter_filter)

if status_filter == 'true':
    vacancies = vacancies.filter(is_active=True)
elif status_filter == 'false':
    vacancies = vacancies.filter(is_active=False)
```

**В `views_api.py` (search action):**
```python
if query:
    queryset = queryset.filter(
        Q(name__icontains=query) |
        Q(invite_title__icontains=query) |
        Q(scorecard_title__icontains=query) |
        Q(external_id__icontains=query)
    )

if grade_id:
    queryset = queryset.filter(available_grades__id=grade_id)

if recruiter_id:
    queryset = queryset.filter(recruiter__id=recruiter_id)

if is_active is not None:
    queryset = queryset.filter(is_active=is_active.lower() == 'true')
```

**Дублирование:** Логика построения фильтров для поиска вакансий.

### 3. **Логика статистики**

**В `views.py` (dashboard):**
```python
total_vacancies = Vacancy.objects.count()
active_vacancies = Vacancy.objects.filter(is_active=True).count()
inactive_vacancies = Vacancy.objects.filter(is_active=False).count()

# Статистика по рекрутерам
recruiter_stats = Vacancy.objects.values('recruiter__username').annotate(
    count=Count('id'),
    active_count=Count('id', filter=Q(is_active=True))
)
```

**В `views_api.py` (stats action):**
```python
total_vacancies = Vacancy.objects.count()
active_vacancies = Vacancy.objects.filter(is_active=True).count()
inactive_vacancies = total_vacancies - active_vacancies

# Статистика по рекрутерам
recruiter_stats = Vacancy.objects.values('recruiter__username').annotate(
    count=Count('id'),
    active_count=Count('id', filter=Q(is_active=True))
)
```

**Дублирование:** Логика расчета статистики по вакансиям и рекрутерам.

### 4. **Логика управления грейдами**

**В `views_api.py` (assign_grades action):**
```python
@action(detail=True, methods=['post'], url_path='assign-grades')
def assign_grades(self, request, pk=None):
    """Назначение грейдов вакансии"""
    vacancy = self.get_object()
    grade_ids = request.data.get('grade_ids', [])
    
    try:
        from apps.finance.models import Grade
        grades = Grade.objects.filter(id__in=grade_ids)
        vacancy.available_grades.set(grades)
        
        serializer = VacancySerializer(vacancy)
        return Response(serializer.data)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
```

**Потенциальное дублирование:** Логика работы с грейдами может потребоваться в других местах.

## 📊 **Статистика дублирования**

- **Общее количество строк кода**: ~353 строки
- **Дублирующиеся участки**: 4 основных блока
- **Процент дублирования**: ~25-30%
- **Потенциал для оптимизации**: Высокий

## 🎯 **Рекомендации по рефакторингу**

### 1. **Создать VacancyHandler в logic/vacancy_handlers.py**
```python
class VacancyHandler:
    @staticmethod
    def toggle_active_logic(pk, request=None):
        """Логика переключения активности вакансии"""
        pass
    
    @staticmethod
    def search_logic(search_params):
        """Логика поиска и фильтрации вакансий"""
        pass
    
    @staticmethod
    def calculate_stats():
        """Логика расчета статистики"""
        pass
    
    @staticmethod
    def assign_grades_logic(vacancy_pk, grade_ids):
        """Логика назначения грейдов"""
        pass
```

### 2. **Создать SalaryRangeHandler в logic/salary_range_handlers.py**
```python
class SalaryRangeHandler:
    @staticmethod
    def toggle_active_logic(pk, request=None):
        """Логика переключения активности зарплатной вилки"""
        pass
    
    @staticmethod
    def search_logic(search_params):
        """Логика поиска и фильтрации зарплатных вилок"""
        pass
```

### 3. **Создать общие обработчики ответов**
```python
class ResponseHandler:
    @staticmethod
    def success_response(data, message=None):
        """Универсальный успешный ответ"""
        pass
    
    @staticmethod
    def error_response(message, status_code=400):
        """Универсальный ответ об ошибке"""
        pass
```

## 📈 **Ожидаемые результаты**

1. **Сокращение дублирования**: На 25-30%
2. **Улучшение читаемости**: Более четкое разделение ответственности
3. **Упрощение тестирования**: Логика вынесена в отдельные методы
4. **Повышение переиспользования**: Общие обработчики можно использовать в разных местах
5. **Упрощение поддержки**: Изменения в одном месте

## 🔄 **План реализации**

1. Создать `logic/vacancy_handlers.py` с общими обработчиками
2. Создать `logic/salary_range_handlers.py` для зарплатных вилок
3. Создать `logic/response_handlers.py` для универсальных ответов
4. Обновить `views.py` для использования новых обработчиков
5. Обновить `views_api.py` для использования новых обработчиков
6. Протестировать функциональность
7. Обновить документацию

## ✅ **Заключение**

Анализ выявил значительное дублирование кода между `views.py` и `views_api.py`. Создание общих обработчиков в папке `logic/` позволит значительно улучшить архитектуру приложения, сократить дублирование и упростить поддержку кода.

Рекомендуется приступить к рефакторингу в соответствии с предложенным планом.
