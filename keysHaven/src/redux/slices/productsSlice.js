import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import productsService from '../../services/productsService';
import { logout } from './authSlice';
import { createOrder } from './ordersSlice';

function stableStringify(obj) {
  if (!obj || typeof obj !== 'object') return JSON.stringify(obj);
  const keys = Object.keys(obj).sort();
  const result = {};
  for (const k of keys) {
    result[k] = obj[k];
  }
  return JSON.stringify(result);
}

function makeSearchKey({ filters = {}, page = 0, size = 12, sort = 'createdAt_desc', onlyActive = true }) {
  return `${stableStringify(filters)}|p:${page}|s:${size}|sort:${sort}|active:${onlyActive ? 1 : 0}`;
}

export const searchProducts = createAsyncThunk(
  'products/search',
  async ({ filters = {}, page = 0, size = 12, sort = 'createdAt_desc', onlyActive = true, force = false } = {}, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const key = makeSearchKey({ filters, page, size, sort, onlyActive });
      const cached = state.products?.searchPages?.[key];
      if (!force && cached && Array.isArray(cached.content) && cached.content.length > 0) {
        return { key, resp: cached };
      }
      const resp = await productsService.search(filters, page, size, sort, onlyActive);
      return { key, resp };
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const fetchFeaturedProducts = createAsyncThunk(
  'products/featured',
  async (size = 10, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const cached = state.products?.featured;
      if (Array.isArray(cached) && cached.length > 0) return cached;
      const resp = await productsService.getFeaturedProducts(size);
      return resp;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const fetchTopSoldProducts = createAsyncThunk(
  'products/topSold',
  async (size = 4, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const cached = state.products?.topSold;
      if (Array.isArray(cached) && cached.length > 0) return cached;
      const resp = await productsService.getTopSoldProducts(size);
      return resp;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const fetchFilterExtras = createAsyncThunk(
  'products/filterExtras',
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const cached = state.products?.filterExtras;
      if (cached && ((cached.developers && cached.developers.length > 0) || (cached.publishers && cached.publishers.length > 0))) {
        return cached;
      }
      const resp = await productsService.getFilterExtras();
      return resp;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

const initialState = {
  searchResult: { content: [], totalElements: 0, totalPages: 0, number: 0, size: 12 },
  searchPages: {},
  featured: [],
  topSold: [],
  filterExtras: { developers: [], publishers: [] },
  requestId: null,
  loading: false,
  error: null
};

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    upsertProductInList(state, action) {
      const prod = action.payload;
      const idx = state.searchResult.content.findIndex(p => p.id === prod.id);
      if (idx >= 0) state.searchResult.content[idx] = { ...state.searchResult.content[idx], ...prod };
      Object.keys(state.searchPages || {}).forEach(k => {
        const pageResp = state.searchPages[k];
        if (pageResp && Array.isArray(pageResp.content)) {
          pageResp.content = pageResp.content.map(p => p.id === prod.id ? { ...p, ...prod } : p);
          state.searchPages[k] = pageResp;
        }
      });
    },
    clearProductsState(state) {
      state.searchResult = initialState.searchResult;
      state.searchPages = {};
      state.featured = [];
      state.topSold = [];
      state.filterExtras = initialState.filterExtras;
      state.loading = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchProducts.pending, (s, a) => { s.requestId = a.meta.requestId; s.loading = true; s.error = null; })
      .addCase(searchProducts.fulfilled, (s, a) => {
        if (s.requestId !== a.meta.requestId) return;
        s.requestId = null;
        s.loading = false;
        const key = a.payload?.key;
        const resp = a.payload?.resp ?? a.payload;
        if (key) {
          s.searchPages[key] = resp ?? { content: [], totalElements: 0, totalPages: 0, number: 0, size: 12 };
        }
        s.searchResult = resp ?? { content: [], totalElements: 0, totalPages: 0, number: 0, size: 12 };
      })
      .addCase(searchProducts.rejected, (s, a) => { if (s.requestId !== a.meta.requestId) return; s.requestId = null; s.loading = false; s.error = a.payload || a.error; })

      .addCase(fetchFeaturedProducts.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchFeaturedProducts.fulfilled, (s, a) => { s.loading = false; s.featured = a.payload?.content ?? a.payload ?? []; })
      .addCase(fetchFeaturedProducts.rejected, (s, a) => { s.loading = false; s.error = a.payload || a.error; })

      .addCase(fetchTopSoldProducts.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchTopSoldProducts.fulfilled, (s, a) => { s.loading = false; s.topSold = a.payload?.content ?? a.payload ?? []; })
      .addCase(fetchTopSoldProducts.rejected, (s, a) => { s.loading = false; s.error = a.payload || a.error; })

      .addCase(fetchFilterExtras.fulfilled, (s, a) => { s.filterExtras = a.payload ?? { developers: [], publishers: [] }; })

      .addCase(createOrder.fulfilled, (s, a) => {
        const order = a.payload;
        if (!order || !Array.isArray(s.searchResult.content)) return;
        try {
          const items = order.items || [];
          for (const it of items) {
            const pid = Number(it.productId ?? it.productId);
            const qty = Number(it.quantity ?? it.qty ?? 0);
            if (!pid || !qty) continue;
            s.searchResult.content = s.searchResult.content.map(p => {
              if (Number(p.id) !== Number(pid)) return p;
              const next = { ...p };
              if (typeof next.availableStock === 'number') next.availableStock = Math.max(0, next.availableStock - qty);
              if (typeof next.amountSold === 'number') next.amountSold = (next.amountSold || 0) + qty;
              return next;
            });
          }
        } catch { /* Optional refresh failed; the current view remains usable. */ }
      })

      .addCase(logout.fulfilled, (s) => {
        s.searchResult = initialState.searchResult;
        s.searchPages = {};
        s.featured = [];
        s.topSold = [];
        s.filterExtras = initialState.filterExtras;
        s.loading = false;
        s.error = null;
      });
  }
});

export const { upsertProductInList, clearProductsState } = productsSlice.actions;
export default productsSlice.reducer;

export const selectProducts = state => state.products;
export const selectSearchResult = state => state.products.searchResult;
export const selectFeaturedProducts = state => state.products.featured;
export const selectTopSoldProducts = state => state.products.topSold;
export const selectProductsFilterExtras = state => state.products.filterExtras;
export const selectSearchPages = state => state.products.searchPages;
export const makeProductsSearchKey = makeSearchKey;
