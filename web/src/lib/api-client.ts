// API响应类型定义
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination?: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

// 验证码相关类型
export interface CaptchaResponse {
  captchaId: string;
  imageBase64: string;
  expiresAt: string;
}

// 认证相关类型
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
  captchaId: string;
  captchaAnswer: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
  firstName?: string;
  lastName?: string;
  captchaId: string;
  captchaAnswer: string;
}

export interface AuthResponse {
  token: string;
  userKey: string;
  email: string;
  role: string;
  isEmailVerified: boolean;
  expiresAt: string;
}

export interface User {
  id: string;
  email: string;
  userKey: string;
  role: string;
  isEmailVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Todo相关类型
export interface Todo {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: number;
  dueDate?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTodoRequest {
  title: string;
  description?: string;
  priority?: number;
  dueDate?: string;
  conversationSessionId: string;
}

// API客户端类
class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL = 'http://localhost:5000/api') {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('auth_token');
  }

  // 设置认证token
  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  // 通用请求方法
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers = new Headers(options.headers);

    headers.set('Content-Type', 'application/json');
    
    if (this.token) {
      headers.set('Authorization', `Bearer ${this.token}`);
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      } else {
        return response.text() as unknown as T;
      }
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // 验证码相关API
  captcha = {
    generate: (): Promise<ApiResponse<CaptchaResponse>> =>
      this.request('/captcha/generate'),
    
    refresh: (captchaId: string): Promise<ApiResponse<CaptchaResponse>> =>
      this.request('/captcha/refresh', {
        method: 'POST',
        body: JSON.stringify({ captchaId }),
      }),
  };

  // 认证相关API
  auth = {
    login: (data: LoginRequest): Promise<ApiResponse<AuthResponse>> =>
      this.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    register: (data: RegisterRequest): Promise<ApiResponse<AuthResponse>> =>
      this.request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    logout: (): Promise<ApiResponse<void>> =>
      this.request('/auth/logout', {
        method: 'POST',
      }),

    forgotPassword: (email: string): Promise<ApiResponse<void>> =>
      this.request('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      }),

    resetPassword: (token: string, newPassword: string): Promise<ApiResponse<void>> =>
      this.request('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, newPassword }),
      }),
  };

  // 用户相关API
  users = {
    me: (): Promise<ApiResponse<User>> =>
      this.request('/users/me'),

    updateMe: (data: Partial<User>): Promise<ApiResponse<User>> =>
      this.request('/users/me', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    updatePassword: (currentPassword: string, newPassword: string): Promise<ApiResponse<void>> =>
      this.request('/users/me/password', {
        method: 'PUT',
        body: JSON.stringify({ currentPassword, newPassword }),
      }),
  };

  // Todo相关API
  todos = {
    list: (params?: {
      page?: number;
      pageSize?: number;
      status?: string;
      sessionId?: string;
    }): Promise<PaginatedResponse<Todo>> => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set('page', params.page.toString());
      if (params?.pageSize) searchParams.set('pageSize', params.pageSize.toString());
      if (params?.status) searchParams.set('status', params.status);
      if (params?.sessionId) searchParams.set('sessionId', params.sessionId);
      
      return this.request(`/todos?${searchParams.toString()}`);
    },

    create: (data: CreateTodoRequest): Promise<ApiResponse<Todo>> =>
      this.request('/todos', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    update: (id: string, data: Partial<Todo>): Promise<ApiResponse<Todo>> =>
      this.request(`/todos/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    updateStatus: (id: string, status: Todo['status']): Promise<ApiResponse<Todo>> =>
      this.request(`/todos/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),

    delete: (id: string): Promise<ApiResponse<void>> =>
      this.request(`/todos/${id}`, {
        method: 'DELETE',
      }),
  };

  // 健康检查
  health = {
    check: (): Promise<{ status: string; timestamp: string; version: string }> =>
      this.request('/health'),
  };
}

// 导出单例实例
export const apiClient = new ApiClient();
export default apiClient;