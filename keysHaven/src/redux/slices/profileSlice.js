import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import usersService from '../../services/users';
import discountsService from '../../services/discountsService';
import { logout } from './authSlice';
import { createOrder } from './ordersSlice';
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
    me: null,
    coupons: [],
    loading: false,
    error: null
    };

    const profileSlice = createSlice({
    name: 'profile',
    initialState,
    reducers: {
        clearProfile(state) { Object.assign(state, initialState); }
    },
    extraReducers: (builder) => {
        builder
        .addCase(fetchMyProfile.fulfilled, (s, a) => { s.me = a.payload; })
        .addCase(updateMyUser.fulfilled, (s, a) => { s.me = a.payload; })
        .addCase(fetchMyCoupons.fulfilled, (s, a) => { s.coupons = a.payload?.content ?? a.payload ?? []; })

        .addCase(createOrder.fulfilled, (s, a) => {
            const serverOrder = a.payload;
            if (serverOrder?.newBalance != null) {
            s.me = s.me ? { ...s.me, balance: serverOrder.newBalance } : s.me;
            }
        })

        .addCase(logout.fulfilled, (s) => Object.assign(s, initialState))
        .addCase(uploadAvatar.fulfilled, (s, a) => {
            if (a.payload?.id) s.me = a.payload;
            else if (a.payload?.avatarDataUrl && s.me) s.me.avatarDataUrl = a.payload.avatarDataUrl;
        })
        .addCase(replaceAvatar.fulfilled, (s, a) => {
            if (a.payload?.id) s.me = a.payload;
            else if (a.payload?.avatarDataUrl && s.me) s.me.avatarDataUrl = a.payload.avatarDataUrl;
        })
        .addCase(deleteAvatar.fulfilled, (s, a) => {
            if (s.me) s.me.avatarDataUrl = null;
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
export const selectProfileCoupons = state => state.profile.coupons;
