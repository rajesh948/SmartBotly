import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../services';

/**
 * User Slice
 * Manages user authentication state in Redux
 */

// Async thunk to validate token and fetch user data
export const validateAndFetchUser = createAsyncThunk(
  'user/validateAndFetch',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/auth/validate');
      return response.data.user;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Authentication failed');
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState: {
    user: null,
    loading: false,
    error: null,
  },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.error = null;
    },
    clearUser: (state) => {
      state.user = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(validateAndFetchUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(validateAndFetchUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(validateAndFetchUser.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.error = action.payload;
      });
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
