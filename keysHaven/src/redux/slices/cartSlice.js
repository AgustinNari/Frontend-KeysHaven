import { createSlice } from '@reduxjs/toolkit';
import { logout, loginThunk, registerThunk, fetchProfileThunk } from './authSlice';

function restoreCart() {
  try {
    const saved = JSON.parse(globalThis.localStorage?.getItem('keyshavenCart') || 'null');
    if (!globalThis.localStorage?.getItem('jwtToken') || !saved?.ownerId || !Array.isArray(saved.items)) return null;
    return { ownerId: saved.ownerId, items: saved.items.filter(item => item?.id && Number.isInteger(item.qty) && item.qty > 0 && Number.isFinite(item.price) && item.price >= 0) };
  } catch { return null; }
}
const saved = restoreCart();
const initialState = {
  items: saved?.items ?? [],
  ownerId: saved?.ownerId ?? null,
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
      if (id == null || !Number.isInteger(Number(qty)) || Number(qty) <= 0) return;
      state.coupon = null; state.couponProductId = null;
      const idx = state.items.findIndex(x => String(x.id) === String(id));
      if (idx >= 0) {
        state.items[idx].qty = (state.items[idx].qty || 0) + (Number(qty) || 1);
        state.items[idx]._raw = item._raw ?? state.items[idx]._raw ?? item;
      } else {
        state.items.push({ ...item, id, qty: Number(qty) || 1 });
      }
    },
    replaceItem(state, action) {
      const { item, expectedQty } = action.payload;
      const index = state.items.findIndex(it => String(it.id) === String(item.id));
      if (index < 0 || state.items[index].qty !== expectedQty) return;
      state.items[index] = { ...item, qty: expectedQty };
      state.coupon = null; state.couponProductId = null;
    },
    setItemQty(state, action) {
      const { id, qty } = action.payload;
      state.coupon = null; state.couponProductId = null;
      const idx = state.items.findIndex(x => String(x.id) === String(id));
      if (idx >= 0) {
        const q = Number(qty);
        if (!Number.isInteger(q) || q < 0) return;
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
      state.coupon = null; state.couponProductId = null;
      const idx = state.items.findIndex(x => String(x.id) === String(id));
      if (idx >= 0) state.items[idx].qty = (state.items[idx].qty || 0) + 1;
    },
    decItem(state, action) {
      const id = action.payload;
      state.coupon = null; state.couponProductId = null;
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

    builder.addCase(logout.fulfilled, state => {
      state.items = []; state.ownerId = null; state.coupon = null;
      state.couponProductId = null; state.availableCoupons = [];
    });
    for (const thunk of [loginThunk, registerThunk, fetchProfileThunk]) {
      builder.addCase(thunk.fulfilled, (state, action) => {
        const user = thunk === fetchProfileThunk ? action.payload : action.payload.profile;
        if (String(state.ownerId) !== String(user?.id)) state.items = [];
        state.ownerId = user?.id ?? null;
        state.coupon = null; state.couponProductId = null; state.availableCoupons = [];
      });
    }
  }
});

export const {
  addOrUpdateItem,
  replaceItem,
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
