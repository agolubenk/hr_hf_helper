# 🔐 Руководство по управлению правами доступа

## 📋 Текущие права пользователя `andrei.golubenko`

### 👤 **Информация о пользователе:**
- **Username:** `andrei.golubenko`
- **Email:** `andrei.golubenko@softnetix.io`
- **is_superuser:** `False`
- **is_staff:** `True`
- **is_active:** `True`

### 🏷️ **Группы пользователя:**
1. **Администраторы** (300 прав) - ВСЕ ПРАВА
2. **Рекрутеры** (300 прав) - ВСЕ ПРАВА  
3. **Интервьюеры** (75 прав) - ТОЛЬКО ПРОСМОТР
4. **Рекрутер** (0 прав) - ПУСТАЯ ГРУППА

### 👑 **Роли пользователя:**
- ✅ **is_admin:** `True` (через группу "Администраторы")
- ✅ **is_recruiter:** `True` (через группу "Рекрутеры")
- ✅ **is_interviewer:** `True` (через группу "Интервьюеры")
- ❌ **is_observer:** `False`

### 📊 **Общее количество прав:**
- **Индивидуальные права:** 292
- **Права через группы:** 300
- **Всего прав:** 300

## 🎯 **Ключевые права пользователя:**

### ✅ **Huntflow (8 прав):**
- `huntflow.add_huntflowlog` - создание логов
- `huntflow.change_huntflowlog` - изменение логов
- `huntflow.delete_huntflowlog` - удаление логов
- `huntflow.view_huntflowlog` - просмотр логов
- `huntflow.add_huntflowcache` - создание кэша
- `huntflow.change_huntflowcache` - изменение кэша
- `huntflow.delete_huntflowcache` - удаление кэша
- `huntflow.view_huntflowcache` - просмотр кэша

### ✅ **Accounts (4 права):**
- `accounts.add_user` - создание пользователей
- `accounts.change_user` - изменение пользователей
- `accounts.delete_user` - удаление пользователей
- `accounts.view_user` - просмотр пользователей

### ✅ **Vacancies (8 прав):**
- `vacancies.add_vacancy` - создание вакансий
- `vacancies.change_vacancy` - изменение вакансий
- `vacancies.delete_vacancy` - удаление вакансий
- `vacancies.view_vacancy` - просмотр вакансий

### ✅ **Finance (36 прав):**
- `finance.add_salaryrange` - создание зарплатных вилок
- `finance.change_salaryrange` - изменение зарплатных вилок
- `finance.delete_salaryrange` - удаление зарплатных вилок
- `finance.view_salaryrange` - просмотр зарплатных вилок

### ✅ **ClickUp (16 прав):**
- `clickup_int.add_clickuptask` - создание задач ClickUp
- `clickup_int.change_clickuptask` - изменение задач ClickUp
- `clickup_int.delete_clickuptask` - удаление задач ClickUp
- `clickup_int.view_clickuptask` - просмотр задач ClickUp

## ⚙️ **Где настраиваются права:**

### 🌐 **1. Django Admin (основной способ):**
```
http://127.0.0.1:8000/admin/
```

#### **Для управления пользователем:**
1. Зайдите в **Users** → **Users**
2. Найдите пользователя `andrei.golubenko`
3. Нажмите на него
4. Выберите **User permissions** или **Groups**

#### **Для управления группами:**
1. Зайдите в **Authentication and Authorization** → **Groups**
2. Выберите нужную группу (например, "Администраторы")
3. Нажмите **Group permissions**

### 💻 **2. Через код:**

#### **Файлы для управления правами:**
- `apps/accounts/logic/role_service.py` - создание и управление ролями
- `apps/accounts/models.py` - свойства ролей (is_admin, is_recruiter, etc.)
- `apps/accounts/decorators.py` - декораторы для проверки прав

#### **Примеры кода:**

```python
# Добавить пользователя в группу
from django.contrib.auth.models import Group
from apps.accounts.models import User

user = User.objects.get(username='andrei.golubenko')
admin_group = Group.objects.get(name='Администраторы')
user.groups.add(admin_group)

# Убрать пользователя из группы
user.groups.remove(admin_group)

# Добавить индивидуальное право
from django.contrib.auth.models import Permission
perm = Permission.objects.get(codename='add_huntflowlog')
user.user_permissions.add(perm)

# Проверить право
if user.has_perm('huntflow.add_huntflowlog'):
    print("У пользователя есть право!")
```

### 🎯 **3. Тестовые URL-ы для проверки:**

- `http://127.0.0.1:8000/accounts/test-permissions/` - информация о правах
- `http://127.0.0.1:8000/accounts/test-permissions/huntflow/` - тест huntflow прав
- `http://127.0.0.1:8000/accounts/test-permissions/admin/` - тест админ прав
- `http://127.0.0.1:8000/accounts/test-permissions/recruiter/` - тест рекрутер прав

## 🔧 **Как изменить права:**

### **Убрать права (например, для интервьюеров):**

1. **Через Django Admin:**
   - Зайдите в `http://127.0.0.1:8000/admin/`
   - Users → `andrei.golubenko`
   - Уберите галочки с групп "Администраторы" или "Рекрутеры"
   - Оставьте только группу "Интервьюеры"

2. **Через код:**
   ```python
   user = User.objects.get(username='andrei.golubenko')
   user.groups.clear()  # Убрать все группы
   interviewer_group = Group.objects.get(name='Интервьюеры')
   user.groups.add(interviewer_group)  # Добавить только интервьюеров
   ```

### **Добавить права:**

1. **Через Django Admin:**
   - Добавьте пользователя в нужные группы
   - Или добавьте индивидуальные права в разделе "User permissions"

2. **Через код:**
   ```python
   user = User.objects.get(username='andrei.golubenko')
   admin_group = Group.objects.get(name='Администраторы')
   user.groups.add(admin_group)
   ```

## 🎉 **Вывод:**

**У пользователя `andrei.golubenko` есть ВСЕ необходимые права!** Он является:
- ✅ **Администратором** (все права)
- ✅ **Рекрутером** (все права)
- ✅ **Интервьюером** (права просмотра)

Если нужно ограничить права, уберите пользователя из групп "Администраторы" или "Рекрутеры", оставив только "Интервьюеры" для ограниченного доступа.
