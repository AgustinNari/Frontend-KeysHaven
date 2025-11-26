import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import discountsService from '../../services/discountsService';
import sellerService from '../../services/sellerService';
import adminService from '../../services/adminService';
import { logout } from './authSlice';

export const fetchActiveCouponsByBuyer = createAsyncThunk(
  'discounts/fetchActiveBuyer',
  async ({ page = 0, size = 200, force = false } = {}, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const cached = state.discounts?.myCoupons;
      if (!force && Array.isArray(cached) && cached.length > 0 && page === 0) {
        return { content: cached };
      }
      const resp = await discountsService.getActiveCouponsByBuyer(page, size);
      return resp;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const validateCouponForOrderItem = createAsyncThunk(
  'discounts/validateForItem',
  async ({ code, item }, { rejectWithValue }) => {
    try {
      const resp = await discountsService.validateCouponForOrderItem(code, item);
      return resp;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);


export const fetchSellerDiscounts = createAsyncThunk(
  'discounts/sellerFetch',
  async ({ page = 0, size = 10, force = false } = {}, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const key = `${page}_${size}`;
      const cached = state.discounts?.sellerDiscountsPages?.[key];
      if (!force && cached) {
        return { key, resp: cached };
      }
      const resp = await sellerService.getSellerDiscounts(page, size);
      return { key, resp };
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const fetchAdminDiscountsPage = createAsyncThunk(
  'discounts/adminPage',
  async ({ page = 1, size = 10, force = false } = {}, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const cached = state.discounts?.adminPage;
      if (!force && cached && Array.isArray(cached.content) && cached.content.length > 0 && page === 1) {
        return cached;
      }
      const resp = await adminService.getDiscountsPage(page, size);
      return resp;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

const initialState = {
  myCoupons: [],
  validationResult: null,
  sellerDiscounts: { items: [], total: 0 },
  sellerDiscountsPages: {},
  adminPage: null,
  loading: false,
  error: null
};

const discountsSlice = createSlice({
  name: 'discounts',
  initialState,
  reducers: {
    clearDiscountsState(state) {
      state.myCoupons = [];
      state.validationResult = null;
      state.sellerDiscounts = { items: [], total: 0 };
      state.sellerDiscountsPages = {};
      state.adminPage = null;
      state.loading = false;
      state.error = null;
    },


    setSellerDiscountsFromCache(state, action) {
      const key = action.payload;
      if (!key) return;
      const resp = state.sellerDiscountsPages?.[key];
      if (!resp) return;
      const items = resp.items ?? resp.content ?? (Array.isArray(resp) ? resp : []);
      const total = resp.total ?? resp.totalElements ?? (Array.isArray(resp) ? items.length : 0);
      state.sellerDiscounts = { items, total };
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchActiveCouponsByBuyer.fulfilled, (s, a) => {
        const payload = a.payload;
        if (payload && payload.content) s.myCoupons = payload.content;
        else if (Array.isArray(payload)) s.myCoupons = payload;
        else s.myCoupons = payload ?? [];
      })

      .addCase(validateCouponForOrderItem.fulfilled, (s, a) => {
        s.validationResult = a.payload;
      })

      .addCase(fetchSellerDiscounts.fulfilled, (s, a) => {
        const key = a.payload?.key;
        const resp = a.payload?.resp ?? a.payload;
        if (key) {
          s.sellerDiscountsPages = { ...(s.sellerDiscountsPages || {}), [key]: resp ?? { items: [], total: 0 } };
        }
        const items = resp?.items ?? resp?.content ?? (Array.isArray(resp) ? resp : []);
        const total = resp?.total ?? resp?.totalElements ?? (Array.isArray(resp) ? items.length : 0);
        s.sellerDiscounts = { items, total };
      })

      .addCase(fetchAdminDiscountsPage.fulfilled, (s, a) => {
        s.adminPage = a.payload;
      })

      .addCase(logout.fulfilled, (s) => {
        s.myCoupons = [];
        s.validationResult = null;
        s.sellerDiscounts = { items: [], total: 0 };
        s.sellerDiscountsPages = {};
        s.adminPage = null;
        s.loading = false;
        s.error = null;
      });
  }
});

export const { clearDiscountsState, setSellerDiscountsFromCache } = discountsSlice.actions;
export default discountsSlice.reducer;
