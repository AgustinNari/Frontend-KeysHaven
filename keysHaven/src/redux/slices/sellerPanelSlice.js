import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import sellerService from '../../services/sellerService';
import { logout } from './authSlice';


export const fetchSellerProducts = createAsyncThunk(
  'sellerPanel/fetchProducts',
  async ({ sellerId } = {}, { rejectWithValue }) => {
    try {
      const resp = await sellerService.getSellerProducts(sellerId);
      return resp;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const fetchSellerActiveProducts = createAsyncThunk(
  'sellerPanel/fetchActiveProducts',
  async ({ sellerId } = {}, { rejectWithValue }) => {
    try {
      const resp = await sellerService.getSellerActiveProducts(sellerId);
      return resp;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const fetchSellerProductsPaginated = createAsyncThunk(
  'sellerPanel/fetchProductsPaginated',
  async ({ sellerId, page = 0, size = 10 } = {}, { rejectWithValue }) => {
    try {
      const resp = await sellerService.getSellerProductsPaginated(sellerId, page, size);
      return resp;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const fetchSellerOrders = createAsyncThunk(
  'sellerPanel/fetchOrders',
  async ({ sellerId, page = 0, size = 10, status } = {}, { rejectWithValue }) => {
    try {
      const resp = await sellerService.getSellerOrders({ sellerId, page, size, status });
      return resp;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const fetchSellerStats = createAsyncThunk(
  'sellerPanel/fetchStats',
  async (sellerId, { rejectWithValue }) => {
    try {
      const resp = await sellerService.getSellerStats(sellerId);
      return resp;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const getProductKeys = createAsyncThunk(
  'sellerPanel/getProductKeys',
  async ({ productId, page = 0, size = 20 } = {}, { rejectWithValue }) => {
    try {
      const resp = await sellerService.getProductKeys(productId, page, size);
      return { productId, resp };
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
  activeProducts: [],
  orders: { items: [], total: 0 },
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
      state.activeProducts = [];
      state.orders = { items: [], total: 0 };
      state.stats = null;
      state.keysByProduct = {};
      state.loading = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSellerProducts.fulfilled, (s, a) => { s.products = a.payload ?? []; })
      .addCase(fetchSellerActiveProducts.fulfilled, (s, a) => { s.activeProducts = a.payload ?? []; })
      .addCase(fetchSellerProductsPaginated.fulfilled, (s, a) => {
        s.productsPaginated = { items: a.payload.items ?? a.payload.content ?? [], total: a.payload.total ?? a.payload.totalElements ?? 0 };
      })
      .addCase(fetchSellerOrders.fulfilled, (s, a) => {
        s.orders = a.payload ?? { items: [], total: 0 };
      })
      .addCase(fetchSellerStats.fulfilled, (s, a) => { s.stats = a.payload; })
      .addCase(getProductKeys.fulfilled, (s, a) => {
        const { productId, resp } = a.payload;
        s.keysByProduct[productId] = resp ?? { items: [], total: 0 };
      })

      .addCase(createProduct.fulfilled, (s, a) => {
        s.products = [a.payload, ...s.products];
      })

      .addCase(updateProduct.fulfilled, (s, a) => {
        const p = a.payload;
        s.products = s.products.map(it => it.id === p.id ? { ...it, ...p } : it);
        s.activeProducts = s.activeProducts.map(it => it.id === p.id ? { ...it, ...p } : it);
        if (s.productsPaginated && Array.isArray(s.productsPaginated.items)) {
          s.productsPaginated.items = s.productsPaginated.items.map(it => it.id === p.id ? { ...it, ...p } : it);
        }
      })

      .addCase(addBulkDigitalKeys.fulfilled, (s, a) => {
      })

      .addCase(createSellerDiscount.fulfilled, (s, a) => {
      })
      .addCase(updateSellerDiscount.fulfilled, (s, a) => {
      })

    .addCase(addProductImage.fulfilled, (s, a) => {
      try {
        const productId = a.payload?.productId;
        const resp = a.payload?.resp;
        if (productId && resp && (resp.id || resp.url)) {
          const light = { id: resp.id, url: resp.url ?? undefined, name: resp.name, isPrimary: !!resp.isPrimary };
          s.products = s.products.map(p => p.id === Number(productId) ? { ...p, images: [ ...(p.images || []).filter(i => !i.isPrimary), light ] } : p);
          s.activeProducts = s.activeProducts.map(p => p.id === Number(productId) ? { ...p, images: [ ...(p.images || []).filter(i => !i.isPrimary), light ] } : p);
        }
      } catch (err) {
      }
    })
      .addCase(updateProductImage.fulfilled, (s, a) => {
      })
      .addCase(deleteProductImage.fulfilled, (s, a) => {
      })
      .addCase(setPrimaryImage.fulfilled, (s, a) => {
      })

      .addCase(logout.fulfilled, (s) => {
        s.products = [];
        s.productsPaginated = { items: [], total: 0 };
        s.activeProducts = [];
        s.orders = { items: [], total: 0 };
        s.stats = null;
        s.keysByProduct = {};
        s.loading = false;
        s.error = null;
      });
  }
});

export const { clearSellerPanel } = sellerPanelSlice.actions;
export default sellerPanelSlice.reducer;

export const selectSellerPanel = state => state.sellerPanel;
