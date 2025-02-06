// import basicSsl from "@vitejs/plugin-basic-ssl";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [/*basicSsl(),*/ react()],
  server: {
    hmr: true,
    host: "0.0.0.0",
    port: 8090,
    // https: {
    //   key: "./localhost-key.pem",
    //   cert: "./localhost.pem",
    // },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
