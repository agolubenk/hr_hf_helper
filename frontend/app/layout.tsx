/**
 * RootLayout - Корневой layout компонент приложения
 * 
 * Назначение:
 * - Оборачивает все страницы приложения
 * - Предоставляет глобальные провайдеры (тема, уведомления)
 * - Устанавливает метаданные для SEO
 * 
 * Функциональность:
 * - ThemeProvider: управляет темой приложения (светлая/темная), сохраняет выбор в localStorage
 * - ToastProvider: предоставляет контекст для отображения уведомлений во всем приложении
 * - children: рендерит содержимое конкретной страницы
 * 
 * Связи:
 * - Используется Next.js App Router для оборачивания всех страниц
 * - ThemeProvider связан с Header компонентом для переключения темы
 * - ToastProvider связан с компонентами, которые показывают уведомления через useToast()
 * 
 * Поведение:
 * - Применяется ко всем страницам автоматически через Next.js
 * - Провайдеры инициализируются один раз при загрузке приложения
 * - Метаданные используются для SEO и отображения в браузере
 */

import type { Metadata } from 'next'
import '@radix-ui/themes/styles.css'
import './globals.css'
import { ThemeProvider } from '@/components/ThemeProvider'
import { ToastProvider } from '@/components/Toast/ToastContext'

// Метаданные для SEO и браузера
// title: отображается во вкладке браузера и в результатах поиска
// description: используется поисковыми системами для описания приложения
export const metadata: Metadata = {
  title: 'HR Helper',
  description: 'HR Helper Application',
}

/**
 * RootLayout - корневой layout компонент
 * @param children - ReactNode, содержимое страницы, которое будет обернуто провайдерами
 * @returns JSX с оберткой провайдеров вокруг children
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <body>
        {/* ThemeProvider: управляет темой приложения (светлая/темная)
            - Предоставляет контекст темы через useTheme() хук
            - Сохраняет выбранную тему в localStorage
            - Применяет тему ко всем дочерним компонентам */}
        <ThemeProvider>
          {/* ToastProvider: управляет системой уведомлений
              - Предоставляет контекст для отображения toast-уведомлений
              - Используется через useToast() хук в компонентах
              - Показывает информационные, успешные, ошибочные и предупреждающие сообщения */}
          <ToastProvider>
            {/* children: содержимое конкретной страницы, рендерится здесь */}
            {children}
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
