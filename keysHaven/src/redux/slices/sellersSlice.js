import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import sellersService from '../../services/sellers';
import sellerService from '../../services/sellerService';
import { logout } from './authSlice';
import { createOrder } from './ordersSlice';

export const fetchSellerActiveProductsForDetail = createAsyncThunk(
  'sellers/fetchActiveProductsForDetail',
  async (sellerId, { rejectWithValue }) => {
    try {
      const resp = await sellerService.getSellerActiveProductsForDetail(sellerId);
      return { sellerId, products: resp ?? [] };
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const fetchSellerDetail = createAsyncThunk(
  'sellers/fetchDetail',
  async (sellerId, { rejectWithValue }) => {
    try {
      const resp = await sellersService.getSellerDetail(sellerId);
      return resp;
    } catch (err) {
      try {
        const r2 = await sellerService.getUserById(sellerId);
        return r2;
      } catch (err2) {
        return rejectWithValue(err2 || err);
      }
    }
  }
);

export const fetchTopSellers = createAsyncThunk(
  'sellers/top',
  async (size = 4, { rejectWithValue }) => {
    try {
      const resp = await sellersService.getTopSellers(size);
      return resp;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

const initialState = {
  detail: null,
  detailProducts: [],
  topSellers: [],
  loading: false,
  error: null,
  needsRefresh: false
};

const sellersSlice = createSlice({
  name: 'sellers',
  initialState,
  reducers: {
    clearSellers(state) {
      state.detail = null;
      state.detailProducts = [];
      state.topSellers = [];
      state.loading = false;
      state.error = null;
      state.needsRefresh = false;
    },
    upsertSellerDetail(state, action) {
      state.detail = { ...(state.detail || {}), ...(action.payload || {}) };
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSellerDetail.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchSellerDetail.fulfilled, (s, a) => { s.loading = false; s.detail = a.payload; s.needsRefresh = false; })
      .addCase(fetchSellerDetail.rejected, (s, a) => { s.loading = false; s.error = a.payload || a.error; })

      .addCase(fetchSellerActiveProductsForDetail.pending, (s) => { })
      .addCase(fetchSellerActiveProductsForDetail.fulfilled, (s, a) => {
        s.detailProducts = a.payload?.products ?? [];
      })
      .addCase(fetchSellerActiveProductsForDetail.rejected, (s, a) => {
        s.detailProducts = [];
        s.needsRefresh = true;
      })

      .addCase(fetchTopSellers.fulfilled, (s, a) => { s.topSellers = a.payload?.content ?? a.payload ?? []; })

      .addCase(createOrder.fulfilled, (s, a) => {
        const order = a.payload;
        if (!order || !s.detail) return;
        try {
          const items = order.items || [];
          let deltaSold = 0;
          for (const it of items) {
            if (Number(it.sellerId) === Number(s.detail.id)) {
              deltaSold += Number(it.quantity ?? it.qty ?? 0);
            } else if (it.product && (it.product.sellerId ?? it.product.seller?.id) === s.detail.id) {
              deltaSold += Number(it.quantity ?? it.qty ?? 0);
            }
          }
          if (deltaSold > 0) {
            s.detail.amountSold = (s.detail.amountSold ?? 0) + deltaSold;
            s.detail.soldKeys = (s.detail.soldKeys ?? 0) + deltaSold;
          }
        } catch (err) {
          s.needsRefresh = true;
        }
      })

      .addCase(logout.fulfilled, (s) => {
        s.detail = null;
        s.detailProducts = [];
        s.topSellers = [];
        s.loading = false;
        s.error = null;
        s.needsRefresh = false;
      })

      .addMatcher(
        (action) => action.type.startsWith('reviews/') && action.type.endsWith('/fulfilled'),
        (s, a) => {
          const payload = a.payload;
          if (!payload || !s.detail) {
            s.needsRefresh = true;
            return;
          }
          const sellerId = payload.sellerId ?? payload.productSellerId ?? payload.product?.sellerId ?? payload.product?.seller?.id ?? payload.seller?.id ?? null;
          if (!sellerId) {
            s.needsRefresh = true;
            return;
          }
          if (Number(sellerId) !== Number(s.detail.id)) return;
          const type = a.type;
          if (type.includes('/createReview/fulfilled')) {
            const newRating = Number(payload.rating ?? NaN);
            if (!Number.isNaN(newRating)) {
              const prevCount = Number(s.detail.ratingCount ?? 0);
              const prevAvg = Number(s.detail.avgRating ?? 0);
              const newCount = prevCount + 1;
              const newAvg = ((prevAvg * prevCount) + newRating) / newCount;
              s.detail.ratingCount = newCount;
              s.detail.avgRating = Math.round(newAvg * 10) / 10;
            } else {
              s.needsRefresh = true;
            }
          } else if (type.includes('/updateReview/fulfilled')) {
            s.needsRefresh = true;
          } else if (type.includes('/deleteReview/fulfilled')) {
            const deletedRating = Number(payload.rating ?? NaN);
            if (!Number.isNaN(deletedRating) && (s.detail.ratingCount ?? 0) > 0) {
              const prevCount = Number(s.detail.ratingCount ?? 0);
              const prevAvg = Number(s.detail.avgRating ?? 0);
              const newCount = Math.max(0, prevCount - 1);
              if (newCount === 0) {
                s.detail.avgRating = 0;
                s.detail.ratingCount = 0;
              } else {
                const newAvg = ((prevAvg * prevCount) - deletedRating) / newCount;
                s.detail.avgRating = Math.round(newAvg * 10) / 10;
                s.detail.ratingCount = newCount;
              }
            } else {
              s.needsRefresh = true;
            }
          }
        }
      );
  }
});

export const { clearSellers, upsertSellerDetail } = sellersSlice.actions;
export default sellersSlice.reducer;

export const selectSellerDetail = state => state.sellers?.detail ?? null;
export const selectSellerDetailProducts = state => state.sellers?.detailProducts ?? [];
export const selectTopSellers = state => state.sellers?.topSellers ?? [];
