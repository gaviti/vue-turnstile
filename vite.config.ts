import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import vue from '@vitejs/plugin-vue2';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: resolve(
        dirname(fileURLToPath(import.meta.url)),
        './src/index.ts'
      ),
      name: 'VueTurnstile',
      fileName: 'vue-turnstile',
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        globals: {
          vue: 'Vue',
        },
      },
    },
  },
});