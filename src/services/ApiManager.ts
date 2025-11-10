import { LoginRequest, LoginResponse } from '../types/auth.types';
import { store } from '../store';
import { loginStart, loginSuccess, loginFailure } from '../store/authSlice';

class ApiManager {
  private static instance: ApiManager;
  private baseUrl: string = 'https://cms.pwddelhi.thesst.com/api';

  private constructor() {}

  public static getInstance(): ApiManager {
    if (!ApiManager.instance) {
      ApiManager.instance = new ApiManager();
    }
    return ApiManager.instance;
  }

  private getToken(): string | null {
    return store.getState().auth.token;
  }

  private async fetchWithAuth(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const headers = new Headers(options.headers);
    const token = this.getToken();
    
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    
    headers.set('Content-Type', 'application/json');

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'An error occurred');
    }

    return response;
  }

  public async login(credentials: LoginRequest): Promise<LoginResponse> {
    store.dispatch(loginStart());

    try {
      const response = await this.fetchWithAuth('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });

      const data = await response.json();
      
      if (data.success) {
        store.dispatch(loginSuccess({
          token: data.data.token,
          refreshToken: data.data.refreshToken,
          user: data.data.user,
        }));
      } else {
        store.dispatch(loginFailure('Login failed'));
      }

      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      store.dispatch(loginFailure(errorMessage));
      throw error;
    }
  }

  // Add other API methods here
}

export default ApiManager;