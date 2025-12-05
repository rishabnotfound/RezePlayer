// vite.standalone.config.mts
import { defineConfig } from "file:///C:/Users/R/Downloads/Projects/smov/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/R/Downloads/Projects/smov/node_modules/@vitejs/plugin-react/dist/index.js";
import path from "path";
import million from "file:///C:/Users/R/Downloads/Projects/smov/node_modules/million/dist/packages/compiler.mjs";
import { splitVendorChunkPlugin } from "file:///C:/Users/R/Downloads/Projects/smov/node_modules/vite/dist/node/index.js";
import { viteStaticCopy } from "file:///C:/Users/R/Downloads/Projects/smov/node_modules/vite-plugin-static-copy/dist/index.js";
import tailwind from "file:///C:/Users/R/Downloads/Projects/smov/node_modules/tailwindcss/lib/index.js";
import rtl from "file:///C:/Users/R/Downloads/Projects/smov/node_modules/postcss-rtlcss/esm/index.js";
var __vite_injected_original_dirname = "C:\\Users\\R\\Downloads\\Projects\\smov";
var vite_standalone_config_default = defineConfig({
  base: "/",
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
                version: "3.34"
              }
            }
          ]
        ]
      }
    }),
    viteStaticCopy({
      targets: [
        {
          src: "config.js",
          dest: "."
        }
      ]
    }),
    splitVendorChunkPlugin()
  ],
  build: {
    outDir: "dist-standalone",
    sourcemap: true,
    rollupOptions: {
      input: path.resolve(__vite_injected_original_dirname, "index.html")
    }
  },
  css: {
    postcss: {
      plugins: [tailwind(), rtl()]
    }
  },
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src"),
      "@sozialhelden/ietf-language-tags": path.resolve(
        __vite_injected_original_dirname,
        "./node_modules/@sozialhelden/ietf-language-tags/dist/cjs"
      )
    }
  },
  preview: {
    port: 4173
  }
});
export {
  vite_standalone_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5zdGFuZGFsb25lLmNvbmZpZy5tdHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxSXFxcXERvd25sb2Fkc1xcXFxQcm9qZWN0c1xcXFxzbW92XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxSXFxcXERvd25sb2Fkc1xcXFxQcm9qZWN0c1xcXFxzbW92XFxcXHZpdGUuc3RhbmRhbG9uZS5jb25maWcubXRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9SL0Rvd25sb2Fkcy9Qcm9qZWN0cy9zbW92L3ZpdGUuc3RhbmRhbG9uZS5jb25maWcubXRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcbmltcG9ydCByZWFjdCBmcm9tIFwiQHZpdGVqcy9wbHVnaW4tcmVhY3RcIjtcbmltcG9ydCBwYXRoIGZyb20gXCJwYXRoXCI7XG5pbXBvcnQgbWlsbGlvbiBmcm9tICdtaWxsaW9uL2NvbXBpbGVyJztcbmltcG9ydCB7IHNwbGl0VmVuZG9yQ2h1bmtQbHVnaW4gfSBmcm9tIFwidml0ZVwiO1xuaW1wb3J0IHsgdml0ZVN0YXRpY0NvcHkgfSBmcm9tICd2aXRlLXBsdWdpbi1zdGF0aWMtY29weSc7XG5cbmltcG9ydCB0YWlsd2luZCBmcm9tIFwidGFpbHdpbmRjc3NcIjtcbmltcG9ydCBydGwgZnJvbSBcInBvc3Rjc3MtcnRsY3NzXCI7XG5cbmNvbnN0IGNhcHRpb25pbmdQYWNrYWdlcyA9IFtcbiAgXCJkb21wdXJpZnlcIixcbiAgXCJodG1scGFyc2VyMlwiLFxuICBcInN1YnNydC10c1wiLFxuICBcInBhcnNlNVwiLFxuICBcImVudGl0aWVzXCIsXG4gIFwiZnVzZVwiXG5dO1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBiYXNlOiAnLycsXG4gIHBsdWdpbnM6IFtcbiAgICBtaWxsaW9uLnZpdGUoeyBhdXRvOiB0cnVlLCBtdXRlOiB0cnVlIH0pLFxuICAgIHJlYWN0KHtcbiAgICAgIGJhYmVsOiB7XG4gICAgICAgIHByZXNldHM6IFtcbiAgICAgICAgICBcIkBiYWJlbC9wcmVzZXQtdHlwZXNjcmlwdFwiLFxuICAgICAgICAgIFtcbiAgICAgICAgICAgIFwiQGJhYmVsL3ByZXNldC1lbnZcIixcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgbW9kdWxlczogZmFsc2UsXG4gICAgICAgICAgICAgIHVzZUJ1aWx0SW5zOiBcImVudHJ5XCIsXG4gICAgICAgICAgICAgIGNvcmVqczoge1xuICAgICAgICAgICAgICAgIHZlcnNpb246IFwiMy4zNFwiLFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICBdLFxuICAgICAgICBdLFxuICAgICAgfSxcbiAgICB9KSxcbiAgICB2aXRlU3RhdGljQ29weSh7XG4gICAgICB0YXJnZXRzOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBzcmM6ICdjb25maWcuanMnLFxuICAgICAgICAgIGRlc3Q6ICcuJ1xuICAgICAgICB9XG4gICAgICBdXG4gICAgfSksXG4gICAgc3BsaXRWZW5kb3JDaHVua1BsdWdpbigpLFxuICBdLFxuXG4gIGJ1aWxkOiB7XG4gICAgb3V0RGlyOiAnZGlzdC1zdGFuZGFsb25lJyxcbiAgICBzb3VyY2VtYXA6IHRydWUsXG4gICAgcm9sbHVwT3B0aW9uczoge1xuICAgICAgaW5wdXQ6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICdpbmRleC5odG1sJyksXG4gICAgfVxuICB9LFxuICBjc3M6IHtcbiAgICBwb3N0Y3NzOiB7XG4gICAgICBwbHVnaW5zOiBbdGFpbHdpbmQoKSwgcnRsKCldLFxuICAgIH0sXG4gIH0sXG5cbiAgcmVzb2x2ZToge1xuICAgIGFsaWFzOiB7XG4gICAgICBcIkBcIjogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuL3NyY1wiKSxcbiAgICAgIFwiQHNvemlhbGhlbGRlbi9pZXRmLWxhbmd1YWdlLXRhZ3NcIjogcGF0aC5yZXNvbHZlKFxuICAgICAgICBfX2Rpcm5hbWUsXG4gICAgICAgIFwiLi9ub2RlX21vZHVsZXMvQHNvemlhbGhlbGRlbi9pZXRmLWxhbmd1YWdlLXRhZ3MvZGlzdC9janNcIlxuICAgICAgKSxcbiAgICB9LFxuICB9LFxuXG4gIHByZXZpZXc6IHtcbiAgICBwb3J0OiA0MTczLFxuICB9LFxufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQTRULFNBQVMsb0JBQW9CO0FBQ3pWLE9BQU8sV0FBVztBQUNsQixPQUFPLFVBQVU7QUFDakIsT0FBTyxhQUFhO0FBQ3BCLFNBQVMsOEJBQThCO0FBQ3ZDLFNBQVMsc0JBQXNCO0FBRS9CLE9BQU8sY0FBYztBQUNyQixPQUFPLFNBQVM7QUFSaEIsSUFBTSxtQ0FBbUM7QUFtQnpDLElBQU8saUNBQVEsYUFBYTtBQUFBLEVBQzFCLE1BQU07QUFBQSxFQUNOLFNBQVM7QUFBQSxJQUNQLFFBQVEsS0FBSyxFQUFFLE1BQU0sTUFBTSxNQUFNLEtBQUssQ0FBQztBQUFBLElBQ3ZDLE1BQU07QUFBQSxNQUNKLE9BQU87QUFBQSxRQUNMLFNBQVM7QUFBQSxVQUNQO0FBQUEsVUFDQTtBQUFBLFlBQ0U7QUFBQSxZQUNBO0FBQUEsY0FDRSxTQUFTO0FBQUEsY0FDVCxhQUFhO0FBQUEsY0FDYixRQUFRO0FBQUEsZ0JBQ04sU0FBUztBQUFBLGNBQ1g7QUFBQSxZQUNGO0FBQUEsVUFDRjtBQUFBLFFBQ0Y7QUFBQSxNQUNGO0FBQUEsSUFDRixDQUFDO0FBQUEsSUFDRCxlQUFlO0FBQUEsTUFDYixTQUFTO0FBQUEsUUFDUDtBQUFBLFVBQ0UsS0FBSztBQUFBLFVBQ0wsTUFBTTtBQUFBLFFBQ1I7QUFBQSxNQUNGO0FBQUEsSUFDRixDQUFDO0FBQUEsSUFDRCx1QkFBdUI7QUFBQSxFQUN6QjtBQUFBLEVBRUEsT0FBTztBQUFBLElBQ0wsUUFBUTtBQUFBLElBQ1IsV0FBVztBQUFBLElBQ1gsZUFBZTtBQUFBLE1BQ2IsT0FBTyxLQUFLLFFBQVEsa0NBQVcsWUFBWTtBQUFBLElBQzdDO0FBQUEsRUFDRjtBQUFBLEVBQ0EsS0FBSztBQUFBLElBQ0gsU0FBUztBQUFBLE1BQ1AsU0FBUyxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7QUFBQSxJQUM3QjtBQUFBLEVBQ0Y7QUFBQSxFQUVBLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLEtBQUssS0FBSyxRQUFRLGtDQUFXLE9BQU87QUFBQSxNQUNwQyxvQ0FBb0MsS0FBSztBQUFBLFFBQ3ZDO0FBQUEsUUFDQTtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBLEVBRUEsU0FBUztBQUFBLElBQ1AsTUFBTTtBQUFBLEVBQ1I7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
