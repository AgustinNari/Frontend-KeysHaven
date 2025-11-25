import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import productsService from '../../services/productsService';
import { logout } from './authSlice';
import { createOrder } from './ordersSlice';

export const searchProducts = createAsyncThunk(
    'products/search',
    async ({ filters = {}, page = 0, size = 12, sort = 'createdAt_desc', onlyActive = true } = {}, { rejectWithValue }) => {
        try {
        const resp = await productsService.search(filters, page, size, sort, onlyActive);
        return resp;
        } catch (err) {
        return rejectWithValue(err);
        }
    }
    );

    export const fetchFeaturedProducts = createAsyncThunk(
    'products/featured',
    async (size = 10, { rejectWithValue }) => {
        try {
        const resp = await productsService.getFeaturedProducts(size);
        return resp;
        } catch (err) {
        return rejectWithValue(err);
        }
    }
    );

    export const fetchTopSoldProducts = createAsyncThunk(
    'products/topSold',
    async (size = 4, { rejectWithValue }) => {
        try {
        const resp = await productsService.getTopSoldProducts(size);
        return resp;
        } catch (err) {
        return rejectWithValue(err);
        }
    }
    );

    export const fetchFilterExtras = createAsyncThunk(
    'products/filterExtras',
    async (_, { rejectWithValue }) => {
        try {
        const resp = await productsService.getFilterExtras();
        return resp;
        } catch (err) {
        return rejectWithValue(err);
        }
    }
    );

    const initialState = {
    searchResult: { content: [], totalElements: 0, totalPages: 0, number: 0, size: 12 },
    featured: [],
    topSold: [],
    filterExtras: { developers: [], publishers: [] },
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
        },
        clearProductsState(state) {
        state.searchResult = initialState.searchResult;
        state.featured = [];
        state.topSold = [];
        state.filterExtras = initialState.filterExtras;
        state.loading = false;
        state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
        .addCase(searchProducts.pending, (s) => { s.loading = true; s.error = null; })
        .addCase(searchProducts.fulfilled, (s, a) => { s.loading = false; s.searchResult = a.payload; })
        .addCase(searchProducts.rejected, (s, a) => { s.loading = false; s.error = a.payload || a.error; })

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
            } catch (err) {
            }
        })

        .addCase(logout.fulfilled, (s) => {
            s.searchResult = initialState.searchResult;
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