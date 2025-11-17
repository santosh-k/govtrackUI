import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

export interface UpdatedByUser {
  id: number | string;
  name: string;
  email: string;
  designation: string;
}

export interface StatusData {
  value: string;
  display: string;
}

export interface UpdateComplaintStatusPayload {
  complaint_id: number | string;
  status: string; // 'in_progress', 'assigned', 'closed', 'reopened'
  comment?: string;
  attachments?: any[];
}

export interface UpdateComplaintStatusResponse {
  complaintId: number | string;
  previousStatus: StatusData;
  newStatus: StatusData;
  comment?: string;
  updatedBy: UpdatedByUser;
  updatedAt: string;
  historyId: number;
}

interface UpdateComplaintState {
  loading: boolean;
  error: string | null;
  lastUpdate: UpdateComplaintStatusResponse | null;
  successMessage: string | null;
}

const initialState: UpdateComplaintState = {
  loading: false,
  error: null,
  lastUpdate: null,
  successMessage: null,
};

// Async thunk to update complaint status
export const updateComplaintStatus = createAsyncThunk<
  { message: string; data: UpdateComplaintStatusResponse },
  UpdateComplaintStatusPayload,
  { rejectValue: string }
>('updateComplaint/updateStatus', async (payload, { rejectWithValue }) => {
  try {
    // Dynamic import to avoid circular dependency
    const ApiManagerModule = await import('@/src/services/ApiManager');
    const ApiManager = ApiManagerModule.default;
    const api = ApiManager.getInstance();

    console.log('Calling updateComplaintStatus API with payload:', payload);

    // Map UI status to API status
    const statusMap: { [key: string]: string } = {
      'In Progress': 'in_progress',
      'Assigned': 'assigned',
      'Closed': 'closed',
      'Reopened': 'reopened',
    };

    const apiStatus = statusMap[payload.status] || payload.status.toLowerCase().replace(/\s+/g, '_');

    const apiPayload = {
      complaint_id: Number(payload.complaint_id),
      status: apiStatus,
      comment: payload.comment ?? undefined,
      attachments: payload.attachments ?? [],
    };

    const res = await api.updateComplaintStatus(apiPayload);
    console.log('Update response:', res);

    if (!res) return rejectWithValue('No response from server');
    if (res.success !== true) {
      const msg = res?.message || res?.error?.message || 'Failed to update complaint status';
      return rejectWithValue(msg);
    }

    return { message: res.message || 'Complaint status updated successfully', data: res.data };
  } catch (err: any) {
    console.error('Update complaint status error:', err);
    return rejectWithValue(err?.message || 'Network error');
  }
});

const updateComplaintSlice = createSlice({
  name: 'updateComplaint',
  initialState,
  reducers: {
    clearUpdateState: (state) => {
      state.error = null;
      state.successMessage = null;
      state.lastUpdate = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(updateComplaintStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateComplaintStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.lastUpdate = action.payload.data;
        state.successMessage = action.payload.message;
      })
      .addCase(updateComplaintStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || action.error.message || 'Failed to update status';
        state.successMessage = null;
      });
  },
});

export const { clearUpdateState } = updateComplaintSlice.actions;

export default updateComplaintSlice.reducer;

// Selectors
export const selectUpdateComplaintLoading = (state: any) => state.updateComplaint.loading;
export const selectUpdateComplaintError = (state: any) => state.updateComplaint.error;
export const selectUpdateComplaintSuccess = (state: any) => state.updateComplaint.successMessage;
export const selectLastUpdate = (state: any) => state.updateComplaint.lastUpdate;
