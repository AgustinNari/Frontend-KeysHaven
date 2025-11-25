// store/slices/sellerDetailSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getSellerStats, getSellerActiveProductsForDetail } from '../../services/sellerService';
import { parseApiError } from '../../api/apiError';

// Thunk para cargar datos del seller
export const fetchSellerDetail = createAsyncThunk(
  'sellerDetail/fetchSellerDetail',
  async (sellerId, { rejectWithValue }) => {
    try {
      console.log("🔍 Cargando datos para sellerId:", sellerId);
      
      const stats = await getSellerStats(sellerId);
      console.log("📊 Stats recibidas:", stats);
      
      if (!stats) {
        return rejectWithValue(parseApiError(new Error("Vendedor no encontrado")));
      }

      const activeProducts = await getSellerActiveProductsForDetail(sellerId);
      console.log("🎮 Productos activos recibidos:", activeProducts);

      // Construir objeto seller
      const sellerData = {
        id: sellerId,
        displayName: stats.displayName || `Vendedor #${sellerId}`,
        sellerDescription: stats.sellerDescription || "Vendedor de productos digitales",
        avatarDataUrl: stats.avatarDataUrl || null,
        firstName: stats.firstName || "",
        lastName: stats.lastName || "",
        email: stats.email || "",
        phone: stats.phone || "",
        country: stats.country || "",
        avgRating: stats.avgRating || 0,
        ratingCount: stats.ratingCount || 0,
        soldKeys: stats.soldKeys || 0,
        amountSold: stats.amountSold || 0,
        totalSales: stats.totalSales || 0,
        totalRevenue: stats.totalRevenue || 0,
        activeProducts: stats.activeProducts || 0,
        totalProducts: stats.totalProducts || 0
      };

      return {
        seller: sellerData,
        products: activeProducts || []
      };
    } catch (err) {
      console.error("❌ Error cargando datos del seller:", err);
      return rejectWithValue(parseApiError(err));
    }
  }
);

const sellerDetailSlice = createSlice({
  name: 'sellerDetail',
  initialState: {
    seller: null,
    products: [],
    loading: false,
    error: null,
    page: 1,
    pageSize: 10
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setPage: (state, action) => {
      state.page = action.payload;
    },
    clearSellerDetail: (state) => {
      state.seller = null;
      state.products = [];
      state.loading = false;
      state.error = null;
      state.page = 1;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSellerDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSellerDetail.fulfilled, (state, action) => {
        state.loading = false;
        state.seller = action.payload.seller;
        state.products = action.payload.products;
        state.page = 1;
        state.error = null;
      })
      .addCase(fetchSellerDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError, setPage, clearSellerDetail } = sellerDetailSlice.actions;
export default sellerDetailSlice.reducer;