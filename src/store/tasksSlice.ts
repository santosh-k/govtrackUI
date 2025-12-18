import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from './index';

export interface AssignedUser {
  id: number | string;
  first_name?: string;
  last_name?: string;
  username?: string;
}

export interface ProjectBrief {
  id: number | string;
  project_id?: string;
  project_name?: string;
}

export interface TaskItem {
  id: string;
  task_code: string;
  title: string;
  description?: string;
  task_type?: string;
  status?: string;
  priority?: string;
  assignedUser?: AssignedUser | null;
  creator?: any;
  project?: ProjectBrief | null;
  start_date?: string | null;
  due_date?: string | null;
  completed_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface TasksState {
  isLoading: boolean;
  isFetchingMore: boolean;
  isRefreshing: boolean;
  error: string | null;
  items: TaskItem[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  // Assigned by me tasks
  assignedIsLoading: boolean;
  assignedIsFetchingMore: boolean;
  assignedIsRefreshing: boolean;
  assignedError: string | null;
  assignedItems: TaskItem[];
  assignedPage: number;
  assignedLimit: number;
  assignedTotal: number;
  assignedTotalPages: number;
}

const initialState: TasksState = {
  isLoading: false,
  isFetchingMore: false,
  isRefreshing: false,
  error: null,
  items: [],
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0,
  assignedIsLoading: false,
  assignedIsFetchingMore: false,
  assignedIsRefreshing: false,
  assignedError: null,
  assignedItems: [],
  assignedPage: 1,
  assignedLimit: 20,
  assignedTotal: 0,
  assignedTotalPages: 0,
};

export const fetchMyTasks = createAsyncThunk(
  'tasks/fetchMyTasks',
  async (
    params: { page?: number; limit?: number; search?: string; refresh?: boolean; status?: string | string[]; priority?: string; task_type?: string; assigned_to?: string | number; project_id?: string | number } = {},
    { rejectWithValue }
  ) => {
    try {
      const ApiManager = (await import('@/src/services/ApiManager')).default;
      const page = params.page ?? 1;
      const limit = params.limit ?? 20;
      const response = await ApiManager.getInstance().getMyTasks(page, limit, params.search || '', {
        status: params.status,
        priority: params.priority,
        task_type: params.task_type,
        assigned_to: params.assigned_to,
        project_id: params.project_id,
      });

      if (response?.success && response?.data) {
        try {
          console.log("MyTask Response==", JSON.stringify(response));
          const tasks = response.data.tasks;
          console.log('fetchMyTasks: tasks-type:', Array.isArray(tasks) ? 'array' : typeof tasks, 'length:', Array.isArray(tasks) ? tasks.length : 'n/a');
          if (Array.isArray(tasks) && tasks.length > 0) console.log('fetchMyTasks sample task:', JSON.stringify(tasks[0]));
        } catch (e) {
          console.warn('fetchMyTasks logging failed', e);
        }

        return {
          tasks: response.data.tasks || [],
          pagination: response.data.pagination || { total: 0, page, limit, totalPages: 0 },
          page,
          limit,
          refresh: !!params.refresh,
        };
      } else {
        return rejectWithValue(response?.message || 'Failed to fetch tasks');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      return rejectWithValue(message);
    }
  }
);

export const fetchAssignedTasks = createAsyncThunk(
  'tasks/fetchAssignedTasks',
  async (
    params: { page?: number; limit?: number; search?: string; refresh?: boolean; status?: string | string[]; priority?: string; task_type?: string; assigned_to?: string | number; project_id?: string | number } = {},
    { rejectWithValue }
  ) => {
    try {
      const ApiManager = (await import('@/src/services/ApiManager')).default;
      const page = params.page ?? 1;
      const limit = params.limit ?? 20;
      const response = await ApiManager.getInstance().getAssignedTasks(page, limit, params.search || '', {
        status: params.status,
        priority: params.priority,
        task_type: params.task_type,
        assigned_to: params.assigned_to,
        project_id: params.project_id,
      });

      if (response?.success && response?.data) {
        return {
          tasks: response.data.tasks || [],
          pagination: response.data.pagination || { total: 0, page, limit, totalPages: 0 },
          page,
          limit,
          refresh: !!params.refresh,
        };
      } else {
        return rejectWithValue(response?.message || 'Failed to fetch assigned tasks');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      return rejectWithValue(message);
    }
  }
);

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    clearTasks: (state) => {
      state.items = [];
      state.page = 1;
      state.total = 0;
      state.totalPages = 0;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyTasks.pending, (state, action) => {
        const arg = action.meta.arg || {};
        state.error = null;
        if (arg.page && arg.page > 1) {
          state.isFetchingMore = true;
        } else if (arg.refresh) {
          state.isRefreshing = true;
        } else {
          state.isLoading = true;
        }
      })
      .addCase(fetchMyTasks.fulfilled, (state, action: PayloadAction<any>) => {
        const { tasks, pagination, page, limit, refresh } = action.payload;
        state.isLoading = false;
        state.isFetchingMore = false;
        state.isRefreshing = false;
        state.page = page;
        state.limit = limit;
        state.total = pagination.total || 0;
        state.totalPages = pagination.totalPages || 0;

        if (page === 1) {
          state.items = tasks;
        } else {
          state.items = [...state.items, ...tasks];
        }
      })
      .addCase(fetchMyTasks.rejected, (state, action) => {
        state.isLoading = false;
        state.isFetchingMore = false;
        state.isRefreshing = false;
        state.error = action.payload as string || (action.error && action.error.message) || 'Failed to fetch tasks';
      })
      // Assigned tasks
      .addCase(fetchAssignedTasks.pending, (state, action) => {
        const arg = action.meta.arg || {};
        state.assignedError = null;
        if (arg.page && arg.page > 1) {
          state.assignedIsFetchingMore = true;
        } else if (arg.refresh) {
          state.assignedIsRefreshing = true;
        } else {
          state.assignedIsLoading = true;
        }
      })
      .addCase(fetchAssignedTasks.fulfilled, (state, action: PayloadAction<any>) => {
        const { tasks, pagination, page, limit, refresh } = action.payload;
        state.assignedIsLoading = false;
        state.assignedIsFetchingMore = false;
        state.assignedIsRefreshing = false;
        state.assignedPage = page;
        state.assignedLimit = limit;
        state.assignedTotal = pagination.total || 0;
        state.assignedTotalPages = pagination.totalPages || 0;

        if (page === 1) {
          state.assignedItems = tasks;
        } else {
          state.assignedItems = [...state.assignedItems, ...tasks];
        }
      })
      .addCase(fetchAssignedTasks.rejected, (state, action) => {
        state.assignedIsLoading = false;
        state.assignedIsFetchingMore = false;
        state.assignedIsRefreshing = false;
        state.assignedError = action.payload as string || (action.error && action.error.message) || 'Failed to fetch assigned tasks';
      });
  },
});

export const { clearTasks } = tasksSlice.actions;

// Selectors
export const selectTasks = (state: RootState) => state.tasks.items;
export const selectTasksLoading = (state: RootState) => state.tasks.isLoading;
export const selectTasksFetchingMore = (state: RootState) => state.tasks.isFetchingMore;
export const selectTasksRefreshing = (state: RootState) => state.tasks.isRefreshing;
export const selectTasksError = (state: RootState) => state.tasks.error;
export const selectTasksPage = (state: RootState) => state.tasks.page;
export const selectTasksHasMore = (state: RootState) => state.tasks.page < state.tasks.totalPages;

// Assigned tasks selectors
export const selectAssignedTasks = (state: RootState) => state.tasks.assignedItems;
export const selectAssignedTasksLoading = (state: RootState) => state.tasks.assignedIsLoading;
export const selectAssignedTasksFetchingMore = (state: RootState) => state.tasks.assignedIsFetchingMore;
export const selectAssignedTasksRefreshing = (state: RootState) => state.tasks.assignedIsRefreshing;
export const selectAssignedTasksPage = (state: RootState) => state.tasks.assignedPage;
export const selectAssignedTasksHasMore = (state: RootState) => state.tasks.assignedPage < state.tasks.assignedTotalPages;

export default tasksSlice.reducer;
