import { ApiResponse, ApiErrorPayload } from '../types/api';

export class ApiError extends Error {
  statusCode: number;
  code?: string;
  details?: Record<string, any>;

  constructor(message: string, statusCode: number = 500, code?: string, details?: Record<string, any>) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export interface RequestOptions extends RequestInit {
  timeoutMs?: number;
  retries?: number;
  params?: Record<string, any>;
}

const DEFAULT_TIMEOUT_MS = 10000;
const DEFAULT_RETRIES = 2;

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = (baseUrl || (import.meta.env.VITE_API_BASE_URL as string) || '/api').replace(/\/+$/, '');
  }

  private buildUrl(path: string, params?: Record<string, any>): string {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    const url = new URL(`${this.baseUrl}${cleanPath}`, window.location.origin);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value)) {
            value.forEach((v) => url.searchParams.append(key, String(v)));
          } else {
            url.searchParams.set(key, String(value));
          }
        }
      });
    }

    return url.toString();
  }

  async request<T>(path: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    const {
      timeoutMs = DEFAULT_TIMEOUT_MS,
      retries = DEFAULT_RETRIES,
      params,
      headers: customHeaders,
      ...fetchOptions
    } = options;

    const url = this.buildUrl(path, params);

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...customHeaders,
    };

    let attempt = 0;
    let lastError: any = null;

    while (attempt <= retries) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const response = await fetch(url, {
          ...fetchOptions,
          headers,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          let errorData: any = {};
          try {
            errorData = await response.json();
          } catch {
            errorData = { message: response.statusText || 'Request failed' };
          }

          throw new ApiError(
            errorData.message || `HTTP ${response.status}: Request failed`,
            response.status,
            errorData.code,
            errorData.details
          );
        }

        const data = await response.json();
        return data as ApiResponse<T>;
      } catch (err: any) {
        clearTimeout(timeoutId);
        lastError = err;

        // Do not retry on 4xx client errors or explicit non-transient aborts
        if (err instanceof ApiError && err.statusCode >= 400 && err.statusCode < 500) {
          throw err;
        }

        attempt++;
        if (attempt <= retries) {
          // Exponential backoff delay (200ms, 400ms...)
          await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 100));
        }
      }
    }

    if (lastError?.name === 'AbortError') {
      throw new ApiError('Request timed out. Please check your connection and retry.', 408, 'TIMEOUT');
    }

    throw lastError instanceof ApiError ? lastError : new ApiError(lastError?.message || 'Network request failed', 0, 'NETWORK_ERROR');
  }

  async get<T>(path: string, params?: Record<string, any>, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(path, { ...options, method: 'GET', params });
  }

  async post<T>(path: string, body?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(path, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async put<T>(path: string, body?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(path, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(path: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(path, { ...options, method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
