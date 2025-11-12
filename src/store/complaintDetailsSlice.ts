import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from './index';

interface Image {
  id: number;
  imagePath: string;
  imageType: string;
  caption: string;
}

interface ReportedBy {
  name: string;
  contactNumber: string;
  email: string;
  address: string;
}

interface Permissions {
  can_edit: boolean;
  can_assign: boolean;
  can_resolve: boolean;
}

interface ComplaintDetail {
  complaintNumber: string;
  status: string;
  statusDisplay: string;
  title: string;
  location: string;
  latitude: string;
  longitude: string;
  complaintType: string;
  pollNumber: string;
  category: string;
  description: string;
  assignedTo: string | null;
  priority: number;
  priorityDisplay: string;
  source: string;
  createdAt: string;
  createdAtFormatted: string;
  lastUpdated: string;
  lastUpdatedFormatted: string;
  images: Image[];
  reportedBy: ReportedBy;
  flatNo: string;
  assignedDepartment: string | null;
  permissions: Permissions;
}

interface ComplaintDetailsState {
  isLoading: boolean;
  error: string | null;
  data: ComplaintDetail | null;
  complaintId: string | null;
}

const initialState: ComplaintDetailsState = {
  isLoading: false,
  error: null,
  data: null,
  complaintId: null,
};

export const fetchComplaintDetails = createAsyncThunk(
  'complaintDetails/fetchComplaintDetails',
  async (complaintId: string, { rejectWithValue }) => {
    try {
      // Use dynamic import to avoid circular dependency
      const ApiManager = (await import('@/src/services/ApiManager')).default;
      const response = await ApiManager.getInstance().getComplaintDetails(complaintId);

      if (response?.success && response?.data) {
        return response.data;
      } else {
        return rejectWithValue(response?.message || 'Failed to fetch complaint details');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      return rejectWithValue(message);
    }
  }
);

const complaintDetailsSlice = createSlice({
  name: 'complaintDetails',
  initialState,
  reducers: {
    clearComplaintDetails: (state) => {
      state.data = null;
      state.complaintId = null;
      state.error = null;
      state.isLoading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchComplaintDetails.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchComplaintDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload as ComplaintDetail;
      })
      .addCase(fetchComplaintDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearComplaintDetails } = complaintDetailsSlice.actions;

// Selectors
export const selectComplaintDetails = (state: RootState) => state.complaintDetails.data;
export const selectComplaintDetailsLoading = (state: RootState) => state.complaintDetails.isLoading;
export const selectComplaintDetailsError = (state: RootState) => state.complaintDetails.error;

export default complaintDetailsSlice.reducer;
