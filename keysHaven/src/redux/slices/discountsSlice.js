import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import discountsService from '../../services/discountsService';
import sellerService from '../../services/sellerService';
import adminService from '../../services/adminService';
import { logout } from './authSlice';


export const fetchActiveCouponsByBuyer = createAsyncThunk(
    'discounts/fetchActiveBuyer',
    async ({ page = 0, size = 200 } = {}, { rejectWithValue }) => {
        try {
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
    async ({ page = 0, size = 10 } = {}, { rejectWithValue }) => {
        try {
        const resp = await sellerService.getSellerDiscounts(page, size);
        return resp;
        } catch (err) {
        return rejectWithValue(err);
        }
    }
    );


    export const fetchAdminDiscountsPage = createAsyncThunk(
    'discounts/adminPage',
    async ({ page = 1, size = 10 } = {}, { rejectWithValue }) => {
        try {
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
        state.adminPage = null;
        state.loading = false;
        state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
        .addCase(fetchActiveCouponsByBuyer.fulfilled, (s, a) => {
            s.myCoupons = a.payload?.content ?? a.payload ?? [];
        })

        .addCase(validateCouponForOrderItem.fulfilled, (s, a) => {
            s.validationResult = a.payload;
        })

        .addCase(fetchSellerDiscounts.fulfilled, (s, a) => {
            s.sellerDiscounts = a.payload ?? { items: [], total: 0 };
        })

        .addCase(fetchAdminDiscountsPage.fulfilled, (s, a) => {
            s.adminPage = a.payload;
        })

        .addCase(logout.fulfilled, (s) => {
            s.myCoupons = [];
            s.validationResult = null;
            s.sellerDiscounts = { items: [], total: 0 };
            s.adminPage = null;
            s.loading = false;
            s.error = null;
        });
    }
});

export const { clearDiscountsState } = discountsSlice.actions;
export default discountsSlice.reducer;

export const selectMyCoupons = state => state.discounts.myCoupons;
export const selectDiscountValidationResult = state => state.discounts.validationResult;
