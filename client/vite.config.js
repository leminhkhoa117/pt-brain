import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const apiTarget = process.env.VITE_API_PROXY_TARGET || 'http://localhost:4000';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(root, 'src'),
      '@shared': path.resolve(root, '../shared'),
    },
  },
  server: {
    host: true,
    port: 5173,
    fs: { allow: [root, path.resolve(root, '../shared')] },
    proxy: {
      '/api': {
        target: apiTarget,
        changeOrigin: true,
        // Dev proxy trả 500 rỗng khi API đang restart (node --watch), khiến UI
        // chỉ hiện "Request failed with status code 500" vô nghĩa.
        configure: (proxy) => {
          proxy.on('error', (error, _req, res) => {
            if (!res || typeof res.writeHead !== 'function' || res.headersSent) return;
            res.writeHead(502, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(
              JSON.stringify({
                error: {
                  code: 'API_UNREACHABLE',
                  message: `Không kết nối được API tại ${apiTarget}. Server có thể đang khởi động lại — thử lại sau vài giây.`,
                },
              }),
            );
          });
        },
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          charts: ['recharts'],
          query: ['@tanstack/react-query'],
          three: ['three'],
        },
      },
    },
  },
});
