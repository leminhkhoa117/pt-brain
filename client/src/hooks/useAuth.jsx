import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  changePasswordRequest,
  deleteAccount,
  fetchMe,
  loginRequest,
  logoutRequest,
  markWelcomeSeen,
  refreshRequest,
  registerRequest,
  updateMe,
} from '../api/auth.js';
import { readStored, removeStored, writeStored } from '../lib/persist.js';

const AuthContext = createContext(null);

// Bản sao nhẹ của user để lần mở app sau hiện ngay phiên cũ thay vì nháy về
// trang đăng nhập khi Render đang thức dậy. Không chứa token.
const AUTH_HINT_KEY = 'ptbrain:auth:last-user';
const RESUME_REFRESH_MS = 10 * 60 * 1000;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function AuthProvider({ children }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [age, setAge] = useState(null);
  const [loading, setLoading] = useState(true);
  // Đang dùng phiên lưu trên máy nhưng chưa gọi lại được máy chủ.
  const [offline, setOffline] = useState(false);
  const lastSyncRef = useRef(0);

  // Xóa cache khi đổi/đăng xuất tài khoản để không lộ dữ liệu của user trước
  // trên cùng thiết bị (React Query giữ cache theo key, không theo user).
  const resetSession = useCallback(() => {
    setUser(null);
    setAge(null);
    setOffline(false);
    removeStored(AUTH_HINT_KEY);
    queryClient.clear();
  }, [queryClient]);

  const rememberSession = useCallback((nextUser, nextAge) => {
    setUser(nextUser);
    if (nextAge !== undefined) setAge(nextAge);
    setOffline(false);
    lastSyncRef.current = Date.now();
    if (nextUser) writeStored(AUTH_HINT_KEY, { user: nextUser, age: nextAge, at: Date.now() });
  }, []);

  // Khôi phục phiên: thử lại vài lần cho Render free khỏi "thức dậy" chậm.
  // Chỉ xóa phiên khi máy chủ nói 401/403; lỗi mạng thì giữ phiên đã lưu.
  useEffect(() => {
    let mounted = true;
    const hint = readStored(AUTH_HINT_KEY, null);

    const attempt = async (retriesLeft) => {
      try {
        const data = await fetchMe();
        if (!mounted) return;
        rememberSession(data.user, data.age);
      } catch (error) {
        if (!mounted) return;
        const status = error?.response?.status;
        if (status === 401 || status === 403) {
          resetSession();
          return;
        }
        if (retriesLeft > 0) {
          await wait(retriesLeft === 2 ? 1200 : 3000);
          if (mounted) return attempt(retriesLeft - 1);
          return;
        }
        // Hết lượt thử mà chỉ lỗi mạng/5xx: giữ phiên đã lưu để người dùng
        // không bị đá ra trang đăng nhập oan.
        if (hint?.user) {
          setUser(hint.user);
          setAge(hint.age ?? null);
          setOffline(true);
        } else {
          setUser(null);
        }
      }
    };

    attempt(2).finally(() => {
      if (mounted) setLoading(false);
    });

    return () => {
      mounted = false;
    };
  }, [rememberSession, resetSession]);

  useEffect(() => {
    const onExpired = () => resetSession();
    window.addEventListener('pt-auth-expired', onExpired);
    return () => window.removeEventListener('pt-auth-expired', onExpired);
  }, [resetSession]);

  // PWA/tab được mở lại sau một lúc: chủ động gia hạn refresh token để phiên
  // luôn "trượt" theo thời gian thay vì chờ access token hết hạn giữa lúc dùng.
  useEffect(() => {
    if (!user) return undefined;
    const onVisible = () => {
      if (document.visibilityState !== 'visible') return;
      if (Date.now() - lastSyncRef.current < RESUME_REFRESH_MS) return;
      lastSyncRef.current = Date.now();
      refreshRequest()
        .then(() => setOffline(false))
        .catch((error) => {
          const status = error?.response?.status;
          if (status === 401 || status === 403) resetSession();
        });
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [resetSession, user]);

  const login = useCallback(
    async (payload) => {
      const data = await loginRequest(payload);
      queryClient.clear();
      rememberSession(data.user, null);
      const me = await fetchMe();
      rememberSession(me.user, me.age);
      return data.user;
    },
    [queryClient, rememberSession],
  );

  const register = useCallback(
    async (payload) => {
      const data = await registerRequest(payload);
      queryClient.clear();
      rememberSession(data.user, null);
      return data.user;
    },
    [queryClient, rememberSession],
  );

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } finally {
      resetSession();
    }
  }, [resetSession]);

  const saveProfile = useCallback(
    async (payload) => {
      const data = await updateMe(payload);
      rememberSession(data.user, data.age);
      return data.user;
    },
    [rememberSession],
  );

  const changePassword = useCallback(
    async (payload) => {
      const data = await changePasswordRequest(payload);
      rememberSession(data.user, data.age);
      return data;
    },
    [rememberSession],
  );

  const completeWelcome = useCallback(async () => {
    const data = await markWelcomeSeen();
    rememberSession(data.user, data.age);
    return data.user;
  }, [rememberSession]);

  const removeAccount = useCallback(async (payload) => {
    await deleteAccount(payload);
    resetSession();
  }, [resetSession]);

  const value = useMemo(
    () => ({
      user,
      age,
      loading,
      offline,
      login,
      register,
      logout,
      saveProfile,
      changePassword,
      completeWelcome,
      removeAccount,
    }),
    [
      user,
      age,
      loading,
      offline,
      login,
      register,
      logout,
      saveProfile,
      changePassword,
      completeWelcome,
      removeAccount,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth phải dùng bên trong AuthProvider');
  return ctx;
}
