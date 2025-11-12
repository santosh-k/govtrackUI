import { LoginRequest, LoginResponse, User } from '../types/auth.types';
import { store } from '../store';
import {
  loginStart,
  loginSuccess,
  loginFailure,
  refreshTokenStart,
  refreshTokenSuccess,
  refreshTokenFailure,
  updateUser,
} from '../store/authSlice';

class ApiManager {
  private static instance: ApiManager;
  private baseUrl = 'https://cms.pwddelhi.thesst.com/api';

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

    // Only set JSON Content-Type if body is not FormData
    if (!(options.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorMessage = 'An error occurred';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        // ignore parse errors
      }
      throw new Error(errorMessage);
    }

    return response;
  }

  /**
   * Helper for external API requests that may return success: false with error codes
   * If TOKEN_EXPIRED is returned, attempt a refresh and retry once.
   */
  private async fetchExternalWithRetry(url: string, options: RequestInit = {}, retry: boolean = true): Promise<any> {
    // attach token header
    const headers = new Headers(options.headers);
    const token = this.getToken();
    if (token) headers.set('Authorization', `Bearer ${token}`);

    if (!(options.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    let data: any = undefined;
    try {
      data = await response.json();
    } catch (e) {
      // ignore JSON parse errors
    }

    // If API returned a structured error indicating token expired, try refresh once
    if (data && data.success === false && data.error && data.error.code === 'TOKEN_EXPIRED') {
      if (!retry) {
        const msg = data.error.message || 'Token expired';
        throw new Error(msg);
      }

      // Attempt refresh
      try {
        await this.refreshToken();
      } catch (err) {
        // couldn't refresh, propagate original error message if available
        const msg = (data.error && data.error.message) || (err instanceof Error ? err.message : 'Token refresh failed');
        throw new Error(msg);
      }

      // Retry the original request once with new token
      return this.fetchExternalWithRetry(url, options, false);
    }

    // If non-OK HTTP status
    if (!response.ok) {
      const msg = (data && (data.message || data.error?.message)) || 'Request failed';
      throw new Error(msg);
    }

    // If API returned success:false for other reasons
    if (data && data.success === false) {
      const msg = data.message || data.error?.message || 'Request failed';
      throw new Error(msg);
    }

    return data;
  }

  /** ---------------- LOGIN ---------------- */
  public async login(credentials: LoginRequest): Promise<LoginResponse> {
    store.dispatch(loginStart());

    try {
      const response = await fetch(`${this.baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      const data: LoginResponse = await response.json();

      if (data.success && data.data) {
        store.dispatch(
          loginSuccess({
            token: data.data.token,
            refreshToken: data.data.refreshToken,
            user: data.data.user,
          })
        );
      } else {
        store.dispatch(loginFailure('Login failed'));
      }

      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      store.dispatch(loginFailure(message));
      throw new Error(message);
    }
  }

  /** ---------------- REFRESH TOKEN ---------------- */
  public async refreshToken(): Promise<{ token: string; expiresIn: number }> {
    store.dispatch(refreshTokenStart());

    try {
      const { refreshToken: currentRefreshToken } = store.getState().auth;

      if (!currentRefreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: currentRefreshToken }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        store.dispatch(
          refreshTokenSuccess({
            token: data.data.token,
            expiresIn: data.data.expiresIn,
          })
        );
        return data.data;
      } else {
        store.dispatch(refreshTokenFailure('Token refresh failed'));
        throw new Error(data.message || 'Token refresh failed');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      store.dispatch(refreshTokenFailure(message));
      throw new Error(message);
    }
  }

  /** ---------------- UPDATE PROFILE ---------------- */
  public async updateProfile(formData: FormData): Promise<{
    success: boolean;
    message: string;
    data: User;
  }> {
    try {
      const token = this.getToken();
      if (!token) throw new Error('No authentication token available');

      const response = await fetch(`${this.baseUrl}/auth/profile`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          // ❌ No need for 'Content-Type' with FormData
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Profile update failed');
      }

      if (data.success && data.data) {
        // ✅ Only update editable user fields
        const allowedFields: (keyof User)[] = [
          'email',
          'firstName',
          'lastName',
          'phone',
          'address',
          'profile_image',
        ];

        const filteredUser: Partial<User> = Object.keys(data.data)
          .filter((key) => allowedFields.includes(key as keyof User))
          .reduce((obj: Partial<User>, key) => {
            obj[key as keyof User] = data.data[key];
            return obj;
          }, {});

        store.dispatch(updateUser(filteredUser));
      }

      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      throw new Error(message);
    }
  }

  /** ---------------- STATS (EXTERNAL ADMIN API) ---------------- */
  public async getStats(
  filter: string,
  startDate?: string,
  endDate?: string
): Promise<any> {
  try {
    const token = this.getToken();
    if (!token) throw new Error('No authentication token available');

    // Build query params dynamically
    let query = `filter=${encodeURIComponent(filter)}`;
    if (filter === 'custom' && startDate && endDate) {
      query += `&start_date=${encodeURIComponent(startDate)}&end_date=${encodeURIComponent(endDate)}`;
    }
    console.log(token)
    console.log(query)
    const url = `https://admin.pwddelhi.thesst.com/api/pwdsewa/inspector/stats?${query}`;
    const data = await this.fetchExternalWithRetry(url, { method: 'GET' });
    return data;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An error occurred';
    throw new Error(message);
  }
}

  /** ---------------- COMPLAINTS LIST (EXTERNAL ADMIN API) ---------------- */
  public async getComplaints(stats_filter: string,status: string, page: number = 1, limit: number = 10, search: string = ''): Promise<any> {
    try {
      const token = this.getToken();
      if (!token) throw new Error('No authentication token available');

      // Build query parameters
      const queryParams = new URLSearchParams({
        stats_filter,
        status,
        page: page.toString(),
        limit: limit.toString(),
        search,
      });

      const url = `https://admin.pwddelhi.thesst.com/api/pwdsewa/inspector/complaints?${queryParams.toString()}`;

      const data = await this.fetchExternalWithRetry(url, { method: 'GET' });
      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      throw new Error(message);
    }
  }

  /** ---------------- COMPLAINT DETAILS (EXTERNAL ADMIN API) ---------------- */
  public async getComplaintDetails(complaintId: string): Promise<any> {
    try {
      const token = this.getToken();
      if (!token) throw new Error('No authentication token available');

      const url = `https://admin.pwddelhi.thesst.com/api/pwdsewa/inspector/complaints/${complaintId}`;
      const data = await this.fetchExternalWithRetry(url, { method: 'GET' });
      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      throw new Error(message);
    }
  }
}

export default ApiManager;
