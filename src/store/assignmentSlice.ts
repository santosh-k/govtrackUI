import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

interface Division { id: string; name: string; departmentId?: number }
interface Subdivision { id: string; name: string; divisionId?: number; departmentId?: number }
interface Department { id: string; name: string }
interface Designation { id: string; name: string; departmentId?: number }
interface UserItem { id: string; name: string; designationId?: number; departmentId?: number; divisionId?: number; subdivisionId?: number }

export interface AssignPayload {
  complaintId: number | string;
  user_id?: number | string | null;
  designation_id?: number | string | null;
  department_id?: number | string | null;
  subdivision_id?: number | string | null;
  division_id?: number | string | null;
  comment?: string;
  attachments?: any[];
}

interface AssignmentState {
  loading: boolean;
  error: string | null;
  divisions: Division[];
  subdivisions: Subdivision[];
  departments: Department[];
  designations: Designation[];
  users: UserItem[];
  // new assignment fields
  assignLoading: boolean;
  assignError: string | null;
  lastAssignment: any | null;
}

const initialState: AssignmentState = {
  loading: false,
  error: null,
  divisions: [],
  subdivisions: [],
  departments: [],
  designations: [],
  users: [],
  assignLoading: false,
  assignError: null,
  lastAssignment: null,
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

// thunk to call assign API (dynamic import to avoid circular deps)
export const assignComplaint = createAsyncThunk<
  { message: string; data: any },
  AssignPayload,
  { rejectValue: string }
>('assignment/assignComplaint', async (payload, { rejectWithValue }) => {
  try {
    const ApiManagerModule = await import('@/src/services/ApiManager');
    const ApiManager = ApiManagerModule.default;
    const api = ApiManager.getInstance();
    console.log('call ApiManager.assignComplaint')
    // call ApiManager.assignComplaint (assumes implemented)
    const res = await api.assignComplaint({
      complaint_id: Number(payload.complaintId),
      user_id: payload.user_id ?? undefined,
      designation_id: payload.designation_id ?? undefined,
      department_id: payload.department_id ?? undefined,
      subdivision_id: payload.subdivision_id ?? undefined,
      division_id: payload.division_id ?? undefined,
      comment: payload.comment ?? undefined,
      attachments: payload.attachments ?? [],
    });
    console.log('Assign Response', res)
    if (!res) return rejectWithValue('No response from server');
    if (res.success !== true) {
      const msg = res?.message || res?.error?.message || 'Assign failed';
      return rejectWithValue(msg);
    }

    return { message: res.message || 'Assigned', data: res.data };
  } catch (err: any) {
    return rejectWithValue(err?.message || 'Network error');
  }
});

const assignmentSlice = createSlice({
  name: 'assignment',
  initialState,
  reducers: {
    clearLastAssignment: (state) => { state.lastAssignment = null; }
  },
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

    // new assign handlers
    builder
      .addCase(assignComplaint.pending, (state) => {
        state.assignLoading = true;
        state.assignError = null;
      })
      .addCase(assignComplaint.fulfilled, (state, action) => {
        state.assignLoading = false;
        state.assignError = null;
        state.lastAssignment = action.payload; // { message, data }
      })
      .addCase(assignComplaint.rejected, (state, action) => {
        state.assignLoading = false;
        state.assignError = (action.payload as string) || action.error.message || 'Assign failed';
      });
  },
});

export const { clearLastAssignment } = assignmentSlice.actions;

export default assignmentSlice.reducer;

export const selectAssignment = (state: any) => state.assignment as AssignmentState & { assignLoading: boolean; lastAssignment: any };
