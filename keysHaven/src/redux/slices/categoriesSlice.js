import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import categoriesService from '../../services/categories';
import adminService from '../../services/adminService';
import { logout } from './authSlice';

export const fetchFeaturedCategories = createAsyncThunk(
  'categories/featured',
  async ({ page = 0, size = 5, force = false } = {}, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const cached = state.categories?.featured;
      if (!force && Array.isArray(cached) && cached.length > 0) {
        return cached;
      }
      const resp = await categoriesService.getFeaturedCategories(page, size);
      return resp;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const fetchAllCategories = createAsyncThunk(
  'categories/all',
  async ({ force = false } = {}, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const cachedAll = state.categories?.all;
      if (!force && Array.isArray(cachedAll) && cachedAll.length > 0) {
        return cachedAll;
      }
      const resp = await categoriesService.getAllCategories();
      return resp;
    } catch (err) {
      try {
        const r2 = await adminService.getCategories();
        return r2;
      } catch (err2) {
        return rejectWithValue(err2 || err);
      }
    }
  }
);

const initialState = {
  featured: [],
  all: [],
  loading: false,
  error: null
};

const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    setFeatured(state, action) { state.featured = action.payload ?? []; },
    clearCategories(state) {
      state.featured = [];
      state.all = [];
      state.loading = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFeaturedCategories.fulfilled, (s, a) => { s.featured = a.payload?.content ?? a.payload ?? []; })
      .addCase(fetchAllCategories.fulfilled, (s, a) => { s.all = a.payload ?? []; })
      .addCase(logout.fulfilled, (s) => {
        s.featured = [];
        s.all = [];
        s.loading = false;
        s.error = null;
      });
  }
});

export const { setFeatured, clearCategories } = categoriesSlice.actions;
export default categoriesSlice.reducer;

export const selectFeaturedCategories = state => state.categories.featured;
export const selectAllCategories = state => state.categories.all;
