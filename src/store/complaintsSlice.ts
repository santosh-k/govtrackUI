import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from './index';
import { 
  Complaint, 
  Pagination, 
  FilterOptions, 
  CurrentFilters,
  ComplaintsState as ComplaintsStateType 
} from '@/src/types/complaints.types';

// Use the interface type but ensure it extends properly
interface ComplaintsState extends ComplaintsStateType {}

const initialState: ComplaintsState = {
  isLoading: false,
  error: null,
  complaints: [],
  pagination: {
    page: 1,
    limit: 10,
    pages: 1,
    total: 0,
    has_next: false,
    has_prev: false,
  },
  filterOptions: null,
  currentFilters: null,
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
      category_id,
      zone_id,
      department_id,
    }: {
      stats_filter: string
      status: string;
      page?: number;
      limit?: number;
      search?: string;
      isInfiniteScroll?: boolean;
      category_id?: string | number | null;
      zone_id?: string | number | null;
      department_id?: string | number | null;
    },
    { rejectWithValue }
  ) => {
    try {
      // Use dynamic import to avoid circular dependency
      const ApiManager = (await import('@/src/services/ApiManager')).default;
      const response = await ApiManager.getInstance().getComplaints(
        stats_filter,
        status,
        page,
        limit,
        search,
        category_id ?? undefined,
        zone_id ?? undefined,
        department_id ?? undefined,
      );
      console.log('Complaint List API Response:', response);
      if (response?.success && response?.data) {
        return {
          complaints: response.data.complaints || [],
          pagination: response.data.pagination || {},
          filterOptions: response.data.filter_options || null,
          filters: response.data.filters || null,
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
        limit: 10,
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
        
        // Store filter options from API response if available
        if (action.payload.filterOptions) {
          state.filterOptions = action.payload.filterOptions;
        }
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
export const selectFilterOptions = (state: RootState) => state.complaints.filterOptions;

export default complaintsSlice.reducer;
