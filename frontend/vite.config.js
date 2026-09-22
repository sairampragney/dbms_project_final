import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/dbms_project_final/',
  server: {
    port: 3000,
    host: true
  }
});
