# HR Helper Frontend

Next.js приложение с Radix UI Themes.

## Установка и запуск

```bash
# Установка зависимостей (уже выполнено)
npm install

# Запуск в режиме разработки
npm run dev

# Сборка для production
npm run build

# Запуск production сборки
npm start
```

Приложение будет доступно по адресу [http://localhost:3000](http://localhost:3000)

## Структура

- `app/layout.tsx` - корневой layout с Theme компонентом от Radix UI
- `app/page.tsx` - главная страница с примером использования компонентов

## Настройка темы

Тема настраивается в `app/layout.tsx` через пропсы компонента `Theme`:

```tsx
<Theme accentColor="crimson" grayColor="sand" radius="large" scaling="95%">
```

Доступные параметры:
- `accentColor` - цвет акцента (crimson, blue, green, и др.)
- `grayColor` - оттенок серого (sand, slate, mauve, и др.)
- `radius` - радиус скругления (none, small, medium, large, full)
- `scaling` - масштабирование (90%, 95%, 100%, 105%, 110%)

## Использование ThemePanel

Для разработки можно добавить ThemePanel в layout:

```tsx
import { Theme, ThemePanel } from "@radix-ui/themes";

<Theme>
  {children}
  <ThemePanel />
</Theme>
```
