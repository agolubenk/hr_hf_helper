/**
 * SalaryRangeDetailRedirect (vacancies/salary-ranges/[id]/page.tsx) - Редирект на страницу зарплатных вилок с детальным просмотром
 * 
 * Назначение:
 * - Перенаправление с URL /vacancies/salary-ranges/[id] на /vacancies/salary-ranges?detail=[id]
 * - Обеспечивает совместимость со старыми ссылками
 * - Автоматически открывает детальный просмотр зарплатной вилки
 * 
 * Функциональность:
 * - Читает ID зарплатной вилки из URL параметра [id]
 * - Выполняет редирект на /vacancies/salary-ranges?detail=[id]
 * - Если ID отсутствует - редирект на /vacancies/salary-ranges
 * 
 * Связи:
 * - useParams: получение динамического параметра [id] из URL
 * - useRouter: выполнение редиректа
 * - vacancies/salary-ranges/page.tsx: страница зарплатных вилок, которая обрабатывает параметр ?detail=
 * 
 * Поведение:
 * - При загрузке компонента сразу выполняет редирект
 * - Использует router.replace вместо router.push (не добавляет запись в историю)
 * - Возвращает null (компонент не рендерит никакого контента)
 * 
 * Причина существования:
 * - Обеспечивает обратную совместимость со старыми ссылками на детальную страницу зарплатной вилки
 * - Упрощает навигацию: вместо отдельной страницы используется модальное окно на странице списка
 */

'use client'

import { useRouter, useParams } from "next/navigation"
import { useEffect } from "react"

/**
 * SalaryRangeDetailRedirect - компонент редиректа на детальный просмотр зарплатной вилки
 * 
 * Функциональность:
 * - Выполняет редирект на страницу зарплатных вилок с параметром ?detail=
 * - Не рендерит никакого контента (возвращает null)
 */
export default function SalaryRangeDetailRedirect() {
  // Хук Next.js для программной навигации
  const router = useRouter()
  // Получение динамических параметров из URL
  const params = useParams()
  // ID зарплатной вилки из URL параметра [id]
  const id = params?.id as string

  /**
   * useEffect - выполнение редиректа при загрузке компонента
   * 
   * Функциональность:
   * - Если ID зарплатной вилки существует - редирект на /vacancies/salary-ranges?detail=[id]
   * - Если ID отсутствует - редирект на /vacancies/salary-ranges
   * 
   * Поведение:
   * - Выполняется один раз при монтировании компонента
   * - Использует router.replace (не добавляет запись в историю браузера)
   * - Кодирует ID через encodeURIComponent для безопасной передачи в URL
   * 
   * Связи:
   * - vacancies/salary-ranges/page.tsx: обрабатывает параметр ?detail= и открывает модальное окно детального просмотра
   */
  useEffect(() => {
    if (id) {
      // Редирект на страницу зарплатных вилок с параметром детального просмотра
      router.replace(`/vacancies/salary-ranges?detail=${encodeURIComponent(id)}`)
    } else {
      // Если ID отсутствует - редирект на список зарплатных вилок
      router.replace('/vacancies/salary-ranges')
    }
  }, [router, id]) // Зависимости: router и id

  // Компонент не рендерит никакого контента
  return null
}
