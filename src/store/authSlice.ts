import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../types/auth.types';

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  token: null,
  refreshToken: null,
  user: null,
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    /** ---------------- LOGIN ---------------- */
    loginStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },

    loginSuccess: (
      state,
      action: PayloadAction<{ token: string; refreshToken: string; user: User }>
    ) => {
      state.isLoading = false;
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
      state.user = action.payload.user;
      state.error = null;
    },

    loginFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    /** ---------------- LOGOUT ---------------- */
    logout: (state) => {
      state.token = null;
      state.refreshToken = null;
      state.user = null;
      state.isLoading = false;
      state.error = null;
    },

    /** ---------------- UPDATE USER (MERGE FIELDS) ---------------- */
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        // Merge updated fields safely without losing other user data
        state.user = { ...state.user, ...action.payload };
      }
    },

    /** ---------------- REFRESH TOKEN ---------------- */
    refreshTokenStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },

    refreshTokenSuccess: (
      state,
      action: PayloadAction<{ token: string; expiresIn: number }>
    ) => {
      state.isLoading = false;
      state.token = action.payload.token;
      state.error = null;
    },

    refreshTokenFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  updateUser,
  refreshTokenStart,
  refreshTokenSuccess,
  refreshTokenFailure,
} = authSlice.actions;

export default authSlice.reducer;
