import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import reviewsService from '../../services/reviews';
import { logout } from './authSlice';

function normalizeError(err) {
  try {
    if (!err) return { message: 'Error desconocido' };
    if (typeof err === 'object' && !(err instanceof Error)) {
      return {
        message: err.message ?? String(err),
        status: err.status ?? err?.response?.status ?? null,
        code: err.code ?? null
      };
    }
    return {
      message: err?.message ?? String(err),
      status: err?.status ?? err?.response?.status ?? null,
      code: err?.code ?? null
    };
  } catch {
    return { message: 'Error desconocido' };
  }
}

export const fetchReviewsByProduct = createAsyncThunk(
  'reviews/fetchByProduct',
  async ({ productId, page = 0, size = 10 } = {}, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const existing = state.reviews?.byProduct?.[productId];
      if (existing && Array.isArray(existing.items) && existing.items.length > 0 && page === 0) {
        const payload = { content: existing.items, totalElements: existing.meta?.totalElements ?? existing.items.length };
        return { productId, resp: payload };
      }
      const resp = await reviewsService.getReviewsByProduct(productId, page, size);
      return { productId, resp };
    } catch (err) {
      return rejectWithValue(normalizeError(err));
    }
  }
);

export const fetchReviewByOrderItem = createAsyncThunk(
  'reviews/fetchByOrderItem',
  async (orderItemId, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const cached = state.reviews?.reviewByOrderItem?.[String(orderItemId)];
      if (typeof cached !== 'undefined') {
        return { orderItemId, resp: cached };
      }
      const resp = await reviewsService.getReviewByOrderItem(orderItemId);
      return { orderItemId, resp };
    } catch (err) {
      return rejectWithValue({ ...normalizeError(err), orderItemId });
    }
  }
);

export const createReview = createAsyncThunk(
  'reviews/createReview',
  async (dto, { rejectWithValue }) => {
    try {
      const resp = await reviewsService.createReview(dto);
      return resp;
    } catch (err) {
      return rejectWithValue(normalizeError(err));
    }
  }
);

export const updateReview = createAsyncThunk(
  'reviews/updateReview',
  async ({ reviewId, dto }, { rejectWithValue }) => {
    try {
      const resp = await reviewsService.updateReview(reviewId, dto);
      return resp;
    } catch (err) {
      return rejectWithValue(normalizeError(err));
    }
  }
);

export const deleteReview = createAsyncThunk(
  'reviews/deleteReview',
  async (reviewId, { rejectWithValue }) => {
    try {
      const resp = await reviewsService.deleteReview(reviewId);
      return { reviewId, resp };
    } catch (err) {
      return rejectWithValue(normalizeError(err));
    }
  }
);

export const fetchLatestReviews = createAsyncThunk(
  'reviews/latest',
  async (count = 5, { rejectWithValue }) => {
    try {
      const resp = await reviewsService.getLatestReviews(count);
      return resp;
    } catch (err) {
      return rejectWithValue(normalizeError(err));
    }
  }
);

const initialState = {
  byProduct: {},
  latest: [],
  loading: false,
  error: null,
  reviewByOrderItem: {}
};

const reviewsSlice = createSlice({
  name: 'reviews',
  initialState,
  reducers: {
    clearAllReviews(state) {
      state.byProduct = {};
      state.latest = [];
      state.loading = false;
      state.error = null;
      state.reviewByOrderItem = {};
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReviewsByProduct.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchReviewsByProduct.fulfilled, (s, a) => {
        s.loading = false;
        const { productId, resp } = a.payload;
        const items = resp?.content ?? resp ?? [];
        s.byProduct[productId] = { items, meta: { totalElements: resp?.totalElements ?? resp?.total ?? items.length } };
      })
      .addCase(fetchReviewsByProduct.rejected, (s, a) => { s.loading = false; s.error = a.payload?.message ?? a.error?.message ?? null; })
      .addCase(fetchReviewByOrderItem.pending, (s) => {})
      .addCase(fetchReviewByOrderItem.fulfilled, (s, a) => {
        const { orderItemId, resp } = a.payload;
        if (orderItemId == null) return;
        const key = String(orderItemId);
        s.reviewByOrderItem[key] = resp ?? null;
      })
      .addCase(fetchReviewByOrderItem.rejected, (s, a) => {
        const orderItemId = a.meta?.arg ?? a.payload?.orderItemId;
        if (orderItemId != null) {
          s.reviewByOrderItem[String(orderItemId)] = null;
        }
        s.error = a.payload?.message ?? a.error?.message ?? null;
      })

      .addCase(createReview.fulfilled, (s, a) => {
        const r = a.payload;
        if (!r) return;
        const pid = r.productId ?? r.product?.id;
        if (pid != null) {
          const entry = s.byProduct[pid] ?? { items: [], meta: { totalElements: 0 } };
          entry.items = [r, ...(entry.items || [])];
          entry.meta.totalElements = (entry.meta.totalElements || 0) + 1;
          s.byProduct[pid] = entry;
        }
        s.latest = [r, ...s.latest].slice(0, 20);
        const oid = r.orderItemId ?? r.order_item_id;
        if (oid != null) s.reviewByOrderItem[String(oid)] = r;
      })
      .addCase(createReview.rejected, (s, a) => {
        s.error = a.payload?.message ?? a.error?.message ?? null;
      })

      .addCase(updateReview.fulfilled, (s, a) => {
        const r = a.payload;
        if (!r) return;
        const pid = r.productId ?? r.product?.id;
        if (pid != null && s.byProduct[pid]) {
          s.byProduct[pid].items = s.byProduct[pid].items.map(it => it.id === r.id ? r : it);
        }
        s.latest = s.latest.map(it => it.id === r.id ? r : it);
        const oid = r.orderItemId ?? r.order_item_id;
        if (oid != null) s.reviewByOrderItem[String(oid)] = r;
      })
      .addCase(updateReview.rejected, (s, a) => {
        s.error = a.payload?.message ?? a.error?.message ?? null;
      })

      .addCase(deleteReview.fulfilled, (s, a) => {
        const { reviewId } = a.payload;
        if (!reviewId) return;
        Object.keys(s.byProduct).forEach(pid => {
          s.byProduct[pid].items = s.byProduct[pid].items.filter(it => it.id !== reviewId);
          s.byProduct[pid].meta.totalElements = Math.max(0, (s.byProduct[pid].meta.totalElements || 1) - 1);
        });
        s.latest = s.latest.filter(it => it.id !== reviewId);
        Object.keys(s.reviewByOrderItem).forEach(oid => {
          if (s.reviewByOrderItem[oid]?.id === reviewId) s.reviewByOrderItem[oid] = null;
        });
      })
      .addCase(deleteReview.rejected, (s, a) => {
        s.error = a.payload?.message ?? a.error?.message ?? null;
      })

      .addCase(fetchLatestReviews.fulfilled, (s, a) => {
        s.latest = a.payload ?? [];
      })

      .addCase(logout.fulfilled, (s) => {
        s.byProduct = {};
        s.latest = [];
        s.loading = false;
        s.error = null;
        s.reviewByOrderItem = {};
      });
  }
});

export const { clearAllReviews } = reviewsSlice.actions;
export default reviewsSlice.reducer;

export const selectReviewsByProduct = (state, productId) => state.reviews.byProduct?.[productId]?.items ?? [];
export const selectLatestReviews = state => state.reviews.latest;
export const selectReviewByOrderItem = (state, orderItemId) => state.reviews.reviewByOrderItem?.[String(orderItemId)] ?? null;
