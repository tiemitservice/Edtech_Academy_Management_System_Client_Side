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
  server: {
    host: "0.0.0.0",
    // Expose to all network interfaces
    port: 5173
    // Default Vite port (optional, change if needed)
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", __vite_injected_original_import_meta_url))
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcubWpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiRDpcXFxcS2FrdmV5XFxcXFZ1ZWpzXFxcXHRoZXNpc1xcXFxjbGllbnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJEOlxcXFxLYWt2ZXlcXFxcVnVlanNcXFxcdGhlc2lzXFxcXGNsaWVudHNcXFxcdml0ZS5jb25maWcubWpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9EOi9LYWt2ZXkvVnVlanMvdGhlc2lzL2NsaWVudHMvdml0ZS5jb25maWcubWpzXCI7aW1wb3J0IHsgZmlsZVVSTFRvUGF0aCwgVVJMIH0gZnJvbSAnbm9kZTp1cmwnO1xyXG5cclxuaW1wb3J0IHsgUHJpbWVWdWVSZXNvbHZlciB9IGZyb20gJ0BwcmltZXZ1ZS9hdXRvLWltcG9ydC1yZXNvbHZlcic7XHJcbmltcG9ydCB2dWUgZnJvbSAnQHZpdGVqcy9wbHVnaW4tdnVlJztcclxuaW1wb3J0IENvbXBvbmVudHMgZnJvbSAndW5wbHVnaW4tdnVlLWNvbXBvbmVudHMvdml0ZSc7XHJcbmltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gJ3ZpdGUnO1xyXG5cclxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcclxuICAgIG9wdGltaXplRGVwczoge1xyXG4gICAgICAgIG5vRGlzY292ZXJ5OiB0cnVlXHJcbiAgICB9LFxyXG4gICAgcGx1Z2luczogW1xyXG4gICAgICAgIHZ1ZSgpLFxyXG4gICAgICAgIENvbXBvbmVudHMoe1xyXG4gICAgICAgICAgICByZXNvbHZlcnM6IFtQcmltZVZ1ZVJlc29sdmVyKCldXHJcbiAgICAgICAgfSlcclxuICAgIF0sXHJcbiAgICBzZXJ2ZXI6IHtcclxuICAgICAgICBob3N0OiAnMC4wLjAuMCcsIC8vIEV4cG9zZSB0byBhbGwgbmV0d29yayBpbnRlcmZhY2VzXHJcbiAgICAgICAgcG9ydDogNTE3MywgICAgICAvLyBEZWZhdWx0IFZpdGUgcG9ydCAob3B0aW9uYWwsIGNoYW5nZSBpZiBuZWVkZWQpXHJcbiAgICB9LFxyXG4gICAgcmVzb2x2ZToge1xyXG4gICAgICAgIGFsaWFzOiB7XHJcbiAgICAgICAgICAgICdAJzogZmlsZVVSTFRvUGF0aChuZXcgVVJMKCcuL3NyYycsIGltcG9ydC5tZXRhLnVybCkpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KTtcclxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUF3UixTQUFTLGVBQWUsV0FBVztBQUUzVCxTQUFTLHdCQUF3QjtBQUNqQyxPQUFPLFNBQVM7QUFDaEIsT0FBTyxnQkFBZ0I7QUFDdkIsU0FBUyxvQkFBb0I7QUFMaUosSUFBTSwyQ0FBMkM7QUFRL04sSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDeEIsY0FBYztBQUFBLElBQ1YsYUFBYTtBQUFBLEVBQ2pCO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDTCxJQUFJO0FBQUEsSUFDSixXQUFXO0FBQUEsTUFDUCxXQUFXLENBQUMsaUJBQWlCLENBQUM7QUFBQSxJQUNsQyxDQUFDO0FBQUEsRUFDTDtBQUFBLEVBQ0EsUUFBUTtBQUFBLElBQ0osTUFBTTtBQUFBO0FBQUEsSUFDTixNQUFNO0FBQUE7QUFBQSxFQUNWO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDTCxPQUFPO0FBQUEsTUFDSCxLQUFLLGNBQWMsSUFBSSxJQUFJLFNBQVMsd0NBQWUsQ0FBQztBQUFBLElBQ3hEO0FBQUEsRUFDSjtBQUNKLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
