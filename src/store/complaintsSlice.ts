import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from './index';

interface Complaint {
  id: string;
  category: string;
  department: string;
  location: string;
  status: string;
  sla: string;
  createdAt: string;
  hasPhotos?: boolean;
  hasVideos?: boolean;
  hasDocuments?: boolean;
}

interface Pagination {
  page: number;
  pages: number;
  total: number;
  has_next: boolean;
  has_prev: boolean;
}

interface ComplaintsState {
  isLoading: boolean;
  error: string | null;
  complaints: any[];
  pagination: Pagination;
  currentPage: number;
  statusFilter: string;
  searchQuery: string;
}

const initialState: ComplaintsState = {
  isLoading: false,
  error: null,
  complaints: [],
  pagination: {
    page: 1,
    pages: 1,
    total: 0,
    has_next: false,
    has_prev: false,
  },
  currentPage: 1,
  statusFilter: 'open',
  searchQuery: '',
};

export const fetchComplaints = createAsyncThunk(
  'complaints/fetchComplaints',
  async (
    { stats_filter,
      status,
      page = 1,
      limit = 10,
      search = '',
      isInfiniteScroll = false,
    }: {
      stats_filter: string
      status: string;
      page?: number;
      limit?: number;
      search?: string;
      isInfiniteScroll?: boolean;
    },
    { rejectWithValue }
  ) => {
    try {
      // Use dynamic import to avoid circular dependency
      const ApiManager = (await import('@/src/services/ApiManager')).default;
      const response = await ApiManager.getInstance().getComplaints(stats_filter,status, page, limit, search);

      if (response?.success && response?.data) {
        return {
          complaints: response.data.complaints || [],
          pagination: response.data.pagination || {},
          isInfiniteScroll,
        };
      } else {
        return rejectWithValue(response?.message || 'Failed to fetch complaints');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      return rejectWithValue(message);
    }
  }
);

const complaintsSlice = createSlice({
  name: 'complaints',
  initialState,
  reducers: {
    setStatusFilter: (state, action: PayloadAction<string>) => {
      state.statusFilter = action.payload;
      state.currentPage = 1;
      state.complaints = [];
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
      state.currentPage = 1;
      state.complaints = [];
    },
    clearComplaints: (state) => {
      state.complaints = [];
      state.currentPage = 1;
      state.pagination = {
        page: 1,
        pages: 1,
        total: 0,
        has_next: false,
        has_prev: false,
      };
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchComplaints.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchComplaints.fulfilled, (state, action) => {
        state.isLoading = false;
        const { complaints, pagination, isInfiniteScroll } = action.payload as any;

        if (isInfiniteScroll) {
          // Append new complaints for infinite scroll
          state.complaints = [...state.complaints, ...complaints];
        } else {
          // Replace complaints for new filter/search
          state.complaints = complaints;
        }

        state.pagination = pagination;
        state.currentPage = pagination.page || 1;
      })
      .addCase(fetchComplaints.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setStatusFilter, setSearchQuery, clearComplaints } = complaintsSlice.actions;

// Selectors
export const selectComplaints = (state: RootState) => state.complaints.complaints;
export const selectComplaintsLoading = (state: RootState) => state.complaints.isLoading;
export const selectComplaintsError = (state: RootState) => state.complaints.error;
export const selectComplaintsPagination = (state: RootState) => state.complaints.pagination;
export const selectCurrentPage = (state: RootState) => state.complaints.currentPage;
export const selectStatusFilter = (state: RootState) => state.complaints.statusFilter;
export const selectSearchQuery = (state: RootState) => state.complaints.searchQuery;

export default complaintsSlice.reducer;
