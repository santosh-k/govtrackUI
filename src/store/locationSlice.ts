import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from './index';
import {
  Zone,
  Circle,
  Division,
  LocationState,
} from '@/src/types/location.types';

const initialState: LocationState = {
  zones: [],
  circles: [],
  divisions: [],
  selectedZoneId: null,
  selectedCircleId: null,
  selectedDivisionId: null,
  isLoadingZones: false,
  isLoadingCircles: false,
  isLoadingDivisions: false,
  error: null,
};

// Async Thunk to fetch zones
export const fetchZones = createAsyncThunk(
  'location/fetchZones',
  async (_, { rejectWithValue }) => {
    try {
      const ApiManager = (await import('@/src/services/ApiManager')).default;
      const response = await ApiManager.getInstance().fetchZones();

      if (response?.success && response?.data) {
        console.log('Zone Fetched')
        console.log(JSON.stringify(response))
        return response.data as Zone[];
      } else {
        return rejectWithValue(response?.message || 'Failed to fetch zones');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      return rejectWithValue(message);
    }
  }
);

// Async Thunk to fetch circles by zone ID
export const fetchCircles = createAsyncThunk(
  'location/fetchCircles',
  async (zoneId: number | string, { rejectWithValue }) => {
    try {
      const ApiManager = (await import('@/src/services/ApiManager')).default;
      const response = await ApiManager.getInstance().fetchCircles(zoneId);

      if (response?.success && response?.data) {
        return response.data as Circle[];
      } else {
        return rejectWithValue(response?.message || 'Failed to fetch circles');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      return rejectWithValue(message);
    }
  }
);

// Async Thunk to fetch divisions by circle ID
export const fetchDivisions = createAsyncThunk(
  'location/fetchDivisions',
  async (circleId: number | string, { rejectWithValue }) => {
    try {
      const ApiManager = (await import('@/src/services/ApiManager')).default;
      const response = await ApiManager.getInstance().fetchDivisions(circleId);

      if (response?.success && response?.data) {
        return response.data as Division[];
      } else {
        return rejectWithValue(response?.message || 'Failed to fetch divisions');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      return rejectWithValue(message);
    }
  }
);

const locationSlice = createSlice({
  name: 'location',
  initialState,
  reducers: {
    setSelectedZone: (state, action: PayloadAction<number | null>) => {
      state.selectedZoneId = action.payload;
      // Clear circles and divisions when zone changes
      state.circles = [];
      state.divisions = [];
      state.selectedCircleId = null;
      state.selectedDivisionId = null;
    },
    setSelectedCircle: (state, action: PayloadAction<number | null>) => {
      state.selectedCircleId = action.payload;
      // Clear divisions when circle changes
      state.divisions = [];
      state.selectedDivisionId = null;
    },
    setSelectedDivision: (state, action: PayloadAction<number | null>) => {
      state.selectedDivisionId = action.payload;
    },
    clearLocation: (state) => {
      state.zones = [];
      state.circles = [];
      state.divisions = [];
      state.selectedZoneId = null;
      state.selectedCircleId = null;
      state.selectedDivisionId = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Handle fetchZones
    builder
      .addCase(fetchZones.pending, (state) => {
        state.isLoadingZones = true;
        state.error = null;
      })
      .addCase(fetchZones.fulfilled, (state, action) => {
        state.isLoadingZones = false;
        state.zones = action.payload;
      })
      .addCase(fetchZones.rejected, (state, action) => {
        state.isLoadingZones = false;
        state.error = action.payload as string;
      });

    // Handle fetchCircles
    builder
      .addCase(fetchCircles.pending, (state) => {
        state.isLoadingCircles = true;
        state.error = null;
      })
      .addCase(fetchCircles.fulfilled, (state, action) => {
        state.isLoadingCircles = false;
        state.circles = action.payload;
      })
      .addCase(fetchCircles.rejected, (state, action) => {
        state.isLoadingCircles = false;
        state.error = action.payload as string;
      });

    // Handle fetchDivisions
    builder
      .addCase(fetchDivisions.pending, (state) => {
        state.isLoadingDivisions = true;
        state.error = null;
      })
      .addCase(fetchDivisions.fulfilled, (state, action) => {
        state.isLoadingDivisions = false;
        state.divisions = action.payload;
      })
      .addCase(fetchDivisions.rejected, (state, action) => {
        state.isLoadingDivisions = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setSelectedZone,
  setSelectedCircle,
  setSelectedDivision,
  clearLocation,
} = locationSlice.actions;

// Selectors
export const selectZones = (state: RootState) => state.location.zones;
export const selectCircles = (state: RootState) => state.location.circles;
export const selectDivisions = (state: RootState) => state.location.divisions;
export const selectSelectedZoneId = (state: RootState) =>
  state.location.selectedZoneId;
export const selectSelectedCircleId = (state: RootState) =>
  state.location.selectedCircleId;
export const selectSelectedDivisionId = (state: RootState) =>
  state.location.selectedDivisionId;
export const selectLocationError = (state: RootState) => state.location.error;
export const selectIsLoadingZones = (state: RootState) =>
  state.location.isLoadingZones;
export const selectIsLoadingCircles = (state: RootState) =>
  state.location.isLoadingCircles;
export const selectIsLoadingDivisions = (state: RootState) =>
  state.location.isLoadingDivisions;

export default locationSlice.reducer;
