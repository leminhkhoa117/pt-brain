import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
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
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [age, setAge] = useState(null);
  const [loading, setLoading] = useState(true);

  // Xóa cache khi đổi/đăng xuất tài khoản để không lộ dữ liệu của user trước
  // trên cùng thiết bị (React Query giữ cache theo key, không theo user).
  const resetSession = useCallback(() => {
    setUser(null);
    setAge(null);
    queryClient.clear();
  }, [queryClient]);

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

  useEffect(() => {
    const onExpired = () => resetSession();
    window.addEventListener('pt-auth-expired', onExpired);
    return () => window.removeEventListener('pt-auth-expired', onExpired);
  }, [resetSession]);

  const login = useCallback(
    async (payload) => {
      const data = await loginRequest(payload);
      queryClient.clear();
      setUser(data.user);
      const me = await fetchMe();
      setAge(me.age);
      return data.user;
    },
    [queryClient],
  );

  const register = useCallback(
    async (payload) => {
      const data = await registerRequest(payload);
      queryClient.clear();
      setUser(data.user);
      return data.user;
    },
    [queryClient],
  );

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } finally {
      resetSession();
    }
  }, [resetSession]);

  const saveProfile = useCallback(async (payload) => {
    const data = await updateMe(payload);
    setUser(data.user);
    setAge(data.age);
    return data.user;
  }, []);

  const removeAccount = useCallback(async () => {
    await deleteAccount();
    resetSession();
  }, [resetSession]);

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
