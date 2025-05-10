import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { nodeResolve } from '@rollup/plugin-node-resolve'; // Import the plugin

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  plugins: [
    vue(),
    nodeResolve({
      browser: true, // Ensure it resolves for browser
    }),
  ],
  define: {
    global: {},
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
    extensions: ['.js', '.ts', '.vue'],
  },
  optimizeDeps: {
    include: ['sockjs-client', '@stomp/stompjs'], // Change to the new stompjs version
  },
});
