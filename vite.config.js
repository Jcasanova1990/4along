import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dotenv from 'dotenv';
import { viteStaticCopy } from 'vite-plugin-static-copy';

dotenv.config();

export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        { src: 'src/img/*', dest: 'img' },       
        { src: 'src/sounds/*', dest: 'sounds' },  
      ],
    }),
  ],
  server: {
    port: process.env.VITE_PORT || 5173,
  },
  build: {
    outDir: 'public/dist', 
    emptyOutDir: false,     
    assetsDir: 'assets',   
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith('.mp3')) {
            return 'sounds/[name]';  
          }
          return 'assets/[name]';  
        },
      },
    },
  },
});
