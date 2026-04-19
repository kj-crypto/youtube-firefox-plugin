import { defineConfig } from 'vite';
import checker from 'vite-plugin-checker';
import { staticsDetector } from './plugin/static_detector';

export default defineConfig({
  plugins: [staticsDetector({ sourceDirs: ['public', 'menu'] }), checker({ typescript: true })],
  build: {
    outDir: 'dist',
    emptyOutDir: false,
    rollupOptions: {
      input: {
        main: 'src/main.ts',
      },
      output: {
        entryFileNames: '[name].js',
        format: 'iife',
      },
    },
  },
});
