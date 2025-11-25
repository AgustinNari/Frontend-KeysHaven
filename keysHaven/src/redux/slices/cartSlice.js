import { createSlice } from '@reduxjs/toolkit';
import { logout } from './authSlice';

const initialState = {
  items: [],
  coupon: null,
  couponProductId: null,
  availableCoupons: []
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addOrUpdateItem(state, action) {
      const { item, qty } = action.payload;
      const id = item?.id ?? item?.productId;
      if (id == null) return;
      const idx = state.items.findIndex(x => String(x.id) === String(id));
      if (idx >= 0) {
        state.items[idx].qty = (state.items[idx].qty || 0) + (Number(qty) || 1);
        state.items[idx]._raw = item._raw ?? item._raw ?? state.items[idx]._raw ?? item;
      } else {
        state.items.push({ ...item, id, qty: Number(qty) || 1 });
      }
    },
    setItemQty(state, action) {
      const { id, qty } = action.payload;
      const idx = state.items.findIndex(x => String(x.id) === String(id));
      if (idx >= 0) {
        const q = Number(qty) || 0;
        if (q <= 0) state.items.splice(idx, 1);
        else state.items[idx].qty = q;
      }
    },
    removeItem(state, action) {
      const id = action.payload;
      state.items = state.items.filter(x => String(x.id) !== String(id));
      if (state.couponProductId && String(state.couponProductId) === String(id)) {
        state.coupon = null;
        state.couponProductId = null;
      }
    },
    incItem(state, action) {
      const id = action.payload;
      const idx = state.items.findIndex(x => String(x.id) === String(id));
      if (idx >= 0) state.items[idx].qty = (state.items[idx].qty || 0) + 1;
    },
    decItem(state, action) {
      const id = action.payload;
      const idx = state.items.findIndex(x => String(x.id) === String(id));
      if (idx >= 0) {
        const next = Math.max(0, (state.items[idx].qty || 0) - 1);
        if (next <= 0) state.items.splice(idx, 1);
        else state.items[idx].qty = next;
      }
    },
    clearCart(state) {
      state.items = [];
      state.coupon = null;
      state.couponProductId = null;
      state.availableCoupons = [];
    },
    setCoupon(state, action) {
      const { coupon, productId } = action.payload;
      state.coupon = coupon ?? null;
      state.couponProductId = productId ?? null;
    },
    clearCoupon(state) {
      state.coupon = null;
      state.couponProductId = null;
    },
    setAvailableCoupons(state, action) {
      state.availableCoupons = action.payload ?? [];
    }
  },
  extraReducers: (builder) => {

    builder.addCase(logout.fulfilled, (state) => {
      state.items = [];
      state.coupon = null;
      state.couponProductId = null;
      state.availableCoupons = [];
    });
  }
});

export const {
  addOrUpdateItem,
  setItemQty,
  removeItem,
  incItem,
  decItem,
  clearCart,
  setCoupon,
  clearCoupon,
  setAvailableCoupons
} = cartSlice.actions;

export default cartSlice.reducer;


export const selectCart = (state) => state.cart;
export const selectCartItems = (state) => state.cart.items ?? [];
export const selectCartCoupon = (state) => state.cart.coupon;
export const selectCartCouponProductId = (state) => state.cart.couponProductId;
export const selectCartAvailableCoupons = (state) => state.cart.availableCoupons ?? [];
