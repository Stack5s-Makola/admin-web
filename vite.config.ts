import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Codespaces forwards the port; this keeps HMR working over the proxy.
    host: true,
  },
});
