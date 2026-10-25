import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// cấu hình vite cho ứng dụng react và github pages
export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    port: 3000,
    open: true
  }
});
