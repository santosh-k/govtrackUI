import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import ApiManager from '@/src/services/ApiManager';

export interface Category {
  id: number;
  name: string;
  code?: string;
  description?: string | null;
  is_active?: boolean;
}

interface CategoriesState {
  items: Category[];
  loading: boolean;
  error?: string | null;
}

const initialState: CategoriesState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchCategories = createAsyncThunk('categories/fetch', async (_, thunkAPI) => {
  try {
    const api = ApiManager.getInstance();
    const res = await api.fetchCategories();
    if (res && res.success && Array.isArray(res.data)) {
      return res.data as Category[];
    }
    return [] as Category[];
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err?.message || 'Failed to fetch categories');
  }
});

const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action: PayloadAction<Category[]>) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to fetch categories';
      });
  },
});

export default categoriesSlice.reducer;

export const selectCategories = (state: any) => state.categories?.items || [];
export const selectCategoriesLoading = (state: any) => state.categories?.loading || false;
