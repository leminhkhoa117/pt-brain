import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || '/api',
  withCredentials: true,
  // Render free ngủ sau ~15 phút; request đầu tiên có thể mất 50-60 giây để
  // đánh thức instance. Để 90 giây để người dùng không bị lỗi oan khi mở app.
  timeout: 90000,
});

// Endpoint có gọi AI (tóm tắt, tìm nghiên cứu, vision, quiz, meal plan…) chạy lâu
// hơn CRUD thường rất nhiều; timeout 30s mặc định sẽ cắt ngang và báo
// "Máy chủ phản hồi quá lâu" dù server vẫn đang xử lý bình thường.
// Đo thực tế: tìm nghiên cứu ~50-60s, meal plan ~120s; server cho phép mỗi lượt
// AI tới 180s và một số luồng retry 2 lần nên trần client đặt trên mức đó.
export const AI_TIMEOUT_MS = 420000;

let refreshPromise = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;
    const isAuthCall = original?.url?.includes('/auth/');
    if (status !== 401 || !original || original._retried || isAuthCall) {
      return Promise.reject(error);
    }
    original._retried = true;
    try {
      refreshPromise = refreshPromise || api.post('/auth/refresh');
      await refreshPromise;
      refreshPromise = null;
      return api(original);
    } catch (refreshError) {
      refreshPromise = null;
      // Cho AuthProvider biết phiên đã hết hạn để điều hướng về /login thay vì
      // để người dùng mắc kẹt trên trang với mọi query đều lỗi 401.
      window.dispatchEvent(new Event('pt-auth-expired'));
      return Promise.reject(refreshError);
    }
  },
);

export function unwrap(response) {
  return response.data?.data;
}

export function getErrorMessage(error, fallback = 'Có lỗi xảy ra, vui lòng thử lại') {
  const details = error?.response?.data?.error?.details;
  if (Array.isArray(details) && details.length) {
    return details.map((d) => d.message).join('; ');
  }
  const message = error?.response?.data?.error?.message;
  if (message) return message;
  // Dev proxy trả 500 rỗng khi API chưa kịp khởi động lại; axios chỉ có câu
  // "Request failed with status code 500" nên thay bằng thông báo dễ hiểu.
  if (error?.code === 'ECONNABORTED') {
    return 'Máy chủ phản hồi quá lâu. Vui lòng thử lại.';
  }
  if (!error?.response) {
    return 'Không kết nối được máy chủ API. Kiểm tra server đang chạy rồi thử lại.';
  }
  if (error.response.status >= 500) {
    return 'Máy chủ đang khởi động lại hoặc gặp sự cố. Vui lòng thử lại sau vài giây.';
  }
  return error?.message || fallback;
}
