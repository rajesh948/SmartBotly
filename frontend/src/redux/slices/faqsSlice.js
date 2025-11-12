import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../services';

/**
 * FAQs Redux Slice
 * Manages FAQ state and async operations
 */

// Async thunk to fetch FAQs
export const fetchFAQs = createAsyncThunk(
  'faqs/fetchFAQs',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (filters.clientId) params.append('clientId', filters.clientId);
      if (filters.category) params.append('category', filters.category);
      if (filters.search) params.append('search', filters.search);

      const response = await api.get(`/faqs?${params.toString()}`);
      return response.data.faqs;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch FAQs');
    }
  }
);

// Async thunk to fetch FAQ categories
export const fetchFAQCategories = createAsyncThunk(
  'faqs/fetchCategories',
  async (clientId = null, { rejectWithValue }) => {
    try {
      const params = clientId ? `?clientId=${clientId}` : '';
      const response = await api.get(`/faqs/categories${params}`);
      return response.data.categories;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch categories');
    }
  }
);

// Async thunk to fetch single FAQ
export const fetchFAQById = createAsyncThunk(
  'faqs/fetchById',
  async (faqId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/faqs/${faqId}`);
      return response.data.faq;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch FAQ');
    }
  }
);

// Async thunk to create FAQ
export const createFAQ = createAsyncThunk(
  'faqs/create',
  async (faqData, { rejectWithValue }) => {
    try {
      const response = await api.post('/faqs', faqData);
      return response.data.faq;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create FAQ');
    }
  }
);

// Async thunk to update FAQ
export const updateFAQ = createAsyncThunk(
  'faqs/update',
  async ({ faqId, faqData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/faqs/${faqId}`, faqData);
      return response.data.faq;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update FAQ');
    }
  }
);

// Async thunk to delete FAQ
export const deleteFAQ = createAsyncThunk(
  'faqs/delete',
  async (faqId, { rejectWithValue }) => {
    try {
      await api.delete(`/faqs/${faqId}`);
      return faqId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete FAQ');
    }
  }
);

const faqsSlice = createSlice({
  name: 'faqs',
  initialState: {
    list: [],
    categories: [],
    selectedFAQ: null,
    loading: false,
    actionLoading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedFAQ: (state) => {
      state.selectedFAQ = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch FAQs
      .addCase(fetchFAQs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFAQs.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchFAQs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch FAQ categories
      .addCase(fetchFAQCategories.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchFAQCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
      })
      .addCase(fetchFAQCategories.rejected, (state, action) => {
        state.error = action.payload;
      })

      // Fetch FAQ by ID
      .addCase(fetchFAQById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFAQById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedFAQ = action.payload;
      })
      .addCase(fetchFAQById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create FAQ
      .addCase(createFAQ.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(createFAQ.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.list.unshift(action.payload);
      })
      .addCase(createFAQ.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      // Update FAQ
      .addCase(updateFAQ.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(updateFAQ.fulfilled, (state, action) => {
        state.actionLoading = false;
        const index = state.list.findIndex((faq) => faq._id === action.payload._id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
      })
      .addCase(updateFAQ.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      // Delete FAQ
      .addCase(deleteFAQ.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(deleteFAQ.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.list = state.list.filter((faq) => faq._id !== action.payload);
      })
      .addCase(deleteFAQ.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearSelectedFAQ } = faqsSlice.actions;
export default faqsSlice.reducer;
