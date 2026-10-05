import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import usersService from '../../services/users';
import discountsService from '../../services/discountsService';
import { logout } from './authSlice';
import authService from '../../services/auth';

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

const initialState = {
  meFetchedAt: null, coupons: [], couponsFetchedAt: null, loading: false, error: null
};

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    clearProfile(state) { Object.assign(state, { meFetchedAt: null, coupons: [], couponsFetchedAt: null, loading: false, error: null }); }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyProfile.fulfilled, (s) => {
        s.meFetchedAt = Date.now();
      })
      .addCase(updateMyUser.fulfilled, (s) => {
        s.meFetchedAt = Date.now();
      })
      .addCase(fetchMyCoupons.fulfilled, (s, a) => {
        const items = a.payload?.content ?? a.payload ?? [];
        s.coupons = items;
        s.couponsFetchedAt = Date.now();
      })

      .addCase(logout.fulfilled, (s) => {
        Object.assign(s, { meFetchedAt: null, coupons: [], couponsFetchedAt: null, loading: false, error: null });
      })

      .addCase(fetchMyProfile.rejected, (s, a) => { s.error = a.payload || a.error; })
      .addCase(updateMyUser.rejected, (s, a) => { s.error = a.payload || a.error; })
      .addCase(fetchMyCoupons.rejected, (s, a) => { s.error = a.payload || a.error; })
      .addCase(uploadAvatar.rejected, (s, a) => { s.error = a.payload || a.error; })
      .addCase(replaceAvatar.rejected, (s, a) => { s.error = a.payload || a.error; })
      .addCase(deleteAvatar.rejected, (s, a) => { s.error = a.payload || a.error; })
      .addCase(changePasswordThunk.rejected, (s, a) => { s.error = a.payload || a.error; });
  }
});

export const { clearProfile } = profileSlice.actions;
export default profileSlice.reducer;

export const selectProfile = state => state.auth.user;
export const selectProfileFetchedAt = state => state.profile.meFetchedAt;
export const selectProfileCoupons = state => state.profile.coupons;
export const selectProfileCouponsFetchedAt = state => state.profile.couponsFetchedAt;
