# Документация страницы: Бенчмарки (finance/benchmarks/page.tsx)

## Общее описание

Страница бенчмарков зарплат. Отображает сравнительные данные по зарплатам для разных позиций и грейдов.

## Компоненты страницы

### 1. Заголовок страницы
- **Компонент**: `Text` с названием
- **Назначение**: Заголовок страницы бенчмарков
- **Логика**: Отображает "Бенчмарки зарплат"

### 2. Таблица бенчмарков
- **Компонент**: `Table` из Radix UI
- **Назначение**: Отображение бенчмарков зарплат
- **Колонки**: 
  - Позиция
  - Грейд
  - Зарплата (USD, BYN, PLN, EUR)
  - Источник данных
  - Дата обновления
- **TODO**: Реализовать таблицу

### 3. Фильтры
- **Компонент**: Select и TextField
- **Назначение**: Фильтрация бенчмарков
- **Фильтры**: 
  - По позиции
  - По грейду
  - По валюте
  - По источнику данных
- **TODO**: Реализовать фильтры

## Интерфейсы и типы

### Benchmark
```typescript
interface Benchmark {
  id: number
  type: 'candidate' | 'vacancy'
  vacancy: number
  vacancy_name: string
  grade: number
  grade_name: string
  salary_from: string
  salary_to: string
  salary_display: string
  location: string
  work_format: string
  compensation?: string
  benefits?: string
  development?: string
  technologies: string
  domain: string
  domain_display: string
  hh_vacancy_id?: string
  date_added: string
  is_active: boolean
  created_at: string
  updated_at: string
}
```

## Состояние компонента

### State переменные:
- `benchmarks`: массив всех бенчмарков (Benchmark[])
- `loading`: флаг загрузки данных (boolean)
- `search`: поисковый запрос (string)
- `typeFilter`: фильтр по типу ('all' | 'candidate' | 'vacancy')
- `gradeFilter`: фильтр по грейду (string)
- `vacancyFilter`: фильтр по вакансии (string)
- `statusFilter`: фильтр по статусу ('all' | 'active' | 'inactive')
- `stats`: статистика по бенчмаркам (BenchmarkStats)

## Функции и обработчики

### loadBenchmarks()
- Загружает список бенчмарков из API
- Применяет фильтры
- TODO: GET `/api/finance/benchmarks/`

### handleAddBenchmark()
- Открывает форму добавления бенчмарка
- TODO: POST `/api/finance/benchmarks/`

### handleEditBenchmark(benchmark)
- Открывает форму редактирования
- TODO: PUT `/api/finance/benchmarks/{id}/`

### handleDeleteBenchmark(id)
- Удаляет бенчмарк с подтверждением
- TODO: DELETE `/api/finance/benchmarks/{id}/`

### handleToggleActive(id)
- Переключает активность бенчмарка
- TODO: PATCH `/api/finance/benchmarks/{id}/active/`

## Моковые данные

### mockBenchmarks
Массив объектов бенчмарков с полями:
- `id`: уникальный идентификатор
- `position`: позиция (название вакансии)
- `grade`: грейд
- `salary`: зарплата в разных валютах
- `source`: источник данных
- `updatedAt`: дата обновления

**TODO**: Заменить на реальные данные из API

## TODO: Замена моковых данных на API

1. ❌ `mockBenchmarks` - заменить на загрузку из API
2. ❌ `loadBenchmarks()` - реализовать реальный API вызов
3. ❌ Фильтры - реализовать функциональность
4. ❌ Обновление бенчмарков - реализовать синхронизацию с внешними источниками

## Стили

- **Файл**: `benchmarks.module.css`
- **Основной контейнер**: Стили для layout страницы бенчмарков
- **Таблица**: Стили для таблицы бенчмарков

## Связи с другими страницами

- `/finance/page.tsx` - страница финансовых настроек
- `/vacancies/salary-ranges` - использует бенчмарки для создания зарплатных вилок

## Особенности

- Сравнительные данные по зарплатам
- Фильтрация по различным параметрам
- Используется для настройки зарплатных вилок
