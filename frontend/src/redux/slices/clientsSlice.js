import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../services';

// Async thunk to fetch clients
export const fetchClients = createAsyncThunk(
  'clients/fetchClients',
  async (forceRefresh = false, { rejectWithValue, getState }) => {
    const state = getState();
    const { list, lastFetched } = state.clients;

    // Skip if force refresh is false and data is fresh (less than 5 minutes old)
    if (!forceRefresh && list.length > 0 && lastFetched && (Date.now() - lastFetched < 5 * 60 * 1000)) {
      return { skipped: true, data: list };
    }

    try {
      const response = await api.get('/admin/clients');
      return { skipped: false, data: response.data.clients };
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch clients');
    }
  },
  {
    condition: (forceRefresh, { getState }) => {
      const { clients } = getState();
      // Prevent duplicate calls if already loading (handles StrictMode)
      if (clients.loading) {
        return false;
      }
      return true;
    }
  }
);

const clientsSlice = createSlice({
  name: 'clients',
  initialState: {
    list: [],
    selectedClient: null,
    loading: false,
    error: null,
    lastFetched: null,
  },
  reducers: {
    clearClients: (state) => {
      state.list = [];
      state.lastFetched = null;
    },
    setSelectedClient: (state, action) => {
      state.selectedClient = action.payload;
    },
    clearSelectedClient: (state) => {
      state.selectedClient = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchClients.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchClients.fulfilled, (state, action) => {
        state.loading = false;
        // Handle both skipped and fresh data
        if (action.payload.skipped) {
          // Data was skipped, don't update lastFetched
          state.list = action.payload.data;
        } else {
          // Fresh data from API
          state.list = action.payload.data;
          state.lastFetched = Date.now();
        }
      })
      .addCase(fetchClients.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearClients, setSelectedClient, clearSelectedClient } = clientsSlice.actions;
export default clientsSlice.reducer;
