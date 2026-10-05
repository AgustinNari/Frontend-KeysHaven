import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import sellerService from '../../services/sellerService';
import { logout } from './authSlice';


function normalizeArg(arg) {
  if (typeof arg === 'object' && arg !== null && !Array.isArray(arg)) return arg;
  return { sellerId: arg };
}

function makePageKey({ sellerId, page = 0, size = 10, status }) {
  return `${sellerId ?? 'anon'}_${page}_${size}_${status ?? 'all'}`;
}


export const fetchSellerProducts = createAsyncThunk(
  'sellerPanel/fetchProducts',
  async (arg = {}, { rejectWithValue, getState }) => {
    try {
      const { sellerId, force = false } = normalizeArg(arg);
      const state = getState();
      const cached = state.sellerPanel?.products;
      if (!force && Array.isArray(cached) && cached.length > 0) {
        if (!sellerId) return cached;
        const first = cached[0];
        if (first && (first.sellerId == null || Number(first.sellerId) === Number(sellerId))) {
          return cached;
        }
      }
      const resp = await sellerService.getSellerProducts(sellerId);
      return resp;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const fetchSellerActiveProducts = createAsyncThunk(
  'sellerPanel/fetchActiveProducts',
  async (arg = {}, { rejectWithValue, getState }) => {
    try {
      const { sellerId, force = false } = normalizeArg(arg);
      const state = getState();
      const cached = state.sellerPanel?.activeProducts;
      if (!force && Array.isArray(cached) && cached.length > 0) {
        const first = cached[0];
        if (!sellerId || !first || Number(first.sellerId) === Number(sellerId)) {
          return cached;
        }
      }
      const resp = await sellerService.getSellerActiveProducts(sellerId);
      return resp;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const fetchSellerProductsPaginated = createAsyncThunk(
  'sellerPanel/fetchProductsPaginated',
  async (arg = {}, { rejectWithValue, getState }) => {
    try {
      const params = normalizeArg(arg);
      const { sellerId, page = 0, size = 10, status = "all", force = false } = params;
      const state = getState();
      const cached = state.sellerPanel?.productsPaginatedPages?.[makePageKey({ sellerId, page, size, status })];
      if (!force && cached) {
        return { key: makePageKey({ sellerId, page, size, status }), resp: cached };
      }
      const resp = await sellerService.getSellerProductsPaginated(sellerId, page, size, status);
      return { key: makePageKey({ sellerId, page, size, status }), resp };
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const fetchSellerOrders = createAsyncThunk(
  'sellerPanel/fetchOrders',
  async (arg = {}, { rejectWithValue, getState }) => {
    try {
      const params = normalizeArg(arg);
      const { sellerId, page = 0, size = 10, status = undefined, force = false } = params;
      const state = getState();
      const key = makePageKey({ sellerId, page, size, status });
      const cached = state.sellerPanel?.ordersPages?.[key];
      if (!force && cached) {
        return { key, resp: cached };
      }
      const resp = await sellerService.getSellerOrders({ sellerId, page, size, status });
      return { key, resp };
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const fetchSellerStats = createAsyncThunk(
  'sellerPanel/fetchStats',
  async (arg = {}, { rejectWithValue, getState }) => {
    try {
      const params = normalizeArg(arg);
      const { sellerId, force = false } = params;
      const state = getState();
      const cached = state.sellerPanel?.stats;
      if (!force && cached && cached.sellerId != null && Number(cached.sellerId) === Number(sellerId)) {
        return cached;
      }
      const resp = await sellerService.getSellerStats(sellerId);
      const respWithId = resp && typeof resp === 'object' ? { ...resp, sellerId } : { ...resp, sellerId };
      return respWithId;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const getProductKeys = createAsyncThunk(
  'sellerPanel/getProductKeys',
  async (arg = {}, { rejectWithValue, getState }) => {
    try {
      const params = typeof arg === 'object' && arg !== null && !Array.isArray(arg) ? arg : { productId: arg };
      const { productId, page = 0, size = 20, force = false } = params;
      const state = getState();
      const cachedForProduct = state.sellerPanel?.keysByProduct?.[String(productId)];
      const cachedPage = cachedForProduct && cachedForProduct.pages && cachedForProduct.pages[String(page)];
      if (!force && cachedPage) {
        return { productId, page, resp: cachedPage };
      }
      const resp = await sellerService.getProductKeys(productId, page, size);
      return { productId, page, resp };
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const createProduct = createAsyncThunk('sellerPanel/createProduct', async (productData, { rejectWithValue }) => {
  try {
    const resp = await sellerService.createProduct(productData);
    return resp;
  } catch (err) {
    return rejectWithValue(err);
  }
});

export const updateProduct = createAsyncThunk('sellerPanel/updateProduct', async ({ productId, productData }, { rejectWithValue }) => {
  try {
    const resp = await sellerService.updateProduct(productId, productData);
    return resp;
  } catch (err) {
    return rejectWithValue(err);
  }
});

export const addBulkDigitalKeys = createAsyncThunk('sellerPanel/addBulkDigitalKeys', async (payload, { rejectWithValue }) => {
  try {
    const resp = await sellerService.addBulkDigitalKeys(payload);
    return resp;
  } catch (err) {
    return rejectWithValue(err);
  }
});

export const createSellerDiscount = createAsyncThunk('sellerPanel/createDiscount', async (discountData, { rejectWithValue }) => {
  try {
    const resp = await sellerService.createDiscount(discountData);
    return resp;
  } catch (err) {
    return rejectWithValue(err);
  }
});

export const updateSellerDiscount = createAsyncThunk('sellerPanel/updateDiscount', async ({ discountId, discountData }, { rejectWithValue }) => {
  try {
    const resp = await sellerService.updateDiscount(discountId, discountData);
    return resp;
  } catch (err) {
    return rejectWithValue(err);
  }
});

export const addProductImage = createAsyncThunk('sellerPanel/addProductImage', async ({ productId, fileOrData } = {}, { rejectWithValue }) => {
  try {
    const resp = await sellerService.addProductImage(productId, fileOrData);
    return { productId, resp };
  } catch (err) {
    return rejectWithValue(err);
  }
});

export const updateProductImage = createAsyncThunk('sellerPanel/updateProductImage', async ({ imageId, payload } = {}, { rejectWithValue }) => {
  try {
    const resp = await sellerService.updateProductImage(imageId, payload);
    return { imageId, resp };
  } catch (err) {
    return rejectWithValue(err);
  }
});

export const deleteProductImage = createAsyncThunk('sellerPanel/deleteProductImage', async (imageId, { rejectWithValue }) => {
  try {
    const resp = await sellerService.deleteProductImage(imageId);
    return { imageId, resp };
  } catch (err) {
    return rejectWithValue(err);
  }
});

export const setPrimaryImage = createAsyncThunk('sellerPanel/setPrimaryImage', async (imageId, { rejectWithValue }) => {
  try {
    const resp = await sellerService.setPrimaryImage(imageId);
    return { imageId, resp };
  } catch (err) {
    return rejectWithValue(err);
  }
});



const initialState = {
  products: [],
  productsPaginated: { items: [], total: 0 },
  productsPaginatedPages: {},
  activeProducts: [],
  orders: { items: [], total: 0 },
  ordersPages: {},
  stats: null,
  keysByProduct: {},
  loading: false,
  error: null
};


const sellerPanelSlice = createSlice({
  name: 'sellerPanel',
  initialState,
  reducers: {
    clearSellerPanel(state) {
      state.products = [];
      state.productsPaginated = { items: [], total: 0 };
      state.productsPaginatedPages = {};
      state.activeProducts = [];
      state.orders = { items: [], total: 0 };
      state.ordersPages = {};
      state.stats = null;
      state.keysByProduct = {};
      state.loading = false;
      state.error = null;
    },


    setProductsPaginatedFromCache(state, action) {
      const key = action.payload?.key;
      if (!key) return;
      const resp = state.productsPaginatedPages?.[key];
      if (!resp) return;
      const items = resp.items ?? resp.content ?? [];
      const total = resp.total ?? resp.totalElements ?? 0;
      state.productsPaginated = { items, total };
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSellerProducts.fulfilled, (s, a) => { s.products = a.payload ?? []; })
      .addCase(fetchSellerActiveProducts.fulfilled, (s, a) => { s.activeProducts = a.payload ?? []; })
      .addCase(fetchSellerProductsPaginated.fulfilled, (s, a) => {
        const key = a.payload?.key;
        const resp = a.payload?.resp ?? a.payload;
        if (key) s.productsPaginatedPages[key] = resp ?? { items: [], total: 0 };
        s.productsPaginated = resp?.items ? { items: resp.items ?? resp.content ?? [], total: resp.total ?? resp.totalElements ?? 0 } : (a.payload?.items ? { items: a.payload.items, total: a.payload.total } : s.productsPaginated);
      })

      .addCase(fetchSellerOrders.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchSellerOrders.fulfilled, (s, a) => {
        s.loading = false;
        const key = a.payload?.key;
        const resp = a.payload?.resp ?? a.payload;
        if (key) {
          s.ordersPages = { ...(s.ordersPages || {}), [key]: resp ?? { items: [], total: 0 } };
        }
        s.orders = resp ?? { items: [], total: 0 };
      })
      .addCase(fetchSellerOrders.rejected, (s, a) => { s.loading = false; s.error = a.payload || a.error; })

      .addCase(fetchSellerStats.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchSellerStats.fulfilled, (s, a) => {
        s.loading = false;
        s.stats = a.payload ?? a.payload?.resp ?? null;
      })
      .addCase(fetchSellerStats.rejected, (s, a) => { s.loading = false; s.error = a.payload || a.error; })

      .addCase(getProductKeys.fulfilled, (s, a) => {
        const { productId, page, resp } = a.payload;
        const pid = String(productId);
        const existing = s.keysByProduct[pid] || { pages: {}, total: 0 };
        const respObj = resp ?? { items: [], total: 0 };
        const items = respObj.items ?? respObj.content ?? (Array.isArray(respObj) ? respObj : []);
        const total = respObj.total ?? respObj.totalElements ?? (Array.isArray(respObj) ? items.length : existing.total ?? 0);
        const pageKey = String(page ?? 0);
        existing.pages = { ...(existing.pages || {}), [pageKey]: { items, total } };
        existing.total = total;
        s.keysByProduct[pid] = existing;
      })
      .addCase(createProduct.fulfilled, (s, a) => {
        const created = a.payload;
        if (!created) return;

        s.products = [created, ...(s.products || [])];

        try {
          if (created.active === undefined || created.active === null || created.active === true) {
            s.activeProducts = [created, ...(s.activeProducts || [])];
          }
        } catch { /* Optional refresh failed; the current view remains usable. */ }

        try {
          if (s.productsPaginated && Array.isArray(s.productsPaginated.items)) {
            s.productsPaginated = {
              items: [created, ...s.productsPaginated.items],
              total: (Number(s.productsPaginated.total || 0) + 1)
            };
          }
        } catch { /* Optional refresh failed; the current view remains usable. */ }

        try {
          Object.keys(s.productsPaginatedPages || {}).forEach(k => {
            try {
              const parts = String(k).split('_');
              const pageNum = Number(parts[1] ?? 0);
              if (pageNum === 0) {
                const pageResp = s.productsPaginatedPages[k];
                if (pageResp && Array.isArray(pageResp.items)) {
                  const newTotal = (pageResp.total ?? pageResp.totalElements ?? pageResp.items.length) + 1;
                  s.productsPaginatedPages[k] = { ...pageResp, items: [created, ...pageResp.items], total: newTotal };
                }
              }
            } catch { /* Optional refresh failed; the current view remains usable. */ }
          });
        } catch { /* Optional refresh failed; the current view remains usable. */ }
      })
      .addCase(updateProduct.fulfilled, (s, a) => {
        const p = a.payload;
        s.products = s.products.map(it => it.id === p.id ? { ...it, ...p } : it);
        s.activeProducts = s.activeProducts.map(it => it.id === p.id ? { ...it, ...p } : it);
        if (s.productsPaginated && Array.isArray(s.productsPaginated.items)) {
          s.productsPaginated.items = s.productsPaginated.items.map(it => it.id === p.id ? { ...it, ...p } : it);
        }

        Object.keys(s.productsPaginatedPages || {}).forEach(k => {
          const pageResp = s.productsPaginatedPages[k];
          if (pageResp && Array.isArray(pageResp.items)) {
            s.productsPaginatedPages[k] = {
              ...pageResp,
              items: pageResp.items.map(it => it.id === p.id ? { ...it, ...p } : it)
            };
          }
        });
      })


      .addCase(addProductImage.fulfilled, (s, a) => {
        try {
          const productId = a.payload?.productId;
          const resp = a.payload?.resp;
          if (productId && resp && (resp.id || resp.url)) {
            const light = { id: resp.id, url: resp.url ?? undefined, name: resp.name, isPrimary: !!resp.isPrimary };
            s.products = s.products.map(p => p.id === Number(productId) ? { ...p, images: [ ...(p.images || []).filter(i => !i.isPrimary), light ] } : p);
            s.activeProducts = s.activeProducts.map(p => p.id === Number(productId) ? { ...p, images: [ ...(p.images || []).filter(i => !i.isPrimary), light ] } : p);
            Object.keys(s.productsPaginatedPages || {}).forEach(k => {
              const pageResp = s.productsPaginatedPages[k];
              if (pageResp && Array.isArray(pageResp.items)) {
                pageResp.items = pageResp.items.map(p => p.id === Number(productId) ? { ...p, images: [ ...(p.images || []).filter(i => !i.isPrimary), light ] } : p);
                s.productsPaginatedPages[k] = pageResp;
              }
            });
          }
        } catch { /* Optional refresh failed; the current view remains usable. */ }
      })
      .addCase(logout.fulfilled, (s) => {
        s.products = [];
        s.productsPaginated = { items: [], total: 0 };
        s.productsPaginatedPages = {};
        s.activeProducts = [];
        s.orders = { items: [], total: 0 };
        s.ordersPages = {};
        s.stats = null;
        s.keysByProduct = {};
        s.loading = false;
        s.error = null;
      })
      .addMatcher(action => /^sellerPanel\/(createProduct|updateProduct|addBulkDigitalKeys|addProductImage|updateProductImage|deleteProductImage|setPrimaryImage)\/fulfilled$/.test(action.type), s => {
        s.productsPaginatedPages = {}; s.stats = null;
      });
  }
});


export const { clearSellerPanel, setProductsPaginatedFromCache } = sellerPanelSlice.actions;
export default sellerPanelSlice.reducer;

export const selectSellerPanel = state => state.sellerPanel;
