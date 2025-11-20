import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { StatsData } from '@/src/types/stats.types';

interface StatsState {
  isLoading: boolean;
  error: string | null;
  data: StatsData | null;
  filter: string | null;
}

const initialState: StatsState = {
  isLoading: false,
  error: null,
  data: null,
  filter: null,
};

export const fetchStats = createAsyncThunk(
  'stats/fetch',
  async (
    params: {
      filter: string;
      startDate?: string;
      endDate?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      console.log('fetchStats thunk - params:', params);
      // Dynamic import to avoid circular dependency
      const { default: ApiManager } = await import('@/src/services/ApiManager');
      const response = await ApiManager.getInstance().getStats(
        params.filter,
        params.startDate,
        params.endDate
      );
      console.log('fetchStats thunk - response:', response);
      console.log('fetchStats thunk - response.data:', response.data);
      // Expecting shape { success: true, data: { ... } }
      return response.data;
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to fetch stats';
      console.error('fetchStats thunk - error:', msg);
      return rejectWithValue(msg);
    }
  }
);

const statsSlice = createSlice({
  name: 'stats',
  initialState,
  reducers: {
    setFilter: (state, action: PayloadAction<string>) => {
      state.filter = action.payload;
    },
    clearStats: (state) => {
      state.data = null;
      state.error = null;
      state.isLoading = false;
      state.filter = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchStats.fulfilled, (state, action: PayloadAction<StatsData>) => {
        state.isLoading = false;
        console.log('statsSlice - fulfilled action.payload:', action.payload);
        console.log('statsSlice - complaint_summary:', action.payload.complaint_summary);
        state.data = action.payload;
        state.error = null;
      })
      .addCase(fetchStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) || action.error.message || 'Failed to fetch stats';
      });
  },
});

export const { setFilter, clearStats } = statsSlice.actions;

export default statsSlice.reducer;
