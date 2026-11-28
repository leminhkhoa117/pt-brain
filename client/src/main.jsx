import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App.jsx';
import PwaUpdateBanner from './components/PwaUpdateBanner.jsx';
import { DialogProvider } from './components/DialogProvider.jsx';
import { AuthProvider } from './hooks/useAuth.jsx';
import { ThemeProvider } from './hooks/useTheme.jsx';
import { initClientMonitoring } from './lib/monitoring.js';
import './index.css';
import './theme/theme-studio.css';

void initClientMonitoring();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 20_000,
    },
  },
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <DialogProvider>
            <AuthProvider>
              <App />
              <PwaUpdateBanner />
            </AuthProvider>
          </DialogProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
  </StrictMode>,
);

// PWA: chỉ đăng ký ở production để không ảnh hưởng HMR khi dev
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        // PWA mở lại từ nền: kiểm tra bản mới thay vì chờ trình duyệt tự làm.
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible') registration.update().catch(() => {});
        });
      })
      .catch(() => {});
  });
}
