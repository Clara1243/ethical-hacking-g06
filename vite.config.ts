import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    plugins: [
      react(), 
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        devOptions: {
          enabled: true 
        },
        manifest: {
          name: 'MyEduConnect Mobile',
          short_name: 'MyEduConnect',
          description: 'MyEduConnect Learning Portal & Security Range',
          theme_color: '#ffffff',
          start_url: '/',
          display: 'standalone', 
          orientation: 'portrait',
          icons: [
            {
              src: 'pwa-192x192.png', 
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: 'pwa-512x512.png', 
              sizes: '512x512',
              type: 'image/png'
            }
          ]
        }
      })
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      port: 3000,         
      host: true,          // allow domain and hotspot
      allowedHosts: 'all', 

      proxy: {
        '/api': {
          target: 'http://localhost:3000', 
          changeOrigin: true,
        }
      },
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});