// vite.config.mjs
import { fileURLToPath, URL } from "node:url";
import { PrimeVueResolver } from "file:///D:/Kakvey/Vuejs/thesis/clients/node_modules/@primevue/auto-import-resolver/index.mjs";
import vue from "file:///D:/Kakvey/Vuejs/thesis/clients/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import Components from "file:///D:/Kakvey/Vuejs/thesis/clients/node_modules/unplugin-vue-components/dist/vite.js";
import { defineConfig } from "file:///D:/Kakvey/Vuejs/thesis/clients/node_modules/vite/dist/node/index.js";
var __vite_injected_original_import_meta_url = "file:///D:/Kakvey/Vuejs/thesis/clients/vite.config.mjs";
var vite_config_default = defineConfig({
  optimizeDeps: {
    noDiscovery: true
  },
  plugins: [
    vue(),
    Components({
      resolvers: [PrimeVueResolver()]
    })
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", __vite_injected_original_import_meta_url))
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcubWpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiRDpcXFxcS2FrdmV5XFxcXFZ1ZWpzXFxcXHRoZXNpc1xcXFxjbGllbnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJEOlxcXFxLYWt2ZXlcXFxcVnVlanNcXFxcdGhlc2lzXFxcXGNsaWVudHNcXFxcdml0ZS5jb25maWcubWpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9EOi9LYWt2ZXkvVnVlanMvdGhlc2lzL2NsaWVudHMvdml0ZS5jb25maWcubWpzXCI7aW1wb3J0IHsgZmlsZVVSTFRvUGF0aCwgVVJMIH0gZnJvbSAnbm9kZTp1cmwnO1xyXG5cclxuaW1wb3J0IHsgUHJpbWVWdWVSZXNvbHZlciB9IGZyb20gJ0BwcmltZXZ1ZS9hdXRvLWltcG9ydC1yZXNvbHZlcic7XHJcbmltcG9ydCB2dWUgZnJvbSAnQHZpdGVqcy9wbHVnaW4tdnVlJztcclxuaW1wb3J0IENvbXBvbmVudHMgZnJvbSAndW5wbHVnaW4tdnVlLWNvbXBvbmVudHMvdml0ZSc7XHJcbmltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gJ3ZpdGUnO1xyXG5cclxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcclxuICAgIG9wdGltaXplRGVwczoge1xyXG4gICAgICAgIG5vRGlzY292ZXJ5OiB0cnVlXHJcbiAgICB9LFxyXG4gICAgcGx1Z2luczogW1xyXG4gICAgICAgIHZ1ZSgpLFxyXG4gICAgICAgIENvbXBvbmVudHMoe1xyXG4gICAgICAgICAgICByZXNvbHZlcnM6IFtQcmltZVZ1ZVJlc29sdmVyKCldXHJcbiAgICAgICAgfSlcclxuICAgIF0sXHJcbiAgICByZXNvbHZlOiB7XHJcbiAgICAgICAgYWxpYXM6IHtcclxuICAgICAgICAgICAgJ0AnOiBmaWxlVVJMVG9QYXRoKG5ldyBVUkwoJy4vc3JjJywgaW1wb3J0Lm1ldGEudXJsKSlcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pO1xyXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQXdSLFNBQVMsZUFBZSxXQUFXO0FBRTNULFNBQVMsd0JBQXdCO0FBQ2pDLE9BQU8sU0FBUztBQUNoQixPQUFPLGdCQUFnQjtBQUN2QixTQUFTLG9CQUFvQjtBQUxpSixJQUFNLDJDQUEyQztBQVEvTixJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUN4QixjQUFjO0FBQUEsSUFDVixhQUFhO0FBQUEsRUFDakI7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNMLElBQUk7QUFBQSxJQUNKLFdBQVc7QUFBQSxNQUNQLFdBQVcsQ0FBQyxpQkFBaUIsQ0FBQztBQUFBLElBQ2xDLENBQUM7QUFBQSxFQUNMO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDTCxPQUFPO0FBQUEsTUFDSCxLQUFLLGNBQWMsSUFBSSxJQUFJLFNBQVMsd0NBQWUsQ0FBQztBQUFBLElBQ3hEO0FBQUEsRUFDSjtBQUNKLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
