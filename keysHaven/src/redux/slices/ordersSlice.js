import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import ordersService from '../../services/orders';
import { logout } from './authSlice';

export const fetchMyOrders = createAsyncThunk(
    'orders/fetchMy',
    async ({ page = 0, size = 20 } = {}, { rejectWithValue }) => {
        try {
        const resp = await ordersService.getMyOrders(page, size);
        return resp;
        } catch (err) {
        return rejectWithValue(err);
        }
    }
    );

    export const getKeysByOrderItemId = createAsyncThunk(
    'orders/getKeys',
    async (orderItemId, { rejectWithValue }) => {
        try {
        const resp = await ordersService.getKeysByOrderItemId(orderItemId);
        return { orderItemId, resp };
        } catch (err) {
        return rejectWithValue(err);
        }
    }
    );

    export const createOrder = createAsyncThunk(
    'orders/create',
    async (dto, { rejectWithValue }) => {
        try {
        const resp = await ordersService.createOrder(dto);
        return resp;
        } catch (err) {
        return rejectWithValue(err);
        }
    }
    );

    const initialState = {
    myOrders: { items: [], total: 0 },
    keysByOrderItem: {},
    creating: false,
    error: null
    };

    const ordersSlice = createSlice({
    name: 'orders',
    initialState,
    reducers: {
        clearOrders(state) {
        state.myOrders = { items: [], total: 0 };
        state.keysByOrderItem = {};
        state.creating = false;
        state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
        .addCase(fetchMyOrders.fulfilled, (s, a) => { s.myOrders = a.payload ?? { items: [], total: 0 }; })
        .addCase(getKeysByOrderItemId.fulfilled, (s, a) => { s.keysByOrderItem[a.payload.orderItemId] = a.payload.resp ?? []; })

        .addCase(createOrder.pending, (s) => { s.creating = true; s.error = null; })
        .addCase(createOrder.fulfilled, (s, a) => {
            s.creating = false;
            const serverOrder = a.payload;
            if (serverOrder) {
            s.myOrders.items = [serverOrder, ...(s.myOrders.items || [])];
            s.myOrders.total = (s.myOrders.total || 0) + 1;
            }
        })
        .addCase(createOrder.rejected, (s, a) => { s.creating = false; s.error = a.payload || a.error; })

        .addCase(logout.fulfilled, (s) => Object.assign(s, initialState));
    }
});

export const { clearOrders } = ordersSlice.actions;
export default ordersSlice.reducer;

export const selectOrders = state => state.orders;
