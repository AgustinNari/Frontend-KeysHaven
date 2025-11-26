import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import usersService from '../../services/users';
import discountsService from '../../services/discountsService';
import { logout } from './authSlice';
import { createOrder } from './ordersSlice';
import authService from '../../services/auth';

const LS_KEYS = {
  ME: 'app_profile_me_v1',
  COUPONS: 'app_profile_coupons_v1'
};

function loadFromStorage(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch { }
}

export const fetchMyProfile = createAsyncThunk('profile/fetchMe', async (_, { rejectWithValue }) => {
  try {
    const resp = await usersService.getMyProfile();
    return resp;
  } catch (err) {
    return rejectWithValue(err);
  }
});

export const updateMyUser = createAsyncThunk('profile/updateUser', async ({ userId, dto }, { rejectWithValue }) => {
  try {
    const resp = await usersService.updateUser(userId, dto);
    return resp;
  } catch (err) {
    return rejectWithValue(err);
  }
});

export const fetchMyCoupons = createAsyncThunk('profile/fetchMyCoupons', async (_, { rejectWithValue }) => {
  try {
    const resp = await discountsService.getActiveCouponsByBuyer(0, 200);
    return resp;
  } catch (err) {
    return rejectWithValue(err);
  }
});

export const uploadAvatar = createAsyncThunk(
  'profile/uploadAvatar',
  async ({ userId, file }, { rejectWithValue }) => {
    try {
      const resp = await usersService.uploadAvatar(userId, file);
      return resp;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const replaceAvatar = createAsyncThunk(
  'profile/replaceAvatar',
  async ({ userId, file }, { rejectWithValue }) => {
    try {
      const resp = await usersService.replaceAvatar(userId, file);
      return resp;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const deleteAvatar = createAsyncThunk(
  'profile/deleteAvatar',
  async (userId, { rejectWithValue }) => {
    try {
      const resp = await usersService.deleteAvatar(userId);
      return resp;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const changePasswordThunk = createAsyncThunk(
  'profile/changePassword',
  async ({ currentPassword, newPassword }, { rejectWithValue }) => {
    try {
      const resp = await authService.changePassword({ currentPassword, newPassword });
      return resp;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

const savedMe = loadFromStorage(LS_KEYS.ME);
const savedCoupons = loadFromStorage(LS_KEYS.COUPONS);

const initialState = {
  me: savedMe?.data ?? null,
  meFetchedAt: savedMe?.fetchedAt ?? null,
  coupons: savedCoupons?.data ?? [],
  couponsFetchedAt: savedCoupons?.fetchedAt ?? null,
  loading: false,
  error: null
};

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    clearProfile(state) { Object.assign(state, { me: null, meFetchedAt: null, coupons: [], couponsFetchedAt: null, loading: false, error: null }); }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyProfile.fulfilled, (s, a) => {
        s.me = a.payload;
        s.meFetchedAt = Date.now();
        saveToStorage(LS_KEYS.ME, { data: s.me, fetchedAt: s.meFetchedAt });
      })
      .addCase(updateMyUser.fulfilled, (s, a) => {
        s.me = a.payload;
        s.meFetchedAt = Date.now();
        saveToStorage(LS_KEYS.ME, { data: s.me, fetchedAt: s.meFetchedAt });
      })
      .addCase(fetchMyCoupons.fulfilled, (s, a) => {
        const items = a.payload?.content ?? a.payload ?? [];
        s.coupons = items;
        s.couponsFetchedAt = Date.now();
        saveToStorage(LS_KEYS.COUPONS, { data: s.coupons, fetchedAt: s.couponsFetchedAt });
      })

      .addCase(createOrder.fulfilled, (s, a) => {
        const serverOrder = a.payload;
        if (serverOrder?.newBalance != null) {
          s.me = s.me ? { ...s.me, buyerBalance: serverOrder.newBalance } : s.me;
          s.meFetchedAt = Date.now();
          saveToStorage(LS_KEYS.ME, { data: s.me, fetchedAt: s.meFetchedAt });
        }
      })

      .addCase(logout.fulfilled, (s) => {
        Object.assign(s, { me: null, meFetchedAt: null, coupons: [], couponsFetchedAt: null, loading: false, error: null });
        try { localStorage.removeItem(LS_KEYS.ME); localStorage.removeItem(LS_KEYS.COUPONS); } catch {}
      })

      .addCase(uploadAvatar.fulfilled, (s, a) => {
        if (a.payload?.id) s.me = a.payload;
        else if (a.payload?.avatarDataUrl && s.me) s.me.avatarDataUrl = a.payload.avatarDataUrl;
        s.meFetchedAt = Date.now();
        saveToStorage(LS_KEYS.ME, { data: s.me, fetchedAt: s.meFetchedAt });
      })
      .addCase(replaceAvatar.fulfilled, (s, a) => {
        if (a.payload?.id) s.me = a.payload;
        else if (a.payload?.avatarDataUrl && s.me) s.me.avatarDataUrl = a.payload.avatarDataUrl;
        s.meFetchedAt = Date.now();
        saveToStorage(LS_KEYS.ME, { data: s.me, fetchedAt: s.meFetchedAt });
      })
      .addCase(deleteAvatar.fulfilled, (s, a) => {
        if (s.me) s.me.avatarDataUrl = null;
        s.meFetchedAt = Date.now();
        saveToStorage(LS_KEYS.ME, { data: s.me, fetchedAt: s.meFetchedAt });
      })
      .addCase(changePasswordThunk.fulfilled, (s, a) => {
      })
      .addCase(uploadAvatar.rejected, (s, a) => { s.error = a.payload || a.error; })
      .addCase(replaceAvatar.rejected, (s, a) => { s.error = a.payload || a.error; })
      .addCase(deleteAvatar.rejected, (s, a) => { s.error = a.payload || a.error; })
      .addCase(changePasswordThunk.rejected, (s, a) => { s.error = a.payload || a.error; });
  }
});

export const { clearProfile } = profileSlice.actions;
export default profileSlice.reducer;

export const selectProfile = state => state.profile.me;
export const selectProfileFetchedAt = state => state.profile.meFetchedAt;
export const selectProfileCoupons = state => state.profile.coupons;
export const selectProfileCouponsFetchedAt = state => state.profile.couponsFetchedAt;
