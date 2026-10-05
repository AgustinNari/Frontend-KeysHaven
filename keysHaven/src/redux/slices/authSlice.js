import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as authApi from '../../services/auth';
import * as usersApi from '../../services/users';

function readToken() {
  try { return globalThis.localStorage?.getItem('jwtToken') || null; }
  catch { return null; }
}
function errorData(err) {
  return { message: err?.body?.message || err?.message || 'Error desconocido', status: err?.status || 0 };
}
async function authenticate(payload, api, { dispatch, rejectWithValue, getState, requestId }) {
  try {
    const resp = await api(payload);
    const token = resp?.access_token ?? resp?.accessToken ?? resp?.token;
    if (!token) throw new Error('No se recibió token del servidor');
    if (getState().auth.requestId !== requestId) throw new Error('Solicitud de sesión cancelada');
    dispatch(setToken(token));
    const profile = await usersApi.getMyProfile();
    if (!profile?.id) throw new Error('No se recibió el perfil del usuario');
    return { token, profile };
  } catch (err) {
    return rejectWithValue(errorData(err));
  }
}
export const registerThunk = createAsyncThunk('auth/register', (payload, api) => authenticate(payload, authApi.register, api));
export const loginThunk = createAsyncThunk('auth/login', (payload, api) => authenticate(payload, authApi.authenticate, api));
export const fetchProfileThunk = createAsyncThunk('auth/fetchProfile', async (_, { rejectWithValue }) => {
  try {
    const profile = await usersApi.getMyProfile();
    if (!profile?.id) throw new Error('Perfil no disponible');
    return profile;
  } catch (err) { return rejectWithValue(errorData(err)); }
}, { condition: (_, { getState }) => !!getState().auth.token && !getState().auth.requestId });
export const logout = createAsyncThunk('auth/logout', async () => null);

const initialToken = readToken();
const initialState = {
  token: initialToken, user: null, loading: !!initialToken, error: null,
  isAuthenticated: false, requestId: null
};
const authSlice = createSlice({
  name: 'auth', initialState,
  reducers: {
    setUser(state, action) {
      if (!state.token || (state.user && action.payload && Number(state.user.id) !== Number(action.payload.id))) return;
      state.user = action.payload ?? null;
      state.isAuthenticated = !!(state.token && state.user);
    },
    setToken(state, action) {
      state.token = action.payload ?? null;
      state.isAuthenticated = !!(state.token && state.user);
    },
    clearAuthError(state) { state.error = null; }
  },
  extraReducers: builder => {
    for (const thunk of [loginThunk, registerThunk, fetchProfileThunk]) {
      builder.addCase(thunk.pending, (state, action) => {
        state.loading = true; state.error = null; state.requestId = action.meta.requestId;
      });
      builder.addCase(thunk.fulfilled, (state, action) => {
        if (state.requestId !== action.meta.requestId) return;
        state.loading = false; state.error = null; state.requestId = null;
        if (thunk !== fetchProfileThunk) state.token = action.payload.token;
        state.user = thunk === fetchProfileThunk ? action.payload : action.payload.profile;
        state.isAuthenticated = !!(state.token && state.user);
      });
      builder.addCase(thunk.rejected, (state, action) => {
        if (state.requestId !== action.meta.requestId) return;
        state.loading = false; state.requestId = null;
        state.error = action.payload ?? action.error;
        if (thunk !== fetchProfileThunk || action.payload?.status === 401) {
          state.token = null; state.user = null; state.isAuthenticated = false;
        }
      });
    }
    for (const action of [logout.pending, logout.fulfilled]) {
      builder.addCase(action, state => {
        state.token = null; state.user = null; state.loading = false;
        state.error = null; state.isAuthenticated = false; state.requestId = null;
      });
    }
    // Profile edits use the same user as navigation and role checks.
    builder.addMatcher(action => ['profile/fetchMe/fulfilled', 'profile/updateUser/fulfilled'].includes(action.type), (state, action) => {
      if (state.token && action.payload?.id) {
        state.user = action.payload; state.isAuthenticated = true;
      }
    });
    builder.addMatcher(action => ['profile/uploadAvatar/fulfilled', 'profile/replaceAvatar/fulfilled', 'profile/deleteAvatar/fulfilled'].includes(action.type), (state, action) => {
      if (state.user && Number(action.payload?.userId) === Number(state.user.id)) {
        state.user.avatarDataUrl = action.type === 'profile/deleteAvatar/fulfilled' ? null : action.payload.dataUrl;
      }
    });
  }
});
export const { setUser, setToken, clearAuthError } = authSlice.actions;
export const refreshProfile = fetchProfileThunk;
export const register = registerThunk;
export const login = loginThunk;
export const selectAuth = state => state.auth;
export const selectUser = state => state.auth.user;
export const selectToken = state => state.auth.token;
export const selectIsAuthenticated = state => state.auth.isAuthenticated;
export const selectAuthLoading = state => state.auth.loading;
export const selectAuthError = state => state.auth.error;
export default authSlice.reducer;
