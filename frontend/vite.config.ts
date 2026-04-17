import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  // Load env from root and frontend dirs
  const rootEnv = loadEnv(mode, path.resolve(__dirname, '..'), '');
  const localEnv = loadEnv(mode, process.cwd(), '');
  const env = { ...rootEnv, ...localEnv };
  const backendUrl = env.VITE_BACKEND_URL || 'http://localhost:4000';

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 4002,
      proxy: {
        '/api': {
          target: backendUrl,
          changeOrigin: true,
        },
        '/mock': {
          target: backendUrl,
          changeOrigin: true,
        },
      },
    },
  };
});
