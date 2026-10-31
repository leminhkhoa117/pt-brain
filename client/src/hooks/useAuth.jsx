import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  deleteAccount,
  fetchMe,
  loginRequest,
  logoutRequest,
  registerRequest,
  updateMe,
} from '../api/auth.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [age, setAge] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetchMe()
      .then((data) => {
        if (!mounted) return;
        setUser(data.user);
        setAge(data.age);
      })
      .catch(() => {
        if (mounted) setUser(null);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const login = useCallback(async (payload) => {
    const data = await loginRequest(payload);
    setUser(data.user);
    const me = await fetchMe();
    setAge(me.age);
    return data.user;
  }, []);

  const register = useCallback(async (payload) => {
    const data = await registerRequest(payload);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } finally {
      setUser(null);
      setAge(null);
    }
  }, []);

  const saveProfile = useCallback(async (payload) => {
    const data = await updateMe(payload);
    setUser(data.user);
    setAge(data.age);
    return data.user;
  }, []);

  const removeAccount = useCallback(async () => {
    await deleteAccount();
    setUser(null);
    setAge(null);
  }, []);

  const value = useMemo(
    () => ({ user, age, loading, login, register, logout, saveProfile, removeAccount }),
    [user, age, loading, login, register, logout, saveProfile, removeAccount],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth phải dùng bên trong AuthProvider');
  return ctx;
}
