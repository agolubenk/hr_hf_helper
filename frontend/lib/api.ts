// Утилита для работы с API backend

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
const API_VERSION = 'v1'

export const getApiUrl = (endpoint: string) => {
  return `${API_BASE_URL}/api/${API_VERSION}/${endpoint}`
}

export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

// Типы для Finance API
export interface Grade {
  id: number
  name: string
}

export interface CurrencyRate {
  id: number
  code: string
  rate: string
  scale: number
  fetched_at: string
  status_info?: string
  display_rate?: string
}

export interface PLNTax {
  id: number
  name: string
  rate: string
  rate_decimal?: number
  is_active: boolean
  created_at: string
  updated_at: string
}

// Функция для получения CSRF токена из куки
function getCsrfToken(): string | null {
  if (typeof document === 'undefined') return null
  const name = 'csrftoken'
  let cookieValue = null
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';')
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim()
      if (cookie.substring(0, name.length + 1) === name + '=') {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1))
        break
      }
    }
  }
  return cookieValue
}

// Базовые функции для API запросов
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const url = getApiUrl(endpoint)
    const csrfToken = getCsrfToken()
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    }
    
    // Добавляем CSRF токен если он есть
    if (csrfToken) {
      headers['X-CSRFToken'] = csrfToken
    }
    
    const response = await fetch(url, {
      ...options,
      credentials: 'include', // Включаем отправку куки для сессионной аутентификации
      headers,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Ошибка запроса' }))
      return {
        error: errorData.error || errorData.message || `Ошибка ${response.status}`,
      }
    }

    const data = await response.json()
    return { data }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Неизвестная ошибка',
    }
  }
}

// API для грейдов
export const gradesApi = {
  getAll: () => apiRequest<Grade[]>('finance/grades/'),
  getById: (id: number) => apiRequest<Grade>(`finance/grades/${id}/`),
  create: (data: { name: string }) =>
    apiRequest<Grade>('finance/grades/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number, data: { name: string }) =>
    apiRequest<Grade>(`finance/grades/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    apiRequest<void>(`finance/grades/${id}/`, {
      method: 'DELETE',
    }),
}

// API для курсов валют
export const currencyRatesApi = {
  getAll: () => apiRequest<CurrencyRate[]>('finance/currency-rates/'),
  updateRates: () =>
    apiRequest<{ message: string }>('finance/currency-rates/update-rates/', {
      method: 'POST',
    }),
  getLatest: () => apiRequest<CurrencyRate[]>('finance/currency-rates/latest/'),
}

// API для налогов PLN
export const plnTaxesApi = {
  getAll: () => apiRequest<PLNTax[]>('finance/pln-taxes/'),
  getById: (id: number) => apiRequest<PLNTax>(`finance/pln-taxes/${id}/`),
  create: (data: { name: string; rate: string; is_active?: boolean }) =>
    apiRequest<PLNTax>('finance/pln-taxes/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number, data: { name?: string; rate?: string; is_active?: boolean }) =>
    apiRequest<PLNTax>(`finance/pln-taxes/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    apiRequest<void>(`finance/pln-taxes/${id}/`, {
      method: 'DELETE',
    }),
}
