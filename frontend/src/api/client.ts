export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errors?: Record<string, string>;
}

class ApiClient {
  private get baseUrl(): string {
    const rawUrl = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api';
    if (rawUrl && typeof rawUrl === 'string' && rawUrl.trim()) {
      if (typeof window !== 'undefined' && window.location.protocol === 'https:' && rawUrl.startsWith('http://localhost')) {
        return '/api';
      }
      const trimmed = rawUrl.trim();
      return trimmed.endsWith('/api') ? trimmed : `${trimmed.replace(/\/$/, '')}/api`;
    }
    return 'http://localhost:5000/api';
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const token = localStorage.getItem('access_token');

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
        credentials: 'include', // sends cookies
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('access_token');
        }
        throw new Error(data.message || data.error || 'Network request failed');
      }

      return data;
    } catch (error: any) {
      if (endpoint !== '/auth/me') {
        console.error(`API Error on [${options.method || 'GET'} ${endpoint}]:`, error);
      }
      throw error;
    }
  }

  get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    let url = endpoint;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          searchParams.append(key, String(val));
        }
      });
      const qs = searchParams.toString();
      if (qs) url += `?${qs}`;
    }
    return this.request<T>(url, { method: 'GET' });
  }

  post<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  put<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  patch<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
