import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as authApi from "../services/auth";
import * as usersApi from "../services/users";
import apiClient from "../api/apiClient";

const STORAGE_TOKEN_KEY = "jwtToken";
const STORAGE_USER_KEY = "userProfile";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_TOKEN_KEY));
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(Boolean(token && !user));
  const [error, setError] = useState(null);


  async function persistTokenAndLoadProfile(newToken) {
    localStorage.setItem(STORAGE_TOKEN_KEY, newToken);
    setToken(newToken);

    try {
      const profile = await usersApi.getMyProfile();
      setUser(profile);
      localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(profile));
      setLoading(false);
    } catch (err) {

      console.error("Failed to fetch profile after token set", err);
      logout();
    }
  }


  useEffect(() => {
    let mounted = true;
    if (token && !user) {
      (async () => {
        setLoading(true);
        try {
          const profile = await usersApi.getMyProfile();
          if (!mounted) return;
          setUser(profile);
          localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(profile));
        } catch (err) {
          console.warn("Could not restore profile:", err);
          localStorage.removeItem(STORAGE_TOKEN_KEY);
          localStorage.removeItem(STORAGE_USER_KEY);
          setToken(null);
          setUser(null);
        } finally {
          if (mounted) setLoading(false);
        }
      })();
    }
    return () => (mounted = false);
  }, []);

  async function register(registerRequest) {
    setError(null);
    try {
      const resp = await authApi.register(registerRequest);

      const accessToken = resp.access_token || resp.accessToken || resp.accessTokenToken;
      if (!accessToken) throw new Error("No access token returned by server");
      await persistTokenAndLoadProfile(accessToken);
      return { success: true };
    } catch (err) {
      setError(err);
      return { success: false, error: err };
    }
  }

  async function login({ email, password }) {
    setError(null);
    try {
      const resp = await authApi.authenticate({ email, password });
      const accessToken = resp.access_token || resp.accessToken;
      if (!accessToken) throw new Error("No access token returned by server");
      await persistTokenAndLoadProfile(accessToken);
      return { success: true };
    } catch (err) {
      setError(err);
      return { success: false, error: err };
    }
  }

  function logout() {
    localStorage.removeItem(STORAGE_TOKEN_KEY);
    localStorage.removeItem(STORAGE_USER_KEY);
    setToken(null);
    setUser(null);
    setError(null);

    navigate("/", { replace: true });
  }

    async function refreshProfile() {
    try {
      const profile = await usersApi.getMyProfile();
      setUser(profile);
      localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(profile));
      return profile;
    } catch (err) {
      console.error("refreshProfile failed", err);
      throw err;
    }
  }


  function hasRole(role) {
    if (!user) return false;

    return user.role === role;
  }

  const value = {
    token,
    user,
    loading,
    error,
    isAuthenticated: Boolean(token && user),
    register,
    login,
    logout,
    hasRole,
    refreshProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
