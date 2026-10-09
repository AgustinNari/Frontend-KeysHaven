import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import productsService from '../../services/productsService';
import reviewsService from '../../services/reviews';
import { logout } from './authSlice';
import { createOrder } from './ordersSlice'; 


export const fetchProductDetail = createAsyncThunk(
  'productDetail/fetch',
  async (arg, { rejectWithValue, getState }) => {
    try {
      let productId;
      let force = false;
      if (typeof arg === 'object' && arg !== null && !Array.isArray(arg)) {
        productId = arg.productId ?? arg.id;
        force = !!arg.force;
      } else {
        productId = arg;
      }
      if (productId == null) throw new Error('productId es requerido');

      const state = getState();
      const cached = state.productDetail?.productCache?.[String(productId)];
      if (!force && cached) return cached;

      const resp = await productsService.getById(productId);
      return resp;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const fetchRelatedProducts = createAsyncThunk(
  'productDetail/related',
  async ({ categoryIds = [], excludeProductId = null, size = 6 } = {}, { rejectWithValue, getState }) => {
    try {
      const key = `${String(excludeProductId ?? 'none')}_${(Array.isArray(categoryIds) ? categoryIds.join(',') : '')}_${size}`;
      const state = getState();
      const cached = state.productDetail?.relatedCache?.[key];
      if (cached) return { key, resp: cached };
      const resp = await productsService.relatedByCategories(categoryIds, excludeProductId, size);
      return { key, resp };
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);


export const fetchProductReviews = createAsyncThunk(
  'productDetail/reviews',
  async ({ productId, page = 0, size = 10 } = {}, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const key = `${String(productId)}_${page}_${size}`;
      const cached = state.productDetail?.reviewsPages?.[key];
      if (cached) {
        return { key, resp: cached };
      }
      const resp = await reviewsService.getReviewsByProduct(productId, page, size);
      return { key, resp };
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

const initialState = {
  product: null,
  related: [],
  reviews: [],
  reviewsMeta: null,
  requestId: null,
  loading: false,
  error: null,

  productCache: {},
  reviewsPages: {},
  relatedCache: {}
};

const productDetailSlice = createSlice({
  name: 'productDetail',
  initialState,
  reducers: {
    upsertProductDetail(state, action) {
      state.product = { ...(String(state.product?.id) === String(action.payload?.id) ? state.product : {}), ...(action.payload || {}) };
      if (action.payload && action.payload.id != null) {
        state.productCache[String(action.payload.id)] = {
          ...(state.productCache[String(action.payload.id)] || {}),
          ...action.payload
        };
      }
    },

    clearProductDetail(state) {
      state.product = null;
      state.related = [];
      state.reviews = [];
      state.reviewsMeta = null;
      state.loading = false;
      state.error = null;
    },


    setReviewsFromCache(state, action) {
      const key = action.payload;
      if (!key) return;
      const resp = state.reviewsPages?.[key];
      if (!resp) return;
      const items = resp?.content ?? (Array.isArray(resp) ? resp : []);
      state.reviews = items;
      state.reviewsMeta = { totalElements: resp?.totalElements ?? resp?.total ?? items.length };
    },
    setRelatedFromCache(state, action) {
      const key = action.payload;
      if (!key) return;
      const resp = state.relatedCache?.[key];
      if (!resp) return;
      state.related = resp ?? [];
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProductDetail.pending, (s, a) => { s.requestId = a.meta.requestId; s.loading = true; s.error = null; })
      .addCase(fetchProductDetail.fulfilled, (s, a) => {
        if (s.requestId !== a.meta.requestId) return;
        s.requestId = null;
        s.loading = false;
        s.product = a.payload;
        if (a.payload && a.payload.id != null) s.productCache[String(a.payload.id)] = a.payload;
      })
      .addCase(fetchProductDetail.rejected, (s, a) => { if (s.requestId !== a.meta.requestId) return; s.requestId = null; s.loading = false; s.error = a.payload || a.error; })

      .addCase(fetchRelatedProducts.fulfilled, (s, a) => {
        if (Number(a.meta.arg.excludeProductId) !== Number(s.product?.id)) return;
        const key = a.payload?.key;
        const resp = a.payload?.resp ?? a.payload;
        if (key) s.relatedCache[key] = resp ?? [];
        s.related = resp ?? [];
      })

      .addCase(fetchProductReviews.fulfilled, (s, a) => {
        const key = a.payload?.key;
        const resp = a.payload?.resp ?? a.payload;
        if (key) {
          s.reviewsPages[key] = resp ?? { content: [], totalElements: 0 };
        }
        if (Number(a.meta.arg.productId) !== Number(s.product?.id)) return;
        const items = resp?.content ?? (Array.isArray(resp) ? resp : []);
        s.reviews = items;
        s.reviewsMeta = { totalElements: resp?.totalElements ?? resp?.total ?? items.length };
      })

      .addCase(createOrder.fulfilled, (s, a) => {
        const serverOrder = a.payload;
        if (!s.product || !serverOrder?.items) return;
        const itemsBought = serverOrder.items || [];
        for (const it of itemsBought) {
          if (Number(it.productId) === Number(s.product.id)) {
            const qty = Number(it.quantity ?? it.qty ?? 0);
            if (typeof s.product.availableStock === 'number') s.product.availableStock = Math.max(0, s.product.availableStock - qty);
            if (typeof s.product.amountSold === 'number') s.product.amountSold = (s.product.amountSold || 0) + qty;
          }
        }
      })

      .addCase(logout.fulfilled, (s) => {
        s.product = null;
        s.related = [];
        s.reviews = [];
        s.reviewsMeta = null;
        s.loading = false;
        s.error = null;
        s.productCache = {};
        s.reviewsPages = {};
        s.relatedCache = {};
      })

      .addMatcher(
        (action) => action.type.startsWith('reviews/') && action.type.endsWith('/fulfilled'),
        (s, a) => {
          const payload = a.payload;
          if (!payload) return;
          const type = a.type;
          if (type.includes('/createReview/fulfilled')) {
            if (s.product && Number(s.product.id) === Number(payload.productId)) {
              s.reviews = [payload, ...(s.reviews || [])];
              if (s.product) {
                const ratings = (s.reviews || []).map(r => Number(r.rating ?? 0)).filter(n => !Number.isNaN(n));
                s.product.ratingCount = ratings.length;
                s.product.avgRating = ratings.length ? (ratings.reduce((a, b) => a + b, 0) / ratings.length) : 0;
              }
            }
          } else if (type.includes('/updateReview/fulfilled')) {
            if (s.product && Number(s.product.id) === Number(payload.productId)) {
              s.reviews = (s.reviews || []).map(r => r.id === payload.id ? payload : r);
              const ratings = (s.reviews || []).map(r => Number(r.rating ?? 0)).filter(n => !Number.isNaN(n));
              s.product.ratingCount = ratings.length;
              s.product.avgRating = ratings.length ? (ratings.reduce((a, b) => a + b, 0) / ratings.length) : 0;
            }
          } else if (type.includes('/deleteReview/fulfilled')) {
            if (s.product && Number(s.product.id) === Number(payload.productId)) {
              s.reviews = (s.reviews || []).filter(r => r.id !== payload.id);
              const ratings = (s.reviews || []).map(r => Number(r.rating ?? 0)).filter(n => !Number.isNaN(n));
              s.product.ratingCount = ratings.length;
              s.product.avgRating = ratings.length ? (ratings.reduce((a, b) => a + b, 0) / ratings.length) : 0;
            }
          }
        }
      );
  }
});

export const {
  upsertProductDetail,
  clearProductDetail,
  setReviewsFromCache,
  setRelatedFromCache
} = productDetailSlice.actions;
export default productDetailSlice.reducer;

export const selectProductDetail = state => state.productDetail;
export const selectProduct = state => state.productDetail.product;
export const selectRelatedProducts = state => state.productDetail.related;
export const selectProductReviews = state => state.productDetail.reviews;
export const selectProductReviewsPages = state => state.productDetail.reviewsPages;
export const selectProductCache = state => state.productDetail.productCache;
export const selectRelatedCache = state => state.productDetail.relatedCache;
