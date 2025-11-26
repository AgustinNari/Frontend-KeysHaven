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
    return { ...resp, __page: page, __size: size };
  } catch (err) {
    return rejectWithValue(err);
  }
});
export const fetchProductsPage = createAsyncThunk('admin/productsPage', async ({ page = 1, size = 10 } = {}, { rejectWithValue }) => {
  try {
    const resp = await adminService.getProductsPage(page, size);
    return { ...resp, __page: page, __size: size };
  } catch (err) {
    return rejectWithValue(err);
  }
});
export const fetchCategoriesPage = createAsyncThunk('admin/categoriesPage', async ({ page = 1, size = 10 } = {}, { rejectWithValue }) => {
  try {
    const resp = await adminService.getCategoriesPage(page, size);
    return { ...resp, __page: page, __size: size };
  } catch (err) {
    return rejectWithValue(err);
  }
});
export const fetchDiscountsPage = createAsyncThunk('admin/discountsPage', async ({ page = 1, size = 10 } = {}, { rejectWithValue }) => {
  try {
    const resp = await adminService.getDiscountsPage(page, size);
    return { ...resp, __page: page, __size: size };
  } catch (err) {
    return rejectWithValue(err);
  }
});
export const fetchReviewsPage = createAsyncThunk('admin/reviewsPage', async ({ page = 1, size = 10 } = {}, { rejectWithValue }) => {
  try {
    const resp = await adminService.getReviewsPage(page, size);
    return { ...resp, __page: page, __size: size };
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
  usersPageCache: {},
  productsPageCache: {},
  categoriesPageCache: {},
  discountsPageCache: {},
  reviewsPageCache: {},
  loading: false,
  error: null
};

const adminPanelSlice = createSlice({
  name: 'adminPanel',
  initialState,
  reducers: {
    clearAdminPanel(state) {
      Object.assign(state, initialState);
    },
    invalidateUsersCache(state) { state.usersPageCache = {}; },
    invalidateProductsCache(state) { state.productsPageCache = {}; },
    invalidateCategoriesCache(state) { state.categoriesPageCache = {}; },
    invalidateDiscountsCache(state) { state.discountsPageCache = {}; },
    invalidateReviewsCache(state) { state.reviewsPageCache = {}; },

    setUsersPageFromCache(state, action) {
      const key = action.payload?.key;
      if (!key) return;
      const pageObj = state.usersPageCache?.[key];
      if (pageObj) state.usersPage = pageObj;
    },
    setProductsPageFromCache(state, action) {
      const key = action.payload?.key;
      if (!key) return;
      const pageObj = state.productsPageCache?.[key];
      if (pageObj) state.productsPage = pageObj;
    },
    setCategoriesPageFromCache(state, action) {
      const key = action.payload?.key;
      if (!key) return;
      const pageObj = state.categoriesPageCache?.[key];
      if (pageObj) state.categoriesPage = pageObj;
    },
    setDiscountsPageFromCache(state, action) {
      const key = action.payload?.key;
      if (!key) return;
      const pageObj = state.discountsPageCache?.[key];
      if (pageObj) state.discountsPage = pageObj;
    },
    setReviewsPageFromCache(state, action) {
      const key = action.payload?.key;
      if (!key) return;
      const pageObj = state.reviewsPageCache?.[key];
      if (pageObj) state.reviewsPage = pageObj;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminStats.fulfilled, (s, a) => { s.stats = a.payload; })
      .addCase(fetchPlatformMetrics.fulfilled, (s, a) => { s.platformMetrics = a.payload; })
      .addCase(fetchRecentActivity.fulfilled, (s, a) => { s.recentActivity = a.payload ?? []; })

      .addCase(fetchUsersPage.fulfilled, (s, a) => {
        s.usersPage = a.payload;
        const page = a.payload?.__page ?? (a.payload?.number ?? 1);
        const size = a.payload?.__size ?? (a.payload?.size ?? 10);
        const key = `${page}_${size}`;
        s.usersPageCache[key] = a.payload;
      })
      .addCase(fetchProductsPage.fulfilled, (s, a) => {
        s.productsPage = a.payload;
        const page = a.payload?.__page ?? (a.payload?.number ?? 1);
        const size = a.payload?.__size ?? (a.payload?.size ?? 10);
        s.productsPageCache[`${page}_${size}`] = a.payload;
      })
      .addCase(fetchCategoriesPage.fulfilled, (s, a) => {
        s.categoriesPage = a.payload;
        const page = a.payload?.__page ?? (a.payload?.number ?? 1);
        const size = a.payload?.__size ?? (a.payload?.size ?? 10);
        s.categoriesPageCache[`${page}_${size}`] = a.payload;
      })
      .addCase(fetchDiscountsPage.fulfilled, (s, a) => {
        s.discountsPage = a.payload;
        const page = a.payload?.__page ?? (a.payload?.number ?? 1);
        const size = a.payload?.__size ?? (a.payload?.size ?? 10);
        s.discountsPageCache[`${page}_${size}`] = a.payload;
      })
      .addCase(fetchReviewsPage.fulfilled, (s, a) => {
        s.reviewsPage = a.payload;
        const page = a.payload?.__page ?? (a.payload?.number ?? 1);
        const size = a.payload?.__size ?? (a.payload?.size ?? 10);
        s.reviewsPageCache[`${page}_${size}`] = a.payload;
      })

      .addCase(adminUpdateUser.fulfilled, (s, a) => {
        const updated = a.payload;
        if (!updated || !updated.id) return;
        if (s.usersPage && Array.isArray(s.usersPage.content)) {
          s.usersPage.content = s.usersPage.content.map(u => u.id === updated.id ? { ...u, ...updated } : u);
        }
        Object.keys(s.usersPageCache).forEach(k => {
          const pageObj = s.usersPageCache[k];
          if (pageObj && Array.isArray(pageObj.content)) {
            pageObj.content = pageObj.content.map(u => u.id === updated.id ? { ...u, ...updated } : u);
            s.usersPageCache[k] = pageObj;
          }
        });
      })

      .addCase(adminUpdateProduct.fulfilled, (s, a) => {
        const payload = a.payload;
        if (!payload || !payload.id) return;
        if (s.productsPage && Array.isArray(s.productsPage.content)) {
          s.productsPage.content = s.productsPage.content.map(p => p.id === payload.id ? { ...p, ...payload } : p);
        }
        Object.keys(s.productsPageCache).forEach(k => {
          const pageObj = s.productsPageCache[k];
          if (pageObj && Array.isArray(pageObj.content)) {
            pageObj.content = pageObj.content.map(p => p.id === payload.id ? { ...p, ...payload } : p);
            s.productsPageCache[k] = pageObj;
          }
        });
      })

      .addCase(adminToggleReviewVisibility.fulfilled, (s, a) => {
        const { reviewId, visible, resp } = a.payload || {};
        let finalVisible;
        if (resp && typeof resp.visible === 'boolean') finalVisible = resp.visible;
        else if (resp && typeof resp.hidden === 'boolean') finalVisible = !resp.hidden;
        else if (typeof visible === 'boolean') finalVisible = visible;
        else finalVisible = true;

        const setProps = (r) => {
          r.visible = finalVisible;
          r.hidden = !finalVisible;
          return r;
        };

        if (s.reviewsPage && Array.isArray(s.reviewsPage.content)) {
          s.reviewsPage.content = s.reviewsPage.content.map(r => r.id === reviewId ? setProps({ ...(r || {}), ...(resp || {}) }) : r);
        }
        Object.keys(s.reviewsPageCache).forEach(k => {
          const pageObj = s.reviewsPageCache[k];
          if (pageObj && Array.isArray(pageObj.content)) {
            pageObj.content = pageObj.content.map(r => r.id === reviewId ? setProps({ ...(r || {}), ...(resp || {}) }) : r);
            s.reviewsPageCache[k] = pageObj;
          }
        });

        if (s.stats && typeof s.stats.totalReviews === 'number') {
          s.stats.totalReviews = Math.max(0, s.stats.totalReviews + (finalVisible ? 1 : -1));
        }
      })

      .addCase(adminCreateCategory.fulfilled, (s, a) => {
        if (s.categoriesPage && Array.isArray(s.categoriesPage.content)) {
          s.categoriesPage.content = [a.payload, ...s.categoriesPage.content];
          s.categoriesPage.totalElements = (s.categoriesPage.totalElements || 0) + 1;
        }
        const k1 = `1_${s.categoriesPage?.size ?? 10}`;
        if (s.categoriesPageCache[k1] && Array.isArray(s.categoriesPageCache[k1].content)) {
          s.categoriesPageCache[k1].content = [a.payload, ...s.categoriesPageCache[k1].content];
          s.categoriesPageCache[k1].totalElements = (s.categoriesPageCache[k1].totalElements || 0) + 1;
        }
      })
      .addCase(adminUpdateCategory.fulfilled, (s, a) => {
        if (s.categoriesPage && Array.isArray(s.categoriesPage.content)) {
          s.categoriesPage.content = s.categoriesPage.content.map(c => c.id === a.payload.id ? a.payload : c);
        }
        Object.keys(s.categoriesPageCache).forEach(k => {
          const pageObj = s.categoriesPageCache[k];
          if (pageObj && Array.isArray(pageObj.content)) {
            pageObj.content = pageObj.content.map(c => c.id === a.payload.id ? a.payload : c);
            s.categoriesPageCache[k] = pageObj;
          }
        });
      })

      .addCase(adminCreateDiscount.fulfilled, (s, a) => {
        if (s.discountsPage && Array.isArray(s.discountsPage.content)) {
          s.discountsPage.content = [a.payload, ...s.discountsPage.content];
          s.discountsPage.totalElements = (s.discountsPage.totalElements || 0) + 1;
        }
        const k1 = `1_${s.discountsPage?.size ?? 10}`;
        if (s.discountsPageCache[k1] && Array.isArray(s.discountsPageCache[k1].content)) {
          s.discountsPageCache[k1].content = [a.payload, ...s.discountsPageCache[k1].content];
          s.discountsPageCache[k1].totalElements = (s.discountsPageCache[k1].totalElements || 0) + 1;
        }
      })
      .addCase(adminUpdateDiscount.fulfilled, (s, a) => {
        if (s.discountsPage && Array.isArray(s.discountsPage.content)) {
          s.discountsPage.content = s.discountsPage.content.map(d => d.id === a.payload.id ? a.payload : d);
        }
        Object.keys(s.discountsPageCache).forEach(k => {
          const pageObj = s.discountsPageCache[k];
          if (pageObj && Array.isArray(pageObj.content)) {
            pageObj.content = pageObj.content.map(d => d.id === a.payload.id ? a.payload : d);
            s.discountsPageCache[k] = pageObj;
          }
        });
      })

      .addCase(logout.fulfilled, (s) => Object.assign(s, initialState));
  }
});

export const {
  clearAdminPanel,
  invalidateUsersCache,
  invalidateProductsCache,
  invalidateCategoriesCache,
  invalidateDiscountsCache,
  invalidateReviewsCache,
  setUsersPageFromCache,
  setProductsPageFromCache,
  setCategoriesPageFromCache,
  setDiscountsPageFromCache,
  setReviewsPageFromCache
} = adminPanelSlice.actions;
export default adminPanelSlice.reducer;
export const selectAdminPanel = state => state.adminPanel;
