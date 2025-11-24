import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as authApi from '../../services/auth';
import * as usersApi from '../../services/users';

const STORAGE_TOKEN_KEY = 'jwtToken';
const STORAGE_USER_KEY = 'userProfile';

function normalizeError(err) {
  try {
    if (!err) return { message: 'Error desconocido' };
    if (err?.message) return err;
    return { message: String(err) };
  } catch {
    return { message: 'Error desconocido' };
  }
}


export const registerThunk = createAsyncThunk(
  'auth/register',
  async (registerPayload, { rejectWithValue }) => {
    try {
      const resp = await authApi.register(registerPayload);
      const accessToken = resp?.access_token || resp?.accessToken || resp?.token;
      if (!accessToken) return rejectWithValue({ message: 'No se recibió token del servidor' });

      localStorage.setItem(STORAGE_TOKEN_KEY, accessToken);

      const profile = await usersApi.getMyProfile();
      try { localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(profile ?? null)); } catch {}

      return { token: accessToken, profile };
    } catch (err) {
      return rejectWithValue(normalizeError(err));
    }
  }
);


export const loginThunk = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const resp = await authApi.authenticate({ email, password });
      const accessToken = resp?.access_token || resp?.accessToken || resp?.token;
      if (!accessToken) return rejectWithValue({ message: 'No se recibió token del servidor' });

      localStorage.setItem(STORAGE_TOKEN_KEY, accessToken);

      const profile = await usersApi.getMyProfile();
      try { localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(profile ?? null)); } catch {}

      return { token: accessToken, profile };
    } catch (err) {
      return rejectWithValue(normalizeError(err));
    }
  }
);


export const fetchProfileThunk = createAsyncThunk(
  'auth/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const profile = await usersApi.getMyProfile();
      try { localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(profile ?? null)); } catch {}
      return profile;
    } catch (err) {
      try { localStorage.removeItem(STORAGE_TOKEN_KEY); localStorage.removeItem(STORAGE_USER_KEY); } catch {}
      return rejectWithValue(normalizeError(err));
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async () => {
  try {
    localStorage.removeItem(STORAGE_TOKEN_KEY);
    localStorage.removeItem(STORAGE_USER_KEY);
  } catch {}
  return null;
});

const initialState = {
  token: typeof window !== 'undefined' ? (localStorage.getItem(STORAGE_TOKEN_KEY) || null) : null,
  user: (() => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_USER_KEY) : null;
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })(),
  loading: false,
  error: null,
  isAuthenticated: !!(typeof window !== 'undefined' && localStorage.getItem(STORAGE_TOKEN_KEY) && localStorage.getItem(STORAGE_USER_KEY)),
};


const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action) {
      state.user = action.payload ?? null;
      try {
        if (state.user) localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(state.user));
        else localStorage.removeItem(STORAGE_USER_KEY);
      } catch {}
      state.isAuthenticated = !!(state.token && state.user);
    },
    setToken(state, action) {
      state.token = action.payload ?? null;
      try {
        if (state.token) localStorage.setItem(STORAGE_TOKEN_KEY, state.token);
        else localStorage.removeItem(STORAGE_TOKEN_KEY);
      } catch {}
      state.isAuthenticated = !!(state.token && state.user);
    },
    clearAuthError(state) {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload?.token ?? state.token;
        state.user = action.payload?.profile ?? state.user;
        state.error = null;
        state.isAuthenticated = !!(state.token && state.user);
      })
      .addCase(registerThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? action.error ?? { message: 'Error al registrarse' };
        state.isAuthenticated = false;
      })

      .addCase(loginThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload?.token ?? state.token;
        state.user = action.payload?.profile ?? state.user;
        state.error = null;
        state.isAuthenticated = !!(state.token && state.user);
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? action.error ?? { message: 'Error al iniciar sesión' };
        state.isAuthenticated = false;
      })

      .addCase(fetchProfileThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfileThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload ?? null;
        state.error = null;
        state.isAuthenticated = !!(state.token && state.user);
      })
      .addCase(fetchProfileThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? action.error ?? { message: 'No se pudo restaurar el perfil' };
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      })

      .addCase(logout.fulfilled, (state) => {
        state.loading = false;
        state.token = null;
        state.user = null;
        state.error = null;
        state.isAuthenticated = false;
      });
  }
});



export const { setUser, setToken, clearAuthError } = authSlice.actions;


export const refreshProfile = fetchProfileThunk;
export const register = registerThunk;
export const login = loginThunk;

export const selectAuth = (state) => state.auth;
export const selectUser = (state) => state.auth.user;
export const selectToken = (state) => state.auth.token;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;

export default authSlice.reducer;
