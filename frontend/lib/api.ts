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

// Типы для Benchmarks API
export interface Benchmark {
  id: number
  type: 'candidate' | 'vacancy'
  vacancy: number
  vacancy_name: string
  grade: number
  grade_name: string
  salary_from: string
  salary_to?: string | null
  salary_display: string
  location: string
  work_format?: string | null
  compensation?: string | null
  benefits?: string | null
  development?: string | null
  technologies?: string | null
  domain?: string | null
  domain_display?: string | null
  domain_description?: string | null
  hh_vacancy_id?: string | null
  notes?: string | null
  is_active: boolean
  type_icon?: string
  type_color?: string
  date_added: string
  created_at: string
  updated_at: string
}

export interface BenchmarkSettings {
  id: number
  vacancy_fields: string[]
  candidate_fields: string[]
}

export interface BenchmarkStats {
  total_benchmarks: number
  active_benchmarks: number
  type_stats: Array<{
    type: string
    count: number
    avg_salary_from: string
    avg_salary_to: string
  }>
  grade_stats: Array<{
    grade__name: string
    count: number
    avg_salary_from: string
    avg_salary_to: string
  }>
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
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(typeof options.headers === 'object' && options.headers != null && !(options.headers instanceof Headers) && !Array.isArray(options.headers)
        ? (options.headers as Record<string, string>)
        : {}),
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

// Типы для Vacancies API
export interface Vacancy {
  id: number
  name: string
  title?: string
  status?: string
}

// API для вакансий
export const vacanciesApi = {
  getAll: () => apiRequest<Vacancy[]>('vacancies/vacancies/'),
  getById: (id: number) => apiRequest<Vacancy>(`vacancies/vacancies/${id}/`),
}

// API для единого промпта вакансий
export interface VacancyPrompt {
  prompt: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export const vacancyPromptApi = {
  get: () => apiRequest<VacancyPrompt>('company-settings/vacancy-prompt/api/'),
}

// API для шаблонов отказов
export interface RejectionTemplate {
  id: number
  rejection_type: 'office_format' | 'finance' | 'finance_more' | 'finance_less' | 'grade' | 'general'
  rejection_type_display: string
  grade_id: number | null
  grade_name: string | null
  title: string
  message: string
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export const rejectionTemplatesApi = {
  getAll: (params?: { rejection_type?: string; grade_id?: number }) => {
    const queryParams = new URLSearchParams()
    if (params?.rejection_type) queryParams.append('rejection_type', params.rejection_type)
    if (params?.grade_id) queryParams.append('grade_id', params.grade_id.toString())
    const queryString = queryParams.toString()
    return apiRequest<{ success: boolean; templates: RejectionTemplate[] }>(`company-settings/rejection-templates/api/${queryString ? `?${queryString}` : ''}`)
  },
  getById: (id: number) => apiRequest<RejectionTemplate>(`company-settings/rejection-templates/${id}/get/`),
  create: (data: Partial<RejectionTemplate>) =>
    apiRequest<RejectionTemplate>('company-settings/rejection-templates/create/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number, data: Partial<RejectionTemplate>) =>
    apiRequest<RejectionTemplate>(`company-settings/rejection-templates/${id}/update/`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    apiRequest<void>(`company-settings/rejection-templates/${id}/delete/`, {
      method: 'POST',
    }),
}

// API для бенчмарков
export const benchmarksApi = {
  getAll: (params?: {
    search?: string
    type?: string
    vacancy?: number
    grade?: number
    is_active?: boolean
    page?: number
    page_size?: number
  }) => {
    const queryParams = new URLSearchParams()
    if (params?.search) queryParams.append('search', params.search)
    if (params?.type) queryParams.append('type', params.type)
    if (params?.vacancy) queryParams.append('vacancy', params.vacancy.toString())
    if (params?.grade) queryParams.append('grade', params.grade.toString())
    if (params?.is_active !== undefined) queryParams.append('is_active', params.is_active.toString())
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.page_size) queryParams.append('page_size', params.page_size.toString())
    
    const queryString = queryParams.toString()
    const endpoint = `finance/benchmarks/${queryString ? `?${queryString}` : ''}`
    return apiRequest<{ results: Benchmark[]; count: number; next: string | null; previous: string | null }>(endpoint)
  },
  getById: (id: number) => apiRequest<Benchmark>(`finance/benchmarks/${id}/`),
  create: (data: Partial<Benchmark>) =>
    apiRequest<Benchmark>('finance/benchmarks/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number, data: Partial<Benchmark>) =>
    apiRequest<Benchmark>(`finance/benchmarks/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  patch: (id: number, data: Partial<Benchmark>) =>
    apiRequest<Benchmark>(`finance/benchmarks/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    apiRequest<void>(`finance/benchmarks/${id}/`, {
      method: 'DELETE',
    }),
  getStats: () => apiRequest<BenchmarkStats>('finance/benchmarks/stats/'),
  getSettings: () => apiRequest<BenchmarkSettings>('finance/benchmark-settings/'),
  updateSettings: (data: Partial<BenchmarkSettings>) =>
    apiRequest<BenchmarkSettings>('finance/benchmark-settings/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
}

// Типы для Invites API
export interface Invite {
  id: number
  candidate_name: string
  candidate_email?: string
  candidate_url?: string
  candidate_id?: string
  candidate_grade?: string
  vacancy_id?: string
  vacancy_title?: string
  interview_datetime: string
  interview_datetime_formatted?: string
  custom_duration_minutes?: number
  status: 'pending' | 'sent' | 'completed' | 'cancelled'
  status_display?: string
  interview_format?: 'online' | 'office'
  google_drive_file_id?: string
  google_drive_file_url?: string
  calendar_event_id?: string
  calendar_event_url?: string
  google_meet_url?: string
  interviewer?: number
  interviewer_name?: string
  created_at: string
  updated_at: string
}

export interface InviteListResponse {
  count: number
  next: string | null
  previous: string | null
  results: Invite[]
}

// API для инвайтов
export const invitesApi = {
  getAll: (params?: {
    search?: string
    status?: string
    page?: number
    page_size?: number
  }) => {
    const queryParams = new URLSearchParams()
    if (params?.search) queryParams.append('search', params.search)
    if (params?.status) queryParams.append('status', params.status)
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.page_size) queryParams.append('page_size', params.page_size.toString())
    
    const queryString = queryParams.toString()
    const endpoint = `google-oauth/invites/${queryString ? `?${queryString}` : ''}`
    return apiRequest<InviteListResponse>(endpoint)
  },
  getById: (id: number) => apiRequest<Invite>(`google-oauth/invites/${id}/`),
  getInvitationText: (id: number) =>
    apiRequest<{ success: boolean; invitation_text: string }>(`google-oauth/invites/${id}/invitation-text/`, {
      method: 'POST',
    }),
  update: (id: number, data: Partial<Invite>) =>
    apiRequest<Invite>(`google-oauth/invites/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    apiRequest<void>(`google-oauth/invites/${id}/`, {
      method: 'DELETE',
    }),
}
