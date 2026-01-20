/**
 * API клиент для работы с FastAPI Gateway
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8002/api/v1';
const TELEGRAM_API_BASE_URL = import.meta.env.VITE_TELEGRAM_SERVICE_URL || 'http://localhost:8003/api/v1';

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
  requireAuth?: boolean;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private getAuthToken(): string | null {
    return localStorage.getItem('access_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const {
      method = 'GET',
      body,
      headers = {},
      requireAuth = true,
    } = options;

    const url = `${this.baseUrl}${endpoint}`;
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers,
    };

    if (requireAuth) {
      const token = this.getAuthToken();
      if (token) {
        // Убираем лишние пробелы и проверяем, что токен не пустой
        const cleanToken = token.trim();
        if (cleanToken && cleanToken.length > 0) {
          // Проверяем, что токен не содержит недопустимых символов
          if (/^[A-Za-z0-9\-_.]+$/.test(cleanToken)) {
            requestHeaders['Authorization'] = `Bearer ${cleanToken}`;
            console.log('✅ Authorization header set');
          } else {
            console.error('❌ Invalid token format, contains invalid characters');
            console.error('Token preview:', cleanToken.substring(0, 20) + '...');
          }
        } else {
          console.error('❌ Empty token after trim, skipping Authorization header');
        }
      } else {
        console.error('❌ No token available in localStorage');
        console.error('Available localStorage keys:', Object.keys(localStorage));
      }
    }

    const config: RequestInit = {
      method,
      headers: requestHeaders,
    };

    if (body && method !== 'GET') {
      config.body = JSON.stringify(body);
    }

    try {
      console.log(`📤 ${method} ${url}`, body ? { body } : '');
      
      const response = await fetch(url, config);
      
      console.log(`📥 Response status: ${response.status} ${response.statusText}`);
      console.log(`📥 Response headers:`, Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error response body:', errorText);
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { detail: errorText || response.statusText };
        }
        
        // Обработка 401 Unauthorized - токен истек или невалиден
        if (response.status === 401) {
          console.warn('⚠️ 401 Unauthorized - clearing token and redirecting to login');
          localStorage.removeItem('access_token');
          localStorage.removeItem('user');
          
          // Перенаправляем на страницу логина, если мы не на ней уже
          if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
            window.location.href = '/login?expired=true';
          }
        }
        
        // Создаем объект ошибки с дополнительной информацией
        const error = new Error(errorData.detail || errorData.message || `HTTP error! status: ${response.status}`);
        (error as any).response = {
          status: response.status,
          data: errorData
        };
        throw error;
      }

      // Если ответ пустой, возвращаем пустой объект
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        console.log('✅ Response data:', data);
        return data as T;
      }

      return {} as T;
    } catch (error) {
      console.error('❌ API request error:', error);
      if (error instanceof Error) {
        console.error('❌ Error message:', error.message);
        console.error('❌ Error stack:', error.stack);
      }
      throw error;
    }
  }

  // Auth endpoints
  async login(email: string, password: string) {
    console.log('🔐 Attempting login for:', email);
    console.log('🌐 API Base URL:', this.baseUrl);
    
    try {
      const response = await this.request<{ access_token: string; token_type: string; user: any }>(
        '/auth/login',
        {
          method: 'POST',
          body: { email, password },
          requireAuth: false,
        }
      );
      
      console.log('✅ Login response:', response);
      
      if (response.access_token) {
        const token = response.access_token.trim();
        if (token) {
          localStorage.setItem('access_token', token);
          localStorage.setItem('user', JSON.stringify(response.user));
          console.log('✅ Token saved to localStorage');
        } else {
          console.error('❌ Empty token received!');
        }
      } else {
        console.warn('⚠️ No access_token in response');
      }
      
      return response;
    } catch (error: any) {
      console.error('❌ Login error:', error);
      console.error('❌ Error details:', {
        message: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  async register(data: { email: string; password: string; first_name: string; last_name: string; middle_name?: string }) {
    return this.request('/auth/register', {
      method: 'POST',
      body: data,
      requireAuth: false,
    });
  }

  async logout() {
    await this.request('/auth/logout', { method: 'POST' });
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  // Profile endpoints
  async getProfile() {
    return this.request('/profile');
  }

  async updateProfile(data: any) {
    return this.request('/profile', {
      method: 'PATCH',
      body: data,
    });
  }

  async changePassword(oldPassword: string, newPassword: string) {
    return this.request('/profile/change-password', {
      method: 'POST',
      body: { old_password: oldPassword, new_password: newPassword },
    });
  }

  async getActivityLog(page: number = 1, pageSize: number = 20) {
    return this.request(`/profile/activity-log?page=${page}&page_size=${pageSize}`);
  }

  // Company settings endpoints
  async getCompanySettings(companyId?: string) {
    const params = companyId ? `?company_id=${companyId}` : '';
    return this.request(`/company-settings${params}`);
  }

  async updateCompanySettings(data: any, companyId?: string) {
    const params = companyId ? `?company_id=${companyId}` : '';
    return this.request(`/company-settings${params}`, {
      method: 'PATCH',
      body: data,
    });
  }

  async getGeneralSettings(companyId?: string) {
    const params = companyId ? `?company_id=${companyId}` : '';
    return this.request(`/company-settings/general${params}`);
  }

  async getAvailableLanguages() {
    return this.request('/company-settings/available-languages');
  }

  async getAvailableCurrencies() {
    return this.request('/company-settings/available-currencies');
  }

  async updateGeneralSettings(data: any, companyId?: string) {
    const params = companyId ? `?company_id=${companyId}` : '';
    
    // Если data - это FormData, отправляем как multipart/form-data
    if (data instanceof FormData) {
      const token = localStorage.getItem('access_token');
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token.trim()}`;
      }
      // Не устанавливаем Content-Type для FormData - браузер установит автоматически с boundary
      
      const response = await fetch(`${this.baseUrl}/company-settings/general${params}`, {
        method: 'PATCH',
        headers,
        body: data,
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error response body:', errorText);
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { detail: errorText || response.statusText };
        }
        
        // Форматируем детали ошибки для лучшего отображения
        let errorMessage = errorData.detail || errorData.message || `HTTP error! status: ${response.status}`;
        
        // Если есть ошибки валидации, форматируем их
        if (errorData && typeof errorData === 'object') {
          const validationErrors: string[] = [];
          for (const [key, value] of Object.entries(errorData)) {
            if (key !== 'detail' && key !== 'message') {
              if (Array.isArray(value)) {
                validationErrors.push(`${key}: ${value.join(', ')}`);
              } else {
                validationErrors.push(`${key}: ${value}`);
              }
            }
          }
          if (validationErrors.length > 0) {
            errorMessage = validationErrors.join('; ');
          }
        }
        
        const error = new Error(errorMessage);
        (error as any).response = {
          status: response.status,
          data: errorData
        };
        throw error;
      }
      
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      return {};
    }
    
    // Обычный JSON запрос
    return this.request(`/company-settings/general${params}`, {
      method: 'PATCH',
      body: data,
    });
  }

  async getUsersSettings(companyId?: string) {
    const params = companyId ? `?company_id=${companyId}` : '';
    return this.request(`/company-settings/users${params}`);
  }

  async getSecuritySettings(companyId?: string) {
    const params = companyId ? `?company_id=${companyId}` : '';
    return this.request(`/company-settings/security${params}`);
  }

  async getIntegrationsSettings(companyId?: string) {
    const params = companyId ? `?company_id=${companyId}` : '';
    return this.request(`/company-settings/integrations${params}`);
  }

  async getThemeSettings(companyId?: string) {
    const params = companyId ? `?company_id=${companyId}` : '';
    return this.request(`/company-settings/theme${params}`);
  }

  async updateThemeSettings(data: any, companyId?: string) {
    const params = companyId ? `?company_id=${companyId}` : '';
    return this.request(`/company-settings/theme${params}`, {
      method: 'PATCH',
      body: data,
    });
  }

  async getLifecycleSettings(companyId?: string) {
    const params = companyId ? `?company_id=${companyId}` : '';
    return this.request(`/company-settings/lifecycle${params}`);
  }

  async updateLifecycleSettings(data: any, companyId?: string) {
    const params = companyId ? `?company_id=${companyId}` : '';
    return this.request(`/company-settings/lifecycle${params}`, {
      method: 'PATCH',
      body: data,
    });
  }

  async createEmployeeStatus(data: any, companyId?: string) {
    const params = companyId ? `?company_id=${companyId}` : '';
    return this.request(`/company-settings/lifecycle/status${params}`, {
      method: 'POST',
      body: data,
    });
  }

  async updateEmployeeStatus(statusId: string, data: any) {
    return this.request(`/company-settings/lifecycle/status/${statusId}`, {
      method: 'PATCH',
      body: data,
    });
  }

  async deleteEmployeeStatus(statusId: string) {
    return this.request(`/company-settings/lifecycle/status/${statusId}`, {
      method: 'DELETE',
    });
  }

  async getReasonsSettings(companyId?: string) {
    const params = companyId ? `?company_id=${companyId}` : '';
    return this.request(`/company-settings/reasons${params}`);
  }

  async updateReasonsSettings(data: any, companyId?: string) {
    const params = companyId ? `?company_id=${companyId}` : '';
    return this.request(`/company-settings/reasons${params}`, {
      method: 'PATCH',
      body: data,
    });
  }

  async createRejectionReason(data: any, companyId?: string) {
    const params = companyId ? `?company_id=${companyId}` : '';
    return this.request(`/company-settings/reasons/rejection${params}`, {
      method: 'POST',
      body: data,
    });
  }

  async createTerminationReason(data: any, companyId?: string) {
    const params = companyId ? `?company_id=${companyId}` : '';
    return this.request(`/company-settings/reasons/termination${params}`, {
      method: 'POST',
      body: data,
    });
  }

  async getRejectionAvailability(companyId?: string) {
    const params = companyId ? `?company_id=${companyId}` : '';
    return this.request(`/company-settings/reasons/availability${params}`);
  }

  async createRejectionAvailability(data: any) {
    return this.request(`/company-settings/reasons/availability`, {
      method: 'POST',
      body: data,
    });
  }

  async deleteRejectionAvailability(availabilityId: string) {
    return this.request(`/company-settings/reasons/availability/${availabilityId}`, {
      method: 'DELETE',
    });
  }

  // Org Structure (Departments) endpoints
  async getOrgStructure(companyId?: string) {
    const params = companyId ? `?company_id=${companyId}` : '';
    return this.request(`/company-settings/org-structure${params}`);
  }

  async createDepartment(data: any, companyId?: string) {
    const params = companyId ? `?company_id=${companyId}` : '';
    return this.request(`/company-settings/org-structure${params}`, {
      method: 'POST',
      body: data,
    });
  }

  async updateDepartment(departmentId: string, data: any) {
    return this.request(`/company-settings/org-structure/${departmentId}`, {
      method: 'PATCH',
      body: data,
    });
  }

  async deleteDepartment(departmentId: string) {
    return this.request(`/company-settings/org-structure/${departmentId}`, {
      method: 'DELETE',
    });
  }

  // Themes endpoints
  async getThemes(themeType?: 'light' | 'dark', isActive?: boolean) {
    const params = new URLSearchParams();
    if (themeType) params.append('theme_type', themeType);
    if (isActive !== undefined) params.append('is_active', String(isActive));
    const query = params.toString();
    return this.request(`/themes${query ? `?${query}` : ''}`);
  }

  async getLightThemes() {
    return this.request('/themes/light');
  }

  async getDarkThemes() {
    return this.request('/themes/dark');
  }

  async getDefaultLightTheme() {
    return this.request('/themes/default-light');
  }

  async getDefaultDarkTheme() {
    return this.request('/themes/default-dark');
  }

  async getTheme(themeId: string) {
    return this.request(`/themes/${themeId}`);
  }

  async createTheme(data: any, companyId?: string) {
    const params = companyId ? `?company_id=${companyId}` : '';
    return this.request(`/themes${params}`, {
      method: 'POST',
      body: data,
    });
  }

  async updateTheme(themeId: string, data: any) {
    return this.request(`/themes/${themeId}`, {
      method: 'PATCH',
      body: data,
    });
  }

  async deleteTheme(themeId: string) {
    return this.request(`/themes/${themeId}`, {
      method: 'DELETE',
    });
  }

  async getCompanySelectedThemes() {
    return this.request('/themes/company-selected');
  }

  async updateCompanySelectedThemes(themeIds: string[]) {
    return this.request('/themes/company-selected', {
      method: 'POST',
      body: { theme_ids: themeIds },
    });
  }

  // Telegram endpoints (используют отдельный базовый URL)
  private async telegramRequest<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const {
      method = 'GET',
      body,
      headers = {},
      requireAuth = true,
    } = options;

    const url = `${TELEGRAM_API_BASE_URL}${endpoint}`;
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers,
    };

    if (requireAuth) {
      const token = this.getAuthToken();
      if (token) {
        const cleanToken = token.trim();
        if (cleanToken && cleanToken.length > 0) {
          requestHeaders['Authorization'] = `Bearer ${cleanToken}`;
        }
      }
    }

    const config: RequestInit = {
      method,
      headers: requestHeaders,
    };

    if (body && method !== 'GET') {
      config.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { detail: errorText || response.statusText };
        }

        if (response.status === 401) {
          console.warn('⚠️ 401 Unauthorized - clearing token and redirecting to login');
          localStorage.removeItem('access_token');
          localStorage.removeItem('user');
          if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
            window.location.href = '/login?expired=true';
          }
        }

        const error = new Error(errorData.detail || errorData.message || `HTTP error! status: ${response.status}`);
        (error as any).response = {
          status: response.status,
          data: errorData
        };
        throw error;
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        return data as T;
      }

      return {} as T;
    } catch (error) {
      console.error('❌ Telegram API request error:', error);
      throw error;
    }
  }

  async sendTelegramPhone(companyId: string, phoneNumber: string) {
    return this.telegramRequest('/auth/phone', {
      method: 'POST',
      body: { company_id: companyId, phone_number: phoneNumber },
    });
  }

  async verifyTelegramCode(companyId: string, code: string) {
    return this.telegramRequest('/auth/code', {
      method: 'POST',
      body: { company_id: companyId, code },
    });
  }

  async verifyTelegram2FA(companyId: string, password: string) {
    return this.telegramRequest('/auth/2fa', {
      method: 'POST',
      body: { company_id: companyId, password },
    });
  }

  async getTelegramAuthStatus(companyId: string) {
    return this.telegramRequest(`/auth/status/${companyId}`);
  }

  async logoutTelegram(companyId: string) {
    return this.telegramRequest(`/auth/logout/${companyId}`, {
      method: 'POST',
    });
  }

  async getTelegramChats(companyId: string, limit: number = 100, offset: number = 0) {
    return this.telegramRequest(`/chats/${companyId}?limit=${limit}&offset=${offset}`);
  }

  async getTelegramChat(companyId: string, chatId: number) {
    return this.telegramRequest(`/chats/${companyId}/${chatId}`);
  }

  async getTelegramMessages(companyId: string, chatId: number, limit: number = 50, offset: number = 0) {
    return this.telegramRequest(`/chats/${companyId}/${chatId}/messages?limit=${limit}&offset=${offset}`);
  }

  async sendTelegramMessage(companyId: string, chatId: number, text: string, replyToMessageId?: number) {
    return this.telegramRequest('/messages/send', {
      method: 'POST',
      body: {
        company_id: companyId,
        chat_id: chatId,
        text,
        reply_to_message_id: replyToMessageId,
      },
    });
  }

  async getTelegramContacts(companyId: string, limit: number = 100, offset: number = 0) {
    return this.telegramRequest(`/contacts/${companyId}?limit=${limit}&offset=${offset}`);
  }

  async searchTelegramContacts(companyId: string, query: string, limit: number = 20) {
    return this.telegramRequest(`/contacts/${companyId}/search?query=${encodeURIComponent(query)}&limit=${limit}`);
  }

  async generateTelegramQR(companyId: string) {
    return this.telegramRequest('/auth/qr/generate', {
      method: 'POST',
      body: { company_id: companyId },
    });
  }

  async checkTelegramQRStatus(companyId: string) {
    return this.telegramRequest(`/auth/qr/status/${companyId}`);
  }
}

export const api = new ApiClient();
export default api;

