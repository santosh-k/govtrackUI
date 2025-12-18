import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from './index';

interface TaskDetailsState {
  isLoading: boolean;
  error: string | null;
  data: any | null;
}

const initialState: TaskDetailsState = {
  isLoading: false,
  error: null,
  data: null,
};

export const fetchTaskDetails = createAsyncThunk(
  'taskDetails/fetchTaskDetails',
  async (taskId: string, { rejectWithValue }) => {
    try {
      const ApiManager = (await import('@/src/services/ApiManager')).default;
      const response = await ApiManager.getInstance().getTask(String(taskId));

      if (response?.success && response?.data) {
        console.log('[taskDetails] fetchTaskDetails raw:', JSON.stringify(response));
        return response.data;
      }

      return rejectWithValue(response?.message || 'Failed to fetch task details');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      return rejectWithValue(message);
    }
  }
);

const taskDetailsSlice = createSlice({
  name: 'taskDetails',
  initialState,
  reducers: {
    clearTaskDetails: (state) => {
      state.data = null;
      state.error = null;
      state.isLoading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTaskDetails.pending, (state) => {
        state.error = null;
        state.isLoading = true;
      })
      .addCase(fetchTaskDetails.fulfilled, (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        state.data = action.payload;
      })
      .addCase(fetchTaskDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string || (action.error && action.error.message) || 'Failed to fetch task details';
      });
  },
});

export const { clearTaskDetails } = taskDetailsSlice.actions;

export const selectTaskDetails = (state: RootState) => state.taskDetails.data;
export const selectTaskDetailsLoading = (state: RootState) => state.taskDetails.isLoading;
export const selectTaskDetailsError = (state: RootState) => state.taskDetails.error;

export default taskDetailsSlice.reducer;
