
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { logout } from './slices/authSlice.js';
import { configureSession } from '../api/apiClient.js';

import authReducer from './slices/authSlice.js';
import cartReducer from './slices/cartSlice.js';
import productsReducer from './slices/productsSlice.js';
import productDetailReducer from './slices/productDetailSlice.js';
import reviewsReducer from './slices/reviewsSlice.js';
import categoriesReducer from './slices/categoriesSlice.js';
import discountsReducer from './slices/discountsSlice.js';
import sellersReducer from './slices/sellersSlice.js';
import sellerPanelReducer from './slices/sellerPanelSlice.js';
import adminPanelReducer from './slices/adminPanelSlice.js';
import ordersReducer from './slices/ordersSlice.js';
import profileReducer from './slices/profileSlice.js';


const reducers = combineReducers({
        auth: authReducer,
        cart: cartReducer,
        products: productsReducer,
        productDetail: productDetailReducer,
        reviews: reviewsReducer,
        categories: categoriesReducer,
        discounts: discountsReducer,
        sellers: sellersReducer,
        sellerPanel: sellerPanelReducer,
        adminPanel: adminPanelReducer,
        orders: ordersReducer,
        profile: profileReducer
        });

// Ignore requests started before logout, so late replies cannot restore private data.
const pendingRequests = new Set();
const sessionMiddleware = () => next => action => {
  if (action.type === logout.pending.type) pendingRequests.clear();
  if (action.meta?.requestId && action.type.endsWith('/pending')) pendingRequests.add(action.meta.requestId);
  if (action.meta?.requestId && /\/(fulfilled|rejected)$/.test(action.type)) {
    const active = pendingRequests.delete(action.meta.requestId);
    if (!active && action.type !== logout.fulfilled.type) return action;
  }
  if (action.payload instanceof Error) {
    return next({ ...action, payload: { message: action.payload.message, status: action.payload.status || 0 } });
  }
  return next(action);
};
const rootReducer = (state, action) => {
  if (action.type === logout.pending.type) state = undefined;
  const next = reducers(state, action);
  if (action.type === logout.pending.type) next.cart = cartReducer(next.cart, { type: 'cart/clearCart' });
  const mutation = /^(sellerPanel|admin|reviews)\/(create|update|delete|toggle|add|setFeatured)/.test(action.type) && action.type.endsWith('/fulfilled');
  if (mutation || action.type === 'orders/create/fulfilled') {
    // Server data may have changed membership, price, stock or ratings.
    next.products = productsReducer(undefined, { type: '@@INIT' });
    next.productDetail = productDetailReducer(undefined, { type: '@@INIT' });
    next.sellers = sellersReducer(undefined, { type: '@@INIT' });
    next.categories = categoriesReducer(undefined, { type: '@@INIT' });
  }
  return next;
};
const store = configureStore({
  reducer: rootReducer,
  middleware: getDefaultMiddleware => getDefaultMiddleware().concat(sessionMiddleware)
});
configureSession(() => store.getState().auth.token, () => store.dispatch(logout()));
let lastAuth;
let lastCart;
store.subscribe(() => {
  const { auth, cart } = store.getState();
  try {
    if (auth !== lastAuth) {
      if (auth.token) localStorage.setItem('jwtToken', auth.token);
      else {
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('keyshavenCart');
      }
      // Profiles/coupons are fetched for the current account, never trusted from storage.
      localStorage.removeItem('userProfile');
      localStorage.removeItem('app_profile_me_v1');
      localStorage.removeItem('app_profile_coupons_v1');
      lastAuth = auth;
    }
    if (auth.isAuthenticated && cart !== lastCart) {
      localStorage.setItem('keyshavenCart', JSON.stringify({ ownerId: auth.user.id, items: cart.items }));
      lastCart = cart;
    }
  } catch { /* Storage may be unavailable; Redux remains usable for this session. */ }
});
export default store;
