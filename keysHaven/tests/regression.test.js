import { test } from 'node:test';
import assert from 'node:assert/strict';
import { configureStore } from '@reduxjs/toolkit';
import cartReducer, { addOrUpdateItem, setCoupon, incItem, decItem } from '../src/redux/slices/cartSlice';
import authReducer, { logout, setToken, setUser, loginThunk } from '../src/redux/slices/authSlice';
import productReducer, { searchProducts } from '../src/redux/slices/productsSlice';
import apiClient, { configureSession } from '../src/api/apiClient';
import productsService from '../src/services/productsService';
import appStore from '../src/redux/store';

test('cart refuses negative/fractional quantities and invalidates coupons on quantity changes', () => {
  let state = cartReducer(undefined, addOrUpdateItem({ item: { id: 1, price: 10 }, qty: -1 }));
  assert.equal(state.items.length, 0);
  state = cartReducer(state, addOrUpdateItem({ item: { id: 1, price: 10 }, qty: 1.5 }));
  assert.equal(state.items.length, 0);
  state = cartReducer(state, addOrUpdateItem({ item: { id: 1, price: 10 }, qty: 1 }));
  state = cartReducer(state, setCoupon({ coupon: { code: 'TEST', discountAmount: 5 }, productId: 1 }));
  state = cartReducer(state, incItem(1));
  assert.equal(state.items[0].qty, 2);
  assert.equal(state.coupon, null);
  state = cartReducer(state, decItem(1));
  state = cartReducer(state, decItem(1));
  assert.equal(state.items.length, 0);
});

test('catalog ignores out-of-order responses', () => {
  let state = productReducer(undefined, searchProducts.pending('old', {}));
  state = productReducer(state, searchProducts.pending('new', {}));
  state = productReducer(state, searchProducts.fulfilled({ key: 'new', resp: { content: [{ id: 2 }] } }, 'new', {}));
  state = productReducer(state, searchProducts.fulfilled({ key: 'old', resp: { content: [{ id: 1 }] } }, 'old', {}));
  assert.equal(state.searchResult.content[0].id, 2);
});

test('login profile failure removes the provisional token', async () => {
  const store = configureStore({ reducer: { auth: authReducer } });
  configureSession(() => store.getState().auth.token, () => store.dispatch(logout()));
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async url => url.endsWith('/authenticate')
    ? new Response(JSON.stringify({ access_token: 'provisional' }), { headers: { 'Content-Type': 'application/json' } })
    : new Response(JSON.stringify({ message: 'Profile failed' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  try {
    await store.dispatch(loginThunk({ email: 'test@example.test', password: 'test' }));
    assert.equal(store.getState().auth.token, null);
    assert.equal(store.getState().auth.isAuthenticated, false);
  } finally { globalThis.fetch = originalFetch; }
});

test('401 invalidates the current session while 403 preserves it', async () => {
  let invalidations = 0;
  configureSession(() => 'token', () => invalidations++);
  const originalFetch = globalThis.fetch;
  try {
    globalThis.fetch = async () => new Response('{}', { status: 403, headers: { 'Content-Type': 'application/json' } });
    await assert.rejects(apiClient.apiFetch('/users'), error => error.status === 403);
    assert.equal(invalidations, 0);
    globalThis.fetch = async () => new Response('{}', { status: 401, headers: { 'Content-Type': 'application/json' } });
    await assert.rejects(apiClient.apiFetch('/users/me/profile'), error => error.status === 401);
    assert.equal(invalidations, 1);
  } finally { globalThis.fetch = originalFetch; }
});

test('one percent is interpreted as 1%, not 100%', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response(JSON.stringify({ content: [{ id: 1, price: 100, bestDiscountPercentage: 1 }] }),
    { headers: { 'Content-Type': 'application/json' } });
  try {
    const result = await productsService.search();
    assert.equal(result.content[0].discountedPrice, 99);
  } finally { globalThis.fetch = originalFetch; }
});

test('logout clears cart immediately and late requests cannot repopulate private data', () => {
  appStore.dispatch(setToken('token'));
  appStore.dispatch(setUser({ id: 1, role: 'BUYER' }));
  appStore.dispatch(addOrUpdateItem({ item: { id: 1, price: 10 }, qty: 1 }));
  appStore.dispatch({ type: 'orders/fetchMy/pending', meta: { requestId: 'late' } });
  appStore.dispatch(logout.pending('logout', undefined));
  assert.equal(appStore.getState().cart.items.length, 0);
  appStore.dispatch({ type: 'orders/fetchMy/fulfilled', payload: { page: 0, size: 10, resp: { content: [{ id: 1 }] } }, meta: { requestId: 'late' } });
  assert.deepEqual(appStore.getState().orders.myOrdersPages, {});
  assert.equal(appStore.getState().auth.isAuthenticated, false);
  appStore.dispatch(setUser({ id: 1, role: 'BUYER' }));
  assert.equal(appStore.getState().auth.user, null);
});
