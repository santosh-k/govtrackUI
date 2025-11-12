import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import ApiManager from '@/src/services/ApiManager';
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

export const fetchStats = createAsyncThunk('stats/fetch', async (filter: string, { rejectWithValue }) => {
  try {
    const response = await ApiManager.getInstance().getStats(filter);
    // Expecting shape { success: true, data: { ... } }
    return response.data;
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Failed to fetch stats';
    return rejectWithValue(msg);
  }
});

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
