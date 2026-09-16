/**
 * Universal API Client with JWT Bearer Interceptors & Resilient Fallback
 * Connects directly to Spring Boot 3 REST Backend & FastAPI AI Microservice
 */

const BASE_URL = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_URL) || 'http://localhost:8080/api';

export class ApiClient {
  private static getToken(): string | null {
    return localStorage.getItem('uzhavanconnect_jwt_token');
  }

  public static setToken(token: string): void {
    localStorage.setItem('uzhavanconnect_jwt_token', token);
  }

  public static clearToken(): void {
    localStorage.removeItem('uzhavanconnect_jwt_token');
  }

  public static async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {})
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const fullUrl = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;

    try {
      const response = await fetch(fullUrl, {
        ...options,
        headers
      });

      if (!response.ok) {
        let errorMsg = `HTTP ${response.status} ${response.statusText}`;
        try {
          const errJson = await response.json();
          if (errJson.message) errorMsg = errJson.message;
        } catch {
          // ignore parsing error
        }
        throw new Error(errorMsg);
      }

      if (response.status === 204) {
        return {} as T;
      }

      return await response.json();
    } catch (err) {
      // Return rejected promise to allow fallback handling where appropriate
      throw err;
    }
  }

  public static get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  public static post<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined
    });
  }

  public static put<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined
    });
  }

  public static delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}
