import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import sellerService from '../../services/sellerService';
import productsService from '../../services/productsService';
import reviewsService from '../../services/reviews';
import { logout } from './authSlice';
import { createOrder } from './ordersSlice';

export const fetchProductDetail = createAsyncThunk(
    'productDetail/fetch',
    async (productId, { rejectWithValue }) => {
        try {
        const resp = await sellerService.getProductDetail(productId);
        return resp;
        } catch (err) {
        try {
            const r2 = await productsService.getById(productId);
            return r2;
        } catch (err2) {
            return rejectWithValue(err2 || err);
        }
        }
    }
    );

    export const fetchRelatedProducts = createAsyncThunk(
    'productDetail/related',
    async ({ categoryIds = [], excludeProductId = null, size = 6 } = {}, { rejectWithValue }) => {
        try {
        const resp = await productsService.relatedByCategories(categoryIds, excludeProductId, size);
        return resp;
        } catch (err) {
        return rejectWithValue(err);
        }
    }
    );

    export const fetchProductReviews = createAsyncThunk(
    'productDetail/reviews',
    async ({ productId, page = 0, size = 10 } = {}, { rejectWithValue }) => {
        try {
        const resp = await reviewsService.getReviewsByProduct(productId, page, size);
        return resp;
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
    loading: false,
    error: null
    };

    const productDetailSlice = createSlice({
    name: 'productDetail',
    initialState,
    reducers: {
        upsertProductDetail(state, action) {
        state.product = { ...(state.product || {}), ...(action.payload || {}) };
        },
        clearProductDetail(state) {
        state.product = null;
        state.related = [];
        state.reviews = [];
        state.reviewsMeta = null;
        state.loading = false;
        state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
        .addCase(fetchProductDetail.pending, (s) => { s.loading = true; s.error = null; })
        .addCase(fetchProductDetail.fulfilled, (s, a) => { s.loading = false; s.product = a.payload; })
        .addCase(fetchProductDetail.rejected, (s, a) => { s.loading = false; s.error = a.payload || a.error; })

        .addCase(fetchRelatedProducts.fulfilled, (s, a) => { s.related = a.payload ?? []; })

        .addCase(fetchProductReviews.fulfilled, (s, a) => {
            const payload = a.payload;
            if (payload?.content) {
            s.reviews = payload.content;
            s.reviewsMeta = { totalElements: payload.totalElements ?? payload.total ?? s.reviews.length };
            } else if (Array.isArray(payload)) {
            s.reviews = payload;
            s.reviewsMeta = { totalElements: payload.length };
            } else {
            s.reviews = [];
            s.reviewsMeta = null;
            }
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

export const { upsertProductDetail, clearProductDetail } = productDetailSlice.actions;
export default productDetailSlice.reducer;

export const selectProductDetail = state => state.productDetail;
export const selectProduct = state => state.productDetail.product;
export const selectRelatedProducts = state => state.productDetail.related;
export const selectProductReviews = state => state.productDetail.reviews;
