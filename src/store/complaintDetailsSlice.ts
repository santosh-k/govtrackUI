import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from './index';

interface Image {
  id: number;
  imagePath: string;
  imageType: string;
  thumbnail?: string;
  caption: string;
}

interface ReportedBy {
  name: string;
  contactNumber: string | null;
  email: string | null;
  address: string | null;
}

interface AssignedUser {
  id: string | number;
  name: string;
  designation?: string;
  email?: string;
  phone?: string;
}

interface Permissions {
  can_edit: boolean;
  can_assign: boolean;
  can_resolve: boolean;
}

interface StatusOption {
  label: string;
  value: string;
}

interface ComplaintDetail {
  complaintNumber: string;
  status: string;
  statusDisplay: string;
  statusList?: StatusOption[];
  title: string;
  location: string;
  complaintAddress?: string | null;
  latitude: string;
  longitude: string;
  complaintType: string;
  pollNumber?: string | null;
  odeNumber?: string | null;
  constituencyId : string | number | null;
  constituencyName: string | null;
  category: string;
  description: string;
  assignedTo: string | AssignedUser | null;
  priority: number;
  priorityDisplay: string;
  source: string;
  createdAt: string;
  createdAtFormatted: string;
  lastUpdated: string;
  lastUpdatedFormatted: string;
  images: Image[];
  reportedBy: ReportedBy;
  flatNo: string | null;
  assignedDepartment: string | null;
  permissions: Permissions;
  history: History[];
}

interface History{
  id: string | number;
  status: string;
  statusValue: string;
  icon?: string | null;
  date: string;
  time: string;
  timestamp: string;
  actionBy: string | null;
  actionByEmail?: string | null;
  designation: string | null;
  remark: string;
  isPending?: boolean;

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
        console.log(JSON.stringify(response))
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
