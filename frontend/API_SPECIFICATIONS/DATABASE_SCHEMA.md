# Database Schema Specification

## Общее описание

Документ описывает структуру базы данных HR Helper, включая все таблицы, связи, индексы и ограничения.

## 1. Основные таблицы

### 1.1 users (Пользователи)

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    phone VARCHAR(20),
    role_id UUID NOT NULL REFERENCES roles(id),
    company_id UUID REFERENCES companies(id),
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    two_fa_enabled BOOLEAN DEFAULT false,
    two_fa_method VARCHAR(20), -- 'telegram', 'email', 'totp'
    telegram_chat_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_login_at TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_company_id ON users(company_id);
CREATE INDEX idx_users_role_id ON users(role_id);
CREATE INDEX idx_users_is_active ON users(is_active);
```

### 1.2 roles (Роли)

```sql
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE, -- 'admin', 'hr_manager', 'recruiter', 'interviewer', 'candidate'
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    permissions JSONB NOT NULL, -- Массив разрешений
    created_at TIMESTAMP DEFAULT NOW()
);

-- Предустановленные роли
INSERT INTO roles (name, display_name, permissions) VALUES
('admin', 'Администратор', '["*:*"]'),
('hr_manager', 'HR Менеджер', '["read:*", "write:*", "delete:*"]'),
('recruiter', 'Рекрутер', '["read:vacancies", "write:vacancies", "read:candidates", "write:candidates"]'),
('interviewer', 'Интервьюер', '["read:interviews", "write:interviews"]'),
('candidate', 'Кандидат', '["read:vacancies", "write:candidates"]');
```

### 1.3 companies (Компании)

```sql
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(100) UNIQUE,
    org_structure JSONB, -- Иерархическая структура отделов
    settings JSONB, -- Настройки компании
    min_salary DECIMAL(10, 2),
    max_salary DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP
);

CREATE INDEX idx_companies_domain ON companies(domain);
```

### 1.4 departments (Отделы)

```sql
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    parent_id UUID REFERENCES departments(id),
    path VARCHAR(500), -- Полный путь в иерархии
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_departments_company_id ON departments(company_id);
CREATE INDEX idx_departments_parent_id ON departments(parent_id);
CREATE INDEX idx_departments_path ON departments(path);
```

### 1.5 vacancies (Вакансии)

```sql
CREATE TABLE vacancies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    department_id UUID REFERENCES departments(id),
    owner_id UUID NOT NULL REFERENCES users(id), -- Владелец вакансии (рекрутер)
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'draft', -- 'draft', 'active', 'paused', 'closed'
    salary_range_min DECIMAL(10, 2),
    salary_range_max DECIMAL(10, 2),
    currency VARCHAR(3) DEFAULT 'USD',
    locations TEXT[], -- Массив локаций
    required_skills TEXT[], -- Массив навыков
    required_experience_years INTEGER,
    required_education VARCHAR(50),
    grade VARCHAR(50), -- 'Junior', 'Middle', 'Senior', etc.
    candidate_limit INTEGER, -- Максимум активных кандидатов
    published_at TIMESTAMP,
    closed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP
);

CREATE INDEX idx_vacancies_company_id ON vacancies(company_id);
CREATE INDEX idx_vacancies_owner_id ON vacancies(owner_id);
CREATE INDEX idx_vacancies_status ON vacancies(status);
CREATE INDEX idx_vacancies_department_id ON vacancies(department_id);
CREATE INDEX idx_vacancies_created_at ON vacancies(created_at);
```

**Примечания:**
- Основная информация о вакансии
- Детальные настройки вакансии (текст, вопросы, ссылки) хранятся в связанных таблицах
- Настройки текста вакансии по странам хранятся в `vacancy_text_by_country`
- Активность вакансии по странам хранится в `vacancy_activity_by_country`

### 1.6 vacancy_recruiters (Назначенные рекрутеры на вакансию)

```sql
CREATE TABLE vacancy_recruiters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vacancy_id UUID NOT NULL REFERENCES vacancies(id) ON DELETE CASCADE,
    recruiter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT false, -- Основной рекрутер
    assigned_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(vacancy_id, recruiter_id)
);

CREATE INDEX idx_vacancy_recruiters_vacancy_id ON vacancy_recruiters(vacancy_id);
CREATE INDEX idx_vacancy_recruiters_recruiter_id ON vacancy_recruiters(recruiter_id);
```

### 1.7 candidates (Кандидаты)

```sql
CREATE TABLE candidates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vacancy_id UUID NOT NULL REFERENCES vacancies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id), -- Если кандидат зарегистрирован
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    resume_url TEXT,
    resume_file_id UUID, -- Ссылка на файл
    current_stage_id UUID REFERENCES lifecycle_stages(id),
    match_score INTEGER, -- Оценка соответствия (0-100)
    expected_salary DECIMAL(10, 2),
    experience_years INTEGER,
    education_level VARCHAR(50),
    location VARCHAR(255),
    skills TEXT[],
    source VARCHAR(50), -- Откуда пришел кандидат
    notes TEXT, -- Внутренние заметки рекрутера
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP,
    UNIQUE(vacancy_id, email) -- Один кандидат не может подать заявку дважды на одну вакансию
);

CREATE INDEX idx_candidates_vacancy_id ON candidates(vacancy_id);
CREATE INDEX idx_candidates_user_id ON candidates(user_id);
CREATE INDEX idx_candidates_email ON candidates(email);
CREATE INDEX idx_candidates_current_stage_id ON candidates(current_stage_id);
CREATE INDEX idx_candidates_match_score ON candidates(match_score);
```

### 1.8 lifecycle_blocks (Блоки жизненного цикла)

```sql
CREATE TABLE lifecycle_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    block_id VARCHAR(50) NOT NULL, -- 'recruiting', 'onboarding', 'employee', 'blacklist'
    name VARCHAR(100) NOT NULL, -- 'Рекрутинг', 'Онбординг', 'Работник', 'ЧС'
    order_index INTEGER NOT NULL, -- Порядок отображения блоков
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(company_id, block_id)
);

CREATE INDEX idx_lifecycle_blocks_company_id ON lifecycle_blocks(company_id);
```

### 1.9 lifecycle_stages (Этапы жизненного цикла)

```sql
CREATE TABLE lifecycle_stages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    block_id VARCHAR(50) NOT NULL, -- 'recruiting', 'onboarding', 'employee', 'blacklist'
    name VARCHAR(100) NOT NULL,
    order_index INTEGER NOT NULL, -- Порядок внутри блока
    is_system BOOLEAN DEFAULT false, -- Обязательный этап (нельзя удалить, можно только переименовать)
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(company_id, block_id, name)
);

CREATE INDEX idx_lifecycle_stages_company_id ON lifecycle_stages(company_id);
CREATE INDEX idx_lifecycle_stages_block_id ON lifecycle_stages(company_id, block_id);
CREATE INDEX idx_lifecycle_stages_order ON lifecycle_stages(company_id, block_id, order_index);
```

**Примечания:**
- Этапы определяются в настройках компании (`/company-settings/employee-lifecycle`)
- Обязательные этапы (is_system = true) нельзя удалить, можно только переименовать
- Порядок этапов можно изменять перетаскиванием (кроме обязательных)
- В блоке "ЧС" (blacklist) только один обязательный этап "Черный список"

### 1.10 recruiting_stages (Этапы рекрутинга - расширенные настройки)

```sql
CREATE TABLE recruiting_stages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lifecycle_stage_id UUID NOT NULL REFERENCES lifecycle_stages(id) ON DELETE CASCADE,
    color VARCHAR(7), -- HEX цвет для UI (настраивается на /company-settings/recruiting/stages)
    description TEXT, -- Подробное описание этапа (настраивается на /company-settings/recruiting/stages)
    is_meeting BOOLEAN DEFAULT false, -- Метка "встреча" - этап используется в тогглере на странице /workflow и /recr-chat
    show_offices BOOLEAN DEFAULT false, -- Отображать офисы для этапа-встречи (да/нет)
    show_interviewers BOOLEAN DEFAULT false, -- Отображать интервьюеров для этапа-встречи (да/нет)
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(lifecycle_stage_id)
);

CREATE INDEX idx_recruiting_stages_lifecycle_stage_id ON recruiting_stages(lifecycle_stage_id);
CREATE INDEX idx_recruiting_stages_is_meeting ON recruiting_stages(is_meeting) WHERE is_meeting = true;
```

**Примечания:**
- Расширенные настройки доступны только для этапов блока "Рекрутинг"
- Настраиваются на странице `/company-settings/recruiting/stages`
- Для каждого этапа рекрутинга можно настроить:
  - Цвет (для визуального отображения в UI)
  - Описание этапа
  - Доступные причины отказа (связь с rejection_reasons)
  - **Метка "встреча" (`is_meeting`)**: если true, этап используется в тогглере на странице `/workflow` и `/recr-chat`
  - **Отображать офисы (`show_offices`)**: если true, в панели настроек встречи будет выбор формата (Онлайн/Офис) и выбор офиса при выборе "Офис". Если false, по определению используется только онлайн
  - **Отображать интервьюеров (`show_interviewers`)**: если true, в панели настроек встречи будет выбор интервьюеров
- Этапы с `is_meeting = true` используются для формирования динамических кнопок тогглера этапов процесса
- Названия этапов-встреч становятся названиями кнопок в тогглере
- Количество кнопок в тогглере: 0 и более (зависит от количества этапов с `is_meeting = true`)

### 1.11 recruiting_commands (Команды рекрутинга для workflow чата)

```sql
CREATE TABLE recruiting_commands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    command VARCHAR(50) NOT NULL, -- Текст команды (например, "/s", "/t", "/in")
    command_type VARCHAR(20) NOT NULL, -- 'analysis' (анализ) или 'event' (событие)
    stage_id UUID NOT NULL REFERENCES lifecycle_stages(id), -- ID этапа найма (обязательно)
    allow_any_layout BOOLEAN DEFAULT false, -- Разрешить работу команды в любой раскладке клавиатуры
    color VARCHAR(7) NOT NULL, -- HEX цвет для отображения в чате
    description TEXT, -- Описание команды
    order_index INTEGER DEFAULT 0, -- Порядок отображения
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(company_id, command) -- Команда должна быть уникальной в рамках компании
);

CREATE INDEX idx_recruiting_commands_company_id ON recruiting_commands(company_id);
CREATE INDEX idx_recruiting_commands_stage_id ON recruiting_commands(stage_id);
CREATE INDEX idx_recruiting_commands_command ON recruiting_commands(company_id, command);
```

**Примечания:**
- Команды используются в workflow чате для создания различных действий
- Настраиваются на странице `/company-settings/recruiting/commands`
- Команда должна начинаться с "/"
- Команда должна быть уникальной в рамках компании
- При включенном `allow_any_layout = true` проверяется уникальность команды с учетом обеих раскладок клавиатуры (русская/английская)
- `stage_id` обязателен - команда должна быть связана с этапом найма
- Системные команды `/add` и `/del` не хранятся в базе (обрабатываются системой)
- Тип команды определяет поведение: `analysis` - анализ кандидата, `event` - создание события (скрининг, интервью)

### 1.11 stage_transitions (Переходы между этапами)

```sql
CREATE TABLE stage_transitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    from_stage_id UUID REFERENCES lifecycle_stages(id),
    to_stage_id UUID NOT NULL REFERENCES lifecycle_stages(id),
    from_block_id VARCHAR(50), -- 'recruiting', 'onboarding', 'employee', 'blacklist'
    to_block_id VARCHAR(50) NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id), -- Кто выполнил переход
    comment TEXT,
    rejection_reason_id UUID REFERENCES rejection_reasons(id),
    is_automatic BOOLEAN DEFAULT false, -- Автоматический или ручной переход
    metadata JSONB, -- Дополнительные данные
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_stage_transitions_candidate_id ON stage_transitions(candidate_id);
CREATE INDEX idx_stage_transitions_to_stage_id ON stage_transitions(to_stage_id);
CREATE INDEX idx_stage_transitions_user_id ON stage_transitions(user_id);
CREATE INDEX idx_stage_transitions_created_at ON stage_transitions(created_at);
CREATE INDEX idx_stage_transitions_blocks ON stage_transitions(from_block_id, to_block_id);
```

### 1.12 rejection_reasons (Причины отказа)

```sql
CREATE TABLE rejection_reasons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    recruiting_stage_id UUID REFERENCES recruiting_stages(id), -- Для какого этапа рекрутинга применимо (опционально, если NULL - доступна для всех этапов)
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_rejection_reasons_company_id ON rejection_reasons(company_id);
CREATE INDEX idx_rejection_reasons_recruiting_stage_id ON rejection_reasons(recruiting_stage_id);
```

**Примечания:**
- Причины отказа настраиваются на странице `/company-settings/recruiting/stages`
- Для каждого этапа рекрутинга можно настроить доступные причины отказа
- Если `recruiting_stage_id` = NULL, причина доступна для всех этапов рекрутинга
- При переходе кандидата в отказ можно выбрать только из доступных для текущего этапа причин

### 1.11 interviews (Интервью)

```sql
CREATE TABLE interviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    vacancy_id UUID NOT NULL REFERENCES vacancies(id) ON DELETE CASCADE,
    interviewer_id UUID NOT NULL REFERENCES users(id),
    scheduled_date TIMESTAMP NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    format VARCHAR(20) NOT NULL, -- 'online', 'office', 'phone'
    location TEXT, -- Для офисных интервью
    meet_link TEXT, -- Для онлайн интервью
    status VARCHAR(20) DEFAULT 'scheduled', -- 'scheduled', 'completed', 'cancelled', 'no_show'
    round_number INTEGER DEFAULT 1, -- Номер раунда интервью
    notes TEXT, -- Заметки интервьюера
    score INTEGER, -- Оценка кандидата (0-100)
    recommendation VARCHAR(20), -- 'hire', 'maybe', 'reject'
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_interviews_candidate_id ON interviews(candidate_id);
CREATE INDEX idx_interviews_vacancy_id ON interviews(vacancy_id);
CREATE INDEX idx_interviews_interviewer_id ON interviews(interviewer_id);
CREATE INDEX idx_interviews_scheduled_date ON interviews(scheduled_date);
CREATE INDEX idx_interviews_status ON interviews(status);
```

### 1.12 offers (Офферы)

```sql
CREATE TABLE offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    vacancy_id UUID NOT NULL REFERENCES vacancies(id) ON DELETE CASCADE,
    salary DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    start_date DATE NOT NULL,
    benefits TEXT[], -- Массив бенефитов
    notes TEXT,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'accepted', 'rejected', 'expired'
    expires_at TIMESTAMP,
    sent_at TIMESTAMP,
    responded_at TIMESTAMP,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_offers_candidate_id ON offers(candidate_id);
CREATE INDEX idx_offers_vacancy_id ON offers(vacancy_id);
CREATE INDEX idx_offers_status ON offers(status);
CREATE INDEX idx_offers_expires_at ON offers(expires_at);
```

### 1.13 workflow_rules (Правила workflow)

```sql
CREATE TABLE workflow_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    from_stage_id UUID NOT NULL REFERENCES lifecycle_stages(id),
    to_stage_id UUID NOT NULL REFERENCES lifecycle_stages(id),
    conditions JSONB, -- Условия для автоматического перехода
    required_role VARCHAR(50), -- Какая роль может выполнить переход
    requires_comment BOOLEAN DEFAULT false,
    is_automatic BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_workflow_rules_company_id ON workflow_rules(company_id);
CREATE INDEX idx_workflow_rules_from_stage_id ON workflow_rules(from_stage_id);
CREATE INDEX idx_workflow_rules_to_stage_id ON workflow_rules(to_stage_id);
```

### 1.14 refresh_tokens (Refresh токены)

```sql
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    device_info TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT NOW(),
    revoked_at TIMESTAMP,
    is_revoked BOOLEAN DEFAULT false
);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token_hash ON refresh_tokens(token_hash);
CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);
```

### 1.15 telegram_chats (Telegram чаты)

```sql
CREATE TABLE telegram_chats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    chat_id VARCHAR(100) NOT NULL UNIQUE, -- Telegram chat ID
    chat_type VARCHAR(20) NOT NULL, -- 'private', 'group', 'channel'
    name VARCHAR(255),
    username VARCHAR(100),
    webhook_url TEXT,
    is_active BOOLEAN DEFAULT true,
    settings JSONB, -- Настройки чата
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_telegram_chats_company_id ON telegram_chats(company_id);
CREATE INDEX idx_telegram_chats_chat_id ON telegram_chats(chat_id);
```

### 1.16 telegram_messages (Сообщения Telegram)

```sql
CREATE TABLE telegram_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id UUID NOT NULL REFERENCES telegram_chats(id) ON DELETE CASCADE,
    message_id VARCHAR(100) NOT NULL, -- Telegram message ID
    sender_id UUID REFERENCES users(id),
    sender_type VARCHAR(20) NOT NULL, -- 'user', 'telegram', 'bot'
    text TEXT,
    message_type VARCHAR(20) DEFAULT 'text', -- 'text', 'photo', 'document', etc.
    file_url TEXT,
    reply_to_message_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(chat_id, message_id)
);

CREATE INDEX idx_telegram_messages_chat_id ON telegram_messages(chat_id);
CREATE INDEX idx_telegram_messages_created_at ON telegram_messages(created_at);
CREATE INDEX idx_telegram_messages_sender_id ON telegram_messages(sender_id);
```

### 1.17 files (Файлы)

```sql
CREATE TABLE files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100),
    size_bytes BIGINT NOT NULL,
    storage_path TEXT NOT NULL,
    storage_type VARCHAR(20) DEFAULT 's3', -- 's3', 'local'
    entity_type VARCHAR(50), -- 'resume', 'document', 'avatar', etc.
    entity_id UUID, -- ID связанной сущности
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP
);

CREATE INDEX idx_files_company_id ON files(company_id);
CREATE INDEX idx_files_user_id ON files(user_id);
CREATE INDEX idx_files_entity ON files(entity_type, entity_id);
```

### 1.18 vacancy_text_by_country (Текст вакансии по странам)

```sql
CREATE TABLE vacancy_text_by_country (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vacancy_id UUID NOT NULL REFERENCES vacancies(id) ON DELETE CASCADE,
    country_code VARCHAR(10) NOT NULL, -- Код страны ('by', 'pl', и т.д.)
    title VARCHAR(255),
    department VARCHAR(255),
    header TEXT,
    responsibilities TEXT,
    requirements TEXT,
    nice_to_have TEXT,
    conditions TEXT,
    closing TEXT,
    link TEXT,
    field_settings JSONB, -- Настройки полей: {field_name: {active: boolean, visible: boolean}}
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(vacancy_id, country_code)
);

CREATE INDEX idx_vacancy_text_by_country_vacancy_id ON vacancy_text_by_country(vacancy_id);
CREATE INDEX idx_vacancy_text_by_country_country_code ON vacancy_text_by_country(country_code);
```

**Примечания:**
- Хранит текст вакансии для каждой страны отдельно
- Позволяет настраивать вакансию независимо для разных стран
- `field_settings` содержит настройки активности и видимости для каждого поля
- Используется на страницах `/recr-chat` и в модальных окнах редактирования вакансии

### 1.19 vacancy_activity_by_country (Активность вакансии по странам)

```sql
CREATE TABLE vacancy_activity_by_country (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vacancy_id UUID NOT NULL REFERENCES vacancies(id) ON DELETE CASCADE,
    country_code VARCHAR(10) NOT NULL, -- Код страны ('by', 'pl', и т.д.)
    is_active BOOLEAN DEFAULT true, -- Активна ли вакансия для этой страны
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(vacancy_id, country_code)
);

CREATE INDEX idx_vacancy_activity_by_country_vacancy_id ON vacancy_activity_by_country(vacancy_id);
CREATE INDEX idx_vacancy_activity_by_country_country_code ON vacancy_activity_by_country(country_code);
```

**Примечания:**
- Управляет активностью вакансии для каждой страны
- Если `is_active = false`, все поля вакансии для этой страны становятся неактивными
- Автоматически влияет на активность в разделе "Вопросы и ссылки" для соответствующей страны

### 1.20 vacancy_questions_by_office (Вопросы и ссылки вакансии по офисам)

```sql
CREATE TABLE vacancy_questions_by_office (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vacancy_id UUID NOT NULL REFERENCES vacancies(id) ON DELETE CASCADE,
    office_id VARCHAR(50) NOT NULL, -- ID офиса ('by', 'pl', и т.д.)
    vacancy_link TEXT, -- Ссылка на вакансию
    use_on_site BOOLEAN DEFAULT false, -- Использовать ссылку на сайте
    link_color VARCHAR(7), -- Цвет ссылки (hex)
    question_text TEXT, -- Текст вопроса
    question_color VARCHAR(7), -- Цвет вопроса (hex)
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(vacancy_id, office_id)
);

CREATE INDEX idx_vacancy_questions_by_office_vacancy_id ON vacancy_questions_by_office(vacancy_id);
CREATE INDEX idx_vacancy_questions_by_office_office_id ON vacancy_questions_by_office(office_id);
```

**Примечания:**
- Хранит настройки "Вопросы и ссылки" для каждого офиса отдельно
- Активность автоматически синхронизируется с `vacancy_activity_by_country` (если вакансия неактивна для страны, все поля офиса становятся неактивными)
- Если вакансия неактивна для страны, все поля становятся неактивными
- Связь офисов со странами: офис 'by' соответствует стране 'by', офис 'pl' соответствует стране 'pl', и т.д.
- При изменении `is_active` в `vacancy_activity_by_country` для страны, автоматически обновляется активность всех полей в `vacancy_questions_by_office` для соответствующего офиса

### 1.21 audit_logs (Логи аудита)

```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(50) NOT NULL, -- 'create', 'update', 'delete', 'view'
    entity_type VARCHAR(50) NOT NULL, -- 'vacancy', 'candidate', etc.
    entity_id UUID NOT NULL,
    changes JSONB, -- Старые и новые значения
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
```

## 2. Связи между таблицами

### 2.1 Диаграмма связей

```
users N:1 companies
users N:1 roles
users N:1 departments (через company)

vacancies N:1 companies
vacancies N:1 departments
vacancies N:1 users (owner)
vacancies N:N users (recruiters через vacancy_recruiters)

candidates N:1 vacancies
candidates N:1 users (если зарегистрирован)
candidates N:1 lifecycle_stages (current_stage)

lifecycle_blocks N:1 companies
lifecycle_stages N:1 lifecycle_blocks
lifecycle_stages N:1 companies
recruiting_stages N:1 lifecycle_stages
rejection_reasons N:1 recruiting_stages
recruiting_commands N:1 companies
recruiting_commands N:1 lifecycle_stages (stage_id)
vacancy_text_by_country N:1 vacancies
vacancy_activity_by_country N:1 vacancies
vacancy_questions_by_office N:1 vacancies

stage_transitions N:1 candidates
stage_transitions N:1 lifecycle_stages (from)
stage_transitions N:1 lifecycle_stages (to)
stage_transitions N:1 users

interviews N:1 candidates
interviews N:1 vacancies
interviews N:1 users (interviewer)

offers N:1 candidates
offers N:1 vacancies
offers N:1 users (created_by)

telegram_chats N:1 companies
telegram_messages N:1 telegram_chats
telegram_messages N:1 users (sender)

files N:1 companies
files N:1 users
```

## 3. Индексы для производительности

### 3.1 Часто используемые запросы

**Поиск кандидатов по вакансии и этапу:**
```sql
CREATE INDEX idx_candidates_vacancy_stage ON candidates(vacancy_id, current_stage_id);
```

**Поиск этапов по блоку:**
```sql
CREATE INDEX idx_lifecycle_stages_block_order ON lifecycle_stages(company_id, block_id, order_index);
```

**Поиск интервью по дате:**
```sql
CREATE INDEX idx_interviews_date_status ON interviews(scheduled_date, status);
```

**Поиск вакансий по компании и статусу:**
```sql
CREATE INDEX idx_vacancies_company_status ON vacancies(company_id, status);
```

**Поиск сообщений Telegram по чату и дате:**
```sql
CREATE INDEX idx_telegram_messages_chat_date ON telegram_messages(chat_id, created_at DESC);
```

**Аудит по пользователю и типу сущности:**
```sql
CREATE INDEX idx_audit_logs_user_entity ON audit_logs(user_id, entity_type, created_at DESC);
```

## 4. Ограничения и валидации

### 4.1 Check Constraints

```sql
-- Вакансия: минимальная зарплата <= максимальной
ALTER TABLE vacancies ADD CONSTRAINT check_salary_range 
CHECK (salary_range_min <= salary_range_max);

-- Оффер: дата начала в будущем
ALTER TABLE offers ADD CONSTRAINT check_start_date_future 
CHECK (start_date >= CURRENT_DATE);

-- Интервью: дата в будущем
ALTER TABLE interviews ADD CONSTRAINT check_interview_date_future 
CHECK (scheduled_date >= NOW());

-- Кандидат: email валидный
ALTER TABLE candidates ADD CONSTRAINT check_email_format 
CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');
```

### 4.2 Foreign Key Constraints

Все внешние ключи имеют `ON DELETE CASCADE` или `ON DELETE SET NULL` в зависимости от бизнес-логики:

- Удаление компании → удаление всех связанных данных
- Удаление вакансии → удаление всех кандидатов
- Удаление пользователя → установка NULL в связанных записях (не удаление)

## 5. Миграции

### 5.1 Версионирование схемы

Используется система миграций (например, Django migrations, Alembic, или Flyway).

**Формат имени миграции:**
```
YYYYMMDD_HHMMSS_description.sql
```

**Пример:**
```
20260128_120000_create_users_table.sql
20260128_120001_create_vacancies_table.sql
```

## 6. Резервное копирование

### 6.1 Стратегия бэкапов

- **Полный бэкап:** Ежедневно в 02:00
- **Инкрементальный бэкап:** Каждые 6 часов
- **Хранение:** 30 дней полных бэкапов, 7 дней инкрементальных
- **Тестирование восстановления:** Еженедельно

## 7. Новые таблицы (обновления)

### 7.1 Изменения в существующих таблицах

**recruiting_stages:**
- Добавлены поля: `is_meeting`, `show_offices`, `show_interviewers`
- Индекс на `is_meeting` для быстрого поиска этапов-встреч

**vacancies:**
- Основная информация остается в таблице `vacancies`
- Детальные настройки по странам вынесены в отдельные таблицы

### 7.2 Новые таблицы

**recruiting_commands:**
- Хранит команды для workflow чата
- Связь с этапами найма через `stage_id` (обязательно)
- Поддержка работы в любой раскладке клавиатуры

**vacancy_text_by_country:**
- Хранит текст вакансии для каждой страны отдельно
- Позволяет настраивать вакансию независимо для разных стран
- Настройки полей (активность, видимость) хранятся в JSONB

**vacancy_activity_by_country:**
- Управляет активностью вакансии для каждой страны
- Влияет на активность полей в других разделах

**vacancy_questions_by_office:**
- Хранит настройки "Вопросы и ссылки" для каждого офиса
- Автоматически синхронизируется с активностью вакансии по странам

### 7.3 Настройки профиля пользователя

Настройки, управляемые со страницы профиля (`/account/profile`), могут храниться в расширении таблицы `users` или в отдельной таблице.

**Вариант 1 — колонка `settings` в `users` (JSONB):**

```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}';

-- Пример содержимого:
-- {
--   "light_theme_accent_color": "blue",
--   "dark_theme_accent_color": "indigo",
--   "quick_buttons": [{"id": "...", "name": "...", "icon": "...", "type": "link"|"text"|"datetime", "value": "...", "order": 0}],
--   "integrations": { "huntflow": {"configured": true}, "telegram": {"configured": false} }
-- }
```

**Вариант 2 — отдельная таблица `user_settings` (ключ-значение):**

```sql
CREATE TABLE user_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    key VARCHAR(100) NOT NULL,
    value JSONB NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, key)
);
CREATE INDEX idx_user_settings_user_id ON user_settings(user_id);
```

**Использование:**

- **Тема (акцентный цвет):** `light_theme_accent_color`, `dark_theme_accent_color` — используются на странице профиля (вкладка «Редактирование») и в `ThemeProvider`. API: `PUT /api/user/theme`.
- **Быстрые кнопки:** массив объектов (id, name, icon, color, type, value, order) — настраиваются на вкладке «Быстрые кнопки», отображаются в `FloatingActions`. API: `GET/PUT /api/user/quick-buttons`. До реализации API могут храниться только на клиенте (localStorage).
- **Интеграции:** ключи и токены хранятся зашифрованно; в БД или в отдельном хранилище секретов. Статус интеграций возвращается через `GET /api/user/integrations/status`.

**Связь с другими документами:**

- Логика страницы профиля, вкладок и API — [BUSINESS_LOGIC.md](./BUSINESS_LOGIC.md) (раздел 10.26).
- Интеграции в профиле — [INTEGRATIONS.md](./INTEGRATIONS.md) (раздел 5).
- Аутентификация и доступ к профилю — [AUTHENTICATION_AUTHORIZATION.md](./AUTHENTICATION_AUTHORIZATION.md).

---

**Версия:** 2.0.0  
**Последнее обновление:** 2026-01-28  
**Автор:** HR Helper Development Team
