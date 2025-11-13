import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

interface Division { id: string; name: string; departmentId?: number }
interface Subdivision { id: string; name: string; divisionId?: number; departmentId?: number }
interface Department { id: string; name: string }
interface Designation { id: string; name: string; departmentId?: number }
interface UserItem { id: string; name: string; designationId?: number; departmentId?: number; divisionId?: number; subdivisionId?: number }

interface AssignmentState {
  loading: boolean;
  error: string | null;
  divisions: Division[];
  subdivisions: Subdivision[];
  departments: Department[];
  designations: Designation[];
  users: UserItem[];
}

const initialState: AssignmentState = {
  loading: false,
  error: null,
  divisions: [],
  subdivisions: [],
  departments: [],
  designations: [],
  users: [],
};

export const fetchAssignmentOptions = createAsyncThunk('assignment/fetchOptions', async (_, { rejectWithValue }) => {
  try {
    // dynamic import to avoid circular dependency between store and ApiManager
    const ApiManagerModule = await import('@/src/services/ApiManager');
    const ApiManager = ApiManagerModule.default;
    const api = ApiManager.getInstance();
    const res = await api.getAssignmentOptions();
    return res;
  } catch (err: any) {
    return rejectWithValue(err?.message || 'Failed to fetch assignment options');
  }
});

const assignmentSlice = createSlice({
  name: 'assignment',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchAssignmentOptions.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchAssignmentOptions.fulfilled, (state, action: PayloadAction<any>) => {
      state.loading = false;
      const payload = action.payload;
      if (payload && payload.success && payload.data) {
        state.divisions = (payload.data.divisions || []).map((d: any) => ({ id: String(d.id), name: d.name, departmentId: d.departmentId }));
        state.subdivisions = (payload.data.subdivisions || []).map((s: any) => ({ id: String(s.id), name: s.name, divisionId: s.divisionId, departmentId: s.departmentId }));
        state.departments = (payload.data.departments || []).map((d: any) => ({ id: String(d.id), name: d.name }));
        state.designations = (payload.data.designations || []).map((d: any) => ({ id: String(d.id), name: d.name, departmentId: d.departmentId }));
        state.users = (payload.data.users || []).map((u: any) => ({ id: String(u.id), name: u.name, designationId: u.designationId, departmentId: u.departmentId, divisionId: u.divisionId, subdivisionId: u.subdivisionId }));
      }
    });
    builder.addCase(fetchAssignmentOptions.rejected, (state, action) => {
      state.loading = false;
      state.error = (action.payload as string) || action.error.message || 'Failed to fetch assignment options';
    });
  },
});

export default assignmentSlice.reducer;

export const selectAssignment = (state: any) => state.assignment as AssignmentState;
