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

import { Platform } from 'react-native';

class ApiManager {
  private static instance: ApiManager;
  // private baseUrl = 'https://cms.pwddelhi.thesst.com/api';

  //private baseUrl = 'https://pwd.thesst.com/cms/api';
  //private adminBaseUrl = 'https://pwd.thesst.com/admin/api';
  //private adminPmsUrl = 'https://pwd.thesst.com/admin/pms/api'

  // For Staging Server
  //private baseUrl = 'https://pwdstag.thesst.com/cms/api';
  //private adminBaseUrl = 'https://pwdstag.thesst.com/admin/api';
  //private adminPmsUrl = 'https://pwdstag.thesst.com/admin/pms/api';

  // For Dev Server
  private baseUrl = 'https://pwddev.thesst.com/cms/api';
  private adminBaseUrl = 'https://pwddev.thesst.com/admin/api';
  private adminPmsUrl = 'https://pwddev.thesst.com/admin/pms/api';

  //For Local Server
  //private adminBaseUrl = 'http://192.168.1.58:3001/admin/api';
 // private baseUrl = 'http://192.168.1.58:3005/cms/api';
 // private adminPmsUrl = 'http://192.168.1.58:3005/admin/pms/api';

 // For Live Server
  //private baseUrl = 'https://pwddelhi.gov.in/cms/api';
  //private adminBaseUrl = 'https://pwddelhi.gov.in/admin/api';
  //private adminPmsUrl = 'https://pwddelhi.gov.in/admin/pms/api';



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

  // Helper to detect FormData-like bodies (covers RN/Expo variations)
  private isFormData(body: any): boolean {
    if (!body) return false;
    if (typeof FormData !== 'undefined' && body instanceof FormData) return true;
    // Expo/React Native FormData implementations often expose append() or _parts
    if (typeof body.append === 'function') return true;
    if (typeof body === 'object' && '_parts' in body) return true;
    return false;
  }

  private async fetchWithAuth(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const headers = new Headers(options.headers);
    const token = this.getToken();
    const isUpload = options.body instanceof FormData;
  
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    // Only set JSON Content-Type if body is not FormData (handle RN/Expo FormData variants)
   if (!isUpload && !headers.has('Content-Type')) {
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
    const headers = new Headers(options.headers || {});
    const token = this.getToken();

    if (token) headers.set('Authorization', `Bearer ${token}`);

    // If body is FormData (including RN/Expo variants), DO NOT set Content-Type so the bridge can set proper multipart boundary
    if (this.isFormData(options.body)) {
      headers.delete('Content-Type');
    } else {
      headers.set('Content-Type', 'application/json');
    }

    // Debug: log request metadata (mask token)
    try {
      const authHeader = headers.get('Authorization');
      const authPresence = authHeader ? `present ${authHeader.substr(0, 10)}...` : 'absent';
      console.log('[ApiManager] fetchExternalWithRetry request:', { url, method: options.method || 'GET', auth: authPresence });
    } catch (e) {
      // ignore logging errors
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    let data: any = undefined;
    try {
      data = await response.json();
      console.log('Response',JSON.stringify(response.json))
    } catch (e) {
      // ignore JSON parse errors
    }

    // Debug: log response metadata
    try {
      console.log('[ApiManager] fetchExternalWithRetry response:', { url, status: response.status, ok: response.ok, data: data && (data.success !== undefined ? (data.success ? 'success' : 'failure') : 'no-success-flag'), rawData: data });
    } catch (e) {
      // ignore logging errors
    }

    // If API returned a structured error indicating token expired, try refresh once
    if (data && data.success === false && data.error && data.error.code === 'TOKEN_EXPIRED') {
      if (!retry) {
        const msg = data.error.message || 'Token expired';
        throw new Error(msg);
      }
      console.log("Attemt Token Refresh")
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
      console.warn('Non-OK HTTP response', { url, options, status: response.status, data });
      const msg = (data && (data.message || data.error?.message)) || 'Request failed';
      throw new Error(msg);
    }

    // If API returned success:false for other reasons
    if (data && data.success === false) {
      console.warn('API returned success:false', { url, options, data: data });
      const msg = data.message || data.error?.message || 'Request failed';
      throw new Error(msg);
    }

    return data;
  }

  private async buildDeviceInfo(provided?: any) {
    // Lazily require react-native-device-info to avoid native module access during
    // module initialization (which can cause RN native module null errors).
    let DeviceInfo: any = null;
    try {
      // dynamic import works with metro if the package is available
      // fall back to require for environments where import() isn't supported
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      DeviceInfo = require('react-native-device-info');
    } catch (e) {
      try {
        DeviceInfo = await import('react-native-device-info');
      } catch (err) {
        DeviceInfo = null;
      }
    }

    const deviceType = Platform.OS; // "android" or "ios"

    // Default values in case DeviceInfo is not available or native module isn't linked yet
    let deviceModel = 'Unknown Device';
    let osVersion = '';
    let appVersion = '1.0.0';
    let deviceId = '';

    try {
      if (DeviceInfo) {
        // Some methods are synchronous
        if (typeof DeviceInfo.getModel === 'function') deviceModel = DeviceInfo.getModel();
        if (typeof DeviceInfo.getSystemVersion === 'function') osVersion = DeviceInfo.getSystemVersion();
        if (typeof DeviceInfo.getVersion === 'function') appVersion = DeviceInfo.getVersion();
        if (typeof DeviceInfo.getUniqueId === 'function') {
          // getUniqueId may be async in some implementations
          const maybeId = DeviceInfo.getUniqueId();
          deviceId = maybeId && typeof maybeId.then === 'function' ? await maybeId : maybeId;
        }
      }
    } catch (e) {
      // ignore errors reading device info — we will send defaults
      console.warn('Could not read device info:', e);
    }

    // Merge with provided deviceInfo if available
    return {
      deviceToken: provided?.deviceToken || '',
      deviceType,
      deviceModel,
      osVersion,
      appVersion,
      deviceId,
    };
  }
  /** ---------------- LOGIN ---------------- */
  public async login(credentials: LoginRequest): Promise<LoginResponse> {
  store.dispatch(loginStart());

  try {
    const deviceInfo = await this.buildDeviceInfo(credentials.deviceInfo);

    const payload = {
      username: credentials.username,
      password: credentials.password,
      deviceInfo,
    };

    // Try FCM token
    try {
      if (!payload.deviceInfo.deviceToken) {
        const notifModule = await import('./notifications');
        if (typeof notifModule.ensureFcmToken === 'function') {
          const token = await notifModule.ensureFcmToken();
          if (token) payload.deviceInfo.deviceToken = token;
        }
      }
    } catch (e) {
      console.warn('Could not obtain FCM token', e);
    }
    console.log(JSON.stringify(payload))
    const response = await fetch(`${this.baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

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
      store.dispatch(loginFailure(data.message || 'Login failed'));
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
      console.log('Refresh Token Response = ', data)
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
    const url = `${this.adminBaseUrl}/pwdsewa/inspector/stats?${query}`;
    const data = await this.fetchExternalWithRetry(url, { method: 'GET' });
    return data;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An error occurred';
    throw new Error(message);
  }
}

  /** ---------------- TASK REPLIES (EXTERNAL ADMIN PMS API) ---------------- */
  /**
   * Create a reply/comment for a task
   * POST /admin/pms/api/tasks/{taskId}/replies
   */
  public async createTaskReply(taskId: string | number, payload: { comment: string; is_internal?: boolean; comment_type?: string }): Promise<any> {
    try {
      const url = `${this.adminPmsUrl}/tasks/${taskId}/replies`;
      const data = await this.fetchExternalWithRetry(url, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      throw new Error(message);
    }
  }

  /**
   * Upload attachments for a task (multipart/form-data)
   * POST /admin/pms/api/tasks/{taskId}/attachments
   * Form key: attachments (can be appended multiple times)
   */
  public async uploadTaskAttachments(taskId: string | number, formData: FormData): Promise<any> {
    try {
      const url = `${this.adminPmsUrl}/tasks/${taskId}/attachments`;
      const data = await this.fetchExternalWithRetry(url, {
        method: 'POST',
        body: formData,
      });
      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      throw new Error(message);
    }
  }

  /**
   * Review (approve/reject) a task reply
   * PATCH /admin/pms/api/tasks/{taskId}/replies/{replyId}/review
   * Note: endpoint may vary on backend; adjust as required.
   */
  public async reviewTaskReply(replyId: string | number, action: 'APPROVE' | 'REJECT', payload: { remarks?: string } = {}): Promise<any> {
    try {
      const verb = action === 'APPROVE' ? 'approve' : 'reject';
      const url = `${this.adminPmsUrl}/tasks/replies/${replyId}/${verb}`;
      const data = await this.fetchExternalWithRetry(url, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      throw new Error(message);
    }
  }

  /** ---------------- COMPLAINTS LIST (EXTERNAL ADMIN API) ---------------- */
  public async getComplaints(
    stats_filter: string,
    filter: string,
    status: string,
    page: number = 1,
    limit: number = 10,
    search: string = '',
    category_id?: string | number,
    zone_id?: string | number,
    circle_id?: string | number,
    division_id?: string | number,
    department_id?: string | number,
    startDate?: string,
    endDate?: string
  ): Promise<any> {
    try {


      const token = this.getToken();



      if (!token) throw new Error('No authentication token available');

      // Build query parameters
      const queryParams = new URLSearchParams({
        stats_filter,
        filter,
        status,
        page: page.toString(),
        limit: limit.toString(),
        search,
      });

      // Append optional ID filters
      if (category_id !== undefined && category_id !== null && category_id !== '') {
        queryParams.append('category', String(category_id));
      }
      if (zone_id !== undefined && zone_id !== null && zone_id !== '') {
        queryParams.append('zone_id', String(zone_id));
      }
      if (circle_id !== undefined && circle_id !== null && circle_id !== '') {
        queryParams.append('circle_id', String(circle_id));
      }
      if (division_id !== undefined && division_id !== null && division_id !== '') {
        queryParams.append('division_id', String(division_id));
      }
      if (department_id !== undefined && department_id !== null && department_id !== '') {
        queryParams.append('department', String(department_id));
      }
      if (filter === 'custom' && startDate && endDate) {
        queryParams.append('start_date', startDate)
        queryParams.append('end_date',endDate) 
      }
      console.log(queryParams)
      const url = `${this.adminBaseUrl}/pwdsewa/inspector/complaints?${queryParams.toString()}`;
      console.log(url)
      const data = await this.fetchExternalWithRetry(url, { method: 'GET' });
      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      throw new Error(message);
    }
  }


 public async getProjectList(
     department_id?: string | number,
  
    page: number = 1,
    limit: number = 20,
  
  
  ): Promise<any> {
    try {


      const token = this.getToken();
      console.log("toke2122n,",token);
      
      if (!token) throw new Error('No authentication token available');

    

      // Append optional ID filters
    
      const url = `${this.adminPmsUrl}/projects/search?department_id=${department_id}&page=${page}&limit=${limit}`;
      console.log(url)
      const data = await this.fetchExternalWithRetry(url, { method: 'GET' });
      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      throw new Error(message);
    }
  }

  /** ---------------- MY TASKS (EXTERNAL ADMIN PMS API) ---------------- */
  public async getMyTasks(
    page: number = 1,
    limit: number = 20,
    search: string = '',
    filters: { status?: string | string[]; priority?: string; task_type?: string; assigned_to?: string | number; project_id?: string | number } = {}
  ): Promise<any> {
    try {
      const token = this.getToken();
      if (!token) throw new Error('No authentication token available');

      const params = new URLSearchParams({
        my_tasks: 'true',
        page: String(page),
        limit: String(limit),
      });

      if (search && search.trim().length > 0) params.append('search', search.trim());

      // Optional filters
      if (filters) {
        if (filters.status) {
          if (Array.isArray(filters.status)) params.append('status', filters.status.join(','));
          else params.append('status', String(filters.status));
        }
        if (filters.priority) params.append('priority', String(filters.priority));
        if (filters.task_type) params.append('task_type', String(filters.task_type));
        if (filters.assigned_to !== undefined && filters.assigned_to !== null) params.append('assigned_to', String(filters.assigned_to));
        if (filters.project_id !== undefined && filters.project_id !== null) params.append('project_id', String(filters.project_id));
      }

      const url = `${this.adminPmsUrl}/tasks?${params.toString()}`;
      console.log('FetchTask URL==', url)
      const data = await this.fetchExternalWithRetry(url, { method: 'GET' });
      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      throw new Error(message);
    }
  }

  /** ---------------- TASKS ASSIGNED BY ME (EXTERNAL ADMIN PMS API) ---------------- */
  public async getAssignedTasks(
    page: number = 1,
    limit: number = 20,
    search: string = '',
    filters: { status?: string | string[]; priority?: string; task_type?: string; assigned_to?: string | number; project_id?: string | number } = {}
  ): Promise<any> {
    try {
      const token = this.getToken();
      if (!token) throw new Error('No authentication token available');

      const params = new URLSearchParams({
      //  assigned_by_you: 'true',
        page: String(page),
        limit: String(limit),
      });

      if (search && search.trim().length > 0) params.append('search', search.trim());

      // Optional filters
      if (filters) {
        if (filters.status) {
          if (Array.isArray(filters.status)) params.append('status', filters.status.join(','));
          else params.append('status', String(filters.status));
        }
        if (filters.priority) params.append('priority', String(filters.priority));
        if (filters.task_type) params.append('task_type', String(filters.task_type));
        if (filters.assigned_to !== undefined && filters.assigned_to !== null) params.append('assigned_to', String(filters.assigned_to));
        if (filters.project_id !== undefined && filters.project_id !== null) params.append('project_id', String(filters.project_id));
      }

      const url = `${this.adminPmsUrl}/tasks?${params.toString()}`;
      console.log('[ApiManager] getMyTasks url=', url);
      const data = await this.fetchExternalWithRetry(url, { method: 'GET' });
      try {
        // log exact structure and tasks info for debugging
        console.log('[ApiManager] getMyTasks raw:', JSON.stringify(data, null, 2));
        const tasks = data && data.data && data.data.tasks;
        console.log('[ApiManager] getMyTasks tasks-type:', Array.isArray(tasks) ? 'array' : typeof tasks, 'length:', Array.isArray(tasks) ? tasks.length : 'n/a');
        if (Array.isArray(tasks) && tasks.length > 0) {
          console.log('[ApiManager] getMyTasks sampleTask:', JSON.stringify(tasks[0]));
        }
      } catch (e) {
        console.warn('[ApiManager] getMyTasks logging failed', e);
      }
      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      throw new Error(message);
    }
  }

  /** ---------------- TASK DETAILS ---------------- */
  public async getTask(taskId: string | number): Promise<any> {
    try {
      const token = this.getToken();
      if (!token) throw new Error('No authentication token available');

      const url = `${this.adminPmsUrl}/tasks/${taskId}`;
      console.log('[ApiManager] getTask url=', url);
      const data = await this.fetchExternalWithRetry(url, { method: 'GET' });
      try {
        console.log('[ApiManager] getTask raw:', JSON.stringify(data));
      } catch (e) {
        // ignore
      }
      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      throw new Error(message);
    }
  }

  /** ---------------- CREATE TASK (EXTERNAL ADMIN PMS API) ---------------- */
  public async createTask(payload: any): Promise<any> {
    try {
      const token = this.getToken();
      if (!token) throw new Error('No authentication token available');

      const url = `${this.adminPmsUrl}/tasks`;
      console.log('[ApiManager] createTask url=', url);
      const data = await this.fetchExternalWithRetry(url, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      throw new Error(message);
    }
  }

  /**
   * Transfer a task to another user
   * POST /admin/pms/api/tasks/{taskId}/transfer
   */
  public async transferTask(taskId: string | number, payload: { to_user_id: number; transfer_reason?: string }): Promise<any> {
    try {
      const url = `${this.adminPmsUrl}/tasks/${taskId}/transfer`;
      const data = await this.fetchExternalWithRetry(url, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      throw new Error(message);
    }
  }


   public async getProjectDetail(
     projectID: string | number,
  
    endPoint: string
,
  
  
  ): Promise<any> {
    try {


      const token = this.getToken();

      

      if (!token) throw new Error('No authentication token available');

    

      // Append optional ID filters
    
      const url = `${this.adminPmsUrl}/mobile/projects/${projectID}/${endPoint}`;
      console.log(url)
      const data = await this.fetchExternalWithRetry(url, { method: 'GET' });
      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      throw new Error(message);
    }
  }


    public async getFilterDepartmentOption(


  
  
  ): Promise<any> {
    try {


      const token = this.getToken();

      

      if (!token) throw new Error('No authentication token available');

    

      // Append optional ID filters
    
      const url = `${this.adminPmsUrl}/departments`;
      console.log(url)
      const data = await this.fetchExternalWithRetry(url, { method: 'GET' });
      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      throw new Error(message);
    }
  }


   public async getFilterZoneOption(

id: string | number
  
  
  ): Promise<any> {
    try {


      const token = this.getToken();

      

      if (!token) throw new Error('No authentication token available');

    

      // Append optional ID filters
    
      const url = `${this.adminPmsUrl}/departments/${id}/zones`;
      console.log(url)
      const data = await this.fetchExternalWithRetry(url, { method: 'GET' });
      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      throw new Error(message);
    }
  }


  public async getFilterCircleOption(

zoneId: string | number
  
  
  ): Promise<any> {
    try {


      const token = this.getToken();

      

      if (!token) throw new Error('No authentication token available');

    

      // Append optional ID filters
    
      const url = `${this.adminPmsUrl}/zones/${zoneId}/circles`;
      console.log(url)
      const data = await this.fetchExternalWithRetry(url, { method: 'GET' });
      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      throw new Error(message);
    }
  }

    public async getFilterDivisionOption(

circleId: string | number
  
  
  ): Promise<any> {
    try {


      const token = this.getToken();

      

      if (!token) throw new Error('No authentication token available');

    

      // Append optional ID filters
    
      const url = `${this.adminPmsUrl}/circles/${circleId}/divisions`;
      console.log(url)
      const data = await this.fetchExternalWithRetry(url, { method: 'GET' });
      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      throw new Error(message);
    }
  }



      public async getFilterSubDivisionOption(

divisionId: string | number
  
  
  ): Promise<any> {
    try {


      const token = this.getToken();

      

      if (!token) throw new Error('No authentication token available');

    

      // Append optional ID filters
    
      const url = `${this.adminPmsUrl}/divisions/${divisionId}/subdivisions`;
      console.log(url)
      const data = await this.fetchExternalWithRetry(url, { method: 'GET' });
      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      throw new Error(message);
    }
  }


     public async getProjectDetailMedia(
     projectID: string | number,
  
    endPoint: string,
    type: string
,
  
  
  ): Promise<any> {
    try {


      const token = this.getToken();

      

      if (!token) throw new Error('No authentication token available');

    

      // Append optional ID filters
    
      const url = `${this.adminPmsUrl}/mobile/projects/${projectID}/${endPoint}?type=${type}`;
      console.log(url)
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

      const url = `${this.adminBaseUrl}/pwdsewa/inspector/complaints/${complaintId}`;
      const data = await this.fetchExternalWithRetry(url, { method: 'GET' });
      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      throw new Error(message);
    }
  }


    public async getProjectStatsDetails(departmentid: number): Promise<any> {
    try {
      const token = this.getToken();
      if (!token) throw new Error('No authentication token available');

      const url = `${this.adminPmsUrl}/dashboard/kpi?department_id=${departmentid}`;
      const data = await this.fetchExternalWithRetry(url, { method: 'GET' });
      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      throw new Error(message);
    }
  }


    public async getProjectDetails(id: number): Promise<any> {
    try {
      const token = this.getToken();
      if (!token) throw new Error('No authentication token available');

      const url = `${this.adminPmsUrl}/projects/${id}?format=json`;
      const data = await this.fetchExternalWithRetry(url, { method: 'GET' });
      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      throw new Error(message);
    }
  }

  /** ---------------- ASSIGNMENT OPTIONS (EXTERNAL ADMIN API) ---------------- */
  public async getAssignmentOptions(): Promise<any> {
    try {
      const token = this.getToken();
      if (!token) throw new Error('No authentication token available');

      const url = `${this.adminBaseUrl}/pwdsewa/inspector/assignment-options`;
      const data = await this.fetchExternalWithRetry(url, { method: 'GET' });
      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      throw new Error(message);
    }
  }

  /** ---------------- ASSIGN COMPLAINT (EXTERNAL ADMIN API) ---------------- */
  public async assignComplaint(payload: any): Promise<any> {
    try {
      const token = this.getToken();
      if (!token) throw new Error('No authentication token available');

      const url = `${this.adminBaseUrl}/pwdsewa/inspector/assign-complaint`;
      const data = await this.fetchExternalWithRetry(url, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      throw new Error(message);
    }
  }

  /** ---------------- UPDATE COMPLAINT STATUS (EXTERNAL ADMIN API) ---------------- */
  public async updateComplaintStatus(payload: any): Promise<any> {
    try {
      const token = this.getToken();
      if (!token) throw new Error('No authentication token available');

      const url = `${this.adminBaseUrl}/pwdsewa/inspector/update-complaint-status`;
      console.log('ApiManager.updateComplaintStatus: sending payload summary:', {
        complaint_id: payload?.complaint_id,
        user_id: payload?.user_id,
        status: payload?.status,
        attachments_count: Array.isArray(payload?.attachments) ? payload.attachments.length : 0,
      });
      const data = await this.fetchExternalWithRetry(url, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      //console.log('ApiManager.updateComplaintStatus: response', data);
      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      throw new Error(message);
    }
  }

  /** ---------------- LOGOUT ---------------- */
  public async logout(): Promise<any> {
    try {
      // Use fetchWithAuth so Authorization header is sent when token exists
      const response = await this.fetchWithAuth('/auth/logout', { method: 'POST' });
      const data = await response.json();
      // Expecting { success: true, message: 'Logged out successfully' }
      if (!response.ok || (data && data.success === false)) {
        const msg = data?.message || 'Logout failed';
        throw new Error(msg);
      }
      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      throw new Error(message);
    }
  }

  /** ---------------- FETCH ZONES (EXTERNAL ADMIN PMS API) ---------------- */
  public async fetchZones(): Promise<any> {
    try {
      const token = this.getToken();
      if (!token) throw new Error('No authentication token available');

      const url = `${this.adminPmsUrl}/zones`;
      console.log(url)
      const data = await this.fetchExternalWithRetry(url, { method: 'GET' });
      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      throw new Error(message);
    }
  }

  /** ---------------- FETCH CIRCLES BY ZONE ID (EXTERNAL ADMIN PMS API) ---------------- */
  public async fetchCircles(zoneId: number | string): Promise<any> {
    try {
      const token = this.getToken();
      if (!token) throw new Error('No authentication token available');

      const url = `${this.adminPmsUrl}/zones/${zoneId}/circles`;
      console.log(url)
      const data = await this.fetchExternalWithRetry(url, { method: 'GET' });
      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      throw new Error(message);
    }
  }

  /** ---------------- FETCH DIVISIONS BY CIRCLE ID (EXTERNAL ADMIN PMS API) ---------------- */
  public async fetchDivisions(circleId: number | string): Promise<any> {
    try {
      const token = this.getToken();
      if (!token) throw new Error('No authentication token available');

      const url = `${this.adminPmsUrl}/circles/${circleId}/divisions`;
      console.log(url)
      const data = await this.fetchExternalWithRetry(url, { method: 'GET' });
      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      throw new Error(message);
    }
  }
  /** ---------------- FETCH SUBDIVISIONS BY DIVISION ID (EXTERNAL ADMIN PMS API) ---------------- */
  public async fetchSubDivisions(divisionId: number | string): Promise<any> {
    try {
      const token = this.getToken();
      if (!token) throw new Error('No authentication token available');

      const url = `${this.adminPmsUrl}/divisions/${divisionId}/subdivisions`;
      console.log(url)
      const data = await this.fetchExternalWithRetry(url, { method: 'GET' });
      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      throw new Error(message);
    }
  }
  /** ---------------- FETCH USERS BY LOCATION (EXTERNAL ADMIN PMS API) ---------------- */
  /**
   * GET /admin/pms/api/tasks/users-by-location
   * Optional query params: department_id, zone_id, circle_id, division_id
   */
  public async getUsersByLocation(
    department_id?: string | number,
    zone_id?: string | number,
    circle_id?: string | number,
    division_id?: string | number
  ): Promise<any> {
    try {
      const token = this.getToken();
      if (!token) throw new Error('No authentication token available');

      const q = new URLSearchParams();
      if (department_id !== undefined && department_id !== null && String(department_id) !== '') q.append('department_id', String(department_id));
      if (zone_id !== undefined && zone_id !== null && String(zone_id) !== '') q.append('zone_id', String(zone_id));
      if (circle_id !== undefined && circle_id !== null && String(circle_id) !== '') q.append('circle_id', String(circle_id));
      if (division_id !== undefined && division_id !== null && String(division_id) !== '') q.append('division_id', String(division_id));

      const url = `${this.adminPmsUrl}/tasks/users-by-location${q.toString() ? `?${q.toString()}` : ''}`;
      console.log('[ApiManager] getUsersByLocation ->', url);
      const data = await this.fetchExternalWithRetry(url, { method: 'GET' });
      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      throw new Error(message);
    }
  }
  


  /** ---------------- SEARCH PROJECTS (LIGHTWEIGHT) (EXTERNAL ADMIN PMS API) ---------------- */
  public async searchProjectList(search: string = '', page: number = 1, limit: number = 50): Promise<any> {
    try {
      const token = this.getToken();
      if (!token) throw new Error('No authentication token available');

      const q = `search=${encodeURIComponent(search)}&page=${page}&limit=${limit}`;
      const url = `${this.adminPmsUrl}/projects/search-lightweight?${q}`;
      console.log('searchProjectList ->', url);
      const data = await this.fetchExternalWithRetry(url, { method: 'GET' });
      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      throw new Error(message);
    }
  }

  /** ---------------- FETCH FILTERED INSPECTIONS (EXTERNAL ADMIN PMS API) ---------------- */
  public async fetchFilteredInspections(): Promise<any> {
    try {
      const token = this.getToken();
      if (!token) throw new Error('No authentication token available');

      const url = `${this.adminPmsUrl}/tasks/filtered-inspections`;
      console.log('fetchFilteredInspections ->', url);
      const data = await this.fetchExternalWithRetry(url, { method: 'GET' });
      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      throw new Error(message);
    }
  }
}


export default ApiManager;
