import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import adminService from '../../services/adminService';
import { logout } from './authSlice';


export const fetchAdminStats = createAsyncThunk('admin/fetchStats', async (_, { rejectWithValue }) => {
  try {
    const resp = await adminService.getAdminStats();
    return resp;
  } catch (err) {
    return rejectWithValue(err);
  }
});

export const fetchPlatformMetrics = createAsyncThunk('admin/platformMetrics', async (_, { rejectWithValue }) => {
  try {
    const resp = await adminService.getPlatformMetrics();
    return resp;
  } catch (err) {
    return rejectWithValue(err);
  }
});

export const fetchRecentActivity = createAsyncThunk('admin/recentActivity', async (_, { rejectWithValue }) => {
  try {
    const resp = await adminService.getRecentActivity();
    return resp;
  } catch (err) {
    return rejectWithValue(err);
  }
});

export const fetchUsersPage = createAsyncThunk('admin/usersPage', async ({ page = 1, size = 10 } = {}, { rejectWithValue }) => {
  try {
    const resp = await adminService.getUsersPage(page, size);
    return resp;
  } catch (err) {
    return rejectWithValue(err);
  }
});
export const fetchProductsPage = createAsyncThunk('admin/productsPage', async ({ page = 1, size = 10 } = {}, { rejectWithValue }) => {
  try {
    const resp = await adminService.getProductsPage(page, size);
    return resp;
  } catch (err) {
    return rejectWithValue(err);
  }
});
export const fetchCategoriesPage = createAsyncThunk('admin/categoriesPage', async ({ page = 1, size = 10 } = {}, { rejectWithValue }) => {
  try {
    const resp = await adminService.getCategoriesPage(page, size);
    return resp;
  } catch (err) {
    return rejectWithValue(err);
  }
});
export const fetchDiscountsPage = createAsyncThunk('admin/discountsPage', async ({ page = 1, size = 10 } = {}, { rejectWithValue }) => {
  try {
    const resp = await adminService.getDiscountsPage(page, size);
    return resp;
  } catch (err) {
    return rejectWithValue(err);
  }
});
export const fetchReviewsPage = createAsyncThunk('admin/reviewsPage', async ({ page = 1, size = 10 } = {}, { rejectWithValue }) => {
  try {
    const resp = await adminService.getReviewsPage(page, size);
    return resp;
  } catch (err) {
    return rejectWithValue(err);
  }
});


export const adminUpdateUser = createAsyncThunk('admin/updateUser', async ({ userId, payload }, { rejectWithValue }) => {
  try {
    const resp = await adminService.updateUser(userId, payload);
    return resp;
  } catch (err) {
    return rejectWithValue(err);
  }
});


export const adminUpdateProduct = createAsyncThunk('admin/updateProduct', async ({ productId, productData }, { rejectWithValue }) => {
  try {
    const resp = await adminService.updateProduct(productId, productData);
    return resp;
  } catch (err) {
    return rejectWithValue(err);
  }
});

export const adminToggleReviewVisibility = createAsyncThunk('admin/toggleReview', async ({ reviewId, visible }, { rejectWithValue }) => {
  try {
    const resp = await adminService.toggleReviewVisibility(reviewId, visible);
    return { reviewId, visible, resp };
  } catch (err) {
    return rejectWithValue(err);
  }
});


export const adminCreateCategory = createAsyncThunk('admin/createCategory', async (categoryData, { rejectWithValue }) => {
  try {
    const resp = await adminService.createCategory(categoryData);
    return resp;
  } catch (err) {
    return rejectWithValue(err);
  }
});

export const adminUpdateCategory = createAsyncThunk('admin/updateCategory', async ({ categoryId, categoryData }, { rejectWithValue }) => {
  try {
    const resp = await adminService.updateCategory(categoryId, categoryData);
    return resp;
  } catch (err) {
    return rejectWithValue(err);
  }
});


export const adminCreateDiscount = createAsyncThunk('admin/createDiscount', async (discountData, { rejectWithValue }) => {
  try {
    const resp = await adminService.createDiscount(discountData);
    return resp;
  } catch (err) {
    return rejectWithValue(err);
  }
});


export const adminUpdateDiscount = createAsyncThunk('admin/updateDiscount', async ({ discountId, discountData }, { rejectWithValue }) => {
  try {
    const resp = await adminService.updateDiscount(discountId, discountData);
    return resp;
  } catch (err) {
    return rejectWithValue(err);
  }
});



const initialState = {
  stats: null,
  platformMetrics: null,
  recentActivity: [],
  usersPage: null,
  productsPage: null,
  categoriesPage: null,
  discountsPage: null,
  reviewsPage: null,
  loading: false,
  error: null
};

const adminPanelSlice = createSlice({
  name: 'adminPanel',
  initialState,
  reducers: {
    clearAdminPanel(state) {
      Object.assign(state, initialState);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminStats.fulfilled, (s, a) => { s.stats = a.payload; })
      .addCase(fetchPlatformMetrics.fulfilled, (s, a) => { s.platformMetrics = a.payload; })
      .addCase(fetchRecentActivity.fulfilled, (s, a) => { s.recentActivity = a.payload ?? []; })
      .addCase(fetchUsersPage.fulfilled, (s, a) => { s.usersPage = a.payload; })
      .addCase(fetchProductsPage.fulfilled, (s, a) => { s.productsPage = a.payload; })
      .addCase(fetchCategoriesPage.fulfilled, (s, a) => { s.categoriesPage = a.payload; })
      .addCase(fetchDiscountsPage.fulfilled, (s, a) => { s.discountsPage = a.payload; })
      .addCase(fetchReviewsPage.fulfilled, (s, a) => { s.reviewsPage = a.payload; })

      .addCase(adminUpdateProduct.fulfilled, (s, a) => {
        const payload = a.payload;
        if (s.productsPage && Array.isArray(s.productsPage.content) && payload?.id) {
          s.productsPage.content = s.productsPage.content.map(p => p.id === payload.id ? { ...p, ...payload } : p);
        }
      })
      .addCase(adminToggleReviewVisibility.fulfilled, (s, a) => {
        const { reviewId, visible } = a.payload || {};
        if (s.reviewsPage && Array.isArray(s.reviewsPage.content)) {
          s.reviewsPage.content = s.reviewsPage.content.map(r => r.id === reviewId ? { ...r, hidden: !visible } : r);
        }
        if (s.stats && typeof s.stats.totalReviews === 'number') {
          s.stats.totalReviews = Math.max(0, s.stats.totalReviews + (visible ? 1 : -1));
        }
      })

      .addCase(adminCreateCategory.fulfilled, (s, a) => {
        if (s.categoriesPage && Array.isArray(s.categoriesPage.content)) {
          s.categoriesPage.content = [a.payload, ...s.categoriesPage.content];
          s.categoriesPage.totalElements = (s.categoriesPage.totalElements || 0) + 1;
        }
      })
      .addCase(adminUpdateCategory.fulfilled, (s, a) => {
        if (s.categoriesPage && Array.isArray(s.categoriesPage.content)) {
          s.categoriesPage.content = s.categoriesPage.content.map(c => c.id === a.payload.id ? a.payload : c);
        }
      })

      .addCase(adminCreateDiscount.fulfilled, (s, a) => {
        if (s.discountsPage && Array.isArray(s.discountsPage.content)) {
          s.discountsPage.content = [a.payload, ...s.discountsPage.content];
          s.discountsPage.totalElements = (s.discountsPage.totalElements || 0) + 1;
        }
      })
      .addCase(adminUpdateDiscount.fulfilled, (s, a) => {
        if (s.discountsPage && Array.isArray(s.discountsPage.content)) {
          s.discountsPage.content = s.discountsPage.content.map(d => d.id === a.payload.id ? a.payload : d);
        }
      })

      .addCase(logout.fulfilled, (s) => Object.assign(s, initialState));
  }
});

export const { clearAdminPanel } = adminPanelSlice.actions;
export default adminPanelSlice.reducer;

export const selectAdminPanel = state => state.adminPanel;