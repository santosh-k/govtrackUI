import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SelectionPayload {
  field: string;
  item: any;
  complaintId?: string;
}

interface SelectionState {
  byField: Record<string, any>;
}

const initialState: SelectionState = {
  byField: {},
};

const selectionSlice = createSlice({
  name: 'selection',
  initialState,
  reducers: {
    setSelection: (state, action: PayloadAction<SelectionPayload>) => {
      const { field, item, complaintId } = action.payload;
      state.byField[field] = { item, complaintId };
    },
    clearSelection: (state, action: PayloadAction<{ field: string }>) => {
      const { field } = action.payload;
      delete state.byField[field];
    },
  },
});

export const { setSelection, clearSelection } = selectionSlice.actions;

export const selectSelections = (state: any) => state.selection.byField as Record<string, any>;

export default selectionSlice.reducer;
