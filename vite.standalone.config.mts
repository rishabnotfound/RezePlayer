import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import million from 'million/compiler';
import { splitVendorChunkPlugin } from "vite";
import { viteStaticCopy } from 'vite-plugin-static-copy';

import tailwind from "tailwindcss";
import rtl from "postcss-rtlcss";

const captioningPackages = [
  "dompurify",
  "htmlparser2",
  "subsrt-ts",
  "parse5",
  "entities",
  "fuse"
];

export default defineConfig({
  base: '/',
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
  },
  plugins: [
    million.vite({ auto: true, mute: true }),
    react({
      babel: {
        presets: [
          "@babel/preset-typescript",
          [
            "@babel/preset-env",
            {
              modules: false,
              useBuiltIns: "entry",
              corejs: {
                version: "3.34",
              },
            },
          ],
        ],
      },
    }),
    viteStaticCopy({
      targets: [
        {
          src: 'config.js',
          dest: '.'
        },
        {
          src: 'index.html',
          dest: '.'
        },
        {
          src: 'example.html',
          dest: '.'
        }
      ]
    }),
    splitVendorChunkPlugin(),
  ],

  build: {
    outDir: 'dist',
    sourcemap: true,
    lib: {
      entry: path.resolve(__dirname, 'src/rezeplayer.tsx'),
      name: 'RezePlayer',
      formats: ['es', 'umd', 'iife'],
      fileName: (format) => `rezeplayer.${format}.js`
    },
    rollupOptions: {
      output: {
        // Bundle everything including React
        inlineDynamicImports: true,
        assetFileNames: 'assets/[name][extname]',
        manualChunks: undefined
      }
    }
  },
  css: {
    postcss: {
      plugins: [tailwind(), rtl()],
    },
  },

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@sozialhelden/ietf-language-tags": path.resolve(
        __dirname,
        "./node_modules/@sozialhelden/ietf-language-tags/dist/cjs"
      ),
    },
  },

  preview: {
    port: 4173,
  },
});
