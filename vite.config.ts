import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const rawTarget = env.VITE_API_URL || process.env.VITE_API_URL || 'http://localhost:3000';
  // Strip trailing /api/v1 and slashes so Vite proxy routes '/api/...' to '${targetHost}/api/...'
  const target = rawTarget.replace(/\/api\/v1\/?$/, '').replace(/\/+$/, '') || 'http://localhost:3000';

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      proxy: {
        '/api': {
          target,
          changeOrigin: true,
        },
      },
    },
  };
});
